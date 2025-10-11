/**
 * Outfit Generator Service Unit Tests
 * 
 * Tests for outfit-generator-service.js functionality
 * Covers permutation algorithm, scoring, color harmony, style compatibility
 * Framework: Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock API client
vi.mock('../../src/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

import outfitGeneratorService from '../../src/services/outfit-generator-service'
import apiClient from '../../src/services/api'
import { CATEGORIES, OCCASIONS, WEATHER_CONDITIONS } from '../../src/utils/clothing-constants'

describe('Outfit Generator Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Sample test items
  const createTestItem = (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    name: 'Test Item',
    category: CATEGORIES.TOP,
    primary_color: 'blue',
    color: 'blue',
    style_tags: ['casual'],
    clothing_type: 'T-Shirt',
    thumbnail_url: 'https://example.com/image.jpg',
    image_url: 'https://example.com/image.jpg',
    ...overrides
  })

  describe('generateOutfit', () => {
    it('should generate outfit with minimum required items', async () => {
      const userItems = [
        createTestItem({ category: CATEGORIES.TOP, name: 'Blue T-Shirt' }),
        createTestItem({ category: CATEGORIES.BOTTOM, name: 'Jeans' }),
        createTestItem({ category: CATEGORIES.SHOES, name: 'Sneakers' })
      ]

      apiClient.post.mockResolvedValue({
        data: {
          id: 'outfit-1',
          item_ids: userItems.map(i => i.id),
          ai_score: 80
        }
      })

      const result = await outfitGeneratorService.generateOutfit({
        occasion: OCCASIONS.CASUAL,
        weather: WEATHER_CONDITIONS.WARM,
        userItems
      })

      expect(result).toBeDefined()
      expect(result.items).toHaveLength(3)
      expect(result.score).toBeGreaterThan(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should include outerwear for cold weather', async () => {
      const userItems = [
        createTestItem({ category: CATEGORIES.TOP, name: 'Sweater' }),
        createTestItem({ category: CATEGORIES.BOTTOM, name: 'Jeans' }),
        createTestItem({ category: CATEGORIES.SHOES, name: 'Boots' }),
        createTestItem({ category: CATEGORIES.OUTERWEAR, name: 'Coat' })
      ]

      apiClient.post.mockResolvedValue({
        data: { id: 'outfit-1', item_ids: [], ai_score: 85 }
      })

      const result = await outfitGeneratorService.generateOutfit({
        occasion: OCCASIONS.CASUAL,
        weather: WEATHER_CONDITIONS.COLD,
        userItems
      })

      expect(result.items.some(item => item.category === CATEGORIES.OUTERWEAR)).toBe(true)
    })

    it('should throw error when insufficient items', async () => {
      const userItems = [
        createTestItem({ category: CATEGORIES.TOP, name: 'T-Shirt' })
      ]

      await expect(
        outfitGeneratorService.generateOutfit({
          occasion: OCCASIONS.CASUAL,
          weather: WEATHER_CONDITIONS.WARM,
          userItems
        })
      ).rejects.toThrow('Not enough items')
    })

    it('should filter by style preference', async () => {
      const userItems = [
        createTestItem({ 
          category: CATEGORIES.TOP, 
          name: 'Formal Shirt',
          style_tags: ['formal', 'business']
        }),
        createTestItem({ 
          category: CATEGORIES.TOP, 
          name: 'Casual T-Shirt',
          style_tags: ['casual']
        }),
        createTestItem({ 
          category: CATEGORIES.BOTTOM, 
          name: 'Dress Pants',
          style_tags: ['formal', 'business']
        }),
        createTestItem({ 
          category: CATEGORIES.SHOES, 
          name: 'Dress Shoes',
          style_tags: ['formal']
        })
      ]

      apiClient.post.mockResolvedValue({
        data: { id: 'outfit-1', item_ids: [], ai_score: 90 }
      })

      const result = await outfitGeneratorService.generateOutfit({
        occasion: OCCASIONS.WORK,
        weather: WEATHER_CONDITIONS.WARM,
        style: 'formal',
        userItems
      })

      expect(result.items).toBeDefined()
      // Should prefer formal items over casual
      const hasFormalTop = result.items.some(i => 
        i.category === CATEGORIES.TOP && i.style_tags?.includes('formal')
      )
      expect(hasFormalTop).toBe(true)
    })

    it('should work with dress as top+bottom replacement', async () => {
      const userItems = [
        createTestItem({ 
          category: CATEGORIES.TOP, 
          name: 'Summer Dress',
          clothing_type: 'Dress'
        }),
        createTestItem({ category: CATEGORIES.SHOES, name: 'Sandals' })
      ]

      apiClient.post.mockResolvedValue({
        data: { id: 'outfit-1', item_ids: [], ai_score: 85 }
      })

      const result = await outfitGeneratorService.generateOutfit({
        occasion: OCCASIONS.DATE,
        weather: WEATHER_CONDITIONS.HOT,
        userItems
      })

      expect(result.items).toHaveLength(2)
      expect(result.items.some(i => i.clothing_type === 'Dress')).toBe(true)
    })
  })

  describe('filterByWeather', () => {
    it('should avoid outerwear in hot weather', () => {
      const items = [
        createTestItem({ category: CATEGORIES.TOP }),
        createTestItem({ category: CATEGORIES.OUTERWEAR, name: 'Jacket' })
      ]

      const filtered = outfitGeneratorService.filterByWeather(
        items,
        WEATHER_CONDITIONS.HOT
      )

      expect(filtered.some(i => i.category === CATEGORIES.OUTERWEAR)).toBe(false)
    })

    it('should allow all items in warm weather', () => {
      const items = [
        createTestItem({ category: CATEGORIES.TOP }),
        createTestItem({ category: CATEGORIES.OUTERWEAR })
      ]

      const filtered = outfitGeneratorService.filterByWeather(
        items,
        WEATHER_CONDITIONS.WARM
      )

      expect(filtered.length).toBeGreaterThan(0)
    })
  })

  describe('generateCombinations', () => {
    it('should generate valid combinations with one item per category', () => {
      const items = [
        createTestItem({ id: 't1', category: CATEGORIES.TOP }),
        createTestItem({ id: 't2', category: CATEGORIES.TOP }),
        createTestItem({ id: 'b1', category: CATEGORIES.BOTTOM }),
        createTestItem({ id: 's1', category: CATEGORIES.SHOES })
      ]

      const combinations = outfitGeneratorService.generateCombinations(items)

      expect(combinations.length).toBeGreaterThan(0)
      
      // Check each combination has unique categories
      combinations.forEach(combo => {
        const categories = combo.map(item => item.category)
        const uniqueCategories = [...new Set(categories)]
        expect(categories.length).toBe(uniqueCategories.length)
      })
    })

    it('should limit combinations to prevent performance issues', () => {
      const items = []
      
      // Create many items
      for (let i = 0; i < 20; i++) {
        items.push(createTestItem({ id: `t${i}`, category: CATEGORIES.TOP }))
        items.push(createTestItem({ id: `b${i}`, category: CATEGORIES.BOTTOM }))
        items.push(createTestItem({ id: `s${i}`, category: CATEGORIES.SHOES }))
      }

      const combinations = outfitGeneratorService.generateCombinations(items)

      // Should limit to reasonable number
      expect(combinations.length).toBeLessThanOrEqual(100)
    })

    it('should return empty array with insufficient items', () => {
      const items = [
        createTestItem({ category: CATEGORIES.TOP })
      ]

      const combinations = outfitGeneratorService.generateCombinations(items)

      expect(combinations).toEqual([])
    })
  })

  describe('scoreOutfit', () => {
    it('should score complete outfit higher than incomplete', () => {
      const completeOutfit = [
        createTestItem({ category: CATEGORIES.TOP }),
        createTestItem({ category: CATEGORIES.BOTTOM }),
        createTestItem({ category: CATEGORIES.SHOES }),
        createTestItem({ category: CATEGORIES.OUTERWEAR })
      ]

      const incompleteOutfit = [
        createTestItem({ category: CATEGORIES.TOP }),
        createTestItem({ category: CATEGORIES.SHOES })
      ]

      const completeScore = outfitGeneratorService.scoreOutfit(completeOutfit)
      const incompleteScore = outfitGeneratorService.scoreOutfit(incompleteOutfit)

      expect(completeScore).toBeGreaterThan(incompleteScore)
    })

    it('should return score between 0 and 100', () => {
      const outfit = [
        createTestItem({ category: CATEGORIES.TOP }),
        createTestItem({ category: CATEGORIES.BOTTOM }),
        createTestItem({ category: CATEGORIES.SHOES })
      ]

      const score = outfitGeneratorService.scoreOutfit(outfit)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })

  describe('scoreColorHarmony', () => {
    it('should score monochromatic outfits highly', () => {
      const items = [
        createTestItem({ primary_color: 'blue', color: 'blue' }),
        createTestItem({ primary_color: 'blue', color: 'blue' }),
        createTestItem({ primary_color: 'blue', color: 'blue' })
      ]

      const score = outfitGeneratorService.scoreColorHarmony(items)

      expect(score).toBeGreaterThan(0.9)
    })

    it('should score neutral combinations highly', () => {
      const items = [
        createTestItem({ primary_color: 'black', color: 'black' }),
        createTestItem({ primary_color: 'white', color: 'white' }),
        createTestItem({ primary_color: 'gray', color: 'gray' })
      ]

      const score = outfitGeneratorService.scoreColorHarmony(items)

      expect(score).toBeGreaterThan(0.8)
    })

    it('should score complementary colors well', () => {
      const items = [
        createTestItem({ primary_color: 'blue', color: 'blue' }),
        createTestItem({ primary_color: 'orange', color: 'orange' }),
        createTestItem({ primary_color: 'white', color: 'white' })
      ]

      const score = outfitGeneratorService.scoreColorHarmony(items)

      expect(score).toBeGreaterThan(0.7)
    })

    it('should handle missing color data', () => {
      const items = [
        createTestItem({ primary_color: null, color: null }),
        createTestItem({ primary_color: undefined, color: undefined })
      ]

      const score = outfitGeneratorService.scoreColorHarmony(items)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(1)
    })
  })

  describe('scoreStyleConsistency', () => {
    it('should score same style highly', () => {
      const items = [
        createTestItem({ style_tags: ['casual'] }),
        createTestItem({ style_tags: ['casual'] }),
        createTestItem({ style_tags: ['casual'] })
      ]

      const score = outfitGeneratorService.scoreStyleConsistency(items)

      expect(score).toBe(1.0)
    })

    it('should score compatible styles well', () => {
      const items = [
        createTestItem({ style_tags: ['casual'] }),
        createTestItem({ style_tags: ['sporty'] }),
        createTestItem({ style_tags: ['street'] })
      ]

      const score = outfitGeneratorService.scoreStyleConsistency(items)

      expect(score).toBeGreaterThan(0.5)
    })

    it('should score incompatible styles lower', () => {
      const items = [
        createTestItem({ style_tags: ['formal'] }),
        createTestItem({ style_tags: ['sporty'] }),
        createTestItem({ style_tags: ['casual'] })
      ]

      const score = outfitGeneratorService.scoreStyleConsistency(items)

      expect(score).toBeLessThanOrEqual(0.8)
    })

    it('should handle missing style tags', () => {
      const items = [
        createTestItem({ style_tags: [] }),
        createTestItem({ style_tags: null }),
        createTestItem({ style_tags: undefined })
      ]

      const score = outfitGeneratorService.scoreStyleConsistency(items)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(1)
    })
  })

  describe('scoreCompleteness', () => {
    it('should score required categories as complete', () => {
      const outfit = [
        createTestItem({ category: CATEGORIES.TOP }),
        createTestItem({ category: CATEGORIES.BOTTOM }),
        createTestItem({ category: CATEGORIES.SHOES })
      ]

      const score = outfitGeneratorService.scoreCompleteness(outfit)

      expect(score).toBeGreaterThanOrEqual(0.8)
    })

    it('should give bonus for outerwear', () => {
      const withOuterwear = [
        createTestItem({ category: CATEGORIES.TOP }),
        createTestItem({ category: CATEGORIES.BOTTOM }),
        createTestItem({ category: CATEGORIES.SHOES }),
        createTestItem({ category: CATEGORIES.OUTERWEAR })
      ]

      const withoutOuterwear = [
        createTestItem({ category: CATEGORIES.TOP }),
        createTestItem({ category: CATEGORIES.BOTTOM }),
        createTestItem({ category: CATEGORIES.SHOES })
      ]

      const scoreWith = outfitGeneratorService.scoreCompleteness(withOuterwear)
      const scoreWithout = outfitGeneratorService.scoreCompleteness(withoutOuterwear)

      expect(scoreWith).toBeGreaterThan(scoreWithout)
    })

    it('should accept dress as top+bottom', () => {
      const dressOutfit = [
        createTestItem({ 
          category: CATEGORIES.TOP, 
          clothing_type: 'Dress' 
        }),
        createTestItem({ category: CATEGORIES.SHOES })
      ]

      const score = outfitGeneratorService.scoreCompleteness(dressOutfit)

      expect(score).toBeGreaterThan(0.5)
    })
  })

  describe('detectColorScheme', () => {
    it('should detect monochromatic scheme', () => {
      const items = [
        createTestItem({ primary_color: 'blue', color: 'blue' }),
        createTestItem({ primary_color: 'blue', color: 'blue' })
      ]

      const scheme = outfitGeneratorService.detectColorScheme(items)

      expect(scheme).toBe('monochromatic')
    })

    it('should detect neutral scheme', () => {
      const items = [
        createTestItem({ primary_color: 'black', color: 'black' }),
        createTestItem({ primary_color: 'white', color: 'white' }),
        createTestItem({ primary_color: 'gray', color: 'gray' })
      ]

      const scheme = outfitGeneratorService.detectColorScheme(items)

      expect(scheme).toBe('neutral')
    })

    it('should detect complementary scheme', () => {
      const items = [
        createTestItem({ primary_color: 'blue', color: 'blue' }),
        createTestItem({ primary_color: 'orange', color: 'orange' })
      ]

      const scheme = outfitGeneratorService.detectColorScheme(items)

      expect(scheme).toBe('complementary')
    })

    it('should detect analogous scheme', () => {
      const items = [
        createTestItem({ primary_color: 'red', color: 'red' }),
        createTestItem({ primary_color: 'orange', color: 'orange' })
      ]

      const scheme = outfitGeneratorService.detectColorScheme(items)

      expect(scheme).toBe('analogous')
    })

    it('should default to mixed for unclear schemes', () => {
      const items = [
        createTestItem({ primary_color: 'red', color: 'red' }),
        createTestItem({ primary_color: 'green', color: 'green' }),
        createTestItem({ primary_color: 'purple', color: 'purple' })
      ]

      const scheme = outfitGeneratorService.detectColorScheme(items)

      expect(['mixed', 'complementary', 'analogous']).toContain(scheme)
    })
  })

  describe('detectStyleTheme', () => {
    it('should detect dominant style', () => {
      const items = [
        createTestItem({ style_tags: ['casual'] }),
        createTestItem({ style_tags: ['casual'] }),
        createTestItem({ style_tags: ['formal'] })
      ]

      const theme = outfitGeneratorService.detectStyleTheme(items)

      expect(theme).toBe('casual')
    })

    it('should default to casual for no style tags', () => {
      const items = [
        createTestItem({ style_tags: [] }),
        createTestItem({ style_tags: [] })
      ]

      const theme = outfitGeneratorService.detectStyleTheme(items)

      expect(theme).toBe('casual')
    })
  })

  describe('API integration', () => {
    it('should call rate endpoint with correct params', async () => {
      apiClient.post.mockResolvedValue({
        data: { success: true }
      })

      await outfitGeneratorService.rateOutfit('outfit-1', 5)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/outfits/outfit-1/rate',
        { rating: 5 }
      )
    })

    it('should call save endpoint with correct params', async () => {
      apiClient.post.mockResolvedValue({
        data: { success: true }
      })

      await outfitGeneratorService.saveOutfit('outfit-1', 'collection-1')

      expect(apiClient.post).toHaveBeenCalledWith(
        '/outfits/outfit-1/save',
        { collection_id: 'collection-1' }
      )
    })

    it('should fetch suggested outfits', async () => {
      apiClient.get.mockResolvedValue({
        data: { outfits: [] }
      })

      await outfitGeneratorService.getSuggestedOutfits({ limit: 10 })

      expect(apiClient.get).toHaveBeenCalledWith(
        '/outfits/suggested',
        { params: { limit: 10 } }
      )
    })

    it('should handle API errors gracefully', async () => {
      apiClient.post.mockRejectedValue(new Error('API Error'))

      await expect(
        outfitGeneratorService.rateOutfit('outfit-1', 5)
      ).rejects.toThrow()
    })
  })

  describe('Color utility functions', () => {
    it('should get complementary colors correctly', () => {
      expect(outfitGeneratorService.getComplementaryColor('red')).toBe('green')
      expect(outfitGeneratorService.getComplementaryColor('blue')).toBe('orange')
      expect(outfitGeneratorService.getComplementaryColor('yellow')).toBe('purple')
    })

    it('should get analogous colors correctly', () => {
      const redAnalogous = outfitGeneratorService.getAnalogousColors('red')
      expect(redAnalogous).toContain('orange')
      expect(redAnalogous).toContain('pink')

      const blueAnalogous = outfitGeneratorService.getAnalogousColors('blue')
      expect(blueAnalogous).toContain('teal')
      expect(blueAnalogous).toContain('purple')
    })

    it('should handle unknown colors gracefully', () => {
      const comp = outfitGeneratorService.getComplementaryColor('unknown')
      expect(comp).toBe('unknown')

      const analog = outfitGeneratorService.getAnalogousColors('unknown')
      expect(analog).toEqual([])
    })
  })

  describe('Edge cases', () => {
    it('should handle empty user items', async () => {
      await expect(
        outfitGeneratorService.generateOutfit({
          occasion: OCCASIONS.CASUAL,
          weather: WEATHER_CONDITIONS.WARM,
          userItems: []
        })
      ).rejects.toThrow()
    })

    it('should handle items with missing properties', async () => {
      const items = [
        { id: '1', category: CATEGORIES.TOP },
        { id: '2', category: CATEGORIES.BOTTOM },
        { id: '3', category: CATEGORIES.SHOES }
      ]

      apiClient.post.mockResolvedValue({
        data: { id: 'outfit-1', item_ids: [], ai_score: 70 }
      })

      const result = await outfitGeneratorService.generateOutfit({
        occasion: OCCASIONS.CASUAL,
        weather: WEATHER_CONDITIONS.WARM,
        userItems: items
      })

      expect(result).toBeDefined()
    })

    it('should continue even if API save fails', async () => {
      const items = [
        createTestItem({ category: CATEGORIES.TOP }),
        createTestItem({ category: CATEGORIES.BOTTOM }),
        createTestItem({ category: CATEGORIES.SHOES })
      ]

      apiClient.post.mockRejectedValue(new Error('API Error'))

      const result = await outfitGeneratorService.generateOutfit({
        occasion: OCCASIONS.CASUAL,
        weather: WEATHER_CONDITIONS.WARM,
        userItems: items
      })

      // Should still return outfit even if save fails
      expect(result).toBeDefined()
      expect(result.items).toBeDefined()
    })
  })
})
