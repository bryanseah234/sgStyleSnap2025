/**
 * Liquid Glass Motion Composable
 * 
 * Provides Motion One-powered liquid glass interactions for Vue 3.
 * Handles viscous, refractive, fluid motion with spring physics.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { ref, onMounted, onUnmounted } from 'vue'

// Motion One will be installed as dependency
let animate, spring, timeline

// Lazy load Motion One
const loadMotionOne = async () => {
  if (!animate) {
    const motion = await import('motion')
    animate = motion.animate
    spring = motion.spring
    timeline = motion.timeline
  }
}

/**
 * Liquid Glass Hover Effects
 * 
 * Provides refractive hover effects with spring physics
 * for cards, buttons, and interactive elements.
 */
export function useLiquidHover() {
  const elementRef = ref(null)
  const isHovering = ref(false)
  const isAnimating = ref(false)

  const hoverIn = async () => {
    if (!elementRef.value || isAnimating.value) return
    
    isHovering.value = true
    isAnimating.value = true

    await loadMotionOne()

    // Spring physics hover effect
    animate(
      elementRef.value,
      {
        scale: 1.05,
        rotateX: 2,
        rotateY: 1,
        translateZ: 10,
        filter: 'blur(0px) brightness(1.1)'
      },
      {
        duration: 0.3,
        easing: spring({ stiffness: 300, damping: 20 })
      }
    )

    isAnimating.value = false
  }

  const hoverOut = async () => {
    if (!elementRef.value || isAnimating.value) return
    
    isHovering.value = false
    isAnimating.value = true

    await loadMotionOne()

    // Smooth return to rest state
    animate(
      elementRef.value,
      {
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        translateZ: 0,
        filter: 'blur(0px) brightness(1)'
      },
      {
        duration: 0.4,
        easing: spring({ stiffness: 200, damping: 25 })
      }
    )

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
 * Liquid Glass Press Effects
 * 
 * Provides ripple compression effects for buttons
 * that feel like pressing into viscous glass.
 */
export function useLiquidPress() {
  const elementRef = ref(null)
  const isPressing = ref(false)

  const pressIn = async () => {
    if (!elementRef.value) return
    
    isPressing.value = true
    await loadMotionOne()

    // Elastic compression effect
    animate(
      elementRef.value,
      {
        scale: 0.95,
        translateZ: -5,
        filter: 'brightness(0.9)'
      },
      {
        duration: 0.1,
        easing: spring({ stiffness: 400, damping: 15 })
      }
    )
  }

  const pressOut = async () => {
    if (!elementRef.value) return
    
    await loadMotionOne()

    // Elastic release with slight overshoot
    animate(
      elementRef.value,
      {
        scale: 1.02,
        translateZ: 2,
        filter: 'brightness(1.05)'
      },
      {
        duration: 0.2,
        easing: spring({ stiffness: 300, damping: 20 })
      }
    ).then(() => {
      // Final settle
      animate(
        elementRef.value,
        {
          scale: 1,
          translateZ: 0,
          filter: 'brightness(1)'
        },
        {
          duration: 0.15,
          easing: spring({ stiffness: 250, damping: 25 })
        }
      )
    })

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
 * Liquid Glass Reveal Effects
 * 
 * Provides viscous stretch/compress animations
 * for content reveals instead of linear fades.
 */
export function useLiquidReveal() {
  const elementRef = ref(null)
  const isVisible = ref(false)

  const reveal = async () => {
    if (!elementRef.value || isVisible.value) return
    
    isVisible.value = true
    await loadMotionOne()

    // Viscous stretch-in effect
    animate(
      elementRef.value,
      {
        scale: [0.8, 1.1, 1],
        rotateX: [15, -5, 0],
        rotateY: [10, -2, 0],
        opacity: [0, 0.7, 1],
        translateY: [30, -5, 0]
      },
      {
        duration: 0.6,
        easing: spring({ stiffness: 200, damping: 20 })
      }
    )
  }

  const hide = async () => {
    if (!elementRef.value || !isVisible.value) return
    
    await loadMotionOne()

    // Viscous compress-out effect
    animate(
      elementRef.value,
      {
        scale: [1, 0.9, 0.8],
        rotateX: [0, 5, 15],
        rotateY: [0, 2, 10],
        opacity: [1, 0.3, 0],
        translateY: [0, 5, 30]
      },
      {
        duration: 0.4,
        easing: spring({ stiffness: 300, damping: 15 })
      }
    )

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
    await loadMotionOne()

    // Glass thickening effect
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
        easing: spring({ stiffness: 250, damping: 20 })
      }
    )
  }

  const hoverOut = async () => {
    if (!navbarRef.value) return
    
    isHovering.value = false
    await loadMotionOne()

    // Return to base state
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
        easing: spring({ stiffness: 200, damping: 25 })
      }
    )
  }

  const updateScrollState = async () => {
    if (!navbarRef.value) return
    
    await loadMotionOne()

    // Responsive to scroll state
    animate(
      navbarRef.value,
      {
        backdropFilter: isScrolled.value ? 'blur(12px)' : 'blur(8px)',
        background: isScrolled.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
        translateY: isScrolled.value ? -1 : 0
      },
      {
        duration: 0.3,
        easing: spring({ stiffness: 250, damping: 20 })
      }
    )
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
