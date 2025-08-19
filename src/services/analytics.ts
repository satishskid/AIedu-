// Extend Window interface for Google Analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Analytics configuration
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

// Initialize Google Analytics
export const initializeAnalytics = () => {
  if (!GA_MEASUREMENT_ID) {
    if (DEBUG_MODE) {
      console.warn('Google Analytics: VITE_GA_MEASUREMENT_ID not configured');
    }
    return;
  }

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });

  if (DEBUG_MODE) {
    console.log('Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
  }
};

// User Events
export const trackUserEvent = (action: string, category: string = 'user', label?: string, value?: number) => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });

  if (DEBUG_MODE) {
    console.log('Analytics Event:', { action, category, label, value });
  }
};

// Learning Events
export const trackLearningEvent = (eventType: 'lesson_start' | 'lesson_complete' | 'exercise_attempt' | 'exercise_complete' | 'quiz_attempt' | 'quiz_complete', data: {
  lessonId?: string;
  exerciseId?: string;
  quizId?: string;
  score?: number;
  timeSpent?: number;
  difficulty?: string;
  subject?: string;
}) => {
  if (!GA_MEASUREMENT_ID) return;

  window.gtag('event', eventType, {
    event_category: 'learning',
    lesson_id: data.lessonId,
    exercise_id: data.exerciseId,
    quiz_id: data.quizId,
    score: data.score,
    time_spent: data.timeSpent,
    difficulty: data.difficulty,
    subject: data.subject,
  });

  if (DEBUG_MODE) {
    console.log('Learning Event:', { eventType, data });
  }
};

// Progress Tracking
export const trackProgress = (userId: string, data: {
  totalLessonsCompleted: number;
  totalExercisesCompleted: number;
  totalQuizzesCompleted: number;
  averageScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  level: number;
  points: number;
}) => {
  if (!GA_MEASUREMENT_ID) return;

  window.gtag('event', 'progress_update', {
    event_category: 'progress',
    user_id: userId,
    lessons_completed: data.totalLessonsCompleted,
    exercises_completed: data.totalExercisesCompleted,
    quizzes_completed: data.totalQuizzesCompleted,
    average_score: data.averageScore,
    total_time_spent: data.totalTimeSpent,
    current_streak: data.currentStreak,
    user_level: data.level,
    total_points: data.points,
  });

  if (DEBUG_MODE) {
    console.log('Progress Tracking:', { userId, data });
  }
};

// Engagement Events
export const trackEngagement = (eventType: 'session_start' | 'session_end' | 'feature_use' | 'help_accessed' | 'feedback_submitted', data?: {
  feature?: string;
  helpTopic?: string;
  feedbackType?: string;
  sessionDuration?: number;
}) => {
  if (!GA_MEASUREMENT_ID) return;

  window.gtag('event', eventType, {
    event_category: 'engagement',
    feature_name: data?.feature,
    help_topic: data?.helpTopic,
    feedback_type: data?.feedbackType,
    session_duration: data?.sessionDuration,
  });

  if (DEBUG_MODE) {
    console.log('Engagement Event:', { eventType, data });
  }
};

// Error Tracking (for non-Sentry errors)
export const trackError = (error: string, context?: string, severity: 'low' | 'medium' | 'high' = 'medium') => {
  if (!GA_MEASUREMENT_ID) return;

  window.gtag('event', 'exception', {
    description: error,
    fatal: severity === 'high',
    context: context,
  });

  if (DEBUG_MODE) {
    console.log('Error Tracked:', { error, context, severity });
  }
};

// Page View Tracking
export const trackPageView = (pageName: string, pageTitle?: string) => {
  if (!GA_MEASUREMENT_ID) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: pageTitle || document.title,
    page_location: window.location.href,
    page_path: pageName,
  });

  if (DEBUG_MODE) {
    console.log('Page View:', { pageName, pageTitle });
  }
};

// Custom Dimensions for Educational Analytics
export const setUserProperties = (userId: string, properties: {
  userType?: 'student' | 'teacher' | 'admin';
  gradeLevel?: string;
  subject?: string;
  licenseType?: 'trial' | 'basic' | 'premium' | 'enterprise';
  schoolDistrict?: string;
}) => {
  if (!GA_MEASUREMENT_ID) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    user_id: userId,
    custom_map: {
      user_type: properties.userType,
      grade_level: properties.gradeLevel,
      subject: properties.subject,
      license_type: properties.licenseType,
      school_district: properties.schoolDistrict,
    },
  });

  if (DEBUG_MODE) {
    console.log('User Properties Set:', { userId, properties });
  }
};

// Conversion Tracking
export const trackConversion = (conversionType: 'license_upgrade' | 'trial_start' | 'subscription' | 'feature_unlock', value?: number) => {
  if (!GA_MEASUREMENT_ID) return;

  window.gtag('event', 'conversion', {
    event_category: 'conversion',
    conversion_type: conversionType,
    value: value,
  });

  if (DEBUG_MODE) {
    console.log('Conversion Tracked:', { conversionType, value });
  }
};

// Export analytics instance
export const analytics = {
  initialize: initializeAnalytics,
  trackUser: trackUserEvent,
  trackLearning: trackLearningEvent,
  trackProgress,
  trackEngagement,
  trackError,
  trackPageView,
  setUserProperties,
  trackConversion,
};

export default analytics;