<!--
  AddItemModal Component - StyleSnap
  Compact, functional design for adding clothing items
-->

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] overflow-y-auto"
    @click.self="handleClose"
  >
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4 pt-12 pb-20">
      <div class="relative w-full max-w-sm transform transition-all duration-300">
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          <!-- Header -->
          <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Item
                </h2>
              </div>
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                @click="handleClose"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Content -->
          <div class="p-4 max-h-[60vh] overflow-y-auto">
            <form @submit.prevent="handleSubmit" class="space-y-3">
              
              <!-- Image Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Photo *
                </label>
                
                <div
                  class="relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 hover:border-purple-400"
                  :class="{
                    'border-purple-400 bg-purple-50 dark:bg-purple-900/20': isDragging,
                    'border-red-300 bg-red-50 dark:bg-red-900/20': imageError,
                    'border-gray-300 dark:border-gray-600': !isDragging && !imageError
                  }"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                >
                  <!-- Image Preview -->
                  <div v-if="imagePreview" class="mb-2">
                    <div class="relative inline-block">
                      <img
                        :src="imagePreview"
                        alt="Preview"
                        class="w-16 h-16 object-cover rounded-lg shadow-md"
                      >
                      <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Upload Area -->
                  <div v-else class="mb-2">
                    <div class="w-10 h-10 mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-2">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    class="inline-flex items-center px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    @click="fileInput?.click()"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Choose Photo
                  </button>
                  
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Drag & drop or click
                  </p>
                  
                  <!-- Hidden File Input -->
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileSelect"
                  >
                </div>
                
                <!-- AI Status -->
                <div v-if="classifying" class="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-2">
                  <div class="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                  <span class="text-xs text-blue-700 dark:text-blue-300">Analyzing...</span>
                </div>
                
                <!-- AI Result -->
                <div v-if="classificationResult && !classifying" class="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg mt-2">
                  <div class="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-xs text-green-700 dark:text-green-300">
                    Detected: {{ classificationResult.topPrediction }}
                  </span>
                </div>
                
                <!-- Error Message -->
                <p v-if="imageError" class="text-xs text-red-600 dark:text-red-400 mt-1">
                  {{ imageError }}
                </p>
              </div>
              
              <!-- Form Fields -->
              <div class="space-y-3">
                <!-- Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    maxlength="100"
                    placeholder="e.g., Blue Denim Jacket"
                    class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  >
                </div>
                
                <!-- Category -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    v-model="form.category"
                    required
                    class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer text-sm"
                  >
                    <option value="">Select category</option>
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
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    v-model="form.clothing_type"
                    class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer text-sm"
                  >
                    <option value="">Select type</option>
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
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Brand
                  </label>
                  <input
                    v-model="form.brand"
                    type="text"
                    maxlength="100"
                    placeholder="e.g., Nike, Zara, H&M"
                    class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  >
                </div>
                
                <!-- Privacy -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Privacy
                  </label>
                  <select
                    v-model="form.privacy"
                    class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer text-sm"
                  >
                    <option value="friends">Visible to Friends</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
              
              <!-- Status -->
              <div class="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="flex items-center space-x-1">
                  <div class="w-3 h-3 rounded-full flex items-center justify-center" :class="form.file ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'">
                    <svg v-if="form.file" class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-xs text-gray-700 dark:text-gray-300">Photo</span>
                </div>
                <div class="flex items-center space-x-1">
                  <div class="w-3 h-3 rounded-full flex items-center justify-center" :class="form.name.trim() ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'">
                    <svg v-if="form.name.trim()" class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-xs text-gray-700 dark:text-gray-300">Name</span>
                </div>
                <div class="flex items-center space-x-1">
                  <div class="w-3 h-3 rounded-full flex items-center justify-center" :class="form.category ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'">
                    <svg v-if="form.category" class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="text-xs text-gray-700 dark:text-gray-300">Category</span>
                </div>
              </div>
              
              <!-- Quota Warning -->
              <div
                v-if="quotaWarning"
                class="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
              >
                <div class="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <span class="text-xs text-yellow-700 dark:text-yellow-300">
                  {{ quotaUsed }}/50 uploads used
                </span>
              </div>
            </form>
          </div>
          
          <!-- Actions -->
          <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <div class="flex space-x-3">
              <button
                type="button"
                class="flex-1 px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
                @click="handleClose"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting || !isFormValid"
                class="flex-1 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center text-sm"
                @click="handleSubmit"
              >
                <svg v-if="submitting" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {{ submitting ? 'Adding...' : 'Add Item' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useClosetStore } from '@/stores/closet-store'
import { classifyClothingItem, validateImageForClassification } from '@/services/fashion-rnn-service'
import { CATEGORY_GROUPS } from '@/config/constants'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

const closetStore = useClosetStore()

// Form data
const form = ref({
  name: '',
  category: '',
  clothing_type: '',
  brand: '',
  privacy: 'friends',
  file: null
})

// UI state
const isDragging = ref(false)
const imagePreview = ref(null)
const imageError = ref(null)
const fileInput = ref(null)
const submitting = ref(false)
const classifying = ref(false)
const classificationResult = ref(null)

// Quota info
const quotaUsed = computed(() => closetStore.quota.used)
const quotaWarning = computed(() => closetStore.isQuotaNearLimit)

// Form validation
const isFormValid = computed(() => {
  const hasName = form.value.name.trim().length > 0
  const hasCategory = form.value.category && form.value.category !== ''
  const hasFile = !!form.value.file
  
  const isValid = hasName && hasCategory && hasFile
  
  console.log('🔍 Form validation:', {
    hasName,
    hasCategory, 
    hasFile,
    isValid
  })
  
  return isValid
})

// Handle modal close
function handleClose() {
  if (submitting.value) return
  
  // Reset form
  form.value = {
    name: '',
    category: '',
    clothing_type: '',
    brand: '',
    privacy: 'friends',
    file: null
  }
  imagePreview.value = null
  imageError.value = null
  classificationResult.value = null
  
  emit('close')
}

// Handle file selection
async function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    await processFile(file)
  }
}

// Handle drag and drop
async function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    await processFile(file)
  }
}

// Process uploaded file
async function processFile(file) {
  // Validate file
  const validation = validateImageForClassification(file)
  if (!validation.isValid) {
    imageError.value = validation.errors.join(', ')
    return
  }
  
  imageError.value = null
  
  // Set file in form
  form.value.file = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
  
  // Start AI classification
  await classifyImage(file)
}

// Classify image with FashionRNN
async function classifyImage(file) {
  console.log('🧠 Starting classification for file:', file.name)
  
  if (classifying.value) {
    console.log('⚠️ Classification already in progress, skipping...')
    return
  }
  
  classifying.value = true
  classificationResult.value = null
  
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
    } else {
      console.warn('Classification failed:', result.error)
    }
  } catch (error) {
    console.error('Classification error:', error)
  } finally {
    classifying.value = false
  }
}

// Handle form submission
async function handleSubmit() {
  if (!isFormValid.value || submitting.value) {
    console.log('🚫 Form submission blocked:', { isValid: isFormValid.value, submitting: submitting.value })
    return
  }
  
  console.log('🚀 Starting form submission...')
  submitting.value = true
  
  try {
    // Check quota
    if (!closetStore.canAddItem) {
      throw new Error('You have reached your 50 upload limit. Add unlimited items from our catalog!')
    }
    
    // Prepare item data
    const itemData = {
      name: form.value.name.trim(),
      category: form.value.category,
      clothing_type: form.value.clothing_type,
      brand: form.value.brand.trim() || null,
      privacy: form.value.privacy,
      file: form.value.file
    }
    
    // Add item to closet
    await closetStore.addItem(itemData)
    
    // Success!
    emit('success')
    handleClose()
    
  } catch (error) {
    console.error('Failed to add item:', error)
    imageError.value = error.message
  } finally {
    submitting.value = false
  }
}

// Watch for modal open to reset form
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Reset form when modal opens
    form.value = {
      name: '',
      category: '',
      clothing_type: '',
      brand: '',
      privacy: 'friends',
      file: null
    }
    imagePreview.value = null
    imageError.value = null
    classificationResult.value = null
  }
})
</script>

<style scoped>
/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>