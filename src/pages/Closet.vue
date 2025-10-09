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
      <!-- Greeting Section -->
      <div class="greeting-section">
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <span class="text-gray-500 dark:text-gray-400 text-3xl">👤</span>
          </div>
          <div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Hello, {{ userName }}</h2>
            <p class="text-lg text-gray-600 dark:text-gray-400">{{ weatherText }}</p>
          </div>
        </div>
      </div>

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
          
          <!-- Settings Icon -->
          <button
            class="settings-button transition-all duration-300 ease-out hover:scale-110 active:scale-95"
            title="Settings"
            @click="goToSettings"
          >
            <svg
              class="w-6 h-6 transition-transform duration-500 hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
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
        <!-- Closet Grid with all animations and features -->
        <ClosetGrid
          :items="items"
          :loading="closetStore.loading"
          :empty-message="hasFilters ? 'No items match your filters' : 'Your closet is empty. Add your first item!'"
          :show-favorites="true"
          @item-click="handleItemClick"
          @favorite-click="handleFavoriteClick"
        >
          <template
            v-if="!hasFilters"
            #empty-action
          >
            <div class="add-first-container">
              <button
                class="add-first-button"
                @click="toggleDropdown"
              >
                Add Item
              </button>
              
              <!-- Dropdown Menu for Add Item -->
              <div v-if="showDropdown" class="add-first-dropdown">
                <button 
                  class="dropdown-item"
                  @click="handleScanUpload"
                >
                  <svg class="dropdown-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 18l3-3h-2V7h-2v8H9l3 3zm8-5v8c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-8h2v8h12v-8h2z"/>
                  </svg>
                  Scan/Upload Item
                </button>
                <button 
                  class="dropdown-item"
                  @click="handleAddFromCatalog"
                >
                  <svg class="dropdown-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2V4.07c3.25 1.19 5.5 4.37 5.5 7.93 0 2.02-.84 3.84-2.19 5.19l-.01.01z"/>
                  </svg>
                  Add from Catalogue
                </button>
              </div>
            </div>
          </template>
        </ClosetGrid>
      </div>
      
      <!-- FAB with Dropdown -->
      <div class="fab-container">
        <button 
          class="fab"
          :class="[
            'transition-all duration-300 ease-out',
            'hover:scale-110 hover:rotate-90 hover:shadow-2xl',
            'active:scale-95',
            quotaUsed >= 45 ? 'animate-pulse-slow' : ''
          ]"
          title="Add new item" 
          @click="toggleDropdown"
        >
          <span class="plus-icon transition-transform duration-300">+</span>
        </button>
        
        <!-- Dropdown Menu -->
        <div v-if="showDropdown" class="fab-dropdown">
          <button 
            class="dropdown-item"
            @click="handleScanUpload"
          >
            <svg class="dropdown-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 18l3-3h-2V7h-2v8H9l3 3zm8-5v8c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-8h2v8h12v-8h2z"/>
            </svg>
            Scan/Upload Item
          </button>
          <button 
            class="dropdown-item"
            @click="handleAddFromCatalog"
          >
            <svg class="dropdown-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2V4.07c3.25 1.19 5.5 4.37 5.5 7.93 0 2.02-.84 3.84-2.19 5.19l-.01.01z"/>
            </svg>
            Add from Catalogue
          </button>
        </div>
      </div>

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
import { useAuthStore } from '../stores/auth-store'
import { getCurrentWeather } from '../services/weather-service'
import MainLayout from '../components/layouts/MainLayout.vue'
import ClosetFilter from '../components/closet/ClosetFilter.vue'
import ClosetGrid from '../components/closet/ClosetGrid.vue'
import ItemDetailModal from '../components/closet/ItemDetailModal.vue'

const router = useRouter()
const closetStore = useClosetStore()
const authStore = useAuthStore()

// User name for greeting
const userName = computed(() => {
  return authStore.user?.name || 'User'
})

// Weather data
const weatherData = ref(null)
const weatherLoading = ref(false)
const weatherError = ref(null)

// Singapore coordinates as default
const SINGAPORE_COORDS = {
  lat: 1.3521,
  lon: 103.8198
}

// Weather display text
const weatherText = computed(() => {
  if (weatherLoading.value) {
    return 'Checking weather...'
  }
  
  if (weatherError.value) {
    return 'Get inspired by your friends'
  }
  
  if (!weatherData.value) {
    return 'Get inspired by your friends'
  }
  
  const { temp, condition, description } = weatherData.value
  const tempCelsius = Math.round((temp - 32) * 5/9) // Convert from Fahrenheit to Celsius
  
  // Create communicative weather text
  const weatherEmoji = getWeatherEmoji(condition)
  const weatherMood = getWeatherMood(tempCelsius, condition)
  
  return `${weatherEmoji} ${tempCelsius}°C ${description} - ${weatherMood}`
})

// Get weather emoji based on condition
function getWeatherEmoji(condition) {
  const conditionMap = {
    'clear': '☀️',
    'clouds': '☁️',
    'rain': '🌧️',
    'drizzle': '🌦️',
    'thunderstorm': '⛈️',
    'snow': '❄️',
    'mist': '🌫️',
    'fog': '🌫️'
  }
  return conditionMap[condition.toLowerCase()] || '🌤️'
}

// Get weather mood/advice
function getWeatherMood(temp, condition) {
  if (temp < 20) {
    return 'Perfect for cozy layers!'
  } else if (temp < 25) {
    return 'Great weather for light layers'
  } else if (temp < 30) {
    return 'Perfect for comfortable outfits'
  } else {
    return 'Time for light, breathable clothes'
  }
}

// Fetch weather data
async function fetchWeather() {
  weatherLoading.value = true
  weatherError.value = null
  
  try {
    const weather = await getCurrentWeather(SINGAPORE_COORDS.lat, SINGAPORE_COORDS.lon)
    weatherData.value = weather
  } catch (error) {
    console.error('Failed to fetch weather:', error)
    weatherError.value = error.message
  } finally {
    weatherLoading.value = false
  }
}

const filters = ref({
  category: '',
  clothing_type: '',
  privacy: '',
  is_favorite: false
})

// Item detail modal state
const selectedItemId = ref(null)
const showDetailModal = ref(false)

// FAB dropdown state
const showDropdown = ref(false)

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

onMounted(() => {
  closetStore.fetchItems()
  fetchWeather()
})

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleScanUpload() {
  showDropdown.value = false
  alert('Scan/Upload functionality coming soon!')
}

function handleAddFromCatalog() {
  showDropdown.value = false
  router.push('/catalog')
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

function handleItemUpdated() {
  // Item updated in modal, refresh the closet
  closetStore.fetchItems()
}

function handleItemDeleted() {
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
  background-color: #f9fafb;
}

.greeting-section {
  margin-bottom: 2rem;
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

/* Add First Button Container (for empty state) */
.add-first-container {
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

/* Add First Dropdown */
.add-first-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;
  z-index: 100;
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

/* FAB Container */
.fab-container {
  position: fixed !important;
  bottom: 5.5rem !important;
  right: 2rem !important;
  z-index: 50;
}

/* FAB - Floating Action Button */
.fab {
  position: fixed !important;
  bottom: 5.5rem !important;
  right: 2rem !important;
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
  z-index: 100;
}

/* FAB Dropdown */
.fab-dropdown {
  position: absolute;
  bottom: 4rem;
  right: 0;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.875rem;
  color: #374151;
  min-height: 2.5rem;
  line-height: 1.5;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

.dropdown-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
  0%, 100% {
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
