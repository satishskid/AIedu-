import React, { useState, useEffect } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  User,
  Building,
  GraduationCap
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface UserLoginProps {
  onAuthenticated?: () => void
}

type AuthMode = 'login' | 'register'
type UserRole = 'student' | 'teacher'

export const UserLogin: React.FC<UserLoginProps> = ({ onAuthenticated }) => {
  const { login, register, isLoading, error, clearError } = useAuthStore()
  
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student' as UserRole,
    organizationId: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showDemoAccounts, setShowDemoAccounts] = useState(false)
  
  useEffect(() => {
    // Clear errors when switching modes or form data changes
    if (error) {
      clearError()
    }
    setValidationErrors({})
  }, [mode, formData, error, clearError])
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (mode === 'register' && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
    }
    
    // Registration-specific validation
    if (mode === 'register') {
      if (!formData.name.trim()) {
        errors.name = 'Name is required'
      } else if (formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    let success = false
    
    if (mode === 'login') {
      success = await login(formData.email, formData.password)
    } else {
      success = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        organizationId: formData.organizationId || undefined
      })
    }
    
    if (success && onAuthenticated) {
      onAuthenticated()
    }
  }
  
  const handleDemoLogin = async (email: string, password: string) => {
    const success = await login(email, password)
    if (success && onAuthenticated) {
      onAuthenticated()
    }
  }
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const demoAccounts = [
    {
      email: 'student@demo.com',
      password: 'demo123',
      name: 'Demo Student',
      role: 'student' as const,
      description: 'Experience EduAI from a student perspective',
      icon: <GraduationCap className="w-5 h-5 text-blue-500" />,
      stats: { level: 5, points: 1250, lessons: 12 }
    },
    {
      email: 'teacher@demo.com',
      password: 'demo123',
      name: 'Demo Teacher',
      role: 'teacher' as const,
      description: 'Explore teaching tools and student management',
      icon: <User className="w-5 h-5 text-green-500" />,
      stats: { level: 8, points: 2500, lessons: 25 }
    },
    {
      email: 'admin@demo.com',
      password: 'admin123',
      name: 'Demo Admin',
      role: 'admin' as const,
      description: 'Access administrative features and analytics',
      icon: <Building className="w-5 h-5 text-purple-500" />,
      stats: { level: 12, points: 5000, lessons: 50 }
    }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'login'
              ? 'Sign in to continue your learning journey'
              : 'Join EduAI Tutor and start learning'
            }
          </p>
        </div>
        
        {!showDemoAccounts ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Registration fields */}
            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.name}</span>
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('role', 'student')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.role === 'student'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      disabled={isLoading}
                    >
                      <GraduationCap className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('role', 'teacher')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.role === 'teacher'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      disabled={isLoading}
                    >
                      <User className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Teacher</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organization ID <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="organizationId"
                      value={formData.organizationId}
                      onChange={(e) => handleInputChange('organizationId', e.target.value)}
                      placeholder="Enter organization ID"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}
            
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationErrors.email}</span>
                </p>
              )}
            </div>
            
            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationErrors.password}</span>
                </p>
              )}
            </div>
            
            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </p>
              </div>
            )}
            
            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>
            
            {/* Mode toggle */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  disabled={isLoading}
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
            
            {/* Demo accounts link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowDemoAccounts(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                disabled={isLoading}
              >
                Try demo accounts
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Demo Accounts
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Try EduAI Tutor with these demo accounts
              </p>
            </div>
            
            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <div
                  key={account.email}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => handleDemoLogin(account.email, account.password)}
                >
                  <div className="flex items-start space-x-3">
                    {account.icon}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {account.name}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {account.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {account.description}
                      </p>
                      <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Level {account.stats.level}</span>
                        <span>{account.stats.points.toLocaleString()} points</span>
                        <span>{account.stats.lessons} lessons</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowDemoAccounts(false)}
              className="w-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back to Login
            </button>
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