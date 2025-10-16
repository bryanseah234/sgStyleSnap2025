import { supabase, handleSupabaseError } from '@/lib/supabase'

export class NotificationsService {
  async getNotifications(filters = {}) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      let query = supabase
        .from('notifications')
        .select(`
          *,
          actor:users!notifications_actor_id_fkey(id, name, username, avatar_url)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })

      if (filters.unread_only) {
        query = query.eq('is_read', false)
      }

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      handleSupabaseError(error, 'get notifications')
    }
  }

  async getUnreadCount() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('recipient_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      return { success: true, data: { count: data?.length || 0 } }
    } catch (error) {
      handleSupabaseError(error, 'get unread count')
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

      return { success: true, data }
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
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', user.id)
        .eq('is_read', false)
        .select()

      if (error) throw error

      return { success: true, data: { updated_count: data?.length || 0 } }
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

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'delete notification')
    }
  }

  // Friend outfit suggestions
  async getFriendOutfitSuggestions() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('friend_outfit_suggestions')
        .select(`
          *,
          suggester:users!friend_outfit_suggestions_suggester_id_fkey(id, name, username, avatar_url)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      handleSupabaseError(error, 'get friend outfit suggestions')
    }
  }

  async approveFriendOutfitSuggestion(suggestionId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .rpc('approve_friend_outfit_suggestion', {
          p_suggestion_id: suggestionId
        })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'approve friend outfit suggestion')
    }
  }

  async rejectFriendOutfitSuggestion(suggestionId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .rpc('reject_friend_outfit_suggestion', {
          p_suggestion_id: suggestionId
        })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'reject friend outfit suggestion')
    }
  }

  async createFriendOutfitSuggestion(ownerId, outfitItems, message = '') {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      if (user.id === ownerId) {
        throw new Error('Cannot suggest outfit to yourself')
      }

      const { data, error } = await supabase
        .from('friend_outfit_suggestions')
        .insert({
          owner_id: ownerId,
          suggester_id: user.id,
          outfit_items: outfitItems,
          message: message
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'create friend outfit suggestion')
    }
  }

  // Item likes
  async likeItem(itemId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('item_likes')
        .insert({
          item_id: itemId,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'like item')
    }
  }

  async unlikeItem(itemId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('item_likes')
        .delete()
        .eq('item_id', itemId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'unlike item')
    }
  }

  async getItemLikes(itemId) {
    try {
      const { data, error } = await supabase
        .from('item_likes')
        .select(`
          *,
          user:users!item_likes_user_id_fkey(id, name, username, avatar_url)
        `)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      handleSupabaseError(error, 'get item likes')
    }
  }

  async hasUserLikedItem(itemId) {
    try {
      const user = await supabase.auth.getUser()
      if (!user) return { success: true, data: false }

      const { data, error } = await supabase
        .from('item_likes')
        .select('id')
        .eq('item_id', itemId)
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return { success: true, data: !!data }
    } catch (error) {
      handleSupabaseError(error, 'check if user liked item')
    }
  }

  // Push notification preferences
  async getNotificationPreferences() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      // Return default preferences if none exist
      if (!data) {
        return {
          success: true,
          data: {
            push_enabled: true,
            friend_requests: true,
            friend_accepted: true,
            outfit_likes: true,
            outfit_comments: true,
            item_likes: true,
            friend_outfit_suggestions: true,
            daily_suggestions: false,
            weather_alerts: false,
            quota_warnings: true,
            quiet_hours_enabled: false,
            quiet_hours_start: '22:00:00',
            quiet_hours_end: '08:00:00'
          }
        }
      }

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'get notification preferences')
    }
  }

  async updateNotificationPreferences(preferences) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'update notification preferences')
    }
  }
}

export const notificationsService = new NotificationsService()
