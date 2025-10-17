<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="$emit('close')"
  >
    <div
      :class="`w-full max-w-md rounded-xl p-6 ${
        theme.value === 'dark' ? 'bg-zinc-900' : 'bg-white'
      }`"
      @click.stop
    >
      <h2 :class="`text-xl font-bold mb-4 ${
        theme.value === 'dark' ? 'text-white' : 'text-black'
      }`">
        Add New Item
      </h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label :class="`block text-sm font-medium mb-2 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Item Name
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              :class="`w-full px-3 py-2 rounded-lg border ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-white border-stone-300 text-black'
              }`"
              placeholder="Enter item name"
            />
          </div>
          
          <div>
            <label :class="`block text-sm font-medium mb-2 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Category
            </label>
            <select
              v-model="formData.category"
              required
              :class="`w-full px-3 py-2 rounded-lg border ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-white border-stone-300 text-black'
              }`"
            >
              <option value="">Select category</option>
              <option
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
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
              :class="`w-full px-3 py-2 rounded-lg border ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-white border-stone-300 text-black'
              }`"
              placeholder="Enter brand (optional)"
            />
          </div>
          
          <div>
            <label :class="`block text-sm font-medium mb-2 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Image
            </label>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              :class="`w-full px-3 py-2 rounded-lg border ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-white border-stone-300 text-black'
              }`"
            />
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button
            type="button"
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
            type="submit"
            :disabled="uploading"
            :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              theme.value === 'dark'
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-black text-white hover:bg-zinc-800'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`"
          >
            {{ uploading ? 'Adding...' : 'Add Item' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { api } from '@/api/client'

const { theme } = useTheme()

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'itemAdded'])

const formData = ref({
  name: '',
  category: '',
  brand: '',
  image_url: ''
})

const uploading = ref(false)
const fileInput = ref(null)

const categories = [
  'tops',
  'bottoms', 
  'shoes',
  'accessories',
  'outerwear'
]

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.image_url = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  if (!formData.value.name || !formData.value.category) return

  uploading.value = true
  try {
    // Get current user
    const user = await api.auth.me()
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    const itemData = {
      ...formData.value,
      owner_id: user.id,
      is_favorite: false
    }
    
    await api.entities.ClothingItem.create(itemData)
    
    // Reset form
    formData.value = {
      name: '',
      category: '',
      brand: '',
      image_url: ''
    }
    
    emit('itemAdded')
    emit('close')
  } catch (error) {
    console.error('Error uploading item:', error)
  } finally {
    uploading.value = false
  }
}
</script>
