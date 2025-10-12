/**
 * Advanced Features Services Unit Tests
 * 
 * Tests for collections, style-preferences, and analytics services
 * Framework: Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Supabase
vi.mock('../../src/services/auth-service', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(),
    rpc: vi.fn()
  }
}))

import collectionsService from '../../src/services/collections-service'
import stylePreferencesService from '../../src/services/style-preferences-service'
import analyticsService from '../../src/services/analytics-service'

// Get mock instance
import { supabase as mockSupabase } from '../../src/services/auth-service'

describe('Collections Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCollection', () => {
    it('should create a new collection', async () => {
      const mockCollection = {
        name: 'Summer Looks',
        description: 'My favorite summer outfits'
      }

      const mockResult = {
        id: 'collection-1',
        ...mockCollection,
        outfits_count: 0,
        created_at: '2024-01-01T10:00:00Z'
      }

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      const result = await collectionsService.createCollection(mockCollection)

      expect(result).toEqual(mockResult)
      expect(mockSupabase.from).toHaveBeenCalledWith('outfit_collections')
      expect(mockInsert.insert).toHaveBeenCalledWith([mockCollection])
    })
  })

  describe('getCollections', () => {
    it('should fetch user collections', async () => {
      const mockCollections = [
        { id: 'c1', name: 'Summer', outfits_count: 5 },
        { id: 'c2', name: 'Winter', outfits_count: 3 }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockCollections,
          error: null
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await collectionsService.getCollections()

      expect(result).toEqual(mockCollections)
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  describe('getCollection', () => {
    it('should fetch specific collection with outfits', async () => {
      const mockCollection = {
        id: 'c1',
        name: 'Summer',
        outfits: [
          { id: 'o1', name: 'Beach outfit' },
          { id: 'o2', name: 'Casual summer' }
        ]
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockCollection,
          error: null
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await collectionsService.getCollection('c1')

      expect(result).toEqual(mockCollection)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'c1')
    })
  })

  describe('addOutfitToCollection', () => {
    it('should add outfit to collection', async () => {
      const mockResult = {
        id: 'co-1',
        collection_id: 'c1',
        outfit_id: 'o1'
      }

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      const result = await collectionsService.addOutfitToCollection('c1', 'o1')

      expect(result).toEqual(mockResult)
      expect(mockSupabase.from).toHaveBeenCalledWith('collection_outfits')
    })
  })

  describe('removeOutfitFromCollection', () => {
    it('should remove outfit from collection', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockQuery.eq.mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue(mockQuery)

      await collectionsService.removeOutfitFromCollection('c1', 'o1')

      expect(mockSupabase.from).toHaveBeenCalledWith('collection_outfits')
      expect(mockQuery.delete).toHaveBeenCalled()
    })
  })

  describe('deleteCollection', () => {
    it('should delete collection', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockQuery.eq.mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue(mockQuery)

      await collectionsService.deleteCollection('c1')

      expect(mockSupabase.from).toHaveBeenCalledWith('outfit_collections')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'c1')
    })
  })
})

describe('Style Preferences Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPreferences', () => {
    it('should fetch user style preferences', async () => {
      const mockPrefs = {
        id: 'pref-1',
        preferred_colors: ['blue', 'black'],
        preferred_styles: ['casual', 'formal'],
        avoided_colors: ['yellow']
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPrefs, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.getPreferences()

      expect(result).toEqual(mockPrefs)
      expect(mockSupabase.from).toHaveBeenCalledWith('style_preferences')
    })

    it('should return null if no preferences exist', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.getPreferences()

      expect(result).toBeNull()
    })
  })

  describe('updatePreferences', () => {
    it('should update style preferences', async () => {
      const updates = {
        preferred_colors: ['blue', 'black', 'white'],
        preferred_styles: ['casual']
      }

      const mockResult = {
        id: 'pref-1',
        ...updates
      }

      const mockQuery = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.updatePreferences(updates)

      expect(result).toEqual(mockResult)
      expect(mockQuery.upsert).toHaveBeenCalledWith([updates])
    })
  })

  describe('submitFeedback', () => {
    it('should submit suggestion feedback', async () => {
      const mockFeedback = {
        id: 'fb-1',
        suggestion_id: 's1',
        feedback_type: 'like',
        feedback_reason: 'Great combination!'
      }

      const mockQuery = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFeedback, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.submitFeedback('s1', 'like', 'Great combination!')

      expect(result).toEqual(mockFeedback)
      expect(mockSupabase.from).toHaveBeenCalledWith('suggestion_feedback')
    })
  })

  describe('getFeedback', () => {
    it('should get feedback for suggestion', async () => {
      const mockFeedback = {
        id: 'fb-1',
        suggestion_id: 's1',
        feedback_type: 'like'
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFeedback, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.getFeedback('s1')

      expect(result).toEqual(mockFeedback)
    })

    it('should return null if no feedback exists', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.getFeedback('s1')

      expect(result).toBeNull()
    })
  })
})

describe('Analytics Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOutfitStats', () => {
    it('should fetch outfit statistics', async () => {
      const mockUser = { user: { id: 'user-123' } }
      const mockStats = {
        total_outfits_worn: 50,
        avg_rating: 4.5,
        most_worn_occasion: 'work',
        favorite_season: 'spring',
        total_items_used: 30
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({
        data: [mockStats],
        error: null
      })

      const result = await analyticsService.getOutfitStats()

      expect(result).toEqual(mockStats)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_outfit_stats', {
        p_user_id: 'user-123'
      })
    })

    it('should return empty object if no stats', async () => {
      const mockUser = { user: { id: 'user-123' } }

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null
      })

      const result = await analyticsService.getOutfitStats()

      expect(result).toEqual({})
    })
  })

  describe('getMostWornItems', () => {
    it('should fetch most worn items with default limit', async () => {
      const mockUser = { user: { id: 'user-123' } }
      const mockItems = [
        { item_id: 'i1', wear_count: 20, name: 'Blue Shirt' },
        { item_id: 'i2', wear_count: 15, name: 'Black Jeans' }
      ]

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({
        data: mockItems,
        error: null
      })

      const result = await analyticsService.getMostWornItems()

      expect(result).toEqual(mockItems)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_most_worn_items', {
        p_user_id: 'user-123',
        p_limit: 10
      })
    })

    it('should accept custom limit', async () => {
      const mockUser = { user: { id: 'user-123' } }

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null
      })

      await analyticsService.getMostWornItems(20)

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_most_worn_items', {
        p_user_id: 'user-123',
        p_limit: 20
      })
    })
  })

  describe('getUnwornCombinations', () => {
    it('should fetch unworn outfit combinations', async () => {
      const mockUser = { user: { id: 'user-123' } }
      const mockCombinations = [
        { item_id: 'i1', name: 'Red Shirt', last_worn: null },
        { item_id: 'i2', name: 'Green Pants', last_worn: null }
      ]

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({
        data: mockCombinations,
        error: null
      })

      const result = await analyticsService.getUnwornCombinations()

      expect(result).toEqual(mockCombinations)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_unworn_combinations', {
        p_user_id: 'user-123'
      })
    })

    it('should return empty array if all items worn', async () => {
      const mockUser = { user: { id: 'user-123' } }

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null
      })

      const result = await analyticsService.getUnwornCombinations()

      expect(result).toEqual([])
    })
  })

  describe('error handling', () => {
    it('should throw error on RPC failure', async () => {
      const mockUser = { user: { id: 'user-123' } }

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' }
      })

      await expect(analyticsService.getOutfitStats()).rejects.toThrow()
    })

    it('should throw error if user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      await expect(analyticsService.getOutfitStats()).rejects.toThrow()
    })
  })
})
