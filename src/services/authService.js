/**
 * StyleSnap - Authentication Service
 * 
 * Handles user authentication, profile management, and session control
 * using Supabase Auth with Google OAuth integration.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { supabase, handleSupabaseError, isSupabaseConfigured } from '@/lib/supabase'

/**
 * Authentication Service Class
 * 
 * Manages user authentication state, profile data, and provides
 * methods for signing in/out, profile management, and session control.
 */
export class AuthService {
  /**
   * Creates a new AuthService instance
   * 
   * Initializes the service with null user state and sets up
   * authentication state change listeners.
   */
  constructor() {
    this.currentUser = null
    this.currentProfile = null
    this.isSupabaseConfigured = isSupabaseConfigured
    this.isLoggingOut = false // Flag to track explicit logout
    this.setupAuthListener()
  }

  /**
   * Sets up authentication state change listener
   * 
   * Listens for authentication state changes and automatically
   * updates the current user and profile when users sign in/out.
   */
  setupAuthListener() {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('⚠️ AuthService: Supabase not configured, skipping auth listener setup')
      return
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.currentUser = session.user
        // Don't fetch profile during OAuth callback - it will be fetched later
        console.log('✅ AuthService: User signed in, profile will be fetched later')
      } else if (event === 'SIGNED_OUT') {
        // Only clear user data if this is an explicit logout, not a page reload
        if (this.isLoggingOut) {
          this.currentUser = null
          this.currentProfile = null
        }
      }
    })
  }

  /**
   * Signs in the user with Google OAuth
   * 
   * Initiates Google OAuth flow and redirects user to Google's
   * authentication page. After successful authentication, user
   * is redirected back to the cabinet page.
   * 
   * @returns {Promise<Object>} OAuth data from Supabase
   * @throws {Error} If OAuth flow fails
   */
  async signInWithGoogle() {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured. Cannot sign in with Google.')
    }

    try {
      console.log('🔑 AuthService: Initiating Google OAuth...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      if (error) {
        console.error('🔑 AuthService: OAuth error:', error)
        throw error
      }
      
      // Redirect to Google OAuth using proper navigation
      if (data?.url) {
        console.log('🔑 AuthService: Redirecting browser to:', data.url)
        // Use window.location.href instead of replace to preserve tab context
        window.location.href = data.url
        return data
      } else {
        throw new Error('No OAuth URL received from Supabase')
      }
    } catch (error) {
      console.error('🔑 AuthService: Sign in error:', error)
      handleSupabaseError(error, 'Google sign in')
    }
  }

  /**
   * Completely reset Supabase client to clear all cached data
   */
  resetSupabaseClient() {
    if (typeof window !== 'undefined' && window.supabase) {
      try {
        // Clear any global Supabase references
        delete window.supabase
        delete window.__supabase
      } catch (error) {
        console.log('Error clearing global Supabase references:', error)
      }
    }
  }

  /**
   * Signs out the current user
   * 
   * Ends the current user session and clears all stored
   * authentication data.
   * 
   * @returns {Promise<boolean>} True if sign out was successful
   * @throws {Error} If sign out fails
   */
  async signOut() {
    // Add overall timeout to prevent hanging
    const signOutTimeout = setTimeout(() => {
      console.warn('⚠️ AuthService: SignOut method timeout, forcing completion')
    }, 8000) // 8 second timeout
    
    try {
      console.log('🚪 AuthService: Starting sign out process...')
      
      // Set flag to indicate explicit logout
      this.isLoggingOut = true
      
      // Sign out from Supabase if configured (with timeout)
      if (isSupabaseConfigured && supabase) {
        console.log('🚪 AuthService: Signing out from Supabase...')
        try {
          // Add timeout to Supabase signOut call
          const signOutPromise = supabase.auth.signOut({ scope: 'global' })
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Supabase signOut timeout')), 5000)
          )
          
          const { error } = await Promise.race([signOutPromise, timeoutPromise])
          if (error) {
            console.warn('⚠️ AuthService: Supabase signOut error:', error)
            // Continue with local cleanup even if Supabase signOut fails
          } else {
            console.log('✅ AuthService: Supabase signOut successful')
          }
        } catch (error) {
          console.warn('⚠️ AuthService: Supabase signOut timeout or error:', error)
          // Continue with local cleanup even if Supabase signOut fails
        }
      }
      
      // Clear local state
      console.log('🚪 AuthService: Clearing local state...')
      this.currentUser = null
      this.currentProfile = null
      
      // Clear all session storage
      console.log('🚪 AuthService: Clearing session storage...')
      sessionStorage.clear()
      
      // Clear all localStorage (except theme preference)
      console.log('🚪 AuthService: Clearing localStorage...')
      const themePreference = localStorage.getItem('stylesnap-theme')
      localStorage.clear()
      if (themePreference) {
        localStorage.setItem('stylesnap-theme', themePreference)
      }
      
      // Reset Supabase client to clear any cached references
      this.resetSupabaseClient()
      
      // Clear all browser storage mechanisms (non-blocking)
      if (typeof window !== 'undefined') {
        // Clear IndexedDB (Supabase's primary storage) - non-blocking
        try {
          if ('indexedDB' in window) {
            // Clear all IndexedDB databases that might contain Supabase data
            const databases = [
              'supabase-auth-token', 
              'supabase', 
              'auth-token',
              'supabase-auth',
              'sb-auth-token',
              'supabase-session',
              'auth-session'
            ]
            databases.forEach(dbName => {
              try {
                indexedDB.deleteDatabase(dbName)
                console.log(`🗑️ Deleted IndexedDB database: ${dbName}`)
              } catch (e) {
                console.log(`Could not delete IndexedDB database ${dbName}:`, e)
              }
            })
            
            // Also try to clear any databases with dynamic names (non-blocking)
            try {
              const request = indexedDB.databases()
              if (request) {
                request.then(databases => {
                  databases.forEach(db => {
                    if (db.name.includes('supabase') || db.name.includes('auth') || db.name.includes('sb-')) {
                      try {
                        indexedDB.deleteDatabase(db.name)
                        console.log(`🗑️ Deleted dynamic IndexedDB database: ${db.name}`)
                      } catch (e) {
                        console.log(`Could not delete dynamic database ${db.name}:`, e)
                      }
                    }
                  })
                }).catch(error => {
                  console.log('Error getting IndexedDB databases:', error)
                })
              }
            } catch (error) {
              console.log('IndexedDB.databases() not supported:', error)
            }
          }
        } catch (error) {
          console.log('IndexedDB cleanup error:', error)
        }

        // Clear WebSQL (legacy storage)
        try {
          if ('openDatabase' in window) {
            const db = openDatabase('supabase', '', '', 0)
            if (db) {
              db.transaction(tx => {
                tx.executeSql('DROP TABLE IF EXISTS auth_tokens')
                tx.executeSql('DROP TABLE IF EXISTS sessions')
              })
            }
          }
        } catch (error) {
          console.log('WebSQL cleanup error:', error)
        }

        // Clear any Supabase-related cookies manually
        if (typeof document !== 'undefined') {
          // Clear common Supabase cookie patterns
          const cookiesToClear = [
            'sb-access-token',
            'sb-refresh-token',
            'supabase.auth.token',
            'supabase.auth.refresh_token',
            'supabase-auth-token',
            'sb-auth-token'
          ]
          
          cookiesToClear.forEach(cookieName => {
            // Clear for current domain
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            // Clear for current domain with secure flag
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;`
            // Clear for parent domain
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
            // Clear for subdomain
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
          })
          
          // Clear all cookies that might contain auth data
          const allCookies = document.cookie.split(';')
          allCookies.forEach(cookie => {
            const cookieName = cookie.split('=')[0].trim()
            if (cookieName.includes('supabase') || cookieName.includes('auth') || cookieName.includes('sb-')) {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
            }
          })
        }

        // Clear Service Worker caches (non-blocking)
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              if (cacheName.includes('supabase') || cacheName.includes('auth')) {
                caches.delete(cacheName)
              }
            })
          }).catch(error => {
            console.log('Cache cleanup error:', error)
          })
        }
      }
      
      console.log('✅ AuthService: User signed out successfully')
      return true
    } catch (error) {
      console.error('❌ AuthService: Sign out error:', error)
      // Even if there's an error, try to clear local state
      this.currentUser = null
      this.currentProfile = null
      sessionStorage.clear()
      localStorage.clear()
      
      handleSupabaseError(error, 'sign out')
    } finally {
      // Clear the timeout
      clearTimeout(signOutTimeout)
    }
  }

  /**
   * Gets the current authenticated user
   * 
   * Returns the current user from memory or fetches it from
   * Supabase if not already loaded.
   * 
   * @returns {Promise<Object|null>} Current user object or null if not authenticated
   * @throws {Error} If user fetch fails
   */
  async getCurrentUser() {
    if (this.currentUser) return this.currentUser
    
    if (!isSupabaseConfigured || !supabase) {
      console.warn('⚠️ AuthService: Supabase not configured, returning null user')
      return null
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        // Don't log as error for auth session missing - just return null
        if (error.message?.includes('Auth session missing') || 
            error.message?.includes('AuthSessionMissingError') ||
            error.message?.includes('Invalid JWT')) {
          console.log('ℹ️ AuthService: No valid session found')
          return null
        }
        console.error('❌ AuthService: Error getting user:', error)
        throw error
      }
      
      this.currentUser = user
      console.log('✅ AuthService: User retrieved successfully:', user ? user.email : 'null')
      return user
    } catch (error) {
      // Return null instead of throwing for auth-related errors
      if (error.message?.includes('Auth session missing') || 
          error.message?.includes('AuthSessionMissingError') ||
          error.message?.includes('Invalid JWT')) {
        console.log('ℹ️ AuthService: No valid session found')
        return null
      }
      console.error('❌ AuthService: Failed to get user:', error)
      throw error
    }
  }

  /**
   * Gets the current user's profile data
   * 
   * Returns the user's profile from the database. If no profile
   * exists, automatically creates one from the authentication data.
   * 
   * @returns {Promise<Object|null>} User profile object or null if not authenticated
   * @throws {Error} If profile fetch or creation fails
   */
  async getCurrentProfile() {
    console.log('🔧 AuthService: getCurrentProfile called')
    if (this.currentProfile) {
      console.log('🔧 AuthService: Returning cached profile')
      return this.currentProfile
    }
    
    console.log('🔧 AuthService: Getting current user...')
    const user = await this.getCurrentUser()
    if (!user) {
      console.log('🔧 AuthService: No user found, returning null')
      return null
    }

    if (!isSupabaseConfigured || !supabase) {
      console.warn('⚠️ AuthService: Supabase not configured, returning null profile')
      return null
    }

    try {
      console.log('🔧 AuthService: Querying database for user profile...')
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.log('🔧 AuthService: Database query error:', error)
        // If user profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('🔧 AuthService: User profile not found, creating new profile')
          return await this.createUserProfile(user)
        }
        throw error
      }

      console.log('🔧 AuthService: Profile fetched successfully:', data)
      console.log('🔧 AuthService: Avatar URL from database:', data.avatar_url)
      
      this.currentProfile = data
      return data
    } catch (error) {
      console.error('❌ AuthService: Error in getCurrentProfile:', error)
      handleSupabaseError(error, 'get user profile')
    }
  }

  /**
   * Creates a new user profile from authentication data
   * 
   * Automatically creates a user profile in the database when
   * a new user signs in for the first time.
   * 
   * @param {Object} authUser - User object from Supabase Auth
   * @returns {Promise<Object>} Created user profile
   * @throws {Error} If profile creation fails
   */
  async createUserProfile(authUser) {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('⚠️ AuthService: Supabase not configured, cannot create user profile')
      return null
    }

    try {
      const profileData = {
        id: authUser.id,
        email: authUser.email,
        username: authUser.email?.split('@')[0] || 'user',
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || '/avatars/default-1.png',
        google_id: authUser.user_metadata?.provider_id
      }
      
      console.log('🔧 AuthService: Creating user profile with data:', profileData)
      console.log('🔧 AuthService: Auth user metadata:', authUser.user_metadata)

      const { data, error } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single()

      if (error) throw error

      console.log('🔧 AuthService: Profile created successfully:', data)
      console.log('🔧 AuthService: Avatar URL in database:', data.avatar_url)
      
      this.currentProfile = data
      return data
    } catch (error) {
      handleSupabaseError(error, 'create user profile')
    }
  }

  /**
   * Updates the current user's profile
   * 
   * Updates the user's profile data in the database and
   * refreshes the cached profile.
   * 
   * @param {Object} updates - Profile data to update
   * @returns {Promise<Object>} Updated user profile
   * @throws {Error} If update fails or user not authenticated
   */
  async updateProfile(updates) {
    try {
      const user = await this.getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      if (!isSupabaseConfigured || !supabase) {
        console.warn('⚠️ AuthService: Supabase not configured, cannot update profile')
        return null
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      this.currentProfile = data
      return data
    } catch (error) {
      handleSupabaseError(error, 'update profile')
    }
  }

  /**
   * Updates the user's avatar URL
   * 
   * Convenience method to update only the avatar URL.
   * 
   * @param {string} avatarUrl - New avatar URL
   * @returns {Promise<Object>} Updated user profile
   */
  async updateAvatar(avatarUrl) {
    return this.updateProfile({ avatar_url: avatarUrl })
  }

  /**
   * Updates the user's theme preference
   * 
   * Convenience method to update only the theme preference.
   * 
   * @param {string} theme - Theme preference ('light' or 'dark')
   * @returns {Promise<Object>} Updated user profile
   */
  async updateTheme(theme) {
    return this.updateProfile({ theme })
  }

  /**
   * Gets current user profile (alias for getCurrentProfile)
   * 
   * @returns {Promise<Object|null>} Current user profile
   */
  async me() {
    return this.getCurrentProfile()
  }

  /**
   * Checks if user is currently authenticated
   * 
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser
  }

  /**
   * Checks authentication status by fetching user from Supabase
   * 
   * @returns {Promise<boolean>} True if user is authenticated
   */
  async checkAuth() {
    const user = await this.getCurrentUser()
    return !!user
  }

  // Alias methods for compatibility with different naming conventions
  /**
   * Updates current user profile (alias for updateProfile)
   * 
   * @param {Object} updates - Profile data to update
   * @returns {Promise<Object>} Updated user profile
   */
  async updateMe(updates) {
    return this.updateProfile(updates)
  }

  /**
   * Signs out user (alias for signOut)
   * 
   * @returns {Promise<boolean>} True if sign out was successful
   */
  async logout() {
    return this.signOut()
  }

  /**
   * Synchronizes current user's profile with Google profile data
   * 
   * Checks if the user's avatar_url in the database matches their
   * current Google profile photo and updates it if there's a mismatch.
   * This ensures the profile photo is always up-to-date.
   * 
   * @returns {Promise<Object>} Sync result with updated profile data
   * @throws {Error} If sync fails or user not authenticated
   */
  async syncProfileWithGoogle() {
    try {
      const user = await this.getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      if (!isSupabaseConfigured || !supabase) {
        console.warn('⚠️ AuthService: Supabase not configured, cannot sync profile')
        return null
      }

      console.log('🔄 AuthService: Syncing profile with Google data for user:', user.id)

      const { data, error } = await supabase.rpc('sync_user_profile_photo', {
        user_id: user.id
      })

      if (error) {
        console.error('❌ AuthService: Profile sync error:', error)
        throw error
      }

      if (data.success && data.profile_updated) {
        console.log('✅ AuthService: Profile synchronized successfully')
        // Update cached profile
        this.currentProfile = data.profile
      } else if (data.success) {
        console.log('ℹ️ AuthService: Profile already up-to-date')
      }

      return data
    } catch (error) {
      console.error('❌ AuthService: Error syncing profile with Google:', error)
      handleSupabaseError(error, 'sync profile with Google')
    }
  }

  /**
   * Gets the current Google profile data
   * 
   * Fetches comprehensive Google profile data from the auth.users table
   * including name, email, avatar, and other profile information.
   * 
   * @returns {Promise<Object|null>} Current Google profile data
   * @throws {Error} If fetch fails or user not authenticated
   */
  async getCurrentGoogleProfileData() {
    try {
      const user = await this.getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      if (!isSupabaseConfigured || !supabase) {
        console.warn('⚠️ AuthService: Supabase not configured, cannot get Google profile data')
        return null
      }

      const { data, error } = await supabase.rpc('get_current_google_profile_data', {
        user_id: user.id
      })

      if (error) {
        console.error('❌ AuthService: Error getting Google profile data:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('❌ AuthService: Error getting current Google profile data:', error)
      handleSupabaseError(error, 'get current Google profile data')
    }
  }

  /**
   * Gets the current Google profile photo URL
   * 
   * Fetches the current Google profile photo URL from the auth.users table
   * for comparison with the stored avatar_url in public.users.
   * 
   * @returns {Promise<string|null>} Current Google profile photo URL
   * @throws {Error} If fetch fails or user not authenticated
   */
  async getCurrentGoogleProfilePhoto() {
    try {
      const user = await this.getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      if (!isSupabaseConfigured || !supabase) {
        console.warn('⚠️ AuthService: Supabase not configured, cannot get Google profile photo')
        return null
      }

      const { data, error } = await supabase.rpc('get_current_google_profile_photo', {
        user_id: user.id
      })

      if (error) {
        console.error('❌ AuthService: Error getting Google profile photo:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('❌ AuthService: Error getting current Google profile photo:', error)
      handleSupabaseError(error, 'get current Google profile photo')
    }
  }

  /**
   * Checks if profile needs synchronization with Google
   * 
   * Compares the stored profile data with the current Google profile data
   * to determine if synchronization is needed for any field.
   * 
   * @returns {Promise<boolean>} True if profile needs sync
   * @throws {Error} If check fails or user not authenticated
   */
  async needsProfileSync() {
    try {
      const user = await this.getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      const currentProfile = await this.getCurrentProfile()
      if (!currentProfile) return false

      const googleData = await this.getCurrentGoogleProfileData()
      if (!googleData) return false

      // Check if any field needs updating
      const needsSync = (
        currentProfile.email !== googleData.email ||
        currentProfile.name !== googleData.name ||
        currentProfile.avatar_url !== googleData.avatar_url ||
        currentProfile.google_id !== googleData.google_id
      )
      
      console.log('🔍 AuthService: Profile sync check:', {
        stored: {
          email: currentProfile.email,
          name: currentProfile.name,
          avatar_url: currentProfile.avatar_url,
          google_id: currentProfile.google_id
        },
        google: {
          email: googleData.email,
          name: googleData.name,
          avatar_url: googleData.avatar_url,
          google_id: googleData.google_id
        },
        needsSync
      })

      return needsSync
    } catch (error) {
      console.error('❌ AuthService: Error checking profile sync status:', error)
      handleSupabaseError(error, 'check profile sync status')
      return false
    }
  }

  /**
   * Automatically syncs profile on authentication
   * 
   * This method should be called after successful authentication
   * to ensure the profile is always up-to-date with Google data.
   * 
   * @returns {Promise<Object|null>} Sync result or null if not needed
   */
  async autoSyncProfileOnAuth() {
    try {
      const needsSync = await this.needsProfileSync()
      
      if (needsSync) {
        console.log('🔄 AuthService: Auto-syncing profile after authentication')
        return await this.syncProfileWithGoogle()
      } else {
        console.log('ℹ️ AuthService: Profile already synchronized')
        return null
      }
    } catch (error) {
      console.error('❌ AuthService: Error in auto-sync:', error)
      // Don't throw error for auto-sync failures, just log them
      return null
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
