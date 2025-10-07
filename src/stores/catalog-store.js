/**
 * Catalog Store - Pinia
 * 
 * Purpose: State management for catalog browsing and filtering
 * 
 * Features:
 * - Browse catalog with filters
 * - Search catalog
 * - Manage filter state
 * - Pagination
 * - Add items to closet
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import catalogService from '@/services/catalog-service'
import { CLOTHING_CATEGORIES } from '@/config/constants'

export const useCatalogStore = defineStore('catalog', () => {
  // State
  const items = ref([])
  const filters = ref({
    category: null,
    color: null,
    brand: null,
    season: null,
    style: null
  })
  const searchQuery = ref('')
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const loading = ref(false)
  const error = ref(null)
  const filterOptions = ref({
    brands: [],
    colors: [],
    seasons: []
  })

  // Getters
  const hasFilters = computed(() => {
    return Object.values(filters.value).some(v => v !== null)
  })

  const activeFilterCount = computed(() => {
    return Object.values(filters.value).filter(v => v !== null).length
  })

  const filteredCategories = computed(() => {
    if (filters.value.category) {
      return CLOTHING_CATEGORIES.filter(c => c.value === filters.value.category)
    }
    return CLOTHING_CATEGORIES
  })

  const hasMore = computed(() => {
    return pagination.value.page < pagination.value.totalPages
  })

  const isEmpty = computed(() => {
    return !loading.value && items.value.length === 0
  })

  // Actions
  async function fetchCatalog() {
    loading.value = true
    error.value = null

    try {
      const response = await catalogService.browse({
        ...filters.value,
        page: pagination.value.page,
        limit: pagination.value.limit
      })

      items.value = response.items
      pagination.value = response.pagination
    } catch (err) {
      error.value = err.message
      console.error('Error fetching catalog:', err)
    } finally {
      loading.value = false
    }
  }

  async function searchCatalog(query) {
    searchQuery.value = query
    loading.value = true
    error.value = null

    try {
      const response = await catalogService.search({
        q: query,
        ...filters.value,
        page: 1,
        limit: pagination.value.limit
      })

      items.value = response.items
      pagination.value = response.pagination
      pagination.value.page = 1
    } catch (err) {
      error.value = err.message
      console.error('Error searching catalog:', err)
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || loading.value) return

    loading.value = true
    error.value = null

    try {
      const nextPage = pagination.value.page + 1
      const response = await catalogService.browse({
        ...filters.value,
        page: nextPage,
        limit: pagination.value.limit
      })

      items.value.push(...response.items)
      pagination.value = response.pagination
    } catch (err) {
      error.value = err.message
      console.error('Error loading more items:', err)
    } finally {
      loading.value = false
    }
  }

  async function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1
    
    if (searchQuery.value) {
      await searchCatalog(searchQuery.value)
    } else {
      await fetchCatalog()
    }
  }

  async function clearFilters() {
    filters.value = {
      category: null,
      color: null,
      brand: null,
      season: null,
      style: null
    }
    searchQuery.value = ''
    pagination.value.page = 1
    await fetchCatalog()
  }

  async function setPage(page) {
    pagination.value.page = page
    
    if (searchQuery.value) {
      await searchCatalog(searchQuery.value)
    } else {
      await fetchCatalog()
    }
  }

  async function addToCloset(catalogItemId, options = {}) {
    try {
      const item = await catalogService.addToCloset(catalogItemId, options)
      return item
    } catch (err) {
      error.value = err.message
      console.error('Error adding to closet:', err)
      throw err
    }
  }

  async function getItemById(itemId) {
    try {
      const item = await catalogService.getById(itemId)
      return item
    } catch (err) {
      error.value = err.message
      console.error('Error fetching item:', err)
      throw err
    }
  }

  async function fetchFilterOptions() {
    try {
      filterOptions.value = await catalogService.getFilterOptions()
    } catch (err) {
      console.error('Error fetching filter options:', err)
    }
  }

  function reset() {
    items.value = []
    filters.value = {
      category: null,
      color: null,
      brand: null,
      season: null,
      style: null
    }
    searchQuery.value = ''
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
    loading.value = false
    error.value = null
  }

  return {
    // State
    items,
    filters,
    searchQuery,
    pagination,
    loading,
    error,
    filterOptions,

    // Getters
    hasFilters,
    activeFilterCount,
    filteredCategories,
    hasMore,
    isEmpty,

    // Actions
    fetchCatalog,
    searchCatalog,
    loadMore,
    setFilters,
    clearFilters,
    setPage,
    addToCloset,
    getItemById,
    fetchFilterOptions,
    reset
  }
})

export default useCatalogStore
