<template>
  <div>
    <!-- Upload Form -->
    <div :class="`rounded-2xl border p-8 bg-white border-stone-200 dark:bg-zinc-900 dark:border-zinc-800`">
      <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <!-- Image Upload - Left Side (50%) -->
        <div class="w-full lg:w-1/2 flex-shrink-0">
          <label :class="`text-base mb-3 block text-stone-700 dark:text-zinc-300`">
            Item Image *
          </label>
          
          <div v-if="previewUrl" class="relative">
            <img
              :src="previewUrl"
              alt="Preview"
              :class="`w-full h-80 object-contain rounded-2xl bg-stone-100 dark:bg-zinc-800`"
            />
            <button
              @click="clearImage"
              :class="`absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors z-10`"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <label
            v-else
            :class="`flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 
            border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 dark:border-zinc-700 dark:hover:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-750`"
          >
            <div v-if="uploading" class="spinner-modern" />
            <template v-else>
              <Upload :class="`w-16 h-16 mb-4 text-stone-400 dark:text-zinc-500`"/>
              <p :class="`text-xl font-medium text-stone-600 dark:text-zinc-400 text-center`">
                Click to upload or drag and drop
              </p>
              <p :class="`text-sm mt-2 text-stone-500 dark:text-zinc-500 text-center`">
                PNG, JPG or JPEG (max 10MB)
              </p>
            </template>
            <input
              type="file"
              accept="image/*"
              @change="handleFileUpload"
              class="hidden"
              :disabled="uploading"
            />
          </label>
        </div>

        <!-- Form Fields - Right Side (50%) -->
        <div class="w-full lg:w-1/2 flex-shrink-0 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label :class="`text-base mb-2 block text-stone-700 dark:text-zinc-300`">
              Item Name *
            </label>
            <input
              v-model="formData.name"
              placeholder="e.g., Black T-Shirt"
              maxlength="50"
              :class="`w-full h-12 px-4 rounded-xl transition-colors bg-stone-50 border-stone-200 text-black border
                dark:bg-zinc-800 dark:border-zinc-700 dark:text-white 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white`"
              @input="formData.name = sanitizeText(formData.name)"
            />
          </div>

          <div>
            <label :class="`text-base mb-2 block text-stone-700 dark:text-zinc-300`">
              Category *
            </label>
            <select
              v-model="formData.category"
              @change="onCategoryChange"
              :class="`w-full h-12 px-4 rounded-xl transition-colors bg-stone-50 border-stone-200 text-black border 
                dark:bg-zinc-800 dark:border-zinc-700 dark:text-white 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white`"
            >
              <option value="">Select category</option>
              <option value="top">Tops</option>
              <option value="bottom">Bottoms</option>
              <option value="shoes">Shoes</option>
              <option value="outerwear">Outerwear</option>
              <option value="accessory">Accessories</option>
            </select>
          </div>

          <div>
            <label :class="`text-base mb-2 block text-stone-700 dark:text-zinc-300`">
              Color
            </label>
            <select
              v-model="formData.color"
              :class="`w-full h-12 px-4 rounded-xl transition-colors bg-stone-50 border-stone-200 text-black border
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white`"
            >
              <option value="">Select color (optional)</option>
              <option value="black">Black</option>
              <option value="white">White</option>
              <option value="gray">Gray</option>
              <option value="beige">Beige</option>
              <option value="brown">Brown</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="yellow">Yellow</option>
              <option value="green">Green</option>
              <option value="orange">Orange</option>
              <option value="purple">Purple</option>
              <option value="pink">Pink</option>
              <option value="navy">Navy</option>
              <option value="teal">Teal</option>
              <option value="maroon">Maroon</option>
              <option value="olive">Olive</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
            </select>
          </div>

          <div>
            <label :class="`text-base mb-2 block text-stone-700 dark:text-zinc-300`">
              Brand
            </label>
            <input
              v-model="formData.brand"
              placeholder="e.g., Nike"
              maxlength="50"
              :class="`w-full h-12 px-4 rounded-xl transition-colors bg-stone-50 border-stone-200 text-black border
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white`"
              @input="formData.brand = sanitizeText(formData.brand)"
            />
          </div>

          <div>
            <label :class="`text-base mb-2 block text-stone-700 dark:text-zinc-300`">
              Type
            </label>
            <select
              v-model="formData.type"
              :disabled="!formData.category"
              :class="[
                'w-full h-12 px-4 rounded-xl transition-colors bg-stone-50 border border-stone-200 text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:focus:ring-white',
                !formData.category ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              <option value="">Select type</option>
              <option 
                v-for="type in availableTypes" 
                :key="type" 
                :value="type"
              >
                {{ type }}
              </option>
            </select>
          </div>

          <div>
            <label :class="`text-base mb-2 block text-stone-700 dark:text-zinc-300`">
              Privacy *
            </label>
            <select
              v-model="formData.privacy"
              :class="`w-full h-12 px-4 rounded-xl transition-colors bg-stone-50 border-stone-200 text-black border
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white`"
            >
              <option value="private">Private (Only Me)</option>
              <option value="friends">Friends</option>
              <option value="public">Public (Everyone)</option>
            </select>
          </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4">
          <button
            @click="$router.push('/closet')"
            :class="`flex-1 h-12 rounded-xl font-medium transition-colors bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200
              dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:border-zinc-700`"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="!canSubmit || isSubmitting"
            :class="`flex-1 h-12 rounded-xl font-medium transition-all ${
              canSubmit && !isSubmitting
                ? 'bg-black text-white hover:bg-stone-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100'
                : 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
            }`"
          >
            {{ isSubmitting ? 'Adding Item...' : 'Add to Closet' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useSanitize } from '@/composables/useSanitize'
import { usePopup } from '@/composables/usePopup'
import { ClothesService } from '@/services/clothesService'
import { cloudinary } from '@/lib/cloudinary'
import { Upload, X } from 'lucide-vue-next'

const { theme } = useTheme()
const { sanitizeText } = useSanitize()
const router = useRouter()
const { showError, showSuccess } = usePopup()
const clothesService = new ClothesService()

const emit = defineEmits(['item-added'])

// Category to clothing type mapping
const categoryTypeMapping = {
  top: ['Blouse', 'Body', 'Dress', 'Hoodie', 'Longsleeve', 'Polo', 'Shirt', 'T-Shirt', 'Top', 'Undershirt'],
  bottom: ['Pants'],
  outerwear: ['Blazer', 'Outwear'],
  shoes: ['Shoes'],
  accessory: ['Hat']
}

const uploading = ref(false)
const isSubmitting = ref(false)
const previewUrl = ref('')
const formData = ref({
  name: '',
  category: '',
  type: '',
  color: '',
  brand: '',
  privacy: 'friends', // Default to friends
  image_url: '',
  image_file: null, // Store the actual file for upload
})

// Computed property for available types based on selected category
const availableTypes = computed(() => {
  if (!formData.value.category) return []
  return categoryTypeMapping[formData.value.category] || []
})

const canSubmit = computed(() => {
  return formData.value.name && formData.value.category && formData.value.privacy && formData.value.image_file
})

// Handle category change - reset type when category changes
const onCategoryChange = () => {
  formData.value.type = '' // Reset type when category changes
}

const handleFileUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    console.log('📸 ManualUploadForm: Starting file upload...', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type
    })

    // 1) Basic validation (type/size)
    const { validateImageForClassification, classifyClothingItem } = await import('@/services/fashion-rnn-service')
    const validation = validateImageForClassification(file)
    if (!validation.isValid) {
      showError(validation.errors.join(', '))
      return
    }

    // 2) Background removal (best-effort)
    let processedFile = file
    try {
      const { removeBackground } = await import('modern-rembg')
      const blob = await removeBackground(file)
      processedFile = new File([blob], file.name.replace(/\.[^.]+$/, '') + '-nobg.png', { type: 'image/png' })
    } catch (bgErr) {
      console.warn('modern-rembg background removal failed, proceeding with original image:', bgErr)
      processedFile = file
    }

    // 3) AI classification (must pass to continue)
    try {
      const classification = await classifyClothingItem(processedFile)
      if (!classification || !classification.success) {
        // Show the processed image (background removed) in error popup
        const processedImageUrl = URL.createObjectURL(processedFile)
        showError(
          classification?.error || 'AI recognition failed. Please try another image.',
          'AI Recognition Failed',
          processedImageUrl
        )
        return
      }
      // Enforce minimum confidence threshold (70%)
      const confidence = typeof classification.confidence === 'number' ? classification.confidence : 0
      if (confidence < 0.7) {
        const pct = Math.round(confidence * 100)
        // Create blob URL for the processed image (background removed) to show in error popup
        const processedImageUrl = URL.createObjectURL(processedFile)
        showError(
          `AI confidence is ${pct}%. Minimum required is 70%. Please upload a clearer, single-item image on a plain background.`,
          'Low Confidence',
          processedImageUrl
        )
        // Clean up the blob URL when popup is closed (handled by popup cleanup)
        // Note: We'll need to revoke it manually or let the component handle it
        return
      }
      // Auto-fill category if available
      if (classification.styleSnapCategory) {
        formData.value.category = classification.styleSnapCategory
      }
      
      // 4) Color detection
      try {
        const { detectColors } = await import('@/utils/color-detector')
        const colors = await detectColors(processedFile)
        if (colors && colors.primary) {
          formData.value.color = colors.primary
          console.log('🎨 ManualUploadForm: Detected color:', colors.primary, 'Secondary:', colors.secondary)
        }
      } catch (colorErr) {
        console.warn('⚠️ ManualUploadForm: Color detection failed:', colorErr)
        // Don't block upload if color detection fails, just log warning
      }
      
      // Store processed file for upload and show preview
      formData.value.image_file = processedFile
      const previewBlob = URL.createObjectURL(processedFile)
      formData.value.image_url = previewBlob
      previewUrl.value = previewBlob
      console.log('📸 ManualUploadForm: File stored after AI checks, preview created')
    } catch (aiErr) {
      console.error('❌ ManualUploadForm: AI classification error:', aiErr)
      showError('AI service unavailable. Please try again later or use a different image.')
      return
    }
  } catch (error) {
    console.error('❌ ManualUploadForm: Error processing file:', error)
    showError('Failed to process image file. Please try again.')
  } finally {
    uploading.value = false
  }
}

const clearImage = () => {
  previewUrl.value = ''
  formData.value.image_url = ''
  formData.value.image_file = null
  formData.value.color = ''
}

const handleSubmit = async () => {
  console.log('📝 ManualUploadForm: ========== Form Submission Started ==========')
  console.log('📝 ManualUploadForm: Form validation:', {
    canSubmit: canSubmit.value,
    isSubmitting: isSubmitting.value,
    formData: {
      name: formData.value.name,
      category: formData.value.category,
      type: formData.value.type,
      color: formData.value.color,
      brand: formData.value.brand,
      privacy: formData.value.privacy,
      hasImage: !!formData.value.image_file,
      imageFile: formData.value.image_file?.name || 'No file'
    }
  })

  if (!canSubmit.value || isSubmitting.value) {
    console.log('📝 ManualUploadForm: Form submission blocked:', {
      canSubmit: canSubmit.value,
      isSubmitting: isSubmitting.value
    })
    return
  }

  isSubmitting.value = true
  console.log('📝 ManualUploadForm: Form submission in progress...')
  
  try {
    // Map clothing type to database format (capitalized, matching database constraint)
    const clothingTypeMap = {
      'blouse': 'Blouse',
      'body': 'Body',
      'hoodie': 'Hoodie',
      'longsleeve': 'Longsleeve',
      'polo': 'Polo',
      'shirt': 'Shirt',
      't-shirt': 'T-Shirt',
      'top': 'Top',
      'undershirt': 'Undershirt',
      'pants': 'Pants',
      'dress': 'Dress',
      'blazer': 'Blazer',
      'outwear': 'Outwear',
      'shoes': 'Shoes',
      'hat': 'Hat',
      'other': 'Other'
    }
    
    const clothingType = formData.value.type 
      ? (clothingTypeMap[formData.value.type.toLowerCase()] || formData.value.type)
      : null
    
    const serviceData = {
      name: formData.value.name,
      category: formData.value.category,
      clothing_type: clothingType,
      color: formData.value.color || null,
      brand: formData.value.brand || null,
      privacy: formData.value.privacy,
      image_file: formData.value.image_file, // Pass the file for Cloudinary upload
    }

    console.log('📝 ManualUploadForm: Calling clothesService.addClothes with data:', serviceData)

    const result = await clothesService.addClothes(serviceData)

    console.log('📝 ManualUploadForm: Service call result:', {
      success: result.success,
      hasData: !!result.data,
      hasError: !!result.error
    })

    if (result.success) {
      console.log('✅ ManualUploadForm: Item created successfully!', {
        itemId: result.data?.id,
        itemName: result.data?.name,
        category: result.data?.category
      })
      showSuccess('Item added successfully!')
      emit('item-added')
      console.log('📝 ManualUploadForm: Navigating to /closet')
      router.push('/closet')
    } else {
      console.error('❌ ManualUploadForm: Failed to create item:', result.error)
      showError('Failed to add item. Please try again.')
    }
  } catch (error) {
    console.error('❌ ManualUploadForm: Error creating item:', error)
    console.error('❌ ManualUploadForm: Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    showError('An error occurred. Please try again.')
  } finally {
    isSubmitting.value = false
    console.log('📝 ManualUploadForm: Form submission completed')
  }
}
</script>

