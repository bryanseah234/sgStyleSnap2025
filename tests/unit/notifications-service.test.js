/**
 * Unit Tests for Notifications Service
 * Tests notification operations, marking as read, and real-time subscriptions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { notificationsService } from '../../src/services/notifications-service'
import { supabase } from '../../src/config/supabase'

// Mock Supabase
vi.mock('../../src/config/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    channel: vi.fn(),
    auth: {
      user: vi.fn()
    }
  }
}))

describe('Notifications Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getNotifications', () => {
    it('should fetch notifications with pagination', async () => {
      const mockNotifications = [
        {
          id: '1',
          type: 'friend_outfit_suggestion',
          is_read: false,
          created_at: new Date().toISOString(),
          actor: { id: '1', username: 'john', avatar: 'avatar.jpg' }
        }
      ]

      const mockMainQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockNotifications,
          error: null,
          count: 1
        })
      }
      
      const mockUnreadQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          count: 1,
          error: null
        })
      }

      // First call for main query, second call for unread count
      supabase.from
        .mockReturnValueOnce(mockMainQuery)
        .mockReturnValueOnce(mockUnreadQuery)

      const result = await notificationsService.getNotifications({ limit: 20, offset: 0 })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockNotifications)
      expect(result.pagination.total).toBe(1)
    })

    it('should filter unread notifications only', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0
        })
      }

      supabase.from.mockReturnValue(mockQuery)

      await notificationsService.getNotifications({ unreadOnly: true })

      expect(mockQuery.eq).toHaveBeenCalledWith('is_read', false)
    })

    it('should handle errors gracefully', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        eq: vi.fn().mockRejectedValue(new Error('Database error'))
      }

      supabase.from.mockReturnValue(mockQuery)

      const result = await notificationsService.getNotifications()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          count: 5,
          error: null
        })
      }

      supabase.from.mockReturnValue(mockQuery)

      const result = await notificationsService.getUnreadCount()

      expect(result.success).toBe(true)
      expect(result.count).toBe(5)
    })

    it('should return 0 for no unread notifications', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          count: 0,
          error: null
        })
      }

      supabase.from.mockReturnValue(mockQuery)

      const result = await notificationsService.getUnreadCount()

      expect(result.success).toBe(true)
      expect(result.count).toBe(0)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      supabase.rpc.mockResolvedValue({
        error: null
      })

      const result = await notificationsService.markAsRead('notification-id')

      expect(result.success).toBe(true)
      expect(supabase.rpc).toHaveBeenCalledWith('mark_notification_read', {
        p_notification_id: 'notification-id'
      })
    })

    it('should handle errors when marking as read', async () => {
      supabase.rpc.mockResolvedValue({
        error: new Error('Failed to mark as read')
      })

      const result = await notificationsService.markAsRead('notification-id')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      supabase.auth.user.mockReturnValue({ id: 'user-id' })
      supabase.rpc.mockResolvedValue({
        data: 5,
        error: null
      })

      const result = await notificationsService.markAllAsRead()

      expect(result.success).toBe(true)
      expect(result.updated_count).toBe(5)
      expect(supabase.rpc).toHaveBeenCalledWith('mark_all_notifications_read', {
        p_user_id: 'user-id'
      })
    })

    it('should require authentication', async () => {
      supabase.auth.user.mockReturnValue(null)

      const result = await notificationsService.markAllAsRead()

      expect(result.success).toBe(false)
      expect(result.error).toContain('authenticated')
    })
  })

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error: null
        })
      }

      supabase.from.mockReturnValue(mockQuery)

      const result = await notificationsService.deleteNotification('notification-id')

      expect(result.success).toBe(true)
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'notification-id')
    })
  })

  describe('subscribeToNotifications', () => {
    it('should create real-time subscription', () => {
      const mockCallback = vi.fn()
      const mockSubscription = {
        unsubscribe: vi.fn()
      }
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue(mockSubscription)
      }

      supabase.channel.mockReturnValue(mockChannel)

      const subscription = notificationsService.subscribeToNotifications('user-id', mockCallback)

      expect(supabase.channel).toHaveBeenCalledWith('notifications')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'recipient_id=eq.user-id'
        },
        mockCallback
      )
      expect(mockChannel.subscribe).toHaveBeenCalled()
      expect(subscription).toBe(mockSubscription)
    })
  })

  describe('getNotificationDetails', () => {
    it('should fetch friend outfit suggestion details', async () => {
      const mockSuggestion = {
        id: '1',
        message: 'Try this!',
        suggester: { username: 'john' }
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockSuggestion,
          error: null
        })
      }

      supabase.from.mockReturnValue(mockQuery)

      const result = await notificationsService.getNotificationDetails(
        'friend_outfit_suggestion',
        '1'
      )

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSuggestion)
    })

    it('should fetch outfit like details', async () => {
      const mockOutfit = { id: '1', name: 'Summer Look' }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockOutfit,
          error: null
        })
      }

      supabase.from.mockReturnValue(mockQuery)

      const result = await notificationsService.getNotificationDetails('outfit_like', '1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockOutfit)
    })

    it('should fetch item like details', async () => {
      const mockItem = { id: '1', name: 'Blue Shirt' }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockItem,
          error: null
        })
      }

      supabase.from.mockReturnValue(mockQuery)

      const result = await notificationsService.getNotificationDetails('item_like', '1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockItem)
    })

    it('should reject unknown notification types', async () => {
      const result = await notificationsService.getNotificationDetails('unknown_type', '1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unknown notification type')
    })
  })
})
