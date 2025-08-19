import { useCallback, useEffect, useState } from 'react'
import { progressTracking } from '../services/progressTracking'
import { LearningProgress, LearningAnalytics, Achievement, Badge, LearningGoal, ProgressSnapshot, SubjectProgress } from '../types/user'

interface UseProgressTrackingReturn {
  isLoading: boolean
  error: string | null
  getUserProgress: (userId: string) => Promise<LearningProgress | null>
  getSubjectProgress: (userId: string, subject: string) => Promise<SubjectProgress | null>
  updateProgress: (userId: string, subject: string, progressData: Partial<SubjectProgress>) => Promise<LearningProgress>
  createLearningSession: (userId: string, contentId: string, contentType: 'lesson' | 'exercise' | 'quiz') => Promise<LearningAnalytics>
  recordLessonCompletion: (userId: string, lessonId: string, subject: string, timeSpent: number, score?: number) => Promise<void>
  getUserAchievements: (userId: string) => Promise<Achievement[]>
  awardAchievement: (userId: string, achievementData: Omit<Achievement, 'id' | 'unlockedAt'>) => Promise<Achievement>
  getUserBadges: (userId: string) => Promise<Badge[]>
  awardBadge: (userId: string, badgeData: Omit<Badge, 'id' | 'earnedAt'>) => Promise<Badge>
  createLearningGoal: (userId: string, goalData: Omit<LearningGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<LearningGoal>
  getUserGoals: (userId: string) => Promise<LearningGoal[]>
  updateGoalProgress: (goalId: string, progressUpdate: Partial<LearningGoal['progress']>) => Promise<LearningGoal>
  createProgressSnapshot: (userId: string) => Promise<ProgressSnapshot>
  getUserSnapshots: (userId: string, limit?: number) => Promise<ProgressSnapshot[]>
  generateDetailedAnalytics: (userId: string, dateRange?: { start: Date; end: Date }) => Promise<any>
  isInitialized: boolean
}

export const useProgressTracking = (): UseProgressTrackingReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeProgressTracking = async () => {
      try {
        await progressTracking.initialize()
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize progress tracking:', error)
        setError('Failed to initialize progress tracking')
      }
    }

    initializeProgressTracking()
  }, [])

  const getUserProgress = useCallback(async (userId: string): Promise<LearningProgress | null> => {
    if (!isInitialized) return null
    
    setIsLoading(true)
    setError(null)
    
    try {
      const progress = await progressTracking.getUserProgress(userId)
      return progress
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user progress'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const getSubjectProgress = useCallback(async (userId: string, subject: string): Promise<SubjectProgress | null> => {
    if (!isInitialized) return null
    
    setIsLoading(true)
    setError(null)
    
    try {
      const progress = await progressTracking.getSubjectProgress(userId, subject)
      return progress
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get subject progress'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const updateProgress = useCallback(async (userId: string, subject: string, progressData: Partial<SubjectProgress>): Promise<LearningProgress> => {
    if (!isInitialized) throw new Error('Progress tracking not initialized')
    
    setIsLoading(true)
    setError(null)
    
    try {
      const progress = await progressTracking.updateProgress(userId, subject, progressData)
      return progress
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update progress'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const createLearningSession = useCallback(async (userId: string, contentId: string, contentType: 'lesson' | 'exercise' | 'quiz'): Promise<LearningAnalytics> => {
    if (!isInitialized) throw new Error('Progress tracking not initialized')
    
    setIsLoading(true)
    setError(null)
    
    try {
      const session = await progressTracking.createLearningSession(userId, contentId, contentType)
      return session
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create learning session'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const recordLessonCompletion = useCallback(async (userId: string, lessonId: string, subject: string, timeSpent: number, score?: number): Promise<void> => {
    if (!isInitialized) return
    
    try {
      await progressTracking.recordLessonCompletion(userId, lessonId, subject, timeSpent, score)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to record lesson completion'
      setError(errorMessage)
    }
  }, [isInitialized])

  const getUserAchievements = useCallback(async (userId: string): Promise<Achievement[]> => {
    if (!isInitialized) return []
    
    try {
      const achievements = await progressTracking.getUserAchievements(userId)
      return achievements
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get achievements'
      setError(errorMessage)
      return []
    }
  }, [isInitialized])

  const awardAchievement = useCallback(async (userId: string, achievementData: Omit<Achievement, 'id' | 'unlockedAt'>): Promise<Achievement> => {
    if (!isInitialized) throw new Error('Progress tracking not initialized')
    
    try {
      const achievement = await progressTracking.awardAchievement(userId, achievementData)
      return achievement
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to award achievement'
      setError(errorMessage)
      throw error
    }
  }, [isInitialized])

  const getUserBadges = useCallback(async (userId: string): Promise<Badge[]> => {
    if (!isInitialized) return []
    
    try {
      const badges = await progressTracking.getUserBadges(userId)
      return badges
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get badges'
      setError(errorMessage)
      return []
    }
  }, [isInitialized])

  const awardBadge = useCallback(async (userId: string, badgeData: Omit<Badge, 'id' | 'earnedAt'>): Promise<Badge> => {
    if (!isInitialized) throw new Error('Progress tracking not initialized')
    
    try {
      const badge = await progressTracking.awardBadge(userId, badgeData)
      return badge
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to award badge'
      setError(errorMessage)
      throw error
    }
  }, [isInitialized])

  const createLearningGoal = useCallback(async (userId: string, goalData: Omit<LearningGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<LearningGoal> => {
    if (!isInitialized) throw new Error('Progress tracking not initialized')
    
    try {
      const goal = await progressTracking.createLearningGoal(userId, goalData)
      return goal
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create learning goal'
      setError(errorMessage)
      throw error
    }
  }, [isInitialized])

  const getUserGoals = useCallback(async (userId: string): Promise<LearningGoal[]> => {
    if (!isInitialized) return []
    
    try {
      const goals = await progressTracking.getUserGoals(userId)
      return goals
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get goals'
      setError(errorMessage)
      return []
    }
  }, [isInitialized])

  const updateGoalProgress = useCallback(async (goalId: string, progressUpdate: Partial<LearningGoal['progress']>): Promise<LearningGoal> => {
    if (!isInitialized) throw new Error('Progress tracking not initialized')
    
    try {
      const goal = await progressTracking.updateGoalProgress(goalId, progressUpdate)
      return goal
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update goal progress'
      setError(errorMessage)
      throw error
    }
  }, [isInitialized])

  const createProgressSnapshot = useCallback(async (userId: string): Promise<ProgressSnapshot> => {
    if (!isInitialized) throw new Error('Progress tracking not initialized')
    
    try {
      const snapshot = await progressTracking.createProgressSnapshot(userId)
      return snapshot
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create progress snapshot'
      setError(errorMessage)
      throw error
    }
  }, [isInitialized])

  const getUserSnapshots = useCallback(async (userId: string, limit?: number): Promise<ProgressSnapshot[]> => {
    if (!isInitialized) return []
    
    try {
      const snapshots = await progressTracking.getUserSnapshots(userId, limit)
      return snapshots
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get snapshots'
      setError(errorMessage)
      return []
    }
  }, [isInitialized])

  const generateDetailedAnalytics = useCallback(async (userId: string, dateRange?: { start: Date; end: Date }): Promise<any> => {
    if (!isInitialized) return null
    
    setIsLoading(true)
    setError(null)
    
    try {
      const analytics = await progressTracking.generateDetailedAnalytics(userId, dateRange)
      return analytics
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate analytics'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  return {
    isLoading,
    error,
    getUserProgress,
    getSubjectProgress,
    updateProgress,
    createLearningSession,
    recordLessonCompletion,
    getUserAchievements,
    awardAchievement,
    getUserBadges,
    awardBadge,
    createLearningGoal,
    getUserGoals,
    updateGoalProgress,
    createProgressSnapshot,
    getUserSnapshots,
    generateDetailedAnalytics,
    isInitialized
  }
}