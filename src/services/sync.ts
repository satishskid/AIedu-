import { apiClient, ApiError } from './api'
import { licenseService } from './license'

// Sync Types
export interface SyncItem {
  id: string
  type: 'user_progress' | 'lesson_data' | 'user_preferences' | 'achievements' | 'code_projects' | 'ai_conversations'
  data: any
  localVersion: number
  remoteVersion?: number
  lastModified: string
  lastSynced?: string
  status: 'pending' | 'syncing' | 'synced' | 'conflict' | 'error'
  retryCount: number
  error?: string
}

export interface SyncConflict {
  id: string
  type: string
  localData: any
  remoteData: any
  localVersion: number
  remoteVersion: number
  conflictFields: string[]
  resolution?: 'local' | 'remote' | 'merge' | 'manual'
}

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime?: string
  pendingItems: number
  conflictItems: number
  errorItems: number
  totalItems: number
  syncProgress: number // 0-100
}

export interface SyncOptions {
  forceSync?: boolean
  syncTypes?: string[]
  batchSize?: number
  timeout?: number
  retryAttempts?: number
  conflictResolution?: 'local' | 'remote' | 'prompt'
}

export interface SyncResult {
  success: boolean
  syncedItems: number
  conflictItems: number
  errorItems: number
  conflicts: SyncConflict[]
  errors: Array<{ id: string; error: string }>
  duration: number
}

// Sync Service Class
class SyncService {
  private syncItems: Map<string, SyncItem> = new Map()
  private conflicts: Map<string, SyncConflict> = new Map()
  private isSyncing = false
  private syncQueue: string[] = []
  private syncInterval: number | null = null
  private onlineStatus = navigator.onLine
  private eventListeners: Map<string, Function[]> = new Map()
  
  constructor() {
    this.initializeSync()
    this.setupEventListeners()
    this.loadSyncData()
  }
  
  // Initialize sync service
  private initializeSync(): void {
    // Set up automatic sync interval (every 5 minutes)
    this.syncInterval = window.setInterval(() => {
      if (this.onlineStatus && !this.isSyncing) {
        this.syncAll({ forceSync: false })
      }
    }, 5 * 60 * 1000)
    
    // Sync on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.onlineStatus && !this.isSyncing) {
        this.syncAll({ forceSync: false })
      }
    })
  }
  
  // Set up event listeners
  private setupEventListeners(): void {
    // Online/offline status
    window.addEventListener('online', () => {
      this.onlineStatus = true
      this.emit('online')
      // Sync when coming back online
      setTimeout(() => this.syncAll({ forceSync: false }), 1000)
    })
    
    window.addEventListener('offline', () => {
      this.onlineStatus = false
      this.emit('offline')
    })
    
    // Before page unload, try to sync pending items
    window.addEventListener('beforeunload', () => {
      if (this.hasPendingItems()) {
        // Quick sync attempt (non-blocking)
        this.syncAll({ forceSync: true, timeout: 2000 })
      }
    })
  }
  
  // Load sync data from storage
  private loadSyncData(): void {
    try {
      const syncData = localStorage.getItem('sync-data')
      if (syncData) {
        const parsed = JSON.parse(syncData)
        this.syncItems = new Map(parsed.items || [])
        this.conflicts = new Map(parsed.conflicts || [])
      }
    } catch (error) {
      console.warn('Failed to load sync data:', error)
    }
  }
  
  // Save sync data to storage
  private saveSyncData(): void {
    try {
      const syncData = {
        items: Array.from(this.syncItems.entries()),
        conflicts: Array.from(this.conflicts.entries()),
        lastSaved: new Date().toISOString()
      }
      localStorage.setItem('sync-data', JSON.stringify(syncData))
    } catch (error) {
      console.warn('Failed to save sync data:', error)
    }
  }
  
  // Add item to sync queue
  addToSync(type: SyncItem['type'], id: string, data: any): void {
    const existingItem = this.syncItems.get(id)
    const now = new Date().toISOString()
    
    const syncItem: SyncItem = {
      id,
      type,
      data,
      localVersion: existingItem ? existingItem.localVersion + 1 : 1,
      remoteVersion: existingItem?.remoteVersion,
      lastModified: now,
      lastSynced: existingItem?.lastSynced,
      status: 'pending',
      retryCount: 0
    }
    
    this.syncItems.set(id, syncItem)
    
    // Add to sync queue if not already there
    if (!this.syncQueue.includes(id)) {
      this.syncQueue.push(id)
    }
    
    this.saveSyncData()
    this.emit('itemAdded', syncItem)
    
    // Auto-sync if online and not currently syncing
    if (this.onlineStatus && !this.isSyncing) {
      setTimeout(() => this.syncItem(id), 100)
    }
  }
  
  // Sync a single item
  async syncItem(id: string): Promise<boolean> {
    const item = this.syncItems.get(id)
    if (!item || item.status === 'syncing' || item.status === 'synced') {
      return false
    }
    
    if (!this.onlineStatus) {
      return false
    }
    
    // Check license permissions for sync
    if (!licenseService.hasFeature('data_sync')) {
      console.warn('Data sync feature not available in current license')
      return false
    }
    
    item.status = 'syncing'
    this.emit('itemSyncStart', item)
    
    try {
      // Get remote version first
      const remoteItem = await this.getRemoteItem(item.type, id)
      
      if (remoteItem && remoteItem.version > (item.remoteVersion || 0)) {
        // Remote version is newer, check for conflicts
        if (item.localVersion > (item.remoteVersion || 0)) {
          // Conflict detected
          const conflict = this.createConflict(item, remoteItem)
          this.conflicts.set(id, conflict)
          item.status = 'conflict'
          this.emit('conflict', conflict)
          return false
        } else {
          // Remote is newer, update local
          await this.updateLocalItem(item, remoteItem)
          item.status = 'synced'
          item.remoteVersion = remoteItem.version
          item.lastSynced = new Date().toISOString()
        }
      } else {
        // Local is newer or same, push to remote
        const success = await this.pushToRemote(item)
        if (success) {
          item.status = 'synced'
          item.remoteVersion = item.localVersion
          item.lastSynced = new Date().toISOString()
          item.retryCount = 0
        } else {
          throw new Error('Failed to push to remote')
        }
      }
      
      this.saveSyncData()
      this.emit('itemSyncComplete', item)
      return true
      
    } catch (error) {
      console.error(`Sync error for item ${id}:`, error)
      
      item.status = 'error'
      item.error = error instanceof Error ? error.message : 'Unknown error'
      item.retryCount++
      
      // Schedule retry if under limit
      if (item.retryCount < 3) {
        setTimeout(() => this.syncItem(id), Math.pow(2, item.retryCount) * 1000)
      }
      
      this.saveSyncData()
      this.emit('itemSyncError', { item, error })
      return false
    }
  }
  
  // Sync all pending items
  async syncAll(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress')
    }
    
    if (!this.onlineStatus) {
      throw new Error('Cannot sync while offline')
    }
    
    this.isSyncing = true
    const startTime = Date.now()
    
    const result: SyncResult = {
      success: false,
      syncedItems: 0,
      conflictItems: 0,
      errorItems: 0,
      conflicts: [],
      errors: [],
      duration: 0
    }
    
    this.emit('syncStart')
    
    try {
      const itemsToSync = Array.from(this.syncItems.values())
        .filter(item => {
          if (options.syncTypes && !options.syncTypes.includes(item.type)) {
            return false
          }
          return options.forceSync || item.status === 'pending' || item.status === 'error'
        })
      
      const batchSize = options.batchSize || 10
      
      // Process items in batches
      for (let i = 0; i < itemsToSync.length; i += batchSize) {
        const batch = itemsToSync.slice(i, i + batchSize)
        const batchPromises = batch.map(item => this.syncItem(item.id))
        
        const batchResults = await Promise.allSettled(batchPromises)
        
        batchResults.forEach((batchResult, index) => {
          const item = batch[index]
          if (batchResult.status === 'fulfilled' && batchResult.value) {
            result.syncedItems++
          } else {
            if (item.status === 'conflict') {
              result.conflictItems++
              const conflict = this.conflicts.get(item.id)
              if (conflict) {
                result.conflicts.push(conflict)
              }
            } else {
              result.errorItems++
              result.errors.push({
                id: item.id,
                error: item.error || 'Unknown error'
              })
            }
          }
        })
        
        // Small delay between batches
        if (i + batchSize < itemsToSync.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      result.success = result.errorItems === 0 && result.conflictItems === 0
      
    } catch (error) {
      console.error('Sync all error:', error)
      result.errors.push({
        id: 'sync-all',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      this.isSyncing = false
      result.duration = Date.now() - startTime
      this.emit('syncComplete', result)
    }
    
    return result
  }
  
  // Resolve conflict
  async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge', mergedData?: any): Promise<boolean> {
    const conflict = this.conflicts.get(conflictId)
    if (!conflict) {
      return false
    }
    
    const item = this.syncItems.get(conflictId)
    if (!item) {
      return false
    }
    
    try {
      let finalData: any
      
      switch (resolution) {
        case 'local':
          finalData = conflict.localData
          break
        case 'remote':
          finalData = conflict.remoteData
          break
        case 'merge':
          finalData = mergedData || this.mergeData(conflict.localData, conflict.remoteData)
          break
        default:
          throw new Error('Invalid resolution type')
      }
      
      // Update item with resolved data
      item.data = finalData
      item.localVersion++
      item.status = 'pending'
      item.lastModified = new Date().toISOString()
      
      // Remove conflict
      this.conflicts.delete(conflictId)
      
      // Sync the resolved item
      const success = await this.syncItem(conflictId)
      
      this.saveSyncData()
      this.emit('conflictResolved', { conflict, resolution, success })
      
      return success
      
    } catch (error) {
      console.error('Conflict resolution error:', error)
      return false
    }
  }
  
  // Get sync status
  getSyncStatus(): SyncStatus {
    const items = Array.from(this.syncItems.values())
    const pendingItems = items.filter(item => item.status === 'pending').length
    const conflictItems = items.filter(item => item.status === 'conflict').length
    const errorItems = items.filter(item => item.status === 'error').length
    const syncedItems = items.filter(item => item.status === 'synced').length
    
    const totalItems = items.length
    const syncProgress = totalItems > 0 ? Math.round((syncedItems / totalItems) * 100) : 100
    
    return {
      isOnline: this.onlineStatus,
      isSyncing: this.isSyncing,
      lastSyncTime: this.getLastSyncTime(),
      pendingItems,
      conflictItems,
      errorItems,
      totalItems,
      syncProgress
    }
  }
  
  // Get conflicts
  getConflicts(): SyncConflict[] {
    return Array.from(this.conflicts.values())
  }
  
  // Check if has pending items
  hasPendingItems(): boolean {
    return Array.from(this.syncItems.values()).some(item => 
      item.status === 'pending' || item.status === 'error'
    )
  }
  
  // Clear sync data
  clearSyncData(): void {
    this.syncItems.clear()
    this.conflicts.clear()
    this.syncQueue = []
    localStorage.removeItem('sync-data')
    this.emit('dataCleared')
  }
  
  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }
  
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }
  
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Event listener error:', error)
        }
      })
    }
  }
  
  // Private helper methods
  private async getRemoteItem(type: string, id: string): Promise<{ data: any; version: number } | null> {
    try {
      // This would be implemented based on the specific API endpoints
      const endpoint = this.getEndpointForType(type)
      const response = await apiClient.get(`${endpoint}/${id}`)
      
      if (response.success && response.data) {
        return {
          data: response.data,
          version: (response.data as any).version || 1
        }
      }
      
      return null
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null // Item doesn't exist remotely
      }
      throw error
    }
  }
  
  private async pushToRemote(item: SyncItem): Promise<boolean> {
    try {
      const endpoint = this.getEndpointForType(item.type)
      const response = await apiClient.put(`${endpoint}/${item.id}`, {
        ...item.data,
        version: item.localVersion
      })
      
      return response.success
    } catch (error) {
      console.error('Push to remote error:', error)
      return false
    }
  }
  
  private async updateLocalItem(item: SyncItem, remoteItem: { data: any; version: number }): Promise<void> {
    item.data = remoteItem.data
    item.localVersion = remoteItem.version
    
    // Update local storage based on item type
    this.updateLocalStorage(item.type, item.id, remoteItem.data)
  }
  
  private createConflict(localItem: SyncItem, remoteItem: { data: any; version: number }): SyncConflict {
    const conflictFields = this.findConflictFields(localItem.data, remoteItem.data)
    
    return {
      id: localItem.id,
      type: localItem.type,
      localData: localItem.data,
      remoteData: remoteItem.data,
      localVersion: localItem.localVersion,
      remoteVersion: remoteItem.version,
      conflictFields
    }
  }
  
  private findConflictFields(localData: any, remoteData: any): string[] {
    const conflicts: string[] = []
    
    const compareObjects = (local: any, remote: any, path = '') => {
      if (typeof local !== typeof remote) {
        conflicts.push(path || 'root')
        return
      }
      
      if (typeof local === 'object' && local !== null) {
        const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)])
        
        for (const key of allKeys) {
          const newPath = path ? `${path}.${key}` : key
          
          if (!(key in local) || !(key in remote)) {
            conflicts.push(newPath)
          } else if (local[key] !== remote[key]) {
            if (typeof local[key] === 'object') {
              compareObjects(local[key], remote[key], newPath)
            } else {
              conflicts.push(newPath)
            }
          }
        }
      } else if (local !== remote) {
        conflicts.push(path || 'root')
      }
    }
    
    compareObjects(localData, remoteData)
    return conflicts
  }
  
  private mergeData(localData: any, remoteData: any): any {
    // Simple merge strategy - prefer local for conflicts
    if (typeof localData !== 'object' || typeof remoteData !== 'object') {
      return localData
    }
    
    const merged = { ...remoteData }
    
    for (const key in localData) {
      if (typeof localData[key] === 'object' && typeof remoteData[key] === 'object') {
        merged[key] = this.mergeData(localData[key], remoteData[key])
      } else {
        merged[key] = localData[key]
      }
    }
    
    return merged
  }
  
  private getEndpointForType(type: string): string {
    const endpoints: Record<string, string> = {
      user_progress: '/sync/progress',
      lesson_data: '/sync/lessons',
      user_preferences: '/sync/preferences',
      achievements: '/sync/achievements',
      code_projects: '/sync/projects',
      ai_conversations: '/sync/conversations'
    }
    
    return endpoints[type] || '/sync/data'
  }
  
  private updateLocalStorage(type: string, id: string, data: any): void {
    try {
      const storageKey = `${type}_${id}`
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to update local storage:', error)
    }
  }
  
  private getLastSyncTime(): string | undefined {
    const items = Array.from(this.syncItems.values())
    const syncedItems = items.filter(item => item.lastSynced)
    
    if (syncedItems.length === 0) {
      return undefined
    }
    
    return syncedItems
      .sort((a, b) => new Date(b.lastSynced!).getTime() - new Date(a.lastSynced!).getTime())[0]
      .lastSynced
  }
  
  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    
    this.eventListeners.clear()
    this.saveSyncData()
  }
}

// Create and export sync service instance
export const syncService = new SyncService()

// Utility functions
export const formatSyncStatus = (status: SyncStatus): string => {
  if (!status.isOnline) {
    return 'Offline'
  }
  
  if (status.isSyncing) {
    return 'Syncing...'
  }
  
  if (status.conflictItems > 0) {
    return `${status.conflictItems} conflicts`
  }
  
  if (status.errorItems > 0) {
    return `${status.errorItems} errors`
  }
  
  if (status.pendingItems > 0) {
    return `${status.pendingItems} pending`
  }
  
  return 'Up to date'
}

export const formatLastSyncTime = (lastSyncTime?: string): string => {
  if (!lastSyncTime) {
    return 'Never synced'
  }
  
  const syncDate = new Date(lastSyncTime)
  const now = new Date()
  const diffMs = now.getTime() - syncDate.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  if (diffMinutes < 1) {
    return 'Just now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`
  } else if (diffMinutes < 24 * 60) {
    const diffHours = Math.floor(diffMinutes / 60)
    return `${diffHours} hours ago`
  } else {
    return syncDate.toLocaleDateString()
  }
}

export default syncService