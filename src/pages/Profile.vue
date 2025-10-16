<template>
  <div class="min-h-screen p-6 md:p-12">
    <div class="max-w-4xl mx-auto">
      <h1 :class="`text-4xl font-bold mb-8 ${
        theme.value === 'dark' ? 'text-white' : 'text-black'
      }`">
        Profile
      </h1>
      
      <div v-if="user" :class="`rounded-xl p-8 ${
        theme.value === 'dark' ? 'bg-zinc-900' : 'bg-white'
      }`">
        <div class="flex items-center gap-6 mb-8">
          <div :class="`w-20 h-20 rounded-full flex items-center justify-center ${
            theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
          }`">
            <User :class="`w-10 h-10 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
          </div>
          <div>
            <h2 :class="`text-2xl font-semibold ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              {{ user.name || user.full_name || 'User' }}
            </h2>
            <p :class="`text-lg ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
            }`">
              {{ user.email }}
            </p>
          </div>
        </div>
        
        <div class="space-y-4">
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
          
          <button
            @click="saveProfile"
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { api } from '@/api/client'
import { User } from 'lucide-vue-next'

const { theme } = useTheme()
const user = ref(null)
const saving = ref(false)

const loadUser = async () => {
  try {
    const userData = await api.auth.me()
    user.value = userData
  } catch (error) {
    console.error('Error loading user:', error)
  }
}

const saveProfile = async () => {
  saving.value = true
  try {
    await api.auth.updateMe({
      bio: user.value.bio,
      gender: user.value.gender
    })
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadUser()
})
</script>
