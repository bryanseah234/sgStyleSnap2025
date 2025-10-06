# AI Outfit Generation - Requirements

## Overview
The AI Outfit Generation feature automatically creates complete outfit combinations from a user's closet items. It uses intelligent algorithms to match colors, styles, weather conditions, and occasions to suggest harmonious, wearable outfits. This eliminates "decision fatigue" and helps users discover new outfit combinations they might not have considered.

## Business Requirements

### User Stories
1. **As a user**, I want AI-generated outfit suggestions so I don't have to decide what to wear each day
2. **As a user**, I want outfits tailored to weather and occasion so suggestions are practical and relevant
3. **As a user**, I want to rate generated outfits so the AI learns my preferences over time
4. **As a user**, I want to save favorite outfits so I can quickly recreate them later
5. **As a user**, I want to see why the AI chose certain combinations so I can learn about color and style matching
6. **As a user**, I want to regenerate outfits if I don't like the suggestion so I have multiple options
7. **As a user**, I want to manually swap individual items in a generated outfit so I have control over the final look

### Success Criteria
- AI generates wearable outfits (top + bottom + shoes minimum)
- Outfit generation completes in < 3 seconds
- Color harmony rules are followed (monochromatic, complementary, analogous)
- Style compatibility is maintained (no formal + sporty mixing)
- Users rate outfits ≥ 3.5/5 average
- 30% of generated outfits are saved by users

## Functional Requirements

### 1. Outfit Generation
- **FR-001**: Generate complete outfit with minimum 3 items (top, bottom, shoes)
- **FR-002**: Optionally include outerwear (if weather is cold)
- **FR-003**: Optionally include accessories (up to 2)
- **FR-004**: Maximum 6 items per outfit (prevent over-cluttered looks)
- **FR-005**: Generate outfit in < 3 seconds

### 2. Input Parameters
- **FR-006**: Weather condition (hot, warm, cool, cold)
- **FR-007**: Occasion (work, casual, date, workout, formal, party)
- **FR-008**: Style preference (casual, formal, sporty, business, mixed)
- **FR-009**: Color scheme (monochromatic, complementary, analogous, triadic, neutral, mixed)
- **FR-010**: Exclude specific items (already worn recently, in laundry)
- **FR-011**: Use optional color preferences (e.g., "I want to wear blue today")

### 3. AI Algorithm
- **FR-012**: Color harmony matching (use color wheel)
- **FR-013**: Style compatibility matrix (formal + formal, casual + casual)
- **FR-014**: Category balance (1 top, 1 bottom, 1 shoes required)
- **FR-015**: Weather appropriateness (no shorts in cold, no coats in hot)
- **FR-016**: Occasion suitability (no gym clothes for formal events)
- **FR-017**: Outfit scoring (0-100) based on harmony, completeness, style

### 4. Color Harmony Rules
**Monochromatic** (Score: 1.0):
- All items same color or shades of same color
- Example: navy top + denim jeans + navy shoes

**Complementary** (Score: 0.9):
- Opposite colors on color wheel
- Pairs: red↔green, blue↔orange, yellow↔purple, navy↔beige

**Analogous** (Score: 0.85):
- Adjacent colors on color wheel
- Examples: blue→teal→green, red→orange→yellow

**Triadic** (Score: 0.8):
- Three equidistant colors on color wheel
- Examples: red+yellow+blue, orange+green+purple

**Neutral** (Score: 0.9):
- All neutral colors (black, white, gray, beige, brown, navy)
- Always safe and wearable

**Mixed** (Score: 0.5):
- Multiple non-complementary colors
- Use neutrals to balance (e.g., red top + green pants + black shoes)

### 5. Style Compatibility Matrix
```
           Casual  Formal  Sporty  Business  Trendy
Casual      ✅      ❌      ✅       ❌       ✅
Formal      ❌      ✅      ❌       ✅       ❌
Sporty      ✅      ❌      ✅       ❌       ✅
Business    ❌      ✅      ❌       ✅       ✅
Trendy      ✅      ❌      ✅       ✅       ✅
```

### 6. Outfit Scoring
**Formula**: `Total Score = (Color Harmony × 0.4) + (Completeness × 0.6)`

**Color Harmony Score** (0-1):
- Calculated based on color harmony rules above
- Monochromatic = 1.0, Complementary = 0.9, etc.

**Completeness Score** (0-1):
- Has top + bottom + shoes = 0.6
- + Outerwear = +0.2
- + Accessory = +0.2
- Missing required item = 0.0

**Example**:
- Monochromatic outfit (1.0) with top+bottom+shoes+outerwear (0.8)
- Score = (1.0 × 0.4) + (0.8 × 0.6) = 0.88 → **88/100**

### 7. User Feedback
- **FR-018**: Rate outfit 1-5 stars
- **FR-019**: Save outfit to "Favorites" collection
- **FR-020**: Regenerate outfit with same parameters
- **FR-021**: Swap individual items (e.g., "swap the shoes")
- **FR-022**: Share outfit (future)

### 8. Learning Algorithm
- **FR-023**: Track user ratings for outfits
- **FR-024**: Learn preferred color schemes (from highly-rated outfits)
- **FR-025**: Learn preferred style combinations
- **FR-026**: Learn preferred occasions
- **FR-027**: Prioritize items from highly-rated past outfits

### 9. Outfit History
- **FR-028**: Store all generated outfits
- **FR-029**: View generation history (last 30 days)
- **FR-030**: Re-create past outfits
- **FR-031**: See outfit score and user rating

## Technical Requirements

### Database Schema
```sql
CREATE TABLE generated_outfits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  item_ids UUID[] NOT NULL,
  generation_params JSONB,
  color_scheme VARCHAR(50),
  style_theme VARCHAR(50),
  occasion VARCHAR(50),
  weather_condition VARCHAR(50),
  ai_score INTEGER CHECK (ai_score BETWEEN 0 AND 100),
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  is_saved BOOLEAN DEFAULT false,
  saved_to_collection_id UUID,
  created_at TIMESTAMP,
  rated_at TIMESTAMP,
  saved_at TIMESTAMP
);

CREATE TABLE outfit_generation_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  request_params JSONB NOT NULL,
  generated_outfit_id UUID REFERENCES generated_outfits(id),
  generation_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP
);
```

### API Endpoints

#### 1. Generate Outfit
```
POST /api/outfits/generate
Body:
  {
    "weather": "cool",
    "occasion": "casual",
    "stylePreference": "mixed",
    "colorScheme": "complementary",
    "excludeItemIds": ["uuid1", "uuid2"],
    "preferredColor": "blue" (optional)
  }
Response:
  {
    "outfit": {
      "id": "uuid",
      "items": [...],
      "colorScheme": "complementary",
      "aiScore": 88,
      "explanation": "Blue top pairs with orange accent, neutral brown shoes balance the look"
    },
    "generationTimeMs": 1245
  }
```

#### 2. Rate Outfit
```
POST /api/outfits/:id/rate
Body:
  {
    "rating": 4
  }
Response:
  {
    "success": true,
    "outfit": { ... }
  }
```

#### 3. Save Outfit
```
POST /api/outfits/:id/save
Body:
  {
    "collectionId": "uuid" (optional)
  }
Response:
  {
    "success": true,
    "outfit": { ... }
  }
```

#### 4. Swap Item in Outfit
```
POST /api/outfits/:id/swap-item
Body:
  {
    "oldItemId": "uuid",
    "newItemId": "uuid"
  }
Response:
  {
    "success": true,
    "outfit": { ... },
    "newScore": 85
  }
```

#### 5. Get Outfit History
```
GET /api/outfits/history?limit=20&offset=0
Response:
  {
    "outfits": [...],
    "pagination": { ... }
  }
```

#### 6. Get Outfit Recommendations
```
GET /api/outfits/recommendations
Query Params:
  - occasion (string, optional)
  - weather (string, optional)
Response:
  {
    "recommendations": [
      {
        "outfit": { ... },
        "reason": "Based on your past 5-star outfits"
      }
    ]
  }
```

### Frontend Components

#### 1. OutfitGenerator.vue (Page)
- Main outfit generation interface
- Contains: parameter form, generated outfit display, action buttons
- Shows: outfit items, score, explanation, rating stars

#### 2. OutfitGeneratorForm.vue
- Input form for generation parameters
- Fields: weather, occasion, style, color scheme, exclude items
- Emits: `generate`

#### 3. OutfitCard.vue
- Displays generated outfit
- Shows: item images, names, categories
- Shows: AI score, explanation, color scheme badge
- Props: `outfit`, `showActions`
- Emits: `rate`, `save`, `regenerate`, `swapItem`

#### 4. OutfitItemCard.vue
- Individual item within outfit
- Shows: image, name, category, color badge
- Props: `item`, `showSwapButton`
- Emits: `swap`

#### 5. OutfitHistory.vue
- List of past generated outfits
- Filters: date, rating, occasion
- Shows: thumbnail grid, score, rating
- Emits: `recreate`, `view`

### Service File (outfit-generator-service.js)

```javascript
export class OutfitGeneratorService {
  async generateOutfit(params) {
    const { weather, occasion, stylePreference, colorScheme, excludeItemIds, preferredColor } = params;
    
    // Step 1: Get available items from closet
    const items = await this.getAvailableItems(excludeItemIds);
    
    // Step 2: Filter by weather and occasion
    const filtered = this.filterByWeatherAndOccasion(items, weather, occasion);
    
    // Step 3: Apply color scheme algorithm
    const outfitCandidates = this.generateCandidates(filtered, colorScheme, preferredColor);
    
    // Step 4: Score each candidate
    const scored = outfitCandidates.map(candidate => ({
      ...candidate,
      score: this.scoreOutfit(candidate)
    }));
    
    // Step 5: Return highest-scoring outfit
    const best = scored.sort((a, b) => b.score - a.score)[0];
    
    return {
      outfit: best,
      explanation: this.generateExplanation(best)
    };
  }

  scoreOutfit(outfit) {
    const colorScore = this.calculateColorHarmony(outfit.items);
    const completenessScore = this.checkCompleteness(outfit.items);
    return Math.round((colorScore * 0.4 + completenessScore * 0.6) * 100);
  }

  calculateColorHarmony(items) {
    const colors = items.map(item => item.primaryColor);
    const uniqueColors = [...new Set(colors)];
    
    // Monochromatic (all same color)
    if (uniqueColors.length === 1) return 1.0;
    
    // All neutrals
    const neutrals = ['black', 'white', 'gray', 'beige', 'brown', 'navy'];
    if (uniqueColors.every(c => neutrals.includes(c))) return 0.9;
    
    // Complementary (opposite on color wheel)
    if (this.areComplementary(uniqueColors)) return 0.9;
    
    // Analogous (adjacent on color wheel)
    if (this.areAnalogous(uniqueColors)) return 0.85;
    
    // Mixed with neutrals
    const hasNeutrals = uniqueColors.some(c => neutrals.includes(c));
    if (hasNeutrals) return 0.7;
    
    // Mixed without neutrals (risky)
    return 0.5;
  }

  checkCompleteness(items) {
    const categories = items.map(item => item.category);
    const hasTop = categories.includes('top');
    const hasBottom = categories.includes('bottom');
    const hasShoes = categories.includes('shoes');
    const hasOuterwear = categories.includes('outerwear');
    const hasAccessory = categories.includes('accessory');
    
    if (!hasTop || !hasBottom || !hasShoes) return 0.0;
    
    let score = 0.6; // Base score for required items
    if (hasOuterwear) score += 0.2;
    if (hasAccessory) score += 0.2;
    
    return score;
  }

  areComplementary(colors) {
    const complementaryPairs = [
      ['red', 'green'],
      ['blue', 'orange'],
      ['yellow', 'purple'],
      ['navy', 'beige'],
      ['teal', 'burgundy']
    ];
    
    return complementaryPairs.some(pair =>
      pair.every(c => colors.includes(c))
    );
  }

  areAnalogous(colors) {
    const analogousGroups = [
      ['blue', 'teal', 'green'],
      ['red', 'orange', 'yellow'],
      ['purple', 'pink', 'burgundy']
    ];
    
    return analogousGroups.some(group =>
      colors.every(c => group.includes(c))
    );
  }

  generateExplanation(outfit) {
    const { colorScheme, items, score } = outfit;
    const colors = items.map(i => i.primaryColor);
    
    let explanation = `${colorScheme} color scheme`;
    
    if (colorScheme === 'complementary') {
      explanation += ` (${colors[0]} and ${colors[1]} complement each other)`;
    }
    
    if (items.length > 3) {
      explanation += '. Layered look with outerwear';
    }
    
    if (score >= 90) {
      explanation += '. Highly harmonious outfit!';
    }
    
    return explanation;
  }
}
```

### Pinia Store (suggestions-store.js - extend existing)

#### New State
```javascript
{
  generatedOutfit: null,
  outfitHistory: [],
  generationParams: {
    weather: 'warm',
    occasion: 'casual',
    stylePreference: 'mixed',
    colorScheme: 'mixed'
  },
  loading: false,
  error: null
}
```

#### New Actions
- `generateOutfit(params)` - Generate new outfit
- `rateOutfit(outfitId, rating)` - Rate outfit
- `saveOutfit(outfitId, collectionId)` - Save outfit
- `swapItem(outfitId, oldItemId, newItemId)` - Swap item
- `fetchOutfitHistory()` - Load history
- `recreateOutfit(outfitId)` - Recreate past outfit

## Non-Functional Requirements

### Performance
- **NFR-001**: Outfit generation completes in < 3 seconds
- **NFR-002**: Generation algorithm runs in browser (no server ML required)
- **NFR-003**: Outfit history loads in < 500ms
- **NFR-004**: Scoring calculation completes in < 100ms

### Accuracy
- **NFR-005**: Generated outfits have AI score ≥ 70
- **NFR-006**: Color harmony rules are followed 100% of the time
- **NFR-007**: Weather appropriateness is validated 100%
- **NFR-008**: Occasion suitability is validated 100%

### Usability
- **NFR-009**: Generation form is simple (≤ 5 inputs)
- **NFR-010**: Generated outfit is visually clear (images, names, categories)
- **NFR-011**: Explanation is concise (1-2 sentences)
- **NFR-012**: Rating is easy (tap stars, no typing)
- **NFR-013**: Regenerate button is prominent

### Learning
- **NFR-014**: User preferences are learned from rated outfits
- **NFR-015**: Future outfits prioritize items from highly-rated past outfits
- **NFR-016**: Preferred color schemes are identified after 10+ ratings
- **NFR-017**: Preferred occasions are identified after 10+ ratings

## Dependencies
- **Task 3**: Closet CRUD (to access user's items)
- **Task 5**: Suggestion System (extend existing outfit suggestions)
- **Task 10**: Color Detection AI (to use detected colors)
- **SQL Migration 007**: Outfit generation database schema

## Testing Requirements

### Unit Tests
- Test color harmony calculations
- Test completeness scoring
- Test overall outfit scoring
- Test complementary color detection
- Test analogous color detection
- Test style compatibility matrix

### Integration Tests
- Test outfit generation API endpoint
- Test database queries (user's items)
- Test outfit saving and rating
- Test outfit history retrieval

### E2E Tests
1. User selects parameters and generates outfit
2. System returns outfit in < 3 seconds
3. User sees outfit with score and explanation
4. User rates outfit 5 stars
5. User saves outfit to favorites
6. User regenerates outfit with same parameters
7. User swaps one item in outfit
8. User views outfit history

## Future Enhancements
1. **Machine Learning**: Train ML model on user preferences
2. **Photo-Based Generation**: "Generate outfit for this Instagram photo"
3. **Outfit Challenges**: Daily themed outfit challenges
4. **Social Sharing**: Share outfits with friends
5. **Virtual Try-On**: AR preview of outfit
6. **Wardrobe Analytics**: "Most worn colors/styles"
7. **Seasonal Recommendations**: "Fall wardrobe refresh suggestions"
8. **Budget-Aware Suggestions**: Prioritize items by cost-per-wear

## Acceptance Criteria
- [ ] AI generates wearable outfits (top + bottom + shoes minimum)
- [ ] Generation completes in < 3 seconds
- [ ] Color harmony rules are followed (monochromatic, complementary, etc.)
- [ ] Style compatibility is maintained (no formal + sporty)
- [ ] Outfit score (0-100) is calculated correctly
- [ ] Users can rate outfits (1-5 stars)
- [ ] Users can save outfits to favorites
- [ ] Users can regenerate outfits
- [ ] Users can swap individual items
- [ ] Outfit history is stored and accessible
- [ ] Explanation is generated for each outfit
- [ ] All tests pass (unit, integration, E2E)
- [ ] Code follows StyleSnap standards

## Estimated Effort
- **Database Migration**: 1 hour
- **Outfit Generator Service**: 8 hours (algorithm, scoring, color harmony)
- **API Endpoints**: 4 hours (generate, rate, save, swap, history)
- **Pinia Store Extension**: 3 hours (new state, actions)
- **Frontend Components**: 8 hours (OutfitGenerator, OutfitCard, History)
- **Testing**: 4 hours
- **Total**: ~28 hours (4-5 days)
