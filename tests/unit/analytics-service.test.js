/**
 * Analytics Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import analyticsService from '../../src/services/analytics-service'

// Mock supabase
vi.mock('../../src/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(),
    rpc: vi.fn()
  }
}))

import { supabase as mockSupabase } from '../../src/config/supabase'

describe('Analytics Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    })
  })

  describe('getMostWornItems', () => {
    it('should fetch most worn items with default limit', async () => {
      const mockItems = [
        { item_id: 'item-1', wear_count: 15 },
        { item_id: 'item-2', wear_count: 10 }
      ]

      mockSupabase.rpc.mockResolvedValue({ data: mockItems, error: null })

      const result = await analyticsService.getMostWornItems()

      expect(result).toEqual(mockItems)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_most_worn_items', {
        p_user_id: 'user-123',
        p_limit: 10
      })
    })

    it('should fetch most worn items with custom limit', async () => {
      const mockItems = [{ item_id: 'item-1', wear_count: 20 }]

      mockSupabase.rpc.mockResolvedValue({ data: mockItems, error: null })

      const result = await analyticsService.getMostWornItems(5)

      expect(result).toEqual(mockItems)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_most_worn_items', {
        p_user_id: 'user-123',
        p_limit: 5
      })
    })

    it('should return empty array if no data', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

      const result = await analyticsService.getMostWornItems()

      expect(result).toEqual([])
    })

    it('should throw error on failure', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' }
      })

      await expect(analyticsService.getMostWornItems()).rejects.toThrow()
    })
  })

  describe('getUnwornItems', () => {
    it('should fetch unworn items', async () => {
      const mockItems = [
        { item_id: 'item-3', category: 'tops' },
        { item_id: 'item-4', category: 'shoes' }
      ]

      mockSupabase.rpc.mockResolvedValue({ data: mockItems, error: null })

      const result = await analyticsService.getUnwornItems()

      expect(result).toEqual(mockItems)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_unworn_combinations', {
        p_user_id: 'user-123'
      })
    })

    it('should return empty array if all items are worn', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

      const result = await analyticsService.getUnwornItems()

      expect(result).toEqual([])
    })
  })

  describe('getStats', () => {
    it('should fetch overall statistics', async () => {
      const mockStats = {
        total_outfits: 50,
        unique_items: 35,
        avg_rating: 4.2
      }

      mockSupabase.rpc.mockResolvedValue({ data: [mockStats], error: null })

      const result = await analyticsService.getStats()

      expect(result).toEqual(mockStats)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_outfit_stats', {
        p_user_id: 'user-123'
      })
    })

    it('should return empty object if no stats', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null })

      const result = await analyticsService.getStats()

      expect(result).toEqual({})
    })
  })

  describe('getCategoryBreakdown', () => {
    it('should calculate category usage', async () => {
      const mockHistory = [
        {
          outfit_items: [
            { category: 'tops', id: 'item-1' },
            { category: 'bottoms', id: 'item-2' }
          ]
        },
        {
          outfit_items: [
            { category: 'tops', id: 'item-3' },
            { category: 'shoes', id: 'item-4' }
          ]
        }
      ]

      const mockQuery = {
        select: vi.fn().mockResolvedValue({ data: mockHistory, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await analyticsService.getCategoryBreakdown()

      expect(result).toEqual({
        tops: 2,
        bottoms: 1,
        shoes: 1
      })
    })

    it('should return empty object if no history', async () => {
      const mockQuery = {
        select: vi.fn().mockResolvedValue({ data: [], error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await analyticsService.getCategoryBreakdown()

      expect(result).toEqual({})
    })

    it('should throw error on failure', async () => {
      const mockQuery = {
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query failed' }
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      await expect(analyticsService.getCategoryBreakdown()).rejects.toThrow()
    })
  })

  describe('getOccasionBreakdown', () => {
    it('should calculate occasion usage', async () => {
      const mockHistory = [
        { occasion: 'work' },
        { occasion: 'work' },
        { occasion: 'casual' },
        { occasion: null }
      ]

      const mockQuery = {
        select: vi.fn().mockResolvedValue({ data: mockHistory, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await analyticsService.getOccasionBreakdown()

      expect(result).toEqual({
        work: 2,
        casual: 1
      })
    })

    it('should return empty object if no occasions', async () => {
      const mockHistory = [{ occasion: null }, { occasion: null }]

      const mockQuery = {
        select: vi.fn().mockResolvedValue({ data: mockHistory, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await analyticsService.getOccasionBreakdown()

      expect(result).toEqual({})
    })
  })

  describe('getRatingDistribution', () => {
    it('should calculate rating distribution', async () => {
      const mockHistory = [
        { rating: 5 },
        { rating: 4 },
        { rating: 5 },
        { rating: 3 },
        { rating: null }
      ]

      const mockQuery = {
        select: vi.fn().mockResolvedValue({ data: mockHistory, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await analyticsService.getRatingDistribution()

      expect(result).toEqual({
        1: 0,
        2: 0,
        3: 1,
        4: 1,
        5: 2
      })
    })

    it('should initialize all rating counts', async () => {
      const mockQuery = {
        select: vi.fn().mockResolvedValue({ data: [], error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await analyticsService.getRatingDistribution()

      expect(result).toEqual({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      })
    })
  })

  describe('getWeatherPreferences', () => {
    it('should calculate weather preferences', async () => {
      const mockHistory = [
        { weather_temp: 20, weather_condition: 'sunny' },
        { weather_temp: 22, weather_condition: 'sunny' },
        { weather_temp: 18, weather_condition: 'cloudy' },
        { weather_temp: null, weather_condition: null }
      ]

      const mockQuery = {
        select: vi.fn().mockResolvedValue({ data: mockHistory, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await analyticsService.getWeatherPreferences()

      expect(result).toEqual({
        avg_temp: 20,
        conditions: {
          sunny: 2,
          cloudy: 1
        }
      })
    })

    it('should handle missing temperature data', async () => {
      const mockHistory = [
        { weather_temp: null, weather_condition: 'rainy' }
      ]

      const mockQuery = {
        select: vi.fn().mockResolvedValue({ data: mockHistory, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await analyticsService.getWeatherPreferences()

      expect(result).toEqual({
        avg_temp: null,
        conditions: { rainy: 1 }
      })
    })

    it('should return empty data for no history', async () => {
      const mockQuery = {
        select: vi.fn().mockResolvedValue({ data: [], error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await analyticsService.getWeatherPreferences()

      expect(result).toEqual({
        avg_temp: null,
        conditions: {}
      })
    })
  })
})
