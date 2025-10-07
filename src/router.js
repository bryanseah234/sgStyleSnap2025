/**
 * Vue Router Configuration - StyleSnap
 * 
 * Purpose: Define application routes and navigation logic
 * 
 * Authentication: Google SSO Only
 * - Login and Register pages both use Google OAuth
 * - No email/password authentication
 * - After successful auth, redirect to /closet (home page)
 * 
 * Routes:
 * - / (redirect to /closet if authenticated, /login if not)
 * - /login - Login page with Google SSO (public, guest only)
 * - /register - Register page with Google SSO (public, guest only)
 * - /closet - Main closet page (protected, home after login, has settings icon)
 * - /friends - Friends list (protected)
 * - /suggestions - Outfit suggestions (protected)
 * - /settings - User settings with avatar selection (protected)
 * 
 * Route Guards:
 * - requiresAuth: Check authentication before allowing access
 * - guestOnly: Redirect to /closet if already authenticated
 * 
 * Reference:
 * - requirements/frontend-components.md for page specifications
 * - utils/auth-guard.js for authentication checking
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth-store'

// Import pages
import Login from './pages/Login.vue'
import Register from './pages/Register.vue'
import Closet from './pages/Closet.vue'
import Catalog from './pages/Catalog.vue'
import Friends from './pages/Friends.vue'
import Suggestions from './pages/Suggestions.vue'
import Settings from './pages/Settings.vue' // Profile settings with avatar selection
import Analytics from './pages/Analytics.vue'
import OutfitGenerator from './pages/OutfitGenerator.vue'
import Notifications from './pages/Notifications.vue' // Notifications page

const routes = [
  {
    path: '/',
    redirect: () => {
      const authStore = useAuthStore()
      return authStore.isAuthenticated ? '/closet' : '/login'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/closet',
    name: 'Closet',
    component: Closet,
    meta: { requiresAuth: true }
  },
  {
    path: '/catalog',
    name: 'Catalog',
    component: Catalog,
    meta: { requiresAuth: true }
  },
  {
    path: '/friends',
    name: 'Friends',
    component: Friends,
    meta: { requiresAuth: true }
  },
  {
    path: '/suggestions',
    name: 'Suggestions',
    component: Suggestions,
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/outfit-generator',
    name: 'OutfitGenerator',
    component: OutfitGenerator,
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: { requiresAuth: true }
  },
  // Catch-all 404 route
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next('/login')
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    // Redirect to closet if already authenticated (e.g., on login page)
    next('/closet')
  } else {
    // Allow navigation
    next()
  }
})

export default router
