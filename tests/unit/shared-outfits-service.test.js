/**
 * Shared Outfits Service Unit Tests
 * 
 * Tests for shared-outfits-service.js functionality
 * Framework: Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Supabase
vi.mock('../../src/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      user: vi.fn()
    },
    from: vi.fn(),
    rpc: vi.fn()
  }
}))

import sharedOutfitsService from '../../src/services/shared-outfits-service'

// Get mock instance
import { supabase as mockSupabase } from '../../src/config/supabase'

describe('Shared Outfits Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default auth mock
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: { id: 'user-123' }
      },
      error: null
    })
  })

  describe('shareOutfit', () => {
    it('should share an outfit', async () => {
      const mockOutfit = {
        outfit_items: ['item-1', 'item-2'],
        caption: 'My favorite outfit!',
        visibility: 'friends'
      }

      const mockResult = {
        id: 'shared-1',
        ...mockOutfit,
        likes_count: 0,
        comments_count: 0,
        created_at: '2024-01-01T10:00:00Z'
      }

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      const result = await sharedOutfitsService.shareOutfit(mockOutfit)

      expect(result).toEqual(mockResult)
      expect(mockSupabase.from).toHaveBeenCalledWith('shared_outfits')
      expect(mockInsert.insert).toHaveBeenCalledWith([mockOutfit])
    })

    it('should throw error on share failure', async () => {
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Share failed' }
        })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      await expect(sharedOutfitsService.shareOutfit({})).rejects.toThrow()
    })
  })

  describe('getFeed', () => {
    it('should fetch feed with default options', async () => {
      const mockOutfits = [
        { id: 'shared-1', caption: 'Outfit 1', created_at: '2024-01-02' },
        { id: 'shared-2', caption: 'Outfit 2', created_at: '2024-01-01' }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockOutfits,
          error: null,
          count: 2
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await sharedOutfitsService.getFeed()

      expect(result.outfits).toEqual(mockOutfits)
      expect(result.total).toBe(2)
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(mockQuery.range).toHaveBeenCalledWith(0, 19)
    })

    it('should apply custom limit and offset', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      await sharedOutfitsService.getFeed({ limit: 10, offset: 20 })

      expect(mockQuery.range).toHaveBeenCalledWith(20, 29)
    })

    it('should filter by visibility', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null, count: 0 }))
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      await sharedOutfitsService.getFeed({ visibility: 'public' })

      expect(mockQuery.eq).toHaveBeenCalledWith('visibility', 'public')
    })

    it('should include user data in select', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      await sharedOutfitsService.getFeed()

      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('user:users!user_id'),
        { count: 'exact' }
      )
    })
  })

  describe('getSharedOutfit', () => {
    it('should fetch specific shared outfit', async () => {
      const mockOutfit = {
        id: 'shared-1',
        caption: 'My outfit',
        user: { id: 'user-1', name: 'John', avatar_url: 'avatar.jpg' }
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockOutfit, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await sharedOutfitsService.getSharedOutfit('shared-1')

      expect(result).toEqual(mockOutfit)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'shared-1')
    })

    it('should throw error if outfit not found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      await expect(sharedOutfitsService.getSharedOutfit('invalid')).rejects.toThrow()
    })
  })

  describe('updateOutfit', () => {
    it('should update shared outfit', async () => {
      const updates = { caption: 'Updated caption' }
      const mockUpdated = {
        id: 'shared-1',
        ...updates
      }

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdated, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await sharedOutfitsService.updateSharedOutfit('shared-1', updates)

      expect(result).toEqual(mockUpdated)
      expect(mockQuery.update).toHaveBeenCalledWith(updates)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'shared-1')
    })
  })

  describe('deleteSharedOutfit', () => {
    it('should delete shared outfit', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockQuery.eq.mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue(mockQuery)

      await sharedOutfitsService.deleteSharedOutfit('shared-1')

      expect(mockSupabase.from).toHaveBeenCalledWith('shared_outfits')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'shared-1')
    })
  })

  describe('likeOutfit', () => {
    it('should like a shared outfit', async () => {
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'like-1', outfit_id: 'shared-1' },
          error: null
        })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      const result = await sharedOutfitsService.likeOutfit('shared-1')

      expect(result).toHaveProperty('id')
      expect(mockSupabase.from).toHaveBeenCalledWith('shared_outfit_likes')
    })

    it('should handle duplicate like', async () => {
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: '23505', message: 'duplicate key' }
        })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      await expect(sharedOutfitsService.likeOutfit('shared-1')).rejects.toThrow()
    })
  })

  describe('unlikeOutfit', () => {
    it('should unlike a shared outfit', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockQuery.eq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
      mockSupabase.from.mockReturnValue(mockQuery)

      await sharedOutfitsService.unlikeOutfit('shared-1')

      expect(mockSupabase.from).toHaveBeenCalledWith('shared_outfit_likes')
      expect(mockQuery.delete).toHaveBeenCalled()
    })
  })

  describe('hasLiked', () => {
    it('should return true if user has liked outfit', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'like-1' },
          error: null
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await sharedOutfitsService.hasLiked('shared-1')

      expect(result).toBe(true)
    })

    it('should return false if user has not liked outfit', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await sharedOutfitsService.hasLiked('shared-1')

      expect(result).toBe(false)
    })
  })

  describe('addComment', () => {
    it('should add comment to shared outfit', async () => {
      const mockComment = {
        outfit_id: 'shared-1',
        comment_text: 'Great outfit!'
      }

      const mockResult = {
        id: 'comment-1',
        ...mockComment,
        created_at: '2024-01-01T10:00:00Z'
      }

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      const result = await sharedOutfitsService.addComment(mockComment)

      expect(result).toEqual(mockResult)
      expect(mockSupabase.from).toHaveBeenCalledWith('outfit_comments')
    })
  })

  describe('getComments', () => {
    it('should fetch comments for outfit', async () => {
      const mockComments = [
        { id: 'c1', comment_text: 'Comment 1', created_at: '2024-01-02' },
        { id: 'c2', comment_text: 'Comment 2', created_at: '2024-01-01' }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockComments,
          error: null
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await sharedOutfitsService.getComments('shared-1', 50)

      expect(result).toEqual(mockComments)
      expect(mockQuery.eq).toHaveBeenCalledWith('outfit_id', 'shared-1')
      expect(mockQuery.limit).toHaveBeenCalledWith(50)
    })

    it('should use default limit', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      await sharedOutfitsService.getComments('shared-1')

      expect(mockQuery.limit).toHaveBeenCalledWith(100)
    })
  })

  describe('deleteComment', () => {
    it('should delete comment', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockQuery.eq.mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue(mockQuery)

      await sharedOutfitsService.deleteComment('comment-1')

      expect(mockSupabase.from).toHaveBeenCalledWith('outfit_comments')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'comment-1')
    })
  })
})
