import { useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'

/**
 * Hook for managing user session lifecycle
 * Handles automatic session expiry checks, activity tracking, and cleanup
 */
export const useSessionManager = () => {
  const {
    isAuthenticated,
    checkSessionExpiry,
    updateActivity,
    extendSession,
    isAccountLocked,
    unlockAccount
  } = useAuthStore()

  // Check session expiry periodically
  const checkSession = useCallback(() => {
    if (isAuthenticated) {
      checkSessionExpiry()
    }
  }, [isAuthenticated, checkSessionExpiry])

  // Update user activity
  const trackActivity = useCallback(() => {
    if (isAuthenticated) {
      updateActivity()
    }
  }, [isAuthenticated, updateActivity])

  // Extend session if user is active
  const handleExtendSession = useCallback(() => {
    if (isAuthenticated) {
      extendSession()
    }
  }, [isAuthenticated, extendSession])

  // Check and unlock account if lock period has expired
  const checkAccountLock = useCallback(() => {
    if (isAccountLocked()) {
      // The isAccountLocked method will auto-unlock if period has passed
      return
    }
  }, [isAccountLocked, unlockAccount])

  // Set up session monitoring
  useEffect(() => {
    if (!isAuthenticated) return

    // Check session every 5 minutes
    const sessionInterval = setInterval(checkSession, 5 * 60 * 1000)

    // Check account lock status every minute
    const lockInterval = setInterval(checkAccountLock, 60 * 1000)

    return () => {
      clearInterval(sessionInterval)
      clearInterval(lockInterval)
    }
  }, [isAuthenticated, checkSession, checkAccountLock])

  // Track user activity on various events
  useEffect(() => {
    if (!isAuthenticated) return

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    let activityTimeout: NodeJS.Timeout

    const handleActivity = () => {
      // Debounce activity tracking to avoid excessive updates
      clearTimeout(activityTimeout)
      activityTimeout = setTimeout(trackActivity, 1000)
    }

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      clearTimeout(activityTimeout)
    }
  }, [isAuthenticated, trackActivity])

  // Auto-extend session on significant activity (every 30 minutes of activity)
  useEffect(() => {
    if (!isAuthenticated) return

    const extendInterval = setInterval(() => {
      // Only extend if user has been active in the last 5 minutes
      const now = Date.now()
      const lastActivity = useAuthStore.getState().lastActivity
      
      if (lastActivity && (now - lastActivity) < 5 * 60 * 1000) {
        handleExtendSession()
      }
    }, 30 * 60 * 1000) // Check every 30 minutes

    return () => clearInterval(extendInterval)
  }, [isAuthenticated, handleExtendSession])

  return {
    trackActivity,
    extendSession: handleExtendSession,
    checkSession
  }
}