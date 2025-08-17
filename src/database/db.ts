// IndexedDB Database Configuration and Management

// Database configuration
export const DB_CONFIG = {
  name: 'EduAI_DB',
  version: 1,
  stores: {
    users: 'users',
    lessons: 'lessons',
    progress: 'progress',
    achievements: 'achievements',
    projects: 'projects',
    conversations: 'conversations',
    preferences: 'preferences',
    cache: 'cache',
    sync: 'sync'
  }
} as const

// Database store schemas
export const STORE_SCHEMAS = {
  users: {
    keyPath: 'id',
    autoIncrement: false,
    indexes: [
      { name: 'email', keyPath: 'email', unique: true },
      { name: 'username', keyPath: 'username', unique: true },
      { name: 'createdAt', keyPath: 'createdAt', unique: false }
    ]
  },
  lessons: {
    keyPath: 'id',
    autoIncrement: false,
    indexes: [
      { name: 'courseId', keyPath: 'courseId', unique: false },
      { name: 'category', keyPath: 'category', unique: false },
      { name: 'difficulty', keyPath: 'difficulty', unique: false },
      { name: 'createdAt', keyPath: 'createdAt', unique: false }
    ]
  },
  progress: {
    keyPath: 'id',
    autoIncrement: false,
    indexes: [
      { name: 'userId', keyPath: 'userId', unique: false },
      { name: 'lessonId', keyPath: 'lessonId', unique: false },
      { name: 'courseId', keyPath: 'courseId', unique: false },
      { name: 'updatedAt', keyPath: 'updatedAt', unique: false },
      { name: 'userLesson', keyPath: ['userId', 'lessonId'], unique: true }
    ]
  },
  achievements: {
    keyPath: 'id',
    autoIncrement: false,
    indexes: [
      { name: 'userId', keyPath: 'userId', unique: false },
      { name: 'type', keyPath: 'type', unique: false },
      { name: 'unlockedAt', keyPath: 'unlockedAt', unique: false },
      { name: 'userType', keyPath: ['userId', 'type'], unique: false }
    ]
  },
  projects: {
    keyPath: 'id',
    autoIncrement: false,
    indexes: [
      { name: 'userId', keyPath: 'userId', unique: false },
      { name: 'language', keyPath: 'language', unique: false },
      { name: 'createdAt', keyPath: 'createdAt', unique: false },
      { name: 'updatedAt', keyPath: 'updatedAt', unique: false }
    ]
  },
  conversations: {
    keyPath: 'id',
    autoIncrement: false,
    indexes: [
      { name: 'userId', keyPath: 'userId', unique: false },
      { name: 'sessionId', keyPath: 'sessionId', unique: false },
      { name: 'createdAt', keyPath: 'createdAt', unique: false },
      { name: 'updatedAt', keyPath: 'updatedAt', unique: false }
    ]
  },
  preferences: {
    keyPath: 'id',
    autoIncrement: false,
    indexes: [
      { name: 'userId', keyPath: 'userId', unique: true },
      { name: 'category', keyPath: 'category', unique: false },
      { name: 'updatedAt', keyPath: 'updatedAt', unique: false }
    ]
  },
  cache: {
    keyPath: 'key',
    autoIncrement: false,
    indexes: [
      { name: 'type', keyPath: 'type', unique: false },
      { name: 'expiresAt', keyPath: 'expiresAt', unique: false },
      { name: 'createdAt', keyPath: 'createdAt', unique: false }
    ]
  },
  sync: {
    keyPath: 'id',
    autoIncrement: false,
    indexes: [
      { name: 'type', keyPath: 'type', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
      { name: 'lastModified', keyPath: 'lastModified', unique: false },
      { name: 'lastSynced', keyPath: 'lastSynced', unique: false }
    ]
  }
} as const

// Database connection and management class
class DatabaseManager {
  private db: IDBDatabase | null = null
  private isInitialized = false
  private initPromise: Promise<void> | null = null
  private eventListeners: Map<string, Function[]> = new Map()

  constructor() {
    this.checkIndexedDBSupport()
  }

  // Check if IndexedDB is supported
  private checkIndexedDBSupport(): void {
    if (!('indexedDB' in window)) {
      throw new Error('IndexedDB is not supported in this browser')
    }
  }

  // Initialize database
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this.performInitialization()
    return this.initPromise
  }

  private async performInitialization(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version)

      request.onerror = () => {
        const error = new Error(`Failed to open database: ${request.error?.message}`)
        this.emit('error', error)
        reject(error)
      }

      request.onsuccess = () => {
        this.db = request.result
        this.isInitialized = true
        this.setupDatabaseEventHandlers()
        this.emit('initialized')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        this.performMigration(db, event.oldVersion, event.newVersion || DB_CONFIG.version)
      }
    })
  }

  // Perform database migration
  private performMigration(db: IDBDatabase, oldVersion: number, newVersion: number): void {
    console.log(`Migrating database from version ${oldVersion} to ${newVersion}`)

    // Create object stores and indexes
    Object.entries(STORE_SCHEMAS).forEach(([storeName, schema]) => {
      let store: IDBObjectStore

      if (!db.objectStoreNames.contains(storeName)) {
        // Create new store
        store = db.createObjectStore(storeName, {
          keyPath: schema.keyPath,
          autoIncrement: schema.autoIncrement
        })
        console.log(`Created object store: ${storeName}`)
      } else {
        // Get existing store (only available during upgrade)
        const transaction = (db as any).transaction || null
        if (transaction) {
          store = transaction.objectStore(storeName)
        } else {
          return // Skip if we can't access the store
        }
      }

      // Create indexes
      schema.indexes.forEach(index => {
        if (!store.indexNames.contains(index.name)) {
          store.createIndex(index.name, index.keyPath, { unique: index.unique })
          console.log(`Created index: ${index.name} on ${storeName}`)
        }
      })
    })

    this.emit('migrated', { oldVersion, newVersion })
  }

  // Setup database event handlers
  private setupDatabaseEventHandlers(): void {
    if (!this.db) return

    this.db.onversionchange = () => {
      console.warn('Database version changed, closing connection')
      this.close()
      this.emit('versionchange')
    }

    this.db.onerror = (event) => {
      console.error('Database error:', event)
      this.emit('error', event)
    }
  }

  // Get database instance
  getDatabase(): IDBDatabase {
    if (!this.db || !this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return this.db
  }

  // Create transaction
  createTransaction(storeNames: string | string[], mode: IDBTransactionMode = 'readonly'): IDBTransaction {
    const db = this.getDatabase()
    const stores = Array.isArray(storeNames) ? storeNames : [storeNames]
    
    // Validate store names
    stores.forEach(storeName => {
      if (!db.objectStoreNames.contains(storeName)) {
        throw new Error(`Object store '${storeName}' does not exist`)
      }
    })

    return db.transaction(stores, mode)
  }

  // Get object store
  getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    const transaction = this.createTransaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  // Generic CRUD operations
  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readonly')
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll<T>(storeName: string, query?: IDBValidKey | IDBKeyRange, count?: number): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readonly')
      const request = store.getAll(query, count)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllByIndex<T>(storeName: string, indexName: string, query?: IDBValidKey | IDBKeyRange, count?: number): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readonly')
      const index = store.index(indexName)
      const request = index.getAll(query, count)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async put<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite')
      const request = store.put(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async add<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite')
      const request = store.add(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite')
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite')
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async count(storeName: string, query?: IDBValidKey | IDBKeyRange): Promise<number> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readonly')
      const request = store.count(query)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Batch operations
  async batchPut<T>(storeName: string, items: T[]): Promise<IDBValidKey[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.createTransaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const results: IDBValidKey[] = []
      let completed = 0

      transaction.oncomplete = () => resolve(results)
      transaction.onerror = () => reject(transaction.error)

      items.forEach((item, index) => {
        const request = store.put(item)
        request.onsuccess = () => {
          results[index] = request.result
          completed++
        }
      })
    })
  }

  async batchDelete(storeName: string, keys: IDBValidKey[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.createTransaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)

      keys.forEach(key => {
        store.delete(key)
      })
    })
  }

  // Query operations
  async query<T>(storeName: string, options: {
    index?: string
    range?: IDBKeyRange
    direction?: IDBCursorDirection
    limit?: number
    filter?: (item: T) => boolean
  } = {}): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readonly')
      const source = options.index ? store.index(options.index) : store
      const request = source.openCursor(options.range, options.direction)
      const results: T[] = []
      let count = 0

      request.onsuccess = () => {
        const cursor = request.result
        if (cursor && (!options.limit || count < options.limit)) {
          const item = cursor.value as T
          if (!options.filter || options.filter(item)) {
            results.push(item)
            count++
          }
          cursor.continue()
        } else {
          resolve(results)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  // Cache management
  async setCache(key: string, data: any, expiresIn: number = 3600000): Promise<void> { // Default 1 hour
    const cacheItem = {
      key,
      data,
      type: 'cache',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expiresIn).toISOString()
    }
    await this.put(DB_CONFIG.stores.cache, cacheItem)
  }

  async getCache<T>(key: string): Promise<T | null> {
    const cacheItem = await this.get<any>(DB_CONFIG.stores.cache, key)
    if (!cacheItem) {
      return null
    }

    // Check if expired
    if (new Date(cacheItem.expiresAt) <= new Date()) {
      await this.delete(DB_CONFIG.stores.cache, key)
      return null
    }

    return cacheItem.data
  }

  async clearExpiredCache(): Promise<void> {
    const now = new Date().toISOString()
    const expiredItems = await this.query<any>(DB_CONFIG.stores.cache, {
      index: 'expiresAt',
      range: IDBKeyRange.upperBound(now)
    })

    const keys = expiredItems.map(item => item.key)
    if (keys.length > 0) {
      await this.batchDelete(DB_CONFIG.stores.cache, keys)
    }
  }

  // Database maintenance
  async vacuum(): Promise<void> {
    // Clear expired cache
    await this.clearExpiredCache()
    
    // Could add more cleanup operations here
    this.emit('vacuumed')
  }

  // Get database statistics
  async getStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {}
    
    for (const storeName of Object.values(DB_CONFIG.stores)) {
      try {
        stats[storeName] = await this.count(storeName)
      } catch (error) {
        console.warn(`Failed to get count for store ${storeName}:`, error)
        stats[storeName] = 0
      }
    }
    
    return stats
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

  // Close database connection
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.isInitialized = false
      this.initPromise = null
      this.emit('closed')
    }
  }

  // Delete database
  static async deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_CONFIG.name)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      request.onblocked = () => {
        console.warn('Database deletion blocked. Close all tabs and try again.')
      }
    })
  }
}

// Create and export database manager instance
export const db = new DatabaseManager()

// Utility functions
export const createKeyRange = {
  only: (value: any) => IDBKeyRange.only(value),
  lowerBound: (lower: any, open = false) => IDBKeyRange.lowerBound(lower, open),
  upperBound: (upper: any, open = false) => IDBKeyRange.upperBound(upper, open),
  bound: (lower: any, upper: any, lowerOpen = false, upperOpen = false) => 
    IDBKeyRange.bound(lower, upper, lowerOpen, upperOpen)
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export default db