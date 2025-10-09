<template>
  <div class="collection-detail-view">
    <!-- Loading State -->
    <div
      v-if="loading && !collection"
      class="text-center py-12"
    >
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      <p class="mt-4 text-gray-600">
        Loading collection...
      </p>
    </div>

    <!-- Collection Content -->
    <div v-else-if="collection">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <button
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                @click="$emit('back')"
              >
                <svg
                  class="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h2 class="text-3xl font-bold text-gray-900">
                {{ collection.name }}
              </h2>
              <button
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                @click="toggleFavorite"
              >
                <svg
                  class="w-6 h-6"
                  :class="collection.is_favorite ? 'text-yellow-400 fill-current' : 'text-gray-400'"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            </div>
            <p
              v-if="collection.description"
              class="text-gray-600 mb-3"
            >
              {{ collection.description }}
            </p>
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span class="flex items-center">
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                {{ collection.outfits_count || 0 }} {{ collection.outfits_count === 1 ? 'outfit' : 'outfits' }}
              </span>
              <span
                v-if="collection.theme"
                class="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full"
              >
                {{ capitalizeFirst(collection.theme) }}
              </span>
              <span class="flex items-center">
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    v-if="collection.visibility === 'public'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                {{ collection.visibility === 'public' ? 'Public' : 'Private' }}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-2">
            <button
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              @click="$emit('edit', collection)"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
            <button
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              @click="showAddOutfitPrompt"
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
              Add Outfit
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="!collection.outfits || collection.outfits.length === 0"
        class="text-center py-12 bg-gray-50 rounded-lg"
      >
        <svg
          class="w-16 h-16 mx-auto text-gray-300 mb-3"
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
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          No Outfits in This Collection
        </h3>
        <p class="text-gray-600 mb-4">
          Add your first outfit to get started
        </p>
        <button
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          @click="showAddOutfitPrompt"
        >
          Add Outfit
        </button>
      </div>

      <!-- Outfits Grid -->
      <div
        v-else
        class="space-y-6"
      >
        <!-- Drag and drop hint -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center text-sm text-blue-800">
          <svg
            class="w-5 h-5 mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Drag and drop to reorder outfits in your collection</span>
        </div>

        <!-- Outfits -->
        <draggable
          v-model="localOutfits"
          item-key="id"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          :animation="200"
          handle=".drag-handle"
          @end="handleReorder"
        >
          <template #item="{ element: outfit }">
            <div class="bg-white rounded-lg shadow-md overflow-hidden group">
              <!-- Drag Handle -->
              <div class="drag-handle flex items-center justify-center bg-gray-50 py-2 cursor-move hover:bg-gray-100 transition-colors">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              </div>

              <!-- Outfit Items Grid -->
              <div class="grid grid-cols-2 gap-1 p-2 bg-gray-50">
                <div
                  v-for="item in outfit.items?.slice(0, 4)"
                  :key="item.id"
                  class="aspect-square rounded overflow-hidden bg-white"
                >
                  <img
                    :src="item.image_url"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  >
                </div>
              </div>

              <!-- Outfit Info -->
              <div class="p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-gray-600">
                    {{ outfit.items?.length || 0 }} items
                  </span>
                  <span
                    v-if="outfit.occasion"
                    class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"
                  >
                    {{ capitalizeFirst(outfit.occasion) }}
                  </span>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end space-x-2 pt-2 border-t">
                  <button
                    class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    @click="viewOutfit(outfit)"
                  >
                    View
                  </button>
                  <button
                    class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    @click="removeOutfit(outfit)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </template>
        </draggable>
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
    </div>

    <!-- Not Found -->
    <div
      v-else
      class="text-center py-12"
    >
      <p class="text-gray-600">
        Collection not found
      </p>
      <button
        class="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        @click="$emit('back')"
      >
        Go Back
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCollectionsStore } from '@/stores/collections-store'
import draggable from 'vuedraggable'

const props = defineProps({
  collectionId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['back', 'edit', 'view-outfit'])

const collectionsStore = useCollectionsStore()

const localOutfits = ref([])

// Computed properties
const collection = computed(() => collectionsStore.currentCollection)
const loading = computed(() => collectionsStore.loading)
const error = computed(() => collectionsStore.error)

// Watch for collection changes
watch(() => collection.value?.outfits, (outfits) => {
  if (outfits) {
    localOutfits.value = [...outfits]
  }
}, { immediate: true, deep: true })

// Load collection on mount
watch(() => props.collectionId, async (id) => {
  if (id) {
    await collectionsStore.fetchCollection(id)
  }
}, { immediate: true })

const toggleFavorite = async () => {
  if (!collection.value) return
  try {
    await collectionsStore.toggleFavorite(collection.value.id)
  } catch (err) {
    console.error('Failed to toggle favorite:', err)
  }
}

const showAddOutfitPrompt = () => {
  // This would typically open a modal to select outfits from outfit history
  // or create a new outfit to add to the collection
  alert('Add outfit functionality would open a modal to select outfits. This requires integration with outfit history or outfit builder.')
}

const viewOutfit = (outfit) => {
  emit('view-outfit', outfit)
}

const removeOutfit = async (outfit) => {
  if (!collection.value) return
  
  if (confirm('Remove this outfit from the collection?')) {
    try {
      await collectionsStore.removeOutfit(collection.value.id, outfit.id)
    } catch (err) {
      console.error('Failed to remove outfit:', err)
    }
  }
}

const handleReorder = async () => {
  if (!collection.value) return
  
  try {
    const outfitIds = localOutfits.value.map(outfit => outfit.id)
    await collectionsStore.reorderOutfits(collection.value.id, outfitIds)
  } catch (err) {
    console.error('Failed to reorder outfits:', err)
    // Revert to original order on error
    localOutfits.value = [...(collection.value.outfits || [])]
  }
}

const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style scoped>
/* Drag and drop styles */
.sortable-ghost {
  opacity: 0.4;
}

.sortable-chosen {
  cursor: move;
}
</style>
