import { useCallback, useEffect, useState } from 'react'
import { analytics } from '../services/analytics'

interface UseAnalyticsReturn {
  trackUser: (action: string, category?: string, label?: string, value?: number) => void
  trackLearning: (eventType: 'lesson_start' | 'lesson_complete' | 'exercise_attempt' | 'exercise_complete' | 'quiz_attempt' | 'quiz_complete', data: any) => void
  trackProgress: (userId: string, progressData: any) => void
  trackEngagement: (eventType: 'session_start' | 'session_end' | 'feature_use' | 'help_accessed' | 'feedback_submitted', data?: any) => void
  trackError: (error: string, context?: string, severity?: 'low' | 'medium' | 'high') => void
  trackPageView: (page: string, title?: string) => void
  setUserProperties: (userId: string, properties: any) => void
  trackConversion: (conversionType: 'license_upgrade' | 'trial_start' | 'subscription' | 'feature_unlock', value?: number) => void
  isInitialized: boolean
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        analytics.initialize()
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize analytics:', error)
      }
    }

    initializeAnalytics()
  }, [])

  const trackUser = useCallback((action: string, category?: string, label?: string, value?: number) => {
    if (!isInitialized) return
    analytics.trackUser(action, category, label, value)
  }, [isInitialized])

  const trackLearning = useCallback((eventType: 'lesson_start' | 'lesson_complete' | 'exercise_attempt' | 'exercise_complete' | 'quiz_attempt' | 'quiz_complete', data: any) => {
    if (!isInitialized) return
    analytics.trackLearning(eventType, data)
  }, [isInitialized])

  const trackProgress = useCallback((userId: string, progressData: any) => {
    if (!isInitialized) return
    analytics.trackProgress(userId, progressData)
  }, [isInitialized])

  const trackEngagement = useCallback((eventType: 'session_start' | 'session_end' | 'feature_use' | 'help_accessed' | 'feedback_submitted', data?: any) => {
    if (!isInitialized) return
    analytics.trackEngagement(eventType, data)
  }, [isInitialized])

  const trackError = useCallback((error: string, context?: string, severity?: 'low' | 'medium' | 'high') => {
    if (!isInitialized) return
    analytics.trackError(error, context, severity)
  }, [isInitialized])

  const trackPageView = useCallback((page: string, title?: string) => {
    if (!isInitialized) return
    analytics.trackPageView(page, title)
  }, [isInitialized])

  const setUserProperties = useCallback((userId: string, properties: any) => {
    if (!isInitialized) return
    analytics.setUserProperties(userId, properties)
  }, [isInitialized])

  const trackConversion = useCallback((conversionType: 'license_upgrade' | 'trial_start' | 'subscription' | 'feature_unlock', value?: number) => {
    if (!isInitialized) return
    analytics.trackConversion(conversionType, value)
  }, [isInitialized])

  return {
    trackUser,
    trackLearning,
    trackProgress,
    trackEngagement,
    trackError,
    trackPageView,
    setUserProperties,
    trackConversion,
    isInitialized
  }
}