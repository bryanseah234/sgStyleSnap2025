<template>
  <div class="session-confirmation-page">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-md mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p class="text-gray-600 dark:text-gray-400">
            You're already signed in. Would you like to continue with your current account or switch to a different one?
          </p>
        </div>

        <!-- Current User Card -->
        <div class="current-user-card">
          <div class="user-info">
            <div class="user-avatar">
              <img
                v-if="currentUser.avatar_url"
                :src="currentUser.avatar_url"
                :alt="currentUser.name"
                class="avatar-img"
              >
              <div v-else class="avatar-placeholder">
                {{ getInitial(currentUser.name) }}
              </div>
            </div>
            
            <div class="user-details">
              <h3 class="user-name">{{ currentUser.name }}</h3>
              <p class="user-email">{{ currentUser.email }}</p>
              <p class="last-login">Last active: {{ formatLastLogin(currentUser.last_login) }}</p>
            </div>
          </div>
          
          <button
            @click="continueWithCurrentUser"
            class="continue-btn"
          >
            Continue with this account
          </button>
        </div>

        <!-- Divider -->
        <div class="divider">
          <span>or</span>
        </div>

        <!-- Switch User Section -->
        <div class="switch-user-section">
          <h3 class="section-title">Switch to a different account</h3>
          
          <!-- Available Sessions -->
          <div v-if="availableSessions.length > 0" class="sessions-list">
            <div
              v-for="session in availableSessions"
              :key="session.id"
              class="session-card"
              @click="switchToSession(session)"
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
                <svg class="switch-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Sign in with new account -->
          <button
            @click="signInWithNewAccount"
            class="new-account-btn"
          >
            <svg class="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with a different Google account
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>{{ loadingMessage }}</p>
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
  getActiveSession, 
  switchToSession, 
  formatLastLogin,
  removeUserSession 
} from '../services/session-service'
import { signInWithGoogle } from '../services/auth-service'

const router = useRouter()
const authStore = useAuthStore()

// Reactive state
const loading = ref(false)
const loadingMessage = ref('')
const currentUser = ref(null)
const availableSessions = ref([])

// Computed properties
const hasAvailableSessions = computed(() => availableSessions.length > 0)

// Load data on mount
onMounted(() => {
  loadSessionData()
})

async function loadSessionData() {
  try {
    // Get current user from auth store
    if (authStore.user) {
      currentUser.value = {
        id: authStore.user.id,
        email: authStore.user.email,
        name: authStore.user.user_metadata?.name || authStore.user.email?.split('@')[0] || 'User',
        avatar_url: authStore.user.user_metadata?.avatar_url || null,
        last_login: new Date().toISOString()
      }
    }

    // Get available sessions (excluding current user)
    const allSessions = getStoredSessions()
    availableSessions.value = allSessions.filter(session => 
      session.id !== currentUser.value?.id
    )
  } catch (error) {
    console.error('Failed to load session data:', error)
  }
}

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?'
}

async function continueWithCurrentUser() {
  loading.value = true
  loadingMessage.value = 'Continuing with current account...'
  
  try {
    // Redirect to main app
    await new Promise(resolve => setTimeout(resolve, 1000)) // Small delay for UX
    router.push('/closet')
  } catch (error) {
    console.error('Failed to continue with current user:', error)
  } finally {
    loading.value = false
  }
}

async function switchToSession(session) {
  loading.value = true
  loadingMessage.value = 'Switching account...'
  
  try {
    // Switch to the selected session
    await switchToSession(session)
    
    // Update auth store
    await authStore.fetchUser()
    
    // Redirect to main app
    await new Promise(resolve => setTimeout(resolve, 1000)) // Small delay for UX
    router.push('/closet')
  } catch (error) {
    console.error('Failed to switch session:', error)
    alert('Failed to switch account. Please try again.')
  } finally {
    loading.value = false
  }
}

async function signInWithNewAccount() {
  loading.value = true
  loadingMessage.value = 'Signing in with new account...'
  
  try {
    // Sign out current user first
    await authStore.logout()
    
    // Clear current session
    if (currentUser.value) {
      removeUserSession(currentUser.value.id)
    }
    
    // Sign in with new account
    await signInWithGoogle()
    
    // Redirect to main app
    router.push('/closet')
  } catch (error) {
    console.error('Failed to sign in with new account:', error)
    alert('Failed to sign in with new account. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.session-confirmation-page {
  min-height: 100vh;
  background: var(--theme-background);
  display: flex;
  align-items: center;
}

.container {
  width: 100%;
}

/* Current User Card */
.current-user-card {
  background: var(--theme-surface);
  border: 2px solid var(--theme-primary);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.user-avatar {
  width: 4rem;
  height: 4rem;
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
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--theme-text);
  margin: 0 0 0.25rem 0;
}

.user-email {
  color: var(--theme-text-secondary);
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
}

.last-login {
  color: var(--theme-text-muted);
  margin: 0;
  font-size: 0.75rem;
}

.continue-btn {
  width: 100%;
  background: var(--theme-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.continue-btn:hover {
  background: var(--theme-secondary);
  transform: translateY(-1px);
}

/* Divider */
.divider {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--theme-border);
}

.divider span {
  background: var(--theme-background);
  padding: 0 1rem;
  color: var(--theme-text-muted);
  font-size: 0.875rem;
}

/* Switch User Section */
.switch-user-section {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 1rem;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--theme-text);
  margin: 0 0 1rem 0;
}

.sessions-list {
  margin-bottom: 1rem;
}

.session-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--theme-border);
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.session-card:hover {
  border-color: var(--theme-primary);
  background: var(--theme-surface-light);
  transform: translateY(-1px);
}

.session-avatar {
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
}

.session-details {
  flex: 1;
}

.session-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--theme-text);
  margin: 0 0 0.25rem 0;
}

.session-email {
  color: var(--theme-text-secondary);
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
}

.session-last-login {
  color: var(--theme-text-muted);
  margin: 0;
  font-size: 0.75rem;
}

.session-action {
  color: var(--theme-primary);
}

.switch-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* New Account Button */
.new-account-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.new-account-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.google-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Loading State */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }
  
  .current-user-card,
  .switch-user-section {
    padding: 1rem;
  }
  
  .user-info {
    gap: 0.75rem;
  }
  
  .user-avatar {
    width: 3rem;
    height: 3rem;
  }
  
  .session-avatar {
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>
