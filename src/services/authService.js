import { supabase, handleSupabaseError } from '@/lib/supabase'

export class AuthService {
  constructor() {
    this.currentUser = null
    this.currentProfile = null
    this.setupAuthListener()
  }

  setupAuthListener() {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.currentUser = session.user
        await this.loadUserProfile()
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null
        this.currentProfile = null
      }
    })
  }

  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/cabinet`
        }
      })
      
      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error, 'Google sign in')
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      this.currentUser = null
      this.currentProfile = null
      return true
    } catch (error) {
      handleSupabaseError(error, 'sign out')
    }
  }

  async getCurrentUser() {
    if (this.currentUser) return this.currentUser
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    
    this.currentUser = user
    return user
  }

  async getCurrentProfile() {
    if (this.currentProfile) return this.currentProfile
    
    const user = await this.getCurrentUser()
    if (!user) return null

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

  async createUserProfile(authUser) {
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

  async updateProfile(updates) {
    try {
      const user = await this.getCurrentUser()
      if (!user) throw new Error('Not authenticated')

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

  async updateAvatar(avatarUrl) {
    return this.updateProfile({ avatar_url: avatarUrl })
  }

  async updateTheme(theme) {
    return this.updateProfile({ theme })
  }

  async me() {
    return this.getCurrentProfile()
  }

  isAuthenticated() {
    return !!this.currentUser
  }

  async checkAuth() {
    const user = await this.getCurrentUser()
    return !!user
  }

  // Alias methods for compatibility
  async updateMe(updates) {
    return this.updateProfile(updates)
  }

  async logout() {
    return this.signOut()
  }
}

export const authService = new AuthService()
