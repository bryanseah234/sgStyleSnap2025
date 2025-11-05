/**
 * Convert string to proper case (Title Case)
 * Handles special cases like "Nike", "Uniqlo", "H&M", etc.
 * 
 * @param {string} str - String to convert
 * @returns {string} Properly formatted string
 */
export const toProperCase = (str) => {
  if (!str) return ''
  
  // Trim and normalize whitespace
  str = str.trim().replace(/\s+/g, ' ')
  
  // Handle special brand names that should stay as-is
  const specialBrands = {
    'nike': 'Nike',
    'adidas': 'Adidas',
    'uniqlo': 'Uniqlo',
    'h&m': 'H&M',
    'levis': 'Levi\'s',
    'levi\'s': 'Levi\'s',
    'calvin klein': 'Calvin Klein',
    'tommy hilfiger': 'Tommy Hilfiger',
    'ralph lauren': 'Ralph Lauren',
    'dolce & gabbana': 'Dolce & Gabbana',
    'saint laurent': 'Saint Laurent',
    'louis vuitton': 'Louis Vuitton',
    'gap': 'Gap',
    'zara': 'Zara',
    'gucci': 'Gucci',
    'prada': 'Prada',
    'chanel': 'Chanel',
    'versace': 'Versace',
    'armani': 'Armani',
    'balenciaga': 'Balenciaga'
  }
  
  const lowerStr = str.toLowerCase()
  if (specialBrands[lowerStr]) {
    return specialBrands[lowerStr]
  }
  
  // Split by spaces and capitalize each word
  return str
    .split(' ')
    .map(word => {
      // Handle words with apostrophes (e.g., "Levi's")
      if (word.includes("'")) {
        const parts = word.split("'")
        return parts.map((part, i) => 
          i === 0 
            ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            : "'" + part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join('')
      }
      // Handle words with hyphens (e.g., "Calvin-Klein")
      if (word.includes('-')) {
        return word.split('-').map(part => 
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join('-')
      }
      // Handle words with ampersands (e.g., "Dolce & Gabbana")
      if (word.includes('&')) {
        return word.split('&').map(part => 
          part.trim().charAt(0).toUpperCase() + part.trim().slice(1).toLowerCase()
        ).join(' & ')
      }
      // Standard capitalization
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/**
 * Format a color name to proper case
 * @param {string} color - Color name to format
 * @returns {string} Formatted color name
 */
export const formatColor = (color) => {
  if (!color) return ''
  return color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()
}

/**
 * Format a category name to proper case
 * @param {string} category - Category name to format
 * @returns {string} Formatted category name
 */
export const formatCategory = (category) => {
  if (!category) return ''
  const categoryLabels = {
    'top': 'Tops',
    'bottom': 'Bottoms',
    'outerwear': 'Outerwear',
    'shoes': 'Shoes',
    'accessory': 'Accessories'
  }
  return categoryLabels[category.toLowerCase()] || category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
}

