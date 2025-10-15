/**
 * Style Preferences Store - StyleSnap
 *
 * Purpose: Pinia store for managing user style preferences (fonts, colors, themes)
 *
 * Features:
 * - Font theme management
 * - Color theme management
 * - Preference persistence
 * - Session management
 */

import { defineStore } from 'pinia'
import { 
  changeFontTheme, 
  getCurrentFontThemeInfo,
  initializeFontSystem 
} from '@/utils/font-system'
import { 
  changeColorTheme, 
  getCurrentColorTheme,
  initializeColorSystem,
  shouldShowStylePrompt
} from '@/utils/color-system'

export const useStylePreferencesStore = defineStore('stylePreferences', {
  state: () => ({
    // Font preferences
    fontTheme: 'modern',
    fontThemeInfo: null,
    
    // Color preferences
    colorTheme: {
      primary: '#c84dd6',
      secondary: '#d66ee3',
      background: '#f8f4ff'
    },
    
    // UI state
    showStyleModal: false,
    preferencesSet: false,
    
    // Session tracking
    sessionId: null
  }),

  getters: {
    // Check if user has any style preferences set
    hasPreferences: (state) => {
      return state.fontTheme !== 'modern' || 
             state.colorTheme.primary !== '#c84dd6' ||
             state.preferencesSet
    },
    
    // Get current font theme name
    currentFontThemeName: (state) => {
      return state.fontThemeInfo?.name || 'Modern'
    },
    
    // Check if should show style prompt
    shouldShowPrompt: () => {
      return shouldShowStylePrompt()
    }
  },

  actions: {
    /**
     * Initialize the style preferences store
     */
    async initialize() {
      // Generate session ID
      this.sessionId = Date.now().toString()
      
      // Initialize font system
      this.fontTheme = initializeFontSystem()
      this.fontThemeInfo = getCurrentFontThemeInfo()
      
      // Initialize color system
      this.colorTheme = initializeColorSystem()
      
      // Check if preferences are set
      this.preferencesSet = this.hasPreferences
      
      // Show modal if needed
      this.showStyleModal = this.shouldShowPrompt
    },
    
    /**
     * Set font theme
     * @param {string} themeKey - Font theme key
     */
    setFontTheme(themeKey) {
      this.fontTheme = themeKey
      changeFontTheme(themeKey)
      this.fontThemeInfo = getCurrentFontThemeInfo()
    },
    
    /**
     * Set color theme
     * @param {Object} colors - Color theme object
     */
    setColorTheme(colors) {
      this.colorTheme = colors
      changeColorTheme(colors)
    },
    
    /**
     * Save all preferences
     * @param {Object} preferences - Preferences object
     */
    savePreferences(preferences) {
      if (preferences.font) {
        this.setFontTheme(preferences.font)
      }
      
      if (preferences.color) {
        this.setColorTheme(preferences.color)
      }
      
      this.preferencesSet = true
      this.showStyleModal = false
      
      // Mark as set for this session
      sessionStorage.setItem('style-preferences-set', 'true')
    },
    
    /**
     * Skip style preferences for this session
     */
    skipPreferences() {
      this.showStyleModal = false
      sessionStorage.setItem('style-preferences-set', 'skipped')
    },
    
    /**
     * Show style preferences modal
     */
    showStylePreferences() {
      this.showStyleModal = true
    },
    
    /**
     * Hide style preferences modal
     */
    hideStylePreferences() {
      this.showStyleModal = false
    },
    
    /**
     * Reset all preferences to defaults
     */
    resetPreferences() {
      this.fontTheme = 'modern'
      this.colorTheme = {
        primary: '#c84dd6',
        secondary: '#d66ee3',
        background: '#f8f4ff'
      }
      
      // Clear localStorage
      localStorage.removeItem('font-theme')
      localStorage.removeItem('color-theme')
      
      // Reinitialize systems
      this.initialize()
    },
    
    /**
     * Get current preferences as object
     * @returns {Object} Current preferences
     */
    getCurrentPreferences() {
      return {
        font: this.fontTheme,
        color: this.colorTheme,
        fontInfo: this.fontThemeInfo
      }
    }
  }
})