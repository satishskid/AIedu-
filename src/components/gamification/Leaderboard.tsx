import React, { useState, useEffect, useCallback } from 'react'
import {
  Trophy,
  Medal,
  Crown,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Award,
  Target,
  Flame,
  Zap,
  BookOpen,
  Code,
  Clock,
  MapPin,
  Globe,
  School,
  User,
  ChevronUp,
  ChevronDown,
  Eye,
  Share2,
  Download,
  ExternalLink,
  MoreHorizontal,
  Settings,
  Info
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useLicenseStore } from '../../store/licenseStore'

interface LeaderboardEntry {
  id: string
  userId: string
  username: string
  displayName: string
  avatar?: string
  points: number
  rank: number
  previousRank?: number
  level: number
  achievements: number
  streak: number
  lessonsCompleted: number
  timeSpent: number // in minutes
  lastActive: Date
  country?: string
  school?: string
  grade?: string
  isCurrentUser?: boolean
  badges: string[]
  specialty?: string
  joinedAt: Date
}

interface LeaderboardProps {
  type?: 'global' | 'school' | 'class' | 'friends'
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time'
  category?: 'points' | 'achievements' | 'streak' | 'lessons'
  limit?: number
  showCurrentUser?: boolean
  compact?: boolean
  className?: string
}

interface LeaderboardStats {
  totalUsers: number
  averagePoints: number
  topStreak: number
  mostActive: string
  newThisWeek: number
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  type = 'global',
  timeframe = 'weekly',
  category = 'points',
  limit = 50,
  showCurrentUser = true,
  compact = false,
  className = ''
}) => {
  const { user } = useAuthStore()
  const { licenseInfo } = useLicenseStore()
  
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState<LeaderboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Initialize leaderboard data
  useEffect(() => {
    loadLeaderboard()
  }, [type, timeframe, category, user])

  const loadLeaderboard = useCallback(async () => {
    setLoading(true)
    
    // Mock leaderboard data
    const mockEntries: LeaderboardEntry[] = [
      {
        id: '1',
        userId: 'user1',
        username: 'codemaster_alex',
        displayName: 'Alex Chen',
        avatar: '👨‍💻',
        points: 15420,
        rank: 1,
        previousRank: 2,
        level: 25,
        achievements: 47,
        streak: 28,
        lessonsCompleted: 156,
        timeSpent: 2340, // 39 hours
        lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        country: 'USA',
        school: 'MIT',
        grade: 'Graduate',
        badges: ['🏆', '🔥', '💎', '🎯'],
        specialty: 'Machine Learning',
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)
      },
      {
        id: '2',
        userId: user?.id || 'current-user',
        username: user?.email?.split('@')[0] || 'student',
        displayName: user?.name || 'Current User',
        avatar: '👤',
        points: 12850,
        rank: 2,
        previousRank: 1,
        level: 22,
        achievements: 38,
        streak: 15,
        lessonsCompleted: 134,
        timeSpent: 1980, // 33 hours
        lastActive: new Date(),
        country: 'USA',
        school: 'Local High School',
        grade: '12th',
        isCurrentUser: true,
        badges: ['🏆', '🔥', '⭐'],
        specialty: 'Web Development',
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60)
      },
      {
        id: '3',
        userId: 'user3',
        username: 'python_ninja',
        displayName: 'Sarah Kim',
        avatar: '👩‍💻',
        points: 11200,
        rank: 3,
        previousRank: 4,
        level: 20,
        achievements: 35,
        streak: 22,
        lessonsCompleted: 128,
        timeSpent: 1750,
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        country: 'Canada',
        school: 'University of Toronto',
        grade: 'Sophomore',
        badges: ['🏆', '🐍', '⭐'],
        specialty: 'Data Science',
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 75)
      },
      {
        id: '4',
        userId: 'user4',
        username: 'js_wizard',
        displayName: 'Mike Johnson',
        avatar: '🧙‍♂️',
        points: 10800,
        rank: 4,
        previousRank: 3,
        level: 19,
        achievements: 32,
        streak: 18,
        lessonsCompleted: 115,
        timeSpent: 1650,
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        country: 'UK',
        school: 'Oxford University',
        grade: 'Junior',
        badges: ['🏆', '⚡', '📚'],
        specialty: 'Frontend Development',
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45)
      },
      {
        id: '5',
        userId: 'user5',
        username: 'react_queen',
        displayName: 'Emma Davis',
        avatar: '👸',
        points: 9950,
        rank: 5,
        previousRank: 6,
        level: 18,
        achievements: 29,
        streak: 12,
        lessonsCompleted: 102,
        timeSpent: 1520,
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        country: 'Australia',
        school: 'Sydney University',
        grade: 'Senior',
        badges: ['⚛️', '👑', '📚'],
        specialty: 'React Development',
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
      }
    ]
    
    // Add more mock entries
    for (let i = 6; i <= 50; i++) {
      mockEntries.push({
        id: `${i}`,
        userId: `user${i}`,
        username: `student_${i}`,
        displayName: `Student ${i}`,
        avatar: ['👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍💻', '👩‍💻'][Math.floor(Math.random() * 5)],
        points: Math.floor(Math.random() * 8000) + 1000,
        rank: i,
        previousRank: i + Math.floor(Math.random() * 6) - 3,
        level: Math.floor(Math.random() * 15) + 5,
        achievements: Math.floor(Math.random() * 25) + 5,
        streak: Math.floor(Math.random() * 20),
        lessonsCompleted: Math.floor(Math.random() * 80) + 20,
        timeSpent: Math.floor(Math.random() * 1000) + 200,
        lastActive: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7),
        country: ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France'][Math.floor(Math.random() * 6)],
        school: 'Various Schools',
        badges: ['📚', '⭐', '🎯'].slice(0, Math.floor(Math.random() * 3) + 1),
        specialty: ['Web Dev', 'Data Science', 'Mobile Dev', 'AI/ML'][Math.floor(Math.random() * 4)],
        joinedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 180)
      })
    }
    
    // Sort by selected category
    mockEntries.sort((a, b) => {
      switch (category) {
        case 'points': return b.points - a.points
        case 'achievements': return b.achievements - a.achievements
        case 'streak': return b.streak - a.streak
        case 'lessons': return b.lessonsCompleted - a.lessonsCompleted
        default: return b.points - a.points
      }
    })
    
    // Update ranks
    mockEntries.forEach((entry, index) => {
      entry.rank = index + 1
    })
    
    // Calculate stats
    const totalUsers = mockEntries.length
    const averagePoints = Math.floor(mockEntries.reduce((sum, entry) => sum + entry.points, 0) / totalUsers)
    const topStreak = Math.max(...mockEntries.map(entry => entry.streak))
    const mostActive = mockEntries.reduce((prev, current) => 
      current.timeSpent > prev.timeSpent ? current : prev
    ).displayName
    const newThisWeek = mockEntries.filter(entry => 
      entry.joinedAt > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
    ).length
    
    const leaderboardStats: LeaderboardStats = {
      totalUsers,
      averagePoints,
      topStreak,
      mostActive,
      newThisWeek
    }
    
    // Find current user rank
    const currentUser = mockEntries.find(entry => entry.isCurrentUser)
    setCurrentUserRank(currentUser?.rank || null)
    
    setEntries(mockEntries.slice(0, limit))
    setStats(leaderboardStats)
    setLoading(false)
  }, [type, timeframe, category, limit, user])

  const refreshLeaderboard = useCallback(async () => {
    setRefreshing(true)
    await loadLeaderboard()
    setRefreshing(false)
  }, [loadLeaderboard])

  // Get rank change indicator
  const getRankChange = (current: number, previous?: number) => {
    if (!previous) return null
    const change = previous - current
    if (change > 0) return { type: 'up', value: change }
    if (change < 0) return { type: 'down', value: Math.abs(change) }
    return { type: 'same', value: 0 }
  }

  // Get rank badge
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-50' }
      case 2: return { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-50' }
      case 3: return { icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' }
      default: return { icon: Trophy, color: 'text-secondary-500', bg: 'bg-secondary-50' }
    }
  }

  // Format time spent
  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // Format last active
  const formatLastActive = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  // Filter entries based on search
  const filteredEntries = entries.filter(entry => 
    entry.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            Leaderboard
          </h3>
          <span className="text-sm text-secondary-600">
            {currentUserRank ? `#${currentUserRank}` : 'Unranked'}
          </span>
        </div>
        
        <div className="space-y-2">
          {filteredEntries.slice(0, 5).map((entry, index) => {
            const rankBadge = getRankBadge(entry.rank)
            const RankIcon = rankBadge.icon
            
            return (
              <div key={entry.id} className={`flex items-center space-x-3 p-2 rounded ${
                entry.isCurrentUser ? 'bg-primary-50 border border-primary-200' : 'hover:bg-secondary-50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${rankBadge.bg}`}>
                  {entry.rank <= 3 ? (
                    <RankIcon className={`w-3 h-3 ${rankBadge.color}`} />
                  ) : (
                    <span className="text-xs font-bold text-secondary-600">#{entry.rank}</span>
                  )}
                </div>
                
                <div className="text-lg">{entry.avatar}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-secondary-900 truncate">{entry.displayName}</div>
                  <div className="text-xs text-secondary-600">{entry.points.toLocaleString()} pts</div>
                </div>
                
                {entry.isCurrentUser && (
                  <div className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                    You
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary-600" />
            Leaderboard
          </h2>
          
          <button
            onClick={refreshLeaderboard}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="text-center p-3 bg-primary-50 rounded-lg">
            <div className="text-lg font-bold text-primary-600">{stats.totalUsers}</div>
            <div className="text-xs text-secondary-600">Total Users</div>
          </div>
          
          <div className="text-center p-3 bg-success-50 rounded-lg">
            <div className="text-lg font-bold text-success-600">{stats.averagePoints.toLocaleString()}</div>
            <div className="text-xs text-secondary-600">Avg Points</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{stats.topStreak}</div>
            <div className="text-xs text-secondary-600">Top Streak</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600 truncate">{stats.mostActive}</div>
            <div className="text-xs text-secondary-600">Most Active</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{stats.newThisWeek}</div>
            <div className="text-xs text-secondary-600">New This Week</div>
          </div>
        </div>
        
        {/* Current User Rank */}
        {currentUserRank && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-700">Your current rank:</span>
              <span className="font-bold text-primary-600">#{currentUserRank}</span>
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
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Type Filter */}
          <select
            value={type}
            className="px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled
          >
            <option value="global">Global</option>
            <option value="school">School</option>
            <option value="class">Class</option>
            <option value="friends">Friends</option>
          </select>
          
          {/* Timeframe Filter */}
          <select
            value={timeframe}
            className="px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all-time">All Time</option>
          </select>
          
          {/* Category Filter */}
          <select
            value={category}
            className="px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled
          >
            <option value="points">Points</option>
            <option value="achievements">Achievements</option>
            <option value="streak">Streak</option>
            <option value="lessons">Lessons</option>
          </select>
        </div>
      </div>
      
      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No users found</h3>
            <p className="text-secondary-600">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Achievements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Streak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Time Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {filteredEntries.map((entry, index) => {
                const rankBadge = getRankBadge(entry.rank)
                const RankIcon = rankBadge.icon
                const rankChange = getRankChange(entry.rank, entry.previousRank)
                
                return (
                  <tr key={entry.id} className={`hover:bg-secondary-50 ${
                    entry.isCurrentUser ? 'bg-primary-50' : ''
                  }`}>
                    {/* Rank */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${rankBadge.bg}`}>
                          {entry.rank <= 3 ? (
                            <RankIcon className={`w-4 h-4 ${rankBadge.color}`} />
                          ) : (
                            <span className="text-sm font-bold text-secondary-600">#{entry.rank}</span>
                          )}
                        </div>
                        
                        {rankChange && (
                          <div className="flex items-center">
                            {rankChange.type === 'up' && (
                              <div className="flex items-center text-success-600">
                                <ChevronUp className="w-3 h-3" />
                                <span className="text-xs">{rankChange.value}</span>
                              </div>
                            )}
                            {rankChange.type === 'down' && (
                              <div className="flex items-center text-danger-600">
                                <ChevronDown className="w-3 h-3" />
                                <span className="text-xs">{rankChange.value}</span>
                              </div>
                            )}
                            {rankChange.type === 'same' && (
                              <Minus className="w-3 h-3 text-secondary-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* User */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{entry.avatar}</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="font-medium text-secondary-900">{entry.displayName}</div>
                            {entry.isCurrentUser && (
                              <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-secondary-500">@{entry.username}</div>
                          <div className="flex items-center space-x-1 mt-1">
                            {entry.badges.map((badge, i) => (
                              <span key={i} className="text-sm">{badge}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Points */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-primary-600" />
                        <span className="font-bold text-secondary-900">{entry.points.toLocaleString()}</span>
                      </div>
                    </td>
                    
                    {/* Level */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-secondary-900">{entry.level}</span>
                      </div>
                    </td>
                    
                    {/* Achievements */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-secondary-900">{entry.achievements}</span>
                      </div>
                    </td>
                    
                    {/* Streak */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Flame className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-secondary-900">{entry.streak}</span>
                      </div>
                    </td>
                    
                    {/* Time Spent */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-secondary-900">{formatTimeSpent(entry.timeSpent)}</span>
                      </div>
                    </td>
                    
                    {/* Last Active */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-secondary-600">{formatLastActive(entry.lastActive)}</span>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedEntry(entry)
                          setShowModal(true)
                        }}
                        className="text-primary-600 hover:text-primary-900 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      
      {/* User Detail Modal */}
      {showModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">{selectedEntry.avatar}</div>
              <h3 className="text-xl font-bold text-secondary-900">{selectedEntry.displayName}</h3>
              <p className="text-secondary-600">@{selectedEntry.username}</p>
              
              <div className="flex items-center justify-center space-x-2 mt-2">
                {selectedEntry.badges.map((badge, i) => (
                  <span key={i} className="text-lg">{badge}</span>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Rank and Points */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">#{selectedEntry.rank}</div>
                  <div className="text-sm text-secondary-600">Rank</div>
                </div>
                <div className="text-center p-3 bg-success-50 rounded-lg">
                  <div className="text-2xl font-bold text-success-600">{selectedEntry.points.toLocaleString()}</div>
                  <div className="text-sm text-secondary-600">Points</div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{selectedEntry.level}</div>
                  <div className="text-sm text-secondary-600">Level</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">{selectedEntry.achievements}</div>
                  <div className="text-sm text-secondary-600">Achievements</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{selectedEntry.streak}</div>
                  <div className="text-sm text-secondary-600">Day Streak</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{selectedEntry.lessonsCompleted}</div>
                  <div className="text-sm text-secondary-600">Lessons</div>
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Time Spent:</span>
                  <span className="font-medium">{formatTimeSpent(selectedEntry.timeSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Specialty:</span>
                  <span className="font-medium">{selectedEntry.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">School:</span>
                  <span className="font-medium">{selectedEntry.school}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Country:</span>
                  <span className="font-medium">{selectedEntry.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Joined:</span>
                  <span className="font-medium">{selectedEntry.joinedAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Last Active:</span>
                  <span className="font-medium">{formatLastActive(selectedEntry.lastActive)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedEntry(null)
                }}
                className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                Close
              </button>
              {!selectedEntry.isCurrentUser && (
                <button
                  onClick={() => {
                    // Add friend functionality would go here
                    alert('Friend request sent! (Demo)')
                  }}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Add Friend
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboard