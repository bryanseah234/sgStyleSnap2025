import { supabase, handleSupabaseError, isSupabaseConfigured } from '@/lib/supabase'

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
        .eq('recipient_id', user.id)
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
        .eq('recipient_id', user.id)
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
        .eq('recipient_id', user.id)
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
        .delete()
        .eq('id', notificationId)
        .eq('recipient_id', user.id)
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
        .eq('recipient_id', user.id)
        .eq('is_read', false)

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
          recipient_id: notificationData.recipient_id,
          actor_id: notificationData.actor_id,
          type: notificationData.type,
          reference_id: notificationData.reference_id,
          custom_message: notificationData.custom_message,
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
            filter: `recipient_id=eq.${user.id}`
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
      // Skip cleanup if Supabase is not configured
      if (!isSupabaseConfigured || !supabase) {
        console.log('⚠️ NotificationsService: Supabase not configured, skipping cleanup')
        return
      }

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      // Try to delete old notifications instead of updating removed_at
      const { error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', sevenDaysAgo.toISOString())

      if (error) {
        console.error('Error cleaning up old notifications:', error)
        // If deletion fails, try the function approach
        try {
          const { error: functionError } = await supabase.rpc('cleanup_expired_notifications')
          if (functionError) {
            console.error('Error running cleanup function:', functionError)
          }
        } catch (functionErr) {
          console.error('Cleanup function not available:', functionErr)
        }
      } else {
        console.log('✅ Successfully cleaned up old notifications')
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
        message: '{requester_name} sent you a friend request',
        icon: 'user-plus',
        action: 'View request'
      },
      friend_request_accepted: {
        title: 'Friend Request Accepted',
        message: '{accepter_name} accepted your friend request',
        icon: 'user-check',
        action: 'View profile'
      },
      outfit_shared: {
        title: 'Outfit Shared',
        message: '{sharer_name} shared an outfit with you',
        icon: 'share',
        action: 'View outfit'
      },
      friend_outfit_suggestion: {
        title: 'Outfit Suggestion',
        message: '{suggester_name} created an outfit suggestion using your items',
        icon: 'sparkles',
        action: 'View suggestion'
      },
      outfit_like: {
        title: 'Outfit Liked',
        message: '{liker_name} liked your outfit',
        icon: 'heart',
        action: 'View outfit'
      },
      item_like: {
        title: 'Item Liked',
        message: '{liker_name} liked your closet item',
        icon: 'heart',
        action: 'View item'
      },
      style_suggestion: {
        title: 'Style Suggestion',
        message: 'Check out this outfit suggestion based on your wardrobe',
        icon: 'sparkles',
        action: 'View suggestion'
      },
      weather_alert: {
        title: 'Weather Alert',
        message: 'Consider updating your outfit for today\'s weather',
        icon: 'cloud-rain',
        action: 'View suggestions'
      }
    }
  }

  // Helper method to create notification with template
  async createNotificationFromTemplate(type, recipientId, actorId = null, referenceId = null, customMessage = null) {
    const templates = NotificationsService.getNotificationTemplates()
    const template = templates[type]
    
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`)
    }

    return this.sendNotification({
      recipient_id: recipientId,
      actor_id: actorId,
      type,
      reference_id: referenceId,
      custom_message: customMessage
    })
  }

  // Friend request management
  async acceptFriendRequest(friendshipId) {
    try {
      const { data, error } = await supabase.rpc('accept_friend_request', {
        p_friendship_id: friendshipId
      })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'accept friend request')
      return { success: false, error }
    }
  }

  async rejectFriendRequest(friendshipId) {
    try {
      const { data, error } = await supabase.rpc('reject_friend_request', {
        p_friendship_id: friendshipId
      })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'reject friend request')
      return { success: false, error }
    }
  }

  // Outfit sharing
  async shareOutfitWithFriends(outfitId, recipientIds, message = null) {
    try {
      const { data, error } = await supabase.rpc('share_outfit_with_friends', {
        p_outfit_id: outfitId,
        p_recipient_ids: recipientIds,
        p_message: message
      })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'share outfit')
      return { success: false, error }
    }
  }

  async getSharedOutfits(limit = 20, offset = 0) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase.rpc('get_shared_outfits', {
        p_user_id: user.id,
        p_limit: limit,
        p_offset: offset
      })

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get shared outfits')
      return []
    }
  }

  async markOutfitShareViewed(shareId) {
    try {
      const { data, error } = await supabase.rpc('mark_outfit_share_viewed', {
        p_share_id: shareId
      })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'mark outfit share viewed')
      return { success: false, error }
    }
  }

  // Create friend outfit suggestion
  async createFriendOutfitSuggestion(friendId, outfitItems, message = null) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      console.log('NotificationsService: Creating friend outfit suggestion')
      console.log('Friend ID:', friendId)
      console.log('Outfit items:', outfitItems)
      console.log('Message:', message)

      // Create the friend outfit suggestion record
      // This will trigger a notification via database trigger
      const { data, error } = await supabase
        .from('friend_outfit_suggestions')
        .insert({
          owner_id: friendId, // The friend who owns the items
          suggester_id: user.id, // Current user who is creating the suggestion
          outfit_items: outfitItems, // Array of items with positions
          message: message,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('NotificationsService: Error creating friend outfit suggestion:', error)
        throw error
      }

      console.log('NotificationsService: Friend outfit suggestion created:', data)
      return { success: true, data }
    } catch (error) {
      console.error('NotificationsService: Error in createFriendOutfitSuggestion:', error)
      handleSupabaseError(error, 'create friend outfit suggestion')
      return { success: false, error }
    }
  }
}

export const notificationsService = new NotificationsService()