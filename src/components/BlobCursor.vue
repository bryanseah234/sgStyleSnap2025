<!--
  BlobCursor - Custom Fluid Cursor Component
  
  A morphing, organic blob cursor that follows the mouse with smooth lerp
  interpolation and responds to different interaction contexts.
  
  Features:
  - Fluid following with lag effect
  - Context-aware states (default, hover, button, drag)
  - Mix blend mode for visual interest
  - Performance optimized (60fps RAF)
  - Touch device detection (disabled on mobile)
  - Edge case handling
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <div
    v-if="isEnabled"
    ref="blobRef"
    class="blob-cursor"
    :class="cursorState"
    :style="cursorStyle"
  >
    <div class="blob-inner"></div>
  </div>
</template>

<script setup>
/**
 * BlobCursor Component Script
 * 
 * Implements a custom fluid cursor with organic morphing animations
 * and context-aware states. Optimized for 60fps performance.
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

// ============================================
// STATE
// ============================================

// Cursor element reference
const blobRef = ref(null)

// Current mouse position
const mouseX = ref(0)
const mouseY = ref(0)

// Current blob position (with lerp lag)
const blobX = ref(0)
const blobY = ref(0)

// Drag velocity for stretching effect
const dragVelocityX = ref(0)
const dragVelocityY = ref(0)

// Previous mouse position for velocity calculation
let prevMouseX = 0
let prevMouseY = 0

// Cursor state
const cursorState = ref('default') // 'default', 'avatar-hover', 'button-hover', 'dragging'

// Animation frame ID
let rafId = null

// Idle timer for will-change optimization
let idleTimer = null

// Mouse activity flag
const isMoving = ref(false)

// Check if cursor should be enabled
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
const isEnabled = ref(!isTouchDevice)

// Track if mouse is inside viewport
const isMouseInViewport = ref(true)

// ============================================
// CONFIGURATION
// ============================================

// Lerp factor (lower = more lag, smoother) - Increased for better responsiveness (30% more responsive)
const LERP_FACTOR = 0.40

// Blob morph animation speed
const MORPH_SPEED = 0.02

// Idle timeout for performance optimization
const IDLE_TIMEOUT = 100 // ms (reduced for better responsiveness)

// ============================================
// COMPUTED STYLES
// ============================================

const cursorStyle = computed(() => {
  // Calculate stretch based on drag velocity for dragging state
  let transformValue = `translate3d(${blobX.value}px, ${blobY.value}px, 0)`
  
  if (cursorState.value === 'dragging') {
    // Calculate angle of drag direction
    const angle = Math.atan2(dragVelocityY.value, dragVelocityX.value) * (180 / Math.PI)
    
    // Calculate stretch amount based on velocity
    const velocityMagnitude = Math.sqrt(dragVelocityX.value ** 2 + dragVelocityY.value ** 2)
    const stretchScale = 1 + Math.min(velocityMagnitude * 0.02, 0.5) // Max 1.5x stretch
    
    transformValue += ` rotate(${angle}deg) scaleX(${stretchScale})`
  }
  
  return {
    transform: transformValue,
    willChange: isMoving.value ? 'transform' : 'auto'
  }
})

// ============================================
// LERP FUNCTION
// ============================================

/**
 * Linear interpolation for smooth following
 */
const lerp = (start, end, factor) => {
  return start + (end - start) * factor
}

// ============================================
// ANIMATION LOOP
// ============================================

/**
 * Main animation loop using requestAnimationFrame
 * Updates blob position with lerp interpolation
 */
const animate = () => {
  // Smooth interpolation to mouse position
  blobX.value = lerp(blobX.value, mouseX.value, LERP_FACTOR)
  blobY.value = lerp(blobY.value, mouseY.value, LERP_FACTOR)
  
  // Calculate velocity for drag stretch effect
  const deltaX = mouseX.value - prevMouseX
  const deltaY = mouseY.value - prevMouseY
  
  // Smooth velocity with lerp - Increased for better responsiveness (30% more responsive)
  dragVelocityX.value = lerp(dragVelocityX.value, deltaX, 0.50)
  dragVelocityY.value = lerp(dragVelocityY.value, deltaY, 0.50)
  
  prevMouseX = mouseX.value
  prevMouseY = mouseY.value
  
  rafId = requestAnimationFrame(animate)
}

// ============================================
// MOUSE TRACKING
// ============================================

/**
 * Handle mouse move
 * Updates mouse position and manages cursor state
 */
const handleMouseMove = (event) => {
  // Update mouse position
  mouseX.value = event.clientX - 16
  mouseY.value = event.clientY - 16
  
  // Mark as moving
  isMoving.value = true
  
  // Reset idle timer for will-change optimization
  clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    isMoving.value = false
  }, IDLE_TIMEOUT)
  
  // Check hover targets and update cursor state
  updateCursorState(event.target)
}

/**
 * Handle mouse enter viewport
 * Teleports cursor to mouse position instantly
 */
const handleMouseEnter = (event) => {
  isMouseInViewport.value = true
  
  // Teleport cursor instantly (no animation)
  mouseX.value = event.clientX
  mouseY.value = event.clientY
  blobX.value = event.clientX
  blobY.value = event.clientY
}

/**
 * Handle mouse leave viewport
 */
const handleMouseLeave = () => {
  isMouseInViewport.value = false
  cursorState.value = 'default'
}

// ============================================
// CURSOR STATE MANAGEMENT
// ============================================

/**
 * Update cursor state based on hover target
 */
const updateCursorState = (target) => {
  if (!target) return
  
  // Check if hovering over 3D avatar canvas
  if (target.classList.contains('avatar-canvas') || target.closest('.avatar-carousel-container')) {
    cursorState.value = 'avatar-hover'
    return
  }
  
  // Check if hovering over buttons or interactive elements
  if (
    target.tagName === 'BUTTON' ||
    target.tagName === 'A' ||
    target.classList.contains('btn') ||
    target.classList.contains('liquid-button') ||
    target.closest('button') ||
    target.closest('a')
  ) {
    cursorState.value = 'button-hover'
    return
  }
  
  // Check if dragging carousel
  if (target.classList.contains('is-dragging') || target.closest('.is-dragging')) {
    cursorState.value = 'dragging'
    return
  }
  
  // Default state
  cursorState.value = 'default'
}

/**
 * Listen for carousel drag events
 */
const handleCarouselDrag = () => {
  const carouselCanvas = document.querySelector('.avatar-canvas')
  
  if (carouselCanvas) {
    // Listen for mouse down on carousel
    carouselCanvas.addEventListener('mousedown', () => {
      cursorState.value = 'dragging'
    })
    
    // Listen for mouse up anywhere
    document.addEventListener('mouseup', () => {
      if (cursorState.value === 'dragging') {
        // Return to default or hover state
        const hoverTarget = document.elementFromPoint(mouseX.value, mouseY.value)
        updateCursorState(hoverTarget)
      }
    })
  }
}

// ============================================
// LIFECYCLE
// ============================================

onMounted(() => {
  // Skip if touch device
  if (isTouchDevice) {
    console.log('🎯 BlobCursor: Touch device detected, cursor disabled')
    document.body.classList.add('touch-device')
    return
  }
  
  // Check for reduced motion preference (safe window access)
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false
  if (prefersReducedMotion) {
    console.log('🎯 BlobCursor: Reduced motion detected, cursor disabled')
    return
  }
  
  // Hide default cursor
  document.body.classList.add('no-cursor')
  // Add event listeners
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseenter', handleMouseEnter)
  document.addEventListener('mouseleave', handleMouseLeave)
  
  // Setup carousel drag detection
  setTimeout(() => {
    handleCarouselDrag()
  }, 1000) // Wait for carousel to mount
  
  // Start animation loop
  animate()
  
  console.log('✅ BlobCursor: Initialized')
})

onUnmounted(() => {
  // Restore default cursor
  document.body.classList.remove('no-cursor')
  // Remove touch device class
  document.body.classList.remove('touch-device')
  
  // Remove event listeners
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseenter', handleMouseEnter)
  document.removeEventListener('mouseleave', handleMouseLeave)
  
  // Cancel animation loop
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  
  // Clear idle timer
  clearTimeout(idleTimer)
  
  console.log('🧹 BlobCursor: Cleaned up')
})
</script>

<style scoped>
/* theme tokens */
:global(html){ --blob:#000; --blob-soft:rgba(0,0,0,.9); --blob-ring:#000; }
:global(html.dark){ --blob:#fff; --blob-soft:rgba(255,255,255,.9); --blob-ring:#fff; }

/* base */
.blob-cursor {
  position: fixed;
  top: 0; left: 0;
  width: 25px; height: 25px;
  pointer-events: none;
  z-index: 9999;
  transition: width .2s cubic-bezier(.34,1.56,.64,1),
              height .2s cubic-bezier(.34,1.56,.64,1);
}
.blob-inner {
  width: 100%; height: 100%;
  background: var(--blob);
  border-radius: 50%;
  animation: blob-morph 8s ease-in-out infinite;
  transition: border-radius .3s cubic-bezier(.34,1.56,.64,1), background .2s ease;
}

/* states */
.blob-cursor.default { width: 25px; height: 25px; transform-origin: center; }
.blob-cursor.default .blob-inner { background: var(--blob); }

.blob-cursor.avatar-hover { width: 63px; height: 63px; }
.blob-cursor.avatar-hover .blob-inner {
  background: var(--blob-soft);
  animation: blob-morph-large 6s ease-in-out infinite;
}

.blob-cursor.button-hover { width: 38px; height: 38px; }
.blob-cursor.button-hover .blob-inner {
  background: transparent;
  border: 2px solid var(--blob-ring);
  border-radius: 50%;
  animation: blob-ring-pulse 2s ease-in-out infinite;
}

.blob-cursor.dragging { width: 38px; height: 28px; transition: width .15s ease, height .15s ease; }
.blob-cursor.dragging .blob-inner {
  background: var(--blob-soft);
  border-radius: 45% 55% 60% 40% / 50% 50% 50% 50%;
  animation: blob-drag-stretch .4s ease-in-out infinite;
}

/* animations */
@keyframes blob-morph {
  0%,100% { border-radius: 50% / 50%; }
  25% { border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%; }
  50% { border-radius: 50% 60% 40% 50% / 60% 50% 50% 40%; }
  75% { border-radius: 40% 50% 60% 50% / 50% 40% 60% 50%; }
}
@keyframes blob-morph-large {
  0%,100% { border-radius: 50% / 50%; transform: rotate(0); }
  25% { border-radius: 60% 40% 55% 45% / 55% 60% 40% 45%; transform: rotate(90deg); }
  50% { border-radius: 45% 55% 40% 60% / 60% 45% 55% 40%; transform: rotate(180deg); }
  75% { border-radius: 55% 45% 60% 40% / 40% 55% 45% 60%; transform: rotate(270deg); }
}
@keyframes blob-ring-pulse {
  0%,100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: .8; }
}
@keyframes blob-drag-stretch {
  0%,100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
  50% { border-radius: 60% 40% 30% 70% / 50% 60% 40% 50%; }
}

/* perf */
.blob-cursor, .blob-inner {
  will-change: auto;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* a11y */
@media (prefers-reduced-motion: reduce) {
  .blob-cursor { display: none; }
  body { cursor: auto !important; }
}

/* page-scoped native cursor hiding */
:global(body.no-cursor:not(.touch-device)) { cursor: none !important; }
:global(body.no-cursor:not(.touch-device) *) { cursor: none !important; }
:global(body.no-cursor:not(.touch-device) a),
:global(body.no-cursor:not(.touch-device) button),
:global(body.no-cursor:not(.touch-device) input),
:global(body.no-cursor:not(.touch-device) textarea) { cursor: none !important; }

/* touch devices keep system cursor */
:global(body.touch-device), :global(body.touch-device *) { cursor: auto !important; }
</style>