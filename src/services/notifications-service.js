/**
 * Notifications Service
 * Handles all notification operations including fetch, read status, and real-time subscriptions
 */

import { supabase } from '../config/supabase'

export const notificationsService = {
  /**
   * Get user notifications with pagination
   * @param {Object} options - Query options
   * @param {number} options.limit - Max results (default: 20, max: 50)
   * @param {number} options.offset - Pagination offset (default: 0)
   * @param {boolean} options.unreadOnly - Filter unread only (default: false)
   * @returns {Promise<Object>} Notifications with pagination data
   */
  async getNotifications({ limit = 20, offset = 0, unreadOnly = false } = {}) {
    try {
      let query = supabase
        .from('notifications')
        .select(`
          *,
          actor:users!notifications_actor_id_fkey (
            id,
            username,
            avatar
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (unreadOnly) {
        query = query.eq('is_read', false)
      }
      
      const { data, error, count } = await query
      
      if (error) throw error
      
      // Get unread count
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
      
      return {
        success: true,
        data,
        pagination: {
          total: count,
          limit,
          offset,
          unread_count: unreadCount || 0
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise<Object>} Unread count
   */
  async getUnreadCount() {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
      
      if (error) throw error
      
      return {
        success: true,
        count: count || 0
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Success status
   */
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId
      })
      
      if (error) throw error
      
      return {
        success: true,
        message: 'Notification marked as read'
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Success status with updated count
   */
  async markAllAsRead() {
    try {
      const currentUser = supabase.auth.user()
      if (!currentUser) throw new Error('Not authenticated')
      
      const { data, error } = await supabase.rpc('mark_all_notifications_read', {
        p_user_id: currentUser.id
      })
      
      if (error) throw error
      
      return {
        success: true,
        updated_count: data
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Success status
   */
  async deleteNotification(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
      
      if (error) throw error
      
      return {
        success: true,
        message: 'Notification deleted'
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Subscribe to real-time notifications
   * @param {string} userId - User ID to subscribe to
   * @param {Function} callback - Callback function for new notifications
   * @returns {Object} Subscription object
   */
  subscribeToNotifications(userId, callback) {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
    
    return subscription
  },

  /**
   * Get notification details by reference ID
   * Useful for fetching outfit/item details when clicking notification
   * @param {string} type - Notification type
   * @param {string} referenceId - Reference ID
   * @returns {Promise<Object>} Notification details
   */
  async getNotificationDetails(type, referenceId) {
    try {
      let data, error
      
      switch (type) {
        case 'friend_outfit_suggestion':
          ({ data, error } = await supabase
            .from('friend_outfit_suggestions')
            .select(`
              *,
              suggester:users!friend_outfit_suggestions_suggester_id_fkey (
                id,
                username,
                avatar
              )
            `)
            .eq('id', referenceId)
            .single())
          break
        
        case 'outfit_like':
          ({ data, error } = await supabase
            .from('shared_outfits')
            .select('*')
            .eq('id', referenceId)
            .single())
          break
        
        case 'item_like':
          ({ data, error } = await supabase
            .from('clothes')
            .select('*')
            .eq('id', referenceId)
            .single())
          break
        
        default:
          throw new Error('Unknown notification type')
      }
      
      if (error) throw error
      
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Error fetching notification details:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}
