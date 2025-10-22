<template>
  <div class="min-h-screen p-6 md:p-12">
    <div class="max-w-5xl mx-auto">
      <!-- Loading -->
      <div v-if="isLoading" class="py-16 text-center">
        <div class="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-black dark:border-zinc-600 dark:border-t-white"></div>
        <p :class="theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'">Loading profile...</p>
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="text-center py-12">
        <p class="text-red-500 mb-4">{{ errorMessage }}</p>
        <button
          @click="goBack"
          :class="`px-4 py-2 rounded-lg font-medium ${theme.value === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`">
          Go Back
        </button>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Header -->
        <div :class="`p-6 rounded-xl mb-6 ${theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'}`">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-4">
              <div :class="`w-16 h-16 rounded-full overflow-hidden ${theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'}`">
                <img v-if="friend?.avatar_url" :src="friend.avatar_url" :alt="friend?.name" class="w-full h-full object-cover" />
                <div v-else :class="`w-full h-full flex items-center justify-center ${theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'}`">
                  <span :class="`text-xl font-bold ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`">{{ initial }}</span>
                </div>
              </div>
              <div>
                <h1 :class="`text-2xl font-bold ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">{{ friend?.name || 'Friend' }}</h1>
                <p :class="`text-sm ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">@{{ friend?.username }}</p>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                @click="goCreateOutfitForFriend"
                :class="`px-4 py-2 rounded-lg font-medium ${theme.value === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-stone-900'}`">
                Create Outfit
              </button>
              <button
                @click="showUnfriend = true"
                class="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600">
                Unfriend
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div :class="`flex gap-2 mb-6 ${theme.value === 'dark' ? '' : ''}`">
          <button
            @click="activeTab = 'closet'"
            :class="`px-4 py-2 rounded-lg font-medium ${activeTab === 'closet' ? (theme.value === 'dark' ? 'bg-white text-black' : 'bg-black text-white') : (theme.value === 'dark' ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-stone-100 text-stone-700 hover:bg-stone-200')}`">
            Closet
          </button>
          <button
            @click="activeTab = 'outfits'"
            :class="`px-4 py-2 rounded-lg font-medium ${activeTab === 'outfits' ? (theme.value === 'dark' ? 'bg-white text-black' : 'bg-black text-white') : (theme.value === 'dark' ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-stone-100 text-stone-700 hover:bg-stone-200')}`">
            Outfits
          </button>
        </div>

        <!-- Closet Grid -->
        <div v-if="activeTab === 'closet'">
          <div v-if="publicItems.length === 0" class="text-center py-12">
            <p :class="theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'">No public items shared.</p>
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="item in publicItems" :key="item.id" :class="`rounded-xl overflow-hidden ${theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'}`">
              <div class="aspect-square bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                <img :src="item.image_url || item.thumbnail_url" :alt="item.name" class="w-full h-full object-cover" />
              </div>
              <div class="p-3">
                <p :class="`text-sm font-medium truncate ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">{{ item.name }}</p>
                <p :class="`text-xs ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">{{ item.category }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Outfits Grid -->
        <div v-else>
          <div v-if="publicOutfits.length === 0" class="text-center py-12">
            <p :class="theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'">No public outfits.</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="outfit in publicOutfits" :key="outfit.id" :class="`rounded-xl overflow-hidden ${theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'}`">
              <div class="aspect-video bg-stone-100 dark:bg-zinc-800"></div>
              <div class="p-4">
                <p :class="`text-sm font-medium ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">{{ outfit.outfit_name || 'Outfit' }}</p>
                <p :class="`text-xs ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">{{ new Date(outfit.created_at).toLocaleDateString() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Unfriend Modal -->
        <div v-if="showUnfriend" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showUnfriend = false">
          <div :class="`w-full max-w-md rounded-xl p-6 ${theme.value === 'dark' ? 'bg-zinc-900' : 'bg-white'}`" @click.stop>
            <h3 :class="`text-xl font-bold mb-2 ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">Unfriend {{ friend?.name }}?</h3>
            <p :class="`text-sm mb-4 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">This will remove them from your friends list.</p>
            <div class="flex gap-2 justify-end">
              <button @click="showUnfriend = false" :class="`px-4 py-2 rounded-lg ${theme.value === 'dark' ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`">Cancel</button>
              <button @click="confirmUnfriend" class="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600">Unfriend</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { UserService } from '@/services/userService'
import { ClothesService } from '@/services/clothesService'
import { OutfitsService } from '@/services/outfitsService'
import { FriendsService } from '@/services/friendsService'

const { theme } = useTheme()
const route = useRoute()
const router = useRouter()

const userService = new UserService()
const clothesService = new ClothesService()
const outfitsService = new OutfitsService()
const friendsService = new FriendsService()

const friendId = route.params.friendId

const isLoading = ref(true)
const errorMessage = ref('')
const friend = ref(null)
const publicItems = ref([])
const publicOutfits = ref([])
const activeTab = ref('closet')
const showUnfriend = ref(false)

const initial = computed(() => {
  const n = friend.value?.name || friend.value?.username || 'F'
  return n.charAt(0).toUpperCase()
})

onMounted(async () => {
  await loadProfile()
})

async function loadProfile() {
  try {
    isLoading.value = true
    errorMessage.value = ''

    // Friend basic info
    friend.value = await userService.getUserById(friendId)

    // Public clothes (privacy public)
    const itemsRes = await clothesService.getClothes({ owner_id: friendId, privacy: 'public', limit: 40 })
    publicItems.value = itemsRes?.data || []

    // Public outfits
    publicOutfits.value = await outfitsService.getPublicOutfits(friendId)
  } catch (e) {
    errorMessage.value = e?.message || 'Failed to load friend profile'
  } finally {
    isLoading.value = false
  }
}

function goBack() { router.back() }

function goCreateOutfitForFriend() {
  // Navigate to friend outfits creation route defined in main.js
  if (friend.value?.username) {
    router.push(`/outfits/add/friend/${friend.value.username}`)
  } else {
    router.push('/outfits')
  }
}

async function confirmUnfriend() {
  try {
    // friendsService.removeFriend expects the friend's user id
    await friendsService.removeFriend(friendId)
    showUnfriend.value = false
    router.push('/friends')
  } catch (e) {
    errorMessage.value = e?.message || 'Failed to unfriend'
  }
}
</script>


