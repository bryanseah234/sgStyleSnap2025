/**
 * Clothing Types and Categories Constants
 * Central source of truth for all clothing classifications
 */

// Main categories
export const CATEGORIES = {
  TOP: 'top',
  BOTTOM: 'bottom',
  OUTERWEAR: 'outerwear',
  SHOES: 'shoes',
  ACCESSORY: 'accessory',
  DRESS: 'dress'
}

// Clothing types
export const CLOTHING_TYPES = [
  { value: 'blouse', label: 'Blouse', category: 'top' },
  { value: 'body', label: 'Bodysuit', category: 'top' },
  { value: 'hoodie', label: 'Hoodie', category: 'top' },
  { value: 'longsleeve', label: 'Long Sleeve Shirt', category: 'top' },
  { value: 'polo', label: 'Polo Shirt', category: 'top' },
  { value: 'shirt', label: 'Shirt', category: 'top' },
  { value: 't-shirt', label: 'T-Shirt', category: 'top' },
  { value: 'top', label: 'Top', category: 'top' },
  { value: 'undershirt', label: 'Undershirt', category: 'top' },
  { value: 'pants', label: 'Pants', category: 'bottom' },
  { value: 'shorts', label: 'Shorts', category: 'bottom' },
  { value: 'skirt', label: 'Skirt', category: 'bottom' },
  { value: 'dress', label: 'Dress', category: 'dress' },
  { value: 'blazer', label: 'Blazer', category: 'outerwear' },
  { value: 'outwear', label: 'Outerwear', category: 'outerwear' },
  { value: 'shoes', label: 'Shoes', category: 'shoes' },
  { value: 'hat', label: 'Hat', category: 'accessory' },
  { value: 'other', label: 'Other', category: 'accessory' }
]

// Privacy levels
export const PRIVACY_LEVELS = [
  { value: 'private', label: 'Private' },
  { value: 'friends', label: 'Visible to Friends' },
  { value: 'public', label: 'Public' }
]

// Privacy detail options
export const PRIVACY_DETAILS = [
  { value: 'photo', label: 'PHOTO' },
  { value: 'name', label: 'NAME' },
  { value: 'category', label: 'CATEGORY' }
]

// Get clothing types by category
export function getClothingTypesByCategory(category) {
  return CLOTHING_TYPES.filter(type => type.category === category)
}

// Get category from clothing type
export function getCategoryFromClothingType(clothingType) {
  const type = CLOTHING_TYPES.find(t => t.value === clothingType)
  return type ? type.category : 'top'
}
