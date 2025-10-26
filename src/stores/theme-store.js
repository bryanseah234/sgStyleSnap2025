/**
 * StyleSnap - Theme Store
 *
 * Global theme state management using Pinia for consistent theme
 * state across all components and pages.
 *
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { defineStore } from 'pinia'
import { api } from '@/api/base44Client'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'light',
    user: null,
    isInitialized: false
  }),

  getters: {
    isDark: (state) => state.theme === 'dark',
    isLight: (state) => state.theme === 'light'
  },

  actions: {
    /**
     * Applies the specified theme to the DOM by adding/removing CSS classes
     * 
     * @param {string} newTheme - The theme to apply ('light' or 'dark')
     */
    applyTheme(newTheme) {
      const root = document.documentElement
      console.log('🎨 ThemeStore: Applying theme to DOM:', newTheme)
      console.log('🎨 ThemeStore: Root element before:', root.className)
      
      if (newTheme === 'dark') {
        root.classList.add('dark')
        console.log('🎨 ThemeStore: Added dark class')
      } else {
        root.classList.remove('dark')
        console.log('🎨 ThemeStore: Removed dark class')
      }
      
      console.log('🎨 ThemeStore: Root element after:', root.className)
      console.log('🎨 ThemeStore: Has dark class:', root.classList.contains('dark'))
    },

    /**
     * Initializes the theme from localStorage or system preference
     * 
     * Priority order:
     * 1. Saved theme in localStorage
     * 2. System preference (prefers-color-scheme)
     * 3. Default to light theme
     */
    initializeTheme() {
      if (this.isInitialized) {
        console.log('🎨 ThemeStore: Already initialized, skipping')
        return
      }

      // Check localStorage first for saved preference
      const savedTheme = localStorage.getItem('stylesnap-theme')
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        console.log('🎨 ThemeStore: Initializing theme from localStorage:', savedTheme)
        this.theme = savedTheme
        this.applyTheme(savedTheme)
        this.isInitialized = true
        return
      }

      // Check system preference if no saved theme
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        console.log('🎨 ThemeStore: Initializing theme from system preference: dark')
        this.theme = 'dark'
        this.applyTheme('dark')
      } else {
        console.log('🎨 ThemeStore: Initializing theme from system preference: light')
        this.theme = 'light'
        this.applyTheme('light')
      }
      
      this.isInitialized = true
    },

    /**
     * Loads user data and applies their saved theme preference
     * 
     * Fetches user data from the API and applies their saved theme
     * preference if available. Falls back to current theme if no
     * user preference is found.
     */
    async loadUser() {
      try {
        const userData = await api.auth.me()
        this.user = userData
        
        // Apply user's saved theme preference if available
        if (userData && (userData.theme || userData.theme_preference)) {
          const userTheme = userData.theme || userData.theme_preference
          console.log('Loading user theme preference:', userTheme)
          this.theme = userTheme
          this.applyTheme(userTheme)
          localStorage.setItem('stylesnap-theme', userTheme)
        } else {
          // If no user theme preference, use localStorage or initialize
          const savedTheme = localStorage.getItem('stylesnap-theme')
          if (savedTheme) {
            console.log('Using saved theme from localStorage:', savedTheme)
            this.theme = savedTheme
            this.applyTheme(savedTheme)
          } else {
            console.log('Initializing theme from system preference')
            this.initializeTheme()
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
        // Fallback to localStorage theme if user loading fails
        const savedTheme = localStorage.getItem('stylesnap-theme')
        if (savedTheme) {
          this.theme = savedTheme
          this.applyTheme(savedTheme)
        } else {
          this.initializeTheme()
        }
      }
    },

    /**
     * Toggles between light and dark themes
     * 
     * Switches the current theme and persists the change to both
     * localStorage and the user's profile (if authenticated).
     */
    async toggleTheme() {
      const newTheme = this.theme === 'light' ? 'dark' : 'light'
      console.log('🎨 ThemeStore: Toggling theme from', this.theme, 'to', newTheme)
      
      this.theme = newTheme
      this.applyTheme(newTheme)
      localStorage.setItem('stylesnap-theme', newTheme)
      
      // Update user's theme preference in the database
      if (this.user) {
        try {
          console.log('🎨 ThemeStore: Updating user theme preference in database:', newTheme)
          await api.auth.updateMe({ theme: newTheme })
          console.log('✅ ThemeStore: Theme preference updated successfully')
        } catch (error) {
          console.error('❌ ThemeStore: Error updating theme:', error)
        }
      } else {
        console.log('🎨 ThemeStore: No user logged in, theme saved to localStorage only')
      }
    },

    /**
     * Sets a specific theme
     * 
     * @param {string} newTheme - The theme to set ('light' or 'dark')
     */
    setTheme(newTheme) {
      if (newTheme !== 'light' && newTheme !== 'dark') {
        console.error('Invalid theme:', newTheme)
        return
      }
      
      console.log('Setting theme to:', newTheme)
      this.theme = newTheme
      this.applyTheme(newTheme)
      localStorage.setItem('stylesnap-theme', newTheme)
    },

    /**
     * Forces a theme refresh by re-applying the current theme
     * 
     * Useful for debugging or when theme state gets out of sync
     */
    refreshTheme() {
      console.log('Refreshing theme:', this.theme)
      this.applyTheme(this.theme)
    },

    /**
     * Syncs theme with another component's theme state
     * 
     * @param {string} externalTheme - Theme from another component
     */
    syncTheme(externalTheme) {
      if (externalTheme !== this.theme) {
        console.log('Syncing theme from external source:', externalTheme)
        this.setTheme(externalTheme)
      }
    }
  }
})
