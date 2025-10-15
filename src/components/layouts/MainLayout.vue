<!--
  MainLayout Component - StyleSnap
  Main application layout with navigation, header, and content area
-->

<template>
  <div class="main-layout">
    <header class="main-header">
      <div class="header-content">
        <h1 class="app-logo">
          StyleSnap
        </h1>
        
        <!-- User Profile Section -->
        <div class="user-profile-section">
          <div class="user-info">
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
            <div class="user-details">
              <span class="user-name">{{ userName }}</span>
              <span v-if="userProfile?.username" class="user-username">@{{ userProfile.username }}</span>
            </div>
          </div>
          
          <!-- Weather Widget -->
          <div class="weather-widget-container">
            <WeatherWidget />
          </div>
        </div>
        
        <div class="header-actions">
          <SettingsDropdown />
        </div>
      </div>
    </header>

    <main class="main-content">
      <slot />
    </main>

    <nav class="bottom-nav">
      <router-link
        to="/closet"
        class="nav-item bottom-nav-item"
        :class="{ active: $route.path === '/closet' || $route.path === '/catalog' }"
        @click="scrollToTop"
      >
        <span class="nav-icon-wrapper">
          <svg
            class="nav-icon-svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M16 4l4-2v3l-4 2v13H8V7L4 5V2l4 2h2V3c0-.55.45-1 1-1h2c.55 0 1 .45 1 1v1h2z" />
          </svg>
        </span>
        <span class="nav-label bottom-nav-item-label">Closet</span>
      </router-link>

      <router-link
        to="/notifications"
        class="nav-item bottom-nav-item relative"
        :class="{ active: $route.path === '/notifications' }"
        @click="scrollToTop"
      >
        <span class="nav-icon-wrapper">
          <svg
            class="nav-icon-svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
            />
          </svg>
          <NotificationBadge
            v-if="suggestionsStore.newSuggestionsCount > 0"
            :count="suggestionsStore.newSuggestionsCount"
            :pulse="false"
          />
        </span>
        <span class="nav-label bottom-nav-item-label">Notifications</span>
      </router-link>

      <router-link
        to="/friends"
        class="nav-item bottom-nav-item"
        :class="{ active: $route.path === '/friends' }"
        @click="scrollToTop"
      >
        <span class="nav-icon-wrapper">
          <svg
            class="nav-icon-svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
            />
          </svg>
        </span>
        <span class="nav-label bottom-nav-item-label">Friends</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../../stores/auth-store'
import { useNotificationsStore } from '../../stores/notifications-store'
import { useSuggestionsStore } from '../../stores/suggestions-store'
import { useStylePreferencesStore } from '../../stores/style-preferences-store'
import { getUserProfile } from '../../services/user-service.js'
import NotificationBadge from '../notifications/NotificationBadge.vue'
import SettingsDropdown from '../ui/SettingsDropdown.vue'
import WeatherWidget from '../ui/WeatherWidget.vue'

const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const suggestionsStore = useSuggestionsStore()
const stylePreferencesStore = useStylePreferencesStore()

// User profile data
const userProfile = ref({})
const userAvatar = ref('')

const userName = computed(() => authStore.userName)

// Function to scroll to top when toolbar icon is clicked
function scrollToTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  })
}

// Load user profile data
async function loadUserProfile() {
  try {
    if (authStore.isAuthenticated) {
      const profileData = await getUserProfile()
      userProfile.value = profileData
      userAvatar.value = profileData.avatar_url || ''
    }
  } catch (error) {
    console.error('Failed to load user profile:', error)
  }
}


onMounted(() => {
  // Load user profile
  loadUserProfile()
  
  // Initialize notifications when layout mounts
  if (!notificationsStore.initialized) {
    notificationsStore.initialize()
  }

  // Fetch unread suggestions count
  suggestionsStore.fetchUnreadCount()
  
  // Initialize style preferences
  stylePreferencesStore.initialize()
})
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--theme-background);
}

.main-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--theme-surface);
  border-bottom: 1px solid var(--theme-border);
  box-shadow: 0 1px 3px var(--theme-shadow);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.app-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--theme-primary);
  margin: 0;
}

/* Make logo white in dark mode */
.dark .app-logo {
  color: #FFFFFF;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* User Profile Section */
.user-profile-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  justify-content: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--theme-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.avatar-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--theme-text);
  line-height: 1.2;
}

.user-username {
  font-size: 0.75rem;
  color: var(--theme-text-secondary);
  line-height: 1.2;
}

.weather-widget-container {
  display: flex;
  align-items: center;
}


.main-content {
  flex: 1;
  padding-bottom: 5rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--theme-surface);
  border-top: 1px solid var(--theme-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 0;
  z-index: 100;
  box-shadow: 0 -1px 3px var(--theme-shadow);
  max-width: 100vw;
  overflow: hidden;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0 0;
  text-decoration: none;
  color: var(--theme-text-secondary);
  transition: all 0.2s;
  border-radius: 0.5rem;
  text-align: center;
  flex: 1 1 0;
  min-width: 0;
}

.nav-item:hover {
  background-color: var(--theme-hover);
}

.nav-item.active {
  color: var(--theme-primary);
}

.nav-icon-svg {
  width: 1.6rem;
  height: 1.6rem;
  margin-bottom: 0.35rem;
  display: block;
}

.nav-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.nav-icon-svg {
  width: 1.5rem;
  height: 1.5rem;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 500;
  display: block;
  width: 100%;
  text-align: center;
}

/* Responsive Header Styles */
@media (max-width: 768px) {
  .user-profile-section {
    gap: 1rem;
  }
  
  .user-details {
    display: none; /* Hide user details on mobile to save space */
  }
  
  .user-avatar {
    width: 2rem;
    height: 2rem;
  }
  
  .avatar-icon {
    width: 1rem;
    height: 1rem;
  }
}

@media (max-width: 640px) {
  .header-content {
    padding: 0.75rem;
  }
  
  .app-logo {
    font-size: 1.125rem;
  }
  
  .user-profile-section {
    gap: 0.75rem;
  }
  
  .weather-widget-container {
    display: none; /* Hide weather widget on very small screens */
  }

  .nav-label {
    font-size: 0.6rem;
  }

  .nav-item {
    padding: 0;
  }
}

@media (max-width: 360px) {
  .nav-icon-svg {
    width: 1.45rem;
    height: 1.45rem;
    margin-bottom: 0.3rem;
  }
  .nav-label {
    font-size: 0.55rem;
  }
}
</style>
