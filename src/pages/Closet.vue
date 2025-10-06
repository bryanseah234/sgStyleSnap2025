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
        <h1>My Closet</h1>
        <p class="quota-text">{{ quotaUsed }} / 200 items</p>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label class="filter-label">Category</label>
          <select
            v-model="closetStore.filters.category"
            @change="closetStore.fetchItems()"
            class="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="top">Tops</option>
            <option value="bottom">Bottoms</option>
            <option value="outerwear">Outerwear</option>
            <option value="shoes">Shoes</option>
            <option value="accessory">Accessories</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Clothing Type</label>
          <select
            v-model="closetStore.filters.clothing_type"
            @change="closetStore.fetchItems()"
            class="filter-select"
          >
            <option value="all">All Types</option>
            <option
              v-for="type in clothingTypes"
              :key="type"
              :value="type"
            >
              {{ type }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Search</label>
          <input
            v-model="closetStore.filters.search"
            type="text"
            placeholder="Search items..."
            class="filter-input"
          />
        </div>
      </div>
      
      <div class="closet-content">
        <p v-if="items.length === 0" class="empty-message">
          Your closet is empty. Add your first item!
        </p>
        
        <div v-else class="items-grid">
          <div v-for="item in items" :key="item.id" class="item-card">
            <div class="item-image-placeholder">
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
      
      <button class="fab" @click="handleAddItem">
        <span class="plus-icon">+</span>
      </button>
    </div>
  </MainLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useClosetStore } from '../stores/closet-store'
import MainLayout from '../components/layouts/MainLayout.vue'
import { CLOTHING_TYPES } from '@/utils/clothing-constants'

const closetStore = useClosetStore()

const items = computed(() => closetStore.filteredItems)
const quotaUsed = computed(() => closetStore.quota.used)
const clothingTypes = CLOTHING_TYPES

onMounted(() => {
  closetStore.fetchItems()
})

function handleAddItem() {
  alert('Add item functionality coming soon!')
}
</script>

<style scoped>
.closet-page {
  min-height: 100vh;
  padding: 1rem;
  background-color: #f9fafb;
}

.closet-header {
  margin-bottom: 1.5rem;
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
}

.empty-message {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
  font-size: 1rem;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.item-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-image-placeholder {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.fab {
  position: fixed;
  bottom: 2rem;
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
}

.fab:hover {
  background-color: #2563eb;
  transform: scale(1.05);
}

.plus-icon {
  font-size: 2rem;
  line-height: 1;
}

.filters-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.filter-select,
.filter-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
