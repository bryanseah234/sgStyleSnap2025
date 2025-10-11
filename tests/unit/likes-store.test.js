/**
 * Likes Store Unit Tests
 * 
 * Tests for likes-store.js Pinia store
 * Framework: Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock likes service - define factory inside mock
vi.mock('../../src/services/likes-service', () => ({
  likesService: {
    likeItem: vi.fn(),
    unlikeItem: vi.fn(),
    toggleLike: vi.fn(),
    getUserLikedItems: vi.fn(),
    getItemLikers: vi.fn(),
    getPopularItems: vi.fn(),
    getPopularItemsFromFriends: vi.fn(),
    initializeUserLikes: vi.fn(),
    hasLiked: vi.fn(),
    getUserLikesStats: vi.fn()
  }
}))

// Mock auth store
vi.mock('../../src/stores/auth-store', () => ({
  useAuthStore: () => ({
    user: { id: 'user-123' },
    isLoggedIn: true
  })
}))

// Import after mocking
import { useLikesStore } from '../../src/stores/likes-store'
import { likesService as mockLikesService } from '../../src/services/likes-service'

describe('Likes Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useLikesStore()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(store.likedItemIds).toBeInstanceOf(Set)
      expect(store.likedItemIds.size).toBe(0)
      expect(store.likeCounts).toEqual({})
      expect(store.likers).toEqual({})
      expect(store.myLikedItems).toEqual([])
      expect(store.popularItems).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.initialized).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should have correct stats structure', () => {
      expect(store.stats).toEqual({
        totalItems: 0,
        totalLikesReceived: 0,
        avgLikesPerItem: 0,
        mostLikedItemId: null,
        mostLikedItemName: null,
        mostLikedItemLikes: 0
      })
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      store.likedItemIds.add('item-1')
      store.likedItemIds.add('item-2')
      store.likeCounts = {
        'item-1': 5,
        'item-2': 10,
        'item-3': 3
      }
      store.likers = {
        'item-1': [
          { id: 'user-1', full_name: 'John' },
          { id: 'user-2', full_name: 'Jane' }
        ]
      }
      store.myLikedItems = [
        { id: 'item-1', name: 'Shirt', liked_at: '2024-01-02' },
        { id: 'item-2', name: 'Jeans', liked_at: '2024-01-01' }
      ]
    })

    it('isLiked should return true for liked items', () => {
      expect(store.isLiked('item-1')).toBe(true)
      expect(store.isLiked('item-2')).toBe(true)
      expect(store.isLiked('item-3')).toBe(false)
    })

    it('getLikesCount should return correct count', () => {
      expect(store.getLikesCount('item-1')).toBe(5)
      expect(store.getLikesCount('item-2')).toBe(10)
      expect(store.getLikesCount('item-999')).toBe(0)
    })

    it('getLikers should return likers array', () => {
      expect(store.getLikers('item-1')).toHaveLength(2)
      expect(store.getLikers('item-1')[0].full_name).toBe('John')
      expect(store.getLikers('item-999')).toEqual([])
    })

    it('sortedLikedItems should sort by date descending', () => {
      const sorted = store.sortedLikedItems
      expect(sorted[0].id).toBe('item-1') // 2024-01-02 is more recent
      expect(sorted[1].id).toBe('item-2') // 2024-01-01 is older
    })

    it('likedItemsCount should return correct count', () => {
      expect(store.likedItemsCount).toBe(2)
    })

    it('isInitialized should return initialized state', () => {
      expect(store.isInitialized).toBe(false)
      store.initialized = true
      expect(store.isInitialized).toBe(true)
    })
  })

  describe('actions - likeItem', () => {
    it('should like an item successfully', async () => {
      mockLikesService.likeItem.mockResolvedValue({
        like: { id: 'like-1', item_id: 'item-1' },
        likesCount: 5
      })

      await store.likeItem('item-1')

      expect(mockLikesService.likeItem).toHaveBeenCalledWith('item-1')
      expect(store.likedItemIds.has('item-1')).toBe(true)
      expect(store.likeCounts['item-1']).toBe(5)
      expect(store.error).toBeNull()
    })

    it('should handle like errors', async () => {
      mockLikesService.likeItem.mockRejectedValue(new Error('Like failed'))

      await expect(store.likeItem('item-1')).rejects.toThrow('Like failed')
      expect(store.error).toBe('Like failed')
    })

    it('should not add duplicate to likedItemIds', async () => {
      store.likedItemIds.add('item-1')
      
      mockLikesService.likeItem.mockResolvedValue({
        like: { id: 'like-1', item_id: 'item-1' },
        likesCount: 6,
        alreadyLiked: true
      })

      await store.likeItem('item-1')

      expect(store.likedItemIds.size).toBe(1)
      expect(store.likeCounts['item-1']).toBe(6)
    })
  })

  describe('actions - unlikeItem', () => {
    it('should unlike an item successfully', async () => {
      store.likedItemIds.add('item-1')
      store.likeCounts['item-1'] = 5

      mockLikesService.unlikeItem.mockResolvedValue({
        likesCount: 4
      })

      await store.unlikeItem('item-1')

      expect(mockLikesService.unlikeItem).toHaveBeenCalledWith('item-1')
      expect(store.likedItemIds.has('item-1')).toBe(false)
      expect(store.likeCounts['item-1']).toBe(4)
      expect(store.error).toBeNull()
    })

    it('should handle unlike errors', async () => {
      mockLikesService.unlikeItem.mockRejectedValue(new Error('Unlike failed'))

      await expect(store.unlikeItem('item-1')).rejects.toThrow('Unlike failed')
      expect(store.error).toBe('Unlike failed')
    })
  })

  describe('actions - toggleLike', () => {
    it('should toggle like from unliked to liked', async () => {
      mockLikesService.toggleLike.mockResolvedValue({
        liked: true,
        likesCount: 5
      })

      await store.toggleLike('item-1')

      expect(mockLikesService.toggleLike).toHaveBeenCalledWith('item-1', false)
      expect(store.likedItemIds.has('item-1')).toBe(true)
      expect(store.likeCounts['item-1']).toBe(5)
    })

    it('should toggle like from liked to unliked', async () => {
      store.likedItemIds.add('item-1')

      mockLikesService.toggleLike.mockResolvedValue({
        liked: false,
        likesCount: 4
      })

      await store.toggleLike('item-1')

      expect(mockLikesService.toggleLike).toHaveBeenCalledWith('item-1', true)
      expect(store.likedItemIds.has('item-1')).toBe(false)
      expect(store.likeCounts['item-1']).toBe(4)
    })
  })

  describe('actions - fetchMyLikedItems', () => {
    it('should fetch user liked items successfully', async () => {
      const mockItems = [
        { id: 'item-1', name: 'Shirt', item_id: 'item-1', liked_at: '2024-01-01', likes_count: 3 },
        { id: 'item-2', name: 'Jeans', item_id: 'item-2', liked_at: '2024-01-02', likes_count: 5 }
      ]

      mockLikesService.getUserLikedItems.mockResolvedValue(mockItems)

      await store.fetchMyLikedItems()

      expect(mockLikesService.getUserLikedItems).toHaveBeenCalledWith('user-123', 50, 0)
      expect(store.myLikedItems).toEqual(mockItems)
      expect(store.likedItemIds.has('item-1')).toBe(true)
      expect(store.likedItemIds.has('item-2')).toBe(true)
      expect(store.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      mockLikesService.getUserLikedItems.mockRejectedValue(new Error('Fetch failed'))

      await store.fetchMyLikedItems()
      
      expect(store.error).toBe('Fetch failed')
    })
  })

  describe('actions - fetchItemLikers', () => {
    it('should fetch item likers successfully', async () => {
      const mockLikers = [
        { id: 'user-1', full_name: 'John' },
        { id: 'user-2', full_name: 'Jane' }
      ]

      mockLikesService.getItemLikers.mockResolvedValue(mockLikers)

      await store.fetchItemLikers('item-1')

      expect(mockLikesService.getItemLikers).toHaveBeenCalledWith('item-1', 50)
      expect(store.likers['item-1']).toEqual(mockLikers)
      expect(store.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      mockLikesService.getItemLikers.mockRejectedValue(new Error('Fetch failed'))

      await expect(store.fetchItemLikers('item-1')).rejects.toThrow('Fetch failed')
      expect(store.error).toBe('Fetch failed')
    })
  })

  describe('actions - fetchPopularItems', () => {
    it('should fetch popular items successfully', async () => {
      const mockItems = [
        { id: 'item-1', name: 'Popular Shirt', item_id: 'item-1', likes_count: 15 },
        { id: 'item-2', name: 'Popular Jeans', item_id: 'item-2', likes_count: 12 }
      ]

      mockLikesService.getPopularItemsFromFriends.mockResolvedValue(mockItems)

      await store.fetchPopularItems(10)

      expect(mockLikesService.getPopularItemsFromFriends).toHaveBeenCalledWith(10)
      expect(store.popularItems).toEqual(mockItems)
      expect(store.error).toBeNull()
    })

    it('should use default parameters', async () => {
      mockLikesService.getPopularItemsFromFriends.mockResolvedValue([])

      await store.fetchPopularItems()

      expect(mockLikesService.getPopularItemsFromFriends).toHaveBeenCalledWith(20)
    })
  })

  describe('actions - fetchUserStats', () => {
    it('should fetch user statistics successfully', async () => {
      const mockStats = {
        total_items: 10,
        total_likes_received: 50,
        avg_likes_per_item: 5.0,
        most_liked_item_id: 'item-123',
        most_liked_item_name: 'Favorite Shirt',
        most_liked_item_likes: 15
      }

      mockLikesService.getUserLikesStats.mockResolvedValue(mockStats)

      await store.fetchUserStats('user-123')

      expect(mockLikesService.getUserLikesStats).toHaveBeenCalledWith('user-123')
      expect(store.stats).toEqual({
        totalItems: 10,
        totalLikesReceived: 50,
        avgLikesPerItem: 5.0,
        mostLikedItemId: 'item-123',
        mostLikedItemName: 'Favorite Shirt',
        mostLikedItemLikes: 15
      })
    })

    it('should handle null stats', async () => {
      mockLikesService.getUserLikesStats.mockResolvedValue(null)

      await store.fetchUserStats('user-123')

      expect(store.stats.totalItems).toBe(0)
    })
  })

  describe('actions - initialize', () => {
    it('should initialize store successfully', async () => {
      const mockLikedItems = [
        { id: 'item-1', name: 'Shirt', item_id: 'item-1', liked_at: '2024-01-01', likes_count: 5 }
      ]
      const mockPopularItems = [
        { id: 'item-2', name: 'Popular Jeans', item_id: 'item-2', likes_count: 12 }
      ]
      const mockStats = {
        total_items: 10,
        total_likes_received: 50,
        avg_likes_per_item: 5.0,
        most_liked_item_id: 'item-123',
        most_liked_item_name: 'Favorite Shirt',
        most_liked_item_likes: 15
      }

      mockLikesService.getUserLikedItems.mockResolvedValue(mockLikedItems)
      mockLikesService.getPopularItemsFromFriends.mockResolvedValue(mockPopularItems)
      mockLikesService.getUserLikesStats.mockResolvedValue(mockStats)

      await store.initialize()

      expect(store.myLikedItems).toEqual(mockLikedItems)
      expect(store.popularItems).toEqual(mockPopularItems)
      expect(store.initialized).toBe(true)
      expect(store.error).toBeNull()
    })

    it('should not initialize twice', async () => {
      store.initialized = true

      await store.initialize()

      expect(mockLikesService.getUserLikedItems).not.toHaveBeenCalled()
    })

    it('should handle initialization errors gracefully', async () => {
      mockLikesService.getUserLikedItems.mockRejectedValue(new Error('Init failed'))

      await store.initialize()

      // Should not throw but set error
      expect(store.error).toBe('Init failed')
      expect(store.initialized).toBe(false)
    })
  })

  describe('actions - reset', () => {
    it('should reset store to initial state', () => {
      // Set some state
      store.likedItemIds.add('item-1')
      store.likeCounts = { 'item-1': 5 }
      store.myLikedItems = [{ id: 'item-1' }]
      store.initialized = true
      store.error = 'Some error'

      store.reset()

      expect(store.likedItemIds.size).toBe(0)
      expect(store.likeCounts).toEqual({})
      expect(store.myLikedItems).toEqual([])
      expect(store.initialized).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('optimistic updates', () => {
    it('should optimistically add like', async () => {
      mockLikesService.likeItem.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          like: { id: 'like-1', item_id: 'item-1' },
          likesCount: 5
        }), 100))
      )

      const promise = store.likeItem('item-1')
      
      // Should be added optimistically before promise resolves
      expect(store.likedItemIds.has('item-1')).toBe(true)

      await promise
    })

    it('should rollback optimistic update on error', async () => {
      mockLikesService.likeItem.mockRejectedValue(new Error('Failed'))

      try {
        await store.likeItem('item-1')
      } catch (e) {
        // Expected to throw
      }

      // Should rollback
      expect(store.likedItemIds.has('item-1')).toBe(false)
    })
  })
})
