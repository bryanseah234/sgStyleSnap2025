/**
 * Auth Store - StyleSnap
 *
 * Purpose: Manages authentication state and user session
 *
 * State:
 * - user: Object | null (current authenticated user)
 *   - id: UUID
 *   - email: string
 *   - name: string
 *   - avatar_url: string (from Google)
 * - isAuthenticated: boolean
 * - isLoading: boolean (for auth operations)
 *
 * Actions:
 * - login(): Initiates Google OAuth flow
 * - logout(): Signs out user and clears session
 * - fetchUser(): Gets current user from Supabase session
 * - refreshSession(): Refreshes auth token
 *
 * Getters:
 * - userId: returns user.id or null
 * - userName: returns user.name or null
 *
 * Integration:
 * - Uses Supabase Auth (services/auth-service.js)
 * - Persists session in localStorage (Supabase handles this)
 * - Used by auth-guard.js for route protection
 *
 * Reference:
 * - services/auth-service.js for auth API calls
 * - tasks/02-authentication-database.md for auth implementation
 */

import { defineStore } from 'pinia'
import * as authService from '../services/auth-service'
import { storeUserSession, getActiveSession, clearActiveSession } from '../services/session-service'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    userId: state => state.user?.id || null,
    userName: state =>
      state.user?.user_metadata?.name || state.user?.name || state.user?.email || 'User',
    userEmail: state => state.user?.email || null,
    userAvatar: state => state.user?.avatar_url || null,
    // Backward compatibility
    isLoading: state => state.loading
  },

  actions: {
    /**
     * Set user data
     * @param {Object|null} userData - User object or null to clear
     */
    setUser(userData) {
      console.log('🔧 AuthStore: Setting user:', userData ? userData.email : 'null')
      this.user = userData
      this.isAuthenticated = !!userData
      
      // Store user session if authenticated
      if (userData) {
        storeUserSession(userData)
      }
      
      console.log('🔧 AuthStore: isAuthenticated set to:', this.isAuthenticated)
    },

    /**
     * Clear user data and authentication state
     */
    clearUser() {
      this.user = null
      this.isAuthenticated = false
      this.error = null
    },

    /**
     * Initialize auth state from existing session
     */
    async initializeAuth() {
      console.log('🔄 AuthStore: Initializing auth...')
      this.loading = true
      this.error = null
      try {
        const session = await authService.getSession()
        console.log('📦 AuthStore: Session retrieved:', session ? 'Found' : 'Not found')

        if (session) {
          console.log('✅ AuthStore: Setting user from session:', session.user.email)
          this.setUser(session.user)
        } else {
          console.log('❌ AuthStore: No session found')
        }
      } catch (error) {
        console.error('❌ AuthStore: Failed to initialize auth:', error)
        this.error = error.message
        this.clearUser()
      } finally {
        this.loading = false
        console.log(
          '✅ AuthStore: Auth initialization complete. Authenticated:',
          this.isAuthenticated
        )
      }
    },

    /**
     * Login with Google OAuth
     */
    async login() {
      this.loading = true
      this.error = null
      try {
        await authService.signInWithGoogle()
        // After redirect, initializeAuth will be called
      } catch (error) {
        console.error('Login failed:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Login with Google OAuth (alias for login)
     */
    async loginWithGoogle() {
      return this.login()
    },

    /**
     * Logout and clear session
     */
    async logout() {
      this.loading = true
      this.error = null
      try {
        await authService.signOut()
        this.clearUser()
      } catch (error) {
        console.error('Logout failed:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch current user data
     */
    async fetchUser() {
      this.loading = true
      this.error = null
      try {
        const session = await authService.getSession()
        if (session) {
          this.setUser(session.user)
        } else {
          this.clearUser()
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch user profile from database
     */
    async fetchUserProfile() {
      // Don't fetch if not authenticated
      if (!this.isAuthenticated) {
        return
      }

      this.loading = true
      this.error = null
      try {
        const { supabase: supabaseClient } = await import('../config/supabase')
        const { data, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', this.user.id)
          .single()

        if (error) {
          throw error
        }

        this.profile = data
        return data
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Refresh auth session
     */
    async refreshSession() {
      this.loading = true
      this.error = null
      try {
        const session = await authService.refreshSession()
        if (session) {
          this.setUser(session.user)
        }
        return session
      } catch (error) {
        console.error('Failed to refresh session:', error)
        this.error = error.message
        this.clearUser()
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Mock login for development
     * Creates a fake user session for testing
     */
    async mockLogin() {
      console.log('🚀 AuthStore: Starting mock login...')
      this.loading = true
      this.error = null

      try {
        // Create a mock user object
        const mockUser = {
          id: 'dev-user-123', // Consistent ID for development
          email: 'dev@test.com',
          user_metadata: {
            name: 'Development User',
            full_name: 'Development User',
            avatar_url: null,
            picture: null
          },
          app_metadata: {
            provider: 'mock',
            providers: ['mock']
          },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        console.log('✅ AuthStore: Mock user created:', mockUser.email)
        this.setUser(mockUser)

        // Simulate a small delay for realistic UX
        await new Promise(resolve => setTimeout(resolve, 500))

        console.log('✅ AuthStore: Mock login successful')
        return mockUser
      } catch (error) {
        console.error('❌ AuthStore: Mock login failed:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Setup auth state change listener
     */
    setupAuthListener() {
      console.log('👂 AuthStore: Setting up auth state listener')
      return authService.onAuthStateChange((event, session) => {
        console.log(
          '🔔 AuthStore: Auth event received:',
          event,
          session?.user?.email || 'no session'
        )

        if (event === 'SIGNED_IN' && session) {
          console.log('✅ AuthStore: User signed in:', session.user.email)
          this.setUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 AuthStore: User signed out')
          this.clearUser()
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 AuthStore: Token refreshed:', session.user.email)
          this.setUser(session.user)
        } else if (event === 'INITIAL_SESSION') {
          if (session) {
            console.log('🎬 AuthStore: Initial session detected:', session.user.email)
            this.setUser(session.user)
          } else {
            console.log('🎬 AuthStore: Initial session - no user')
            this.clearUser()
          }
        }
      })
    }
  }
})
