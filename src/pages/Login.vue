<!--
  StyleSnap - Login Page Component
  
  Authentication page that allows users to sign in with Google OAuth.
  Features theme toggle functionality that works even when not logged in,
  with theme preferences persisting locally and syncing to user account
  upon successful authentication.
  
  Features:
  - Google OAuth authentication
  - Theme toggle (works without login)
  - Responsive design
  - Feature preview
  - Error handling
  - Auto-redirect for authenticated users
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <!-- Main login container with theme toggle -->
  <div class="min-h-screen flex items-center justify-center p-4 relative">
    <!-- Theme Toggle (Top Right) - Works without authentication -->
    <div class="absolute top-4 right-4 z-10">
      <div :class="`p-2 rounded-lg backdrop-blur-sm ${
        theme.value === 'dark' 
          ? 'bg-zinc-900/80 border border-zinc-800' 
          : 'bg-white/80 border border-stone-200'
      }`">
        <ThemeToggle />
      </div>
    </div>
    
    <div class="w-full max-w-md">

      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div :class="`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
          theme.value === 'dark' ? 'bg-white' : 'bg-black'
        }`">
          <Shirt :class="`w-10 h-10 ${theme.value === 'dark' ? 'text-black' : 'text-white'}`" />
        </div>
        <h1 :class="`text-4xl font-bold mb-2 ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          StyleSnap
        </h1>
        <p :class="`text-lg ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          Your digital wardrobe awaits
        </p>
      </div>

      <!-- Login Card -->
      <div :class="`rounded-3xl p-8 ${
        theme.value === 'dark' 
          ? 'bg-zinc-900 border border-zinc-800' 
          : 'bg-white border border-stone-200'
      } shadow-2xl`">
        
        <!-- Welcome Message -->
        <div class="text-center mb-8">
          <h2 :class="`text-2xl font-bold mb-2 ${
            theme.value === 'dark' ? 'text-white' : 'text-black'
          }`">
            Welcome back
          </h2>
          <p :class="`text-lg ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            Sign in to access your digital closet
          </p>
        </div>

        <!-- Google Sign In Button -->
        <button
          @click="handleGoogleSignIn"
          :disabled="loading"
          :class="`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
            theme.value === 'dark'
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-black text-white hover:bg-zinc-800'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`"
        >
          <div v-if="loading" class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <div v-else class="w-5 h-5">
            <svg viewBox="0 0 24 24" class="w-5 h-5">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <span>{{ loading ? 'Signing in...' : 'Continue with Google' }}</span>
        </button>

        <!-- Features Preview -->
        <div class="mt-8 space-y-4">
          <div class="text-center">
            <p :class="`text-sm font-medium mb-4 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              What you'll get:
            </p>
          </div>
          
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div :class="`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
              }`">
                <Shirt :class="`w-4 h-4 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`" />
              </div>
              <span :class="`text-sm ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                Digital closet management
              </span>
            </div>
            
            <div class="flex items-center gap-3">
              <div :class="`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
              }`">
                <Palette :class="`w-4 h-4 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`" />
              </div>
              <span :class="`text-sm ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                AI-powered outfit suggestions
              </span>
            </div>
            
            <div class="flex items-center gap-3">
              <div :class="`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
              }`">
                <Users :class="`w-4 h-4 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`" />
              </div>
              <span :class="`text-sm ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                Social fashion network
              </span>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" :class="`mt-6 p-4 rounded-lg ${
          theme.value === 'dark' 
            ? 'bg-red-900/20 border border-red-800 text-red-300' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`">
          <div class="flex items-center gap-2">
            <AlertCircle class="w-4 h-4" />
            <div>
              <span class="text-sm font-medium">{{ error }}</span>
              <div class="text-xs mt-1 opacity-75">
                If this persists, please check your Supabase OAuth configuration.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p :class="`text-sm ${
          theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'
        }`">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Login Page Component Script
 * 
 * Handles user authentication through Google OAuth using the auth store
 * and provides theme toggle functionality that works even when not logged in.
 * The theme preference is persisted locally and will sync with
 * the user's account once they sign in.
 */

import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth-store'
import { Shirt, Palette, Users, AlertCircle } from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()
const { theme, loadUser } = useTheme()
const authStore = useAuthStore()

// Use auth store state
const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

const handleGoogleSignIn = async () => {
  console.log('🔑 Login: Button clicked!')
  try {
    console.log('🔑 Login: Starting Google sign-in...')
    await authStore.login()
    console.log('🔑 Login: Sign-in initiated successfully')
    // User will be redirected automatically by Supabase or watcher
  } catch (err) {
    console.error('🔑 Login: Sign in error:', err)
    // Error is already handled by auth store
  }
}

// Watch for authentication changes and redirect when user becomes authenticated
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    console.log('🔒 Login: User became authenticated, redirecting to home')
    router.push('/')
  }
}, { immediate: true })

onMounted(async () => {
  // Initialize theme system (works without authentication)
  await loadUser()
  
  // Check if user is already authenticated using auth store
  if (authStore.isAuthenticated) {
    console.log('🔒 Login: User already authenticated, redirecting to home')
    router.push('/')
  } else {
    // Initialize auth to check for existing session
    try {
      await authStore.initializeAuth()
      if (authStore.isAuthenticated) {
        console.log('🔒 Login: Found existing session, redirecting to home')
        router.push('/')
      }
    } catch (error) {
      console.log('🔒 Login: No existing session found, staying on login page')
    }
  }
})
</script>

