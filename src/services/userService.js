/**
 * StyleSnap - User Service
 * 
 * Handles user search and profile operations.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { supabase, handleSupabaseError } from '@/lib/supabase'

export class UserService {
  /**
   * Search users by username
   * 
   * @param {string} query - Username search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of matching users
   */
  async searchUsers(query, limit = 10) {
    try {
      console.log('🔧 UserService: Searching users with query:', query)
      
      if (!supabase) {
        console.error('❌ UserService: Supabase not configured')
        return []
      }

      if (!query || query.trim().length < 2) {
        console.log('🔧 UserService: Query too short, returning empty array')
        return []
      }

      const searchQuery = query.trim().toLowerCase()
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, avatar_url, created_at')
        .ilike('username', `%${searchQuery}%`)
        .is('removed_at', null)
        .order('username')
        .limit(limit)

      if (error) {
        console.error('❌ UserService: Search error:', error)
        throw error
      }

      console.log('✅ UserService: Found users:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ UserService: Error in searchUsers:', error)
      return []
    }
  }

  async searchUsersByUsername(query, limit = 10) {
    try {
      if (!supabase) return []
      // Require at least 4 characters for friend search (more forgiving/lazy search)
      if (!query || query.trim().length < 4) return []

      const searchQuery = query.trim().toLowerCase()
      
      // Fuzzy search: Search both username AND name fields for more forgiving results
      // This helps with misspellings and partial matches
      const { data: usernameData, error: usernameError } = await supabase
        .from('users')
        .select('id, username, name, avatar_url, created_at')
        .ilike('username', `%${searchQuery}%`)
        .is('removed_at', null)
        .limit(limit)
      
      const { data: nameData, error: nameError } = await supabase
        .from('users')
        .select('id, username, name, avatar_url, created_at')
        .ilike('name', `%${searchQuery}%`)
        .is('removed_at', null)
        .limit(limit)

      // Combine results and remove duplicates
      const allResults = [...(usernameData || []), ...(nameData || [])]
      const uniqueResults = allResults.filter((user, index, self) =>
        index === self.findIndex((u) => u.id === user.id)
      )

      if (usernameError) throw usernameError
      if (nameError) throw nameError
      
      return uniqueResults.slice(0, limit)
    } catch (error) {
      handleSupabaseError(error, 'search users by username')
      return []
    }
  }

  /**
   * Get user by username
   * 
   * @param {string} username - Username to search for
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserByUsername(username) {
    try {
      console.log('🔧 UserService: Getting user by username:', username)
      
      if (!supabase) {
        console.error('❌ UserService: Supabase not configured')
        return null
      }

      if (!username || username.trim().length === 0) {
        console.log('🔧 UserService: Username is empty')
        return null
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, avatar_url, created_at')
        .eq('username', username.trim())
        .is('removed_at', null)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('🔧 UserService: User not found')
          return null
        }
        console.error('❌ UserService: Database error:', error)
        throw error
      }

      console.log('✅ UserService: Found user:', data)
      return data
    } catch (error) {
      console.error('❌ UserService: Error in getUserByUsername:', error)
      return null
    }
  }

  /**
   * Get user by ID
   * 
   * @param {string} userId - User ID to search for
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserById(userId) {
    try {
      console.log('🔧 UserService: Getting user by ID:', userId)
      
      if (!supabase) {
        console.error('❌ UserService: Supabase not configured')
        return null
      }

      if (!userId) {
        console.log('🔧 UserService: User ID is empty')
        return null
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, avatar_url, created_at')
        .eq('id', userId)
        .is('removed_at', null)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('🔧 UserService: User not found')
          return null
        }
        console.error('❌ UserService: Database error:', error)
        throw error
      }

      console.log('✅ UserService: Found user:', data)
      return data
    } catch (error) {
      console.error('❌ UserService: Error in getUserById:', error)
      return null
    }
  }
}
