/**
 * Color System Utilities - StyleSnap
 *
 * Purpose: Utilities for managing and applying color themes throughout the application
 *
 * Features:
 * - Color theme switching
 * - CSS custom property management
 * - Theme persistence
 * - Dynamic color generation
 */

/**
 * Apply a color theme to the entire application
 * @param {Object} colors - Color theme object with primary, secondary, background
 */
export function applyColorTheme(colors) {
  const root = document.documentElement
  
  // Generate complementary colors
  const themeColors = generateColorPalette(colors)
  
  // Update CSS custom properties
  root.style.setProperty('--theme-primary', themeColors.primary)
  root.style.setProperty('--theme-secondary', themeColors.secondary)
  root.style.setProperty('--theme-background', themeColors.background)
  root.style.setProperty('--theme-surface', themeColors.surface)
  root.style.setProperty('--theme-surface-light', themeColors.surfaceLight)
  root.style.setProperty('--theme-text', themeColors.text)
  root.style.setProperty('--theme-text-secondary', themeColors.textSecondary)
  root.style.setProperty('--theme-text-muted', themeColors.textMuted)
  root.style.setProperty('--theme-border', themeColors.border)
  root.style.setProperty('--theme-hover', themeColors.hover)
  root.style.setProperty('--theme-shadow', themeColors.shadow)
  
  // Add theme class to body for specific styling
  document.body.className = document.body.className.replace(/color-theme-\w+/g, '')
  document.body.classList.add('color-theme-custom')
}

/**
 * Generate a complete color palette from base colors
 * @param {Object} baseColors - Base colors (primary, secondary, background)
 * @returns {Object} Complete color palette
 */
function generateColorPalette(baseColors) {
  const primary = baseColors.primary || '#c84dd6'
  const secondary = baseColors.secondary || '#d66ee3'
  const background = baseColors.background || '#f8f4ff'
  
  return {
    primary,
    secondary,
    background,
    surface: '#ffffff',
    surfaceLight: lightenColor(background, 0.1),
    text: darkenColor(primary, 0.7),
    textSecondary: darkenColor(primary, 0.4),
    textMuted: darkenColor(primary, 0.2),
    border: lightenColor(primary, 0.3),
    hover: lightenColor(background, 0.05),
    shadow: `${primary}20`
  }
}

/**
 * Lighten a color by a percentage
 * @param {string} color - Hex color
 * @param {number} amount - Amount to lighten (0-1)
 * @returns {string} Lightened hex color
 */
function lightenColor(color, amount) {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  const newR = Math.min(255, Math.floor(r + (255 - r) * amount))
  const newG = Math.min(255, Math.floor(g + (255 - g) * amount))
  const newB = Math.min(255, Math.floor(b + (255 - b) * amount))
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

/**
 * Darken a color by a percentage
 * @param {string} color - Hex color
 * @param {number} amount - Amount to darken (0-1)
 * @returns {string} Darkened hex color
 */
function darkenColor(color, amount) {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  const newR = Math.max(0, Math.floor(r * (1 - amount)))
  const newG = Math.max(0, Math.floor(g * (1 - amount)))
  const newB = Math.max(0, Math.floor(b * (1 - amount)))
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

/**
 * Save color theme preference to localStorage
 * @param {Object} colors - Color theme to save
 */
export function saveColorTheme(colors) {
  localStorage.setItem('color-theme', JSON.stringify(colors))
}

/**
 * Load color theme preference from localStorage
 * @returns {Object|null} The saved color theme or null if not found
 */
export function loadColorTheme() {
  const saved = localStorage.getItem('color-theme')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.warn('Failed to parse saved color theme')
      return null
    }
  }
  return null
}

/**
 * Initialize color system with saved preference or default
 * @param {Object} defaultColors - Default colors if no saved preference
 */
export function initializeColorSystem(defaultColors = { primary: '#c84dd6', secondary: '#d66ee3', background: '#f8f4ff' }) {
  const savedColors = loadColorTheme()
  const colorsToApply = savedColors || defaultColors
  
  applyColorTheme(colorsToApply)
  return colorsToApply
}

/**
 * Get current color theme
 * @returns {Object} Current color theme
 */
export function getCurrentColorTheme() {
  return loadColorTheme() || { primary: '#c84dd6', secondary: '#d66ee3', background: '#f8f4ff' }
}

/**
 * Color theme change handler for components
 * @param {Object} colors - New color theme
 * @param {Function} callback - Optional callback after theme change
 */
export function changeColorTheme(colors, callback) {
  applyColorTheme(colors)
  saveColorTheme(colors)
  
  if (callback && typeof callback === 'function') {
    callback(colors)
  }
}

/**
 * Check if user has set style preferences
 * @returns {boolean} True if preferences are set
 */
export function hasStylePreferences() {
  return localStorage.getItem('font-theme') || localStorage.getItem('color-theme')
}

/**
 * Check if user should see style preference prompt
 * @returns {boolean} True if should show prompt
 */
export function shouldShowStylePrompt() {
  // Don't show if already set for this session
  const sessionSet = sessionStorage.getItem('style-preferences-set')
  if (sessionSet) {
    return false
  }
  
  // Show if no preferences are saved
  return !hasStylePreferences()
}

/**
 * Color system initialization for Vue app
 * Call this in your main.js or App.vue
 */
export function initializeVueColorSystem() {
  // Initialize color system
  const currentColors = initializeColorSystem()
  
  return currentColors
}
