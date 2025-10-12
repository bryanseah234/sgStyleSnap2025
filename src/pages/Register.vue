<!--
  Register Page - StyleSnap
  
  Purpose: Registration page with Google OAuth signup
  
  Features:
  - App logo and branding
  - "Sign up with Google" button
  - Privacy policy and terms links
  - Redirect to closet after successful registration
  
  Authentication Flow:
  1. User clicks "Sign up with Google"
  2. Redirects to Google OAuth consent screen
  3. Google redirects back with auth code
  4. Exchange code for tokens via Supabase Auth
  5. Auto-create user profile in database
  6. Store user session
  7. Redirect to /closet page
  
  Technical:
  - Uses same OAuth flow as Login.vue (Google SSO only)
  - User profile auto-created on first sign-in
  - Username: derived from email (part before @)
  - Name: from Google account (first + last name)
  - See services/auth-service.js for auth logic
  
  CRITICAL:
  - This page uses SAME OAuth flow as login
  - No separate registration form or email/password
  - Google SSO is the ONLY authentication method
  
  Usage:
  Route: /register
  User can access via "Sign up" link
  
  Reference:
  - docs/design/mobile-mockups/02-register.png for register UI
  - requirements/security.md for authentication requirements
  - tasks/02-authentication-database.md for auth implementation
  - services/auth-service.js for Google OAuth integration
-->

<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-content">
        <div class="logo-section">
          <h1 class="app-title">
            StyleSnap
          </h1>
          <p class="app-tagline">
            Create Your Digital Closet
          </p>
        </div>
        
        <div class="register-section">
          <Button
            variant="primary"
            size="lg"
            :loading="isLoading"
            :disabled="isLoading"
            full-width
            @click="handleGoogleSignUp"
          >
            <span v-if="!isLoading">Sign up with Google</span>
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
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
          <p class="footer-text">
            Already have an account? 
            <router-link
              to="/login"
              class="link"
            >
              Sign in
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth-store'
import Button from '../components/ui/Button.vue'

const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')

/**
 * Handle Google Sign Up
 * Uses the same OAuth flow as login - Google creates account automatically
 */
async function handleGoogleSignUp() {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // Same OAuth flow as login - Supabase handles new user creation
    await authStore.login()
    // The auth service will handle the redirect to Google OAuth
    // After successful signup, Google will redirect back to /closet
    // User profile is auto-created in database on first sign-in
  } catch (error) {
    console.error('Registration error:', error)
    errorMessage.value = 'Failed to sign up. Please try again.'
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.register-container {
  width: 100%;
  max-width: 400px;
}

.register-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.app-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.app-tagline {
  font-size: 1rem;
  color: #6b7280;
}

.register-section {
  margin-bottom: 1.5rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 1rem;
  text-align: center;
}

.footer-links {
  text-align: center;
}

.footer-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .register-content {
    padding: 1.5rem;
  }
  
  .app-title {
    font-size: 2rem;
  }
}
</style>
