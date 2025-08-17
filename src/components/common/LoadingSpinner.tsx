import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white'
  className?: string
  text?: string
  fullScreen?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  text,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    secondary: 'border-secondary-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  }

  const spinnerClasses = `
    inline-block animate-spin rounded-full border-2 border-solid
    ${sizeClasses[size]}
    ${colorClasses[color]}
    ${className}
  `.trim()

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={spinnerClasses} role="status" aria-label="Loading" />
      {text && (
        <p className="text-sm text-secondary-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

// Skeleton loader component
interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
  animate?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = false,
  animate = true
}) => {
  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`
        bg-secondary-200 
        ${animate ? 'animate-pulse' : ''} 
        ${rounded ? 'rounded-full' : 'rounded'} 
        ${className}
      `.trim()}
      style={style}
      role="status"
      aria-label="Loading content"
    />
  )
}

// Loading dots component
interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white'
  className?: string
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    white: 'bg-white'
  }

  const dotClasses = `
    rounded-full animate-bounce
    ${sizeClasses[size]}
    ${colorClasses[color]}
  `.trim()

  return (
    <div className={`flex space-x-1 ${className}`} role="status" aria-label="Loading">
      <div className={dotClasses} style={{ animationDelay: '0ms' }} />
      <div className={dotClasses} style={{ animationDelay: '150ms' }} />
      <div className={dotClasses} style={{ animationDelay: '300ms' }} />
    </div>
  )
}

// Progress bar component
interface ProgressBarProps {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  showPercentage?: boolean
  className?: string
  animated?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  color = 'primary',
  showPercentage = false,
  className = '',
  animated = true
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600'
  }

  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-secondary-600">Progress</span>
          <span className="text-sm font-medium text-secondary-900">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-secondary-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`
            ${sizeClasses[size]} 
            ${colorClasses[color]} 
            rounded-full transition-all duration-300 ease-out
            ${animated ? 'animate-pulse' : ''}
          `.trim()}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}

// Loading overlay component
interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  text?: string
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  text = 'Loading...',
  spinnerSize = 'lg',
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <LoadingSpinner size={spinnerSize} text={text} />
        </div>
      )}
    </div>
  )
}

export default LoadingSpinner