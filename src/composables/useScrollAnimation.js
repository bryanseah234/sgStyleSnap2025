/**
 * Scroll Animation Composable
 * 
 * Provides Intersection Observer functionality for scroll-triggered animations.
 * Detects when elements enter the viewport and adds animation classes.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Use Scroll Animation
 * 
 * Sets up an Intersection Observer to trigger animations when elements
 * enter the viewport. Adds the 'is-visible' class to elements that
 * become visible.
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Percentage of element visibility to trigger (0-1)
 * @param {string} options.rootMargin - Margin around the root
 * @returns {Object} - Observer methods and state
 */
export function useScrollAnimation(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    once = true
  } = options

  const observer = ref(null)
  const observedElements = ref(new Set())

  /**
   * Initialize the Intersection Observer
   */
  const initObserver = () => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver support
      // or SSR environments
      console.warn('IntersectionObserver not supported')
      return
    }

    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add visible class
            entry.target.classList.add('is-visible')
            
            // If once is true, stop observing this element
            if (once) {
              observer.value?.unobserve(entry.target)
              observedElements.value.delete(entry.target)
            }
          } else if (!once) {
            // Remove visible class if animation should repeat
            entry.target.classList.remove('is-visible')
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )
  }

  /**
   * Observe an element
   * 
   * @param {HTMLElement} element - The element to observe
   */
  const observe = (element) => {
    if (!element || observedElements.value.has(element)) return
    
    if (!observer.value) {
      initObserver()
    }
    
    if (observer.value) {
      observer.value.observe(element)
      observedElements.value.add(element)
    }
  }

  /**
   * Unobserve an element
   * 
   * @param {HTMLElement} element - The element to stop observing
   */
  const unobserve = (element) => {
    if (!element || !observer.value) return
    
    observer.value.unobserve(element)
    observedElements.value.delete(element)
  }

  /**
   * Observe multiple elements by selector
   * 
   * @param {string} selector - CSS selector for elements to observe
   */
  const observeElements = (selector) => {
    const elements = document.querySelectorAll(selector)
    elements.forEach(observe)
  }

  /**
   * Cleanup observer on unmount
   */
  const cleanup = () => {
    if (observer.value) {
      observedElements.value.forEach((element) => {
        observer.value.unobserve(element)
      })
      observer.value.disconnect()
      observedElements.value.clear()
    }
  }

  // Initialize on mount
  onMounted(() => {
    initObserver()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    observe,
    unobserve,
    observeElements,
    cleanup
  }
}

/**
 * Vue directive for scroll animations
 * 
 * Usage: <div v-scroll-animate>Content</div>
 * Or with options: <div v-scroll-animate.once.up>Content</div>
 */
export const vScrollAnimate = {
  mounted(el, binding) {
    // Determine animation class from modifiers
    let animationClass = 'fade-in-up'
    
    if (binding.modifiers.left) {
      animationClass = 'fade-in-left'
    } else if (binding.modifiers.right) {
      animationClass = 'fade-in-right'
    } else if (binding.modifiers.scale) {
      animationClass = 'scale-in-viewport'
    } else if (binding.modifiers.up) {
      animationClass = 'fade-in-up'
    }
    
    // Add animation class
    el.classList.add(animationClass)
    
    // Create observer with options from binding value
    const options = {
      threshold: binding.value?.threshold || 0.1,
      rootMargin: binding.value?.rootMargin || '0px 0px -50px 0px',
      once: !binding.modifiers.repeat
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            
            if (options.once) {
              observer.unobserve(entry.target)
            }
          } else if (!options.once) {
            entry.target.classList.remove('is-visible')
          }
        })
      },
      {
        threshold: options.threshold,
        rootMargin: options.rootMargin
      }
    )
    
    observer.observe(el)
    
    // Store observer on element for cleanup
    el._scrollObserver = observer
  },
  
  unmounted(el) {
    if (el._scrollObserver) {
      el._scrollObserver.disconnect()
      delete el._scrollObserver
    }
  }
}

