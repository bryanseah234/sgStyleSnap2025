/**
 * Theme Store - StyleSnap
 * 
 * Purpose: Manages application theme state (light/dark mode)
 * 
 * State:
 * - isDarkMode: boolean (current theme mode)
 * 
 * Actions:
 * - toggleTheme(): Switch between light and dark mode
 * - setTheme(mode): Set specific theme mode
 * - initializeTheme(): Load theme from localStorage
 * 
 * Persistence:
 * - Theme preference stored in localStorage
 * - Automatically applied on app initialization
 */

import { defineStore } from 'pinia'
<<<<<<< HEAD
=======
import { PURPLE_THEME } from '../config/colors'
>>>>>>> 1338a3b04d7f763f5709236ee1c338f23754b192

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: false
  }),

  getters: {
    /**
     * Get current theme mode
     */
    currentTheme: state => state.isDarkMode ? 'dark' : 'light',
    
    /**
     * Get theme colors based on current mode
     */
    themeColors: state => {
      if (state.isDarkMode) {
        return {
          primary: '#8b5cf6', // Dark purple
          secondary: '#a855f7',
          background: '#1f2937',
          surface: '#374151',
          text: '#f9fafb',
          textSecondary: '#d1d5db'
        }
      } else {
        return {
          primary: '#a855f7', // Light purple
          secondary: '#c084fc',
          background: '#f9fafb',
          surface: '#ffffff',
          text: '#111827',
          textSecondary: '#6b7280'
        }
      }
    }
  },

  actions: {
    /**
     * Toggle between light and dark mode
     */
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      this.applyTheme()
      this.saveTheme()
    },

    /**
     * Set specific theme mode
     * @param {boolean} isDark - Whether to use dark mode
     */
    setTheme(isDark) {
      this.isDarkMode = isDark
      this.applyTheme()
      this.saveTheme()
    },

    /**
     * Apply theme to document
     */
    applyTheme() {
      const root = document.documentElement

      if (this.isDarkMode) {
        root.classList.add('dark')
        // Dark theme colors - Purple palette
        root.style.setProperty('--theme-primary', PURPLE_THEME.primary)
        root.style.setProperty('--theme-secondary', PURPLE_THEME.secondary)
        root.style.setProperty('--theme-background', '#1e1b4b') // Dark purple background
        root.style.setProperty('--theme-surface', '#312e81') // Dark purple surface
        root.style.setProperty('--theme-surface-light', '#4338ca') // Lighter dark purple surface
        root.style.setProperty('--theme-text', '#ffffff')
        root.style.setProperty('--theme-text-secondary', '#c7d2fe')
        root.style.setProperty('--theme-border', '#4c1d95') // Dark purple border
        root.style.setProperty('--theme-hover', '#4338ca') // Dark purple hover
        root.style.setProperty('--theme-shadow', PURPLE_THEME.shadowDark)
      } else {
        root.classList.remove('dark')
        // Light theme colors - Purple palette
        root.style.setProperty('--theme-primary', PURPLE_THEME.primary)
        root.style.setProperty('--theme-secondary', PURPLE_THEME.secondary)
        root.style.setProperty('--theme-background', PURPLE_THEME.background)
        root.style.setProperty('--theme-surface', PURPLE_THEME.surface)
        root.style.setProperty('--theme-surface-light', PURPLE_THEME.surfaceLight)
        root.style.setProperty('--theme-text', PURPLE_THEME.text)
        root.style.setProperty('--theme-text-secondary', PURPLE_THEME.textSecondary)
        root.style.setProperty('--theme-border', PURPLE_THEME.border)
        root.style.setProperty('--theme-hover', PURPLE_THEME.surfaceLight)
        root.style.setProperty('--theme-shadow', PURPLE_THEME.shadow)
      }
    },

    /**
     * Save theme preference to localStorage
     */
    saveTheme() {
      localStorage.setItem('stylesnap-theme', this.isDarkMode ? 'dark' : 'light')
    },

    /**
     * Load theme from localStorage
     */
    loadTheme() {
      const savedTheme = localStorage.getItem('stylesnap-theme')
      if (savedTheme) {
        this.isDarkMode = savedTheme === 'dark'
      } else {
        // Default to light mode
        this.isDarkMode = false
      }
      this.applyTheme()
    },

    /**
     * Initialize theme on app startup
     */
    initializeTheme() {
      this.loadTheme()
    }
  }
})
