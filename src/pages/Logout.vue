<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="text-center">
      <!-- Loading Spinner -->
      <div v-if="loggingOut" class="mb-6">
        <div class="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
      </div>
      
      <!-- Logout Complete -->
      <div v-else class="mb-6">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>
      
      <!-- Status Message -->
      <h1 :class="`text-2xl font-bold mb-2 ${
        theme.value === 'dark' ? 'text-white' : 'text-black'
      }`">
        {{ loggingOut ? 'Logging out...' : 'Logged out successfully' }}
      </h1>
      
      <p :class="`text-lg ${
        theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
      }`">
        {{ loggingOut ? 'Please wait while we sign you out' : 'Redirecting to login page...' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth-store'

// Composables
const router = useRouter()
const { theme } = useTheme()
const authStore = useAuthStore()

// State
const loggingOut = ref(true)

// Logout process
const performLogout = async () => {
  try {
    console.log('🚪 Logout Page: Starting logout process...')
    
    // Clear auth store first to prevent auto sign-in
    authStore.clearUser()
    
    // Perform logout through auth store
    await authStore.logout()
    
    console.log('✅ Logout Page: Logout completed successfully')
    
    // Show success state briefly
    loggingOut.value = false
    
    // Wait a moment to show success message, then redirect
    setTimeout(() => {
      console.log('🚪 Logout Page: Redirecting to login...')
      router.push('/login')
    }, 1500)
    
  } catch (error) {
    console.error('❌ Logout Page: Logout error:', error)
    
    // Even if logout fails, clear user data and redirect
    authStore.clearUser()
    loggingOut.value = false
    
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  }
}

// Start logout process when component mounts
onMounted(() => {
  performLogout()
})
</script>
