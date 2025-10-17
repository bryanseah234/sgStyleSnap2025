/**
 * StyleSnap - Theme Management Composable
 * 
 * Provides theme management functionality including light/dark mode switching,
 * theme persistence, and user preference synchronization.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { ref, watch, onMounted } from 'vue'
import { api } from '@/api/client'

// Global theme state - shared across all components
const theme = ref('light')
const user = ref(null)

/**
 * Applies the specified theme to the DOM by adding/removing CSS classes
 * 
 * @param {string} newTheme - The theme to apply ('light' or 'dark')
 */
const applyTheme = (newTheme) => {
  const root = document.documentElement
  if (newTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Initializes the theme from localStorage or system preference
 * 
 * Priority order:
 * 1. Saved theme in localStorage
 * 2. System preference (prefers-color-scheme)
 * 3. Default to light theme
 */
const initializeTheme = () => {
  // Check localStorage first for saved preference
  const savedTheme = localStorage.getItem('stylesnap-theme')
  if (savedTheme) {
    console.log('Initializing theme from localStorage:', savedTheme)
    theme.value = savedTheme
    applyTheme(savedTheme)
    return
  }

  // Check system preference if no saved theme
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    console.log('Initializing theme from system preference: dark')
    theme.value = 'dark'
    applyTheme('dark')
  } else {
    console.log('Initializing theme from system preference: light')
    theme.value = 'light'
    applyTheme('light')
  }
}

/**
 * useTheme Composable
 * 
 * Provides theme management functionality for Vue components.
 * Handles theme switching, persistence, and user synchronization.
 * 
 * @returns {Object} Theme management functions and reactive state
 * @returns {Ref<string>} theme - Current theme ('light' or 'dark')
 * @returns {Function} toggleTheme - Toggle between light and dark themes
 * @returns {Function} setTheme - Set a specific theme
 * @returns {Ref<Object>} user - Current user data
 * @returns {Function} loadUser - Load user data and theme preferences
 */
export function useTheme() {
  /**
   * Loads user data and applies their saved theme preference
   * 
   * Fetches user data from the API and applies their saved theme
   * preference if available. Falls back to current theme if no
   * user preference is found.
   */
  const loadUser = async () => {
    try {
      const userData = await api.auth.me()
      user.value = userData
      
      // Apply user's saved theme preference if available
      if (userData && userData.theme) {
        console.log('Loading user theme preference:', userData.theme)
        theme.value = userData.theme
        applyTheme(userData.theme)
        localStorage.setItem('stylesnap-theme', userData.theme)
      } else {
        // If no user theme preference, use localStorage or initialize
        const savedTheme = localStorage.getItem('stylesnap-theme')
        if (savedTheme) {
          console.log('Using saved theme from localStorage:', savedTheme)
          theme.value = savedTheme
          applyTheme(savedTheme)
        } else {
          console.log('Initializing theme from system preference')
          initializeTheme()
        }
      }
    } catch (error) {
      console.error('Error loading user:', error)
      // Fallback to localStorage theme if user loading fails
      const savedTheme = localStorage.getItem('stylesnap-theme')
      if (savedTheme) {
        theme.value = savedTheme
        applyTheme(savedTheme)
      }
    }
  }

  /**
   * Toggles between light and dark themes
   * 
   * Switches the current theme and persists the change to both
   * localStorage and the user's profile (if authenticated).
   */
  const toggleTheme = async () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    console.log('Toggling theme from', theme.value, 'to', newTheme)
    
    theme.value = newTheme
    applyTheme(newTheme)
    localStorage.setItem('stylesnap-theme', newTheme)
    
    // Update user's theme preference in the database
    if (user.value) {
      try {
        console.log('Updating user theme preference in database:', newTheme)
        await api.auth.updateMe({ theme: newTheme })
        console.log('Theme preference updated successfully')
      } catch (error) {
        console.error('Error updating theme:', error)
      }
    } else {
      console.log('No user logged in, theme saved to localStorage only')
    }
  }

  /**
   * Sets a specific theme
   * 
   * @param {string} newTheme - The theme to set ('light' or 'dark')
   */
  const setTheme = (newTheme) => {
    theme.value = newTheme
    applyTheme(newTheme)
    localStorage.setItem('stylesnap-theme', newTheme)
  }

  // Watch for theme changes and apply to DOM automatically
  watch(theme, (newTheme, oldTheme) => {
    console.log('Theme changed from', oldTheme, 'to', newTheme)
    applyTheme(newTheme)
  })

  // Initialize theme when the composable is first used
  onMounted(() => {
    console.log('useTheme composable mounted, initializing theme')
    initializeTheme()
  })

  /**
   * Forces a theme refresh by re-applying the current theme
   * 
   * Useful for debugging or when theme state gets out of sync
   */
  const refreshTheme = () => {
    console.log('Refreshing theme:', theme.value)
    applyTheme(theme.value)
  }

  return {
    theme,
    toggleTheme,
    setTheme,
    user,
    loadUser,
    refreshTheme
  }
}
