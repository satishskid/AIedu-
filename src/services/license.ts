import { apiClient, API_ENDPOINTS, ApiError } from './api'

// License Types
export interface LicenseInfo {
  id: string
  key: string
  type: 'free' | 'basic' | 'premium' | 'enterprise'
  status: 'active' | 'expired' | 'suspended' | 'invalid'
  userId: string
  organizationId?: string
  features: LicenseFeature[]
  limits: LicenseLimits
  metadata: LicenseMetadata
  createdAt: string
  updatedAt: string
  expiresAt?: string
  activatedAt?: string
}

export interface LicenseFeature {
  name: string
  enabled: boolean
  limit?: number
  description?: string
}

export interface LicenseLimits {
  maxUsers: number
  maxLessons: number
  maxProjects: number
  maxStorage: number // in MB
  maxAIRequests: number // per month
  maxExports: number // per month
  canUseOffline: boolean
  canUseAdvancedFeatures: boolean
  canUseCustomBranding: boolean
  canUseAnalytics: boolean
  canUseIntegrations: boolean
}

export interface LicenseMetadata {
  version: string
  issuer: string
  deviceId?: string
  deviceName?: string
  activationCount: number
  maxActivations: number
  lastUsed?: string
  ipAddress?: string
  userAgent?: string
}

export interface LicenseUsage {
  users: number
  lessons: number
  projects: number
  storage: number // in MB
  aiRequests: number // current month
  exports: number // current month
  lastActivity: string
}

export interface LicenseValidationResult {
  valid: boolean
  license?: LicenseInfo
  error?: string
  warnings?: string[]
}

export interface LicenseActivationRequest {
  licenseKey: string
  deviceId?: string
  deviceName?: string
  userInfo?: {
    name: string
    email: string
    organization?: string
  }
}

export interface LicenseActivationResult {
  success: boolean
  license?: LicenseInfo
  error?: string
  activationId?: string
}

// License Service Class
class LicenseService {
  private cachedLicense: LicenseInfo | null = null
  private validationPromise: Promise<LicenseValidationResult> | null = null
  private lastValidation: number = 0
  private readonly VALIDATION_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  
  // Validate license
  async validateLicense(licenseKey?: string, forceRefresh = false): Promise<LicenseValidationResult> {
    const now = Date.now()
    
    // Return cached result if still valid
    if (!forceRefresh && this.validationPromise && (now - this.lastValidation) < this.VALIDATION_CACHE_DURATION) {
      return this.validationPromise
    }
    
    // Create new validation promise
    this.validationPromise = this.performValidation(licenseKey)
    this.lastValidation = now
    
    return this.validationPromise
  }
  
  private async performValidation(licenseKey?: string): Promise<LicenseValidationResult> {
    try {
      // Get license key from parameter or storage
      const key = licenseKey || this.getStoredLicenseKey()
      
      if (!key) {
        return {
          valid: false,
          error: 'No license key provided'
        }
      }
      
      // Validate with server
      const response = await apiClient.post<LicenseInfo>(API_ENDPOINTS.LICENSE.VALIDATE, {
        licenseKey: key,
        deviceId: this.getDeviceId(),
        timestamp: new Date().toISOString()
      })
      
      if (response.success && response.data) {
        this.cachedLicense = response.data
        this.storeLicense(response.data)
        
        return {
          valid: true,
          license: response.data
        }
      } else {
        return {
          valid: false,
          error: response.message || 'License validation failed'
        }
      }
      
    } catch (error) {
      console.error('License validation error:', error)
      
      // Try to use cached license if available
      const cachedLicense = this.getCachedLicense()
      if (cachedLicense && this.isLicenseStillValid(cachedLicense)) {
        return {
          valid: true,
          license: cachedLicense,
          warnings: ['Using cached license due to network error']
        }
      }
      
      return {
        valid: false,
        error: error instanceof ApiError ? error.message : 'Network error during validation'
      }
    }
  }
  
  // Activate license
  async activateLicense(request: LicenseActivationRequest): Promise<LicenseActivationResult> {
    try {
      const response = await apiClient.post<{
        license: LicenseInfo
        activationId: string
      }>(API_ENDPOINTS.LICENSE.ACTIVATE, {
        ...request,
        deviceId: request.deviceId || this.getDeviceId(),
        deviceName: request.deviceName || this.getDeviceName(),
        timestamp: new Date().toISOString()
      })
      
      if (response.success && response.data) {
        const { license, activationId } = response.data
        
        // Store license and key
        this.cachedLicense = license
        this.storeLicense(license)
        this.storeLicenseKey(request.licenseKey)
        
        return {
          success: true,
          license,
          activationId
        }
      } else {
        return {
          success: false,
          error: response.message || 'License activation failed'
        }
      }
      
    } catch (error) {
      console.error('License activation error:', error)
      return {
        success: false,
        error: error instanceof ApiError ? error.message : 'Network error during activation'
      }
    }
  }
  
  // Deactivate license
  async deactivateLicense(): Promise<{ success: boolean; error?: string }> {
    try {
      const licenseKey = this.getStoredLicenseKey()
      if (!licenseKey) {
        return { success: false, error: 'No license key found' }
      }
      
      const response = await apiClient.post(API_ENDPOINTS.LICENSE.DEACTIVATE, {
        licenseKey,
        deviceId: this.getDeviceId(),
        timestamp: new Date().toISOString()
      })
      
      if (response.success) {
        // Clear stored license data
        this.clearLicenseData()
        return { success: true }
      } else {
        return {
          success: false,
          error: response.message || 'License deactivation failed'
        }
      }
      
    } catch (error) {
      console.error('License deactivation error:', error)
      return {
        success: false,
        error: error instanceof ApiError ? error.message : 'Network error during deactivation'
      }
    }
  }
  
  // Get license info
  async getLicenseInfo(forceRefresh = false): Promise<LicenseInfo | null> {
    const validation = await this.validateLicense(undefined, forceRefresh)
    return validation.valid ? validation.license || null : null
  }
  
  // Get license usage
  async getLicenseUsage(): Promise<LicenseUsage | null> {
    try {
      const licenseKey = this.getStoredLicenseKey()
      if (!licenseKey) return null
      
      const response = await apiClient.get<LicenseUsage>(API_ENDPOINTS.LICENSE.USAGE, {
        params: { licenseKey }
      })
      
      return response.success ? response.data || null : null
      
    } catch (error) {
      console.error('Failed to get license usage:', error)
      return null
    }
  }
  
  // Check if feature is available
  hasFeature(featureName: string): boolean {
    const license = this.getCachedLicense()
    if (!license || !this.isLicenseStillValid(license)) {
      return false
    }
    
    const feature = license.features.find(f => f.name === featureName)
    return feature ? feature.enabled : false
  }
  
  // Check if within limits
  isWithinLimit(limitName: keyof LicenseLimits, currentUsage: number): boolean {
    const license = this.getCachedLicense()
    if (!license || !this.isLicenseStillValid(license)) {
      return false
    }
    
    const limit = license.limits[limitName]
    if (typeof limit === 'number') {
      return currentUsage <= limit
    }
    
    return true
  }
  
  // Get feature limit
  getFeatureLimit(featureName: string): number | undefined {
    const license = this.getCachedLicense()
    if (!license || !this.isLicenseStillValid(license)) {
      return undefined
    }
    
    const feature = license.features.find(f => f.name === featureName)
    return feature?.limit
  }
  
  // Check if license is premium or higher
  isPremium(): boolean {
    const license = this.getCachedLicense()
    return license ? ['premium', 'enterprise'].includes(license.type) : false
  }
  
  // Check if license is enterprise
  isEnterprise(): boolean {
    const license = this.getCachedLicense()
    return license ? license.type === 'enterprise' : false
  }
  
  // Get license type
  getLicenseType(): string | null {
    const license = this.getCachedLicense()
    return license ? license.type : null
  }
  
  // Private helper methods
  private getCachedLicense(): LicenseInfo | null {
    if (this.cachedLicense) {
      return this.cachedLicense
    }
    
    // Try to load from storage
    try {
      const stored = localStorage.getItem('license-info')
      if (stored) {
        this.cachedLicense = JSON.parse(stored)
        return this.cachedLicense
      }
    } catch (error) {
      console.warn('Failed to load cached license:', error)
    }
    
    return null
  }
  
  private isLicenseStillValid(license: LicenseInfo): boolean {
    if (license.status !== 'active') {
      return false
    }
    
    if (license.expiresAt) {
      const expiryDate = new Date(license.expiresAt)
      if (expiryDate <= new Date()) {
        return false
      }
    }
    
    return true
  }
  
  private storeLicense(license: LicenseInfo): void {
    try {
      localStorage.setItem('license-info', JSON.stringify(license))
    } catch (error) {
      console.warn('Failed to store license info:', error)
    }
  }
  
  private getStoredLicenseKey(): string | null {
    try {
      return localStorage.getItem('license-key')
    } catch (error) {
      console.warn('Failed to get stored license key:', error)
      return null
    }
  }
  
  private storeLicenseKey(key: string): void {
    try {
      localStorage.setItem('license-key', key)
    } catch (error) {
      console.warn('Failed to store license key:', error)
    }
  }
  
  private clearLicenseData(): void {
    try {
      localStorage.removeItem('license-info')
      localStorage.removeItem('license-key')
      this.cachedLicense = null
      this.validationPromise = null
    } catch (error) {
      console.warn('Failed to clear license data:', error)
    }
  }
  
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('device-id')
    
    if (!deviceId) {
      // Generate a unique device ID
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36)
      localStorage.setItem('device-id', deviceId)
    }
    
    return deviceId
  }
  
  private getDeviceName(): string {
    const userAgent = navigator.userAgent
    const platform = navigator.platform
    
    // Simple device name generation
    let deviceName = 'Unknown Device'
    
    if (userAgent.includes('Mac')) {
      deviceName = 'Mac'
    } else if (userAgent.includes('Windows')) {
      deviceName = 'Windows PC'
    } else if (userAgent.includes('Linux')) {
      deviceName = 'Linux PC'
    } else if (userAgent.includes('iPhone')) {
      deviceName = 'iPhone'
    } else if (userAgent.includes('iPad')) {
      deviceName = 'iPad'
    } else if (userAgent.includes('Android')) {
      deviceName = 'Android Device'
    }
    
    return `${deviceName} (${platform})`
  }
}

// Create and export license service instance
export const licenseService = new LicenseService()

// Utility functions
export const getLicenseTypeDisplayName = (type: string): string => {
  const displayNames: Record<string, string> = {
    free: 'Free',
    basic: 'Basic',
    premium: 'Premium',
    enterprise: 'Enterprise'
  }
  return displayNames[type] || type
}

export const getLicenseStatusDisplayName = (status: string): string => {
  const displayNames: Record<string, string> = {
    active: 'Active',
    expired: 'Expired',
    suspended: 'Suspended',
    invalid: 'Invalid'
  }
  return displayNames[status] || status
}

export const formatLicenseExpiry = (expiresAt?: string): string => {
  if (!expiresAt) return 'Never'
  
  const expiryDate = new Date(expiresAt)
  const now = new Date()
  const diffTime = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return 'Expired'
  } else if (diffDays === 0) {
    return 'Expires today'
  } else if (diffDays === 1) {
    return 'Expires tomorrow'
  } else if (diffDays <= 30) {
    return `Expires in ${diffDays} days`
  } else {
    return expiryDate.toLocaleDateString()
  }
}

export const isLicenseExpiringSoon = (expiresAt?: string, daysThreshold = 30): boolean => {
  if (!expiresAt) return false
  
  const expiryDate = new Date(expiresAt)
  const now = new Date()
  const diffTime = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays <= daysThreshold && diffDays >= 0
}

export default licenseService