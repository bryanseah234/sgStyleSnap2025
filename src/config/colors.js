/**
 * Color Configuration - StyleSnap
 *
 * Standardized color palette for AI-powered color detection
 * Used by: color-detector.js, ColorPicker.vue, color filters
 *
 * Reference: tasks/10-color-detection-ai.md
 */

export const COLOR_PALETTE = {
  // Neutrals
  black: { hex: '#000000', rgb: [0, 0, 0], category: 'neutral' },
  white: { hex: '#FFFFFF', rgb: [255, 255, 255], category: 'neutral' },
  gray: { hex: '#808080', rgb: [128, 128, 128], category: 'neutral' },
  beige: { hex: '#F5F5DC', rgb: [245, 245, 220], category: 'neutral' },
  brown: { hex: '#8B4513', rgb: [139, 69, 19], category: 'neutral' },
  charcoal: { hex: '#36454F', rgb: [54, 69, 79], category: 'neutral' },
  cream: { hex: '#FFFDD0', rgb: [255, 253, 208], category: 'neutral' },

  // Primary Colors
  red: { hex: '#FF0000', rgb: [255, 0, 0], category: 'primary' },
  blue: { hex: '#0000FF', rgb: [0, 0, 255], category: 'primary' },
  yellow: { hex: '#FFFF00', rgb: [255, 255, 0], category: 'primary' },

  // Secondary Colors
  green: { hex: '#00FF00', rgb: [0, 255, 0], category: 'secondary' },
  orange: { hex: '#FFA500', rgb: [255, 165, 0], category: 'secondary' },
  purple: { hex: '#800080', rgb: [128, 0, 128], category: 'secondary' },
  pink: { hex: '#FFC0CB', rgb: [255, 192, 203], category: 'secondary' },

  // Extended Colors
  navy: { hex: '#000080', rgb: [0, 0, 128], category: 'extended' },
  teal: { hex: '#008080', rgb: [0, 128, 128], category: 'extended' },
  maroon: { hex: '#800000', rgb: [128, 0, 0], category: 'extended' },
  olive: { hex: '#808000', rgb: [128, 128, 0], category: 'extended' },
  gold: { hex: '#FFD700', rgb: [255, 215, 0], category: 'extended' },
  silver: { hex: '#C0C0C0', rgb: [192, 192, 192], category: 'extended' },
  khaki: { hex: '#C3B091', rgb: [195, 176, 145], category: 'extended' },
  tan: { hex: '#D2B48C', rgb: [210, 180, 140], category: 'extended' },
  burgundy: { hex: '#800020', rgb: [128, 0, 32], category: 'extended' },
  indigo: { hex: '#4B0082', rgb: [75, 0, 130], category: 'extended' },
  turquoise: { hex: '#40E0D0', rgb: [64, 224, 208], category: 'extended' },
  coral: { hex: '#FF7F50', rgb: [255, 127, 80], category: 'extended' },
  mint: { hex: '#98FF98', rgb: [152, 255, 152], category: 'extended' },
  lavender: { hex: '#E6E6FA', rgb: [230, 230, 250], category: 'extended' },
  peach: { hex: '#FFE5B4', rgb: [255, 229, 180], category: 'extended' },
  salmon: { hex: '#FA8072', rgb: [250, 128, 114], category: 'extended' },
  lime: { hex: '#00FF00', rgb: [0, 255, 0], category: 'extended' },
  cyan: { hex: '#00FFFF', rgb: [0, 255, 255], category: 'extended' },
  magenta: { hex: '#FF00FF', rgb: [255, 0, 255], category: 'extended' },
  denim: { hex: '#1560BD', rgb: [21, 96, 189], category: 'extended' },
  emerald: { hex: '#50C878', rgb: [80, 200, 120], category: 'extended' },
  ruby: { hex: '#E0115F', rgb: [224, 17, 95], category: 'extended' },
  sapphire: { hex: '#0F52BA', rgb: [15, 82, 186], category: 'extended' },
  amber: { hex: '#FFBF00', rgb: [255, 191, 0], category: 'extended' },
  rose: { hex: '#FF007F', rgb: [255, 0, 127], category: 'extended' },
  forest: { hex: '#228B22', rgb: [34, 139, 34], category: 'extended' },
  sky: { hex: '#87CEEB', rgb: [135, 206, 235], category: 'extended' },
  wine: { hex: '#722F37', rgb: [114, 47, 55], category: 'extended' },
  mustard: { hex: '#FFDB58', rgb: [255, 219, 88], category: 'extended' },
  plum: { hex: '#8E4585', rgb: [142, 69, 133], category: 'extended' }
}

/**
 * Get all color names
 */
export function getColorNames() {
  return Object.keys(COLOR_PALETTE)
}

/**
 * Get colors by category
 */
export function getColorsByCategory(category) {
  return Object.entries(COLOR_PALETTE)
    .filter(([, color]) => color.category === category)
    .map(([name]) => name)
}

/**
 * Get hex value for color name
 */
export function getColorHex(colorName) {
  return COLOR_PALETTE[colorName]?.hex || '#808080'
}

/**
 * Get RGB value for color name
 */
export function getColorRgb(colorName) {
  return COLOR_PALETTE[colorName]?.rgb || [128, 128, 128]
}

/**
 * Check if color name is valid
 */
export function isValidColor(colorName) {
  return colorName in COLOR_PALETTE
}
