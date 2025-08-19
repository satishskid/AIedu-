import { toast } from 'react-hot-toast'
// import { QueryClient } from '@tanstack/react-query' // TODO: Add when react-query is installed
type QueryClient = any // Temporary type until react-query is added

// Define RequestInit type for fetch API
interface RequestInit {
  method?: string
  headers?: Record<string, string> | Headers
  body?: string | FormData | Blob | null
  signal?: AbortSignal
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions'
// const API_VERSION = 'v1' // Reserved for future use
const API_TIMEOUT = 30000 // 30 seconds

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    PROFILE: '/auth/profile'
  },
  
  // License Management
  LICENSE: {
    VALIDATE: '/license/validate',
    ACTIVATE: '/license/activate',
    DEACTIVATE: '/license/deactivate',
    INFO: '/license/info',
    USAGE: '/license/usage',
    FEATURES: '/license/features'
  },
  
  // User Management
  USERS: {
    LIST: '/users',
    GET: '/users/:id',
    UPDATE: '/users/:id',
    DELETE: '/users/:id',
    AVATAR: '/users/:id/avatar',
    PREFERENCES: '/users/:id/preferences',
    ACTIVITY: '/users/:id/activity',
    STATS: '/users/:id/stats'
  },
  
  // Content Management
  CONTENT: {
    LESSONS: '/content/lessons',
    LESSON: '/content/lessons/:id',
    COURSES: '/content/courses',
    COURSE: '/content/courses/:id',
    CATEGORIES: '/content/categories',
    SEARCH: '/content/search',
    RECOMMENDATIONS: '/content/recommendations'
  },
  
  // Progress Tracking
  PROGRESS: {
    USER: '/progress/user/:userId',
    LESSON: '/progress/lesson/:lessonId',
    COURSE: '/progress/course/:courseId',
    UPDATE: '/progress/update',
    STATS: '/progress/stats',
    ACHIEVEMENTS: '/progress/achievements',
    STREAKS: '/progress/streaks'
  },
  
  // AI Services
  AI: {
    CHAT: '/ai/chat',
    TUTOR: '/ai/tutor',
    CODE_REVIEW: '/ai/code-review',
    HINTS: '/ai/hints',
    EXPLANATIONS: '/ai/explanations',
    FEEDBACK: '/ai/feedback',
    GENERATE_CONTENT: '/ai/generate-content'
  },
  
  // Gamification
  GAMIFICATION: {
    POINTS: '/gamification/points',
    ACHIEVEMENTS: '/gamification/achievements',
    LEADERBOARD: '/gamification/leaderboard',
    BADGES: '/gamification/badges',
    REWARDS: '/gamification/rewards',
    LEVELS: '/gamification/levels'
  },
  
  // Analytics
  ANALYTICS: {
    EVENTS: '/analytics/events',
    PERFORMANCE: '/analytics/performance',
    USAGE: '/analytics/usage',
    REPORTS: '/analytics/reports',
    INSIGHTS: '/analytics/insights'
  },
  
  // System
  SYSTEM: {
    HEALTH: '/system/health',
    STATUS: '/system/status',
    VERSION: '/system/version',
    CONFIG: '/system/config'
  }
} as const

// Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface IApiError {
  message: string
  status: number
  code?: string
  details?: any
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  timeout?: number
  retries?: number
  retryDelay?: number
  cache?: boolean
  skipAuth?: boolean
}

// API Client Class
class ApiClient {
  private baseURL: string
  private timeout: number
  private defaultHeaders: Record<string, string>
  private queryClient?: QueryClient
  private maxRetries = 3

  constructor() {
    this.baseURL = API_BASE_URL
    this.timeout = API_TIMEOUT
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
  
  // Set Query Client for cache management
  setQueryClient(queryClient: QueryClient) {
    this.queryClient = queryClient
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private handleError(error: Error, showToast = true): never {
    console.error('API Error:', error)
    
    if (showToast) {
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please try again.')
      } else if (error.message.includes('Failed to fetch')) {
        toast.error('Network error. Please check your connection.')
      } else {
        toast.error('An error occurred. Please try again.')
      }
    }
    
    throw error
  }
  
  // Get auth token from localStorage
  private getAuthToken(): string | null {
    try {
      const authData = localStorage.getItem('auth-storage')
      if (authData) {
        const parsed = JSON.parse(authData)
        return parsed.state?.token || null
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error)
    }
    return null
  }
  
  // Build request headers
  private buildHeaders(config?: RequestConfig): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...config?.headers }
    
    // Add auth token if not skipped
    if (!config?.skipAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    return headers
  }
  
  // Build URL with parameters
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.baseURL}${endpoint}`
    
    // Replace path parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (url.includes(`:${key}`)) {
          url = url.replace(`:${key}`, encodeURIComponent(String(value)))
          delete params[key]
        }
      })
      
      // Add query parameters
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    
    return url
  }
  
  // Make HTTP request
  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      data,
      params,
      timeout = this.timeout,
      retries = this.maxRetries,
      retryDelay = 1000
    } = config
    
    const url = this.buildUrl(endpoint, params)
    const headers = this.buildHeaders(config)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const requestOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal
    }
    
    if (data && method !== 'GET') {
      requestOptions.body = JSON.stringify(data)
    }
    
    let lastError: Error | null = null
    
    // Retry logic with exponential backoff
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions)
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new ApiError({
            message: `HTTP ${response.status}: ${response.statusText}`,
            status: response.status
          })
        }
        
        // Handle response
        const responseData = await this.handleResponse<T>(response)
        
        // Cache successful responses if query client is available
        if (this.queryClient && config.cache && method === 'GET') {
          this.queryClient.setQueryData([endpoint, params], responseData)
        }
        
        return responseData
        
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on client errors (4xx) or if aborted
        if ((error instanceof ApiError && error.status >= 400 && error.status < 500) || 
            controller.signal.aborted) {
          this.handleError(lastError)
          throw error
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await this.delay(retryDelay * Math.pow(2, attempt))
        }
      }
    }
    
    clearTimeout(timeoutId)
    this.handleError(lastError!)
    throw lastError || new Error('Request failed after retries')
  }
  
  // Handle response
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')
    
    let responseData: any
    
    try {
      responseData = isJson ? await response.json() : await response.text()
    } catch (error) {
      throw new ApiError({
        message: 'Failed to parse response',
        status: response.status
      })
    }
    
    if (!response.ok) {
      throw new ApiError({
        message: responseData?.message || responseData || 'Request failed',
        status: response.status,
        code: responseData?.code,
        details: responseData
      })
    }
    
    return responseData
  }
  
  // Public API methods
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'GET' })
  }
  
  async post<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'POST', data })
  }
  
  async put<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'PUT', data })
  }
  
  async patch<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'PATCH', data })
  }
  
  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'DELETE' })
  }

  // Health check endpoint
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/health-check', {
        method: 'GET',
        timeout: 5000,
        retries: 1,
        skipAuth: true
      })
      return response.success
    } catch (error) {
      return false
    }
  }
  
  // Upload file
  async upload<T>(
    endpoint: string,
    file: File,
    config?: Omit<RequestConfig, 'method' | 'data'>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    const headers = this.buildHeaders(config)
    delete headers['Content-Type'] // Let browser set it for FormData
    
    const url = this.buildUrl(endpoint, config?.params)
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      signal: AbortSignal.timeout(config?.timeout || this.timeout)
    })
    
    return this.handleResponse<T>(response)
  }
  
  // Download file
  async download(
    endpoint: string,
    filename?: string,
    config?: Omit<RequestConfig, 'method' | 'data'>
  ): Promise<void> {
    const url = this.buildUrl(endpoint, config?.params)
    const headers = this.buildHeaders(config)
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(config?.timeout || this.timeout)
    })
    
    if (!response.ok) {
      throw new ApiError({
        message: 'Download failed',
        status: response.status
      })
    }
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(downloadUrl)
  }
}

// Create and export API client instance
export const apiClient = new ApiClient()

// Simple API service interface for compatibility
export const apiService = {
  get: <T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'data'>) => 
    apiClient.get<T>(endpoint, config),
  post: <T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method'>) => 
    apiClient.post<T>(endpoint, data, config),
  put: <T>(endpoint: string, data: any, config?: Omit<RequestConfig, 'method'>) => 
    apiClient.put<T>(endpoint, data, config),
  delete: <T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'data'>) => 
    apiClient.delete<T>(endpoint, config),
  healthCheck: () => apiClient.healthCheck()
}

// Custom ApiError class
export class ApiError extends Error {
  status: number
  code?: string
  details?: any
  
  constructor({ message, status, code, details }: {
    message: string
    status: number
    code?: string
    details?: any
  }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

// Utility functions
export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError
}

export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// API client is now configured to use real Netlify Functions
// All endpoints will route to /.netlify/functions/* as configured in netlify.toml

export default apiClient