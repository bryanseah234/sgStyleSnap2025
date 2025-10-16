import { ref } from 'vue'
import { api } from '@/api/client'

// Global theme state
const theme = ref('light')
const user = ref(null)

export function useTheme() {
  const loadUser = async () => {
    try {
      const userData = await api.auth.me()
      user.value = userData
      if (userData.theme) {
        theme.value = userData.theme
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const toggleTheme = async () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    theme.value = newTheme
    if (user.value) {
      try {
        await api.auth.updateMe({ theme: newTheme })
      } catch (error) {
        console.error('Error updating theme:', error)
      }
    }
  }

  return {
    theme,
    toggleTheme,
    user,
    loadUser
  }
}
