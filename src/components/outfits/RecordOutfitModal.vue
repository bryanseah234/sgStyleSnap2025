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
              {{ isEditMode ? 'Edit Outfit Entry' : 'Record Outfit' }}
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
            <!-- Selected Items Preview -->
            <div v-if="!isEditMode">
              <label class="block text-sm font-medium text-gray-700 mb-2"> Selected Items * </label>
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
                  class="aspect-square rounded overflow-hidden bg-gray-100"
                >
                  <img
                    :src="item.image_url"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                  >
                </div>
              </div>
            </div>

            <!-- Date Worn -->
            <div>
              <label
                for="date-worn"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Date Worn *
              </label>
              <input
                id="date-worn"
                v-model="formData.date_worn"
                type="date"
                :max="today"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
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
                  Select occasion
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

            <!-- Rating -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> Rating </label>
              <div class="flex items-center space-x-2">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="focus:outline-none transition-transform hover:scale-110"
                  @click="formData.rating = star"
                >
                  <svg
                    class="w-8 h-8"
                    :class="star <= (formData.rating || 0) ? 'text-yellow-400' : 'text-gray-300'"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                </button>
                <span
                  v-if="formData.rating"
                  class="ml-2 text-sm text-gray-600"
                >
                  {{ formData.rating }}/5
                </span>
              </div>
            </div>

            <!-- Weather Temperature -->
            <div>
              <label
                for="weather-temp"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Temperature (°F)
              </label>
              <input
                id="weather-temp"
                v-model.number="formData.weather_temp"
                type="number"
                min="-50"
                max="150"
                placeholder="e.g., 72"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>

            <!-- Weather Condition -->
            <div>
              <label
                for="weather-condition"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Weather Condition
              </label>
              <select
                id="weather-condition"
                v-model="formData.weather_condition"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  Select condition
                </option>
                <option value="sunny">
                  Sunny
                </option>
                <option value="cloudy">
                  Cloudy
                </option>
                <option value="rainy">
                  Rainy
                </option>
                <option value="snowy">
                  Snowy
                </option>
                <option value="windy">
                  Windy
                </option>
              </select>
            </div>

            <!-- Notes -->
            <div>
              <label
                for="notes"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Notes
              </label>
              <textarea
                id="notes"
                v-model="formData.notes"
                rows="3"
                placeholder="How did you feel wearing this outfit? Any compliments?"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
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
                :disabled="loading || (!isEditMode && selectedItems.length === 0)"
              >
                {{ loading ? 'Saving...' : isEditMode ? 'Update' : 'Record Outfit' }}
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
import { useOutfitHistoryStore } from '@/stores/outfit-history-store'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  selectedItems: {
    type: Array,
    default: () => []
  },
  entryToEdit: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const outfitHistoryStore = useOutfitHistoryStore()

const loading = ref(false)
const error = ref('')

const isEditMode = computed(() => !!props.entryToEdit)

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const formData = ref({
  outfit_items: [],
  date_worn: today.value,
  occasion: '',
  rating: null,
  weather_temp: null,
  weather_condition: '',
  notes: ''
})

// Watch for edit mode changes
watch(
  () => props.entryToEdit,
  entry => {
    if (entry) {
      formData.value = {
        outfit_items: entry.outfit_items || [],
        date_worn: entry.date_worn || today.value,
        occasion: entry.occasion || '',
        rating: entry.rating || null,
        weather_temp: entry.weather_temp || null,
        weather_condition: entry.weather_condition || '',
        notes: entry.notes || ''
      }
    }
  },
  { immediate: true }
)

// Watch for selected items changes (new entry mode)
watch(
  () => props.selectedItems,
  items => {
    if (!isEditMode.value) {
      formData.value.outfit_items = items.map(item => item.id)
    }
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
    if (isEditMode.value) {
      // Update existing entry
      await outfitHistoryStore.updateHistory(props.entryToEdit.id, {
        occasion: formData.value.occasion || null,
        rating: formData.value.rating || null,
        notes: formData.value.notes || null
      })
    } else {
      // Create new entry
      if (formData.value.outfit_items.length === 0) {
        throw new Error('Please select at least one clothing item')
      }

      await outfitHistoryStore.recordOutfit({
        outfit_items: formData.value.outfit_items,
        date_worn: formData.value.date_worn,
        occasion: formData.value.occasion || null,
        rating: formData.value.rating || null,
        weather_temp: formData.value.weather_temp || null,
        weather_condition: formData.value.weather_condition || null,
        notes: formData.value.notes || null
      })
    }

    emit('success')
    handleClose()
  } catch (err) {
    error.value = err.message || 'Failed to save outfit entry'
    console.error('Failed to save outfit entry:', err)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    outfit_items: [],
    date_worn: today.value,
    occasion: '',
    rating: null,
    weather_temp: null,
    weather_condition: '',
    notes: ''
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
