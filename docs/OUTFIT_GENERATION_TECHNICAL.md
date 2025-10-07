# Outfit Generation - Technical Implementation

## Algorithm Type: Permutation-Based (No ML)

### Overview
StyleSnap uses a **rule-based permutation algorithm** to generate outfit combinations. This approach does NOT use machine learning, neural networks, or external AI APIs.

### Why Permutation-Based?

**Advantages:**
- ✅ **Fast** - Generates outfits in milliseconds
- ✅ **Free** - No API costs or model training required
- ✅ **Private** - All processing happens locally in browser
- ✅ **Predictable** - Deterministic results based on clear rules
- ✅ **Interpretable** - Users can understand why items were combined
- ✅ **No training data** - Works immediately with any closet size

**Disadvantages:**
- ❌ **No personalization** - Doesn't learn user preferences over time
- ❌ **Limited creativity** - Follows strict rules, may miss unconventional pairings
- ❌ **Scalability** - Performance degrades with very large closets (200+ items)

### Core Algorithm

#### Step 1: Category Grouping
```javascript
// Group items by category to prevent duplicates
const itemsByCategory = {
  top: [item1, item2, item3],
  bottom: [item4, item5],
  shoes: [item6, item7, item8],
  outerwear: [item9],
  accessories: [item10, item11]
}
```

**CRITICAL RULE**: Each outfit can only have ONE item per category.
- ✅ Valid: 1 top + 1 bottom + 1 shoes
- ❌ Invalid: 2 tops, 2 bottoms, 2 shoes

#### Step 2: Generate Permutations
```javascript
// Generate all valid combinations (1 item per category)
for (const top of tops) {
  for (const bottom of bottoms) {
    for (const shoe of shoes) {
      const outfit = [top, bottom, shoe];
      
      // Optionally add outerwear (if weather is cold)
      if (weather === 'cold' && outerwear.length > 0) {
        for (const outer of outerwear) {
          outfits.push([...outfit, outer]);
        }
      }
      
      // Base outfit without outerwear
      outfits.push(outfit);
    }
  }
}
```

**Example**: With 10 tops, 8 bottoms, 5 shoes = 10 × 8 × 5 = **400 permutations**

#### Step 3: Score Each Outfit
```javascript
// Score based on color harmony and completeness
function scoreOutfit(outfit) {
  const colorScore = calculateColorHarmony(outfit);  // 0-1
  const completenessScore = checkCompleteness(outfit); // 0-1
  
  return Math.round((colorScore * 0.4 + completenessScore * 0.6) * 100);
}
```

**Color Harmony Rules:**
- Monochromatic (all same color): 1.0
- All neutrals (black, white, gray, beige, brown, navy): 0.9
- Complementary colors (opposite on color wheel): 0.9
- Analogous colors (adjacent on color wheel): 0.85
- Mixed with neutrals: 0.7
- Mixed without neutrals: 0.5

**Completeness Rules:**
- Has top + bottom + shoes: 0.6 (base score)
- + Outerwear: +0.2
- + Accessory: +0.2
- Missing required item: 0.0

#### Step 4: Filter by Context
```javascript
// Filter by weather, occasion, style
const filtered = outfits.filter(outfit => {
  const isWeatherAppropriate = checkWeather(outfit, weather);
  const isOccasionSuitable = checkOccasion(outfit, occasion);
  const isStyleCompatible = checkStyle(outfit, stylePreference);
  
  return isWeatherAppropriate && isOccasionSuitable && isStyleCompatible;
});
```

**Weather Rules:**
- Hot: No outerwear, no long sleeves
- Warm: No heavy outerwear
- Cool: Optional light outerwear
- Cold: Requires outerwear

**Occasion Rules:**
- Formal: No gym clothes, no casual items
- Casual: Any combination allowed
- Work/Business: No gym clothes, prefer formal/business items
- Workout: Gym/sporty items only

#### Step 5: Sort and Return Top Results
```javascript
// Sort by score, return top N
const sorted = filtered.sort((a, b) => b.score - a.score);
return sorted.slice(0, 10); // Return top 10 outfits
```

### Visual Presentation

**Display Mode: Blank Canvas**
- Outfits shown as **item images on neutral background**
- NO superimposition on mannequin or person
- Items displayed in original uploaded photos
- Vertical or grid layout

**Layout Order:**
1. Top (shirt, blouse, t-shirt)
2. Bottom (pants, skirt, shorts)
3. Shoes (sneakers, boots, heels)
4. Outerwear (jacket, coat) - if present
5. Accessories (hat, bag, jewelry) - if present

**Example UI:**
```
┌─────────────────────┐
│   [Top Image]       │
├─────────────────────┤
│   [Bottom Image]    │
├─────────────────────┤
│   [Shoes Image]     │
├─────────────────────┤
│   [Outerwear Image] │  (optional)
├─────────────────────┤
│   Score: 88/100     │
│   "Complementary    │
│    color scheme"    │
└─────────────────────┘
```

### Performance Optimization

**Problem**: Large closets (200+ items) = too many permutations
- Example: 50 tops × 40 bottoms × 30 shoes = 60,000 permutations!

**Solutions:**
1. **Limit permutation count**: Generate max 100 random permutations
2. **Pre-filter by context**: Filter items by weather/occasion BEFORE permutation
3. **Progressive generation**: Generate batches of 10, show first batch immediately
4. **Caching**: Cache frequently-requested combinations (weather + occasion)
5. **Web Worker**: Offload computation to background thread

### Category Validation (Critical)

**Why It Matters:**
Without validation, algorithm could suggest:
- 2 shirts + pants + shoes (awkward)
- Top + 2 pairs of pants + shoes (impossible to wear)
- Top + bottom + 3 pairs of shoes (nonsensical)

**Implementation:**
```javascript
function validateCategories(outfit) {
  const categories = outfit.map(item => item.category);
  const uniqueCategories = new Set(categories);
  
  // Check for duplicates
  if (categories.length !== uniqueCategories.size) {
    throw new Error('Outfit has duplicate categories');
  }
  
  // Check for required categories
  if (!uniqueCategories.has('top') || 
      !uniqueCategories.has('bottom') || 
      !uniqueCategories.has('shoes')) {
    throw new Error('Outfit missing required items');
  }
  
  return true;
}
```

### Future Enhancements (NOT Implemented Yet)

#### Phase 2: Machine Learning
Once we have sufficient data (1000+ rated outfits), we could implement:

1. **Preference Learning**
   - Train model on user ratings (1-5 stars)
   - Learn preferred color combinations
   - Learn preferred style combinations
   - Prioritize items from highly-rated past outfits

2. **Collaborative Filtering**
   - "Users with similar style also liked..."
   - Cross-user style recommendations
   - Trend detection

3. **Computer Vision**
   - Detect patterns and textures (not just colors)
   - Match patterns (stripes, florals, solids)
   - Style transfer from inspiration photos

4. **Neural Network Scoring**
   - Replace rule-based scoring with trained model
   - Learn complex style rules from fashion experts
   - Generate more creative, trendy combinations

#### Why Not Implement ML Now?

**Data Requirements:**
- Need 1000s of rated outfits per user for training
- New users have no history (cold start problem)
- Fashion trends change rapidly (model needs frequent retraining)

**Technical Complexity:**
- Model hosting and serving costs
- Longer processing time (500ms+ vs 50ms)
- Requires GPU for training
- Model versioning and updates

**User Experience:**
- Harder to explain why combinations were chosen
- Less predictable results
- Privacy concerns (data collection)

**Conclusion**: Start simple, add ML when we have data and user demand.

### Testing Strategy

#### Unit Tests
- Test category grouping (no duplicates)
- Test permutation generation (correct count)
- Test color harmony calculations (all rules)
- Test scoring algorithm (all scenarios)
- Test weather filtering (all conditions)
- Test occasion filtering (all types)

#### Integration Tests
- Test full outfit generation pipeline
- Test with small closets (5 items)
- Test with large closets (200 items)
- Test with empty closets (0 items)
- Test with missing categories (no shoes)

#### Performance Tests
- Benchmark generation time (< 3 seconds)
- Test with 500+ items (stress test)
- Test with 1000 permutations (max load)
- Memory usage (< 50MB)

### API Response Format

```json
{
  "outfit": {
    "id": "uuid",
    "items": [
      {
        "id": "uuid1",
        "category": "top",
        "name": "Blue T-Shirt",
        "image_url": "https://...",
        "primary_color": "blue",
        "order": 1
      },
      {
        "id": "uuid2",
        "category": "bottom",
        "name": "Jeans",
        "image_url": "https://...",
        "primary_color": "navy",
        "order": 2
      },
      {
        "id": "uuid3",
        "category": "shoes",
        "name": "White Sneakers",
        "image_url": "https://...",
        "primary_color": "white",
        "order": 3
      }
    ],
    "colorScheme": "complementary",
    "styleTheme": "casual",
    "outfitScore": 88,
    "explanation": "Blue top pairs with navy jeans (analogous colors), balanced by neutral white shoes",
    "displayMode": "canvas"
  },
  "generationTimeMs": 245,
  "algorithmVersion": "permutation-v1",
  "permutationsGenerated": 150,
  "permutationsScored": 150
}
```

### Conclusion

The permutation-based approach is ideal for:
- ✅ Small to medium closets (< 200 items)
- ✅ Users who want fast, instant results
- ✅ Privacy-conscious users
- ✅ Cost-conscious development (no API fees)

It's NOT ideal for:
- ❌ Very large closets (200+ items) - too many permutations
- ❌ Users wanting highly personalized recommendations
- ❌ Complex style rules requiring ML

**Recommendation**: Start with permutation-based, add ML in Phase 2 when we have user data.
