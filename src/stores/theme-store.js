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
        // Dark theme colors - Much lighter vibrant purple palette
        root.style.setProperty('--theme-primary', '#c84dd6') // Your specified vibrant purple
        root.style.setProperty('--theme-secondary', '#d66ee3') // Lighter vibrant purple
        root.style.setProperty('--theme-background', '#5a2a6a') // Much lighter purple background
        root.style.setProperty('--theme-surface', '#6a3a7a') // Lighter purple surface
        root.style.setProperty('--theme-surface-light', '#7a4a8a') // Even lighter purple surface
        root.style.setProperty('--theme-text', '#FFFFFF')
        root.style.setProperty('--theme-text-secondary', '#E5E7EB')
        root.style.setProperty('--theme-border', '#8a5a9a') // Lighter purple border
        root.style.setProperty('--theme-hover', '#7a4a8a') // Lighter purple hover
        root.style.setProperty('--theme-shadow', 'rgba(200, 77, 214, 0.2)') // Lighter purple shadow
      } else {
        root.classList.remove('dark')
        // Light theme colors - Light purple palette
        root.style.setProperty('--theme-primary', '#c84dd6') // Your vibrant purple
        root.style.setProperty('--theme-secondary', '#d66ee3') // Lighter vibrant purple
        root.style.setProperty('--theme-background', '#f8f4ff') // Very light purple background
        root.style.setProperty('--theme-surface', '#ffffff') // White surface
        root.style.setProperty('--theme-surface-light', '#f0e8ff') // Light purple surface
        root.style.setProperty('--theme-text', '#2d1b69') // Dark purple text
        root.style.setProperty('--theme-text-secondary', '#6b46c1') // Medium purple text
        root.style.setProperty('--theme-border', '#e0d4ff') // Light purple border
        root.style.setProperty('--theme-hover', '#f0e8ff') // Light purple hover
        root.style.setProperty('--theme-shadow', 'rgba(200, 77, 214, 0.1)') // Light purple shadow
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
