<template>
  <div class="min-h-screen p-4 md:p-12 bg-background max-w-full overflow-x-hidden">
    <div class="max-w-5xl mx-auto">
      <!-- Loading -->
      <div v-if="isLoading" class="flex flex-col items-center py-16">
        <div class="spinner-modern mb-6"></div>
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
          <!-- Desktop Layout -->
          <div class="hidden md:flex items-center justify-between gap-4">
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

          <!-- Mobile Layout - Centered -->
          <div class="md:hidden flex flex-col items-center text-center space-y-4">
            <div :class="`w-20 h-20 rounded-full overflow-hidden ${theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'}`">
              <img v-if="friend?.avatar_url" :src="friend.avatar_url" :alt="friend?.name" class="w-full h-full object-cover" />
              <div v-else :class="`w-full h-full flex items-center justify-center ${theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'}`">
                <span :class="`text-2xl font-bold ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`">{{ initial }}</span>
              </div>
            </div>
            
            <div>
              <h1 :class="`text-2xl font-bold ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">{{ friend?.name || 'Friend' }}</h1>
              <p :class="`text-sm ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">@{{ friend?.username }}</p>
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
            <div 
              v-for="item in publicItems" 
              :key="item.id" 
              @click="openItemDetails(item)"
              :class="`rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 ${theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'}`">
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
            <div 
              v-for="outfit in publicOutfits" 
              :key="outfit.id" 
              @click="openOutfitDetails(outfit)"
              :class="`rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 ${theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'}`">
              <!-- Outfit Canvas -->
              <div class="aspect-video bg-stone-100 dark:bg-zinc-800 relative">
                <OutfitCanvasMiniature 
                  v-if="outfit.outfit_items && outfit.outfit_items.length > 0"
                  :items="outfit.outfit_items" 
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <span :class="`text-sm ${theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-400'}`">No items</span>
                </div>
              </div>
              <div class="p-4">
                <p :class="`text-sm font-medium ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">{{ outfit.outfit_name || 'Outfit' }}</p>
                <p :class="`text-xs ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">{{ new Date(outfit.created_at).toLocaleDateString() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Friend Item Details Modal -->
        <div v-if="showItemDetails" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="closeItemDetails">
          <div :class="`w-full max-w-md rounded-xl p-6 relative ${theme.value === 'dark' ? 'bg-zinc-900' : 'bg-white'}`" @click.stop>
            <!-- Close Button -->
            <button
              @click="closeItemDetails"
              :class="`absolute top-4 right-4 p-2 rounded-lg transition-all ${
                theme.value === 'dark'
                  ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                  : 'hover:bg-stone-100 text-stone-500 hover:text-black'
              }`"
            >
              <X class="w-5 h-5" />
            </button>

            <div class="pr-8">
              <h3 :class="`text-xl font-bold mb-4 ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">
                {{ selectedItem?.name || 'Item Details' }}
              </h3>
              
              <div class="space-y-3">
                <div v-if="selectedItem?.image_url">
                  <img :src="selectedItem.image_url" :alt="selectedItem.name" class="w-full h-48 object-cover rounded-lg" />
                </div>
                
                <div v-if="selectedItem?.category">
                  <p :class="`text-sm font-medium ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">Category</p>
                  <p :class="`text-base ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">{{ selectedItem.category }}</p>
                </div>

                <div v-if="selectedItem?.brand">
                  <p :class="`text-sm font-medium ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">Brand</p>
                  <p :class="`text-base ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">{{ selectedItem.brand }}</p>
                </div>

                <div v-if="selectedItem?.color">
                  <p :class="`text-sm font-medium ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">Color</p>
                  <p :class="`text-base ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">{{ selectedItem.color }}</p>
                </div>

                <div v-if="selectedItem?.size">
                  <p :class="`text-sm font-medium ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">Size</p>
                  <p :class="`text-base ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">{{ selectedItem.size }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Friend Outfit Details Modal -->
        <div v-if="showOutfitDetails" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="closeOutfitDetails">
          <div :class="`w-full max-w-2xl rounded-xl p-6 relative ${theme.value === 'dark' ? 'bg-zinc-900' : 'bg-white'}`" @click.stop>
            <!-- Close Button -->
            <button
              @click="closeOutfitDetails"
              :class="`absolute top-4 right-4 p-2 rounded-lg transition-all ${
                theme.value === 'dark'
                  ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                  : 'hover:bg-stone-100 text-stone-500 hover:text-black'
              }`"
            >
              <X class="w-5 h-5" />
            </button>

            <div class="pr-8">
              <h3 :class="`text-xl font-bold mb-4 ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">
                {{ selectedOutfit?.outfit_name || 'Outfit Details' }}
              </h3>
              
              <div class="space-y-4">
                <!-- Outfit Canvas -->
                <div class="aspect-video bg-stone-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                  <OutfitCanvasMiniature 
                    v-if="selectedOutfit?.outfit_items && selectedOutfit.outfit_items.length > 0"
                    :items="selectedOutfit.outfit_items" 
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <span :class="`text-sm ${theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-400'}`">No items</span>
                  </div>
                </div>

                <div v-if="selectedOutfit?.description">
                  <p :class="`text-sm font-medium ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">Description</p>
                  <p :class="`text-base ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">{{ selectedOutfit.description }}</p>
                </div>

                <div v-if="selectedOutfit?.occasion">
                  <p :class="`text-sm font-medium ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">Occasion</p>
                  <p :class="`text-base ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">{{ selectedOutfit.occasion }}</p>
                </div>

                <div v-if="selectedOutfit?.created_at">
                  <p :class="`text-sm font-medium ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">Created</p>
                  <p :class="`text-base ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">{{ new Date(selectedOutfit.created_at).toLocaleDateString() }}</p>
                </div>
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
import OutfitCanvasMiniature from '@/components/dashboard/OutfitCanvasMiniature.vue'
import { X } from 'lucide-vue-next'

const { theme } = useTheme()
const route = useRoute()
const router = useRouter()

const userService = new UserService()
const clothesService = new ClothesService()
const outfitsService = new OutfitsService()
const friendsService = new FriendsService()

const username = route.params.username

const isLoading = ref(true)
const errorMessage = ref('')
const friend = ref(null)
const publicItems = ref([])
const publicOutfits = ref([])
const activeTab = ref('closet')
const showUnfriend = ref(false)

// Modal states
const showItemDetails = ref(false)
const showOutfitDetails = ref(false)
const selectedItem = ref(null)
const selectedOutfit = ref(null)

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

    // Friend basic info - get by username
    friend.value = await userService.getUserByUsername(username)
    
    if (!friend.value) {
      errorMessage.value = 'User not found'
      return
    }

    // Friends clothes (privacy friends)
    const itemsRes = await clothesService.getFriendCloset(friend.value.id)
    publicItems.value = itemsRes?.data || []

    // Friends outfits
    publicOutfits.value = await outfitsService.getFriendsOutfits(friend.value.id)
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
    if (!friend.value?.id) {
      errorMessage.value = 'Cannot unfriend: user data not loaded'
      return
    }
    await friendsService.removeFriend(friend.value.id)
    showUnfriend.value = false
    router.push('/friends')
  } catch (e) {
    errorMessage.value = e?.message || 'Failed to unfriend'
  }
}

// Item details modal functions
function openItemDetails(item) {
  selectedItem.value = item
  showItemDetails.value = true
}

function closeItemDetails() {
  showItemDetails.value = false
  selectedItem.value = null
}

// Outfit details modal functions
function openOutfitDetails(outfit) {
  selectedOutfit.value = outfit
  showOutfitDetails.value = true
}

function closeOutfitDetails() {
  showOutfitDetails.value = false
  selectedOutfit.value = null
}
</script>


