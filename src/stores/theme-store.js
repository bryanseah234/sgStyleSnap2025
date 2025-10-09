/**
 * Theme Store - StyleSnap
 * 
 * Purpose: Manage light/dark mode theme state and persistence
 * 
 * Features:
 * - Toggle between light and dark themes
 * - Persist theme preference in localStorage
 * - Apply theme classes to document
 * - Default to light mode
 * 
 * Usage:
 * import { useThemeStore } from '@/stores/theme-store'
 * const themeStore = useThemeStore()
 * themeStore.toggleTheme()
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // State
  const isDarkMode = ref(false)
  const theme = ref('light') // 'light' or 'dark'

  // Initialize theme from localStorage or default to light
  function initializeTheme() {
    const savedTheme = localStorage.getItem('stylesnap-theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
    } else {
      setDarkMode(false)
    }
  }

  // Set dark mode state
  function setDarkMode(dark) {
    isDarkMode.value = dark
    theme.value = dark ? 'dark' : 'light'
    
    // Apply theme class to document
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Persist to localStorage
    localStorage.setItem('stylesnap-theme', theme.value)
  }

  // Toggle between light and dark mode
  function toggleTheme() {
    setDarkMode(!isDarkMode.value)
  }

  // Set specific theme
  function setTheme(newTheme) {
    if (newTheme === 'dark') {
      setDarkMode(true)
    } else {
      setDarkMode(false)
    }
  }

  // Get theme icon (for UI)
  function getThemeIcon() {
    return isDarkMode.value ? 'sun' : 'moon'
  }

  // Get theme label (for UI)
  function getThemeLabel() {
    return isDarkMode.value ? 'Light Mode' : 'Dark Mode'
  }

  // Watch for system theme changes (optional)
  function watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e) => {
        // Only auto-switch if user hasn't manually set a preference
        const savedTheme = localStorage.getItem('stylesnap-theme')
        if (!savedTheme) {
          setDarkMode(e.matches)
        }
      }
      
      mediaQuery.addEventListener('change', handleChange)
      
      // Initial check
      handleChange(mediaQuery)
    }
  }

  return {
    // State
    isDarkMode,
    theme,
    
    // Actions
    initializeTheme,
    setDarkMode,
    toggleTheme,
    setTheme,
    getThemeIcon,
    getThemeLabel,
    watchSystemTheme
  }
})
