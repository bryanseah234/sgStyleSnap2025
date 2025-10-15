<!--
  Item Detail Modal - StyleSnap
  
  Purpose: Full-screen modal displaying comprehensive item details and statistics
  
  Features:
  - Full-resolution image display with zoom capability
  - Complete item information (name, category, brand, size, color, privacy, tags)
  - Comprehensive statistics section
  - Action buttons (Edit, Delete, Share, Favorite/Unfavorite)
  - Responsive design with dark mode support
  
  Usage:
  <ItemDetailModal
    :item-id="selectedItemId"
    :is-open="showModal"
    @close="showModal = false"
    @updated="handleItemUpdated"
    @deleted="handleItemDeleted"
  />
-->

<template>
  <Modal
    :is-open="isOpen"
    :title="item?.name || 'Item Details'"
    size="large"
    @close="handleClose"
  >
    <!-- Loading State -->
    <div v-if="loading" class="modal-loading">
      <Spinner size="lg" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="modal-error">
      <p class="error-message">{{ error }}</p>
      <Button @click="loadItemDetails">Retry</Button>
    </div>

    <!-- Item Details -->
    <div v-else-if="item" class="modal-content">
      <!-- Image Section -->
      <div class="image-container">
        <img
          :src="item.image_url"
          :alt="item.name"
          class="item-image"
          @click="toggleImageZoom"
        >

        <!-- Favorite Button Overlay -->
        <button
          class="favorite-button"
          :disabled="favoriting"
          @click="toggleFavoriteStatus"
        >
          <svg
            class="favorite-icon"
            :class="item.is_favorite ? 'favorite-active' : 'favorite-inactive'"
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
      <div class="information-section">
        <!-- Basic Info -->
        <div class="info-section">
          <h3 class="section-title">Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <p class="info-label">Category</p>
              <p class="info-value capitalize">{{ item.category }}</p>
            </div>
            <div v-if="item.clothing_type" class="info-item">
              <p class="info-label">Type</p>
              <p class="info-value capitalize">{{ item.clothing_type }}</p>
            </div>
            <div v-if="item.brand" class="info-item">
              <p class="info-label">Brand</p>
              <p class="info-value">{{ item.brand }}</p>
            </div>
            <div v-if="item.size" class="info-item">
              <p class="info-label">Size</p>
              <p class="info-value">{{ item.size }}</p>
            </div>
            <div v-if="item.primary_color" class="info-item">
              <p class="info-label">Color</p>
              <div class="color-display">
                <div
                  class="color-swatch"
                  :style="{ backgroundColor: getColorHex(item.primary_color) }"
                />
                <p class="info-value capitalize">{{ item.primary_color }}</p>
              </div>
            </div>
            <div class="info-item">
              <p class="info-label">Privacy</p>
              <p class="info-value capitalize">{{ item.privacy || 'private' }}</p>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="info-section">
          <h3 class="section-title">Statistics</h3>
          <div class="info-grid">
            <div class="info-item">
              <p class="info-label">Days in Closet</p>
              <p class="info-value">{{ daysInCloset }}</p>
            </div>
            <div class="info-item">
              <p class="info-label">Status</p>
              <p class="info-value">{{ item.is_favorite ? 'Favorite' : 'Regular' }}</p>
            </div>
            <div v-if="statistics" class="info-item">
              <p class="info-label">Times Worn</p>
              <p class="info-value">{{ statistics.times_worn || 0 }} times</p>
            </div>
            <div v-if="statistics" class="info-item">
              <p class="info-label">In Outfits</p>
              <p class="info-value">{{ statistics.in_outfits || 0 }} outfits</p>
            </div>
            <div v-if="statistics" class="info-item">
              <p class="info-label">Times Shared</p>
              <p class="info-value">{{ statistics.times_shared || 0 }} times</p>
            </div>
            <div class="info-item">
              <p class="info-label">Last Updated</p>
              <p class="info-value">{{ formatDate(item.updated_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="item.style_tags && item.style_tags.length > 0" class="info-section">
          <h3 class="section-title">Tags</h3>
          <div class="tags-container">
            <Badge
              v-for="tag in item.style_tags"
              :key="tag"
              variant="outline"
              class="tag-item"
            >
              {{ tag }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <Button variant="primary" @click="handleEdit">Edit</Button>
        <Button variant="outline" @click="handleShare">Share</Button>
        <Button variant="danger" :loading="deleting" @click="handleDelete">Delete</Button>
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

const emit = defineEmits(['close', 'updated', 'deleted', 'edit', 'share'])

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
    item.value = data
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

  if (!confirm('Are you sure you want to delete this item?')) return

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
 * Handle close
 */
function handleClose() {
  emit('close')
}

/**
 * Toggle image zoom
 */
function toggleImageZoom() {
  imageZoomed.value = !imageZoomed.value
}

/**
 * Get color hex value
 */
function getColorHex(colorName) {
  const colorMap = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
    orange: '#f97316',
    purple: '#a855f7',
    pink: '#ec4899',
    brown: '#a3a3a3',
    black: '#000000',
    white: '#ffffff',
    gray: '#6b7280',
    grey: '#6b7280'
  }
  return colorMap[colorName?.toLowerCase()] || '#6b7280'
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
</script>

<style scoped>
/* Modal Content */
.modal-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 0;
}

.modal-error {
  text-align: center;
  padding: 3rem 0;
}

.error-message {
  color: var(--theme-error, #dc2626);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Image Section */
.image-container {
  position: relative;
  background: var(--theme-surface-light, #f3f4f6);
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid var(--theme-border, #e5e7eb);
}

.item-image {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: contain;
  cursor: zoom-in;
  transition: transform 0.3s ease;
}

.item-image:hover {
  transform: scale(1.02);
}

.favorite-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--theme-surface, #ffffff);
  border: 1px solid var(--theme-border, #e5e7eb);
  border-radius: 50%;
  padding: 0.5rem;
  box-shadow: 0 4px 6px -1px var(--theme-shadow, rgba(0, 0, 0, 0.1));
  transition: all 0.2s ease;
  cursor: pointer;
}

.favorite-button:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 12px -2px var(--theme-shadow, rgba(0, 0, 0, 0.15));
}

.favorite-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.favorite-icon {
  width: 1.5rem;
  height: 1.5rem;
  transition: color 0.2s ease;
}

.favorite-active {
  color: var(--theme-error, #dc2626);
  fill: currentColor;
}

.favorite-inactive {
  color: var(--theme-text-muted, #9ca3af);
}

/* Information Section */
.information-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-section {
  background: var(--theme-surface, #ffffff);
  border: 1px solid var(--theme-border, #e5e7eb);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--theme-text, #111827);
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--theme-border, #e5e7eb);
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  color: var(--theme-text-secondary, #6b7280);
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--theme-text, #111827);
}

.color-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-swatch {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--theme-border, #e5e7eb);
  flex-shrink: 0;
}

/* Tags */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  font-size: 0.875rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--theme-border, #e5e7eb);
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .image-container {
    background: var(--theme-surface-dark, #1f2937);
    border-color: var(--theme-border-dark, #374151);
  }

  .favorite-button {
    background: var(--theme-surface-dark, #1f2937);
    border-color: var(--theme-border-dark, #374151);
  }

  .info-section {
    background: var(--theme-surface-dark, #1f2937);
    border-color: var(--theme-border-dark, #374151);
  }

  .section-title {
    color: var(--theme-text-dark, #f9fafb);
    border-color: var(--theme-border-dark, #374151);
  }

  .info-label {
    color: var(--theme-text-secondary-dark, #9ca3af);
  }

  .info-value {
    color: var(--theme-text-dark, #f9fafb);
  }

  .color-swatch {
    border-color: var(--theme-border-dark, #374151);
  }

  .action-buttons {
    border-color: var(--theme-border-dark, #374151);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>