/**
 * Outfit Generator Service
 * AI-powered outfit generation using permutation-based algorithm
 * All processing happens locally - no external AI APIs
 */

import apiClient from './api'
import {
  CATEGORIES,
  OUTFIT_REQUIRED_CATEGORIES,
  WEATHER_CONDITIONS,
  OCCASIONS
} from '@/utils/clothing-constants'

// Outfit generation rules
const OUTFIT_RULES = {
  // Color harmony schemes
  colorSchemes: {
    monochromatic: 'Single color in different shades',
    analogous: 'Adjacent colors on color wheel',
    complementary: 'Opposite colors on color wheel',
    triadic: 'Three evenly spaced colors',
    neutral: 'Blacks, whites, grays, beige'
  },

  // Style compatibility matrix
  styleMatrix: {
    casual: ['casual', 'sporty', 'street'],
    formal: ['formal', 'business'],
    sporty: ['sporty', 'casual', 'street'],
    business: ['business', 'formal', 'casual'],
    street: ['street', 'casual', 'sporty'],
    boho: ['boho', 'casual'],
    vintage: ['vintage', 'casual'],
    minimalist: ['minimalist', 'formal', 'business', 'casual'],
    preppy: ['preppy', 'business', 'casual'],
    edgy: ['edgy', 'street', 'casual']
  },

  // Weather rules
  weatherRules: {
    [WEATHER_CONDITIONS.HOT]: {
      temp: '> 25°C',
      avoid: [CATEGORIES.OUTERWEAR],
      prefer: ['T-Shirt', 'Shorts', 'Dress']
    },
    [WEATHER_CONDITIONS.WARM]: {
      temp: '15-25°C',
      optional: [CATEGORIES.OUTERWEAR],
      prefer: ['Shirt', 'Pants', 'T-Shirt']
    },
    [WEATHER_CONDITIONS.COOL]: {
      temp: '5-15°C',
      require: [CATEGORIES.OUTERWEAR],
      prefer: ['Longsleeve', 'Pants', 'Blazer', 'Hoodie']
    },
    [WEATHER_CONDITIONS.COLD]: {
      temp: '< 5°C',
      require: [CATEGORIES.OUTERWEAR],
      prefer: ['Longsleeve', 'Pants', 'Outwear']
    }
  },

  // Occasion requirements
  occasions: {
    [OCCASIONS.WORK]: {
      styles: ['formal', 'business'],
      avoid: ['sporty', 'street'],
      prefer: ['Blazer', 'Shirt', 'Pants', 'Blouse']
    },
    [OCCASIONS.CASUAL]: {
      styles: ['casual'],
      avoid: ['formal'],
      prefer: ['T-Shirt', 'Pants', 'Shorts']
    },
    [OCCASIONS.WORKOUT]: {
      styles: ['sporty'],
      require: ['Shoes'],
      prefer: ['T-Shirt', 'Shorts']
    },
    [OCCASIONS.FORMAL]: {
      styles: ['formal'],
      avoid: ['casual', 'sporty'],
      prefer: ['Blazer', 'Shirt', 'Pants', 'Dress']
    },
    [OCCASIONS.DATE]: {
      styles: ['formal', 'business', 'casual'],
      prefer: ['Dress', 'Shirt', 'Blouse', 'Skirt']
    },
    [OCCASIONS.PARTY]: {
      styles: ['formal', 'casual', 'street'],
      prefer: ['Dress', 'Shirt', 'Skirt']
    }
  }
}

class OutfitGeneratorService {
  /**
   * Generate a complete outfit based on parameters
   * @param {Object} params - Generation parameters
   * @param {string} params.occasion - Occasion type
   * @param {string} params.weather - Weather condition
   * @param {string} params.style - Preferred style (optional)
   * @param {Array} params.userItems - User's closet items
   * @returns {Promise<Object>} Generated outfit
   */
  async generateOutfit(params) {
    const {
      occasion = OCCASIONS.CASUAL,
      weather = WEATHER_CONDITIONS.WARM,
      style = null,
      userItems = []
    } = params

    // Step 1: Filter items by weather
    const weatherAppropriate = this.filterByWeather(userItems, weather)

    // Step 2: Filter by occasion/style
    const styleAppropriate = this.filterByStyle(weatherAppropriate, occasion, style)

    // Step 3: Generate outfit combinations
    const combinations = this.generateCombinations(styleAppropriate)

    if (combinations.length === 0) {
      throw new Error('Not enough items to generate an outfit. Add more items to your closet!')
    }

    // Step 4: Score each combination
    const scoredOutfits = combinations.map(combo => ({
      items: combo,
      score: this.scoreOutfit(combo)
    }))

    // Step 5: Sort by score and get best outfit
    scoredOutfits.sort((a, b) => b.score - a.score)
    const bestOutfit = scoredOutfits[0]

    // Step 6: Save to database
    try {
      const response = await apiClient.post('/outfits/generate', {
        item_ids: bestOutfit.items.map(item => item.id),
        generation_params: { occasion, weather, style },
        color_scheme: this.detectColorScheme(bestOutfit.items),
        style_theme: style || this.detectStyleTheme(bestOutfit.items),
        occasion,
        weather_condition: weather,
        ai_score: Math.round(bestOutfit.score)
      })

      return {
        ...response.data,
        items: bestOutfit.items,
        score: Math.round(bestOutfit.score)
      }
    } catch (error) {
      console.error('Error saving generated outfit:', error)
      // Return outfit even if save fails
      return {
        items: bestOutfit.items,
        score: Math.round(bestOutfit.score),
        color_scheme: this.detectColorScheme(bestOutfit.items),
        style_theme: style || this.detectStyleTheme(bestOutfit.items),
        occasion,
        weather_condition: weather
      }
    }
  }

  /**
   * Filter items appropriate for weather
   * @private
   */
  filterByWeather(items, weather) {
    const rules = OUTFIT_RULES.weatherRules[weather]

    return items.filter(item => {
      // Check if category should be avoided
      if (rules.avoid && rules.avoid.includes(item.category)) {
        return false
      }

      // Prefer certain clothing types in this weather
      if (rules.prefer && item.clothing_type && rules.prefer.includes(item.clothing_type)) {
        return true
      }

      return true
    })
  }

  /**
   * Filter items by style compatibility
   * @private
   */
  filterByStyle(items, occasion, preferredStyle) {
    const occasionRules = OUTFIT_RULES.occasions[occasion]

    return items.filter(item => {
      // Check style compatibility
      if (preferredStyle) {
        const compatible = OUTFIT_RULES.styleMatrix[preferredStyle] || []
        const itemStyles = item.style_tags || []

        if (itemStyles.length > 0 && !itemStyles.some(tag => compatible.includes(tag))) {
          return false
        }
      }

      // Check occasion requirements
      if (occasionRules) {
        const itemStyles = item.style_tags || []

        // Check if style should be avoided
        if (occasionRules.avoid && itemStyles.some(tag => occasionRules.avoid.includes(tag))) {
          return false
        }

        // Prefer certain styles for this occasion
        if (
          occasionRules.styles &&
          itemStyles.length > 0 &&
          !itemStyles.some(tag => occasionRules.styles.includes(tag))
        ) {
          // Not strictly required, but reduces priority
          return true
        }
      }

      return true
    })
  }

  /**
   * Generate all valid outfit combinations
   * @private
   */
  generateCombinations(items) {
    const combinations = []
    const categories = {
      top: items.filter(i => i.category === CATEGORIES.TOP),
      bottom: items.filter(i => i.category === CATEGORIES.BOTTOM),
      shoes: items.filter(i => i.category === CATEGORIES.SHOES),
      outerwear: items.filter(i => i.category === CATEGORIES.OUTERWEAR),
      accessory: items.filter(i => i.category === CATEGORIES.ACCESSORY)
    }

    // Check if we have minimum required items
    if (
      categories.top.length === 0 ||
      categories.bottom.length === 0 ||
      categories.shoes.length === 0
    ) {
      // Check if we have a dress (can replace top+bottom)
      const dresses = items.filter(
        i => i.clothing_type === 'Dress' && i.category === CATEGORIES.TOP
      )
      if (dresses.length > 0 && categories.shoes.length > 0) {
        // Generate dress combinations
        for (const dress of dresses) {
          for (const shoes of categories.shoes) {
            const combo = [dress, shoes]

            // Optionally add outerwear
            if (categories.outerwear.length > 0) {
              for (const outerwear of categories.outerwear.slice(0, 2)) {
                combinations.push([...combo, outerwear])
              }
            }

            combinations.push(combo)
          }
        }
      }

      if (combinations.length === 0) {
        return [] // Not enough items
      }

      return combinations.slice(0, 100) // Limit combinations
    }

    // Generate required combinations (top + bottom + shoes)
    // Limit to prevent excessive combinations
    const maxTops = Math.min(categories.top.length, 5)
    const maxBottoms = Math.min(categories.bottom.length, 5)
    const maxShoes = Math.min(categories.shoes.length, 3)

    for (let t = 0; t < maxTops; t++) {
      const top = categories.top[t]
      for (let b = 0; b < maxBottoms; b++) {
        const bottom = categories.bottom[b]
        for (let s = 0; s < maxShoes; s++) {
          const shoes = categories.shoes[s]
          const combo = [top, bottom, shoes]

          // Optionally add outerwear
          if (categories.outerwear.length > 0) {
            for (const outerwear of categories.outerwear.slice(0, 2)) {
              combinations.push([...combo, outerwear])
            }
          }

          // Base combination
          combinations.push(combo)
        }
      }
    }

    return combinations.slice(0, 100) // Limit to 100 combinations
  }

  /**
   * Score an outfit combination (0-100)
   * @private
   */
  scoreOutfit(items) {
    let score = 0

    // Color harmony score (0-40 points)
    score += this.scoreColorHarmony(items) * 40

    // Style consistency score (0-30 points)
    score += this.scoreStyleConsistency(items) * 30

    // Completeness score (0-20 points)
    score += this.scoreCompleteness(items) * 20

    // User preference score (0-10 points)
    score += this.scoreUserPreference(items) * 10

    return Math.min(100, Math.max(0, score))
  }

  /**
   * Score color harmony (0-1)
   * @private
   */
  scoreColorHarmony(items) {
    const colors = items.map(item => item.primary_color || item.color).filter(Boolean)

    if (colors.length === 0) return 0.5

    // Check for monochromatic (all same color)
    const uniqueColors = [...new Set(colors)]
    if (uniqueColors.length === 1) {
      return 1.0 // Perfect monochromatic
    }

    // Check for neutral combinations (always safe)
    const neutrals = ['black', 'white', 'gray', 'grey', 'beige', 'brown']
    if (colors.every(c => neutrals.includes(c.toLowerCase()))) {
      return 0.9 // Neutral combinations are safe
    }

    // Check for complementary colors
    const complementary = this.getComplementaryColor(colors[0])
    if (colors.includes(complementary)) {
      return 0.85 // Good complementary match
    }

    // Check for analogous colors
    const analogous = this.getAnalogousColors(colors[0])
    if (colors.some(c => analogous.includes(c))) {
      return 0.8 // Good analogous match
    }

    // Default: neutral score
    return 0.6
  }

  /**
   * Score style consistency (0-1)
   * @private
   */
  scoreStyleConsistency(items) {
    const styles = items.flatMap(item => item.style_tags || [])
    if (styles.length === 0) return 0.5

    const uniqueStyles = [...new Set(styles)]

    // All items have same style
    if (uniqueStyles.length === 1) {
      return 1.0
    }

    // Check style matrix compatibility
    const compatible = uniqueStyles.every(style => {
      return uniqueStyles.every(otherStyle => {
        const compat = OUTFIT_RULES.styleMatrix[style] || []
        return style === otherStyle || compat.includes(otherStyle)
      })
    })

    return compatible ? 0.8 : 0.5
  }

  /**
   * Score outfit completeness (0-1)
   * @private
   */
  scoreCompleteness(items) {
    const categories = items.map(i => i.category)

    // Check all required categories present
    const hasRequired = OUTFIT_REQUIRED_CATEGORIES.every(cat => categories.includes(cat))
    if (!hasRequired) {
      // Check if it's a dress outfit
      const hasDress = items.some(i => i.clothing_type === 'Dress')
      const hasShoes = categories.includes(CATEGORIES.SHOES)
      if (hasDress && hasShoes) return 0.9
      return 0.3
    }

    // Bonus for optional items
    const hasOuterwear = categories.includes(CATEGORIES.OUTERWEAR)
    const hasAccessory = categories.includes(CATEGORIES.ACCESSORY)

    if (hasOuterwear && hasAccessory) return 1.0
    if (hasOuterwear || hasAccessory) return 0.9
    return 0.8 // Just required items
  }

  /**
   * Score based on user preferences (0-1)
   * @private
   */
  scoreUserPreference() {
    // TODO: Implement based on user's wear history and ratings
    // For now, return neutral score
    return 0.5
  }

  /**
   * Detect color scheme used in outfit
   * @private
   */
  detectColorScheme(items) {
    const colors = items.map(item => item.primary_color || item.color).filter(Boolean)
    const uniqueColors = [...new Set(colors)]

    if (uniqueColors.length === 1) return 'monochromatic'

    const neutrals = ['black', 'white', 'gray', 'grey', 'beige', 'brown']
    if (colors.every(c => neutrals.includes(c.toLowerCase()))) return 'neutral'

    // Check for complementary
    if (colors.length >= 2) {
      const complementary = this.getComplementaryColor(colors[0])
      if (colors.includes(complementary)) return 'complementary'

      // Check for analogous
      const analogous = this.getAnalogousColors(colors[0])
      if (colors.some(c => analogous.includes(c))) return 'analogous'
    }

    return 'mixed'
  }

  /**
   * Detect dominant style theme
   * @private
   */
  detectStyleTheme(items) {
    const styles = items.flatMap(item => item.style_tags || [])
    if (styles.length === 0) return 'casual'

    const styleCounts = styles.reduce((acc, style) => {
      acc[style] = (acc[style] || 0) + 1
      return acc
    }, {})

    const dominant = Object.entries(styleCounts).sort(([, a], [, b]) => b - a)[0]

    return dominant ? dominant[0] : 'casual'
  }

  /**
   * Get complementary color
   * @private
   */
  getComplementaryColor(color) {
    const complementaryMap = {
      red: 'green',
      green: 'red',
      blue: 'orange',
      orange: 'blue',
      yellow: 'purple',
      purple: 'yellow',
      pink: 'green',
      teal: 'red'
    }
    return complementaryMap[color?.toLowerCase()] || color
  }

  /**
   * Get analogous colors
   * @private
   */
  getAnalogousColors(color) {
    const analogousMap = {
      red: ['orange', 'pink'],
      orange: ['red', 'yellow'],
      yellow: ['orange', 'green'],
      green: ['yellow', 'teal'],
      blue: ['teal', 'purple'],
      purple: ['blue', 'pink'],
      pink: ['purple', 'red'],
      teal: ['green', 'blue']
    }
    return analogousMap[color?.toLowerCase()] || []
  }

  /**
   * Get pre-generated outfit suggestions
   */
  async getSuggestedOutfits(params = {}) {
    try {
      const response = await apiClient.get('/outfits/suggested', { params })
      return response.data
    } catch (error) {
      console.error('Error getting suggested outfits:', error)
      throw error
    }
  }

  /**
   * Rate a generated outfit
   */
  async rateOutfit(outfitId, rating) {
    try {
      const response = await apiClient.post(`/outfits/${outfitId}/rate`, {
        rating
      })
      return response.data
    } catch (error) {
      console.error('Error rating outfit:', error)
      throw error
    }
  }

  /**
   * Save outfit to collection
   */
  async saveOutfit(outfitId, collectionId = null) {
    try {
      const response = await apiClient.post(`/outfits/${outfitId}/save`, {
        collection_id: collectionId
      })
      return response.data
    } catch (error) {
      console.error('Error saving outfit:', error)
      throw error
    }
  }

  /**
   * Get outfit generation history
   */
  async getHistory(params = {}) {
    try {
      const response = await apiClient.get('/outfits/history', { params })
      return response.data
    } catch (error) {
      console.error('Error getting outfit history:', error)
      throw error
    }
  }
}

export default new OutfitGeneratorService()
