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
    <div class="login-container">
      <div class="login-content">
        <div class="logo-section">
          <h1 class="app-title">StyleSnap</h1>
          <p class="app-tagline">Your Digital Closet & Outfit Planner</p>
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
          
          <p v-if="errorMessage" class="error-message">
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
import Button from '../components/ui/Button.vue'

const router = useRouter()
const authStore = useAuthStore()

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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
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

.app-tagline {
  font-size: 0.875rem;
  color: #6b7280;
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

@media (max-width: 640px) {
  .login-content {
    padding: 1.5rem;
  }
  
  .app-title {
    font-size: 1.5rem;
  }
}
</style>
