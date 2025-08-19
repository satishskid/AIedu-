import React, { useState } from 'react'
import {
  X,
  Key,
  Building,
  Mail,
  Calendar,
  Users,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
  Copy,
  Download
} from 'lucide-react'
import { useAnalytics } from '../../hooks/useAnalytics'

interface CreateLicenseModalProps {
  isOpen: boolean
  onClose: () => void
  onLicenseCreated?: (license: any) => void
}

interface LicenseFormData {
  organizationName: string
  contactEmail: string
  licenseType: 'trial' | 'basic' | 'premium' | 'enterprise'
  maxUsers: number
  duration: number // in months
  features: string[]
  notes: string
}

const LICENSE_TYPES = {
  trial: {
    name: 'Trial',
    defaultUsers: 5,
    defaultDuration: 1,
    features: ['basic-lessons', 'ai-tutor', 'progress-tracking'],
    color: 'yellow'
  },
  basic: {
    name: 'Basic',
    defaultUsers: 25,
    defaultDuration: 12,
    features: ['basic-lessons', 'ai-tutor', 'progress-tracking', 'assignments'],
    color: 'blue'
  },
  premium: {
    name: 'Premium',
    defaultUsers: 100,
    defaultDuration: 12,
    features: [
      'basic-lessons', 'ai-tutor', 'progress-tracking', 'assignments',
      'advanced-analytics', 'custom-lessons', 'integrations'
    ],
    color: 'purple'
  },
  enterprise: {
    name: 'Enterprise',
    defaultUsers: 500,
    defaultDuration: 12,
    features: [
      'basic-lessons', 'ai-tutor', 'progress-tracking', 'assignments',
      'advanced-analytics', 'custom-lessons', 'integrations',
      'white-labeling', 'priority-support', 'custom-deployment'
    ],
    color: 'green'
  }
}

const AVAILABLE_FEATURES = [
  { id: 'basic-lessons', name: 'Basic Lessons', description: 'Access to core curriculum' },
  { id: 'ai-tutor', name: 'AI Tutor', description: 'Personalized AI assistance' },
  { id: 'progress-tracking', name: 'Progress Tracking', description: 'Student progress monitoring' },
  { id: 'assignments', name: 'Assignments', description: 'Create and manage assignments' },
  { id: 'advanced-analytics', name: 'Advanced Analytics', description: 'Detailed performance insights' },
  { id: 'custom-lessons', name: 'Custom Lessons', description: 'Create custom content' },
  { id: 'integrations', name: 'Integrations', description: 'Third-party integrations' },
  { id: 'white-labeling', name: 'White Labeling', description: 'Custom branding options' },
  { id: 'priority-support', name: 'Priority Support', description: '24/7 priority support' },
  { id: 'custom-deployment', name: 'Custom Deployment', description: 'On-premise deployment' }
]

export const CreateLicenseModal: React.FC<CreateLicenseModalProps> = ({
  isOpen,
  onClose,
  onLicenseCreated
}) => {
  const analytics = useAnalytics()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [generatedLicense, setGeneratedLicense] = useState<any>(null)
  
  const [formData, setFormData] = useState<LicenseFormData>({
    organizationName: '',
    contactEmail: '',
    licenseType: 'trial',
    maxUsers: LICENSE_TYPES.trial.defaultUsers,
    duration: LICENSE_TYPES.trial.defaultDuration,
    features: [...LICENSE_TYPES.trial.features],
    notes: ''
  })

  const handleLicenseTypeChange = (type: keyof typeof LICENSE_TYPES) => {
    const licenseConfig = LICENSE_TYPES[type]
    setFormData(prev => ({
      ...prev,
      licenseType: type,
      maxUsers: licenseConfig.defaultUsers,
      duration: licenseConfig.defaultDuration,
      features: [...licenseConfig.features]
    }))
  }

  const handleFeatureToggle = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }))
  }

  const generateLicenseKey = () => {
    const prefix = formData.licenseType.toUpperCase()
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.organizationName || !formData.contactEmail) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Generate license key
      const licenseKey = generateLicenseKey()
      
      // Calculate expiry date
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + formData.duration)

      // Create license object
      const newLicense = {
        id: `license_${Date.now()}`,
        key: licenseKey,
        type: formData.licenseType,
        organizationName: formData.organizationName,
        contactEmail: formData.contactEmail,
        maxUsers: formData.maxUsers,
        features: formData.features,
        expiresAt: expiryDate.toISOString(),
        createdAt: new Date().toISOString(),
        status: 'active',
        notes: formData.notes
      }

      // In a real app, this would be an API call
      // await licenseService.createLicense(newLicense)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setGeneratedLicense(newLicense)
      setSuccess(true)
      
      // Track analytics
      analytics.trackEngagement('feature_use', {
        feature: 'license_created',
        license_type: formData.licenseType,
        max_users: formData.maxUsers,
        duration_months: formData.duration,
        features_count: formData.features.length
      })
      
      onLicenseCreated?.(newLicense)
      
    } catch (error) {
      console.error('License creation failed:', error)
      setError('Failed to create license. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLicenseKey = () => {
    if (generatedLicense?.key) {
      navigator.clipboard.writeText(generatedLicense.key)
      analytics.trackEngagement('feature_use', {
        feature: 'license_key_copied',
        license_type: generatedLicense.type
      })
    }
  }

  const handleDownloadLicense = () => {
    if (generatedLicense) {
      const licenseData = {
        ...generatedLicense,
        downloadedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(licenseData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `license-${generatedLicense.key}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      analytics.trackEngagement('feature_use', {
        feature: 'license_downloaded',
        license_type: generatedLicense.type
      })
    }
  }

  const handleClose = () => {
    setFormData({
      organizationName: '',
      contactEmail: '',
      licenseType: 'trial',
      maxUsers: LICENSE_TYPES.trial.defaultUsers,
      duration: LICENSE_TYPES.trial.defaultDuration,
      features: [...LICENSE_TYPES.trial.features],
      notes: ''
    })
    setError('')
    setSuccess(false)
    setGeneratedLicense(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New License
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate a new license for customer onboarding
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {success && generatedLicense ? (
          /* Success State */
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                License Created Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The license has been generated and is ready for activation.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Organization
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {generatedLicense.organizationName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    License Type
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium capitalize">
                    {generatedLicense.type}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Users
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {generatedLicense.maxUsers}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expires
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {new Date(generatedLicense.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Key
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm">
                    {generatedLicense.key}
                  </div>
                  <button
                    onClick={handleCopyLicenseKey}
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title="Copy license key"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleDownloadLicense}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download License</span>
                </button>
                <button
                  onClick={handleClose}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Organization Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter organization name"
                    required
                  />
                </div>
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@organization.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* License Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                License Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(LICENSE_TYPES).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleLicenseTypeChange(key as keyof typeof LICENSE_TYPES)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.licenseType === key
                        ? `border-${config.color}-500 bg-${config.color}-50 dark:bg-${config.color}-900/20`
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400`} />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {config.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {config.defaultUsers} users, {config.defaultDuration} months
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Max Users */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Users
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) || 1 }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (months)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Features
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_FEATURES.map((feature) => (
                  <label key={feature.id} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature.id)}
                      onChange={() => handleFeatureToggle(feature.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {feature.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes or special instructions..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.organizationName || !formData.contactEmail}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Creating...' : 'Create License'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default CreateLicenseModal