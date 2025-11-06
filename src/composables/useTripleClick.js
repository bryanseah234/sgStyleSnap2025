/**
 * Triple Click Detection Composable
 * 
 * Detects triple-click events on elements and triggers a callback.
 * Used for hidden easter egg interactions.
 * 
 * @author Stylesnap Team
 * @version 1.0.0
 */

import { onMounted, onUnmounted } from 'vue'

/**
 * Use Triple Click
 * 
 * @param {Ref} elementRef - Vue ref to the target element
 * @param {Function} callback - Function to call on triple-click
 * @param {Object} options - Configuration options
 * @returns {Object} Composable methods
 */
export function useTripleClick(elementRef, callback, options = {}) {
  const {
    enabled = true,
    timeWindow = 600, // ms between clicks to count as triple-click
    preventDefault = false
  } = options
  
  let clickCount = 0
  let clickTimer = null
  let lastClickTime = 0
  
  /**
   * Handle click event
   */
  const handleClick = (event) => {
    if (!enabled) return
    
    const now = Date.now()
    const timeSinceLastClick = now - lastClickTime
    
    // Reset if too much time has passed
    if (timeSinceLastClick > timeWindow) {
      clickCount = 0
    }
    
    clickCount++
    lastClickTime = now
    
    // Clear existing timer
    if (clickTimer) {
      clearTimeout(clickTimer)
    }
    
    // Check for triple-click
    if (clickCount === 3) {
      console.log('🎉 Triple-click detected!')
      
      if (preventDefault) {
        event.preventDefault()
      }
      
      // Call the callback
      if (typeof callback === 'function') {
        callback(event)
      }
      
      // Reset
      clickCount = 0
      lastClickTime = 0
      
      return
    }
    
    // Auto-reset after time window
    clickTimer = setTimeout(() => {
      clickCount = 0
      lastClickTime = 0
    }, timeWindow)
  }
  
  /**
   * Reset click tracking
   */
  const reset = () => {
    clickCount = 0
    lastClickTime = 0
    if (clickTimer) {
      clearTimeout(clickTimer)
      clickTimer = null
    }
  }
  
  // Setup event listener
  onMounted(() => {
    const element = elementRef.value
    if (element) {
      element.addEventListener('click', handleClick)
    }
  })
  
  // Cleanup
  onUnmounted(() => {
    const element = elementRef.value
    if (element) {
      element.removeEventListener('click', handleClick)
    }
    if (clickTimer) {
      clearTimeout(clickTimer)
    }
  })
  
  return {
    reset
  }
}

