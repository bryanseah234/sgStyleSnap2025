/**
 * Friend Outfit Suggestions Service
 * Handles friend-created outfit suggestions with approval workflow
 */

import { supabase } from '../config/supabase'

export const friendSuggestionsService = {
  /**
   * Create outfit suggestion for friend
   * @param {Object} params - Suggestion parameters
   * @param {string} params.friendId - Friend's user ID
   * @param {Array} params.outfitItems - Array of outfit items from friend's closet
   * @param {string} params.message - Optional message (max 500 chars)
   * @returns {Promise<Object>} Created suggestion
   */
  async createSuggestion({ friendId, outfitItems, message }) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user
      if (!currentUser) throw new Error('Not authenticated')
      
      // Validate outfit items belong to friend's closet
      const { data: items, error: itemsError } = await supabase
        .from('clothes')
        .select('id, owner_id')
        .eq('owner_id', friendId)
        .in('id', outfitItems.map(item => item.clothes_id))
      
      if (itemsError) throw itemsError
      
      if (items.length !== outfitItems.length) {
        throw new Error('Some items do not belong to friend\'s closet')
      }
      
      // Verify friendship exists
      const { data: friendship, error: friendError } = await supabase
        .from('friends')
        .select('id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .or(`requester_id.eq.${friendId},receiver_id.eq.${friendId}`)
        .single()
      
      if (friendError || !friendship) {
        throw new Error('You must be friends to create suggestions')
      }
      
      // Create suggestion
      const { data, error } = await supabase
        .from('friend_outfit_suggestions')
        .insert({
          owner_id: friendId,
          suggester_id: currentUser.id,
          outfit_items: outfitItems,
          message: message || null
        })
        .select()
        .single()
      
      if (error) throw error
      
      return {
        success: true,
        suggestion: data
      }
    } catch (error) {
      console.error('Error creating suggestion:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Get suggestions I received (pending only)
   * @param {Object} options - Query options
   * @param {number} options.limit - Max results (default: 20)
   * @param {number} options.offset - Pagination offset (default: 0)
   * @returns {Promise<Object>} Received suggestions
   */
  async getReceivedSuggestions({ limit = 20, offset = 0 } = {}) {
    try {
      const { data, error, count } = await supabase
        .from('friend_outfit_suggestions')
        .select(`
          *,
          suggester:users!friend_outfit_suggestions_suggester_id_fkey (
            id,
            username,
            avatar
          )
        `, { count: 'exact' })
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (error) throw error
      
      return {
        success: true,
        suggestions: data,
        total: count
      }
    } catch (error) {
      console.error('Error fetching received suggestions:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Get all suggestions I received (including approved/rejected)
   * @param {Object} options - Query options
   * @param {number} options.limit - Max results (default: 20)
   * @param {number} options.offset - Pagination offset (default: 0)
   * @param {string} options.status - Filter by status (optional)
   * @returns {Promise<Object>} Received suggestions
   */
  async getAllReceivedSuggestions({ limit = 20, offset = 0, status = null } = {}) {
    try {
      let query = supabase
        .from('friend_outfit_suggestions')
        .select(`
          *,
          suggester:users!friend_outfit_suggestions_suggester_id_fkey (
            id,
            username,
            avatar
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (status) {
        query = query.eq('status', status)
      }
      
      const { data, error, count } = await query
      
      if (error) throw error
      
      return {
        success: true,
        suggestions: data,
        total: count
      }
    } catch (error) {
      console.error('Error fetching all received suggestions:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Get suggestions I sent
   * @param {Object} options - Query options
   * @param {number} options.limit - Max results (default: 20)
   * @param {number} options.offset - Pagination offset (default: 0)
   * @returns {Promise<Object>} Sent suggestions
   */
  async getSentSuggestions({ limit = 20, offset = 0 } = {}) {
    try {
      const { data, error, count } = await supabase
        .from('friend_outfit_suggestions')
        .select(`
          *,
          owner:users!friend_outfit_suggestions_owner_id_fkey (
            id,
            username,
            avatar
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (error) throw error
      
      return {
        success: true,
        suggestions: data,
        total: count
      }
    } catch (error) {
      console.error('Error fetching sent suggestions:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Approve suggestion and add outfit to closet
   * @param {string} suggestionId - Suggestion ID
   * @returns {Promise<Object>} Created outfit ID
   */
  async approveSuggestion(suggestionId) {
    try {
      const { data, error } = await supabase.rpc('approve_friend_outfit_suggestion', {
        p_suggestion_id: suggestionId
      })
      
      if (error) throw error
      
      return {
        success: true,
        outfit_id: data,
        message: 'Outfit added to your closet!'
      }
    } catch (error) {
      console.error('Error approving suggestion:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Reject suggestion
   * @param {string} suggestionId - Suggestion ID
   * @returns {Promise<Object>} Success status
   */
  async rejectSuggestion(suggestionId) {
    try {
      const { error } = await supabase.rpc('reject_friend_outfit_suggestion', {
        p_suggestion_id: suggestionId
      })
      
      if (error) throw error
      
      return {
        success: true,
        message: 'Suggestion rejected'
      }
    } catch (error) {
      console.error('Error rejecting suggestion:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Get suggestion details
   * @param {string} suggestionId - Suggestion ID
   * @returns {Promise<Object>} Suggestion details
   */
  async getSuggestion(suggestionId) {
    try {
      const { data, error } = await supabase
        .from('friend_outfit_suggestions')
        .select(`
          *,
          suggester:users!friend_outfit_suggestions_suggester_id_fkey (
            id,
            username,
            avatar
          ),
          owner:users!friend_outfit_suggestions_owner_id_fkey (
            id,
            username,
            avatar
          )
        `)
        .eq('id', suggestionId)
        .single()
      
      if (error) throw error
      
      return {
        success: true,
        suggestion: data
      }
    } catch (error) {
      console.error('Error fetching suggestion:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Delete suggestion (only if pending)
   * @param {string} suggestionId - Suggestion ID
   * @returns {Promise<Object>} Success status
   */
  async deleteSuggestion(suggestionId) {
    try {
      const { error } = await supabase
        .from('friend_outfit_suggestions')
        .delete()
        .eq('id', suggestionId)
        .eq('status', 'pending')
      
      if (error) throw error
      
      return {
        success: true,
        message: 'Suggestion deleted'
      }
    } catch (error) {
      console.error('Error deleting suggestion:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Get friend's closet items for creating suggestion
   * @param {string} friendId - Friend's user ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Friend's closet items
   */
  async getFriendClosetItems(friendId, filters = {}) {
    try {
      let query = supabase
        .from('clothes')
        .select('*')
        .eq('owner_id', friendId)
        .order('created_at', { ascending: false })
      
      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return {
        success: true,
        items: data
      }
    } catch (error) {
      console.error('Error fetching friend closet items:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}
