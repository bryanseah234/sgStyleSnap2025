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
import { supabase } from '@/lib/supabase'
import { 
  storeUserSession, 
  clearActiveSession, 
  removeUserSession 
} from '@/services/session-service'
import { sanitizeEmail, sanitizeUser, sanitizeUrl, safeLog, safeError } from '@/utils/log-sanitizer'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    isAuthenticated: false,
    loading: true,
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
      safeLog('🔧 AuthStore: Setting user:', userData ? sanitizeEmail(userData.email) : 'null')
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
        // Check if Supabase is configured first
        if (!authService.isSupabaseConfigured) {
          console.log('🎭 AuthStore: Supabase not configured, skipping auth initialization')
          this.clearUser()
          return
        }

        // Check URL parameters for special cases
        const urlParams = new URLSearchParams(window.location.search)
        const hasAuthCode = urlParams.has('code') || urlParams.has('access_token')
        const isLogoutRedirect = urlParams.has('logout')
        const isCallbackRoute = window.location.pathname === '/auth/callback'
        
        // If this is a logout redirect, clear everything and don't auto-login
        if (isLogoutRedirect) {
          console.log('🚪 AuthStore: Logout redirect detected, clearing all sessions')
          clearActiveSession()
          this.clearUser()
          // Clean up URL parameters
          window.history.replaceState({}, document.title, '/login')
          return
        }
        
        // If this is an OAuth callback route, handle it specially
        if (isCallbackRoute) {
          safeLog('🔄 AuthStore: =============== OAuth Callback Route Detected ===============')
          safeLog('🔄 AuthStore: Current URL:', sanitizeUrl(window.location.href))
          safeLog('🔄 AuthStore: URL search params:', sanitizeUrl(window.location.search))
          safeLog('🔄 AuthStore: URL hash:', sanitizeUrl(window.location.hash))
          
          // Wait longer for Supabase to process the OAuth callback
          console.log('🔄 AuthStore: Waiting 3 seconds for Supabase to process OAuth callback...')
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          // Try to get the session directly from Supabase
          let session = null
          let user = null
          let attempts = 0
          const maxAttempts = 8
          
          while (!session && attempts < maxAttempts) {
            try {
              console.log(`🔄 AuthStore: ========== Session Attempt ${attempts + 1}/${maxAttempts} ==========`)
              
              // Get session directly from Supabase
              const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
              
              safeLog(`🔄 AuthStore: Session data:`, currentSession ? {
                user_id: currentSession.user?.id,
                user_email: currentSession.user?.email ? sanitizeEmail(currentSession.user.email) : null,
                access_token: currentSession.access_token ? '[REDACTED]' : 'missing',
                refresh_token: currentSession.refresh_token ? '[REDACTED]' : 'missing',
                expires_at: currentSession.expires_at
              } : 'null')
              
              if (sessionError) {
              safeLog(`🔄 AuthStore: Session error on attempt ${attempts + 1}:`, {
                message: sessionError.message,
                status: sessionError.status,
                name: sessionError.name
              })
              } else if (currentSession?.user) {
                session = currentSession
                user = currentSession.user
                safeLog('✅ AuthStore: Session found!')
                safeLog('✅ AuthStore: User authenticated:', {
                  id: user.id,
                  email: sanitizeEmail(user.email),
                  provider: user.app_metadata?.provider,
                  created_at: user.created_at
                })
                safeLog('✅ AuthStore: User metadata:', sanitizeUser(user).user_metadata)
                safeLog('✅ AuthStore: App metadata:', user.app_metadata)
                break
              } else {
                console.log(`🔄 AuthStore: No session found on attempt ${attempts + 1}`)
                console.log(`🔄 AuthStore: Session is null or missing user`)
              }
            } catch (error) {
              safeError(`🔄 AuthStore: Attempt ${attempts + 1} failed:`, error)
            }
            
            attempts++
            if (attempts < maxAttempts) {
              console.log(`🔄 AuthStore: Waiting 1 second before next attempt...`)
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
          
            // If still no session, try to refresh the page to complete OAuth
          if (!user && attempts >= maxAttempts) {
            console.log('🔄 AuthStore: No session found, trying to refresh page to complete OAuth...')
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
            return
          }
          
          if (user) {
            safeLog('✅ AuthStore: OAuth callback successful, setting user:', sanitizeEmail(user.email))
            this.setUser(user)
            
            // Try to fetch/create profile in the background
            console.log('✅ AuthStore: Attempting to fetch or create user profile...')
            try {
              // Import authService and Edge Function sync service
              const { authService } = await import('@/services/authService')
              const { edgeFunctionSyncService } = await import('@/services/edgeFunctionSyncService')
              
              // First, try to get the profile
              let profile = await authService.getCurrentProfile()
              
              if (profile) {
                safeLog('✅ AuthStore: Profile fetched successfully:', sanitizeEmail(profile.email))
                this.profile = profile
              } else {
                console.log('🔄 AuthStore: Profile not found, waiting for Edge Function to create it...')
                
                // Wait for Edge Function to create the profile
                const syncStatus = await edgeFunctionSyncService.waitForUserSync(user.id, 15000)
                
                if (syncStatus.success && syncStatus.synced) {
                  safeLog('✅ AuthStore: Profile created by Edge Function:', sanitizeEmail(syncStatus.user.email))
                  this.profile = syncStatus.user
                } else {
                  console.warn('⚠️ AuthStore: Edge Function did not create profile within timeout')
                  // Fallback: try to create profile manually
                  profile = await authService.createUserProfile(user)
                  if (profile) {
                    this.profile = profile
                  }
                }
              }
            } catch (profileError) {
              safeError('❌ AuthStore: Error fetching/creating profile:', profileError)
              // Don't fail authentication if profile fetch fails
              console.log('⚠️ AuthStore: Profile will be created on next page load')
            }
            
            console.log('✅ AuthStore: OAuth callback complete, user authenticated')
            
            return
          } else {
            console.log('❌ AuthStore: OAuth callback failed after all attempts, no session found')
            this.clearUser()
            return
          }
        }
        
        if (hasAuthCode && !isCallbackRoute) {
          console.log('🔄 AuthStore: OAuth callback detected on non-callback route, waiting for session...')
          // Wait a bit longer for OAuth session to be established
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // Use the existing AuthService to get current user
        // This method already handles "Auth session missing" gracefully
        const user = await authService.getCurrentUser()
        console.log('📦 AuthStore: User retrieved:', user ? 'Found' : 'Not found')

        if (user) {
          safeLog('✅ AuthStore: Setting user from session:', sanitizeEmail(user.email))
          this.setUser(user)
          
          // Fetch/create profile in background (don't block auth initialization)
          console.log('✅ AuthStore: Fetching user profile in background...')
          authService.getCurrentProfile().then(profile => {
            if (profile) {
              safeLog('✅ AuthStore: Profile loaded successfully:', sanitizeEmail(profile.email))
              this.profile = profile
            } else {
              console.warn('⚠️ AuthStore: Profile fetch returned null, will retry on next page')
            }
          }).catch(profileError => {
            console.warn('⚠️ AuthStore: Could not fetch user profile:', profileError.message)
            console.warn('⚠️ AuthStore: Profile will be created on next page load or interaction')
          })
        } else {
          console.log('ℹ️ AuthStore: No valid session found, user not authenticated')
          this.clearUser()
        }
      } catch (error) {
        console.error('❌ AuthStore: Failed to initialize auth:', error)
        
        const errorMessage = error?.message || String(error || '')
        
        // Check if it's a refresh token error
        if (errorMessage.toLowerCase().includes('refresh token') ||
            errorMessage.toLowerCase().includes('refresh_token')) {
          console.error('❌ AuthStore: Refresh token error detected, clearing invalid session...')
          
          // Clear the invalid session and redirect to login
          const { clearSupabaseSession } = await import('@/lib/supabase')
          clearSupabaseSession()
          return // Exit early as we're redirecting
        }
        
        // Handle all auth-related errors gracefully
        console.log('ℹ️ AuthStore: Auth initialization failed, user not authenticated')
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
      console.log('🔑 AuthStore: login() method called!')
      this.loading = true
      this.error = null
      try {
        console.log('🔑 AuthStore: Supabase configured:', authService.isSupabaseConfigured)
        
        // Check if we're in mock mode (no Supabase configured or forced mock mode)
        if (!authService.isSupabaseConfigured || import.meta.env.VITE_FORCE_MOCK_MODE === 'true') {
          console.log('🎭 AuthStore: Using mock login')
          await this.mockLogin()
          return
        }
        
        console.log('🔑 AuthStore: Using real Supabase OAuth...')
        await authService.signInWithGoogle()
        console.log('🔑 AuthStore: OAuth redirect initiated')
        // After redirect, initializeAuth will be called
      } catch (error) {
        console.error('🔑 AuthStore: Login failed:', error)
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
        
        // Clear user data first to prevent auto sign-in
        this.clearUser()
        
        await authService.signOut()
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
        console.log('🔧 AuthStore: Fetching user profile...')
        // Shorter timeout to prevent hanging
        const profilePromise = authService.getCurrentProfile()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
        )
        const profile = await Promise.race([profilePromise, timeoutPromise])
        console.log('🔧 AuthStore: Profile fetched successfully:', profile)
        this.profile = profile
        return profile
      } catch (error) {
        console.warn('⚠️ AuthStore: Profile fetch failed or timed out:', error.message)
        // Don't set error for timeout - just log it
        if (!error.message.includes('timeout')) {
          this.error = error.message
        }
        // Don't throw error - just return null
        return null
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

        safeLog('✅ AuthStore: Mock user created:', sanitizeEmail(mockUser.email))
        this.setUser(mockUser)

        // Simulate a small delay for realistic UX
        await new Promise(resolve => setTimeout(resolve, 500))

        safeLog('✅ AuthStore: Mock login successful')
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
