import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Star,
  Play,
  CheckCircle,
  Calendar,
  Award,
  Zap,
  Users,
  Brain,
  Code,
  ChevronRight,
  BarChart3,
  Flame,
  Medal
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useLicenseStore } from '../../store/licenseStore'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useAnalytics } from '../../hooks/useAnalytics'
import { useUserManagement } from '../../hooks/useUserManagement'
import { useProgressTracking } from '../../hooks/useProgressTracking'

interface LessonProgress {
  id: string
  title: string
  category: string
  progress: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  completed: boolean
  lastAccessed?: Date
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  earned: boolean
  earnedDate?: Date
  progress?: number
  maxProgress?: number
}

interface StudyStreak {
  current: number
  longest: number
  lastStudyDate: Date
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore()
  const licenseStore = useLicenseStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'achievements'>('overview')
  
  // Initialize service hooks
  const analytics = useAnalytics()
  const userManagement = useUserManagement()
  const progressTracking = useProgressTracking()
  
  // Mock data - in real app, this would come from API
  const [studentData, setStudentData] = useState({
    stats: {
      totalPoints: 2450,
      level: 8,
      completedLessons: 24,
      totalLessons: 45,
      studyTime: 127, // hours
      rank: 15,
      totalStudents: 150
    },
    streak: {
      current: 7,
      longest: 12,
      lastStudyDate: new Date()
    } as StudyStreak,
    recentLessons: [] as LessonProgress[],
    achievements: [] as Achievement[],
    weeklyProgress: [65, 78, 82, 90, 85, 92, 88] // Last 7 days
  })
  
  useEffect(() => {
    // Track dashboard visit
    analytics.trackPageView('student_dashboard', 'Student Dashboard')
    analytics.trackEngagement('session_start', { feature: 'student_dashboard' })
    
    // Simulate loading data
    const loadData = async () => {
      setIsLoading(true)
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock recent lessons
      const mockLessons: LessonProgress[] = [
        {
          id: '1',
          title: 'Introduction to React Hooks',
          category: 'React',
          progress: 85,
          difficulty: 'intermediate',
          estimatedTime: 45,
          completed: false,
          lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          id: '2',
          title: 'JavaScript ES6 Features',
          category: 'JavaScript',
          progress: 100,
          difficulty: 'beginner',
          estimatedTime: 30,
          completed: true,
          lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          id: '3',
          title: 'Advanced TypeScript Patterns',
          category: 'TypeScript',
          progress: 25,
          difficulty: 'advanced',
          estimatedTime: 60,
          completed: false,
          lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        }
      ]
      
      // Mock achievements
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first lesson',
          icon: <Star className="w-6 h-6 text-yellow-500" />,
          earned: true,
          earnedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          title: 'Code Warrior',
          description: 'Complete 10 coding challenges',
          icon: <Code className="w-6 h-6 text-blue-500" />,
          earned: true,
          earnedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          title: 'Study Streak',
          description: 'Study for 7 consecutive days',
          icon: <Flame className="w-6 h-6 text-orange-500" />,
          earned: true,
          earnedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: '4',
          title: 'Knowledge Master',
          description: 'Reach level 10',
          icon: <Brain className="w-6 h-6 text-purple-500" />,
          earned: false,
          progress: 8,
          maxProgress: 10
        },
        {
          id: '5',
          title: 'Top Performer',
          description: 'Rank in top 10 students',
          icon: <Medal className="w-6 h-6 text-gold-500" />,
          earned: false,
          progress: 15,
          maxProgress: 10
        }
      ]
      
      setStudentData(prev => ({
        ...prev,
        recentLessons: mockLessons,
        achievements: mockAchievements
      }))
      
      setIsLoading(false)
    }
    
    loadData()
  }, [])
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to continue your learning journey?
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {studentData.stats.totalPoints.toLocaleString()}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Points</h3>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">+125 this week</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {studentData.stats.level}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Level</h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">550 XP to next level</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {studentData.stats.completedLessons}/{studentData.stats.totalLessons}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Lessons Progress</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(studentData.stats.completedLessons / studentData.stats.totalLessons) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {studentData.streak.current}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Study Streak</h3>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Best: {studentData.streak.longest} days
            </p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'lessons', label: 'Recent Lessons', icon: BookOpen },
            { id: 'achievements', label: 'Achievements', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Progress Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Weekly Progress
              </h3>
              <div className="flex items-end space-x-2 h-32">
                {studentData.weeklyProgress.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${value}%` }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Study Time</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {studentData.stats.studyTime}h
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total time spent</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Class Rank</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  #{studentData.stats.rank}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  out of {studentData.stats.totalStudents} students
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'lessons' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Lessons
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {studentData.recentLessons.map((lesson) => (
                <div key={lesson.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {lesson.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                          {lesson.difficulty}
                        </span>
                        {lesson.completed && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{lesson.category}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.estimatedTime}min</span>
                        </span>
                        {lesson.lastAccessed && (
                          <span>Last accessed {formatTimeAgo(lesson.lastAccessed)}</span>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium text-gray-900 dark:text-white">{lesson.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              lesson.completed ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${lesson.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        // Track lesson click
                        analytics.trackLearning('lesson_start', {
                          lessonId: lesson.id,
                          subject: lesson.category,
                          difficulty: lesson.difficulty
                        })
                        navigate(`/app/lesson/${lesson.id}`)
                      }}
                      className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title={lesson.completed ? 'Review lesson' : 'Start lesson'}
                    >
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentData.achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border transition-all duration-200 ${
                  achievement.earned 
                    ? 'border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    achievement.earned 
                      ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {achievement.description}
                    </p>
                    
                    {achievement.earned ? (
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          Earned {achievement.earnedDate && formatTimeAgo(achievement.earnedDate)}
                        </span>
                      </div>
                    ) : achievement.progress !== undefined && achievement.maxProgress !== undefined ? (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Not earned yet</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard