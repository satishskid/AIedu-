import React, { useState, useRef, useEffect } from 'react'
import { 
  Menu, 
  X, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Monitor,
  Search,
  HelpCircle,
  ChevronDown,
  Zap,
  Crown,
  Star
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useLicenseStore } from '../../store/licenseStore'
import { formatUserName, getUserLevel, getUserPoints } from '../../store/authStore'
import { formatLicenseType, getDaysUntilExpiry } from '../../store/licenseStore'

interface HeaderProps {
  onMenuToggle: () => void
  isSidebarOpen: boolean
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarOpen }) => {
  const { user, logout } = useAuthStore()
  const { theme, setTheme, toggleSidebar } = useThemeStore()
  const { licenseInfo } = useLicenseStore()
  
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const userMenuRef = useRef<HTMLDivElement>(null)
  const themeMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }
  
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    setShowThemeMenu(false)
  }
  
  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />
      case 'dark': return <Moon className="w-4 h-4" />
      case 'system': return <Monitor className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }
  
  const getLicenseIcon = () => {
    if (!licenseInfo) return null
    
    switch (licenseInfo.type) {
      case 'trial': return <Zap className="w-4 h-4 text-yellow-500" />
      case 'basic': return <Star className="w-4 h-4 text-blue-500" />
      case 'premium': return <Crown className="w-4 h-4 text-purple-500" />
      case 'enterprise': return <Crown className="w-4 h-4 text-gold-500" />
      default: return null
    }
  }
  
  const mockNotifications = [
    {
      id: '1',
      title: 'New lesson available',
      message: 'Advanced React Patterns is now available',
      time: '5 minutes ago',
      unread: true,
      type: 'lesson'
    },
    {
      id: '2',
      title: 'Assignment graded',
      message: 'Your JavaScript Fundamentals assignment has been graded',
      time: '1 hour ago',
      unread: true,
      type: 'grade'
    },
    {
      id: '3',
      title: 'Achievement unlocked',
      message: 'You earned the "Code Master" badge!',
      time: '2 hours ago',
      unread: false,
      type: 'achievement'
    }
  ]
  
  const unreadCount = mockNotifications.filter(n => n.unread).length
  
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        {/* Menu toggle */}
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
        
        {/* Logo and title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">EA</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              EduAI Tutor
            </h1>
            {licenseInfo && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                {getLicenseIcon()}
                <span>{formatLicenseType(licenseInfo.type)}</span>
                <span>•</span>
                <span>{getDaysUntilExpiry(licenseInfo)} days left</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Center section - Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search lessons, assignments, or help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>
      
      {/* Right section */}
      <div className="flex items-center space-x-2">
        {/* User stats (for students) */}
        {user?.role === 'student' && (
          <div className="hidden sm:flex items-center space-x-4 mr-4">
            <div className="flex items-center space-x-1 text-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {getUserPoints(user).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Level {getUserLevel(user)}
              </span>
            </div>
          </div>
        )}
        
        {/* Theme toggle */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Change theme"
          >
            {getThemeIcon()}
          </button>
          
          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <button
                onClick={() => handleThemeChange('light')}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Monitor className="w-4 h-4" />
                <span>System</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {mockNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.unread ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          {notification.message}
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Help */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={formatUserName(user)}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatUserName(user)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role || 'Guest'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatUserName(user)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-red-600 dark:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}