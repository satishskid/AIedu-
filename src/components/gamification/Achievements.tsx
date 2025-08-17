import React, { useState, useEffect, useCallback } from 'react'
import {
  Trophy,
  Star,
  Award,
  Medal,
  Crown,
  Target,
  Zap,
  Flame,
  BookOpen,
  Code,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  Lock,
  Unlock,
  Gift,
  Sparkles,
  Heart,
  Brain,
  Rocket,
  Shield,
  Gem,
  Sun,
  Moon,
  Coffee,
  Mountain,
  Flag,
  Compass,
  Map,
  Key,
  Diamond,
  Sword,
  Wand2,
  Search,
  Filter,
  SortAsc,
  Grid,
  List,
  Eye,
  Share2,
  Download,
  ExternalLink
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useLicenseStore } from '../../store/licenseStore'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'learning' | 'social' | 'streak' | 'mastery' | 'special' | 'milestone'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  unlocked: boolean
  unlockedAt?: Date
  progress: number
  maxProgress: number
  requirements: string[]
  rewards: string[]
  hidden: boolean
  prerequisite?: string[]
  seasonal?: boolean
  expiresAt?: Date
}

interface AchievementCategory {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  color: string
  achievements: Achievement[]
}

interface AchievementsProps {
  userId?: string
  showProgress?: boolean
  showLocked?: boolean
  compact?: boolean
  category?: string
  className?: string
}

interface AchievementStats {
  totalAchievements: number
  unlockedAchievements: number
  totalPoints: number
  completionRate: number
  recentUnlocks: Achievement[]
  nextToUnlock: Achievement[]
  rareAchievements: Achievement[]
}

export const Achievements: React.FC<AchievementsProps> = ({
  userId,
  showProgress = true,
  showLocked = true,
  compact = false,
  category,
  className = ''
}) => {
  const { user } = useAuthStore()
  const { licenseInfo } = useLicenseStore()
  
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [categories, setCategories] = useState<AchievementCategory[]>([])
  const [stats, setStats] = useState<AchievementStats | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'points' | 'progress'>('name')
  const [filterBy, setFilterBy] = useState<'all' | 'unlocked' | 'locked' | 'in-progress'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newUnlocks, setNewUnlocks] = useState<string[]>([])

  // Initialize achievements data
  useEffect(() => {
    initializeAchievements()
  }, [user])

  const initializeAchievements = useCallback(async () => {
    setLoading(true)
    
    // Mock achievements data
    const mockAchievements: Achievement[] = [
      // Learning Achievements
      {
        id: 'first-lesson',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        category: 'learning',
        rarity: 'common',
        points: 50,
        unlocked: true,
        unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        progress: 1,
        maxProgress: 1,
        requirements: ['Complete 1 lesson'],
        rewards: ['50 points', 'Learner badge'],
        hidden: false
      },
      {
        id: 'lesson-master',
        title: 'Lesson Master',
        description: 'Complete 50 lessons',
        icon: '📚',
        category: 'learning',
        rarity: 'rare',
        points: 500,
        unlocked: false,
        progress: 23,
        maxProgress: 50,
        requirements: ['Complete 50 lessons'],
        rewards: ['500 points', 'Master badge', 'Special theme'],
        hidden: false
      },
      {
        id: 'perfect-score',
        title: 'Perfectionist',
        description: 'Get 100% on 10 quizzes',
        icon: '💯',
        category: 'mastery',
        rarity: 'epic',
        points: 750,
        unlocked: false,
        progress: 7,
        maxProgress: 10,
        requirements: ['Score 100% on 10 quizzes'],
        rewards: ['750 points', 'Perfect badge', 'Bonus content'],
        hidden: false
      },
      
      // Streak Achievements
      {
        id: 'week-streak',
        title: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        category: 'streak',
        rarity: 'common',
        points: 200,
        unlocked: true,
        unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        progress: 7,
        maxProgress: 7,
        requirements: ['Learn for 7 consecutive days'],
        rewards: ['200 points', 'Streak badge'],
        hidden: false
      },
      {
        id: 'month-streak',
        title: 'Monthly Master',
        description: 'Maintain a 30-day learning streak',
        icon: '🏆',
        category: 'streak',
        rarity: 'legendary',
        points: 1500,
        unlocked: false,
        progress: 12,
        maxProgress: 30,
        requirements: ['Learn for 30 consecutive days'],
        rewards: ['1500 points', 'Legend badge', 'Exclusive content'],
        hidden: false,
        prerequisite: ['week-streak']
      },
      
      // Social Achievements
      {
        id: 'helpful-peer',
        title: 'Helpful Peer',
        description: 'Help 5 other students',
        icon: '🤝',
        category: 'social',
        rarity: 'rare',
        points: 300,
        unlocked: false,
        progress: 2,
        maxProgress: 5,
        requirements: ['Help 5 students with questions'],
        rewards: ['300 points', 'Helper badge'],
        hidden: false
      },
      
      // Mastery Achievements
      {
        id: 'code-ninja',
        title: 'Code Ninja',
        description: 'Solve 100 coding challenges',
        icon: '🥷',
        category: 'mastery',
        rarity: 'epic',
        points: 1000,
        unlocked: false,
        progress: 45,
        maxProgress: 100,
        requirements: ['Complete 100 coding challenges'],
        rewards: ['1000 points', 'Ninja badge', 'Advanced challenges'],
        hidden: false
      },
      
      // Special Achievements
      {
        id: 'early-bird',
        title: 'Early Bird',
        description: 'Study before 8 AM for 5 days',
        icon: '🌅',
        category: 'special',
        rarity: 'rare',
        points: 400,
        unlocked: false,
        progress: 3,
        maxProgress: 5,
        requirements: ['Study before 8 AM for 5 days'],
        rewards: ['400 points', 'Early Bird badge'],
        hidden: false
      },
      {
        id: 'night-owl',
        title: 'Night Owl',
        description: 'Study after 10 PM for 5 days',
        icon: '🦉',
        category: 'special',
        rarity: 'rare',
        points: 400,
        unlocked: false,
        progress: 1,
        maxProgress: 5,
        requirements: ['Study after 10 PM for 5 days'],
        rewards: ['400 points', 'Night Owl badge'],
        hidden: false
      },
      
      // Milestone Achievements
      {
        id: 'first-100-points',
        title: 'Century Club',
        description: 'Earn your first 100 points',
        icon: '💯',
        category: 'milestone',
        rarity: 'common',
        points: 100,
        unlocked: true,
        unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        progress: 100,
        maxProgress: 100,
        requirements: ['Earn 100 points'],
        rewards: ['100 bonus points'],
        hidden: false
      },
      {
        id: 'thousand-points',
        title: 'Point Master',
        description: 'Earn 1000 points',
        icon: '💎',
        category: 'milestone',
        rarity: 'epic',
        points: 500,
        unlocked: false,
        progress: 650,
        maxProgress: 1000,
        requirements: ['Earn 1000 points'],
        rewards: ['500 bonus points', 'Diamond badge'],
        hidden: false
      },
      
      // Hidden/Secret Achievements
      {
        id: 'secret-explorer',
        title: '???',
        description: 'A mysterious achievement awaits...',
        icon: '❓',
        category: 'special',
        rarity: 'legendary',
        points: 2000,
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        requirements: ['???'],
        rewards: ['???'],
        hidden: true
      }
    ]
    
    // Create categories
    const mockCategories: AchievementCategory[] = [
      {
        id: 'learning',
        name: 'Learning',
        description: 'Achievements for completing lessons and courses',
        icon: BookOpen,
        color: 'text-blue-600',
        achievements: mockAchievements.filter(a => a.category === 'learning')
      },
      {
        id: 'mastery',
        name: 'Mastery',
        description: 'Achievements for demonstrating skill mastery',
        icon: Target,
        color: 'text-purple-600',
        achievements: mockAchievements.filter(a => a.category === 'mastery')
      },
      {
        id: 'streak',
        name: 'Streaks',
        description: 'Achievements for consistent learning',
        icon: Flame,
        color: 'text-orange-600',
        achievements: mockAchievements.filter(a => a.category === 'streak')
      },
      {
        id: 'social',
        name: 'Social',
        description: 'Achievements for community participation',
        icon: Users,
        color: 'text-green-600',
        achievements: mockAchievements.filter(a => a.category === 'social')
      },
      {
        id: 'milestone',
        name: 'Milestones',
        description: 'Achievements for reaching important milestones',
        icon: Flag,
        color: 'text-yellow-600',
        achievements: mockAchievements.filter(a => a.category === 'milestone')
      },
      {
        id: 'special',
        name: 'Special',
        description: 'Unique and rare achievements',
        icon: Sparkles,
        color: 'text-pink-600',
        achievements: mockAchievements.filter(a => a.category === 'special')
      }
    ]
    
    // Calculate stats
    const totalAchievements = mockAchievements.length
    const unlockedAchievements = mockAchievements.filter(a => a.unlocked).length
    const totalPoints = mockAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0)
    const completionRate = (unlockedAchievements / totalAchievements) * 100
    
    const recentUnlocks = mockAchievements
      .filter(a => a.unlocked && a.unlockedAt)
      .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
      .slice(0, 3)
    
    const nextToUnlock = mockAchievements
      .filter(a => !a.unlocked && !a.hidden && a.progress > 0)
      .sort((a, b) => (b.progress / b.maxProgress) - (a.progress / a.maxProgress))
      .slice(0, 3)
    
    const rareAchievements = mockAchievements
      .filter(a => a.unlocked && (a.rarity === 'epic' || a.rarity === 'legendary'))
    
    const achievementStats: AchievementStats = {
      totalAchievements,
      unlockedAchievements,
      totalPoints,
      completionRate,
      recentUnlocks,
      nextToUnlock,
      rareAchievements
    }
    
    setAchievements(mockAchievements)
    setCategories(mockCategories)
    setStats(achievementStats)
    setLoading(false)
  }, [user])

  // Unlock achievement (for demo)
  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => prev.map(achievement => 
      achievement.id === achievementId
        ? {
            ...achievement,
            unlocked: true,
            unlockedAt: new Date(),
            progress: achievement.maxProgress
          }
        : achievement
    ))
    
    setNewUnlocks(prev => [...prev, achievementId])
    
    // Remove from new unlocks after animation
    setTimeout(() => {
      setNewUnlocks(prev => prev.filter(id => id !== achievementId))
    }, 3000)
  }, [])

  // Filter and sort achievements
  const getFilteredAchievements = useCallback(() => {
    let filtered = achievements
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory)
    }
    
    // Filter by status
    switch (filterBy) {
      case 'unlocked':
        filtered = filtered.filter(a => a.unlocked)
        break
      case 'locked':
        filtered = filtered.filter(a => !a.unlocked)
        break
      case 'in-progress':
        filtered = filtered.filter(a => !a.unlocked && a.progress > 0)
        break
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Hide hidden achievements unless unlocked
    if (!showLocked) {
      filtered = filtered.filter(a => !a.hidden || a.unlocked)
    }
    
    // Sort achievements
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'rarity':
        const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 }
        filtered.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])
        break
      case 'points':
        filtered.sort((a, b) => b.points - a.points)
        break
      case 'progress':
        filtered.sort((a, b) => (b.progress / b.maxProgress) - (a.progress / a.maxProgress))
        break
    }
    
    return filtered
  }, [achievements, selectedCategory, filterBy, searchQuery, showLocked, sortBy])

  // Get rarity color
  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-secondary-300 bg-secondary-50 text-secondary-700'
      case 'rare': return 'border-blue-300 bg-blue-50 text-blue-700'
      case 'epic': return 'border-purple-300 bg-purple-50 text-purple-700'
      case 'legendary': return 'border-yellow-300 bg-yellow-50 text-yellow-700'
      default: return 'border-secondary-300 bg-secondary-50 text-secondary-700'
    }
  }

  // Get progress color
  const getProgressColor = (progress: number, maxProgress: number) => {
    const percentage = (progress / maxProgress) * 100
    if (percentage === 100) return 'bg-success-500'
    if (percentage >= 75) return 'bg-warning-500'
    if (percentage >= 50) return 'bg-primary-500'
    return 'bg-secondary-400'
  }

  if (loading || !stats) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary-600" />
            Achievements
          </h3>
          <span className="text-sm text-secondary-600">
            {stats.unlockedAchievements}/{stats.totalAchievements}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          {stats.recentUnlocks.slice(0, 3).map(achievement => (
            <div key={achievement.id} className="text-center p-2 bg-success-50 rounded">
              <div className="text-lg mb-1">{achievement.icon}</div>
              <div className="text-xs font-medium text-success-700 truncate">
                {achievement.title}
              </div>
            </div>
          ))}
        </div>
        
        <div className="w-full bg-secondary-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
        <div className="text-xs text-secondary-600 mt-1 text-center">
          {stats.completionRate.toFixed(1)}% Complete
        </div>
      </div>
    )
  }

  const filteredAchievements = getFilteredAchievements()

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary-600" />
            Achievements
          </h2>
          
          {newUnlocks.length > 0 && (
            <div className="flex items-center space-x-2 bg-success-100 text-success-700 px-3 py-1 rounded-full animate-bounce">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">New Achievement!</span>
            </div>
          )}
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-primary-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">{stats.unlockedAchievements}</div>
            <div className="text-sm text-secondary-600">Unlocked</div>
          </div>
          
          <div className="text-center p-3 bg-success-50 rounded-lg">
            <div className="text-2xl font-bold text-success-600">{stats.totalPoints}</div>
            <div className="text-sm text-secondary-600">Points Earned</div>
          </div>
          
          <div className="text-center p-3 bg-warning-50 rounded-lg">
            <div className="text-2xl font-bold text-warning-600">{stats.completionRate.toFixed(1)}%</div>
            <div className="text-sm text-secondary-600">Complete</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.rareAchievements.length}</div>
            <div className="text-sm text-secondary-600">Rare</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-secondary-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
        
        {/* Recent Unlocks */}
        {stats.recentUnlocks.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium text-secondary-900 mb-2">Recent Unlocks</h3>
            <div className="flex space-x-2">
              {stats.recentUnlocks.map(achievement => (
                <div key={achievement.id} className="flex items-center space-x-2 bg-success-50 px-3 py-1 rounded-full">
                  <span className="text-lg">{achievement.icon}</span>
                  <span className="text-sm font-medium text-success-700">{achievement.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="p-4 border-b border-secondary-200 bg-secondary-50">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          
          {/* Status Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="unlocked">Unlocked</option>
            <option value="locked">Locked</option>
            <option value="in-progress">In Progress</option>
          </select>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="rarity">Sort by Rarity</option>
            <option value="points">Sort by Points</option>
            <option value="progress">Sort by Progress</option>
          </select>
          
          {/* View Mode */}
          <div className="flex border border-secondary-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600 hover:bg-secondary-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-secondary-600 hover:bg-secondary-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Achievements Grid/List */}
      <div className="p-6">
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No achievements found</h3>
            <p className="text-secondary-600">Try adjusting your filters or search query.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map(achievement => (
              <div
                key={achievement.id}
                onClick={() => {
                  setSelectedAchievement(achievement)
                  setShowModal(true)
                }}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  achievement.unlocked
                    ? 'bg-success-50 border-success-200'
                    : achievement.hidden
                    ? 'bg-secondary-100 border-secondary-300'
                    : getRarityColor(achievement.rarity)
                } ${
                  newUnlocks.includes(achievement.id) ? 'animate-pulse ring-2 ring-success-400' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.hidden && !achievement.unlocked ? '❓' : achievement.icon}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      achievement.rarity === 'common' ? 'bg-secondary-100 text-secondary-700' :
                      achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                      achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {achievement.rarity}
                    </div>
                    {achievement.unlocked ? (
                      <CheckCircle className="w-4 h-4 text-success-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-secondary-400" />
                    )}
                  </div>
                </div>
                
                <h4 className="font-semibold text-secondary-900 mb-1">
                  {achievement.hidden && !achievement.unlocked ? '???' : achievement.title}
                </h4>
                <p className="text-sm text-secondary-600 mb-3">
                  {achievement.hidden && !achievement.unlocked ? 'A mysterious achievement awaits...' : achievement.description}
                </p>
                
                {showProgress && !achievement.unlocked && !achievement.hidden && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-secondary-600 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          getProgressColor(achievement.progress, achievement.maxProgress)
                        }`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-primary-600">
                    <Star className="w-4 h-4" />
                    <span className="font-bold">{achievement.points}</span>
                  </div>
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="text-xs text-secondary-500">
                      {achievement.unlockedAt.toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                {!achievement.unlocked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      unlockAchievement(achievement.id)
                    }}
                    className="mt-2 w-full px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded transition-colors"
                  >
                    Unlock (Demo)
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAchievements.map(achievement => (
              <div
                key={achievement.id}
                onClick={() => {
                  setSelectedAchievement(achievement)
                  setShowModal(true)
                }}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  achievement.unlocked
                    ? 'bg-success-50 border-success-200'
                    : achievement.hidden
                    ? 'bg-secondary-100 border-secondary-300'
                    : 'border-secondary-200'
                } ${
                  newUnlocks.includes(achievement.id) ? 'animate-pulse ring-2 ring-success-400' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.hidden && !achievement.unlocked ? '❓' : achievement.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-secondary-900">
                        {achievement.hidden && !achievement.unlocked ? '???' : achievement.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          achievement.rarity === 'common' ? 'bg-secondary-100 text-secondary-700' :
                          achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                          achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {achievement.rarity}
                        </div>
                        <div className="flex items-center space-x-1 text-primary-600">
                          <Star className="w-4 h-4" />
                          <span className="font-bold">{achievement.points}</span>
                        </div>
                        {achievement.unlocked ? (
                          <CheckCircle className="w-4 h-4 text-success-600" />
                        ) : (
                          <Lock className="w-4 h-4 text-secondary-400" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-secondary-600 mb-2">
                      {achievement.hidden && !achievement.unlocked ? 'A mysterious achievement awaits...' : achievement.description}
                    </p>
                    
                    {showProgress && !achievement.unlocked && !achievement.hidden && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="w-full bg-secondary-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                getProgressColor(achievement.progress, achievement.maxProgress)
                              }`}
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-secondary-600">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Achievement Detail Modal */}
      {showModal && selectedAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-4">
              <div className={`text-6xl mb-2 ${selectedAchievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                {selectedAchievement.hidden && !selectedAchievement.unlocked ? '❓' : selectedAchievement.icon}
              </div>
              <h3 className="text-xl font-bold text-secondary-900">
                {selectedAchievement.hidden && !selectedAchievement.unlocked ? '???' : selectedAchievement.title}
              </h3>
              <p className="text-secondary-600 mt-2">
                {selectedAchievement.hidden && !selectedAchievement.unlocked 
                  ? 'A mysterious achievement awaits...' 
                  : selectedAchievement.description
                }
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Rarity and Points */}
              <div className="flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedAchievement.rarity === 'common' ? 'bg-secondary-100 text-secondary-700' :
                  selectedAchievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                  selectedAchievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedAchievement.rarity}
                </div>
                <div className="flex items-center space-x-1 text-primary-600">
                  <Star className="w-5 h-5" />
                  <span className="text-lg font-bold">{selectedAchievement.points}</span>
                  <span className="text-secondary-600">points</span>
                </div>
              </div>
              
              {/* Progress */}
              {!selectedAchievement.unlocked && !selectedAchievement.hidden && (
                <div>
                  <div className="flex justify-between text-sm text-secondary-600 mb-2">
                    <span>Progress</span>
                    <span>{selectedAchievement.progress}/{selectedAchievement.maxProgress}</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        getProgressColor(selectedAchievement.progress, selectedAchievement.maxProgress)
                      }`}
                      style={{ width: `${(selectedAchievement.progress / selectedAchievement.maxProgress) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Requirements */}
              {!selectedAchievement.hidden && (
                <div>
                  <h4 className="font-medium text-secondary-900 mb-2">Requirements:</h4>
                  <ul className="text-sm text-secondary-600 space-y-1">
                    {selectedAchievement.requirements.map((req, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Rewards */}
              {!selectedAchievement.hidden && (
                <div>
                  <h4 className="font-medium text-secondary-900 mb-2">Rewards:</h4>
                  <ul className="text-sm text-secondary-600 space-y-1">
                    {selectedAchievement.rewards.map((reward, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Gift className="w-4 h-4 text-primary-600" />
                        <span>{reward}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Unlock Date */}
              {selectedAchievement.unlocked && selectedAchievement.unlockedAt && (
                <div className="text-center text-sm text-secondary-600">
                  Unlocked on {selectedAchievement.unlockedAt.toLocaleDateString()}
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedAchievement(null)
                }}
                className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                Close
              </button>
              {!selectedAchievement.unlocked && (
                <button
                  onClick={() => {
                    unlockAchievement(selectedAchievement.id)
                    setShowModal(false)
                    setSelectedAchievement(null)
                  }}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Unlock (Demo)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Achievements