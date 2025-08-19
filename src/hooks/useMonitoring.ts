import { useCallback, useEffect, useState } from 'react'
import { monitoring } from '../services/monitoring'

interface UseMonitoringReturn {
  isLoading: boolean
  error: string | null
  reportError: (error: Error, context?: { level?: 'error' | 'warning' | 'info' | 'debug'; tags?: Record<string, string>; extra?: Record<string, any>; user?: Record<string, any> }) => void
  reportMessage: (message: string, level?: 'error' | 'warning' | 'info' | 'debug', context?: { tags?: Record<string, string>; extra?: Record<string, any> }) => void
  setUserContext: (user: { id: string; email?: string; username?: string; userType?: 'student' | 'teacher' | 'admin'; licenseType?: string }) => void
  setTags: (tags: Record<string, string>) => void
  setContext: (key: string, context: Record<string, any>) => void
  startTransaction: (name: string, operation?: string) => any
  trackLearningError: (error: Error, context: { lessonId?: string; exerciseId?: string; userId?: string; action?: string }) => void
  trackAPIError: (error: Error, context: { endpoint?: string; method?: string; statusCode?: number; userId?: string }) => void
  trackPerformance: (name: string, duration: number, context?: { category?: string; userId?: string; additional?: Record<string, any> }) => void
  trackFeatureUsage: (feature: string, context?: { userId?: string; licenseType?: string; success?: boolean; additional?: Record<string, any> }) => void
  isInitialized: boolean
}

export const useMonitoring = (): UseMonitoringReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeMonitoring = async () => {
      try {
        monitoring.initialize()
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize monitoring:', error)
        setError('Failed to initialize monitoring')
      }
    }

    initializeMonitoring()
  }, [])

  const reportError = useCallback((error: Error, context?: { level?: 'error' | 'warning' | 'info' | 'debug'; tags?: Record<string, string>; extra?: Record<string, any>; user?: Record<string, any> }): void => {
    if (!isInitialized) return
    
    try {
      monitoring.reportError(error, context)
    } catch (err) {
      console.error('Failed to report error:', err)
    }
  }, [isInitialized])

  const reportMessage = useCallback((message: string, level: 'error' | 'warning' | 'info' | 'debug' = 'info', context?: { tags?: Record<string, string>; extra?: Record<string, any> }): void => {
    if (!isInitialized) return
    
    try {
      monitoring.reportMessage(message, level, context)
    } catch (error) {
      console.error('Failed to report message:', error)
    }
  }, [isInitialized])

  const setUserContext = useCallback((user: { id: string; email?: string; username?: string; userType?: 'student' | 'teacher' | 'admin'; licenseType?: string }): void => {
    if (!isInitialized) return
    
    try {
      monitoring.setUserContext(user)
    } catch (error) {
      console.error('Failed to set user context:', error)
    }
  }, [isInitialized])

  const setTags = useCallback((tags: Record<string, string>): void => {
    if (!isInitialized) return
    
    try {
      monitoring.setTags(tags)
    } catch (error) {
      console.error('Failed to set tags:', error)
    }
  }, [isInitialized])

  const setContext = useCallback((key: string, context: Record<string, any>): void => {
    if (!isInitialized) return
    
    try {
      monitoring.setContext(key, context)
    } catch (error) {
      console.error('Failed to set context:', error)
    }
  }, [isInitialized])

  const startTransaction = useCallback((name: string, operation: string = 'navigation'): any => {
    if (!isInitialized) return null
    
    try {
      return monitoring.startTransaction(name, operation)
    } catch (error) {
      console.error('Failed to start transaction:', error)
      return null
    }
  }, [isInitialized])

  const trackLearningError = useCallback((error: Error, context: { lessonId?: string; exerciseId?: string; userId?: string; action?: string }): void => {
    if (!isInitialized) return
    
    try {
      monitoring.trackLearningError(error, context)
    } catch (err) {
      console.error('Failed to track learning error:', err)
    }
  }, [isInitialized])

  const trackAPIError = useCallback((error: Error, context: { endpoint?: string; method?: string; statusCode?: number; userId?: string }): void => {
    if (!isInitialized) return
    
    try {
      monitoring.trackAPIError(error, context)
    } catch (err) {
      console.error('Failed to track API error:', err)
    }
  }, [isInitialized])

  const trackPerformance = useCallback((name: string, duration: number, context?: { category?: string; userId?: string; additional?: Record<string, any> }): void => {
    if (!isInitialized) return
    
    try {
      monitoring.trackPerformance(name, duration, context)
    } catch (error) {
      console.error('Failed to track performance:', error)
    }
  }, [isInitialized])

  const trackFeatureUsage = useCallback((feature: string, context?: { userId?: string; licenseType?: string; success?: boolean; additional?: Record<string, any> }): void => {
    if (!isInitialized) return
    
    try {
      monitoring.trackFeatureUsage(feature, context)
    } catch (error) {
      console.error('Failed to track feature usage:', error)
    }
  }, [isInitialized])

  return {
    isLoading,
    error,
    reportError,
    reportMessage,
    setUserContext,
    setTags,
    setContext,
    startTransaction,
    trackLearningError,
    trackAPIError,
    trackPerformance,
    trackFeatureUsage,
    isInitialized
  }
}