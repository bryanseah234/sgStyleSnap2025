<template>
  <div class="shared-outfits-feed">
    <!-- Header with Filters -->
    <div class="mb-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">
          Outfit Feed
        </h2>
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          @click="showShareModal = true"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Share Outfit
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="flex items-center space-x-2 border-b">
        <button
          v-for="filter in visibilityFilters"
          :key="filter.value"
          class="px-4 py-2 font-medium text-sm transition-colors relative"
          :class="
            activeVisibilityFilter === filter.value
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          "
          @click="changeVisibilityFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Loading State (Initial) -->
    <div
      v-if="loading && feed.length === 0"
      class="text-center py-12"
    >
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      <p class="mt-4 text-gray-600">
        Loading outfit feed...
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!loading && feed.length === 0"
      class="text-center py-12"
    >
      <svg
        class="w-24 h-24 mx-auto text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">
        No Outfits Yet
      </h3>
      <p class="text-gray-600 mb-6">
        {{ emptyStateMessage }}
      </p>
      <button
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        @click="showShareModal = true"
      >
        Share Your First Outfit
      </button>
    </div>

    <!-- Feed Grid -->
    <div
      v-else
      class="space-y-6"
    >
      <SharedOutfitCard
        v-for="outfit in feed"
        :key="outfit.id"
        :outfit="outfit"
        @view-outfit="viewOutfit"
        @edit="editOutfit"
        @delete="deleteOutfit"
      />
    </div>

    <!-- Load More Button -->
    <div
      v-if="hasMore && !loading"
      class="mt-8 text-center"
    >
      <button
        class="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        @click="loadMore"
      >
        Load More
      </button>
    </div>

    <!-- Loading More Indicator -->
    <div
      v-if="loading && feed.length > 0"
      class="mt-8 text-center"
    >
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <!-- Error Message -->
    <div
      v-if="error"
      class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <p class="text-sm text-red-600">
        {{ error }}
      </p>
    </div>

    <!-- Share Modal -->
    <ShareOutfitModal
      :is-open="showShareModal"
      :selected-items="selectedItems"
      @close="showShareModal = false"
      @success="handleShareSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSharedOutfitsStore } from '@/stores/shared-outfits-store'
import SharedOutfitCard from './SharedOutfitCard.vue'
import ShareOutfitModal from './ShareOutfitModal.vue'

const props = defineProps({
  selectedItems: {
    type: Array,
    default: () => []
  },
  initialFilter: {
    type: String,
    default: 'all'
  }
})

const sharedOutfitsStore = useSharedOutfitsStore()

const showShareModal = ref(false)
const activeVisibilityFilter = ref(props.initialFilter)

const visibilityFilters = [
  { value: 'all', label: 'All Outfits' },
  { value: 'friends', label: 'Friends Only' },
  { value: 'public', label: 'Public' }
]

// Computed properties from store
const feed = computed(() => sharedOutfitsStore.sortedFeed)
const loading = computed(() => sharedOutfitsStore.loading)
const error = computed(() => sharedOutfitsStore.error)
const hasMore = computed(() => sharedOutfitsStore.hasMore)

const emptyStateMessage = computed(() => {
  if (activeVisibilityFilter.value === 'friends') {
    return 'No outfits shared by your friends yet. Be the first to share!'
  } else if (activeVisibilityFilter.value === 'public') {
    return 'No public outfits to show. Share an outfit with everyone!'
  }
  return 'No outfits have been shared yet. Start sharing your style!'
})

onMounted(async () => {
  await fetchFeed()
})

const fetchFeed = async () => {
  await sharedOutfitsStore.fetchFeed({
    visibility: activeVisibilityFilter.value
  })
}

const changeVisibilityFilter = async filter => {
  if (activeVisibilityFilter.value === filter) return

  activeVisibilityFilter.value = filter
  await fetchFeed()
}

const loadMore = async () => {
  await sharedOutfitsStore.loadMore()
}

const viewOutfit = outfit => {
  // Could navigate to a detailed view page
  console.log('View outfit:', outfit)
}

const editOutfit = async outfit => {
  const newCaption = prompt('Edit caption:', outfit.caption || '')

  if (newCaption !== null) {
    try {
      await sharedOutfitsStore.updateSharedOutfit(outfit.id, {
        caption: newCaption
      })
    } catch (err) {
      console.error('Failed to update outfit:', err)
      alert('Failed to update outfit. Please try again.')
    }
  }
}

const deleteOutfit = async outfit => {
  if (confirm('Are you sure you want to delete this shared outfit?')) {
    try {
      await sharedOutfitsStore.deleteSharedOutfit(outfit.id)
    } catch (err) {
      console.error('Failed to delete outfit:', err)
      alert('Failed to delete outfit. Please try again.')
    }
  }
}

const handleShareSuccess = async () => {
  // Refresh feed to show new outfit
  await fetchFeed()
}
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
