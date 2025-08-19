// Export all types from user module
export * from './user';

// Re-export commonly used types for convenience
export type {
  User,
  UserPreferences,
  UserProfile,
  LearningProgress,
  ContentItem,
  LessonContent,
  AnalyticsEvent,
  LearningAnalytics,
  ProgressSnapshot,
  LearningGoal,
} from './user';