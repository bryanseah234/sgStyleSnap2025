<template>
  <div class="min-h-screen p-6 md:p-12">
    <!-- Loading Bar Animation -->
    <div :class="`h-1 w-full mb-12 rounded-full ${
      theme.value === 'dark' 
        ? 'bg-gradient-to-r from-zinc-700 via-white to-zinc-700' 
        : 'bg-gradient-to-r from-stone-300 via-black to-stone-300'
    }`" />

    <!-- Hero Section -->
    <div class="max-w-6xl mx-auto mb-16">
      <h1 :class="`text-5xl md:text-7xl font-bold tracking-tight mb-4 ${
        theme.value === 'dark' ? 'text-white' : 'text-black'
      }`">
        Welcome back{{ user?.name ? `, ${user.name.split(' ')[0]}` : '' }}
      </h1>
      <p :class="`text-xl md:text-2xl ${
        theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
      } max-w-2xl`">
        Your digital wardrobe awaits. Create stunning outfits, discover new styles, and share your fashion journey.
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      <div
        v-for="(stat, index) in stats"
        :key="stat.label"
        :class="`p-8 rounded-3xl transition-all duration-300 group cursor-pointer hover:-translate-y-2 hover:scale-105 ${
          theme.value === 'dark'
            ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
            : 'bg-white border border-stone-200 hover:border-stone-300'
        }`"
      >
        <div class="flex items-center justify-between mb-4">
          <div :class="`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
            theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
          }`">
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
          <span :class="`text-4xl font-bold ${
            theme.value === 'dark' ? 'text-white' : 'text-black'
          }`">
            {{ stat.value }}
          </span>
        </div>
        <p :class="`text-lg font-medium ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          {{ stat.label }}
        </p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Cabinet Preview -->
      <router-link to="/cabinet">
        <div :class="`p-8 rounded-3xl transition-all duration-300 group cursor-pointer overflow-hidden relative h-64 hover:scale-105 ${
          theme.value === 'dark'
            ? 'bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700'
            : 'bg-gradient-to-br from-white to-stone-50 border border-stone-200'
        }`">
          <div :class="`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${
            theme.value === 'dark' 
              ? 'from-blue-500/10 to-purple-500/10' 
              : 'from-blue-500/5 to-purple-500/5'
          } opacity-0 group-hover:opacity-100`" />
          
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-6">
              <h3 :class="`text-2xl font-bold ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">
                Your Cabinet
              </h3>
              <ArrowRight :class="`w-6 h-6 transform transition-transform duration-300 group-hover:translate-x-2 ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`" />
            </div>
            <p :class="`text-lg mb-6 ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
            }`">
              Browse and organize your wardrobe
            </p>
            <div class="flex gap-4">
              <div
                v-for="(item, i) in items.slice(0, 3)"
                :key="item.id"
                :class="`w-16 h-16 rounded-xl overflow-hidden ${
                  theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
                }`"
              >
                <img
                  v-if="item.image_url"
                  :src="item.image_url"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Outfit Studio Preview -->
      <router-link to="/dashboard">
        <div :class="`p-8 rounded-3xl transition-all duration-300 group cursor-pointer overflow-hidden relative h-64 hover:scale-105 ${
          theme.value === 'dark'
            ? 'bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700'
            : 'bg-gradient-to-br from-white to-stone-50 border border-stone-200'
        }`">
          <div :class="`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${
            theme.value === 'dark' 
              ? 'from-pink-500/10 to-orange-500/10' 
              : 'from-pink-500/5 to-orange-500/5'
          } opacity-0 group-hover:opacity-100`" />
          
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-6">
              <h3 :class="`text-2xl font-bold ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">
                Outfit Studio
              </h3>
              <ArrowRight :class="`w-6 h-6 transform transition-transform duration-300 group-hover:translate-x-2 ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`" />
            </div>
            <p :class="`text-lg ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
            }`">
              Mix and match your items on the canvas
            </p>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { api } from '@/api/client'
import { Shirt, Palette, Users, ArrowRight } from 'lucide-vue-next'

const { theme } = useTheme()
const user = ref(null)
const items = ref([])
const outfits = ref([])

const stats = computed(() => [
  { label: 'Items', value: items.value.length, icon: Shirt },
  { label: 'Outfits', value: outfits.value.length, icon: Palette },
  { label: 'Friends', value: 0, icon: Users },
])

const loadUser = async () => {
  try {
    const userData = await api.auth.me()
    user.value = userData
  } catch (error) {
    console.error('Error loading user:', error)
  }
}

const loadItems = async () => {
  try {
    if (user.value?.id) {
      const itemsData = await api.entities.ClothingItem.filter(
        { owner_id: user.value.id },
        '-created_date',
        6
      )
      items.value = itemsData
    }
  } catch (error) {
    console.error('Error loading items:', error)
  }
}

const loadOutfits = async () => {
  try {
    const outfitsData = await api.entities.Outfit.list('-created_date', 3)
    outfits.value = outfitsData
  } catch (error) {
    console.error('Error loading outfits:', error)
  }
}

onMounted(async () => {
  await loadUser()
  await loadItems()
  await loadOutfits()
})
</script>
