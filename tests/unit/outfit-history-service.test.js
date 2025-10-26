/**
 * Outfit History Service Unit Tests
 * 
 * Tests for outfit-history-service.js functionality
 * Framework: Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Supabase
vi.mock('../../src/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(),
    rpc: vi.fn()
  }
}))

import outfitHistoryService from '../../src/services/outfit-history-service'

// Get mock instance
import { supabase as mockSupabase } from '../../src/config/supabase'

describe('Outfit History Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('recordOutfit', () => {
    it('should record a worn outfit', async () => {
      const mockOutfit = {
        outfit_items: ['item-1', 'item-2'],
        occasion: 'work',
        worn_date: '2024-01-01',
        rating: 5
      }

      const mockResult = {
        id: 'history-1',
        ...mockOutfit,
        created_at: '2024-01-01T10:00:00Z'
      }

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      const result = await outfitHistoryService.recordOutfit(mockOutfit)

      expect(result).toEqual(mockResult)
      expect(mockSupabase.from).toHaveBeenCalledWith('outfit_history')
      expect(mockInsert.insert).toHaveBeenCalledWith([mockOutfit])
    })

    it('should throw error on database error', async () => {
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }
      mockSupabase.from.mockReturnValue(mockInsert)

      await expect(outfitHistoryService.recordOutfit({})).rejects.toThrow()
    })
  })

  describe('getHistory', () => {
    it('should fetch outfit history with default options', async () => {
      const mockHistory = [
        { id: 'h1', worn_date: '2024-01-02', occasion: 'work' },
        { id: 'h2', worn_date: '2024-01-01', occasion: 'casual' }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis()
      }
      mockQuery.order.mockResolvedValue({ data: mockHistory, error: null })
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await outfitHistoryService.getHistory()

      expect(result).toEqual(mockHistory)
      expect(mockQuery.order).toHaveBeenCalledWith('worn_date', { ascending: false })
    })

    it('should filter by occasion', async () => {
      const mockHistory = [
        { id: 'h1', worn_date: '2024-01-02', occasion: 'work' }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockQuery.eq.mockResolvedValue({ data: mockHistory, error: null })
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await outfitHistoryService.getHistory({ occasion: 'work' })

      expect(mockQuery.eq).toHaveBeenCalledWith('occasion', 'work')
      expect(result).toEqual(mockHistory)
    })

    it('should filter by minimum rating', async () => {
      const mockHistory = [
        { id: 'h1', rating: 5 },
        { id: 'h2', rating: 4 }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis()
      }
      mockQuery.gte.mockResolvedValue({ data: mockHistory, error: null })
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await outfitHistoryService.getHistory({ rating_min: 4 })

      expect(mockQuery.gte).toHaveBeenCalledWith('rating', 4)
      expect(result).toEqual(mockHistory)
    })

    it('should apply limit and offset for pagination', async () => {
      const mockHistory = [{ id: 'h1' }]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis()
      }
      mockQuery.range.mockResolvedValue({ data: mockHistory, error: null })
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await outfitHistoryService.getHistory({ limit: 10, offset: 20 })

      expect(mockQuery.limit).toHaveBeenCalledWith(10)
      expect(mockQuery.range).toHaveBeenCalledWith(20, 29)
      expect(result).toEqual(mockHistory)
    })
  })

  describe('getHistoryEntry', () => {
    it('should fetch specific history entry', async () => {
      const mockEntry = {
        id: 'history-1',
        worn_date: '2024-01-01',
        occasion: 'work'
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockEntry, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await outfitHistoryService.getHistoryEntry('history-1')

      expect(result).toEqual(mockEntry)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'history-1')
    })

    it('should throw error if entry not found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      await expect(outfitHistoryService.getHistoryEntry('invalid')).rejects.toThrow()
    })
  })

  describe('updateHistory', () => {
    it('should update history entry', async () => {
      const updates = { rating: 5, notes: 'Great outfit!' }
      const mockUpdated = {
        id: 'history-1',
        ...updates
      }

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdated, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await outfitHistoryService.updateHistory('history-1', updates)

      expect(result).toEqual(mockUpdated)
      expect(mockQuery.update).toHaveBeenCalledWith(updates)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'history-1')
    })

    it('should throw error on update failure', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update failed' }
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      await expect(outfitHistoryService.updateHistory('history-1', {})).rejects.toThrow()
    })
  })

  describe('deleteHistory', () => {
    it('should delete history entry', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockQuery.eq.mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue(mockQuery)

      await outfitHistoryService.deleteHistory('history-1')

      expect(mockSupabase.from).toHaveBeenCalledWith('outfit_history')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'history-1')
    })

    it('should throw error on delete failure', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockQuery.eq.mockResolvedValue({ error: { message: 'Delete failed' } })
      mockSupabase.from.mockReturnValue(mockQuery)

      await expect(outfitHistoryService.deleteHistory('history-1')).rejects.toThrow()
    })
  })

  describe('getStats', () => {
    it('should fetch user outfit statistics', async () => {
      const mockUser = { user: { id: 'user-123' } }
      const mockStats = {
        total_outfits_worn: 50,
        avg_rating: 4.5,
        most_worn_occasion: 'work',
        favorite_season: 'spring'
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({
        data: [mockStats],
        error: null
      })

      const result = await outfitHistoryService.getStats()

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

      const result = await outfitHistoryService.getStats()

      expect(result).toEqual({})
    })
  })

  describe('getMostWornItems', () => {
    it('should fetch most worn items', async () => {
      const mockUser = { user: { id: 'user-123' } }
      const mockItems = [
        { item_id: 'item-1', wear_count: 20, name: 'Blue Shirt' },
        { item_id: 'item-2', wear_count: 15, name: 'Black Jeans' }
      ]

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({
        data: mockItems,
        error: null
      })

      const result = await outfitHistoryService.getMostWornItems(10)

      expect(result).toEqual(mockItems)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_most_worn_items', {
        p_user_id: 'user-123',
        p_limit: 10
      })
    })

    it('should use default limit of 10', async () => {
      const mockUser = { user: { id: 'user-123' } }

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null
      })

      await outfitHistoryService.getMostWornItems()

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_most_worn_items', {
        p_user_id: 'user-123',
        p_limit: 10
      })
    })

    it('should return empty array on error', async () => {
      const mockUser = { user: { id: 'user-123' } }

      mockSupabase.auth.getUser.mockResolvedValue({ data: mockUser })
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' }
      })

      await expect(outfitHistoryService.getMostWornItems()).rejects.toThrow()
    })
  })
})
