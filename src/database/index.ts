// Database Layer Entry Point

// Core database functionality
export { db, DB_CONFIG, STORE_SCHEMAS, createKeyRange, generateId } from './db'

// Database models and types
export * from './models'

// Migration system
export { MigrationManager, DataMigrationUtils, initializeMigrations } from './migrations'
export type { Migration } from './migrations'

// Database initialization and setup
import { db } from './db'
import { initializeMigrations } from './migrations'

/**
 * Initialize the complete database system
 * This should be called once during application startup
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('Initializing EduAI database system...')
    
    // Initialize the database connection
    await db.initialize()
    console.log('✓ Database connection established')
    
    // Run any pending migrations
    await initializeMigrations()
    console.log('✓ Database migrations completed')
    
    // Perform maintenance tasks
    await db.vacuum()
    console.log('✓ Database maintenance completed')
    
    console.log('EduAI database system initialized successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw new Error(`Database initialization failed: ${error}`)
  }
}

/**
 * Get database health status
 */
export const getDatabaseHealth = async (): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  details: {
    connected: boolean
    storeCount: number
    totalRecords: number
    lastVacuum?: string
    migrations: {
      total: number
      applied: number
      pending: number
    }
    errors: string[]
  }
}> => {
  const errors: string[] = []
  let connected = false
  let storeCount = 0
  let totalRecords = 0
  let migrations = { total: 0, applied: 0, pending: 0 }
  
  try {
    // Check database connection
    await db.initialize()
    connected = true
    
    // Get store statistics
    const stats = await db.getStats()
    storeCount = Object.keys(stats).length
    totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0)
    
    // Get migration status
    const { MigrationManager } = await import('./migrations')
    const migrationStatus = await MigrationManager.getStatus()
    migrations = {
      total: migrationStatus.total,
      applied: migrationStatus.applied,
      pending: migrationStatus.pending
    }
    
  } catch (error) {
    errors.push(`Database health check failed: ${error}`)
  }
  
  // Determine overall health status
  let status: 'healthy' | 'degraded' | 'unhealthy'
  if (!connected || errors.length > 0) {
    status = 'unhealthy'
  } else if (migrations.pending > 0) {
    status = 'degraded'
  } else {
    status = 'healthy'
  }
  
  return {
    status,
    details: {
      connected,
      storeCount,
      totalRecords,
      migrations,
      errors
    }
  }
}

/**
 * Database repository pattern implementations
 */

// Base repository class
export abstract class BaseRepository<T extends { id: string }> {
  protected storeName: string
  
  constructor(storeName: string) {
    this.storeName = storeName
  }
  
  async findById(id: string): Promise<T | undefined> {
    return db.get<T>(this.storeName, id)
  }
  
  async findAll(options?: {
    limit?: number
    offset?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<T[]> {
    if (options?.sortBy) {
      return db.query<T>(this.storeName, {
        index: options.sortBy,
        direction: options.sortOrder === 'desc' ? 'prev' : 'next',
        limit: options.limit
      })
    }
    
    return db.getAll<T>(this.storeName, undefined, options?.limit)
  }
  
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const { generateId } = await import('./db')
    const now = new Date().toISOString()
    const entity = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    } as unknown as T
    
    await db.add(this.storeName, entity)
    return entity
  }
  
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | undefined> {
    const existing = await this.findById(id)
    if (!existing) {
      return undefined
    }
    
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    await db.put(this.storeName, updated)
    return updated
  }
  
  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id)
    if (!existing) {
      return false
    }
    
    await db.delete(this.storeName, id)
    return true
  }
  
  async count(query?: IDBValidKey | IDBKeyRange): Promise<number> {
    return db.count(this.storeName, query)
  }
  
  async exists(id: string): Promise<boolean> {
    const entity = await this.findById(id)
    return entity !== undefined
  }
  
  async batchCreate(items: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<T[]> {
    const { generateId } = await import('./db')
    const now = new Date().toISOString()
    const entities = items.map(item => ({
      ...item,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    })) as unknown as T[]
    
    await db.batchPut(this.storeName, entities)
    return entities
  }
  
  async batchUpdate(updates: { id: string; data: Partial<Omit<T, 'id' | 'createdAt'>> }[]): Promise<T[]> {
    const results: T[] = []
    
    for (const update of updates) {
      const result = await this.update(update.id, update.data)
      if (result) {
        results.push(result)
      }
    }
    
    return results
  }
  
  async batchDelete(ids: string[]): Promise<number> {
    let deletedCount = 0
    
    for (const id of ids) {
      const deleted = await this.delete(id)
      if (deleted) {
        deletedCount++
      }
    }
    
    return deletedCount
  }
}

// Specific repository implementations
export class UserRepository extends BaseRepository<import('./models').User> {
  constructor() {
    super('users')
  }
  
  async findByEmail(email: string): Promise<import('./models').User | undefined> {
    const users = await db.getAllByIndex<import('./models').User>('users', 'email', email)
    return users[0]
  }
  
  async findByUsername(username: string): Promise<import('./models').User | undefined> {
    const users = await db.getAllByIndex<import('./models').User>('users', 'username', username)
    return users[0]
  }
}

export class LessonRepository extends BaseRepository<import('./models').Lesson> {
  constructor() {
    super('lessons')
  }
  
  async findByCourse(courseId: string): Promise<import('./models').Lesson[]> {
    return db.getAllByIndex<import('./models').Lesson>('lessons', 'courseId', courseId)
  }
  
  async findByCategory(category: string): Promise<import('./models').Lesson[]> {
    return db.getAllByIndex<import('./models').Lesson>('lessons', 'category', category)
  }
  
  async findByDifficulty(difficulty: string): Promise<import('./models').Lesson[]> {
    return db.getAllByIndex<import('./models').Lesson>('lessons', 'difficulty', difficulty)
  }
}

export class ProgressRepository extends BaseRepository<import('./models').Progress> {
  constructor() {
    super('progress')
  }
  
  async findByUser(userId: string): Promise<import('./models').Progress[]> {
    return db.getAllByIndex<import('./models').Progress>('progress', 'userId', userId)
  }
  
  async findByLesson(lessonId: string): Promise<import('./models').Progress[]> {
    return db.getAllByIndex<import('./models').Progress>('progress', 'lessonId', lessonId)
  }
  
  async findByUserAndLesson(userId: string, lessonId: string): Promise<import('./models').Progress | undefined> {
    const progressList = await db.getAllByIndex<import('./models').Progress>('progress', 'userLesson', [userId, lessonId])
    return progressList[0]
  }
}

export class ProjectRepository extends BaseRepository<import('./models').Project> {
  constructor() {
    super('projects')
  }
  
  async findByUser(userId: string): Promise<import('./models').Project[]> {
    return db.getAllByIndex<import('./models').Project>('projects', 'userId', userId)
  }
  
  async findByLanguage(language: string): Promise<import('./models').Project[]> {
    return db.getAllByIndex<import('./models').Project>('projects', 'language', language)
  }
}

export class ConversationRepository extends BaseRepository<import('./models').Conversation> {
  constructor() {
    super('conversations')
  }
  
  async findByUser(userId: string): Promise<import('./models').Conversation[]> {
    return db.getAllByIndex<import('./models').Conversation>('conversations', 'userId', userId)
  }
  
  async findBySession(sessionId: string): Promise<import('./models').Conversation[]> {
    return db.getAllByIndex<import('./models').Conversation>('conversations', 'sessionId', sessionId)
  }
}

// Repository factory
export class RepositoryFactory {
  private static repositories = new Map<string, BaseRepository<any>>()
  
  static getRepository<T extends BaseRepository<any>>(type: string): T {
    if (!this.repositories.has(type)) {
      switch (type) {
        case 'user':
          this.repositories.set(type, new UserRepository())
          break
        case 'lesson':
          this.repositories.set(type, new LessonRepository())
          break
        case 'progress':
          this.repositories.set(type, new ProgressRepository())
          break
        case 'project':
          this.repositories.set(type, new ProjectRepository())
          break
        case 'conversation':
          this.repositories.set(type, new ConversationRepository())
          break
        default:
          throw new Error(`Unknown repository type: ${type}`)
      }
    }
    
    return this.repositories.get(type) as T
  }
  
  static clearCache(): void {
    this.repositories.clear()
  }
}

// Convenience exports for common repositories
export const userRepository = new UserRepository()
export const lessonRepository = new LessonRepository()
export const progressRepository = new ProgressRepository()
export const projectRepository = new ProjectRepository()
export const conversationRepository = new ConversationRepository()

// Database utilities
export const DatabaseUtils = {
  // Export data for backup
  async exportData(storeNames?: string[]): Promise<Record<string, any[]>> {
    const { DB_CONFIG } = await import('./db')
    const stores = storeNames || Object.values(DB_CONFIG.stores)
    const exportData: Record<string, any[]> = {}
    
    for (const storeName of stores) {
      try {
        exportData[storeName] = await db.getAll(storeName)
      } catch (error) {
        console.warn(`Failed to export ${storeName}:`, error)
        exportData[storeName] = []
      }
    }
    
    return exportData
  },
  
  // Import data from backup
  async importData(data: Record<string, any[]>, options: {
    clearExisting?: boolean
    skipErrors?: boolean
  } = {}): Promise<{ success: number; errors: string[] }> {
    let success = 0
    const errors: string[] = []
    
    for (const [storeName, items] of Object.entries(data)) {
      try {
        if (options.clearExisting) {
          await db.clear(storeName)
        }
        
        await db.batchPut(storeName, items)
        success += items.length
      } catch (error) {
        const errorMsg = `Failed to import ${storeName}: ${error}`
        errors.push(errorMsg)
        
        if (!options.skipErrors) {
          throw new Error(errorMsg)
        }
      }
    }
    
    return { success, errors }
  },
  
  // Reset database (clear all data)
  async resetDatabase(): Promise<void> {
    const { DB_CONFIG } = await import('./db')
    const stores = Object.values(DB_CONFIG.stores)
    
    for (const storeName of stores) {
      try {
        await db.clear(storeName)
      } catch (error) {
        console.warn(`Failed to clear ${storeName}:`, error)
      }
    }
    
    console.log('Database reset completed')
  },
  
  // Get database size estimate
  async getDatabaseSize(): Promise<{
    totalRecords: number
    storeStats: Record<string, number>
    estimatedSizeKB: number
  }> {
    const stats = await db.getStats()
    const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0)
    
    // Rough estimate: 1KB per record on average
    const estimatedSizeKB = totalRecords * 1
    
    return {
      totalRecords,
      storeStats: stats,
      estimatedSizeKB
    }
  }
}

// Default export
export default {
  db,
  initializeDatabase,
  getDatabaseHealth,
  repositories: {
    user: userRepository,
    lesson: lessonRepository,
    progress: progressRepository,
    project: projectRepository,
    conversation: conversationRepository
  },
  utils: DatabaseUtils
}