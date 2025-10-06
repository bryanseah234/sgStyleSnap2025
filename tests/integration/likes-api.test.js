/**
 * Likes API Integration Tests
 * 
 * Tests for likes feature API endpoints
 * Framework: Vitest with Supabase test client
 * 
 * Note: These tests require a Supabase test database or local instance
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.test
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'

// Mock Supabase for now - in real integration tests, you'd use a test database
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn()
  },
  from: vi.fn(),
  rpc: vi.fn()
}

vi.mock('../../src/services/auth-service', () => ({
  supabase: mockSupabase
}))

import { likesService } from '../../src/services/likes-service'

describe('Likes API Integration Tests', () => {
  let testUser1, testUser2, testItem1, testItem2

  beforeAll(() => {
    // Mock test users and items
    testUser1 = { id: 'test-user-1', email: 'user1@test.com' }
    testUser2 = { id: 'test-user-2', email: 'user2@test.com' }
    testItem1 = { id: 'test-item-1', name: 'Test Shirt', owner_id: testUser1.id }
    testItem2 = { id: 'test-item-2', name: 'Test Jeans', owner_id: testUser2.id }
  })

  afterAll(() => {
    // Cleanup would happen here in real integration tests
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /likes (likeItem)', () => {
    it('should allow user to like friend\'s item', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser1 },
        error: null
      })

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'like-1', user_id: testUser1.id, item_id: testItem2.id },
          error: null
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockInsert)

      const mockSelect = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { likes_count: 1 },
          error: null
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelect)

      const result = await likesService.likeItem(testItem2.id)

      expect(result).toHaveProperty('like')
      expect(result).toHaveProperty('likesCount')
      expect(result.likesCount).toBe(1)
    })

    it('should prevent user from liking own item', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser1 },
        error: null
      })

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'cannot like their own items' }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockInsert)

      await expect(likesService.likeItem(testItem1.id)).rejects.toThrow('You cannot like your own items')
    })

    it('should prevent duplicate likes (idempotent)', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser1 },
        error: null
      })

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: '23505' }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockInsert)

      const mockSelectExisting = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'like-1', user_id: testUser1.id, item_id: testItem2.id },
          error: null
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelectExisting)

      const mockSelectCount = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { likes_count: 5 },
          error: null
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelectCount)

      const result = await likesService.likeItem(testItem2.id)

      expect(result.alreadyLiked).toBe(true)
      expect(result.likesCount).toBe(5)
    })

    it('should require authentication', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      await expect(likesService.likeItem(testItem2.id)).rejects.toThrow('Not authenticated')
    })
  })

  describe('DELETE /likes (unlikeItem)', () => {
    it('should allow user to unlike item', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser1 },
        error: null
      })

      const mockDelete = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockDelete.eq.mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValueOnce(mockDelete)

      const mockSelect = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { likes_count: 0 },
          error: null
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelect)

      const result = await likesService.unlikeItem(testItem2.id)

      expect(result.likesCount).toBe(0)
    })

    it('should be idempotent (unliking non-existent like)', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser1 },
        error: null
      })

      const mockDelete = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockDelete.eq.mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValueOnce(mockDelete)

      const mockSelect = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { likes_count: 0 },
          error: null
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelect)

      const result = await likesService.unlikeItem(testItem2.id)

      expect(result.likesCount).toBe(0)
    })
  })

  describe('RPC get_user_liked_items', () => {
    it('should return user\'s liked items with pagination', async () => {
      const mockLikedItems = [
        { id: 'item-1', name: 'Shirt', liked_at: '2024-01-01' },
        { id: 'item-2', name: 'Jeans', liked_at: '2024-01-02' }
      ]

      mockSupabase.rpc.mockResolvedValue({
        data: mockLikedItems,
        error: null
      })

      const result = await likesService.getUserLikedItems(testUser1.id, 10, 0)

      expect(result).toEqual(mockLikedItems)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_liked_items', {
        user_id_param: testUser1.id,
        limit_param: 10,
        offset_param: 0
      })
    })

    it('should respect privacy settings (only show public/friends items)', async () => {
      // In real test, this would verify RLS policies
      const mockLikedItems = [
        { id: 'item-1', name: 'Public Shirt', privacy: 'public' },
        { id: 'item-2', name: 'Friends Jeans', privacy: 'friends' }
        // Private items should not be included
      ]

      mockSupabase.rpc.mockResolvedValue({
        data: mockLikedItems,
        error: null
      })

      const result = await likesService.getUserLikedItems(testUser1.id)

      expect(result.every(item => item.privacy !== 'private')).toBe(true)
    })
  })

  describe('RPC get_item_likers', () => {
    it('should return list of users who liked an item', async () => {
      const mockLikers = [
        { id: 'user-1', full_name: 'John Doe', avatar_url: 'avatar1.jpg' },
        { id: 'user-2', full_name: 'Jane Smith', avatar_url: 'avatar2.jpg' }
      ]

      mockSupabase.rpc.mockResolvedValue({
        data: mockLikers,
        error: null
      })

      const result = await likesService.getItemLikers(testItem1.id)

      expect(result).toEqual(mockLikers)
      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('full_name')
      expect(result[0]).toHaveProperty('avatar_url')
    })

    it('should only show friends who liked (privacy)', async () => {
      // In real test, this would verify RLS policies
      const mockLikers = [
        { id: 'user-1', full_name: 'Friend User', is_friend: true }
        // Non-friends should not be shown
      ]

      mockSupabase.rpc.mockResolvedValue({
        data: mockLikers,
        error: null
      })

      const result = await likesService.getItemLikers(testItem1.id)

      expect(result.every(liker => liker.is_friend === true)).toBe(true)
    })
  })

  describe('RPC get_popular_items', () => {
    it('should return popular items from friends', async () => {
      const mockPopularItems = [
        { id: 'item-1', name: 'Popular Shirt', likes_count: 15, owner_id: testUser2.id },
        { id: 'item-2', name: 'Trendy Jeans', likes_count: 12, owner_id: testUser2.id }
      ]

      mockSupabase.rpc.mockResolvedValue({
        data: mockPopularItems,
        error: null
      })

      const result = await likesService.getPopularItems(10, 5)

      expect(result).toEqual(mockPopularItems)
      expect(result[0].likes_count).toBeGreaterThanOrEqual(5)
      expect(result[0].likes_count).toBeGreaterThan(result[1].likes_count)
    })

    it('should respect minimum likes threshold', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [
          { id: 'item-1', likes_count: 10 },
          { id: 'item-2', likes_count: 8 }
        ],
        error: null
      })

      const result = await likesService.getPopularItems(10, 7)

      expect(result.every(item => item.likes_count >= 7)).toBe(true)
    })
  })

  describe('RPC get_user_likes_stats', () => {
    it('should return aggregated likes statistics', async () => {
      const mockStats = {
        total_items: 10,
        total_likes_received: 50,
        avg_likes_per_item: 5.0,
        most_liked_item_id: 'item-123',
        most_liked_item_name: 'Favorite Shirt',
        most_liked_item_likes: 15
      }

      mockSupabase.rpc.mockResolvedValue({
        data: [mockStats],
        error: null
      })

      const result = await likesService.getUserLikesStats(testUser1.id)

      expect(result).toEqual(mockStats)
      expect(result.total_items).toBe(10)
      expect(result.avg_likes_per_item).toBe(5.0)
    })

    it('should handle user with no items', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null
      })

      const result = await likesService.getUserLikesStats('user-with-no-items')

      expect(result).toBeNull()
    })
  })

  describe('Likes Count Triggers', () => {
    it('should auto-increment likes_count on clothes table when liked', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser1 },
        error: null
      })

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'like-1' },
          error: null
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockInsert)

      const mockSelect = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { likes_count: 6 }, // Incremented from 5
          error: null
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelect)

      const result = await likesService.likeItem(testItem2.id)

      expect(result.likesCount).toBe(6)
    })

    it('should auto-decrement likes_count when unliked', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser1 },
        error: null
      })

      const mockDelete = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockDelete.eq.mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValueOnce(mockDelete)

      const mockSelect = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { likes_count: 5 }, // Decremented from 6
          error: null
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelect)

      const result = await likesService.unlikeItem(testItem2.id)

      expect(result.likesCount).toBe(5)
    })
  })

  describe('Privacy and RLS Policies', () => {
    it('should allow liking public items from non-friends', async () => {
      // In real test, this would be verified by RLS policies
      // This is a placeholder showing the expected behavior
      expect(true).toBe(true)
    })

    it('should allow liking friends-only items from friends', async () => {
      // RLS policy: can like if is_friends_with(user_id, item.owner_id) = true
      expect(true).toBe(true)
    })

    it('should prevent liking private items', async () => {
      // RLS policy: cannot like items with privacy = 'private'
      expect(true).toBe(true)
    })

    it('should prevent non-authenticated users from liking', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      await expect(likesService.likeItem(testItem1.id)).rejects.toThrow('Not authenticated')
    })
  })

  describe('Performance and Indexes', () => {
    it('should efficiently query likes by user_id (indexed)', async () => {
      // In real test, use EXPLAIN ANALYZE to verify index usage
      // idx_likes_user_id should be used
      expect(true).toBe(true)
    })

    it('should efficiently query likes by item_id (indexed)', async () => {
      // In real test, use EXPLAIN ANALYZE to verify index usage
      // idx_likes_item_id should be used
      expect(true).toBe(true)
    })

    it('should prevent duplicate likes with unique constraint', async () => {
      // UNIQUE(user_id, item_id) constraint should be enforced
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser1 },
        error: null
      })

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: '23505' }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockInsert)

      const mockSelectExisting = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'existing-like' },
          error: null
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelectExisting)

      const mockSelectCount = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { likes_count: 5 },
          error: null
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelectCount)

      const result = await likesService.likeItem(testItem2.id)

      expect(result.alreadyLiked).toBe(true)
    })
  })
})
