/**
 * StyleSnap - Theme Management Composable
 * 
 * Provides theme management functionality including light/dark mode switching,
 * theme persistence, and user preference synchronization.
 * 
 * This composable now uses the global theme store for consistent state
 * management across all components.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme-store'

/**
 * useTheme Composable
 * 
 * Provides theme management functionality for Vue components.
 * Uses the global theme store for consistent state management.
 * 
 * @returns {Object} Theme management functions and reactive state
 * @returns {ComputedRef<string>} theme - Current theme ('light' or 'dark')
 * @returns {Function} toggleTheme - Toggle between light and dark themes
 * @returns {Function} setTheme - Set a specific theme
 * @returns {ComputedRef<Object>} user - Current user data
 * @returns {Function} loadUser - Load user data and theme preferences
 * @returns {Function} refreshTheme - Force theme refresh
 */
export function useTheme() {
  // Get the global theme store
  const themeStore = useThemeStore()

  // Initialize theme if not already done
  if (!themeStore.isInitialized) {
    themeStore.initializeTheme()
  }

  // Return reactive references to store state and actions
  return {
    theme: computed(() => themeStore.theme),
    toggleTheme: themeStore.toggleTheme,
    setTheme: themeStore.setTheme,
    user: computed(() => themeStore.user),
    loadUser: themeStore.loadUser,
    refreshTheme: themeStore.refreshTheme
  }
}
