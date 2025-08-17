# Testing Documentation

This document outlines the comprehensive testing strategy, frameworks, and best practices for the EduAI Tutor platform.

## 🧪 Testing Philosophy

Our testing approach follows the **Testing Pyramid** principle:

```
        /\     E2E Tests (Few)
       /  \    - User journeys
      /    \   - Critical paths
     /______\  - Cross-browser
    /        \ 
   / Integration \ (Some)
  /   Tests      \
 /________________\
/                  \
/   Unit Tests     / (Many)
/   (Foundation)  /
/_________________/
```

### Core Principles

- **Fast Feedback**: Quick test execution for rapid development
- **Reliable**: Tests should be deterministic and stable
- **Maintainable**: Easy to update as code evolves
- **Comprehensive**: Cover critical functionality and edge cases
- **Realistic**: Test behavior, not implementation details

## 🏗️ Testing Architecture

### Testing Stack

- **Unit Testing**: Jest + React Testing Library
- **Integration Testing**: Jest + MSW (Mock Service Worker)
- **E2E Testing**: Playwright
- **Visual Testing**: Chromatic + Storybook
- **Performance Testing**: Lighthouse CI
- **Security Testing**: OWASP ZAP + Snyk
- **Accessibility Testing**: axe-core + Pa11y

### Test Environment Setup

```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/stories/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ]
};
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { server } from './mocks/server';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});
```

## 🔬 Unit Testing

### Component Testing

```typescript
// src/components/common/Button/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies correct variant styles', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
  });

  it('shows loading state correctly', () => {
    render(<Button loading>Loading Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});
```

### Hook Testing

```typescript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { AuthProvider } from '../AuthProvider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth Hook', () => {
  it('initializes with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('logs in user successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });
    
    expect(result.current.user).toEqual({
      id: '1',
      email: 'test@example.com',
      role: 'student'
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles login failure', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      try {
        await result.current.login({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        });
      } catch (error) {
        expect(error.message).toBe('Invalid credentials');
      }
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logs out user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // First login
    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });
    
    // Then logout
    await act(async () => {
      result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

### Service Testing

```typescript
// src/services/__tests__/lessonService.test.ts
import { lessonService } from '../lessonService';
import { apiClient } from '../apiClient';

jest.mock('../apiClient');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('LessonService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLessons', () => {
    it('fetches lessons successfully', async () => {
      const mockLessons = [
        { id: '1', title: 'Lesson 1', subject: 'javascript' },
        { id: '2', title: 'Lesson 2', subject: 'python' }
      ];
      
      mockedApiClient.get.mockResolvedValue({ data: mockLessons });
      
      const result = await lessonService.getLessons();
      
      expect(mockedApiClient.get).toHaveBeenCalledWith('/lessons');
      expect(result).toEqual(mockLessons);
    });

    it('filters lessons by subject', async () => {
      const mockLessons = [
        { id: '1', title: 'JS Lesson', subject: 'javascript' }
      ];
      
      mockedApiClient.get.mockResolvedValue({ data: mockLessons });
      
      const result = await lessonService.getLessons('javascript');
      
      expect(mockedApiClient.get).toHaveBeenCalledWith('/lessons?subject=javascript');
      expect(result).toEqual(mockLessons);
    });

    it('handles API errors', async () => {
      const errorMessage = 'Network error';
      mockedApiClient.get.mockRejectedValue(new Error(errorMessage));
      
      await expect(lessonService.getLessons()).rejects.toThrow(errorMessage);
    });
  });

  describe('createLesson', () => {
    it('creates lesson successfully', async () => {
      const newLesson = {
        title: 'New Lesson',
        subject: 'javascript',
        content: 'Lesson content'
      };
      
      const createdLesson = { id: '3', ...newLesson };
      mockedApiClient.post.mockResolvedValue({ data: createdLesson });
      
      const result = await lessonService.createLesson(newLesson);
      
      expect(mockedApiClient.post).toHaveBeenCalledWith('/lessons', newLesson);
      expect(result).toEqual(createdLesson);
    });

    it('validates lesson data', async () => {
      const invalidLesson = { title: '' }; // Missing required fields
      
      await expect(lessonService.createLesson(invalidLesson as any))
        .rejects.toThrow('Invalid lesson data');
    });
  });
});
```

## 🔗 Integration Testing

### API Integration Tests

```typescript
// src/test/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body as any;
    
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          user: { id: '1', email, role: 'student' },
          token: 'mock-jwt-token'
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid credentials' })
    );
  }),

  // Lessons endpoints
  rest.get('/api/lessons', (req, res, ctx) => {
    const subject = req.url.searchParams.get('subject');
    
    let lessons = [
      { id: '1', title: 'JavaScript Basics', subject: 'javascript' },
      { id: '2', title: 'Python Fundamentals', subject: 'python' }
    ];
    
    if (subject) {
      lessons = lessons.filter(lesson => lesson.subject === subject);
    }
    
    return res(ctx.status(200), ctx.json(lessons));
  }),

  rest.post('/api/lessons', (req, res, ctx) => {
    const lesson = req.body as any;
    
    return res(
      ctx.status(201),
      ctx.json({ id: '3', ...lesson })
    );
  }),

  // Progress endpoints
  rest.post('/api/progress', (req, res, ctx) => {
    const progress = req.body as any;
    
    return res(
      ctx.status(200),
      ctx.json({ id: '1', ...progress, updatedAt: new Date().toISOString() })
    );
  })
];
```

```typescript
// src/test/integration/lesson-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { LessonViewer } from '../../components/lesson/LessonViewer';

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Lesson Flow Integration', () => {
  it('completes full lesson workflow', async () => {
    render(
      <TestWrapper>
        <LessonViewer lessonId="1" />
      </TestWrapper>
    );

    // Wait for lesson to load
    await waitFor(() => {
      expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
    });

    // Start lesson
    fireEvent.click(screen.getByText('Start Lesson'));

    // Complete exercises
    const codeEditor = screen.getByTestId('code-editor');
    fireEvent.change(codeEditor, {
      target: { value: 'console.log("Hello, World!");' }
    });

    // Run code
    fireEvent.click(screen.getByText('Run Code'));

    // Wait for output
    await waitFor(() => {
      expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    });

    // Submit lesson
    fireEvent.click(screen.getByText('Complete Lesson'));

    // Verify completion
    await waitFor(() => {
      expect(screen.getByText('Lesson Completed!')).toBeInTheDocument();
    });

    // Check progress update
    expect(screen.getByText('Progress: 100%')).toBeInTheDocument();
  });

  it('handles lesson errors gracefully', async () => {
    // Mock API error
    server.use(
      rest.get('/api/lessons/invalid', (req, res, ctx) => {
        return res(ctx.status(404), ctx.json({ error: 'Lesson not found' }));
      })
    );

    render(
      <TestWrapper>
        <LessonViewer lessonId="invalid" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Lesson not found')).toBeInTheDocument();
    });
  });
});
```

### Database Integration Tests

```typescript
// src/test/integration/database.test.ts
import { DatabaseService } from '../../services/databaseService';
import { testDatabase } from '../helpers/testDatabase';

describe('Database Integration', () => {
  let db: DatabaseService;

  beforeAll(async () => {
    db = await testDatabase.setup();
  });

  afterAll(async () => {
    await testDatabase.teardown();
  });

  beforeEach(async () => {
    await testDatabase.seed();
  });

  afterEach(async () => {
    await testDatabase.cleanup();
  });

  describe('User Operations', () => {
    it('creates and retrieves user', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student' as const,
        school: 'Test School'
      };

      const createdUser = await db.users.create(userData);
      expect(createdUser.id).toBeDefined();
      expect(createdUser.email).toBe(userData.email);

      const retrievedUser = await db.users.findById(createdUser.id);
      expect(retrievedUser).toEqual(createdUser);
    });

    it('handles duplicate email constraint', async () => {
      const userData = {
        email: 'duplicate@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student' as const,
        school: 'Test School'
      };

      await db.users.create(userData);
      
      await expect(db.users.create(userData))
        .rejects.toThrow('Email already exists');
    });
  });

  describe('Lesson Progress Tracking', () => {
    it('tracks lesson progress correctly', async () => {
      const user = await db.users.create({
        email: 'student@example.com',
        firstName: 'Student',
        lastName: 'User',
        role: 'student',
        school: 'Test School'
      });

      const lesson = await db.lessons.create({
        title: 'Test Lesson',
        subject: 'javascript',
        content: 'Test content'
      });

      // Start lesson
      await db.progress.upsert({
        userId: user.id,
        lessonId: lesson.id,
        completed: false,
        score: 0
      });

      // Update progress
      await db.progress.upsert({
        userId: user.id,
        lessonId: lesson.id,
        completed: false,
        score: 50
      });

      // Complete lesson
      await db.progress.upsert({
        userId: user.id,
        lessonId: lesson.id,
        completed: true,
        score: 95
      });

      const finalProgress = await db.progress.findByUserAndLesson(
        user.id,
        lesson.id
      );

      expect(finalProgress.completed).toBe(true);
      expect(finalProgress.score).toBe(95);
    });
  });
});
```

## 🎭 End-to-End Testing

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
```

### E2E Test Examples

```typescript
// e2e/student-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Student Learning Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test data
    await page.goto('/test-setup');
    await page.click('[data-testid="create-test-data"]');
  });

  test('student can complete a full lesson', async ({ page }) => {
    // Login as student
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'student@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navigate to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]'))
      .toContainText('Welcome back');

    // Go to lessons
    await page.click('[data-testid="lessons-nav"]');
    await expect(page).toHaveURL('/lessons');

    // Select a lesson
    await page.click('[data-testid="lesson-card"]:first-child');
    await expect(page.locator('[data-testid="lesson-title"]'))
      .toBeVisible();

    // Start the lesson
    await page.click('[data-testid="start-lesson"]');
    
    // Complete exercises
    const codeEditor = page.locator('[data-testid="code-editor"]');
    await codeEditor.fill('console.log("Hello, World!");');
    
    await page.click('[data-testid="run-code"]');
    await expect(page.locator('[data-testid="output"]'))
      .toContainText('Hello, World!');

    // Submit lesson
    await page.click('[data-testid="complete-lesson"]');
    
    // Verify completion
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Lesson completed successfully!');
    
    // Check points awarded
    await expect(page.locator('[data-testid="points-display"]'))
      .toContainText('+100 points');
  });

  test('student can use AI tutor for help', async ({ page }) => {
    await page.goto('/lessons/javascript-basics');
    
    // Open AI tutor
    await page.click('[data-testid="ai-tutor-button"]');
    await expect(page.locator('[data-testid="ai-tutor-modal"]'))
      .toBeVisible();
    
    // Ask for help
    await page.fill('[data-testid="ai-question"]', 'How do I declare a variable?');
    await page.click('[data-testid="ask-ai"]');
    
    // Wait for AI response
    await expect(page.locator('[data-testid="ai-response"]'))
      .toContainText('variable', { timeout: 10000 });
    
    // Apply suggestion
    await page.click('[data-testid="apply-suggestion"]');
    await expect(page.locator('[data-testid="code-editor"]'))
      .toContainText('let');
  });

  test('handles offline functionality', async ({ page, context }) => {
    // Go online first and load the app
    await page.goto('/lessons');
    await expect(page.locator('[data-testid="lessons-list"]')).toBeVisible();
    
    // Go offline
    await context.setOffline(true);
    
    // Navigate to a cached lesson
    await page.click('[data-testid="lesson-card"]:first-child');
    
    // Verify offline functionality
    await expect(page.locator('[data-testid="offline-indicator"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="lesson-content"]'))
      .toBeVisible();
    
    // Complete lesson offline
    await page.fill('[data-testid="code-editor"]', 'console.log("Offline!");');
    await page.click('[data-testid="run-code"]');
    
    // Verify offline completion
    await expect(page.locator('[data-testid="offline-completion"]'))
      .toContainText('Will sync when online');
    
    // Go back online
    await context.setOffline(false);
    
    // Verify sync
    await expect(page.locator('[data-testid="sync-success"]'))
      .toBeVisible({ timeout: 5000 });
  });
});
```

```typescript
// e2e/teacher-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Teacher Workflow', () => {
  test('teacher can create and assign lessons', async ({ page }) => {
    // Login as teacher
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'teacher@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navigate to lesson creation
    await page.click('[data-testid="create-lesson"]');
    
    // Fill lesson details
    await page.fill('[data-testid="lesson-title"]', 'New JavaScript Lesson');
    await page.selectOption('[data-testid="lesson-subject"]', 'javascript');
    await page.fill('[data-testid="lesson-description"]', 'Learn JavaScript basics');
    
    // Add lesson content
    await page.fill('[data-testid="lesson-content"]', `
      # JavaScript Variables
      
      Variables are containers for storing data values.
      
      ## Example
      \`\`\`javascript
      let message = "Hello, World!";
      console.log(message);
      \`\`\`
    `);
    
    // Add exercise
    await page.click('[data-testid="add-exercise"]');
    await page.fill('[data-testid="exercise-prompt"]', 'Create a variable named greeting');
    await page.fill('[data-testid="exercise-solution"]', 'let greeting = "Hello!";');
    
    // Save lesson
    await page.click('[data-testid="save-lesson"]');
    
    // Verify lesson created
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Lesson created successfully');
    
    // Assign to classroom
    await page.click('[data-testid="assign-lesson"]');
    await page.selectOption('[data-testid="classroom-select"]', 'Class A');
    await page.fill('[data-testid="due-date"]', '2024-12-31');
    await page.click('[data-testid="assign-button"]');
    
    // Verify assignment
    await expect(page.locator('[data-testid="assignment-success"]'))
      .toContainText('Lesson assigned to Class A');
  });

  test('teacher can view student progress', async ({ page }) => {
    await page.goto('/teacher/dashboard');
    
    // Navigate to progress view
    await page.click('[data-testid="student-progress"]');
    
    // Filter by classroom
    await page.selectOption('[data-testid="classroom-filter"]', 'Class A');
    
    // Verify progress data
    await expect(page.locator('[data-testid="progress-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="student-row"]')).toHaveCount(5);
    
    // View individual student
    await page.click('[data-testid="student-row"]:first-child [data-testid="view-details"]');
    
    // Verify detailed progress
    await expect(page.locator('[data-testid="student-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="completed-lessons"]')).toContainText('3/5');
    await expect(page.locator('[data-testid="average-score"]')).toContainText('85%');
  });
});
```

## 🎨 Visual Testing

### Storybook Configuration

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    '@storybook/addon-docs'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  features: {
    buildStoriesJson: true
  }
};

export default config;
```

```typescript
// src/components/common/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and states.'
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    onClick: { action: 'clicked' }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading Button'
  }
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button'
  }
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  )
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  )
};
```

### Chromatic Integration

```yaml
# .github/workflows/chromatic.yml
name: Chromatic

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  chromatic-deployment:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      with:
        fetch-depth: 0
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Publish to Chromatic
      uses: chromaui/action@v1
      with:
        projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
        buildScriptName: 'build-storybook'
        exitZeroOnChanges: true
        onlyChanged: true
```

## ⚡ Performance Testing

### Lighthouse CI Configuration

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/lessons'
      ],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

### Custom Performance Tests

```typescript
// src/test/performance/bundle-size.test.ts
import { analyzeBundle } from '../helpers/bundleAnalyzer';

describe('Bundle Size Performance', () => {
  it('main bundle should be under size limit', async () => {
    const analysis = await analyzeBundle('dist/assets/index-*.js');
    
    expect(analysis.gzippedSize).toBeLessThan(500 * 1024); // 500KB
  });

  it('vendor bundle should be under size limit', async () => {
    const analysis = await analyzeBundle('dist/assets/vendor-*.js');
    
    expect(analysis.gzippedSize).toBeLessThan(300 * 1024); // 300KB
  });

  it('should not have duplicate dependencies', async () => {
    const analysis = await analyzeBundle('dist/assets/*.js');
    
    expect(analysis.duplicates).toHaveLength(0);
  });
});
```

## 🔒 Security Testing

### OWASP ZAP Integration

```yaml
# .github/workflows/security-test.yml
name: Security Testing

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday at 2 AM

jobs:
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Start application
      run: |
        npm ci
        npm run build
        npm run preview &
        sleep 30
    
    - name: Run OWASP ZAP scan
      uses: zaproxy/action-baseline@v0.7.0
      with:
        target: 'http://localhost:4173'
        rules_file_name: '.zap/rules.tsv'
        cmd_options: '-a'
    
    - name: Upload ZAP results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: zap-results
        path: report_html.html
```

### Security Test Cases

```typescript
// src/test/security/xss-prevention.test.ts
import { render, screen } from '@testing-library/react';
import { UserProfile } from '../../components/user/UserProfile';

describe('XSS Prevention', () => {
  it('sanitizes user input in profile display', () => {
    const maliciousUser = {
      id: '1',
      firstName: '<script>alert("XSS")</script>',
      lastName: '<img src=x onerror=alert("XSS")>',
      email: 'test@example.com'
    };

    render(<UserProfile user={maliciousUser} />);

    // Verify script tags are not executed
    expect(screen.queryByText('alert("XSS")')).not.toBeInTheDocument();
    
    // Verify content is properly escaped
    expect(screen.getByText('&lt;script&gt;alert("XSS")&lt;/script&gt;'))
      .toBeInTheDocument();
  });

  it('prevents code injection in lesson content', () => {
    const maliciousLesson = {
      id: '1',
      title: 'Test Lesson',
      content: `
        # Lesson Title
        <script>window.location = 'http://evil.com'</script>
        <iframe src="javascript:alert('XSS')"></iframe>
      `
    };

    render(<LessonViewer lesson={maliciousLesson} />);

    // Verify dangerous elements are removed
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
  });
});
```

## ♿ Accessibility Testing

### Automated A11y Tests

```typescript
// src/test/accessibility/a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../../components/common/Button';
import { LoginForm } from '../../components/auth/LoginForm';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Button component has no accessibility violations', async () => {
    const { container } = render(
      <Button onClick={() => {}}>Click me</Button>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('LoginForm has proper ARIA labels', async () => {
    const { container } = render(<LoginForm />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', async () => {
    const { container } = render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </div>
    );
    
    const buttons = container.querySelectorAll('button');
    
    // Verify all buttons are focusable
    buttons.forEach(button => {
      expect(button.tabIndex).not.toBe(-1);
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## 📊 Test Reporting & Metrics

### Coverage Reports

```json
// package.json
{
  "scripts": {
    "test:coverage": "jest --coverage --watchAll=false",
    "test:coverage:ci": "jest --coverage --watchAll=false --ci --reporters=default --reporters=jest-junit"
  },
  "jest-junit": {
    "outputDirectory": "test-results",
    "outputName": "junit.xml"
  }
}
```

### Test Metrics Dashboard

```typescript
// scripts/test-metrics.ts
import fs from 'fs';
import path from 'path';

interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  performance: {
    averageTestTime: number;
    slowestTests: Array<{ name: string; duration: number }>;
  };
}

class TestMetricsCollector {
  async collectMetrics(): Promise<TestMetrics> {
    const jestResults = this.parseJestResults();
    const coverageData = this.parseCoverageData();
    const performanceData = this.parsePerformanceData();

    return {
      totalTests: jestResults.numTotalTests,
      passedTests: jestResults.numPassedTests,
      failedTests: jestResults.numFailedTests,
      coverage: coverageData,
      performance: performanceData
    };
  }

  private parseJestResults() {
    const resultsPath = path.join(process.cwd(), 'test-results/junit.xml');
    // Parse Jest results from XML
    return this.parseXMLResults(resultsPath);
  }

  private parseCoverageData() {
    const coveragePath = path.join(process.cwd(), 'coverage/coverage-summary.json');
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    
    return {
      lines: coverage.total.lines.pct,
      functions: coverage.total.functions.pct,
      branches: coverage.total.branches.pct,
      statements: coverage.total.statements.pct
    };
  }

  async generateReport(): Promise<void> {
    const metrics = await this.collectMetrics();
    
    const report = `
# Test Metrics Report

## Test Results
- Total Tests: ${metrics.totalTests}
- Passed: ${metrics.passedTests}
- Failed: ${metrics.failedTests}
- Success Rate: ${((metrics.passedTests / metrics.totalTests) * 100).toFixed(2)}%

## Coverage
- Lines: ${metrics.coverage.lines}%
- Functions: ${metrics.coverage.functions}%
- Branches: ${metrics.coverage.branches}%
- Statements: ${metrics.coverage.statements}%

## Performance
- Average Test Time: ${metrics.performance.averageTestTime}ms

### Slowest Tests
${metrics.performance.slowestTests.map(test => 
  `- ${test.name}: ${test.duration}ms`
).join('\n')}

Generated: ${new Date().toISOString()}
    `;

    fs.writeFileSync('test-metrics-report.md', report);
  }
}
```

## 🚀 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:coverage:ci
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: test-results/

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run integration tests
      run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload E2E results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    needs: e2e-tests
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
    
    - name: Run Lighthouse CI
      run: npm run test:lighthouse
    
    - name: Upload Lighthouse results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: lighthouse-results
        path: .lighthouseci/
```

## 📋 Testing Checklist

### Pre-Release Testing

- [ ] **Unit Tests**
  - [ ] All components tested
  - [ ] All hooks tested
  - [ ] All services tested
  - [ ] Coverage > 80%

- [ ] **Integration Tests**
  - [ ] API integration tested
  - [ ] Database operations tested
  - [ ] Authentication flow tested
  - [ ] Error handling tested

- [ ] **E2E Tests**
  - [ ] Critical user journeys tested
  - [ ] Cross-browser compatibility
  - [ ] Mobile responsiveness
  - [ ] Offline functionality

- [ ] **Performance Tests**
  - [ ] Lighthouse scores > 80
  - [ ] Bundle size within limits
  - [ ] Load time < 3 seconds
  - [ ] No memory leaks

- [ ] **Security Tests**
  - [ ] XSS prevention verified
  - [ ] CSRF protection tested
  - [ ] Input validation tested
  - [ ] Authentication security tested

- [ ] **Accessibility Tests**
  - [ ] WCAG 2.1 AA compliance
  - [ ] Keyboard navigation
  - [ ] Screen reader compatibility
  - [ ] Color contrast ratios

### Test Maintenance

- [ ] **Regular Updates**
  - [ ] Test dependencies updated
  - [ ] Test data refreshed
  - [ ] Flaky tests fixed
  - [ ] Test documentation updated

- [ ] **Performance Monitoring**
  - [ ] Test execution time tracked
  - [ ] Slow tests optimized
  - [ ] Test parallelization optimized
  - [ ] CI/CD pipeline optimized

---

## 📚 Resources

- **Jest Documentation**: https://jestjs.io/docs
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro
- **Playwright Documentation**: https://playwright.dev/
- **Storybook Documentation**: https://storybook.js.org/docs
- **Testing Best Practices**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

---

*Testing Documentation Version: 1.0.0*  
*Last Updated: January 2024*