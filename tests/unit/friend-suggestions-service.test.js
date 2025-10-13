/**
 * Unit Tests for Friend Suggestions Service
 * Tests creating, approving, rejecting outfit suggestions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { friendSuggestionsService } from '../../src/services/friend-suggestions-service'
import { supabase } from '../../src/config/supabase'

// Mock Supabase
vi.mock('../../src/config/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      user: vi.fn()
    }
  }
}))

describe('Friend Suggestions Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.user.mockReturnValue({ id: 'current-user-id' })
  })

  describe('createSuggestion', () => {
    it('should create outfit suggestion for friend', async () => {
      const outfitItems = [
        { clothes_id: 'item-1', category: 'top' },
        { clothes_id: 'item-2', category: 'bottom' }
      ]

      // Mock validation query
      const mockValidationQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [{ id: 'item-1' }, { id: 'item-2' }],
          error: null
        })
      }

      // Mock friendship check
      const mockFriendshipQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'friendship-id' },
          error: null
        })
      }

      // Mock insert
      const mockInsertQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'suggestion-id',
            outfit_items: outfitItems,
            status: 'pending'
          },
          error: null
        })
      }

      supabase.from
        .mockReturnValueOnce(mockValidationQuery)
        .mockReturnValueOnce(mockFriendshipQuery)
        .mockReturnValueOnce(mockInsertQuery)

      const result = await friendSuggestionsService.createSuggestion({
        friendId: 'friend-id',
        outfitItems,
        message: 'Try this!'
      })

      expect(result.success).toBe(true)
      expect(result.suggestion.status).toBe('pending')
    })

    it('should reject if items do not belong to friend', async () => {
      const mockValidationQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [{ id: 'item-1' }], // Only 1 item returned
          error: null
        })
      }

      supabase.from.mockReturnValue(mockValidationQuery)

      const result = await friendSuggestionsService.createSuggestion({
        friendId: 'friend-id',
        outfitItems: [
          { clothes_id: 'item-1', category: 'top' },
          { clothes_id: 'item-2', category: 'bottom' }
        ],
        message: 'Try this!'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('do not belong')
    })

    it('should reject if not friends', async () => {
      const mockValidationQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [{ id: 'item-1' }],
          error: null
        })
      }

      const mockFriendshipQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Not found')
        })
      }

      supabase.from
        .mockReturnValueOnce(mockValidationQuery)
        .mockReturnValueOnce(mockFriendshipQuery)

      const result = await friendSuggestionsService.createSuggestion({
        friendId: 'friend-id',
        outfitItems: [{ clothes_id: 'item-1', category: 'top' }],
        message: 'Try this!'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('must be friends')
    })
  })

  describe('getReceivedSuggestions', () => {
    it('should fetch pending suggestions received by user', async () => {
      const mockSuggestions = [
        {
          id: '1',
          status: 'pending',
          suggester: { username: 'john' }
        }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockSuggestions,
          error: null,
          count: 1
        })
      }

      supabase.from.mockReturnValue(mockQuery)

      const result = await friendSuggestionsService.getReceivedSuggestions()

      expect(result.success).toBe(true)
      expect(result.suggestions).toEqual(mockSuggestions)
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'pending')
    })
  })

  describe('getSentSuggestions', () => {
    it('should fetch suggestions sent by user', async () => {
      const mockSuggestions = [
        {
          id: '1',
          status: 'pending',
          owner: { username: 'jane' }
        }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockSuggestions,
          error: null,
          count: 1
        })
      }

      supabase.from.mockReturnValue(mockQuery)

      const result = await friendSuggestionsService.getSentSuggestions()

      expect(result.success).toBe(true)
      expect(result.suggestions).toEqual(mockSuggestions)
    })
  })

  describe('approveSuggestion', () => {
    it('should approve suggestion and return outfit ID', async () => {
      supabase.rpc.mockResolvedValue({
        data: 'new-outfit-id',
        error: null
      })

      const result = await friendSuggestionsService.approveSuggestion('suggestion-id')

      expect(result.success).toBe(true)
      expect(result.outfit_id).toBe('new-outfit-id')
      expect(supabase.rpc).toHaveBeenCalledWith('approve_friend_outfit_suggestion', {
        p_suggestion_id: 'suggestion-id'
      })
    })

    it('should handle approval errors', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: new Error('Permission denied')
      })

      const result = await friendSuggestionsService.approveSuggestion('suggestion-id')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('rejectSuggestion', () => {
    it('should reject suggestion', async () => {
      supabase.rpc.mockResolvedValue({
        error: null
      })

      const result = await friendSuggestionsService.rejectSuggestion('suggestion-id')

      expect(result.success).toBe(true)
      expect(supabase.rpc).toHaveBeenCalledWith('reject_friend_outfit_suggestion', {
        p_suggestion_id: 'suggestion-id'
      })
    })
  })

  describe('getSuggestion', () => {
    it('should fetch single suggestion details', async () => {
      const mockSuggestion = {
        id: '1',
        status: 'pending',
        suggester: { username: 'john' },
        owner: { username: 'jane' }
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

      const result = await friendSuggestionsService.getSuggestion('suggestion-id')

      expect(result.success).toBe(true)
      expect(result.suggestion).toEqual(mockSuggestion)
    })
  })

  describe('deleteSuggestion', () => {
    it('should delete pending suggestion', async () => {
      const mockEq2 = vi.fn().mockResolvedValue({
        error: null
      })
      
      const mockEq1 = vi.fn().mockReturnValue({
        eq: mockEq2
      })
      
      const mockQuery = {
        delete: vi.fn().mockReturnValue({
          eq: mockEq1
        })
      }

      supabase.from.mockReturnValue(mockQuery)

      const result = await friendSuggestionsService.deleteSuggestion('suggestion-id')

      expect(result.success).toBe(true)
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockEq1).toHaveBeenCalledWith('id', 'suggestion-id')
      expect(mockEq2).toHaveBeenCalledWith('status', 'pending')
    })
  })

  describe('getFriendClosetItems', () => {
    it('should fetch friend\'s closet items', async () => {
      const mockItems = [
        { id: '1', name: 'Shirt', category: 'top' },
        { id: '2', name: 'Jeans', category: 'bottom' }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockItems,
          error: null
        })
      }

      supabase.from.mockReturnValue(mockQuery)

      const result = await friendSuggestionsService.getFriendClosetItems('friend-id')

      expect(result.success).toBe(true)
      expect(result.items).toEqual(mockItems)
    })

    it('should filter by category', async () => {
      const categoryEqSpy = vi.fn().mockResolvedValue({
        data: [],
        error: null
      })
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnValue({
          eq: categoryEqSpy
        })
      }

      supabase.from.mockReturnValue(mockQuery)

      await friendSuggestionsService.getFriendClosetItems('friend-id', { category: 'top' })

      expect(mockQuery.eq).toHaveBeenCalledWith('owner_id', 'friend-id')
      expect(categoryEqSpy).toHaveBeenCalledWith('category', 'top')
    })

    it('should search by name', async () => {
      const ilikeSpy = vi.fn().mockResolvedValue({
        data: [],
        error: null
      })
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnValue({
          ilike: ilikeSpy
        })
      }

      supabase.from.mockReturnValue(mockQuery)

      await friendSuggestionsService.getFriendClosetItems('friend-id', { search: 'shirt' })

      expect(ilikeSpy).toHaveBeenCalledWith('name', '%shirt%')
    })
  })
})
