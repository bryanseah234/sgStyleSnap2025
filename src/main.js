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
  { path: '/login', component: Login, meta: { requiresAuth: false } }
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
  // Import auth store
  const { useAuthStore } = await import('@/stores/auth-store')
  const authStore = useAuthStore()
  
  try {
    // Skip auth check for OAuth callback routes
    if (to.path.includes('/auth/callback') || to.query.code) {
      console.log('🔒 Route guard: OAuth callback detected, allowing navigation')
      next()
      return
    }
    
    // If auth store is not initialized, initialize it
    if (!authStore.isAuthenticated && !authStore.loading) {
      console.log('🔒 Route guard: Initializing auth...')
      await authStore.initializeAuth()
    }
    
    // Wait a bit for auth state to settle after OAuth redirect
    if (to.path === '/cabinet' && from.path === '/login') {
      console.log('🔒 Route guard: Potential OAuth redirect, waiting for auth state...')
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      await authStore.initializeAuth() // Re-initialize auth
    }
    
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      // Redirect to login if route requires auth and user is not authenticated
      console.log('🔒 Route guard: Redirecting to login (not authenticated)')
      next('/login')
    } else if (to.path === '/login' && authStore.isAuthenticated) {
      // Redirect to home if user is already authenticated and trying to access login
      console.log('🔒 Route guard: Redirecting to home (already authenticated)')
      next('/')
    } else {
      // Allow navigation
      console.log('🔒 Route guard: Allowing navigation to', to.path)
      next()
    }
  } catch (error) {
    console.error('🔒 Route guard error:', error)
    // If auth check fails, redirect to login for protected routes
    if (to.meta.requiresAuth) {
      next('/login')
    } else {
      next()
    }
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

// Initialize auth state before mounting
authStore.initializeAuth().then(() => {
  console.log('✅ Auth store initialized successfully')
}).catch(error => {
  console.error('❌ Failed to initialize auth store:', error)
}).finally(() => {
  // Mount the application to the DOM after auth initialization
  app.mount('#app')
})

// Load user theme preferences after app is mounted
// This is called asynchronously to avoid blocking the app mount
loadUser().catch(error => {
  console.error('Error loading user theme preferences:', error)
})
