// User Management Types

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: 'student' | 'teacher' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
    achievements: boolean;
  };
  privacy: {
    shareProgress: boolean;
    allowAnalytics: boolean;
    showInLeaderboard: boolean;
  };
  learning: {
    difficulty: 'easy' | 'medium' | 'hard';
    autoAdvance: boolean;
    showHints: boolean;
    soundEffects: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  avatar: string;
  bio: string;
  gradeLevel?: string;
  subjects: string[];
  interests: string[];
  goals: string[];
  achievements: Achievement[];
  badges: Badge[];
  socialLinks: Record<string, string>;
  stats: {
    totalLessons: number;
    totalExercises: number;
    totalQuizzes: number;
    averageScore: number;
    totalTimeSpent: number;
    streak: number;
    level: number;
    points: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  unlockedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: Date;
}

export interface LearningProgress {
  userId: string;
  totalLessonsCompleted: number;
  totalExercisesCompleted: number;
  totalQuizzesCompleted: number;
  averageScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  points: number;
  lastActivity: Date;
  completedLessons: string[];
  completedExercises: string[];
  completedQuizzes: string[];
  subjectProgress: Record<string, SubjectProgress>;
  weeklyGoals: {
    lessonsTarget: number;
    exercisesTarget: number;
    timeTarget: number;
    lessonsCompleted: number;
    exercisesCompleted: number;
    timeSpent: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectProgress {
  subject: string;
  lessonsCompleted: number;
  exercisesCompleted: number;
  quizzesCompleted: number;
  averageScore: number;
  timeSpent: number;
  level: number;
  lastActivity: Date;
}

// Content Management Types
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'exercise' | 'quiz' | 'video' | 'article';
  subject: string;
  gradeLevel: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  tags: string[];
  content: any; // Flexible content structure
  metadata: {
    author: string;
    version: string;
    lastUpdated: Date;
    prerequisites: string[];
    learningObjectives: string[];
  };
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonContent extends ContentItem {
  type: 'lesson';
  content: {
    sections: LessonSection[];
    resources: Resource[];
    assessments: Assessment[];
  };
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'interactive' | 'code';
  order: number;
}

export interface Resource {
  id: string;
  title: string;
  type: 'link' | 'file' | 'video' | 'image';
  url: string;
  description?: string;
}

export interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'exercise' | 'project';
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'code';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

// Analytics Types
export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties: Record<string, any>;
  timestamp: Date;
}

export interface LearningAnalytics {
  userId: string;
  sessionId: string;
  contentId: string;
  contentType: 'lesson' | 'exercise' | 'quiz';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  completed: boolean;
  score?: number;
  attempts: number;
  hintsUsed: number;
  interactions: Interaction[];
  createdAt: Date;
}

export interface Interaction {
  id: string;
  type: 'click' | 'input' | 'scroll' | 'focus' | 'blur';
  element: string;
  value?: string;
  timestamp: Date;
}

// Progress Tracking Types
export interface ProgressSnapshot {
  userId: string;
  date: Date;
  metrics: {
    lessonsCompleted: number;
    exercisesCompleted: number;
    quizzesCompleted: number;
    totalTimeSpent: number;
    averageScore: number;
    streak: number;
    level: number;
    points: number;
  };
  subjectBreakdown: Record<string, {
    lessonsCompleted: number;
    averageScore: number;
    timeSpent: number;
  }>;
}

export interface LearningGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  target: {
    lessons?: number;
    exercises?: number;
    timeMinutes?: number;
    points?: number;
  };
  progress: {
    lessons: number;
    exercises: number;
    timeMinutes: number;
    points: number;
  };
  deadline: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Export all types
export * from './user';