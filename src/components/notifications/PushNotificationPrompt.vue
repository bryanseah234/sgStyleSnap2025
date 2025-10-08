<template>
  <div
    v-if="shouldShow"
    class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-slide-up"
  >
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-start justify-between">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <svg
              class="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Stay Updated
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Get notified about friend requests, likes, and more
            </p>
          </div>
        </div>
        <button
          @click="dismiss"
          class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="p-4">
      <div class="space-y-3 mb-4">
        <div class="flex items-start space-x-3">
          <svg class="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Friend requests and acceptances
          </p>
        </div>
        <div class="flex items-start space-x-3">
          <svg class="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Likes and comments on your outfits
          </p>
        </div>
        <div class="flex items-start space-x-3">
          <svg class="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Outfit suggestions from friends
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex space-x-3">
        <button
          @click="enableNotifications"
          :disabled="isRequesting"
          class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <svg
            v-if="isRequesting"
            class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ isRequesting ? 'Enabling...' : 'Enable Notifications' }}
        </button>
        <button
          @click="notNow"
          :disabled="isRequesting"
          class="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
        >
          Not Now
        </button>
      </div>

      <!-- Settings Link -->
      <p class="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
        You can change your notification preferences in
        <router-link
          to="/settings?tab=notifications"
          class="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Settings
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission
} from '../services/push-notifications'

const emit = defineEmits(['close', 'enabled'])

const shouldShow = ref(false)
const isRequesting = ref(false)

// Check if prompt should be shown
onMounted(() => {
  checkShouldShow()
})

function checkShouldShow() {
  // Don't show if notifications not supported
  if (!isPushNotificationSupported()) {
    return
  }

  // Don't show if already granted or denied
  const permission = getNotificationPermission()
  if (permission !== 'default') {
    return
  }

  // Don't show if user dismissed recently (within 7 days)
  const dismissedAt = localStorage.getItem('notification_prompt_dismissed')
  if (dismissedAt) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24)
    if (daysSinceDismissed < 7) {
      return
    }
  }

  // Don't show if user just signed up (wait 1 day)
  const signupDate = localStorage.getItem('user_signup_date')
  if (signupDate) {
    const daysSinceSignup = (Date.now() - parseInt(signupDate)) / (1000 * 60 * 60 * 24)
    if (daysSinceSignup < 1) {
      return
    }
  }

  // Show the prompt after 3 seconds
  setTimeout(() => {
    shouldShow.value = true
  }, 3000)
}

async function enableNotifications() {
  isRequesting.value = true

  try {
    const permission = await requestNotificationPermission()

    if (permission === 'granted') {
      // Success! Notification subscription is handled by requestNotificationPermission
      emit('enabled')
      shouldShow.value = false

      // Track that user enabled notifications
      localStorage.setItem('notification_enabled', 'true')
      localStorage.setItem('notification_enabled_at', Date.now().toString())
    } else if (permission === 'denied') {
      // User denied - don't show again
      localStorage.setItem('notification_prompt_dismissed', Date.now().toString())
      shouldShow.value = false
    }
  } catch (error) {
    console.error('Failed to enable notifications:', error)
  } finally {
    isRequesting.value = false
  }
}

function notNow() {
  // Track dismissal
  localStorage.setItem('notification_prompt_dismissed', Date.now().toString())
  shouldShow.value = false
  emit('close')
}

function dismiss() {
  notNow()
}
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
