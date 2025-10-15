<template>
  <MainLayout>
    <div class="catalog-page">
      <!-- Header -->
      <div class="catalog-header">
        <div class="header-content">
          <h1>Browse Catalog</h1>
          <p class="catalog-description">Discover new items for your closet</p>
        </div>
        
        <!-- Clear Filters Button -->
        <button
          v-if="catalogStore.hasFilters"
          class="clear-filters-btn"
          @click="catalogStore.clearFilters()"
        >
          Clear Filters ({{ catalogStore.activeFilterCount }})
        </button>
      </div>

      <!-- Search Bar -->
      <div class="search-container">
        <CatalogSearch
          v-model="searchQuery"
          @search="handleSearch"
          @clear="handleClearSearch"
        />
      </div>

      <!-- Filters Panel -->
      <div class="filters-container">
        <CatalogFilter
          :filters="catalogStore.filters"
          :filter-options="catalogStore.filterOptions"
          @update:filters="handleFilterChange"
          @clear="catalogStore.clearFilters()"
        />
      </div>

      <!-- Catalog Grid -->
      <div class="catalog-content">
        <!-- Loading State -->
        <div
          v-if="catalogStore.loading && catalogStore.items.length === 0"
          class="items-grid"
        >
          <div
            v-for="i in 8"
            :key="`skeleton-${i}`"
            class="skeleton-card animate-pulse"
          >
            <div class="skeleton-image shimmer" />
            <div class="skeleton-content">
              <div class="skeleton-title shimmer" />
              <div class="skeleton-subtitle shimmer" />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="catalogStore.isEmpty"
          class="empty-state"
        >
          <div class="empty-icon">👔</div>
          <p class="empty-message">No items found</p>
          <p class="empty-description">Try adjusting your filters or search query</p>
          <button
            class="clear-filters-btn"
            @click="catalogStore.clearFilters()"
          >
            Clear All Filters
          </button>
        </div>

        <!-- Items Grid -->
        <div
          v-else
          class="items-grid"
        >
          <CatalogItemCard
            v-for="(item, index) in catalogStore.items"
            :key="item.id"
            :item="item"
            :style="{ animationDelay: `${index * 50}ms` }"
            class="item-card"
            @add-to-closet="handleAddToCloset(item.id)"
            @click="handleItemClick(item)"
          />
        </div>

        <!-- Load More Button -->
        <div
          v-if="catalogStore.hasMore && !catalogStore.loading"
          class="load-more-container"
        >
          <button
            class="load-more-btn"
            @click="catalogStore.loadMore()"
          >
            Load More Items
          </button>
        </div>

        <!-- Loading More State -->
        <div
          v-if="catalogStore.loading && catalogStore.items.length > 0"
          class="loading-more"
        >
          <div class="spinner"></div>
          <span>Loading more items...</span>
        </div>

        <!-- Pagination Info -->
        <div
          v-if="catalogStore.items.length > 0"
          class="pagination-info"
        >
          Showing {{ catalogStore.items.length }} of {{ catalogStore.pagination.total }} items
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCatalogStore } from '../stores/catalog-store'
import { useClosetStore } from '../stores/closet-store'
import MainLayout from '../components/layouts/MainLayout.vue'
import CatalogSearch from '../components/catalog/CatalogSearch.vue'
import CatalogFilter from '../components/catalog/CatalogFilter.vue'
import CatalogItemCard from '../components/catalog/CatalogItemCard.vue'

const catalogStore = useCatalogStore()
const closetStore = useClosetStore()

const searchQuery = ref('')
const selectedItem = ref(null)

onMounted(async () => {
  // Load data in parallel for better performance
  await Promise.all([
    catalogStore.fetchCatalog(),
    catalogStore.fetchFilterOptions()
  ])
})

// Cleanup on unmount
onUnmounted(() => {
  // Cleanup any pending operations if needed
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
.catalog-page {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.catalog-description {
  color: #6b7280;
  margin: 0;
}

.clear-filters-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-filters-btn:hover {
  background: #2563eb;
}


/* Search Container */
.search-container {
  margin-bottom: 1.5rem;
}

/* Filters Container */
.filters-container {
  margin-bottom: 2rem;
}

/* Catalog Content */
.catalog-content {
  min-height: 400px;
}

/* Items Grid - Same as ClosetGrid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Item Card Animation */
.item-card {
  animation: slideIn 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading Skeletons */
.skeleton-card {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.skeleton-image {
  width: 100%;
  height: 280px;
  background: #f3f4f6;
}

.skeleton-content {
  padding: 1rem;
}

.skeleton-title {
  height: 1rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.skeleton-subtitle {
  height: 0.75rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  width: 60%;
}

.shimmer {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-message {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.empty-description {
  color: #6b7280;
  margin-bottom: 2rem;
}

/* Load More */
.load-more-container {
  text-align: center;
  margin: 2rem 0;
}

.load-more-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.load-more-btn:hover {
  background: #2563eb;
}

/* Loading More */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 2rem 0;
  color: #6b7280;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Pagination Info */
.pagination-info {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .catalog-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .items-grid {
    grid-template-columns: 1fr;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .header-content h1 {
    color: white;
  }
  
  .catalog-description {
    color: #9ca3af;
  }
  
  .skeleton-card {
    background: #374151;
  }
  
  .skeleton-image,
  .skeleton-title,
  .skeleton-subtitle {
    background: #4b5563;
  }
  
  .empty-message {
    color: white;
  }
  
  .empty-description {
    color: #9ca3af;
  }
  
  .pagination-info {
    color: #9ca3af;
  }
}
</style>
