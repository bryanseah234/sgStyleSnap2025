/**
 * StyleSnap - Main Application Entry Point
 * 
 * This file initializes the Vue 3 application with all necessary plugins,
 * routing configuration, and authentication guards.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './index.css'
import { useTheme } from './composables/useTheme'

// Import page components
import Home from './pages/Home.vue'
import Cabinet from './pages/Cabinet.vue'
import Dashboard from './pages/Dashboard.vue'
import Friends from './pages/Friends.vue'
import Profile from './pages/Profile.vue'
import FriendCabinet from './pages/FriendCabinet.vue'
import Login from './pages/Login.vue'
import OAuthCallback from './pages/OAuthCallback.vue'

/**
 * Application Routes Configuration
 * 
 * Defines all available routes with their corresponding components
 * and authentication requirements.
 * 
 * @type {Array<Object>} Array of route objects
 */
const routes = [
  { path: '/', component: Home, meta: { requiresAuth: true } },
  { path: '/cabinet', component: Cabinet, meta: { requiresAuth: true } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/friends', component: Friends, meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/friend-cabinet', component: FriendCabinet, meta: { requiresAuth: true } },
  { path: '/login', component: Login, meta: { requiresAuth: false } },
  { path: '/auth/callback', component: OAuthCallback, meta: { requiresAuth: false } }
]

/**
 * Vue Router Instance
 * 
 * Creates the router instance with HTML5 history mode
 * and the defined routes.
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * Route Guard - Authentication Protection
 * 
 * Intercepts navigation to protected routes and redirects
 * unauthenticated users to the login page. Also redirects
 * authenticated users away from the login page.
 * 
 * @param {Object} to - Target route object
 * @param {Object} from - Source route object  
 * @param {Function} next - Navigation function
 */
router.beforeEach(async (to, from, next) => {
  try {
    // Import auth store
    const { useAuthStore } = await import('@/stores/auth-store')
    const authStore = useAuthStore()
    
    // Wait for auth initialization if it's still loading
    if (authStore.loading) {
      console.log('⏳ Router: Waiting for auth initialization...')
      // Wait for auth to finish loading with longer timeout
        const maxWait = 50 // 50 iterations = 5 seconds max
      let waited = 0
      while (authStore.loading && waited < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 100))
        waited++
      }
      
      // If still loading after max wait, check if user has existing session
      if (authStore.loading) {
        console.warn('⚠️ Router: Auth initialization timeout, checking for existing session...')
        
        // Try to get user from Supabase directly
        try {
          // Import auth service to check for existing session
          const { authService } = await import('@/services/authService')
          const user = await authService.getCurrentUser()
          if (user) {
            console.log('✅ Router: Found existing session, setting user')
            authStore.setUser(user)
            authStore.loading = false
          } else {
            console.log('❌ Router: No existing session found')
            authStore.loading = false
          }
        } catch (error) {
          console.error('❌ Router: Error checking existing session:', error)
          authStore.loading = false
        }
      } else {
        console.log('✅ Router: Auth initialization complete')
      }
    }
    
    // More robust authentication check
    const isAuthenticated = authStore.isAuthenticated && authStore.user && authStore.user.id
    
    // Special handling for OAuth callback route
    if (to.path === '/auth/callback') {
      console.log('🔄 Router: OAuth callback route, allowing navigation')
      next()
      return
    }
    
    // Check if route requires authentication
    if (to.meta.requiresAuth && !isAuthenticated) {
      console.log('🔒 Router: Protected route, redirecting to login')
      next('/login')
    } else if (to.path === '/login' && isAuthenticated) {
      console.log('👤 Router: Already authenticated, redirecting to home')
      next('/')
    } else {
      console.log('✅ Router: Navigation allowed to:', to.path)
      next()
    }
  } catch (error) {
    console.error('❌ Router: Navigation guard error:', error)
    next('/login')
  }
})

// Initialize theme system before creating the app
const { loadUser } = useTheme()

/**
 * Vue Application Instance
 * 
 * Creates the main Vue application instance and configures
 * all necessary plugins and middleware.
 */
const app = createApp(App)
const pinia = createPinia()

// Register plugins
app.use(pinia)  // State management
app.use(router) // Client-side routing

// Initialize auth store after Pinia is set up
app.config.globalProperties.$authStore = null
app.provide('authStore', null)

// Initialize auth store
import { useAuthStore } from '@/stores/auth-store'
const authStore = useAuthStore()
app.config.globalProperties.$authStore = authStore
app.provide('authStore', authStore)

// Initialize auth state before mounting with timeout fallback
const authInitPromise = authStore.initializeAuth().then(() => {
  console.log('✅ Auth store initialized successfully')
}).catch(error => {
  console.error('❌ Failed to initialize auth store:', error)
})

// Mount the app with a timeout to prevent blank pages
Promise.race([
  authInitPromise,
  new Promise(resolve => setTimeout(resolve, 3000)) // 3 second timeout
]).finally(() => {
  // Mount the application to the DOM
  try {
    app.mount('#app')
    console.log('✅ App mounted successfully')
  } catch (error) {
    console.error('❌ Failed to mount app:', error)
    // Fallback: try to mount anyway
    setTimeout(() => {
      try {
        app.mount('#app')
        console.log('✅ App mounted via fallback')
      } catch (e) {
        console.error('❌ Fallback mount failed:', e)
        // Last resort: force reload if mounting fails
        setTimeout(() => {
          console.log('🔄 Forcing page reload due to mount failure')
          window.location.reload()
        }, 2000)
      }
    }, 1000)
  }
})

// Additional blank page prevention
let blankPageCheckInterval = null
let lastActivityTime = Date.now()

// Monitor for blank pages and recover
const startBlankPageMonitor = () => {
  blankPageCheckInterval = setInterval(() => {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityTime
    
    // If no activity for 10 seconds and page appears blank, try to recover
    if (timeSinceLastActivity > 10000) {
      const appElement = document.getElementById('app')
      if (appElement && (!appElement.innerHTML || appElement.innerHTML.trim() === '')) {
        console.log('🚨 Blank page detected, attempting recovery...')
        
        // Try to re-mount the app
        try {
          if (!app._instance) {
            app.mount('#app')
            console.log('✅ App re-mounted successfully')
          }
        } catch (error) {
          console.error('❌ Re-mount failed:', error)
          // Force reload as last resort
          window.location.reload()
        }
      }
    }
  }, 5000) // Check every 5 seconds
}

// Track user activity
document.addEventListener('click', () => { lastActivityTime = Date.now() })
document.addEventListener('keydown', () => { lastActivityTime = Date.now() })
document.addEventListener('scroll', () => { lastActivityTime = Date.now() })

// Start monitoring after a delay
setTimeout(startBlankPageMonitor, 5000)

// Additional aggressive error suppression for runtime.lastError
const originalOnError = window.onerror
window.onerror = function(message, source, lineno, colno, error) {
  if (isBrowserExtensionError(message) || 
      isBrowserExtensionError(source) ||
      isBrowserExtensionError(error?.message)) {
    return true // Suppress the error
  }
  
  if (originalOnError) {
    return originalOnError.call(this, message, source, lineno, colno, error)
  }
  return false
}

// Load user theme preferences after app is mounted
// This is called asynchronously to avoid blocking the app mount
loadUser().catch(error => {
  console.error('Error loading user theme preferences:', error)
})
