import { ref } from 'vue'
import { api } from '@/api/client'

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
      await api.auth.updateMe({ theme: newTheme })
    }
  }

  return {
    theme,
    toggleTheme,
    user,
    loadUser
  }
}
