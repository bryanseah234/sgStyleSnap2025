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
import { useThemeStore } from './stores/theme-store'

// Import page components
import Home from './pages/Home.vue'
import Cabinet from './pages/Cabinet.vue'
import Outfits from './pages/Outfits.vue'
import OutfitCreator from './pages/OutfitCreator.vue'
import Friends from './pages/Friends.vue'
import Profile from './pages/Profile.vue'
import FriendCabinet from './pages/FriendCabinet.vue'
import FriendProfile from './pages/FriendProfile.vue'
import Login from './pages/Login.vue'
import Logout from './pages/Logout.vue'
import OAuthCallback from './pages/OAuthCallback.vue'
import NotFound from './pages/NotFound.vue'

/**
 * Application Routes Configuration
 * 
 * Defines all available routes with their corresponding components
 * and authentication requirements.
 * 
 * @type {Array<Object>} Array of route objects
 */
const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: Home, meta: { requiresAuth: true } },
  { path: '/closet', component: Cabinet, meta: { requiresAuth: true } },
  { path: '/outfits', component: Outfits, meta: { requiresAuth: true } },
  { path: '/friends', component: Friends, meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/friend/:username/closet', component: FriendCabinet, meta: { requiresAuth: true } },
  { path: '/friend/:friendId/profile', component: FriendProfile, meta: { requiresAuth: true } },
  { path: '/logout', component: Logout, meta: { requiresAuth: false } }, // Logout page handles logout logic
  { path: '/login', component: Login, meta: { requiresAuth: false } },
  { path: '/auth/callback', component: OAuthCallback, meta: { requiresAuth: false } },
  
  // Outfit creation/editing routes (canvas interface)
  { path: '/outfits/add/personal', component: OutfitCreator, meta: { requiresAuth: true, subRoute: 'personal' } },
  { path: '/outfits/add/suggested', component: OutfitCreator, meta: { requiresAuth: true, subRoute: 'suggested' } },
  { path: '/outfits/add/friend', component: OutfitCreator, meta: { requiresAuth: true, subRoute: 'friend' } }, // Friend selection (without username)
  { path: '/outfits/add/friend/:username', component: OutfitCreator, meta: { requiresAuth: true, subRoute: 'friend' } }, // Friend's outfit creator
  { path: '/outfits/edit/:outfitId', component: OutfitCreator, meta: { requiresAuth: true, subRoute: 'edit' } },
  
  // Closet sub-routes (stay on closet page, content changes)
  { path: '/closet/add/manual', component: Cabinet, meta: { requiresAuth: true, subRoute: 'manual' } },
  { path: '/closet/add/catalogue', component: Cabinet, meta: { requiresAuth: true, subRoute: 'catalogue' } },
  { path: '/closet/view/friend/:username', component: Cabinet, meta: { requiresAuth: true, subRoute: 'friend' } },
  
  // Catch-all route for undefined paths - show 404 page
  { path: '/:pathMatch(.*)*', component: NotFound, meta: { requiresAuth: false } }
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
    console.log(`🧭 Router: Navigating from ${from.path} to ${to.path}`)
    
    // Import auth store
    const { useAuthStore } = await import('@/stores/auth-store')
    const authStore = useAuthStore()
    
    // Wait for auth initialization if it's still loading
    if (authStore.loading) {
      console.log('⏳ Router: Waiting for auth initialization...')
      const maxWait = 50 // 50 iterations = 5 seconds max
      let waited = 0
      while (authStore.loading && waited < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 100))
        waited++
      }
      
      // If still loading after max wait, check if user has existing session
      if (authStore.loading) {
        console.warn('⚠️ Router: Auth initialization timeout, checking for existing session...')
        
        // Check if we're navigating to login page (likely after logout)
        if (to.path === '/login') {
          console.log('🚪 Router: Navigating to login page, skipping auto sign-in')
          authStore.loading = false
          return
        }
        
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
    
    // Comprehensive authentication check
    const hasUser = authStore.user && authStore.user.id
    const isAuthenticated = authStore.isAuthenticated && hasUser && !authStore.loading
    
    console.log('🔍 Router: Auth state check:', {
      hasUser: !!hasUser,
      isAuthenticated: authStore.isAuthenticated,
      loading: authStore.loading,
      finalAuth: isAuthenticated
    })
    
    // Special handling for OAuth callback route - always allow
    if (to.path === '/auth/callback') {
      console.log('🔄 Router: OAuth callback route, allowing navigation')
      next()
      return
    }
    
    // Handle logout page - always allow access
    if (to.path === '/logout') {
      console.log('🚪 Router: Logout page, allowing navigation')
      next()
      return
    }
    
    // Handle login page - redirect authenticated users to home
    if (to.path === '/login') {
      if (isAuthenticated) {
        console.log('👤 Router: Already authenticated, redirecting to home')
        next('/home')
        return
      } else {
        console.log('🚪 Router: Not authenticated, allowing access to login page')
        next()
        return
      }
    }
    
    // Check if route requires authentication
    if (to.meta.requiresAuth) {
      if (!isAuthenticated) {
        console.log('🔒 Router: Protected route requires authentication, redirecting to login')
        console.log('🔒 Router: Route details:', {
          path: to.path,
          name: to.name,
          requiresAuth: to.meta.requiresAuth
        })
        next('/login')
        return
      } else {
        console.log('✅ Router: Authenticated user accessing protected route:', to.path)
      }
    }
    
    // Allow navigation to all other routes (public routes)
    console.log('✅ Router: Navigation allowed to:', to.path)
    next()
  } catch (error) {
    console.error('❌ Router: Navigation guard error:', error)
    // On any error, redirect to login for safety
    console.log('🔄 Router: Error occurred, redirecting to login for safety')
    next('/login')
  }
})

// Theme system will be initialized after Pinia is set up

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

// Initialize stores after Pinia is set up
app.config.globalProperties.$authStore = null
app.provide('authStore', null)

// Initialize auth store
import { useAuthStore } from '@/stores/auth-store'
const authStore = useAuthStore()
app.config.globalProperties.$authStore = authStore
app.provide('authStore', authStore)

// Initialize theme store after Pinia is set up
const themeStore = useThemeStore()
const { loadUser } = useTheme()

// Initialize theme immediately
themeStore.initializeTheme()
console.log('🎨 Main: Theme initialized:', themeStore.theme)

app.config.globalProperties.$themeStore = themeStore
app.provide('themeStore', themeStore)

// Debug: Track navigation events to identify browser extension error triggers
let navigationCount = 0
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

history.pushState = function(...args) {
  navigationCount++
  console.log(`🧭 Navigation #${navigationCount}: pushState`, args[2])
  return originalPushState.apply(this, args)
}

history.replaceState = function(...args) {
  navigationCount++
  console.log(`🧭 Navigation #${navigationCount}: replaceState`, args[2])
  return originalReplaceState.apply(this, args)
}

// Track window location changes
let lastLocation = window.location.href
setInterval(() => {
  if (window.location.href !== lastLocation) {
    navigationCount++
    console.log(`🧭 Navigation #${navigationCount}: location changed to`, window.location.href)
    lastLocation = window.location.href
  }
}, 100)

// Track browser extension errors to identify triggers
let extensionErrorCount = 0
const originalConsoleError = console.error
console.error = function(...args) {
  const message = args.join(' ')
  if (message.includes('No tab with id') || message.includes('runtime.lastError')) {
    extensionErrorCount++
    console.log(`🚨 Browser Extension Error #${extensionErrorCount}:`, message)
    console.log(`🚨 Current location:`, window.location.href)
    console.log(`🚨 Navigation count:`, navigationCount)
    console.log(`🚨 Timestamp:`, new Date().toISOString())
  }
  return originalConsoleError.apply(console, args)
}

// Track component mounting to debug blank page issue
let componentMountCount = 0
const originalMount = app.mount
app.mount = function(selector) {
  console.log('🔧 App: Attempting to mount to:', selector)
  try {
    const result = originalMount.call(this, selector)
    console.log('✅ App: Successfully mounted to:', selector)
    return result
  } catch (error) {
    console.error('❌ App: Failed to mount to:', selector, error)
    throw error
  }
}

// Track route changes after navigation
router.afterEach((to, from) => {
  console.log('🧭 Router: Navigation completed from', from.path, 'to', to.path)
  console.log('🧭 Router: Current route:', router.currentRoute.value.path)
  console.log('🧭 Router: Route component:', to.component?.name || 'Unknown')
  
  // Ensure theme is applied on route changes
  themeStore.refreshTheme()
})
// Initialize theme store first and apply theme immediately
themeStore.initializeTheme()

// Add global theme persistence for immediate application
document.addEventListener('DOMContentLoaded', () => {
  themeStore.refreshTheme()
})

// Also apply theme immediately if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    themeStore.refreshTheme()
  })
} else {
  themeStore.refreshTheme()
}

const authInitPromise = authStore.initializeAuth().then(() => {
  console.log('✅ Auth store initialized successfully')
  // Load user theme preferences after auth is ready
  return themeStore.loadUser()
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

// Ensure theme is applied after app is mounted
setTimeout(() => {
  console.log('🎨 Main: Ensuring theme is applied after mount')
  themeStore.refreshTheme()
}, 500)

// Global error handler for browser extension errors
window.addEventListener('unhandledrejection', (event) => {
  // Check if it's a browser extension error
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('message channel closed') ||
       event.reason.message.includes('listener indicated an asynchronous response'))) {
    console.warn('⚠️ Browser extension error detected, ignoring...')
    event.preventDefault() // Prevent the error from showing in console
    return
  }
  
  // For other errors, log them but don't crash the app
  console.error('❌ Unhandled promise rejection:', event.reason)
  event.preventDefault()
})
