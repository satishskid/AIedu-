// Database Models and TypeScript Interfaces

// Base model interface
export interface BaseModel {
  id: string
  createdAt: string
  updatedAt: string
}

// User models
export interface User extends BaseModel {
  email: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  role: UserRole
  status: UserStatus
  preferences: UserPreferences
  profile: UserProfile
  subscription?: UserSubscription
  lastLoginAt?: string
  emailVerifiedAt?: string
  twoFactorEnabled: boolean
  timezone: string
  language: string
}

export type UserRole = 'student' | 'teacher' | 'admin' | 'parent'
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: NotificationPreferences
  privacy: PrivacyPreferences
  accessibility: AccessibilityPreferences
  learning: LearningPreferences
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  achievements: boolean
  reminders: boolean
  updates: boolean
  marketing: boolean
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'friends' | 'private'
  showProgress: boolean
  showAchievements: boolean
  allowAnalytics: boolean
}

export interface AccessibilityPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
}

export interface LearningPreferences {
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  pace: 'slow' | 'normal' | 'fast'
  style: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  reminders: boolean
  hints: boolean
  autoSave: boolean
}

export interface UserProfile {
  bio?: string
  website?: string
  location?: string
  birthDate?: string
  occupation?: string
  education?: string
  interests: string[]
  skills: string[]
  goals: string[]
  socialLinks: SocialLinks
}

export interface SocialLinks {
  github?: string
  linkedin?: string
  twitter?: string
  portfolio?: string
}

export interface UserSubscription {
  plan: 'free' | 'basic' | 'premium' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  startDate: string
  endDate?: string
  autoRenew: boolean
  features: string[]
}

// Lesson models
export interface Lesson extends BaseModel {
  title: string
  description: string
  content: LessonContent
  courseId: string
  category: LessonCategory
  difficulty: DifficultyLevel
  duration: number // in minutes
  prerequisites: string[] // lesson IDs
  objectives: string[]
  tags: string[]
  language: ProgrammingLanguage
  status: ContentStatus
  version: string
  author: string
  metadata: LessonMetadata
  resources: LessonResource[]
  assessments: Assessment[]
}

export type LessonCategory = 
  | 'programming-basics'
  | 'web-development'
  | 'mobile-development'
  | 'data-science'
  | 'machine-learning'
  | 'algorithms'
  | 'databases'
  | 'devops'
  | 'security'
  | 'ui-ux'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type ContentStatus = 'draft' | 'published' | 'archived' | 'under-review'
export type ProgrammingLanguage = 
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'swift'
  | 'kotlin'
  | 'html'
  | 'css'
  | 'sql'
  | 'other'

export interface LessonContent {
  type: 'interactive' | 'video' | 'text' | 'mixed'
  sections: LessonSection[]
  exercises: Exercise[]
  codeExamples: CodeExample[]
  quizzes: Quiz[]
}

export interface LessonSection {
  id: string
  title: string
  content: string
  type: 'text' | 'code' | 'video' | 'interactive'
  order: number
  estimatedTime: number
}

export interface Exercise {
  id: string
  title: string
  description: string
  instructions: string[]
  starterCode?: string
  solution?: string
  hints: string[]
  testCases: TestCase[]
  difficulty: DifficultyLevel
  points: number
}

export interface TestCase {
  id: string
  input: any
  expectedOutput: any
  description: string
  hidden: boolean
}

export interface CodeExample {
  id: string
  title: string
  description: string
  code: string
  language: ProgrammingLanguage
  explanation: string
  runnable: boolean
}

export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
  timeLimit?: number
  passingScore: number
  attempts: number
}

export interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'code'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation: string
  points: number
}

export interface LessonMetadata {
  estimatedTime: number
  completionRate: number
  averageRating: number
  totalRatings: number
  lastUpdated: string
  viewCount: number
  completionCount: number
}

export interface LessonResource {
  id: string
  type: 'link' | 'file' | 'video' | 'book' | 'tool'
  title: string
  description: string
  url: string
  thumbnail?: string
  required: boolean
}

export interface Assessment {
  id: string
  type: 'quiz' | 'project' | 'peer-review' | 'auto-graded'
  title: string
  description: string
  maxScore: number
  timeLimit?: number
  attempts: number
  dueDate?: string
  rubric?: AssessmentRubric
}

export interface AssessmentRubric {
  criteria: RubricCriterion[]
  totalPoints: number
}

export interface RubricCriterion {
  id: string
  name: string
  description: string
  maxPoints: number
  levels: RubricLevel[]
}

export interface RubricLevel {
  name: string
  description: string
  points: number
}

// Progress models
export interface Progress extends BaseModel {
  userId: string
  lessonId: string
  courseId: string
  status: ProgressStatus
  completionPercentage: number
  timeSpent: number // in seconds
  score?: number
  attempts: number
  lastAccessedAt: string
  completedAt?: string
  sections: SectionProgress[]
  exercises: ExerciseProgress[]
  quizzes: QuizProgress[]
  notes: ProgressNote[]
  bookmarks: Bookmark[]
}

export type ProgressStatus = 
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'paused'
  | 'failed'
  | 'skipped'

export interface SectionProgress {
  sectionId: string
  status: ProgressStatus
  timeSpent: number
  completedAt?: string
  lastAccessedAt: string
}

export interface ExerciseProgress {
  exerciseId: string
  status: ProgressStatus
  attempts: number
  bestScore: number
  lastScore?: number
  timeSpent: number
  completedAt?: string
  submissions: ExerciseSubmission[]
}

export interface ExerciseSubmission {
  id: string
  code: string
  result: SubmissionResult
  submittedAt: string
  timeSpent: number
}

export interface SubmissionResult {
  passed: boolean
  score: number
  testResults: TestResult[]
  feedback: string
  errors?: string[]
}

export interface TestResult {
  testCaseId: string
  passed: boolean
  actualOutput: any
  executionTime: number
  error?: string
}

export interface QuizProgress {
  quizId: string
  status: ProgressStatus
  attempts: number
  bestScore: number
  lastScore?: number
  timeSpent: number
  completedAt?: string
  submissions: QuizSubmission[]
}

export interface QuizSubmission {
  id: string
  answers: QuizAnswer[]
  score: number
  submittedAt: string
  timeSpent: number
}

export interface QuizAnswer {
  questionId: string
  answer: string | string[]
  correct: boolean
  points: number
}

export interface ProgressNote {
  id: string
  content: string
  sectionId?: string
  timestamp: string
  tags: string[]
}

export interface Bookmark {
  id: string
  sectionId: string
  title: string
  description?: string
  timestamp: string
  tags: string[]
}

// Achievement models
export interface Achievement extends BaseModel {
  userId: string
  type: AchievementType
  title: string
  description: string
  icon: string
  category: AchievementCategory
  difficulty: DifficultyLevel
  points: number
  requirements: AchievementRequirement[]
  progress: AchievementProgress
  unlockedAt?: string
  metadata: AchievementMetadata
}

export type AchievementType = 
  | 'completion'
  | 'streak'
  | 'score'
  | 'time'
  | 'social'
  | 'milestone'
  | 'special'

export type AchievementCategory = 
  | 'learning'
  | 'coding'
  | 'collaboration'
  | 'consistency'
  | 'mastery'
  | 'exploration'
  | 'community'

export interface AchievementRequirement {
  type: 'lesson-completion' | 'score-threshold' | 'streak-days' | 'time-spent' | 'custom'
  target: number
  description: string
}

export interface AchievementProgress {
  current: number
  target: number
  percentage: number
  milestones: AchievementMilestone[]
}

export interface AchievementMilestone {
  value: number
  description: string
  reached: boolean
  reachedAt?: string
}

export interface AchievementMetadata {
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  earnedBy: number // number of users who earned this
  firstEarnedAt?: string
  lastEarnedAt?: string
}

// Project models
export interface Project extends BaseModel {
  userId: string
  title: string
  description: string
  language: ProgrammingLanguage
  framework?: string
  status: ProjectStatus
  visibility: 'private' | 'public' | 'shared'
  files: ProjectFile[]
  dependencies: ProjectDependency[]
  settings: ProjectSettings
  metadata: ProjectMetadata
  collaboration: ProjectCollaboration
}

export type ProjectStatus = 'active' | 'completed' | 'archived' | 'template'

export interface ProjectFile {
  id: string
  name: string
  path: string
  content: string
  language: ProgrammingLanguage
  size: number
  lastModified: string
  isMain: boolean
}

export interface ProjectDependency {
  name: string
  version: string
  type: 'runtime' | 'dev' | 'peer'
  source: 'npm' | 'cdn' | 'local'
}

export interface ProjectSettings {
  autoSave: boolean
  autoFormat: boolean
  linting: boolean
  theme: string
  fontSize: number
  tabSize: number
  wordWrap: boolean
  minimap: boolean
}

export interface ProjectMetadata {
  size: number // total size in bytes
  fileCount: number
  lastOpened: string
  totalEditTime: number
  runCount: number
  shareCount: number
  forkCount: number
  starCount: number
}

export interface ProjectCollaboration {
  enabled: boolean
  collaborators: ProjectCollaborator[]
  permissions: ProjectPermissions
  invitations: ProjectInvitation[]
}

export interface ProjectCollaborator {
  userId: string
  role: 'owner' | 'editor' | 'viewer'
  joinedAt: string
  lastActiveAt: string
}

export interface ProjectPermissions {
  canEdit: boolean
  canRun: boolean
  canShare: boolean
  canDelete: boolean
  canInvite: boolean
}

export interface ProjectInvitation {
  id: string
  email: string
  role: 'editor' | 'viewer'
  invitedBy: string
  invitedAt: string
  expiresAt: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
}

// Conversation models
export interface Conversation extends BaseModel {
  userId: string
  sessionId: string
  title: string
  type: ConversationType
  status: ConversationStatus
  messages: ConversationMessage[]
  context: ConversationContext
  metadata: ConversationMetadata
}

export type ConversationType = 
  | 'tutoring'
  | 'code-review'
  | 'debugging'
  | 'explanation'
  | 'general'
  | 'assessment'

export type ConversationStatus = 'active' | 'paused' | 'completed' | 'archived'

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  type: 'text' | 'code' | 'image' | 'file'
  metadata?: MessageMetadata
  reactions?: MessageReaction[]
}

export interface MessageMetadata {
  language?: ProgrammingLanguage
  codeType?: 'snippet' | 'full-file' | 'diff'
  fileName?: string
  lineNumbers?: boolean
  highlighted?: number[]
  tokens?: number
  processingTime?: number
}

export interface MessageReaction {
  type: 'helpful' | 'not-helpful' | 'unclear' | 'correct' | 'incorrect'
  timestamp: string
}

export interface ConversationContext {
  lessonId?: string
  projectId?: string
  exerciseId?: string
  currentCode?: string
  currentLanguage?: ProgrammingLanguage
  userLevel: DifficultyLevel
  preferences: ConversationPreferences
}

export interface ConversationPreferences {
  explanationStyle: 'detailed' | 'concise' | 'step-by-step'
  codeStyle: 'beginner' | 'intermediate' | 'advanced'
  includeExamples: boolean
  includeResources: boolean
  language: string
}

export interface ConversationMetadata {
  messageCount: number
  totalTokens: number
  duration: number // in seconds
  satisfaction?: number // 1-5 rating
  tags: string[]
  summary?: string
}

// Preferences models
export interface UserPreferencesRecord extends BaseModel {
  userId: string
  category: PreferenceCategory
  preferences: Record<string, any>
  version: string
}

export type PreferenceCategory = 
  | 'ui'
  | 'learning'
  | 'notifications'
  | 'privacy'
  | 'accessibility'
  | 'editor'
  | 'ai'
  | 'gamification'

// Cache models
export interface CacheItem {
  key: string
  data: any
  type: CacheType
  createdAt: string
  expiresAt: string
  size?: number
  tags?: string[]
}

export type CacheType = 
  | 'api-response'
  | 'user-data'
  | 'lesson-content'
  | 'media'
  | 'computation'
  | 'search-results'
  | 'temporary'

// Sync models
export interface SyncItem extends BaseModel {
  type: SyncItemType
  entityId: string
  action: SyncAction
  data: any
  status: SyncStatus
  priority: SyncPriority
  retryCount: number
  lastError?: string
  lastModified: string
  lastSynced?: string
  checksum: string
}

export type SyncItemType = 
  | 'user'
  | 'progress'
  | 'project'
  | 'achievement'
  | 'conversation'
  | 'preferences'

export type SyncAction = 'create' | 'update' | 'delete' | 'restore'
export type SyncStatus = 'pending' | 'syncing' | 'completed' | 'failed' | 'conflict'
export type SyncPriority = 'low' | 'normal' | 'high' | 'critical'

// Utility types
export interface PaginationOptions {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface SearchOptions {
  query: string
  filters?: Record<string, any>
  facets?: string[]
  highlight?: boolean
  fuzzy?: boolean
}

export interface SearchResult<T> {
  items: T[]
  total: number
  facets?: Record<string, any>
  suggestions?: string[]
  took: number
}

// Validation schemas (for runtime validation)
export const ValidationSchemas = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
}

// Type guards
export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string'
}

export const isLesson = (obj: any): obj is Lesson => {
  return obj && typeof obj.id === 'string' && typeof obj.title === 'string'
}

export const isProgress = (obj: any): obj is Progress => {
  return obj && typeof obj.id === 'string' && typeof obj.userId === 'string' && typeof obj.lessonId === 'string'
}

export const isProject = (obj: any): obj is Project => {
  return obj && typeof obj.id === 'string' && typeof obj.userId === 'string' && typeof obj.title === 'string'
}

// Default values
export const createDefaultUser = (overrides: Partial<User> = {}): User => ({
  id: '',
  email: '',
  username: '',
  firstName: '',
  lastName: '',
  role: 'student',
  status: 'active',
  preferences: {
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      achievements: true,
      reminders: true,
      updates: true,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      showProgress: true,
      showAchievements: true,
      allowAnalytics: true
    },
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: false
    },
    learning: {
      difficulty: 'beginner',
      pace: 'normal',
      style: 'mixed',
      reminders: true,
      hints: true,
      autoSave: true
    }
  },
  profile: {
    interests: [],
    skills: [],
    goals: [],
    socialLinks: {}
  },
  twoFactorEnabled: false,
  timezone: 'UTC',
  language: 'en',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})

export const createDefaultProgress = (userId: string, lessonId: string, courseId: string): Progress => ({
  id: `${userId}-${lessonId}`,
  userId,
  lessonId,
  courseId,
  status: 'not-started',
  completionPercentage: 0,
  timeSpent: 0,
  attempts: 0,
  lastAccessedAt: new Date().toISOString(),
  sections: [],
  exercises: [],
  quizzes: [],
  notes: [],
  bookmarks: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

export const createDefaultProject = (userId: string, title: string, language: ProgrammingLanguage): Project => ({
  id: '',
  userId,
  title,
  description: '',
  language,
  status: 'active',
  visibility: 'private',
  files: [],
  dependencies: [],
  settings: {
    autoSave: true,
    autoFormat: true,
    linting: true,
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: true
  },
  metadata: {
    size: 0,
    fileCount: 0,
    lastOpened: new Date().toISOString(),
    totalEditTime: 0,
    runCount: 0,
    shareCount: 0,
    forkCount: 0,
    starCount: 0
  },
  collaboration: {
    enabled: false,
    collaborators: [],
    permissions: {
      canEdit: true,
      canRun: true,
      canShare: true,
      canDelete: true,
      canInvite: true
    },
    invitations: []
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})