/**
 * Vue Router Configuration - StyleSnap
 * 
 * Purpose: Define application routes and navigation logic
 * 
 * Routes:
 * - / (redirect to /closet if authenticated, /login if not)
 * - /login - Login page (public)
 * - /closet - Main closet page (protected)
 * - /friends - Friends list (protected)
 * - /suggestions - Outfit suggestions (protected)
 * - /profile - User profile (protected)
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
import Closet from './pages/Closet.vue'
import Catalog from './pages/Catalog.vue'
import Friends from './pages/Friends.vue'
import Suggestions from './pages/Suggestions.vue'
import Profile from './pages/Profile.vue'
import Analytics from './pages/Analytics.vue'
import OutfitGenerator from './pages/OutfitGenerator.vue'

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
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/outfit-generator',
    name: 'OutfitGenerator',
    component: OutfitGenerator,
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
