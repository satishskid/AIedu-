import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'
type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'red'
type FontSize = 'small' | 'medium' | 'large' | 'extra-large'
type Animation = 'none' | 'reduced' | 'normal' | 'enhanced'

interface ThemeState {
  // Theme settings
  theme: Theme
  colorScheme: ColorScheme
  fontSize: FontSize
  animation: Animation
  highContrast: boolean
  reducedMotion: boolean
  
  // UI preferences
  sidebarCollapsed: boolean
  showTooltips: boolean
  soundEffects: boolean
  notifications: boolean
  
  // Code editor preferences
  editorTheme: 'vs-light' | 'vs-dark' | 'hc-black' | 'hc-light'
  editorFontSize: number
  editorLineHeight: number
  editorTabSize: number
  editorWordWrap: boolean
  editorMinimap: boolean
  editorLineNumbers: boolean
  
  // Actions
  setTheme: (theme: Theme) => void
  setColorScheme: (scheme: ColorScheme) => void
  setFontSize: (size: FontSize) => void
  setAnimation: (animation: Animation) => void
  toggleHighContrast: () => void
  toggleReducedMotion: () => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleTooltips: () => void
  toggleSoundEffects: () => void
  toggleNotifications: () => void
  setEditorTheme: (theme: ThemeState['editorTheme']) => void
  setEditorFontSize: (size: number) => void
  setEditorLineHeight: (height: number) => void
  setEditorTabSize: (size: number) => void
  toggleEditorWordWrap: () => void
  toggleEditorMinimap: () => void
  toggleEditorLineNumbers: () => void
  resetToDefaults: () => void
  applySystemPreferences: () => void
}

// Default theme configuration
const defaultThemeState = {
  theme: 'system' as Theme,
  colorScheme: 'blue' as ColorScheme,
  fontSize: 'medium' as FontSize,
  animation: 'normal' as Animation,
  highContrast: false,
  reducedMotion: false,
  sidebarCollapsed: false,
  showTooltips: true,
  soundEffects: true,
  notifications: true,
  editorTheme: 'vs-light' as const,
  editorFontSize: 14,
  editorLineHeight: 1.5,
  editorTabSize: 2,
  editorWordWrap: true,
  editorMinimap: true,
  editorLineNumbers: true
}

// Utility functions
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getSystemReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const getSystemHighContrast = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: high)').matches
}

const applyThemeToDOM = (theme: Theme, colorScheme: ColorScheme, highContrast: boolean) => {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  const actualTheme = theme === 'system' ? getSystemTheme() : theme
  
  // Apply theme class
  root.classList.remove('light', 'dark')
  root.classList.add(actualTheme)
  
  // Apply color scheme
  root.setAttribute('data-color-scheme', colorScheme)
  
  // Apply high contrast
  if (highContrast) {
    root.classList.add('high-contrast')
  } else {
    root.classList.remove('high-contrast')
  }
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    const colors = {
      light: '#ffffff',
      dark: '#1a1a1a'
    }
    metaThemeColor.setAttribute('content', colors[actualTheme])
  }
}

const applyFontSize = (fontSize: FontSize) => {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  const fontSizeMap = {
    small: '14px',
    medium: '16px',
    large: '18px',
    'extra-large': '20px'
  }
  
  root.style.fontSize = fontSizeMap[fontSize]
}

const applyAnimation = (animation: Animation, reducedMotion: boolean) => {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  
  // Remove existing animation classes
  root.classList.remove('animation-none', 'animation-reduced', 'animation-normal', 'animation-enhanced')
  
  // Apply animation preference or reduced motion
  if (reducedMotion || animation === 'none') {
    root.classList.add('animation-none')
  } else {
    root.classList.add(`animation-${animation}`)
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      ...defaultThemeState,
      
      // Set theme
      setTheme: (theme: Theme) => {
        set({ theme })
        const state = get()
        applyThemeToDOM(theme, state.colorScheme, state.highContrast)
      },
      
      // Set color scheme
      setColorScheme: (colorScheme: ColorScheme) => {
        set({ colorScheme })
        const state = get()
        applyThemeToDOM(state.theme, colorScheme, state.highContrast)
      },
      
      // Set font size
      setFontSize: (fontSize: FontSize) => {
        set({ fontSize })
        applyFontSize(fontSize)
      },
      
      // Set animation preference
      setAnimation: (animation: Animation) => {
        set({ animation })
        const state = get()
        applyAnimation(animation, state.reducedMotion)
      },
      
      // Toggle high contrast
      toggleHighContrast: () => {
        const state = get()
        const highContrast = !state.highContrast
        set({ highContrast })
        applyThemeToDOM(state.theme, state.colorScheme, highContrast)
      },
      
      // Toggle reduced motion
      toggleReducedMotion: () => {
        const state = get()
        const reducedMotion = !state.reducedMotion
        set({ reducedMotion })
        applyAnimation(state.animation, reducedMotion)
      },
      
      // Toggle sidebar
      toggleSidebar: () => {
        const state = get()
        set({ sidebarCollapsed: !state.sidebarCollapsed })
      },
      
      // Set sidebar collapsed state
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed })
      },
      
      // Toggle tooltips
      toggleTooltips: () => {
        const state = get()
        set({ showTooltips: !state.showTooltips })
      },
      
      // Toggle sound effects
      toggleSoundEffects: () => {
        const state = get()
        set({ soundEffects: !state.soundEffects })
      },
      
      // Toggle notifications
      toggleNotifications: () => {
        const state = get()
        set({ notifications: !state.notifications })
      },
      
      // Set editor theme
      setEditorTheme: (editorTheme: ThemeState['editorTheme']) => {
        set({ editorTheme })
      },
      
      // Set editor font size
      setEditorFontSize: (editorFontSize: number) => {
        const clampedSize = Math.max(10, Math.min(24, editorFontSize))
        set({ editorFontSize: clampedSize })
      },
      
      // Set editor line height
      setEditorLineHeight: (editorLineHeight: number) => {
        const clampedHeight = Math.max(1.0, Math.min(3.0, editorLineHeight))
        set({ editorLineHeight: clampedHeight })
      },
      
      // Set editor tab size
      setEditorTabSize: (editorTabSize: number) => {
        const clampedSize = Math.max(1, Math.min(8, editorTabSize))
        set({ editorTabSize: clampedSize })
      },
      
      // Toggle editor word wrap
      toggleEditorWordWrap: () => {
        const state = get()
        set({ editorWordWrap: !state.editorWordWrap })
      },
      
      // Toggle editor minimap
      toggleEditorMinimap: () => {
        const state = get()
        set({ editorMinimap: !state.editorMinimap })
      },
      
      // Toggle editor line numbers
      toggleEditorLineNumbers: () => {
        const state = get()
        set({ editorLineNumbers: !state.editorLineNumbers })
      },
      
      // Reset to defaults
      resetToDefaults: () => {
        set(defaultThemeState)
        applyThemeToDOM(defaultThemeState.theme, defaultThemeState.colorScheme, defaultThemeState.highContrast)
        applyFontSize(defaultThemeState.fontSize)
        applyAnimation(defaultThemeState.animation, defaultThemeState.reducedMotion)
      },
      
      // Apply system preferences
      applySystemPreferences: () => {
        const systemTheme = getSystemTheme()
        const systemReducedMotion = getSystemReducedMotion()
        const systemHighContrast = getSystemHighContrast()
        
        set({
          theme: 'system',
          reducedMotion: systemReducedMotion,
          highContrast: systemHighContrast,
          animation: systemReducedMotion ? 'none' : 'normal'
        })
        
        applyThemeToDOM('system', get().colorScheme, systemHighContrast)
        applyAnimation(systemReducedMotion ? 'none' : 'normal', systemReducedMotion)
      }
    }),
    {
      name: 'eduai-theme-storage',
      partialize: (state: ThemeState) => ({
        theme: state.theme,
        colorScheme: state.colorScheme,
        fontSize: state.fontSize,
        animation: state.animation,
        highContrast: state.highContrast,
        reducedMotion: state.reducedMotion,
        sidebarCollapsed: state.sidebarCollapsed,
        showTooltips: state.showTooltips,
        soundEffects: state.soundEffects,
        notifications: state.notifications,
        editorTheme: state.editorTheme,
        editorFontSize: state.editorFontSize,
        editorLineHeight: state.editorLineHeight,
        editorTabSize: state.editorTabSize,
        editorWordWrap: state.editorWordWrap,
        editorMinimap: state.editorMinimap,
        editorLineNumbers: state.editorLineNumbers
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme settings after rehydration
          applyThemeToDOM(state.theme, state.colorScheme, state.highContrast)
          applyFontSize(state.fontSize)
          applyAnimation(state.animation, state.reducedMotion)
        }
      }
    }
  )
)

// Initialize theme on first load
if (typeof window !== 'undefined') {
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    const state = useThemeStore.getState()
    if (state.theme === 'system') {
      applyThemeToDOM('system', state.colorScheme, state.highContrast)
    }
  })
  
  // Listen for reduced motion changes
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', () => {
    const state = useThemeStore.getState()
    if (state.theme === 'system') {
      const reducedMotion = motionQuery.matches
      useThemeStore.setState({ reducedMotion })
      applyAnimation(state.animation, reducedMotion)
    }
  })
  
  // Listen for high contrast changes
  const contrastQuery = window.matchMedia('(prefers-contrast: high)')
  contrastQuery.addEventListener('change', () => {
    const state = useThemeStore.getState()
    if (state.theme === 'system') {
      const highContrast = contrastQuery.matches
      useThemeStore.setState({ highContrast })
      applyThemeToDOM('system', state.colorScheme, highContrast)
    }
  })
}

// Utility functions for components
export const getActualTheme = (theme: Theme): 'light' | 'dark' => {
  return theme === 'system' ? getSystemTheme() : theme
}

export const getEditorThemeForCurrentTheme = (theme: Theme, editorTheme: ThemeState['editorTheme']): ThemeState['editorTheme'] => {
  const actualTheme = getActualTheme(theme)
  
  // Auto-switch editor theme based on app theme if using default themes
  if (editorTheme === 'vs-light' && actualTheme === 'dark') {
    return 'vs-dark'
  }
  if (editorTheme === 'vs-dark' && actualTheme === 'light') {
    return 'vs-light'
  }
  
  return editorTheme
}

export const getFontSizeValue = (fontSize: FontSize): string => {
  const fontSizeMap = {
    small: '14px',
    medium: '16px',
    large: '18px',
    'extra-large': '20px'
  }
  
  return fontSizeMap[fontSize]
}

export const shouldReduceMotion = (animation: Animation, reducedMotion: boolean): boolean => {
  return reducedMotion || animation === 'none'
}

export const getColorSchemeColors = (colorScheme: ColorScheme) => {
  const colorMap = {
    blue: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryLight: '#dbeafe'
    },
    green: {
      primary: '#10b981',
      primaryHover: '#059669',
      primaryLight: '#d1fae5'
    },
    purple: {
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      primaryLight: '#ede9fe'
    },
    orange: {
      primary: '#f59e0b',
      primaryHover: '#d97706',
      primaryLight: '#fef3c7'
    },
    red: {
      primary: '#ef4444',
      primaryHover: '#dc2626',
      primaryLight: '#fee2e2'
    }
  }
  
  return colorMap[colorScheme]
}