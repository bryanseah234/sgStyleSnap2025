/**
 * Likes Service
 * 
 * Handles all like/unlike operations for clothing items.
 * 
 * Features:
 * - Like/unlike individual items
 * - Get user's liked items
 * - Get likers for an item
 * - Get popular items from friends
 * - Like statistics
 * 
 * Privacy Rules:
 * - Users can only like items from friends
 * - Users cannot like their own items
 * - Likes respect item privacy settings
 */

import { supabase } from './auth-service'

export const likesService = {
  /**
   * Like an item
   * @param {string} itemId - UUID of the item to like
   * @returns {Promise<{like: object, likesCount: number}>}
   */
  async likeItem(itemId) {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) throw new Error('Not authenticated')

      // Insert like (will fail if duplicate due to unique constraint)
      const { data: like, error: insertError } = await supabase
        .from('likes')
        .insert({ 
          item_id: itemId,
          user_id: user.id
        })
        .select()
        .single()
      
      // Handle duplicate like (already liked)
      if (insertError) {
        if (insertError.code === '23505') {
          // Already liked - fetch existing like
          const { data: existing } = await supabase
            .from('likes')
            .select()
            .eq('item_id', itemId)
            .eq('user_id', user.id)
            .single()
          
          // Get current likes count
          const { data: item } = await supabase
            .from('clothes')
            .select('likes_count')
            .eq('id', itemId)
            .single()
          
          return { 
            like: existing, 
            likesCount: item?.likes_count || 0,
            alreadyLiked: true
          }
        }
        
        // Handle self-like error
        if (insertError.message?.includes('cannot like their own items')) {
          throw new Error('You cannot like your own items')
        }
        
        throw insertError
      }
      
      // Get updated likes count
      const { data: item } = await supabase
        .from('clothes')
        .select('likes_count')
        .eq('id', itemId)
        .single()
      
      return { 
        like, 
        likesCount: item?.likes_count || 1
      }
    } catch (error) {
      console.error('Error liking item:', error)
      throw error
    }
  },

  /**
   * Unlike an item
   * @param {string} itemId - UUID of the item to unlike
   * @returns {Promise<{likesCount: number}>}
   */
  async unlikeItem(itemId) {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) throw new Error('Not authenticated')

      // Delete like
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('item_id', itemId)
        .eq('user_id', user.id)
      
      if (deleteError) throw deleteError
      
      // Get updated likes count
      const { data: item } = await supabase
        .from('clothes')
        .select('likes_count')
        .eq('id', itemId)
        .single()
      
      return { 
        likesCount: item?.likes_count || 0
      }
    } catch (error) {
      console.error('Error unliking item:', error)
      throw error
    }
  },

  /**
   * Toggle like state (smart function)
   * @param {string} itemId - UUID of the item
   * @param {boolean} isCurrentlyLiked - Current like state
   * @returns {Promise<{liked: boolean, likesCount: number}>}
   */
  async toggleLike(itemId, isCurrentlyLiked) {
    try {
      if (isCurrentlyLiked) {
        const { likesCount } = await this.unlikeItem(itemId)
        return { liked: false, likesCount }
      } else {
        const { likesCount } = await this.likeItem(itemId)
        return { liked: true, likesCount }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      throw error
    }
  },

  /**
   * Get user's liked items
   * @param {string} userId - UUID of the user
   * @param {number} limit - Max items to return
   * @param {number} offset - Pagination offset
   * @returns {Promise<Array>}
   */
  async getUserLikedItems(userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_liked_items', {
          user_id_param: userId,
          limit_param: limit,
          offset_param: offset
        })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user liked items:', error)
      throw error
    }
  },

  /**
   * Get likers for an item
   * @param {string} itemId - UUID of the item
   * @param {number} limit - Max likers to return
   * @returns {Promise<Array>}
   */
  async getItemLikers(itemId, limit = 50) {
    try {
      const { data, error } = await supabase
        .rpc('get_item_likers', {
          item_id_param: itemId,
          limit_param: limit
        })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching item likers:', error)
      throw error
    }
  },

  /**
   * Get popular items from friends
   * @param {number} limit - Max items to return
   * @returns {Promise<Array>}
   */
  async getPopularItemsFromFriends(limit = 20) {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .rpc('get_popular_items_from_friends', {
          user_id_param: user.id,
          limit_param: limit
        })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching popular items from friends:', error)
      throw error
    }
  },

  /**
   * Initialize likes for current user
   * Returns array of item IDs that the user has liked
   * @returns {Promise<Array<string>>}
   */
  async initializeUserLikes() {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) return []
      
      const { data, error } = await supabase
        .from('likes')
        .select('item_id')
        .eq('user_id', user.id)
      
      if (error) throw error
      return data?.map(like => like.item_id) || []
    } catch (error) {
      console.error('Error initializing user likes:', error)
      return []
    }
  },

  /**
   * Check if user has liked a specific item
   * @param {string} itemId - UUID of the item
   * @returns {Promise<boolean>}
   */
  async hasUserLikedItem(itemId) {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) return false
      
      const { data, error } = await supabase
        .rpc('has_user_liked_item', {
          user_id_param: user.id,
          item_id_param: itemId
        })
      
      if (error) throw error
      return data || false
    } catch (error) {
      console.error('Error checking if item is liked:', error)
      return false
    }
  },

  /**
   * Get like statistics for user's closet
   * @param {string} userId - UUID of the user
   * @returns {Promise<object>}
   */
  async getUserLikesStats(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_likes_stats', {
          user_id_param: userId
        })
      
      if (error) throw error
      return data?.[0] || {
        total_items: 0,
        total_likes_received: 0,
        avg_likes_per_item: 0,
        most_liked_item_id: null,
        most_liked_item_name: null,
        most_liked_item_likes: 0
      }
    } catch (error) {
      console.error('Error fetching user likes stats:', error)
      throw error
    }
  },

  /**
   * Get recent likes activity (for admin/analytics)
   * @param {number} limit - Max likes to return
   * @returns {Promise<Array>}
   */
  async getRecentLikes(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('recent_likes')
        .select('*')
        .limit(limit)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching recent likes:', error)
      throw error
    }
  },

  /**
   * Batch check which items are liked by current user
   * @param {Array<string>} itemIds - Array of item IDs
   * @returns {Promise<Set<string>>} - Set of liked item IDs
   */
  async batchCheckLiked(itemIds) {
    try {
      if (!itemIds || itemIds.length === 0) return new Set()
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) return new Set()
      
      const { data, error } = await supabase
        .from('likes')
        .select('item_id')
        .eq('user_id', user.id)
        .in('item_id', itemIds)
      
      if (error) throw error
      return new Set(data?.map(like => like.item_id) || [])
    } catch (error) {
      console.error('Error batch checking liked items:', error)
      return new Set()
    }
  }
}

export default likesService
