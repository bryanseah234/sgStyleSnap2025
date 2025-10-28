<!--
  Avatar3DCarousel - 3D Avatar Carousel Component
  
  A mobile-first, swipeable 3D carousel that displays Ready Player Me avatars
  using Three.js for rendering. Features smooth animations, touch gestures,
  keyboard navigation, and accessibility support.
  
  Props:
  - avatarUrls: Array<string> - Array of Ready Player Me GLB model URLs
  
  Events:
  - @avatar-change: Emitted when active avatar changes (payload: index)
  - @avatar-loaded: Emitted when an avatar successfully loads (payload: index)
  - @loading-error: Emitted when loading fails (payload: { index, error })
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <div class="avatar-carousel-container" ref="containerRef">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner-modern"></div>
      <p class="loading-text">Loading avatars...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="error-state">
      <p class="error-text">Failed to load avatar</p>
      <button @click="retryLoad" class="retry-button">
        Retry
      </button>
    </div>

    <!-- 3D Canvas -->
    <canvas 
      ref="canvasRef" 
      class="avatar-canvas"
      :class="{ 'is-dragging': isDragging }"
      @mousedown="handleMouseDown"
      @touchstart="handleTouchStart"
      @wheel="handleWheel"
      tabindex="0"
      @keydown="handleKeyDown"
      role="region"
      aria-label="3D Avatar Carousel"
    ></canvas>

  </div>
</template>

<script setup>
/**
 * Avatar3DCarousel Component Script
 * 
 * Handles Three.js scene setup, avatar loading, gesture interactions,
 * and carousel animations. Optimized for mobile performance.
 */

import { ref, onMounted, onUnmounted, watch, inject } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// ============================================
// PROPS & EMITS
// ============================================

// Inject Lenis instance from parent (if available)
const lenisInstance = inject<any>('lenis', null)

const props = defineProps({
  avatarUrls: {
    type: Array,
    required: true,
    validator: (value) => value.every(url => typeof url === 'string')
  },
  showInfo: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['avatar-change', 'avatar-loaded', 'loading-error'])

// ============================================
// REFS
// ============================================

const containerRef = ref(null)
const canvasRef = ref(null)
const currentIndex = ref(0)
const isLoading = ref(true)
const hasError = ref(false)
const isDragging = ref(false)

// ============================================
// THREE.JS VARIABLES
// ============================================

let scene, camera, renderer, loader
let avatars = []
let animationFrameId = null
let resizeTimeout = null

// Avatar positioning
const AVATAR_SPACING = 2.5
const ACTIVE_SCALE = 1.0
const INACTIVE_SCALE = 0.75
const INACTIVE_OPACITY = 0.4

// ============================================
// INTERACTION VARIABLES
// ============================================

let touchStartX = 0
let touchStartY = 0
let mouseStartX = 0
let currentOffset = 0
let targetOffset = 0
let isDraggingActive = false
let dragStartOffset = 0

// Swipe threshold (px)
const SWIPE_THRESHOLD = 50

// Auto-scroll variables
let rotationCount = 0
const ROTATIONS_PER_AVATAR = 3
const ROTATION_SPEED = 0.015 // Faster rotation speed

// ============================================
// THREE.JS SCENE SETUP
// ============================================

/**
 * Initialize Three.js scene, camera, renderer, and lighting
 */
const initThreeJS = () => {
  if (!canvasRef.value) return

  // Scene
  scene = new THREE.Scene()
  scene.background = null // Transparent background

  // Camera
  const aspect = canvasRef.value.clientWidth / canvasRef.value.clientHeight
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
  camera.position.set(0, 0.3, 3)
  camera.lookAt(0, 0.1, 0)

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

  // Lighting Setup (Critical for visibility)
  setupLighting()

  // GLTF Loader
  loader = new GLTFLoader()
}

/**
 * Setup comprehensive lighting for Ready Player Me avatars
 */
const setupLighting = () => {
  // Ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambientLight)

  // Main directional light (front-top, 45 degrees)
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.0)
  mainLight.position.set(2, 3, 4)
  mainLight.castShadow = false // Disable shadows for performance
  scene.add(mainLight)

  // Fill light (side, dimmer)
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
  fillLight.position.set(-3, 1, 2)
  scene.add(fillLight)

  // Rim light (behind, subtle)
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3)
  rimLight.position.set(0, 1, -3)
  scene.add(rimLight)

  // Additional soft light from below to prevent dark shadows
  const bottomLight = new THREE.DirectionalLight(0xffffff, 0.2)
  bottomLight.position.set(0, -2, 2)
  scene.add(bottomLight)
}

// ============================================
// AVATAR LOADING
// ============================================

/**
 * Load all avatars from URLs
 */
const loadAvatars = async () => {
  isLoading.value = true
  hasError.value = false

  try {
    // Load avatars with staggered loading for better UX
    const loadPromises = props.avatarUrls.map((url, index) => 
      loadSingleAvatar(url, index)
    )

    // Wait for ALL avatars to load before showing anything
    await Promise.all(loadPromises)
    
    // Position avatars in a row
    positionAvatars()
    
    // Update visibility states
    updateAvatarStates()
    
    // Start animation loop BEFORE hiding loading
    // This ensures the first frame is ready
    renderer.render(scene, camera)
    
    // Hide loading spinner only after everything is ready
    isLoading.value = false
    
    // Start continuous animation loop
    animate()
  } catch (error) {
    console.error('Failed to load avatars:', error)
    hasError.value = true
    isLoading.value = false
    emit('loading-error', { index: -1, error: error.message })
  }
}

/**
 * Load a single avatar GLB model
 */
const loadSingleAvatar = (url, index) => {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const avatar = gltf.scene
        
        // Scale avatar appropriately (larger for full screen display)
        const box = new THREE.Box3().setFromObject(avatar)
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2.2 / maxDim // Larger scale for full viewport
        avatar.scale.setScalar(scale)

        // Center avatar
        const center = box.getCenter(new THREE.Vector3())
        avatar.position.sub(center.multiplyScalar(scale))

        // Create container group for each avatar
        const avatarGroup = new THREE.Group()
        avatarGroup.add(avatar)
        avatarGroup.userData = {
          index,
          model: avatar,
          baseScale: scale
        }

        scene.add(avatarGroup)
        avatars.push(avatarGroup)

        emit('avatar-loaded', index)
        resolve(avatarGroup)
      },
      (progress) => {
        // Optional: Handle loading progress
        const percentComplete = (progress.loaded / progress.total) * 100
        console.log(`Avatar ${index + 1}: ${percentComplete.toFixed(2)}% loaded`)
      },
      (error) => {
        console.error(`Failed to load avatar ${index + 1}:`, error)
        emit('loading-error', { index, error: error.message })
        reject(error)
      }
    )
  })
}

/**
 * Position avatars horizontally in a row
 */
const positionAvatars = () => {
  avatars.forEach((avatarGroup, index) => {
    avatarGroup.position.x = index * AVATAR_SPACING
    avatarGroup.position.y = 0
    avatarGroup.position.z = 0
  })
}

/**
 * Update avatar states (active/inactive)
 */
const updateAvatarStates = () => {
  avatars.forEach((avatarGroup, index) => {
    const isActive = index === currentIndex.value
    
    // Scale
    const targetScale = isActive ? ACTIVE_SCALE : INACTIVE_SCALE
    const baseScale = avatarGroup.userData.baseScale
    avatarGroup.scale.setScalar(baseScale * targetScale)
    
    // Opacity
    avatarGroup.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            mat.transparent = true
            mat.opacity = isActive ? 1.0 : INACTIVE_OPACITY
          })
        } else {
          child.material.transparent = true
          child.material.opacity = isActive ? 1.0 : INACTIVE_OPACITY
        }
      }
    })
  })
}

// ============================================
// ANIMATION LOOP
// ============================================

/**
 * Main animation loop
 * Integrated with Lenis smooth scroll RAF for optimal performance
 */
const animate = (time) => {
  // Don't render if still loading
  if (isLoading.value) {
    return
  }
  
  animationFrameId = requestAnimationFrame(animate)

  // Update Lenis smooth scroll (if available)
  // This ensures Lenis and Three.js share the same animation loop
  if (lenisInstance && time !== undefined) {
    lenisInstance.raf(time)
  }

  // Smooth camera movement (lerp)
  const lerpFactor = 0.1
  currentOffset += (targetOffset - currentOffset) * lerpFactor

  // Update camera position to center active avatar
  const targetX = currentIndex.value * AVATAR_SPACING
  camera.position.x += (targetX - currentOffset - camera.position.x) * lerpFactor

  // Auto-rotate and advance carousel (if reduced motion is not preferred)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !isDraggingActive) {
    const activeAvatar = avatars[currentIndex.value]
    if (activeAvatar && activeAvatar.userData.model) {
      const previousRotation = activeAvatar.userData.model.rotation.y
      activeAvatar.userData.model.rotation.y += ROTATION_SPEED
      
      // Check if we've completed a full rotation (2π radians)
      if (Math.floor(previousRotation / (Math.PI * 2)) < Math.floor(activeAvatar.userData.model.rotation.y / (Math.PI * 2))) {
        rotationCount++
        
        // After 3 rotations, move to next avatar
        if (rotationCount >= ROTATIONS_PER_AVATAR) {
          rotationCount = 0
          
          // Move to next avatar with looping
          if (currentIndex.value < props.avatarUrls.length - 1) {
            currentIndex.value++
          } else {
            // Loop back to first avatar
            currentIndex.value = 0
          }
          
          snapToAvatar(currentIndex.value)
          emit('avatar-change', currentIndex.value)
        }
      }
    }
  }

  renderer.render(scene, camera)
}

// ============================================
// INTERACTION HANDLERS
// ============================================

/**
 * Handle mouse down
 */
const handleMouseDown = (event) => {
  if (event.button !== 0) return // Only left click
  
  isDraggingActive = true
  isDragging.value = true
  mouseStartX = event.clientX
  dragStartOffset = currentOffset
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  
  event.preventDefault()
}

/**
 * Handle mouse move
 */
const handleMouseMove = (event) => {
  if (!isDraggingActive) return
  
  const deltaX = event.clientX - mouseStartX
  const normalizedDelta = deltaX / canvasRef.value.clientWidth
  currentOffset = dragStartOffset + normalizedDelta * AVATAR_SPACING
}

/**
 * Handle mouse up
 */
const handleMouseUp = (event) => {
  if (!isDraggingActive) return
  
  isDraggingActive = false
  isDragging.value = false
  
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  
  // Determine swipe direction
  const deltaX = event.clientX - mouseStartX
  
  if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
    if (deltaX > 0) {
      navigatePrevious()
    } else {
      navigateNext()
    }
  } else {
    // Snap back to current avatar
    snapToAvatar(currentIndex.value)
  }
}

/**
 * Handle touch start
 */
const handleTouchStart = (event) => {
  if (event.touches.length !== 1) return
  
  const touch = event.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  isDraggingActive = true
  isDragging.value = true
  dragStartOffset = currentOffset
  
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
}

/**
 * Handle touch move
 */
const handleTouchMove = (event) => {
  if (!isDraggingActive || event.touches.length !== 1) return
  
  const touch = event.touches[0]
  const deltaX = touch.clientX - touchStartX
  const deltaY = touch.clientY - touchStartY
  
  // Determine if horizontal or vertical swipe
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe - prevent vertical scroll
    event.preventDefault()
    
    const normalizedDelta = deltaX / canvasRef.value.clientWidth
    currentOffset = dragStartOffset + normalizedDelta * AVATAR_SPACING
  }
}

/**
 * Handle touch end
 */
const handleTouchEnd = (event) => {
  if (!isDraggingActive) return
  
  isDraggingActive = false
  isDragging.value = false
  
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  
  const touch = event.changedTouches[0]
  const deltaX = touch.clientX - touchStartX
  
  if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
    if (deltaX > 0) {
      navigatePrevious()
    } else {
      navigateNext()
    }
  } else {
    snapToAvatar(currentIndex.value)
  }
}

/**
 * Handle mouse wheel (optional scroll navigation)
 */
const handleWheel = (event) => {
  event.preventDefault()
  
  if (event.deltaY > 0) {
    navigateNext()
  } else if (event.deltaY < 0) {
    navigatePrevious()
  }
}

/**
 * Handle keyboard navigation
 */
const handleKeyDown = (event) => {
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      navigatePrevious()
      break
    case 'ArrowRight':
      event.preventDefault()
      navigateNext()
      break
    case 'Home':
      event.preventDefault()
      jumpToAvatar(0)
      break
    case 'End':
      event.preventDefault()
      jumpToAvatar(props.avatarUrls.length - 1)
      break
  }
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

/**
 * Navigate to next avatar
 */
const navigateNext = () => {
  if (currentIndex.value < props.avatarUrls.length - 1) {
    currentIndex.value++
    snapToAvatar(currentIndex.value)
    emit('avatar-change', currentIndex.value)
  } else {
    // Bounce back if at end
    snapToAvatar(currentIndex.value)
  }
}

/**
 * Navigate to previous avatar
 */
const navigatePrevious = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    snapToAvatar(currentIndex.value)
    emit('avatar-change', currentIndex.value)
  } else {
    // Bounce back if at start
    snapToAvatar(currentIndex.value)
  }
}

/**
 * Jump to specific avatar
 */
const jumpToAvatar = (index) => {
  if (index >= 0 && index < props.avatarUrls.length) {
    currentIndex.value = index
    snapToAvatar(index)
    emit('avatar-change', index)
  }
}

/**
 * Snap to specific avatar with smooth animation
 */
const snapToAvatar = (index) => {
  targetOffset = index * AVATAR_SPACING
  updateAvatarStates()
}

/**
 * Retry loading avatars
 */
const retryLoad = () => {
  // Clean up existing scene
  cleanupThreeJS()
  
  // Reinitialize
  initThreeJS()
  loadAvatars()
}

// ============================================
// RESPONSIVE HANDLING
// ============================================

/**
 * Handle window resize
 */
const handleResize = () => {
  clearTimeout(resizeTimeout)
  
  resizeTimeout = setTimeout(() => {
    if (!canvasRef.value || !camera || !renderer) return
    
    const width = canvasRef.value.clientWidth
    const height = canvasRef.value.clientHeight
    
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }, 150) // Debounce 150ms
}

// ============================================
// CLEANUP
// ============================================

/**
 * Clean up Three.js resources
 */
const cleanupThreeJS = () => {
  // Cancel animation loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  // Dispose avatars
  avatars.forEach(avatarGroup => {
    avatarGroup.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose()
        
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.map) mat.map.dispose()
              if (mat.normalMap) mat.normalMap.dispose()
              if (mat.roughnessMap) mat.roughnessMap.dispose()
              if (mat.metalnessMap) mat.metalnessMap.dispose()
              mat.dispose()
            })
          } else {
            if (child.material.map) child.material.map.dispose()
            if (child.material.normalMap) child.material.normalMap.dispose()
            if (child.material.roughnessMap) child.material.roughnessMap.dispose()
            if (child.material.metalnessMap) child.material.metalnessMap.dispose()
            child.material.dispose()
          }
        }
      }
    })
    scene.remove(avatarGroup)
  })
  avatars = []

  // Dispose renderer
  if (renderer) {
    renderer.dispose()
    renderer = null
  }

  // Clear scene
  if (scene) {
    scene.clear()
    scene = null
  }

  camera = null
}

// ============================================
// LIFECYCLE HOOKS
// ============================================

onMounted(() => {
  initThreeJS()
  loadAvatars()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  cleanupThreeJS()
})

// Watch for currentIndex changes
watch(currentIndex, () => {
  updateAvatarStates()
})
</script>

<style scoped>
/* ============================================
   CONTAINER STYLES
   ============================================ */

.avatar-carousel-container {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 500px;
  overflow: hidden;
  border-radius: 1rem;
}

@media (min-width: 768px) {
  .avatar-carousel-container {
    height: 100vh;
    min-height: 700px;
  }
}

/* ============================================
   CANVAS STYLES
   ============================================ */

.avatar-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  outline: none;
  touch-action: pan-y; /* Allow vertical scroll, prevent horizontal */
}

.avatar-canvas:focus {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.avatar-canvas.is-dragging {
  cursor: grabbing;
  will-change: transform;
}

.avatar-canvas:not(.is-dragging) {
  will-change: auto;
}

/* ============================================
   LOADING STATE
   ============================================ */

.loading-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: hsl(var(--background));
  backdrop-filter: blur(4px);
  z-index: 10;
}

.loading-text {
  font-size: 1rem;
  color: hsl(var(--muted-foreground));
  font-weight: 500;
}

/* ============================================
   ERROR STATE
   ============================================ */

.error-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: hsl(var(--background) / 0.95);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.error-text {
  font-size: 1.125rem;
  color: hsl(var(--destructive));
  font-weight: 600;
}

.retry-button {
  px: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: hsl(var(--primary) / 0.9);
  transform: translateY(-2px);
}

.retry-button:active {
  transform: scale(0.98);
}


/* ============================================
   ACCESSIBILITY
   ============================================ */

@media (prefers-reduced-motion: reduce) {
  .avatar-canvas,
  .nav-dot,
  .nav-dot::before,
  .retry-button {
    transition: none !important;
    animation: none !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .nav-dot::before {
    border: 2px solid currentColor;
  }
  
  .navigation-dots {
    background: hsl(var(--background));
    border: 2px solid hsl(var(--foreground));
  }
}
</style>

