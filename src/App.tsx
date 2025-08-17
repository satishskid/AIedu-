import React, { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import LicenseActivation from './components/auth/LicenseActivation'
import { useLicense } from './hooks/useLicense'
import { usePerformance } from './hooks/usePerformance'
import { ErrorFallback } from './components/common/ErrorFallback'

// Lazy load components for better performance
const StudentDashboard = lazy(() => import('./components/dashboard/StudentDashboard'))
// Note: TeacherDashboard and AdminDashboard components need to be created
// const TeacherDashboard = lazy(() => import('./components/dashboard/TeacherDashboard'))
// const AdminDashboard = lazy(() => import('./components/dashboard/AdminDashboard'))
const LessonViewer = lazy(() => import('./components/lesson/LessonViewer'))

interface AppState {
  isInitialized: boolean
  hasError: boolean
  error?: Error
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    isInitialized: false,
    hasError: false
  })

  const { licenseStatus, initializeLicense, isValidating } = useLicense()
  const { measureRender } = usePerformance()

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      measureRender('app-initialization-start')
      
      // Initialize license system
      await initializeLicense()
      
      // Perform health checks
      await performHealthChecks()
      
      setAppState({ isInitialized: true, hasError: false })
      measureRender('app-initialization-complete')
      
    } catch (error) {
      console.error('App initialization failed:', error)
      setAppState({
        isInitialized: true,
        hasError: true,
        error: error as Error
      })
    }
  }

  const performHealthChecks = async () => {
    // Check if IndexedDB is available
    if (!window.indexedDB) {
      throw new Error('IndexedDB not supported')
    }

    // Check if required APIs are available
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('Crypto API not fully supported - using fallback')
    }

    // Validate environment
    const requiredEnvVars = [
      'VITE_APP_NAME',
      'VITE_LICENSE_SECRET_KEY'
    ]
    
    for (const envVar of requiredEnvVars) {
      if (!import.meta.env[envVar]) {
        console.warn(`Missing environment variable: ${envVar}`)
      }
    }
  }

  // Loading state
  if (!appState.isInitialized || isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <LoadingSpinner size="xl" />
          <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            Initializing EduAI Tutor
          </h2>
          <p className="text-gray-600">
            Loading AI models and educational content...
          </p>
          <div className="mt-4 text-sm text-gray-500">
            This may take a moment on first load
          </div>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (appState.hasError) {
    return <ErrorFallback error={appState.error} />
  }

  // License activation required
  if (!licenseStatus.isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <AnimatePresence mode="wait">
          <motion.div
            key="license-activation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LicenseActivation
              onActivated={() => initializeLicense()}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // Main application
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
            
            {/* Student Routes */}
            <Route path="/app/dashboard" element={<StudentDashboard />} />
            <Route path="/app/lesson/:lessonId" element={<LessonViewer lessonId={window.location.pathname.split('/').pop() || ''} />} />
            
            {/* Teacher Routes - TODO: Create TeacherDashboard component */}
            <Route path="/teacher/*" element={<Navigate to="/app/dashboard" replace />} />
            
            {/* Admin Routes - TODO: Create AdminDashboard component */}
            <Route path="/admin/*" element={<Navigate to="/app/dashboard" replace />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  )
}

export default App