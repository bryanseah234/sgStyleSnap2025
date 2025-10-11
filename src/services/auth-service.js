/**
 * Auth Service - StyleSnap
 * 
 * Purpose: Authentication API calls and session management using Supabase Auth
 * 
 * **CRITICAL: Google OAuth 2.0 (SSO) ONLY**
 * - Authentication Method: Google OAuth exclusively
 * - No email/password, magic links, or other auth methods
 * - Pages: /login and /register both use signInWithGoogle()
 * - After successful auth: Redirect to /closet (home page)
 * - User profile auto-created in users table on first sign-in
 * 
 * Functions:
 * - signInWithGoogle(): Initiates Google OAuth flow (used by both login and register)
 * - signOut(): Signs out current user
 * - getCurrentUser(): Gets current authenticated user from session
 * - getSession(): Gets current Supabase session
 * - refreshSession(): Refreshes auth token
 * - onAuthStateChange(callback): Subscribe to auth state changes
 * 
 * Authentication Flow (Login & Register):
 * 1. User clicks "Sign in with Google" or "Sign up with Google"
 * 2. signInWithGoogle() redirects to Google OAuth consent screen
 * 3. User authorizes app in Google
 * 4. Google redirects back to Supabase with auth code
 * 5. Supabase exchanges code for session token
 * 6. Supabase creates user in auth.users (if new)
 * 7. Database trigger creates entry in public.users table
 * 8. User redirected to /closet (home page)
 * 9. Session stored securely (IndexedDB with localStorage fallback)
 * 
 * Session Management:
 * - Tokens stored in IndexedDB by Supabase (localStorage fallback)
 * - Access token expires after 1 hour
 * - Refresh token used to get new access token
 * - Auto-refresh handled by Supabase client
 * 
 * Usage:
 * import { signInWithGoogle, getCurrentUser } from '../config/supabase'
 * 
 * // Used in both Login.vue and Register.vue
 * await signInWithGoogle() // Same function for both pages
 * const user = await getCurrentUser()
 * 
 * Environment Variables Required (.env):
 * - VITE_SUPABASE_URL: Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Supabase anon/public key
 * 
 * Supabase Setup:
 * - Enable Google provider in Authentication > Providers
 * - Configure Google OAuth credentials from Google Cloud Console
 * - Set redirect URL: https://YOUR-PROJECT.supabase.co/auth/v1/callback
 * 
 * Reference:
 * - tasks/02-authentication-database.md for auth setup
 * - requirements/security.md for security requirements
 * - Supabase Auth docs: https://supabase.com/docs/guides/auth
 */

import { supabase, isSupabaseConfigured } from '../config/supabase'

/**
 * Sign in with Google OAuth
 * @returns {Promise<void>}
 */
export async function signInWithGoogle() {
  // Check if Supabase is configured
  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Supabase is not configured!')
    console.error('📝 Please check your environment variables:')
    console.error('   - VITE_SUPABASE_URL')
    console.error('   - VITE_SUPABASE_ANON_KEY')
    throw new Error('Supabase is not configured. Please check your environment variables.')
  }

  console.log('🔐 Starting Google OAuth sign-in...')
  console.log('📍 Redirect URL:', `${window.location.origin}/closet`)
  
  const result = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/closet`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })
  
  console.log('📤 OAuth result:', result)
  
  if (result?.error) {
    console.error('❌ Google sign-in error:', result.error)
    throw new Error(`Google sign-in failed: ${result.error.message}`)
  }
  
  if (result?.data?.url) {
    console.log('✅ Redirecting to Google OAuth:', result.data.url)
  }
  
  return result
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  console.log('🚪 Signing out user...')
  const result = await supabase.auth.signOut()
  
  if (result?.error) {
    console.error('❌ Sign out error:', result.error)
    throw new Error(`Sign out failed: ${result.error.message}`)
  }
  
  console.log('✅ User signed out successfully')
}

/**
 * Get current authenticated user
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
  console.log('👤 Getting current user...')
  const result = await supabase.auth.getUser()
  
  if (result?.error) {
    console.error('❌ Get user error:', result.error)
    throw new Error(`Failed to get user: ${result.error.message}`)
  }
  
  const user = result?.data?.user || null
  console.log('👤 Current user:', user ? user.email : 'No user')
  return user
}

/**
 * Get current session
 * @returns {Promise<Object|null>}
 */
export async function getSession() {
  console.log('🔑 Getting current session...')
  const result = await supabase.auth.getSession()
  
  if (result?.error) {
    console.error('❌ Get session error:', result.error)
    throw new Error(`Failed to get session: ${result.error.message}`)
  }
  
  const session = result?.data?.session || null
  console.log('🔑 Session status:', session ? 'Active' : 'No session')
  return session
}

/**
 * Refresh current session
 * @returns {Promise<Object|null>}
 */
export async function refreshSession() {
  console.log('🔄 Refreshing session...')
  const result = await supabase.auth.refreshSession()
  
  if (result?.error) {
    console.error('❌ Refresh session error:', result.error)
    throw new Error(`Failed to refresh session: ${result.error.message}`)
  }
  
  const session = result?.data?.session || null
  console.log('🔄 Session refreshed:', session ? 'Success' : 'Failed')
  return session
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Object} - Subscription object with unsubscribe method
 */
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Auth state change:', event, session ? 'Session exists' : 'No session')
    if (session) {
      console.log('👤 User authenticated:', session.user.email)
    } else {
      console.log('🚪 User signed out')
    }
    callback(event, session)
  })
  
  return data
}
