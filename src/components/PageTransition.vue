<!--
  PageTransition - Immersive Curtain-Style Page Transition
  
  Creates a premium curtain effect with cascading vertical bars that slide
  down/up during navigation. Respects user motion preferences and maintains
  consistent 60fps performance.
  
  @author Stylesnap Team
  @version 1.0.0
-->
<template>
  <Transition name="page-transition-fade">
    <div
      v-if="isTransitioning"
      class="page-transition-overlay"
      :class="{ 'reduced-motion': prefersReducedMotion }"
      role="presentation"
      aria-hidden="true"
    >
      <!-- Curtain Bars -->
      <div
        v-for="(bar, index) in bars"
        :key="index"
        class="curtain-bar"
        :style="getCurtainBarStyle(index)"
      />
      
      <!-- Optional Loading Indicator -->
      <div
        v-if="showLoadingIndicator && isTransitioning"
        class="loading-indicator"
      >
        <div class="spinner-modern" />
      </div>
    </div>
  </Transition>
</template>

<script setup>
/**
 * PageTransition Component
 * 
 * Implements an immersive curtain-style page transition animation with:
 * - Multiple vertical bars (8-12 bars) cascading down/up
 * - GPU-accelerated transforms for 60fps performance
 * - Staggered delays creating a smooth curtain effect
 * - Accessibility support for reduced motion preferences
 * - Integration with Vue Router navigation
 */
import { ref, computed, watch, onMounted } from 'vue'
import { usePageTransition } from '@/composables/usePageTransition'

const props = defineProps({
  /**
   * Number of curtain bars (8-12 recommended)
   */
  barCount: {
    type: Number,
    default: 10,
    validator: (value) => value >= 8 && value <= 12
  },
  
  /**
   * Total transition duration in milliseconds
   */
  duration: {
    type: Number,
    default: 900
  },
  
  /**
   * Delay between each bar in milliseconds
   */
  staggerDelay: {
    type: Number,
    default: 50
  },
  
  /**
   * Show loading indicator during transition
   */
  showLoadingIndicator: {
    type: Boolean,
    default: false
  }
})

// Get transition state from composable
const {
  isTransitioning,
  transitionState,
  prefersReducedMotion
} = usePageTransition()

// Generate bars array
const bars = computed(() => Array.from({ length: props.barCount }, (_, i) => i))

/**
 * Calculate individual bar styles with staggered delays
 * @param {number} index - Bar index
 * @returns {Object} Style object for the bar
 */
const getCurtainBarStyle = (index) => {
  const baseDelay = index * props.staggerDelay
  const isEntering = transitionState.value === 'entering'
  
  // For reduced motion, no delays or transforms
  if (prefersReducedMotion.value) {
    return {
      width: `${100 / props.barCount}%`,
      left: `${(index * 100) / props.barCount}%`
    }
  }
  
  return {
    width: `${100 / props.barCount}%`,
    left: `${(index * 100) / props.barCount}%`,
    animationDelay: `${baseDelay}ms`,
    animationDuration: `${props.duration}ms`,
    animationName: isEntering ? 'curtain-slide-up' : 'curtain-slide-down',
    // Add gradient variation per bar for visual interest
    backgroundImage: getBarGradient(index)
  }
}

/**
 * Generate gradient for each bar using existing design tokens
 * @param {number} index - Bar index
 * @returns {string} CSS gradient
 */
const getBarGradient = (index) => {
  // Use HSL values from design system
  const isDark = document.documentElement.classList.contains('dark')
  
  if (isDark) {
    // Dark mode: black with subtle white gradient
    const opacity1 = 0.95 + (index % 3) * 0.02
    const opacity2 = 0.90 + (index % 3) * 0.02
    return `linear-gradient(180deg, 
      hsla(0, 0%, 0%, ${opacity1}) 0%, 
      hsla(0, 0%, 5%, ${opacity2}) 100%)`
  } else {
    // Light mode: white with subtle gray gradient
    const lightness1 = 100 - (index % 3)
    const lightness2 = 96 - (index % 3)
    return `linear-gradient(180deg, 
      hsl(0, 0%, ${lightness1}%) 0%, 
      hsl(0, 0%, ${lightness2}%) 100%)`
  }
}

// Watch for theme changes to update gradients
let themeObserver = null
onMounted(() => {
  // Observe theme changes
  themeObserver = new MutationObserver(() => {
    // Force re-render of gradients when theme changes
    if (isTransitioning.value) {
      // Gradients will update on next render due to computed properties
    }
  })
  
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})
</script>

<style scoped>
/* ============================================
   PAGE TRANSITION OVERLAY
   ============================================ */

.page-transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999; /* Above content, below critical UI */
  pointer-events: none; /* Don't block user interaction */
  overflow: hidden;
  /* GPU acceleration */
  transform: translateZ(0);
  will-change: opacity;
}

/* ============================================
   CURTAIN BARS
   ============================================ */

.curtain-bar {
  position: absolute;
  top: 0;
  height: 100%;
  /* GPU-accelerated transform */
  transform: translateY(-100%) translateZ(0);
  will-change: transform;
  /* Use design system colors with gradients */
  background: linear-gradient(180deg, 
    hsl(0 0% 100%) 0%, 
    hsl(0 0% 96%) 100%);
  /* Subtle borders between bars */
  border-right: 1px solid hsl(0 0% 90%);
  /* Performance optimizations */
  backface-visibility: hidden;
  contain: strict;
}

/* Dark mode bars */
:global(.dark) .curtain-bar {
  background: linear-gradient(180deg, 
    hsl(0 0% 0%) 0%, 
    hsl(0 0% 5%) 100%);
  border-right: 1px solid hsl(0 0% 10%);
}

/* ============================================
   CURTAIN ANIMATIONS
   ============================================ */

/* Slide down animation (exit) */
@keyframes curtain-slide-down {
  0% {
    transform: translateY(-100%) translateZ(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateY(0) translateZ(0);
    opacity: 1;
  }
}

/* Slide up animation (enter) */
@keyframes curtain-slide-up {
  0% {
    transform: translateY(0) translateZ(0);
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100%) translateZ(0);
    opacity: 0;
  }
}

/* Apply animations */
.curtain-bar {
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* var(--ease-liquid) */
  animation-fill-mode: forwards;
}

/* ============================================
   LOADING INDICATOR
   ============================================ */

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) translateZ(0);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Fade in after a delay */
  opacity: 0;
  animation: fade-in-delayed 0.3s ease-out 0.2s forwards;
}

@keyframes fade-in-delayed {
  to {
    opacity: 1;
  }
}

/* Use existing spinner from design system */
.spinner-modern {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0%,
    currentColor 100%
  );
  color: hsl(0 0% 0%);
  animation: spin 1s linear infinite;
}

.spinner-modern::before {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background: hsl(0 0% 100%);
}

:global(.dark) .spinner-modern {
  color: hsl(0 0% 100%);
}

:global(.dark) .spinner-modern::before {
  background: hsl(0 0% 0%);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ============================================
   OVERLAY FADE TRANSITION
   ============================================ */

.page-transition-fade-enter-active,
.page-transition-fade-leave-active {
  transition: opacity 0.3s ease;
}

.page-transition-fade-enter-from,
.page-transition-fade-leave-to {
  opacity: 0;
}

/* ============================================
   REDUCED MOTION SUPPORT
   ============================================ */

.reduced-motion .curtain-bar {
  animation: none !important;
  transform: none !important;
  opacity: 1 !important;
}

.reduced-motion.page-transition-overlay {
  /* Simple fade for reduced motion */
  background: hsl(0 0% 100%);
  animation: simple-fade 0.3s ease-out;
}

:global(.dark) .reduced-motion.page-transition-overlay {
  background: hsl(0 0% 0%);
}

@keyframes simple-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ============================================
   PERFORMANCE OPTIMIZATIONS
   ============================================ */

/* Clean up will-change after animation */
.curtain-bar:not([style*="animation"]) {
  will-change: auto;
}

.page-transition-overlay:not(.is-transitioning) {
  will-change: auto;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .curtain-bar {
    /* Slightly faster on mobile */
    animation-duration: 700ms !important;
  }
  
  .loading-indicator {
    /* Smaller spinner on mobile */
    transform: translate(-50%, -50%) scale(0.8) translateZ(0);
  }
}

/* ============================================
   ACCESSIBILITY
   ============================================ */

@media (prefers-reduced-motion: reduce) {
  .curtain-bar {
    animation: none !important;
    transform: none !important;
    transition: opacity 0.2s ease !important;
  }
  
  .page-transition-overlay {
    background: hsl(0 0% 100%);
    transition: opacity 0.2s ease;
  }
  
  :global(.dark) .page-transition-overlay {
    background: hsl(0 0% 0%);
  }
  
  .loading-indicator {
    animation: none;
    opacity: 1;
  }
}

/* Ensure overlay doesn't interfere with accessibility tools */
.page-transition-overlay {
  -webkit-user-select: none;
  user-select: none;
}
</style>

