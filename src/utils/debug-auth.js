/**
 * Debug Auth Utility
 *
 * This utility helps debug authentication issues by providing
 * detailed logging and state inspection.
 */

import { supabase } from '../config/supabase'
import { useAuthStore } from '../stores/auth-store'

/**
 * Debug authentication state
 */
export function debugAuthState() {
  console.log('🔍 === AUTH DEBUG INFO ===')

  // Check Supabase session
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    console.log('📦 Supabase Session:', session ? 'EXISTS' : 'NULL')
    if (session) {
      console.log('   User ID:', session.user.id)
      console.log('   User Email:', session.user.email)
      console.log('   Access Token:', session.access_token ? 'EXISTS' : 'NULL')
      console.log('   Refresh Token:', session.refresh_token ? 'EXISTS' : 'NULL')
    }
    if (error) {
      console.error('   Session Error:', error)
    }
  })

  // Check Auth Store state
  const authStore = useAuthStore()
  console.log('🏪 Auth Store State:')
  console.log('   isAuthenticated:', authStore.isAuthenticated)
  console.log('   user:', authStore.user ? authStore.user.email : 'NULL')
  console.log('   loading:', authStore.loading)
  console.log('   error:', authStore.error)

  // Check localStorage for Supabase tokens
  console.log('💾 Local Storage:')
  const keys = Object.keys(localStorage).filter(key => key.includes('supabase'))
  keys.forEach(key => {
    console.log(`   ${key}:`, localStorage.getItem(key) ? 'EXISTS' : 'NULL')
  })

  console.log('🔍 === END AUTH DEBUG ===')
}

/**
 * Force refresh authentication state
 */
export async function forceRefreshAuth() {
  console.log('🔄 Force refreshing auth state...')

  const authStore = useAuthStore()

  try {
    // Clear current state
    authStore.clearUser()

    // Reinitialize auth
    await authStore.initializeAuth()

    console.log('✅ Auth state refreshed')
    console.log('   isAuthenticated:', authStore.isAuthenticated)
    console.log('   user:', authStore.user ? authStore.user.email : 'NULL')
  } catch (error) {
    console.error('❌ Failed to refresh auth state:', error)
  }
}

/**
 * Test authentication flow
 */
export async function testAuthFlow() {
  console.log('🧪 Testing authentication flow...')

  const authStore = useAuthStore()

  // Step 1: Check initial state
  console.log('1️⃣ Initial state:')
  console.log('   isAuthenticated:', authStore.isAuthenticated)
  console.log('   user:', authStore.user ? authStore.user.email : 'NULL')

  // Step 2: Get session
  console.log('2️⃣ Getting session...')
  const {
    data: { session },
    error
  } = await supabase.auth.getSession()
  console.log('   Session:', session ? 'EXISTS' : 'NULL')
  if (error) console.error('   Error:', error)

  // Step 3: Update auth store
  if (session) {
    console.log('3️⃣ Updating auth store...')
    authStore.setUser(session.user)
    console.log('   isAuthenticated:', authStore.isAuthenticated)
    console.log('   user:', authStore.user ? authStore.user.email : 'NULL')
  } else {
    console.log('3️⃣ No session, clearing auth store...')
    authStore.clearUser()
    console.log('   isAuthenticated:', authStore.isAuthenticated)
  }

  console.log('🧪 Auth flow test complete')
}

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.debugAuth = {
    debugAuthState,
    forceRefreshAuth,
    testAuthFlow
  }

  console.log('🔧 Debug auth functions available:')
  console.log('   window.debugAuth.debugAuthState() - Show auth debug info')
  console.log('   window.debugAuth.forceRefreshAuth() - Force refresh auth')
  console.log('   window.debugAuth.testAuthFlow() - Test auth flow')
}
