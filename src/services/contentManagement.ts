import { openDB, IDBPDatabase } from 'idb';
import { ContentItem, AnalyticsEvent } from '../types';
import { analytics } from './analytics';
import { monitoring } from './monitoring';

// Database configuration
const DB_NAME = 'EduAI_ContentManagement';
const DB_VERSION = 1;
const CONTENT_STORE = 'content';
const ANALYTICS_STORE = 'analytics';
const FAVORITES_STORE = 'favorites';
const BOOKMARKS_STORE = 'bookmarks';

// Content Management Database
let db: IDBPDatabase | null = null;

// Initialize Content Management Database
export const initializeContentManagement = async (): Promise<void> => {
  try {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Content store
        if (!db.objectStoreNames.contains(CONTENT_STORE)) {
          const contentStore = db.createObjectStore(CONTENT_STORE, { keyPath: 'id' });
          contentStore.createIndex('type', 'type', { unique: false });
          contentStore.createIndex('subject', 'subject', { unique: false });
          contentStore.createIndex('gradeLevel', 'gradeLevel', { unique: false });
          contentStore.createIndex('difficulty', 'difficulty', { unique: false });
          contentStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
          contentStore.createIndex('isPublished', 'isPublished', { unique: false });
          contentStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Analytics store for content interactions
        if (!db.objectStoreNames.contains(ANALYTICS_STORE)) {
          const analyticsStore = db.createObjectStore(ANALYTICS_STORE, { keyPath: 'id' });
          analyticsStore.createIndex('userId', 'userId', { unique: false });
          analyticsStore.createIndex('contentId', 'contentId', { unique: false });
          analyticsStore.createIndex('eventType', 'eventType', { unique: false });
          analyticsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Favorites store
        if (!db.objectStoreNames.contains(FAVORITES_STORE)) {
          const favoritesStore = db.createObjectStore(FAVORITES_STORE, { keyPath: ['userId', 'contentId'] });
          favoritesStore.createIndex('userId', 'userId', { unique: false });
          favoritesStore.createIndex('contentId', 'contentId', { unique: false });
        }

        // Bookmarks store
        if (!db.objectStoreNames.contains(BOOKMARKS_STORE)) {
          const bookmarksStore = db.createObjectStore(BOOKMARKS_STORE, { keyPath: ['userId', 'contentId'] });
          bookmarksStore.createIndex('userId', 'userId', { unique: false });
          bookmarksStore.createIndex('contentId', 'contentId', { unique: false });
        }
      },
    });

    console.log('Content Management database initialized');
  } catch (error) {
    console.error('Failed to initialize Content Management database:', error);
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'database', operation: 'initialize_content_management' },
    });
    throw error;
  }
};

// Content CRUD Operations
export const createContent = async (contentData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentItem> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const content: ContentItem = {
      ...contentData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.add(CONTENT_STORE, content);

    analytics.trackUser('content_created', 'content_management', content.type);
    monitoring.trackFeatureUsage('content_creation', {
      additional: { 
        contentType: content.type,
        subject: content.subject,
        difficulty: content.difficulty 
      },
    });

    return content;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'create_content' },
    });
    throw error;
  }
};

export const getContentById = async (contentId: string): Promise<ContentItem | null> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const content = await db.get(CONTENT_STORE, contentId);
    return content || null;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'get_content' },
      extra: { contentId },
    });
    throw error;
  }
};

export const updateContent = async (contentId: string, updates: Partial<ContentItem>): Promise<ContentItem> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const existingContent = await getContentById(contentId);
    if (!existingContent) {
      throw new Error('Content not found');
    }

    const updatedContent: ContentItem = {
      ...existingContent,
      ...updates,
      id: contentId, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    await db.put(CONTENT_STORE, updatedContent);

    analytics.trackUser('content_updated', 'content_management', updatedContent.type);
    monitoring.trackFeatureUsage('content_update', {
      additional: { contentId, contentType: updatedContent.type },
    });

    return updatedContent;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'update_content' },
      extra: { contentId },
    });
    throw error;
  }
};

export const deleteContent = async (contentId: string): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    await db.delete(CONTENT_STORE, contentId);

    analytics.trackUser('content_deleted', 'content_management');
    monitoring.trackFeatureUsage('content_deletion', {
      additional: { contentId },
    });
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'delete_content' },
      extra: { contentId },
    });
    throw error;
  }
};

// Content Discovery and Search
export const getAllContent = async (filters?: {
  type?: string;
  subject?: string;
  gradeLevel?: string;
  difficulty?: string;
  isPublished?: boolean;
}): Promise<ContentItem[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    let content: ContentItem[];

    if (!filters) {
      content = await db.getAll(CONTENT_STORE);
    } else {
      // Apply filters
      content = await db.getAll(CONTENT_STORE);
      content = content.filter(item => {
        if (filters.type && item.type !== filters.type) return false;
        if (filters.subject && item.subject !== filters.subject) return false;
        if (filters.gradeLevel && item.gradeLevel !== filters.gradeLevel) return false;
        if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
        if (filters.isPublished !== undefined && item.isPublished !== filters.isPublished) return false;
        return true;
      });
    }

    return content.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'get_all_content' },
      extra: { filters },
    });
    throw error;
  }
};

export const searchContent = async (query: string, filters?: {
  type?: string;
  subject?: string;
  gradeLevel?: string;
  difficulty?: string;
}): Promise<ContentItem[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const allContent = await getAllContent({ ...filters, isPublished: true });
    const lowercaseQuery = query.toLowerCase();
    
    const results = allContent.filter(content => 
      content.title.toLowerCase().includes(lowercaseQuery) ||
      content.description.toLowerCase().includes(lowercaseQuery) ||
      content.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      content.subject.toLowerCase().includes(lowercaseQuery)
    );

    // Track search analytics
    analytics.trackUser('content_search', 'content_management', query);
    monitoring.trackFeatureUsage('content_search', {
      additional: { query, resultsCount: results.length },
    });

    return results;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'search_content' },
      extra: { query, filters },
    });
    throw error;
  }
};

export const getContentBySubject = async (subject: string): Promise<ContentItem[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    return await db.getAllFromIndex(CONTENT_STORE, 'subject', subject);
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'get_content_by_subject' },
      extra: { subject },
    });
    throw error;
  }
};

export const getContentByType = async (type: string): Promise<ContentItem[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    return await db.getAllFromIndex(CONTENT_STORE, 'type', type);
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'get_content_by_type' },
      extra: { type },
    });
    throw error;
  }
};

export const getContentByGradeLevel = async (gradeLevel: string): Promise<ContentItem[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    return await db.getAllFromIndex(CONTENT_STORE, 'gradeLevel', gradeLevel);
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'get_content_by_grade' },
      extra: { gradeLevel },
    });
    throw error;
  }
};

// Content Analytics and Tracking
export const trackContentInteraction = async (userId: string, contentId: string, eventType: string, properties?: Record<string, any>): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const analyticsEvent: AnalyticsEvent = {
      id: crypto.randomUUID(),
      userId,
      eventType,
      category: 'content_interaction',
      action: eventType,
      properties: properties || {},
      timestamp: new Date(),
    };

    await db.add(ANALYTICS_STORE, analyticsEvent);

    // Track in external analytics
    analytics.trackLearning(eventType as any, {
      lessonId: contentId,
      ...properties,
    });

    monitoring.trackFeatureUsage('content_interaction', {
      userId,
      additional: { contentId, eventType, ...properties },
    });
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'track_interaction' },
      extra: { userId, contentId, eventType },
    });
    throw error;
  }
};

export const getContentAnalytics = async (contentId: string): Promise<{
  views: number;
  completions: number;
  averageTimeSpent: number;
  interactions: AnalyticsEvent[];
}> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const interactions = await db.getAllFromIndex(ANALYTICS_STORE, 'contentId', contentId);
    
    const views = interactions.filter(event => event.eventType === 'content_view').length;
    const completions = interactions.filter(event => event.eventType === 'content_complete').length;
    
    const timeSpentEvents = interactions.filter(event => event.properties.timeSpent);
    const averageTimeSpent = timeSpentEvents.length > 0 
      ? timeSpentEvents.reduce((sum, event) => sum + (event.properties.timeSpent || 0), 0) / timeSpentEvents.length
      : 0;

    return {
      views,
      completions,
      averageTimeSpent,
      interactions,
    };
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'get_content_analytics' },
      extra: { contentId },
    });
    throw error;
  }
};

// User Content Preferences
export const addToFavorites = async (userId: string, contentId: string): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const favorite = {
      userId,
      contentId,
      addedAt: new Date(),
    };

    await db.add(FAVORITES_STORE, favorite);

    analytics.trackUser('content_favorited', 'content_management');
    monitoring.trackFeatureUsage('add_favorite', {
      userId,
      additional: { contentId },
    });
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'add_favorite' },
      extra: { userId, contentId },
    });
    throw error;
  }
};

export const removeFromFavorites = async (userId: string, contentId: string): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    await db.delete(FAVORITES_STORE, [userId, contentId]);

    analytics.trackUser('content_unfavorited', 'content_management');
    monitoring.trackFeatureUsage('remove_favorite', {
      userId,
      additional: { contentId },
    });
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'remove_favorite' },
      extra: { userId, contentId },
    });
    throw error;
  }
};

export const getUserFavorites = async (userId: string): Promise<ContentItem[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const favorites = await db.getAllFromIndex(FAVORITES_STORE, 'userId', userId);
    const contentIds = favorites.map(fav => fav.contentId);
    
    const favoriteContent: ContentItem[] = [];
    for (const contentId of contentIds) {
      const content = await getContentById(contentId);
      if (content) {
        favoriteContent.push(content);
      }
    }

    return favoriteContent;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'get_user_favorites' },
      extra: { userId },
    });
    throw error;
  }
};

export const addBookmark = async (userId: string, contentId: string, position?: number): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const bookmark = {
      userId,
      contentId,
      position: position || 0,
      addedAt: new Date(),
    };

    await db.add(BOOKMARKS_STORE, bookmark);

    analytics.trackUser('content_bookmarked', 'content_management');
    monitoring.trackFeatureUsage('add_bookmark', {
      userId,
      additional: { contentId, position },
    });
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'add_bookmark' },
      extra: { userId, contentId },
    });
    throw error;
  }
};

export const removeBookmark = async (userId: string, contentId: string): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    await db.delete(BOOKMARKS_STORE, [userId, contentId]);

    analytics.trackUser('content_unbookmarked', 'content_management');
    monitoring.trackFeatureUsage('remove_bookmark', {
      userId,
      additional: { contentId },
    });
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'remove_bookmark' },
      extra: { userId, contentId },
    });
    throw error;
  }
};

export const getUserBookmarks = async (userId: string): Promise<Array<ContentItem & { position: number }>> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const bookmarks = await db.getAllFromIndex(BOOKMARKS_STORE, 'userId', userId);
    
    const bookmarkedContent: Array<ContentItem & { position: number }> = [];
    for (const bookmark of bookmarks) {
      const content = await getContentById(bookmark.contentId);
      if (content) {
        bookmarkedContent.push({
          ...content,
          position: bookmark.position,
        });
      }
    }

    return bookmarkedContent.sort((a, b) => a.position - b.position);
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'get_user_bookmarks' },
      extra: { userId },
    });
    throw error;
  }
};

// Content Recommendations
export const getRecommendedContent = async (userId: string, limit: number = 10): Promise<ContentItem[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    // Get user's interaction history
    const userInteractions = await db.getAllFromIndex(ANALYTICS_STORE, 'userId', userId);
    
    // Analyze user preferences
    const subjectCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    
    for (const interaction of userInteractions) {
      const content = await getContentById(interaction.contentId);
      if (content) {
        subjectCounts[content.subject] = (subjectCounts[content.subject] || 0) + 1;
        typeCounts[content.type] = (typeCounts[content.type] || 0) + 1;
      }
    }

    // Get top preferences
    const topSubjects = Object.entries(subjectCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([subject]) => subject);
    
    const topTypes = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([type]) => type);

    // Get content based on preferences
    const allContent = await getAllContent({ isPublished: true });
    const interactedContentIds = new Set(userInteractions.map(i => i.contentId));
    
    const recommendations = allContent
      .filter(content => !interactedContentIds.has(content.id))
      .filter(content => 
        topSubjects.includes(content.subject) || 
        topTypes.includes(content.type)
      )
      .sort(() => Math.random() - 0.5) // Randomize
      .slice(0, limit);

    analytics.trackUser('recommendations_generated', 'content_management', userId);
    monitoring.trackFeatureUsage('content_recommendations', {
      userId,
      additional: { recommendationsCount: recommendations.length },
    });

    return recommendations;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'content_management', operation: 'get_recommendations' },
      extra: { userId },
    });
    throw error;
  }
};

// Export content management instance
export const contentManagement = {
  initialize: initializeContentManagement,
  createContent,
  getContentById,
  updateContent,
  deleteContent,
  getAllContent,
  searchContent,
  getContentBySubject,
  getContentByType,
  getContentByGradeLevel,
  trackContentInteraction,
  getContentAnalytics,
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  getRecommendedContent,
};

export default contentManagement;