import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Award,
  Target,
  Calendar,
  FileText,
  MessageSquare,
  Code,
  Brain,
  Trophy,
  Star,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  UserCheck,
  Shield,
  Zap
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useLicenseStore } from '../../store/licenseStore'
import { hasPermission } from '../../store/authStore'
import { hasFeature } from '../../store/licenseStore'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  permission?: string
  feature?: string
  badge?: string
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard'
  },
  {
    id: 'lessons',
    label: 'Lessons',
    icon: BookOpen,
    path: '/lessons',
    children: [
      {
        id: 'all-lessons',
        label: 'All Lessons',
        icon: BookOpen,
        path: '/app/lessons'
      },
      {
        id: 'my-progress',
        label: 'My Progress',
        icon: Target,
        path: '/lessons/progress',
        permission: 'view-progress'
      },
      {
        id: 'code-editor',
        label: 'Code Editor',
        icon: Code,
        path: '/lessons/editor'
      },
      {
        id: 'ai-tutor',
        label: 'AI Tutor',
        icon: Brain,
        path: '/lessons/ai-tutor'
      }
    ]
  },
  {
    id: 'assignments',
    label: 'Assignments',
    icon: FileText,
    path: '/assignments',
    permission: 'view-assignments',
    children: [
      {
        id: 'active-assignments',
        label: 'Active',
        icon: FileText,
        path: '/assignments/active'
      },
      {
        id: 'completed-assignments',
        label: 'Completed',
        icon: UserCheck,
        path: '/assignments/completed'
      },
      {
        id: 'create-assignment',
        label: 'Create New',
        icon: FileText,
        path: '/assignments/create',
        permission: 'create-assignments'
      }
    ]
  },
  {
    id: 'gamification',
    label: 'Gamification',
    icon: Trophy,
    path: '/gamification',
    children: [
      {
        id: 'achievements',
        label: 'Achievements',
        icon: Award,
        path: '/gamification/achievements'
      },
      {
        id: 'leaderboard',
        label: 'Leaderboard',
        icon: Trophy,
        path: '/gamification/leaderboard'
      },
      {
        id: 'points',
        label: 'Points & Rewards',
        icon: Star,
        path: '/gamification/points'
      }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
    permission: 'view-analytics',
    feature: 'advanced-analytics',
    children: [
      {
        id: 'student-progress',
        label: 'Student Progress',
        icon: GraduationCap,
        path: '/analytics/students',
        permission: 'view-student-progress'
      },
      {
        id: 'lesson-analytics',
        label: 'Lesson Analytics',
        icon: BookOpen,
        path: '/analytics/lessons'
      },
      {
        id: 'engagement',
        label: 'Engagement',
        icon: Target,
        path: '/analytics/engagement'
      }
    ]
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    path: '/users',
    permission: 'manage-users',
    children: [
      {
        id: 'all-users',
        label: 'All Users',
        icon: Users,
        path: '/users'
      },
      {
        id: 'teachers',
        label: 'Teachers',
        icon: GraduationCap,
        path: '/users/teachers'
      },
      {
        id: 'students',
        label: 'Students',
        icon: Users,
        path: '/users/students'
      }
    ]
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    path: '/calendar',
    feature: 'calendar'
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    path: '/messages',
    feature: 'messaging',
    badge: '3'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings'
  }
]

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { user } = useAuthStore()
  const { sidebarCollapsed, setSidebarCollapsed } = useThemeStore()
  const { licenseInfo } = useLicenseStore()
  
  const toggleCollapsed = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }
  
  const shouldShowItem = (item: NavItem): boolean => {
    // Check permission
    if (item.permission && !hasPermission(user, item.permission)) {
      return false
    }
    
    // Check feature availability
    if (item.feature && !hasFeature(licenseInfo, item.feature)) {
      return false
    }
    
    return true
  }
  
  const isActiveRoute = (path: string): boolean => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }
  
  const renderNavItem = (item: NavItem, level: number = 0) => {
    if (!shouldShowItem(item)) {
      return null
    }
    
    const isActive = isActiveRoute(item.path)
    const hasChildren = item.children && item.children.length > 0
    const isParentActive = hasChildren && item.children?.some(child => isActiveRoute(child.path))
    
    const baseClasses = `
      flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
      ${level > 0 ? 'ml-6 text-sm' : ''}
      ${isActive || isParentActive
        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }
      ${sidebarCollapsed && level === 0 ? 'justify-center px-2' : ''}
    `
    
    const content = (
      <>
        <item.icon className={`w-5 h-5 ${isActive || isParentActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
        {(!sidebarCollapsed || level > 0) && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
            {item.feature && !hasFeature(licenseInfo, item.feature) && (
              <Zap className="w-4 h-4 text-yellow-500" />
            )}
          </>
        )}
      </>
    )
    
    return (
      <div key={item.id}>
        {hasChildren ? (
          <div className={baseClasses}>
            {content}
          </div>
        ) : (
          <NavLink
            to={item.path}
            className={baseClasses}
            onClick={() => {
              if (window.innerWidth < 1024) {
                onClose()
              }
            }}
          >
            {content}
          </NavLink>
        )}
        
        {/* Render children */}
        {hasChildren && !sidebarCollapsed && item.children && (
          <div className="mt-1 space-y-1">
            {item.children.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EA</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-sm">
                  EduAI Tutor
                </h2>
                {user && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user.role} Portal
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Collapse toggle - desktop only */}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems.map(item => renderNavItem(item))}
        </nav>
        
        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {licenseInfo && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {licenseInfo.type.charAt(0).toUpperCase() + licenseInfo.type.slice(1)} License
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {licenseInfo.organizationName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Expires in {Math.max(0, Math.ceil((new Date(licenseInfo.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                </p>
              </div>
            )}
            
            {user && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  )
}