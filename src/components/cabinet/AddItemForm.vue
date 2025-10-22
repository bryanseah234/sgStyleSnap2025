<!--
  Add Item Form - StyleSnap
  
  Simple form with exactly 4 fields: Name, Category, Brand, Image
  Matches the design from the provided image
  Integrates Hugging Face API for automatic item recognition
-->

<template>
  <div class="add-item-form">
    <!-- Header -->
    <div class="form-header">
      <div class="header-icon">
        <Plus class="w-6 h-6" />
      </div>
      <h2 class="header-title">Add Item</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="form-content">
      <!-- PHOTO Section -->
      <div class="form-section">
        <label class="form-label">PHOTO</label>
        <div class="photo-upload-area">
          <div v-if="previewUrl" class="photo-preview">
            <img :src="previewUrl" :alt="formData.name || 'Item preview'" class="preview-image" />
            <button type="button" @click="removeImage" class="remove-image-btn">
              <X class="w-4 h-4" />
            </button>
          </div>
          <div v-else class="photo-upload-zone" :class="{ 'dragover': isDragOver }">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileUpload"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="handleDrop"
              class="file-input"
            />
            <div class="upload-content">
              <CloudUpload class="upload-icon" />
              <span class="upload-text">Choose Photo</span>
            </div>
          </div>
        </div>
      </div>

      <!-- NAME Section -->
      <div class="form-section">
        <label class="form-label">NAME</label>
        <input
          v-model="formData.name"
          type="text"
          placeholder="Blue Denim Jacket"
          class="form-input"
          required
        />
      </div>

      <!-- CATEGORY Section -->
      <div class="form-section">
        <label class="form-label">CATEGORY</label>
        <select v-model="formData.category" class="form-select" required>
          <option value="">Select category</option>
          <option value="tops">Tops</option>
          <option value="bottoms">Bottoms</option>
          <option value="outerwear">Outerwear</option>
          <option value="shoes">Shoes</option>
          <option value="accessories">Accessories</option>
        </select>
      </div>

      <!-- TYPE Section -->
      <div class="form-section">
        <label class="form-label">TYPE</label>
        <select v-model="formData.clothingType" class="form-select" required>
          <option value="">Select type</option>
          <option 
            v-for="type in availableTypes" 
            :key="type.value" 
            :value="type.value"
          >
            {{ type.label }}
          </option>
        </select>
      </div>

      <!-- BRAND Section -->
      <div class="form-section">
        <label class="form-label">BRAND</label>
        <input
          v-model="formData.brand"
          type="text"
          placeholder="Nike, Zara, H&M"
          class="form-input"
        />
      </div>

      <!-- PRIVACY Section -->
      <div class="form-section">
        <label class="form-label">PRIVACY</label>
        <select v-model="formData.privacy" class="form-select">
          <option value="friends">Visible to Friends</option>
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
        
        <!-- Privacy Details -->
        <div class="privacy-details">
          <div class="privacy-chips">
            <div 
              v-for="detail in PRIVACY_DETAILS" 
              :key="detail.value"
              class="privacy-chip"
              :class="{ 'active': formData.privacyDetails.includes(detail.value) }"
              @click="togglePrivacyDetail(detail.value)"
            >
              <div class="chip-dot"></div>
              <span class="chip-text">{{ detail.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Recognition Status -->
      <div v-if="aiRecognitionStatus" class="ai-status">
        <div class="status-content" :class="aiRecognitionStatus.type">
          <div class="status-icon">
            <Brain v-if="aiRecognitionStatus.type === 'success'" class="w-4 h-4" />
            <AlertCircle v-else class="w-4 h-4" />
          </div>
          <span class="status-text">{{ aiRecognitionStatus.message }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions">
        <button type="button" @click="$emit('close')" class="cancel-btn">
          Cancel
        </button>
        <button 
          type="submit" 
          :disabled="!canSubmit || uploading"
          class="submit-btn"
          :class="{ 'disabled': !canSubmit || uploading }"
        >
          {{ uploading ? 'Adding...' : 'Add Item' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Brain, AlertCircle, CloudUpload, X, Plus } from 'lucide-vue-next'
import { classifyClothingItem, validateImageForClassification } from '@/services/fashion-rnn-service'
import { ClothesService } from '@/services/clothesService'
import { PRIVACY_DETAILS, getClothingTypesByCategory } from '@/utils/clothing-constants'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'itemAdded'])

// State
const uploading = ref(false)
const isDragOver = ref(false)
const previewUrl = ref('')
const aiRecognitionStatus = ref(null)
const clothesService = new ClothesService()

// Form data
const formData = ref({
  name: '',
  category: '',
  clothingType: '',
  brand: '',
  privacy: 'friends',
  privacyDetails: ['photo', 'name', 'category'],
  image_file: null
})

// Computed
const canSubmit = computed(() => {
  return formData.value.name && 
         formData.value.category && 
         formData.value.clothingType && 
         formData.value.image_file
})

const availableTypes = computed(() => {
  if (!formData.value.category) return []
  return getClothingTypesByCategory(formData.value.category)
})

// Methods
const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  await processImageFile(file)
}

const handleDrop = async (event) => {
  isDragOver.value = false
  const file = event.dataTransfer.files?.[0]
  if (!file) return
  
  await processImageFile(file)
}

const processImageFile = async (file) => {
  // Validate file
  const validation = validateImageForClassification(file)
  if (!validation.isValid) {
    aiRecognitionStatus.value = {
      type: 'error',
      message: validation.errors.join(', ')
    }
    return
  }

  uploading.value = true
  aiRecognitionStatus.value = {
    type: 'loading',
    message: 'Analyzing image with AI...'
  }

  try {
    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
    
    formData.value.image_file = file

    // Classify with AI
    const classification = await classifyClothingItem(file)
    
    if (classification.success) {
      // Auto-fill form with AI results
      formData.value.name = classification.topPrediction || formData.value.name
      formData.value.category = classification.styleSnapCategory || formData.value.category
      formData.value.clothingType = classification.clothingType || formData.value.clothingType
      
      aiRecognitionStatus.value = {
        type: 'success',
        message: `AI detected: ${classification.topPrediction} (${Math.round(classification.confidence * 100)}% confidence)`
      }
    } else {
      aiRecognitionStatus.value = {
        type: 'warning',
        message: classification.error || 'AI recognition failed, please fill manually'
      }
    }
  } catch (error) {
    console.error('Error processing image:', error)
    aiRecognitionStatus.value = {
      type: 'error',
      message: 'Failed to process image. Please try again.'
    }
  } finally {
    uploading.value = false
  }
}

const removeImage = () => {
  formData.value.image_file = null
  previewUrl.value = ''
  aiRecognitionStatus.value = null
}

const togglePrivacyDetail = (detail) => {
  const index = formData.value.privacyDetails.indexOf(detail)
  if (index > -1) {
    formData.value.privacyDetails.splice(index, 1)
  } else {
    formData.value.privacyDetails.push(detail)
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value || uploading.value) return

  uploading.value = true
  try {
    // Prepare data for Supabase
    const itemData = {
      name: formData.value.name,
      category: formData.value.category,
      clothing_type: formData.value.clothingType,
      brand: formData.value.brand || null,
      privacy: formData.value.privacy,
      is_favorite: false,
      style_tags: [],
      image_file: formData.value.image_file
    }

    // Use the existing ClothesService
    const result = await clothesService.addClothes(itemData)
    
    if (result.success) {
      emit('itemAdded')
      resetForm()
      emit('close')
    } else {
      throw new Error(result.error || 'Failed to add item')
    }
  } catch (error) {
    console.error('Error creating item:', error)
    aiRecognitionStatus.value = {
      type: 'error',
      message: 'Failed to add item. Please try again.'
    }
  } finally {
    uploading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    category: '',
    clothingType: '',
    brand: '',
    privacy: 'friends',
    privacyDetails: ['photo', 'name', 'category'],
    image_file: null
  }
  previewUrl.value = ''
  aiRecognitionStatus.value = null
}

// Watch for category changes to reset clothing type
watch(() => formData.value.category, (newCategory) => {
  if (newCategory && !getClothingTypesByCategory(newCategory).find(t => t.value === formData.value.clothingType)) {
    formData.value.clothingType = ''
  }
})

// Watch for dialog open/close to reset form
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})
</script>

<style scoped>
.add-item-form {
  max-width: 500px;
  margin: 0 auto;
  background: #1a1a2e;
  border-radius: 12px;
  padding: 24px;
  color: white;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #a0a0a0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.photo-upload-area {
  position: relative;
}

.photo-preview {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  background: #2a2a3e;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}

.photo-upload-zone {
  width: 100%;
  height: 200px;
  border: 2px dashed #4a4a5e;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.photo-upload-zone:hover,
.photo-upload-zone.dragover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #667eea;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: #667eea;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  color: #333;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
}

.form-input::placeholder {
  color: #999;
}

.privacy-details {
  margin-top: 12px;
}

.privacy-chips {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.privacy-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e0e0e0;
}

.privacy-chip:hover {
  background: #f5f5f5;
}

.privacy-chip.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  transition: background 0.2s;
}

.privacy-chip.active .chip-dot {
  background: white;
}

.chip-text {
  font-size: 14px;
  font-weight: 500;
}

.ai-status {
  margin-top: 12px;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
}

.status-content.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-content.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.status-content.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-content.loading {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.cancel-btn {
  background: white;
  color: #333;
  border: 1px solid #e0e0e0;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

.submit-btn {
  background: #667eea;
  color: white;
}

.submit-btn:hover:not(.disabled) {
  background: #5a67d8;
}

.submit-btn.disabled {
  background: #4a4a5e;
  color: #999;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .add-item-form {
    margin: 0;
    border-radius: 0;
    padding: 16px;
  }
}
</style>
