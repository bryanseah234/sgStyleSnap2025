/**
 * StyleSnap - Utility Functions
 * 
 * Provides utility functions for styling and class management,
 * particularly for combining Tailwind CSS classes safely.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges CSS classes safely
 * 
 * Utility function that combines multiple class inputs using clsx
 * and then merges conflicting Tailwind CSS classes using tailwind-merge.
 * This ensures that only the last conflicting class is applied.
 * 
 * @param {...(string|Object|Array)} inputs - Class inputs to combine
 * @returns {string} Merged class string
 * 
 * @example
 * // Basic usage
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4' (px-2 is overridden)
 * 
 * // With conditional classes
 * cn('base-class', { 'active-class': isActive, 'disabled-class': isDisabled })
 * 
 * // With arrays
 * cn(['class1', 'class2'], 'class3')
 * 
 * // Complex example
 * cn(
 *   'flex items-center gap-2',
 *   'px-4 py-2 rounded-lg',
 *   {
 *     'bg-blue-500 text-white': variant === 'primary',
 *     'bg-gray-200 text-gray-800': variant === 'secondary',
 *     'opacity-50 cursor-not-allowed': disabled
 *   },
 *   className // Additional classes from props
 * )
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
