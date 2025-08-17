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
    
    // Mock data - in real app, this would come from API
    const mockLevels: PointsLevel[] = [
      { level: 1, name: 'Novice', minPoints: 0, maxPoints: 99, rewards: ['Basic Avatar'], badge: '🌱', color: 'text-green-600' },
      { level: 2, name: 'Learner', minPoints: 100, maxPoints: 249, rewards: ['Custom Theme'], badge: '📚', color: 'text-blue-600' },
      { level: 3, name: 'Explorer', minPoints: 250, maxPoints: 499, rewards: ['Extra Hints'], badge: '🔍', color: 'text-purple-600' },
      { level: 4, name: 'Scholar', minPoints: 500, maxPoints: 999, rewards: ['Priority Support'], badge: '🎓', color: 'text-indigo-600' },
      { level: 5, name: 'Expert', minPoints: 1000, maxPoints: 1999, rewards: ['Advanced Features'], badge: '⭐', color: 'text-yellow-600' },
      { level: 6, name: 'Master', minPoints: 2000, maxPoints: 4999, rewards: ['Mentor Badge'], badge: '👑', color: 'text-orange-600' },
      { level: 7, name: 'Legend', minPoints: 5000, maxPoints: Infinity, rewards: ['Hall of Fame'], badge: '🏆', color: 'text-red-600' }
    ]
    
    const mockTransactions: PointsTransaction[] = [
      {
        id: '1',
        type: 'earned',
        amount: 50,
        reason: 'Completed JavaScript Basics lesson',
        category: 'lesson',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        metadata: { lessonId: 'js-basics-1' }
      },
      {
        id: '2',
        type: 'earned',
        amount: 25,
        reason: 'Perfect score on Arrays quiz',
        category: 'quiz',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        metadata: { quizId: 'arrays-quiz', score: 100 }
      },
      {
        id: '3',
        type: 'bonus',
        amount: 100,
        reason: '7-day learning streak bonus',
        category: 'streak',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        metadata: { streakDays: 7 }
      },
      {
        id: '4',
        type: 'spent',
        amount: -30,
        reason: 'Purchased hint for coding exercise',
        category: 'exercise',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        metadata: { exerciseId: 'loops-challenge' }
      },
      {
        id: '5',
        type: 'earned',
        amount: 75,
        reason: 'Achievement unlocked: First 100 Points',
        category: 'achievement',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        metadata: { achievementId: 'first-100' }
      }
    ]
    
    const mockRewards: PointsReward[] = [
      {
        id: '1',
        name: 'Dark Theme',
        description: 'Unlock the sleek dark theme for your learning environment',
        cost: 100,
        type: 'cosmetic',
        icon: '🌙',
        available: true,
        owned: false,
        category: 'Themes',
        rarity: 'common'
      },
      {
        id: '2',
        name: 'Extra Hint',
        description: 'Get an additional hint for any coding exercise',
        cost: 50,
        type: 'functional',
        icon: '💡',
        available: true,
        owned: false,
        category: 'Learning Aids',
        rarity: 'common'
      },
      {
        id: '3',
        name: 'Premium Avatar',
        description: 'Unlock exclusive avatar customization options',
        cost: 200,
        type: 'cosmetic',
        icon: '👤',
        available: true,
        owned: false,
        category: 'Avatars',
        rarity: 'rare'
      },
      {
        id: '4',
        name: 'Skip Exercise',
        description: 'Skip one difficult exercise and still get partial credit',
        cost: 150,
        type: 'functional',
        icon: '⏭️',
        available: true,
        owned: false,
        category: 'Learning Aids',
        rarity: 'rare'
      },
      {
        id: '5',
        name: 'Bonus Lesson',
        description: 'Unlock exclusive advanced content',
        cost: 500,
        type: 'content',
        icon: '📖',
        available: licenseInfo?.type === 'premium',
        owned: false,
        category: 'Content',
        rarity: 'epic'
      },
      {
        id: '6',
        name: 'Mentor Badge',
        description: 'Show off your expertise with a special mentor badge',
        cost: 1000,
        type: 'social',
        icon: '🏅',
        available: true,
        owned: false,
        category: 'Badges',
        rarity: 'legendary'
      }
    ]
    
    // Calculate current stats
    const totalEarned = mockTransactions
      .filter(t => t.type === 'earned' || t.type === 'bonus')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalSpent = Math.abs(mockTransactions
      .filter(t => t.type === 'spent' || t.type === 'penalty')
      .reduce((sum, t) => sum + t.amount, 0))
    
    const currentBalance = totalEarned - totalSpent
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEarned = mockTransactions
      .filter(t => (t.type === 'earned' || t.type === 'bonus') && t.timestamp >= today)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const weeklyEarned = mockTransactions
      .filter(t => (t.type === 'earned' || t.type === 'bonus') && t.timestamp >= weekAgo)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const monthlyEarned = mockTransactions
      .filter(t => (t.type === 'earned' || t.type === 'bonus') && t.timestamp >= monthAgo)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const currentLevel = mockLevels.find(level => 
      currentBalance >= level.minPoints && currentBalance <= level.maxPoints
    ) || mockLevels[0]
    
    const nextLevel = mockLevels.find(level => level.level === currentLevel.level + 1) || null
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
      currentStreak: 7, // Mock streak
      longestStreak: 12, // Mock longest streak
      level: currentLevel,
      nextLevel,
      progressToNext
    }
    
    setPointsStats(stats)
    setTransactions(mockTransactions)
    setRewards(mockRewards)
    setLevels(mockLevels)
    setLoading(false)
  }, [user, licenseInfo])

  // Award points (for demo purposes)
  const awardPoints = useCallback((amount: number, reason: string, category: PointsTransaction['category']) => {
    const newTransaction: PointsTransaction = {
      id: Date.now().toString(),
      type: 'earned',
      amount,
      reason,
      category,
      timestamp: new Date()
    }
    
    setTransactions(prev => [newTransaction, ...prev])
    setAnimatingPoints(amount)
    
    // Update stats
    if (pointsStats) {
      setPointsStats(prev => prev ? {
        ...prev,
        totalEarned: prev.totalEarned + amount,
        currentBalance: prev.currentBalance + amount,
        todayEarned: prev.todayEarned + amount
      } : null)
    }
    
    // Clear animation after delay
    setTimeout(() => setAnimatingPoints(null), 2000)
  }, [pointsStats])

  // Purchase reward
  const purchaseReward = useCallback((reward: PointsReward) => {
    if (!pointsStats || pointsStats.currentBalance < reward.cost) return
    
    const newTransaction: PointsTransaction = {
      id: Date.now().toString(),
      type: 'spent',
      amount: -reward.cost,
      reason: `Purchased ${reward.name}`,
      category: 'bonus',
      timestamp: new Date(),
      metadata: { rewardId: reward.id }
    }
    
    setTransactions(prev => [newTransaction, ...prev])
    setRewards(prev => prev.map(r => 
      r.id === reward.id ? { ...r, owned: true } : r
    ))
    
    // Update stats
    setPointsStats(prev => prev ? {
      ...prev,
      totalSpent: prev.totalSpent + reward.cost,
      currentBalance: prev.currentBalance - reward.cost
    } : null)
    
    setShowRewardModal(false)
    setSelectedReward(null)
  }, [pointsStats])

  // Get transaction icon
  const getTransactionIcon = (transaction: PointsTransaction) => {
    switch (transaction.category) {
      case 'lesson': return <BookOpen className="w-4 h-4" />
      case 'exercise': return <Code className="w-4 h-4" />
      case 'quiz': return <Target className="w-4 h-4" />
      case 'achievement': return <Trophy className="w-4 h-4" />
      case 'streak': return <Flame className="w-4 h-4" />
      case 'social': return <Heart className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  // Get rarity color
  const getRarityColor = (rarity: PointsReward['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-secondary-300 bg-secondary-50'
      case 'rare': return 'border-blue-300 bg-blue-50'
      case 'epic': return 'border-purple-300 bg-purple-50'
      case 'legendary': return 'border-yellow-300 bg-yellow-50'
      default: return 'border-secondary-300 bg-secondary-50'
    }
  }

  if (loading || !pointsStats) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-4 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{pointsStats.level.badge}</div>
            <div>
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4" />
                <span className="font-bold text-lg">{pointsStats.currentBalance}</span>
                {animatingPoints && (
                  <span className="text-green-300 font-bold animate-bounce">+{animatingPoints}</span>
                )}
              </div>
              <div className="text-sm opacity-90">{pointsStats.level.name}</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm opacity-90">Today</div>
            <div className="font-bold">+{pointsStats.todayEarned}</div>
          </div>
        </div>
        
        {pointsStats.nextLevel && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Level {pointsStats.level.level}</span>
              <span>Level {pointsStats.nextLevel.level}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${pointsStats.progressToNext}%` }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary-600" />
            Points System
          </h2>
          
          {animatingPoints && (
            <div className="flex items-center space-x-2 bg-success-100 text-success-700 px-3 py-1 rounded-full animate-bounce">
              <Plus className="w-4 h-4" />
              <span className="font-bold">{animatingPoints}</span>
            </div>
          )}
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-primary-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">{pointsStats.currentBalance}</div>
            <div className="text-sm text-secondary-600">Current Balance</div>
          </div>
          
          <div className="text-center p-3 bg-success-50 rounded-lg">
            <div className="text-2xl font-bold text-success-600">{pointsStats.todayEarned}</div>
            <div className="text-sm text-secondary-600">Today</div>
          </div>
          
          <div className="text-center p-3 bg-warning-50 rounded-lg">
            <div className="text-2xl font-bold text-warning-600">{pointsStats.currentStreak}</div>
            <div className="text-sm text-secondary-600">Day Streak</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{pointsStats.level.level}</div>
            <div className="text-sm text-secondary-600">Level</div>
          </div>
        </div>
        
        {/* Level Progress */}
        <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{pointsStats.level.badge}</span>
              <div>
                <div className={`font-bold ${pointsStats.level.color}`}>{pointsStats.level.name}</div>
                <div className="text-sm text-secondary-600">Level {pointsStats.level.level}</div>
              </div>
            </div>
            
            {pointsStats.nextLevel && (
              <div className="text-right">
                <div className="text-sm text-secondary-600">Next: {pointsStats.nextLevel.name}</div>
                <div className="text-xs text-secondary-500">
                  {pointsStats.nextLevel.minPoints - pointsStats.currentBalance} points to go
                </div>
              </div>
            )}
          </div>
          
          {pointsStats.nextLevel && (
            <div className="w-full bg-secondary-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${pointsStats.progressToNext}%` }}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'transactions', label: 'History', icon: Clock },
            { id: 'rewards', label: 'Rewards', icon: Gift },
            { id: 'levels', label: 'Levels', icon: Trophy }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="font-semibold text-secondary-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => awardPoints(25, 'Demo lesson completed', 'lesson')}
                  className="p-3 bg-primary-50 hover:bg-primary-100 rounded-lg text-center transition-colors"
                >
                  <BookOpen className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                  <div className="text-sm font-medium">Complete Lesson</div>
                  <div className="text-xs text-secondary-600">+25 pts</div>
                </button>
                
                <button
                  onClick={() => awardPoints(50, 'Demo quiz perfect score', 'quiz')}
                  className="p-3 bg-success-50 hover:bg-success-100 rounded-lg text-center transition-colors"
                >
                  <Target className="w-6 h-6 text-success-600 mx-auto mb-1" />
                  <div className="text-sm font-medium">Ace Quiz</div>
                  <div className="text-xs text-secondary-600">+50 pts</div>
                </button>
                
                <button
                  onClick={() => awardPoints(100, 'Demo streak bonus', 'streak')}
                  className="p-3 bg-warning-50 hover:bg-warning-100 rounded-lg text-center transition-colors"
                >
                  <Flame className="w-6 h-6 text-warning-600 mx-auto mb-1" />
                  <div className="text-sm font-medium">Streak Bonus</div>
                  <div className="text-xs text-secondary-600">+100 pts</div>
                </button>
                
                <button
                  onClick={() => awardPoints(200, 'Demo achievement unlocked', 'achievement')}
                  className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors"
                >
                  <Trophy className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <div className="text-sm font-medium">Achievement</div>
                  <div className="text-xs text-secondary-600">+200 pts</div>
                </button>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div>
              <h3 className="font-semibold text-secondary-900 mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {transactions.slice(0, 5).map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'earned' || transaction.type === 'bonus'
                          ? 'bg-success-100 text-success-600'
                          : 'bg-error-100 text-error-600'
                      }`}>
                        {getTransactionIcon(transaction)}
                      </div>
                      <div>
                        <div className="font-medium text-secondary-900">{transaction.reason}</div>
                        <div className="text-sm text-secondary-600">
                          {transaction.timestamp.toLocaleDateString()} at {transaction.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold ${
                      transaction.type === 'earned' || transaction.type === 'bonus'
                        ? 'text-success-600'
                        : 'text-error-600'
                    }`}>
                      {transaction.type === 'earned' || transaction.type === 'bonus' ? '+' : ''}{transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            {transactions.map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${
                    transaction.type === 'earned' || transaction.type === 'bonus'
                      ? 'bg-success-100 text-success-600'
                      : 'bg-error-100 text-error-600'
                  }`}>
                    {getTransactionIcon(transaction)}
                  </div>
                  <div>
                    <div className="font-medium text-secondary-900">{transaction.reason}</div>
                    <div className="text-sm text-secondary-600 capitalize">{transaction.category} • {transaction.type}</div>
                    <div className="text-xs text-secondary-500">
                      {transaction.timestamp.toLocaleDateString()} at {transaction.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className={`text-xl font-bold ${
                  transaction.type === 'earned' || transaction.type === 'bonus'
                    ? 'text-success-600'
                    : 'text-error-600'
                }`}>
                  {transaction.type === 'earned' || transaction.type === 'bonus' ? '+' : ''}{transaction.amount}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'rewards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map(reward => (
              <div key={reward.id} className={`p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                reward.owned ? 'bg-success-50 border-success-200' : getRarityColor(reward.rarity)
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{reward.icon}</div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reward.rarity === 'common' ? 'bg-secondary-100 text-secondary-700' :
                    reward.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                    reward.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {reward.rarity}
                  </div>
                </div>
                
                <h4 className="font-semibold text-secondary-900 mb-1">{reward.name}</h4>
                <p className="text-sm text-secondary-600 mb-3">{reward.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-primary-600">
                    <Coins className="w-4 h-4" />
                    <span className="font-bold">{reward.cost}</span>
                  </div>
                  
                  {reward.owned ? (
                    <div className="flex items-center space-x-1 text-success-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Owned</span>
                    </div>
                  ) : reward.available ? (
                    <button
                      onClick={() => {
                        setSelectedReward(reward)
                        setShowRewardModal(true)
                      }}
                      disabled={pointsStats.currentBalance < reward.cost}
                      className="px-3 py-1 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 text-white text-sm rounded-lg transition-colors"
                    >
                      {pointsStats.currentBalance >= reward.cost ? 'Purchase' : 'Not enough'}
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1 text-secondary-500">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm">Locked</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'levels' && (
          <div className="space-y-4">
            {levels.map(level => (
              <div key={level.level} className={`p-4 border-2 rounded-lg ${
                level.level === pointsStats.level.level
                  ? 'border-primary-300 bg-primary-50'
                  : level.level < pointsStats.level.level
                  ? 'border-success-300 bg-success-50'
                  : 'border-secondary-200 bg-secondary-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{level.badge}</div>
                    <div>
                      <h3 className={`text-xl font-bold ${level.color}`}>{level.name}</h3>
                      <p className="text-secondary-600">Level {level.level}</p>
                      <p className="text-sm text-secondary-500">
                        {level.minPoints} - {level.maxPoints === Infinity ? '∞' : level.maxPoints} points
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {level.level === pointsStats.level.level && (
                      <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                        Current Level
                      </div>
                    )}
                    {level.level < pointsStats.level.level && (
                      <div className="bg-success-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                        Completed
                      </div>
                    )}
                    <div className="text-sm text-secondary-600">
                      Rewards: {level.rewards.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Reward Purchase Modal */}
      {showRewardModal && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{selectedReward.icon}</div>
              <h3 className="text-xl font-bold text-secondary-900">{selectedReward.name}</h3>
              <p className="text-secondary-600 mt-2">{selectedReward.description}</p>
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Coins className="w-5 h-5 text-primary-600" />
              <span className="text-2xl font-bold text-primary-600">{selectedReward.cost}</span>
              <span className="text-secondary-600">points</span>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRewardModal(false)
                  setSelectedReward(null)
                }}
                className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => purchaseReward(selectedReward)}
                disabled={pointsStats.currentBalance < selectedReward.cost}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 text-white rounded-lg transition-colors"
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