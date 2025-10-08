/**
 * Likes Service
 * 
 * Handles all like/unlike operations for clothing items and outfits.
 * 
 * Features:
 * - Like/unlike individual items (item_likes table - creates notifications)
 * - Like/unlike shared outfits (shared_outfit_likes table - creates notifications)
 * - Get user's liked items
 * - Get likers for an item or outfit
 * - Get popular items from friends
 * - Like statistics
 * 
 * Privacy Rules:
 * - Users can only like items from friends
 * - Users cannot like their own items
 * - Likes respect item privacy settings
 * - Notifications created automatically via database triggers
 */

import { supabase } from '../config/supabase'

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
  },

  // ============================================================================
  // NEW: SHARED OUTFIT LIKES (with notifications)
  // ============================================================================

  /**
   * Like a shared outfit (creates notification)
   * @param {string} outfitId - Outfit ID
   * @returns {Promise<object>}
   */
  async likeSharedOutfit(outfitId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) throw new Error('Not authenticated')
      
      // Insert like (trigger will create notification)
      const { error: likeError } = await supabase
        .from('shared_outfit_likes')
        .insert({
          outfit_id: outfitId,
          user_id: user.id
        })
      
      if (likeError) {
        if (likeError.code === '23505') {
          throw new Error('Already liked this outfit')
        }
        throw likeError
      }
      
      // Get updated likes count
      const { data: outfit, error: outfitError } = await supabase
        .from('shared_outfits')
        .select('likes_count')
        .eq('id', outfitId)
        .single()
      
      if (outfitError) throw outfitError
      
      return {
        success: true,
        likes_count: outfit.likes_count
      }
    } catch (error) {
      console.error('Error liking shared outfit:', error)
      throw error
    }
  },

  /**
   * Unlike a shared outfit
   * @param {string} outfitId - Outfit ID
   * @returns {Promise<object>}
   */
  async unlikeSharedOutfit(outfitId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) throw new Error('Not authenticated')
      
      // Delete like
      const { error: deleteError } = await supabase
        .from('shared_outfit_likes')
        .delete()
        .eq('outfit_id', outfitId)
        .eq('user_id', user.id)
      
      if (deleteError) throw deleteError
      
      // Get updated likes count
      const { data: outfit, error: outfitError } = await supabase
        .from('shared_outfits')
        .select('likes_count')
        .eq('id', outfitId)
        .single()
      
      if (outfitError) throw outfitError
      
      return {
        success: true,
        likes_count: outfit.likes_count
      }
    } catch (error) {
      console.error('Error unliking shared outfit:', error)
      throw error
    }
  },

  /**
   * Get likers for a shared outfit
   * @param {string} outfitId - Outfit ID
   * @returns {Promise<Array>}
   */
  async getSharedOutfitLikers(outfitId) {
    try {
      const { data, error } = await supabase
        .from('shared_outfit_likes')
        .select(`
          created_at,
          user:users!shared_outfit_likes_user_id_fkey (
            id,
            username,
            avatar
          )
        `)
        .eq('outfit_id', outfitId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return data.map(like => ({
        user_id: like.user.id,
        username: like.user.username,
        avatar: like.user.avatar,
        liked_at: like.created_at
      }))
    } catch (error) {
      console.error('Error fetching shared outfit likers:', error)
      throw error
    }
  },

  /**
   * Check if current user liked a shared outfit
   * @param {string} outfitId - Outfit ID
   * @returns {Promise<boolean>}
   */
  async hasUserLikedSharedOutfit(outfitId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) return false
      
      const { data, error } = await supabase
        .from('shared_outfit_likes')
        .select('id')
        .eq('outfit_id', outfitId)
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (error) throw error
      return !!data
    } catch (error) {
      console.error('Error checking shared outfit like status:', error)
      return false
    }
  },

  // ============================================================================
  // NEW: CLOSET ITEM LIKES (with notifications)
  // ============================================================================

  /**
   * Like a friend's closet item (creates notification)
   * @param {string} itemId - Item ID
   * @returns {Promise<object>}
   */
  async likeClosetItem(itemId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) throw new Error('Not authenticated')
      
      // Insert like (trigger will create notification and update likes_count)
      const { error: likeError } = await supabase
        .from('item_likes')
        .insert({
          item_id: itemId,
          user_id: user.id
        })
      
      if (likeError) {
        if (likeError.code === '23505') {
          throw new Error('Already liked this item')
        }
        // Check for self-like or non-friend error
        if (likeError.code === '23514') {
          throw new Error('Cannot like your own items or non-friends\' items')
        }
        throw likeError
      }
      
      // Get updated likes count
      const { data: item, error: itemError } = await supabase
        .from('clothes')
        .select('likes_count')
        .eq('id', itemId)
        .single()
      
      if (itemError) throw itemError
      
      return {
        success: true,
        likes_count: item.likes_count
      }
    } catch (error) {
      console.error('Error liking closet item:', error)
      throw error
    }
  },

  /**
   * Unlike a closet item
   * @param {string} itemId - Item ID
   * @returns {Promise<object>}
   */
  async unlikeClosetItem(itemId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) throw new Error('Not authenticated')
      
      // Delete like (trigger will update likes_count)
      const { error: deleteError } = await supabase
        .from('item_likes')
        .delete()
        .eq('item_id', itemId)
        .eq('user_id', user.id)
      
      if (deleteError) throw deleteError
      
      // Get updated likes count
      const { data: item, error: itemError } = await supabase
        .from('clothes')
        .select('likes_count')
        .eq('id', itemId)
        .single()
      
      if (itemError) throw itemError
      
      return {
        success: true,
        likes_count: item.likes_count
      }
    } catch (error) {
      console.error('Error unliking closet item:', error)
      throw error
    }
  },

  /**
   * Get likers for a closet item
   * @param {string} itemId - Item ID
   * @returns {Promise<Array>}
   */
  async getClosetItemLikers(itemId) {
    try {
      const { data, error } = await supabase
        .from('item_likes')
        .select(`
          created_at,
          user:users!item_likes_user_id_fkey (
            id,
            username,
            avatar
          )
        `)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return data.map(like => ({
        user_id: like.user.id,
        username: like.user.username,
        avatar: like.user.avatar,
        liked_at: like.created_at
      }))
    } catch (error) {
      console.error('Error fetching closet item likers:', error)
      throw error
    }
  },

  /**
   * Check if current user liked a closet item
   * @param {string} itemId - Item ID
   * @returns {Promise<boolean>}
   */
  async hasUserLikedClosetItem(itemId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) return false
      
      const { data, error } = await supabase
        .from('item_likes')
        .select('id')
        .eq('item_id', itemId)
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (error) throw error
      return !!data
    } catch (error) {
      console.error('Error checking closet item like status:', error)
      return false
    }
  },

  /**
   * Toggle like on shared outfit
   * @param {string} outfitId - Outfit ID
   * @param {boolean} isLiked - Current like state
   * @returns {Promise<object>}
   */
  async toggleSharedOutfitLike(outfitId, isLiked) {
    try {
      if (isLiked) {
        return await this.unlikeSharedOutfit(outfitId)
      } else {
        return await this.likeSharedOutfit(outfitId)
      }
    } catch (error) {
      console.error('Error toggling shared outfit like:', error)
      throw error
    }
  },

  /**
   * Toggle like on closet item
   * @param {string} itemId - Item ID
   * @param {boolean} isLiked - Current like state
   * @returns {Promise<object>}
   */
  async toggleClosetItemLike(itemId, isLiked) {
    try {
      if (isLiked) {
        return await this.unlikeClosetItem(itemId)
      } else {
        return await this.likeClosetItem(itemId)
      }
    } catch (error) {
      console.error('Error toggling closet item like:', error)
      throw error
    }
  },

  // ============================================================================
  // ALIASES FOR BACKWARD COMPATIBILITY
  // ============================================================================

  /**
   * Alias for getPopularItemsFromFriends with min likes support
   * @deprecated Use getPopularItemsFromFriends instead
   */
  async getPopularItems(limit = 20, minLikes = 0) {
    try {
      const { data, error } = await supabase
        .rpc('get_popular_items', {
          limit_param: limit,
          min_likes_param: minLikes
        })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching popular items:', error)
      throw error
    }
  },

  /**
   * Alias for hasUserLikedItem (simpler implementation for backward compatibility)
   * @deprecated Use hasUserLikedItem instead
   */
  async hasLiked(itemId) {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) return false
      
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('item_id', itemId)
        .eq('user_id', user.id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return false // No rows returned
        throw error
      }
      return !!data
    } catch (error) {
      console.error('Error checking if item is liked:', error)
      return false
    }
  }
}

export default likesService
