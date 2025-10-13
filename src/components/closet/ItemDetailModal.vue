<!--
  Item Detail Modal - StyleSnap
  
  Purpose: Full-screen modal displaying comprehensive item details and statistics
  
  Features:
  - Full-resolution image display with zoom capability
  - Complete item information (name, category, brand, size, color, privacy, tags)
  - Comprehensive statistics section:
    * Days in closet (calculated from created_at)
    * Favorite status with toggle
    * Category and clothing type
    * Detected color with visual swatch
    * Times worn (from outfit_history)
    * Last worn date
    * In outfits count
    * Times shared with friends
    * Last updated timestamp
  - Action buttons (Edit, Delete, Share, Favorite/Unfavorite)
  - Responsive design (full-screen mobile, centered desktop)
  
  Usage:
  <ItemDetailModal
    :item-id="selectedItemId"
    :is-open="showModal"
    @close="showModal = false"
    @updated="handleItemUpdated"
    @deleted="handleItemDeleted"
  />
  
  Reference:
  - tasks/03-closet-crud-image-management.md for requirements
  - services/clothes-service.js for getItemDetails API
-->

<template>
  <Modal
    :is-open="isOpen"
    :title="item?.name || 'Item Details'"
    size="large"
    @close="handleClose"
  >
    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex justify-center items-center py-12"
    >
      <Spinner size="lg" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="text-center py-12"
    >
      <p class="text-red-600 mb-4">
        {{ error }}
      </p>
      <Button @click="loadItemDetails">
        Retry
      </Button>
    </div>

    <!-- Item Details -->
    <div
      v-else-if="item"
      class="space-y-6"
    >
      <!-- Image Section -->
      <div class="relative bg-gray-100 rounded-lg overflow-hidden">
        <img
          :src="item.image_url"
          :alt="item.name"
          class="w-full h-auto max-h-[500px] object-contain cursor-zoom-in"
          @click="toggleImageZoom"
        >

        <!-- Favorite Button Overlay -->
        <button
          class="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
          :disabled="favoriting"
          @click="toggleFavoriteStatus"
        >
          <svg
            class="w-6 h-6 transition-colors"
            :class="item.is_favorite ? 'text-red-500 fill-current' : 'text-gray-400'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      <!-- Item Information -->
      <div class="space-y-4">
        <!-- Basic Info -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Information
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">
                Category
              </p>
              <p class="text-base font-medium text-gray-900 capitalize">
                {{ item.category }}
              </p>
            </div>
            <div v-if="item.clothing_type">
              <p class="text-sm text-gray-500">
                Type
              </p>
              <p class="text-base font-medium text-gray-900 capitalize">
                {{ item.clothing_type }}
              </p>
            </div>
            <div v-if="item.brand">
              <p class="text-sm text-gray-500">
                Brand
              </p>
              <p class="text-base font-medium text-gray-900">
                {{ item.brand }}
              </p>
            </div>
            <div v-if="item.size">
              <p class="text-sm text-gray-500">
                Size
              </p>
              <p class="text-base font-medium text-gray-900">
                {{ item.size }}
              </p>
            </div>
            <div v-if="item.primary_color">
              <p class="text-sm text-gray-500">
                Color
              </p>
              <div class="flex items-center gap-2">
                <div
                  class="w-6 h-6 rounded border border-gray-300"
                  :style="{ backgroundColor: getColorHex(item.primary_color) }"
                />
                <p class="text-base font-medium text-gray-900 capitalize">
                  {{ item.primary_color }}
                </p>
              </div>
            </div>
            <div>
              <p class="text-sm text-gray-500">
                Privacy
              </p>
              <Badge :variant="item.privacy === 'private' ? 'secondary' : 'primary'">
                {{ item.privacy }}
              </Badge>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Statistics
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">
                Days in Closet
              </p>
              <p class="text-base font-medium text-gray-900">
                {{ daysInCloset }} days
              </p>
            </div>
            <div v-if="statistics?.times_worn !== undefined">
              <p class="text-sm text-gray-500">
                Times Worn
              </p>
              <p class="text-base font-medium text-gray-900">
                {{ statistics.times_worn }} times
              </p>
            </div>
            <div v-if="statistics?.last_worn">
              <p class="text-sm text-gray-500">
                Last Worn
              </p>
              <p class="text-base font-medium text-gray-900">
                {{ formatDate(statistics.last_worn) }}
              </p>
            </div>
            <div v-if="statistics?.in_outfits !== undefined">
              <p class="text-sm text-gray-500">
                In Outfits
              </p>
              <p class="text-base font-medium text-gray-900">
                {{ statistics.in_outfits }} outfits
              </p>
            </div>
            <div v-if="statistics?.times_shared !== undefined">
              <p class="text-sm text-gray-500">
                Times Shared
              </p>
              <p class="text-base font-medium text-gray-900">
                {{ statistics.times_shared }} times
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500">
                Last Updated
              </p>
              <p class="text-base font-medium text-gray-900">
                {{ formatDate(item.updated_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="item.style_tags && item.style_tags.length > 0">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Tags
          </h3>
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="tag in item.style_tags"
              :key="tag"
              variant="outline"
            >
              {{ tag }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-3 pt-4 border-t">
        <Button
          variant="primary"
          @click="handleEdit"
        >
          Edit
        </Button>
        <Button
          variant="outline"
          @click="handleShare"
        >
          Share
        </Button>
        <Button
          variant="danger"
          :loading="deleting"
          @click="handleDelete"
        >
          Delete
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getItemDetails, toggleFavorite, deleteItem } from '../../services/clothes-service'
import Modal from '../ui/Modal.vue'
import Button from '../ui/Button.vue'
import Badge from '../ui/Badge.vue'
import Spinner from '../ui/Spinner.vue'

const props = defineProps({
  itemId: {
    type: String,
    default: null
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'updated', 'deleted'])

// State
const item = ref(null)
const statistics = ref(null)
const loading = ref(false)
const error = ref(null)
const favoriting = ref(false)
const deleting = ref(false)
const imageZoomed = ref(false)

// Computed
const daysInCloset = computed(() => {
  if (!item.value?.created_at) return 0
  const created = new Date(item.value.created_at)
  const now = new Date()
  const diffTime = Math.abs(now - created)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

// Watch for item ID changes
watch(
  () => props.itemId,
  newId => {
    if (newId && props.isOpen) {
      loadItemDetails()
    }
  },
  { immediate: true }
)

watch(
  () => props.isOpen,
  isOpen => {
    if (isOpen && props.itemId) {
      loadItemDetails()
    }
  }
)

/**
 * Load item details and statistics
 */
async function loadItemDetails() {
  if (!props.itemId) return

  loading.value = true
  error.value = null

  try {
    const data = await getItemDetails(props.itemId)
    item.value = data.item
    statistics.value = data.statistics
  } catch (err) {
    console.error('Failed to load item details:', err)
    error.value = err.message || 'Failed to load item details'
  } finally {
    loading.value = false
  }
}

/**
 * Toggle favorite status
 */
async function toggleFavoriteStatus() {
  if (!item.value || favoriting.value) return

  favoriting.value = true
  try {
    await toggleFavorite(item.value.id, !item.value.is_favorite)
    item.value.is_favorite = !item.value.is_favorite
    emit('updated', item.value)
  } catch (err) {
    console.error('Failed to toggle favorite:', err)
    error.value = 'Failed to update favorite status'
  } finally {
    favoriting.value = false
  }
}

/**
 * Handle edit action
 */
function handleEdit() {
  emit('edit', item.value)
  emit('close')
}

/**
 * Handle share action
 */
function handleShare() {
  emit('share', item.value)
}

/**
 * Handle delete action
 */
async function handleDelete() {
  if (!item.value || deleting.value) return

  const confirmed = confirm(
    `Are you sure you want to delete "${item.value.name}"? This action cannot be undone.`
  )
  if (!confirmed) return

  deleting.value = true
  try {
    await deleteItem(item.value.id)
    emit('deleted', item.value.id)
    emit('close')
  } catch (err) {
    console.error('Failed to delete item:', err)
    error.value = 'Failed to delete item'
  } finally {
    deleting.value = false
  }
}

/**
 * Toggle image zoom
 */
function toggleImageZoom() {
  imageZoomed.value = !imageZoomed.value
}

/**
 * Handle modal close
 */
function handleClose() {
  imageZoomed.value = false
  emit('close')
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Get color hex code for color swatch
 */
function getColorHex(colorName) {
  const colorMap = {
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    orange: '#F97316',
    purple: '#A855F7',
    pink: '#EC4899',
    black: '#1F2937',
    white: '#F3F4F6',
    gray: '#6B7280',
    brown: '#92400E',
    beige: '#D4A574',
    navy: '#1E3A8A',
    maroon: '#7C2D12',
    teal: '#14B8A6',
    cyan: '#06B6D4',
    lime: '#84CC16',
    indigo: '#6366F1',
    violet: '#8B5CF6',
    fuchsia: '#D946EF'
  }

  return colorMap[colorName?.toLowerCase()] || '#9CA3AF'
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
