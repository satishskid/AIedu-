import { db } from '../db'
import {
  PointsTransaction,
  PointsReward,
  UserPointsReward,
  PointsLevel,
  UserPointsStats
} from '../models'

export class PointsRepository {
  // Points Transactions
  async addTransaction(transaction: Omit<PointsTransaction, 'id'>): Promise<string> {
    const newTransaction: PointsTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return await db.add('pointsTransactions', newTransaction) as string
  }

  async getTransactionsByUser(userId: string): Promise<PointsTransaction[]> {
    return await db.getAllByIndex<PointsTransaction>('pointsTransactions', 'userId', userId)
  }

  async getRecentTransactions(userId: string, limit: number = 10): Promise<PointsTransaction[]> {
    const transactions = await this.getTransactionsByUser(userId)
    return transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  async getTransactionsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PointsTransaction[]> {
    const transactions = await this.getTransactionsByUser(userId)
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  // Points Rewards
  async getAllRewards(): Promise<PointsReward[]> {
    return await db.getAll<PointsReward>('pointsRewards')
  }

  async getAvailableRewards(): Promise<PointsReward[]> {
    const allRewards = await db.getAll<PointsReward>('pointsRewards')
    return allRewards.filter(reward => reward.available)
  }

  async getRewardById(id: string): Promise<PointsReward | undefined> {
    return await db.get<PointsReward>('pointsRewards', id)
  }

  async addReward(reward: PointsReward): Promise<string> {
    return await db.add('pointsRewards', reward) as string
  }

  async updateReward(id: string, updates: Partial<PointsReward>): Promise<number> {
    const existing = await this.getRewardById(id)
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
      await db.put('pointsRewards', updated)
      return 1
    }
    return 0
  }

  // User Points Rewards (owned rewards)
  async getUserRewards(userId: string): Promise<UserPointsReward[]> {
    return await db.getAllByIndex<UserPointsReward>('userPointsRewards', 'userId', userId)
  }

  async addUserReward(userReward: UserPointsReward): Promise<string> {
    const newUserReward: UserPointsReward = {
      ...userReward,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return await db.add('userPointsRewards', newUserReward) as string
  }

  async hasUserReward(userId: string, rewardId: string): Promise<boolean> {
    const userRewards = await this.getUserRewards(userId)
    return userRewards.some(ur => ur.rewardId === rewardId)
  }

  // User Points Stats
  async getUserStats(userId: string): Promise<UserPointsStats | undefined> {
    const allStats = await db.getAllByIndex<UserPointsStats>('userPointsStats', 'userId', userId)
    return allStats[0]
  }

  async updateUserStats(userId: string, stats: Partial<UserPointsStats>): Promise<number> {
    const existing = await this.getUserStats(userId)
    if (existing) {
      const updated = {
        ...existing,
        ...stats,
        updatedAt: new Date().toISOString()
      }
      await db.put('userPointsStats', updated)
      return 1
    } else {
      const newStats: UserPointsStats = {
        id: crypto.randomUUID(),
        userId,
        totalEarned: 0,
        totalSpent: 0,
        currentBalance: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...stats
      }
      await db.add('userPointsStats', newStats)
      return 1
    }
  }

  // Calculate stats from transactions
  async calculateUserStats(userId: string): Promise<UserPointsStats> {
    const transactions = await this.getTransactionsByUser(userId)
    
    const totalEarned = transactions
      .filter(t => t.type === 'earned' || t.type === 'bonus')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalSpent = Math.abs(transactions
      .filter(t => t.type === 'spent' || t.type === 'penalty')
      .reduce((sum, t) => sum + t.amount, 0))
    
    const currentBalance = totalEarned - totalSpent
    
    // Calculate streak (simplified - would need more complex logic for real streaks)
    const streakTransactions = transactions
      .filter(t => t.category === 'streak')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    const currentStreak = streakTransactions.length > 0 
      ? (streakTransactions[0].metadata?.streakDays || 0)
      : 0
    
    const longestStreak = Math.max(
      ...streakTransactions.map(t => t.metadata?.streakDays || 0),
      0
    )
    
    // Determine level based on points
    const level = this.calculateLevel(currentBalance)
    
    const stats: UserPointsStats = {
      id: crypto.randomUUID(),
      userId,
      totalEarned,
      totalSpent,
      currentBalance,
      currentStreak,
      longestStreak,
      level,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await this.updateUserStats(userId, stats)
    return stats
  }

  // Helper method to calculate level from points
  private calculateLevel(points: number): number {
    if (points < 100) return 1
    if (points < 250) return 2
    if (points < 500) return 3
    if (points < 1000) return 4
    if (points < 2000) return 5
    if (points < 5000) return 6
    return 7
  }

  // Initialize default rewards
  async initializeDefaultRewards(): Promise<void> {
    const existingRewards = await db.getAll<PointsReward>('pointsRewards')
    if (existingRewards.length > 0) return // Already initialized
    
    const now = new Date().toISOString()
    const defaultRewards: PointsReward[] = [
      {
        id: 'dark-theme',
        name: 'Dark Theme',
        description: 'Unlock the sleek dark theme for your learning environment',
        cost: 100,
        type: 'cosmetic',
        icon: '🌙',
        available: true,
        category: 'Themes',
        rarity: 'common',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'extra-hint',
        name: 'Extra Hint',
        description: 'Get an additional hint for any coding exercise',
        cost: 50,
        type: 'functional',
        icon: '💡',
        available: true,
        category: 'Learning Aids',
        rarity: 'common',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'premium-avatar',
        name: 'Premium Avatar',
        description: 'Unlock exclusive avatar customization options',
        cost: 200,
        type: 'cosmetic',
        icon: '👤',
        available: true,
        category: 'Avatars',
        rarity: 'rare',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'skip-exercise',
        name: 'Skip Exercise',
        description: 'Skip one difficult exercise and still get partial credit',
        cost: 150,
        type: 'functional',
        icon: '⏭️',
        available: true,
        category: 'Learning Aids',
        rarity: 'rare',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'bonus-lesson',
        name: 'Bonus Lesson',
        description: 'Unlock exclusive advanced content',
        cost: 500,
        type: 'content',
        icon: '📖',
        available: true,
        category: 'Content',
        rarity: 'epic',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'mentor-badge',
        name: 'Mentor Badge',
        description: 'Show off your expertise with a special mentor badge',
        cost: 1000,
        type: 'social',
        icon: '🏅',
        available: true,
        category: 'Badges',
        rarity: 'legendary',
        createdAt: now,
        updatedAt: now
      }
    ]
    
    await db.batchPut('pointsRewards', defaultRewards)
  }

  // Award points to user
  async awardPoints(
    userId: string,
    amount: number,
    reason: string,
    category: PointsTransaction['category'],
    metadata?: Record<string, any>
  ): Promise<void> {
    // Add transaction
    const now = new Date().toISOString()
    await this.addTransaction({
      userId,
      type: 'earned',
      amount,
      reason,
      category,
      metadata,
      createdAt: now,
      updatedAt: now
    })
    
    // Update user stats
    await this.calculateUserStats(userId)
  }

  // Purchase reward
  async purchaseReward(userId: string, rewardId: string): Promise<boolean> {
    const reward = await this.getRewardById(rewardId)
    if (!reward) return false
    
    const stats = await this.getUserStats(userId)
    if (!stats || stats.currentBalance < reward.cost) return false
    
    // Check if user already owns this reward
    const alreadyOwned = await this.hasUserReward(userId, rewardId)
    if (alreadyOwned) return false
    
    // Add spending transaction
    const now = new Date().toISOString()
    await this.addTransaction({
      userId,
      type: 'spent',
      amount: -reward.cost,
      reason: `Purchased ${reward.name}`,
      category: 'bonus',
      metadata: { rewardId },
      createdAt: now,
      updatedAt: now
    })
    
    // Add user reward
    await this.addUserReward({
      id: crypto.randomUUID(),
      userId,
      rewardId,
      purchasedAt: now,
      transactionId: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    })
    
    // Update user stats
    await this.calculateUserStats(userId)
    
    return true
  }
}

export const pointsRepository = new PointsRepository()