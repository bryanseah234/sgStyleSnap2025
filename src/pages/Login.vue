<!--
  Login Page - StyleSnap
  
  Purpose: Authentication page with Google OAuth login
  
  Features:
  - App logo and branding
  - "Sign in with Google" button
  - Privacy policy and terms links
  - Redirect to closet after successful login
  
  Authentication Flow:
  1. User clicks "Sign in with Google"
  2. Redirects to Google OAuth consent screen
  3. Google redirects back with auth code
  4. Exchange code for tokens via Supabase Auth
  5. Store user session
  6. Redirect to /closet page
  
  Technical:
  - Uses Supabase Auth with Google provider
  - See services/auth-service.js for auth logic
  - Protected routes use utils/auth-guard.js
  
  Usage:
  This is the landing page for unauthenticated users
  Route: /login or / (root)
  
  Reference:
  - docs/design/mobile-mockups/01-login.png for login UI
  - requirements/security.md for authentication requirements
  - tasks/02-authentication-database.md for auth implementation
  - services/auth-service.js for Google OAuth integration
-->

<template>
  <div class="login-page">
    <!-- Theme Toggle Button -->
    <div class="theme-toggle-container">
      <button
        @click="themeStore.toggleTheme()"
        class="theme-toggle-button"
        :title="themeStore.getThemeLabel()"
      >
        <svg
          v-if="themeStore.isDarkMode"
          class="w-6 h-6 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
          class="w-6 h-6 text-gray-600 dark:text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </button>
    </div>

    <div class="login-container">
      <div class="login-content">
        <div class="logo-section">
          <h1 class="app-title text-gray-900 dark:text-white">
            StyleSnap
          </h1>
          <p class="app-tagline text-gray-600 dark:text-gray-300">
            Your Digital Closet & Outfit Planner
          </p>
        </div>
        
        <div class="login-section">
          <Button
            variant="primary"
            size="lg"
            :loading="isLoading"
            :disabled="isLoading"
            full-width
            @click="handleGoogleSignIn"
          >
            <span v-if="!isLoading">Sign in with Google</span>
          </Button>
          
          <p
            v-if="errorMessage"
            class="error-message"
          >
            {{ errorMessage }}
          </p>
        </div>
        
        <div class="footer-links">
          <p class="footer-text">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth-store'
import { useThemeStore } from '../stores/theme-store'
import Button from '../components/ui/Button.vue'

// const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isLoading = ref(false)
const errorMessage = ref('')

async function handleGoogleSignIn() {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    await authStore.login()
    // The auth service will handle the redirect to Google OAuth
    // After successful login, Google will redirect back to /closet
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = 'Failed to sign in. Please try again.'
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%);
  padding: 1rem;
  position: relative;
}

.dark .login-page {
  background: linear-gradient(135deg, #1a0b2e 0%, #2d1b69 50%, #4c1d95 100%);
}

.theme-toggle-container {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

.theme-toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.theme-toggle-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.dark .theme-toggle-button {
  background: rgba(45, 55, 72, 0.9);
  color: #e2e8f0;
}

.dark .theme-toggle-button:hover {
  background: rgba(45, 55, 72, 1);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-content {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 10px 25px var(--shadow-primary);
  border: 1px solid var(--border-primary);
}

.dark .login-content {
  background: var(--bg-primary);
  box-shadow: 0 10px 25px var(--shadow-primary);
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.dark .app-title {
  color: #f7fafc;
}

.app-tagline {
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .app-tagline {
  color: #a0aec0;
}

.login-section {
  margin-bottom: 1.5rem;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
}

.footer-links {
  text-align: center;
}

.footer-text {
  font-size: 0.75rem;
  color: #9ca3af;
  line-height: 1.5;
}

.dark .footer-text {
  color: #718096;
}

@media (max-width: 640px) {
  .login-content {
    padding: 1.5rem;
  }
  
  .app-title {
    font-size: 1.5rem;
  }
}
</style>
