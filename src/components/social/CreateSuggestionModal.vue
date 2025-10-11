<template>
  <TransitionRoot
    appear
    :show="isOpen"
    as="template"
  >
    <Dialog
      as="div"
      class="relative z-50"
      @close="closeModal"
    >
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
              >
                Suggest Outfit to {{ friendName }}
              </DialogTitle>

              <div class="mt-2">
                <!-- Friend's Closet Items -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select items from {{ friendName }}'s closet
                  </label>
                  
                  <!-- Category Filter -->
                  <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
                    <button
                      v-for="category in categories"
                      :key="category.value"
                      class="px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors"
                      :class="
                        selectedCategory === category.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      "
                      @click="selectedCategory = category.value"
                    >
                      {{ category.label }}
                    </button>
                  </div>

                  <!-- Items Grid -->
                  <div
                    v-if="loading"
                    class="grid grid-cols-3 gap-4"
                  >
                    <div
                      v-for="i in 6"
                      :key="i"
                      class="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                    />
                  </div>

                  <div
                    v-else-if="filteredItems.length === 0"
                    class="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No items found in this category
                  </div>

                  <div
                    v-else
                    class="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto"
                  >
                    <button
                      v-for="item in filteredItems"
                      :key="item.id"
                      class="relative aspect-square rounded-lg overflow-hidden border-2 transition-all"
                      :class="
                        isItemSelected(item.id)
                          ? 'border-indigo-600 ring-2 ring-indigo-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                      "
                      @click="toggleItem(item)"
                    >
                      <img
                        :src="item.thumbnail_url || item.image_url"
                        :alt="item.name"
                        class="w-full h-full object-cover"
                      >
                      <div
                        v-if="isItemSelected(item.id)"
                        class="absolute inset-0 bg-indigo-600 bg-opacity-20 flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          class="w-8 h-8 text-white"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p class="text-xs text-white truncate">
                          {{ item.name }}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Selected Items Preview -->
                <div
                  v-if="selectedItems.length > 0"
                  class="mb-6"
                >
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Items ({{ selectedItems.length }})
                  </label>
                  <div class="flex gap-2 overflow-x-auto pb-2">
                    <div
                      v-for="item in selectedItems"
                      :key="item.id"
                      class="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-indigo-600"
                    >
                      <img
                        :src="item.thumbnail_url || item.image_url"
                        :alt="item.name"
                        class="w-full h-full object-cover"
                      >
                      <button
                        class="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-1 hover:bg-red-600 transition-colors"
                        @click="removeItem(item.id)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          class="w-4 h-4"
                        >
                          <path
                            d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Message -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add a message (optional)
                  </label>
                  <textarea
                    v-model="message"
                    rows="3"
                    maxlength="500"
                    placeholder="Tell your friend why you think this outfit would look great on them..."
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                    {{ message.length }}/500
                  </p>
                </div>

                <!-- Error Message -->
                <div
                  v-if="error"
                  class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <p class="text-sm text-red-600 dark:text-red-400">
                    {{ error }}
                  </p>
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  :disabled="submitting"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  @click="closeModal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  :disabled="selectedItems.length === 0 || submitting"
                  class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="handleSubmit"
                >
                  {{ submitting ? 'Sending...' : 'Send Suggestion' }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { friendSuggestionsService } from '../../services/friend-suggestions-service'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  friendId: {
    type: String,
    required: true
  },
  friendName: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'success'])

const categories = [
  { label: 'All', value: null },
  { label: 'Tops', value: 'top' },
  { label: 'Bottoms', value: 'bottom' },
  { label: 'Outerwear', value: 'outerwear' },
  { label: 'Shoes', value: 'shoes' },
  { label: 'Accessories', value: 'accessories' }
]

const friendItems = ref([])
const selectedCategory = ref(null)
const selectedItems = ref([])
const message = ref('')
const loading = ref(false)
const submitting = ref(false)
const error = ref(null)

const filteredItems = computed(() => {
  if (!selectedCategory.value) {
    return friendItems.value
  }
  return friendItems.value.filter(item => item.category === selectedCategory.value)
})

const isItemSelected = (itemId) => {
  return selectedItems.value.some(item => item.id === itemId)
}

const toggleItem = (item) => {
  const index = selectedItems.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(item)
  }
}

const removeItem = (itemId) => {
  const index = selectedItems.value.findIndex(i => i.id === itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  }
}

const loadFriendItems = async () => {
  loading.value = true
  error.value = null
  
  try {
    const result = await friendSuggestionsService.getFriendClosetItems(props.friendId)
    if (result.success) {
      friendItems.value = result.items
    } else {
      error.value = result.error || 'Failed to load items'
    }
  } catch (err) {
    error.value = 'Failed to load items'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (selectedItems.value.length === 0) {
    error.value = 'Please select at least one item'
    return
  }
  
  submitting.value = true
  error.value = null
  
  try {
    const outfitItems = selectedItems.value.map(item => ({
      clothes_id: item.id,
      category: item.category,
      image_url: item.image_url,
      thumbnail_url: item.thumbnail_url,
      name: item.name
    }))
    
    const result = await friendSuggestionsService.createSuggestion({
      friendId: props.friendId,
      outfitItems,
      message: message.value.trim() || null
    })
    
    if (result.success) {
      emit('success', result.suggestion)
      closeModal()
    } else {
      error.value = result.error || 'Failed to send suggestion'
    }
  } catch (err) {
    error.value = 'Failed to send suggestion'
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  if (!submitting.value) {
    emit('close')
    // Reset form
    setTimeout(() => {
      selectedItems.value = []
      message.value = ''
      error.value = null
      selectedCategory.value = null
    }, 300)
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && friendItems.value.length === 0) {
    loadFriendItems()
  }
})

onMounted(() => {
  if (props.isOpen) {
    loadFriendItems()
  }
})
</script>
