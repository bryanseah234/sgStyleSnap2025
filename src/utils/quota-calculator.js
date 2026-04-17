/**
 * Quota Calculator Utility
 * Pure functions for calculating and displaying upload quota state.
 */

const DEFAULT_MAX = 50

/**
 * Calculate quota state from current usage.
 * @param {number} used - Number of items currently used
 * @param {number} [max=50] - Maximum allowed items
 * @returns {{ used, max, remaining, percentage, isNearLimit, isFull }}
 */
export function calculateQuota(used = 0, max = DEFAULT_MAX) {
  const remaining = Math.max(0, max - used)
  const percentage = Math.round((used / max) * 100)
  const isNearLimit = percentage >= 90
  const isFull = used >= max

  return { used, max, remaining, percentage, isNearLimit, isFull }
}

/**
 * Check whether adding items is allowed.
 * @param {number} current - Current item count
 * @param {number} [toAdd=1] - Number of items to add
 * @param {number} [max=50] - Maximum allowed items
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canAddItems(current = 0, toAdd = 1, max = DEFAULT_MAX) {
  if (toAdd === 0) return { allowed: true }

  const remaining = Math.max(0, max - current)
  if (toAdd <= remaining) return { allowed: true }

  const itemWord = toAdd === 1 ? 'item' : 'items'
  const spotWord = remaining === 1 ? 'spot remaining' : 'spots remaining'
  return {
    allowed: false,
    reason: `Cannot add ${toAdd} ${itemWord}. Only ${remaining} ${spotWord}.`
  }
}

/**
 * Return a colour category based on percentage used.
 * @param {number} percentage
 * @returns {'success'|'warning'|'danger'}
 */
export function getQuotaColor(percentage) {
  if (percentage >= 90) return 'danger'
  if (percentage >= 80) return 'warning'
  return 'success'
}

/**
 * Return a human-readable quota message.
 * @param {{ used, max, remaining, isNearLimit, isFull }} quota
 * @returns {string}
 */
export function getQuotaMessage(quota) {
  const { used, max, remaining, isNearLimit, isFull } = quota

  if (isFull) {
    return `You've reached your ${max} upload limit. Add unlimited items from catalog!`
  }

  if (isNearLimit) {
    const spotWord = remaining === 1 ? 'spot left' : 'spots left'
    return `You're almost at your limit! Only ${remaining} ${spotWord}.`
  }

  const itemWord = used === 1 ? 'item' : 'items'
  const spotWord = remaining === 1 ? 'spot remaining' : 'spots remaining'
  return `You have ${used} ${itemWord}. ${remaining} ${spotWord}.`
}
