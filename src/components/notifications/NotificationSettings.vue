<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <!-- Header -->
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        Push Notifications
      </h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Manage your notification preferences and stay updated
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-6">
      <div class="animate-pulse space-y-4">
        <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="p-6 space-y-6">
      <!-- Master Switch -->
      <div class="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div class="flex-1">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">
            Enable Push Notifications
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ notificationStatus }}
          </p>
        </div>
        <button
          v-if="browserPermission === 'default'"
          @click="requestPermission"
          class="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Enable
        </button>
        <button
          v-else-if="browserPermission === 'denied'"
          @click="showPermissionHelp"
          class="ml-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors"
        >
          Help
        </button>
        <toggle-switch
          v-else
          v-model="preferences.push_enabled"
          @update:modelValue="savePreferences"
        />
      </div>

      <!-- Permission Denied Help -->
      <div
        v-if="showHelp"
        class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
      >
        <div class="flex">
          <svg
            class="h-5 w-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Notifications Blocked
            </h3>
            <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>To enable notifications:</p>
              <ol class="list-decimal list-inside mt-2 space-y-1">
                <li>Click the lock or info icon in your browser's address bar</li>
                <li>Find "Notifications" in the permissions list</li>
                <li>Change the setting to "Allow"</li>
                <li>Reload this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div v-if="browserPermission === 'granted'" class="space-y-4">
        <!-- Notification Types -->
        <div>
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Notification Types
          </h3>
          <div class="space-y-3">
            <notification-toggle
              v-model="preferences.friend_requests"
              label="Friend Requests"
              description="When someone sends you a friend request"
              icon="user-add"
              @update:modelValue="savePreferences"
            />
            <notification-toggle
              v-model="preferences.friend_accepted"
              label="Friend Accepted"
              description="When someone accepts your friend request"
              icon="user-check"
              @update:modelValue="savePreferences"
            />
            <notification-toggle
              v-model="preferences.outfit_likes"
              label="Outfit Likes"
              description="When someone likes your outfit"
              icon="heart"
              @update:modelValue="savePreferences"
            />
            <notification-toggle
              v-model="preferences.outfit_comments"
              label="Outfit Comments"
              description="When someone comments on your outfit"
              icon="chat"
              @update:modelValue="savePreferences"
            />
            <notification-toggle
              v-model="preferences.item_likes"
              label="Item Likes"
              description="When someone likes your closet item"
              icon="star"
              @update:modelValue="savePreferences"
            />
            <notification-toggle
              v-model="preferences.friend_outfit_suggestions"
              label="Outfit Suggestions"
              description="When a friend suggests an outfit for you"
              icon="lightbulb"
              @update:modelValue="savePreferences"
            />
          </div>
        </div>

        <!-- Optional Notifications -->
        <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Optional Notifications
          </h3>
          <div class="space-y-3">
            <notification-toggle
              v-model="preferences.daily_suggestions"
              label="Daily Outfit Suggestions"
              description="Get outfit suggestions every day"
              icon="calendar"
              @update:modelValue="savePreferences"
            >
              <template #extra>
                <div v-if="preferences.daily_suggestions" class="mt-2 ml-11">
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Time
                  </label>
                  <input
                    v-model="preferences.daily_suggestion_time"
                    type="time"
                    class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    @change="savePreferences"
                  />
                </div>
              </template>
            </notification-toggle>
            <notification-toggle
              v-model="preferences.weather_alerts"
              label="Weather Alerts"
              description="Outfit suggestions based on weather changes"
              icon="cloud"
              @update:modelValue="savePreferences"
            />
            <notification-toggle
              v-model="preferences.quota_warnings"
              label="Quota Warnings"
              description="When you're close to your upload limit"
              icon="warning"
              @update:modelValue="savePreferences"
            />
          </div>
        </div>

        <!-- Quiet Hours -->
        <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                Quiet Hours
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Pause non-urgent notifications during specific hours
              </p>
            </div>
            <toggle-switch
              v-model="preferences.quiet_hours_enabled"
              @update:modelValue="savePreferences"
            />
          </div>
          <div
            v-if="preferences.quiet_hours_enabled"
            class="flex items-center space-x-4 ml-11"
          >
            <div>
              <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                From
              </label>
              <input
                v-model="preferences.quiet_hours_start"
                type="time"
                class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                @change="savePreferences"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                To
              </label>
              <input
                v-model="preferences.quiet_hours_end"
                type="time"
                class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                @change="savePreferences"
              />
            </div>
          </div>
        </div>

        <!-- Test Notification -->
        <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="sendTestNotification"
            :disabled="isSendingTest"
            class="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {{ isSendingTest ? 'Sending...' : 'Send Test Notification' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <transition name="fade">
      <div
        v-if="showSuccess"
        class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <span>Settings saved!</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestNotification
} from '../../services/push-notifications'
import ToggleSwitch from '../ui/ToggleSwitch.vue'
import NotificationToggle from './NotificationToggle.vue'

const loading = ref(true)
const showHelp = ref(false)
const showSuccess = ref(false)
const isSendingTest = ref(false)
const browserPermission = ref('default')
const preferences = ref({
  push_enabled: true,
  friend_requests: true,
  friend_accepted: true,
  outfit_likes: true,
  outfit_comments: true,
  item_likes: true,
  friend_outfit_suggestions: true,
  daily_suggestions: false,
  daily_suggestion_time: '08:00:00',
  weather_alerts: false,
  quota_warnings: true,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00:00',
  quiet_hours_end: '08:00:00'
})

const notificationStatus = computed(() => {
  if (!isPushNotificationSupported()) {
    return 'Push notifications are not supported in your browser'
  }
  
  if (browserPermission.value === 'denied') {
    return 'Notifications are blocked. Click "Help" to enable them.'
  }
  
  if (browserPermission.value === 'default') {
    return 'Click "Enable" to allow push notifications'
  }
  
  return preferences.value.push_enabled 
    ? 'Notifications are enabled' 
    : 'Notifications are disabled'
})

onMounted(async () => {
  browserPermission.value = getNotificationPermission()
  await loadPreferences()
  loading.value = false
})

async function loadPreferences() {
  try {
    const prefs = await getNotificationPreferences()
    preferences.value = prefs
  } catch (error) {
    console.error('Failed to load preferences:', error)
  }
}

async function savePreferences() {
  try {
    await updateNotificationPreferences(preferences.value)
    showSuccessToast()
  } catch (error) {
    console.error('Failed to save preferences:', error)
  }
}

async function requestPermission() {
  try {
    const permission = await requestNotificationPermission()
    browserPermission.value = permission
    
    if (permission === 'granted') {
      preferences.value.push_enabled = true
      await savePreferences()
    } else if (permission === 'denied') {
      showHelp.value = true
    }
  } catch (error) {
    console.error('Failed to request permission:', error)
  }
}

function showPermissionHelp() {
  showHelp.value = !showHelp.value
}

async function sendTest() {
  isSendingTest.value = true
  
  try {
    await sendTestNotification()
    showSuccessToast()
  } catch (error) {
    console.error('Failed to send test notification:', error)
  } finally {
    isSendingTest.value = false
  }
}

function showSuccessToast() {
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
