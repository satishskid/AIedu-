import React from 'react'
import { AlertTriangle, Activity, BarChart3 } from 'lucide-react'
import { analytics } from '../../services/analytics'
import { monitoring } from '../../services/monitoring'

interface ServiceTestButtonProps {
  className?: string
}

const ServiceTestButton: React.FC<ServiceTestButtonProps> = ({ className = '' }) => {
  const testGoogleAnalytics = () => {
    try {
      // Test Google Analytics tracking
      analytics.trackUser('test_analytics', 'system', 'Analytics test button clicked')
      analytics.trackEngagement('feature_use', { feature: 'analytics_test' })
      
      // Show success message
      alert('Google Analytics test event sent! Check your GA4 real-time reports.')
      console.log('Google Analytics test completed')
    } catch (error) {
      console.error('Google Analytics test failed:', error)
      alert('Google Analytics test failed. Check console for details.')
    }
  }

  const testSentryMonitoring = () => {
    try {
      // Test Sentry error reporting
      const testError = new Error('Test error for Sentry monitoring - this is intentional!')
      
      monitoring.reportError(testError, {
        level: 'info',
        tags: { test: 'sentry_test', component: 'ServiceTestButton' },
        extra: { 
          timestamp: new Date().toISOString(),
          testType: 'manual_test',
          userAgent: navigator.userAgent
        }
      })
      
      // Show success message
      alert('Sentry test error sent! Check your Sentry dashboard.')
      console.log('Sentry test completed')
    } catch (error) {
      console.error('Sentry test failed:', error)
      alert('Sentry test failed. Check console for details.')
    }
  }

  const testBothServices = () => {
    testGoogleAnalytics()
    setTimeout(() => {
      testSentryMonitoring()
    }, 1000)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Service Integration Tests
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={testGoogleAnalytics}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          title="Test Google Analytics tracking"
        >
          <BarChart3 className="w-3 h-3" />
          <span>Test GA4</span>
        </button>
        
        <button
          onClick={testSentryMonitoring}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          title="Test Sentry error monitoring"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Test Sentry</span>
        </button>
        
        <button
          onClick={testBothServices}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          title="Test both Google Analytics and Sentry"
        >
          <Activity className="w-3 h-3" />
          <span>Test Both</span>
        </button>
      </div>
      
      <div className="text-xs text-gray-400 dark:text-gray-500">
        Use these buttons to verify analytics and monitoring are working
      </div>
    </div>
  )
}

export default ServiceTestButton