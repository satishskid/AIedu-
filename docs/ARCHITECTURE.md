# Architecture Documentation

This document describes the technical architecture of the EduAI Tutor platform.

## 🏗️ System Overview

EduAI Tutor is a modern, offline-first Progressive Web Application (PWA) built with React and TypeScript. The platform provides AI-powered programming education with gamification features, designed to work seamlessly both online and offline.

### Key Architectural Principles

- **Offline-First**: Full functionality without internet connectivity
- **Progressive Enhancement**: Works on all devices and browsers
- **Modular Design**: Loosely coupled, reusable components
- **Performance-Focused**: Optimized for speed and efficiency
- **Scalable**: Designed to handle growth in users and content
- **Secure**: Built with security best practices

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                   │
├─────────────────────────────────────────────────────────────┤
│  React App (SPA)  │  Service Worker  │  Local Database     │
│  - Components     │  - Caching       │  - IndexedDB        │
│  - State Mgmt     │  - Offline Sync  │  - PouchDB          │
│  - Routing        │  - Push Notifs   │  - User Data        │
├─────────────────────────────────────────────────────────────┤
│                    API Layer (Serverless)                   │
├─────────────────────────────────────────────────────────────┤
│  Netlify Functions │  Authentication  │  External APIs      │
│  - Health Check    │  - JWT Tokens    │  - AI Models        │
│  - License Mgmt    │  - Role-based    │  - Email Service    │
│  - Analytics       │  - Session Mgmt  │  - Analytics        │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                      │
├─────────────────────────────────────────────────────────────┤
│  CDN (Netlify)     │  Monitoring      │  Security           │
│  - Static Assets   │  - Error Tracking│  - HTTPS/SSL        │
│  - Global Delivery │  - Performance   │  - CORS             │
│  - Edge Caching    │  - Uptime        │  - Input Validation │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Frontend Architecture

### Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development and building)
- **Styling**: Tailwind CSS + Custom CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **Database**: Dexie.js (IndexedDB wrapper)
- **Offline Sync**: PouchDB
- **AI Models**: Transformers.js + ONNX Runtime

### Component Architecture

```
src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── ErrorBoundary/
│   │   └── LoadingSpinner/
│   ├── layout/              # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── Navigation/
│   ├── auth/                # Authentication components
│   │   ├── LoginForm/
│   │   ├── SignupForm/
│   │   └── ProtectedRoute/
│   ├── dashboard/           # Dashboard components
│   │   ├── StudentDashboard/
│   │   ├── TeacherDashboard/
│   │   └── AdminDashboard/
│   ├── lesson/              # Lesson components
│   │   ├── LessonViewer/
│   │   ├── CodeEditor/
│   │   ├── ExerciseRunner/
│   │   └── ProgressTracker/
│   ├── gamification/        # Gamification components
│   │   ├── BadgeDisplay/
│   │   ├── Leaderboard/
│   │   ├── PointsCounter/
│   │   └── AchievementModal/
│   └── user/                # User management
│       ├── UserProfile/
│       ├── UserList/
│       └── UserSettings/
```

### State Management Strategy

#### Global State (Zustand)

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// stores/lessonStore.ts
interface LessonState {
  currentLesson: Lesson | null;
  progress: LessonProgress;
  completedLessons: string[];
  updateProgress: (lessonId: string, progress: number) => void;
  completeLesson: (lessonId: string, score: number) => void;
}

// stores/gamificationStore.ts
interface GamificationState {
  points: number;
  level: number;
  badges: Badge[];
  achievements: Achievement[];
  streak: number;
  addPoints: (points: number) => void;
  earnBadge: (badge: Badge) => void;
}
```

#### Server State (React Query)

```typescript
// hooks/useUsers.ts
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// hooks/useLessons.ts
export const useLessons = (subject?: string) => {
  return useQuery({
    queryKey: ['lessons', subject],
    queryFn: () => lessonService.getLessons(subject),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
```

#### Local State (useState/useReducer)

```typescript
// For component-specific state
const [isModalOpen, setIsModalOpen] = useState(false);
const [formData, setFormData] = useState(initialFormData);

// For complex component state
const [state, dispatch] = useReducer(formReducer, initialState);
```

### Data Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │───▶│  Custom Hooks   │───▶│   API Services  │
│                 │    │                 │    │                 │
│ - User Actions  │    │ - Data Fetching │    │ - HTTP Requests │
│ - Event Handlers│    │ - State Updates │    │ - Error Handling│
│ - Render Logic  │    │ - Side Effects  │    │ - Data Transform│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Global State   │    │  Server State   │    │ Local Database  │
│                 │    │                 │    │                 │
│ - Zustand Store │    │ - React Query   │    │ - IndexedDB     │
│ - User Session  │    │ - Cache Mgmt    │    │ - PouchDB       │
│ - App Settings  │    │ - Sync Status   │    │ - Offline Data  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🗄️ Database Architecture

### Local Database (IndexedDB via Dexie)

```typescript
// database/schema.ts
export class EduAIDatabase extends Dexie {
  users!: Table<User>;
  lessons!: Table<Lesson>;
  progress!: Table<LessonProgress>;
  achievements!: Table<Achievement>;
  assignments!: Table<Assignment>;
  submissions!: Table<Submission>;
  settings!: Table<Setting>;

  constructor() {
    super('EduAIDatabase');
    
    this.version(1).stores({
      users: '++id, email, role, school, classroom',
      lessons: '++id, subject, difficulty, title',
      progress: '++id, userId, lessonId, completed, score',
      achievements: '++id, userId, type, earnedAt',
      assignments: '++id, teacherId, classroom, dueDate',
      submissions: '++id, assignmentId, userId, submittedAt',
      settings: '++id, key, value, userId'
    });
  }
}
```

### Data Synchronization

```typescript
// services/syncService.ts
class SyncService {
  private pouchDB: PouchDB.Database;
  private remoteDB: PouchDB.Database;

  async syncData() {
    try {
      // Bidirectional sync with conflict resolution
      const sync = this.pouchDB.sync(this.remoteDB, {
        live: true,
        retry: true,
        filter: (doc) => this.shouldSync(doc)
      });

      sync.on('change', (info) => {
        this.handleSyncChange(info);
      });

      sync.on('error', (err) => {
        this.handleSyncError(err);
      });
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private shouldSync(doc: any): boolean {
    // Only sync user's own data
    return doc.userId === this.getCurrentUserId();
  }
}
```

## 🤖 AI Integration Architecture

### Local AI Models

```typescript
// services/aiService.ts
class AIService {
  private pipeline: any;
  private model: any;

  async initializeModels() {
    // Load lightweight models for offline use
    this.pipeline = await pipeline(
      'text-generation',
      'microsoft/DialoGPT-small',
      { device: 'webgpu' } // Use WebGPU if available
    );

    // Load code analysis model
    this.model = await AutoModel.fromPretrained(
      'microsoft/codebert-base',
      { device: 'cpu' }
    );
  }

  async analyzeCode(code: string, language: string): Promise<CodeAnalysis> {
    const tokens = await this.tokenizeCode(code, language);
    const analysis = await this.model(tokens);
    
    return {
      complexity: this.calculateComplexity(analysis),
      suggestions: this.generateSuggestions(analysis),
      errors: this.detectErrors(analysis),
      score: this.calculateScore(analysis)
    };
  }

  async generateHint(context: ExerciseContext): Promise<string> {
    const prompt = this.buildPrompt(context);
    const response = await this.pipeline(prompt, {
      max_length: 100,
      temperature: 0.7
    });
    
    return this.formatHint(response);
  }
}
```

### AI Model Loading Strategy

```typescript
// utils/modelLoader.ts
class ModelLoader {
  private cache = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  async loadModel(modelName: string): Promise<any> {
    // Check cache first
    if (this.cache.has(modelName)) {
      return this.cache.get(modelName);
    }

    // Check if already loading
    if (this.loadingPromises.has(modelName)) {
      return this.loadingPromises.get(modelName);
    }

    // Start loading
    const loadPromise = this.loadModelFromCDN(modelName);
    this.loadingPromises.set(modelName, loadPromise);

    try {
      const model = await loadPromise;
      this.cache.set(modelName, model);
      this.loadingPromises.delete(modelName);
      return model;
    } catch (error) {
      this.loadingPromises.delete(modelName);
      throw error;
    }
  }

  private async loadModelFromCDN(modelName: string): Promise<any> {
    const modelUrl = `${CDN_BASE_URL}/models/${modelName}`;
    
    // Use streaming for large models
    const response = await fetch(modelUrl);
    const reader = response.body?.getReader();
    
    // Show loading progress
    return this.streamModel(reader);
  }
}
```

## 🔐 Security Architecture

### Authentication & Authorization

```typescript
// services/authService.ts
class AuthService {
  private tokenStorage = new SecureStorage();

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Validate input
    this.validateCredentials(credentials);

    // Hash password client-side
    const hashedPassword = await this.hashPassword(credentials.password);

    // Send to server
    const response = await this.apiClient.post('/auth/login', {
      email: credentials.email,
      password: hashedPassword
    });

    // Store tokens securely
    await this.tokenStorage.setTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken
    });

    return response;
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const payload = this.decodeJWT(token);
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
}
```

### Data Encryption

```typescript
// utils/encryption.ts
class EncryptionService {
  private key: CryptoKey;

  async generateKey(): Promise<void> {
    this.key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encryptData(data: any): Promise<EncryptedData> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key,
      encodedData
    );

    return {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv)
    };
  }

  async decryptData(encryptedData: EncryptedData): Promise<any> {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
      this.key,
      new Uint8Array(encryptedData.data)
    );

    const decodedData = new TextDecoder().decode(decrypted);
    return JSON.parse(decodedData);
  }
}
```

## 🚀 Performance Architecture

### Code Splitting Strategy

```typescript
// Lazy load components
const StudentDashboard = lazy(() => import('./components/dashboard/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./components/dashboard/TeacherDashboard'));
const AdminDashboard = lazy(() => import('./components/dashboard/AdminDashboard'));

// Route-based splitting
const routes = [
  {
    path: '/student',
    component: lazy(() => import('./pages/StudentPage'))
  },
  {
    path: '/teacher',
    component: lazy(() => import('./pages/TeacherPage'))
  }
];

// Feature-based splitting
const AITutor = lazy(() => import('./features/ai-tutor/AITutor'));
const Gamification = lazy(() => import('./features/gamification/Gamification'));
```

### Caching Strategy

```typescript
// Service Worker caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache static assets aggressively
  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2)$/)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          const responseClone = fetchResponse.clone();
          caches.open('static-v1').then((cache) => {
            cache.put(request, responseClone);
          });
          return fetchResponse;
        });
      })
    );
  }

  // Network-first for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
  }
});
```

### Memory Management

```typescript
// Cleanup service for preventing memory leaks
class CleanupService {
  private subscriptions = new Set<() => void>();
  private intervals = new Set<number>();
  private timeouts = new Set<number>();

  addSubscription(cleanup: () => void) {
    this.subscriptions.add(cleanup);
  }

  addInterval(id: number) {
    this.intervals.add(id);
  }

  addTimeout(id: number) {
    this.timeouts.add(id);
  }

  cleanup() {
    // Clear all subscriptions
    this.subscriptions.forEach(cleanup => cleanup());
    this.subscriptions.clear();

    // Clear all intervals
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();

    // Clear all timeouts
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts.clear();
  }
}
```

## 📱 Progressive Web App Architecture

### Service Worker Strategy

```typescript
// sw.js - Service Worker
const CACHE_NAME = 'eduai-v1';
const STATIC_CACHE = 'eduai-static-v1';
const DYNAMIC_CACHE = 'eduai-dynamic-v1';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css',
        '/manifest.json',
        '/offline.html'
      ]);
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request.url, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Offline fallback
      if (event.request.destination === 'document') {
        return caches.match('/offline.html');
      }
    })
  );
});
```

### Offline Sync Architecture

```typescript
// services/offlineSync.ts
class OfflineSyncService {
  private syncQueue: SyncOperation[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  async queueOperation(operation: SyncOperation) {
    this.syncQueue.push(operation);
    await this.persistQueue();
    
    if (this.isOnline) {
      await this.processQueue();
    }
  }

  private async processQueue() {
    while (this.syncQueue.length > 0 && this.isOnline) {
      const operation = this.syncQueue.shift();
      
      try {
        await this.executeOperation(operation);
        await this.persistQueue();
      } catch (error) {
        // Re-queue failed operation
        this.syncQueue.unshift(operation);
        break;
      }
    }
  }

  private async executeOperation(operation: SyncOperation) {
    switch (operation.type) {
      case 'CREATE':
        return this.apiClient.post(operation.endpoint, operation.data);
      case 'UPDATE':
        return this.apiClient.put(operation.endpoint, operation.data);
      case 'DELETE':
        return this.apiClient.delete(operation.endpoint);
    }
  }
}
```

## 🔧 Build & Deployment Architecture

### Build Pipeline

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ai: ['@xenova/transformers', 'onnxruntime-web'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    },
    target: 'es2020',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@xenova/transformers']
  }
});
```

### Deployment Strategy

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test -- --coverage
    
    - name: Build application
      run: npm run build
      env:
        VITE_LICENSE_SECRET_KEY: ${{ secrets.VITE_LICENSE_SECRET_KEY }}
        VITE_ADMIN_PASSWORD: ${{ secrets.VITE_ADMIN_PASSWORD }}
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2.0
      with:
        publish-dir: './dist'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📊 Monitoring & Analytics Architecture

### Error Tracking

```typescript
// services/errorTracking.ts
class ErrorTrackingService {
  private sentry: any;

  initialize() {
    if (import.meta.env.VITE_SENTRY_DSN) {
      this.sentry = Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        beforeSend: (event) => this.filterEvent(event)
      });
    }
  }

  captureError(error: Error, context?: any) {
    console.error('Error captured:', error);
    
    if (this.sentry) {
      this.sentry.captureException(error, {
        extra: context,
        tags: {
          component: context?.component,
          user_role: context?.userRole
        }
      });
    }
  }

  private filterEvent(event: any) {
    // Don't send sensitive information
    if (event.exception) {
      event.exception.values.forEach((exception: any) => {
        if (exception.stacktrace) {
          exception.stacktrace.frames = exception.stacktrace.frames.filter(
            (frame: any) => !frame.filename?.includes('node_modules')
          );
        }
      });
    }
    return event;
  }
}
```

### Performance Monitoring

```typescript
// services/performanceMonitoring.ts
class PerformanceMonitoringService {
  private observer: PerformanceObserver;

  initialize() {
    // Monitor Core Web Vitals
    this.observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.reportMetric(entry);
      });
    });

    this.observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });

    // Monitor custom metrics
    this.monitorComponentRender();
    this.monitorAPIResponse();
  }

  private reportMetric(entry: PerformanceEntry) {
    const metric = {
      name: entry.name,
      value: entry.duration || entry.startTime,
      timestamp: Date.now(),
      url: window.location.pathname
    };

    // Send to analytics service
    this.sendToAnalytics(metric);
  }

  measureComponentRender(componentName: string, renderFn: () => void) {
    const startMark = `${componentName}-render-start`;
    const endMark = `${componentName}-render-end`;
    const measureName = `${componentName}-render`;

    performance.mark(startMark);
    renderFn();
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
  }
}
```

## 🔄 Scalability Considerations

### Horizontal Scaling

- **Serverless Functions**: Auto-scaling Netlify Functions
- **CDN Distribution**: Global content delivery
- **Database Sharding**: User-based data partitioning
- **Caching Layers**: Multi-level caching strategy

### Vertical Scaling

- **Code Splitting**: Reduce initial bundle size
- **Lazy Loading**: Load components on demand
- **Virtual Scrolling**: Handle large lists efficiently
- **Web Workers**: Offload heavy computations

### Data Scaling

```typescript
// services/dataPartitioning.ts
class DataPartitioningService {
  getPartitionKey(userId: string): string {
    // Simple hash-based partitioning
    const hash = this.hashString(userId);
    return `partition_${hash % 10}`;
  }

  async getPartitionedData(userId: string, dataType: string) {
    const partition = this.getPartitionKey(userId);
    const database = this.getDatabaseForPartition(partition);
    return database.collection(dataType).where('userId', '==', userId).get();
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
```

## 🧪 Testing Architecture

### Testing Strategy

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### E2E Testing

```typescript
// e2e/student-journey.spec.ts
import { test, expect } from '@playwright/test';

test('student can complete a lesson', async ({ page }) => {
  // Login as student
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'student@test.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');

  // Navigate to lessons
  await page.click('[data-testid="lessons-nav"]');
  await expect(page).toHaveURL('/lessons');

  // Start a lesson
  await page.click('[data-testid="lesson-card"]:first-child');
  await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible();

  // Complete exercises
  await page.fill('[data-testid="code-editor"]', 'console.log("Hello, World!");');
  await page.click('[data-testid="run-code"]');
  await expect(page.locator('[data-testid="output"]')).toContainText('Hello, World!');

  // Submit lesson
  await page.click('[data-testid="complete-lesson"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

---

## 📚 Additional Resources

- **React Documentation**: https://reactjs.org/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **Vite Guide**: https://vitejs.dev/guide
- **Netlify Functions**: https://docs.netlify.com/functions
- **PWA Best Practices**: https://web.dev/progressive-web-apps

---

*Architecture Version: 1.0.0*  
*Last Updated: January 2024*