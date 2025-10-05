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
    isAuthenticated: false,
    isLoading: false
  }),
  
  getters: {
    userId: (state) => state.user?.id || null,
    userName: (state) => state.user?.name || state.user?.email || 'User',
    userEmail: (state) => state.user?.email || null,
    userAvatar: (state) => state.user?.avatar_url || null
  },
  
  actions: {
    /**
     * Initialize auth state from existing session
     */
    async initializeAuth() {
      this.isLoading = true
      try {
        const session = await authService.getSession()
        if (session) {
          this.user = session.user
          this.isAuthenticated = true
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        this.user = null
        this.isAuthenticated = false
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Login with Google OAuth
     */
    async login() {
      this.isLoading = true
      try {
        await authService.signInWithGoogle()
        // After redirect, initializeAuth will be called
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Logout and clear session
     */
    async logout() {
      this.isLoading = true
      try {
        await authService.signOut()
        this.user = null
        this.isAuthenticated = false
      } catch (error) {
        console.error('Logout failed:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Fetch current user data
     */
    async fetchUser() {
      try {
        const session = await authService.getSession()
        if (session) {
          this.user = session.user
          this.isAuthenticated = true
        } else {
          this.user = null
          this.isAuthenticated = false
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        throw error
      }
    },
    
    /**
     * Refresh auth session
     */
    async refreshSession() {
      try {
        const session = await authService.refreshSession()
        if (session) {
          this.user = session.user
          this.isAuthenticated = true
        }
        return session
      } catch (error) {
        console.error('Failed to refresh session:', error)
        this.user = null
        this.isAuthenticated = false
        throw error
      }
    }
  }
})
