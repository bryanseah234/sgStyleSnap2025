<!--
  NotificationBell Component - StyleSnap
  
  Purpose: Bell icon with badge showing unread notification count, opens notification panel
  
  Features:
  - Bell icon (SVG or icon font)
  - Badge with unread count
  - Click to open notification dropdown/panel
  - Real-time updates via push notifications
  
  Notification Types:
  - New friend request
  - Friend request accepted
  - New outfit suggestion received
  - Friend liked your suggestion
  
  Data Source:
  - notifications table (or derived from friend requests + suggestions)
  - Real-time updates via Web Push API (see services/push-notifications.js)
  
  Usage:
  <NotificationBell /> (used in MainLayout header)
  
  Reference:
  - docs/design/mobile-mockups/22-modal-notification.png for notification UI
  - requirements/database-schema.md for notifications handling
  - services/push-notifications.js for push notification setup
  - sql/004_advanced_features.sql may include notifications table/triggers
-->

<template>
  <div class="notification-bell">
    <!-- Bell Icon with Badge -->
    <button
      :aria-label="`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`"
      class="bell-button"
      @click="toggleDropdown"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="bell-icon"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      <!-- Unread Badge -->
      <span
        v-if="unreadCount > 0"
        class="badge"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Notification Dropdown -->
    <transition name="dropdown">
      <div
        v-if="showDropdown"
        v-click-outside="closeDropdown"
        class="notification-dropdown"
      >
        <div class="dropdown-header">
          <h3>Notifications</h3>
          <button
            v-if="unreadCount > 0"
            class="mark-all-read"
            @click="markAllAsRead"
          >
            Mark all read
          </button>
        </div>

        <div class="dropdown-body">
          <div
            v-if="loading"
            class="loading"
          >
            Loading...
          </div>

          <div
            v-else-if="notifications.length === 0"
            class="empty-state"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="empty-icon"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p>No notifications yet</p>
          </div>

          <div
            v-else
            class="notification-list"
          >
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.is_read }"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-icon">
                <component
                  :is="getNotificationIcon(notification.type)"
                  class="icon"
                />
              </div>

              <div class="notification-content">
                <p class="notification-message">
                  {{ notification.message }}
                </p>
                <span class="notification-time">
                  {{ formatTime(notification.created_at) }}
                </span>
              </div>

              <button
                v-if="!notification.is_read"
                aria-label="Mark as read"
                class="mark-read-btn"
                @click.stop="markAsRead(notification.id)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="check-icon"
                >
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="dropdown-footer">
          <router-link
            to="/notifications"
            class="view-all"
            @click="closeDropdown"
          >
            View all notifications
          </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '../../stores/notifications-store'

const router = useRouter()
const notificationsStore = useNotificationsStore()

const showDropdown = ref(false)

// Computed properties
const notifications = computed(() => notificationsStore.notifications.slice(0, 5))
const unreadCount = computed(() => notificationsStore.unreadCount)
const loading = computed(() => notificationsStore.loading)

// Toggle dropdown
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value && !notificationsStore.initialized) {
    fetchNotifications()
  }
}

const closeDropdown = () => {
  showDropdown.value = false
}

// Fetch notifications
const fetchNotifications = async () => {
  await notificationsStore.fetchNotifications()
}

// Mark single notification as read
const markAsRead = async notificationId => {
  await notificationsStore.markAsRead(notificationId)
}

// Mark all as read
const markAllAsRead = async () => {
  await notificationsStore.markAllAsRead()
}

// Handle notification click
const handleNotificationClick = async notification => {
  // Mark as read
  if (!notification.is_read) {
    await markAsRead(notification.id)
  }

  // Navigate based on notification type
  closeDropdown()

  if (notification.related_id) {
    switch (notification.type) {
      case 'friend_request':
        router.push('/friends')
        break
      case 'friend_accepted':
        router.push(`/friends/${notification.related_id}`)
        break
      case 'outfit_suggestion':
        router.push('/suggestions')
        break
      case 'item_liked':
        router.push('/closet')
        break
      default:
        router.push('/notifications')
    }
  }
}

// Get icon component for notification type
const getNotificationIcon = type => {
  const icons = {
    friend_request: () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2'
        },
        [
          h('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
          h('circle', { cx: '8.5', cy: '7', r: '4' }),
          h('line', { x1: '20', y1: '8', x2: '20', y2: '14' }),
          h('line', { x1: '23', y1: '11', x2: '17', y2: '11' })
        ]
      ),
    friend_accepted: () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2'
        },
        [
          h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
          h('circle', { cx: '9', cy: '7', r: '4' }),
          h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
          h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
        ]
      ),
    outfit_suggestion: () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2'
        },
        [
          h('path', {
            d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z'
          }),
          h('line', { x1: '7', y1: '7', x2: '7.01', y2: '7' })
        ]
      ),
    item_liked: () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 24 24',
          fill: 'currentColor',
          stroke: 'none'
        },
        [
          h('path', {
            d: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
          })
        ]
      )
  }
  return icons[type] || icons.friend_request
}

// Format time relative to now
const formatTime = timestamp => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return time.toLocaleDateString()
}

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = event => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

// Initialize and cleanup
onMounted(async () => {
  await notificationsStore.initialize()
})

onUnmounted(() => {
  notificationsStore.cleanup()
})
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5568;
  transition: color 0.2s;
}

.bell-button:hover {
  color: #667eea;
}

.bell-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 1.25rem;
  text-align: center;
}

/* Dropdown */
.notification-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 360px;
  max-width: 90vw;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
}

.mark-all-read {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.mark-all-read:hover {
  background: #edf2f7;
}

.dropdown-body {
  max-height: 400px;
  overflow-y: auto;
}

.loading,
.empty-state {
  padding: 3rem 1rem;
  text-align: center;
  color: #a0aec0;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  opacity: 0.3;
}

.notification-list {
  padding: 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #f7fafc;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #f7fafc;
}

.notification-item.unread {
  background: #edf6ff;
}

.notification-item.unread:hover {
  background: #dbeafe;
}

.notification-icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #edf2f7;
  border-radius: 50%;
  color: #667eea;
}

.notification-icon .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  color: #2d3748;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: #a0aec0;
}

.mark-read-btn {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #cbd5e0;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.mark-read-btn:hover {
  color: #667eea;
  background: #edf2f7;
}

.check-icon {
  width: 1rem;
  height: 1rem;
}

.dropdown-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.view-all {
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all:hover {
  color: #5a67d8;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .notification-dropdown {
    width: 100vw;
    right: -1rem;
    border-radius: 0;
  }
}
</style>
