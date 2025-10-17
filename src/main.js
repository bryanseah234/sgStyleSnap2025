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
  const { api } = await import('@/api/client')
  
  try {
    const user = await api.auth.me()
    
    if (to.meta.requiresAuth && !user) {
      // Redirect to login if route requires auth and user is not authenticated
      next('/login')
    } else if (to.path === '/login' && user) {
      // Redirect to home if user is already authenticated and trying to access login
      next('/')
    } else {
      // Allow navigation
      next()
    }
  } catch (error) {
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

// Mount the application to the DOM
app.mount('#app')

// Load user theme preferences after app is mounted
// This is called asynchronously to avoid blocking the app mount
loadUser().catch(error => {
  console.error('Error loading user theme preferences:', error)
})
