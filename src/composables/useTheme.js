import { ref, watch, onMounted } from 'vue'
import { api } from '@/api/client'

// Global theme state
const theme = ref('light')
const user = ref(null)

// Apply theme to DOM
const applyTheme = (newTheme) => {
  const root = document.documentElement
  if (newTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  // Check localStorage first
  const savedTheme = localStorage.getItem('stylesnap-theme')
  if (savedTheme) {
    theme.value = savedTheme
    applyTheme(savedTheme)
    return
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark'
    applyTheme('dark')
  } else {
    theme.value = 'light'
    applyTheme('light')
  }
}

export function useTheme() {
  const loadUser = async () => {
    try {
      const userData = await api.auth.me()
      user.value = userData
      if (userData.theme) {
        theme.value = userData.theme
        applyTheme(userData.theme)
        localStorage.setItem('stylesnap-theme', userData.theme)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const toggleTheme = async () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    theme.value = newTheme
    applyTheme(newTheme)
    localStorage.setItem('stylesnap-theme', newTheme)
    
    if (user.value) {
      try {
        await api.auth.updateMe({ theme: newTheme })
      } catch (error) {
        console.error('Error updating theme:', error)
      }
    }
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    applyTheme(newTheme)
    localStorage.setItem('stylesnap-theme', newTheme)
  }

  // Watch for theme changes and apply to DOM
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  // Initialize theme on mount
  onMounted(() => {
    initializeTheme()
  })

  return {
    theme,
    toggleTheme,
    setTheme,
    user,
    loadUser
  }
}
