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
      <h2 class="header-title">Add New Item</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="form-content">
      <!-- Item Name -->
      <div class="form-section">
        <label class="form-label">Item Name</label>
        <input
          v-model="formData.name"
          type="text"
          placeholder="Enter item name"
          class="form-input"
          required
        />
      </div>

      <!-- Category -->
      <div class="form-section">
        <label class="form-label">Category</label>
        <select v-model="formData.category" class="form-select" required>
          <option value="">Select category</option>
          <option value="top">Tops</option>
          <option value="bottom">Bottoms</option>
          <option value="outerwear">Outerwear</option>
          <option value="shoes">Shoes</option>
          <option value="accessory">Accessories</option>
        </select>
      </div>

      <!-- Brand -->
      <div class="form-section">
        <label class="form-label">Brand</label>
        <input
          v-model="formData.brand"
          type="text"
          placeholder="Enter brand (optional)"
          class="form-input"
        />
      </div>

      <!-- Image -->
      <div class="form-section">
        <label class="form-label">Image</label>
        <div class="image-upload">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileUpload"
            class="file-input"
          />
          <button type="button" @click="$refs.fileInput.click()" class="file-button">
            Choose file
          </button>
          <span class="file-name">{{ selectedFileName || 'No file chosen' }}</span>
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
import { ref, computed, watch, nextTick } from 'vue'
import { Brain, AlertCircle } from 'lucide-vue-next'
import { classifyClothingItem, validateImageForClassification } from '@/services/fashion-rnn-service'
import { ClothesService } from '@/services/clothesService'

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
const selectedFileName = ref('')
const aiRecognitionStatus = ref(null)
const clothesService = new ClothesService()

// Form data
const formData = ref({
  name: '',
  category: '',
  brand: '',
  image_file: null
})

// Computed
const canSubmit = computed(() => {
  return formData.value.name && 
         formData.value.category && 
         formData.value.image_file
})


// Methods
const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  selectedFileName.value = file.name
  formData.value.image_file = file
  
  // Show AI recognition status
  aiRecognitionStatus.value = {
    type: 'loading',
    message: 'Analyzing image with AI...'
  }

  try {
    // Validate file
    const validation = validateImageForClassification(file)
    if (!validation.isValid) {
      aiRecognitionStatus.value = {
        type: 'error',
        message: validation.errors.join(', ')
      }
      return
    }

    // Try AI classification (optional - don't let it break the form)
    try {
      const classification = await classifyClothingItem(file)
      
      if (classification.success) {
        // Auto-fill only category from AI results
        formData.value.category = classification.styleSnapCategory || formData.value.category
        
        // Force Vue to update the form fields
        await nextTick()
        
        aiRecognitionStatus.value = {
          type: 'success',
          message: `AI detected: ${classification.topPrediction} - Category set to ${classification.styleSnapCategory} (${Math.round(classification.confidence * 100)}% confidence)`
        }
        
        console.log('AI Classification Result:', {
          prediction: classification.topPrediction,
          category: classification.styleSnapCategory,
          confidence: classification.confidence
        })
      } else {
        aiRecognitionStatus.value = {
          type: 'warning',
          message: 'AI recognition unavailable, please fill manually'
        }
      }
    } catch (aiError) {
      console.warn('AI recognition failed:', aiError)
      aiRecognitionStatus.value = {
        type: 'warning',
        message: 'AI service temporarily unavailable, please fill manually'
      }
    }
  } catch (error) {
    console.error('Error processing image:', error)
    aiRecognitionStatus.value = {
      type: 'error',
      message: 'Failed to process image. Please try again.'
    }
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
      brand: formData.value.brand || null,
      privacy: 'private',
      is_favorite: false,
      style_tags: [],
      image_file: formData.value.image_file
    }

    console.log('Submitting item data:', itemData)

    // Use the existing ClothesService
    const result = await clothesService.addClothes(itemData)
    
    if (result.success) {
      console.log('Item added successfully:', result.data)
      emit('itemAdded')
      resetForm()
      emit('close')
    } else {
      console.error('Failed to add item:', result.error)
      throw new Error(result.error || 'Failed to add item')
    }
  } catch (error) {
    console.error('Error creating item:', error)
    
    // Check if it's a Cloudinary upload error
    if (error.message?.includes('Failed to upload image') || error.message?.includes('Cloudinary')) {
      aiRecognitionStatus.value = {
        type: 'error',
        message: 'Image upload failed. Please try a different image or check your connection.'
      }
    } else {
      aiRecognitionStatus.value = {
        type: 'error',
        message: 'Failed to add item. Please try again.'
      }
    }
  } finally {
    uploading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    category: '',
    brand: '',
    image_file: null
  }
  selectedFileName.value = ''
  aiRecognitionStatus.value = null
}


// Watch for dialog open/close to reset form
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})
</script>

<style scoped>
.add-item-form {
  max-width: 400px;
  width: 400px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 24px;
  color: #333;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 24px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
}

.image-upload {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-input {
  display: none;
}

.file-button {
  padding: 8px 16px;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-button:hover {
  background: #e9e9e9;
}

.file-name {
  font-size: 14px;
  color: #666;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 1px solid #ddd;
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
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background: #e9e9e9;
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

