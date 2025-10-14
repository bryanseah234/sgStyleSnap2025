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
      <!-- User Greeting and Weather -->
      <UserGreeting />
      
      <div class="closet-header">
        <div class="header-content">
          <div>
            <h1>My Closet</h1>
            <p class="quota-text">
              {{ quotaUsed }} / 50 uploads ({{ totalItems }} total items)
              <span
                v-if="quotaUsed >= 45"
                class="quota-warning"
              >⚠️ Near limit!</span>
            </p>
          </div>
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
        <!-- Closet Grid with all animations and features -->
        <ClosetGrid
          :items="items"
          :loading="closetStore.loading"
          :empty-message="
            hasFilters
              ? 'No items match your filters'
              : 'Your closet is empty. Add your first item!'
          "
          :show-favorites="true"
          @item-click="handleItemClick"
          @favorite-click="handleFavoriteClick"
        >
          <template
            v-if="!hasFilters"
            #empty-action
          >
            <div class="add-item-container">
              <button
                class="add-first-button"
                @click="toggleEmptyStateDropdown"
              >
                Add Item
              </button>
              
              <!-- Empty State Dropdown -->
              <div
                v-if="showEmptyStateDropdown"
                class="add-item-dropdown empty-state-dropdown"
                :class="{ 'show': showEmptyStateDropdown }"
                @click.stop
              >
                <button
                  class="dropdown-option"
                  @click="handleScanOrUpload"
                >
                  Scan or Upload
                </button>
                <button
                  class="dropdown-option"
                  @click="handleAddFromCatalog"
                >
                  Add from Catalogue
                </button>
              </div>
            </div>
          </template>
        </ClosetGrid>
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
        title="Add new item"
        @click="toggleFabDropdown"
      >
        <span class="plus-icon transition-transform duration-300">+</span>
        
        <!-- Dropdown Menu -->
        <div
          v-if="showFabDropdown"
          class="add-item-dropdown fab-dropdown"
          :class="{ 'show': showFabDropdown }"
          @click.stop
        >
          <button
            class="dropdown-option"
            @click.stop="handleScanOrUpload"
          >
            Scan or Upload
          </button>
          <button
            class="dropdown-option"
            @click.stop="handleAddFromCatalog"
          >
            Add from Catalogue
          </button>
        </div>
      </button>

      <!-- Backdrop -->
      <div
        v-if="showFabDropdown || showEmptyStateDropdown"
        class="dropdown-backdrop"
        @click="closeAllDropdowns"
      ></div>

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

      <!-- Add Item Modal -->
      <AddItemModal
        :is-open="showAddItemModal"
        @close="closeAddItemModal"
        @success="handleAddItemSuccess"
      />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClosetStore } from '../stores/closet-store'
import MainLayout from '../components/layouts/MainLayout.vue'
import UserGreeting from '../components/ui/UserGreeting.vue'
import ClosetFilter from '../components/closet/ClosetFilter.vue'
import ClosetGrid from '../components/closet/ClosetGrid.vue'
import ItemDetailModal from '../components/closet/ItemDetailModal.vue'
import AddItemModal from '../components/closet/AddItemModal.vue'

const router = useRouter()
const closetStore = useClosetStore()

const userId = ref(null)

const filters = ref({
  category: '',
  clothing_type: '',
  privacy: '',
  is_favorite: false
})

// Item detail modal state
const selectedItemId = ref(null)
const showDetailModal = ref(false)

// Add item modal state
const showAddItemModal = ref(false)

// Add item dropdown states
const showFabDropdown = ref(false)
const showEmptyStateDropdown = ref(false)

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
const hasFilters = computed(
  () =>
    filters.value.category ||
    filters.value.clothing_type ||
    filters.value.privacy ||
    filters.value.is_favorite
)

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  userId.value = user.id
  closetStore.fetchItems(userId.value)
})

// Dropdown functions
function toggleFabDropdown() {
  showFabDropdown.value = !showFabDropdown.value
  // Close empty state dropdown if it's open
  showEmptyStateDropdown.value = false
}

function toggleEmptyStateDropdown() {
  showEmptyStateDropdown.value = !showEmptyStateDropdown.value
  // Close FAB dropdown if it's open
  showFabDropdown.value = false
}

function closeFabDropdown() {
  showFabDropdown.value = false
}

function closeEmptyStateDropdown() {
  showEmptyStateDropdown.value = false
}

function closeAllDropdowns() {
  showFabDropdown.value = false
  showEmptyStateDropdown.value = false
}

function handleScanOrUpload() {
  closeAllDropdowns()
  showAddItemModal.value = true
}

function handleAddFromCatalog() {
  closeAllDropdowns()
  router.push('/catalog')
}

function closeAddItemModal() {
  showAddItemModal.value = false
}

function handleAddItemSuccess() {
  // Item added successfully, refresh the closet
  if (userId.value) {
    closetStore.fetchItems(userId.value)
  }
  closeAddItemModal()
}

function handleFilterChange(newFilters) {
  filters.value = { ...newFilters }
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

function handleItemUpdated() {
  // Item updated in modal, refresh the closet
  if (userId.value) {
    closetStore.fetchItems(userId.value)
  }
}

function handleItemDeleted() {
  // Item deleted, refresh the closet
  if (userId.value) {
    closetStore.fetchItems(userId.value)
  }
}

function handleEditItem(item) {
  // TODO: Open edit form modal
  alert(`Edit item: ${item.name}`)
}

function handleShareItem(item) {
  // TODO: Open share dialog
  alert(`Share item: ${item.name}`)
}

async function handleFavoriteClick(item) {
  try {
    await closetStore.toggleFavorite(item.id)
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}
</script>

<style scoped>
.closet-page {
  min-height: 100vh;
  padding: 1rem;
  background-color: var(--theme-background);
}

.closet-header {
  margin-bottom: 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.closet-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--theme-text);
  margin-bottom: 0.25rem;
  text-align: center;
}

.quota-text {
  font-size: 0.875rem;
  color: var(--theme-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}


.quota-warning {
  color: #f59e0b;
  font-weight: 600;
}

/* Add Item Container (for empty state) */
.add-item-container {
  position: relative;
  display: inline-block;
}

/* Add First Button (for empty state) */
.add-first-button {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-first-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.add-first-button:active {
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .add-first-button:hover {
    transform: none;
  }
}

/* FAB - Floating Action Button */
.fab {
  position: fixed;
  bottom: 5.5rem;
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
  z-index: 50;
}

/* Add Item Dropdown - Base Styles */
.add-item-dropdown {
  position: absolute;
  background: white !important;
  border-radius: 0.75rem !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid #e5e7eb !important;
  min-width: 200px !important;
  opacity: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  pointer-events: none;
  z-index: 100 !important;
}

/* FAB Dropdown - positioned above the FAB button */
.add-item-dropdown.fab-dropdown {
  bottom: 4.5rem;
  right: 0;
  transform: translateY(10px) scale(0.95);
}

/* Empty State Dropdown - positioned below the Add Item button */
.add-item-container .add-item-dropdown.empty-state-dropdown {
  top: calc(100% + 0.75rem);
  left: 50%;
  transform: translateX(-50%) translateY(10px) scale(0.95);
}

.add-item-dropdown.show {
  opacity: 1 !important;
  pointer-events: auto !important;
}

.add-item-dropdown.fab-dropdown.show {
  transform: translateY(0) scale(1);
}

.add-item-container .add-item-dropdown.empty-state-dropdown.show {
  transform: translateX(-50%) translateY(0) scale(1);
}

.dropdown-option {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  width: 100% !important;
  padding: 0.875rem 1rem !important;
  border: none !important;
  background: transparent !important;
  color: #374151 !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease !important;
  border-radius: 0.5rem !important;
  margin: 0.25rem !important;
  pointer-events: auto !important;
}

.dropdown-option:first-child {
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

.dropdown-option:last-child {
  border-radius: 0 0 0.5rem 0.5rem !important;
}

.dropdown-option:hover {
  background-color: #f3f4f6 !important;
}

.dropdown-option:active {
  background-color: #e5e7eb !important;
}


/* Dropdown Backdrop */
.dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 40;
}


/* FAB Hover with Rotate and Scale */
.fab:hover {
  background-color: #2563eb;
}

/* Plus Icon Rotation on Hover */
.plus-icon {
  font-size: 2rem;
  line-height: 1;
}

/* Pulse Animation for Near-Quota Warning */
@keyframes pulse-slow {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(245, 158, 11, 0.4);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .fab {
    transition: background-color 0.2s ease;
  }

  .fab:hover {
    transform: none;
  }

  .animate-pulse-slow {
    animation: none;
    box-shadow: 0 4px 6px rgba(245, 158, 11, 0.4);
  }
}
</style>
