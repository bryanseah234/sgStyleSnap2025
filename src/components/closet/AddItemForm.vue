<!--
  AddItemForm Component - StyleSnap
  
  Purpose: Form for adding new clothing items to closet (also used for editing)
  
  Form Fields:
  - name: string (required, max 100 chars)
  - category: enum (required, enhanced categories system)
  - color: string (optional, max 50 chars)
  - brand: string (optional, max 100 chars)
  - season: enum (optional, one of: spring, summer, fall, winter, all)
  - image: file upload (required, max 5MB, formats: jpg, png, webp)
  
  Features:
  - Image preview before upload
  - Client-side image compression (using utils/image-compression.js)
  - Validation for all fields
  - Check quota before allowing upload (200 item limit)
  - Upload progress indicator
  - Error handling
  
  Upload Flow:
  1. User selects image -> compress on client side
  2. Upload compressed image to Cloudinary
  3. Get Cloudinary URL
  4. Save item metadata + Cloudinary URL to Supabase
  5. Update closet store
  
  Usage:
  <AddItemForm @success="handleSuccess" @cancel="handleCancel" />
  (typically shown in a modal)
  
  Reference:
  - docs/design/mobile-mockups/04-add-item.png for form design
  - requirements/database-schema.md for closet_items schema
  - requirements/api-endpoints.md for POST /api/closet endpoint
  - tasks/03-closet-crud-image-management.md for image upload implementation
-->

<template>
  <div class="add-item-form bg-white dark:bg-gray-800 rounded-lg p-6">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Item</h2>

    <form @submit.prevent="handleSubmit">
      <!-- Name -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Item Name *
        </label>
        <input
          v-model="form.name"
          type="text"
          required
          maxlength="100"
          placeholder="e.g., Blue Denim Jacket"
          class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Category -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category *
        </label>
        <select
          v-model="form.category"
          required
          class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          <optgroup
            v-for="(items, group) in CATEGORY_GROUPS"
            :key="group"
            :label="group.charAt(0).toUpperCase() + group.slice(1)"
          >
            <option
              v-for="cat in items"
              :key="cat.value"
              :value="cat.value"
            >
              {{ cat.label }}
            </option>
          </optgroup>
        </select>
      </div>

      <!-- Brand -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Brand
        </label>
        <input
          v-model="form.brand"
          type="text"
          maxlength="100"
          placeholder="e.g., Nike, Zara"
          class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Season -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Season
        </label>
        <select
          v-model="form.season"
          class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select season (optional)</option>
          <option
            v-for="season in SEASONS"
            :key="season.value"
            :value="season.value"
          >
            {{ season.label }}
          </option>
        </select>
      </div>

      <!-- Privacy -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Privacy
        </label>
        <select
          v-model="form.privacy"
          class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option
            v-for="option in PRIVACY_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }} - {{ option.description }}
          </option>
        </select>
      </div>

      <!-- Image Upload (Placeholder) -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Image *
        </label>
        <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Image upload coming soon
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Max 5MB, JPG/PNG/WebP
          </p>
        </div>
      </div>

      <!-- Quota Warning -->
      <div v-if="quotaWarning" class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
        <p class="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ You have {{ quotaUsed }} / 200 items. You're approaching your limit!
        </p>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3">
        <button
          type="button"
          @click="emit('cancel')"
          class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="submitting || !isFormValid"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Adding...' : 'Add Item' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useClosetStore } from '@/stores/closet-store'
import { CLOTHING_CATEGORIES, CATEGORY_GROUPS, SEASONS, PRIVACY_OPTIONS } from '@/config/constants'

const emit = defineEmits(['success', 'cancel'])

const closetStore = useClosetStore()

const form = ref({
  name: '',
  category: '',
  brand: '',
  season: '',
  privacy: 'friends'
})

const submitting = ref(false)

const quotaUsed = computed(() => closetStore.quota?.used || 0)
const quotaWarning = computed(() => quotaUsed.value >= 180)

const isFormValid = computed(() => {
  return form.value.name && form.value.category
})

async function handleSubmit() {
  if (!isFormValid.value || submitting.value) return

  // TODO: Implement actual submission when image upload is ready
  alert('Form submission not yet implemented. Need to add image upload functionality.')
  
  // For now, just emit success
  // submitting.value = true
  // try {
  //   await closetStore.addItem(form.value)
  //   emit('success')
  // } catch (error) {
  //   alert(error.message)
  // } finally {
  //   submitting.value = false
  // }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
