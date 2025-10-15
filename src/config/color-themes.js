/**
 * Color Themes Configuration - StyleSnap
 *
 * Purpose: Comprehensive color themes with light and dark mode support
 * 
 * 🎨 COLOR THEME SYSTEM:
 * 6 beautiful color themes, each with complete light and dark mode palettes
 * Each theme includes primary, secondary, background, surface, text, and accent colors
 *
 * Usage:
 * - Import: import { COLOR_THEMES } from '@/config/color-themes'
 * - Use: COLOR_THEMES.purple.light.primary
 */

// 🎨 COLOR THEME DEFINITIONS

export const COLOR_THEMES = {
  // 1. PURPLE THEME (Default)
  purple: {
    name: 'Purple',
    description: 'Vibrant purple theme with elegant gradients',
    light: {
      primary: '#c84dd6',
      secondary: '#d66ee3',
      background: '#f8f4ff',
      surface: '#ffffff',
      surfaceLight: '#f0e8ff',
      text: '#1a0d3a',
      textSecondary: '#4c1d95',
      textMuted: '#6b46c1',
      border: '#e0d4ff',
      hover: '#f0e8ff',
      shadow: 'rgba(200, 77, 214, 0.1)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    dark: {
      primary: '#c84dd6',
      secondary: '#d66ee3',
      background: '#2d1b69',
      surface: '#1a0d3a',
      surfaceLight: '#4c1d95',
      text: '#ffffff',
      textSecondary: '#e5e7eb',
      textMuted: '#a78bfa',
      border: '#8a5a9a',
      hover: '#7a4a8a',
      shadow: 'rgba(200, 77, 214, 0.2)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },

  // 2. BLUE THEME
  blue: {
    name: 'Blue',
    description: 'Professional blue theme with ocean vibes',
    light: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      background: '#eff6ff',
      surface: '#ffffff',
      surfaceLight: '#dbeafe',
      text: '#1e3a8a',
      textSecondary: '#1d4ed8',
      textMuted: '#3b82f6',
      border: '#bfdbfe',
      hover: '#dbeafe',
      shadow: 'rgba(59, 130, 246, 0.1)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    dark: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      background: '#1e3a8a',
      surface: '#1e40af',
      surfaceLight: '#2563eb',
      text: '#ffffff',
      textSecondary: '#e5e7eb',
      textMuted: '#93c5fd',
      border: '#1d4ed8',
      hover: '#1e40af',
      shadow: 'rgba(59, 130, 246, 0.2)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },

  // 3. GREEN THEME
  green: {
    name: 'Green',
    description: 'Fresh green theme with nature inspiration',
    light: {
      primary: '#10b981',
      secondary: '#34d399',
      background: '#ecfdf5',
      surface: '#ffffff',
      surfaceLight: '#d1fae5',
      text: '#064e3b',
      textSecondary: '#047857',
      textMuted: '#10b981',
      border: '#a7f3d0',
      hover: '#d1fae5',
      shadow: 'rgba(16, 185, 129, 0.1)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    dark: {
      primary: '#10b981',
      secondary: '#34d399',
      background: '#064e3b',
      surface: '#047857',
      surfaceLight: '#059669',
      text: '#ffffff',
      textSecondary: '#e5e7eb',
      textMuted: '#6ee7b7',
      border: '#047857',
      hover: '#065f46',
      shadow: 'rgba(16, 185, 129, 0.2)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },

  // 4. PINK THEME
  pink: {
    name: 'Pink',
    description: 'Vibrant pink theme with playful energy',
    light: {
      primary: '#ec4899',
      secondary: '#f472b6',
      background: '#fdf2f8',
      surface: '#ffffff',
      surfaceLight: '#fce7f3',
      text: '#831843',
      textSecondary: '#be185d',
      textMuted: '#ec4899',
      border: '#f9a8d4',
      hover: '#fce7f3',
      shadow: 'rgba(236, 72, 153, 0.1)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    dark: {
      primary: '#ec4899',
      secondary: '#f472b6',
      background: '#831843',
      surface: '#be185d',
      surfaceLight: '#db2777',
      text: '#ffffff',
      textSecondary: '#e5e7eb',
      textMuted: '#f9a8d4',
      border: '#be185d',
      hover: '#9d174d',
      shadow: 'rgba(236, 72, 153, 0.2)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },

  // 5. ORANGE THEME
  orange: {
    name: 'Orange',
    description: 'Warm orange theme with sunset vibes',
    light: {
      primary: '#f97316',
      secondary: '#fb923c',
      background: '#fff7ed',
      surface: '#ffffff',
      surfaceLight: '#fed7aa',
      text: '#9a3412',
      textSecondary: '#c2410c',
      textMuted: '#f97316',
      border: '#fdba74',
      hover: '#fed7aa',
      shadow: 'rgba(249, 115, 22, 0.1)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    dark: {
      primary: '#f97316',
      secondary: '#fb923c',
      background: '#9a3412',
      surface: '#c2410c',
      surfaceLight: '#ea580c',
      text: '#ffffff',
      textSecondary: '#e5e7eb',
      textMuted: '#fdba74',
      border: '#c2410c',
      hover: '#9a3412',
      shadow: 'rgba(249, 115, 22, 0.2)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },

  // 6. INDIGO THEME
  indigo: {
    name: 'Indigo',
    description: 'Deep indigo theme with sophisticated elegance',
    light: {
      primary: '#6366f1',
      secondary: '#818cf8',
      background: '#eef2ff',
      surface: '#ffffff',
      surfaceLight: '#e0e7ff',
      text: '#3730a3',
      textSecondary: '#4338ca',
      textMuted: '#6366f1',
      border: '#c7d2fe',
      hover: '#e0e7ff',
      shadow: 'rgba(99, 102, 241, 0.1)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    dark: {
      primary: '#6366f1',
      secondary: '#818cf8',
      background: '#3730a3',
      surface: '#4338ca',
      surfaceLight: '#4f46e5',
      text: '#ffffff',
      textSecondary: '#e5e7eb',
      textMuted: '#a5b4fc',
      border: '#4338ca',
      hover: '#312e81',
      shadow: 'rgba(99, 102, 241, 0.2)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  }
}

/**
 * Get color theme by name
 * @param {string} themeName - Theme name (purple, blue, green, pink, orange, indigo)
 * @returns {Object} Color theme object
 */
export function getColorTheme(themeName) {
  return COLOR_THEMES[themeName] || COLOR_THEMES.purple
}

/**
 * Get all available color theme names
 * @returns {Array} Array of theme names
 */
export function getAvailableColorThemes() {
  return Object.keys(COLOR_THEMES)
}

/**
 * Get color theme info by name
 * @param {string} themeName - Theme name
 * @returns {Object} Theme info with name and description
 */
export function getColorThemeInfo(themeName) {
  const theme = getColorTheme(themeName)
  return {
    name: theme.name,
    description: theme.description
  }
}

/**
 * Apply color theme to CSS custom properties
 * @param {string} themeName - Theme name
 * @param {boolean} isDark - Whether to use dark mode
 */
export function applyColorTheme(themeName, isDark = false) {
  const theme = getColorTheme(themeName)
  const colors = isDark ? theme.dark : theme.light
  const root = document.documentElement
  
  // Update CSS custom properties
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value)
  })
  
  // Add theme class to body
  document.body.className = document.body.className.replace(/color-theme-\w+/g, '')
  document.body.classList.add(`color-theme-${themeName}`)
}

/**
 * Get current color theme from localStorage
 * @returns {string} Current theme name
 */
export function getCurrentColorTheme() {
  return localStorage.getItem('color-theme') || 'purple'
}

/**
 * Save color theme to localStorage
 * @param {string} themeName - Theme name to save
 */
export function saveColorTheme(themeName) {
  localStorage.setItem('color-theme', themeName)
}
