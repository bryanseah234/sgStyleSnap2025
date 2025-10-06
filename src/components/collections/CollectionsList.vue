<template>
  <div class="collections-list">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">My Collections</h2>
        <p class="text-sm text-gray-600 mt-1">Organize your outfits into collections</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Collection
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="mb-6 flex items-center space-x-2 border-b">
      <button
        v-for="filter in filters"
        :key="filter.value"
        @click="activeFilter = filter.value"
        class="px-4 py-2 font-medium text-sm transition-colors relative"
        :class="activeFilter === filter.value 
          ? 'text-blue-600 border-b-2 border-blue-600' 
          : 'text-gray-600 hover:text-gray-900'"
      >
        {{ filter.label }}
        <span v-if="filter.count !== undefined" class="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
          {{ filter.count }}
        </span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && collections.length === 0" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Loading collections...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && collections.length === 0" class="text-center py-12">
      <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">No Collections Yet</h3>
      <p class="text-gray-600 mb-6">
        {{ emptyStateMessage }}
      </p>
      <button
        @click="showCreateModal = true"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create Your First Collection
      </button>
    </div>

    <!-- Collections Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CollectionCard
        v-for="collection in displayedCollections"
        :key="collection.id"
        :collection="collection"
        @view="viewCollection"
        @edit="editCollection"
        @delete="deleteCollection"
        @toggle-favorite="toggleFavorite"
      />
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <!-- Create/Edit Modal -->
    <CreateCollectionModal
      :is-open="showCreateModal"
      :collection-to-edit="collectionToEdit"
      @close="closeModal"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCollectionsStore } from '@/stores/collections-store'
import CollectionCard from './CollectionCard.vue'
import CreateCollectionModal from './CreateCollectionModal.vue'

const emit = defineEmits(['view-collection'])

const collectionsStore = useCollectionsStore()

const showCreateModal = ref(false)
const collectionToEdit = ref(null)
const activeFilter = ref('all')

const filters = computed(() => [
  { value: 'all', label: 'All', count: collectionsStore.collections.length },
  { value: 'favorites', label: 'Favorites', count: collectionsStore.favoriteCollections.length },
  { value: 'public', label: 'Public', count: collectionsStore.publicCollections.length },
  { value: 'private', label: 'Private', count: collectionsStore.privateCollections.length }
])

// Computed properties from store
const collections = computed(() => collectionsStore.sortedCollections)
const loading = computed(() => collectionsStore.loading)
const error = computed(() => collectionsStore.error)

const displayedCollections = computed(() => {
  switch (activeFilter.value) {
    case 'favorites':
      return collectionsStore.favoriteCollections
    case 'public':
      return collectionsStore.publicCollections
    case 'private':
      return collectionsStore.privateCollections
    default:
      return collectionsStore.sortedCollections
  }
})

const emptyStateMessage = computed(() => {
  switch (activeFilter.value) {
    case 'favorites':
      return 'No favorite collections yet. Mark collections as favorites to see them here.'
    case 'public':
      return 'No public collections yet. Create a public collection to share with everyone.'
    case 'private':
      return 'No private collections yet. Create a private collection for your eyes only.'
    default:
      return 'Start organizing your outfits into collections!'
  }
})

onMounted(async () => {
  await collectionsStore.fetchCollections()
})

const viewCollection = (collection) => {
  emit('view-collection', collection)
}

const editCollection = (collection) => {
  collectionToEdit.value = collection
  showCreateModal.value = true
}

const deleteCollection = async (collection) => {
  if (confirm(`Are you sure you want to delete "${collection.name}"?`)) {
    try {
      await collectionsStore.deleteCollection(collection.id)
    } catch (err) {
      console.error('Failed to delete collection:', err)
    }
  }
}

const toggleFavorite = async (collection) => {
  try {
    await collectionsStore.toggleFavorite(collection.id)
  } catch (err) {
    console.error('Failed to toggle favorite:', err)
  }
}

const closeModal = () => {
  showCreateModal.value = false
  collectionToEdit.value = null
}

const handleSuccess = async () => {
  // Refresh collections after create/update
  await collectionsStore.fetchCollections()
}
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
