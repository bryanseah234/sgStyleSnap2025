<!--
  Custom Loading Animation Component
  
  Branded loading animation that matches StyleSnap's design aesthetic.
  Features a morphing geometric shape with smooth animations.
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <div class="loading-container" :class="sizeClass">
    <div class="loading-animation">
      <!-- Morphing geometric shape -->
      <div class="loading-blob"></div>
      <div class="loading-blob loading-blob--delayed"></div>
      <div class="loading-blob loading-blob--extra-delayed"></div>
    </div>
    
    <!-- Loading message -->
    <p v-if="message" class="loading-message">
      {{ currentMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  message: {
    type: [String, Boolean],
    default: false
  },
  messages: {
    type: Array,
    default: () => [
      'Summoning avatars...',
      'Preparing the stage...',
      'Almost there...',
      'Loading your wardrobe...',
      'Organizing your style...',
      'Crafting the perfect look...'
    ]
  },
  rotateMessages: {
    type: Boolean,
    default: true
  },
  messageInterval: {
    type: Number,
    default: 2000 // ms
  }
})

const currentMessageIndex = ref(0)
const currentMessage = computed(() => {
  if (typeof props.message === 'string') {
    return props.message
  }
  if (props.message && props.messages.length > 0) {
    return props.messages[currentMessageIndex.value]
  }
  return ''
})

const sizeClass = computed(() => `loading-container--${props.size}`)

let messageRotationInterval = null

// Rotate messages if enabled
onMounted(() => {
  if (props.rotateMessages && props.message && props.messages.length > 1) {
    messageRotationInterval = setInterval(() => {
      currentMessageIndex.value = (currentMessageIndex.value + 1) % props.messages.length
    }, props.messageInterval)
  }
})

onUnmounted(() => {
  if (messageRotationInterval) {
    clearInterval(messageRotationInterval)
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.loading-container--small {
  gap: 8px;
}

.loading-container--large {
  gap: 24px;
}

.loading-animation {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container--small .loading-animation {
  width: 40px;
  height: 40px;
}

.loading-container--medium .loading-animation {
  width: 60px;
  height: 60px;
}

.loading-container--large .loading-animation {
  width: 80px;
  height: 80px;
}

.loading-blob {
  position: absolute;
  width: 100%;
  height: 100%;
  background: hsl(var(--primary));
  border-radius: 50%;
  animation: blobMorph 3s ease-in-out infinite;
  opacity: 0.8;
}

.loading-blob--delayed {
  animation-delay: 1s;
  opacity: 0.5;
}

.loading-blob--extra-delayed {
  animation-delay: 2s;
  opacity: 0.3;
}

@keyframes blobMorph {
  0%, 100% {
    border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
    transform: scale(1) rotate(0deg);
  }
  25% {
    border-radius: 60% 40% 55% 45% / 55% 60% 40% 45%;
    transform: scale(0.8) rotate(90deg);
  }
  50% {
    border-radius: 45% 55% 40% 60% / 60% 45% 55% 40%;
    transform: scale(1.1) rotate(180deg);
  }
  75% {
    border-radius: 55% 45% 60% 40% / 40% 55% 45% 60%;
    transform: scale(0.9) rotate(270deg);
  }
}

.loading-message {
  font-size: 14px;
  color: hsl(var(--muted-foreground));
  text-align: center;
  animation: fadeInOut 2s ease-in-out infinite;
  font-weight: 500;
}

.loading-container--small .loading-message {
  font-size: 12px;
}

.loading-container--large .loading-message {
  font-size: 16px;
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .loading-blob {
    animation: fadeInOut 2s ease-in-out infinite;
  }
  
  @keyframes fadeInOut {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }
}
</style>

