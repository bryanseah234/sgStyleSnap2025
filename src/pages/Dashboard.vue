<template>
  <div class="min-h-screen p-6 md:p-12">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 :class="`text-4xl font-bold ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          Outfit Studio
        </h1>
        <button
          @click="generateOutfit"
          :disabled="generating"
          :class="`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
            theme.value === 'dark'
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-black text-white hover:bg-zinc-800'
          } ${generating ? 'opacity-50 cursor-not-allowed' : ''}`"
        >
          <div v-if="generating" class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <Wand2 v-else class="w-5 h-5" />
          {{ generating ? 'Generating...' : 'Generate Outfit' }}
        </button>
      </div>

      <!-- Weather & Occasion Selector -->
      <div :class="`rounded-xl p-6 mb-8 ${
        theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
      }`">
        <h2 :class="`text-xl font-semibold mb-4 ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          Outfit Preferences
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Occasion -->
          <div>
            <label :class="`block text-sm font-medium mb-2 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Occasion
            </label>
            <select
              v-model="outfitPreferences.occasion"
              :class="`w-full px-3 py-2 rounded-lg border ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-white border-stone-300 text-black'
              }`"
            >
              <option value="casual">Casual</option>
              <option value="work">Work</option>
              <option value="formal">Formal</option>
              <option value="party">Party</option>
              <option value="sport">Sport</option>
              <option value="date">Date</option>
            </select>
          </div>

          <!-- Weather -->
          <div>
            <label :class="`block text-sm font-medium mb-2 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Weather
            </label>
            <select
              v-model="outfitPreferences.weather"
              :class="`w-full px-3 py-2 rounded-lg border ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-white border-stone-300 text-black'
              }`"
            >
              <option value="sunny">Sunny</option>
              <option value="cloudy">Cloudy</option>
              <option value="rainy">Rainy</option>
              <option value="cold">Cold</option>
              <option value="hot">Hot</option>
            </select>
          </div>

          <!-- Temperature -->
          <div>
            <label :class="`block text-sm font-medium mb-2 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Temperature
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="outfitPreferences.temperature"
                type="range"
                min="0"
                max="40"
                :class="`flex-1 ${
                  theme.value === 'dark' ? 'accent-white' : 'accent-black'
                }`"
              />
              <span :class="`text-sm font-medium ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                {{ outfitPreferences.temperature }}°C
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Outfit Canvas -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Canvas Area -->
        <div class="lg:col-span-2">
          <div :class="`rounded-xl p-6 ${
            theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
          }`">
            <h2 :class="`text-xl font-semibold mb-4 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              Outfit Canvas
            </h2>
            
            <OutfitCanvas
              :items="currentOutfit"
              :selected-item-id="selectedItemId"
              @update:selected-item-id="selectedItemId = $event"
              @update-item="updateOutfitItem"
              @remove-item="removeOutfitItem"
            />
          </div>
        </div>

        <!-- Wardrobe Items -->
        <div>
          <div :class="`rounded-xl p-6 ${
            theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
          }`">
            <h2 :class="`text-xl font-semibold mb-4 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              Your Wardrobe
            </h2>
            
            <div class="space-y-4">
              <!-- Category Filter -->
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="category in categories"
                  :key="category"
                  @click="activeCategory = category"
                  :class="`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeCategory === category
                      ? theme.value === 'dark'
                        ? 'bg-white text-black'
                        : 'bg-black text-white'
                      : theme.value === 'dark'
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`"
                >
                  {{ category === 'all' ? 'All' : category }}
                </button>
              </div>

              <!-- Items Grid -->
              <div class="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                <div
                  v-for="item in filteredWardrobeItems"
                  :key="item.id"
                  @click="addToOutfit(item)"
                  :class="`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                    theme.value === 'dark'
                      ? 'bg-zinc-800 hover:bg-zinc-700'
                      : 'bg-stone-100 hover:bg-stone-200'
                  }`"
                >
                  <div class="aspect-square rounded-lg overflow-hidden mb-2">
                    <img
                      v-if="item.image_url"
                      :src="item.image_url"
                      :alt="item.name"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      :class="`w-full h-full flex items-center justify-center ${
                        theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
                      }`"
                    >
                      <Shirt :class="`w-6 h-6 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
                    </div>
                  </div>
                  <p :class="`text-xs font-medium truncate ${
                    theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
                  }`">
                    {{ item.name }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Generated Outfits History -->
      <div v-if="savedOutfits.length > 0" class="mt-8">
        <div :class="`rounded-xl p-6 ${
          theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
        }`">
          <h2 :class="`text-xl font-semibold mb-4 ${
            theme.value === 'dark' ? 'text-white' : 'text-black'
          }`">
            Saved Outfits
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="outfit in savedOutfits"
              :key="outfit.id"
              :class="`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 hover:bg-zinc-700'
                  : 'bg-stone-100 hover:bg-stone-200'
              }`"
              @click="loadOutfit(outfit)"
            >
              <div class="flex gap-2 mb-2">
                <div
                  v-for="item in outfit.outfit_items?.slice(0, 3)"
                  :key="item.id"
                  class="w-8 h-8 rounded overflow-hidden"
                >
                  <img
                    v-if="item.image_url"
                    :src="item.image_url"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p :class="`text-sm font-medium ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                {{ outfit.outfit_name || 'Untitled Outfit' }}
              </p>
              <p :class="`text-xs ${
                theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'
              }`">
                {{ formatDate(outfit.created_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { api } from '@/api/client'
import { formatDate } from '@/utils'
import { Palette, Wand2, Shirt } from 'lucide-vue-next'
import OutfitCanvas from '@/components/dashboard/OutfitCanvas.vue'

const { theme } = useTheme()
const generating = ref(false)
const selectedItemId = ref(null)
const activeCategory = ref('all')
const currentOutfit = ref([])
const wardrobeItems = ref([])
const savedOutfits = ref([])

const outfitPreferences = ref({
  occasion: 'casual',
  weather: 'sunny',
  temperature: 20
})

const categories = ['all', 'tops', 'bottoms', 'shoes', 'outerwear', 'accessories']

const filteredWardrobeItems = computed(() => {
  if (activeCategory.value === 'all') {
    return wardrobeItems.value
  }
  return wardrobeItems.value.filter(item => item.category === activeCategory.value)
})

const loadWardrobeItems = async () => {
  try {
    const user = await api.auth.me()
    if (user?.id) {
      const items = await api.entities.ClothingItem.filter(
        { owner_id: user.id },
        '-created_date'
      )
      wardrobeItems.value = items
    }
  } catch (error) {
    console.error('Error loading wardrobe items:', error)
  }
}

const loadSavedOutfits = async () => {
  try {
    const outfits = await api.entities.Outfit.list('-created_date', 10)
    savedOutfits.value = outfits
  } catch (error) {
    console.error('Error loading saved outfits:', error)
  }
}

const generateOutfit = async () => {
  generating.value = true
  try {
    const outfit = await api.outfits.generateOutfit(outfitPreferences.value)
    if (outfit?.items) {
      currentOutfit.value = outfit.items.map((item, index) => ({
        ...item,
        x: 50 + (index * 100),
        y: 50 + (index * 50),
        z_index: index
      }))
    }
  } catch (error) {
    console.error('Error generating outfit:', error)
  } finally {
    generating.value = false
  }
}

const addToOutfit = (item) => {
  const newItem = {
    ...item,
    x: 50 + (currentOutfit.value.length * 100),
    y: 50 + (currentOutfit.value.length * 50),
    z_index: currentOutfit.value.length
  }
  currentOutfit.value.push(newItem)
}

const updateOutfitItem = (itemId, updates) => {
  const index = currentOutfit.value.findIndex(item => item.id === itemId)
  if (index !== -1) {
    currentOutfit.value[index] = { ...currentOutfit.value[index], ...updates }
  }
}

const removeOutfitItem = (itemId) => {
  currentOutfit.value = currentOutfit.value.filter(item => item.id !== itemId)
}

const loadOutfit = (outfit) => {
  if (outfit.outfit_items) {
    currentOutfit.value = outfit.outfit_items.map((item, index) => ({
      ...item,
      x: 50 + (index * 100),
      y: 50 + (index * 50),
      z_index: index
    }))
  }
}

onMounted(async () => {
  await loadWardrobeItems()
  await loadSavedOutfits()
})
</script>