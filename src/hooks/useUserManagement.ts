import { useCallback, useEffect, useState } from 'react'
import { userManagement } from '../services/userManagement'
import { User, UserPreferences, UserProfile } from '../types/user'

interface UseUserManagementReturn {
  currentUser: User | null
  isLoading: boolean
  error: string | null
  
  // User operations
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<User>
  getUser: (userId: string) => Promise<User | null>
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
  
  // Profile operations
  getUserProfile: (userId: string) => Promise<UserProfile | null>
  updateUserProfile: (userId: string, profile: Partial<UserProfile>) => Promise<void>
  
  // Preferences operations
  getUserPreferences: (userId: string) => Promise<UserPreferences | null>
  updateUserPreferences: (userId: string, preferences: Partial<UserPreferences>) => Promise<void>
  
  // Authentication helpers
  setCurrentUser: (user: User | null) => void
  clearCurrentUser: () => void
  
  // Utility functions
  refreshUser: (userId: string) => Promise<void>
  isInitialized: boolean
}

export const useUserManagement = (userId?: string): UseUserManagementReturn => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeUserManagement = async () => {
      try {
        await userManagement.initialize()
        setIsInitialized(true)
        
        // Load current user if userId provided
        if (userId) {
          await refreshUser(userId)
        }
      } catch (error) {
        console.error('Failed to initialize user management:', error)
        setError('Failed to initialize user management')
      }
    }

    initializeUserManagement()
  }, [userId])

  const createUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    if (!isInitialized) throw new Error('User management not initialized')
    
    setIsLoading(true)
    setError(null)
    
    try {
      const user = await userManagement.createUser(userData)
      return user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const getUser = useCallback(async (userId: string): Promise<User | null> => {
    if (!isInitialized) return null
    
    setIsLoading(true)
    setError(null)
    
    try {
      const user = await userManagement.getUserById(userId)
      return user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const updateUser = useCallback(async (userId: string, updates: Partial<User>): Promise<void> => {
    if (!isInitialized) throw new Error('User management not initialized')
    
    setIsLoading(true)
    setError(null)
    
    try {
      await userManagement.updateUser(userId, updates)
      
      // Update current user if it's the same user
      if (currentUser && currentUser.id === userId) {
        setCurrentUser({ ...currentUser, ...updates })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized, currentUser])

  const deleteUser = useCallback(async (userId: string): Promise<void> => {
    if (!isInitialized) throw new Error('User management not initialized')
    
    setIsLoading(true)
    setError(null)
    
    try {
      await userManagement.deleteUser(userId)
      
      // Clear current user if it's the same user
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(null)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized, currentUser])

  const getUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!isInitialized) return null
    
    try {
      return await userManagement.getUserProfile(userId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user profile'
      setError(errorMessage)
      return null
    }
  }, [isInitialized])

  const updateUserProfile = useCallback(async (userId: string, profile: Partial<UserProfile>): Promise<void> => {
    if (!isInitialized) throw new Error('User management not initialized')
    
    try {
      await userManagement.updateUserProfile(userId, profile)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user profile'
      setError(errorMessage)
      throw error
    }
  }, [isInitialized])

  const getUserPreferences = useCallback(async (userId: string): Promise<UserPreferences | null> => {
    if (!isInitialized) return null
    
    try {
      return await userManagement.getUserPreferences(userId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user preferences'
      setError(errorMessage)
      return null
    }
  }, [isInitialized])

  const updateUserPreferences = useCallback(async (userId: string, preferences: Partial<UserPreferences>): Promise<void> => {
    if (!isInitialized) throw new Error('User management not initialized')
    
    try {
      await userManagement.updateUserPreferences(userId, preferences)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user preferences'
      setError(errorMessage)
      throw error
    }
  }, [isInitialized])

  const refreshUser = useCallback(async (userId: string): Promise<void> => {
    if (!isInitialized) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const user = await userManagement.getUserById(userId)
      setCurrentUser(user)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh user'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const setCurrentUserCallback = useCallback((user: User | null) => {
    setCurrentUser(user)
  }, [])

  const clearCurrentUser = useCallback(() => {
    setCurrentUser(null)
  }, [])

  return {
    currentUser,
    isLoading,
    error,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    getUserProfile,
    updateUserProfile,
    getUserPreferences,
    updateUserPreferences,
    setCurrentUser: setCurrentUserCallback,
    clearCurrentUser,
    refreshUser,
    isInitialized
  }
}