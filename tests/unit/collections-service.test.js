/**
 * Collections Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import collectionsService from '../../src/services/collections-service'

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

describe('Collections Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    })
  })

  describe('createCollection', () => {
    it('should create a new collection', async () => {
      const collectionData = {
        name: 'Summer 2024',
        description: 'Light and airy outfits'
      }
      const mockCollection = {
        id: 'collection-1',
        user_id: 'user-123',
        ...collectionData
      }

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCollection, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await collectionsService.createCollection(collectionData)

      expect(result).toEqual(mockCollection)
      expect(mockSupabase.from).toHaveBeenCalledWith('outfit_collections')
      expect(mockQuery.insert).toHaveBeenCalledWith([{
        user_id: 'user-123',
        ...collectionData
      }])
    })

    it('should throw error on create failure', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Create failed' }
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      await expect(collectionsService.createCollection({})).rejects.toThrow()
    })
  })

  describe('getCollections', () => {
    it('should fetch user collections', async () => {
      const mockCollections = [
        { id: 'collection-1', name: 'Summer 2024' },
        { id: 'collection-2', name: 'Winter 2024' }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockCollections, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await collectionsService.getCollections()

      expect(result).toEqual(mockCollections)
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should return empty array if no collections', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await collectionsService.getCollections()

      expect(result).toEqual([])
    })
  })

  describe('getCollection', () => {
    it('should fetch specific collection with outfits', async () => {
      const mockCollection = {
        id: 'collection-1',
        name: 'Summer 2024'
      }
      const mockOutfits = [
        { id: 'outfit-1', position: 0 },
        { id: 'outfit-2', position: 1 }
      ]

      let callCount = 0
      mockSupabase.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: get collection
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockCollection, error: null })
          }
        } else {
          // Second call: get outfits
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockOutfits, error: null })
          }
        }
      })

      const result = await collectionsService.getCollection('collection-1')

      expect(result).toEqual({
        ...mockCollection,
        outfits: mockOutfits
      })
    })

    it('should throw error if collection not found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      await expect(collectionsService.getCollection('invalid')).rejects.toThrow()
    })
  })

  describe('updateCollection', () => {
    it('should update collection', async () => {
      const updates = { name: 'Updated Name' }
      const mockUpdated = {
        id: 'collection-1',
        ...updates
      }

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdated, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await collectionsService.updateCollection('collection-1', updates)

      expect(result).toEqual(mockUpdated)
      expect(mockQuery.update).toHaveBeenCalledWith(updates)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'collection-1')
    })
  })

  describe('deleteCollection', () => {
    it('should delete collection', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      await collectionsService.deleteCollection('collection-1')

      expect(mockSupabase.from).toHaveBeenCalledWith('outfit_collections')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'collection-1')
    })
  })

  describe('addOutfitToCollection', () => {
    it('should add outfit to empty collection', async () => {
      const outfitData = {
        outfit_data: { items: ['item1', 'item2'] }
      }
      const mockOutfit = {
        id: 'outfit-1',
        collection_id: 'collection-1',
        position: 0,
        ...outfitData
      }

      let callCount = 0
      mockSupabase.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: check existing positions
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: null, error: null })
          }
        } else {
          // Second call: insert outfit
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockOutfit, error: null })
          }
        }
      })

      const result = await collectionsService.addOutfitToCollection('collection-1', outfitData)

      expect(result).toEqual(mockOutfit)
      expect(result.position).toBe(0)
    })

    it('should add outfit to collection with existing outfits', async () => {
      const outfitData = {
        outfit_data: { items: ['item3', 'item4'] }
      }

      let callCount = 0
      mockSupabase.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: check existing positions
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({
              data: [{ position: 2 }],
              error: null
            })
          }
        } else {
          // Second call: insert outfit
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { ...outfitData, position: 3 },
              error: null
            })
          }
        }
      })

      const result = await collectionsService.addOutfitToCollection('collection-1', outfitData)

      expect(result.position).toBe(3)
    })
  })

  describe('removeOutfitFromCollection', () => {
    it('should remove outfit from collection', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      await collectionsService.removeOutfitFromCollection('outfit-1')

      expect(mockSupabase.from).toHaveBeenCalledWith('collection_outfits')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'outfit-1')
    })
  })

  describe('updateCollectionOutfit', () => {
    it('should update outfit in collection', async () => {
      const updates = { notes: 'Updated notes' }
      const mockUpdated = {
        id: 'outfit-1',
        ...updates
      }

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdated, error: null })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await collectionsService.updateCollectionOutfit('outfit-1', updates)

      expect(result).toEqual(mockUpdated)
      expect(mockQuery.update).toHaveBeenCalledWith(updates)
    })
  })

  describe('reorderOutfits', () => {
    it('should reorder outfits in collection', async () => {
      const outfitIds = ['outfit-3', 'outfit-1', 'outfit-2']

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockQuery.eq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
      mockSupabase.from.mockReturnValue(mockQuery)

      await collectionsService.reorderOutfits('collection-1', outfitIds)

      expect(mockQuery.update).toHaveBeenCalledTimes(3)
      expect(mockQuery.update).toHaveBeenCalledWith({ position: 0 })
      expect(mockQuery.update).toHaveBeenCalledWith({ position: 1 })
      expect(mockQuery.update).toHaveBeenCalledWith({ position: 2 })
    })
  })

  describe('toggleFavorite', () => {
    it('should toggle collection favorite status to true', async () => {
      let callCount = 0
      mockSupabase.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: get current status
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { is_favorite: false },
              error: null
            })
          }
        } else {
          // Second call: update
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'collection-1', is_favorite: true },
              error: null
            })
          }
        }
      })

      const result = await collectionsService.toggleFavorite('collection-1')

      expect(result.is_favorite).toBe(true)
    })

    it('should toggle collection favorite status to false', async () => {
      let callCount = 0
      mockSupabase.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: get current status
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { is_favorite: true },
              error: null
            })
          }
        } else {
          // Second call: update
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'collection-1', is_favorite: false },
              error: null
            })
          }
        }
      })

      const result = await collectionsService.toggleFavorite('collection-1')

      expect(result.is_favorite).toBe(false)
    })
  })
})
