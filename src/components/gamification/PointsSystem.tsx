import React, { useState, useEffect, useCallback } from 'react'
import {
  Star,
  Trophy,
  Target,
  Zap,
  Award,
  Gift,
  Coins,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  Flame,
  Crown,
  Medal,
  Sparkles,
  Plus,
  Minus,
  RotateCcw,
  Settings,
  Info,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Lock,
  Unlock,
  Heart,
  Shield,
  Gem,
  Rocket,
  Sun,
  Moon,
  BookOpen,
  Code
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useLicenseStore } from '../../store/licenseStore'
import { pointsRepository } from '../../database/repositories/pointsRepository'
import type { PointsTransaction as DBPointsTransaction, PointsReward as DBPointsReward, UserPointsStats } from '../../database/models'

interface PointsTransaction {
  id: string
  type: 'earned' | 'spent' | 'bonus' | 'penalty'
  amount: number
  reason: string
  category: 'lesson' | 'exercise' | 'quiz' | 'achievement' | 'streak' | 'social' | 'bonus'
  timestamp: Date
  metadata?: Record<string, any>
}

interface PointsLevel {
  level: number
  name: string
  minPoints: number
  maxPoints: number
  rewards: string[]
  badge: string
  color: string
}

interface PointsReward {
  id: string
  name: string
  description: string
  cost: number
  type: 'cosmetic' | 'functional' | 'content' | 'social'
  icon: string
  available: boolean
  owned: boolean
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface PointsSystemProps {
  userId?: string
  showTransactions?: boolean
  showRewards?: boolean
  showLevels?: boolean
  compact?: boolean
  className?: string
}

interface PointsStats {
  totalEarned: number
  totalSpent: number
  currentBalance: number
  todayEarned: number
  weeklyEarned: number
  monthlyEarned: number
  currentStreak: number
  longestStreak: number
  level: PointsLevel
  nextLevel: PointsLevel | null
  progressToNext: number
}

export const PointsSystem: React.FC<PointsSystemProps> = ({
  userId,
  showTransactions = true,
  showRewards = true,
  showLevels = true,
  compact = false,
  className = ''
}) => {
  const { user } = useAuthStore()
  const { licenseInfo } = useLicenseStore()
  
  const [pointsStats, setPointsStats] = useState<PointsStats | null>(null)
  const [transactions, setTransactions] = useState<PointsTransaction[]>([])
  const [rewards, setRewards] = useState<PointsReward[]>([])
  const [levels, setLevels] = useState<PointsLevel[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'rewards' | 'levels'>('overview')
  const [selectedReward, setSelectedReward] = useState<PointsReward | null>(null)
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [animatingPoints, setAnimatingPoints] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize data
  useEffect(() => {
    initializePointsSystem()
  }, [user])

  const initializePointsSystem = useCallback(async () => {
    setLoading(true)
    
    try {
      const currentUserId = userId || user?.id
      if (!currentUserId) {
        setLoading(false)
        return
      }

      // Initialize default rewards if needed
      await pointsRepository.initializeDefaultRewards()
      
      // Define levels (could be moved to database later)
      const systemLevels: PointsLevel[] = [
        { level: 1, name: 'Novice', minPoints: 0, maxPoints: 99, rewards: ['Basic Avatar'], badge: '🌱', color: 'text-green-600' },
        { level: 2, name: 'Learner', minPoints: 100, maxPoints: 249, rewards: ['Custom Theme'], badge: '📚', color: 'text-blue-600' },
        { level: 3, name: 'Explorer', minPoints: 250, maxPoints: 499, rewards: ['Extra Hints'], badge: '🔍', color: 'text-purple-600' },
        { level: 4, name: 'Scholar', minPoints: 500, maxPoints: 999, rewards: ['Priority Support'], badge: '🎓', color: 'text-indigo-600' },
        { level: 5, name: 'Expert', minPoints: 1000, maxPoints: 1999, rewards: ['Advanced Features'], badge: '⭐', color: 'text-yellow-600' },
        { level: 6, name: 'Master', minPoints: 2000, maxPoints: 4999, rewards: ['Mentor Badge'], badge: '👑', color: 'text-orange-600' },
        { level: 7, name: 'Legend', minPoints: 5000, maxPoints: Infinity, rewards: ['Hall of Fame'], badge: '🏆', color: 'text-red-600' }
      ]
      
      // Load real data from database
      const [dbTransactions, dbRewards, userRewards] = await Promise.all([
        pointsRepository.getTransactionsByUser(currentUserId),
        pointsRepository.getAvailableRewards(),
        pointsRepository.getUserRewards(currentUserId)
      ])
      
      // Convert database transactions to component format
      const userTransactions: PointsTransaction[] = dbTransactions.map(t => ({
        id: t.id,
        type: t.type as 'earned' | 'spent' | 'bonus' | 'penalty',
        amount: t.amount,
        reason: t.reason,
        category: t.category,
        timestamp: new Date(t.createdAt),
        metadata: t.metadata
      }))
      
      // Convert database rewards to component format
      const ownedRewardIds = new Set(userRewards.map(ur => ur.rewardId))
      const userRewards_formatted: PointsReward[] = dbRewards.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        cost: r.cost,
        type: r.type,
        icon: r.icon,
        available: r.available,
        owned: ownedRewardIds.has(r.id),
        category: r.category,
        rarity: r.rarity
      }))
      
      // Calculate current stats
      const totalEarned = userTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
      const totalSpent = Math.abs(userTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
      const currentBalance = totalEarned - totalSpent
      
      // Calculate time-based earnings
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(todayStart.getTime() - (todayStart.getDay() * 24 * 60 * 60 * 1000))
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const todayEarned = userTransactions
        .filter(t => t.timestamp >= todayStart && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0)
      
      const weeklyEarned = userTransactions
        .filter(t => t.timestamp >= weekStart && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0)
      
      const monthlyEarned = userTransactions
        .filter(t => t.timestamp >= monthStart && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0)
      
      // Calculate streaks (simplified)
      const currentStreak = 5 // Mock value - would need proper streak calculation
      const longestStreak = 12 // Mock value - would need proper streak calculation
      
      // Determine current level
      const currentLevel = systemLevels.find(level => 
        currentBalance >= level.minPoints && currentBalance <= level.maxPoints
      ) || systemLevels[0]
      
      const nextLevel = systemLevels.find(level => level.level === currentLevel.level + 1) || null
      const progressToNext = nextLevel 
        ? ((currentBalance - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
        : 100
      
      const stats: PointsStats = {
        totalEarned,
        totalSpent,
        currentBalance,
        todayEarned,
        weeklyEarned,
        monthlyEarned,
        currentStreak,
        longestStreak,
        level: currentLevel,
        nextLevel,
        progressToNext
      }
      
      setLevels(systemLevels)
      setTransactions(userTransactions)
      setRewards(userRewards_formatted)
      setPointsStats(stats)
      
    } catch (error) {
      console.error('Failed to initialize points system:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, user, licenseInfo])

  const awardPoints = useCallback(async (
    amount: number,
    reason: string,
    category: 'lesson' | 'exercise' | 'quiz' | 'achievement' | 'streak' | 'social' | 'bonus' = 'bonus',
    metadata?: Record<string, any>
  ) => {
    const currentUserId = userId || user?.id
    if (!currentUserId) return
    
    try {
      await pointsRepository.awardPoints(currentUserId, amount, reason, category, metadata)
      await initializePointsSystem() // Refresh data
      
      // Animate points
      setAnimatingPoints(amount)
      setTimeout(() => setAnimatingPoints(null), 2000)
    } catch (error) {
      console.error('Failed to award points:', error)
    }
  }, [userId, user, initializePointsSystem])

  const purchaseReward = useCallback(async (rewardId: string) => {
    const currentUserId = userId || user?.id
    if (!currentUserId) return
    
    try {
      await pointsRepository.purchaseReward(currentUserId, rewardId)
      await initializePointsSystem() // Refresh data
      setShowRewardModal(false)
      setSelectedReward(null)
    } catch (error) {
      console.error('Failed to purchase reward:', error)
    }
  }, [userId, user, initializePointsSystem])

  // Helper functions
  const getTransactionIcon = (transaction: PointsTransaction) => {
    switch (transaction.category) {
      case 'lesson': return <BookOpen className="w-4 h-4" />
      case 'exercise': return <Code className="w-4 h-4" />
      case 'quiz': return <Target className="w-4 h-4" />
      case 'achievement': return <Trophy className="w-4 h-4" />
      case 'streak': return <Flame className="w-4 h-4" />
      case 'social': return <Heart className="w-4 h-4" />
      default: return <Coins className="w-4 h-4" />
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 border-gray-300'
      case 'rare': return 'text-blue-600 border-blue-300'
      case 'epic': return 'text-purple-600 border-purple-300'
      case 'legendary': return 'text-yellow-600 border-yellow-300'
      default: return 'text-gray-600 border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!pointsStats) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No points data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Coins className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Points System</h3>
              <p className="text-sm text-gray-500">Track your learning progress</p>
            </div>
          </div>
          {animatingPoints && (
            <div className="animate-bounce text-green-600 font-bold text-lg">
              +{animatingPoints}
            </div>
          )}
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pointsStats.currentBalance}</div>
            <div className="text-xs text-gray-500">Current Balance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{pointsStats.totalEarned}</div>
            <div className="text-xs text-gray-500">Total Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{pointsStats.currentStreak}</div>
            <div className="text-xs text-gray-500">Current Streak</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${pointsStats.level.color}`}>
              {pointsStats.level.badge}
            </div>
            <div className="text-xs text-gray-500">{pointsStats.level.name}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'transactions', label: 'Transactions', icon: Clock, show: showTransactions },
            { id: 'rewards', label: 'Rewards', icon: Gift, show: showRewards },
            { id: 'levels', label: 'Levels', icon: Trophy, show: showLevels }
          ].filter(tab => tab.show !== false).map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Level Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Level {pointsStats.level.level}: {pointsStats.level.name}
                </span>
                {pointsStats.nextLevel && (
                  <span className="text-sm text-gray-500">
                    {pointsStats.nextLevel.minPoints - pointsStats.currentBalance} points to next level
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(pointsStats.progressToNext, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {transactions.slice(0, 5).map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-1 rounded ${transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {getTransactionIcon(transaction)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{transaction.reason}</div>
                        <div className="text-xs text-gray-500">
                          {transaction.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900">Transaction History</h4>
              <div className="text-sm text-gray-500">
                {transactions.length} transactions
              </div>
            </div>
            <div className="space-y-2">
              {transactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {getTransactionIcon(transaction)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{transaction.reason}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {transaction.category} • {transaction.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900">Available Rewards</h4>
              <div className="text-sm text-gray-500">
                Balance: {pointsStats.currentBalance} points
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map(reward => (
                <div key={reward.id} className={`border-2 rounded-lg p-4 transition-all ${
                  reward.owned ? 'bg-green-50 border-green-200' : 
                  reward.cost <= pointsStats.currentBalance ? 'hover:shadow-md cursor-pointer' : 'opacity-50'
                } ${getRarityColor(reward.rarity)}`}
                onClick={() => {
                  if (!reward.owned && reward.cost <= pointsStats.currentBalance) {
                    setSelectedReward(reward)
                    setShowRewardModal(true)
                  }
                }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl">{reward.icon}</div>
                    <div className="flex items-center space-x-1">
                      {reward.owned ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : reward.cost <= pointsStats.currentBalance ? (
                        <Unlock className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="mb-2">
                    <h5 className="font-medium text-gray-900">{reward.name}</h5>
                    <p className="text-xs text-gray-500 capitalize">{reward.category} • {reward.rarity}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <Coins className="w-4 h-4" />
                      <span className="font-medium">{reward.cost}</span>
                    </div>
                    {reward.owned && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Owned
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'levels' && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Level System</h4>
            <div className="space-y-3">
              {levels.map(level => {
                const isCurrentLevel = level.level === pointsStats.level.level
                const isUnlocked = pointsStats.currentBalance >= level.minPoints
                
                return (
                  <div key={level.level} className={`border rounded-lg p-4 ${
                    isCurrentLevel ? 'border-blue-500 bg-blue-50' : 
                    isUnlocked ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`text-3xl ${level.color}`}>
                          {level.badge}
                        </div>
                        <div>
                          <h5 className={`font-medium ${
                            isCurrentLevel ? 'text-blue-900' : isUnlocked ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            Level {level.level}: {level.name}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {level.minPoints} - {level.maxPoints === Infinity ? '∞' : level.maxPoints} points
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {isCurrentLevel && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                        {isUnlocked && !isCurrentLevel && level.level < pointsStats.level.level && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Rewards:</p>
                      <div className="flex flex-wrap gap-1">
                        {level.rewards.map((reward, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {reward}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reward Purchase Modal */}
      {showRewardModal && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Purchase Reward</h3>
              <button
                onClick={() => {
                  setShowRewardModal(false)
                  setSelectedReward(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{selectedReward.icon}</div>
              <h4 className="text-xl font-medium text-gray-900 mb-2">{selectedReward.name}</h4>
              <p className="text-gray-600 mb-4">{selectedReward.description}</p>
              
              <div className="flex items-center justify-center space-x-2 text-yellow-600 text-lg font-bold">
                <Coins className="w-5 h-5" />
                <span>{selectedReward.cost} points</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRewardModal(false)
                  setSelectedReward(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => purchaseReward(selectedReward.id)}
                disabled={selectedReward.cost > pointsStats.currentBalance}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PointsSystem