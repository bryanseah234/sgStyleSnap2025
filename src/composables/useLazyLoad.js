/**
 * Lazy Loading Composable
 * 
 * Provides utilities for lazy loading content, images, and components
 * using IntersectionObserver for better performance and UX.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Use Lazy Load
 * 
 * Sets up lazy loading for an element using IntersectionObserver.
 * Triggers a callback when the element enters the viewport.
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Percentage of element visibility to trigger (0-1)
 * @param {string} options.rootMargin - Margin around the viewport to trigger early/late
 * @param {boolean} options.once - Only trigger once (default: true)
 * @param {Function} options.onVisible - Callback when element becomes visible
 * @returns {Object} - Lazy loading state and methods
 */
export function useLazyLoad(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '100px', // Start loading 100px before visible
    once = true,
    onVisible = null
  } = options

  const elementRef = ref(null)
  const isVisible = ref(false)
  const isLoaded = ref(false)
  let observer = null

  /**
   * Initialize the IntersectionObserver
   */
  const initObserver = () => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      console.warn('IntersectionObserver not supported, loading immediately')
      isVisible.value = true
      isLoaded.value = true
      onVisible?.()
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded.value) {
            console.log('🎯 LazyLoad: Element is visible, triggering load')
            isVisible.value = true
            isLoaded.value = true
            
            // Call the visibility callback
            onVisible?.()
            
            // Disconnect if only loading once
            if (once) {
              cleanup()
            }
          } else if (!once) {
            isVisible.value = entry.isIntersecting
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    if (elementRef.value) {
      observer.observe(elementRef.value)
    }
  }

  /**
   * Cleanup observer
   */
  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = null
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
    elementRef,
    isVisible,
    isLoaded,
    cleanup
  }
}

/**
 * Use Progressive Image Loading
 * 
 * Loads images progressively with blur-up effect.
 * Shows a low-quality placeholder while loading the full image.
 * 
 * @param {string} src - Full resolution image URL
 * @param {string} placeholder - Low-quality placeholder URL (optional)
 * @returns {Object} - Progressive image loading state
 */
export function useProgressiveImage(src, placeholder = null) {
  const isLoaded = ref(false)
  const currentSrc = ref(placeholder || src)
  const error = ref(null)

  /**
   * Load the full resolution image
   */
  const loadImage = () => {
    const img = new Image()
    
    img.onload = () => {
      currentSrc.value = src
      isLoaded.value = true
      console.log('✅ Progressive image loaded:', src)
    }
    
    img.onerror = (err) => {
      error.value = err
      console.error('❌ Failed to load image:', src, err)
    }
    
    img.src = src
  }

  return {
    currentSrc,
    isLoaded,
    error,
    loadImage
  }
}

/**
 * Vue directive for lazy loading images
 * 
 * Usage: <img v-lazy-img="imageUrl" alt="Description" />
 */
export const vLazyImg = {
  mounted(el, binding) {
    const imageUrl = binding.value
    
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: load immediately
      el.src = imageUrl
      return
    }
    
    // Create observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load the image
            el.src = imageUrl
            el.classList.add('loaded')
            
            // Stop observing
            observer.unobserve(el)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )
    
    // Add loading class
    el.classList.add('lazy-loading')
    
    // Start observing
    observer.observe(el)
    
    // Store observer for cleanup
    el._lazyObserver = observer
  },
  
  unmounted(el) {
    if (el._lazyObserver) {
      el._lazyObserver.disconnect()
      delete el._lazyObserver
    }
  }
}

/**
 * Use Intersection Observer
 * 
 * A general-purpose IntersectionObserver hook for any element.
 * 
 * @param {Function} callback - Callback when element intersects
 * @param {Object} options - IntersectionObserver options
 * @returns {Object} - Observer state and methods
 */
export function useIntersectionObserver(callback, options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    once = false
  } = options

  const elementRef = ref(null)
  const isIntersecting = ref(false)
  let observer = null

  const initObserver = () => {
    if (!elementRef.value || observer) return
    
    if (!('IntersectionObserver' in window)) {
      // Fallback: trigger immediately
      callback(true)
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting.value = entry.isIntersecting
          
          if (entry.isIntersecting) {
            callback(true)
            
            if (once) {
              observer?.disconnect()
            }
          } else {
            callback(false)
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(elementRef.value)
  }

  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onMounted(() => {
    initObserver()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    elementRef,
    isIntersecting,
    cleanup
  }
}

