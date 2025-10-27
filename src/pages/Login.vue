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
  <div class="login-page">
    <div class="login-container">
      <div class="login-content">
        <div class="logo-section">
          <h1 class="app-title">
            StyleSnap
          </h1>
          <p class="app-tagline">
            Your Digital Closet & Outfit Planner
          </p>
        </div>

        <div class="login-section">
          <!-- Available Sessions -->
          <div v-if="hasAvailableSessions" class="sessions-section">
            <h3 class="sessions-title">Continue with an existing account</h3>
            <div class="sessions-list">
              <div
                v-for="session in availableSessions"
                :key="session.id"
                class="session-card"
                @click="continueWithSession(session)"
              >
                <div class="session-avatar">
                  <img
                    v-if="session.avatar_url"
                    :src="session.avatar_url"
                    :alt="session.name"
                    class="avatar-img"
                  >
                  <div v-else class="avatar-placeholder">
                    {{ getInitial(session.name) }}
                  </div>
                </div>
                
                <div class="session-details">
                  <h4 class="session-name">{{ session.name }}</h4>
                  <p class="session-email">{{ session.email }}</p>
                  <p class="session-last-login">{{ formatLastLogin(session.last_login) }}</p>
                </div>
                
                <div class="session-action">
                  <svg class="continue-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div class="divider">
              <span>or</span>
            </div>
          </div>

          <!-- Sign in with Google -->
          <Button
            variant="primary"
            size="lg"
            :loading="isLoading"
            :disabled="isLoading"
            full-width
            @click="handleGoogleSignIn"
          >
            <span v-if="!isLoading">
              {{ hasAvailableSessions ? 'Sign in with a different Google account' : 'Sign in with Google' }}
            </span>
          </Button>

          <!-- Development Mock Login -->
          <div
            v-if="isDevelopment"
            class="dev-login-section"
          >
            <div class="dev-divider">
              <span class="dev-divider-text">Development Only</span>
            </div>
          </div>
        </div>

        <div class="footer-links">
          <p class="footer-text">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TermsOfServiceModal :isOpen="showTerms" @close="showTerms = false" />
    <PrivacyPolicyModal :isOpen="showPrivacy" @close="showPrivacy = false" />
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
import TermsOfServiceModal from '@/components/TermsOfServiceModal.vue'
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal.vue'

const router = useRouter()
const { theme, loadUser } = useTheme()
const authStore = useAuthStore()

// Use auth store state
const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

// Modal state
const showTerms = ref(false)
const showPrivacy = ref(false)

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
    router.push('/home')
  }
}, { immediate: true })

onMounted(async () => {
  // Initialize theme system (works without authentication)
  await loadUser()
  
  // The router guard will handle redirecting authenticated users
  // No need to duplicate the logic here
  console.log('🔒 Login: Page mounted, router guard will handle authentication check')
})
</script>

