<!--
  ProfileCard Component - StyleSnap
  
  A clickable profile card showing user avatar, name, and username
  Used in the top navigation bar
-->

<template>
  <div 
    class="profile-card"
    @click="handleClick"
  >
    <div class="profile-avatar">
      <div v-if="userAvatar" class="avatar-image">
        <img :src="userAvatar" :alt="userName" class="avatar-img">
      </div>
      <div v-else class="avatar-placeholder">
        <svg class="avatar-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    <div class="profile-details">
      <span class="profile-name">{{ userName }}</span>
      <span v-if="userProfile?.username" class="profile-username">@{{ userProfile.username }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth-store'

const props = defineProps({
  userProfile: {
    type: Object,
    default: () => ({})
  },
  userAvatar: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => authStore.userName)

function handleClick() {
  router.push('/settings')
}
</script>

<style scoped>
.profile-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.profile-card:hover {
  background: var(--theme-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.profile-avatar {
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

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.profile-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--theme-text);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-username {
  font-size: 0.75rem;
  color: var(--theme-text-secondary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-details {
    display: none; /* Hide text on mobile to save space */
  }
  
  .profile-avatar {
    width: 2rem;
    height: 2rem;
  }
  
  .avatar-icon {
    width: 1rem;
    height: 1rem;
  }
  
  .profile-card {
    padding: 0.375rem 0.5rem;
  }
}

@media (max-width: 640px) {
  .profile-card {
    padding: 0.25rem 0.375rem;
  }
}
</style>
