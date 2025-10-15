<!--
  User Greeting Component - StyleSnap
  
  Purpose: Displays user greeting with avatar and weather widget
  
  Features:
  - User avatar display
  - Personalized greeting
  - Weather widget integration
  - Responsive layout
  
  Usage:
  <UserGreeting />
-->

<template>
  <div class="user-greeting">
    <!-- Desktop Layout: Profile + Weather side by side -->
    <div class="greeting-desktop">
      <div class="greeting-content">
        <!-- User Avatar -->
        <div class="user-avatar">
          <div v-if="userAvatar" class="avatar-image">
            <img :src="userAvatar" :alt="userName" class="avatar-img">
          </div>
          <div v-else class="avatar-placeholder">
            <svg class="avatar-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        
        <!-- Greeting Text -->
        <div class="greeting-text">
          <h2 class="greeting-title">Hello, {{ userName }}</h2>
          <p v-if="userProfile?.username" class="greeting-username">@{{ userProfile.username }}</p>
        </div>
      </div>
      
      <!-- Weather Widget -->
      <div class="weather-section">
        <WeatherWidget />
      </div>
    </div>
    
    <!-- Mobile Layout: Stacked sections -->
    <div class="greeting-mobile">
      <!-- Profile Section -->
      <div class="profile-section">
        <div class="user-avatar">
          <div v-if="userAvatar" class="avatar-image">
            <img :src="userAvatar" :alt="userName" class="avatar-img">
          </div>
          <div v-else class="avatar-placeholder">
            <svg class="avatar-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div class="greeting-text">
          <h2 class="greeting-title">Hello, {{ userName }}</h2>
          <p v-if="userProfile?.username" class="greeting-username">@{{ userProfile.username }}</p>
        </div>
      </div>
      
      <!-- Weather Section -->
      <div class="weather-section">
        <WeatherWidget />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth-store'
import { getUserProfile } from '@/services/user-service'
import WeatherWidget from './WeatherWidget.vue'

const authStore = useAuthStore()

// Reactive state
const userProfile = ref(null)
const loading = ref(true)

// Computed properties
const userName = computed(() => authStore.userName)
const userAvatar = computed(() => {
  // Use profile avatar if available, otherwise fall back to auth store
  return userProfile.value?.avatar_url || authStore.userAvatar
})

// Load user profile
async function loadUserProfile() {
  try {
    loading.value = true
    const profile = await getUserProfile()
    userProfile.value = profile
  } catch (error) {
    console.error('Failed to load user profile:', error)
    // Fall back to auth store data
    userProfile.value = {
      username: authStore.userEmail?.split('@')[0] || 'user'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.user-greeting {
  margin-bottom: 2rem;
}

/* Desktop Layout */
.greeting-desktop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.greeting-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.user-avatar {
  width: 4rem;
  height: 4rem;
  flex-shrink: 0;
}

.avatar-image,
.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-image {
  background: #f3f4f6;
}

.avatar-placeholder {
  background: linear-gradient(135deg, #6b7280, #9ca3af);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  width: 2rem;
  height: 2rem;
  color: white;
}

.greeting-text {
  flex: 1;
}

.greeting-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--theme-text);
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.greeting-username {
  font-size: 0.875rem;
  color: var(--theme-text-secondary);
  margin: 0;
  line-height: 1.2;
}

.weather-section {
  flex-shrink: 0;
}

/* Mobile Layout - Hidden on desktop */
.greeting-mobile {
  display: none;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .avatar-image {
    background: #374151;
  }
  
  .avatar-placeholder {
    background: linear-gradient(135deg, #4b5563, #6b7280);
  }
}

/* Tablet and Mobile Responsive */
@media (max-width: 768px) {
  .greeting-desktop {
    display: none;
  }
  
  .greeting-mobile {
    display: block;
  }
  
  .greeting-title {
    font-size: 1.25rem;
  }
  
  .greeting-username {
    font-size: 0.8125rem;
  }
}

@media (max-width: 640px) {
  .user-avatar {
    width: 3rem;
    height: 3rem;
  }
  
  .avatar-icon {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .greeting-title {
    font-size: 1.125rem;
  }
  
  .greeting-username {
    font-size: 0.75rem;
  }
  
  .profile-section {
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .user-avatar {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .avatar-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .greeting-title {
    font-size: 1rem;
  }
  
  .greeting-username {
    font-size: 0.6875rem;
  }
  
  .profile-section {
    gap: 0.5rem;
  }
}
</style>
