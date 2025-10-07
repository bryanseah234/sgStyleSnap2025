/**
 * Notifications Store
 * Pinia store for managing notifications state with real-time updates
 */

import { defineStore } from 'pinia'
import { notificationsService } from '../services/notifications-service'
import { supabase } from '../config/supabase'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      limit: 20,
      offset: 0
    },
    subscription: null,
    initialized: false
  }),

  getters: {
    /**
     * Check if there are unread notifications
     */
    hasUnread: (state) => state.unreadCount > 0,
    
    /**
     * Get only unread notifications
     */
    unreadNotifications: (state) => 
      state.notifications.filter(n => !n.is_read),
    
    /**
     * Get only read notifications
     */
    readNotifications: (state) => 
      state.notifications.filter(n => n.is_read),
    
    /**
     * Get notifications by type
     */
    getNotificationsByType: (state) => (type) =>
      state.notifications.filter(n => n.type === type),
    
    /**
     * Get notification count by type
     */
    getCountByType: (state) => (type) =>
      state.notifications.filter(n => n.type === type && !n.is_read).length,
    
    /**
     * Get friend suggestion notifications count
     */
    friendSuggestionCount: (state) =>
      state.notifications.filter(n => n.type === 'friend_outfit_suggestion' && !n.is_read).length,
    
    /**
     * Get outfit like notifications count
     */
    outfitLikeCount: (state) =>
      state.notifications.filter(n => n.type === 'outfit_like' && !n.is_read).length,
    
    /**
     * Get item like notifications count
     */
    itemLikeCount: (state) =>
      state.notifications.filter(n => n.type === 'item_like' && !n.is_read).length
  },

  actions: {
    /**
     * Initialize notifications - fetch initial data and start real-time subscription
     */
    async initialize() {
      if (this.initialized) return
      
      await this.fetchNotifications()
      this.startRealtimeSubscription()
      this.initialized = true
    },

    /**
     * Fetch notifications with pagination
     * @param {Object} options - Query options
     */
    async fetchNotifications({ unreadOnly = false, loadMore = false } = {}) {
      this.loading = true
      this.error = null
      
      try {
        const offset = loadMore ? this.pagination.offset + this.pagination.limit : 0
        
        const result = await notificationsService.getNotifications({
          limit: this.pagination.limit,
          offset,
          unreadOnly
        })
        
        if (result.success) {
          if (loadMore) {
            this.notifications.push(...result.data)
          } else {
            this.notifications = result.data
          }
          
          this.pagination = result.pagination
          this.unreadCount = result.pagination.unread_count
        } else {
          this.error = result.error
        }
      } catch (error) {
        this.error = error.message
        console.error('Error fetching notifications:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch only unread count (lightweight)
     */
    async fetchUnreadCount() {
      const result = await notificationsService.getUnreadCount()
      
      if (result.success) {
        this.unreadCount = result.count
      }
    },

    /**
     * Mark notification as read
     * @param {string} notificationId - Notification ID
     */
    async markAsRead(notificationId) {
      const result = await notificationsService.markAsRead(notificationId)
      
      if (result.success) {
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification && !notification.is_read) {
          notification.is_read = true
          notification.read_at = new Date().toISOString()
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
      }
      
      return result
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
      const result = await notificationsService.markAllAsRead()
      
      if (result.success) {
        this.notifications.forEach(n => {
          if (!n.is_read) {
            n.is_read = true
            n.read_at = new Date().toISOString()
          }
        })
        this.unreadCount = 0
      }
      
      return result
    },

    /**
     * Delete notification
     * @param {string} notificationId - Notification ID
     */
    async deleteNotification(notificationId) {
      const result = await notificationsService.deleteNotification(notificationId)
      
      if (result.success) {
        const index = this.notifications.findIndex(n => n.id === notificationId)
        if (index !== -1) {
          const wasUnread = !this.notifications[index].is_read
          this.notifications.splice(index, 1)
          
          if (wasUnread) {
            this.unreadCount = Math.max(0, this.unreadCount - 1)
          }
          
          this.pagination.total = Math.max(0, this.pagination.total - 1)
        }
      }
      
      return result
    },

    /**
     * Start real-time subscription for new notifications
     */
    startRealtimeSubscription() {
      const currentUser = supabase.auth.user()
      if (!currentUser) return
      
      // Unsubscribe if already subscribed
      this.stopRealtimeSubscription()
      
      this.subscription = notificationsService.subscribeToNotifications(
        currentUser.id,
        async (payload) => {
          // Add new notification to the beginning
          const newNotification = payload.new
          
          // Fetch actor details
          if (newNotification.actor_id) {
            const { data: actor } = await supabase
              .from('users')
              .select('id, username, avatar')
              .eq('id', newNotification.actor_id)
              .single()
            
            if (actor) {
              newNotification.actor = actor
            }
          }
          
          this.notifications.unshift(newNotification)
          this.unreadCount++
          this.pagination.total++
          
          // Show browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New notification from StyleSnap', {
              body: this.getNotificationMessage(newNotification),
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-96x96.png',
              tag: newNotification.id
            })
          }
          
          // Play sound (optional)
          this.playNotificationSound()
        }
      )
    },

    /**
     * Stop real-time subscription
     */
    stopRealtimeSubscription() {
      if (this.subscription) {
        this.subscription.unsubscribe()
        this.subscription = null
      }
    },

    /**
     * Get user-friendly notification message
     * @param {Object} notification - Notification object
     * @returns {string} Message
     */
    getNotificationMessage(notification) {
      const actor = notification.actor?.username || 'Someone'
      
      switch (notification.type) {
        case 'friend_outfit_suggestion':
          return `${actor} suggested an outfit for you`
        case 'outfit_like':
          return `${actor} liked your outfit`
        case 'item_like':
          return `${actor} liked your item`
        default:
          return 'You have a new notification'
      }
    },

    /**
     * Play notification sound
     */
    playNotificationSound() {
      try {
        const audio = new Audio('/sounds/notification.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {
          // Ignore errors (user may have blocked audio)
        })
      } catch (error) {
        // Ignore sound errors
      }
    },

    /**
     * Request browser notification permission
     */
    async requestNotificationPermission() {
      if ('Notification' in window && Notification.permission === 'default') {
        return await Notification.requestPermission()
      }
      return Notification.permission
    },

    /**
     * Load more notifications (pagination)
     */
    async loadMore() {
      if (this.loading) return
      if (this.notifications.length >= this.pagination.total) return
      
      await this.fetchNotifications({ loadMore: true })
    },

    /**
     * Refresh notifications
     */
    async refresh() {
      await this.fetchNotifications()
    },

    /**
     * Reset store state
     */
    reset() {
      this.notifications = []
      this.unreadCount = 0
      this.loading = false
      this.error = null
      this.pagination = {
        total: 0,
        limit: 20,
        offset: 0
      }
      this.stopRealtimeSubscription()
      this.initialized = false
    },

    /**
     * Get notification icon by type
     * @param {string} type - Notification type
     * @returns {string} Icon name
     */
    getNotificationIcon(type) {
      switch (type) {
        case 'friend_outfit_suggestion':
          return 'SparklesIcon'
        case 'outfit_like':
          return 'HeartIcon'
        case 'item_like':
          return 'HeartIcon'
        default:
          return 'BellIcon'
      }
    },

    /**
     * Get notification color by type
     * @param {string} type - Notification type
     * @returns {string} Color class
     */
    getNotificationColor(type) {
      switch (type) {
        case 'friend_outfit_suggestion':
          return 'text-purple-500'
        case 'outfit_like':
          return 'text-red-500'
        case 'item_like':
          return 'text-pink-500'
        default:
          return 'text-gray-500'
      }
    }
  }
})
