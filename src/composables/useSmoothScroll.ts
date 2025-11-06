/**
 * useSmoothScroll - Lenis Smooth Scroll Composable
 * 
 * A Vue 3 composable that initializes and manages Lenis smooth scroll library.
 * Features:
 * - Smooth scrolling with custom easing
 * - Integration with requestAnimationFrame
 * - Accessibility support (prefers-reduced-motion)
 * - Mobile optimization (disabled on touch devices)
 * - Reactive scroll position
 * - Proper lifecycle management
 * 
 * @author Stylesnap Team
 * @version 1.0.0
 */

import { ref, onMounted, onUnmounted } from 'vue'
import Lenis from '@studio-freight/lenis'

// Custom easing function for natural deceleration
// Easing curve: cubic-bezier(0.25, 0.46, 0.45, 0.94) - easeOutQuad
const customEasing = (t: number): number => {
  return t * (2 - t)
}

interface LenisOptions {
  duration?: number
  easing?: (t: number) => number
  orientation?: 'vertical' | 'horizontal'
  gestureOrientation?: 'vertical' | 'horizontal' | 'both'
  smoothWheel?: boolean
  smoothTouch?: boolean
  wheelMultiplier?: number
  touchMultiplier?: number
  normalizeWheel?: boolean
  infinite?: boolean
}

interface SmoothScrollReturn {
  scrollY: any
  lenis: any
  scrollTo: (target: string | number | HTMLElement, options?: any) => void
  start: () => void
  stop: () => void
  destroy: () => void
}

/**
 * useSmoothScroll composable
 * 
 * Initializes Lenis smooth scroll with optimal settings for the landing page.
 * Handles lifecycle, accessibility, and provides reactive scroll position.
 * 
 * @param options - Configuration options
 * @param options.autoRaf - Automatically start RAF loop (default: true). Set to false when integrating with external RAF (e.g., Three.js)
 * @returns SmoothScrollReturn object with scroll controls and reactive values
 */
export function useSmoothScroll(options: { autoRaf?: boolean } = {}): SmoothScrollReturn {
  const { autoRaf = true } = options
  // Reactive scroll position (Y coordinate)
  const scrollY = ref(0)
  
  // Lenis instance
  let lenis: Lenis | null = null
  
  // RAF (requestAnimationFrame) ID for cleanup
  let rafId: number | null = null
  
  // Check if user prefers reduced motion (with window check)
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
  
  // Detect mobile/touch devices (with window check)
  const isTouchDevice = typeof window !== 'undefined'
    ? ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    : false
  
  /**
   * Initialize Lenis smooth scroll
   * Only initializes if user doesn't prefer reduced motion
   */
  const initLenis = () => {
    // Don't initialize if user prefers reduced motion
    if (prefersReducedMotion) {
      console.log('🎯 useSmoothScroll: Reduced motion detected, using native scroll')
      return
    }
    
    // Configure Lenis options
    const lenisOptions: LenisOptions = {
      duration: 1.2, // Smooth scroll duration in seconds
      easing: customEasing, // Custom easing for natural deceleration
      orientation: 'vertical', // Vertical scrolling only
      gestureOrientation: 'vertical', // Accept vertical gestures only
      smoothWheel: true, // Enable smooth wheel scrolling
      smoothTouch: false, // Disable smooth touch on mobile to avoid conflicts
      wheelMultiplier: 1.0, // Wheel event multiplier
      touchMultiplier: 2.0, // Touch event multiplier (for when enabled)
      normalizeWheel: true, // Normalize wheel delta across browsers
      infinite: false, // No infinite scroll
    }
    
    // Initialize Lenis
    lenis = new Lenis(lenisOptions)
    
    // Update scroll position on scroll
    lenis.on('scroll', ({ scroll }: { scroll: number }) => {
      scrollY.value = scroll
    })
    
    console.log('✅ useSmoothScroll: Lenis initialized', {
      isTouchDevice,
      smoothTouch: lenisOptions.smoothTouch,
      duration: lenisOptions.duration
    })
  }
  
  /**
   * Animation loop
   * Only used when autoRaf is true (no external RAF integration)
   */
  const raf = (time: number) => {
    if (lenis) {
      lenis.raf(time)
    }
    
    rafId = requestAnimationFrame(raf)
  }
  
  /**
   * Start the animation loop
   */
  const startRaf = () => {
    if (!lenis) return
    rafId = requestAnimationFrame(raf)
  }
  
  /**
   * Stop the animation loop
   */
  const stopRaf = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
  
  /**
   * Scroll to a target
   * 
   * @param target - CSS selector, number (pixels), or HTMLElement
   * @param options - Scroll options (offset, duration, etc.)
   */
  const scrollTo = (
    target: string | number | HTMLElement,
    options?: {
      offset?: number
      duration?: number
      easing?: (t: number) => number
      immediate?: boolean
      lock?: boolean
      force?: boolean
      onComplete?: () => void
    }
  ) => {
    if (lenis) {
      lenis.scrollTo(target, options)
    } else {
      // Fallback to native scroll if Lenis is not initialized
      if (typeof target === 'string') {
        const element = document.querySelector(target)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' })
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }
  
  /**
   * Start smooth scroll
   */
  const start = () => {
    if (lenis) {
      lenis.start()
    }
  }
  
  /**
   * Stop smooth scroll
   */
  const stop = () => {
    if (lenis) {
      lenis.stop()
    }
  }
  
  /**
   * Destroy Lenis instance and cleanup
   */
  const destroy = () => {
    stopRaf()
    
    if (lenis) {
      lenis.destroy()
      lenis = null
      console.log('🧹 useSmoothScroll: Lenis destroyed')
    }
  }
  
  // Lifecycle: Initialize on mount
  onMounted(() => {
    initLenis()
    
    // Start RAF only if Lenis was initialized AND autoRaf is enabled
    // When autoRaf is false, the RAF should be managed externally (e.g., by Three.js)
    if (lenis && autoRaf) {
      startRaf()
    }
  })
  
  // Lifecycle: Cleanup on unmount
  onUnmounted(() => {
    destroy()
  })
  
  // Return reactive values and control methods
  return {
    scrollY,
    lenis,
    scrollTo,
    start,
    stop,
    destroy
  }
}

