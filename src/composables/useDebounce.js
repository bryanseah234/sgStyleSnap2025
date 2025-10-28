/**
 * useDebounce Composable
 * 
 * Provides debounce functionality for delaying function execution
 * until after a specified time has passed since the last invocation.
 */

export function useDebounce() {
  /**
   * Debounce a function
   * 
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait = 300) {
    let timeout
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  return {
    debounce
  }
}

