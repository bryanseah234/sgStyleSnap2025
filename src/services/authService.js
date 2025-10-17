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
        await this.getCurrentProfile()
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null
        this.currentProfile = null
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error, 'Google sign in')
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
    try {
      // Sign out from Supabase if configured
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      }
      
      // Clear local state
      this.currentUser = null
      this.currentProfile = null
      
      // Clear all session storage
      sessionStorage.clear()
      
      // Clear all localStorage (except theme preference)
      const themePreference = localStorage.getItem('stylesnap-theme')
      localStorage.clear()
      if (themePreference) {
        localStorage.setItem('stylesnap-theme', themePreference)
      }
      
      console.log('User signed out successfully')
      return true
    } catch (error) {
      console.error('Sign out error:', error)
      handleSupabaseError(error, 'sign out')
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
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    
    this.currentUser = user
    return user
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
    if (this.currentProfile) return this.currentProfile
    
    const user = await this.getCurrentUser()
    if (!user) return null

    if (!isSupabaseConfigured || !supabase) {
      console.warn('⚠️ AuthService: Supabase not configured, returning null profile')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        // If user profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          return await this.createUserProfile(user)
        }
        throw error
      }

      this.currentProfile = data
      return data
    } catch (error) {
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
        avatar_url: authUser.user_metadata?.avatar_url || '/avatars/default-1.png',
        google_id: authUser.user_metadata?.provider_id
      }

      const { data, error } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single()

      if (error) throw error

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
}

// Export singleton instance
export const authService = new AuthService()
