/**
 * Liquid Glass Motion Composable
 * 
 * Provides Motion One-powered liquid glass interactions for Vue 3.
 * Handles viscous, refractive, fluid motion with spring physics.
 * 
 * Features:
 * - Hover effects with 3D transformations
 * - Press animations with tactile feedback
 * - Spring physics for natural motion
 * - Fallback animations when Motion library unavailable
 * - Performance-optimized lazy loading
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { ref, onMounted, onUnmounted } from 'vue'

// Global Motion One library references (lazy loaded)
let animate, spring, timeline

/**
 * Lazy loads the Motion One animation library
 * 
 * Dynamically imports the Motion One library only when needed to reduce
 * initial bundle size. Provides fallback behavior if the library fails to load.
 * 
 * @returns {Promise<void>} Resolves when library is loaded or fallback is set
 */
const loadMotionOne = async () => {
  if (!animate) {
    try {
      // Dynamic import of Motion One library
      const motion = await import('motion')
      
      // Defensive check to ensure motion object and its properties exist
      if (motion && typeof motion.animate === 'function') {
        animate = motion.animate
      } else {
        throw new Error('Motion animate function not available')
      }
      
      if (motion && typeof motion.spring === 'function') {
        spring = motion.spring
      } else {
        throw new Error('Motion spring function not available')
      }
      
      if (motion && typeof motion.timeline === 'function') {
        timeline = motion.timeline
      }
      
      console.log('✅ Motion One library loaded successfully')
    } catch (error) {
      console.warn('⚠️ Motion library not available, using fallback animations:', error)
      // Fallback to basic CSS animations when Motion library fails
      animate = null
      spring = null
      timeline = null
    }
  }
}

/**
 * Liquid Glass Hover Effects Composable
 * 
 * Provides refractive hover effects with spring physics for cards, buttons,
 * and interactive elements. Creates a liquid glass effect with 3D transformations
 * and smooth spring-based animations.
 * 
 * @returns {Object} Hover effect functions and reactive state
 * @returns {Ref<HTMLElement|null>} elementRef - Reference to the DOM element
 * @returns {Ref<boolean>} isHovering - Current hover state
 * @returns {Ref<boolean>} isAnimating - Animation in progress flag
 * @returns {Function} hoverIn - Trigger hover in animation
 * @returns {Function} hoverOut - Trigger hover out animation
 */
export function useLiquidHover() {
  // Reactive references for element and state management
  const elementRef = ref(null)      // Reference to the DOM element
  const isHovering = ref(false)     // Current hover state
  const isAnimating = ref(false)    // Prevents animation conflicts

  /**
   * Triggers hover in animation with liquid glass effect
   * 
   * Applies 3D transformations including scale, rotation, and translation
   * with spring physics for natural, fluid motion. Includes brightness
   * enhancement for visual appeal.
   * 
   * @returns {Promise<void>} Resolves when animation completes
   */
  const hoverIn = async () => {
    // Prevent animation if element not available or already animating
    if (!elementRef.value || isAnimating.value) return
    
    // Update state flags
    isHovering.value = true
    isAnimating.value = true

    try {
      // Ensure Motion library is loaded
      await loadMotionOne()

      // Apply liquid glass hover effect with spring physics
      if (animate && spring && typeof animate === 'function' && typeof spring === 'function') {
        try {
          const springEasing = spring({ 
            stiffness: 300,               // High stiffness for snappy feel
            damping: 20                   // Moderate damping for smooth motion
          })
          
          // Extract the easing function with proper error handling
          let easingFunction = null
          
          // Safely check and extract easing function with more defensive checks
          if (springEasing != null) { // Check for both null and undefined
            // Check if it's a proper array (not just array-like object)
            if (Array.isArray(springEasing) && springEasing.length > 0) {
              // Safely access first element only if it exists
              const firstElement = springEasing[0]
              if (firstElement != null && typeof firstElement === 'function') {
                easingFunction = firstElement
              }
            } else if (typeof springEasing === 'function') {
              // Direct function return
              easingFunction = springEasing
            }
          }
          
          // If we couldn't extract a valid easing function, throw to trigger fallback
          if (!easingFunction) {
            throw new Error('Invalid spring easing return value')
          }
          
          // Only animate if we have a valid easing function
          if (easingFunction && typeof easingFunction === 'function') {
            animate(
              elementRef.value,
              {
                scale: 1.05,                    // Slight scale increase
                rotateX: 2,                     // Subtle X-axis rotation
                rotateY: 1,                     // Subtle Y-axis rotation
                translateZ: 10,                  // Lift element in 3D space
                filter: 'blur(0px) brightness(1.1)' // Enhance brightness
              },
              {
                duration: 0.3,                  // Quick animation duration
                easing: easingFunction
              }
            )
          } else {
            throw new Error('Easing function is not valid')
          }
        } catch (springError) {
          // If spring function fails, use CSS fallback
          throw new Error(`Spring easing failed: ${springError?.message || 'unknown error'}`)
        }
      } else {
        // Fallback CSS animation when Motion library unavailable
        elementRef.value.style.transform = 'scale(1.05) translateZ(10px)'
        elementRef.value.style.filter = 'brightness(1.1)'
        elementRef.value.style.transition = 'all 0.3s ease-out'
      }
    } catch (error) {
      console.warn('⚠️ Error in hoverIn animation, using fallback:', error)
      // Fallback CSS animation on error
      elementRef.value.style.transform = 'scale(1.05) translateZ(10px)'
      elementRef.value.style.filter = 'brightness(1.1)'
      elementRef.value.style.transition = 'all 0.3s ease-out'
    }

    isAnimating.value = false
  }

  /**
   * Triggers hover out animation returning to rest state
   * 
   * Smoothly returns the element to its original state with
   * spring physics for natural deceleration.
   * 
   * @returns {Promise<void>} Resolves when animation completes
   */
  const hoverOut = async () => {
    // Prevent animation if element not available or already animating
    if (!elementRef.value || isAnimating.value) return
    
    // Update state flags
    isHovering.value = false
    isAnimating.value = true

    try {
      // Ensure Motion library is loaded
      await loadMotionOne()

      // Return to rest state with spring physics
      if (animate && spring && typeof animate === 'function' && typeof spring === 'function') {
        try {
          const springEasing = spring({ 
            stiffness: 200,                // Lower stiffness for gentler return
            damping: 25                    // Higher damping for smooth settling
          })
          
          // Extract the easing function with proper error handling
          let easingFunction = null
          
          // Safely check and extract easing function with more defensive checks
          if (springEasing != null) { // Check for both null and undefined
            // Check if it's a proper array (not just array-like object)
            if (Array.isArray(springEasing) && springEasing.length > 0) {
              // Safely access first element only if it exists
              const firstElement = springEasing[0]
              if (firstElement != null && typeof firstElement === 'function') {
                easingFunction = firstElement
              }
            } else if (typeof springEasing === 'function') {
              // Direct function return
              easingFunction = springEasing
            }
          }
          
          // If we couldn't extract a valid easing function, throw to trigger fallback
          if (!easingFunction) {
            throw new Error('Invalid spring easing return value')
          }
          
          // Only animate if we have a valid easing function
          if (easingFunction && typeof easingFunction === 'function') {
            animate(
              elementRef.value,
              {
                scale: 1,                       // Return to original scale
                rotateX: 0,                      // Reset X rotation
                rotateY: 0,                      // Reset Y rotation
                translateZ: 0,                   // Return to original Z position
                filter: 'blur(0px) brightness(1)' // Reset brightness
              },
              {
                duration: 0.4,                   // Slightly longer for smooth return
                easing: easingFunction
              }
            )
          } else {
            throw new Error('Easing function is not valid')
          }
        } catch (springError) {
          // If spring function fails, use CSS fallback
          throw new Error(`Spring easing failed: ${springError?.message || 'unknown error'}`)
        }
      } else {
        // Fallback CSS animation when Motion library unavailable
        throw new Error('Motion library not available')
      }
    } catch (error) {
      console.warn('⚠️ Error in hoverOut animation, using fallback:', error)
      // Fallback CSS animation on error
      if (elementRef.value) {
        elementRef.value.style.transform = 'scale(1) translateZ(0px)'
        elementRef.value.style.filter = 'brightness(1)'
        elementRef.value.style.transition = 'all 0.4s ease-out'
      }
    }

    isAnimating.value = false
  }

  return {
    elementRef,
    isHovering,
    hoverIn,
    hoverOut
  }
}

/**
 * Liquid Glass Press Effects Composable
 * 
 * Provides tactile press effects with elastic compression and release animations
 * that simulate pressing into viscous glass. Creates a satisfying tactile feedback
 * for buttons and interactive elements.
 * 
 * @returns {Object} Press effect functions and reactive state
 * @returns {Ref<HTMLElement|null>} elementRef - Reference to the DOM element
 * @returns {Ref<boolean>} isPressing - Current press state
 * @returns {Function} pressIn - Trigger press in animation
 * @returns {Function} pressOut - Trigger press out animation
 */
export function useLiquidPress() {
  // Reactive references for element and state management
  const elementRef = ref(null)      // Reference to the DOM element
  const isPressing = ref(false)     // Current press state

  /**
   * Triggers press in animation with elastic compression
   * 
   * Creates a compression effect that simulates pressing into viscous glass.
   * Scales down the element and dims brightness for tactile feedback.
   * 
   * @returns {Promise<void>} Resolves when animation completes
   */
  const pressIn = async (targetElement = null) => {
    // Use provided element or fall back to ref
    const element = targetElement || elementRef.value
    
    // Prevent animation if element not available
    if (!element || !element.style) {
      console.warn('⚠️ Press in: No valid element provided')
      return
    }
    
    try {
      // Update press state
      isPressing.value = true
      
      // Ensure Motion library is loaded
      await loadMotionOne()

      // Apply elastic compression effect
      if (animate && spring && typeof animate === 'function') {
        try {
          // Get spring easing function safely
          let springEasing = null
          try {
            const springResult = spring({ 
              stiffness: 400,                // High stiffness for immediate response
              damping: 15                    // Low damping for elastic feel
            })
            
            // Handle spring result - it can be an array [function] or a function directly
            if (Array.isArray(springResult) && springResult.length > 0) {
              springEasing = springResult[0]
            } else if (typeof springResult === 'function') {
              springEasing = springResult
            }
          } catch (springError) {
            console.warn('⚠️ Spring easing creation failed:', springError)
            springEasing = null
          }
          
          await animate(
            element,
            {
              scale: 0.95,                    // Compress element slightly
              translateZ: -5,                  // Push element back in 3D space
              filter: 'brightness(0.9)'        // Dim brightness for pressed feel
            },
            {
              duration: 0.1,                   // Quick compression
              easing: springEasing || 'ease-out'  // Fallback to ease-out if spring fails
            }
          )
        } catch (animError) {
          console.warn('⚠️ Press in animation error:', animError)
          // Fallback CSS animation on error
          if (element && element.style) {
            element.style.transform = 'scale(0.95) translateZ(-5px)'
            element.style.filter = 'brightness(0.9)'
            element.style.transition = 'all 0.1s ease-out'
          }
        }
      } else {
        // Fallback CSS animation when Motion library unavailable
        element.style.transform = 'scale(0.95) translateZ(-5px)'
        element.style.filter = 'brightness(0.9)'
        element.style.transition = 'all 0.1s ease-out'
      }
    } catch (error) {
      console.warn('⚠️ Press in animation error:', error)
      // Fallback CSS animation on error
      if (elementRef.value) {
        elementRef.value.style.transform = 'scale(0.95) translateZ(-5px)'
        elementRef.value.style.filter = 'brightness(0.9)'
        elementRef.value.style.transition = 'all 0.1s ease-out'
      }
    }
  }

  /**
   * Triggers press out animation with elastic release
   * 
   * Creates a satisfying release effect with slight overshoot that
   * simulates elastic material returning to its original state.
   * 
   * @returns {Promise<void>} Resolves when animation completes
   */
  const pressOut = async (targetElement = null) => {
    // Use provided element or fall back to ref
    const element = targetElement || elementRef.value
    
    // Prevent animation if element not available
    if (!element || !element.style) {
      console.warn('⚠️ Press out: No valid element provided')
      isPressing.value = false
      return
    }
    
    try {
      // Ensure Motion library is loaded
      await loadMotionOne()

      // Apply elastic release with overshoot effect
      if (animate && spring && typeof animate === 'function') {
        try {
          // Get spring easing functions safely
          let releaseSpringEasing = null
          let settleSpringEasing = null
          
          try {
            const releaseSpringResult = spring({ 
              stiffness: 300,                // Moderate stiffness for smooth release
              damping: 20                    // Moderate damping for controlled motion
            })
            
            if (Array.isArray(releaseSpringResult) && releaseSpringResult.length > 0) {
              releaseSpringEasing = releaseSpringResult[0]
            } else if (typeof releaseSpringResult === 'function') {
              releaseSpringEasing = releaseSpringResult
            }
            
            const settleSpringResult = spring({ 
              stiffness: 250,              // Lower stiffness for gentle settle
              damping: 25                  // Higher damping for smooth settling
            })
            
            if (Array.isArray(settleSpringResult) && settleSpringResult.length > 0) {
              settleSpringEasing = settleSpringResult[0]
            } else if (typeof settleSpringResult === 'function') {
              settleSpringEasing = settleSpringResult
            }
          } catch (springError) {
            console.warn('⚠️ Spring easing creation failed:', springError)
            releaseSpringEasing = null
            settleSpringEasing = null
          }
          
          await animate(
            element,
            {
              scale: 1.02,                    // Slight overshoot for elastic feel
              translateZ: 2,                   // Lift element slightly
              filter: 'brightness(1.05)'       // Brighten for release feedback
            },
            {
              duration: 0.2,                   // Release animation duration
              easing: releaseSpringEasing || 'ease-out'  // Fallback if spring fails
            }
          )
          
          // Final settle animation to return to exact original state
          if (animate && element && element.style) {
            await animate(
              element,
              {
                scale: 1,                     // Return to exact original scale
                translateZ: 0,                 // Return to original Z position
                filter: 'brightness(1)'        // Return to original brightness
              },
              {
                duration: 0.15,                // Quick settle animation
                easing: settleSpringEasing || 'ease-out'  // Fallback if spring fails
              }
            )
          } else {
            // Fallback CSS animation when Motion library unavailable
            if (element && element.style) {
              element.style.transform = 'scale(1) translateZ(0px)'
              element.style.filter = 'brightness(1)'
              element.style.transition = 'all 0.15s ease-out'
            }
          }
        } catch (animError) {
          console.warn('⚠️ Press out animation error:', animError)
          // Fallback CSS animation on error
          if (element && element.style) {
            element.style.transform = 'scale(1) translateZ(0px)'
            element.style.filter = 'brightness(1)'
            element.style.transition = 'all 0.15s ease-out'
          }
        }
      } else {
        // Fallback CSS animation when Motion library unavailable
        element.style.transform = 'scale(1.02) translateZ(2px)'
        element.style.filter = 'brightness(1.05)'
        element.style.transition = 'all 0.2s ease-out'
        
        // Settle after release
        setTimeout(() => {
          if (element && element.style) {
            element.style.transform = 'scale(1) translateZ(0px)'
            element.style.filter = 'brightness(1)'
          }
        }, 200)
      }
    } catch (error) {
      console.warn('⚠️ Press out animation error:', error)
      // Fallback CSS animation on error
      if (element && element.style) {
        element.style.transform = 'scale(1) translateZ(0px)'
        element.style.filter = 'brightness(1)'
        element.style.transition = 'all 0.15s ease-out'
      }
    }

    // Update press state
    isPressing.value = false
  }

  return {
    elementRef,
    isPressing,
    pressIn,
    pressOut
  }
}

/**
 * Liquid Glass Reveal Effects Composable
 * 
 * Provides viscous stretch/compress animations for content reveals instead of
 * linear fades. Creates a liquid-like appearance when elements appear or disappear
 * with elastic deformation effects.
 * 
 * @returns {Object} Reveal effect functions and reactive state
 * @returns {Ref<HTMLElement|null>} elementRef - Reference to the DOM element
 * @returns {Ref<boolean>} isVisible - Current visibility state
 * @returns {Function} reveal - Trigger reveal animation
 * @returns {Function} hide - Trigger hide animation
 */
export function useLiquidReveal() {
  // Reactive references for element and state management
  const elementRef = ref(null)      // Reference to the DOM element
  const isVisible = ref(false)      // Current visibility state

  /**
   * Triggers reveal animation with viscous stretch effect
   * 
   * Creates a liquid-like reveal effect by stretching the element from
   * a compressed state to its natural size with elastic physics.
   * 
   * @returns {Promise<void>} Resolves when animation completes
   */
  const reveal = async () => {
    // Prevent animation if element not available or already visible
    if (!elementRef.value || isVisible.value) return
    
    // Update visibility state
    isVisible.value = true
    
    // Ensure Motion library is loaded
    await loadMotionOne()

    // Apply viscous stretch-in effect
    if (animate && spring) {
      // Get spring easing function safely
      let springEasing = null
      try {
        const springResult = spring({ 
          stiffness: 200,                // Moderate stiffness for fluid motion
          damping: 20                    // Moderate damping for smooth settling
        })
        
        if (Array.isArray(springResult) && springResult.length > 0) {
          springEasing = springResult[0]
        } else if (typeof springResult === 'function') {
          springEasing = springResult
        }
      } catch (springError) {
        console.warn('⚠️ Spring easing creation failed:', springError)
        springEasing = null
      }
      
      animate(
        elementRef.value,
        {
          scale: [0.8, 1.1, 1],           // Start compressed, overshoot, settle
          rotateX: [15, -5, 0],           // Start tilted, counter-rotate, settle
          rotateY: [10, -2, 0],           // Start tilted, counter-rotate, settle
          opacity: [0, 0.7, 1],           // Fade in with intermediate step
          translateY: [30, -5, 0]         // Start below, overshoot up, settle
        },
        {
          duration: 0.6,                  // Longer duration for liquid effect
          easing: springEasing || 'ease-out'  // Fallback if spring fails
        }
      )
    } else {
      // Fallback CSS animation when Motion library unavailable
      elementRef.value.style.transform = 'scale(0.8) translateY(30px)'
      elementRef.value.style.opacity = '0'
      elementRef.value.style.transition = 'all 0.6s ease-out'
      
      // Trigger animation
      requestAnimationFrame(() => {
        elementRef.value.style.transform = 'scale(1) translateY(0px)'
        elementRef.value.style.opacity = '1'
      })
    }
  }

  /**
   * Triggers hide animation with viscous compress effect
   * 
   * Creates a liquid-like hide effect by compressing the element
   * while fading it out with elastic deformation.
   * 
   * @returns {Promise<void>} Resolves when animation completes
   */
  const hide = async () => {
    // Prevent animation if element not available or not visible
    if (!elementRef.value || !isVisible.value) return
    
    // Ensure Motion library is loaded
    await loadMotionOne()

    // Apply viscous compress-out effect
    if (animate && spring) {
      // Get spring easing function safely
      let springEasing = null
      try {
        const springResult = spring({ 
          stiffness: 300,                // Higher stiffness for quick compression
          damping: 15                    // Lower damping for elastic feel
        })
        
        if (Array.isArray(springResult) && springResult.length > 0) {
          springEasing = springResult[0]
        } else if (typeof springResult === 'function') {
          springEasing = springResult
        }
      } catch (springError) {
        console.warn('⚠️ Spring easing creation failed:', springError)
        springEasing = null
      }
      
      animate(
        elementRef.value,
        {
          scale: [1, 0.9, 0.8],           // Start normal, compress slightly, compress more
          rotateX: [0, 5, 15],            // Start flat, tilt slightly, tilt more
          rotateY: [0, 2, 10],            // Start flat, tilt slightly, tilt more
          opacity: [1, 0.3, 0],           // Fade out with intermediate step
          translateY: [0, 5, 30]          // Start in place, move down slightly, move down more
        },
        {
          duration: 0.4,                  // Shorter duration for quick hide
          easing: springEasing || 'ease-in'  // Fallback if spring fails
        }
      )
    } else {
      // Fallback CSS animation when Motion library unavailable
      elementRef.value.style.transform = 'scale(0.8) translateY(30px)'
      elementRef.value.style.opacity = '0'
      elementRef.value.style.transition = 'all 0.4s ease-in'
    }

    // Update visibility state
    isVisible.value = false
  }

  return {
    elementRef,
    isVisible,
    reveal,
    hide
  }
}

/**
 * Navbar Liquid Glass Effects
 * 
 * Provides floating glass panel effects for navigation
 * with damped spring movement and scroll responsiveness.
 */
export function useNavbarLiquid() {
  const navbarRef = ref(null)
  const isScrolled = ref(false)
  const isHovering = ref(false)

  const handleScroll = () => {
    const scrollY = window.scrollY
    isScrolled.value = scrollY > 20
  }

  const hoverIn = async () => {
    if (!navbarRef.value) return
    
    isHovering.value = true
    
    // Disable navbar glow effect in both light and dark modes
    // Individual button hover effects remain unchanged
    return

    try {
      // Safely create spring easing function
      let easingFunction = null
      if (spring && typeof spring === 'function') {
        try {
          const springEasing = spring({ stiffness: 250, damping: 20 })
          
          // Safely check and extract easing function with more defensive checks
          if (springEasing != null) { // Check for both null and undefined
            // Check if it's a proper array (not just array-like object)
            if (Array.isArray(springEasing) && springEasing.length > 0) {
              // Safely access first element only if it exists
              const firstElement = springEasing[0]
              if (firstElement != null && typeof firstElement === 'function') {
                easingFunction = firstElement
              }
            } else if (typeof springEasing === 'function') {
              // Direct function return
              easingFunction = springEasing
            }
          }
        } catch (springError) {
          console.warn('⚠️ Navbar spring easing failed:', springError)
          easingFunction = null
        }
      }

      // Glass thickening effect
      if (animate && easingFunction && typeof easingFunction === 'function') {
        animate(
          navbarRef.value,
          {
            backdropFilter: 'blur(16px)',
            background: 'rgba(255, 255, 255, 0.2)',
            translateY: -2,
            scale: 1.01
          },
          {
            duration: 0.3,
            easing: easingFunction
          }
        )
      } else {
        // Fallback CSS animation
        navbarRef.value.style.backdropFilter = 'blur(16px)'
        navbarRef.value.style.background = 'rgba(255, 255, 255, 0.2)'
        navbarRef.value.style.transform = 'translateY(-2px) scale(1.01)'
        navbarRef.value.style.transition = 'all 0.3s ease-out'
      }
    } catch (error) {
      console.warn('⚠️ Error in navbar hoverIn animation:', error)
      // Fallback CSS animation on error
      if (navbarRef.value) {
        navbarRef.value.style.backdropFilter = 'blur(16px)'
        navbarRef.value.style.background = 'rgba(255, 255, 255, 0.2)'
        navbarRef.value.style.transform = 'translateY(-2px) scale(1.01)'
        navbarRef.value.style.transition = 'all 0.3s ease-out'
      }
    }
  }

  const hoverOut = async () => {
    if (!navbarRef.value) return
    
    isHovering.value = false
    await loadMotionOne()

    try {
      // Safely create spring easing function
      let easingFunction = null
      if (spring && typeof spring === 'function') {
        try {
          const springEasing = spring({ stiffness: 200, damping: 25 })
          
          // Safely check and extract easing function with more defensive checks
          if (springEasing != null) { // Check for both null and undefined
            // Check if it's a proper array (not just array-like object)
            if (Array.isArray(springEasing) && springEasing.length > 0) {
              // Safely access first element only if it exists
              const firstElement = springEasing[0]
              if (firstElement != null && typeof firstElement === 'function') {
                easingFunction = firstElement
              }
            } else if (typeof springEasing === 'function') {
              // Direct function return
              easingFunction = springEasing
            }
          }
        } catch (springError) {
          console.warn('⚠️ Navbar spring easing failed:', springError)
          easingFunction = null
        }
      }

      // Return to base state
      if (animate && easingFunction && typeof easingFunction === 'function') {
        animate(
          navbarRef.value,
          {
            backdropFilter: isScrolled.value ? 'blur(12px)' : 'blur(8px)',
            background: isScrolled.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
            translateY: 0,
            scale: 1
          },
          {
            duration: 0.4,
            easing: easingFunction
          }
        )
      } else {
        // Fallback CSS animation
        const blurValue = isScrolled.value ? 'blur(12px)' : 'blur(8px)'
        const bgValue = isScrolled.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)'
        navbarRef.value.style.backdropFilter = blurValue
        navbarRef.value.style.background = bgValue
        navbarRef.value.style.transform = 'translateY(0) scale(1)'
        navbarRef.value.style.transition = 'all 0.4s ease-out'
      }
    } catch (error) {
      console.warn('⚠️ Error in navbar hoverOut animation:', error)
      // Fallback CSS animation on error
      if (navbarRef.value) {
        const blurValue = isScrolled.value ? 'blur(12px)' : 'blur(8px)'
        const bgValue = isScrolled.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)'
        navbarRef.value.style.backdropFilter = blurValue
        navbarRef.value.style.background = bgValue
        navbarRef.value.style.transform = 'translateY(0) scale(1)'
        navbarRef.value.style.transition = 'all 0.4s ease-out'
      }
    }
  }

  const updateScrollState = async () => {
    if (!navbarRef.value) return
    
    await loadMotionOne()

    try {
      // Safely create spring easing function
      let easingFunction = null
      if (spring && typeof spring === 'function') {
        try {
          const springEasing = spring({ stiffness: 250, damping: 20 })
          
          // Safely check and extract easing function with more defensive checks
          if (springEasing != null) { // Check for both null and undefined
            // Check if it's a proper array (not just array-like object)
            if (Array.isArray(springEasing) && springEasing.length > 0) {
              // Safely access first element only if it exists
              const firstElement = springEasing[0]
              if (firstElement != null && typeof firstElement === 'function') {
                easingFunction = firstElement
              }
            } else if (typeof springEasing === 'function') {
              // Direct function return
              easingFunction = springEasing
            }
          }
        } catch (springError) {
          console.warn('⚠️ Navbar scroll spring easing failed:', springError)
          easingFunction = null
        }
      }

      // Responsive to scroll state
      if (animate && easingFunction && typeof easingFunction === 'function') {
        animate(
          navbarRef.value,
          {
            backdropFilter: isScrolled.value ? 'blur(12px)' : 'blur(8px)',
            background: isScrolled.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
            translateY: isScrolled.value ? -1 : 0
          },
          {
            duration: 0.3,
            easing: easingFunction
          }
        )
      } else {
        // Fallback CSS animation
        const blurValue = isScrolled.value ? 'blur(12px)' : 'blur(8px)'
        const bgValue = isScrolled.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)'
        navbarRef.value.style.backdropFilter = blurValue
        navbarRef.value.style.background = bgValue
        navbarRef.value.style.transform = isScrolled.value ? 'translateY(-1px)' : 'translateY(0)'
        navbarRef.value.style.transition = 'all 0.3s ease-out'
      }
    } catch (error) {
      console.warn('⚠️ Error in navbar updateScrollState animation:', error)
      // Fallback CSS animation on error
      if (navbarRef.value) {
        const blurValue = isScrolled.value ? 'blur(12px)' : 'blur(8px)'
        const bgValue = isScrolled.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)'
        navbarRef.value.style.backdropFilter = blurValue
        navbarRef.value.style.background = bgValue
        navbarRef.value.style.transform = isScrolled.value ? 'translateY(-1px)' : 'translateY(0)'
        navbarRef.value.style.transition = 'all 0.3s ease-out'
      }
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    navbarRef,
    isScrolled,
    isHovering,
    hoverIn,
    hoverOut,
    updateScrollState
  }
}

/**
 * Accessibility Check
 * 
 * Checks if user prefers reduced motion
 */
export function useReducedMotion() {
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

  return {
    prefersReducedMotion
  }
}
