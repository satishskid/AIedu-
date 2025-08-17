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
}

interface LicenseState {
  // State
  isLicenseValid: boolean
  licenseInfo: LicenseInfo | null
  isLoading: boolean
  error: string | null
  lastChecked: string | null
  
  // Actions
  checkLicense: () => Promise<void>
  activateLicense: (licenseKey: string) => Promise<boolean>
  deactivateLicense: () => void
  refreshLicense: () => Promise<void>
  clearError: () => void
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
            set({
              isLicenseValid: false,
              licenseInfo: null,
              error: 'License has expired',
              isLoading: false,
              lastChecked: new Date().toISOString()
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
            lastChecked: new Date().toISOString()
          })
        } catch (error) {
          console.error('License validation failed:', error)
          set({
            isLicenseValid: false,
            licenseInfo: null,
            error: error instanceof Error ? error.message : 'License validation failed',
            isLoading: false,
            lastChecked: new Date().toISOString()
          })
        }
      },
      
      // Activate a new license
      activateLicense: async (licenseKey: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const licenseInfo = await validateLicenseKey(licenseKey.trim().toUpperCase())
          
          if (!licenseInfo) {
            throw new Error('Invalid license key')
          }
          
          set({
            isLicenseValid: true,
            licenseInfo,
            isLoading: false,
            error: null,
            lastChecked: new Date().toISOString()
          })
          
          return true
        } catch (error) {
          console.error('License activation failed:', error)
          set({
            isLicenseValid: false,
            licenseInfo: null,
            error: error instanceof Error ? error.message : 'License activation failed',
            isLoading: false,
            lastChecked: new Date().toISOString()
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
          lastChecked: new Date().toISOString()
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
      }
    }),
    {
      name: 'eduai-license-storage',
      partialize: (state: LicenseState) => ({
        licenseInfo: state.licenseInfo,
        isLicenseValid: state.isLicenseValid,
        lastChecked: state.lastChecked
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