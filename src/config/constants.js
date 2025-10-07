/**
 * Constants Configuration - StyleSnap
 * 
 * Purpose: Centralized constants for clothing categories, colors, and other enumerations
 * 
 * Usage:
 * import { CLOTHING_CATEGORIES, COLORS } from '@/config/constants'
 */

/**
 * Clothing Categories
 * 
 * Detailed categories for precise filtering and organization
 * These categories replace the simple 5-category system (top, bottom, outerwear, shoes, accessory)
 */
export const CLOTHING_CATEGORIES = [
  { value: 'blazer', label: 'Blazer', group: 'outerwear' },
  { value: 'blouse', label: 'Blouse', group: 'top' },
  { value: 'body', label: 'Body', group: 'top' },
  { value: 'dress', label: 'Dress', group: 'dress' },
  { value: 'hat', label: 'Hat', group: 'accessory' },
  { value: 'hoodie', label: 'Hoodie', group: 'top' },
  { value: 'longsleeve', label: 'Longsleeve', group: 'top' },
  { value: 'not-sure', label: 'Not sure', group: 'other' },
  { value: 'other', label: 'Other', group: 'other' },
  { value: 'outerwear', label: 'Outerwear', group: 'outerwear' },
  { value: 'pants', label: 'Pants', group: 'bottom' },
  { value: 'polo', label: 'Polo', group: 'top' },
  { value: 'shirt', label: 'Shirt', group: 'top' },
  { value: 'shoes', label: 'Shoes', group: 'shoes' },
  { value: 'shorts', label: 'Shorts', group: 'bottom' },
  { value: 'skip', label: 'Skip', group: 'other' },
  { value: 'skirt', label: 'Skirt', group: 'bottom' },
  { value: 't-shirt', label: 'T-Shirt', group: 'top' },
  { value: 'top', label: 'Top', group: 'top' },
  { value: 'undershirt', label: 'Undershirt', group: 'top' }
]

/**
 * Simple Categories (legacy grouping for backward compatibility)
 */
export const SIMPLE_CATEGORIES = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'dress', label: 'Dress' },
  { value: 'other', label: 'Other' }
]

/**
 * Category values array (for validation)
 */
export const CATEGORY_VALUES = CLOTHING_CATEGORIES.map(c => c.value)

/**
 * Category groups for organization
 */
export const CATEGORY_GROUPS = {
  top: CLOTHING_CATEGORIES.filter(c => c.group === 'top'),
  bottom: CLOTHING_CATEGORIES.filter(c => c.group === 'bottom'),
  outerwear: CLOTHING_CATEGORIES.filter(c => c.group === 'outerwear'),
  shoes: CLOTHING_CATEGORIES.filter(c => c.group === 'shoes'),
  accessory: CLOTHING_CATEGORIES.filter(c => c.group === 'accessory'),
  dress: CLOTHING_CATEGORIES.filter(c => c.group === 'dress'),
  other: CLOTHING_CATEGORIES.filter(c => c.group === 'other')
}

/**
 * Standardized Colors (18 colors from color detection system)
 */
export const COLORS = [
  // Neutrals
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'white', label: 'White', hex: '#FFFFFF' },
  { value: 'gray', label: 'Gray', hex: '#808080' },
  { value: 'beige', label: 'Beige', hex: '#F5F5DC' },
  { value: 'brown', label: 'Brown', hex: '#8B4513' },
  
  // Primary Colors
  { value: 'red', label: 'Red', hex: '#FF0000' },
  { value: 'blue', label: 'Blue', hex: '#0000FF' },
  { value: 'yellow', label: 'Yellow', hex: '#FFFF00' },
  
  // Secondary Colors
  { value: 'green', label: 'Green', hex: '#00FF00' },
  { value: 'orange', label: 'Orange', hex: '#FFA500' },
  { value: 'purple', label: 'Purple', hex: '#800080' },
  { value: 'pink', label: 'Pink', hex: '#FFC0CB' },
  
  // Additional
  { value: 'gold', label: 'Gold', hex: '#FFD700' },
  { value: 'silver', label: 'Silver', hex: '#C0C0C0' },
  { value: 'navy', label: 'Navy', hex: '#000080' },
  { value: 'maroon', label: 'Maroon', hex: '#800000' },
  { value: 'teal', label: 'Teal', hex: '#008080' },
  { value: 'cream', label: 'Cream', hex: '#FFFDD0' }
]

/**
 * Color values array (for validation)
 */
export const COLOR_VALUES = COLORS.map(c => c.value)

/**
 * Seasons
 */
export const SEASONS = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
  { value: 'all-season', label: 'All Season' }
]

/**
 * Privacy Settings
 */
export const PRIVACY_OPTIONS = [
  { value: 'private', label: 'Private', description: 'Only you can see this' },
  { value: 'friends', label: 'Friends', description: 'Your friends can see this' }
]

/**
 * Style Tags
 */
export const STYLE_TAGS = [
  'casual',
  'formal',
  'business',
  'sporty',
  'trendy',
  'vintage',
  'streetwear',
  'bohemian',
  'minimalist',
  'preppy',
  'athletic',
  'elegant',
  'edgy',
  'romantic',
  'classic'
]

/**
 * Sizes
 */
export const SIZES = [
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
  'One Size'
]

/**
 * Item Quotas
 */
export const QUOTAS = {
  MAX_ITEMS: 200,
  WARNING_THRESHOLD: 180, // 90% of max
  RECOVERY_PERIOD_DAYS: 30
}

/**
 * Helper Functions
 */

/**
 * Get category label by value
 */
export function getCategoryLabel(value) {
  const category = CLOTHING_CATEGORIES.find(c => c.value === value)
  return category ? category.label : value
}

/**
 * Get category group by value
 */
export function getCategoryGroup(value) {
  const category = CLOTHING_CATEGORIES.find(c => c.value === value)
  return category ? category.group : 'other'
}

/**
 * Get color hex by value
 */
export function getColorHex(value) {
  const color = COLORS.find(c => c.value === value)
  return color ? color.hex : '#000000'
}

/**
 * Filter categories by group
 */
export function getCategoriesByGroup(group) {
  return CLOTHING_CATEGORIES.filter(c => c.group === group)
}

export default {
  CLOTHING_CATEGORIES,
  SIMPLE_CATEGORIES,
  CATEGORY_VALUES,
  CATEGORY_GROUPS,
  COLORS,
  COLOR_VALUES,
  SEASONS,
  PRIVACY_OPTIONS,
  STYLE_TAGS,
  SIZES,
  QUOTAS,
  getCategoryLabel,
  getCategoryGroup,
  getColorHex,
  getCategoriesByGroup
}
