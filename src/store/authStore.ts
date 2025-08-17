import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  avatar?: string
  organizationId?: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: boolean
    soundEffects: boolean
  }
  stats: {
    totalPoints: number
    level: number
    completedLessons: number
    streak: number
    lastActive: string
  }
  createdAt: string
  lastLoginAt: string
}

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  sessionToken: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: RegisterData) => Promise<boolean>
  updateUser: (updates: Partial<User>) => Promise<boolean>
  refreshToken: () => Promise<boolean>
  clearError: () => void
  checkAuthStatus: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: 'student' | 'teacher'
  organizationId?: string
}

// Mock authentication (replace with actual API calls)
const mockUsers: Record<string, User & { password: string }> = {
  'student@demo.com': {
    id: 'user-1',
    email: 'student@demo.com',
    password: 'demo123',
    name: 'Demo Student',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
    organizationId: 'org-1',
    preferences: {
      theme: 'system',
      language: 'en',
      notifications: true,
      soundEffects: true
    },
    stats: {
      totalPoints: 1250,
      level: 5,
      completedLessons: 12,
      streak: 7,
      lastActive: new Date().toISOString()
    },
    createdAt: '2024-01-15T10:00:00Z',
    lastLoginAt: new Date().toISOString()
  },
  'teacher@demo.com': {
    id: 'user-2',
    email: 'teacher@demo.com',
    password: 'demo123',
    name: 'Demo Teacher',
    role: 'teacher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
    organizationId: 'org-1',
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: true,
      soundEffects: false
    },
    stats: {
      totalPoints: 2500,
      level: 8,
      completedLessons: 25,
      streak: 15,
      lastActive: new Date().toISOString()
    },
    createdAt: '2024-01-10T08:00:00Z',
    lastLoginAt: new Date().toISOString()
  },
  'admin@demo.com': {
    id: 'user-3',
    email: 'admin@demo.com',
    password: 'admin123',
    name: 'Demo Admin',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    organizationId: 'org-1',
    preferences: {
      theme: 'dark',
      language: 'en',
      notifications: true,
      soundEffects: false
    },
    stats: {
      totalPoints: 5000,
      level: 12,
      completedLessons: 50,
      streak: 30,
      lastActive: new Date().toISOString()
    },
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: new Date().toISOString()
  }
}

// Mock API functions
const authenticateUser = async (email: string, password: string): Promise<{ user: User; token: string } | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const mockUser = mockUsers[email.toLowerCase()]
  
  if (!mockUser || mockUser.password !== password) {
    throw new Error('Invalid email or password')
  }
  
  // Remove password from user object
  const { password: _, ...user } = mockUser
  
  // Update last login
  user.lastLoginAt = new Date().toISOString()
  user.stats.lastActive = new Date().toISOString()
  
  return {
    user,
    token: `mock-token-${user.id}-${Date.now()}`
  }
}

const registerUser = async (userData: RegisterData): Promise<{ user: User; token: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Check if user already exists
  if (mockUsers[userData.email.toLowerCase()]) {
    throw new Error('User with this email already exists')
  }
  
  // Create new user
  const newUser: User = {
    id: `user-${Date.now()}`,
    email: userData.email.toLowerCase(),
    name: userData.name,
    role: userData.role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
    organizationId: userData.organizationId,
    preferences: {
      theme: 'system',
      language: 'en',
      notifications: true,
      soundEffects: true
    },
    stats: {
      totalPoints: 0,
      level: 1,
      completedLessons: 0,
      streak: 0,
      lastActive: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  }
  
  return {
    user: newUser,
    token: `mock-token-${newUser.id}-${Date.now()}`
  }
}

const validateToken = async (token: string): Promise<User | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Mock token validation
  if (!token.startsWith('mock-token-')) {
    return null
  }
  
  // Extract user ID from token
  const parts = token.split('-')
  if (parts.length < 3) {
    return null
  }
  
  const userId = parts[2]
  
  // Find user by ID
  const user = Object.values(mockUsers).find(u => u.id === userId)
  if (!user) {
    return null
  }
  
  // Remove password from user object
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionToken: null,
      
      // Login user
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const result = await authenticateUser(email, password)
          
          if (!result) {
            throw new Error('Authentication failed')
          }
          
          set({
            user: result.user,
            isAuthenticated: true,
            sessionToken: result.token,
            isLoading: false,
            error: null
          })
          
          return true
        } catch (error) {
          console.error('Login failed:', error)
          set({
            user: null,
            isAuthenticated: false,
            sessionToken: null,
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          })
          
          return false
        }
      },
      
      // Logout user
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          sessionToken: null,
          error: null
        })
      },
      
      // Register new user
      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null })
        
        try {
          const result = await registerUser(userData)
          
          set({
            user: result.user,
            isAuthenticated: true,
            sessionToken: result.token,
            isLoading: false,
            error: null
          })
          
          return true
        } catch (error) {
          console.error('Registration failed:', error)
          set({
            user: null,
            isAuthenticated: false,
            sessionToken: null,
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false
          })
          
          return false
        }
      },
      
      // Update user information
      updateUser: async (updates: Partial<User>) => {
        const state = get()
        if (!state.user || !state.sessionToken) {
          set({ error: 'Not authenticated' })
          return false
        }
        
        set({ isLoading: true, error: null })
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const updatedUser = { ...state.user, ...updates }
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null
          })
          
          return true
        } catch (error) {
          console.error('User update failed:', error)
          set({
            error: error instanceof Error ? error.message : 'Update failed',
            isLoading: false
          })
          
          return false
        }
      },
      
      // Refresh authentication token
      refreshToken: async () => {
        const state = get()
        if (!state.sessionToken) {
          return false
        }
        
        try {
          const user = await validateToken(state.sessionToken)
          
          if (!user) {
            set({
              user: null,
              isAuthenticated: false,
              sessionToken: null,
              error: 'Session expired'
            })
            return false
          }
          
          set({
            user,
            isAuthenticated: true,
            error: null
          })
          
          return true
        } catch (error) {
          console.error('Token refresh failed:', error)
          set({
            user: null,
            isAuthenticated: false,
            sessionToken: null,
            error: 'Session expired'
          })
          
          return false
        }
      },
      
      // Check authentication status
      checkAuthStatus: async () => {
        const state = get()
        if (!state.sessionToken) {
          set({ isAuthenticated: false, user: null })
          return
        }
        
        set({ isLoading: true })
        
        try {
          const user = await validateToken(state.sessionToken)
          
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              sessionToken: null,
              isLoading: false,
              error: 'Session expired'
            })
          }
        } catch (error) {
          console.error('Auth status check failed:', error)
          set({
            user: null,
            isAuthenticated: false,
            sessionToken: null,
            isLoading: false,
            error: 'Authentication check failed'
          })
        }
      },
      
      // Clear error state
      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'eduai-auth-storage',
      partialize: (state: AuthState) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionToken: state.sessionToken
      })
    }
  )
)

// Utility functions
export const getUserRole = (user: User | null): string => {
  return user?.role || 'guest'
}

export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false
  
  const rolePermissions: Record<string, string[]> = {
    student: ['view-lessons', 'submit-assignments', 'view-progress'],
    teacher: [
      'view-lessons', 'submit-assignments', 'view-progress',
      'create-assignments', 'grade-assignments', 'view-student-progress'
    ],
    admin: [
      'view-lessons', 'submit-assignments', 'view-progress',
      'create-assignments', 'grade-assignments', 'view-student-progress',
      'manage-users', 'manage-organization', 'view-analytics'
    ]
  }
  
  return rolePermissions[user.role]?.includes(permission) || false
}

export const formatUserName = (user: User | null): string => {
  if (!user) return 'Guest'
  return user.name || user.email.split('@')[0]
}

export const getUserLevel = (user: User | null): number => {
  return user?.stats.level || 1
}

export const getUserPoints = (user: User | null): number => {
  return user?.stats.totalPoints || 0
}

export const isUserActive = (user: User | null, hoursThreshold: number = 24): boolean => {
  if (!user) return false
  
  const lastActive = new Date(user.stats.lastActive)
  const now = new Date()
  const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)
  
  return diffHours <= hoursThreshold
}