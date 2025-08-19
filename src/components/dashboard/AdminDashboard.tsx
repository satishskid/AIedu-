import React, { useState, useEffect } from 'react'
import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  Server,
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Upload,
  Database,
  Globe,
  Zap,
  UserCheck,
  UserX,
  FileText,
  Calendar,
  Mail,
  Bell,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useAnalytics } from '../../hooks/useAnalytics'
import { useUserManagement } from '../../hooks/useUserManagement'
import { useProgressTracking } from '../../hooks/useProgressTracking'
import { AddUserModal } from '../admin/AddUserModal'
import { CreateLicenseModal } from '../admin/CreateLicenseModal'

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalLessons: number
  totalOrganizations: number
  serverUptime: number
  storageUsed: number
  storageTotal: number
  monthlyRevenue: number
  activeLicenses: number
}

interface UserActivity {
  id: string
  userName: string
  userEmail: string
  action: string
  timestamp: Date
  ipAddress: string
  userAgent: string
}

interface Organization {
  id: string
  name: string
  domain: string
  userCount: number
  licenseType: 'basic' | 'premium' | 'enterprise'
  status: 'active' | 'suspended' | 'trial'
  createdAt: Date
  lastActive: Date
}

interface SystemAlert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  resolved: boolean
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore()
  const analytics = useAnalytics()
  const userManagement = useUserManagement()
  const progressTracking = useProgressTracking()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'organizations' | 'system' | 'analytics'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isCreateLicenseModalOpen, setIsCreateLicenseModalOpen] = useState(false)
  
  // Mock data - in real app, this would come from API
  const [adminData, setAdminData] = useState({
    systemStats: {
      totalUsers: 1247,
      activeUsers: 892,
      totalLessons: 156,
      totalOrganizations: 23,
      serverUptime: 99.8,
      storageUsed: 2.4, // TB
      storageTotal: 10, // TB
      monthlyRevenue: 45600,
      activeLicenses: 1180
    } as SystemStats,
    recentActivity: [] as UserActivity[],
    organizations: [] as Organization[],
    systemAlerts: [] as SystemAlert[],
    monthlyGrowth: [12, 19, 15, 25, 22, 30, 28, 35, 32, 38, 42, 45], // Last 12 months
    userGrowth: [850, 892, 934, 978, 1025, 1089, 1156, 1203, 1247] // Last 9 months
  })
  
  useEffect(() => {
    // Track dashboard visit
    analytics.trackPageView('admin_dashboard', 'Admin Dashboard')
    analytics.trackEngagement('session_start', { feature: 'admin_dashboard' })
    
    // Simulate loading data
    const loadData = async () => {
      setIsLoading(true)
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock recent activity
      const mockActivity: UserActivity[] = [
        {
          id: '1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          action: 'User login',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome 120.0'
        },
        {
          id: '2',
          userName: 'Jane Smith',
          userEmail: 'jane@school.edu',
          action: 'Lesson completed',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          ipAddress: '10.0.0.50',
          userAgent: 'Firefox 121.0'
        },
        {
          id: '3',
          userName: 'Admin User',
          userEmail: 'admin@eduai.com',
          action: 'System configuration updated',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          ipAddress: '172.16.0.10',
          userAgent: 'Chrome 120.0'
        }
      ]
      
      // Mock organizations
      const mockOrganizations: Organization[] = [
        {
          id: '1',
          name: 'Springfield Elementary',
          domain: 'springfield.edu',
          userCount: 245,
          licenseType: 'premium',
          status: 'active',
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          name: 'Tech University',
          domain: 'techuni.edu',
          userCount: 1200,
          licenseType: 'enterprise',
          status: 'active',
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          id: '3',
          name: 'Code Academy',
          domain: 'codeacademy.com',
          userCount: 89,
          licenseType: 'basic',
          status: 'trial',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      ]
      
      // Mock system alerts
      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'High CPU Usage',
          message: 'Server CPU usage has been above 80% for the last 10 minutes',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          resolved: false
        },
        {
          id: '2',
          type: 'info',
          title: 'Scheduled Maintenance',
          message: 'System maintenance scheduled for tonight at 2:00 AM EST',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          resolved: false
        },
        {
          id: '3',
          type: 'error',
          title: 'Database Connection Issue',
          message: 'Temporary database connection timeout resolved',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          resolved: true
        }
      ]
      
      setAdminData(prev => ({
        ...prev,
        recentActivity: mockActivity,
        organizations: mockOrganizations,
        systemAlerts: mockAlerts
      }))
      
      setIsLoading(false)
    }
    
    loadData()
  }, [])
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'suspended': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'trial': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }
  
  const getLicenseColor = (license: string) => {
    switch (license) {
      case 'basic': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
      case 'premium': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      case 'enterprise': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }
  
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
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
            Admin Dashboard ⚡
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name || 'Admin'}! Monitor and manage the EduAI platform.
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
                {adminData.systemStats.totalUsers.toLocaleString()}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</h3>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {adminData.systemStats.activeUsers} active
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(adminData.systemStats.monthlyRevenue / 1000).toFixed(0)}K
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</h3>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% from last month</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Server className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {adminData.systemStats.serverUptime}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Server Uptime</h3>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Excellent performance</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Database className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {((adminData.systemStats.storageUsed / adminData.systemStats.storageTotal) * 100).toFixed(0)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Used</h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {adminData.systemStats.storageUsed}TB / {adminData.systemStats.storageTotal}TB
            </p>
          </div>
        </div>
        
        {/* System Alerts */}
        {adminData.systemAlerts.filter(alert => !alert.resolved).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                System Alerts
              </h3>
            </div>
            <div className="space-y-3">
              {adminData.systemAlerts.filter(alert => !alert.resolved).map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formatTimeAgo(alert.timestamp)}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'organizations', label: 'Organizations', icon: Globe },
            { id: 'system', label: 'System', icon: Server },
            { id: 'analytics', label: 'Analytics', icon: PieChart }
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
            {/* User Growth Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                User Growth (Last 9 Months)
              </h3>
              <div className="flex items-end space-x-2 h-32">
                {adminData.userGrowth.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${(value / Math.max(...adminData.userGrowth)) * 100}%` }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(Date.now() - (8 - index) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en', { month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Content</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {adminData.systemStats.totalLessons}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total lessons</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Licenses</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {adminData.systemStats.activeLicenses}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active licenses</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  User Management
                </h3>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button 
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add User</span>
                  </button>
                  <button 
                    onClick={() => setIsCreateLicenseModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Create License</span>
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Active Users</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {adminData.systemStats.activeUsers}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <UserX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Inactive Users</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {adminData.systemStats.totalUsers - adminData.systemStats.activeUsers}
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-900 dark:text-green-100">Growth Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">+8.5%</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'organizations' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Organization Management
                </h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add Organization</span>
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {adminData.organizations.map((org) => (
                <div key={org.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{org.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{org.domain}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(org.status)}`}>
                            {org.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLicenseColor(org.licenseType)}`}>
                            {org.licenseType}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {org.userCount} users
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        <div className="text-gray-900 dark:text-white">
                          Created {formatTimeAgo(org.createdAt)}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Last active {formatTimeAgo(org.lastActive)}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                System Health
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-gray-900 dark:text-white">API Server</span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Database</span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Cache Server</span>
                  </div>
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">Warning</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-gray-900 dark:text-white">File Storage</span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {adminData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.userName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatTimeAgo(activity.timestamp)} • {activity.ipAddress}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Growth */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Revenue Growth (Last 12 Months)
              </h3>
              <div className="flex items-end space-x-1 h-32">
                {adminData.monthlyGrowth.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                      style={{ height: `${(value / Math.max(...adminData.monthlyGrowth)) * 100}%` }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(Date.now() - (11 - index) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en', { month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* License Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                License Distribution
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Enterprise</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">45%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Premium</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">35%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Basic</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">20%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gray-500 h-2 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Add User Modal */}
      <AddUserModal 
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserCreated={() => {
          setIsAddUserModalOpen(false)
          // Refresh user data if needed
        }}
      />
      
      {/* Create License Modal */}
      <CreateLicenseModal 
        isOpen={isCreateLicenseModalOpen}
        onClose={() => setIsCreateLicenseModalOpen(false)}
        onLicenseCreated={() => {
          setIsCreateLicenseModalOpen(false)
          // Refresh license data if needed
        }}
      />
    </div>
  )
}

export default AdminDashboard