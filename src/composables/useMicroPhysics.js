/**
 * Microphysics Composable
 * 
 * Provides spring/mass/damping physics for realistic liquid glass
 * interactions with iOS 26-inspired microphysics.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  SPRING_CONFIGS, 
  calculateSpring, 
  calculateLiquidDip, 
  calculateRefraction,
  calculateSurfaceTension,
  clampForPerformance,
  adjustForAccessibility
} from '@/utils/physics'

/**
 * Liquid Dip Physics for Buttons
 * 
 * Provides liquid dip effect when pressing into viscous glass
 */
export function useLiquidDip() {
  const elementRef = ref(null)
  const isPressed = ref(false)
  const pressure = ref(0)
  const velocity = ref(0)
  const animationId = ref(null)
  
  // Spring configuration for liquid dip
  const springConfig = SPRING_CONFIGS.liquid
  
  // Animation loop for smooth physics
  const animate = (timestamp) => {
    if (!elementRef.value || !isPressed.value) return
    
    const deltaTime = 0.016 // ~60fps
    const targetPressure = isPressed.value ? 1 : 0
    
    // Calculate spring physics
    const result = calculateSpring(springConfig, deltaTime, pressure.value, targetPressure, velocity.value)
    pressure.value = result.value
    velocity.value = result.velocity
    
    // Apply liquid dip transform
    const dipValues = calculateLiquidDip(pressure.value, springConfig)
    const clampedValues = clampForPerformance(dipValues, window.innerWidth < 768)
    
    if (elementRef.value) {
      elementRef.value.style.transform = `
        scale(${clampedValues.scale}) 
        translateZ(${clampedValues.translateZ}px)
        rotateX(${clampedValues.rotateX}deg)
        rotateY(${clampedValues.rotateY}deg)
      `
      elementRef.value.style.filter = `
        blur(${clampedValues.blur}px) 
        brightness(${clampedValues.brightness})
      `
    }
    
    // Continue animation if still pressed or settling
    if (isPressed.value || Math.abs(velocity.value) > 0.01) {
      animationId.value = requestAnimationFrame(animate)
    }
  }
  
  const pressIn = () => {
    isPressed.value = true
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
    }
    animationId.value = requestAnimationFrame(animate)
  }
  
  const pressOut = () => {
    isPressed.value = false
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
    }
    animationId.value = requestAnimationFrame(animate)
  }
  
  onUnmounted(() => {
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
    }
  })
  
  return {
    elementRef,
    isPressed,
    pressure: computed(() => pressure.value),
    pressIn,
    pressOut
  }
}

/**
 * Refractive Distortion on Hover
 * 
 * Provides refractive distortion based on cursor movement
 */
export function useRefractiveDistortion() {
  const elementRef = ref(null)
  const isHovering = ref(false)
  const pointerPosition = ref({ x: 0, y: 0 })
  const pointerVelocity = ref({ x: 0, y: 0 })
  const lastPointerTime = ref(0)
  const animationId = ref(null)
  
  // Track pointer movement for velocity calculation
  const trackPointer = (event) => {
    const now = performance.now()
    const deltaTime = (now - lastPointerTime.value) / 1000
    lastPointerTime.value = now
    
    if (deltaTime > 0) {
      const newX = event.clientX
      const newY = event.clientY
      
      pointerVelocity.value = {
        x: (newX - pointerPosition.value.x) / deltaTime,
        y: (newY - pointerPosition.value.y) / deltaTime
      }
    }
    
    pointerPosition.value = {
      x: event.clientX,
      y: event.clientY
    }
  }
  
  // Animation loop for distortion
  const animate = () => {
    if (!elementRef.value || !isHovering.value) return
    
    const element = elementRef.value.getBoundingClientRect()
    const pointer = {
      x: pointerPosition.value.x,
      y: pointerPosition.value.y,
      velocity: pointerVelocity.value
    }
    
    // Calculate refractive distortion
    const distortion = calculateRefraction(pointer, element)
    const clampedDistortion = clampForPerformance(distortion, window.innerWidth < 768)
    
    if (elementRef.value) {
      elementRef.value.style.transform = `
        translateZ(${clampedDistortion.translateZ}px)
        rotateX(${clampedDistortion.rotateX}deg)
        rotateY(${clampedDistortion.rotateY}deg)
        scale(${clampedDistortion.scale})
        skewX(${clampedDistortion.skewX}deg)
        skewY(${clampedDistortion.skewY}deg)
      `
    }
    
    animationId.value = requestAnimationFrame(animate)
  }
  
  const hoverIn = () => {
    isHovering.value = true
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
    }
    animationId.value = requestAnimationFrame(animate)
  }
  
  const hoverOut = () => {
    isHovering.value = false
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
    }
    
    // Smooth return to rest state
    if (elementRef.value) {
      elementRef.value.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg) scale(1) skewX(0deg) skewY(0deg)'
    }
  }
  
  onMounted(() => {
    if (elementRef.value) {
      elementRef.value.addEventListener('mousemove', trackPointer)
    }
  })
  
  onUnmounted(() => {
    if (elementRef.value) {
      elementRef.value.removeEventListener('mousemove', trackPointer)
    }
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
    }
  })
  
  return {
    elementRef,
    isHovering,
    hoverIn,
    hoverOut
  }
}

/**
 * Surface Tension Wobble
 * 
 * Provides surface tension wobble when cursor moves rapidly
 */
export function useSurfaceTension() {
  const elementRef = ref(null)
  const isActive = ref(false)
  const velocity = ref(0)
  const animationId = ref(null)
  const startTime = ref(0)
  
  const animate = (timestamp) => {
    if (!elementRef.value || !isActive.value) return
    
    if (startTime.value === 0) {
      startTime.value = timestamp
    }
    
    const elapsed = (timestamp - startTime.value) / 1000
    const wobble = calculateSurfaceTension(velocity.value, elapsed)
    const clampedWobble = clampForPerformance(wobble, window.innerWidth < 768)
    
    if (elementRef.value) {
      elementRef.value.style.transform = `
        rotateX(${clampedWobble.rotateX}deg)
        rotateY(${clampedWobble.rotateY}deg)
        scale(${clampedWobble.scale})
      `
    }
    
    // Fade out wobble over time
    if (elapsed > 0.5) {
      const fadeFactor = Math.max(0, 1 - (elapsed - 0.5) * 2)
      if (elementRef.value) {
        elementRef.value.style.opacity = fadeFactor
      }
    }
    
    if (elapsed < 1) {
      animationId.value = requestAnimationFrame(animate)
    } else {
      isActive.value = false
      startTime.value = 0
    }
  }
  
  const triggerWobble = (cursorVelocity) => {
    velocity.value = cursorVelocity
    isActive.value = true
    startTime.value = 0
    
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
    }
    animationId.value = requestAnimationFrame(animate)
  }
  
  onUnmounted(() => {
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
    }
  })
  
  return {
    elementRef,
    isActive,
    triggerWobble
  }
}

/**
 * Accessibility-Aware Physics
 * 
 * Wraps physics functions with accessibility checks
 */
export function useAccessiblePhysics() {
  const prefersReducedMotion = ref(false)
  
  onMounted(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion.value = mediaQuery.matches
      
      mediaQuery.addEventListener('change', (e) => {
        prefersReducedMotion.value = e.matches
      })
    }
  })
  
  const applyPhysics = (values) => {
    return adjustForAccessibility(values, prefersReducedMotion.value)
  }
  
  return {
    prefersReducedMotion,
    applyPhysics
  }
}
