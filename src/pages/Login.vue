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
            <Button
              variant="secondary"
              size="lg"
              :loading="isLoading"
              :disabled="isLoading"
              full-width
              class="mock-login-button"
              @click="handleMockLogin"
            >
              <svg
                class="mock-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              🚀 Mock Login (Dev)
            </Button>
            <p class="dev-note">
              Skip OAuth for local development
            </p>
          </div>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth-store'
import { 
  getStoredSessions, 
  formatLastLogin,
  storeUserSession 
} from '../services/session-service'
import Button from '../components/ui/Button.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')
const availableSessions = ref([])

// Development mode detection
const isDevelopment = import.meta.env.DEV

// Computed properties
const hasAvailableSessions = computed(() => availableSessions.value.length > 0)

// Load available sessions on mount
onMounted(() => {
  loadAvailableSessions()
})

function loadAvailableSessions() {
  try {
    availableSessions.value = getStoredSessions()
  } catch (error) {
    console.error('Failed to load available sessions:', error)
  }
}

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?'
}

async function continueWithSession(session) {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // Since we can't restore actual authentication tokens from stored sessions,
    // we'll create a mock user object and set it in the auth store
    // This allows the user to continue with their previous account data
    
    const mockUser = {
      id: session.id,
      email: session.email,
      user_metadata: {
        name: session.name,
        full_name: session.name,
        avatar_url: session.avatar_url,
        picture: session.avatar_url
      },
      app_metadata: {
        provider: session.provider || 'google',
        providers: [session.provider || 'google']
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Set the user in the auth store
    authStore.setUser(mockUser)
    
    // Update the session's last login time
    const sessions = getStoredSessions()
    const updatedSessions = sessions.map(s => 
      s.id === session.id 
        ? { ...s, last_login: new Date().toISOString() }
        : s
    )
    localStorage.setItem('stylesnap_user_sessions', JSON.stringify(updatedSessions))
    
    // Redirect to the main app
    router.push('/closet')
  } catch (error) {
    console.error('Failed to continue with session:', error)
    errorMessage.value = 'Failed to continue with this account. Please try again.'
  } finally {
    isLoading.value = false
  }
}

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

async function handleMockLogin() {
  console.log('🚀 Mock login button clicked')
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Use the mock authentication from auth store
    await authStore.mockLogin()
    console.log('✅ Mock login successful')
    
    // Redirect to closet page after successful mock login
    await router.push('/closet')
  } catch (error) {
    console.error('❌ Mock login error:', error)
    errorMessage.value = error.message || 'Failed to mock login. Please try again.'
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
  color: var(--theme-text, #1f2937);
  margin-bottom: 0.5rem;
}

.app-tagline {
  font-size: 0.875rem;
  color: var(--theme-text-secondary, #6b7280);
}

.login-section {
  margin-bottom: 1.5rem;
}

/* Sessions Section */
.sessions-section {
  margin-bottom: 1.5rem;
}

.sessions-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--theme-text, #1f2937);
  margin-bottom: 1rem;
  text-align: center;
}

.sessions-list {
  margin-bottom: 1rem;
}

.session-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.session-card:hover {
  border-color: var(--theme-primary, #3b82f6);
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.session-avatar {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--theme-primary, #3b82f6), var(--theme-secondary, #8b5cf6));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

.session-details {
  flex: 1;
  min-width: 0;
}

.session-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--theme-text, #1f2937);
  margin: 0 0 0.125rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-email {
  font-size: 0.75rem;
  color: var(--theme-text-secondary, #6b7280);
  margin: 0 0 0.125rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-last-login {
  font-size: 0.6875rem;
  color: var(--theme-text-muted, #9ca3af);
  margin: 0;
}

.session-action {
  color: var(--theme-primary, #3b82f6);
  flex-shrink: 0;
}

.continue-icon {
  width: 1rem;
  height: 1rem;
}

.divider {
  text-align: center;
  margin: 1rem 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  background: white;
  padding: 0 0.75rem;
  color: var(--theme-text-muted, #9ca3af);
  font-size: 0.75rem;
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

/* Development Mock Login Styles */
.dev-login-section {
  margin-top: 1.5rem;
}

.dev-divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.dev-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e5e7eb;
}

.dev-divider-text {
  background-color: var(--theme-background, white);
  padding: 0 1rem;
  font-size: 0.75rem;
  color: var(--theme-text-secondary, #6b7280);
  font-weight: 500;
}

.mock-login-button {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  color: white;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.mock-login-button:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-1px);
}

.mock-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

.dev-note {
  font-size: 0.75rem;
  color: var(--theme-text-secondary, #6b7280);
  text-align: center;
  font-style: italic;
  margin: 0;
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
