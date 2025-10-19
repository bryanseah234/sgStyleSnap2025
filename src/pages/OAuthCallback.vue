<!--
  StyleSnap - OAuth Callback Component
  
  Handles OAuth callback from Google authentication.
  This component processes the OAuth response and redirects
  the user to the appropriate page.
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <div class="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-black">
    <div class="text-center">
      <!-- Loading Spinner -->
      <div class="w-16 h-16 mx-auto mb-6">
        <div class="w-16 h-16 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <!-- Status Message -->
      <h1 class="text-2xl font-bold text-black dark:text-white mb-2">
        {{ statusMessage }}
      </h1>
      <p class="text-stone-600 dark:text-zinc-400">
        {{ statusDescription }}
      </p>
      
      <!-- Error Message -->
      <div v-if="error" class="mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
        <p class="text-red-700 dark:text-red-300 text-sm">
          {{ error }}
        </p>
        <button 
          @click="redirectToLogin"
          class="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Return to Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'

const router = useRouter()
const authStore = useAuthStore()

// State
const statusMessage = ref('Processing authentication...')
const statusDescription = ref('Please wait while we complete your sign-in.')
const error = ref(null)

// Methods
const redirectToLogin = () => {
  router.push('/login')
}

const handleOAuthCallback = async () => {
  try {
    console.log('🔄 OAuthCallback: Processing OAuth callback...')
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const hasError = urlParams.has('error')
    
    if (hasError) {
      const errorParam = urlParams.get('error')
      const errorDescription = urlParams.get('error_description') || 'Authentication failed'
      
      console.error('❌ OAuthCallback: OAuth error:', errorParam, errorDescription)
      
      statusMessage.value = 'Authentication Failed'
      statusDescription.value = 'There was an error during the authentication process.'
      error.value = `${errorParam}: ${errorDescription}`
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        redirectToLogin()
      }, 3000)
      
      return
    }
    
    console.log('✅ OAuthCallback: Processing authentication...')
    
    statusMessage.value = 'Completing Sign-In...'
    statusDescription.value = 'Setting up your account...'
    
    // Wait for auth store to complete OAuth callback processing
    // The auth store will handle the OAuth callback and update the authentication state
    let attempts = 0
    const maxAttempts = 15 // 15 seconds max wait
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
      
      console.log(`🔄 OAuthCallback: Checking authentication status (attempt ${attempts}/${maxAttempts})`)
      console.log(`🔄 OAuthCallback: Auth state - isAuthenticated: ${authStore.isAuthenticated}, user: ${!!authStore.user}, loading: ${authStore.loading}`)
      
      // Check if auth store has completed processing and user is authenticated
      if (authStore.isAuthenticated && authStore.user && authStore.user.id && !authStore.loading) {
        console.log('✅ OAuthCallback: Authentication successful, redirecting to home')
        
        statusMessage.value = 'Welcome!'
        statusDescription.value = 'Redirecting to your dashboard...'
        
        // Redirect to home page
        setTimeout(() => {
          router.push('/')
        }, 1000)
        return
      }
      
      // If we're still loading after 5 attempts, try to reinitialize auth
      if (attempts === 5 && authStore.loading) {
        console.log('🔄 OAuthCallback: Reinitializing auth after timeout...')
        try {
          await authStore.initializeAuth()
        } catch (error) {
          console.warn('⚠️ OAuthCallback: Auth reinitialization failed:', error)
        }
      }
    }
    
    // If we get here, authentication failed
    console.error('❌ OAuthCallback: Authentication timeout after', maxAttempts, 'seconds')
    
    statusMessage.value = 'Authentication Timeout'
    statusDescription.value = 'The authentication process took too long.'
    error.value = 'Authentication timeout - please try again'
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      redirectToLogin()
    }, 3000)
    
  } catch (err) {
    console.error('❌ OAuthCallback: Error processing callback:', err)
    
    statusMessage.value = 'Something Went Wrong'
    statusDescription.value = 'An unexpected error occurred.'
    error.value = err.message || 'Unknown error occurred'
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      redirectToLogin()
    }, 3000)
  }
}

// Lifecycle
onMounted(() => {
  handleOAuthCallback()
})
</script>
