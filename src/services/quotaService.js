import { supabase, handleSupabaseError } from '@/lib/supabase'

/**
 * Quota Service - StyleSnap
 * 
 * Handles quota checking and warnings for user content limits.
 * Implements soft caps: 50 outfits, 50 items, 50 friends.
 */
export class QuotaService {
  /**
   * Check all quota warnings for the current user
   * 
   * @returns {Promise<Object>} Object containing quota status for all content types
   * @throws {Error} If user not authenticated or database query fails
   * 
   * @example
   * const quotaStatus = await quotaService.checkQuotaWarnings()
   * console.log('Outfit quota:', quotaStatus.outfits)
   * console.log('Item quota:', quotaStatus.items)
   * console.log('Friends quota:', quotaStatus.friends)
   */
  async checkQuotaWarnings() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .rpc('check_quota_warnings', { user_id: user.id })

      if (error) {
        console.error('QuotaService: Error checking quota warnings:', error)
        throw error
      }

      // Transform array result into object for easier access
      const quotaStatus = {
        outfits: null,
        items: null,
        friends: null
      }

      data.forEach(quota => {
        quotaStatus[quota.quota_type] = {
          current: quota.current_count,
          limit: quota.limit_count,
          warningThreshold: quota.warning_threshold,
          isWarning: quota.is_warning,
          isLimitReached: quota.is_limit_reached,
          percentage: Math.round((quota.current_count / quota.limit_count) * 100)
        }
      })

      return quotaStatus
    } catch (error) {
      console.error('QuotaService: Error in checkQuotaWarnings:', error)
      handleSupabaseError(error, 'check quota warnings')
    }
  }

  /**
   * Check if user can create more outfits
   * 
   * @returns {Promise<boolean>} True if user can create more outfits
   * @throws {Error} If user not authenticated or database query fails
   */
  async canCreateOutfit() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .rpc('can_create_outfit', { user_id: user.id })

      if (error) {
        console.error('QuotaService: Error checking outfit quota:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('QuotaService: Error in canCreateOutfit:', error)
      handleSupabaseError(error, 'check outfit quota')
    }
  }

  /**
   * Check if user can upload more items
   * 
   * @returns {Promise<boolean>} True if user can upload more items
   * @throws {Error} If user not authenticated or database query fails
   */
  async canUploadItem() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .rpc('can_upload_item', { user_id: user.id })

      if (error) {
        console.error('QuotaService: Error checking item quota:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('QuotaService: Error in canUploadItem:', error)
      handleSupabaseError(error, 'check item quota')
    }
  }

  /**
   * Check if user can add more friends
   * 
   * @returns {Promise<boolean>} True if user can add more friends
   * @throws {Error} If user not authenticated or database query fails
   */
  async canAddFriend() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .rpc('can_add_friend', { user_id: user.id })

      if (error) {
        console.error('QuotaService: Error checking friends quota:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('QuotaService: Error in canAddFriend:', error)
      handleSupabaseError(error, 'check friends quota')
    }
  }

  /**
   * Get quota counts for the current user
   * 
   * @returns {Promise<Object>} Object containing current counts for all content types
   * @throws {Error} If user not authenticated or database query fails
   */
  async getQuotaCounts() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const [outfitsResult, itemsResult, friendsResult] = await Promise.all([
        supabase.rpc('check_outfit_quota', { user_id: user.id }),
        supabase.rpc('check_item_quota', { user_id: user.id }),
        supabase.rpc('check_friends_quota', { user_id: user.id })
      ])

      if (outfitsResult.error) throw outfitsResult.error
      if (itemsResult.error) throw itemsResult.error
      if (friendsResult.error) throw friendsResult.error

      return {
        outfits: outfitsResult.data,
        items: itemsResult.data,
        friends: friendsResult.data
      }
    } catch (error) {
      console.error('QuotaService: Error in getQuotaCounts:', error)
      handleSupabaseError(error, 'get quota counts')
    }
  }

  /**
   * Format quota warning message for display
   * 
   * @param {Object} quotaData - Quota data from checkQuotaWarnings
   * @param {string} quotaType - Type of quota ('outfits', 'items', 'friends')
   * @returns {string|null} Formatted warning message or null if no warning
   */
  formatQuotaWarning(quotaData, quotaType) {
    if (!quotaData) return null

    const { current, limit, isWarning, isLimitReached, percentage } = quotaData

    if (isLimitReached) {
      const typeLabels = {
        outfits: 'outfits',
        items: 'items',
        friends: 'friends'
      }
      return `You've reached your limit of ${limit} ${typeLabels[quotaType]}. Please delete some ${typeLabels[quotaType]} to create new ones.`
    }

    if (isWarning) {
      const typeLabels = {
        outfits: 'outfits',
        items: 'items', 
        friends: 'friends'
      }
      return `You're approaching your limit of ${limit} ${typeLabels[quotaType]} (${current}/${limit}). Consider deleting some ${typeLabels[quotaType]} to make room for new ones.`
    }

    return null
  }
}

export const quotaService = new QuotaService()
