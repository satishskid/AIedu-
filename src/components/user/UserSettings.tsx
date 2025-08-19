import React, { useState } from 'react'
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Bell,
  Volume2,
  VolumeX,
  Globe,
  Shield,
  Key,
  Trash2,
  Download,
  Upload,
  Save,
  AlertTriangle
} from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import { useAuthStore } from '../../store/authStore'

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

export const UserSettings: React.FC = () => {
  const { theme, setTheme } = useThemeStore()
  const { user } = useAuthStore()
  const [activeSection, setActiveSection] = useState('appearance')
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      lessonReminders: true,
      achievementAlerts: true,
      weeklyProgress: false
    },
    privacy: {
      profileVisibility: 'public',
      showProgress: true,
      shareAchievements: true,
      allowAnalytics: true
    },
    preferences: {
      language: 'en',
      soundEffects: true,
      autoSave: true,
      keyboardShortcuts: true
    }
  })

  const sections: SettingsSection[] = [
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel',
      icon: <Monitor className="w-5 h-5" />
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage your notification preferences',
      icon: <Bell className="w-5 h-5" />
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Control your privacy settings',
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'General application preferences',
      icon: <Settings className="w-5 h-5" />
    },
    {
      id: 'data',
      title: 'Data Management',
      description: 'Export, import, or delete your data',
      icon: <Download className="w-5 h-5" />
    }
  ]

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    console.log('Saving settings:', settings)
    // Show success message
  }

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Theme
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
            { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
            { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value as any)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                theme === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                {option.icon}
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'push', label: 'Push Notifications', description: 'Receive browser push notifications' },
            { key: 'lessonReminders', label: 'Lesson Reminders', description: 'Get reminded about scheduled lessons' },
            { key: 'achievementAlerts', label: 'Achievement Alerts', description: 'Celebrate your accomplishments' },
            { key: 'weeklyProgress', label: 'Weekly Progress', description: 'Weekly summary of your learning progress' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                  onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Privacy & Security
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>
          
          {[
            { key: 'showProgress', label: 'Show Learning Progress', description: 'Allow others to see your learning progress' },
            { key: 'shareAchievements', label: 'Share Achievements', description: 'Share your achievements with the community' },
            { key: 'allowAnalytics', label: 'Allow Analytics', description: 'Help improve the platform with usage analytics' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy[item.key as keyof typeof settings.privacy] as boolean}
                  onChange={(e) => handleSettingChange('privacy', item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPreferencesSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          General Preferences
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={settings.preferences.language}
              onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
            </select>
          </div>
          
          {[
            { key: 'soundEffects', label: 'Sound Effects', description: 'Play sound effects for interactions', icon: <Volume2 className="w-4 h-4" /> },
            { key: 'autoSave', label: 'Auto Save', description: 'Automatically save your progress', icon: <Save className="w-4 h-4" /> },
            { key: 'keyboardShortcuts', label: 'Keyboard Shortcuts', description: 'Enable keyboard shortcuts for faster navigation', icon: <Key className="w-4 h-4" /> }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                {item.icon}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.preferences[item.key as keyof typeof settings.preferences] as boolean}
                  onChange={(e) => handleSettingChange('preferences', item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Data Management
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Export Data</h4>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Download all your learning data, progress, and achievements.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Export My Data
            </button>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h4 className="font-medium text-green-900 dark:text-green-100">Import Data</h4>
            </div>
            <p className="text-sm text-green-800 dark:text-green-200 mb-3">
              Import your learning data from a previous export.
            </p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Import Data
            </button>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h4 className="font-medium text-red-900 dark:text-red-100">Delete Account</h4>
            </div>
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return renderAppearanceSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'privacy':
        return renderPrivacySettings()
      case 'preferences':
        return renderPreferencesSettings()
      case 'data':
        return renderDataSettings()
      default:
        return renderAppearanceSettings()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Settings
                </h1>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {section.icon}
                      <div>
                        <p className="font-medium">{section.title}</p>
                        <p className="text-xs opacity-75">{section.description}</p>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {renderContent()}
              
              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserSettings