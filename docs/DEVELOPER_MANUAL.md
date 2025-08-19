# 🔧 EduAI Developer Maintenance Manual

**Comprehensive Guide for Application Maintenance, Operations, and Troubleshooting**

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Codebase Overview](#codebase-overview)
3. [Maintenance Procedures](#maintenance-procedures)
4. [Monitoring and Logging](#monitoring-and-logging)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Performance Optimization](#performance-optimization)
7. [Security Maintenance](#security-maintenance)
8. [Database Management](#database-management)
9. [Deployment and CI/CD](#deployment-and-cicd)
10. [Emergency Procedures](#emergency-procedures)
11. [Code Quality and Standards](#code-quality-and-standards)
12. [Third-Party Integrations](#third-party-integrations)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vite)  │◄──►│   (Node.js)     │◄──►│   (IndexedDB)   │
│                 │    │                 │    │                 │
│ • UI Components │    │ • API Services  │    │ • User Data     │
│ • State Mgmt    │    │ • AI Integration│    │ • Progress      │
│ • PWA Features  │    │ • Auth System   │    │ • Content       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  External APIs  │
                    │                 │
                    │ • OpenAI API    │
                    │ • Sentry        │
                    │ • Analytics     │
                    └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.x
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **PWA**: Workbox for service workers
- **Testing**: Vitest + React Testing Library

#### Backend Services
- **Runtime**: Browser-based (no traditional backend)
- **Data Storage**: IndexedDB (client-side)
- **AI Integration**: OpenAI API (client-side calls)
- **Authentication**: Local storage based

#### External Services
- **Error Monitoring**: Sentry
- **Analytics**: Custom analytics service
- **AI Services**: OpenAI GPT models

### Data Flow Architecture

```
User Interaction → React Components → Zustand Store → Services Layer → IndexedDB/APIs
                                                   ↓
                                              AI Processing
                                                   ↓
                                            Response Handling
                                                   ↓
                                            UI State Update
```

---

## Codebase Overview

### Directory Structure

```
eduAI/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Shared components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── gamification/   # Gamification features
│   │   ├── layout/         # Layout components
│   │   ├── lesson/         # Lesson-related components
│   │   ├── teacher/        # Teacher dashboard components
│   │   └── ui/            # Basic UI elements
│   ├── data/              # Data management
│   │   └── database/      # IndexedDB schemas and operations
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Business logic and API calls
│   │   ├── ai.ts          # AI service integration
│   │   ├── analytics.ts   # Analytics tracking
│   │   ├── api.ts         # API utilities
│   │   ├── contentManagement.ts  # Content operations
│   │   ├── monitoring.ts  # Error monitoring
│   │   ├── progressTracking.ts   # Progress management
│   │   └── userManagement.ts     # User operations
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── docs/                  # Documentation
├── tests/                 # Test files
└── config files           # Build and configuration files
```

### Key Files and Their Purposes

#### Core Application Files
- **`src/main.tsx`**: Application bootstrap and initialization
- **`src/App.tsx`**: Root component with routing and providers
- **`src/store/`**: Global state management using Zustand

#### Service Layer
- **`src/services/ai.ts`**: AI integration and request handling
- **`src/services/api.ts`**: HTTP client and API utilities
- **`src/services/progressTracking.ts`**: Learning progress management
- **`src/services/userManagement.ts`**: User authentication and management
- **`src/services/contentManagement.ts`**: Content delivery and caching

#### Data Layer
- **`src/data/database/`**: IndexedDB schemas and database operations
- **`src/types/`**: TypeScript interfaces and type definitions

#### UI Components
- **`src/components/common/`**: Reusable components across the app
- **`src/components/ui/`**: Basic UI building blocks
- **`src/components/lesson/`**: Lesson-specific interactive components

---

## Maintenance Procedures

### Daily Maintenance Tasks

#### 1. System Health Check
```bash
# Check application status
npm run health-check

# Review error logs
npm run logs:errors

# Check performance metrics
npm run metrics:performance
```

#### 2. Monitor Key Metrics
- **User Activity**: Active users, session duration
- **Error Rates**: JavaScript errors, API failures
- **Performance**: Page load times, bundle sizes
- **Storage Usage**: IndexedDB storage consumption

### Weekly Maintenance Tasks

#### 1. Dependency Updates
```bash
# Check for outdated packages
npm outdated

# Update non-breaking changes
npm update

# Review and test major updates
npm audit
npm audit fix
```

#### 2. Code Quality Review
```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test

# Check bundle size
npm run analyze
```

#### 3. Performance Analysis
```bash
# Generate performance report
npm run perf:analyze

# Check lighthouse scores
npm run lighthouse

# Review bundle analysis
npm run bundle:analyze
```

### Monthly Maintenance Tasks

#### 1. Security Updates
```bash
# Security audit
npm audit --audit-level high

# Update security-critical packages
npm audit fix --force

# Review dependency vulnerabilities
npm run security:check
```

#### 2. Database Maintenance
```bash
# Clean up old data
npm run db:cleanup

# Optimize database performance
npm run db:optimize

# Backup critical data
npm run db:backup
```

#### 3. Documentation Updates
- Review and update API documentation
- Update deployment guides
- Refresh troubleshooting guides
- Update dependency documentation

---

## Monitoring and Logging

### Error Monitoring with Sentry

#### Configuration
```typescript
// src/services/monitoring.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_APP_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    return event;
  }
});
```

#### Key Metrics to Monitor
1. **JavaScript Errors**: Unhandled exceptions and promise rejections
2. **API Failures**: Failed requests to external services
3. **Performance Issues**: Slow page loads and interactions
4. **User Experience**: Error boundaries and component failures

### Custom Analytics

#### Implementation
```typescript
// src/services/analytics.ts
class AnalyticsService {
  trackEvent(event: string, properties: Record<string, any>) {
    // Track user interactions
  }
  
  trackPerformance(metric: string, value: number) {
    // Track performance metrics
  }
  
  trackError(error: Error, context: Record<string, any>) {
    // Track application errors
  }
}
```

#### Key Events to Track
- User login/logout
- Lesson completions
- AI interactions
- Performance bottlenecks
- Feature usage patterns

### Logging Best Practices

#### Log Levels
```typescript
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

class Logger {
  static error(message: string, context?: any) {
    console.error(`[ERROR] ${message}`, context);
    // Send to monitoring service
  }
  
  static warn(message: string, context?: any) {
    console.warn(`[WARN] ${message}`, context);
  }
  
  static info(message: string, context?: any) {
    console.info(`[INFO] ${message}`, context);
  }
}
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Application Won't Start

**Symptoms**: Build fails or development server won't start

**Diagnosis Steps**:
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -i :3000
```

**Solutions**:
- Update Node.js to supported version
- Clear npm cache: `npm cache clean --force`
- Check environment variables in `.env.local`
- Verify all required dependencies are installed

#### 2. AI Service Failures

**Symptoms**: AI responses not working, API errors

**Diagnosis Steps**:
```typescript
// Check AI service health
const healthCheck = async () => {
  try {
    const response = await aiService.testConnection();
    console.log('AI Service Status:', response);
  } catch (error) {
    console.error('AI Service Error:', error);
  }
};
```

**Solutions**:
- Verify OpenAI API key is valid and has credits
- Check rate limiting and quota usage
- Implement retry logic with exponential backoff
- Add fallback responses for service unavailability

#### 3. Performance Issues

**Symptoms**: Slow page loads, unresponsive UI

**Diagnosis Steps**:
```bash
# Analyze bundle size
npm run analyze

# Check for memory leaks
npm run perf:memory

# Profile React components
npm run perf:react
```

**Solutions**:
- Implement code splitting and lazy loading
- Optimize images and assets
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

#### 4. Database Issues

**Symptoms**: Data not persisting, IndexedDB errors

**Diagnosis Steps**:
```typescript
// Check IndexedDB status
const checkDatabase = async () => {
  try {
    const db = await openDatabase();
    console.log('Database Status:', db);
  } catch (error) {
    console.error('Database Error:', error);
  }
};
```

**Solutions**:
- Clear browser storage and reinitialize
- Implement database migration scripts
- Add error handling for quota exceeded
- Provide data export/import functionality

#### 5. Authentication Problems

**Symptoms**: Users can't log in, session issues

**Diagnosis Steps**:
```typescript
// Check authentication state
const checkAuth = () => {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('user_data');
  console.log('Auth Status:', { token: !!token, user: !!user });
};
```

**Solutions**:
- Clear authentication data and re-login
- Implement token refresh mechanism
- Add session timeout handling
- Provide clear error messages for auth failures

### Debugging Tools and Techniques

#### 1. Browser Developer Tools
```javascript
// Enable React DevTools profiling
if (process.env.NODE_ENV === 'development') {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot = (id, root) => {
    // Profile React renders
  };
}
```

#### 2. Custom Debug Utilities
```typescript
// Debug helper for state inspection
const debugState = (storeName: string, state: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 ${storeName} State`);
    console.log(state);
    console.groupEnd();
  }
};
```

#### 3. Performance Monitoring
```typescript
// Performance measurement utility
const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`⏱️ ${name}: ${end - start}ms`);
};
```

---

## Performance Optimization

### Frontend Optimization

#### 1. Bundle Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', 'lucide-react'],
          ai: ['openai']
        }
      }
    }
  }
});
```

#### 2. Code Splitting
```typescript
// Lazy load components
const LazyDashboard = lazy(() => import('./components/Dashboard'));
const LazyLessonViewer = lazy(() => import('./components/LessonViewer'));

// Route-based code splitting
const AppRoutes = () => (
  <Routes>
    <Route path="/dashboard" element={
      <Suspense fallback={<LoadingSpinner />}>
        <LazyDashboard />
      </Suspense>
    } />
  </Routes>
);
```

#### 3. React Optimization
```typescript
// Memoize expensive components
const ExpensiveComponent = memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return heavyProcessing(data);
  }, [data]);
  
  return <div>{processedData}</div>;
});

// Optimize re-renders with useCallback
const ParentComponent = () => {
  const handleClick = useCallback((id: string) => {
    // Handle click
  }, []);
  
  return <ChildComponent onClick={handleClick} />;
};
```

#### 4. Asset Optimization
```typescript
// Image optimization
const OptimizedImage = ({ src, alt }: ImageProps) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    decoding="async"
    style={{ contentVisibility: 'auto' }}
  />
);
```

### Database Optimization

#### 1. IndexedDB Performance
```typescript
// Efficient database queries
class DatabaseService {
  async getProgressData(userId: string) {
    const transaction = this.db.transaction(['progress'], 'readonly');
    const store = transaction.objectStore('progress');
    const index = store.index('userId');
    
    return await index.getAll(userId);
  }
  
  async batchUpdate(updates: UpdateItem[]) {
    const transaction = this.db.transaction(['progress'], 'readwrite');
    const store = transaction.objectStore('progress');
    
    const promises = updates.map(update => store.put(update));
    await Promise.all(promises);
  }
}
```

#### 2. Data Caching Strategy
```typescript
// Implement LRU cache for frequently accessed data
class CacheService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private maxSize = 100;
  private ttl = 5 * 60 * 1000; // 5 minutes
  
  get(key: string) {
    const item = this.cache.get(key);
    if (!item || Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }
  
  set(key: string, data: any) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
```

---

## Security Maintenance

### Security Best Practices

#### 1. Input Validation
```typescript
// Sanitize user input
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
};

// Validate API responses
const validateApiResponse = (response: any): boolean => {
  // Implement schema validation
  return true;
};
```

#### 2. Secure Storage
```typescript
// Secure local storage wrapper
class SecureStorage {
  private static encrypt(data: string): string {
    // Implement encryption (consider using crypto-js)
    return btoa(data);
  }
  
  private static decrypt(data: string): string {
    return atob(data);
  }
  
  static setItem(key: string, value: any): void {
    const encrypted = this.encrypt(JSON.stringify(value));
    localStorage.setItem(key, encrypted);
  }
  
  static getItem(key: string): any {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    try {
      return JSON.parse(this.decrypt(encrypted));
    } catch {
      return null;
    }
  }
}
```

#### 3. API Security
```typescript
// Secure API client
class SecureApiClient {
  private async makeRequest(url: string, options: RequestInit) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers
    };
    
    // Add CSRF protection
    const csrfToken = this.getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    return fetch(url, {
      ...options,
      headers,
      credentials: 'same-origin'
    });
  }
}
```

### Security Monitoring

#### 1. Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://api.openai.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.openai.com https://sentry.io;
">
```

#### 2. Security Headers
```typescript
// Add security headers in service worker
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).then(response => {
        const newHeaders = new Headers(response.headers);
        newHeaders.set('X-Frame-Options', 'DENY');
        newHeaders.set('X-Content-Type-Options', 'nosniff');
        newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      })
    );
  }
});
```

---

## Database Management

### IndexedDB Schema Management

#### 1. Database Schema
```typescript
// Database schema definition
interface DatabaseSchema {
  users: {
    key: string;
    value: UserData;
    indexes: {
      email: string;
      role: string;
    };
  };
  progress: {
    key: string;
    value: ProgressData;
    indexes: {
      userId: string;
      lessonId: string;
      timestamp: number;
    };
  };
  lessons: {
    key: string;
    value: LessonData;
    indexes: {
      category: string;
      difficulty: number;
    };
  };
}
```

#### 2. Migration System
```typescript
// Database migration handler
class DatabaseMigration {
  private migrations: Migration[] = [
    {
      version: 1,
      upgrade: (db: IDBDatabase) => {
        // Initial schema
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('email', 'email', { unique: true });
      }
    },
    {
      version: 2,
      upgrade: (db: IDBDatabase) => {
        // Add progress tracking
        const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
        progressStore.createIndex('userId', 'userId');
      }
    }
  ];
  
  async migrate(db: IDBDatabase, oldVersion: number, newVersion: number) {
    for (const migration of this.migrations) {
      if (migration.version > oldVersion && migration.version <= newVersion) {
        await migration.upgrade(db);
      }
    }
  }
}
```

#### 3. Data Backup and Restore
```typescript
// Data backup utility
class BackupService {
  async exportData(): Promise<string> {
    const data = {
      users: await this.getAllFromStore('users'),
      progress: await this.getAllFromStore('progress'),
      lessons: await this.getAllFromStore('lessons')
    };
    
    return JSON.stringify(data, null, 2);
  }
  
  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    for (const [storeName, records] of Object.entries(data)) {
      await this.clearStore(storeName);
      for (const record of records as any[]) {
        await this.addToStore(storeName, record);
      }
    }
  }
}
```

---

## Deployment and CI/CD

### Build Process

#### 1. Production Build
```bash
# Build for production
npm run build

# Analyze bundle
npm run analyze

# Run production tests
npm run test:prod
```

#### 2. Build Optimization
```typescript
// vite.config.ts for production
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
```

### Netlify Deployment

#### 1. Netlify Configuration
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

#### 2. Environment Variables
```bash
# Production environment variables
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_SENTRY_DSN=your_sentry_dsn
VITE_OPENAI_API_KEY=your_openai_key
```

### CI/CD Pipeline

#### 1. GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## Emergency Procedures

### Incident Response

#### 1. Severity Levels
- **Critical (P0)**: Complete system outage, data loss
- **High (P1)**: Major functionality broken, security issues
- **Medium (P2)**: Minor functionality issues, performance problems
- **Low (P3)**: Cosmetic issues, feature requests

#### 2. Emergency Contacts
```
Primary On-Call: [Developer Name] - [Phone] - [Email]
Secondary On-Call: [Developer Name] - [Phone] - [Email]
Product Owner: [Name] - [Phone] - [Email]
System Administrator: [Name] - [Phone] - [Email]
```

#### 3. Rollback Procedures
```bash
# Quick rollback to previous version
git revert HEAD
npm run build
npm run deploy

# Or rollback via Netlify
netlify sites:list
netlify rollback --site-id=your-site-id
```

### Data Recovery

#### 1. User Data Recovery
```typescript
// Emergency data recovery utility
class EmergencyRecovery {
  async recoverUserData(userId: string) {
    // Attempt recovery from multiple sources
    const sources = [
      () => this.recoverFromLocalStorage(userId),
      () => this.recoverFromIndexedDB(userId),
      () => this.recoverFromBackup(userId)
    ];
    
    for (const source of sources) {
      try {
        const data = await source();
        if (data) return data;
      } catch (error) {
        console.error('Recovery attempt failed:', error);
      }
    }
    
    return null;
  }
}
```

#### 2. System State Recovery
```typescript
// System state recovery
class SystemRecovery {
  async recoverSystemState() {
    try {
      // Clear corrupted data
      await this.clearCorruptedData();
      
      // Reinitialize core services
      await this.initializeCoreServices();
      
      // Restore user sessions
      await this.restoreUserSessions();
      
      console.log('System recovery completed');
    } catch (error) {
      console.error('System recovery failed:', error);
      throw error;
    }
  }
}
```

---

## Code Quality and Standards

### Coding Standards

#### 1. TypeScript Guidelines
```typescript
// Use strict type definitions
interface UserData {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: Date;
}

// Prefer type unions over enums for simple cases
type Theme = 'light' | 'dark' | 'auto';

// Use generic types for reusable components
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
```

#### 2. React Best Practices
```typescript
// Use functional components with hooks
const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadUserData(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <ErrorMessage message="User not found" />;
  
  return <div>{/* Component JSX */}</div>;
};
```

#### 3. Error Handling
```typescript
// Consistent error handling
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Error boundary for React components
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to monitoring service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

### Testing Standards

#### 1. Unit Testing
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('displays user information correctly', async () => {
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    
    render(<UserProfile userId="1" />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

#### 2. Integration Testing
```typescript
// Service integration testing
describe('UserService', () => {
  beforeEach(() => {
    // Setup test database
  });
  
  it('creates user successfully', async () => {
    const userData = { name: 'Test User', email: 'test@example.com' };
    const user = await userService.createUser(userData);
    
    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
  });
});
```

---

## Third-Party Integrations

### OpenAI Integration

#### 1. API Client Configuration
```typescript
// AI service configuration
class AIService {
  private client: OpenAI;
  private rateLimiter: RateLimiter;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: 1000,
      interval: 'minute'
    });
  }
  
  async generateResponse(prompt: string): Promise<string> {
    await this.rateLimiter.removeTokens(1);
    
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      });
      
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI API Error:', error);
      throw new AppError('AI service unavailable', 'AI_SERVICE_ERROR');
    }
  }
}
```

#### 2. Error Handling and Fallbacks
```typescript
// Robust AI service with fallbacks
class RobustAIService extends AIService {
  private fallbackResponses = new Map<string, string>();
  
  async generateResponseWithFallback(prompt: string): Promise<string> {
    try {
      return await this.generateResponse(prompt);
    } catch (error) {
      // Try fallback response
      const fallback = this.getFallbackResponse(prompt);
      if (fallback) return fallback;
      
      // Return generic helpful message
      return "I'm having trouble processing your request right now. Please try again later or contact support.";
    }
  }
  
  private getFallbackResponse(prompt: string): string | null {
    // Simple keyword matching for common questions
    const keywords = this.extractKeywords(prompt);
    return this.fallbackResponses.get(keywords.join(',')) || null;
  }
}
```

### Sentry Integration

#### 1. Advanced Configuration
```typescript
// Enhanced Sentry setup
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_APP_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  beforeSend(event, hint) {
    // Filter out non-critical errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof AppError && error.statusCode < 500) {
        return null; // Don't send client errors to Sentry
      }
    }
    
    // Sanitize sensitive data
    if (event.request?.data) {
      event.request.data = sanitizeData(event.request.data);
    }
    
    return event;
  },
  
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ['localhost', /^https:\/\/yourapi\.com\/api/],
    }),
  ],
});
```

---

## Conclusion

This developer manual provides comprehensive guidance for maintaining the EduAI application. Regular review and updates of these procedures ensure the application remains secure, performant, and reliable.

### Key Maintenance Reminders

1. **Daily**: Monitor error rates and performance metrics
2. **Weekly**: Update dependencies and run security audits
3. **Monthly**: Review and update documentation
4. **Quarterly**: Conduct comprehensive security reviews
5. **Annually**: Evaluate and upgrade major dependencies

### Emergency Contacts

For critical issues requiring immediate attention:
- **Primary Developer**: [Contact Information]
- **System Administrator**: [Contact Information]
- **Product Owner**: [Contact Information]

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Next Review**: April 2024

---

*This manual should be reviewed and updated regularly to reflect changes in the application architecture, dependencies, and operational procedures.*