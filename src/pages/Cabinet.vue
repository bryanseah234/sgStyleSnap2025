<template>
  <div class="min-h-screen p-6 md:p-12">
    <!-- Header -->
    <div class="max-w-6xl mx-auto mb-8">
      <div class="flex items-center justify-between mb-6">
        <h1 :class="`text-4xl font-bold ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          Your Cabinet
        </h1>
        <button
          @click="showUpload = true"
          :class="`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
            theme.value === 'dark'
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-black text-white hover:bg-zinc-800'
          }`"
        >
          <Plus class="w-5 h-5" />
          Add Item
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6">
        <button
          v-for="category in categories"
          :key="category"
          @click="activeCategory = category"
          :class="`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeCategory === category
              ? theme.value === 'dark'
                ? 'bg-white text-black'
                : 'bg-black text-white'
              : theme.value === 'dark'
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`"
        >
          {{ category === 'all' ? 'All Items' : category }}
        </button>
        
        <button
          @click="showFavoritesOnly = !showFavoritesOnly"
          :class="`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            showFavoritesOnly
              ? theme.value === 'dark'
                ? 'bg-red-600 text-white'
                : 'bg-red-500 text-white'
              : theme.value === 'dark'
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`"
        >
          <Heart :class="`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`" />
          Favorites
        </button>
      </div>
    </div>

    <!-- Items Grid -->
    <div class="max-w-6xl mx-auto">
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="i in 8"
          :key="i"
          :class="`aspect-square rounded-xl animate-pulse ${
            theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-200'
          }`"
        />
      </div>

      <div v-else-if="filteredItems.length === 0" class="text-center py-12">
        <div :class="`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
          theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
        }`">
          <Shirt :class="`w-12 h-12 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
        </div>
        <h3 :class="`text-xl font-semibold mb-2 ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          No items found
        </h3>
        <p :class="`text-lg ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          Start building your wardrobe by adding your first item!
        </p>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          :class="`group cursor-pointer transition-all duration-300 hover:scale-105 ${
            theme.value === 'dark'
              ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
              : 'bg-white border border-stone-200 hover:border-stone-300'
          } rounded-xl overflow-hidden`"
        >
          <div class="aspect-square relative overflow-hidden">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div
              v-else
              :class="`w-full h-full flex items-center justify-center ${
                theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
              }`"
            >
              <Shirt :class="`w-12 h-12 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
            </div>
            
            <button
              @click="toggleFavorite(item)"
              :class="`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
                item.is_favorite
                  ? 'bg-red-500 text-white'
                  : theme.value === 'dark'
                  ? 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700/80'
                  : 'bg-white/80 text-stone-500 hover:bg-stone-100/80'
              }`"
            >
              <Heart :class="`w-4 h-4 ${item.is_favorite ? 'fill-current' : ''}`" />
            </button>
          </div>
          
          <div class="p-4">
            <h3 :class="`font-semibold mb-1 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              {{ item.name }}
            </h3>
            <p :class="`text-sm ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
            }`">
              {{ item.brand || 'No brand' }}
            </p>
            <span :class="`inline-block px-2 py-1 mt-2 text-xs rounded-full ${
              theme.value === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-700'
            }`">
              {{ item.category }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div
      v-if="showUpload"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="showUpload = false"
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
        
        <form @submit.prevent="handleUpload">
          <div class="space-y-4">
            <div>
              <label :class="`block text-sm font-medium mb-2 ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                Item Name
              </label>
              <input
                v-model="newItem.name"
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
                v-model="newItem.category"
                required
                :class="`w-full px-3 py-2 rounded-lg border ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-white'
                    : 'bg-white border-stone-300 text-black'
                }`"
              >
                <option value="">Select category</option>
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="outerwear">Outerwear</option>
                <option value="shoes">Shoes</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            
            <div>
              <label :class="`block text-sm font-medium mb-2 ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                Brand
              </label>
              <input
                v-model="newItem.brand"
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
              @click="showUpload = false"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { api } from '@/api/client'
import { Plus, Heart, Shirt } from 'lucide-vue-next'

const { theme } = useTheme()
const currentUser = ref(null)
const items = ref([])
const loading = ref(true)
const showUpload = ref(false)
const activeCategory = ref('all')
const showFavoritesOnly = ref(false)
const uploading = ref(false)
const fileInput = ref(null)

const newItem = ref({
  name: '',
  category: '',
  brand: '',
  image_url: ''
})

const categories = ['all', 'tops', 'bottoms', 'outerwear', 'shoes', 'accessories']

const filteredItems = computed(() => {
  let filtered = items.value

  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => item.category === activeCategory.value)
  }

  if (showFavoritesOnly.value) {
    filtered = filtered.filter(item => item.is_favorite)
  }

  return filtered
})

const loadUser = async () => {
  try {
    const userData = await api.auth.me()
    currentUser.value = userData
  } catch (error) {
    console.error('Error loading user:', error)
  }
}

const loadItems = async () => {
  try {
    if (currentUser.value?.id) {
      const itemsData = await api.entities.ClothingItem.filter(
        { owner_id: currentUser.value.id },
        '-created_date'
      )
      items.value = itemsData
    }
  } catch (error) {
    console.error('Error loading items:', error)
  } finally {
    loading.value = false
  }
}

const toggleFavorite = async (item) => {
  try {
    await api.entities.ClothingItem.update(item.id, {
      is_favorite: !item.is_favorite
    })
    item.is_favorite = !item.is_favorite
  } catch (error) {
    console.error('Error toggling favorite:', error)
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newItem.value.image_url = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleUpload = async () => {
  if (!newItem.value.name || !newItem.value.category) return

  uploading.value = true
  try {
    const itemData = {
      ...newItem.value,
      owner_id: currentUser.value.id
    }
    
    const newItemData = await api.entities.ClothingItem.create(itemData)
    items.value.unshift(newItemData)
    
    // Reset form
    newItem.value = {
      name: '',
      category: '',
      brand: '',
      image_url: ''
    }
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
    showUpload.value = false
  } catch (error) {
    console.error('Error uploading item:', error)
  } finally {
    uploading.value = false
  }
}

onMounted(async () => {
  await loadUser()
  await loadItems()
})
</script>
