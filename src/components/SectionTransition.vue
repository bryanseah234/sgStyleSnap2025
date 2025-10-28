<!--
  SectionTransition - Animated SVG Mask Transitions
  
  Reveals section content using creative animated SVG clip-path masks.
  Triggers on scroll using Intersection Observer.
  
  Props:
  - type: 'circle' | 'liquid' | 'wave' | 'fade' - Transition type
  - duration: number - Animation duration in milliseconds
  - timing: string - CSS timing function
  - threshold: number - Intersection observer threshold (0-1)
  - once: boolean - Play animation only once
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <div 
    ref="sectionRef" 
    class="section-transition-wrapper"
    :class="{
      'is-visible': isVisible,
      'is-animating': isAnimating,
      'reduced-motion': prefersReducedMotion,
      [`transition-${type}`]: true
    }"
    :style="sectionStyle"
  >
    <!-- SVG Clip Path Definitions (inline for better control) -->
    <svg v-if="!prefersReducedMotion && supportsSVGMasks" width="0" height="0" class="clip-path-defs">
      <defs>
        <!-- Circle Expand Mask -->
        <clipPath v-if="type === 'circle'" :id="`circle-clip-${uniqueId}`" clipPathUnits="objectBoundingBox">
          <circle 
            cx="0.5" 
            cy="0.5" 
            :r="circleRadius"
            class="mask-shape"
          />
        </clipPath>
        
        <!-- Liquid Morph Mask -->
        <clipPath v-else-if="type === 'liquid'" :id="`liquid-clip-${uniqueId}`" clipPathUnits="objectBoundingBox">
          <path 
            :d="liquidPath"
            class="mask-shape"
          />
        </clipPath>
        
        <!-- Wave Reveal Mask -->
        <clipPath v-else-if="type === 'wave'" :id="`wave-clip-${uniqueId}`" clipPathUnits="objectBoundingBox">
          <path 
            :d="wavePath"
            class="mask-shape"
          />
        </clipPath>
      </defs>
    </svg>
    
    <!-- Content Slot -->
    <div 
      ref="contentRef"
      class="section-content"
      :style="contentStyle"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
/**
 * SectionTransition Component
 * 
 * Handles animated mask reveals for landing page sections
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// ============================================
// PROPS
// ============================================

const props = defineProps({
  type: {
    type: String,
    default: 'circle',
    validator: (value) => ['circle', 'liquid', 'wave', 'fade'].includes(value)
  },
  duration: {
    type: Number,
    default: 1200 // milliseconds
  },
  timing: {
    type: String,
    default: 'cubic-bezier(0.4, 0.0, 0.2, 1)' // Material Design easing
  },
  threshold: {
    type: Number,
    default: 0.2, // Trigger at 20% visibility
    validator: (value) => value >= 0 && value <= 1
  },
  once: {
    type: Boolean,
    default: true // Play animation only once
  },
  delay: {
    type: Number,
    default: 0 // Delay before starting animation
  }
})

// ============================================
// REFS & STATE
// ============================================

const sectionRef = ref(null)
const contentRef = ref(null)
const isVisible = ref(false)
const isAnimating = ref(false)
const hasAnimated = ref(false)
const uniqueId = ref(`section-${Math.random().toString(36).substr(2, 9)}`)

// Animation state for masks
const circleRadius = ref(0)
const liquidPath = ref('M 0.5,0.5 m -0,0 a 0,0 0 1,0 0,0 a 0,0 0 1,0 -0,0')
const wavePath = ref('M 0,0 L 0,0 L 0,1 L 0,1 Z')

// Feature detection
const prefersReducedMotion = ref(false)
const supportsSVGMasks = ref(true)
const supportsCSSClipPath = ref(true)

// Intersection Observer
let observer = null
let animationTimeout = null

// ============================================
// COMPUTED
// ============================================

const sectionStyle = computed(() => {
  const styles = {}
  
  // Reduced motion: just use opacity
  if (prefersReducedMotion.value) {
    return {
      transition: `opacity ${props.duration}ms ${props.timing}`,
      opacity: isVisible.value ? 1 : 0
    }
  }
  
  return styles
})

const contentStyle = computed(() => {
  if (prefersReducedMotion.value) {
    return {}
  }
  
  const styles = {
    transition: `opacity 0.3s ease`,
    willChange: isAnimating.value ? 'clip-path, transform' : 'auto'
  }
  
  // Apply SVG clip-path if supported
  if (supportsSVGMasks.value && isVisible.value) {
    if (props.type === 'circle') {
      styles.clipPath = `url(#circle-clip-${uniqueId.value})`
    } else if (props.type === 'liquid') {
      styles.clipPath = `url(#liquid-clip-${uniqueId.value})`
    } else if (props.type === 'wave') {
      styles.clipPath = `url(#wave-clip-${uniqueId.value})`
    }
  } else if (supportsCSSClipPath.value && isVisible.value && props.type === 'fade') {
    // Fallback to CSS clip-path for fade
    styles.clipPath = 'inset(0)'
  }
  
  return styles
})

// ============================================
// FEATURE DETECTION
// ============================================

const detectFeatures = () => {
  // Check for prefers-reduced-motion
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches
    
    // Listen for changes
    mediaQuery.addEventListener('change', (e) => {
      prefersReducedMotion.value = e.matches
    })
    
    // Check SVG mask support
    supportsSVGMasks.value = typeof document.createElementNS === 'function'
    
    // Check CSS clip-path support
    supportsCSSClipPath.value = CSS.supports('clip-path', 'circle(50%)')
  }
}

// ============================================
// ANIMATION FUNCTIONS
// ============================================

/**
 * Animate circle expand
 */
const animateCircle = () => {
  const startRadius = 0
  const endRadius = 0.71 // Diagonal coverage
  const startTime = performance.now()
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    
    // Apply easing (cubic-bezier approximation)
    const easedProgress = easeOutQuart(progress)
    
    circleRadius.value = startRadius + (endRadius - startRadius) * easedProgress
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isAnimating.value = false
    }
  }
  
  requestAnimationFrame(animate)
}

/**
 * Animate liquid morph
 */
const animateLiquid = () => {
  const startPath = 'M 0.5,0.5 m -0,0 a 0,0 0 1,0 0,0 a 0,0 0 1,0 -0,0'
  const endPath = 'M 0.5,0.5 m -0.50,0 a 0.50,0.55 0 1,0 1.00,0 a 0.50,0.55 0 1,0 -1.00,0'
  
  const startTime = performance.now()
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    
    // Apply easing
    const easedProgress = easeOutQuart(progress)
    
    // Interpolate path (simplified - uses scaling)
    const scale = easedProgress
    liquidPath.value = `M 0.5,0.5 m -${0.50 * scale},0 a ${0.50 * scale},${0.55 * scale} 0 1,0 ${1.00 * scale},0 a ${0.50 * scale},${0.55 * scale} 0 1,0 -${1.00 * scale},0`
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isAnimating.value = false
    }
  }
  
  requestAnimationFrame(animate)
}

/**
 * Animate wave reveal
 */
const animateWave = () => {
  const startTime = performance.now()
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    
    // Apply easing
    const easedProgress = easeInOutCubic(progress)
    
    // Wave moves from left to right with sine wave
    const waveProgress = easedProgress
    const waveHeight = 0.05 // Wave amplitude
    
    // Create wave path
    const steps = 20
    let path = `M 0,0 `
    
    for (let i = 0; i <= steps; i++) {
      const x = waveProgress * (i / steps)
      const y = waveHeight * Math.sin((i / steps) * Math.PI * 2 + Date.now() * 0.001)
      path += `L ${x},${y} `
    }
    
    path += `L ${waveProgress},1 L 0,1 Z`
    wavePath.value = path
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isAnimating.value = false
    }
  }
  
  requestAnimationFrame(animate)
}

/**
 * Trigger animation based on type
 */
const triggerAnimation = () => {
  if (hasAnimated.value && props.once) return
  if (prefersReducedMotion.value) return
  
  isAnimating.value = true
  hasAnimated.value = true
  
  // Delay if specified
  animationTimeout = setTimeout(() => {
    switch (props.type) {
      case 'circle':
        animateCircle()
        break
      case 'liquid':
        animateLiquid()
        break
      case 'wave':
        animateWave()
        break
      case 'fade':
        // Simple fade handled by CSS
        setTimeout(() => {
          isAnimating.value = false
        }, props.duration)
        break
    }
  }, props.delay)
}

// ============================================
// EASING FUNCTIONS
// ============================================

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4)
const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

// ============================================
// INTERSECTION OBSERVER
// ============================================

const setupObserver = () => {
  if (typeof window === 'undefined' || !sectionRef.value) return
  
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && (!hasAnimated.value || !props.once)) {
          isVisible.value = true
          triggerAnimation()
        } else if (!props.once) {
          isVisible.value = false
          isAnimating.value = false
        }
      })
    },
    {
      threshold: props.threshold,
      rootMargin: '0px'
    }
  )
  
  observer.observe(sectionRef.value)
}

// ============================================
// LIFECYCLE
// ============================================

onMounted(() => {
  detectFeatures()
  setupObserver()
})

onUnmounted(() => {
  if (observer && sectionRef.value) {
    observer.unobserve(sectionRef.value)
    observer.disconnect()
  }
  
  if (animationTimeout) {
    clearTimeout(animationTimeout)
  }
})

// ============================================
// WATCHERS
// ============================================

watch(isVisible, (visible) => {
  if (visible && prefersReducedMotion.value) {
    // Instant reveal for reduced motion
    hasAnimated.value = true
  }
})
</script>

<style scoped>
/* ============================================
   SECTION WRAPPER
   ============================================ */

.section-transition-wrapper {
  position: relative;
  width: 100%;
  /* Prevent layout shift during animation */
  contain: layout style paint;
}

/* Reduced motion fallback */
.section-transition-wrapper.reduced-motion {
  transition: opacity 0.3s ease;
}

.section-transition-wrapper.reduced-motion:not(.is-visible) {
  opacity: 0;
}

.section-transition-wrapper.reduced-motion.is-visible {
  opacity: 1;
}

/* ============================================
   CONTENT WRAPPER
   ============================================ */

.section-content {
  width: 100%;
  height: 100%;
  /* GPU acceleration */
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Remove will-change after animation */
.section-transition-wrapper:not(.is-animating) .section-content {
  will-change: auto;
}

/* ============================================
   SVG DEFINITIONS
   ============================================ */

.clip-path-defs {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
  visibility: hidden;
}

/* ============================================
   FALLBACK ANIMATIONS
   ============================================ */

/* Fade fallback for browsers without mask support */
@supports not (clip-path: circle(50%)) {
  .section-content {
    opacity: 0;
    transition: opacity 1s ease;
  }
  
  .section-transition-wrapper.is-visible .section-content {
    opacity: 1;
  }
}

/* ============================================
   ACCESSIBILITY
   ============================================ */

@media (prefers-reduced-motion: reduce) {
  .section-transition-wrapper {
    transition: opacity 0.2s ease !important;
  }
  
  .section-content {
    clip-path: none !important;
    animation: none !important;
  }
  
  .section-transition-wrapper:not(.is-visible) {
    opacity: 0;
  }
  
  .section-transition-wrapper.is-visible {
    opacity: 1;
  }
}

/* ============================================
   PERFORMANCE OPTIMIZATIONS
   ============================================ */

/* Ensure smooth rendering */
.section-content {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .section-transition-wrapper {
    /* Slightly simpler animations on mobile */
    will-change: opacity;
  }
}
</style>

