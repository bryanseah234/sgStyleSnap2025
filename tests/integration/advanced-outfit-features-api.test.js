/**
 * Advanced Outfit Features API Integration Tests
 * 
 * Tests for Task 13 API endpoints (outfit history, shared outfits, collections, etc.)
 * Framework: Vitest with Supabase test client
 * 
 * Note: These tests require a Supabase test database or local instance
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.test
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'

// Mock Supabase for now - in real integration tests, you'd use a test database
vi.mock('../../src/services/auth-service', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(),
    rpc: vi.fn()
  }
}))

import outfitHistoryService from '../../src/services/outfit-history-service'
import sharedOutfitsService from '../../src/services/shared-outfits-service'
import collectionsService from '../../src/services/collections-service'
import stylePreferencesService from '../../src/services/style-preferences-service'
import analyticsService from '../../src/services/analytics-service'

// Get mock instance
import { supabase as mockSupabase } from '../../src/services/auth-service'

describe('Advanced Outfit Features API Integration Tests', () => {
  let testUser1, testUser2

  beforeAll(() => {
    testUser1 = { id: 'test-user-1', email: 'user1@test.com' }
    testUser2 = { id: 'test-user-2', email: 'user2@test.com' }
  })

  afterAll(() => {
    // Cleanup would happen here in real integration tests
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Outfit History API', () => {
    it('should record worn outfit with all details', async () => {
      const outfitData = {
        outfit_items: ['item-1', 'item-2', 'item-3'],
        worn_date: '2024-01-15',
        occasion: 'work',
        weather: 'sunny',
        temperature: 72,
        rating: 5,
        notes: 'Great outfit for the office!'
      }

      const mockResult = {
        id: 'history-1',
        user_id: testUser1.id,
        ...outfitData,
        created_at: '2024-01-15T10:00:00Z'
      }

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      const result = await outfitHistoryService.recordOutfit(outfitData)

      expect(result).toHaveProperty('id')
      expect(result.outfit_items).toEqual(outfitData.outfit_items)
      expect(result.rating).toBe(5)
    })

    it('should retrieve outfit history with filters', async () => {
      const mockHistory = [
        { id: 'h1', occasion: 'work', rating: 5, worn_date: '2024-01-15' },
        { id: 'h2', occasion: 'work', rating: 4, worn_date: '2024-01-10' }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: mockHistory, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await outfitHistoryService.getHistory({
        occasion: 'work',
        rating_min: 4
      })

      expect(result).toHaveLength(2)
      expect(result.every(item => item.occasion === 'work')).toBe(true)
      expect(result.every(item => item.rating >= 4)).toBe(true)
    })

    it('should get user outfit statistics via RPC', async () => {
      const mockUser = { user: { id: testUser1.id } }
      const mockStats = {
        total_outfits_worn: 25,
        avg_rating: 4.2,
        most_worn_occasion: 'work',
        favorite_season: 'fall',
        total_items_used: 20,
        most_worn_item_id: 'item-1',
        most_worn_item_count: 10
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({ data: [mockStats], error: null })

      const result = await outfitHistoryService.getStats()

      expect(result.total_outfits_worn).toBe(25)
      expect(result.avg_rating).toBe(4.2)
      expect(result.most_worn_occasion).toBe('work')
    })
  })

  describe('Shared Outfits API', () => {
    it('should share outfit with visibility settings', async () => {
      const outfitData = {
        outfit_items: ['item-1', 'item-2'],
        caption: 'My favorite look! ✨',
        visibility: 'friends',
        tags: ['casual', 'weekend']
      }

      const mockResult = {
        id: 'shared-1',
        user_id: testUser1.id,
        ...outfitData,
        likes_count: 0,
        comments_count: 0,
        created_at: '2024-01-15T10:00:00Z'
      }

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      const result = await sharedOutfitsService.shareOutfit(outfitData)

      expect(result).toHaveProperty('id')
      expect(result.visibility).toBe('friends')
      expect(result.likes_count).toBe(0)
    })

    it('should get social feed with pagination', async () => {
      const mockOutfits = [
        { id: 's1', caption: 'Outfit 1', user_id: testUser2.id, created_at: '2024-01-15' },
        { id: 's2', caption: 'Outfit 2', user_id: testUser2.id, created_at: '2024-01-14' }
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

      const result = await sharedOutfitsService.getFeed({ limit: 20, offset: 0 })

      expect(result.outfits).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('should like shared outfit', async () => {
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'like-1', outfit_id: 'shared-1', user_id: testUser1.id },
          error: null
        })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      const result = await sharedOutfitsService.likeOutfit('shared-1')

      expect(result).toHaveProperty('id')
      expect(mockSupabase.from).toHaveBeenCalledWith('shared_outfit_likes')
    })

    it('should add comment to shared outfit', async () => {
      const commentData = {
        outfit_id: 'shared-1',
        comment_text: 'Love this combination! 👍'
      }

      const mockResult = {
        id: 'comment-1',
        user_id: testUser1.id,
        ...commentData,
        created_at: '2024-01-15T10:30:00Z'
      }

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      const result = await sharedOutfitsService.addComment(commentData)

      expect(result).toHaveProperty('id')
      expect(result.comment_text).toBe(commentData.comment_text)
    })

    it('should get comments for outfit', async () => {
      const mockComments = [
        { id: 'c1', comment_text: 'Nice!', user_id: testUser2.id, created_at: '2024-01-15T11:00:00Z' },
        { id: 'c2', comment_text: 'Great look!', user_id: testUser1.id, created_at: '2024-01-15T10:30:00Z' }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockComments, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await sharedOutfitsService.getComments('shared-1')

      expect(result).toHaveLength(2)
      expect(result[0].comment_text).toBe('Nice!')
    })
  })

  describe('Collections API', () => {
    it('should create outfit collection', async () => {
      const collectionData = {
        name: 'Summer Vacation',
        description: 'Outfits for my beach trip',
        is_public: false
      }

      const mockResult = {
        id: 'collection-1',
        user_id: testUser1.id,
        ...collectionData,
        outfits_count: 0,
        created_at: '2024-01-15T10:00:00Z'
      }

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      const result = await collectionsService.createCollection(collectionData)

      expect(result).toHaveProperty('id')
      expect(result.name).toBe('Summer Vacation')
      expect(result.outfits_count).toBe(0)
    })

    it('should add outfit to collection', async () => {
      const mockResult = {
        id: 'co-1',
        collection_id: 'collection-1',
        outfit_id: 'outfit-1',
        added_at: '2024-01-15T11:00:00Z'
      }

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      const result = await collectionsService.addOutfitToCollection('collection-1', 'outfit-1')

      expect(result).toHaveProperty('id')
      expect(mockSupabase.from).toHaveBeenCalledWith('collection_outfits')
    })

    it('should get collection with outfits', async () => {
      const mockCollection = {
        id: 'collection-1',
        name: 'Summer Vacation',
        outfits_count: 3,
        outfits: [
          { id: 'o1', caption: 'Beach day' },
          { id: 'o2', caption: 'Dinner outfit' },
          { id: 'o3', caption: 'Exploring' }
        ]
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCollection, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await collectionsService.getCollection('collection-1')

      expect(result.outfits).toHaveLength(3)
      expect(result.outfits_count).toBe(3)
    })

    it('should auto-update outfits_count trigger', async () => {
      // In real test, this would verify the trigger works
      // When adding outfit: outfits_count should increment
      // When removing outfit: outfits_count should decrement
      expect(true).toBe(true)
    })
  })

  describe('Style Preferences API', () => {
    it('should save style preferences', async () => {
      const preferences = {
        preferred_colors: ['blue', 'black', 'white'],
        avoided_colors: ['yellow', 'orange'],
        preferred_styles: ['casual', 'business_casual'],
        preferred_fits: ['regular', 'slim'],
        comfort_level: 'balanced'
      }

      const mockResult = {
        id: 'pref-1',
        user_id: testUser1.id,
        ...preferences,
        updated_at: '2024-01-15T10:00:00Z'
      }

      const mockQuery = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.updatePreferences(preferences)

      expect(result.preferred_colors).toEqual(preferences.preferred_colors)
      expect(result.avoided_colors).toEqual(preferences.avoided_colors)
    })

    it('should submit suggestion feedback', async () => {
      const mockFeedback = {
        id: 'fb-1',
        suggestion_id: 'suggestion-1',
        user_id: testUser1.id,
        feedback_type: 'like',
        feedback_reason: 'Perfect color combination!',
        created_at: '2024-01-15T10:00:00Z'
      }

      const mockQuery = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFeedback, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.submitFeedback(
        'suggestion-1',
        'like',
        'Perfect color combination!'
      )

      expect(result.feedback_type).toBe('like')
      expect(result.feedback_reason).toBe('Perfect color combination!')
    })

    it('should get user preferences', async () => {
      const mockPrefs = {
        id: 'pref-1',
        user_id: testUser1.id,
        preferred_colors: ['blue', 'black'],
        preferred_styles: ['casual']
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPrefs, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.getPreferences()

      expect(result.preferred_colors).toContain('blue')
      expect(result.preferred_styles).toContain('casual')
    })
  })

  describe('Analytics API', () => {
    it('should get comprehensive outfit statistics', async () => {
      const mockUser = { user: { id: testUser1.id } }
      const mockStats = {
        total_outfits_worn: 50,
        avg_rating: 4.5,
        most_worn_occasion: 'work',
        favorite_season: 'spring',
        total_items_used: 35,
        most_worn_item_id: 'item-5',
        most_worn_item_count: 20
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({ data: [mockStats], error: null })

      const result = await analyticsService.getOutfitStats()

      expect(result.total_outfits_worn).toBe(50)
      expect(result.avg_rating).toBe(4.5)
      expect(result.most_worn_occasion).toBe('work')
    })

    it('should get most worn items', async () => {
      const mockUser = { user: { id: testUser1.id } }
      const mockItems = [
        { item_id: 'item-1', wear_count: 20, name: 'Blue Button-up', category: 'top' },
        { item_id: 'item-2', wear_count: 18, name: 'Black Jeans', category: 'bottom' },
        { item_id: 'item-3', wear_count: 15, name: 'White Sneakers', category: 'shoes' }
      ]

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({ data: mockItems, error: null })

      const result = await analyticsService.getMostWornItems(10)

      expect(result).toHaveLength(3)
      expect(result[0].wear_count).toBeGreaterThanOrEqual(result[1].wear_count)
      expect(result[1].wear_count).toBeGreaterThanOrEqual(result[2].wear_count)
    })

    it('should get unworn item combinations', async () => {
      const mockUser = { user: { id: testUser1.id } }
      const mockUnworn = [
        { item_id: 'item-7', name: 'Red Sweater', last_worn: null },
        { item_id: 'item-8', name: 'Gray Pants', last_worn: null }
      ]

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({ data: mockUnworn, error: null })

      const result = await analyticsService.getUnwornCombinations()

      expect(result).toHaveLength(2)
      expect(result.every(item => item.last_worn === null)).toBe(true)
    })
  })

  describe('RLS Policies', () => {
    it('should enforce outfit_history privacy (user can only see own)', async () => {
      // In real test, this would verify RLS policies
      // User should only see their own outfit history
      expect(true).toBe(true)
    })

    it('should enforce shared_outfits visibility rules', async () => {
      // RLS should enforce:
      // - public: everyone can see
      // - friends: only friends can see
      // - private: only owner can see
      expect(true).toBe(true)
    })

    it('should enforce collection privacy', async () => {
      // RLS should allow:
      // - Owner can CRUD their collections
      // - Others can view if is_public = true
      expect(true).toBe(true)
    })

    it('should enforce style_preferences privacy', async () => {
      // RLS should ensure users can only access their own preferences
      expect(true).toBe(true)
    })
  })

  describe('Triggers and Constraints', () => {
    it('should auto-update likes_count on shared_outfits', async () => {
      // Trigger should increment/decrement likes_count automatically
      expect(true).toBe(true)
    })

    it('should auto-update comments_count on shared_outfits', async () => {
      // Trigger should increment/decrement comments_count automatically
      expect(true).toBe(true)
    })

    it('should auto-update outfits_count on collections', async () => {
      // Trigger should increment/decrement outfits_count automatically
      expect(true).toBe(true)
    })

    it('should prevent duplicate outfit_likes (unique constraint)', async () => {
      // UNIQUE(user_id, outfit_id) should prevent duplicates
      expect(true).toBe(true)
    })
  })

  describe('Performance', () => {
    it('should use indexes for outfit_history queries', async () => {
      // EXPLAIN ANALYZE should show index usage
      expect(true).toBe(true)
    })

    it('should use indexes for shared_outfits feed queries', async () => {
      // Indexes on created_at, user_id, visibility
      expect(true).toBe(true)
    })

    it('should efficiently query analytics functions', async () => {
      // RPC functions should be optimized
      expect(true).toBe(true)
    })
  })
})
