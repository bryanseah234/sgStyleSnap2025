/**
 * Outfit Recommendation Service
 * 
 * Generates outfit recommendations by:
 * 1. Creating outfit permutations from user's closet items
 * 2. Filtering based on color theory and category rules
 * 3. Scoring outfits using ftransformer API
 * 4. Ranking and returning top recommendations
 */

import { scoreOutfit } from './fashion-transformer-service.js'

/**
 * Color theory compatibility rules
 */
const COLOR_COMPATIBILITY = {
  // Neutral colors go with everything
  neutral: ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'tan', 'ivory', 'cream', 'charcoal'],
  
  // Warm colors complement each other
  warm: ['red', 'orange', 'yellow', 'pink', 'burgundy', 'coral', 'peach', 'salmon'],
  
  // Cool colors complement each other
  cool: ['blue', 'green', 'purple', 'teal', 'turquoise', 'mint', 'lavender', 'indigo'],
  
  // Earth tones
  earth: ['brown', 'olive', 'khaki', 'terracotta', 'rust', 'burgundy', 'tan']
}

/**
 * Generate color compatibility score based on color theory
 */
function calculateColorScore(item1, item2) {
  const color1 = (item1.color || item1.primary_color || '').toLowerCase()
  const color2 = (item2.color || item2.primary_color || '').toLowerCase()
  
  if (!color1 || !color2) return 0.5 // Neutral score if colors unknown
  
  // Same color - high score
  if (color1 === color2) return 0.9
  
  // Both neutral - high score
  if (COLOR_COMPATIBILITY.neutral.includes(color1) && 
      COLOR_COMPATIBILITY.neutral.includes(color2)) {
    return 0.95
  }
  
  // One neutral, one colored - good score
  if (COLOR_COMPATIBILITY.neutral.includes(color1) || 
      COLOR_COMPATIBILITY.neutral.includes(color2)) {
    return 0.85
  }
  
  // Both warm - good score
  if (COLOR_COMPATIBILITY.warm.some(c => color1.includes(c)) &&
      COLOR_COMPATIBILITY.warm.some(c => color2.includes(c))) {
    return 0.8
  }
  
  // Both cool - good score
  if (COLOR_COMPATIBILITY.cool.some(c => color1.includes(c)) &&
      COLOR_COMPATIBILITY.cool.some(c => color2.includes(c))) {
    return 0.8
  }
  
  // Complementary colors (e.g., red-green, blue-orange) - moderate score
  if ((COLOR_COMPATIBILITY.warm.some(c => color1.includes(c)) &&
       COLOR_COMPATIBILITY.cool.some(c => color2.includes(c))) ||
      (COLOR_COMPATIBILITY.cool.some(c => color1.includes(c)) &&
       COLOR_COMPATIBILITY.warm.some(c => color2.includes(c)))) {
    return 0.6
  }
  
  // Default moderate score
  return 0.5
}

/**
 * Check if two items are compatible based on category rules
 */
function areCategoriesCompatible(item1, item2, item3 = null) {
  const cats = [item1.category, item2.category, item3?.category].filter(Boolean)
  
  // Must have at least top and bottom (or dress)
  const hasDress = cats.some(c => c === 'dress')
  const hasTop = cats.some(c => ['top', 'blouse', 'shirt', 't-shirt', 'longsleeve', 'polo', 'hoodie', 'blazer'].includes(c))
  const hasBottom = cats.some(c => ['bottom', 'pants', 'skirt', 'shorts'].includes(c))
  
  if (hasDress && cats.length > 1) return false // Dress should be standalone or with accessories
  if (hasDress) return true
  
  if (!hasTop || !hasBottom) return false
  
  return true
}

/**
 * Generate all possible outfit combinations from user's closet
 */
function generateOutfitCombinations(items, maxCombinations = 50) {
  const combinations = []
  
  // Filter items by category
  const tops = items.filter(i => ['top', 'blouse', 'shirt', 't-shirt', 'longsleeve', 'polo', 'hoodie', 'blazer', 'body'].includes(i.category))
  const bottoms = items.filter(i => ['bottom', 'pants', 'skirt', 'shorts'].includes(i.category))
  const dresses = items.filter(i => i.category === 'dress')
  const outerwear = items.filter(i => i.category === 'outerwear')
  const shoes = items.filter(i => i.category === 'shoes')
  
  // Generate 2-item combinations (top + bottom)
  for (const top of tops) {
    for (const bottom of bottoms) {
      if (combinations.length >= maxCombinations) break
      if (areCategoriesCompatible(top, bottom)) {
        combinations.push([top, bottom])
      }
    }
  }
  
  // Generate 3-item combinations (top + bottom + outerwear OR accessories OR shoes)
  for (const top of tops) {
    for (const bottom of bottoms) {
      if (combinations.length >= maxCombinations) break
      
      // Add outerwear
      for (const o of outerwear.slice(0, 3)) { // Limit to first 3 to reduce combinations
        if (areCategoriesCompatible(top, bottom, o)) {
          combinations.push([top, bottom, o])
        }
      }
      
      // Add shoes
      for (const shoe of shoes.slice(0, 3)) {
        if (areCategoriesCompatible(top, bottom, shoe)) {
          combinations.push([top, bottom, shoe])
        }
      }
    }
  }
  
  // Generate dress combinations (dress + outerwear OR shoes OR accessories)
  for (const dress of dresses) {
    if (combinations.length >= maxCombinations) break
    
    // Dress alone
    combinations.push([dress])
    
    // Dress + outerwear
    for (const o of outerwear.slice(0, 2)) {
      if (combinations.length >= maxCombinations) break
      combinations.push([dress, o])
    }
    
    // Dress + shoes
    for (const shoe of shoes.slice(0, 2)) {
      if (combinations.length >= maxCombinations) break
      combinations.push([dress, shoe])
    }
  }
  
  return combinations
}

/**
 * Pre-filter combinations based on color compatibility
 */
function preFilterByColor(items, minScore = 0.6) {
  if (items.length === 1) return true
  
  let totalScore = 0
  let comparisons = 0
  
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const score = calculateColorScore(items[i], items[j])
      totalScore += score
      comparisons++
    }
  }
  
  const avgScore = comparisons > 0 ? totalScore / comparisons : 0
  return avgScore >= minScore
}

/**
 * Score an outfit using the Transformer API
 */
async function scoreOutfitWithAPI(outfitItems) {
  try {
    const result = await scoreOutfit(outfitItems)
    
    if (result.success) {
      return {
        score: result.score,
        confidence: result.confidence || result.score
      }
    }
    
    // If API fails, return color-based score
    console.log('ℹ️ Transformer API unavailable, using color score fallback')
    return calculateColorBasedScore(outfitItems)
  } catch (error) {
    // CORS errors are expected - gracefully fall back to color scoring
    console.log('ℹ️ Transformer API unavailable, using color score fallback')
    return calculateColorBasedScore(outfitItems)
  }
}

/**
 * Calculate score based on color compatibility when API is unavailable
 */
function calculateColorBasedScore(items) {
  if (items.length === 1) return { score: 0.7, confidence: 0.5 }
  
  let totalScore = 0
  let comparisons = 0
  
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const score = calculateColorScore(items[i], items[j])
      totalScore += score
      comparisons++
    }
  }
  
  const avgScore = comparisons > 0 ? totalScore / comparisons : 0.5
  return {
    score: avgScore,
    confidence: avgScore
  }
}

/**
 * Generate outfit recommendations for a user
 * 
 * @param {Array} items - User's closet items
 * @param {Object} options - Configuration options
 * @param {number} options.maxRecommendations - Maximum number of recommendations (default: 10)
 * @param {number} options.maxCombinations - Maximum combinations to evaluate (default: 50)
 * @returns {Promise<Array>} Array of recommended outfits with scores
 */
export async function generateRecommendations(items, options = {}) {
  const {
    maxRecommendations = 10,
    maxCombinations = 50
  } = options
  
  console.log('🎨 Generating outfit recommendations...')
  console.log(`Items in closet: ${items.length}`)
  
  if (items.length < 2) {
    console.warn('Not enough items for recommendations')
    return []
  }
  
  // Generate all possible combinations
  const combinations = generateOutfitCombinations(items, maxCombinations)
  console.log(`Generated ${combinations.length} combinations`)
  
  // Pre-filter by color compatibility
  const colorFiltered = combinations.filter(items => preFilterByColor(items, 0.5))
  console.log(`After color filtering: ${colorFiltered.length} combinations`)
  
  // Score each combination
  const scoredOutfits = []
  
  for (const outfitItems of colorFiltered) {
    try {
      const result = await scoreOutfitWithAPI(outfitItems)
      
      scoredOutfits.push({
        items: outfitItems,
        score: result.score,
        confidence: result.confidence || result.score
      })
    } catch (error) {
      console.error('Error scoring outfit:', error)
    }
  }
  
  // Sort by score (highest first)
  scoredOutfits.sort((a, b) => b.score - a.score)
  
  // Return top N recommendations
  const recommendations = scoredOutfits.slice(0, maxRecommendations)
  
  console.log(`✅ Generated ${recommendations.length} recommendations`)
  
  return recommendations.map((rec, index) => ({
    id: `rec-${Date.now()}-${index}`,
    items: rec.items,
    score: Math.round(rec.score * 100) / 100,
    confidence: Math.round(rec.confidence * 100) / 100,
    rank: index + 1
  }))
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category) {
  const categoryMap = {
    'top': 'Top',
    'bottom': 'Bottom',
    'outerwear': 'Outerwear',
    'shoes': 'Shoes',
    'accessory': 'Accessory',
    'dress': 'Dress',
    'hat': 'Hat',
    'blouse': 'Blouse',
    'shirt': 'Shirt',
    't-shirt': 'T-Shirt',
    'longsleeve': 'Long Sleeve',
    'polo': 'Polo',
    'hoodie': 'Hoodie',
    'blazer': 'Blazer',
    'body': 'Body',
    'pants': 'Pants',
    'skirt': 'Skirt',
    'shorts': 'Shorts'
  }
  
  return categoryMap[category] || category
}
