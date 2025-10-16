import { supabase, handleSupabaseError } from '@/lib/supabase'

export class NotificationsService {
  constructor() {
    this.subscriptions = new Map()
    this.setupRealtimeSubscription()
  }

  async getNotifications(filters = {}) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('removed_at', null)
        .order('created_at', { ascending: false })

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.unread_only) {
        query = query.eq('is_read', false)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get notifications')
    }
  }

  async markAsRead(notificationId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error, 'mark notification as read')
    }
  }

  async markAllAsRead() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .select()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error, 'mark all notifications as read')
    }
  }

  async deleteNotification(notificationId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('notifications')
        .update({ removed_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error, 'delete notification')
    }
  }

  async getUnreadCount() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .eq('removed_at', null)

      if (error) throw error
      return count || 0
    } catch (error) {
      handleSupabaseError(error, 'get unread count')
    }
  }

  async sendNotification(notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notificationData.user_id,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data || {},
          is_read: false
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error, 'send notification')
    }
  }

  subscribe(callback) {
    try {
      const { data: { user }, error: userError } = supabase.auth.getUser()
      if (userError || !user) return null

      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            callback(payload)
          }
        )
        .subscribe()

      this.subscriptions.set(callback, subscription)
      return subscription
    } catch (error) {
      console.error('Error setting up notification subscription:', error)
      return null
    }
  }

  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }

  setupRealtimeSubscription() {
    // Set up automatic cleanup for old notifications (7 days)
    this.scheduleNotificationCleanup()
  }

  async scheduleNotificationCleanup() {
    try {
      // Run cleanup every hour
      setInterval(async () => {
        await this.cleanupOldNotifications()
      }, 60 * 60 * 1000) // 1 hour

      // Run initial cleanup
      await this.cleanupOldNotifications()
    } catch (error) {
      console.error('Error setting up notification cleanup:', error)
    }
  }

  async cleanupOldNotifications() {
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { error } = await supabase
        .from('notifications')
        .update({ removed_at: new Date().toISOString() })
        .lt('created_at', sevenDaysAgo.toISOString())
        .is('removed_at', null)

      if (error) {
        console.error('Error cleaning up old notifications:', error)
      }
    } catch (error) {
      console.error('Error in notification cleanup:', error)
    }
  }

  // Notification types and templates
  static getNotificationTemplates() {
    return {
      friend_request: {
        title: 'New Friend Request',
        message: 'You have a new friend request from {requester_name}',
        icon: 'user-plus'
      },
      friend_request_accepted: {
        title: 'Friend Request Accepted',
        message: '{accepter_name} accepted your friend request',
        icon: 'user-check'
      },
      outfit_shared: {
        title: 'Outfit Shared',
        message: '{sharer_name} shared an outfit with you',
        icon: 'share'
      },
      outfit_liked: {
        title: 'Outfit Liked',
        message: '{liker_name} liked your outfit',
        icon: 'heart'
      },
      new_follower: {
        title: 'New Follower',
        message: '{follower_name} started following you',
        icon: 'user-plus'
      },
      style_suggestion: {
        title: 'Style Suggestion',
        message: 'Check out this outfit suggestion based on your wardrobe',
        icon: 'sparkles'
      },
      weather_alert: {
        title: 'Weather Alert',
        message: 'Consider updating your outfit for today\'s weather',
        icon: 'cloud-rain'
      }
    }
  }

  // Helper method to create notification with template
  async createNotificationFromTemplate(type, userId, data = {}) {
    const templates = NotificationsService.getNotificationTemplates()
    const template = templates[type]
    
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`)
    }

    let message = template.message
    Object.keys(data).forEach(key => {
      message = message.replace(`{${key}}`, data[key])
    })

    return this.sendNotification({
      user_id: userId,
      type,
      title: template.title,
      message,
      data
    })
  }
}

export const notificationsService = new NotificationsService()