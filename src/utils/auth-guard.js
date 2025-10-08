/**
 * Auth Guard - Route Protection Middleware
 * 
 * Purpose: Protects routes that require authentication
 * 
 * Usage:
 * In router.js:
 * ```
 * import { authGuard } from './utils/auth-guard'
 * 
 * {
 *   path: '/closet',
 *   component: Closet,
 *   meta: { requiresAuth: true },
 *   beforeEnter: authGuard
 * }
 * ```
 * 
 * Behavior:
 * - If user is authenticated: Allow access
 * - If user is not authenticated: Redirect to /login
 * - Preserves intended destination in query parameter
 * 
 * Reference:
 * - tasks/02-authentication-database.md for auth requirements
 * - stores/auth-store.js for auth state management
 */

import { useAuthStore } from '../stores/auth-store'

/**
 * Route guard to protect authenticated routes
 * @param {Object} to - Target route object
 * @param {Object} from - Source route object
 * @param {Function} next - Navigation callback
 */
export function authGuard(to, from, next) {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login with return URL
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
}

/**
 * Guest-only guard (for login/register pages)
 * Redirects authenticated users away from auth pages
 * @param {Object} to - Target route object
 * @param {Object} from - Source route object
 * @param {Function} next - Navigation callback
 */
export function guestGuard(to, from, next) {
  const authStore = useAuthStore()
  
  if (authStore.isAuthenticated) {
    // Redirect authenticated users to closet
    next({ path: '/closet' })
  } else {
    next()
  }
}

/**
 * Initialize auth state before first navigation
 * Call this in router.js before app mounts
 */
export async function initializeAuthState() {
  const authStore = useAuthStore()
  await authStore.initializeAuth()
}
