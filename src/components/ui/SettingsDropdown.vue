<!--
  Settings Dropdown Component - StyleSnap
  
  Purpose: Dropdown menu that appears when clicking the settings icon
  Shows user profile information and theme toggle
  
  Features:
  - User profile display (name, email)
  - Theme toggle (light/dark purple)
  - Sign out option
  - Smooth animations and transitions
-->

<template>
  <div class="settings-dropdown-container">
    <!-- Settings Button -->
    <button
      class="settings-button"
      :class="{ 'settings-button-open': isOpen }"
      @click="toggleDropdown"
      title="Settings"
    >
      <svg
        class="settings-icon"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="settings-dropdown"
        @click.stop
      >
        <!-- User Profile Section -->
        <div class="profile-section">
          <div class="profile-header">
            <div class="profile-avatar">
              <img
                :src="userAvatar || defaultAvatar"
                :alt="userName"
                class="avatar-image"
              >
            </div>
            <div class="profile-info">
              <h3 class="profile-name">{{ userName }}</h3>
              <p class="profile-email">{{ userEmail }}</p>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="dropdown-divider" />

        <!-- Theme Toggle Section -->
        <div class="theme-section">
          <div class="theme-header">
            <svg
              class="theme-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            <span class="theme-label">Theme</span>
          </div>
          <button
            class="theme-toggle"
            @click="toggleTheme"
          >
            <div class="theme-toggle-track">
              <div
                class="theme-toggle-thumb"
                :class="{ 'theme-toggle-thumb-dark': themeStore.isDarkMode }"
              />
            </div>
            <span class="theme-toggle-label">
              {{ themeStore.isDarkMode ? 'Dark' : 'Light' }}
            </span>
          </button>
        </div>

        <!-- Divider -->
        <div class="dropdown-divider" />

        <!-- Actions Section -->
        <div class="actions-section">
          <router-link
            to="/style-settings"
            class="action-button"
            @click="closeDropdown"
          >
            <svg
              class="action-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
              />
            </svg>
            <span>Style Preferences</span>
          </router-link>
          
          <button
            class="action-button sign-out-button"
            @click="handleSignOut"
          >
            <svg
              class="action-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="dropdown-backdrop"
        @click="closeDropdown"
      />
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useThemeStore } from '../../stores'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isOpen = ref(false)

// User data
const userName = computed(() => authStore.userName)
const userEmail = computed(() => authStore.userEmail)
const userAvatar = computed(() => authStore.userAvatar)

// Default avatar
const defaultAvatar = '/avatars/default-1.png'

// Toggle dropdown
function toggleDropdown() {
  isOpen.value = !isOpen.value
}

// Close dropdown
function closeDropdown() {
  isOpen.value = false
}

// Toggle theme
function toggleTheme() {
  themeStore.toggleTheme()
}

// Handle sign out
async function handleSignOut() {
  if (!confirm('Are you sure you want to sign out?')) {
    return
  }

  try {
    await authStore.logout()
    closeDropdown()
    router.push('/login')
  } catch (error) {
    console.error('Failed to sign out:', error)
    alert('Failed to sign out. Please try again.')
  }
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  if (isOpen.value && !event.target.closest('.settings-dropdown-container')) {
    closeDropdown()
  }
}

// Close dropdown on escape key
function handleEscapeKey(event) {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscapeKey)
  themeStore.initializeTheme()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscapeKey)
})
</script>

<style scoped>
.settings-dropdown-container {
  position: relative;
  display: inline-block;
}

/* Settings Button */
.settings-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem;
  background-color: var(--theme-surface, #ffffff);
  border: 1px solid var(--theme-border);
  border-radius: 0.5rem;
  color: var(--theme-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.settings-button:hover {
  background-color: var(--theme-hover);
  color: var(--theme-text);
  border-color: var(--theme-border);
}

.settings-button:active {
  transform: scale(0.95);
}

.settings-button-open {
  background-color: var(--theme-hover);
  color: var(--theme-text);
  border-color: var(--theme-border);
}

.settings-icon {
  width: 1.5rem;
  height: 1.5rem;
  transition: transform 0.3s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.settings-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 20rem;
  background-color: var(--theme-surface, #ffffff);
  border: 1px solid var(--theme-border);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
}

/* Profile Section */
.profile-section {
  padding: 1rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--theme-text, #111827);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-email {
  font-size: 0.875rem;
  color: var(--theme-text-secondary, #6b7280);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Divider */
.dropdown-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 0;
}

/* Theme Section */
.theme-section {
  padding: 1rem;
}

.theme-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.theme-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--theme-text-secondary, #6b7280);
}

.theme-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--theme-text, #111827);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem;
  background-color: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.theme-toggle:hover {
  background-color: var(--theme-hover);
}

.theme-toggle-track {
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background-color: #d1d5db;
  border-radius: 0.75rem;
  transition: background-color 0.3s ease;
}

.theme-toggle-thumb {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  background-color: #ffffff;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-toggle-thumb-dark {
  transform: translateX(1.5rem);
}

.theme-toggle-track:has(.theme-toggle-thumb-dark) {
  background-color: #8b5cf6;
}

.theme-toggle-label {
  font-size: 0.875rem;
  color: var(--theme-text, #111827);
  font-weight: 500;
}

/* Actions Section */
.actions-section {
  padding: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background-color: transparent;
  border: none;
  border-radius: 0.5rem;
  color: var(--theme-text, #111827);
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.action-button:hover {
  background-color: var(--theme-hover);
}

.sign-out-button {
  color: #dc2626;
}

.sign-out-button:hover {
  background-color: #fef2f2;
}

.action-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Backdrop */
.dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background-color: transparent;
}

/* Dark mode styles */
:global(.dark) .settings-button {
  background-color: var(--theme-surface, #374151);
  border-color: #4b5563;
  color: #d1d5db;
}

:global(.dark) .settings-button:hover {
  background-color: #4b5563;
  color: #f9fafb;
}

:global(.dark) .settings-dropdown {
  background-color: var(--theme-surface, #374151);
  border-color: #4b5563;
}

:global(.dark) .profile-name {
  color: var(--theme-text, #f9fafb);
}

:global(.dark) .profile-email {
  color: var(--theme-text-secondary, #d1d5db);
}

:global(.dark) .theme-label {
  color: var(--theme-text, #f9fafb);
}

:global(.dark) .theme-toggle-label {
  color: var(--theme-text, #f9fafb);
}

:global(.dark) .action-button {
  color: var(--theme-text, #f9fafb);
}

:global(.dark) .action-button:hover {
  background-color: #4b5563;
}

:global(.dark) .dropdown-divider {
  background-color: #4b5563;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .settings-dropdown {
    width: 18rem;
    right: -1rem;
  }
}
</style>
