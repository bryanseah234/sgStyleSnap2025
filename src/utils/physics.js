/**
 * Microphysics Utilities for Liquid Glass
 * 
 * Provides spring/mass/damping calculations for realistic
 * liquid glass interactions with iOS 26-inspired physics.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

/**
 * Spring Physics Configuration
 * 
 * Predefined spring configurations for different liquid behaviors
 */
export const SPRING_CONFIGS = {
  // Liquid glass viscosity levels
  viscous: {
    stiffness: 200,
    damping: 25,
    mass: 1.2
  },
  
  // Standard liquid flow
  liquid: {
    stiffness: 300,
    damping: 20,
    mass: 1.0
  },
  
  // Quick responsive interactions
  snappy: {
    stiffness: 400,
    damping: 15,
    mass: 0.8
  },
  
  // Heavy, thick liquid
  thick: {
    stiffness: 150,
    damping: 30,
    mass: 1.5
  },
  
  // Elastic surface tension
  elastic: {
    stiffness: 500,
    damping: 10,
    mass: 0.6
  }
}

/**
 * Calculate spring physics values
 * 
 * @param {Object} config - Spring configuration
 * @param {number} deltaTime - Time delta in seconds
 * @param {number} currentValue - Current animation value
 * @param {number} targetValue - Target animation value
 * @param {number} velocity - Current velocity
 * @returns {Object} - { value, velocity }
 */
export function calculateSpring(config, deltaTime, currentValue, targetValue, velocity = 0) {
  const { stiffness, damping, mass } = config
  
  // Spring force calculation
  const springForce = -stiffness * (currentValue - targetValue)
  const dampingForce = -damping * velocity
  const acceleration = (springForce + dampingForce) / mass
  
  // Update velocity and position
  const newVelocity = velocity + acceleration * deltaTime
  const newValue = currentValue + newVelocity * deltaTime
  
  return {
    value: newValue,
    velocity: newVelocity
  }
}

/**
 * Liquid Dip Physics
 * 
 * Simulates the "liquid dip" effect when pressing into viscous glass
 * 
 * @param {number} pressure - Pressure intensity (0-1)
 * @param {Object} config - Spring configuration
 * @returns {Object} - Transform values for liquid dip
 */
export function calculateLiquidDip(pressure, config = SPRING_CONFIGS.liquid) {
  const dipDepth = pressure * 0.15 // Max 15% compression
  const wobbleIntensity = pressure * 0.05 // Max 5% wobble
  
  return {
    scale: 1 - dipDepth,
    translateZ: -dipDepth * 10,
    rotateX: Math.sin(pressure * Math.PI) * wobbleIntensity * 2,
    rotateY: Math.cos(pressure * Math.PI) * wobbleIntensity * 2,
    blur: pressure * 8, // Dynamic blur based on pressure
    brightness: 1 - (pressure * 0.1) // Slight darkening under pressure
  }
}

/**
 * Refractive Distortion
 * 
 * Calculates refractive distortion based on cursor velocity and position
 * 
 * @param {Object} pointer - { x, y, velocity }
 * @param {Object} element - Element bounds
 * @returns {Object} - Distortion transform values
 */
export function calculateRefraction(pointer, element) {
  const { x, y, velocity } = pointer
  const { width, height, left, top } = element
  
  // Normalize pointer position relative to element center
  const centerX = left + width / 2
  const centerY = top + height / 2
  const relativeX = (x - centerX) / (width / 2)
  const relativeY = (y - centerY) / (height / 2)
  
  // Calculate distortion based on velocity and position
  const velocityMagnitude = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
  const distortionIntensity = Math.min(velocityMagnitude * 0.1, 0.05) // Max 5% distortion
  
  return {
    rotateX: relativeY * distortionIntensity * 2,
    rotateY: -relativeX * distortionIntensity * 2,
    scale: 1 + distortionIntensity * 0.02,
    translateZ: distortionIntensity * 5,
    skewX: relativeX * distortionIntensity * 0.5,
    skewY: relativeY * distortionIntensity * 0.5
  }
}

/**
 * Surface Tension Wobble
 * 
 * Simulates surface tension wobble when cursor moves rapidly
 * 
 * @param {number} velocity - Cursor velocity magnitude
 * @param {number} time - Animation time
 * @returns {Object} - Wobble transform values
 */
export function calculateSurfaceTension(velocity, time) {
  const wobbleIntensity = Math.min(velocity * 0.02, 0.03) // Max 3% wobble
  const frequency = 8 + velocity * 2 // Higher frequency for faster movement
  
  return {
    rotateX: Math.sin(time * frequency) * wobbleIntensity,
    rotateY: Math.cos(time * frequency * 1.1) * wobbleIntensity,
    scale: 1 + Math.sin(time * frequency * 0.7) * wobbleIntensity * 0.5
  }
}

/**
 * Performance Clamping
 * 
 * Clamps physics values to maintain performance on mobile
 * 
 * @param {Object} values - Physics values
 * @param {boolean} isMobile - Whether running on mobile
 * @returns {Object} - Clamped values
 */
export function clampForPerformance(values, isMobile = false) {
  if (isMobile) {
    // Reduce intensity on mobile for better performance
    return {
      ...values,
      scale: values.scale ? Math.max(0.95, Math.min(1.05, values.scale)) : values.scale,
      rotateX: values.rotateX ? Math.max(-2, Math.min(2, values.rotateX)) : values.rotateX,
      rotateY: values.rotateY ? Math.max(-2, Math.min(2, values.rotateY)) : values.rotateY,
      blur: values.blur ? Math.min(4, values.blur) : values.blur
    }
  }
  
  return values
}

/**
 * Accessibility Check
 * 
 * Returns reduced motion values if user prefers reduced motion
 * 
 * @param {Object} values - Physics values
 * @param {boolean} prefersReducedMotion - User preference
 * @returns {Object} - Accessibility-adjusted values
 */
export function adjustForAccessibility(values, prefersReducedMotion = false) {
  if (prefersReducedMotion) {
    return {
      ...values,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      blur: 0,
      brightness: 1
    }
  }
  
  return values
}
