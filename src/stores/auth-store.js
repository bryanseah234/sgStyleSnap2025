/**
 * Auth Store - StyleSnap
 *
 * Purpose: Manages authentication state and user session using Pinia
 *
 * State:
 * - user: Object | null (current authenticated user)
 *   - id: UUID
 *   - email: string
 *   - name: string
 *   - avatar_url: string (from Google)
 * - profile: Object | null (user profile from database)
 * - isAuthenticated: boolean
 * - loading: boolean (for auth operations)
 * - error: string | null (error messages)
 *
 * Actions:
 * - login(): Initiates Google OAuth flow
 * - logout(): Signs out user and clears session
 * - fetchUser(): Gets current user from Supabase session
 * - refreshSession(): Refreshes auth token
 * - initializeAuth(): Initialize auth state from existing session
 *
 * Getters:
 * - userId: returns user.id or null
 * - userName: returns user.name or null
 * - userEmail: returns user.email or null
 * - userAvatar: returns user.avatar_url or null
 *
 * Integration:
 * - Uses existing AuthService (services/authService.js)
 * - Integrates with session-service.js for multi-session support
 * - Persists session in localStorage (Supabase handles this)
 * - Used by auth-guard.js for route protection
 */

import { defineStore } from 'pinia'
import { authService } from '@/services/authService'
import { 
  storeUserSession, 
  getActiveSession, 
  clearActiveSession, 
  removeUserSession 
} from '@/services/session-service'

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
      state.user?.user_metadata?.name || 
      state.user?.name || 
      state.user?.email || 
      'User',
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
        // Clear any existing sessions for this user to avoid conflicts
        removeUserSession(userData.id)
        
        // Store the new session
        storeUserSession(userData)
      }
      
      console.log('🔧 AuthStore: isAuthenticated set to:', this.isAuthenticated)
    },

    /**
     * Clear user data and authentication state
     */
    clearUser() {
      // Remove the current user's session from stored sessions
      if (this.user?.id) {
        removeUserSession(this.user.id)
      }
      
      this.user = null
      this.profile = null
      this.isAuthenticated = false
      this.error = null
      clearActiveSession()
    },

    /**
     * Initialize auth state from existing session
     */
    async initializeAuth() {
      console.log('🔄 AuthStore: Initializing auth...')
      this.loading = true
      this.error = null
      try {
        // Use the existing AuthService to get current user
        const user = await authService.getCurrentUser()
        console.log('📦 AuthStore: User retrieved:', user ? 'Found' : 'Not found')

        if (user) {
          console.log('✅ AuthStore: Setting user from session:', user.email)
          this.setUser(user)
          
          // Also fetch the user profile
          try {
            const profile = await authService.getCurrentProfile()
            this.profile = profile
          } catch (profileError) {
            console.warn('⚠️ AuthStore: Could not fetch user profile:', profileError)
          }
        } else {
          console.log('❌ AuthStore: No user found, clearing any stored sessions')
          // Clear any stored sessions if no valid Supabase session exists
          clearActiveSession()
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
        // Check if we're in mock mode (no Supabase configured)
        if (!authService.isSupabaseConfigured) {
          console.log('🎭 AuthStore: Using mock login (Supabase not configured)')
          await this.mockLogin()
          return
        }
        
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
        console.log('🚪 AuthStore: Starting logout process...')
        await authService.signOut()
        this.clearUser()
        console.log('✅ AuthStore: Logout completed successfully')
      } catch (error) {
        console.error('❌ AuthStore: Logout failed:', error)
        this.error = error.message
        // Clear user data even if signOut fails
        this.clearUser()
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
        const user = await authService.getCurrentUser()
        if (user) {
          this.setUser(user)
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
        const profile = await authService.getCurrentProfile()
        this.profile = profile
        return profile
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update user profile
     */
    async updateProfile(updates) {
      this.loading = true
      this.error = null
      try {
        const updatedProfile = await authService.updateProfile(updates)
        this.profile = updatedProfile
        return updatedProfile
      } catch (error) {
        console.error('Failed to update profile:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update user avatar
     */
    async updateAvatar(avatarUrl) {
      return this.updateProfile({ avatar_url: avatarUrl })
    },

    /**
     * Update user theme preference
     */
    async updateTheme(theme) {
      return this.updateProfile({ theme })
    },

    /**
     * Refresh auth session
     */
    async refreshSession() {
      this.loading = true
      this.error = null
      try {
        // The AuthService doesn't have a refreshSession method, so we'll fetch user instead
        const user = await authService.getCurrentUser()
        if (user) {
          this.setUser(user)
        }
        return user
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
      
      // The AuthService already has a listener, but we can add our own
      // to sync with the store state
      return authService.setupAuthListener()
    }
  }
})
