<template>
  <div class="catalog-browse min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Browse Catalog
          </h1>
          <button
            v-if="catalogStore.hasFilters"
            class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            @click="catalogStore.clearFilters()"
          >
            Clear All Filters ({{ catalogStore.activeFilterCount }})
          </button>
        </div>

        <!-- Search Bar -->
        <CatalogSearch
          v-model="searchQuery"
          @search="handleSearch"
          @clear="handleClearSearch"
        />
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Filters Sidebar -->
        <aside class="lg:w-64 flex-shrink-0">
          <CatalogFilter
            :filters="catalogStore.filters"
            :filter-options="catalogStore.filterOptions"
            @update:filters="handleFilterChange"
            @clear="catalogStore.clearFilters()"
          />
        </aside>

        <!-- Catalog Grid -->
        <main class="flex-1">
          <!-- Loading State -->
          <div
            v-if="catalogStore.loading && catalogStore.items.length === 0"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div
              v-for="i in 6"
              :key="i"
              class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse"
            >
              <div class="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg mb-4" />
              <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
              <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="catalogStore.isEmpty"
            class="text-center py-12"
          >
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No items found
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters or search query.
            </p>
            <button
              class="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              @click="catalogStore.clearFilters()"
            >
              Clear Filters
            </button>
          </div>

          <!-- Catalog Grid -->
          <CatalogGrid
            v-else
            :items="catalogStore.items"
            :loading="catalogStore.loading"
            @add-to-closet="handleAddToCloset"
            @load-more="catalogStore.loadMore()"
            @item-click="handleItemClick"
          />

          <!-- Load More Button -->
          <div
            v-if="catalogStore.hasMore && !catalogStore.loading"
            class="mt-6 text-center"
          >
            <button
              class="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              @click="catalogStore.loadMore()"
            >
              Load More
            </button>
          </div>

          <!-- Loading More State -->
          <div
            v-if="catalogStore.loading && catalogStore.items.length > 0"
            class="mt-6 text-center"
          >
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>

          <!-- Pagination Info -->
          <div
            v-if="catalogStore.items.length > 0"
            class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            Showing {{ catalogStore.items.length }} of {{ catalogStore.pagination.total }} items
          </div>
        </main>
      </div>
    </div>

    <!-- Item Detail Modal (future enhancement) -->
    <!-- <CatalogItemModal v-if="selectedItem" :item="selectedItem" @close="selectedItem = null" /> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCatalogStore } from '@/stores/catalog-store'
import { useClosetStore } from '@/stores/closet-store'
import CatalogSearch from '@/components/catalog/CatalogSearch.vue'
import CatalogFilter from '@/components/catalog/CatalogFilter.vue'
import CatalogGrid from '@/components/catalog/CatalogGrid.vue'

const catalogStore = useCatalogStore()
const closetStore = useClosetStore()

const searchQuery = ref('')
const selectedItem = ref(null)

onMounted(async () => {
  await catalogStore.fetchCatalog()
  await catalogStore.fetchFilterOptions()
})

function handleSearch(query) {
  catalogStore.searchCatalog(query)
}

function handleClearSearch() {
  searchQuery.value = ''
  catalogStore.clearFilters()
}

function handleFilterChange(newFilters) {
  catalogStore.setFilters(newFilters)
}

async function handleAddToCloset(catalogItemId) {
  try {
    await catalogStore.addToCloset(catalogItemId)
    // Show success message
    alert('Item added to your closet!')
    // Refresh closet store
    await closetStore.fetchItems()
  } catch (error) {
    // Show error message
    alert(error.message || 'Failed to add item to closet')
  }
}

function handleItemClick(item) {
  selectedItem.value = item
  // Future: Open detail modal
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
