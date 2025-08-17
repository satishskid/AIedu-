import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId: string
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      errorId: this.generateErrorId()
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Report error to monitoring service
    this.reportError(error, errorInfo)
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo)
  }

  private async reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      // Send error to monitoring service (Sentry, etc.)
      if (import.meta.env.VITE_SENTRY_DSN) {
        // Sentry error reporting would go here
      }

      // Send error report via API
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('currentUserId') || 'anonymous'
      }

      await fetch('/.netlify/functions/report-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      })
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: this.generateErrorId()
      })
    } else {
      window.location.reload()
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleSendReport = async () => {
    const subject = `EduAI Error Report - ${this.state.errorId}`
    const body = `Error ID: ${this.state.errorId}\nError: ${this.state.error?.message}\nTime: ${new Date().toLocaleString()}\nURL: ${window.location.href}\n\nPlease describe what you were doing when this error occurred:\n\n\nTechnical Details:\n${this.state.error?.stack}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack}`

    const mailtoUrl = `mailto:${import.meta.env.VITE_SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl)
  }

  override render() {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 text-center"
          >
            <div className="text-red-500 mb-4">
              <AlertTriangle size={64} className="mx-auto" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 mb-6">
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="text-sm text-gray-700">
                <div className="font-semibold mb-1">Error ID:</div>
                <div className="font-mono text-xs bg-white px-2 py-1 rounded border">
                  {this.state.errorId}
                </div>
              </div>
              
              {this.state.error && (
                <div className="mt-3 text-sm text-gray-700">
                  <div className="font-semibold mb-1">Error:</div>
                  <div className="text-red-600 font-mono text-xs">
                    {this.state.error.message}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={this.handleRetry}
                  disabled={this.retryCount >= this.maxRetries}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw size={16} className="mr-2" />
                  {this.retryCount >= this.maxRetries ? 'Max Retries' : 'Try Again'}
                </button>

                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Reload Page
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Home size={16} className="mr-2" />
                  Go Home
                </button>

                <button
                  onClick={this.handleSendReport}
                  className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Mail size={16} className="mr-2" />
                  Send Report
                </button>
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              If this problem persists, please contact support with the Error ID above.
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

// Error Fallback component for lazy-loaded components
export const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reload Application
        </button>
      </div>
    </div>
  )
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

export default ErrorBoundary