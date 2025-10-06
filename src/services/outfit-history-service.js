/**
 * Outfit History Service
 * Handles API calls for outfit history tracking
 */

import { supabase } from './auth-service'

export default {
  /**
   * Record a worn outfit
   * @param {Object} outfitData - Outfit details
   * @returns {Promise<Object>} Created history entry
   */
  async recordOutfit(outfitData) {
    const { data, error } = await supabase
      .from('outfit_history')
      .insert([outfitData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Get user's outfit history
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} Outfit history
   */
  async getHistory(filters = {}) {
    let query = supabase
      .from('outfit_history')
      .select('*')
      .order('worn_date', { ascending: false })
    
    if (filters.occasion) {
      query = query.eq('occasion', filters.occasion)
    }
    
    if (filters.rating_min) {
      query = query.gte('rating', filters.rating_min)
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  /**
   * Get specific outfit history entry
   * @param {string} id - History entry ID
   * @returns {Promise<Object>} History entry
   */
  async getHistoryEntry(id) {
    const { data, error } = await supabase
      .from('outfit_history')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Update outfit history entry
   * @param {string} id - History entry ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated entry
   */
  async updateHistory(id, updates) {
    const { data, error } = await supabase
      .from('outfit_history')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Delete outfit history entry
   * @param {string} id - History entry ID
   * @returns {Promise<void>}
   */
  async deleteHistory(id) {
    const { error } = await supabase
      .from('outfit_history')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  /**
   * Get user's outfit statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStats() {
    const { data: user } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .rpc('get_user_outfit_stats', {
        p_user_id: user.user.id
      })
    
    if (error) throw error
    return data[0] || {}
  },

  /**
   * Get most worn items
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Most worn items
   */
  async getMostWornItems(limit = 10) {
    const { data: user } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .rpc('get_most_worn_items', {
        p_user_id: user.user.id,
        p_limit: limit
      })
    
    if (error) throw error
    return data || []
  }
}
