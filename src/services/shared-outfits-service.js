/**
 * Shared Outfits Service
 * Handles social outfit sharing functionality
 */

import { supabase } from '../config/supabase'

export default {
  /**
   * Share an outfit
   * @param {Object} outfitData - Outfit to share
   * @returns {Promise<Object>} Shared outfit
   */
  async shareOutfit(outfitData) {
    const { data, error } = await supabase
      .from('shared_outfits')
      .insert([outfitData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Get social feed of shared outfits
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Feed data
   */
  async getFeed(options = {}) {
    const { limit = 20, offset = 0, visibility } = options

    let query = supabase
      .from('shared_outfits')
      .select(
        `
        *,
        user:users!user_id (id, name, avatar_url)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (visibility) {
      query = query.eq('visibility', visibility)
    }

    const { data, error, count } = await query

    if (error) throw error

    return {
      outfits: data || [],
      total: count || 0
    }
  },

  /**
   * Get specific shared outfit
   * @param {string} id - Outfit ID
   * @returns {Promise<Object>} Shared outfit
   */
  async getSharedOutfit(id) {
    const { data, error } = await supabase
      .from('shared_outfits')
      .select(
        `
        *,
        user:users!user_id (id, name, avatar_url)
      `
      )
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update shared outfit
   * @param {string} id - Outfit ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated outfit
   */
  async updateSharedOutfit(id, updates) {
    const { data, error } = await supabase
      .from('shared_outfits')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Delete shared outfit
   * @param {string} id - Outfit ID
   * @returns {Promise<void>}
   */
  async deleteSharedOutfit(id) {
    const { error } = await supabase.from('shared_outfits').delete().eq('id', id)

    if (error) throw error
  },

  /**
   * Like a shared outfit
   * @param {string} outfitId - Outfit ID
   * @returns {Promise<Object>} Like result
   */
  async likeOutfit(outfitId) {
    const { data: user } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('shared_outfit_likes')
      .insert([
        {
          outfit_id: outfitId,
          user_id: user.user.id
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Unlike a shared outfit
   * @param {string} outfitId - Outfit ID
   * @returns {Promise<void>}
   */
  async unlikeOutfit(outfitId) {
    const { data: user } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('shared_outfit_likes')
      .delete()
      .eq('outfit_id', outfitId)
      .eq('user_id', user.user.id)

    if (error) throw error
  },

  /**
   * Check if user has liked outfit
   * @param {string} outfitId - Outfit ID
   * @returns {Promise<boolean>} Is liked
   */
  async hasLiked(outfitId) {
    const { data: user } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('shared_outfit_likes')
      .select('id')
      .eq('outfit_id', outfitId)
      .eq('user_id', user.user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  },

  /**
   * Add comment to shared outfit
   * @param {string} outfitId - Outfit ID
   * @param {string} commentText - Comment text
   * @returns {Promise<Object>} Created comment
   */
  async addComment(outfitId, commentText) {
    const { data: user } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('outfit_comments')
      .insert([
        {
          outfit_id: outfitId,
          user_id: user.user.id,
          comment_text: commentText
        }
      ])
      .select(
        `
        *,
        user:users!user_id (id, name, avatar_url)
      `
      )
      .single()

    if (error) throw error
    return data
  },

  /**
   * Get comments for outfit
   * @param {string} outfitId - Outfit ID
   * @param {number} limit - Max number of comments (default: 100)
   * @returns {Promise<Array>} Comments
   */
  async getComments(outfitId, limit = 100) {
    const { data, error } = await supabase
      .from('outfit_comments')
      .select(
        `
        *,
        user:users!user_id (id, name, avatar_url)
      `
      )
      .eq('outfit_id', outfitId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  /**
   * Update comment
   * @param {string} commentId - Comment ID
   * @param {string} commentText - New text
   * @returns {Promise<Object>} Updated comment
   */
  async updateComment(commentId, commentText) {
    const { data, error } = await supabase
      .from('outfit_comments')
      .update({ comment_text: commentText })
      .eq('id', commentId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Delete comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<void>}
   */
  async deleteComment(commentId) {
    const { error } = await supabase.from('outfit_comments').delete().eq('id', commentId)

    if (error) throw error
  }
}
