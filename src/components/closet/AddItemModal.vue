<template>
  <Teleport to="body">
  <div
    v-if="isOpen"
      class="modal-overlay"
    @click.self="handleClose"
  >
      <!-- Modal Container -->
      <div class="modal-container">
        <div class="modal-content">
          
          <!-- Header -->
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon">
                <svg class="icon-plus" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              <h2 class="header-title">Add Item</h2>
            </div>
          </div>

          <!-- Form Content -->
          <div class="modal-body">
            <form @submit.prevent="handleSubmit" class="form-container">
              
              <!-- Photo Upload -->
              <div class="upload-section">
                <label class="section-label">Photo</label>
                <div
                  class="upload-area"
                  :class="{
                    'upload-dragging': isDragging,
                    'upload-error': imageError,
                    'upload-has-image': imagePreview
                  }"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                >
                  <!-- Image Preview -->
                  <div v-if="imagePreview" class="image-preview">
                    <img :src="imagePreview" alt="Preview" class="preview-image">
                    <div class="preview-overlay">
                      <svg class="check-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                  </div>

                  <!-- Upload Button -->
                  <button
                    v-else
                    type="button"
                    class="upload-btn" 
                    @click="fileInput?.click()"
                  >
                    <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Choose Photo</span>
                  </button>

                  <!-- Hidden File Input -->
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="file-input-hidden"
                    @change="handleFileSelect"
                  >
                </div>
                
                <!-- Error Message -->
                <p v-if="imageError" class="error-text">
                  {{ imageError }}
                </p>
                </div>

                <!-- AI Status -->
              <div v-if="classifying" class="ai-status">
                <div class="ai-spinner"></div>
                <span class="ai-text">Analyzing image...</span>
                </div>

                <!-- AI Result -->
              <div v-if="classificationResult && !classifying" class="ai-result">
                <div class="ai-success-icon">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                <span class="ai-text">Detected: {{ classificationResult.topPrediction }}</span>
              </div>

              <!-- Form Fields -->
              <div class="form-fields">
                <!-- Name -->
                <div class="field-group">
                  <label class="field-label">Name</label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    maxlength="100"
                    placeholder="Blue Denim Jacket"
                    class="field-input"
                  >
                </div>

                <!-- Category -->
                <div class="field-group">
                  <label class="field-label">Category</label>
                  <select
                    v-model="form.category"
                    required
                    class="field-select"
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
                <div class="field-group">
                  <label class="field-label">Type</label>
                  <select
                    v-model="form.clothing_type"
                    class="field-select"
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
                <div class="field-group">
                  <label class="field-label">Brand</label>
                  <input
                    v-model="form.brand"
                    type="text"
                    maxlength="100"
                    placeholder="Nike, Zara, H&M"
                    class="field-input"
                  >
                </div>

                <!-- Privacy -->
                <div class="field-group">
                  <label class="field-label">Privacy</label>
                  <select
                    v-model="form.privacy"
                    class="field-select"
                  >
                    <option value="friends">Visible to Friends</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <!-- Progress Indicators -->
              <div class="progress-section">
                <div class="progress-item" :class="{ 'complete': form.file }">
                  <div class="progress-dot"></div>
                  <span class="progress-text">Photo</span>
                  </div>
                <div class="progress-item" :class="{ 'complete': form.name.trim() }">
                  <div class="progress-dot"></div>
                  <span class="progress-text">Name</span>
                </div>
                <div class="progress-item" :class="{ 'complete': form.category }">
                  <div class="progress-dot"></div>
                  <span class="progress-text">Category</span>
                </div>
              </div>

              <!-- Quota Warning -->
              <div v-if="quotaWarning" class="quota-warning">
                <svg class="warning-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                <span>{{ quotaUsed }}/50 uploads used</span>
              </div>
            </form>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
              <button
                type="button"
              class="action-btn cancel-btn"
                @click="handleClose"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting || !isFormValid"
              class="action-btn submit-btn"
                @click="handleSubmit"
              >
                <svg
                  v-if="submitting"
                class="spinner"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                  class="spinner-circle"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                  class="spinner-path"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              <span v-else>Add Item</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useClosetStore } from '../../stores/closet-store'
import { classifyClothingItem, validateImageForClassification } from '../../services/fashion-rnn-service'
import { CATEGORY_GROUPS } from '../../config/constants'

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
      
      // Show error message for rejected categories
      if (result.rejected) {
        imageError.value = result.error
        classificationResult.value = null
      }
    }
  } catch (error) {
    console.error('Classification error:', error)
    imageError.value = 'Failed to analyze image. Please try again.'
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
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(16px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    backdrop-filter: blur(0px);
  }
  to { 
    opacity: 1; 
    backdrop-filter: blur(16px);
  }
}

/* Modal Container */
.modal-container {
  width: 100%;
  max-width: 28rem;
  position: relative;
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 90vh;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modal Content */
.modal-content {
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border-radius: 2rem;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  max-height: 85vh;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(139, 92, 246, 0.3), 
    rgba(59, 130, 246, 0.3), 
    transparent
  );
}

@media (prefers-color-scheme: dark) {
  .modal-content {
    background: linear-gradient(145deg, #1e293b, #0f172a);
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

/* Header */
.modal-header {
  padding: 2rem 2rem 1.5rem;
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 3.5rem;
  height: 3.5rem;
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 10px 25px rgba(139, 92, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.header-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4);
  border-radius: 1.25rem;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.header-icon:hover::before {
  opacity: 1;
}

.icon-plus {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.025em;
}

@media (prefers-color-scheme: dark) {
  .header-title {
    background: linear-gradient(135deg, #a78bfa, #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

/* Body */
.modal-body {
  padding: 0 2rem;
  overflow-y: auto;
  flex: 1;
  max-height: calc(85vh - 200px);
  min-height: 400px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 1rem;
}

/* Upload Section */
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin: 0;
}

@media (prefers-color-scheme: dark) {
  .section-label {
    color: #94a3b8;
  }
}

.upload-area {
  border: 2px dashed rgba(139, 92, 246, 0.3);
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(145deg, rgba(139, 92, 246, 0.02), rgba(59, 130, 246, 0.02));
  position: relative;
  overflow: hidden;
  min-height: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(139, 92, 246, 0.05), 
    rgba(59, 130, 246, 0.05),
    rgba(6, 182, 212, 0.05)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-area:hover::before {
  opacity: 1;
}

.upload-dragging {
  border-color: #8b5cf6;
  background: linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05));
  transform: scale(1.02);
}

.upload-error {
  border-color: #ef4444;
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
  animation: shake 0.5s ease-in-out;
}

.upload-has-image {
  border-color: #10b981;
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  color: white;
  border: none;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 
    0 8px 25px rgba(139, 92, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.upload-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-btn:hover::before {
  opacity: 1;
}

.upload-btn:hover {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  transform: translateY(-2px);
  box-shadow: 
    0 12px 35px rgba(139, 92, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.upload-icon {
  width: 2rem;
  height: 2rem;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.preview-image {
  width: 5rem;
  height: 5rem;
  object-fit: cover;
  border-radius: 1rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.preview-overlay {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.check-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: white;
}

.error-text {
  font-size: 0.75rem;
  color: #ef4444;
  margin: 0;
  text-align: center;
}

/* AI Status */
.ai-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1rem;
  color: #2563eb;
  font-size: 0.875rem;
  font-weight: 500;
}

.ai-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(37, 99, 235, 0.2);
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.ai-result {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 1rem;
  color: #059669;
  font-size: 0.875rem;
  font-weight: 500;
}

.ai-success-icon {
  width: 1.25rem;
  height: 1.25rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Form Fields */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin: 0;
}

@media (prefers-color-scheme: dark) {
  .field-label {
    color: #cbd5e1;
  }
}

.field-input,
.field-select {
  width: 100%;
  min-width: 0;
  padding: 1rem 1.25rem;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border: 2px solid transparent;
  border-radius: 1rem;
  font-size: 0.875rem;
  color: #1e293b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
}

.field-input:focus,
.field-select:focus {
  outline: none;
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 
    0 8px 25px rgba(139, 92, 246, 0.15),
    0 0 0 3px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.field-input::placeholder {
  color: #94a3b8;
  font-style: italic;
}

.field-input:hover,
.field-select:hover {
  border-color: rgba(139, 92, 246, 0.2);
  transform: translateY(-1px);
  box-shadow: 
    0 6px 20px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

@media (prefers-color-scheme: dark) {
  .field-input,
  .field-select {
    background: linear-gradient(145deg, #334155, #1e293b);
    color: #f1f5f9;
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  
  .field-input:focus,
  .field-select:focus {
    border-color: rgba(139, 92, 246, 0.4);
    box-shadow: 
      0 8px 25px rgba(139, 92, 246, 0.2),
      0 0 0 3px rgba(139, 92, 246, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  .field-input::placeholder {
    color: #64748b;
  }
}

/* Progress Section */
.progress-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.02));
  border-radius: 1rem;
  border: 1px solid rgba(139, 92, 246, 0.1);
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  background: #e2e8f0;
  transition: all 0.3s ease;
}

.progress-item.complete .progress-dot {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.progress-text {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.progress-item.complete .progress-text {
  color: #059669;
}

@media (prefers-color-scheme: dark) {
  .progress-section {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05));
    border-color: rgba(139, 92, 246, 0.2);
  }
  
  .progress-dot {
    background: #475569;
  }
  
  .progress-text {
    color: #94a3b8;
  }
  
  .progress-item.complete .progress-text {
    color: #34d399;
  }
}

/* Quota Warning */
.quota-warning {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05));
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 1rem;
  color: #d97706;
  font-size: 0.875rem;
  font-weight: 500;
}

.warning-icon {
  width: 1.25rem;
  height: 1.25rem;
}

@media (prefers-color-scheme: dark) {
  .quota-warning {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1));
    border-color: rgba(245, 158, 11, 0.3);
    color: #fbbf24;
  }
}

/* Actions */
.modal-actions {
  padding: 2rem;
  display: flex;
  gap: 1rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.02), rgba(59, 130, 246, 0.02));
}

.action-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.cancel-btn {
  background: linear-gradient(145deg, #f8fafc, #e2e8f0);
  color: #64748b;
  border: 2px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.cancel-btn:hover {
  background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
  border-color: rgba(148, 163, 184, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  color: white;
  border: 2px solid transparent;
  box-shadow: 
    0 8px 25px rgba(139, 92, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.submit-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.submit-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  transform: translateY(-2px);
  box-shadow: 
    0 12px 35px rgba(139, 92, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  animation: spin 1s linear infinite;
}

.spinner-circle {
  opacity: 0.25;
}

.spinner-path {
  opacity: 0.75;
}

@media (prefers-color-scheme: dark) {
  .cancel-btn {
    background: linear-gradient(145deg, #334155, #1e293b);
    color: #cbd5e1;
    border-color: rgba(148, 163, 184, 0.3);
  }
  
  .cancel-btn:hover {
    background: linear-gradient(145deg, #475569, #334155);
    border-color: rgba(148, 163, 184, 0.4);
  }
}

/* Hidden File Input */
.file-input-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
  opacity: 0;
  pointer-events: none;
}
</style>