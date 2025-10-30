/**
 * useThrottle composable
 * Throttles function calls to improve performance and reduce input delays
 */
import { ref } from 'vue'

export function useThrottle() {
  let timeout = null
  let lastRun = 0

  const throttle = (func, delay = 200) => {
    return (...args) => {
      const now = Date.now()
      
      if (now - lastRun >= delay) {
        lastRun = now
        func(...args)
      } else {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          lastRun = Date.now()
          func(...args)
        }, delay - (now - lastRun))
      }
    }
  }

  return { throttle }
}

