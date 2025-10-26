# Outfit Generation - Requirements

## Overview
The Outfit Generation feature automatically creates complete outfit combinations from a user's closet items using **rule-based permutation algorithms**. It intelligently combines items based on category rules (e.g., no shirt + shirt), color harmony principles, and style compatibility to suggest wearable outfits. This eliminates "decision fatigue" and helps users discover new outfit combinations.

**Technical Approach:**
- **Permutation-based algorithm** - Generates valid combinations from user's closet items
- **Rule-based matching** - Uses predefined color harmony and style compatibility rules
- **No machine learning** - Does not require ML models or training data
- **Client-side processing** - Runs entirely in the browser for fast generation

**Visual Presentation:**
- Outfits are displayed as **item images arranged on a blank canvas**
- Items are NOT superimposed on a person/mannequin
- Each item shown in its original uploaded photo
- Items arranged vertically or in a grid layout (top, bottom, shoes, accessories)

## Business Requirements

### User Stories

**Auto-Generated Outfits:**
1. **As a user**, I want automatically generated outfit suggestions so I don't have to decide what to wear each day
2. **As a user**, I want outfits tailored to weather and occasion so suggestions are practical and relevant
3. **As a user**, I want to rate generated outfits so I can remember which combinations I liked
4. **As a user**, I want to save favorite outfits so I can quickly recreate them later
5. **As a user**, I want to see why certain items were combined so I can learn about color and style matching
6. **As a user**, I want to regenerate outfits if I don't like the suggestion so I have multiple options
7. **As a user**, I want to manually swap individual items in a generated outfit so I have control over the final look

**Manual Outfit Creation:**
8. **As a user**, I want to create my own outfits manually so I can design custom combinations
9. **As a user**, I want to drag and drop items onto a blank canvas so outfit creation is intuitive
10. **As a user**, I want to search/filter my closet while creating outfits so I can quickly find specific items
11. **As a user**, I want to position and arrange items on the canvas so I can control the visual layout
12. **As a user**, I want to save my manually-created outfits so I can wear them later
13. **As a user**, I want to edit existing outfits (add/remove/reposition items) so I can refine my looks
14. **As a user**, I want to see outfit items on a clean canvas so I can visualize each piece clearly

### Success Criteria

**Auto-Generated Outfits:**
- Algorithm generates valid outfits (top + bottom + shoes minimum)
- **Category rules enforced**: No duplicate categories (e.g., no shirt + shirt)
- Outfit generation completes in < 3 seconds
- Color harmony rules are followed (monochromatic, complementary, analogous)
- Style compatibility is maintained (no formal + sporty mixing)
- Outfits displayed clearly on blank canvas (no person overlay)
- Users rate outfits ≥ 3.5/5 average
- 30% of generated outfits are saved by users

**Manual Outfit Creation:**
- Users can drag and drop items onto blank canvas
- Canvas supports search/filter to find items quickly
- Items can be positioned and resized on canvas
- **No category restrictions** for manual outfits (user has full control)
- Outfits can be saved with custom names and notes
- Users can edit existing manually-created outfits
- Manual outfits stored alongside auto-generated ones
- 50%+ of active users create at least one manual outfit

## Functional Requirements

### 1. Outfit Generation (Auto)
- **FR-001**: Generate complete outfit with minimum 3 items (top, bottom, shoes)
- **FR-001a**: **Category Rule**: Each outfit can only have ONE item per category
  - ✅ Valid: 1 top + 1 bottom + 1 shoes
  - ❌ Invalid: 2 tops, 2 bottoms, 2 shoes
  - ✅ Valid: 1 top + 1 bottom + 1 shoes + 1 outerwear + 1 accessory
  - ❌ Invalid: 1 top + 1 top (even if different styles)
- **FR-002**: Optionally include outerwear (if weather is cold)
- **FR-003**: Optionally include accessories (up to 2, different subcategories)
- **FR-004**: Maximum 6 items per outfit (prevent over-cluttered looks)
- **FR-005**: Generate outfit in < 3 seconds
- **FR-006**: Display outfit items on **blank canvas** (no person/mannequin)

### 1b. Manual Outfit Creation
- **FR-007**: User can create outfits manually via drag-and-drop interface
- **FR-008**: Canvas displays all user's closet items in sidebar/panel
- **FR-009**: **No category restrictions** - User can add any combination of items
  - ✅ Allowed: 2 tops + 1 bottom (layering)
  - ✅ Allowed: 3 accessories (styling flexibility)
  - ✅ Allowed: 1 item outfits (single statement piece)
- **FR-010**: Search/filter closet items by category, color, name while creating
- **FR-011**: Drag items from sidebar onto blank canvas
- **FR-012**: Items can be positioned anywhere on canvas (x, y coordinates)
- **FR-013**: Items can be reordered (z-index) for layering visualization
- **FR-014**: Items can be removed from canvas (click X or drag off)
- **FR-015**: Canvas auto-saves as draft while editing
- **FR-016**: User can save outfit with custom name and optional notes
- **FR-017**: Maximum 10 items per manual outfit (practical limit)
- **FR-018**: User can edit existing manual outfits (add/remove/reposition)

### 2. Input Parameters
- **FR-006**: Weather condition (hot, warm, cool, cold)
- **FR-007**: Occasion (work, casual, date, workout, formal, party)
- **FR-008**: Style preference (casual, formal, sporty, business, mixed)
- **FR-009**: Color scheme (monochromatic, complementary, analogous, triadic, neutral, mixed)
- **FR-010**: Exclude specific items (already worn recently, in laundry)
- **FR-011**: Use optional color preferences (e.g., "I want to wear blue today")

### 3. Permutation Algorithm
- **FR-012**: **Category validation** - MUST ensure no duplicate categories
  - Before combining items, check category uniqueness
  - Filter out permutations with duplicate categories
  - Example: If selecting top items, only pick ONE top for final outfit
- **FR-013**: Color harmony matching (use color wheel rules)
- **FR-014**: Style compatibility matrix (formal + formal, casual + casual)
- **FR-015**: Category balance (1 top, 1 bottom, 1 shoes required)
- **FR-016**: Weather appropriateness (no shorts in cold, no coats in hot)
- **FR-017**: Occasion suitability (no gym clothes for formal events)
- **FR-018**: Outfit scoring (0-100) based on harmony, completeness, style

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
- **FR-019**: Rate outfit 1-5 stars (for personal tracking)
- **FR-020**: Save outfit to user's saved outfits collection
- **FR-021**: Regenerate outfit with same parameters (gets different permutation)
- **FR-022**: Swap individual items (e.g., "swap the shoes" - respects category rules)
- **FR-023**: Share outfit (future)

### 8. User Preferences (Optional Future Enhancement)
- **FR-024**: Track user ratings for outfits (stored in database)
- **FR-025**: Display user's most-saved color schemes (analytics)
- **FR-026**: Display user's most-saved style combinations (analytics)
- **FR-027**: Future: Use rating history to filter out unpopular combinations

**Note**: Currently NO machine learning. Future versions could implement:
- Preference learning from ratings
- Item prioritization based on past saves
- Personalized scoring algorithms

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
  
  -- Auto-generation fields (null for manual outfits)
  generation_params JSONB,
  color_scheme VARCHAR(50),
  style_theme VARCHAR(50),
  occasion VARCHAR(50),
  weather_condition VARCHAR(50),
  ai_score INTEGER CHECK (ai_score BETWEEN 0 AND 100),
  
  -- Manual creation fields
  is_manual BOOLEAN DEFAULT false,
  outfit_name VARCHAR(100),
  outfit_notes TEXT,
  item_positions JSONB, -- Array of {item_id, x, y, z_index}
  tags VARCHAR(50)[],
  
  -- Common fields
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  is_saved BOOLEAN DEFAULT false,
  saved_to_collection_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  rated_at TIMESTAMP,
  saved_at TIMESTAMP
);

-- Example item_positions JSONB:
-- [
--   {"item_id": "uuid1", "x": 100, "y": 50, "z_index": 1},
--   {"item_id": "uuid2", "x": 100, "y": 200, "z_index": 2},
--   {"item_id": "uuid3", "x": 100, "y": 350, "z_index": 3}
-- ]

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

#### 0. Create Manual Outfit
```
POST /api/outfits/manual
Body:
  {
    "name": "Summer Beach Look",
    "notes": "For vacation trip",
    "items": [
      {
        "item_id": "uuid1",
        "position_x": 100,
        "position_y": 50,
        "z_index": 1
      },
      {
        "item_id": "uuid2",
        "position_x": 100,
        "position_y": 200,
        "z_index": 2
      },
      {
        "item_id": "uuid3",
        "position_x": 100,
        "position_y": 350,
        "z_index": 3
      }
    ],
    "tags": ["summer", "casual", "beach"]
  }
Response:
  {
    "outfit": {
      "id": "uuid",
      "name": "Summer Beach Look",
      "notes": "For vacation trip",
      "items": [...],
      "created_at": "2025-10-07T10:30:00Z",
      "is_manual": true
    }
  }
```

#### 0b. Update Manual Outfit
```
PUT /api/outfits/manual/:id
Body:
  {
    "name": "Updated Name" (optional),
    "notes": "Updated notes" (optional),
    "items": [...] (optional - full replacement),
    "tags": [...] (optional)
  }
Response:
  {
    "outfit": { ... }
  }
```

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
      "items": [
        { "id": "uuid1", "category": "top", "name": "Blue T-Shirt", "image_url": "...", "order": 1 },
        { "id": "uuid2", "category": "bottom", "name": "Jeans", "image_url": "...", "order": 2 },
        { "id": "uuid3", "category": "shoes", "name": "Sneakers", "image_url": "...", "order": 3 }
      ],
      "colorScheme": "complementary",
      "outfitScore": 88,
      "explanation": "Blue top pairs with orange accent, neutral brown shoes balance the look",
      "displayMode": "canvas" // Items displayed on blank canvas, not on person
    },
    "generationTimeMs": 1245,
    "algorithmVersion": "permutation-v1"
  }
```

**Note**: `items` array is ordered for display (top → bottom → shoes → outerwear → accessories)

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

#### 0. ManualOutfitCreator.vue (Page/Modal)
- **Purpose**: Manual outfit creation interface with drag-and-drop
- **Layout**: Split view - closet items sidebar + blank canvas
- **Sidebar**: 
  - Search bar (filter by name, category, color)
  - Category filter buttons (All, Tops, Bottoms, Shoes, etc.)
  - Grid of draggable item thumbnails
  - Item count badge
- **Canvas**:
  - Blank white/neutral background (800x1200px recommended)
  - Drop zone for items
  - Positioned items with drag handles
  - Remove button (X) on each item
  - Z-index controls (bring forward/send back)
- **Actions**:
  - Save button (name + notes dialog)
  - Clear canvas button
  - Cancel/close button
  - Auto-save indicator
- **Props**: `editingOutfitId` (optional - for editing existing outfit)
- **Emits**: `save`, `cancel`

#### 0b. OutfitCanvas.vue (Component)
- **Purpose**: Canvas area for positioning outfit items
- **Features**:
  - Drag-and-drop item positioning
  - Item resize handles (optional)
  - Z-index reordering (right-click menu)
  - Grid snap (optional - align items)
  - Undo/redo (optional)
- **Props**: `items` (array with positions), `editable` (boolean)
- **Emits**: `itemMoved`, `itemRemoved`, `itemReordered`

#### 0c. ClosetItemsSidebar.vue (Component)
- **Purpose**: Sidebar showing draggable closet items
- **Features**:
  - Search input
  - Category filter chips
  - Color filter (optional)
  - Item grid with drag handles
  - Loading state (skeleton)
  - Empty state
- **Props**: `searchQuery`, `categoryFilter`
- **Emits**: `itemDragStart`, `search`, `filter`

#### 1. OutfitGenerator.vue (Page)
- Main **auto** outfit generation interface
- Contains: parameter form, generated outfit display, action buttons
- Shows: outfit items, score, explanation, rating stars

#### 2. OutfitGeneratorForm.vue
- Input form for generation parameters
- Fields: weather, occasion, style, color scheme, exclude items
- Emits: `generate`

#### 3. OutfitCard.vue
- Displays generated outfit on **blank canvas/background**
- Shows: item images arranged vertically or in grid
- Shows: outfit score, explanation, color scheme badge
- **Layout**: Items displayed in order (top → bottom → shoes → outerwear → accessories)
- **No person overlay** - Just item images on white/neutral background
- Props: `outfit`, `showActions`, `layout` ('vertical' | 'grid')
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
    
    // Step 2: Group items by category (CRITICAL for avoiding duplicates)
    const itemsByCategory = this.groupItemsByCategory(items);
    // Result: { top: [...], bottom: [...], shoes: [...], outerwear: [...], accessories: [...] }
    
    // Step 3: Filter by weather and occasion
    const filtered = this.filterByWeatherAndOccasion(itemsByCategory, weather, occasion);
    
    // Step 4: Generate permutations (1 item per category)
    const outfitCandidates = this.generatePermutations(filtered, colorScheme, preferredColor);
    // IMPORTANT: Each permutation has exactly ONE item from each category
    
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

  groupItemsByCategory(items) {
    // Group items to ensure no duplicate categories
    return items.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
  }

  generatePermutations(itemsByCategory, colorScheme, preferredColor) {
    // Generate outfit permutations with ONE item per category
    const outfits = [];
    
    // Required categories
    const tops = itemsByCategory.top || [];
    const bottoms = itemsByCategory.bottom || [];
    const shoes = itemsByCategory.shoes || [];
    
    // Optional categories
    const outerwear = itemsByCategory.outerwear || [];
    const accessories = itemsByCategory.accessories || [];
    
    // Generate permutations: 1 top × 1 bottom × 1 shoes
    for (const top of tops) {
      for (const bottom of bottoms) {
        for (const shoe of shoes) {
          // Base outfit: top + bottom + shoes (3 items, no duplicates)
          const baseOutfit = [top, bottom, shoe];
          
          // Add optional items
          if (outerwear.length > 0) {
            // Try adding one outerwear item
            for (const outer of outerwear) {
              const withOuter = [...baseOutfit, outer];
              outfits.push({ items: withOuter });
            }
          }
          
          // Base outfit without outerwear
          outfits.push({ items: baseOutfit });
        }
      }
    }
    
    // Limit permutations (too many combinations = slow)
    return outfits.slice(0, 100); // Return top 100 permutations
  }
}
```

**Key Points:**
1. **Category grouping prevents duplicates** - Items are grouped by category first
2. **Nested loops create permutations** - 1 item from each category
3. **No ML required** - Pure algorithmic approach
4. **Fast generation** - Completes in < 3 seconds even with 100+ items

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
- **NFR-002**: Generation algorithm runs in browser (pure JavaScript, no ML models)
- **NFR-003**: Permutation generation handles up to 200 items in closet
- **NFR-004**: Outfit history loads in < 500ms
- **NFR-005**: Scoring calculation completes in < 100ms

### Accuracy
- **NFR-006**: Generated outfits have algorithm score ≥ 70
- **NFR-007**: **Category rules enforced 100%** - No duplicate categories ever
- **NFR-008**: Color harmony rules are followed 100% of the time
- **NFR-009**: Weather appropriateness is validated 100%
- **NFR-010**: Occasion suitability is validated 100%

### Usability
- **NFR-009**: Generation form is simple (≤ 5 inputs)
- **NFR-010**: Generated outfit is visually clear (images, names, categories)
- **NFR-011**: Explanation is concise (1-2 sentences)
- **NFR-012**: Rating is easy (tap stars, no typing)
- **NFR-013**: Regenerate button is prominent

### Analytics (No Active Learning)
- **NFR-014**: User ratings are stored for analytics dashboard
- **NFR-015**: Display most-saved color schemes and styles
- **NFR-016**: Track outfit generation usage statistics
- **NFR-017**: Future enhancement: Use ratings to filter low-scoring permutations

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

### Phase 2: Machine Learning (Not Implemented Yet)
1. **ML Model**: Train neural network on user preferences and ratings
2. **Style Transfer**: "Generate outfit inspired by this photo"
3. **Collaborative Filtering**: "Users with similar style also liked..."
4. **Image-Based Matching**: Use computer vision for color/pattern matching

### Phase 2: Advanced Features
5. **Photo Overlay**: Display outfit items on mannequin or user avatar
6. **Outfit Challenges**: Daily themed outfit challenges
7. **Social Sharing**: Share outfits with friends for feedback
8. **Virtual Try-On**: AR preview of outfit on user
9. **Wardrobe Analytics**: "Most worn colors/styles"
10. **Seasonal Recommendations**: "Fall wardrobe refresh suggestions"
11. **Budget-Aware Suggestions**: Prioritize items by cost-per-wear

### Why Not ML Now?
- **Data requirement**: Need 1000s of rated outfits for training
- **Complexity**: Adds significant technical overhead
- **Speed**: Rule-based is faster for small datasets
- **Interpretability**: Users can understand why combinations were made

## Acceptance Criteria

**Auto-Generated Outfits:**
- [ ] Algorithm generates valid outfits (top + bottom + shoes minimum)
- [ ] **Category rules enforced**: No outfit contains duplicate categories
- [ ] Generation completes in < 3 seconds
- [ ] Color harmony rules are followed (monochromatic, complementary, etc.)
- [ ] Style compatibility is maintained (no formal + sporty)
- [ ] Outfit score (0-100) is calculated correctly
- [ ] **Outfits displayed on blank canvas** (no person overlay)
- [ ] Items arranged clearly (vertical or grid layout)
- [ ] Users can rate outfits (1-5 stars)
- [ ] Users can save outfits to their collection
- [ ] Users can regenerate outfits (get different permutation)
- [ ] Users can swap individual items (respecting category rules)
- [ ] Outfit history is stored and accessible
- [ ] Explanation is generated for each outfit

**Manual Outfit Creation:**
- [ ] Users can access manual outfit creator (button/page)
- [ ] Sidebar displays all user's closet items as draggable thumbnails
- [ ] Search/filter works in sidebar (category, name, color)
- [ ] Items can be dragged from sidebar to canvas
- [ ] Items can be positioned anywhere on canvas
- [ ] Items can be removed from canvas (X button or drag off)
- [ ] **No category restrictions** - User can add any combination
- [ ] Canvas supports up to 10 items
- [ ] Z-index reordering works (layering items)
- [ ] Auto-save saves draft while editing
- [ ] Users can save with custom name and notes
- [ ] Users can edit existing manual outfits
- [ ] Manual outfits stored with `is_manual: true` flag
- [ ] Manual outfits appear in outfit history alongside auto-generated

**Common:**
- [ ] All tests pass (unit, integration, E2E)
- [ ] Code follows StyleSnap standards
- [ ] Mobile responsive (canvas scales appropriately)

## Estimated Effort
- **Database Migration**: 1 hour
- **Outfit Generator Service**: 8 hours (algorithm, scoring, color harmony)
- **API Endpoints**: 4 hours (generate, rate, save, swap, history)
- **Pinia Store Extension**: 3 hours (new state, actions)
- **Frontend Components**: 8 hours (OutfitGenerator, OutfitCard, History)
- **Testing**: 4 hours
- **Total**: ~28 hours (4-5 days)
