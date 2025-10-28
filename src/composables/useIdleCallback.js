/**
 * Waterfall-useIdleCallback composable
 * Defers non-critical work to idle periods to reduce input delays
 */
import { onUnmounted } from 'vue'

export function useIdleCallback() {
  let idleCallbackIds = []

  const runIdle = (callback, timeout = 5000) => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(callback, { timeout })
      idleCallbackIds.push(id)
      return id
    } else {
      // Fallback for browsers without requestIdleCallback
      const id = setTimeout(callback, 0)
      idleCallbackIds.push(id)
      return id
    }
  }

  const cancelIdle = (id) => {
    if (typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(id)
    } else {
      clearTimeout(id)
    }
    idleCallbackIds = idleCallbackIds.filter(callbackId => callbackId !== id)
  }

  onUnmounted(() => {
    // Clean up all idle callbacks
    idleCallbackIds.forEach(id => {
      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(id)
      } else {
        clearTimeout(id)
      }
    })
    idleCallbackIds = []
  })

  return { runIdle, cancelIdle }
}

