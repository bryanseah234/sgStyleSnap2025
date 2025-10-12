/**
 * Catalog Integration Tests
 * 
 * Tests for catalog browsing, searching, filtering, and adding to closet
 * 
 * Coverage:
 * - catalogService methods
 * - useCatalogStore state management
 * - Pagination
 * - Filtering (category, color, brand, season, style)
 * - Search functionality
 * - Add to closet
 * - Quota validation
 * - Privacy (anonymous display)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCatalogStore } from '../../src/stores/catalog-store'
import catalogService from '../../src/services/catalog-service'

// Mock Supabase
vi.mock('../../src/config/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            ilike: vi.fn(() => ({
              contains: vi.fn(() => ({
                range: vi.fn(() => ({
                  order: vi.fn(() => ({
                    then: vi.fn()
                  }))
                }))
              }))
            }))
          })),
          ilike: vi.fn(() => ({
            range: vi.fn(() => ({
              order: vi.fn(() => ({
                then: vi.fn()
              }))
            }))
          })),
          contains: vi.fn(() => ({
            range: vi.fn(() => ({
              order: vi.fn(() => ({
                then: vi.fn()
              }))
            }))
          })),
          range: vi.fn(() => ({
            order: vi.fn(() => ({
              then: vi.fn()
            }))
          })),
          order: vi.fn(() => ({
            then: vi.fn()
          }))
        })),
        range: vi.fn(() => ({
          order: vi.fn(() => ({
            then: vi.fn()
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      textSearch: vi.fn(() => ({
        eq: vi.fn(() => ({
          range: vi.fn(() => ({
            order: vi.fn(() => ({
              then: vi.fn()
            }))
          }))
        }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null
      }))
    }
  }
}))

describe('Catalog Service', () => {
  describe('browse()', () => {
    it('should fetch catalog items with default options', async () => {
      const mockItems = [
        { id: '1', name: 'Blue Jeans', category: 'bottom', is_active: true },
        { id: '2', name: 'Red Shirt', category: 'top', is_active: true }
      ]

      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: mockItems,
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
      })

      const result = await catalogService.browse()

      expect(result.items).toEqual(mockItems)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(20)
      expect(catalogService.browse).toHaveBeenCalledWith()
    })

    it('should filter by category', async () => {
      const mockTopItems = [
        { id: '1', name: 'Red Shirt', category: 'top', is_active: true }
      ]

      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: mockTopItems,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      })

      const result = await catalogService.browse({ category: 'top' })

      expect(result.items).toHaveLength(1)
      expect(result.items[0].category).toBe('top')
      expect(catalogService.browse).toHaveBeenCalledWith({ category: 'top' })
    })

    it('should filter by color', async () => {
      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: [{ id: '1', name: 'Blue Jeans', color: 'blue' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      })

      const result = await catalogService.browse({ color: 'blue' })

      expect(result.items[0].color).toBe('blue')
      expect(catalogService.browse).toHaveBeenCalledWith({ color: 'blue' })
    })

    it('should filter by brand', async () => {
      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: [{ id: '1', name: 'Levis Jeans', brand: "Levi's" }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      })

      const result = await catalogService.browse({ brand: 'Levi' })

      expect(result.items[0].brand).toBe("Levi's")
      expect(catalogService.browse).toHaveBeenCalledWith({ brand: 'Levi' })
    })

    it('should filter by season', async () => {
      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: [{ id: '1', name: 'Winter Coat', season: 'winter' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      })

      const result = await catalogService.browse({ season: 'winter' })

      expect(result.items[0].season).toBe('winter')
      expect(catalogService.browse).toHaveBeenCalledWith({ season: 'winter' })
    })

    it('should filter by style', async () => {
      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: [{ id: '1', name: 'Formal Shirt', style: ['formal'] }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      })

      const result = await catalogService.browse({ style: 'formal' })

      expect(result.items[0].style).toContain('formal')
      expect(catalogService.browse).toHaveBeenCalledWith({ style: 'formal' })
    })

    it('should support pagination', async () => {
      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: [],
        pagination: { page: 2, limit: 20, total: 100, totalPages: 5 }
      })

      const result = await catalogService.browse({ page: 2, limit: 20 })

      expect(result.pagination.page).toBe(2)
      expect(result.pagination.totalPages).toBe(5)
      expect(catalogService.browse).toHaveBeenCalledWith({ page: 2, limit: 20 })
    })

    it('should apply multiple filters simultaneously', async () => {
      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: [
          { id: '1', name: 'Blue Formal Shirt', category: 'top', color: 'blue', style: ['formal'] }
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      })

      const result = await catalogService.browse({
        category: 'top',
        color: 'blue',
        style: 'formal'
      })

      expect(result.items[0]).toMatchObject({
        category: 'top',
        color: 'blue',
        style: ['formal']
      })
    })

    it('should handle empty results', async () => {
      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      })

      const result = await catalogService.browse({ color: 'nonexistent' })

      expect(result.items).toEqual([])
      expect(result.pagination.total).toBe(0)
    })

    it('should handle errors gracefully', async () => {
      vi.spyOn(catalogService, 'browse').mockRejectedValue(
        new Error('Database connection failed')
      )

      await expect(catalogService.browse()).rejects.toThrow('Database connection failed')
    })
  })

  describe('search()', () => {
    it('should search catalog by query', async () => {
      vi.spyOn(catalogService, 'search').mockResolvedValue({
        items: [
          { id: '1', name: 'Blue Denim Jacket', tags: ['denim', 'blue'] }
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      })

      const result = await catalogService.search({ q: 'denim' })

      expect(result.items[0].name).toContain('Denim')
      expect(catalogService.search).toHaveBeenCalledWith({ q: 'denim' })
    })

    it('should search with filters', async () => {
      vi.spyOn(catalogService, 'search').mockResolvedValue({
        items: [
          { id: '1', name: 'Blue Denim Jacket', category: 'outerwear', color: 'blue' }
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      })

      const result = await catalogService.search({
        q: 'jacket',
        category: 'outerwear',
        color: 'blue'
      })

      expect(result.items[0]).toMatchObject({
        category: 'outerwear',
        color: 'blue'
      })
    })

    it('should handle empty search query', async () => {
      vi.spyOn(catalogService, 'search').mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      })

      const result = await catalogService.search({ q: '' })

      expect(result.items).toEqual([])
    })

    it('should handle search errors', async () => {
      vi.spyOn(catalogService, 'search').mockRejectedValue(
        new Error('Search service unavailable')
      )

      await expect(catalogService.search({ q: 'test' }))
        .rejects.toThrow('Search service unavailable')
    })
  })

  describe('getById()', () => {
    it('should fetch single catalog item by ID', async () => {
      const mockItem = {
        id: '123',
        name: 'Blue Jeans',
        category: 'bottom',
        image_url: 'https://example.com/image.jpg'
      }

      vi.spyOn(catalogService, 'getById').mockResolvedValue(mockItem)

      const result = await catalogService.getById('123')

      expect(result).toEqual(mockItem)
      expect(result.id).toBe('123')
      expect(catalogService.getById).toHaveBeenCalledWith('123')
    })

    it('should throw error for non-existent item', async () => {
      vi.spyOn(catalogService, 'getById').mockRejectedValue(
        new Error('Item not found')
      )

      await expect(catalogService.getById('nonexistent'))
        .rejects.toThrow('Item not found')
    })
  })

  describe('addToCloset()', () => {
    it('should add catalog item to user closet', async () => {
      const mockResponse = {
        success: true,
        item: {
          id: 'new-item-id',
          owner_id: 'user-id',
          name: 'Blue Jeans',
          catalog_item_id: 'catalog-123',
          source: 'catalog'
        },
        quota: { used: 10, limit: 200, available: 190 }
      }

      vi.spyOn(catalogService, 'addToCloset').mockResolvedValue(mockResponse)

      const result = await catalogService.addToCloset('catalog-123', { privacy: 'friends' })

      expect(result.success).toBe(true)
      expect(result.item.catalog_item_id).toBe('catalog-123')
      expect(result.item.source).toBe('catalog')
      expect(catalogService.addToCloset).toHaveBeenCalledWith('catalog-123', { privacy: 'friends' })
    })

    it('should respect total item quota (200 items)', async () => {
      vi.spyOn(catalogService, 'addToCloset').mockRejectedValue({
        message: 'Total item limit reached (200 items)',
        code: 'QUOTA_EXCEEDED'
      })

      await expect(catalogService.addToCloset('catalog-123'))
        .rejects.toMatchObject({
          code: 'QUOTA_EXCEEDED'
        })
    })

    it('should not count toward upload quota', async () => {
      // User has 50 uploads but can still add from catalog
      const mockResponse = {
        success: true,
        item: { id: 'item-id', source: 'catalog' },
        quota: { used: 150, limit: 200, available: 50, uploads: 50 }
      }

      vi.spyOn(catalogService, 'addToCloset').mockResolvedValue(mockResponse)

      const result = await catalogService.addToCloset('catalog-123')

      expect(result.success).toBe(true)
      expect(result.quota.uploads).toBe(50)
    })

    it('should prevent duplicate additions', async () => {
      vi.spyOn(catalogService, 'addToCloset').mockRejectedValue({
        message: 'Item already in closet',
        code: 'DUPLICATE_ITEM'
      })

      await expect(catalogService.addToCloset('catalog-123'))
        .rejects.toMatchObject({
          code: 'DUPLICATE_ITEM'
        })
    })

    it('should handle non-existent catalog item', async () => {
      vi.spyOn(catalogService, 'addToCloset').mockRejectedValue({
        message: 'Catalog item not found',
        code: 'NOT_FOUND'
      })

      await expect(catalogService.addToCloset('nonexistent'))
        .rejects.toMatchObject({
          code: 'NOT_FOUND'
        })
    })
  })

  describe('Privacy & Anonymity', () => {
    it('should never expose owner_id in browse results', async () => {
      const mockItems = [
        { id: '1', name: 'Item 1', category: 'top' },
        { id: '2', name: 'Item 2', category: 'bottom' }
      ]

      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: mockItems,
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
      })

      const result = await catalogService.browse()

      result.items.forEach(item => {
        expect(item).not.toHaveProperty('owner_id')
        expect(item).not.toHaveProperty('user_id')
        expect(item).not.toHaveProperty('uploaded_by')
      })
    })

    it('should never expose owner_id in search results', async () => {
      const mockItems = [
        { id: '1', name: 'Blue Jeans', category: 'bottom' }
      ]

      vi.spyOn(catalogService, 'search').mockResolvedValue({
        items: mockItems,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      })

      const result = await catalogService.search({ q: 'jeans' })

      result.items.forEach(item => {
        expect(item).not.toHaveProperty('owner_id')
        expect(item).not.toHaveProperty('user_id')
      })
    })

    it('should never expose owner_id in getById', async () => {
      const mockItem = {
        id: '123',
        name: 'Blue Jeans',
        category: 'bottom'
      }

      vi.spyOn(catalogService, 'getById').mockResolvedValue(mockItem)

      const result = await catalogService.getById('123')

      expect(result).not.toHaveProperty('owner_id')
      expect(result).not.toHaveProperty('user_id')
    })
  })
})

describe('Catalog Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('State Management', () => {
    it('should initialize with empty state', () => {
      const store = useCatalogStore()

      expect(store.items).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.filters).toEqual({
        category: null,
        color: null,
        brand: null,
        season: null,
        style: null
      })
    })

    it('should track filters', async () => {
      const store = useCatalogStore()

      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      })

      await store.setFilters({ category: 'top', color: 'blue' })

      expect(store.filters.category).toBe('top')
      expect(store.filters.color).toBe('blue')
      expect(store.activeFilterCount).toBe(2)
    })

    it('should clear filters', async () => {
      const store = useCatalogStore()

      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      })

      await store.setFilters({ category: 'top', color: 'blue' })
      await store.clearFilters()

      expect(store.filters).toEqual({
        category: null,
        color: null,
        brand: null,
        season: null,
        style: null
      })
      expect(store.hasFilters).toBe(false)
    })

    it('should track pagination', () => {
      const store = useCatalogStore()

      store.pagination = {
        page: 2,
        limit: 20,
        total: 100,
        totalPages: 5
      }

      expect(store.pagination.page).toBe(2)
      expect(store.hasMore).toBe(true)
    })

    it('should compute hasMore correctly', () => {
      const store = useCatalogStore()

      store.pagination = {
        page: 5,
        limit: 20,
        total: 100,
        totalPages: 5
      }

      expect(store.hasMore).toBe(false)
    })

    it('should compute isEmpty correctly', () => {
      const store = useCatalogStore()

      store.items = []
      store.loading = false

      expect(store.isEmpty).toBe(true)

      store.items = [{ id: '1', name: 'Item' }]
      expect(store.isEmpty).toBe(false)
    })
  })

  describe('Actions', () => {
    it('should fetch catalog items', async () => {
      const store = useCatalogStore()
      const mockItems = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' }
      ]

      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: mockItems,
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
      })

      await store.fetchCatalog()

      expect(store.items).toEqual(mockItems)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('should handle fetch errors', async () => {
      const store = useCatalogStore()

      vi.spyOn(catalogService, 'browse').mockRejectedValue(
        new Error('Network error')
      )

      await store.fetchCatalog()

      expect(store.loading).toBe(false)
      expect(store.error).toBeTruthy()
    })

    it('should search catalog', async () => {
      const store = useCatalogStore()
      const mockItems = [{ id: '1', name: 'Blue Jeans' }]

      vi.spyOn(catalogService, 'search').mockResolvedValue({
        items: mockItems,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      })

      await store.searchCatalog('jeans')

      expect(store.searchQuery).toBe('jeans')
      expect(store.items).toEqual(mockItems)
    })

    it('should add item to closet', async () => {
      const store = useCatalogStore()
      const mockResponse = {
        success: true,
        item: { id: 'item-id', name: 'Blue Jeans' }
      }

      vi.spyOn(catalogService, 'addToCloset').mockResolvedValue(mockResponse)

      const result = await store.addToCloset('catalog-123')

      expect(result.success).toBe(true)
      expect(result.item.name).toBe('Blue Jeans')
    })

    it('should load more items', async () => {
      const store = useCatalogStore()
      store.items = [{ id: '1', name: 'Item 1' }]
      store.pagination = { page: 1, limit: 20, total: 40, totalPages: 2 }

      const moreItems = [{ id: '2', name: 'Item 2' }]
      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: moreItems,
        pagination: { page: 2, limit: 20, total: 40, totalPages: 2 }
      })

      await store.loadMore()

      expect(store.items).toHaveLength(2)
      expect(store.pagination.page).toBe(2)
    })
  })

  describe('Computed Properties', () => {
    it('should compute activeFilterCount', async () => {
      const store = useCatalogStore()

      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      })

      expect(store.activeFilterCount).toBe(0)

      await store.setFilters({ category: 'top' })
      expect(store.activeFilterCount).toBe(1)

      await store.setFilters({ color: 'blue' })
      expect(store.activeFilterCount).toBe(2)

      await store.clearFilters()
      expect(store.activeFilterCount).toBe(0)
    })

    it('should compute hasFilters', async () => {
      const store = useCatalogStore()

      vi.spyOn(catalogService, 'browse').mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      })

      expect(store.hasFilters).toBe(false)

      await store.setFilters({ category: 'top' })
      expect(store.hasFilters).toBe(true)

      await store.clearFilters()
      expect(store.hasFilters).toBe(false)
    })
  })
})
