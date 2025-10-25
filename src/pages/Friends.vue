<template>
  <div class="min-h-screen p-4 md:p-12 bg-background max-w-full overflow-x-hidden">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 class="text-4xl font-bold mb-2 text-foreground">
            Friends
          </h1>
          <p :class="`text-lg ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            Connect and get inspired by others
          </p>
        </div>
        
        <!-- Add Friend Button -->
        <button
          @click="showAddFriendModal = true"
          :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            theme.value === 'dark'
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-black text-white hover:bg-zinc-800'
          }`"
        >
          <UserPlus class="w-5 h-5" />
          Add Friend
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="mb-6">
        <!-- Mobile: Stack buttons vertically, Desktop: Horizontal -->
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            @click="activeTab = 'friends'"
            :class="`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base ${
              activeTab === 'friends'
                ? theme.value === 'dark'
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
                : theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`"
          >
            <Users class="w-4 h-4" />
            My Friends
            <span v-if="friends.length > 0" :class="`px-2 py-1 text-xs rounded-full ${
              activeTab === 'friends'
                ? 'bg-black text-white'
                : theme.value === 'dark'
                ? 'bg-zinc-600 text-zinc-200'
                : 'bg-stone-300 text-stone-800'
            }`">
              {{ friends.length }}
            </span>
          </button>
          <button
            @click="activeTab = 'requests'"
            :class="`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base ${
              activeTab === 'requests'
                ? theme.value === 'dark'
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
                : theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`"
          >
            <Bell class="w-4 h-4" />
            Friend Requests
            <span v-if="friendRequests.length > 0" :class="`px-2 py-1 text-xs rounded-full ${
              activeTab === 'requests'
                ? 'bg-black text-white'
                : theme.value === 'dark'
                ? 'bg-zinc-600 text-zinc-200'
                : 'bg-stone-300 text-stone-800'
            }`">
              {{ friendRequests.length }}
            </span>
          </button>
          <button
            @click="activeTab = 'sent'"
            :class="`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base ${
              activeTab === 'sent'
                ? theme.value === 'dark'
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
                : theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`"
          >
            <UserPlus class="w-4 h-4" />
            My Requests
            <span v-if="sentRequests.length > 0" :class="`px-2 py-1 text-xs rounded-full ${
              activeTab === 'sent'
                ? 'bg-black text-white'
                : theme.value === 'dark'
                ? 'bg-zinc-600 text-zinc-200'
                : 'bg-stone-300 text-stone-800'
            }`">
              {{ sentRequests.length }}
            </span>
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-8">
        <div class="relative">
          <Search :class="`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-400'
          }`" />
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search friends..."
            :class="`w-full pl-10 pr-4 py-3 rounded-lg border ${
              theme.value === 'dark'
                ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                : 'bg-stone-100 border-stone-300 text-black placeholder-stone-500'
            }`"
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex flex-col items-center py-16">
        <div class="spinner-modern mb-6"></div>
        <p :class="theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'">
          Loading your friends...
        </p>
      </div>

      <!-- Content Area -->
      <div v-else-if="activeTab === 'friends'">
        <!-- My Friends -->
        <TransitionGroup 
          v-if="filteredFriends.length > 0" 
          name="list" 
          tag="div" 
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div
            v-for="(friend, index) in filteredFriends"
            :key="friend.id"
            :class="`p-6 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer ${
              theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
            }`"
            :style="{ transitionDelay: `${index * 50}ms` }"
            @click="viewFriendProfile(friend.username)"
          >
            <!-- Mobile row layout; stacked on md+ -->
            <div class="flex items-center gap-4 md:block">
              <!-- Avatar -->
              <div :class="`w-12 h-12 md:w-16 md:h-16 md:mx-auto rounded-full overflow-hidden ${
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
                  <span :class="`text-lg md:text-xl font-bold ${
                    theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
                  }`">
                    {{ (friend.name || friend.username || 'F').charAt(0).toUpperCase() }}
                  </span>
                </div>
              </div>

              <!-- Friend Info -->
              <div class="text-left md:text-center md:mt-4">
                <h3 class="font-bold text-lg mb-0 md:mb-1 text-foreground">
                  {{ friend.name || 'Friend User' }}
                </h3>
                <p :class="`text-sm ${
                  theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
                }`">
                  @{{ friend.username || 'username' }}
                </p>
              </div>
            </div>
          </div>
        </TransitionGroup>
        
        <div v-else class="text-center py-12">
          <Users :class="`w-16 h-16 mx-auto mb-4 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
          <p :class="`text-lg ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
            {{ searchTerm ? 'No friends found matching your search.' : 'You don\'t have any friends yet.' }}
          </p>
          <p v-if="!searchTerm" :class="`text-sm mt-2 ${theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'}`">
            Click "Add Friend" to start connecting!
          </p>
        </div>
      </div>

      <!-- Friend Requests Tab -->
      <div v-else-if="activeTab === 'requests'">
        <TransitionGroup 
          v-if="friendRequests.length > 0" 
          name="list" 
          tag="div" 
          class="space-y-4"
        >
          <div
            v-for="(request, index) in friendRequests"
            :key="request.id"
            :class="`p-6 rounded-xl ${
              theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
            }`"
            :style="{ transitionDelay: `${index * 50}ms` }"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- Avatar -->
                <div :class="`w-12 h-12 md:w-12 md:h-12 rounded-full overflow-hidden ${
                  theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
                }`">
                  <img
                    v-if="request.requester.avatar_url"
                    :src="request.requester.avatar_url"
                    :alt="request.requester.name"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    :class="`w-full h-full flex items-center justify-center ${
                      theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
                    }`"
                  >
                    <span :class="`text-sm font-bold ${
                      theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
                    }`">
                      {{ (request.requester.name || 'U').charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                
                <!-- Request Info -->
                <div class="text-left">
                  <h3 class="font-medium text-foreground">
                    {{ request.requester.name }}
                  </h3>
                  <p :class="`text-sm ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
                    @{{ request.requester.username }}
                  </p>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex gap-2">
                <button
                  @click="acceptFriendRequest(request.id)"
                  class="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-all duration-200"
                >
                  Accept
                </button>
                <button
                  @click="declineFriendRequest(request.id)"
                  class="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>
        
        <div v-else class="text-center py-12">
          <Bell :class="`w-16 h-16 mx-auto mb-4 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
          <p :class="`text-lg ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
            No pending friend requests.
          </p>
        </div>
      </div>

      <!-- My Requests Tab -->
      <div v-else-if="activeTab === 'sent'">
        <TransitionGroup 
          v-if="sentRequests.length > 0" 
          name="list" 
          tag="div" 
          class="space-y-4"
        >
          <div
            v-for="(request, index) in sentRequests"
            :key="request.id"
            :class="`p-6 rounded-xl ${
              theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
            }`"
            :style="{ transitionDelay: `${index * 50}ms` }"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- Avatar -->
                <div :class="`w-12 h-12 md:w-12 md:h-12 rounded-full overflow-hidden ${
                  theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
                }`">
                  <img
                    v-if="request.receiver.avatar_url"
                    :src="request.receiver.avatar_url"
                    :alt="request.receiver.name"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    :class="`w-full h-full flex items-center justify-center ${
                      theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
                    }`"
                  >
                    <span :class="`text-sm font-bold ${
                      theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
                    }`">
                      {{ (request.receiver.name || 'U').charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                
                <!-- Request Info -->
                <div class="text-left">
                  <h3 :class="`font-medium ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">
                    {{ request.receiver.name }}
                  </h3>
                  <p :class="`text-sm ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
                    @{{ request.receiver.username }}
                  </p>
                  <p :class="`text-xs ${theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'}`">
                    Sent {{ formatDate(request.created_at) }}
                  </p>
                </div>
              </div>
              
              <!-- Action Button -->
              <div class="flex gap-2">
                <button
                  @click="cancelFriendRequest(request.id)"
                  class="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>
        
        <div v-else class="text-center py-12">
          <UserPlus :class="`w-16 h-16 mx-auto mb-4 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
          <p :class="`text-lg ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
            No sent friend requests.
          </p>
        </div>
      </div>

      <!-- Add Friend Modal -->
      <div
        v-if="showAddFriendModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click="showAddFriendModal = false"
      >
        <div
          :class="`w-full max-w-md rounded-xl p-6 ${
            theme.value === 'dark' ? 'bg-zinc-900' : 'bg-white'
          }`"
          @click.stop
        >
          <h3 :class="`text-xl font-bold mb-4 ${
            theme.value === 'dark' ? 'text-white' : 'text-black'
          }`">
            Add Friend
          </h3>
          
          <div class="space-y-4">
            <div>
              <label :class="`block text-sm font-medium mb-2 ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                Search by username
              </label>
              <input
                v-model="addFriendSearch"
                type="text"
                placeholder="Enter at least 3 characters (username only)"
                :class="`w-full px-3 py-2 rounded-lg border ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                    : 'bg-white border-stone-300 text-black placeholder-stone-500'
                }`"
                @keyup.enter="addFriendSearch.trim().length >= 3 && searchAndAddFriend()"
              />
            </div>
            
            <div v-if="addFriendResults.length > 0" class="space-y-2 max-h-40 overflow-y-auto">
              <div
                v-for="user in addFriendResults"
                :key="user.id"
                :class="`flex items-center justify-between p-3 rounded-lg ${
                  theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
                }`"
              >
                <div class="flex items-center gap-3">
                  <div :class="`w-8 h-8 rounded-full overflow-hidden ${
                    theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
                  }`">
                    <img
                      v-if="user.avatar_url"
                      :src="user.avatar_url"
                      :alt="user.name"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      :class="`w-full h-full flex items-center justify-center ${
                        theme.value === 'dark' ? 'bg-zinc-600' : 'bg-stone-300'
                      }`"
                    >
                      <span :class="`text-xs font-bold ${
                        theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
                      }`">
                        {{ (user.name || 'U').charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p :class="`font-medium text-sm ${theme.value === 'dark' ? 'text-white' : 'text-black'}`">
                      {{ user.name }}
                    </p>
                    <p :class="`text-xs ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
                      @{{ user.username }}
                    </p>
                  </div>
                </div>
                <button
                  @click="sendFriendRequest(user)"
                  :disabled="isRequestSent(user.id) || isFriend(user.id)"
                  :class="`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isRequestSent(user.id) || isFriend(user.id)
                      ? 'bg-zinc-600 text-zinc-300 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`"
                >
                  {{ isFriend(user.id) ? 'Friends' : isRequestSent(user.id) ? 'Pending' : 'Add' }}
                </button>
              </div>
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button
              @click="showAddFriendModal = false"
              :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`"
            >
              Cancel
            </button>
            <button
              @click="searchAndAddFriend"
              :disabled="addFriendSearch.trim().length < 3"
              :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                addFriendSearch.trim().length < 3
                  ? 'bg-zinc-600 text-zinc-300 cursor-not-allowed'
                  : theme.value === 'dark'
                    ? 'bg-white text-black hover:bg-zinc-200'
                    : 'bg-black text-white hover:bg-zinc-800'
              }`"
            >
              Search
            </button>
          </div>
        </div>
      </div>

  <!-- Toasts -->
  <div class="fixed top-4 right-4 z-[60] space-y-2">
    <transition-group name="toast-fade" tag="div">
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="`flex items-start gap-3 px-4 py-3 rounded-lg shadow-md text-sm ${
          t.type === 'success'
            ? (theme.value === 'dark' ? 'bg-green-600 text-white' : 'bg-green-500 text-white')
            : (theme.value === 'dark' ? 'bg-red-600 text-white' : 'bg-red-500 text-white')
        }`"
      >
        <component :is="t.type === 'success' ? CheckCircle : XCircle" class="w-5 h-5 mt-0.5" />
        <div class="flex-1">{{ t.message }}</div>
        <button class="opacity-80 hover:opacity-100" @click="dismissToast(t.id)">
          <X class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { FriendsService } from '@/services/friendsService'
import { UserService } from '@/services/userService'
import { Users, UserPlus, Bell, Search, CheckCircle, XCircle, X } from 'lucide-vue-next'

const router = useRouter()
const { theme } = useTheme()

// Initialize services
const friendsService = new FriendsService()
const userService = new UserService()

// State
const activeTab = ref('friends')
const searchTerm = ref('')
const friends = ref([])
const friendRequests = ref([])
const sentRequests = ref([])
const showAddFriendModal = ref(false)
const addFriendSearch = ref('')
const addFriendResults = ref([])
const isLoading = ref(true)

// Computed
const filteredFriends = computed(() => {
  if (!searchTerm.value) return friends.value
  
  const query = searchTerm.value.toLowerCase()
  return friends.value.filter(friend => 
    friend.name?.toLowerCase().includes(query) ||
    friend.username?.toLowerCase().includes(query)
  )
})

// Methods
const loadFriendsData = async () => {
  isLoading.value = true
  try {
    console.log('🔧 Friends: Loading friends data...')
    
    // Load friends using FriendsService
    const friendsData = await friendsService.getFriends()
    friends.value = friendsData || []
    
    // Load friend requests (incoming)
    const requestsData = await friendsService.getFriendRequests()
    friendRequests.value = requestsData || []
    
    // Load sent requests
    const sentData = await friendsService.getSentRequests()
    sentRequests.value = sentData || []
    
    console.log('✅ Friends: Loaded friends:', friends.value.length)
    console.log('✅ Friends: Loaded requests:', friendRequests.value.length)
    console.log('✅ Friends: Loaded sent requests:', sentRequests.value.length)
  } catch (error) {
    console.error('❌ Friends: Error loading friends data:', error)
    friends.value = []
    friendRequests.value = []
    sentRequests.value = []
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  // Search is handled by computed property
}

const searchAndAddFriend = async () => {
  const raw = addFriendSearch.value.trim()
  if (!raw || raw.length < 3) return

  // Only allow username searches; strip leading '@' if present
  const usernameQuery = raw.startsWith('@') ? raw.slice(1) : raw

  console.log('🔧 Friends: Searching for users by username:', usernameQuery)
  
  try {
    const result = await userService.searchUsersByUsername(usernameQuery)
    console.log('✅ Friends: Search result:', result)
    
    // Get current user ID to filter out from results
    const currentUser = await userService.getCurrentUser()
    const currentUserId = currentUser?.id
    
    // Filter out the current user from search results
    const filteredResults = (result || []).filter(user => user.id !== currentUserId)
    
    if (filteredResults.length < result?.length) {
      console.log('🔧 Friends: Filtered out current user from search results')
    }
    
    addFriendResults.value = filteredResults
  } catch (error) {
    console.error('❌ Friends: Error searching users:', error)
    addFriendResults.value = []
  }
}

const toasts = ref([])

const showToast = (message, type = 'success') => {
  const id = `${Date.now()}-${Math.random()}`
  // Keep only the last 2 so adding this makes max 3
  if (toasts.value.length >= 3) {
    toasts.value = toasts.value.slice(-2)
  }
  toasts.value.push({ id, message, type })
  setTimeout(() => dismissToast(id), 4000)
}

const dismissToast = (id) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

const sendFriendRequest = async (user) => {
  try {
    // Optimistic: add to sentRequests immediately
    const tempId = `temp-${Date.now()}`
    const optimistic = {
      id: tempId,
      receiver: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url
      },
      status: 'pending',
      created_at: new Date().toISOString()
    }
    sentRequests.value = [optimistic, ...sentRequests.value]

    const result = await friendsService.sendFriendRequest(user.id)
    if (result && result.id) {
      sentRequests.value = sentRequests.value.map(r => r.id === tempId ? { ...r, id: result.id } : r)
    }
    showToast('Friend request sent', 'success')
  } catch (error) {
    // Rollback
    sentRequests.value = sentRequests.value.filter(r => !String(r.id).startsWith('temp-'))
    showToast(error.message || 'Failed to send friend request', 'error')
  }
}

const acceptFriendRequest = async (requestId) => {
  try {
    // Optimistic: remove from incoming list immediately
    const prev = [...friendRequests.value]
    friendRequests.value = friendRequests.value.filter(r => r.id !== requestId)
    const res = await friendsService.acceptFriendRequest(requestId)
    if (!res || !res.success) throw new Error('Failed to accept request')
    showToast('Friend request accepted', 'success')
  } catch (error) {
    // Reload data on failure
    await loadFriendsData()
    showToast(error.message || 'Failed to accept friend request', 'error')
  }
}

const cancelFriendRequest = async (requestId) => {
  try {
    // Optimistic: remove from sent list immediately
    const prev = [...sentRequests.value]
    sentRequests.value = sentRequests.value.filter(req => req.id !== requestId)
    await friendsService.cancelFriendRequest(requestId)
    showToast('Friend request cancelled', 'success')
  } catch (error) {
    await loadFriendsData()
    showToast(error.message || 'Failed to cancel friend request', 'error')
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

const viewFriendProfile = (friendUsername) => {
  router.push(`/friend/${friendUsername}/profile`)
}

const isRequestSent = (userId) => {
  return sentRequests.value.some(req => req.receiver.id === userId)
}

const isFriend = (userId) => {
  return friends.value.some(friend => friend.id === userId)
}

// Lifecycle
onMounted(() => {
  loadFriendsData()
  
  // Add test function to window for debugging
  window.testFriendSearch = async (query) => {
    console.log('🔧 Friends: Testing friend search with query:', query)
    try {
      const result = await friendsService.searchUsers(query)
      console.log('✅ Friends: Test search result:', result)
      return result
    } catch (error) {
      console.error('❌ Friends: Test search error:', error)
      return null
    }
  }
})

// Removed auto-search on keypress; search happens on explicit action only
</script>