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
