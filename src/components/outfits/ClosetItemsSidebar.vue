<template>
  <div class="closet-sidebar">
    <!-- Search and Filter -->
    <div class="sidebar-header">
      <h3 class="sidebar-title">
        Your Closet
      </h3>
      <p class="sidebar-subtitle">
        Drag items to the canvas
      </p>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <svg
        class="search-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search items..."
        class="search-input"
      >
    </div>

    <!-- Category Filter -->
    <div class="category-filter">
      <button
        v-for="category in categories"
        :key="category.value"
        class="category-btn"
        :class="{ active: selectedCategory === category.value }"
        @click="selectedCategory = category.value"
      >
        {{ category.label }}
      </button>
    </div>

    <!-- Color Filter -->
    <div class="color-filter">
      <span class="filter-label">Color:</span>
      <div class="color-options">
        <button
          v-for="color in colors"
          :key="color.value"
          class="color-btn"
          :class="{ active: selectedColor === color.value }"
          :style="{ background: color.hex }"
          :title="color.label"
          @click="selectedColor = color.value"
        />
      </div>
    </div>

    <!-- Items Grid -->
    <div class="items-grid">
      <div
        v-if="loading"
        class="loading-state"
      >
        <div class="spinner" />
        <p>Loading items...</p>
      </div>

      <div
        v-else-if="filteredItems.length === 0"
        class="empty-state"
      >
        <svg
          class="empty-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p>No items found</p>
      </div>

      <div
        v-else
        v-for="item in filteredItems"
        :key="item.id"
        class="item-card"
        :draggable="true"
        @dragstart="handleDragStart(item, $event)"
        @dragend="handleDragEnd"
      >
        <img
          :src="item.thumbnail_url || item.image_url"
          :alt="item.name"
          class="item-image"
        >
        <div class="item-info">
          <p class="item-name">
            {{ item.name }}
          </p>
          <span class="item-category">{{ item.category }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useClosetStore } from '@/stores/closet-store'

const props = defineProps({
  excludeItemIds: {
    type: Array,
    default: () => []
  }
})

const closetStore = useClosetStore()
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedColor = ref('all')
const loading = ref(false)

// Categories for filter
const categories = [
  { value: 'all', label: 'All' },
  { value: 'top', label: 'Tops' },
  { value: 'bottom', label: 'Bottoms' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'accessory', label: 'Accessories' }
]

// Colors for filter
const colors = [
  { value: 'all', label: 'All Colors', hex: '#f3f4f6' },
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'white', label: 'White', hex: '#ffffff' },
  { value: 'red', label: 'Red', hex: '#ef4444' },
  { value: 'blue', label: 'Blue', hex: '#3b82f6' },
  { value: 'green', label: 'Green', hex: '#10b981' },
  { value: 'yellow', label: 'Yellow', hex: '#f59e0b' },
  { value: 'pink', label: 'Pink', hex: '#ec4899' },
  { value: 'purple', label: 'Purple', hex: '#8b5cf6' },
  { value: 'orange', label: 'Orange', hex: '#f97316' },
  { value: 'brown', label: 'Brown', hex: '#92400e' },
  { value: 'gray', label: 'Gray', hex: '#6b7280' }
]

// Filtered items
const filteredItems = computed(() => {
  let items = closetStore.items || []

  // Exclude items already on canvas
  items = items.filter(item => !props.excludeItemIds.includes(item.id))

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item =>
      item.name?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.clothing_type?.toLowerCase().includes(query)
    )
  }

  // Category filter
  if (selectedCategory.value !== 'all') {
    items = items.filter(item => item.category === selectedCategory.value)
  }

  // Color filter
  if (selectedColor.value !== 'all') {
    items = items.filter(item => {
      const itemColor = (item.primary_color || item.color || '').toLowerCase()
      return itemColor === selectedColor.value
    })
  }

  return items
})

/**
 * Handle drag start
 */
function handleDragStart(item, event) {
  // Set drag data
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/json', JSON.stringify(item))

  // Create drag image
  const dragImage = event.target.cloneNode(true)
  dragImage.style.opacity = '0.7'
  document.body.appendChild(dragImage)
  event.dataTransfer.setDragImage(dragImage, 50, 50)

  // Remove drag image after a moment
  setTimeout(() => {
    document.body.removeChild(dragImage)
  }, 0)
}

/**
 * Handle drag end
 */
function handleDragEnd() {
  // Optional: Add visual feedback
}

/**
 * Load closet items
 */
async function loadItems() {
  loading.value = true
  try {
    await closetStore.fetchItems()
  } catch (error) {
    console.error('Error loading closet items:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadItems()
})
</script>

<style scoped>
.closet-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.sidebar-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.search-bar {
  position: relative;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.search-icon {
  position: absolute;
  left: 1.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3b82f6;
}

.category-filter {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
}

.category-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  background: #f9fafb;
}

.category-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.color-filter {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  flex-shrink: 0;
}

.color-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.items-grid {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  align-content: start;
}

.loading-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #9ca3af;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.item-card {
  cursor: grab;
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
  border: 2px solid #e5e7eb;
  transition: all 0.2s;
}

.item-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.item-card:active {
  cursor: grabbing;
}

.item-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.item-info {
  padding: 0.5rem;
}

.item-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: #111827;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-category {
  font-size: 0.625rem;
  color: #6b7280;
  text-transform: capitalize;
}
</style>
