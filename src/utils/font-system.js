/**
 * Font System Utilities - StyleSnap
 *
 * Purpose: Utilities for managing and applying font themes throughout the application
 *
 * Features:
 * - Font theme switching
 * - CSS custom property management
 * - Font loading optimization
 * - Theme persistence
 */

import { 
  AVAILABLE_FONT_THEMES, 
  getFontTheme, 
  getFontThemeInfo 
} from '@/config/fonts'

/**
 * Apply a font theme to the entire application
 * @param {string} themeKey - The theme key (modern, elegant, friendly, etc.)
 */
export function applyFontTheme(themeKey) {
  const theme = getFontTheme(themeKey)
  const root = document.documentElement
  
  // Update CSS custom properties
  root.style.setProperty('--font-primary', theme.primary.join(', '))
  root.style.setProperty('--font-secondary', theme.secondary.join(', '))
  root.style.setProperty('--font-mono', theme.mono.join(', '))
  
  // Update font weights
  Object.entries(theme.weights).forEach(([key, value]) => {
    root.style.setProperty(`--font-weight-${key}`, value)
  })
  
  // Update font sizes
  Object.entries(theme.sizes).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, value)
  })
  
  // Update line heights
  Object.entries(theme.lineHeights).forEach(([key, value]) => {
    root.style.setProperty(`--line-height-${key}`, value)
  })
  
  // Add theme class to body for specific styling
  document.body.className = document.body.className.replace(/font-theme-\w+/g, '')
  document.body.classList.add(`font-theme-${themeKey}`)
}

/**
 * Save font theme preference to localStorage
 * @param {string} themeKey - The theme key to save
 */
export function saveFontTheme(themeKey) {
  localStorage.setItem('font-theme', themeKey)
}

/**
 * Load font theme preference from localStorage
 * @returns {string|null} The saved theme key or null if not found
 */
export function loadFontTheme() {
  return localStorage.getItem('font-theme')
}

/**
 * Initialize font system with saved preference or default
 * @param {string} defaultTheme - Default theme if no saved preference
 */
export function initializeFontSystem(defaultTheme = 'openSans') {
  const savedTheme = loadFontTheme()
  const themeToApply = savedTheme && AVAILABLE_FONT_THEMES[savedTheme] ? savedTheme : defaultTheme
  
  applyFontTheme(themeToApply)
  return themeToApply
}

/**
 * Get current font theme info
 * @returns {Object} Current theme information
 */
export function getCurrentFontThemeInfo() {
  const currentTheme = loadFontTheme() || 'openSans'
  return getFontThemeInfo(currentTheme)
}

/**
 * Get all available font themes
 * @returns {Object} All available font themes
 */
export function getAvailableFontThemes() {
  return AVAILABLE_FONT_THEMES
}

/**
 * Check if a font theme exists
 * @param {string} themeKey - Theme key to check
 * @returns {boolean} True if theme exists
 */
export function isValidFontTheme(themeKey) {
  return themeKey in AVAILABLE_FONT_THEMES
}

/**
 * Preload fonts for better performance
 * @param {string} themeKey - Theme to preload fonts for
 */
export function preloadFonts(themeKey) {
  const theme = getFontTheme(themeKey)
  const fontsToPreload = [...new Set([...theme.primary, ...theme.secondary, ...theme.mono])]
  
  // System fonts that don't need to be loaded from Google Fonts
  const systemFonts = [
    'serif', 'sans-serif', 'monospace',
    '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 
    'Helvetica Neue', 'Arial', 'Helvetica', 'Monaco', 'Consolas', 
    'Liberation Mono', 'Courier New'
  ]
  
  fontsToPreload.forEach(font => {
    // Only preload actual Google Fonts, not system fonts
    if (!systemFonts.includes(font)) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@100;200;300;400;500;600;700;800;900&display=swap`
      document.head.appendChild(link)
    }
  })
}

/**
 * Font theme change handler for components
 * @param {string} themeKey - New theme key
 * @param {Function} callback - Optional callback after theme change
 */
export function changeFontTheme(themeKey, callback) {
  if (!isValidFontTheme(themeKey)) {
    console.warn(`Invalid font theme: ${themeKey}`)
    return
  }
  
  applyFontTheme(themeKey)
  saveFontTheme(themeKey)
  
  if (callback && typeof callback === 'function') {
    callback(themeKey)
  }
}

/**
 * Create font theme CSS classes dynamically
 * @param {string} themeKey - Theme to create classes for
 */
export function createFontThemeClasses(themeKey) {
  const theme = getFontTheme(themeKey)
  const style = document.createElement('style')
  style.id = `font-theme-${themeKey}`
  
  const css = `
    .font-theme-${themeKey} {
      --font-primary: ${theme.primary.join(', ')};
      --font-secondary: ${theme.secondary.join(', ')};
      --font-mono: ${theme.mono.join(', ')};
    }
    
    .font-theme-${themeKey} h1,
    .font-theme-${themeKey} h2,
    .font-theme-${themeKey} h3,
    .font-theme-${themeKey} h4,
    .font-theme-${themeKey} h5,
    .font-theme-${themeKey} h6 {
      font-family: var(--font-primary);
    }
    
    .font-theme-${themeKey} p,
    .font-theme-${themeKey} span,
    .font-theme-${themeKey} div,
    .font-theme-${themeKey} label,
    .font-theme-${themeKey} button,
    .font-theme-${themeKey} a {
      font-family: var(--font-primary);
    }
    
    .font-theme-${themeKey} code,
    .font-theme-${themeKey} pre {
      font-family: var(--font-mono);
    }
  `
  
  style.textContent = css
  document.head.appendChild(style)
}

/**
 * Remove font theme CSS classes
 * @param {string} themeKey - Theme to remove classes for
 */
export function removeFontThemeClasses(themeKey) {
  const style = document.getElementById(`font-theme-${themeKey}`)
  if (style) {
    style.remove()
  }
}

/**
 * Font system initialization for Vue app
 * Call this in your main.js or App.vue
 */
export function initializeVueFontSystem() {
  // Initialize font system
  const currentTheme = initializeFontSystem()
  
  // Note: Fonts are now imported via CSS @import in fonts.css
  // No need to preload fonts dynamically to avoid CORS issues
  
  // Create initial theme classes
  createFontThemeClasses(currentTheme)
  
  return currentTheme
}
