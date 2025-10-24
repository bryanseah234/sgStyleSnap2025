<template>
  <div>
    <!-- Upload Form -->
    <div :class="`rounded-2xl border p-8 ${
      theme.value === 'dark'
        ? 'bg-zinc-900 border-zinc-800'
        : 'bg-white border-stone-200'
    }`">
      <div class="space-y-6">
        <!-- Image Upload -->
        <div>
          <label :class="`text-base mb-3 block ${
            theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
          }`">
            Item Image *
          </label>
          
          <div v-if="previewUrl" class="relative">
            <img
              :src="previewUrl"
              alt="Preview"
              :class="`w-full h-80 object-contain rounded-2xl ${
                theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
              }`"
            />
            <button
              @click="clearImage"
              :class="`absolute top-4 right-4 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors`"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <label
            v-else
            :class="`flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
              theme.value === 'dark'
                ? 'border-zinc-700 hover:border-zinc-600 bg-zinc-800 hover:bg-zinc-750'
                : 'border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100'
            }`"
          >
            <div v-if="uploading" class="spinner-modern" />
            <template v-else>
              <Upload :class="`w-16 h-16 mb-4 ${
                theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-400'
              }`" />
              <p :class="`text-xl font-medium ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`">
                Click to upload or drag and drop
              </p>
              <p :class="`text-sm mt-2 ${
                theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'
              }`">
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

        <!-- Form Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label :class="`text-base mb-2 block ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Item Name *
            </label>
            <input
              v-model="formData.name"
              placeholder="e.g., Black T-Shirt"
              :class="`w-full h-12 px-4 rounded-xl transition-colors ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white border'
                  : 'bg-stone-50 border-stone-200 text-black border'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                theme.value === 'dark' ? 'focus:ring-white' : 'focus:ring-black'
              }`"
            />
          </div>

          <div>
            <label :class="`text-base mb-2 block ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Category *
            </label>
            <select
              v-model="formData.category"
              @change="onCategoryChange"
              :class="`w-full h-12 px-4 rounded-xl transition-colors ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white border'
                  : 'bg-stone-50 border-stone-200 text-black border'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                theme.value === 'dark' ? 'focus:ring-white' : 'focus:ring-black'
              }`"
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
            <label :class="`text-base mb-2 block ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Color
            </label>
            <select
              v-model="formData.color"
              :class="`w-full h-12 px-4 rounded-xl transition-colors ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white border'
                  : 'bg-stone-50 border-stone-200 text-black border'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                theme.value === 'dark' ? 'focus:ring-white' : 'focus:ring-black'
              }`"
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
            <label :class="`text-base mb-2 block ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Brand
            </label>
            <input
              v-model="formData.brand"
              placeholder="e.g., Nike"
              :class="`w-full h-12 px-4 rounded-xl transition-colors ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white border'
                  : 'bg-stone-50 border-stone-200 text-black border'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                theme.value === 'dark' ? 'focus:ring-white' : 'focus:ring-black'
              }`"
            />
          </div>

          <div>
            <label :class="`text-base mb-2 block ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Type
            </label>
            <select
              v-model="formData.type"
              :disabled="!formData.category"
              :class="`w-full h-12 px-4 rounded-xl transition-colors ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white border'
                  : 'bg-stone-50 border-stone-200 text-black border'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                theme.value === 'dark' ? 'focus:ring-white' : 'focus:ring-black'
              } ${
                !formData.category 
                  ? theme.value === 'dark' 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'opacity-50 cursor-not-allowed'
                  : ''
              }`"
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
            <label :class="`text-base mb-2 block ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Privacy *
            </label>
            <select
              v-model="formData.privacy"
              :class="`w-full h-12 px-4 rounded-xl transition-colors ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white border'
                  : 'bg-stone-50 border-stone-200 text-black border'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                theme.value === 'dark' ? 'focus:ring-white' : 'focus:ring-black'
              }`"
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
            :class="`flex-1 h-12 rounded-xl font-medium transition-colors ${
              theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="!canSubmit || isSubmitting"
            :class="`flex-1 h-12 rounded-xl font-medium transition-all ${
              canSubmit && !isSubmitting
                ? theme.value === 'dark'
                  ? 'bg-white text-black hover:bg-zinc-100'
                  : 'bg-black text-white hover:bg-stone-900'
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
import { usePopup } from '@/composables/usePopup'
import { ClothesService } from '@/services/clothesService'
import { cloudinary } from '@/lib/cloudinary'
import { Upload, X } from 'lucide-vue-next'

const { theme } = useTheme()
const router = useRouter()
const { showError, showSuccess } = usePopup()
const clothesService = new ClothesService()

const emit = defineEmits(['item-added'])

// Category to clothing type mapping
const categoryTypeMapping = {
  top: ['Blouse', 'Body', 'Dress', 'Hoodie', 'Longsleeve', 'Polo', 'Shirt', 'T-Shirt', 'Top', 'Undershirt'],
  bottom: ['Pants', 'Shorts', 'Skirt'],
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
})

// Computed property for available types based on selected category
const availableTypes = computed(() => {
  if (!formData.value.category) return []
  return categoryTypeMapping[formData.value.category] || []
})

const canSubmit = computed(() => {
  return formData.value.name && formData.value.category && formData.value.privacy && formData.value.image_url
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
    // Upload to Cloudinary instead of Supabase storage
    const imageData = await cloudinary.uploadImage(file, {
      folder: 'stylesnap/clothes',
      quality: 80,
      format: 'auto'
    })

    formData.value.image_url = imageData.secure_url
    previewUrl.value = imageData.secure_url
  } catch (error) {
    console.error('Error uploading file:', error)
    
    // Check if it's a configuration error
    if (error.message.includes('Cloudinary not configured')) {
      showError('Image upload is not configured. Please contact support.')
    } else if (error.message.includes('Unsupported file type')) {
      showError('Please select a valid image file (JPEG, PNG, WebP, or GIF).')
    } else if (error.message.includes('File too large')) {
      showError('Image file is too large. Please select a file smaller than 10MB.')
    } else {
      showError('Failed to upload image. Please try again.')
    }
  } finally {
    uploading.value = false
  }
}

const clearImage = () => {
  previewUrl.value = ''
  formData.value.image_url = ''
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
      hasImage: !!formData.value.image_url,
      imageUrl: formData.value.image_url?.substring(0, 50) + '...'
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
    // Create a File object from the image URL for Cloudinary upload
    let imageFile = null
    if (formData.value.image_url && formData.value.image_url.startsWith('blob:')) {
      console.log('📝 ManualUploadForm: Converting blob URL to File object...')
      try {
        // Convert blob URL to File object
        const response = await fetch(formData.value.image_url)
        const blob = await response.blob()
        imageFile = new File([blob], 'uploaded-image.jpg', { type: blob.type })
        
        console.log('📝 ManualUploadForm: File conversion successful:', {
          fileName: imageFile.name,
          fileSize: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`,
          fileType: imageFile.type
        })
      } catch (conversionError) {
        console.error('❌ ManualUploadForm: Error converting blob to file:', conversionError)
        throw new Error('Failed to process image file')
      }
    } else {
      console.log('📝 ManualUploadForm: No image file to convert')
    }

    const serviceData = {
      name: formData.value.name,
      category: formData.value.category,
      clothing_type: formData.value.type || null,
      color: formData.value.color || null,
      brand: formData.value.brand || null,
      privacy: formData.value.privacy,
      image_file: imageFile, // Pass the file for Cloudinary upload
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

