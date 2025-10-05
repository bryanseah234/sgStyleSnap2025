<!--
  Profile Page - StyleSnap
  
  Purpose: User's own profile page with settings and account management
  
  Features:
  - Display user info (name, email, avatar from Google)
  - Show user's closet statistics:
    - Total items count
    - Items per category breakdown
    - Quota usage (X / 200 items)
  - Privacy settings (default privacy level for new items)
  - Account settings:
    - Notification preferences
    - Delete account option
  - Logout button
  
  Route: /profile
  Auth: Protected (requires authentication)
  
  Settings to Manage:
  - Default privacy level for new items (public/private)
  - Push notification preferences
  - Email notification preferences (if implemented)
  
  Reference:
  - requirements/database-schema.md for users table
  - requirements/security.md for privacy settings
  - services/auth-service.js for logout
-->

<template>
  <div class="profile-page">
    <div class="profile-header">
      <h1>Profile</h1>
    </div>
    
    <div class="profile-content">
      <div class="profile-card">
        <div class="profile-info">
          <div class="avatar-placeholder">
            {{ userInitial }}
          </div>
          <div class="user-details">
            <h2 class="user-name">{{ userName }}</h2>
            <p class="user-email">{{ userEmail }}</p>
          </div>
        </div>
        
        <div class="profile-actions">
          <Button
            variant="danger"
            @click="handleLogout"
            :loading="isLoggingOut"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth-store'
import Button from '../components/ui/Button.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoggingOut = ref(false)

const userName = computed(() => authStore.userName)
const userEmail = computed(() => authStore.userEmail)
const userInitial = computed(() => {
  const name = authStore.userName
  return name ? name[0].toUpperCase() : 'U'
})

async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    isLoggingOut.value = true
    try {
      await authStore.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      alert('Failed to logout. Please try again.')
    } finally {
      isLoggingOut.value = false
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 1rem;
  background-color: #f9fafb;
}

.profile-header {
  margin-bottom: 1.5rem;
}

.profile-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.profile-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.avatar-placeholder {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
