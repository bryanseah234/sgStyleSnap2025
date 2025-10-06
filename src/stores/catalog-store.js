/**
 * Catalog Store
 * Manages catalog browsing state
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import catalogService from '@/services/catalog-service'

export const useCatalogStore = defineStore('catalog', () => {
  // State
  const items = ref([])
  const filters = ref({
    category: null,
    clothing_type: null,
    color: null,
    brand: null,
    season: null,
    style: null,
    search: '',
  })
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const loading = ref(false)
  const error = ref(null)
  const availableFilters = ref({
    categories: [],
    clothing_types: [],
    colors: [],
    brands: [],
    seasons: [],
    styles: [],
  })

  // Getters
  const hasItems = computed(() => items.value.length > 0)
  const hasMorePages = computed(
    () => pagination.value.page < pagination.value.totalPages
  )
  const activeFiltersCount = computed(() => {
    return Object.entries(filters.value).filter(
      ([key, value]) => value && value !== '' && key !== 'search'
    ).length
  })

  // Actions
  async function fetchCatalog() {
    loading.value = true
    error.value = null

    try {
      const response = await catalogService.browse(
        filters.value,
        pagination.value.page,
        pagination.value.limit
      )

      items.value = response.items || []
      pagination.value = {
        ...pagination.value,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching catalog:', err)
    } finally {
      loading.value = false
    }
  }

  async function searchCatalog(query) {
    filters.value.search = query
    pagination.value.page = 1
    await fetchCatalog()
  }

  async function applyFilter(filterName, value) {
    filters.value[filterName] = value
    pagination.value.page = 1
    await fetchCatalog()
  }

  function clearFilters() {
    filters.value = {
      category: null,
      clothing_type: null,
      color: null,
      brand: null,
      season: null,
      style: null,
      search: '',
    }
    pagination.value.page = 1
    fetchCatalog()
  }

  async function nextPage() {
    if (hasMorePages.value) {
      pagination.value.page++
      await fetchCatalog()
    }
  }

  async function previousPage() {
    if (pagination.value.page > 1) {
      pagination.value.page--
      await fetchCatalog()
    }
  }

  async function goToPage(page) {
    pagination.value.page = page
    await fetchCatalog()
  }

  async function loadFilters() {
    try {
      const filtersData = await catalogService.getFilters()
      availableFilters.value = filtersData
    } catch (err) {
      console.error('Error loading filters:', err)
    }
  }

  async function addItemToCloset(catalogItemId, customizations = {}) {
    try {
      const item = await catalogService.addToCloset(catalogItemId, customizations)
      return item
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  function reset() {
    items.value = []
    clearFilters()
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    }
    error.value = null
  }

  return {
    // State
    items,
    filters,
    pagination,
    loading,
    error,
    availableFilters,

    // Getters
    hasItems,
    hasMorePages,
    activeFiltersCount,

    // Actions
    fetchCatalog,
    searchCatalog,
    applyFilter,
    clearFilters,
    nextPage,
    previousPage,
    goToPage,
    loadFilters,
    addItemToCloset,
    reset,
  }
})
