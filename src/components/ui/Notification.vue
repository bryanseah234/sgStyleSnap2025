<!--
  Notification Component - StyleSnap
  
  Purpose: Toast/notification component for success, error, info, and warning messages
  
  Props:
  - type: 'success' | 'error' | 'info' | 'warning' (default: 'info')
  - message: string
  - duration: number (milliseconds before auto-close, default: 5000)
  - closable: boolean (default: true)
  
  Emits:
  - close: emitted when notification is closed
  
  Usage:
  <Notification type="success" message="Item added successfully!" @close="hideNotif" />
  
  Note: This should be used with a notification service/store for global toasts
  Reference: See docs/design/mobile-mockups/22-modal-notification.png for design
-->

<template>
  <transition name="slide">
    <div
      v-if="visible"
      class="notification"
      :class="`notification-${type}`"
    >
      <div class="notification-icon">
        <component :is="iconComponent" />
      </div>

      <div class="notification-content">
        <p class="notification-message">
          {{ message }}
        </p>
      </div>

      <button
        v-if="closable"
        aria-label="Close notification"
        class="notification-close"
        @click="handleClose"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
          />
          <line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
          />
        </svg>
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, h } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: value => ['success', 'error', 'info', 'warning'].includes(value)
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 5000
  },
  closable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const visible = ref(true)
let timer = null

const handleClose = () => {
  visible.value = false
  setTimeout(() => {
    emit('close')
  }, 300) // Wait for animation to complete
}

// Auto-close timer
onMounted(() => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      handleClose()
    }, props.duration)
  }
})

// Clear timer on unmount
const clearTimer = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// Icon components based on notification type
const iconComponent = h(
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  },
  [
    // Success - Check circle
    props.type === 'success'
      ? [
          h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
          h('polyline', { points: '22 4 12 14.01 9 11.01' })
        ]
      : null,
    // Error - X circle
    props.type === 'error'
      ? [
          h('circle', { cx: '12', cy: '12', r: '10' }),
          h('line', { x1: '15', y1: '9', x2: '9', y2: '15' }),
          h('line', { x1: '9', y1: '9', x2: '15', y2: '15' })
        ]
      : null,
    // Warning - Alert triangle
    props.type === 'warning'
      ? [
          h('path', {
            d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'
          }),
          h('line', { x1: '12', y1: '9', x2: '12', y2: '13' }),
          h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
        ]
      : null,
    // Info - Info circle
    props.type === 'info'
      ? [
          h('circle', { cx: '12', cy: '12', r: '10' }),
          h('line', { x1: '12', y1: '16', x2: '12', y2: '12' }),
          h('line', { x1: '12', y1: '8', x2: '12.01', y2: '8' })
        ]
      : null
  ].filter(Boolean)
)

defineExpose({
  clearTimer
})
</script>

<style scoped>
.notification {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 500px;
  background: white;
  border-left: 4px solid;
}

.notification-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
}

.notification-icon svg {
  width: 100%;
  height: 100%;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #2d3748;
}

.notification-close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #a0aec0;
  transition: color 0.2s;
  width: 1.25rem;
  height: 1.25rem;
}

.notification-close:hover {
  color: #4a5568;
}

.notification-close svg {
  width: 100%;
  height: 100%;
}

/* Variants */
.notification-success {
  border-left-color: #48bb78;
}

.notification-success .notification-icon {
  color: #48bb78;
}

.notification-error {
  border-left-color: #ef4444;
}

.notification-error .notification-icon {
  color: #ef4444;
}

.notification-warning {
  border-left-color: #f6ad55;
}

.notification-warning .notification-icon {
  color: #f6ad55;
}

.notification-info {
  border-left-color: #667eea;
}

.notification-info .notification-icon {
  color: #667eea;
}

/* Slide animation */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
