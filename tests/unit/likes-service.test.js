/**
 * Likes Service Unit Tests
 * 
 * Tests for likes-service.js functionality
 * Framework: Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the supabase config module
vi.mock('../../src/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(),
    rpc: vi.fn()
  }
}))

// Import after mocking
import { likesService } from '../../src/services/likes-service'

// Get mock instance
import { supabase as mockSupabase } from '../../src/config/supabase'

describe('Likes Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  describe('likeItem', () => {
    it('should successfully like an item', async () => {
      const mockUser = { id: 'user-123' }
      const mockLike = { id: 'like-1', item_id: 'item-456', user_id: 'user-123' }
      const mockItem = { likes_count: 5 }

      // Mock auth
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock insert
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockLike, error: null })
      }
      mockSupabase.from.mockReturnValueOnce(mockInsert)

      // Mock select for likes count
      const mockSelect = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockItem, error: null })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelect)

      const result = await likesService.likeItem('item-456')

      expect(result).toEqual({
        like: mockLike,
        likesCount: 5
      })
      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
      expect(mockSupabase.from).toHaveBeenCalledWith('likes')
      expect(mockInsert.insert).toHaveBeenCalledWith({
        item_id: 'item-456',
        user_id: 'user-123'
      })
    })

    it('should handle duplicate like (already liked)', async () => {
      const mockUser = { id: 'user-123' }
      const mockExistingLike = { id: 'like-1', item_id: 'item-456', user_id: 'user-123' }
      const mockItem = { likes_count: 5 }

      // Mock auth
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock insert with duplicate error
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: '23505', message: 'duplicate key value' }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockInsert)

      // Mock select for existing like
      const mockSelectLike = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockExistingLike, error: null })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelectLike)

      // Mock select for likes count
      const mockSelectCount = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockItem, error: null })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelectCount)

      const result = await likesService.likeItem('item-456')

      expect(result).toEqual({
        like: mockExistingLike,
        likesCount: 5,
        alreadyLiked: true
      })
    })

    it('should throw error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      await expect(likesService.likeItem('item-456')).rejects.toThrow('Not authenticated')
    })

    it('should throw error when trying to like own item', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
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

      await expect(likesService.likeItem('item-456')).rejects.toThrow('You cannot like your own items')
    })
  })

  describe('unlikeItem', () => {
    it('should successfully unlike an item', async () => {
      const mockUser = { id: 'user-123' }
      const mockItem = { likes_count: 4 }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockEqChain = {
        eq: vi.fn().mockResolvedValue({ error: null })
      }
      const mockDelete = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnValue(mockEqChain)
      }
      mockSupabase.from.mockReturnValueOnce(mockDelete)

      const mockSelect = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockItem, error: null })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelect)

      const result = await likesService.unlikeItem('item-456')

      expect(result).toEqual({ likesCount: 4 })
      expect(mockDelete.delete).toHaveBeenCalled()
      expect(mockDelete.eq).toHaveBeenCalledWith('item_id', 'item-456')
      expect(mockEqChain.eq).toHaveBeenCalledWith('user_id', 'user-123')
    })

    it('should throw error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      await expect(likesService.unlikeItem('item-456')).rejects.toThrow('Not authenticated')
    })
  })

  describe('toggleLike', () => {
    it('should unlike when currently liked', async () => {
      const mockUser = { id: 'user-123' }
      const mockItem = { likes_count: 4 }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockEqChain = {
        eq: vi.fn().mockResolvedValue({ error: null })
      }
      const mockDelete = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnValue(mockEqChain)
      }
      mockSupabase.from.mockReturnValueOnce(mockDelete)

      const mockSelect = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockItem, error: null })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelect)

      const result = await likesService.toggleLike('item-456', true)

      expect(result).toEqual({ liked: false, likesCount: 4 })
    })

    it('should like when not currently liked', async () => {
      const mockUser = { id: 'user-123' }
      const mockLike = { id: 'like-1', item_id: 'item-456', user_id: 'user-123' }
      const mockItem = { likes_count: 5 }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockLike, error: null })
      }
      mockSupabase.from.mockReturnValueOnce(mockInsert)

      const mockSelect = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockItem, error: null })
      }
      mockSupabase.from.mockReturnValueOnce(mockSelect)

      const result = await likesService.toggleLike('item-456', false)

      expect(result).toEqual({ liked: true, likesCount: 5 })
    })
  })

  describe('getUserLikedItems', () => {
    it('should fetch user liked items', async () => {
      const mockLikedItems = [
        { id: 'item-1', name: 'T-Shirt', liked_at: '2024-01-01' },
        { id: 'item-2', name: 'Jeans', liked_at: '2024-01-02' }
      ]

      mockSupabase.rpc.mockResolvedValue({
        data: mockLikedItems,
        error: null
      })

      const result = await likesService.getUserLikedItems('user-123', 50, 0)

      expect(result).toEqual(mockLikedItems)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_liked_items', {
        user_id_param: 'user-123',
        limit_param: 50,
        offset_param: 0
      })
    })

    it('should handle errors gracefully', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      await expect(likesService.getUserLikedItems('user-123')).rejects.toThrow()
    })
  })

  describe('getItemLikers', () => {
    it('should fetch item likers', async () => {
      const mockLikers = [
        { id: 'user-1', full_name: 'John Doe', avatar_url: 'avatar1.jpg' },
        { id: 'user-2', full_name: 'Jane Smith', avatar_url: 'avatar2.jpg' }
      ]

      mockSupabase.rpc.mockResolvedValue({
        data: mockLikers,
        error: null
      })

      const result = await likesService.getItemLikers('item-456', 50)

      expect(result).toEqual(mockLikers)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_item_likers', {
        item_id_param: 'item-456',
        limit_param: 50
      })
    })

    it('should return empty array on error', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      })

      await expect(likesService.getItemLikers('item-456')).rejects.toThrow()
    })
  })

  describe('getPopularItems', () => {
    it('should fetch popular items from friends', async () => {
      const mockPopularItems = [
        { id: 'item-1', name: 'Popular Shirt', likes_count: 15 },
        { id: 'item-2', name: 'Popular Jeans', likes_count: 12 }
      ]

      mockSupabase.rpc.mockResolvedValue({
        data: mockPopularItems,
        error: null
      })

      const result = await likesService.getPopularItems(10, 5)

      expect(result).toEqual(mockPopularItems)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_popular_items', {
        limit_param: 10,
        min_likes_param: 5
      })
    })
  })

  describe('hasLiked', () => {
    it('should return true when user has liked item', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'like-1' },
        error: null
      })
      const mockEq2 = {
        eq: vi.fn().mockReturnThis(),
        single: mockSingle
      }
      const mockEq1 = {
        eq: vi.fn().mockReturnValue(mockEq2)
      }
      const mockSelect = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnValue(mockEq1)
      }
      mockSupabase.from.mockReturnValueOnce(mockSelect)

      const result = await likesService.hasLiked('item-456')

      expect(result).toBe(true)
    })

    it('should return false when user has not liked item', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      })
      const mockEq2 = {
        eq: vi.fn().mockReturnThis(),
        single: mockSingle
      }
      const mockEq1 = {
        eq: vi.fn().mockReturnValue(mockEq2)
      }
      const mockSelect = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnValue(mockEq1)
      }
      mockSupabase.from.mockReturnValueOnce(mockSelect)

      const result = await likesService.hasLiked('item-456')

      expect(result).toBe(false)
    })
  })

  describe('getUserLikesStats', () => {
    it('should fetch user likes statistics', async () => {
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

      const result = await likesService.getUserLikesStats('user-123')

      expect(result).toEqual(mockStats)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_likes_stats', {
        user_id_param: 'user-123'
      })
    })

    it('should return default stats when no stats available', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null
      })

      const result = await likesService.getUserLikesStats('user-123')

      expect(result).toEqual({
        total_items: 0,
        total_likes_received: 0,
        avg_likes_per_item: 0,
        most_liked_item_id: null,
        most_liked_item_name: null,
        most_liked_item_likes: 0
      })
    })
  })
})
