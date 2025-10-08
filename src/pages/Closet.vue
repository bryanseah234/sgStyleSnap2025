<!--
  Closet Page - StyleSnap
  
  Purpose: Main page displaying user's digital closet with all clothing items
  
  Features:
  - Displays ClosetGrid component
  - Shows QuotaIndicator in header/layout
  - Add item button (opens AddItemForm modal)
  - Filter and sort controls
  - This is the home page after login
  
  Route: /closet
  Auth: Protected (requires authentication)
  
  Usage:
  This is typically the default landing page after login
  
  Reference:
  - docs/design/mobile-mockups/03-closet-grid.png for closet view
  - components/closet/ClosetGrid.vue for main content
  - components/closet/AddItemForm.vue for add item modal
-->

<template>
  <MainLayout>
    <div class="closet-page">
      <div class="closet-header">
        <div class="header-content">
          <div>
            <h1>My Closet</h1>
            <p class="quota-text">
              {{ quotaUsed }} / 50 uploads ({{ totalItems }} total items)
              <span v-if="quotaUsed >= 45" class="quota-warning">⚠️ Near limit!</span>
            </p>
          </div>
          
          <!-- Settings Icon -->
          <button
            @click="goToSettings"
            class="settings-button transition-all duration-300 ease-out hover:scale-110 active:scale-95"
            title="Settings"
          >
            <svg class="w-6 h-6 transition-transform duration-500 hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="animate-fade-in">
        <ClosetFilter
          :filters="filters"
          @update:filters="handleFilterChange"
        />
      </div>
      
      <div class="closet-content">
        <!-- Loading State -->
        <div v-if="closetStore.loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading your closet...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="items.length === 0" class="empty-state">
          <div class="empty-icon">👔</div>
          <p class="empty-message">
            {{ hasFilters ? 'No items match your filters' : 'Your closet is empty. Add your first item!' }}
          </p>
          <button v-if="!hasFilters" @click="handleAddItem" class="add-first-button">
            Add Item
          </button>
        </div>
        
        <!-- Items Grid -->
        <div v-else class="items-grid">
          <div 
            v-for="item in items" 
            :key="item.id" 
            class="item-card"
            @click="handleItemClick(item)"
          >
            <div class="item-image">
              <img v-if="item.image_url" :src="item.thumbnail_url || item.image_url" :alt="item.name" />
              <div v-else class="item-image-placeholder">
                {{ item.name }}
              </div>
            </div>
            <div class="item-info">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-category">{{ getCategoryLabel(item.category) }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- FAB -->
      <button 
        class="fab"
        :class="[
          'transition-all duration-300 ease-out',
          'hover:scale-110 hover:rotate-90 hover:shadow-2xl',
          'active:scale-95',
          quotaUsed >= 45 ? 'animate-pulse-slow' : ''
        ]"
        @click="handleAddItem" 
        title="Add new item"
      >
        <span class="plus-icon transition-transform duration-300">+</span>
      </button>

      <!-- Item Detail Modal -->
      <ItemDetailModal
        :item-id="selectedItemId"
        :is-open="showDetailModal"
        @close="closeDetailModal"
        @updated="handleItemUpdated"
        @deleted="handleItemDeleted"
        @edit="handleEditItem"
        @share="handleShareItem"
      />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClosetStore } from '../stores/closet-store'
import MainLayout from '../components/layouts/MainLayout.vue'
import ClosetFilter from '../components/closet/ClosetFilter.vue'
import ItemDetailModal from '../components/closet/ItemDetailModal.vue'
import { getCategoryLabel } from '@/config/constants'

const router = useRouter()
const closetStore = useClosetStore()

const filters = ref({
  category: '',
  clothing_type: '',
  privacy: '',
  is_favorite: false
})

// Item detail modal state
const selectedItemId = ref(null)
const showDetailModal = ref(false)

const items = computed(() => {
  let filtered = closetStore.items

  if (filters.value.category) {
    filtered = filtered.filter(item => item.category === filters.value.category)
  }

  if (filters.value.clothing_type) {
    filtered = filtered.filter(item => item.clothing_type === filters.value.clothing_type)
  }

  if (filters.value.privacy) {
    filtered = filtered.filter(item => item.privacy === filters.value.privacy)
  }

  if (filters.value.is_favorite) {
    filtered = filtered.filter(item => item.is_favorite === true)
  }

  return filtered
})

const quotaUsed = computed(() => closetStore.quota?.used || 0)
const totalItems = computed(() => closetStore.quota?.totalItems || 0)
const hasFilters = computed(() => filters.value.category || filters.value.clothing_type || filters.value.privacy || filters.value.is_favorite)

const availableCategories = computed(() => {
  // Get unique categories from user's items
  const categories = [...new Set(closetStore.items.map(item => item.category))]
  return categories.filter(Boolean).sort()
})

onMounted(() => {
  closetStore.fetchItems()
})

function handleAddItem() {
  alert('Add item functionality coming soon!')
}

function handleFilterChange(newFilters) {
  filters.value = { ...newFilters }
}

function goToSettings() {
  router.push('/settings')
}

// Item detail modal handlers
function handleItemClick(item) {
  selectedItemId.value = item.id
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedItemId.value = null
}

function handleItemUpdated(updatedItem) {
  // Item updated in modal, refresh the closet
  closetStore.fetchItems()
}

function handleItemDeleted(deletedItemId) {
  // Item deleted, refresh the closet
  closetStore.fetchItems()
}

function handleEditItem(item) {
  // TODO: Open edit form modal
  alert(`Edit item: ${item.name}`)
}

function handleShareItem(item) {
  // TODO: Open share dialog
  alert(`Share item: ${item.name}`)
}
</script>

<style scoped>
.closet-page {
  min-height: 100vh;
  padding: 1rem;
  background-color: #f9fafb;
}

.closet-header {
  margin-bottom: 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.closet-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.quota-text {
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.settings-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.settings-button:hover {
  background-color: #f3f4f6;
  color: #111827;
  border-color: #d1d5db;
}

.settings-button:active {
  transform: scale(0.95);
}

.settings-button svg {
  width: 1.5rem;
  height: 1.5rem;
}

.quota-warning {
  color: #f59e0b;
  font-weight: 600;
}

.loading-state {
  text-align: center;
  padding: 3rem 1rem;
}

.spinner {
  display: inline-block;
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-message {
  color: #9ca3af;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.add-first-button {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-first-button:hover {
  background-color: #2563eb;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.item-card {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.item-image {
  aspect-ratio: 1;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-image-placeholder {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  font-size: 0.875rem;
  color: #6b7280;
  padding: 1rem;
  text-align: center;
}

.item-info {
  padding: 0.75rem;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-category {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.fab {
  position: fixed;
  bottom: 6rem;
  right: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 50;
}

.fab:hover {
  background-color: #2563eb;
  transform: scale(1.05);
}

.plus-icon {
  font-size: 2rem;
  line-height: 1;
}

@media (max-width: 640px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }
}
</style>
