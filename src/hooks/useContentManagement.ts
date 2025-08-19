import { useCallback, useEffect, useState } from 'react'
import { contentManagement } from '../services/contentManagement'
import { ContentItem, LessonContent } from '../types/user'

interface UseContentManagementReturn {
  isLoading: boolean
  error: string | null
  
  // Content operations
  getContent: (contentId: string) => Promise<ContentItem | null>
  getAllContent: () => Promise<ContentItem[]>
  getContentByType: (type: 'lesson' | 'exercise' | 'quiz' | 'resource') => Promise<ContentItem[]>
  getContentBySubject: (subject: string) => Promise<ContentItem[]>
  searchContent: (query: string, filters?: any) => Promise<ContentItem[]>
  
  // User interactions
  trackContentInteraction: (userId: string, contentId: string, interactionType: string, data?: any) => Promise<void>
  
  // Favorites and bookmarks
  addToFavorites: (userId: string, contentId: string) => Promise<void>
  removeFromFavorites: (userId: string, contentId: string) => Promise<void>
  getFavorites: (userId: string) => Promise<ContentItem[]>
  addBookmark: (userId: string, contentId: string, position?: number) => Promise<void>
  removeBookmark: (userId: string, contentId: string) => Promise<void>
  getBookmarks: (userId: string) => Promise<Array<ContentItem & { position: number }>>
  
  // Recommendations
  getRecommendations: (userId: string, limit?: number) => Promise<ContentItem[]>
  
  isInitialized: boolean
}

export const useContentManagement = (): UseContentManagementReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeContentManagement = async () => {
      try {
        await contentManagement.initialize()
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize content management:', error)
        setError('Failed to initialize content management')
      }
    }

    initializeContentManagement()
  }, [])

  const getContent = useCallback(async (contentId: string): Promise<ContentItem | null> => {
    if (!isInitialized) return null
    
    setIsLoading(true)
    setError(null)
    
    try {
      const content = await contentManagement.getContentById(contentId)
      return content
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get content'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const getAllContent = useCallback(async (): Promise<ContentItem[]> => {
    if (!isInitialized) return []
    
    setIsLoading(true)
    setError(null)
    
    try {
      const content = await contentManagement.getAllContent()
      return content
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get all content'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const getContentByType = useCallback(async (type: 'lesson' | 'exercise' | 'quiz' | 'resource'): Promise<ContentItem[]> => {
    if (!isInitialized) return []
    
    setIsLoading(true)
    setError(null)
    
    try {
      const content = await contentManagement.getContentByType(type)
      return content
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get content by type'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const getContentBySubject = useCallback(async (subject: string): Promise<ContentItem[]> => {
    if (!isInitialized) return []
    
    setIsLoading(true)
    setError(null)
    
    try {
      const content = await contentManagement.getContentBySubject(subject)
      return content
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get content by subject'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const searchContent = useCallback(async (query: string, filters?: any): Promise<ContentItem[]> => {
    if (!isInitialized) return []
    
    setIsLoading(true)
    setError(null)
    
    try {
      const content = await contentManagement.searchContent(query, filters)
      return content
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search content'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const trackContentInteraction = useCallback(async (userId: string, contentId: string, interactionType: string, data?: any): Promise<void> => {
    if (!isInitialized) return
    
    try {
      await contentManagement.trackContentInteraction(userId, contentId, interactionType, data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to track content interaction'
      setError(errorMessage)
    }
  }, [isInitialized])

  const addToFavorites = useCallback(async (userId: string, contentId: string): Promise<void> => {
    if (!isInitialized) return
    
    try {
      await contentManagement.addToFavorites(userId, contentId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to favorites'
      setError(errorMessage)
    }
  }, [isInitialized])

  const removeFromFavorites = useCallback(async (userId: string, contentId: string): Promise<void> => {
    if (!isInitialized) return
    
    try {
      await contentManagement.removeFromFavorites(userId, contentId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove from favorites'
      setError(errorMessage)
    }
  }, [isInitialized])

  const getFavorites = useCallback(async (userId: string): Promise<ContentItem[]> => {
    if (!isInitialized) return []
    
    try {
      const favorites = await contentManagement.getUserFavorites(userId)
      return favorites
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get favorites'
      setError(errorMessage)
      return []
    }
  }, [isInitialized])

  const addBookmark = useCallback(async (userId: string, contentId: string, position?: number): Promise<void> => {
    if (!isInitialized) return
    
    try {
      await contentManagement.addBookmark(userId, contentId, position)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add bookmark'
      setError(errorMessage)
    }
  }, [isInitialized])

  const removeBookmark = useCallback(async (userId: string, contentId: string): Promise<void> => {
    if (!isInitialized) return
    
    try {
      await contentManagement.removeBookmark(userId, contentId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove bookmark'
      setError(errorMessage)
    }
  }, [isInitialized])

  const getBookmarks = useCallback(async (userId: string): Promise<Array<ContentItem & { position: number }>> => {
    if (!isInitialized) return []
    
    try {
      const bookmarks = await contentManagement.getUserBookmarks(userId)
      return bookmarks
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get bookmarks'
      setError(errorMessage)
      return []
    }
  }, [isInitialized])

  const getRecommendations = useCallback(async (userId: string, limit?: number): Promise<ContentItem[]> => {
    if (!isInitialized) return []
    
    try {
      const recommendations = await contentManagement.getRecommendedContent(userId, limit)
      return recommendations
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get recommendations'
      setError(errorMessage)
      return []
    }
  }, [isInitialized])

  return {
    isLoading,
    error,
    getContent,
    getAllContent,
    getContentByType,
    getContentBySubject,
    searchContent,
    trackContentInteraction,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    addBookmark,
    removeBookmark,
    getBookmarks,
    getRecommendations,
    isInitialized
  }
}