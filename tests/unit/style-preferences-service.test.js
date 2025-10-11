/**
 * Style Preferences Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import stylePreferencesService from '../../src/services/style-preferences-service'

// Mock supabase
vi.mock('../../src/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn()
  }
}))

import { supabase as mockSupabase } from '../../src/config/supabase'

describe('Style Preferences Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    })
  })

  describe('getPreferences', () => {
    it('should fetch user preferences', async () => {
      const mockPreferences = {
        user_id: 'user-123',
        favorite_colors: ['blue', 'green'],
        favorite_styles: ['casual', 'streetwear']
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPreferences, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.getPreferences()

      expect(result).toEqual(mockPreferences)
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

    it('should throw error for unexpected errors', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'ERROR', message: 'Database error' }
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      await expect(stylePreferencesService.getPreferences()).rejects.toThrow()
    })
  })

  describe('updatePreferences', () => {
    it('should update existing preferences', async () => {
      const preferences = {
        favorite_colors: ['red', 'black'],
        favorite_styles: ['formal']
      }
      const mockUpdated = {
        user_id: 'user-123',
        ...preferences
      }

      let callCount = 0
      mockSupabase.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: check if exists
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { user_id: 'user-123' },
              error: null
            })
          }
        } else {
          // Second call: update
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockUpdated, error: null })
          }
        }
      })

      const result = await stylePreferencesService.updatePreferences(preferences)

      expect(result).toEqual(mockUpdated)
    })

    it('should create new preferences if none exist', async () => {
      const preferences = {
        favorite_colors: ['yellow'],
        favorite_styles: ['vintage']
      }
      const mockCreated = {
        user_id: 'user-123',
        ...preferences
      }

      let callCount = 0
      mockSupabase.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: check if exists
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null })
          }
        } else {
          // Second call: insert
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockCreated, error: null })
          }
        }
      })

      const result = await stylePreferencesService.updatePreferences(preferences)

      expect(result).toEqual(mockCreated)
    })
  })

  describe('submitFeedback', () => {
    it('should submit feedback for a suggestion', async () => {
      const mockFeedback = {
        user_id: 'user-123',
        suggestion_id: 'suggestion-1',
        feedback_type: 'like',
        feedback_reason: 'Great combination'
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
        'Great combination'
      )

      expect(result).toEqual(mockFeedback)
      expect(mockQuery.upsert).toHaveBeenCalledWith([{
        user_id: 'user-123',
        suggestion_id: 'suggestion-1',
        feedback_type: 'like',
        feedback_reason: 'Great combination'
      }], {
        onConflict: 'user_id,suggestion_id'
      })
    })

    it('should submit feedback without reason', async () => {
      const mockFeedback = {
        user_id: 'user-123',
        suggestion_id: 'suggestion-2',
        feedback_type: 'dislike',
        feedback_reason: null
      }

      const mockQuery = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFeedback, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.submitFeedback('suggestion-2', 'dislike')

      expect(result.feedback_reason).toBeNull()
    })
  })

  describe('getFeedback', () => {
    it('should fetch feedback for specific suggestion', async () => {
      const mockFeedback = {
        user_id: 'user-123',
        suggestion_id: 'suggestion-1',
        feedback_type: 'love'
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockQuery.eq.mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFeedback, error: null })
      })
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.getFeedback('suggestion-1')

      expect(result).toEqual(mockFeedback)
    })

    it('should return null if no feedback exists', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockQuery.eq.mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      })
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.getFeedback('suggestion-1')

      expect(result).toBeNull()
    })
  })

  describe('getAllFeedback', () => {
    it('should fetch all user feedback', async () => {
      const mockFeedback = [
        { suggestion_id: 'suggestion-1', feedback_type: 'like' },
        { suggestion_id: 'suggestion-2', feedback_type: 'dislike' }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockFeedback, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.getAllFeedback()

      expect(result).toEqual(mockFeedback)
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should return empty array if no feedback', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await stylePreferencesService.getAllFeedback()

      expect(result).toEqual([])
    })
  })

  describe('deleteFeedback', () => {
    it('should delete feedback for suggestion', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockQuery.eq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
      mockSupabase.from.mockReturnValue(mockQuery)

      await stylePreferencesService.deleteFeedback('suggestion-1')

      expect(mockSupabase.from).toHaveBeenCalledWith('suggestion_feedback')
      expect(mockQuery.delete).toHaveBeenCalled()
    })

    it('should throw error on delete failure', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockQuery.eq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
      })
      mockSupabase.from.mockReturnValue(mockQuery)

      await expect(stylePreferencesService.deleteFeedback('suggestion-1')).rejects.toThrow()
    })
  })
})
