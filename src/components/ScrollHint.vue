<!--
  Scroll Hint Component
  
  Animated indicator that suggests to users they can scroll down
  to see more content. Automatically hides after user scrolls.
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <Transition name="scroll-hint-fade">
    <div
      v-if="visible"
      class="scroll-hint"
      :class="{ 'scroll-hint--hidden': !visible }"
    >
      <div class="scroll-hint-content">
        <div class="scroll-hint-icon">
          <ChevronDown class="scroll-hint-arrow" />
        </div>
        <span v-if="showText" class="scroll-hint-text">{{ text }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  text: {
    type: String,
    default: 'Scroll to explore'
  },
  showText: {
    type: Boolean,
    default: true
  },
  threshold: {
    type: Number,
    default: 50 // pixels scrolled before hiding
  },
  delay: {
    type: Number,
    default: 1000 // ms delay before showing
  }
})

const visible = ref(false)

let hasScrolled = false

/**
 * Handle scroll event
 */
const handleScroll = () => {
  if (window.scrollY > props.threshold && !hasScrolled) {
    hasScrolled = true
    visible.value = false
    
    // Save to session storage so it doesn't reappear
    sessionStorage.setItem('stylesnap-scroll-hint-hidden', 'true')
    
    // Remove event listener after hiding
    window.removeEventListener('scroll', handleScroll)
  }
}

onMounted(() => {
  // Check if already hidden in this session
  const isHidden = sessionStorage.getItem('stylesnap-scroll-hint-hidden')
  
  if (!isHidden) {
    // Show after delay
    setTimeout(() => {
      visible.value = true
    }, props.delay)
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}

.scroll-hint-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.scroll-hint-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: hsl(var(--primary) / 0.1);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: bounce 2s ease-in-out infinite;
}

.scroll-hint-arrow {
  width: 24px;
  height: 24px;
  color: hsl(var(--primary));
  animation: arrowBounce 2s ease-in-out infinite;
}

.scroll-hint-text {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--foreground) / 0.7);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: fadeInOut 2s ease-in-out infinite;
}

/* Animations */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes arrowBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(5px);
  }
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Transition */
.scroll-hint-fade-enter-active,
.scroll-hint-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.scroll-hint-fade-enter-from,
.scroll-hint-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Mobile */
@media (max-width: 768px) {
  .scroll-hint {
    bottom: 30px;
  }
  
  .scroll-hint-icon {
    width: 36px;
    height: 36px;
  }
  
  .scroll-hint-arrow {
    width: 20px;
    height: 20px;
  }
  
  .scroll-hint-text {
    font-size: 12px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .scroll-hint-icon,
  .scroll-hint-arrow,
  .scroll-hint-text {
    animation: none !important;
  }
}
</style>

