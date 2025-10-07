/**
 * Clothing Types and Categories Constants
 * Central source of truth for all clothing classifications
 */

// User-specified clothing types
export const CLOTHING_TYPES = [
  'Blazer',
  'Blouse',
  'Body',
  'Dress',
  'Hat',
  'Hoodie',
  'Longsleeve',
  'Not sure',
  'Other',
  'Outwear',
  'Pants',
  'Polo',
  'Shirt',
  'Shoes',
  'Shorts',
  'Skip',
  'Skirt',
  'T-Shirt',
  'Top',
  'Undershirt',
]

// Broad categories (existing database structure)
export const CATEGORIES = {
  TOP: 'top',
  BOTTOM: 'bottom',
  OUTERWEAR: 'outerwear',
  SHOES: 'shoes',
  ACCESSORY: 'accessory',
}

// Mapping of clothing types to broad categories
export const CLOTHING_TYPE_TO_CATEGORY = {
  'Blazer': CATEGORIES.OUTERWEAR,
  'Blouse': CATEGORIES.TOP,
  'Body': CATEGORIES.TOP,
  'Dress': CATEGORIES.TOP, // Can be standalone outfit
  'Hat': CATEGORIES.ACCESSORY,
  'Hoodie': CATEGORIES.OUTERWEAR,
  'Longsleeve': CATEGORIES.TOP,
  'Not sure': CATEGORIES.TOP, // Default to top
  'Other': CATEGORIES.ACCESSORY,
  'Outwear': CATEGORIES.OUTERWEAR,
  'Pants': CATEGORIES.BOTTOM,
  'Polo': CATEGORIES.TOP,
  'Shirt': CATEGORIES.TOP,
  'Shoes': CATEGORIES.SHOES,
  'Shorts': CATEGORIES.BOTTOM,
  'Skip': CATEGORIES.TOP, // Default to top
  'Skirt': CATEGORIES.BOTTOM,
  'T-Shirt': CATEGORIES.TOP,
  'Top': CATEGORIES.TOP,
  'Undershirt': CATEGORIES.TOP,
}

// Get category from clothing type
export function getCategoryFromType(clothingType) {
  return CLOTHING_TYPE_TO_CATEGORY[clothingType] || CATEGORIES.TOP
}

// Get all clothing types for a category
export function getTypesForCategory(category) {
  return CLOTHING_TYPES.filter(
    (type) => CLOTHING_TYPE_TO_CATEGORY[type] === category
  )
}

// Validate clothing type
export function isValidClothingType(type) {
  return CLOTHING_TYPES.includes(type)
}

// Validate category
export function isValidCategory(category) {
  return Object.values(CATEGORIES).includes(category)
}

// Display labels for UI
export const CLOTHING_TYPE_LABELS = {
  'Blazer': 'Blazer',
  'Blouse': 'Blouse',
  'Body': 'Bodysuit',
  'Dress': 'Dress',
  'Hat': 'Hat',
  'Hoodie': 'Hoodie',
  'Longsleeve': 'Long Sleeve Shirt',
  'Not sure': 'Not Sure',
  'Other': 'Other',
  'Outwear': 'Outerwear',
  'Pants': 'Pants',
  'Polo': 'Polo Shirt',
  'Shirt': 'Shirt',
  'Shoes': 'Shoes',
  'Shorts': 'Shorts',
  'Skip': 'Skip',
  'Skirt': 'Skirt',
  'T-Shirt': 'T-Shirt',
  'Top': 'Top',
  'Undershirt': 'Undershirt',
}

// Category display labels
export const CATEGORY_LABELS = {
  [CATEGORIES.TOP]: 'Tops',
  [CATEGORIES.BOTTOM]: 'Bottoms',
  [CATEGORIES.OUTERWEAR]: 'Outerwear',
  [CATEGORIES.SHOES]: 'Shoes',
  [CATEGORIES.ACCESSORY]: 'Accessories',
}

// Outfit generation: Required categories for complete outfit
export const OUTFIT_REQUIRED_CATEGORIES = [
  CATEGORIES.TOP,
  CATEGORIES.BOTTOM,
  CATEGORIES.SHOES,
]

// Outfit generation: Optional categories
export const OUTFIT_OPTIONAL_CATEGORIES = [
  CATEGORIES.OUTERWEAR,
  CATEGORIES.ACCESSORY,
]

// Style tags for outfit generation
export const STYLE_TAGS = [
  'casual',
  'formal',
  'business',
  'sporty',
  'street',
  'boho',
  'vintage',
  'minimalist',
  'preppy',
  'edgy',
]

// Season tags
export const SEASON_TAGS = ['spring', 'summer', 'fall', 'winter', 'all-season']

// Color tags (basic colors for filtering)
export const COLOR_TAGS = [
  'black',
  'white',
  'gray',
  'beige',
  'brown',
  'red',
  'pink',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'multicolor',
]

// Weather conditions
export const WEATHER_CONDITIONS = {
  HOT: 'hot', // > 25°C
  WARM: 'warm', // 15-25°C
  COOL: 'cool', // 5-15°C
  COLD: 'cold', // < 5°C
}

// Occasions
export const OCCASIONS = {
  CASUAL: 'casual',
  WORK: 'work',
  DATE: 'date',
  WORKOUT: 'workout',
  FORMAL: 'formal',
  PARTY: 'party',
  TRAVEL: 'travel',
}

export default {
  CLOTHING_TYPES,
  CATEGORIES,
  CLOTHING_TYPE_TO_CATEGORY,
  CLOTHING_TYPE_LABELS,
  CATEGORY_LABELS,
  OUTFIT_REQUIRED_CATEGORIES,
  OUTFIT_OPTIONAL_CATEGORIES,
  STYLE_TAGS,
  SEASON_TAGS,
  COLOR_TAGS,
  WEATHER_CONDITIONS,
  OCCASIONS,
  getCategoryFromType,
  getTypesForCategory,
  isValidClothingType,
  isValidCategory,
}
