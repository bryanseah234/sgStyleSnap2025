<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="$emit('close')"
  >
    <div
      :class="`w-full max-w-2xl rounded-xl p-6 ${
        theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
      }`"
      @click.stop
    >
      <h3 :class="`text-2xl font-bold mb-4 ${
        theme.value === 'dark' ? 'text-white' : 'text-black'
      }`">
        Upload New Item
      </h3>

      <div class="space-y-6">
        <!-- Image Upload -->
        <div>
          <label :class="`block text-base mb-3 ${
            theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
          }`">
            Item Image
          </label>
          
          <div v-if="previewUrl" class="relative">
            <img
              :src="previewUrl"
              alt="Preview"
              :class="`w-full h-64 object-contain rounded-2xl ${
                theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
              }`"
            />
            <button
              @click="removeImage"
              :class="`absolute top-2 right-2 p-2 rounded-full ${
                theme.value === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-white text-stone-600'
              } hover:bg-red-500 hover:text-white transition-all duration-200`"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <div v-else class="border-2 border-dashed rounded-2xl p-8 text-center" :class="`${
            theme.value === 'dark' ? 'border-zinc-700' : 'border-stone-300'
          }`">
            <Upload :class="`w-12 h-12 mx-auto mb-4 ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
            }`" />
            <p :class="`text-lg mb-2 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Upload an image
            </p>
            <p :class="`text-sm mb-4 ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
            }`">
              Drag and drop or click to browse
            </p>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileUpload"
              class="hidden"
            />
            <button
              @click="$refs.fileInput.click()"
              :disabled="uploading"
              :class="`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                uploading
                  ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                  : theme.value === 'dark'
                  ? 'bg-white text-black hover:bg-zinc-200'
                  : 'bg-black text-white hover:bg-zinc-800'
              }`"
            >
              {{ uploading ? 'Uploading...' : 'Choose File' }}
            </button>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label :class="`block text-sm font-medium mb-2 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Item Name *
            </label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="e.g., Blue Jeans"
              :class="`w-full px-3 py-2 rounded-lg border ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                  : 'bg-white border-stone-300 text-black placeholder-stone-500'
              }`"
            />
          </div>

          <div>
            <label :class="`block text-sm font-medium mb-2 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Category *
            </label>
            <select
              v-model="formData.category"
              :class="`w-full px-3 py-2 rounded-lg border ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-white border-stone-300 text-black'
              }`"
            >
              <option value="">Select category</option>
              <option value="tops">Tops</option>
              <option value="bottoms">Bottoms</option>
              <option value="shoes">Shoes</option>
              <option value="accessories">Accessories</option>
              <option value="outerwear">Outerwear</option>
            </select>
          </div>

          <div>
            <label :class="`block text-sm font-medium mb-2 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Color
            </label>
            <input
              v-model="formData.color"
              type="text"
              placeholder="e.g., Blue"
              :class="`w-full px-3 py-2 rounded-lg border ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                  : 'bg-white border-stone-300 text-black placeholder-stone-500'
              }`"
            />
          </div>

          <div>
            <label :class="`block text-sm font-medium mb-2 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Brand
            </label>
            <input
              v-model="formData.brand"
              type="text"
              placeholder="e.g., Nike"
              :class="`w-full px-3 py-2 rounded-lg border ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                  : 'bg-white border-stone-300 text-black placeholder-stone-500'
              }`"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="!canSubmit || uploading"
            :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              !canSubmit || uploading
                ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                : theme.value === 'dark'
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-black text-white hover:bg-zinc-800'
            }`"
          >
            {{ uploading ? 'Uploading...' : 'Add Item' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { api } from '@/api/base44Client'
import { Upload, X } from 'lucide-vue-next'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'itemAdded'])

// Theme
const { theme } = useTheme()

// State
const uploading = ref(false)
const previewUrl = ref('')
const formData = ref({
  name: '',
  category: '',
  color: '',
  brand: '',
  image_url: ''
})

// Computed
const canSubmit = computed(() => {
  return formData.value.name && formData.value.category && formData.value.image_url
})

// Methods
const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const { file_url } = await api.integrations.Core.UploadFile({ file })
    formData.value.image_url = file_url
    previewUrl.value = file_url
  } catch (error) {
    console.error('Error uploading file:', error)
    alert('Failed to upload image')
  } finally {
    uploading.value = false
  }
}

const removeImage = () => {
  formData.value.image_url = ''
  previewUrl.value = ''
}

const handleSubmit = async () => {
  if (!canSubmit.value || uploading.value) return

  uploading.value = true
  try {
    await api.entities.ClothingItem.create(formData.value)
    emit('itemAdded')
    resetForm()
    emit('close')
  } catch (error) {
    console.error('Error creating item:', error)
    alert('Failed to add item')
  } finally {
    uploading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    category: '',
    color: '',
    brand: '',
    image_url: ''
  }
  previewUrl.value = ''
}

// Watch for dialog open/close to reset form
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})
</script>