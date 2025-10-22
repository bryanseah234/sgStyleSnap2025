<template>
  <div :class="`min-h-screen p-6 md:p-12 ${
    theme.value === 'dark' ? 'bg-black' : 'bg-white'
  }`">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <button
            @click="$router.back()"
            :class="`p-2 rounded-lg transition-all duration-200 ${
              theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div>
            <h1 class="text-4xl font-bold text-foreground">
              {{ friend?.name || 'Friend' }}'s Closet
            </h1>
            <p :class="`text-lg ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
            }`">
              Browse their wardrobe and get style inspiration
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button
            @click="toggleView"
            :class="`p-2 rounded-lg transition-all duration-200 ${
              theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`"
          >
            <component :is="viewMode === 'grid' ? List : Grid" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Friend Info -->
      <div v-if="friend" :class="`rounded-xl p-6 mb-8 ${
        theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
      }`">
        <div class="flex items-center gap-6">
          <div :class="`w-20 h-20 rounded-full overflow-hidden ${
            theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
          }`">
            <img
              v-if="friend.avatar_url"
              :src="friend.avatar_url"
              :alt="friend.name"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              :class="`w-full h-full flex items-center justify-center ${
                theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
              }`"
            >
              <User :class="`w-10 h-10 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
            </div>
          </div>
          <div class="flex-1">
            <h2 :class="`text-2xl font-bold ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              {{ friend.name }}
            </h2>
            <p :class="`text-lg ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
            }`">
              @{{ friend.username }}
            </p>
            <div class="flex gap-6 mt-2">
              <div class="text-center">
                <p :class="`text-2xl font-bold ${
                  theme.value === 'dark' ? 'text-white' : 'text-black'
                }`">
                  {{ friend.outfit_count || 0 }}
                </p>
                <p :class="`text-sm ${
                  theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
                }`">
                  Outfits
                </p>
              </div>
              <div class="text-center">
                <p :class="`text-2xl font-bold ${
                  theme.value === 'dark' ? 'text-white' : 'text-black'
                }`">
                  {{ friend.item_count || 0 }}
                </p>
                <p :class="`text-sm ${
                  theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
                }`">
                  Items
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div :class="`rounded-xl p-6 mb-8 ${
        theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
      }`">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search items..."
              :class="`w-full px-4 py-3 rounded-lg border ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                  : 'bg-white border-stone-300 text-black placeholder-stone-500'
              }`"
            />
          </div>
          <div class="flex gap-2">
            <button
              v-for="category in categories"
              :key="category"
              @click="activeCategory = category"
              :class="`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
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
        </div>
      </div>

      <!-- Items Grid/List -->
      <div v-if="loading" class="text-center py-12">
        <div :class="`w-12 h-12 mx-auto mb-4 border-2 border-current border-t-transparent rounded-full animate-spin ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`" />
        <p :class="`text-lg ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          Loading items...
        </p>
      </div>

      <div v-else-if="filteredItems.length === 0" class="text-center py-12">
        <div :class="`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
          theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
        }`">
          <Shirt :class="`w-12 h-12 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
        </div>
        <h2 :class="`text-2xl font-semibold mb-2 ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          No items found
        </h2>
        <p :class="`text-lg ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          {{ searchQuery ? 'Try adjusting your search' : 'This friend hasn\'t added any items yet' }}
        </p>
      </div>

      <div v-else :class="viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          :class="`group relative transition-all duration-300 cursor-pointer hover:-translate-y-2 ${
            viewMode === 'grid'
              ? 'aspect-square rounded-3xl overflow-hidden'
              : 'flex items-center gap-4 p-4 rounded-xl'
          } ${
            theme.value === 'dark'
              ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
              : 'bg-white border border-stone-200 hover:border-stone-300'
          }`"
        >
          <!-- Image -->
          <div :class="viewMode === 'grid' ? 'w-full h-full p-4 flex items-center justify-center' : 'w-20 h-20 rounded-lg overflow-hidden flex-shrink-0'">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name"
              :class="viewMode === 'grid' ? 'max-w-full max-h-full object-contain' : 'w-full h-full object-cover'"
            />
            <div
              v-else
              :class="`w-full h-full flex items-center justify-center ${
                theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
              }`"
            >
              <Shirt :class="`${viewMode === 'grid' ? 'w-12 h-12' : 'w-6 h-6'} ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
            </div>
          </div>

          <!-- Overlay (Grid view only) -->
          <div v-if="viewMode === 'grid'" :class="`absolute inset-0 transition-all duration-300 flex flex-col justify-end p-4 ${
            theme.value === 'dark' ? 'bg-black' : 'bg-white'
          } bg-opacity-0 group-hover:bg-opacity-90`">
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 :class="`font-semibold text-lg mb-1 ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">
                {{ item.name }}
              </h3>
              <p :class="`text-sm mb-3 ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`">
                {{ item.category }}
                {{ item.brand ? ` • ${item.brand}` : '' }}
              </p>
            </div>
          </div>

          <!-- List view content -->
          <div v-if="viewMode === 'list'" class="flex-1">
            <h3 :class="`font-semibold text-lg ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              {{ item.name }}
            </h3>
            <p :class="`text-sm ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
            }`">
              {{ item.category }}
              {{ item.brand ? ` • ${item.brand}` : '' }}
            </p>
            <p :class="`text-xs mt-1 ${
              theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'
            }`">
              Added {{ formatDate(item.created_at) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { api } from '@/api/client'
import { formatDate } from '@/utils'
import { ArrowLeft, User, Shirt, Grid, List } from 'lucide-vue-next'

const route = useRoute()
const { theme } = useTheme()
const friend = ref(null)
const items = ref([])
const loading = ref(true)
const searchQuery = ref('')
const activeCategory = ref('all')
const viewMode = ref('grid')

const categories = ['all', 'tops', 'bottoms', 'shoes', 'outerwear', 'accessories']

const filteredItems = computed(() => {
  let filtered = items.value

  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => item.category === activeCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.brand?.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    )
  }

  return filtered
})

const loadFriend = async () => {
  try {
    const friendId = route.query.friendId
    if (!friendId) {
      console.error('No friend ID provided')
      return
    }

    const friendData = await api.entities.User.get(friendId)
    friend.value = friendData
  } catch (error) {
    console.error('Error loading friend:', error)
  }
}

const loadFriendItems = async () => {
  try {
    const friendId = route.query.friendId
    if (!friendId) return

    const itemsData = await api.entities.ClothingItem.filter(
      { owner_id: friendId },
      '-created_at'
    )
    items.value = itemsData
  } catch (error) {
    console.error('Error loading friend items:', error)
  } finally {
    loading.value = false
  }
}

const toggleView = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

onMounted(async () => {
  await loadFriend()
  await loadFriendItems()
})
</script>