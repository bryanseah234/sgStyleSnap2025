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

      <!-- Image Upload -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Image *
        </label>
        
        <!-- Image Preview -->
        <div v-if="imagePreview" class="mb-4">
          <img 
            :src="imagePreview" 
            alt="Preview" 
            class="w-full h-48 object-cover rounded-md"
          />
          
          <!-- Color Analysis -->
          <div v-if="detectingColors" class="mt-3 flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing colors...
          </div>
          
          <div v-else-if="detectedColors" class="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Detected Colors
              <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({{ Math.round(detectedColors.confidence * 100) }}% confident)
              </span>
            </h4>
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Primary Color -->
              <div class="flex items-center gap-2">
                <div 
                  class="w-10 h-10 rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                  :style="{ backgroundColor: getColorHex(detectedColors.primary) }"
                  :title="`Primary: ${detectedColors.primary}`"
                ></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {{ detectedColors.primary }}
                </span>
              </div>
              
              <!-- Secondary Colors -->
              <template v-if="detectedColors.secondary && detectedColors.secondary.length > 0">
                <span class="text-gray-400">+</span>
                <div 
                  v-for="color in detectedColors.secondary" 
                  :key="color"
                  class="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600"
                  :style="{ backgroundColor: getColorHex(color) }"
                  :title="`Secondary: ${color}`"
                ></div>
              </template>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Colors will be stored for better search and outfit matching
            </p>
          </div>
          
          <button
            type="button"
            @click="clearImage"
            class="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Remove Image
          </button>
        </div>
        
        <!-- File Input -->
        <div 
          v-else
          class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 text-center hover:border-blue-500 transition-colors cursor-pointer"
          @click="triggerFileInput"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/10': isDragging }"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*,.jpg,.jpeg,.png,.webp"
            @change="handleFileChange"
            class="hidden"
          />
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Click to upload or drag and drop
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
            JPG, PNG, or WebP (max 10MB)
          </p>
          <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Images automatically converted to WebP for optimal storage
          </p>
        </div>
        
        <!-- Upload Error -->
        <p v-if="imageError" class="mt-2 text-sm text-red-600 dark:text-red-400">
          {{ imageError }}
        </p>
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
import { compressImage } from '@/utils/image-compression'
import colorDetector from '@/utils/color-detector'

const emit = defineEmits(['success', 'cancel'])

const closetStore = useClosetStore()

const form = ref({
  name: '',
  category: '',
  brand: '',
  season: '',
  privacy: 'friends',
  file: null,
  primary_color: null,
  secondary_colors: []
})

const submitting = ref(false)
const imagePreview = ref(null)
const imageError = ref(null)
const isDragging = ref(false)
const fileInput = ref(null)
const detectingColors = ref(false)
const detectedColors = ref(null)

const quotaUsed = computed(() => closetStore.quota?.used || 0)
const quotaWarning = computed(() => quotaUsed.value >= 180)

const isFormValid = computed(() => {
  return form.value.name && form.value.category && form.value.file
})

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (file) {
    await processFile(file)
  }
}

async function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files?.[0]
  if (file) {
    await processFile(file)
  }
}

async function processFile(file) {
  imageError.value = null
  detectedColors.value = null
  
  try {
    // Compress and convert to WebP
    const compressed = await compressImage(file, 1)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(compressed)
    
    // Store compressed file
    form.value.file = compressed
    
    // Detect colors from the original file (better quality for detection)
    detectingColors.value = true
    try {
      const colors = await colorDetector.detectColors(file, {
        maxColors: 5,
        quality: 10,
        excludeWhiteBlack: true
      })
      
      detectedColors.value = colors
      
      // Store colors in form
      form.value.primary_color = colors.primary
      form.value.secondary_colors = colors.secondary || []
      
      console.log('Detected colors:', colors)
    } catch (colorError) {
      console.error('Color detection failed:', colorError)
      // Continue without color detection - not critical
    } finally {
      detectingColors.value = false
    }
  } catch (error) {
    imageError.value = error.message
    console.error('Image processing error:', error)
  }
}

function clearImage() {
  imagePreview.value = null
  form.value.file = null
  form.value.primary_color = null
  form.value.secondary_colors = []
  imageError.value = null
  detectedColors.value = null
  detectingColors.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function getColorHex(colorName) {
  return colorDetector.getHexColor(colorName)
}

async function handleSubmit() {
  if (!isFormValid.value || submitting.value) return
  
  // Check quota
  if (!closetStore.canAddItem) {
    imageError.value = 'You have reached your 200 item limit. Please remove some items to add new ones.'
    return
  }

  submitting.value = true
  try {
    await closetStore.addItem(form.value)
    emit('success')
  } catch (error) {
    imageError.value = error.message
    console.error('Failed to add item:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
