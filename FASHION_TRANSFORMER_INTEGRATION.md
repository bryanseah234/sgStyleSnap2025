# Fashion Transformer API Integration - StyleSnap

## Overview

The StyleSnap app now includes integration with the fashion-transformer API for AI-powered outfit compatibility scoring and complementary item recommendations.

**API URL:** `https://ftransformer-api-244539109907.us-central1.run.app`

---

## What is Fashion Transformer?

The Fashion Transformer is a deep learning model that:

1. **Scores outfit compatibility** - Evaluates how well items work together as an outfit
2. **Finds complementary items** - Suggests items that would complete or enhance a partial outfit
3. **Uses CLIP-based vision** - Analyzes both visual appearance and semantic relationships

---

## Service Location

The fashion transformer service is located at:

- **Service File:** `src/services/fashion-transformer-service.js`
- **No API client integration needed** - Import directly from the service file

---

## Available Features

### 1. Outfit Compatibility Scoring

Score how well items work together as an outfit.

**Usage:**

```javascript
import { scoreOutfit } from '@/services/fashion-transformer-service'

const outfitItems = [
  {
    id: 'item1',
    name: 'Blue Denim Jacket',
    category: 'outerwear',
    image_url: 'https://example.com/jacket.jpg'
  },
  {
    id: 'item2',
    name: 'White T-Shirt',
    category: 'top',
    image_url: 'https://example.com/tshirt.jpg'
  },
  {
    id: 'item3',
    name: 'Black Jeans',
    category: 'bottom',
    image_url: 'https://example.com/jeans.jpg'
  }
]

const result = await scoreOutfit(outfitItems)

if (result.success) {
  console.log('Compatibility Score:', result.score)
  // Higher scores (closer to 1) = better compatibility
}
```

**Response Structure:**

```javascript
{
  success: true,
  score: 0.85,        // Score between 0-1
  confidence: 0.85    // Same as score
}
```

### 2. Complementary Item Recommendations

Find items that would complete or enhance a partial outfit.

**Usage:**

```javascript
import { findComplementaryItems } from '@/services/fashion-transformer-service'

const partialOutfit = [
  {
    id: 'item1',
    name: 'Blue Denim Jacket',
    category: 'outerwear',
    image_url: 'https://example.com/jacket.jpg'
  },
  {
    id: 'item2',
    name: 'White T-Shirt',
    category: 'top',
    image_url: 'https://example.com/tshirt.jpg'
  }
]

const result = await findComplementaryItems(
  partialOutfit,
  'shoes', // Target category
  8 // Number of recommendations
)

if (result.success) {
  console.log('Recommendations:', result.recommendations)
  // Array of recommended items from the Polyvore dataset
}
```

**Response Structure:**

```javascript
{
  success: true,
  recommendations: [
    {
      item_id: 'xyz123',
      score: 0.92,
      description: 'White sneakers',
      category: 'shoes'
    },
    // ... more recommendations
  ],
  count: 8
}
```

### 3. API Health Check

Check if the API is available.

**Usage:**

```javascript
import { checkAPIHealth } from '@/services/fashion-transformer-service'

const isHealthy = await checkAPIHealth()
console.log('API is healthy:', isHealthy)
```

### 4. Get API Status

Get detailed API status information.

**Usage:**

```javascript
import { getAPIStatus } from '@/services/fashion-transformer-service'

const status = await getAPIStatus()
console.log('API Status:', status)
```

### 5. Validate Outfit Items

Validate items before sending to the API.

**Usage:**

```javascript
import { validateOutfitItems } from '@/services/fashion-transformer-service'

const validation = validateOutfitItems(outfitItems)

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors)
}
```

---

## Integration Points in StyleSnap

### In Outfit Creator

Add AI outfit scoring when users create outfits:

```javascript
// In OutfitCreator.vue
import { scoreOutfit, validateOutfitItems } from '@/services/fashion-transformer-service'

const calculateOutfitScore = async () => {
  try {
    // Get current outfit items
    const outfitItems = canvasItems.value.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      image_url: item.image_url
    }))

    // Validate items
    const validation = validateOutfitItems(outfitItems)
    if (!validation.isValid) {
      console.warn('Cannot score outfit:', validation.errors)
      return
    }

    // Score the outfit
    const result = await scoreOutfit(outfitItems)

    if (result.success) {
      const scorePercent = Math.round(result.score * 100)

      // Show user the score
      showNotification({
        type: 'info',
        message: `Outfit Compatibility: ${scorePercent}%`,
        details:
          scorePercent >= 80
            ? 'Excellent outfit combination!'
            : scorePercent >= 60
            ? 'Good outfit combination'
            : 'Consider trying different items'
      })

      // Store score for later reference
      outfitScore.value = result.score
    }
  } catch (error) {
    console.error('Failed to score outfit:', error)
  }
}
```

### In Closet - Add Complementary Items Suggestion

When viewing an item, suggest complementary items:

```javascript
// In Cabinet.vue or ItemCard.vue
import { findComplementaryItems } from '@/services/fashion-transformer-service'

const getComplementaryItems = async item => {
  try {
    const result = await findComplementaryItems(
      [item], // Current item as partial outfit
      'bottom', // Suggest bottoms that match this top
      5 // Get 5 suggestions
    )

    if (result.success && result.recommendations.length > 0) {
      console.log('Complementary items:', result.recommendations)
      // Display suggestions to user
      showComplementaryItemsModal(result.recommendations)
    }
  } catch (error) {
    console.error('Failed to get complementary items:', error)
  }
}
```

### Smart Outfit Completion

When user adds first item to an outfit, suggest what to add next:

```javascript
// When user adds first item to canvas
const handleFirstItemAdded = async item => {
  if (canvasItems.value.length === 1) {
    // Suggest what category to add next
    const suggestions = []

    // Determine what makes sense to add next based on current item
    if (item.category === 'top') {
      suggestions.push('bottom')
      suggestions.push('shoes')
    } else if (item.category === 'bottom') {
      suggestions.push('top')
      suggestions.push('shoes')
    }

    // Get complementary recommendations for each suggestion
    for (const category of suggestions) {
      const result = await findComplementaryItems([item], category, 3)

      if (result.success) {
        // Show suggestions in sidebar
        showSuggestedCategory(category, result.recommendations)
      }
    }
  }
}
```

---

## API Endpoints

The ftransformer-api provides these endpoints:

### 1. Score Outfit Endpoint

**URL:** `POST https://ftransformer-api-244539109907.us-central1.run.app/recommendation/score`

**Request:** Multipart form data

- `item_metadata` (JSON string): Array of item metadata
- `files` (files): Image files for each item

**Response:**

```json
{
  "score": 0.85
}
```

### 2. Complementary Items Endpoint

**URL:** `POST https://ftransformer-api-244539109907.us-central1.run.app/recommendation/complementary`

**Request:** Multipart form data

- `item_metadata` (JSON string): Array of item metadata
- `files` (files): Image files for each item
- `target_category` (string): Category to find complementary items for
- `k` (int): Number of recommendations (default: 8)

**Response:**

```json
{
  "recommendations": [
    {
      "item_id": "xyz123",
      "score": 0.92,
      "description": "White sneakers",
      "category": "shoes"
    }
  ]
}
```

### 3. Health Check Endpoint

**URL:** `GET https://ftransformer-api-244539109907.us-central1.run.app/`

**Response:**

```json
{
  "message": "Outfit Transformer API is running."
}
```

---

## Item Requirements

Items passed to the API must have:

- `image_url` or `image_file` - Image of the item
- `category` - Item category (top, bottom, shoes, outerwear, etc.)
- `name` or `description` - Item name/description (optional but recommended)

Example:

```javascript
{
  id: 'item123',
  name: 'Blue Denim Jacket',
  category: 'outerwear',
  image_url: 'https://example.com/image.jpg'
}
```

---

## Use Cases

### 1. Outfit Quality Check

Before saving an outfit, check its compatibility score to ensure items work well together.

### 2. Smart Recommendations

When browsing an item, suggest complementary items that would work with it.

### 3. Outfit Completion

Help users complete partial outfits by suggesting what to add next.

### 4. Outfit Ranking

Rank multiple outfit suggestions based on compatibility scores.

### 5. Wardrobe Optimization

Identify which items work well together in the user's wardrobe.

---

## Best Practices

### 1. Validate Before API Calls

Always validate items before sending to the API:

```javascript
const validation = validateOutfitItems(items)
if (!validation.isValid) {
  // Handle validation errors
}
```

### 2. Handle API Errors Gracefully

The service includes error handling, but always check the `success` flag:

```javascript
const result = await scoreOutfit(items)
if (!result.success) {
  console.error('Scoring failed:', result.error)
  // Fallback to manual scoring or skip
}
```

### 3. Show Loading States

API calls can take a few seconds - show loading indicators:

```javascript
const scoring = ref(false)

const scoreOutfit = async () => {
  scoring.value = true
  try {
    const result = await scoreOutfit(items)
    // Handle result
  } finally {
    scoring.value = false
  }
}
```

### 4. Cache Results

Cache API results to avoid redundant calls:

```javascript
const cachedScores = new Map()

const getOutfitScore = async (outfitId, items) => {
  if (cachedScores.has(outfitId)) {
    return cachedScores.get(outfitId)
  }

  const result = await scoreOutfit(items)
  if (result.success) {
    cachedScores.set(outfitId, result)
  }
  return result
}
```

---

## Troubleshooting

### API Not Responding

- Check API URL is correct
- Verify API is deployed and running
- Check browser console for CORS errors

### Invalid Item Format

- Ensure items have `image_url` or `image_file`
- Verify `category` field is present
- Check image URLs are accessible

### Low Scores

- Scores are relative to the model's training data
- Consider showing scores as qualitative feedback (Excellent/Good/Fair)
- Explain what the score means to users

---

## Future Enhancements

Potential improvements:

1. **Batch processing** - Score multiple outfits at once
2. **Category suggestions** - Intelligent category recommendations
3. **Color analysis** - Consider color compatibility
4. **Style matching** - Match items by style preferences
5. **Personalization** - Learn from user's preferred combinations

---

## Support

For issues with the fashion transformer integration:

1. Check browser console for error messages
2. Verify API is accessible: `https://ftransformer-api-244539109907.us-central1.run.app`
3. Review request payload in Network tab
4. Check API logs for server-side errors

---

## Changelog

### v1.0.0 (2025-01-XX)

- Initial fashion transformer API integration
- Outfit compatibility scoring
- Complementary item recommendations
- API health checks
- Comprehensive error handling
