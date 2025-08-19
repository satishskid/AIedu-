import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Calendar,
  Award,
  Target,
  MessageSquare,
  FileText,
  Download,
  Filter,
  Search,
  ChevronRight,
  GraduationCap,
  Star,
  Activity
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useAnalytics } from '../../hooks/useAnalytics'
import { useUserManagement } from '../../hooks/useUserManagement'
import { useProgressTracking } from '../../hooks/useProgressTracking'

interface Student {
  id: string
  name: string
  email: string
  avatar?: string
  progress: number
  completedLessons: number
  totalLessons: number
  lastActive: Date
  currentLevel: number
  totalPoints: number
  status: 'active' | 'inactive' | 'struggling'
}

interface ClassStats {
  totalStudents: number
  activeStudents: number
  averageProgress: number
  completionRate: number
  totalLessons: number
  averageScore: number
}

interface Lesson {
  id: string
  title: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  completions: number
  averageScore: number
  createdAt: Date
  status: 'draft' | 'published' | 'archived'
}

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const analytics = useAnalytics()
  const userManagement = useUserManagement()
  const progressTracking = useProgressTracking()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'lessons' | 'analytics'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'struggling'>('all')
  
  // Mock data - in real app, this would come from API
  const [teacherData, setTeacherData] = useState({
    classStats: {
      totalStudents: 28,
      activeStudents: 24,
      averageProgress: 67,
      completionRate: 78,
      totalLessons: 15,
      averageScore: 85
    } as ClassStats,
    students: [] as Student[],
    lessons: [] as Lesson[],
    recentActivity: [] as any[],
    weeklyEngagement: [85, 78, 92, 88, 76, 89, 94] // Last 7 days
  })
  
  useEffect(() => {
    // Track dashboard visit
    analytics.trackPageView('teacher_dashboard', 'Teacher Dashboard')
    analytics.trackEngagement('session_start', { feature: 'teacher_dashboard' })
    
    // Simulate loading data
    const loadData = async () => {
      setIsLoading(true)
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock students data
      const mockStudents: Student[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          progress: 85,
          completedLessons: 12,
          totalLessons: 15,
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          currentLevel: 8,
          totalPoints: 2450,
          status: 'active'
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          progress: 45,
          completedLessons: 7,
          totalLessons: 15,
          lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          currentLevel: 4,
          totalPoints: 1200,
          status: 'struggling'
        },
        {
          id: '3',
          name: 'Carol Davis',
          email: 'carol@example.com',
          progress: 92,
          completedLessons: 14,
          totalLessons: 15,
          lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          currentLevel: 10,
          totalPoints: 3200,
          status: 'active'
        },
        {
          id: '4',
          name: 'David Wilson',
          email: 'david@example.com',
          progress: 23,
          completedLessons: 3,
          totalLessons: 15,
          lastActive: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          currentLevel: 2,
          totalPoints: 650,
          status: 'inactive'
        }
      ]
      
      // Mock lessons data
      const mockLessons: Lesson[] = [
        {
          id: '1',
          title: 'Introduction to React',
          category: 'React',
          difficulty: 'beginner',
          duration: 45,
          completions: 22,
          averageScore: 87,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          status: 'published'
        },
        {
          id: '2',
          title: 'Advanced JavaScript Patterns',
          category: 'JavaScript',
          difficulty: 'advanced',
          duration: 60,
          completions: 15,
          averageScore: 78,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          status: 'published'
        },
        {
          id: '3',
          title: 'TypeScript Fundamentals',
          category: 'TypeScript',
          difficulty: 'intermediate',
          duration: 50,
          completions: 0,
          averageScore: 0,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'draft'
        }
      ]
      
      setTeacherData(prev => ({
        ...prev,
        students: mockStudents,
        lessons: mockLessons
      }))
      
      setIsLoading(false)
    }
    
    loadData()
  }, [])
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
      case 'struggling': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }
  
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
  
  const filteredStudents = teacherData.students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || student.status === filterStatus
    return matchesSearch && matchesFilter
  })
  
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
            Teacher Dashboard 📚
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name || 'Teacher'}! Manage your classes and track student progress.
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {teacherData.classStats.totalStudents}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</h3>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {teacherData.classStats.activeStudents} active
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {teacherData.classStats.averageProgress}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Progress</h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+5% this week</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {teacherData.classStats.totalLessons}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Lessons</h3>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">3 published this month</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {teacherData.classStats.averageScore}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Score</h3>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Above target</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'lessons', label: 'Lessons', icon: BookOpen },
            { id: 'analytics', label: 'Analytics', icon: Activity }
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
            {/* Weekly Engagement Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Weekly Student Engagement
              </h3>
              <div className="flex items-end space-x-2 h-32">
                {teacherData.weeklyEngagement.map((value, index) => (
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
            
            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-900 dark:text-white">Create New Lesson</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-gray-900 dark:text-white">Send Announcement</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-gray-900 dark:text-white">Export Reports</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Class Performance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {teacherData.classStats.completionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${teacherData.classStats.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'students' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Student Management
                </h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add Student</span>
                </button>
              </div>
              
              {/* Search and Filter */}
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="struggling">Struggling</option>
                </select>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => (
                <div key={student.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{student.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                            {student.status}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Level {student.currentLevel} • {student.totalPoints.toLocaleString()} pts
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.completedLessons}/{student.totalLessons} lessons
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Last active {formatTimeAgo(student.lastActive)}
                        </div>
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              student.progress >= 80 ? 'bg-green-500' :
                              student.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'lessons' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Lesson Management
                </h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Create Lesson</span>
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {teacherData.lessons.map((lesson) => (
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lesson.status === 'published' ? 'text-green-600 bg-green-100 dark:bg-green-900/30' :
                          lesson.status === 'draft' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' :
                          'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
                        }`}>
                          {lesson.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{lesson.category}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.duration}min</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{lesson.completions} completions</span>
                        </span>
                        {lesson.averageScore > 0 && (
                          <span className="flex items-center space-x-1">
                            <Star className="w-4 h-4" />
                            <span>{lesson.averageScore}% avg score</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Created {formatTimeAgo(lesson.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          // Track lesson preview
                          analytics.trackEngagement('feature_use', {
                            feature: 'lesson_preview'
                          })
                          navigate(`/app/lesson/${lesson.id}`)
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Preview lesson"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Student Progress Distribution
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Excellent (80-100%)</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">8 students</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '29%' }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Good (60-79%)</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">12 students</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '43%' }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Needs Improvement (40-59%)</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">6 students</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '21%' }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">At Risk (0-39%)</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">2 students</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '7%' }} />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Lesson Performance
              </h3>
              <div className="space-y-4">
                {teacherData.lessons.filter(l => l.status === 'published').map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {lesson.completions} completions
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {lesson.averageScore}%
                      </div>
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${lesson.averageScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherDashboard