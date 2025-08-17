// Database Migration System

import { db, DB_CONFIG, STORE_SCHEMAS } from './db'
import type { User, Lesson, Progress, Achievement, Project, Conversation } from './models'

// Migration interface
export interface Migration {
  version: number
  name: string
  description: string
  up: (database: IDBDatabase, transaction: IDBTransaction) => Promise<void> | void
  down?: (database: IDBDatabase, transaction: IDBTransaction) => Promise<void> | void
}

// Migration registry
const migrations: Migration[] = []

// Migration utilities
export class MigrationManager {
  private static readonly MIGRATION_STORE = 'migrations'
  private static readonly MIGRATION_KEY = 'applied_migrations'

  // Register a migration
  static register(migration: Migration): void {
    // Check for duplicate versions
    const existing = migrations.find(m => m.version === migration.version)
    if (existing) {
      throw new Error(`Migration version ${migration.version} already exists: ${existing.name}`)
    }

    // Insert in sorted order
    const index = migrations.findIndex(m => m.version > migration.version)
    if (index === -1) {
      migrations.push(migration)
    } else {
      migrations.splice(index, 0, migration)
    }

    console.log(`Registered migration v${migration.version}: ${migration.name}`)
  }

  // Get all registered migrations
  static getMigrations(): Migration[] {
    return [...migrations].sort((a, b) => a.version - b.version)
  }

  // Get applied migrations from database
  static async getAppliedMigrations(): Promise<number[]> {
    try {
      await db.initialize()
      const applied = await db.getCache<number[]>(this.MIGRATION_KEY)
      return applied || []
    } catch (error) {
      console.warn('Could not retrieve applied migrations:', error)
      return []
    }
  }

  // Save applied migrations to database
  static async saveAppliedMigrations(versions: number[]): Promise<void> {
    try {
      await db.setCache(this.MIGRATION_KEY, versions, 365 * 24 * 60 * 60 * 1000) // 1 year
    } catch (error) {
      console.error('Could not save applied migrations:', error)
    }
  }

  // Run pending migrations
  static async runPendingMigrations(): Promise<void> {
    const allMigrations = this.getMigrations()
    const appliedVersions = await this.getAppliedMigrations()
    const pendingMigrations = allMigrations.filter(m => !appliedVersions.includes(m.version))

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations')
      return
    }

    console.log(`Running ${pendingMigrations.length} pending migrations...`)

    for (const migration of pendingMigrations) {
      try {
        console.log(`Running migration v${migration.version}: ${migration.name}`)
        await this.runMigration(migration)
        appliedVersions.push(migration.version)
        await this.saveAppliedMigrations(appliedVersions)
        console.log(`✓ Migration v${migration.version} completed`)
      } catch (error) {
        console.error(`✗ Migration v${migration.version} failed:`, error)
        throw new Error(`Migration v${migration.version} failed: ${error}`)
      }
    }

    console.log('All migrations completed successfully')
  }

  // Run a single migration
  private static async runMigration(migration: Migration): Promise<void> {
    return new Promise((resolve, reject) => {
      const database = db.getDatabase()
      
      // Create a temporary transaction for the migration
      // Note: In a real migration during database upgrade, this would be handled differently
      try {
        // For data migrations, we'll use regular transactions
        const result = migration.up(database, null as any)
        if (result instanceof Promise) {
          result.then(resolve).catch(reject)
        } else {
          resolve()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // Rollback a migration (if supported)
  static async rollbackMigration(version: number): Promise<void> {
    const migration = migrations.find(m => m.version === version)
    if (!migration) {
      throw new Error(`Migration version ${version} not found`)
    }

    if (!migration.down) {
      throw new Error(`Migration version ${version} does not support rollback`)
    }

    console.log(`Rolling back migration v${version}: ${migration.name}`)

    try {
      const database = db.getDatabase()
      const result = migration.down(database, null as any)
      if (result instanceof Promise) {
        await result
      }

      // Remove from applied migrations
      const appliedVersions = await this.getAppliedMigrations()
      const updatedVersions = appliedVersions.filter(v => v !== version)
      await this.saveAppliedMigrations(updatedVersions)

      console.log(`✓ Migration v${version} rolled back successfully`)
    } catch (error) {
      console.error(`✗ Migration v${version} rollback failed:`, error)
      throw error
    }
  }

  // Get migration status
  static async getStatus(): Promise<{
    total: number
    applied: number
    pending: number
    appliedVersions: number[]
    pendingVersions: number[]
  }> {
    const allMigrations = this.getMigrations()
    const appliedVersions = await this.getAppliedMigrations()
    const pendingVersions = allMigrations
      .filter(m => !appliedVersions.includes(m.version))
      .map(m => m.version)

    return {
      total: allMigrations.length,
      applied: appliedVersions.length,
      pending: pendingVersions.length,
      appliedVersions: appliedVersions.sort((a, b) => a - b),
      pendingVersions: pendingVersions.sort((a, b) => a - b)
    }
  }
}

// Built-in migrations

// Migration 1: Initial data seeding
MigrationManager.register({
  version: 1,
  name: 'initial_data_seed',
  description: 'Seed initial data for new installations',
  up: async (database) => {
    console.log('Seeding initial data...')
    
    // Seed default user preferences
    const defaultPreferences = {
      id: 'default-preferences',
      userId: 'system',
      category: 'ui' as const,
      preferences: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC'
      },
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await db.put('preferences', defaultPreferences)
    
    // Seed sample achievements
    const sampleAchievements = [
      {
        id: 'first-lesson',
        userId: 'template',
        type: 'completion' as const,
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        category: 'learning' as const,
        difficulty: 'beginner' as const,
        points: 10,
        requirements: [{
          type: 'lesson-completion' as const,
          target: 1,
          description: 'Complete 1 lesson'
        }],
        progress: {
          current: 0,
          target: 1,
          percentage: 0,
          milestones: []
        },
        metadata: {
          rarity: 'common' as const,
          earnedBy: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'coding-streak',
        userId: 'template',
        type: 'streak' as const,
        title: 'Consistent Coder',
        description: 'Code for 7 days in a row',
        icon: '🔥',
        category: 'consistency' as const,
        difficulty: 'intermediate' as const,
        points: 50,
        requirements: [{
          type: 'streak-days' as const,
          target: 7,
          description: 'Code for 7 consecutive days'
        }],
        progress: {
          current: 0,
          target: 7,
          percentage: 0,
          milestones: []
        },
        metadata: {
          rarity: 'uncommon' as const,
          earnedBy: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    for (const achievement of sampleAchievements) {
      await db.put('achievements', achievement)
    }
    
    console.log('Initial data seeded successfully')
  }
})

// Migration 2: Add user analytics preferences
MigrationManager.register({
  version: 2,
  name: 'add_analytics_preferences',
  description: 'Add analytics and tracking preferences for existing users',
  up: async (database) => {
    console.log('Adding analytics preferences...')
    
    // Get all existing users
    const users = await db.getAll<User>('users')
    
    for (const user of users) {
      // Add analytics preferences if not present
      if (!user.preferences.privacy.allowAnalytics) {
        user.preferences.privacy.allowAnalytics = true
        user.updatedAt = new Date().toISOString()
        await db.put('users', user)
      }
    }
    
    console.log(`Updated ${users.length} users with analytics preferences`)
  },
  down: async (database) => {
    console.log('Removing analytics preferences...')
    
    const users = await db.getAll<User>('users')
    
    for (const user of users) {
      if ('allowAnalytics' in user.preferences.privacy) {
        delete (user.preferences.privacy as any).allowAnalytics
        user.updatedAt = new Date().toISOString()
        await db.put('users', user)
      }
    }
    
    console.log(`Removed analytics preferences from ${users.length} users`)
  }
})

// Migration 3: Update lesson content structure
MigrationManager.register({
  version: 3,
  name: 'update_lesson_structure',
  description: 'Update lesson content structure to support new interactive features',
  up: async (database) => {
    console.log('Updating lesson content structure...')
    
    const lessons = await db.getAll<Lesson>('lessons')
    
    for (const lesson of lessons) {
      // Add new fields if missing
      if (!lesson.metadata) {
        lesson.metadata = {
          estimatedTime: lesson.duration || 30,
          completionRate: 0,
          averageRating: 0,
          totalRatings: 0,
          lastUpdated: lesson.updatedAt,
          viewCount: 0,
          completionCount: 0
        }
      }
      
      if (!lesson.resources) {
        lesson.resources = []
      }
      
      if (!lesson.assessments) {
        lesson.assessments = []
      }
      
      // Update version
      lesson.version = '2.0.0'
      lesson.updatedAt = new Date().toISOString()
      
      await db.put('lessons', lesson)
    }
    
    console.log(`Updated ${lessons.length} lessons with new structure`)
  }
})

// Migration 4: Add project collaboration features
MigrationManager.register({
  version: 4,
  name: 'add_project_collaboration',
  description: 'Add collaboration features to existing projects',
  up: async (database) => {
    console.log('Adding project collaboration features...')
    
    const projects = await db.getAll<Project>('projects')
    
    for (const project of projects) {
      if (!project.collaboration) {
        project.collaboration = {
          enabled: false,
          collaborators: [{
            userId: project.userId,
            role: 'owner',
            joinedAt: project.createdAt,
            lastActiveAt: project.updatedAt
          }],
          permissions: {
            canEdit: true,
            canRun: true,
            canShare: true,
            canDelete: true,
            canInvite: true
          },
          invitations: []
        }
        
        project.updatedAt = new Date().toISOString()
        await db.put('projects', project)
      }
    }
    
    console.log(`Added collaboration features to ${projects.length} projects`)
  }
})

// Migration 5: Optimize conversation storage
MigrationManager.register({
  version: 5,
  name: 'optimize_conversation_storage',
  description: 'Optimize conversation message storage and add compression',
  up: async (database) => {
    console.log('Optimizing conversation storage...')
    
    const conversations = await db.getAll<Conversation>('conversations')
    let optimizedCount = 0
    
    for (const conversation of conversations) {
      let hasChanges = false
      
      // Add metadata if missing
      if (!conversation.metadata) {
        conversation.metadata = {
          messageCount: conversation.messages.length,
          totalTokens: 0,
          duration: 0,
          tags: []
        }
        hasChanges = true
      }
      
      // Calculate tokens for existing messages
      let totalTokens = 0
      for (const message of conversation.messages) {
        if (!message.metadata) {
          message.metadata = {}
        }
        
        // Estimate tokens (rough calculation: ~4 characters per token)
        const estimatedTokens = Math.ceil(message.content.length / 4)
        message.metadata.tokens = estimatedTokens
        totalTokens += estimatedTokens
        hasChanges = true
      }
      
      conversation.metadata.totalTokens = totalTokens
      
      if (hasChanges) {
        conversation.updatedAt = new Date().toISOString()
        await db.put('conversations', conversation)
        optimizedCount++
      }
    }
    
    console.log(`Optimized ${optimizedCount} conversations`)
  }
})

// Migration 6: Add progress analytics
MigrationManager.register({
  version: 6,
  name: 'add_progress_analytics',
  description: 'Add detailed analytics to progress tracking',
  up: async (database) => {
    console.log('Adding progress analytics...')
    
    const progressRecords = await db.getAll<Progress>('progress')
    
    for (const progress of progressRecords) {
      // Add detailed timing if missing
      if (!progress.sections) {
        progress.sections = []
      }
      
      if (!progress.exercises) {
        progress.exercises = []
      }
      
      if (!progress.quizzes) {
        progress.quizzes = []
      }
      
      if (!progress.notes) {
        progress.notes = []
      }
      
      if (!progress.bookmarks) {
        progress.bookmarks = []
      }
      
      progress.updatedAt = new Date().toISOString()
      await db.put('progress', progress)
    }
    
    console.log(`Enhanced ${progressRecords.length} progress records with analytics`)
  }
})

// Data migration utilities
export class DataMigrationUtils {
  // Backup data before migration
  static async backupData(storeName: string): Promise<any[]> {
    console.log(`Creating backup of ${storeName}...`)
    const data = await db.getAll(storeName)
    
    // Store backup in cache with timestamp
    const backupKey = `backup_${storeName}_${Date.now()}`
    await db.setCache(backupKey, data, 7 * 24 * 60 * 60 * 1000) // 7 days
    
    console.log(`Backup created: ${backupKey} (${data.length} records)`)
    return data
  }
  
  // Restore data from backup
  static async restoreData(storeName: string, backupKey: string): Promise<void> {
    console.log(`Restoring ${storeName} from backup ${backupKey}...`)
    
    const backupData = await db.getCache<any[]>(backupKey)
    if (!backupData) {
      throw new Error(`Backup ${backupKey} not found`)
    }
    
    // Clear current data
    await db.clear(storeName)
    
    // Restore backup data
    await db.batchPut(storeName, backupData)
    
    console.log(`Restored ${backupData.length} records to ${storeName}`)
  }
  
  // Validate data integrity
  static async validateDataIntegrity(): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Check user data integrity
      const users = await db.getAll<User>('users')
      for (const user of users) {
        if (!user.id || !user.email) {
          errors.push(`User missing required fields: ${user.id}`)
        }
        if (!user.preferences) {
          warnings.push(`User missing preferences: ${user.id}`)
        }
      }
      
      // Check progress data integrity
      const progressRecords = await db.getAll<Progress>('progress')
      for (const progress of progressRecords) {
        if (!progress.userId || !progress.lessonId) {
          errors.push(`Progress missing required fields: ${progress.id}`)
        }
        if (progress.completionPercentage < 0 || progress.completionPercentage > 100) {
          errors.push(`Invalid completion percentage: ${progress.id}`)
        }
      }
      
      // Check project data integrity
      const projects = await db.getAll<Project>('projects')
      for (const project of projects) {
        if (!project.userId || !project.title) {
          errors.push(`Project missing required fields: ${project.id}`)
        }
        if (!project.files || project.files.length === 0) {
          warnings.push(`Project has no files: ${project.id}`)
        }
      }
      
      console.log(`Data integrity check completed: ${errors.length} errors, ${warnings.length} warnings`)
      
    } catch (error) {
      errors.push(`Data integrity check failed: ${error}`)
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  // Clean up orphaned data
  static async cleanupOrphanedData(): Promise<{
    cleaned: number
    details: Record<string, number>
  }> {
    const details: Record<string, number> = {}
    let totalCleaned = 0
    
    try {
      // Get all user IDs
      const users = await db.getAll<User>('users')
      const userIds = new Set(users.map(u => u.id))
      
      // Clean orphaned progress records
      const progressRecords = await db.getAll<Progress>('progress')
      const orphanedProgress = progressRecords.filter(p => !userIds.has(p.userId))
      if (orphanedProgress.length > 0) {
        await db.batchDelete('progress', orphanedProgress.map(p => p.id))
        details.progress = orphanedProgress.length
        totalCleaned += orphanedProgress.length
      }
      
      // Clean orphaned projects
      const projects = await db.getAll<Project>('projects')
      const orphanedProjects = projects.filter(p => !userIds.has(p.userId))
      if (orphanedProjects.length > 0) {
        await db.batchDelete('projects', orphanedProjects.map(p => p.id))
        details.projects = orphanedProjects.length
        totalCleaned += orphanedProjects.length
      }
      
      // Clean orphaned conversations
      const conversations = await db.getAll<Conversation>('conversations')
      const orphanedConversations = conversations.filter(c => !userIds.has(c.userId))
      if (orphanedConversations.length > 0) {
        await db.batchDelete('conversations', orphanedConversations.map(c => c.id))
        details.conversations = orphanedConversations.length
        totalCleaned += orphanedConversations.length
      }
      
      console.log(`Cleaned up ${totalCleaned} orphaned records`)
      
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
    
    return { cleaned: totalCleaned, details }
  }
}

// Initialize migrations on module load
export const initializeMigrations = async (): Promise<void> => {
  try {
    console.log('Initializing database migrations...')
    await MigrationManager.runPendingMigrations()
    console.log('Database migrations completed successfully')
  } catch (error) {
    console.error('Migration initialization failed:', error)
    throw error
  }
}

// Export migration manager for external use
export default MigrationManager