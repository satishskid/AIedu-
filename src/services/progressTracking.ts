import { openDB, IDBPDatabase } from 'idb';
import { LearningProgress, SubjectProgress, Achievement, Badge, LearningGoal, ProgressSnapshot, LearningAnalytics } from '../types';
import { analytics } from './analytics';
import { monitoring } from './monitoring';

// Database configuration
const DB_NAME = 'EduAI_ProgressTracking';
const DB_VERSION = 1;
const PROGRESS_STORE = 'progress';
const ACHIEVEMENTS_STORE = 'achievements';
const BADGES_STORE = 'badges';
const GOALS_STORE = 'goals';
const SNAPSHOTS_STORE = 'snapshots';
const ANALYTICS_STORE = 'learning_analytics';

// Progress Tracking Database
let db: IDBPDatabase | null = null;

// Initialize Progress Tracking Database
export const initializeProgressTracking = async (): Promise<void> => {
  try {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Progress store
        if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
          const progressStore = db.createObjectStore(PROGRESS_STORE, { keyPath: 'userId' });
          progressStore.createIndex('lastActivity', 'lastActivity', { unique: false });
          progressStore.createIndex('level', 'level', { unique: false });
        }

        // Achievements store
        if (!db.objectStoreNames.contains(ACHIEVEMENTS_STORE)) {
          const achievementsStore = db.createObjectStore(ACHIEVEMENTS_STORE, { keyPath: 'id' });
          achievementsStore.createIndex('userId', 'userId', { unique: false });
          achievementsStore.createIndex('type', 'type', { unique: false });
          achievementsStore.createIndex('earnedAt', 'earnedAt', { unique: false });
        }

        // Badges store
        if (!db.objectStoreNames.contains(BADGES_STORE)) {
          const badgesStore = db.createObjectStore(BADGES_STORE, { keyPath: 'id' });
          badgesStore.createIndex('userId', 'userId', { unique: false });
          badgesStore.createIndex('category', 'category', { unique: false });
          badgesStore.createIndex('earnedAt', 'earnedAt', { unique: false });
        }

        // Goals store
        if (!db.objectStoreNames.contains(GOALS_STORE)) {
          const goalsStore = db.createObjectStore(GOALS_STORE, { keyPath: 'id' });
          goalsStore.createIndex('userId', 'userId', { unique: false });
          goalsStore.createIndex('status', 'status', { unique: false });
          goalsStore.createIndex('targetDate', 'targetDate', { unique: false });
        }

        // Snapshots store
        if (!db.objectStoreNames.contains(SNAPSHOTS_STORE)) {
          const snapshotsStore = db.createObjectStore(SNAPSHOTS_STORE, { keyPath: 'id' });
          snapshotsStore.createIndex('userId', 'userId', { unique: false });
          snapshotsStore.createIndex('date', 'date', { unique: false });
        }

        // Learning Analytics store
        if (!db.objectStoreNames.contains(ANALYTICS_STORE)) {
          const analyticsStore = db.createObjectStore(ANALYTICS_STORE, { keyPath: 'id' });
          analyticsStore.createIndex('userId', 'userId', { unique: false });
          analyticsStore.createIndex('date', 'date', { unique: false });
          analyticsStore.createIndex('subject', 'subject', { unique: false });
        }
      },
    });

    console.log('Progress Tracking database initialized');
  } catch (error) {
    console.error('Failed to initialize Progress Tracking database:', error);
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'database', operation: 'initialize_progress_tracking' },
    });
    throw error;
  }
};

// Progress Management
export const getUserProgress = async (userId: string): Promise<LearningProgress | null> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const progress = await db.get(PROGRESS_STORE, userId);
    return progress || null;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'get_user_progress' },
      extra: { userId },
    });
    throw error;
  }
};

export const getSubjectProgress = async (userId: string, subject: string): Promise<SubjectProgress | null> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const userProgress = await getUserProgress(userId);
    return userProgress?.subjectProgress[subject] || null;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'get_subject_progress' },
      extra: { userId, subject },
    });
    throw error;
  }
};

export const updateProgress = async (userId: string, subject: string, progressData: Partial<SubjectProgress>): Promise<LearningProgress> => {
  if (!db) throw new Error('Database not initialized');

  try {
    let userProgress = await getUserProgress(userId);
    
    if (!userProgress) {
      // Create new progress record
      userProgress = {
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
          timeTarget: 300,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          timeSpent: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Update subject progress
    const currentSubjectProgress = userProgress.subjectProgress[subject] || {
      subject,
      lessonsCompleted: 0,
      exercisesCompleted: 0,
      quizzesCompleted: 0,
      averageScore: 0,
      timeSpent: 0,
      level: 1,
      lastActivity: new Date(),
    };

    const updatedSubjectProgress: SubjectProgress = {
      ...currentSubjectProgress,
      ...progressData,
      lastActivity: new Date(),
    };

    // Update overall progress
    const updatedProgress: LearningProgress = {
      ...userProgress,
      subjectProgress: {
        ...userProgress.subjectProgress,
        [subject]: updatedSubjectProgress,
      },
      updatedAt: new Date(),
    };

    await db.put(PROGRESS_STORE, updatedProgress);

    // Track analytics
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
      additional: { subject, level: updatedSubjectProgress.level },
    });

    // Check for achievements
    await checkAndAwardAchievements(userId, updatedProgress);

    return updatedProgress;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'update_progress' },
      extra: { userId, subject },
    });
    throw error;
  }
};

export const recordLessonCompletion = async (userId: string, lessonId: string, subject: string, timeSpent: number, score?: number): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const currentSubjectProgress = await getSubjectProgress(userId, subject);
    const lessonsCompleted = (currentSubjectProgress?.lessonsCompleted || 0) + 1;
    const totalTimeSpent = (currentSubjectProgress?.timeSpent || 0) + timeSpent;
    const newAverageScore = score ? 
      ((currentSubjectProgress?.averageScore || 0) * (lessonsCompleted - 1) + score) / lessonsCompleted :
      currentSubjectProgress?.averageScore || 0;

    await updateProgress(userId, subject, {
      lessonsCompleted,
      timeSpent: totalTimeSpent,
      averageScore: newAverageScore,
      lastActivity: new Date(),
    });

    // Track lesson completion
    analytics.trackLearning('lesson_complete', {
      lessonId,
      subject,
      timeSpent,
      score,
    });

    monitoring.trackFeatureUsage('lesson_completion', {
      userId,
      additional: { lessonId, subject, timeSpent, score },
    });
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'record_lesson_completion' },
      extra: { userId, lessonId, subject },
    });
    throw error;
  }
};

// Achievement System
export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    return await db.getAllFromIndex(ACHIEVEMENTS_STORE, 'userId', userId);
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'get_user_achievements' },
      extra: { userId },
    });
    throw error;
  }
};

export const awardAchievement = async (userId: string, achievementData: Omit<Achievement, 'id' | 'unlockedAt'>): Promise<Achievement> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const achievement: Achievement = {
      ...achievementData,
      id: crypto.randomUUID(),
      unlockedAt: new Date(),
    };

    await db.add(ACHIEVEMENTS_STORE, achievement);

    // Track achievement
    analytics.trackUser('achievement_earned', 'achievements', achievement.name);
    monitoring.trackFeatureUsage('achievement_earned', {
      userId,
      additional: { achievementCategory: achievement.category, name: achievement.name },
    });

    return achievement;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'award_achievement' },
      extra: { userId, achievementData },
    });
    throw error;
  }
};

const checkAndAwardAchievements = async (userId: string, progress: LearningProgress): Promise<void> => {
  try {
    const existingAchievements = await getUserAchievements(userId);
    const achievementNames = new Set(existingAchievements.map(a => a.name));

    // Check for various achievement conditions
    const achievements: Array<Omit<Achievement, 'id' | 'unlockedAt'>> = [];

    // Lesson-based achievements
    if (progress.totalLessonsCompleted >= 5 && !achievementNames.has('Getting Started')) {
      achievements.push({
        name: 'Getting Started',
        description: 'Completed 5 lessons',
        category: 'lessons',
        icon: '🚀',
        points: 50,
      });
    }

    if (progress.totalLessonsCompleted >= 25 && !achievementNames.has('Dedicated Learner')) {
      achievements.push({
        name: 'Dedicated Learner',
        description: 'Completed 25 lessons',
        category: 'lessons',
        icon: '📚',
        points: 200,
      });
    }

    if (progress.totalLessonsCompleted >= 50 && !achievementNames.has('Lesson Master')) {
      achievements.push({
        name: 'Lesson Master',
        description: 'Completed 50 lessons',
        category: 'lessons',
        icon: '🎓',
        points: 400,
      });
    }

    // Time-based achievements
    const hoursSpent = progress.totalTimeSpent / (1000 * 60 * 60); // Convert to hours
    if (hoursSpent >= 10 && !achievementNames.has('Time Investor')) {
      achievements.push({
        name: 'Time Investor',
        description: 'Spent 10+ hours learning',
        category: 'time',
        icon: '⏰',
        points: 150,
      });
    }

    // Streak-based achievements
    if (progress.currentStreak >= 7 && !achievementNames.has('Week Warrior')) {
      achievements.push({
        name: 'Week Warrior',
        description: 'Maintained a 7-day learning streak',
        category: 'streak',
        icon: '🔥',
        points: 300,
      });
    }

    // Level-based achievements
    if (progress.level >= 5 && !achievementNames.has('Rising Star')) {
      achievements.push({
        name: 'Rising Star',
        description: 'Reached level 5',
        category: 'level',
        icon: '⭐',
        points: 250,
      });
    }

    // Award new achievements
    for (const achievementData of achievements) {
      await awardAchievement(userId, achievementData);
    }
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'check_achievements' },
      extra: { userId },
    });
  }
};

// Badge System
export const getUserBadges = async (userId: string): Promise<Badge[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    return await db.getAllFromIndex(BADGES_STORE, 'userId', userId);
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'get_user_badges' },
      extra: { userId },
    });
    throw error;
  }
};

export const awardBadge = async (userId: string, badgeData: Omit<Badge, 'id' | 'earnedAt'>): Promise<Badge> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const badge: Badge = {
      ...badgeData,
      id: crypto.randomUUID(),
      earnedAt: new Date(),
    };

    await db.add(BADGES_STORE, badge);

    analytics.trackUser('badge_earned', 'badges', badge.name);
    monitoring.trackFeatureUsage('badge_earned', {
      userId,
      additional: { badgeRarity: badge.rarity, name: badge.name },
    });

    return badge;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'award_badge' },
      extra: { userId, badgeData },
    });
    throw error;
  }
};

// Goals System
export const createLearningGoal = async (userId: string, goalData: Omit<LearningGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<LearningGoal> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const goal: LearningGoal = {
      ...goalData,
      id: crypto.randomUUID(),
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.add(GOALS_STORE, goal);

    analytics.trackUser('goal_created', 'goals', goal.type);
    monitoring.trackFeatureUsage('goal_creation', {
      userId,
      additional: { goalType: goal.type, target: goal.target },
    });

    return goal;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'create_goal' },
      extra: { userId, goalData },
    });
    throw error;
  }
};

export const getUserGoals = async (userId: string): Promise<LearningGoal[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    return await db.getAllFromIndex(GOALS_STORE, 'userId', userId);
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'get_user_goals' },
      extra: { userId },
    });
    throw error;
  }
};

export const updateGoalProgress = async (goalId: string, progressUpdate: Partial<LearningGoal['progress']>): Promise<LearningGoal> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const goal = await db.get(GOALS_STORE, goalId);
    if (!goal) throw new Error('Goal not found');

    const updatedProgress = {
      ...goal.progress,
      ...progressUpdate,
    };

    // Check if goal is completed
    const isCompleted = Object.keys(goal.target).every(key => {
      const targetValue = goal.target[key as keyof typeof goal.target] || 0;
      const currentValue = updatedProgress[key as keyof typeof updatedProgress] || 0;
      return currentValue >= targetValue;
    });

    const updatedGoal: LearningGoal = {
      ...goal,
      progress: updatedProgress,
      isCompleted,
      updatedAt: new Date(),
    };

    if (isCompleted && !goal.isCompleted) {
      // Goal just completed
      analytics.trackUser('goal_completed', 'goals', goal.type);
      monitoring.trackFeatureUsage('goal_completion', {
        userId: goal.userId,
        additional: { goalType: goal.type },
      });
    }

    await db.put(GOALS_STORE, updatedGoal);
    return updatedGoal;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'update_goal_progress' },
      extra: { goalId, progressUpdate },
    });
    throw error;
  }
};

// Progress Snapshots
export const createProgressSnapshot = async (userId: string): Promise<ProgressSnapshot> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const userProgress = await getUserProgress(userId);

    if (!userProgress) {
      throw new Error('User progress not found');
    }

    const snapshot: ProgressSnapshot = {
      userId,
      date: new Date(),
      metrics: {
        lessonsCompleted: userProgress.totalLessonsCompleted,
        exercisesCompleted: userProgress.totalExercisesCompleted,
        quizzesCompleted: userProgress.totalQuizzesCompleted,
        totalTimeSpent: userProgress.totalTimeSpent,
        averageScore: userProgress.averageScore,
        streak: userProgress.currentStreak,
        level: userProgress.level,
        points: userProgress.points,
      },
      subjectBreakdown: Object.entries(userProgress.subjectProgress).reduce((acc, [subject, progress]) => {
        acc[subject] = {
          lessonsCompleted: progress.lessonsCompleted,
          averageScore: progress.averageScore,
          timeSpent: progress.timeSpent,
        };
        return acc;
      }, {} as Record<string, { lessonsCompleted: number; averageScore: number; timeSpent: number }>),
    };

    await db.add(SNAPSHOTS_STORE, { ...snapshot, id: crypto.randomUUID() });

    monitoring.trackFeatureUsage('progress_snapshot', {
      userId,
      additional: { level: snapshot.metrics.level },
    });

    return snapshot;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'create_snapshot' },
      extra: { userId },
    });
    throw error;
  }
};

export const getUserSnapshots = async (userId: string, limit: number = 30): Promise<ProgressSnapshot[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const snapshots = await db.getAllFromIndex(SNAPSHOTS_STORE, 'userId', userId);
    return snapshots
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'get_user_snapshots' },
      extra: { userId },
    });
    throw error;
  }
};

// Learning Analytics
export const createLearningSession = async (
  userId: string,
  contentId: string,
  contentType: 'lesson' | 'exercise' | 'quiz'
): Promise<LearningAnalytics> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const session: LearningAnalytics = {
      userId,
      sessionId: crypto.randomUUID(),
      contentId,
      contentType,
      startTime: new Date(),
      completed: false,
      attempts: 0,
      hintsUsed: 0,
      interactions: [],
      createdAt: new Date(),
    };

    await db.add(ANALYTICS_STORE, { ...session, id: crypto.randomUUID() });

    monitoring.trackFeatureUsage('learning_session_start', {
      userId,
      additional: { contentType, contentId },
    });

    return session;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'create_session' },
      extra: { userId, contentId, contentType },
    });
    throw error;
  }
};

export const generateDetailedAnalytics = async (userId: string, dateRange?: { start: Date; end: Date }): Promise<any> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const progress = await getUserProgress(userId);
    const achievements = await getUserAchievements(userId);
    const snapshots = await getUserSnapshots(userId);

    if (!progress) {
      throw new Error('User progress not found');
    }

    // Filter by date range if provided
    const filteredSnapshots = dateRange 
      ? snapshots.filter(s => s.date >= dateRange.start && s.date <= dateRange.end)
      : snapshots;

    // Get subject progress entries
    const subjectEntries = Object.entries(progress.subjectProgress);
 
    const analyticsSummary = {
      userId,
      generatedAt: new Date(),
      dateRange: dateRange || { start: new Date(0), end: new Date() },
      totalStudyTime: progress.totalTimeSpent,
      averageSessionTime: 0, // Would need session tracking
      completionRate: subjectEntries.length > 0 
        ? subjectEntries.reduce((sum, [, subjectProgress]) => sum + (subjectProgress.level * 10), 0) / subjectEntries.length 
        : 0,
      streakData: {
        current: progress.currentStreak,
        longest: progress.longestStreak,
        average: progress.currentStreak, // Simplified
      },
      subjectPerformance: subjectEntries.reduce((acc, [subject, subjectProgress]) => {
        acc[subject] = {
          progress: subjectProgress.level * 10,
          timeSpent: subjectProgress.timeSpent,
          completedLessons: subjectProgress.lessonsCompleted,
          averageScore: subjectProgress.averageScore,
        };
        return acc;
      }, {} as Record<string, any>),
      learningPatterns: {
        mostActiveHours: [], // Would need session time tracking
        mostActiveDays: [], // Would need daily activity tracking
        preferredSubjects: subjectEntries
          .sort(([, a], [, b]) => b.timeSpent - a.timeSpent)
          .slice(0, 3)
          .map(([subject]) => subject),
      },
      achievements: achievements.length,
      progressTrend: filteredSnapshots.length > 1 
        ? filteredSnapshots[0].metrics.level - filteredSnapshots[filteredSnapshots.length - 1].metrics.level
        : 0,
    };

     // Store analytics summary (not as LearningAnalytics)
     await db.add('analytics_summary', { ...analyticsSummary, id: crypto.randomUUID() });

     monitoring.trackFeatureUsage('analytics_generation', {
       userId,
       additional: { 
         dateRange: dateRange ? 'custom' : 'all',
         totalTime: analyticsSummary.totalStudyTime,
       },
     });

     return analyticsSummary;
  } catch (error) {
    monitoring.reportError(error as Error, {
      level: 'error',
      tags: { category: 'progress_tracking', operation: 'generate_detailed_analytics' },
      extra: { userId, dateRange },
    });
    throw error;
  }
};



// Export progress tracking instance
export const progressTracking = {
  initialize: initializeProgressTracking,
  getUserProgress,
  getSubjectProgress,
  updateProgress,
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
  createLearningSession,
  generateDetailedAnalytics,
};

export default progressTracking;