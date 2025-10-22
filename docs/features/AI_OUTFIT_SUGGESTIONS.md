# AI Outfit Suggestions Feature

## Overview

The AI Outfit Suggestions feature automatically generates outfit combinations by intelligently selecting items from the user's wardrobe and placing them on the canvas. This helps users discover new outfit combinations and get styling inspiration.

---

## Route Information

**Path:** `/outfits/add/suggested`

**Component:** `OutfitCreator.vue`

**Sub-route:** `suggested`

---

## Features

### 1. Automatic Item Selection
- ✅ **Smart Category-Based Selection**: AI selects items from different categories to create complete outfits
- ✅ **Balanced Composition**: Picks tops, bottoms, shoes, and optionally accessories/outerwear
- ✅ **Randomized Variety**: Each generation produces different combinations

### 2. Automatic Canvas Placement
- ✅ **Pre-positioned Items**: AI places selected items on the canvas at appropriate Y-coordinates
- ✅ **Layered Z-index**: Items are stacked with proper layering (outerwear on top, shoes at bottom)
- ✅ **Offset Positioning**: Items are slightly offset to avoid perfect overlap

### 3. User Control
- ✅ **Regenerate Button**: Purple "Regenerate" button to get new AI suggestions
- ✅ **Manual Editing**: Users can drag, scale, rotate, and delete AI-placed items
- ✅ **Add More Items**: Users can manually add additional items from their closet
- ✅ **Save Outfit**: Save the AI-suggested outfit (with or without modifications)

### 4. Visual Indicators
- ✅ **AI Badge**: Shows "AI Suggestions" badge instead of dropdown
- ✅ **Info Banner**: Purple banner explaining that users can still edit manually
- ✅ **Purple Accent**: Regenerate button uses purple color to indicate AI feature

---

## User Flow

```
User navigates to /outfits/add/suggested
  ↓
Page loads user's wardrobe items
  ↓
AI automatically generates outfit suggestion
  ↓
Items are placed on canvas with smart positioning
  ↓
User can:
  - View the suggested outfit
  - Regenerate for a new suggestion (click Regenerate button)
  - Edit items (drag, scale, rotate, delete)
  - Add more items from sidebar
  - Save the outfit when satisfied
```

---

## AI Selection Logic (Current Mock Implementation)

### Category-Based Selection

The AI selects items from the following categories:

1. **Tops** (Required)
   - Picks 1 random top from user's tops collection
   - Y-position: 100px

2. **Bottoms** (Required)
   - Picks 1 random bottom from user's bottoms collection
   - Y-position: 250px

3. **Shoes** (Required)
   - Picks 1 random shoe from user's shoes collection
   - Y-position: 400px

4. **Accessories** (Optional - 50% chance)
   - Picks 1 random accessory if available
   - Y-position: 150px

5. **Outerwear** (Optional - 50% chance)
   - Picks 1 random outerwear if available
   - Y-position: 80px

### Positioning Strategy

```javascript
{
  x: 150 + (index * 20),  // Slightly offset each item
  y: category-specific,    // Different Y for each category
  scale: 1,                // Default scale
  rotation: 0,             // No rotation
  zIndex: index + 1        // Layered properly
}
```

---

## Backend Integration (TODO)

### Current Implementation
- **Status**: Mock/Placeholder
- **Method**: Random selection from user's wardrobe
- **Location**: `generateAISuggestion()` function in `OutfitCreator.vue`

### Future Backend Implementation

When implementing the real AI backend, replace the mock logic with an API call:

```javascript
const generateAISuggestion = async () => {
  try {
    console.log('OutfitCreator: Generating AI suggestion...')
    
    // Call AI backend API
    const response = await fetch('/api/ai/generate-outfit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.value.id,
        wardrobe_items: wardrobeItems.value.map(item => item.id),
        preferences: {
          occasion: 'casual',  // Optional
          weather: 'sunny',    // Optional
          colors: []           // Optional
        }
      })
    })
    
    const aiSuggestion = await response.json()
    
    // Place AI-suggested items on canvas
    canvasItems.value = aiSuggestion.items.map((item, index) => ({
      ...item.clothing_item,
      id: `${item.clothing_item.id}-${Date.now()}-${index}`,
      x: item.position_x,
      y: item.position_y,
      scale: item.scale || 1,
      rotation: item.rotation || 0,
      zIndex: item.z_index || index + 1
    }))
    
    saveToHistory()
    
  } catch (error) {
    console.error('OutfitCreator: Error generating AI suggestion:', error)
  }
}
```

### API Endpoint Requirements

**Endpoint:** `POST /api/ai/generate-outfit`

**Request Body:**
```json
{
  "user_id": "uuid",
  "wardrobe_items": ["item_id_1", "item_id_2", ...],
  "preferences": {
    "occasion": "casual|formal|business|party",
    "weather": "sunny|rainy|cold|hot",
    "colors": ["red", "blue"],
    "style": "minimalist|bold|classic"
  }
}
```

**Response Body:**
```json
{
  "success": true,
  "outfit_id": "suggestion_uuid",
  "items": [
    {
      "clothing_item": {
        "id": "uuid",
        "name": "Blue Denim Jeans",
        "category": "bottoms",
        "image_url": "https://..."
      },
      "position_x": 150,
      "position_y": 250,
      "scale": 1,
      "rotation": 0,
      "z_index": 2,
      "ai_confidence": 0.95
    }
  ],
  "reasoning": "This outfit combines casual comfort with modern style...",
  "tags": ["casual", "weekend", "comfortable"]
}
```

---

## UI Components

### 1. AI Badge (Replaces Dropdown)
```vue
<div class="flex items-center gap-2">
  <Sparkles class="w-4 h-4" />
  <span>AI Suggestions</span>
</div>
```

### 2. Regenerate Button
```vue
<button @click="generateAISuggestion">
  <Sparkles class="w-5 h-5" />
  <span>Regenerate</span>
</button>
```
- **Color**: Purple (`bg-purple-600`)
- **Position**: Header action buttons
- **Visibility**: Only on AI suggestion route

### 3. Info Banner
```vue
<div class="bg-purple-50 border border-purple-200">
  <Sparkles class="w-4 h-4" />
  <span>AI has placed items on the canvas. You can still add more items manually...</span>
</div>
```

---

## Code Structure

### Key Functions

#### `generateAISuggestion()`
**Location:** `src/pages/OutfitCreator.vue`

**Purpose:** Generates AI outfit suggestion and places items on canvas

**Logic:**
1. Check if wardrobe has items
2. Filter items by category (tops, bottoms, shoes, accessories, outerwear)
3. Randomly select one item from each category
4. Calculate appropriate positions for each item type
5. Place items on canvas with proper positioning
6. Save to history

#### `initializeItemsSource()`
**Location:** `src/pages/OutfitCreator.vue`

**Purpose:** Sets items source based on route

**Logic:**
```javascript
if (currentSubRoute.value === 'suggested') {
  itemsSource.value = 'my-cabinet'  // Still show user's items
}
```

#### `onMounted()`
**Location:** `src/pages/OutfitCreator.vue`

**Purpose:** Initializes page and triggers AI generation

**Logic:**
```javascript
if (currentSubRoute.value === 'suggested') {
  await generateAISuggestion()
}
```

---

## Testing Checklist

- [ ] Navigate to `/outfits/add/suggested`
- [ ] Verify AI badge shows "AI Suggestions"
- [ ] Verify items are automatically placed on canvas
- [ ] Verify "Regenerate" button appears (purple color)
- [ ] Click "Regenerate" - new outfit should be generated
- [ ] Verify user can drag/edit AI-placed items
- [ ] Verify user can add more items from sidebar
- [ ] Verify category filters work in sidebar
- [ ] Save outfit - verify it saves correctly
- [ ] Test with empty wardrobe - verify graceful handling
- [ ] Test with wardrobe missing certain categories

---

## Future Enhancements

### Phase 1: Basic AI
- [ ] Implement actual AI backend API
- [ ] Color matching algorithm
- [ ] Style consistency checks
- [ ] Occasion-based suggestions

### Phase 2: Smart AI
- [ ] Learn from user's saved outfits
- [ ] Weather-based suggestions
- [ ] Seasonal recommendations
- [ ] Trend analysis

### Phase 3: Advanced AI
- [ ] Explain why items were chosen
- [ ] Multiple suggestions at once
- [ ] "Similar to this" feature
- [ ] Style profile learning
- [ ] Friend-inspired suggestions

### Phase 4: Social AI
- [ ] Learn from friend's outfits
- [ ] Community trending combinations
- [ ] Style influencer recommendations
- [ ] Collaborative outfit building

---

## Analytics Events (Future)

Track user interactions for AI improvement:

```javascript
// When AI suggestion is generated
trackEvent('ai_outfit_generated', {
  user_id: userId,
  num_items: canvasItems.length,
  categories_used: ['tops', 'bottoms', 'shoes']
})

// When user saves AI-suggested outfit
trackEvent('ai_outfit_saved', {
  user_id: userId,
  was_modified: userModified,
  num_regenerations: regenerationCount
})

// When user clicks regenerate
trackEvent('ai_outfit_regenerated', {
  user_id: userId,
  regeneration_count: count
})
```

---

## Troubleshooting

### AI doesn't generate outfit
**Possible Causes:**
- User has no items in wardrobe
- User has items but none in required categories (tops, bottoms, shoes)

**Solution:**
- Check console logs for errors
- Verify `wardrobeItems.value` has data
- Ensure items have valid categories

### Items overlap on canvas
**Expected Behavior:**
- Items are intentionally slightly offset
- User can adjust positions manually

**If completely overlapping:**
- Check Y-position logic in `generateAISuggestion()`
- Verify different categories get different Y values

### Regenerate doesn't work
**Possible Causes:**
- Function not bound correctly
- Items not reloading

**Solution:**
- Check console for errors
- Verify `generateAISuggestion()` is being called
- Check that `canvasItems.value` is being updated

---

## Performance Considerations

### Current Implementation
- **Fast**: Random selection is O(n) where n = wardrobe size
- **No API calls**: Everything happens client-side

### Future Backend Implementation
- **API Latency**: 500ms - 2s expected
- **Loading State**: Show loading indicator during generation
- **Caching**: Cache recent suggestions to avoid redundant calls
- **Fallback**: If API fails, fall back to mock logic

---

## Accessibility

- ✅ Keyboard navigation works with all controls
- ✅ Screen readers can announce "AI Suggestions" badge
- ✅ Regenerate button has aria-label
- ✅ Info banner is readable by screen readers

---

## Related Documentation

- [Outfit Creator Documentation](./OUTFIT_CREATOR.md)
- [Canvas Controls Documentation](./CANVAS_CONTROLS.md)
- [Wardrobe Management](./WARDROBE_MANAGEMENT.md)

