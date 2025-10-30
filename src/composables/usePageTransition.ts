/**
 * usePageTransition Composable
 * 
 * Provides programmatic control over page transitions with curtain effect.
 * Handles transition state management, motion preferences, and router integration.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { useRouter, type Router, type RouteLocationNormalized } from 'vue-router'

// ============================================
// TYPES
// ============================================

export type TransitionState = 'idle' | 'exiting' | 'entering'

export interface TransitionOptions {
  duration?: number
  skipTransition?: boolean
  customStyle?: Record<string, any>
}

export interface PageTransitionReturn {
  isTransitioning: Ref<boolean>
  transitionState: Ref<TransitionState>
  prefersReducedMotion: Ref<boolean>
  startTransition: (options?: TransitionOptions) => Promise<void>
  skipTransition: () => void
  setTransitionDuration: (duration: number) => void
  getTransitionConfig: () => TransitionConfig
}

export interface TransitionConfig {
  duration: number
  staggerDelay: number
  barCount: number
  enabled: boolean
}

// ============================================
// GLOBAL STATE
// ============================================

// Shared state across all instances
const isTransitioning = ref(false)
const transitionState = ref<TransitionState>('idle')
const transitionDuration = ref(900) // Default duration
const skipNextTransition = ref(false)
const transitionInProgress = ref<Promise<void> | null>(null)
const prefersReducedMotion = ref(false) // Reduced motion preference

// Route-specific configuration
const routeTransitionConfig = new Map<string, Partial<TransitionConfig>>()

// ============================================
// COMPOSABLE
// ============================================

export function usePageTransition(): PageTransitionReturn {
  const router = useRouter()
  
  /**
   * Check user's motion preference
   */
  const checkMotionPreference = () => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion.value = mediaQuery.matches
      
      // Listen for changes
      mediaQuery.addEventListener('change', (e) => {
        prefersReducedMotion.value = e.matches
      })
    }
  }
  
  /**
   * Start page transition animation
   * @param options - Transition options
   */
  const startTransition = async (options: TransitionOptions = {}): Promise<void> => {
    // Skip if already transitioning
    if (isTransitioning.value) {
      return transitionInProgress.value || Promise.resolve()
    }
    
    // Skip if requested
    if (options.skipTransition || skipNextTransition.value) {
      skipNextTransition.value = false
      return Promise.resolve()
    }
    
    // Skip for reduced motion (use simple fade instead)
    if (prefersReducedMotion.value) {
      return Promise.resolve()
    }
    
    const duration = options.duration || transitionDuration.value
    
    // Create transition promise
    transitionInProgress.value = new Promise<void>((resolve) => {
      // Start exit transition
      isTransitioning.value = true
      transitionState.value = 'exiting'
      
      // Wait for curtain to fully cover screen
      const exitDuration = duration * 0.6 // 60% for exit
      
      setTimeout(() => {
        // Switch to entering state
        transitionState.value = 'entering'
        
        // Wait for curtain to fully reveal
        const enterDuration = duration * 0.4 // 40% for enter
        
        setTimeout(() => {
          // Complete transition
          isTransitioning.value = false
          transitionState.value = 'idle'
          transitionInProgress.value = null
          resolve()
        }, enterDuration)
      }, exitDuration)
    })
    
    return transitionInProgress.value
  }
  
  /**
   * Skip the next transition
   */
  const skipTransition = () => {
    skipNextTransition.value = true
  }
  
  /**
   * Set global transition duration
   * @param duration - Duration in milliseconds
   */
  const setTransitionDuration = (duration: number) => {
    transitionDuration.value = duration
  }
  
  /**
   * Get current transition configuration
   */
  const getTransitionConfig = (): TransitionConfig => {
    return {
      duration: transitionDuration.value,
      staggerDelay: 50,
      barCount: 10,
      enabled: !prefersReducedMotion.value
    }
  }
  
  // Initialize on mount
  onMounted(() => {
    checkMotionPreference()
  })
  
  return {
    isTransitioning,
    transitionState,
    prefersReducedMotion,
    startTransition,
    skipTransition,
    setTransitionDuration,
    getTransitionConfig
  }
}

// ============================================
// ROUTE-SPECIFIC CONFIGURATION
// ============================================

/**
 * Set custom transition configuration for a specific route
 * @param routePath - Route path
 * @param config - Transition configuration
 */
export function setRouteTransition(
  routePath: string,
  config: Partial<TransitionConfig>
): void {
  routeTransitionConfig.set(routePath, config)
}

/**
 * Get transition configuration for a route
 * @param routePath - Route path
 */
export function getRouteTransition(routePath: string): Partial<TransitionConfig> {
  return routeTransitionConfig.get(routePath) || {}
}

/**
 * Clear route-specific transition configuration
 * @param routePath - Route path (optional, clears all if not provided)
 */
export function clearRouteTransition(routePath?: string): void {
  if (routePath) {
    routeTransitionConfig.delete(routePath)
  } else {
    routeTransitionConfig.clear()
  }
}

// ============================================
// ROUTER INTEGRATION HELPER
// ============================================

/**
 * Setup page transition with Vue Router
 * Call this in your main.js or router setup
 * 
 * Note: This function adds navigation hooks BEFORE any other beforeEach guards.
 * Make sure to call this early in your main.js setup.
 * 
 * @param router - Vue Router instance
 * @param options - Global transition options
 */
export function setupPageTransition(
  router: Router,
  options: Partial<TransitionConfig> = {}
): void {
  // Set default options
  if (options.duration) {
    transitionDuration.value = options.duration
  }
  
  // Initialize motion preference check
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches
    
    mediaQuery.addEventListener('change', (e) => {
      prefersReducedMotion.value = e.matches
    })
  }
  
  // Track if we're on initial load
  let isInitialLoad = true
  let pendingRoute: any = null
  
  // IMPORTANT: This beforeEach runs FIRST (before auth guards)
  // It starts the exit animation but doesn't block navigation
  router.beforeEach((to, from, next) => {
    // Skip on initial load or same path
    if (isInitialLoad || to.path === from.path) {
      if (isInitialLoad) isInitialLoad = false
      next()
      return
    }
    
    // Check if route has custom config
    const routeConfig = getRouteTransition(to.path)
    const shouldSkip = routeConfig.enabled === false || skipNextTransition.value
    
    if (shouldSkip || prefersReducedMotion.value) {
      skipNextTransition.value = false
      next()
      return
    }
    
    // Start exit animation immediately (non-blocking)
    const duration = routeConfig.duration || transitionDuration.value
    isTransitioning.value = true
    transitionState.value = 'exiting'
    pendingRoute = to
    
    // Allow navigation to proceed immediately
    // The visual transition will play while auth checks happen
    next()
  })
  
  // After navigation completes, handle enter animation
  router.afterEach((to, from) => {
    // Only handle if we started a transition
    if (!isTransitioning.value || transitionState.value !== 'exiting') {
      return
    }
    
    const routeConfig = getRouteTransition(to.path)
    const duration = routeConfig.duration || transitionDuration.value
    const exitDuration = duration * 0.6
    
    // Wait for exit animation to cover screen
    setTimeout(() => {
      // Switch to entering state (reveal new content)
      transitionState.value = 'entering'
      
      const enterDuration = duration * 0.4
      
      // Wait for enter animation to complete
      setTimeout(() => {
        isTransitioning.value = false
        transitionState.value = 'idle'
        pendingRoute = null
      }, enterDuration)
    }, exitDuration)
  })
  
  // Handle errors - reset transition state
  router.onError((error) => {
    console.error('Router error:', error)
    isTransitioning.value = false
    transitionState.value = 'idle'
    pendingRoute = null
  })
}

// ============================================
// ACCESSIBILITY ANNOUNCER
// ============================================

/**
 * Announce page changes to screen readers
 * @param routeName - Name of the new route
 */
export function announcePageChange(routeName: string): void {
  if (typeof window === 'undefined') return
  
  // Create or update live region
  let announcer = document.getElementById('page-transition-announcer')
  
  if (!announcer) {
    announcer = document.createElement('div')
    announcer.id = 'page-transition-announcer'
    announcer.setAttribute('role', 'status')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    document.body.appendChild(announcer)
  }
  
  // Announce the change
  announcer.textContent = `Navigated to ${routeName}`
  
  // Clear after announcement
  setTimeout(() => {
    if (announcer) {
      announcer.textContent = ''
    }
  }, 1000)
}

/**
 * Setup focus management for page transitions
 * Ensures keyboard focus is properly managed during navigation
 */
export function setupFocusManagement(router: Router): void {
  router.afterEach((to) => {
    // Announce page change
    const pageName = to.meta.title as string || to.name?.toString() || to.path
    announcePageChange(pageName)
    
    // Focus management: move focus to main content
    setTimeout(() => {
      const mainContent = document.querySelector('main') || document.querySelector('[role="main"]')
      if (mainContent && mainContent instanceof HTMLElement) {
        // Set tabindex if not already set
        if (!mainContent.hasAttribute('tabindex')) {
          mainContent.setAttribute('tabindex', '-1')
        }
        mainContent.focus()
      }
    }, 100)
  })
}

// ============================================
// PERFORMANCE HELPERS
// ============================================

/**
 * Check if device can handle smooth transitions
 */
export function canHandleTransitions(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check for reduced motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return false
  
  // Check device capabilities (optional)
  // Could add checks for low-end devices if needed
  
  return true
}

/**
 * Get optimal transition duration based on device
 */
export function getOptimalDuration(): number {
  if (typeof window === 'undefined') return 900
  
  // Mobile devices: slightly faster
  const isMobile = window.innerWidth < 768
  return isMobile ? 700 : 900
}

