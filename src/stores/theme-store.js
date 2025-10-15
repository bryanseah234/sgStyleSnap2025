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
import { PURPLE_THEME } from '../config/colors'
import { applyColorTheme, getCurrentColorTheme } from '../config/color-themes'

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
      } else {
        root.classList.remove('dark')
      }
      
      // Reapply the current color theme with the new dark/light mode
      const currentColorTheme = getCurrentColorTheme()
      applyColorTheme(currentColorTheme, this.isDarkMode)
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
