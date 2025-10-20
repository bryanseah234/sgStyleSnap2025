<!--
  StyleSnap - Home Page Component
  
  The main dashboard page that displays user statistics, recent items,
  and quick access to key features. Provides an overview of the user's
  wardrobe and activity.
  
  Features:
  - Personalized welcome message
  - Statistics cards (items, outfits, friends)
  - Recent items preview
  - Quick action cards
  - Responsive design
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <div class="min-h-screen p-6 md:p-12">
    <!-- Debug info -->
    <div v-if="!user" class="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
      <p class="text-yellow-800">Debug: No user data available</p>
      <p class="text-sm">Auth: {{ authStore.isAuthenticated }}, User: {{ !!authStore.user }}, Profile: {{ !!authStore.profile }}</p>
    </div>
    
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
      <router-link
        v-for="(stat, index) in stats"
        :key="stat.label"
        :to="stat.route"
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
      </router-link>
    </div>

  </div>
</template>

<script setup>
/**
 * Home Page Component Script
 * 
 * Manages the home dashboard with user statistics, recent items,
 * and quick access to key features. Loads and displays user data
 * including wardrobe items, outfits, and friends.
 */

import { ref, onMounted, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/api/base44Client'
import { ClothesService } from '@/services/clothesService'
import { OutfitsService } from '@/services/outfitsService'
import { FriendsService } from '@/services/friendsService'
import { Shirt, Palette, Users } from 'lucide-vue-next'

// Theme and auth composables
const { theme } = useTheme()
const authStore = useAuthStore()

// Service instances
const clothesService = new ClothesService()
const outfitsService = new OutfitsService()
const friendsService = new FriendsService()

// Use computed to get reactive user data from auth store
const user = computed(() => {
  const userData = authStore.user || authStore.profile
  console.log('🏠 Home: User computed property accessed:', {
    authStoreUser: authStore.user,
    authStoreProfile: authStore.profile,
    computedUser: userData
  })
  return userData
})

// Reactive data for content
const items = ref([])
const outfits = ref([])
const friends = ref([])

/**
 * Computed statistics for the dashboard cards
 * 
 * Calculates and returns statistics for items, outfits, and friends
 * to display in the dashboard cards.
 * 
 * @returns {Array<Object>} Array of stat objects with label, value, icon, and route
 */
const stats = computed(() => [
  { label: 'Items', value: items.value.length, icon: Shirt, route: '/closet' },
  { label: 'Outfits', value: outfits.value.length, icon: Palette, route: '/outfits' },
  { label: 'Friends', value: friends.value.length, icon: Users, route: '/friends' },
])

/**
 * Loads user's clothing items
 * 
 * Fetches the user's clothing items from the API, limited to
 * the 6 most recent items for the dashboard preview.
 */
const loadItems = async () => {
  try {
    console.log('🏠 Home: Loading items...')
    if (user.value?.id) {
      const result = await clothesService.getClothes({
        owner_id: user.value.id,
        limit: 6
      })
      
      if (result.success) {
        items.value = result.data || []
        console.log('🏠 Home: Items loaded successfully:', items.value.length, 'items')
      } else {
        console.error('🏠 Home: Failed to load items:', result.error)
        items.value = []
      }
    } else {
      console.log('🏠 Home: No user ID, setting items to empty array')
      items.value = []
    }
  } catch (error) {
    console.error('❌ Home: Error loading items:', error)
    items.value = []
  }
}

/**
 * Loads user's outfits
 * 
 * Fetches the user's outfits from the API, limited to
 * the 3 most recent outfits for the dashboard preview.
 */
const loadOutfits = async () => {
  try {
    console.log('🏠 Home: Loading outfits...')
    if (user.value?.id) {
      const outfitsData = await outfitsService.getOutfits({
        limit: 3
      })
      
      outfits.value = outfitsData || []
      console.log('🏠 Home: Outfits loaded successfully:', outfits.value.length, 'outfits')
    } else {
      console.log('🏠 Home: No user ID, setting outfits to empty array')
      outfits.value = []
    }
  } catch (error) {
    console.error('❌ Home: Error loading outfits:', error)
    outfits.value = []
  }
}

/**
 * Loads user's friends
 * 
 * Fetches the user's friends list from the API to display
 * the friends count in the statistics.
 */
const loadFriends = async () => {
  try {
    console.log('🏠 Home: Loading friends...')
    if (user.value?.id) {
      const friendsData = await friendsService.getFriends()
      
      friends.value = friendsData || []
      console.log('🏠 Home: Friends loaded successfully:', friends.value.length, 'friends')
    } else {
      console.log('🏠 Home: No user ID, setting friends to empty array')
      friends.value = []
    }
  } catch (error) {
    console.error('❌ Home: Error loading friends:', error)
    friends.value = []
  }
}

/**
 * Component mounted lifecycle hook
 * 
 * Loads all necessary data when the component is mounted:
 * - User profile data
 * - Recent clothing items
 * - Recent outfits
 * - Friends list
 */
onMounted(async () => {
  console.log('🏠 Home: Component mounted, starting data loading...')
  console.log('🏠 Home: Auth state:', {
    isAuthenticated: authStore.isAuthenticated,
    hasUser: !!authStore.user,
    hasProfile: !!authStore.profile,
    loading: authStore.loading
  })
  
  try {
    // Ensure auth store is initialized
    if (!authStore.isAuthenticated) {
      console.log('🏠 Home: Auth not initialized, calling initializeAuth...')
      await authStore.initializeAuth()
    }
    
    // If we have a user but no profile, fetch the profile
    if (authStore.user && !authStore.profile) {
      console.log('🏠 Home: User found but no profile, fetching profile...')
      await authStore.fetchUserProfile()
    }
    
    console.log('🏠 Home: Loading items...')
    await loadItems()
    console.log('🏠 Home: Loading outfits...')
    await loadOutfits()
    console.log('🏠 Home: Loading friends...')
    await loadFriends()
    console.log('🏠 Home: All data loaded successfully')
  } catch (error) {
    console.error('❌ Home: Error loading data:', error)
  }
})
</script>
