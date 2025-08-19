import React, { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Home, ChevronLeft } from 'lucide-react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
  showBackButton?: boolean
  customTitle?: string
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showBackButton = false,
  customTitle 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }
  
  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }
  
  const isHomePage = location.pathname === '/' || location.pathname === '/app/dashboard'
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      {/* Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Home Button - Always visible */}
            <Link
              to="/app/dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isHomePage
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Go to Dashboard"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Dashboard</span>
            </Link>
            
            {/* Back Button - Show when not on home page */}
            {!isHomePage && (
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                title="Go Back"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Back</span>
              </button>
            )}
          </div>
          
          {/* Custom Title */}
          {customTitle && (
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {customTitle}
              </h1>
            </div>
          )}
          
          {/* Breadcrumb or additional navigation can go here */}
          <div className="flex items-center space-x-2">
            {/* Additional navigation items can be added here */}
          </div>
        </div>
      </div>
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-8rem)]">
          {children}
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  )
}

export default MainLayout