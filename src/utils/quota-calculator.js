/**
 * Quota Calculator Utility - StyleSnap
 *
 * Purpose: Helper functions for calculating and checking user's closet item quota
 *
 * Business Rules:
 * - Each user has a 50 upload quota (hard limit, catalog items unlimited)
 * - Quota is enforced at database level (check constraint) and application level
 * - Show warning when user reaches 90% (45 uploads)
 * - Block uploads when at 100% (200 items)
 *
 * Functions:
 * - calculateQuota(currentCount, maxCount = 50): Calculates quota info (upload limit)
 *   - Returns: {
 *       used: number,
 *       max: number,
 *       remaining: number,
 *       percentage: number (0-100),
 *       isNearLimit: boolean (>= 90%),
 *       isFull: boolean (>= 100%)
 *     }
 *
 * - canAddItems(currentCount, itemsToAdd = 1, maxCount = 200): Checks if items can be added
 *   - Returns: { allowed: boolean, reason?: string }
 *
 * - getQuotaColor(percentage): Returns color based on quota usage
 *   - 0-80%: 'green' or 'success'
 *   - 80-90%: 'yellow' or 'warning'
 *   - 90-100%: 'red' or 'danger'
 *
 * - getQuotaMessage(quota): Returns user-friendly message
 *   - < 90%: "You have X items. Y spots remaining."
 *   - 90-99%: "You're almost at your limit! Only Y spots left."
 *   - 100%: "You've reached your 50 upload limit. Add unlimited items from catalog!"
 *
 * Usage:
 * import { calculateQuota, canAddItems, getQuotaColor } from './quota-calculator'
 *
 * const quota = calculateQuota(userItemCount)
 * console.log(quota.percentage) // 75
 * console.log(quota.remaining) // 50
 *
 * const check = canAddItems(userItemCount, 5)
 * if (!check.allowed) {
 *   alert(check.reason)
 * }
 *
 * const color = getQuotaColor(quota.percentage)
 * // Use color for ProgressBar component
 *
 * Reference:
 * - requirements/database-schema.md for quota constraint
 * - tasks/06-quotas-maintenance.md for quota management
 * - components/ui/QuotaIndicator.vue uses these functions
 * - stores/closet-store.js uses these functions
 */

/**
 * Default max quota
 */
const DEFAULT_MAX_QUOTA = 50 // Upload limit (catalog items don't count)
const WARNING_THRESHOLD = 0.9 // 90%

/**
 * Calculates quota information
 * @param {number} currentCount - Current item count
 * @param {number} maxCount - Maximum allowed items (default: 200)
 * @returns {Object} Quota information
 */
export function calculateQuota(currentCount, maxCount = DEFAULT_MAX_QUOTA) {
  const used = currentCount
  const max = maxCount
  const remaining = Math.max(0, max - used)
  const percentage = (used / max) * 100
  const isNearLimit = percentage >= WARNING_THRESHOLD * 100
  const isFull = used >= max

  return {
    used,
    max,
    remaining,
    percentage: Math.round(percentage * 10) / 10,
    isNearLimit,
    isFull
  }
}

/**
 * Checks if items can be added
 * @param {number} currentCount - Current item count
 * @param {number} itemsToAdd - Number of items to add (default: 1)
 * @param {number} maxCount - Maximum allowed items (default: 200)
 * @returns {Object} { allowed: boolean, reason?: string }
 */
export function canAddItems(currentCount, itemsToAdd = 1, maxCount = DEFAULT_MAX_QUOTA) {
  const wouldExceed = currentCount + itemsToAdd > maxCount

  if (wouldExceed) {
    const remaining = maxCount - currentCount
    return {
      allowed: false,
      reason: `Cannot add ${itemsToAdd} ${itemsToAdd === 1 ? 'item' : 'items'}. You have ${remaining} ${remaining === 1 ? 'spot' : 'spots'} remaining.`
    }
  }

  return { allowed: true }
}

/**
 * Returns color variant based on quota percentage
 * @param {number} percentage - Quota usage percentage (0-100)
 * @returns {string} Color variant ('success', 'warning', 'danger')
 */
export function getQuotaColor(percentage) {
  if (percentage >= 90) return 'danger'
  if (percentage >= 80) return 'warning'
  return 'success'
}

/**
 * Returns user-friendly quota message
 * @param {Object} quota - Quota object from calculateQuota()
 * @returns {string} User-friendly message
 */
export function getQuotaMessage(quota) {
  if (quota.isFull) {
    return "You've reached your 50 upload limit. Add unlimited items from catalog!"
  }

  if (quota.isNearLimit) {
    return `You're almost at your limit! Only ${quota.remaining} ${quota.remaining === 1 ? 'spot' : 'spots'} left.`
  }

  return `You have ${quota.used} ${quota.used === 1 ? 'item' : 'items'}. ${quota.remaining} ${quota.remaining === 1 ? 'spot' : 'spots'} remaining.`
}
