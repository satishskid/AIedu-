import { useState, useEffect, useCallback } from 'react'
import { useLicenseStore } from '../store/licenseStore'
import { licenseService } from '../services/license'
import type { LicenseInfo as ServiceLicenseInfo } from '../services/license'

interface LicenseStatus {
  isValid: boolean
  isExpiring: boolean
  daysRemaining: number
  error?: string
  licenseInfo?: {
    key: string
    type: 'trial' | 'basic' | 'premium' | 'enterprise'
    expiresAt: string
    maxUsers: number
    features: string[]
    organizationName?: string
    contactEmail?: string
  }
}

interface UseLicenseReturn {
  licenseStatus: LicenseStatus
  initializeLicense: () => Promise<void>
  isValidating: boolean
  refreshLicense: () => Promise<void>
}

export const useLicense = (): UseLicenseReturn => {
  const { licenseInfo, isLicenseValid, checkLicense, activateLicense } = useLicenseStore()
  const [isValidating, setIsValidating] = useState(false)
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>({
    isValid: false,
    isExpiring: false,
    daysRemaining: 0
  })

  // Update license status when store changes
  useEffect(() => {
    updateLicenseStatus()
  }, [licenseInfo, isLicenseValid])

  const updateLicenseStatus = useCallback(() => {
    if (!licenseInfo) {
      setLicenseStatus({
        isValid: false,
        isExpiring: false,
        daysRemaining: 0,
        error: 'No license information available'
      })
      return
    }

    const now = new Date()
    const expiryDate = new Date(licenseInfo.expiresAt)
    const isExpired = now > expiryDate
    const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    setLicenseStatus({
      isValid: isLicenseValid && !isExpired,
      isExpiring: daysRemaining <= 7 && daysRemaining > 0,
      daysRemaining,
      licenseInfo,
      error: isExpired ? 'License has expired' : undefined
    })
  }, [licenseInfo, isLicenseValid])

  const initializeLicense = useCallback(async () => {
    setIsValidating(true)
    try {
      // Check existing license in store first
      await checkLicense()
      
      // If no valid license, try to load from storage
      if (!isLicenseValid) {
        const storedLicense = localStorage.getItem('eduai_license')
        if (storedLicense) {
          try {
            const parsedLicense = JSON.parse(storedLicense)
            const validationResult = await licenseService.validateLicense(parsedLicense.key)
            
            if (validationResult.valid && validationResult.license) {
              await activateLicense(parsedLicense.key)
            }
          } catch (error) {
            console.warn('Failed to validate stored license:', error)
            localStorage.removeItem('eduai_license')
          }
        }
      }
    } catch (error) {
      console.error('License initialization failed:', error)
      setLicenseStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'License initialization failed'
      }))
    } finally {
      setIsValidating(false)
    }
  }, [checkLicense, isLicenseValid, activateLicense])

  const refreshLicense = useCallback(async () => {
    if (!licenseInfo?.key) return
    
    setIsValidating(true)
    try {
      const validationResult = await licenseService.validateLicense(licenseInfo.key)
      if (validationResult.valid && validationResult.license) {
        await activateLicense(licenseInfo.key)
      } else {
        setLicenseStatus(prev => ({
          ...prev,
          error: 'License validation failed'
        }))
      }
    } catch (error) {
      console.error('License refresh failed:', error)
      setLicenseStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'License refresh failed'
      }))
    } finally {
      setIsValidating(false)
    }
  }, [licenseInfo?.key, activateLicense])

  return {
    licenseStatus,
    initializeLicense,
    isValidating,
    refreshLicense
  }
}