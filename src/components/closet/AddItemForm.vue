<!--
  AddItemForm Component - StyleSnap
  
  Purpose: Form for adding new clothing items to closet (also used for editing)
  
  Form Fields:
  - name: string (required, max 100 chars)
  - category: enum (required, enhanced categories system)
  - clothing_type: string (optional, specific clothing type)
  - brand: string (optional, max 100 chars)
  - season: enum (optional, one of: spring, summer, fall, winter, all)
  - privacy: enum (required, friends or private)
  - image: file upload (required, max 10MB, formats: jpg, png, webp)
  
  Features:
  - AI-powered clothing classification using FashionRNN
  - Device-specific upload: Desktop/laptop = file upload only, Mobile/tablet = file upload + camera
  - Image preview before upload with color detection
  - Client-side image compression (using utils/image-compression.js)
  - Validation for all fields
  - Check quota before allowing upload (50 upload limit, unlimited catalog additions)
  - Upload progress indicator
  - Error handling with detailed feedback
  
  Upload Flow:
  1. User selects image -> AI classification starts automatically
  2. Compress on client side
  3. Upload compressed image to Cloudinary
  4. Get Cloudinary URL
  5. Save item metadata + Cloudinary URL to Supabase
  6. Update closet store
  
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
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      Add New Item
    </h2>

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
        >
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
          <option value="">
            Select a category
          </option>
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

      <!-- Clothing Type -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Clothing Type
        </label>
        <select
          v-model="form.clothing_type"
          class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select type (optional)</option>
          <option value="t-shirt">T-Shirt</option>
          <option value="shirt">Shirt</option>
          <option value="blouse">Blouse</option>
          <option value="polo">Polo</option>
          <option value="tank-top">Tank Top</option>
          <option value="sweater">Sweater</option>
          <option value="hoodie">Hoodie</option>
          <option value="blazer">Blazer</option>
          <option value="jacket">Jacket</option>
          <option value="coat">Coat</option>
          <option value="jeans">Jeans</option>
          <option value="pants">Pants</option>
          <option value="shorts">Shorts</option>
          <option value="skirt">Skirt</option>
          <option value="dress">Dress</option>
          <option value="sneakers">Sneakers</option>
          <option value="boots">Boots</option>
          <option value="sandals">Sandals</option>
          <option value="heels">Heels</option>
          <option value="hat">Hat</option>
          <option value="bag">Bag</option>
          <option value="accessory">Accessory</option>
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
        >
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
          <option value="">
            Select season (optional)
          </option>
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
        <div
          v-if="imagePreview"
          class="mb-4"
        >
          <img
            :src="imagePreview"
            alt="Preview"
            class="w-full h-48 object-cover rounded-md"
          >

          <!-- AI Classification Status -->
          <div
            v-if="classifying"
            class="mt-3 flex items-center text-sm text-blue-600 dark:text-blue-400"
          >
            <svg
              class="animate-spin h-4 w-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
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
            AI analyzing clothing...
          </div>

          <!-- AI Classification Result -->
          <div
            v-else-if="classificationResult"
            class="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md"
          >
            <h4 class="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              AI Detection
              <span class="text-xs text-green-600 dark:text-green-400 ml-2">
                ({{ Math.round(classificationResult.confidence * 100) }}% confident)
              </span>
            </h4>
            <p class="text-sm text-green-800 dark:text-green-200">
              Detected: <strong>{{ classificationResult.topPrediction }}</strong>
            </p>
            <p class="text-xs text-green-600 dark:text-green-400 mt-1">
              Category and type auto-filled based on AI analysis
            </p>
          </div>

          <!-- Color Analysis -->
          <div
            v-if="detectingColors"
            class="mt-3 flex items-center text-sm text-gray-600 dark:text-gray-400"
          >
            <svg
              class="animate-spin h-4 w-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
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
            Analyzing colors...
          </div>

          <div
            v-else-if="detectedColors"
            class="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
          >
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
                />
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
                />
              </template>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Colors will be stored for better search and outfit matching
            </p>
          </div>

          <button
            type="button"
            class="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            @click="clearImage"
          >
            Remove Image
          </button>
        </div>

        <!-- File Input -->
        <div
          v-else
          class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 text-center hover:border-blue-500 transition-colors cursor-pointer"
          :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/10': isDragging }"
          @click="triggerFileInput"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*,.jpg,.jpeg,.png,.webp"
            :capture="isMobileDevice ? 'environment' : undefined"
            class="hidden"
            @change="handleFileChange"
          >
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <template v-if="isMobileDevice">
              📸 Tap to take a photo or upload from gallery
            </template>
            <template v-else>
              Click to upload or drag and drop
            </template>
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
            JPG, PNG, or WebP (max 10MB)
          </p>
          <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Images automatically converted to WebP for optimal storage
          </p>
        </div>

        <!-- Upload Error -->
        <p
          v-if="imageError"
          class="mt-2 text-sm text-red-600 dark:text-red-400"
        >
          {{ imageError }}
        </p>
      </div>

      <!-- Quota Warning -->
      <div
        v-if="quotaWarning"
        class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
      >
        <p class="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ You have {{ quotaUsed }} / 50 uploads. Add unlimited items from our catalog!
        </p>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          @click="emit('cancel')"
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
import { useClosetStore } from '../../stores/closet-store'
// eslint-disable-next-line no-unused-vars
import { CLOTHING_CATEGORIES, CATEGORY_GROUPS, SEASONS, PRIVACY_OPTIONS } from '../../config/constants'
import { compressImage } from '../../utils/image-compression'
import colorDetector from '../../utils/color-detector'
import { classifyClothingItem, validateImageForClassification } from '../../services/fashion-rnn-service'

const emit = defineEmits(['success', 'cancel'])

const closetStore = useClosetStore()

const form = ref({
  name: '',
  category: '',
  clothing_type: '',
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
const classifying = ref(false)
const classificationResult = ref(null)

const quotaUsed = computed(() => closetStore.quota?.used || 0)
const quotaWarning = computed(() => quotaUsed.value >= 45) // Warn at 90% of 50

const isFormValid = computed(() => {
  return form.value.name && form.value.category && form.value.file
})

// Detect if device is mobile/tablet (allows camera) vs desktop/laptop (file upload only)
const isMobileDevice = computed(() => {
  if (typeof window === 'undefined') return false

  // Check for touch support and screen size
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isMobileWidth = window.innerWidth <= 1024 // tablets and below
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

  return (hasTouchScreen && isMobileWidth) || isMobileUserAgent
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
  // Validate file
  const validation = validateImageForClassification(file)
  if (!validation.isValid) {
    imageError.value = validation.errors.join(', ')
    return
  }

  imageError.value = null
  detectedColors.value = null
  classificationResult.value = null

  try {
    // Compress and convert to WebP
    const compressed = await compressImage(file, 1)

    // Create preview
    const reader = new FileReader()
    reader.onload = e => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(compressed)

    // Store compressed file
    form.value.file = compressed

    // Start AI classification and color detection in parallel
    const [classificationPromise, colorPromise] = await Promise.allSettled([
      classifyImage(file),
      detectColors(file)
    ])

    // Handle classification result
    if (classificationPromise.status === 'fulfilled') {
      console.log('AI classification completed')
    } else {
      console.error('AI classification failed:', classificationPromise.reason)
    }

    // Handle color detection result
    if (colorPromise.status === 'fulfilled') {
      console.log('Color detection completed')
    } else {
      console.error('Color detection failed:', colorPromise.reason)
    }
  } catch (error) {
    imageError.value = error.message
    console.error('Image processing error:', error)
  }
}

// AI Classification function
async function classifyImage(file) {
  console.log('🧠 Starting AI classification for file:', file.name)
  
  if (classifying.value) {
    console.log('⚠️ Classification already in progress, skipping...')
    return
  }
  
  classifying.value = true
  
  try {
    const result = await classifyClothingItem(file)
    
    if (result.success) {
      classificationResult.value = result
      
      // Auto-fill form fields
      form.value.category = result.styleSnapCategory
      form.value.clothing_type = result.clothingType
      
      // Generate name suggestion if empty
      if (!form.value.name.trim()) {
        form.value.name = result.topPrediction.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
      
      console.log('✅ AI classification successful:', result)
    } else {
      console.warn('AI classification failed:', result.error)
    }
  } catch (error) {
    console.error('AI classification error:', error)
  } finally {
    classifying.value = false
  }
}

// Color detection function
async function detectColors(file) {
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
}

function clearImage() {
  imagePreview.value = null
  form.value.file = null
  form.value.primary_color = null
  form.value.secondary_colors = []
  imageError.value = null
  detectedColors.value = null
  detectingColors.value = false
  classificationResult.value = null
  classifying.value = false
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
    imageError.value =
      'You have reached your 50 upload limit. Add unlimited items from our catalog instead!'
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
