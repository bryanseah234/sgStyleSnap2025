/**
 * Unit Tests for Notifications Store
 * Tests state management, real-time updates, and notification actions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationsStore } from '../../src/stores/notifications-store'
import { notificationsService } from '../../src/services/notifications-service'

// Mock services
vi.mock('../../src/services/notifications-service', () => ({
  notificationsService: {
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    subscribeToNotifications: vi.fn()
  }
}))

vi.mock('../../src/config/supabase', () => ({
  supabase: {
    auth: {
      user: vi.fn(() => ({ id: 'test-user-id' }))
    },
    from: vi.fn()
  }
}))

describe('Notifications Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useNotificationsStore()

      expect(store.notifications).toEqual([])
      expect(store.unreadCount).toBe(0)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.initialized).toBe(false)
    })
  })

  describe('Getters', () => {
    it('should compute hasUnread correctly', () => {
      const store = useNotificationsStore()

      expect(store.hasUnread).toBe(false)

      store.unreadCount = 5
      expect(store.hasUnread).toBe(true)
    })

    it('should filter unread notifications', () => {
      const store = useNotificationsStore()

      store.notifications = [
        { id: '1', is_read: false },
        { id: '2', is_read: true },
        { id: '3', is_read: false }
      ]

      expect(store.unreadNotifications).toHaveLength(2)
      expect(store.unreadNotifications[0].id).toBe('1')
      expect(store.unreadNotifications[1].id).toBe('3')
    })

    it('should filter read notifications', () => {
      const store = useNotificationsStore()

      store.notifications = [
        { id: '1', is_read: false },
        { id: '2', is_read: true },
        { id: '3', is_read: false }
      ]

      expect(store.readNotifications).toHaveLength(1)
      expect(store.readNotifications[0].id).toBe('2')
    })

    it('should filter notifications by type', () => {
      const store = useNotificationsStore()

      store.notifications = [
        { id: '1', type: 'friend_outfit_suggestion' },
        { id: '2', type: 'outfit_like' },
        { id: '3', type: 'friend_outfit_suggestion' }
      ]

      const suggestions = store.getNotificationsByType('friend_outfit_suggestion')
      expect(suggestions).toHaveLength(2)
    })

    it('should count unread notifications by type', () => {
      const store = useNotificationsStore()

      store.notifications = [
        { id: '1', type: 'outfit_like', is_read: false },
        { id: '2', type: 'outfit_like', is_read: true },
        { id: '3', type: 'outfit_like', is_read: false }
      ]

      expect(store.outfitLikeCount).toBe(2)
    })
  })

  describe('fetchNotifications', () => {
    it('should fetch notifications successfully', async () => {
      const store = useNotificationsStore()
      const mockNotifications = [
        { id: '1', is_read: false },
        { id: '2', is_read: true }
      ]

      notificationsService.getNotifications.mockResolvedValue({
        success: true,
        data: mockNotifications,
        pagination: {
          total: 2,
          limit: 20,
          offset: 0,
          unread_count: 1
        }
      })

      await store.fetchNotifications()

      expect(store.notifications).toEqual(mockNotifications)
      expect(store.unreadCount).toBe(1)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      const store = useNotificationsStore()

      notificationsService.getNotifications.mockResolvedValue({
        success: false,
        error: 'Database error'
      })

      await store.fetchNotifications()

      expect(store.error).toBe('Database error')
      expect(store.loading).toBe(false)
    })

    it('should append notifications when loading more', async () => {
      const store = useNotificationsStore()

      store.notifications = [{ id: '1' }]
      store.pagination = { total: 10, limit: 5, offset: 0 }

      notificationsService.getNotifications.mockResolvedValue({
        success: true,
        data: [{ id: '2' }, { id: '3' }],
        pagination: {
          total: 10,
          limit: 5,
          offset: 5,
          unread_count: 3
        }
      })

      await store.fetchNotifications({ loadMore: true })

      expect(store.notifications).toHaveLength(3)
      expect(store.notifications[0].id).toBe('1')
      expect(store.notifications[1].id).toBe('2')
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const store = useNotificationsStore()

      store.notifications = [
        { id: '1', is_read: false },
        { id: '2', is_read: false }
      ]
      store.unreadCount = 2

      notificationsService.markAsRead.mockResolvedValue({
        success: true
      })

      await store.markAsRead('1')

      expect(store.notifications[0].is_read).toBe(true)
      expect(store.unreadCount).toBe(1)
    })

    it('should handle mark as read errors', async () => {
      const store = useNotificationsStore()

      store.notifications = [{ id: '1', is_read: false }]

      notificationsService.markAsRead.mockResolvedValue({
        success: false,
        error: 'Permission denied'
      })

      const result = await store.markAsRead('1')

      expect(result.success).toBe(false)
      expect(store.notifications[0].is_read).toBe(false)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const store = useNotificationsStore()

      store.notifications = [
        { id: '1', is_read: false },
        { id: '2', is_read: false },
        { id: '3', is_read: true }
      ]
      store.unreadCount = 2

      notificationsService.markAllAsRead.mockResolvedValue({
        success: true,
        updated_count: 2
      })

      await store.markAllAsRead()

      expect(store.notifications.every(n => n.is_read)).toBe(true)
      expect(store.unreadCount).toBe(0)
    })
  })

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      const store = useNotificationsStore()

      store.notifications = [
        { id: '1', is_read: false },
        { id: '2', is_read: true }
      ]
      store.unreadCount = 1

      notificationsService.deleteNotification.mockResolvedValue({
        success: true
      })

      await store.deleteNotification('1')

      expect(store.notifications).toHaveLength(1)
      expect(store.notifications[0].id).toBe('2')
      expect(store.unreadCount).toBe(0)
    })

    it('should not decrement unreadCount for read notifications', async () => {
      const store = useNotificationsStore()

      store.notifications = [
        { id: '1', is_read: true },
        { id: '2', is_read: false }
      ]
      store.unreadCount = 1

      notificationsService.deleteNotification.mockResolvedValue({
        success: true
      })

      await store.deleteNotification('1')

      expect(store.unreadCount).toBe(1)
    })
  })

  describe('Real-time Subscription', () => {
    it('should start subscription', () => {
      const store = useNotificationsStore()
      const mockSubscription = { unsubscribe: vi.fn() }

      notificationsService.subscribeToNotifications.mockReturnValue(mockSubscription)

      store.startRealtimeSubscription()

      expect(notificationsService.subscribeToNotifications).toHaveBeenCalled()
      expect(store.subscription).toStrictEqual(mockSubscription)
    })

    it('should stop subscription', () => {
      const store = useNotificationsStore()
      const mockSubscription = { unsubscribe: vi.fn() }

      store.subscription = mockSubscription

      store.stopRealtimeSubscription()

      expect(mockSubscription.unsubscribe).toHaveBeenCalled()
      expect(store.subscription).toBeNull()
    })
  })

  describe('loadMore', () => {
    it('should not load more if already loading', async () => {
      const store = useNotificationsStore()

      store.loading = true

      await store.loadMore()

      expect(notificationsService.getNotifications).not.toHaveBeenCalled()
    })

    it('should not load more if all loaded', async () => {
      const store = useNotificationsStore()

      store.notifications = [{ id: '1' }, { id: '2' }]
      store.pagination = { total: 2, limit: 20, offset: 0 }

      await store.loadMore()

      expect(notificationsService.getNotifications).not.toHaveBeenCalled()
    })
  })

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const store = useNotificationsStore()
      const mockSubscription = { unsubscribe: vi.fn() }

      store.notifications = [{ id: '1' }]
      store.unreadCount = 1
      store.subscription = mockSubscription
      store.initialized = true

      store.reset()

      expect(store.notifications).toEqual([])
      expect(store.unreadCount).toBe(0)
      expect(store.subscription).toBeNull()
      expect(store.initialized).toBe(false)
      expect(mockSubscription.unsubscribe).toHaveBeenCalled()
    })
  })

  describe('Helper Methods', () => {
    it('should get notification message', () => {
      const store = useNotificationsStore()

      const message1 = store.getNotificationMessage({
        type: 'friend_outfit_suggestion',
        actor: { username: 'john' }
      })
      expect(message1).toContain('john')
      expect(message1).toContain('suggested')

      const message2 = store.getNotificationMessage({
        type: 'outfit_like',
        actor: { username: 'jane' }
      })
      expect(message2).toContain('jane')
      expect(message2).toContain('liked')
    })

    it('should get notification icon', () => {
      const store = useNotificationsStore()

      expect(store.getNotificationIcon('friend_outfit_suggestion')).toBe('SparklesIcon')
      expect(store.getNotificationIcon('outfit_like')).toBe('HeartIcon')
      expect(store.getNotificationIcon('unknown')).toBe('BellIcon')
    })

    it('should get notification color', () => {
      const store = useNotificationsStore()

      expect(store.getNotificationColor('friend_outfit_suggestion')).toContain('purple')
      expect(store.getNotificationColor('outfit_like')).toContain('red')
    })
  })
})
