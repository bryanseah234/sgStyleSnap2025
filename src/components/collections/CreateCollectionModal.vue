<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="handleClose"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ isEditMode ? 'Edit Collection' : 'Create Collection' }}
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
            <!-- Collection Name -->
            <div>
              <label
                for="collection-name"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Collection Name *
              </label>
              <input
                id="collection-name"
                v-model="formData.name"
                type="text"
                required
                maxlength="100"
                placeholder="e.g., Summer Vacation Looks"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>

            <!-- Description -->
            <div>
              <label
                for="description"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                maxlength="500"
                placeholder="Describe this collection..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p class="mt-1 text-xs text-gray-500 text-right">
                {{ formData.description.length }}/500 characters
              </p>
            </div>

            <!-- Theme -->
            <div>
              <label
                for="theme"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Theme
              </label>
              <select
                id="theme"
                v-model="formData.theme"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  Select a theme (optional)
                </option>
                <option value="casual">
                  Casual
                </option>
                <option value="formal">
                  Formal
                </option>
                <option value="seasonal">
                  Seasonal
                </option>
                <option value="work">
                  Work
                </option>
                <option value="vacation">
                  Vacation
                </option>
                <option value="special">
                  Special Events
                </option>
                <option value="other">
                  Other
                </option>
              </select>
            </div>

            <!-- Visibility -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <div class="space-y-2">
                <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    v-model="formData.visibility"
                    type="radio"
                    value="private"
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span class="font-medium text-gray-900">Private</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">Only you can see this collection</p>
                  </div>
                </label>

                <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
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
                    <p class="text-xs text-gray-500 mt-1">Everyone can see this collection</p>
                  </div>
                </label>
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
                class="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                :disabled="loading || !formData.name.trim()"
              >
                {{ loading ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCollectionsStore } from '@/stores/collections-store'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  collectionToEdit: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const collectionsStore = useCollectionsStore()

const loading = ref(false)
const error = ref('')

const isEditMode = computed(() => !!props.collectionToEdit)

const formData = ref({
  name: '',
  description: '',
  theme: '',
  visibility: 'private'
})

// Watch for edit mode changes
watch(() => props.collectionToEdit, (collection) => {
  if (collection) {
    formData.value = {
      name: collection.name || '',
      description: collection.description || '',
      theme: collection.theme || '',
      visibility: collection.visibility || 'private'
    }
  }
}, { immediate: true })

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
    if (isEditMode.value) {
      // Update existing collection
      await collectionsStore.updateCollection(props.collectionToEdit.id, {
        name: formData.value.name.trim(),
        description: formData.value.description.trim() || null,
        theme: formData.value.theme || null,
        visibility: formData.value.visibility
      })
    } else {
      // Create new collection
      await collectionsStore.createCollection({
        name: formData.value.name.trim(),
        description: formData.value.description.trim() || null,
        theme: formData.value.theme || null,
        visibility: formData.value.visibility
      })
    }

    emit('success')
    handleClose()
  } catch (err) {
    error.value = err.message || 'Failed to save collection'
    console.error('Failed to save collection:', err)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    theme: '',
    visibility: 'private'
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
