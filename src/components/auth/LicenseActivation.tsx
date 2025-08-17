import React, { useState, useEffect } from 'react'
import { 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Shield, 
  Users, 
  Calendar, 
  Star,
  Crown,
  Zap,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { useLicenseStore } from '../../store/licenseStore'
import { formatLicenseType, getDaysUntilExpiry } from '../../store/licenseStore'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface LicenseActivationProps {
  onActivated?: () => void
}

const LicenseActivation: React.FC<LicenseActivationProps> = ({ onActivated }) => {
  const {
    isLicenseValid,
    licenseInfo,
    isLoading,
    error,
    activateLicense,
    checkLicense,
    clearError
  } = useLicenseStore()
  
  const [licenseKey, setLicenseKey] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  useEffect(() => {
    // Check existing license on mount
    checkLicense()
  }, [])
  
  useEffect(() => {
    // Clear errors when license key changes
    if (error) {
      clearError()
    }
    setValidationErrors([])
  }, [licenseKey, error, clearError])
  
  const validateLicenseKey = (key: string): string[] => {
    const errors: string[] = []
    
    if (!key.trim()) {
      errors.push('License key is required')
      return errors
    }
    
    if (key.length < 10) {
      errors.push('License key must be at least 10 characters long')
    }
    
    if (!/^[A-Z0-9-]+$/.test(key.toUpperCase())) {
      errors.push('License key can only contain letters, numbers, and hyphens')
    }
    
    return errors
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateLicenseKey(licenseKey)
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }
    
    const success = await activateLicense(licenseKey)
    if (success && onActivated) {
      onActivated()
    }
  }
  
  const handleDemoLicense = async () => {
    const success = await activateLicense('TRIAL-2024-DEMO')
    if (success && onActivated) {
      onActivated()
    }
  }
  
  const getLicenseIcon = (type: string) => {
    switch (type) {
      case 'trial': return <Zap className="w-6 h-6 text-yellow-500" />
      case 'basic': return <Star className="w-6 h-6 text-blue-500" />
      case 'premium': return <Crown className="w-6 h-6 text-purple-500" />
      case 'enterprise': return <Crown className="w-6 h-6 text-gold-500" />
      default: return <Shield className="w-6 h-6 text-gray-500" />
    }
  }
  
  const demoLicenses = [
    {
      key: 'TRIAL-2024-DEMO',
      type: 'Trial',
      description: 'Perfect for trying out EduAI Tutor',
      features: ['5 users', 'Basic lessons', 'AI tutor', '30 days'],
      icon: <Zap className="w-5 h-5 text-yellow-500" />
    },
    {
      key: 'BASIC-2024-STANDARD',
      type: 'Basic',
      description: 'Great for small classrooms',
      features: ['25 users', 'All lessons', 'Assignments', '1 year'],
      icon: <Star className="w-5 h-5 text-blue-500" />
    },
    {
      key: 'PREMIUM-2024-ADVANCED',
      type: 'Premium',
      description: 'Advanced features for schools',
      features: ['100 users', 'Analytics', 'Custom lessons', '1 year'],
      icon: <Crown className="w-5 h-5 text-purple-500" />
    }
  ]
  
  // If license is already valid, show success state
  if (isLicenseValid && licenseInfo) {
    return (
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              License Activated!
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your EduAI Tutor license is active and ready to use.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getLicenseIcon(licenseInfo.type)}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatLicenseType(licenseInfo.type)} License
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getDaysUntilExpiry(licenseInfo)} days left
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {licenseInfo.maxUsers === -1 ? 'Unlimited' : licenseInfo.maxUsers} users
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Expires {new Date(licenseInfo.expiresAt).toLocaleDateString()}</span>
                </div>
                {licenseInfo.organizationName && (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>{licenseInfo.organizationName}</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={onActivated}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-center p-4 min-h-screen">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Activate EduAI Tutor
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400">
            Enter your license key to get started with EduAI Tutor
          </p>
        </div>
        
        {!showDemo ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                License Key
              </label>
              <input
                type="text"
                id="licenseKey"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono text-center tracking-wider"
                disabled={isLoading}
              />
              
              {validationErrors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {validationErrors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </p>
                  ))}
                </div>
              )}
              
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !licenseKey.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Activate License</span>
                </>
              )}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowDemo(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Try demo licenses
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Demo Licenses
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Try EduAI Tutor with these demo license keys
              </p>
            </div>
            
            <div className="space-y-3">
              {demoLicenses.map((license) => (
                <div
                  key={license.key}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => {
                    setLicenseKey(license.key)
                    setShowDemo(false)
                  }}
                >
                  <div className="flex items-start space-x-3">
                    {license.icon}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {license.type} License
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {license.key}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {license.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {license.features.map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDemo(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleDemoLicense}
                disabled={isLoading}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Try Trial</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Need help? Contact support at</p>
            <a href="mailto:support@eduai.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              support@eduai.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LicenseActivation