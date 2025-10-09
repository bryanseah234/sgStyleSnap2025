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

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),
  
  getters: {
    userId: (state) => state.user?.id || null,
    userName: (state) => state.user?.user_metadata?.name || state.user?.name || state.user?.email || 'User',
    userEmail: (state) => state.user?.email || null,
    userAvatar: (state) => state.user?.avatar_url || null,
    // Backward compatibility
    isLoading: (state) => state.loading
  },
  
  actions: {
    /**
     * Set user data
     * @param {Object|null} userData - User object or null to clear
     */
    setUser(userData) {
      this.user = userData
      this.isAuthenticated = !!userData
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
      this.isLoading = true
      try {
        // MOCK USER FOR LOCAL DEV
        this.user = {
          id: 'mock-user-123',
          name: 'Test User',
          email: 'testuser@example.com',
          avatar_url: 'https://i.pravatar.cc/150?img=3'
        }
        this.isAuthenticated = true

        // If you want, skip calling authService entirely
        // const session = await authService.getSession()
        // if (session) {
        //   this.user = session.user
        //   this.isAuthenticated = true
        // }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        this.user = null
        this.isAuthenticated = false
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Initialize session (alias for initializeAuth)
     */
    async initializeSession() {
      return this.initializeAuth()
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
     * Setup auth state change listener
     */
    setupAuthListener() {
      return authService.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          this.setUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          this.clearUser()
        } else if (event === 'TOKEN_REFRESHED' && session) {
          this.setUser(session.user)
        }
      })
    }
  }
})
