import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LicenseInfo {
  key: string
  type: 'trial' | 'basic' | 'premium' | 'enterprise'
  expiresAt: string
  maxUsers: number
  features: string[]
  organizationName?: string
  contactEmail?: string
  activatedAt?: string
  deviceId?: string
  usageCount?: number
  maxActivations?: number
}

interface LicenseState {
  // State
  isLicenseValid: boolean
  licenseInfo: LicenseInfo | null
  isLoading: boolean
  error: string | null
  lastChecked: string | null
  retryCount: number
  validationHistory: Array<{
    timestamp: string
    success: boolean
    error?: string
  }>
  
  // Actions
  checkLicense: () => Promise<void>
  activateLicense: (licenseKey: string) => Promise<boolean>
  deactivateLicense: () => void
  refreshLicense: () => Promise<void>
  clearError: () => void
  retryValidation: () => Promise<void>
  getLicenseUsage: () => Promise<{ used: number; limit: number }>
}

// Mock license validation (replace with actual API call)
const validateLicenseKey = async (licenseKey: string): Promise<LicenseInfo | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock validation logic
  const mockLicenses: Record<string, LicenseInfo> = {
    'TRIAL-2024-DEMO': {
      key: 'TRIAL-2024-DEMO',
      type: 'trial',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      maxUsers: 5,
      features: ['basic-lessons', 'ai-tutor', 'progress-tracking'],
      organizationName: 'Demo Organization',
      contactEmail: 'demo@example.com'
    },
    'BASIC-2024-STANDARD': {
      key: 'BASIC-2024-STANDARD',
      type: 'basic',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      maxUsers: 25,
      features: ['basic-lessons', 'ai-tutor', 'progress-tracking', 'assignments'],
      organizationName: 'Standard School',
      contactEmail: 'admin@standardschool.edu'
    },
    'PREMIUM-2024-ADVANCED': {
      key: 'PREMIUM-2024-ADVANCED',
      type: 'premium',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      maxUsers: 100,
      features: [
        'basic-lessons', 'ai-tutor', 'progress-tracking', 'assignments',
        'advanced-analytics', 'custom-lessons', 'integrations'
      ],
      organizationName: 'Premium Academy',
      contactEmail: 'admin@premiumacademy.edu'
    },
    'ENTERPRISE-2024-UNLIMITED': {
      key: 'ENTERPRISE-2024-UNLIMITED',
      type: 'enterprise',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      maxUsers: -1, // Unlimited
      features: [
        'basic-lessons', 'ai-tutor', 'progress-tracking', 'assignments',
        'advanced-analytics', 'custom-lessons', 'integrations',
        'white-labeling', 'priority-support', 'custom-deployment'
      ],
      organizationName: 'Enterprise University',
      contactEmail: 'admin@enterprise.edu'
    }
  }
  
  const licenseInfo = mockLicenses[licenseKey]
  
  if (!licenseInfo) {
    throw new Error('Invalid license key')
  }
  
  // Check if license is expired
  if (new Date(licenseInfo.expiresAt) < new Date()) {
    throw new Error('License has expired')
  }
  
  return licenseInfo
}

// Check if license is still valid
const isLicenseStillValid = (licenseInfo: LicenseInfo): boolean => {
  return new Date(licenseInfo.expiresAt) > new Date()
}

export const useLicenseStore = create<LicenseState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLicenseValid: false,
      licenseInfo: null,
      isLoading: false,
      error: null,
      lastChecked: null,
      retryCount: 0,
      validationHistory: [],
      
      // Check current license status
      checkLicense: async () => {
        const state = get()
        const { licenseInfo } = state
        
        if (!licenseInfo) {
          set({ isLicenseValid: false })
          return
        }
        
        set({ isLoading: true, error: null })
        
        try {
          // Validate current license
          const isValid = isLicenseStillValid(licenseInfo)
          
          if (!isValid) {
            const errorMsg = 'License has expired'
            set({
              isLicenseValid: false,
              licenseInfo: null,
              error: errorMsg,
              isLoading: false,
              lastChecked: new Date().toISOString(),
              validationHistory: [
                ...state.validationHistory.slice(-9),
                { timestamp: new Date().toISOString(), success: false, error: errorMsg }
              ]
            })
            return
          }
          
          // Re-validate with server (in production)
          if (import.meta.env.PROD) {
            await validateLicenseKey(licenseInfo.key)
          }
          
          set({
            isLicenseValid: true,
            isLoading: false,
            lastChecked: new Date().toISOString(),
            retryCount: 0,
            validationHistory: [
              ...state.validationHistory.slice(-9),
              { timestamp: new Date().toISOString(), success: true }
            ]
          })
        } catch (error) {
          console.error('License validation failed:', error)
          const errorMsg = error instanceof Error ? error.message : 'License validation failed'
          set({
            isLicenseValid: false,
            licenseInfo: null,
            error: errorMsg,
            isLoading: false,
            lastChecked: new Date().toISOString(),
            retryCount: state.retryCount + 1,
            validationHistory: [
              ...state.validationHistory.slice(-9),
              { timestamp: new Date().toISOString(), success: false, error: errorMsg }
            ]
          })
        }
      },
      
      // Activate a new license
      activateLicense: async (licenseKey: string) => {
        const state = get()
        set({ isLoading: true, error: null })
        
        try {
          const licenseInfo = await validateLicenseKey(licenseKey.trim().toUpperCase())
          
          if (!licenseInfo) {
            throw new Error('Invalid license key')
          }
          
          // Add activation metadata
          const enhancedLicenseInfo = {
            ...licenseInfo,
            activatedAt: new Date().toISOString(),
            deviceId: navigator.userAgent ? btoa(navigator.userAgent).slice(0, 16) : 'unknown',
            usageCount: 1
          }
          
          set({
            isLicenseValid: true,
            licenseInfo: enhancedLicenseInfo,
            isLoading: false,
            error: null,
            lastChecked: new Date().toISOString(),
            retryCount: 0,
            validationHistory: [
              ...state.validationHistory.slice(-9),
              { timestamp: new Date().toISOString(), success: true }
            ]
          })
          
          return true
        } catch (error) {
          console.error('License activation failed:', error)
          const errorMsg = error instanceof Error ? error.message : 'License activation failed'
          set({
            isLicenseValid: false,
            licenseInfo: null,
            error: errorMsg,
            isLoading: false,
            lastChecked: new Date().toISOString(),
            retryCount: state.retryCount + 1,
            validationHistory: [
              ...state.validationHistory.slice(-9),
              { timestamp: new Date().toISOString(), success: false, error: errorMsg }
            ]
          })
          
          return false
        }
      },
      
      // Deactivate current license
      deactivateLicense: () => {
        set({
          isLicenseValid: false,
          licenseInfo: null,
          error: null,
          lastChecked: new Date().toISOString(),
          retryCount: 0,
          validationHistory: []
        })
      },
      
      // Refresh license status
      refreshLicense: async () => {
        const state = get()
        await state.checkLicense()
      },
      
      // Clear error state
      clearError: () => {
        set({ error: null })
      },
      
      // Retry validation with exponential backoff
      retryValidation: async () => {
        const state = get()
        const { retryCount } = state
        
        if (retryCount >= 3) {
          set({ error: 'Maximum retry attempts reached. Please check your connection and try again later.' })
          return
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        
        await state.checkLicense()
      },
      
      // Get license usage information
      getLicenseUsage: async () => {
        const state = get()
        const { licenseInfo } = state
        
        if (!licenseInfo) {
          return { used: 0, limit: 0 }
        }
        
        // Mock usage data - in production, this would come from API
        const mockUsage = {
          used: licenseInfo.usageCount || 1,
          limit: licenseInfo.maxUsers
        }
        
        return mockUsage
      }
    }),
    {
      name: 'eduai-license-storage',
      partialize: (state: LicenseState) => ({
        licenseInfo: state.licenseInfo,
        isLicenseValid: state.isLicenseValid,
        lastChecked: state.lastChecked,
        validationHistory: state.validationHistory
      })
    }
  )
)

// Utility functions
export const getLicenseFeatures = (licenseType: LicenseInfo['type']): string[] => {
  const featureMap: Record<LicenseInfo['type'], string[]> = {
    trial: ['basic-lessons', 'ai-tutor', 'progress-tracking'],
    basic: ['basic-lessons', 'ai-tutor', 'progress-tracking', 'assignments'],
    premium: [
      'basic-lessons', 'ai-tutor', 'progress-tracking', 'assignments',
      'advanced-analytics', 'custom-lessons', 'integrations'
    ],
    enterprise: [
      'basic-lessons', 'ai-tutor', 'progress-tracking', 'assignments',
      'advanced-analytics', 'custom-lessons', 'integrations',
      'white-labeling', 'priority-support', 'custom-deployment'
    ]
  }
  
  return featureMap[licenseType] || []
}

export const hasFeature = (licenseInfo: LicenseInfo | null, feature: string): boolean => {
  return licenseInfo?.features.includes(feature) || false
}

export const getDaysUntilExpiry = (licenseInfo: LicenseInfo | null): number => {
  if (!licenseInfo) return 0
  
  const expiryDate = new Date(licenseInfo.expiresAt)
  const now = new Date()
  const diffTime = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
}

export const isLicenseExpiringSoon = (licenseInfo: LicenseInfo | null, days: number = 7): boolean => {
  return getDaysUntilExpiry(licenseInfo) <= days
}

export const formatLicenseType = (type: LicenseInfo['type']): string => {
  const typeMap: Record<LicenseInfo['type'], string> = {
    trial: 'Trial',
    basic: 'Basic',
    premium: 'Premium',
    enterprise: 'Enterprise'
  }
  
  return typeMap[type] || 'Unknown'
}