import * as Sentry from '@sentry/react';

// Monitoring configuration
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
const ENVIRONMENT = import.meta.env.MODE || 'development';

// Initialize Sentry
export const initializeMonitoring = () => {
  if (!SENTRY_DSN) {
    if (DEBUG_MODE) {
      console.warn('Sentry: VITE_SENTRY_DSN not configured');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: APP_VERSION,
    // Performance Monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    // Error Sampling
    sampleRate: 1.0,
    // Additional options
    beforeSend(event) {
      // Filter out non-critical errors in production
      if (ENVIRONMENT === 'production') {
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.type === 'ChunkLoadError' || error?.type === 'NetworkError') {
            return null; // Don't send chunk load errors
          }
        }
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null;
      }
      return breadcrumb;
    },
  });

  if (DEBUG_MODE) {
    console.log('Sentry monitoring initialized');
  }
};

// User Context
export const setUserContext = (user: {
  id: string;
  email?: string;
  username?: string;
  userType?: 'student' | 'teacher' | 'admin';
  licenseType?: string;
}) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    userType: user.userType,
    licenseType: user.licenseType,
  });

  if (DEBUG_MODE) {
    console.log('Sentry user context set:', user);
  }
};

// Custom Tags
export const setTags = (tags: Record<string, string>) => {
  Sentry.setTags(tags);

  if (DEBUG_MODE) {
    console.log('Sentry tags set:', tags);
  }
};

// Custom Context
export const setContext = (key: string, context: Record<string, any>) => {
  Sentry.setContext(key, context);

  if (DEBUG_MODE) {
    console.log('Sentry context set:', { key, context });
  }
};

// Error Reporting
export const reportError = (error: Error, context?: {
  level?: 'error' | 'warning' | 'info' | 'debug';
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  user?: Record<string, any>;
}) => {
  Sentry.withScope((scope) => {
    if (context?.level) {
      scope.setLevel(context.level);
    }
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    if (context?.user) {
      scope.setUser(context.user);
    }
    
    Sentry.captureException(error);
  });

  if (DEBUG_MODE) {
    console.log('Error reported to Sentry:', { error, context });
  }
};

// Custom Messages
export const reportMessage = (message: string, level: 'error' | 'warning' | 'info' | 'debug' = 'info', context?: {
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}) => {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    Sentry.captureMessage(message, level);
  });

  if (DEBUG_MODE) {
    console.log('Message reported to Sentry:', { message, level, context });
  }
};

// Performance Monitoring
export const startTransaction = (name: string, operation: string = 'navigation') => {
  // Create a simple performance marker
  const startTime = performance.now();
  
  if (DEBUG_MODE) {
    console.log('Performance transaction started:', { name, operation });
  }

  return {
    name,
    operation,
    startTime,
    finish: () => {
      const duration = performance.now() - startTime;
      trackPerformance(name, duration, { category: operation });
    }
  };
};

// Educational Specific Monitoring
export const trackLearningError = (error: Error, context: {
  lessonId?: string;
  exerciseId?: string;
  userId?: string;
  action?: string;
}) => {
  reportError(error, {
    level: 'error',
    tags: {
      category: 'learning',
      lesson_id: context.lessonId || 'unknown',
      exercise_id: context.exerciseId || 'unknown',
      action: context.action || 'unknown',
    },
    extra: {
      userId: context.userId,
      timestamp: new Date().toISOString(),
    },
  });
};

// API Error Monitoring
export const trackAPIError = (error: Error, context: {
  endpoint?: string;
  method?: string;
  statusCode?: number;
  userId?: string;
}) => {
  reportError(error, {
    level: 'error',
    tags: {
      category: 'api',
      endpoint: context.endpoint || 'unknown',
      method: context.method || 'unknown',
      status_code: context.statusCode?.toString() || 'unknown',
    },
    extra: {
      userId: context.userId,
      timestamp: new Date().toISOString(),
    },
  });
};

// Performance Tracking
export const trackPerformance = (name: string, duration: number, context?: {
  category?: string;
  userId?: string;
  additional?: Record<string, any>;
}) => {
  reportMessage(`Performance: ${name}`, 'info', {
    tags: {
      category: context?.category || 'performance',
      performance_metric: name,
    },
    extra: {
      duration,
      userId: context?.userId,
      timestamp: new Date().toISOString(),
      ...context?.additional,
    },
  });
};

// Feature Usage Tracking
export const trackFeatureUsage = (feature: string, context?: {
  userId?: string;
  licenseType?: string;
  success?: boolean;
  additional?: Record<string, any>;
}) => {
  reportMessage(`Feature used: ${feature}`, 'info', {
    tags: {
      category: 'feature_usage',
      feature_name: feature,
      license_type: context?.licenseType || 'unknown',
      success: context?.success?.toString() || 'unknown',
    },
    extra: {
      userId: context?.userId,
      timestamp: new Date().toISOString(),
      ...context?.additional,
    },
  });
};

// Export monitoring instance
export const monitoring = {
  initialize: initializeMonitoring,
  setUserContext,
  setTags,
  setContext,
  reportError,
  reportMessage,
  startTransaction,
  trackLearningError,
  trackAPIError,
  trackPerformance,
  trackFeatureUsage,
};

export default monitoring;