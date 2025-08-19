import { openDB, IDBPDatabase } from 'idb';
import { User, UserPreferences, UserProfile, LearningProgress } from '../types';
import { analytics } from './analytics';
import { monitoring } from './monitoring';

// Database configuration
const DB_NAME = 'EduAI_UserManagement';
const DB_VERSION = 1;
const USERS_STORE = 'users';
const PREFERENCES_STORE = 'preferences';
const PROFILES_STORE = 'profiles';
const PROGRESS_STORE = 'progress';

// User Management Database
let db: IDBPDatabase | null = null;

// Initialize User Management Database
export const initializeUserManagement = async (): Promise<void> => {
  try {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Users store
        if (!db.objectStoreNames.contains(USERS_STORE)) {
          const usersStore = db.createObjectStore(USERS_STORE, { keyPath: 'id' });
          usersStore.createIndex('email', 'email', { unique: true });
          usersStore.createIndex('username', 'username', { unique: false });
          usersStore.createIndex('userType', 'userType', { unique: false });
        }

        // Preferences store
        if (!db.objectStoreNames.contains(PREFERENCES_STORE)) {
          db.createObjectStore(PREFERENCES_STORE, { keyPath: 'userId' });
        }

        // Profiles store
        if (!db.objectStoreNames.contains(PROFILES_STORE)) {
          const profilesStore = db.createObjectStore(PROFILES_STORE, { keyPath: 'userId' });
          profilesStore.createIndex('gradeLevel', 'gradeLevel', { unique: false });
          profilesStore.createIndex('subjects', 'subjects', { unique: false, multiEntry: true });
        }

        // Progress store
        if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
          const progressStore = db.createObjectStore(PROGRESS_STORE, { keyPath: 'userId' });
          progressStore.createIndex('lastActivity', 'lastActivity', { unique: false });
          progressStore.createIndex('totalPoints', 'totalPoints', { unique: false });
        }
      },
    });

    console.log('User Management database initialized');
  } catch (error) {
    console.error('Failed to initialize User Management database:', error);
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'database', operation: 'initialize_user_management' },
    });
    throw error;
  }
};

// User Management Functions
export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const user: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.add(USERS_STORE, user);

    // Create default preferences
    await createDefaultPreferences(user.id);

    // Create default profile
    await createDefaultProfile(user.id, userData.userType);

    // Initialize progress tracking
    await initializeUserProgress(user.id);

    analytics.trackUser('user_created', 'user_management', user.userType);
    monitoring.trackFeatureUsage('user_creation', {
      userId: user.id,
      success: true,
      additional: { userType: user.userType },
    });

    return user;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'user_management', operation: 'create_user' },
    });
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const user = await db.get(USERS_STORE, userId);
    return user || null;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'user_management', operation: 'get_user' },
      extra: { userId },
    });
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const user = await db.getFromIndex(USERS_STORE, 'email', email);
    return user || null;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'user_management', operation: 'get_user_by_email' },
      extra: { email },
    });
    throw error;
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser: User = {
      ...existingUser,
      ...updates,
      id: userId, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    await db.put(USERS_STORE, updatedUser);

    analytics.trackUser('user_updated', 'user_management');
    monitoring.trackFeatureUsage('user_update', {
      userId,
      success: true,
    });

    return updatedUser;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'user_management', operation: 'update_user' },
      extra: { userId },
    });
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    // Delete user data from all stores
    await Promise.all([
      db.delete(USERS_STORE, userId),
      db.delete(PREFERENCES_STORE, userId),
      db.delete(PROFILES_STORE, userId),
      db.delete(PROGRESS_STORE, userId),
    ]);

    analytics.trackUser('user_deleted', 'user_management');
    monitoring.trackFeatureUsage('user_deletion', {
      userId,
      success: true,
    });
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'user_management', operation: 'delete_user' },
      extra: { userId },
    });
    throw error;
  }
};

// User Preferences Management
const createDefaultPreferences = async (userId: string): Promise<UserPreferences> => {
  if (!db) throw new Error('Database not initialized');

  const defaultPreferences: UserPreferences = {
    userId,
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      reminders: true,
      achievements: true,
    },
    privacy: {
      shareProgress: false,
      allowAnalytics: true,
      showInLeaderboard: true,
    },
    learning: {
      difficulty: 'medium',
      autoAdvance: false,
      showHints: true,
      soundEffects: true,
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      screenReader: false,
      reducedMotion: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.add(PREFERENCES_STORE, defaultPreferences);
  return defaultPreferences;
};

export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const preferences = await db.get(PREFERENCES_STORE, userId);
    return preferences || null;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'user_management', operation: 'get_preferences' },
      extra: { userId },
    });
    throw error;
  }
};

export const updateUserPreferences = async (userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const existingPreferences = await getUserPreferences(userId);
    if (!existingPreferences) {
      throw new Error('User preferences not found');
    }

    const updatedPreferences: UserPreferences = {
      ...existingPreferences,
      ...updates,
      userId, // Ensure userId doesn't change
      updatedAt: new Date(),
    };

    await db.put(PREFERENCES_STORE, updatedPreferences);

    analytics.trackUser('preferences_updated', 'user_management');
    monitoring.trackFeatureUsage('preferences_update', {
      userId,
      success: true,
    });

    return updatedPreferences;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'user_management', operation: 'update_preferences' },
      extra: { userId },
    });
    throw error;
  }
};

// User Profile Management
const createDefaultProfile = async (userId: string, userType: 'student' | 'teacher' | 'admin'): Promise<UserProfile> => {
  if (!db) throw new Error('Database not initialized');

  const defaultProfile: UserProfile = {
    userId,
    displayName: '',
    avatar: '',
    bio: '',
    gradeLevel: userType === 'student' ? '6' : undefined,
    subjects: [],
    interests: [],
    goals: [],
    achievements: [],
    badges: [],
    socialLinks: {},
    stats: {
      totalLessons: 0,
      totalExercises: 0,
      totalQuizzes: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      streak: 0,
      level: 1,
      points: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.add(PROFILES_STORE, defaultProfile);
  return defaultProfile;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const profile = await db.get(PROFILES_STORE, userId);
    return profile || null;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'user_management', operation: 'get_profile' },
      extra: { userId },
    });
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const existingProfile = await getUserProfile(userId);
    if (!existingProfile) {
      throw new Error('User profile not found');
    }

    const updatedProfile: UserProfile = {
      ...existingProfile,
      ...updates,
      userId, // Ensure userId doesn't change
      updatedAt: new Date(),
    };

    await db.put(PROFILES_STORE, updatedProfile);

    analytics.trackUser('profile_updated', 'user_management');
    monitoring.trackFeatureUsage('profile_update', {
      userId,
      success: true,
    });

    return updatedProfile;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'user_management', operation: 'update_profile' },
      extra: { userId },
    });
    throw error;
  }
};

// Learning Progress Management
const initializeUserProgress = async (userId: string): Promise<LearningProgress> => {
  if (!db) throw new Error('Database not initialized');

  const initialProgress: LearningProgress = {
    userId,
    totalLessonsCompleted: 0,
    totalExercisesCompleted: 0,
    totalQuizzesCompleted: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    points: 0,
    lastActivity: new Date(),
    completedLessons: [],
    completedExercises: [],
    completedQuizzes: [],
    subjectProgress: {},
    weeklyGoals: {
      lessonsTarget: 5,
      exercisesTarget: 10,
      timeTarget: 300, // 5 hours in minutes
      lessonsCompleted: 0,
      exercisesCompleted: 0,
      timeSpent: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.add(PROGRESS_STORE, initialProgress);
  return initialProgress;
};

export const getUserProgress = async (userId: string): Promise<LearningProgress | null> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const progress = await db.get(PROGRESS_STORE, userId);
    return progress || null;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'user_management', operation: 'get_progress' },
      extra: { userId },
    });
    throw error;
  }
};

export const updateUserProgress = async (userId: string, updates: Partial<LearningProgress>): Promise<LearningProgress> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const existingProgress = await getUserProgress(userId);
    if (!existingProgress) {
      throw new Error('User progress not found');
    }

    const updatedProgress: LearningProgress = {
      ...existingProgress,
      ...updates,
      userId, // Ensure userId doesn't change
      lastActivity: new Date(),
      updatedAt: new Date(),
    };

    await db.put(PROGRESS_STORE, updatedProgress);

    // Track progress analytics
    analytics.trackProgress(userId, {
      totalLessonsCompleted: updatedProgress.totalLessonsCompleted,
      totalExercisesCompleted: updatedProgress.totalExercisesCompleted,
      totalQuizzesCompleted: updatedProgress.totalQuizzesCompleted,
      averageScore: updatedProgress.averageScore,
      totalTimeSpent: updatedProgress.totalTimeSpent,
      currentStreak: updatedProgress.currentStreak,
      level: updatedProgress.level,
      points: updatedProgress.points,
    });

    monitoring.trackFeatureUsage('progress_update', {
      userId,
      success: true,
    });

    return updatedProgress;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'user_management', operation: 'update_progress' },
      extra: { userId },
    });
    throw error;
  }
};

// Utility Functions
export const getAllUsers = async (): Promise<User[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    return await db.getAll(USERS_STORE);
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'user_management', operation: 'get_all_users' },
    });
    throw error;
  }
};

export const getUsersByType = async (userType: 'student' | 'teacher' | 'admin'): Promise<User[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    return await db.getAllFromIndex(USERS_STORE, 'userType', userType);
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'user_management', operation: 'get_users_by_type' },
      extra: { userType },
    });
    throw error;
  }
};

export const searchUsers = async (query: string): Promise<User[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const allUsers = await getAllUsers();
    const lowercaseQuery = query.toLowerCase();
    
    return allUsers.filter(user => 
      user.username.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery) ||
      (user.firstName && user.firstName.toLowerCase().includes(lowercaseQuery)) ||
      (user.lastName && user.lastName.toLowerCase().includes(lowercaseQuery))
    );
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'user_management', operation: 'search_users' },
      extra: { query },
    });
    throw error;
  }
};

// Export user management instance
export const userManagement = {
  initialize: initializeUserManagement,
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  getUserPreferences,
  updateUserPreferences,
  getUserProfile,
  updateUserProfile,
  getUserProgress,
  updateUserProgress,
  getAllUsers,
  getUsersByType,
  searchUsers,
};

export default userManagement;