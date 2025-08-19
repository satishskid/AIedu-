// Export all services from a single entry point
export { apiClient, API_ENDPOINTS, ApiError, isApiError, getErrorMessage } from './api'
export type { ApiResponse, RequestConfig } from './api'

export { licenseService, getLicenseTypeDisplayName, getLicenseStatusDisplayName, formatLicenseExpiry, isLicenseExpiringSoon } from './license'
export type {
  LicenseInfo,
  LicenseFeature,
  LicenseLimits,
  LicenseMetadata,
  LicenseUsage,
  LicenseValidationResult,
  LicenseActivationRequest,
  LicenseActivationResult
} from './license'

export { aiService, formatAIResponse, extractCodeFromResponse, calculateTokensUtil as calculateTokens } from './ai'
export type {
  AIMessage,
  AIConversation,
  AIContext,
  AITutorRequest,
  AITutorResponse,
  AISuggestion,
  AICodeSnippet,
  AIResource,
  AICodeReviewRequest,
  AICodeReviewResponse,
  AICodeIssue,
  AICodeImprovement,
  AIHintRequest,
  AIHintResponse,
  AIExplanationRequest,
  AIExplanationResponse,
  AIFeedbackRequest,
  AIFeedbackResponse
} from './ai'

export { syncService, formatSyncStatus, formatLastSyncTime } from './sync'
export type {
  SyncItem,
  SyncConflict,
  SyncStatus,
  SyncOptions,
  SyncResult
} from './sync'

// Service initialization and configuration
export const initializeServices = async () => {
  try {
    // Import services dynamically to avoid circular dependencies
    const { licenseService } = await import('./license')
    
    // Initialize API client with query client if available
    // This would be called from the main app after React Query is set up
    
    // Validate license on startup
    await licenseService.validateLicense()
    
    // Start sync service
    // syncService is automatically initialized
    
    console.log('Services initialized successfully')
    return true
  } catch (error) {
    console.error('Failed to initialize services:', error)
    return false
  }
}

// Service health check
export const checkServicesHealth = async (): Promise<{
  api: boolean
  license: boolean
  ai: boolean
  sync: boolean
  overall: boolean
}> => {
  const health = {
    api: false,
    license: false,
    ai: false,
    sync: false,
    overall: false
  }
  
  try {
    // Import services dynamically to avoid circular dependencies
    const { apiClient } = await import('./api')
    const { licenseService } = await import('./license')
    const { syncService } = await import('./sync')
    
    try {
      // Check API health
      const apiHealth = await apiClient.get('/system/health')
      health.api = apiHealth.success
    } catch (error) {
      console.warn('API health check failed:', error)
    }
    
    try {
      // Check license service
      const licenseInfo = await licenseService.getLicenseInfo()
      health.license = licenseInfo !== null
    } catch (error) {
      console.warn('License health check failed:', error)
    }
    
    try {
      // Check AI service (basic availability)
      health.ai = licenseService.hasFeature('ai_tutor')
    } catch (error) {
      console.warn('AI health check failed:', error)
    }
    
    try {
      // Check sync service
      const syncStatus = syncService.getSyncStatus()
      health.sync = !syncStatus.isSyncing || syncStatus.errorItems === 0
    } catch (error) {
      console.warn('Sync health check failed:', error)
    }
    
    health.overall = health.api && health.license
    
  } catch (error) {
    console.error('Failed to import services for health check:', error)
  }
  
  return health
}

// Export default services object for convenience
// Note: Services are imported individually to avoid circular dependencies
export default {
  initialize: initializeServices,
  healthCheck: checkServicesHealth
}