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
              <option value="hat">Accessories</option>
            </select>
          </div>

          <div>
            <label :class="`text-base mb-2 block ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Color
            </label>
            <input
              v-model="formData.color"
              placeholder="e.g., Black"
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
            <input
              v-model="formData.type"
              placeholder="e.g., T-Shirt, Jeans, Sneakers"
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

const canSubmit = computed(() => {
  return formData.value.name && formData.value.category && formData.value.privacy && formData.value.image_url
})

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
    showError('Failed to upload image. Please try again.')
  } finally {
    uploading.value = false
  }
}

const clearImage = () => {
  previewUrl.value = ''
  formData.value.image_url = ''
}

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return

  isSubmitting.value = true
  try {
    const result = await clothesService.createClothingItem({
      name: formData.value.name,
      category: formData.value.category,
      type: formData.value.type || null,
      image_url: formData.value.image_url,
      color: formData.value.color || null,
      brand: formData.value.brand || null,
      privacy: formData.value.privacy,
    })

    if (result.success) {
      console.log('ManualUploadForm: Item created successfully')
      showSuccess('Item added successfully!')
      emit('item-added')
      router.push('/closet')
    } else {
      console.error('ManualUploadForm: Failed to create item:', result.error)
      showError('Failed to add item. Please try again.')
    }
  } catch (error) {
    console.error('ManualUploadForm: Error creating item:', error)
    showError('An error occurred. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

