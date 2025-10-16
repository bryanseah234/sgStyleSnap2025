<template>
  <div class="min-h-screen p-6 md:p-12">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <h1 :class="`text-4xl font-bold mb-8 ${
        theme.value === 'dark' ? 'text-white' : 'text-black'
      }`">
        Profile
      </h1>
      
      <div v-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Info -->
        <div class="lg:col-span-1">
          <div :class="`rounded-xl p-6 ${
            theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
          }`">
            <!-- Avatar -->
            <div class="text-center mb-6">
              <div :class="`w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 ${
                theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
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
                    theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
                  }`"
                >
                  <User :class="`w-12 h-12 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
                </div>
              </div>
              <h2 :class="`text-2xl font-semibold ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">
                {{ user.name || 'User' }}
              </h2>
              <p :class="`text-lg ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`">
                @{{ user.username }}
              </p>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="text-center">
                <p :class="`text-2xl font-bold ${
                  theme.value === 'dark' ? 'text-white' : 'text-black'
                }`">
                  {{ stats.total_items || 0 }}
                </p>
                <p :class="`text-sm ${
                  theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
                }`">
                  Items
                </p>
              </div>
              <div class="text-center">
                <p :class="`text-2xl font-bold ${
                  theme.value === 'dark' ? 'text-white' : 'text-black'
                }`">
                  {{ stats.total_outfits || 0 }}
                </p>
                <p :class="`text-sm ${
                  theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
                }`">
                  Outfits
                </p>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="space-y-2">
              <button
                @click="showAvatarModal = true"
                :class="`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`"
              >
                Change Avatar
              </button>
              <button
                @click="showThemeModal = true"
                :class="`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`"
              >
                Change Theme
              </button>
            </div>
          </div>
        </div>

        <!-- Profile Settings -->
        <div class="lg:col-span-2">
          <div :class="`rounded-xl p-6 ${
            theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
          }`">
            <h3 :class="`text-xl font-semibold mb-6 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              Profile Settings
            </h3>
            
            <form @submit.prevent="saveProfile" class="space-y-6">
              <!-- Basic Info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label :class="`block text-sm font-medium mb-2 ${
                    theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
                  }`">
                    Full Name
                  </label>
                  <input
                    v-model="user.name"
                    type="text"
                    :class="`w-full px-3 py-2 rounded-lg border ${
                      theme.value === 'dark'
                        ? 'bg-zinc-800 border-zinc-700 text-white'
                        : 'bg-white border-stone-300 text-black'
                    }`"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label :class="`block text-sm font-medium mb-2 ${
                    theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
                  }`">
                    Username
                  </label>
                  <input
                    v-model="user.username"
                    type="text"
                    :class="`w-full px-3 py-2 rounded-lg border ${
                      theme.value === 'dark'
                        ? 'bg-zinc-800 border-zinc-700 text-white'
                        : 'bg-white border-stone-300 text-black'
                    }`"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <!-- Bio -->
              <div>
                <label :class="`block text-sm font-medium mb-2 ${
                  theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
                }`">
                  Bio
                </label>
                <textarea
                  v-model="user.bio"
                  :class="`w-full px-3 py-2 rounded-lg border ${
                    theme.value === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-white'
                      : 'bg-white border-stone-300 text-black'
                  }`"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <!-- Location and Gender -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label :class="`block text-sm font-medium mb-2 ${
                    theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
                  }`">
                    Location
                  </label>
                  <input
                    v-model="user.location"
                    type="text"
                    :class="`w-full px-3 py-2 rounded-lg border ${
                      theme.value === 'dark'
                        ? 'bg-zinc-800 border-zinc-700 text-white'
                        : 'bg-white border-stone-300 text-black'
                    }`"
                    placeholder="Enter your location"
                  />
                </div>
                
                <div>
                  <label :class="`block text-sm font-medium mb-2 ${
                    theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
                  }`">
                    Gender
                  </label>
                  <select
                    v-model="user.gender"
                    :class="`w-full px-3 py-2 rounded-lg border ${
                      theme.value === 'dark'
                        ? 'bg-zinc-800 border-zinc-700 text-white'
                        : 'bg-white border-stone-300 text-black'
                    }`"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <!-- Save Button -->
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="saving"
                  :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    theme.value === 'dark'
                      ? 'bg-white text-black hover:bg-zinc-200'
                      : 'bg-black text-white hover:bg-zinc-800'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`"
                >
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Style Preferences -->
          <div :class="`rounded-xl p-6 mt-6 ${
            theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
          }`">
            <h3 :class="`text-xl font-semibold mb-6 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              Style Preferences
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Favorite Colors -->
              <div>
                <label :class="`block text-sm font-medium mb-2 ${
                  theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
                }`">
                  Favorite Colors
                </label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="color in availableColors"
                    :key="color.id"
                    @click="toggleFavoriteColor(color.id)"
                    :class="`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      user.favorite_colors?.includes(color.id)
                        ? 'bg-blue-500 text-white'
                        : theme.value === 'dark'
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`"
                    :style="{ backgroundColor: user.favorite_colors?.includes(color.id) ? color.hex_code : undefined }"
                  >
                    {{ color.name }}
                  </button>
                </div>
              </div>

              <!-- Favorite Styles -->
              <div>
                <label :class="`block text-sm font-medium mb-2 ${
                  theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
                }`">
                  Favorite Styles
                </label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="style in availableStyles"
                    :key="style.id"
                    @click="toggleFavoriteStyle(style.id)"
                    :class="`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      user.favorite_styles?.includes(style.id)
                        ? theme.value === 'dark'
                          ? 'bg-white text-black'
                          : 'bg-black text-white'
                        : theme.value === 'dark'
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`"
                  >
                    {{ style.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Avatar Selection Modal -->
      <div
        v-if="showAvatarModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click="showAvatarModal = false"
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
            Choose Avatar
          </h3>
          
          <div class="grid grid-cols-3 gap-4 mb-6">
            <button
              v-for="i in 6"
              :key="i"
              @click="selectAvatar(i)"
              :class="`w-16 h-16 rounded-full overflow-hidden transition-all duration-200 hover:scale-110 ${
                user.avatar_url === `/avatars/default-${i}.png`
                  ? 'ring-2 ring-blue-500'
                  : theme.value === 'dark'
                  ? 'bg-zinc-800'
                  : 'bg-stone-100'
              }`"
            >
              <img
                :src="`/avatars/default-${i}.png`"
                :alt="`Avatar ${i}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
          
          <div class="flex gap-3">
            <button
              @click="showAvatarModal = false"
              :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`"
            >
              Cancel
            </button>
            <button
              @click="saveAvatar"
              :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                theme.value === 'dark'
                  ? 'bg-white text-black hover:bg-zinc-200'
                  : 'bg-black text-white hover:bg-zinc-800'
              }`"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <!-- Theme Selection Modal -->
      <div
        v-if="showThemeModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click="showThemeModal = false"
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
            Choose Theme
          </h3>
          
          <div class="space-y-3">
            <button
              @click="selectTheme('light')"
              :class="`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                theme.value === 'light'
                  ? 'bg-blue-500 text-white'
                  : theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`"
            >
              <div class="flex items-center gap-3">
                <Sun class="w-5 h-5" />
                <div>
                  <p class="font-medium">Light Theme</p>
                  <p class="text-sm opacity-75">Clean and bright interface</p>
                </div>
              </div>
            </button>
            
            <button
              @click="selectTheme('dark')"
              :class="`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                theme.value === 'dark'
                  ? 'bg-blue-500 text-white'
                  : theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`"
            >
              <div class="flex items-center gap-3">
                <Moon class="w-5 h-5" />
                <div>
                  <p class="font-medium">Dark Theme</p>
                  <p class="text-sm opacity-75">Easy on the eyes</p>
                </div>
              </div>
            </button>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button
              @click="showThemeModal = false"
              :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`"
            >
              Cancel
            </button>
            <button
              @click="saveTheme"
              :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                theme.value === 'dark'
                  ? 'bg-white text-black hover:bg-zinc-200'
                  : 'bg-black text-white hover:bg-zinc-800'
              }`"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { api } from '@/api/client'
import { User, Sun, Moon } from 'lucide-vue-next'

const { theme, toggleTheme, setTheme } = useTheme()
const user = ref(null)
const stats = ref({})
const saving = ref(false)
const showAvatarModal = ref(false)
const showThemeModal = ref(false)
const availableColors = ref([])
const availableStyles = ref([])

const loadUser = async () => {
  try {
    const userData = await api.auth.me()
    user.value = userData
  } catch (error) {
    console.error('Error loading user:', error)
  }
}

const loadStats = async () => {
  try {
    const [wardrobeStats, outfitStats] = await Promise.all([
      api.analytics.getWardrobeStats(),
      api.analytics.getOutfitStats()
    ])
    stats.value = {
      total_items: wardrobeStats?.total_items || 0,
      total_outfits: outfitStats?.total_outfits || 0
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const loadReferenceData = async () => {
  try {
    const [colors, styles] = await Promise.all([
      api.catalog.getColors(),
      api.catalog.getStyles()
    ])
    availableColors.value = colors || []
    availableStyles.value = styles || []
  } catch (error) {
    console.error('Error loading reference data:', error)
  }
}

const saveProfile = async () => {
  saving.value = true
  try {
    await api.auth.updateMe({
      name: user.value.name,
      username: user.value.username,
      bio: user.value.bio,
      location: user.value.location,
      gender: user.value.gender,
      favorite_colors: user.value.favorite_colors,
      favorite_styles: user.value.favorite_styles
    })
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    saving.value = false
  }
}

const toggleFavoriteColor = (colorId) => {
  if (!user.value.favorite_colors) {
    user.value.favorite_colors = []
  }
  
  const index = user.value.favorite_colors.indexOf(colorId)
  if (index > -1) {
    user.value.favorite_colors.splice(index, 1)
  } else {
    user.value.favorite_colors.push(colorId)
  }
}

const toggleFavoriteStyle = (styleId) => {
  if (!user.value.favorite_styles) {
    user.value.favorite_styles = []
  }
  
  const index = user.value.favorite_styles.indexOf(styleId)
  if (index > -1) {
    user.value.favorite_styles.splice(index, 1)
  } else {
    user.value.favorite_styles.push(styleId)
  }
}

const selectAvatar = (avatarNumber) => {
  user.value.avatar_url = `/avatars/default-${avatarNumber}.png`
}

const saveAvatar = async () => {
  try {
    await api.auth.updateMe({ avatar_url: user.value.avatar_url })
    showAvatarModal.value = false
  } catch (error) {
    console.error('Error saving avatar:', error)
  }
}

const selectTheme = (newTheme) => {
  setTheme(newTheme)
}

const saveTheme = async () => {
  try {
    await api.auth.updateMe({ theme: theme.value })
    showThemeModal.value = false
  } catch (error) {
    console.error('Error saving theme:', error)
  }
}

onMounted(async () => {
  await loadUser()
  await loadStats()
  await loadReferenceData()
})
</script>
