<template>
  <div class="outfit-history-list">
    <!-- Header with Filters -->
    <div class="mb-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">Outfit History</h2>
        <button
          @click="showRecordModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Record Outfit
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Occasion Filter -->
          <div>
            <label for="occasion-filter" class="block text-sm font-medium text-gray-700 mb-1">
              Occasion
            </label>
            <select
              id="occasion-filter"
              v-model="filters.occasion"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Occasions</option>
              <option value="work">Work</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="party">Party</option>
              <option value="date">Date</option>
              <option value="sport">Sport</option>
              <option value="travel">Travel</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Rating Filter -->
          <div>
            <label for="rating-filter" class="block text-sm font-medium text-gray-700 mb-1">
              Min Rating
            </label>
            <select
              id="rating-filter"
              v-model="filters.min_rating"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any Rating</option>
              <option :value="5">5 Stars</option>
              <option :value="4">4+ Stars</option>
              <option :value="3">3+ Stars</option>
              <option :value="2">2+ Stars</option>
              <option :value="1">1+ Stars</option>
            </select>
          </div>

          <!-- Date Range Start -->
          <div>
            <label for="start-date" class="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              id="start-date"
              v-model="filters.start_date"
              type="date"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Date Range End -->
          <div>
            <label for="end-date" class="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              id="end-date"
              v-model="filters.end_date"
              type="date"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Active Filters & Clear -->
        <div v-if="hasActiveFilters" class="mt-3 flex items-center justify-between">
          <div class="flex items-center flex-wrap gap-2">
            <span class="text-sm text-gray-600">Active filters:</span>
            <span
              v-for="(value, key) in activeFilterLabels"
              :key="key"
              class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {{ value }}
            </span>
          </div>
          <button
            @click="clearFilters"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      <!-- Stats Summary -->
      <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-sm p-4">
          <p class="text-sm text-gray-600 mb-1">Total Outfits</p>
          <p class="text-2xl font-bold text-gray-900">{{ stats.total_outfits_worn || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <p class="text-sm text-gray-600 mb-1">Avg Rating</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ stats.avg_rating ? stats.avg_rating.toFixed(1) : 'N/A' }}
          </p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <p class="text-sm text-gray-600 mb-1">Most Worn</p>
          <p class="text-sm font-semibold text-gray-900 truncate">
            {{ stats.most_worn_occasion || 'N/A' }}
          </p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <p class="text-sm text-gray-600 mb-1">Items Used</p>
          <p class="text-2xl font-bold text-gray-900">{{ stats.total_items_used || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && history.length === 0" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Loading outfit history...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && history.length === 0" class="text-center py-12">
      <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">No Outfit History Yet</h3>
      <p class="text-gray-600 mb-6">Start recording your outfits to track what you wear!</p>
      <button
        @click="showRecordModal = true"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Record Your First Outfit
      </button>
    </div>

    <!-- Outfit History Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <OutfitHistoryCard
        v-for="entry in history"
        :key="entry.id"
        :entry="entry"
        @view="viewEntry"
        @edit="editEntry"
        @delete="deleteEntry"
      />
    </div>

    <!-- Load More Button -->
    <div v-if="hasMore && !loading" class="mt-8 text-center">
      <button
        @click="loadMore"
        class="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Load More
      </button>
    </div>

    <!-- Loading More Indicator -->
    <div v-if="loading && history.length > 0" class="mt-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <!-- Record/Edit Modal -->
    <RecordOutfitModal
      :is-open="showRecordModal"
      :selected-items="selectedItems"
      :entry-to-edit="entryToEdit"
      @close="closeModal"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOutfitHistoryStore } from '@/stores/outfit-history-store'
import OutfitHistoryCard from './OutfitHistoryCard.vue'
import RecordOutfitModal from './RecordOutfitModal.vue'

const props = defineProps({
  selectedItems: {
    type: Array,
    default: () => []
  }
})

const outfitHistoryStore = useOutfitHistoryStore()

const showRecordModal = ref(false)
const entryToEdit = ref(null)

const filters = ref({
  occasion: '',
  min_rating: '',
  start_date: '',
  end_date: ''
})

// Computed properties from store
const history = computed(() => outfitHistoryStore.sortedHistory)
const stats = computed(() => outfitHistoryStore.stats)
const loading = computed(() => outfitHistoryStore.loading)
const error = computed(() => outfitHistoryStore.error)
const hasMore = computed(() => outfitHistoryStore.hasMore)

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => value !== '')
})

const activeFilterLabels = computed(() => {
  const labels = {}
  if (filters.value.occasion) {
    labels.occasion = `Occasion: ${capitalizeFirst(filters.value.occasion)}`
  }
  if (filters.value.min_rating) {
    labels.rating = `Min ${filters.value.min_rating}★`
  }
  if (filters.value.start_date) {
    labels.start = `From: ${new Date(filters.value.start_date).toLocaleDateString()}`
  }
  if (filters.value.end_date) {
    labels.end = `To: ${new Date(filters.value.end_date).toLocaleDateString()}`
  }
  return labels
})

onMounted(async () => {
  await Promise.all([
    outfitHistoryStore.fetchHistory(),
    outfitHistoryStore.fetchStats()
  ])
})

const applyFilters = async () => {
  await outfitHistoryStore.applyFilters(filters.value)
}

const clearFilters = async () => {
  filters.value = {
    occasion: '',
    min_rating: '',
    start_date: '',
    end_date: ''
  }
  await outfitHistoryStore.clearFilters()
}

const loadMore = async () => {
  await outfitHistoryStore.loadMore()
}

const viewEntry = (entry) => {
  // Could open a detail modal or navigate to detail page
  console.log('View entry:', entry)
  // For now, just show edit modal
  editEntry(entry)
}

const editEntry = (entry) => {
  entryToEdit.value = entry
  showRecordModal.value = true
}

const deleteEntry = async (entry) => {
  if (confirm('Are you sure you want to delete this outfit entry?')) {
    try {
      await outfitHistoryStore.deleteHistory(entry.id)
      // Refresh stats after deletion
      await outfitHistoryStore.fetchStats()
    } catch (err) {
      console.error('Failed to delete entry:', err)
    }
  }
}

const closeModal = () => {
  showRecordModal.value = false
  entryToEdit.value = null
}

const handleSuccess = async () => {
  // Refresh stats after adding/updating
  await outfitHistoryStore.fetchStats()
}

const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
