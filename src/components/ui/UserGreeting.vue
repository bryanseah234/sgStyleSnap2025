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
        <h2 class="greeting-title">
          Hello, {{ userName }}
        </h2>
      </div>
    </div>
    
    <!-- Weather Widget -->
    <div class="weather-section">
      <WeatherWidget />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth-store'
import WeatherWidget from './WeatherWidget.vue'

const authStore = useAuthStore()

// Computed properties
const userName = computed(() => authStore.userName)
const userAvatar = computed(() => authStore.userAvatar)
</script>

<style scoped>
.user-greeting {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.greeting-content {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  font-size: 1.25rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0;
  line-height: 1.2;
}

.weather-section {
  margin-left: 5rem; /* Align with text, accounting for avatar width + gap */
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .avatar-image {
    background: #374151;
  }
  
  .avatar-placeholder {
    background: linear-gradient(135deg, #4b5563, #6b7280);
  }
  
  .greeting-title {
    color: #d1d5db;
  }
}

/* Responsive adjustments */
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
  
  .weather-section {
    margin-left: 4rem; /* Adjust for smaller avatar */
  }
}

@media (max-width: 480px) {
  .greeting-content {
    gap: 0.75rem;
  }
  
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
  
  .weather-section {
    margin-left: 3.25rem; /* Adjust for smaller avatar */
  }
}
</style>
