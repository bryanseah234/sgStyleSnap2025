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
      :class="{ 'is-dragging': isDragging, 'has-parallax': isParallaxActive }"
      @mousedown="handleMouseDown"
      @touchstart="handleTouchStart"
      @wheel="handleWheel"
      @mousemove="handleParallaxMouseMove"
      @mouseleave="handleParallaxMouseLeave"
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
const isParallaxActive = ref(false)

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
// PARALLAX VARIABLES
// ============================================

// Mouse position (normalized to -1 to 1)
let mouseX = 0
let mouseY = 0

// Target mouse position for smooth interpolation
let targetMouseX = 0
let targetMouseY = 0

// Camera base position and rotation (stored for reference)
let baseCameraPosition = { x: 0, y: 0.3, z: 3 }
let baseCameraRotation = { x: 0, y: 0, z: 0 }

// Parallax configuration
const PARALLAX_CONFIG = {
  enabled: true, // Will be disabled on mobile/touch
  maxRotation: 0.087, // 5 degrees in radians (5 * Math.PI / 180)
  maxPositionOffset: 0.5, // Maximum position change in units
  lerpFactor: 0.08, // Smooth interpolation factor (0.05-0.1)
  inactiveBlurAmount: 1.5 // Subtle blur for non-active avatars (px)
}

// Check if device has touch capability
const isTouchDevice = () => {
  return ('ontouchstart' in window) || 
         (navigator.maxTouchPoints > 0) ||
         (navigator.msMaxTouchPoints > 0)
}

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
const SWIPE_THRESHOLD = 10 // Reduced for better tap detection

// Auto-scroll variables
let rotationCount = 0
const ROTATIONS_PER_AVATAR = 3
const ROTATION_SPEED = 0.015 // Faster rotation speed

// ============================================
// MOMENTUM PHYSICS VARIABLES
// ============================================

// Velocity tracking
let dragStartTime = 0
let lastDragX = 0
let lastDragTime = 0
let velocity = 0
let momentumAnimationId = null

// Momentum configuration
const MOMENTUM_CONFIG = {
  enabled: true,
  velocityThreshold: 0.5, // px/ms - threshold between fast and slow swipe
  maxVelocity: 3.0, // Maximum velocity to cap extreme swipes
  decelerationRate: 0.95, // Exponential decay (0.93-0.97 typical)
  minVelocity: 0.01, // Stop momentum when below this
  duration: { min: 300, max: 600 }, // Momentum duration range
  tapTimeThreshold: 200, // Max time for tap (ms)
  tapDistanceThreshold: 10, // Max distance for tap (px)
}

// Rubber-band configuration
const RUBBERBAND_CONFIG = {
  enabled: true,
  maxOverscroll: 80, // Max pixels beyond bounds
  resistance: 0.4, // Resistance factor (lower = more resistance)
  bounceBackDuration: 400, // Bounce-back animation duration (ms)
}

// Visual feedback configuration
const VISUAL_FEEDBACK = {
  dragScaleActive: 1.05, // Scale for active avatar during drag
  dragScaleInactive: 0.95, // Scale for inactive avatars during drag
  motionBlurEnabled: false, // Motion blur (disabled by default for performance)
  motionBlurMax: 2, // Max blur amount in px
}

// Haptic feedback configuration
const HAPTIC_CONFIG = {
  enabled: true,
  snapPattern: [10], // Light vibration on snap
  edgePattern: [20, 10, 20], // Stronger pattern on edge bounce
}

// Check for Vibration API support
const supportsVibration = () => {
  return 'vibrate' in navigator
}

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
 * Now includes parallax depth effect
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

  // === PARALLAX DEPTH EFFECT ===
  // Smooth interpolation of mouse position
  if (PARALLAX_CONFIG.enabled && !isTouchDevice() && !isDraggingActive) {
    // Lerp current mouse position towards target
    mouseX += (targetMouseX - mouseX) * PARALLAX_CONFIG.lerpFactor
    mouseY += (targetMouseY - mouseY) * PARALLAX_CONFIG.lerpFactor
    
    // Apply parallax transformations to camera
    applyParallaxToCamera()
  } else if (!PARALLAX_CONFIG.enabled || isTouchDevice() || isDraggingActive) {
    // Reset to base position/rotation when parallax is disabled or dragging
    resetCameraParallax()
  }

  // Smooth camera movement (lerp)
  const lerpFactor = 0.1
  currentOffset += (targetOffset - currentOffset) * lerpFactor

  // Update camera position to center active avatar
  const targetX = currentIndex.value * AVATAR_SPACING
  camera.position.x += (targetX - currentOffset - camera.position.x) * lerpFactor

  // Apply continuous visual feedback during drag
  if (isDraggingActive) {
    applyDragVisualFeedback(true)
  }

  // Auto-rotate and advance carousel (if reduced motion is not preferred)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !isDraggingActive && !momentumAnimationId) {
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
// EASING FUNCTIONS
// ============================================

/**
 * Easing functions for smooth animations
 */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4)
const easeOutElastic = (t) => {
  const c4 = (2 * Math.PI) / 3
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

// ============================================
// MOMENTUM PHYSICS FUNCTIONS
// ============================================

/**
 * Calculate velocity from drag movement
 * @param {number} distance - Distance traveled in pixels
 * @param {number} time - Time elapsed in milliseconds
 * @returns {number} Velocity in pixels per millisecond
 */
const calculateVelocity = (distance, time) => {
  if (time === 0) return 0
  const vel = distance / time
  // Cap velocity to prevent extreme values
  return Math.max(-MOMENTUM_CONFIG.maxVelocity, Math.min(MOMENTUM_CONFIG.maxVelocity, vel))
}

/**
 * Apply rubber-band resistance at boundaries
 * @param {number} offset - Current offset
 * @param {number} min - Minimum bound
 * @param {number} max - Maximum bound
 * @returns {number} Adjusted offset with rubber-band effect
 */
const applyRubberBandResistance = (offset, min, max) => {
  if (!RUBBERBAND_CONFIG.enabled) {
    // Hard clamp if rubber-band disabled
    return Math.max(min, Math.min(max, offset))
  }
  
  if (offset < min) {
    // Over-scrolled past start
    const overscroll = min - offset
    const resistedOverscroll = overscroll * RUBBERBAND_CONFIG.resistance
    return min - Math.min(resistedOverscroll, RUBBERBAND_CONFIG.maxOverscroll)
  } else if (offset > max) {
    // Over-scrolled past end
    const overscroll = offset - max
    const resistedOverscroll = overscroll * RUBBERBAND_CONFIG.resistance
    return max + Math.min(resistedOverscroll, RUBBERBAND_CONFIG.maxOverscroll)
  }
  
  return offset
}

/**
 * Check if offset is outside bounds
 * @param {number} offset - Current offset
 * @param {number} min - Minimum bound
 * @param {number} max - Maximum bound
 * @returns {boolean} True if outside bounds
 */
const isOutsideBounds = (offset, min, max) => {
  return offset < min || offset > max
}

/**
 * Find nearest avatar index for snapping
 * @param {number} offset - Current offset
 * @returns {number} Avatar index
 */
const findNearestAvatarIndex = (offset) => {
  const index = Math.round(offset / AVATAR_SPACING)
  return Math.max(0, Math.min(props.avatarUrls.length - 1, index))
}

/**
 * Apply momentum scrolling with physics
 * @param {number} initialVelocity - Starting velocity in px/ms
 */
const applyMomentumScroll = (initialVelocity) => {
  // Cancel any existing momentum
  if (momentumAnimationId) {
    cancelAnimationFrame(momentumAnimationId)
    momentumAnimationId = null
  }
  
  // Don't apply momentum if velocity is too low
  if (Math.abs(initialVelocity) < MOMENTUM_CONFIG.velocityThreshold) {
    snapToNearestAvatar()
    return
  }
  
  const startOffset = currentOffset
  const startTime = performance.now()
  let currentVelocity = initialVelocity
  
  const animate = (now) => {
    const elapsed = now - startTime
    
    // Apply exponential deceleration
    currentVelocity *= MOMENTUM_CONFIG.decelerationRate
    
    // Stop if velocity is too low
    if (Math.abs(currentVelocity) < MOMENTUM_CONFIG.minVelocity || elapsed > MOMENTUM_CONFIG.duration.max) {
      momentumAnimationId = null
      snapToNearestAvatar()
      return
    }
    
    // Update offset with current velocity
    const deltaOffset = currentVelocity * 16 // Approximate frame time
    currentOffset += deltaOffset
    
    // Apply rubber-band at edges
    const minOffset = 0
    const maxOffset = (props.avatarUrls.length - 1) * AVATAR_SPACING
    
    if (isOutsideBounds(currentOffset, minOffset, maxOffset)) {
      // Hit boundary - trigger haptic feedback and stop momentum
      triggerHapticFeedback('edge')
      momentumAnimationId = null
      snapBackToBounds()
      return
    }
    
    momentumAnimationId = requestAnimationFrame(animate)
  }
  
  momentumAnimationId = requestAnimationFrame(animate)
}

/**
 * Snap to nearest avatar with appropriate animation
 */
const snapToNearestAvatar = () => {
  const nearestIndex = findNearestAvatarIndex(currentOffset)
  const targetOffsetValue = nearestIndex * AVATAR_SPACING
  const distance = Math.abs(targetOffsetValue - currentOffset)
  
  // Calculate snap duration based on distance (100-300ms range)
  const duration = Math.min(300, Math.max(100, distance * 2))
  
  animateToOffset(targetOffsetValue, duration, easeOutQuart, () => {
    currentIndex.value = nearestIndex
    emit('avatar-change', nearestIndex)
    triggerHapticFeedback('snap')
    removeWillChange()
  })
}

/**
 * Snap back to bounds with elastic bounce
 */
const snapBackToBounds = () => {
  const minOffset = 0
  const maxOffset = (props.avatarUrls.length - 1) * AVATAR_SPACING
  
  let targetOffsetValue = currentOffset
  if (currentOffset < minOffset) {
    targetOffsetValue = minOffset
  } else if (currentOffset > maxOffset) {
    targetOffsetValue = maxOffset
  }
  
  animateToOffset(targetOffsetValue, RUBBERBAND_CONFIG.bounceBackDuration, easeOutElastic, () => {
    const nearestIndex = findNearestAvatarIndex(targetOffsetValue)
    currentIndex.value = nearestIndex
    emit('avatar-change', nearestIndex)
    removeWillChange()
  })
}

/**
 * Animate offset to target value
 * @param {number} target - Target offset
 * @param {number} duration - Animation duration in ms
 * @param {Function} easingFn - Easing function
 * @param {Function} onComplete - Callback when complete
 */
const animateToOffset = (target, duration, easingFn, onComplete) => {
  const start = currentOffset
  const startTime = performance.now()
  
  const animate = (now) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easingFn(progress)
    
    currentOffset = start + (target - start) * easedProgress
    targetOffset = currentOffset
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      if (onComplete) onComplete()
    }
  }
  
  requestAnimationFrame(animate)
}

/**
 * Trigger haptic feedback
 * @param {string} type - Type of feedback ('snap' or 'edge')
 */
const triggerHapticFeedback = (type) => {
  if (!HAPTIC_CONFIG.enabled || !supportsVibration()) return
  
  try {
    if (type === 'snap') {
      navigator.vibrate(HAPTIC_CONFIG.snapPattern)
    } else if (type === 'edge') {
      navigator.vibrate(HAPTIC_CONFIG.edgePattern)
    }
  } catch (error) {
    // Silently fail if vibration not supported
    console.debug('Haptic feedback not supported:', error)
  }
}

/**
 * Add will-change hint for performance
 */
const addWillChange = () => {
  if (canvasRef.value) {
    canvasRef.value.style.willChange = 'transform'
  }
}

/**
 * Remove will-change to free resources
 */
const removeWillChange = () => {
  if (canvasRef.value) {
    canvasRef.value.style.willChange = 'auto'
  }
}

/**
 * Apply visual feedback during drag
 * @param {boolean} isDragging - Whether currently dragging
 */
const applyDragVisualFeedback = (isDragging) => {
  if (avatars.length === 0) return
  
  avatars.forEach((avatarGroup, index) => {
    const isActive = index === currentIndex.value
    const baseScale = avatarGroup.userData.baseScale
    
    let targetScale = ACTIVE_SCALE
    if (isDragging) {
      targetScale = isActive ? 
        ACTIVE_SCALE * VISUAL_FEEDBACK.dragScaleActive : 
        INACTIVE_SCALE * VISUAL_FEEDBACK.dragScaleInactive
    } else {
      targetScale = isActive ? ACTIVE_SCALE : INACTIVE_SCALE
    }
    
    // Smooth scale transition
    const currentScale = avatarGroup.scale.x / baseScale
    const newScale = currentScale + (targetScale - currentScale) * 0.2
    avatarGroup.scale.setScalar(baseScale * newScale)
  })
}

// ============================================
// PARALLAX FUNCTIONS
// ============================================

/**
 * Handle parallax mouse movement
 * Normalizes mouse coordinates to -1 to 1 range
 */
const handleParallaxMouseMove = (event) => {
  // Disable parallax on touch devices or when dragging
  if (isTouchDevice() || isDraggingActive) return
  
  if (!canvasRef.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  
  // Normalize mouse position to -1 to 1
  // Center of screen is (0, 0)
  targetMouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
  targetMouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  // Clamp values to ensure they stay within bounds
  targetMouseX = Math.max(-1, Math.min(1, targetMouseX))
  targetMouseY = Math.max(-1, Math.min(1, targetMouseY))
  
  isParallaxActive.value = true
}

/**
 * Handle mouse leaving canvas
 * Smoothly reset camera to center position
 */
const handleParallaxMouseLeave = () => {
  // Smoothly return to center
  targetMouseX = 0
  targetMouseY = 0
  isParallaxActive.value = false
}

/**
 * Apply parallax transformation to camera
 * Creates depth illusion through rotation and position offset
 */
const applyParallaxToCamera = () => {
  if (!camera) return
  
  // Calculate target rotation based on mouse position
  // Maximum rotation is ~5 degrees in any direction
  const targetRotationY = mouseX * PARALLAX_CONFIG.maxRotation
  const targetRotationX = mouseY * PARALLAX_CONFIG.maxRotation * 0.5 // Less vertical rotation
  
  // Calculate target position offset
  // Subtle movement to enhance depth
  const targetOffsetY = mouseY * PARALLAX_CONFIG.maxPositionOffset * 0.3
  const targetOffsetZ = Math.abs(mouseX) * PARALLAX_CONFIG.maxPositionOffset * 0.2
  
  // Apply rotation (already smooth from lerp in animate loop)
  camera.rotation.y = targetRotationY
  camera.rotation.x = targetRotationX
  
  // Apply position offset relative to base position
  // Don't interfere with carousel's horizontal movement
  camera.position.y = baseCameraPosition.y + targetOffsetY
  camera.position.z = baseCameraPosition.z - targetOffsetZ
  
  // Update avatar blur states for depth effect
  updateAvatarBlurStates()
}

/**
 * Reset camera to base position/rotation
 * Used when parallax is disabled or user is dragging
 */
const resetCameraParallax = () => {
  if (!camera) return
  
  // Smoothly lerp back to neutral rotation
  const resetLerp = 0.1
  camera.rotation.y += (0 - camera.rotation.y) * resetLerp
  camera.rotation.x += (0 - camera.rotation.x) * resetLerp
  
  // Reset position (except x which is controlled by carousel)
  camera.position.y += (baseCameraPosition.y - camera.position.y) * resetLerp
  camera.position.z += (baseCameraPosition.z - camera.position.z) * resetLerp
  
  // Clear any blur effects
  if (avatars.length > 0) {
    avatars.forEach((avatarGroup, index) => {
      const isActive = index === currentIndex.value
      if (!isActive) {
        avatarGroup.traverse((child) => {
          if (child.isMesh && child.material) {
            // Remove blur effect
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat.userData.originalOpacity !== undefined) {
                  mat.opacity = mat.userData.originalOpacity
                }
              })
            } else if (child.material.userData.originalOpacity !== undefined) {
              child.material.opacity = child.material.userData.originalOpacity
            }
          }
        })
      }
    })
  }
}

/**
 * Update blur states on non-active avatars during parallax
 * Creates focus effect on centered avatar
 */
const updateAvatarBlurStates = () => {
  // Skip if no avatars or parallax not very active
  if (avatars.length === 0) return
  
  // Calculate parallax intensity (0 to 1)
  const intensity = Math.sqrt(mouseX * mouseX + mouseY * mouseY) / Math.sqrt(2)
  
  // Only apply subtle effect when parallax is notably active
  if (intensity < 0.2) return
  
  avatars.forEach((avatarGroup, index) => {
    const isActive = index === currentIndex.value
    
    if (!isActive) {
      // Apply very subtle opacity reduction to non-active avatars
      avatarGroup.traverse((child) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              // Store original opacity if not already stored
              if (mat.userData.originalOpacity === undefined) {
                mat.userData.originalOpacity = mat.opacity
              }
              // Subtle reduction (max 10% reduction)
              const reductionFactor = 0.9 - (intensity * 0.1)
              mat.opacity = mat.userData.originalOpacity * reductionFactor
            })
          } else {
            if (child.material.userData.originalOpacity === undefined) {
              child.material.userData.originalOpacity = child.material.opacity
            }
            const reductionFactor = 0.9 - (intensity * 0.1)
            child.material.opacity = child.material.userData.originalOpacity * reductionFactor
          }
        }
      })
    }
  })
}

// ============================================
// INTERACTION HANDLERS
// ============================================

/**
 * Handle mouse down
 */
const handleMouseDown = (event) => {
  if (event.button !== 0) return // Only left click
  
  // Cancel any ongoing momentum
  if (momentumAnimationId) {
    cancelAnimationFrame(momentumAnimationId)
    momentumAnimationId = null
  }
  
  isDraggingActive = true
  isDragging.value = true
  mouseStartX = event.clientX
  dragStartOffset = currentOffset
  
  // Initialize velocity tracking
  dragStartTime = performance.now()
  lastDragX = event.clientX
  lastDragTime = dragStartTime
  velocity = 0
  
  // Add will-change for performance
  addWillChange()
  
  // Apply drag visual feedback
  applyDragVisualFeedback(true)
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  
  event.preventDefault()
}

/**
 * Handle mouse move
 */
const handleMouseMove = (event) => {
  if (!isDraggingActive) return
  
  const now = performance.now()
  const currentX = event.clientX
  
  // Track velocity
  const timeDelta = now - lastDragTime
  if (timeDelta > 0) {
    const distanceDelta = currentX - lastDragX
    velocity = calculateVelocity(distanceDelta, timeDelta)
  }
  
  lastDragX = currentX
  lastDragTime = now
  
  const deltaX = currentX - mouseStartX
  const normalizedDelta = deltaX / canvasRef.value.clientWidth
  const targetOffsetValue = dragStartOffset + normalizedDelta * AVATAR_SPACING
  
  // Apply rubber-band resistance at bounds
  const minOffset = 0
  const maxOffset = (props.avatarUrls.length - 1) * AVATAR_SPACING
  currentOffset = applyRubberBandResistance(targetOffsetValue, minOffset, maxOffset)
  targetOffset = currentOffset
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
  
  // Remove drag visual feedback
  applyDragVisualFeedback(false)
  
  // Calculate final metrics
  const deltaX = event.clientX - mouseStartX
  const timeDelta = performance.now() - dragStartTime
  const distanceAbs = Math.abs(deltaX)
  
  // Check if this was a tap (not a drag)
  if (distanceAbs < MOMENTUM_CONFIG.tapDistanceThreshold && 
      timeDelta < MOMENTUM_CONFIG.tapTimeThreshold) {
    // Treat as tap - just snap to nearest
    snapToNearestAvatar()
    return
  }
  
  // Check if we're outside bounds - need to snap back
  const minOffset = 0
  const maxOffset = (props.avatarUrls.length - 1) * AVATAR_SPACING
  if (isOutsideBounds(currentOffset, minOffset, maxOffset)) {
    triggerHapticFeedback('edge')
    snapBackToBounds()
    return
  }
  
  // Apply momentum based on velocity
  if (MOMENTUM_CONFIG.enabled) {
    applyMomentumScroll(velocity)
  } else {
    // Fallback: simple snap
    snapToNearestAvatar()
  }
}

/**
 * Handle touch start
 */
const handleTouchStart = (event) => {
  if (event.touches.length !== 1) return
  
  // Cancel any ongoing momentum
  if (momentumAnimationId) {
    cancelAnimationFrame(momentumAnimationId)
    momentumAnimationId = null
  }
  
  const touch = event.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  isDraggingActive = true
  isDragging.value = true
  dragStartOffset = currentOffset
  
  // Initialize velocity tracking
  dragStartTime = performance.now()
  lastDragX = touch.clientX
  lastDragTime = dragStartTime
  velocity = 0
  
  // Add will-change for performance
  addWillChange()
  
  // Apply drag visual feedback
  applyDragVisualFeedback(true)
  
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
}

/**
 * Handle touch move
 */
const handleTouchMove = (event) => {
  if (!isDraggingActive || event.touches.length !== 1) return
  
  const touch = event.touches[0]
  const now = performance.now()
  const currentX = touch.clientX
  
  const deltaX = currentX - touchStartX
  const deltaY = touch.clientY - touchStartY
  
  // Determine if horizontal or vertical swipe
  // Only capture horizontal swipes, allow vertical scrolling
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe - prevent vertical scroll
    event.preventDefault()
    
    // Track velocity
    const timeDelta = now - lastDragTime
    if (timeDelta > 0) {
      const distanceDelta = currentX - lastDragX
      velocity = calculateVelocity(distanceDelta, timeDelta)
    }
    
    lastDragX = currentX
    lastDragTime = now
    
    const normalizedDelta = deltaX / canvasRef.value.clientWidth
    const targetOffsetValue = dragStartOffset + normalizedDelta * AVATAR_SPACING
    
    // Apply rubber-band resistance at bounds
    const minOffset = 0
    const maxOffset = (props.avatarUrls.length - 1) * AVATAR_SPACING
    currentOffset = applyRubberBandResistance(targetOffsetValue, minOffset, maxOffset)
    targetOffset = currentOffset
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
  
  // Remove drag visual feedback
  applyDragVisualFeedback(false)
  
  const touch = event.changedTouches[0]
  const deltaX = touch.clientX - touchStartX
  const timeDelta = performance.now() - dragStartTime
  const distanceAbs = Math.abs(deltaX)
  
  // Check if this was a tap (not a swipe)
  if (distanceAbs < MOMENTUM_CONFIG.tapDistanceThreshold && 
      timeDelta < MOMENTUM_CONFIG.tapTimeThreshold) {
    // Treat as tap - just snap to nearest
    snapToNearestAvatar()
    return
  }
  
  // Check if we're outside bounds - need to snap back
  const minOffset = 0
  const maxOffset = (props.avatarUrls.length - 1) * AVATAR_SPACING
  if (isOutsideBounds(currentOffset, minOffset, maxOffset)) {
    triggerHapticFeedback('edge')
    snapBackToBounds()
    return
  }
  
  // Apply momentum based on velocity
  if (MOMENTUM_CONFIG.enabled) {
    applyMomentumScroll(velocity)
  } else {
    // Fallback: simple snap
    snapToNearestAvatar()
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
  // Cancel any momentum
  if (momentumAnimationId) {
    cancelAnimationFrame(momentumAnimationId)
    momentumAnimationId = null
  }
  
  if (currentIndex.value < props.avatarUrls.length - 1) {
    const targetIndex = currentIndex.value + 1
    const targetOffsetValue = targetIndex * AVATAR_SPACING
    
    animateToOffset(targetOffsetValue, 250, easeOutQuart, () => {
      currentIndex.value = targetIndex
      emit('avatar-change', targetIndex)
      triggerHapticFeedback('snap')
      removeWillChange()
    })
  } else {
    // At end - subtle bounce
    triggerHapticFeedback('edge')
    const currentOffsetValue = currentIndex.value * AVATAR_SPACING
    animateToOffset(currentOffsetValue, 200, easeOutElastic, () => {
      removeWillChange()
    })
  }
}

/**
 * Navigate to previous avatar
 */
const navigatePrevious = () => {
  // Cancel any momentum
  if (momentumAnimationId) {
    cancelAnimationFrame(momentumAnimationId)
    momentumAnimationId = null
  }
  
  if (currentIndex.value > 0) {
    const targetIndex = currentIndex.value - 1
    const targetOffsetValue = targetIndex * AVATAR_SPACING
    
    animateToOffset(targetOffsetValue, 250, easeOutQuart, () => {
      currentIndex.value = targetIndex
      emit('avatar-change', targetIndex)
      triggerHapticFeedback('snap')
      removeWillChange()
    })
  } else {
    // At start - subtle bounce
    triggerHapticFeedback('edge')
    const currentOffsetValue = currentIndex.value * AVATAR_SPACING
    animateToOffset(currentOffsetValue, 200, easeOutElastic, () => {
      removeWillChange()
    })
  }
}

/**
 * Jump to specific avatar
 */
const jumpToAvatar = (index) => {
  // Cancel any momentum
  if (momentumAnimationId) {
    cancelAnimationFrame(momentumAnimationId)
    momentumAnimationId = null
  }
  
  if (index >= 0 && index < props.avatarUrls.length) {
    const targetOffsetValue = index * AVATAR_SPACING
    const distance = Math.abs(targetOffsetValue - currentOffset)
    const duration = Math.min(400, Math.max(200, distance))
    
    animateToOffset(targetOffsetValue, duration, easeOutQuart, () => {
      currentIndex.value = index
      emit('avatar-change', index)
      triggerHapticFeedback('snap')
      removeWillChange()
    })
  }
}

/**
 * Snap to specific avatar with smooth animation
 * @deprecated Use animateToOffset directly for better control
 */
const snapToAvatar = (index) => {
  jumpToAvatar(index)
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
  // Disable parallax on touch devices
  if (isTouchDevice()) {
    PARALLAX_CONFIG.enabled = false
    console.log('Parallax disabled: Touch device detected')
  }
  
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

.avatar-canvas.has-parallax {
  /* Subtle visual feedback that parallax is active */
  will-change: transform, filter;
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

