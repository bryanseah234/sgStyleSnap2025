<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="handleClose"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
            <h2 class="text-2xl font-bold text-gray-900">
              Share Outfit
            </h2>
            <button
              class="text-gray-400 hover:text-gray-600 transition-colors"
              @click="handleClose"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form
            class="p-6 space-y-6"
            @submit.prevent="handleSubmit"
          >
            <!-- Outfit Preview -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> Outfit Preview * </label>
              <div
                v-if="selectedItems.length === 0"
                class="text-sm text-gray-500 italic"
              >
                No items selected. Please select items from your closet first.
              </div>
              <div
                v-else
                class="grid grid-cols-4 gap-2"
              >
                <div
                  v-for="item in selectedItems"
                  :key="item.id"
                  class="aspect-square rounded overflow-hidden bg-gray-100 relative group"
                >
                  <img
                    :src="item.image_url"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                  >
                  <div
                    class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center"
                  >
                    <span
                      class="text-white text-xs opacity-0 group-hover:opacity-100 text-center px-2"
                    >
                      {{ item.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Caption -->
            <div>
              <label
                for="caption"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Caption
              </label>
              <textarea
                id="caption"
                v-model="formData.caption"
                rows="3"
                maxlength="500"
                placeholder="Share your thoughts about this outfit..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p class="mt-1 text-xs text-gray-500 text-right">
                {{ formData.caption.length }}/500 characters
              </p>
            </div>

            <!-- Occasion -->
            <div>
              <label
                for="occasion"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Occasion
              </label>
              <select
                id="occasion"
                v-model="formData.occasion"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  Select occasion (optional)
                </option>
                <option value="work">
                  Work
                </option>
                <option value="casual">
                  Casual
                </option>
                <option value="formal">
                  Formal
                </option>
                <option value="party">
                  Party
                </option>
                <option value="date">
                  Date
                </option>
                <option value="sport">
                  Sport
                </option>
                <option value="travel">
                  Travel
                </option>
                <option value="other">
                  Other
                </option>
              </select>
            </div>

            <!-- Visibility -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Who can see this?
              </label>
              <div class="space-y-2">
                <label
                  class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    v-model="formData.visibility"
                    type="radio"
                    value="friends"
                    class="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  >
                  <div class="ml-3">
                    <div class="flex items-center">
                      <svg
                        class="w-5 h-5 text-gray-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span class="font-medium text-gray-900">Friends</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">Only your friends can see this outfit</p>
                  </div>
                </label>

                <label
                  class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    v-model="formData.visibility"
                    type="radio"
                    value="public"
                    class="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  >
                  <div class="ml-3">
                    <div class="flex items-center">
                      <svg
                        class="w-5 h-5 text-gray-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span class="font-medium text-gray-900">Public</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">Everyone can see this outfit</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Tips -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg
                  class="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
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
                <div class="text-sm text-blue-800">
                  <p class="font-medium mb-1">
                    Tips for sharing:
                  </p>
                  <ul class="list-disc list-inside space-y-1 text-xs">
                    <li>Add a thoughtful caption to get more engagement</li>
                    <li>Tag the occasion to help others find inspiration</li>
                    <li>Public outfits can be discovered by all users</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div
              v-if="error"
              class="p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p class="text-sm text-red-600">
                {{ error }}
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                class="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                :disabled="loading"
                @click="handleClose"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                :disabled="loading || selectedItems.length === 0"
              >
                <svg
                  v-if="loading"
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {{ loading ? 'Sharing...' : 'Share Outfit' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSharedOutfitsStore } from '@/stores/shared-outfits-store'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  selectedItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'success'])

const sharedOutfitsStore = useSharedOutfitsStore()

const loading = ref(false)
const error = ref('')

const formData = ref({
  outfit_items: [],
  caption: '',
  occasion: '',
  visibility: 'friends'
})

// Watch for selected items changes
watch(
  () => props.selectedItems,
  items => {
    formData.value.outfit_items = items.map(item => item.id)
  },
  { immediate: true, deep: true }
)

const handleClose = () => {
  if (!loading.value) {
    resetForm()
    emit('close')
  }
}

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    if (formData.value.outfit_items.length === 0) {
      throw new Error('Please select at least one clothing item')
    }

    await sharedOutfitsStore.shareOutfit({
      outfit_items: formData.value.outfit_items,
      caption: formData.value.caption || null,
      occasion: formData.value.occasion || null,
      visibility: formData.value.visibility
    })

    emit('success')
    handleClose()
  } catch (err) {
    error.value = err.message || 'Failed to share outfit'
    console.error('Failed to share outfit:', err)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    outfit_items: [],
    caption: '',
    occasion: '',
    visibility: 'friends'
  }
  error.value = ''
  loading.value = false
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}
</style>
