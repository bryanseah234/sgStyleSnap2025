/**
 * Auth Service - StyleSnap
 * 
 * Purpose: Authentication API calls and session management using Supabase Auth
 * 
 * Functions:
 * - signInWithGoogle(): Initiates Google OAuth flow
 * - signOut(): Signs out current user
 * - getCurrentUser(): Gets current authenticated user from session
 * - getSession(): Gets current Supabase session
 * - refreshSession(): Refreshes auth token
 * - onAuthStateChange(callback): Subscribe to auth state changes
 * 
 * Authentication Flow:
 * 1. User clicks "Sign in with Google"
 * 2. signInWithGoogle() redirects to Google OAuth
 * 3. Google redirects back to app with auth code
 * 4. Supabase exchanges code for session token
 * 5. Session stored in localStorage
 * 6. getCurrentUser() fetches user profile
 * 
 * Session Management:
 * - Tokens stored in localStorage by Supabase
 * - Access token expires after 1 hour
 * - Refresh token used to get new access token
 * - Auto-refresh handled by Supabase client
 * 
 * Usage:
 * import { signInWithGoogle, getCurrentUser } from './auth-service'
 * await signInWithGoogle()
 * const user = await getCurrentUser()
 * 
 * Environment Variables Required:
 * - VITE_SUPABASE_URL: Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Supabase anon/public key
 * 
 * Reference:
 * - tasks/02-authentication-database.md for auth setup
 * - requirements/security.md for security requirements
 * - Supabase Auth docs: https://supabase.com/docs/guides/auth
 */

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

/**
 * Sign in with Google OAuth
 * @returns {Promise<void>}
 */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/closet`
    }
  })
  
  if (error) {
    throw new Error(`Google sign-in failed: ${error.message}`)
  }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(`Sign out failed: ${error.message}`)
  }
}

/**
 * Get current authenticated user
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw new Error(`Failed to get user: ${error.message}`)
  }
  
  return user
}

/**
 * Get current session
 * @returns {Promise<Object|null>}
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    throw new Error(`Failed to get session: ${error.message}`)
  }
  
  return session
}

/**
 * Refresh current session
 * @returns {Promise<Object|null>}
 */
export async function refreshSession() {
  const { data: { session }, error } = await supabase.auth.refreshSession()
  
  if (error) {
    throw new Error(`Failed to refresh session: ${error.message}`)
  }
  
  return session
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Object} - Subscription object with unsubscribe method
 */
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
  
  return data
}
