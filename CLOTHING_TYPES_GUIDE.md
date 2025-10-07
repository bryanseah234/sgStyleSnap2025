# Clothing Types & Outfit Generation Guide

## Overview

The ClosetApp now supports **20 granular clothing types** in addition to the original 5 broad categories. This enables more precise filtering, better outfit generation, and improved user experience.

---

## 🎯 Supported Clothing Types

### Complete List (20 types)

1. **Blazer** - Formal jacket (maps to: outerwear)
2. **Blouse** - Dressy top (maps to: top)
3. **Body** - Bodysuit (maps to: top)
4. **Dress** - Complete outfit (maps to: top)
5. **Hat** - Headwear (maps to: accessory)
6. **Hoodie** - Casual sweatshirt (maps to: outerwear)
7. **Longsleeve** - Long-sleeve shirt (maps to: top)
8. **Not sure** - Unknown type (maps to: top)
9. **Other** - Miscellaneous (maps to: accessory)
10. **Outwear** - General outerwear (maps to: outerwear)
11. **Pants** - Trousers (maps to: bottom)
12. **Polo** - Polo shirt (maps to: top)
13. **Shirt** - General shirt (maps to: top)
14. **Shoes** - Footwear (maps to: shoes)
15. **Shorts** - Short pants (maps to: bottom)
16. **Skip** - Skip categorization (maps to: top)
17. **Skirt** - Skirt (maps to: bottom)
18. **T-Shirt** - T-shirt (maps to: top)
19. **Top** - General top (maps to: top)
20. **Undershirt** - Base layer (maps to: top)

---

## 📊 Category Mapping

Clothing types automatically map to broad categories:

| Category | Clothing Types |
|----------|----------------|
| **top** | Blouse, Body, Longsleeve, Not sure, Polo, Shirt, Skip, T-Shirt, Top, Undershirt, Dress |
| **bottom** | Pants, Shorts, Skirt |
| **outerwear** | Blazer, Hoodie, Outwear |
| **shoes** | Shoes |
| **accessory** | Hat, Other |

---

## 🚀 Using Clothing Types

### 1. Database Migration

Run the SQL migration to add the `clothing_type` column:

```sql
-- Run in Supabase SQL Editor
-- File: sql/009_clothing_types.sql
```

**What it does:**
- Adds `clothing_type` column to `clothes` table
- Adds `clothing_type` column to `catalog_items` table (if exists)
- Creates index for fast filtering
- Adds helper function `get_category_from_clothing_type()`
- Creates trigger to auto-set category from clothing_type

### 2. Filtering in Closet Page

The Closet page now has two filter dropdowns:

```vue
<!-- Filter by broad category -->
<select v-model="filters.category">
  <option value="all">All Categories</option>
  <option value="top">Tops</option>
  <option value="bottom">Bottoms</option>
  <option value="outerwear">Outerwear</option>
  <option value="shoes">Shoes</option>
  <option value="accessory">Accessories</option>
</select>

<!-- Filter by specific clothing type -->
<select v-model="filters.clothing_type">
  <option value="all">All Types</option>
  <option value="Blazer">Blazer</option>
  <option value="T-Shirt">T-Shirt</option>
  <option value="Pants">Pants</option>
  <!-- ... all 20 types -->
</select>
```

**Usage:**
- Filter by category to see all tops, bottoms, etc.
- Filter by clothing type for more specific results (e.g., only T-Shirts)
- Filters work together (can filter by category AND type)

### 3. Outfit Generation

Navigate to `/outfit-generator` to use the AI outfit generator:

**Parameters:**
- **Occasion**: casual, work, date, workout, formal, party, travel
- **Weather**: hot (>25°C), warm (15-25°C), cool (5-15°C), cold (<5°C)
- **Style** (optional): casual, formal, sporty, business, street, etc.

**How it works:**
1. Filters your closet items by weather appropriateness
2. Filters by occasion and style preferences
3. Generates all valid outfit combinations (top + bottom + shoes)
4. Scores each outfit (0-100) based on:
   - Color harmony (40 points)
   - Style consistency (30 points)
   - Completeness (20 points)
   - User preferences (10 points)
5. Returns the highest-scoring outfit

**Actions:**
- 👍 **Love It**: Rate 5/5 (helps AI learn your preferences)
- 👎 **Not For Me**: Rate 1/5 (AI will avoid similar combinations)
- 💾 **Save**: Save to your outfit collections
- 🔄 **Generate Another**: Try a different combination

---

## 🧠 Outfit Generation Algorithm

### Color Harmony Scoring

The algorithm checks for:
- **Monochromatic**: All same color (1.0 score)
- **Neutral**: Black, white, gray, beige, brown (0.9 score)
- **Complementary**: Opposite colors (0.85 score)
- **Analogous**: Adjacent colors on wheel (0.8 score)

### Style Compatibility Matrix

```javascript
styleMatrix = {
  casual: ['casual', 'sporty', 'street'],
  formal: ['formal', 'business'],
  sporty: ['sporty', 'casual', 'street'],
  business: ['business', 'formal', 'casual'],
  street: ['street', 'casual', 'sporty'],
  boho: ['boho', 'casual'],
  vintage: ['vintage', 'casual'],
  minimalist: ['minimalist', 'formal', 'business', 'casual'],
}
```

### Weather Rules

- **Hot**: Avoid outerwear, prefer T-Shirt/Shorts/Dress
- **Warm**: Optional outerwear, prefer Shirt/Pants
- **Cool**: Require outerwear, prefer Longsleeve/Blazer/Hoodie
- **Cold**: Require outerwear, prefer heavy layers

### Occasion Rules

- **Work**: Formal/business styles, prefer Blazer/Shirt/Pants/Blouse
- **Casual**: Casual style only, prefer T-Shirt/Pants/Shorts
- **Workout**: Sporty style, require Shoes, prefer T-Shirt/Shorts
- **Formal**: Formal style only, avoid casual/sporty, prefer Blazer/Dress
- **Date**: Formal/business/casual, prefer Dress/Shirt/Blouse/Skirt

---

## 💻 Code Examples

### Import Constants

```javascript
import {
  CLOTHING_TYPES,
  CATEGORIES,
  CLOTHING_TYPE_TO_CATEGORY,
  getCategoryFromType,
  getTypesForCategory,
} from '@/utils/clothing-constants'
```

### Get Category from Type

```javascript
const category = getCategoryFromType('T-Shirt')
// Returns: 'top'

const category2 = getCategoryFromType('Blazer')
// Returns: 'outerwear'
```

### Get All Types for Category

```javascript
const topTypes = getTypesForCategory('top')
// Returns: ['Blouse', 'Body', 'Longsleeve', 'Polo', 'Shirt', 'T-Shirt', 'Top', 'Undershirt', 'Not sure', 'Skip', 'Dress']

const bottomTypes = getTypesForCategory('bottom')
// Returns: ['Pants', 'Shorts', 'Skirt']
```

### Filter Items by Clothing Type

```javascript
// In a component or store
const items = closetStore.items
const tShirts = items.filter(item => item.clothing_type === 'T-Shirt')
const blazers = items.filter(item => item.clothing_type === 'Blazer')
```

### Generate Outfit

```javascript
import { useOutfitGenerationStore } from '@/stores/outfit-generation-store'

const outfitStore = useOutfitGenerationStore()

// Set parameters
outfitStore.setOccasion('casual')
outfitStore.setWeather('warm')
outfitStore.setStyle('casual')

// Generate
const outfit = await outfitStore.generateOutfit()

// Access result
console.log(outfit.items) // Array of clothing items
console.log(outfit.score) // 0-100
console.log(outfit.color_scheme) // 'monochromatic', 'complementary', etc.
```

---

## 🔧 Implementation Details

### Database Schema

```sql
-- Added to clothes table
ALTER TABLE clothes 
ADD COLUMN clothing_type VARCHAR(50) CHECK (
  clothing_type IN (
    'Blazer', 'Blouse', 'Body', 'Dress', 'Hat', 'Hoodie', 
    'Longsleeve', 'Not sure', 'Other', 'Outwear', 'Pants', 
    'Polo', 'Shirt', 'Shoes', 'Shorts', 'Skip', 'Skirt', 
    'T-Shirt', 'Top', 'Undershirt'
  )
);

-- Index for fast filtering
CREATE INDEX idx_clothes_clothing_type ON clothes(clothing_type);

-- Auto-set category from clothing_type
CREATE TRIGGER set_category_from_type_trigger
  BEFORE INSERT OR UPDATE ON clothes
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_category_from_type();
```

### Service Layer

- **catalog-service.js**: Browse catalog by clothing_type
- **outfit-generator-service.js**: Generate outfits using types
- **clothes-service.js**: Filter closet items by type

### State Management

- **catalog-store.js**: Manages catalog browsing state
- **outfit-generation-store.js**: Manages outfit generation state
- **closet-store.js**: Updated with clothing_type filtering

### UI Components

- **OutfitGenerator.vue**: Full outfit generation UI at `/outfit-generator`
- **Closet.vue**: Enhanced with clothing_type filter dropdown

---

## 📝 Future Enhancements

### Planned Features
- [ ] Update AddItemForm to include clothing_type selector
- [ ] Add clothing_type to item detail view
- [ ] Show clothing_type badge on item cards
- [ ] Add "Popular Types" analytics
- [ ] Type-based search and suggestions
- [ ] Smart defaults (guess type from image/name)

### AI Learning Improvements
- [ ] Learn user's preferred types per occasion
- [ ] Track which types get worn most often
- [ ] Suggest missing types to complete wardrobe

---

## 🐛 Troubleshooting

### Migration Errors

**Error**: Column already exists
```
Solution: The migration is re-runnable. It checks for existence before adding.
```

**Error**: Check constraint violated
```
Solution: Ensure clothing_type is one of the 20 valid types.
```

### Filtering Issues

**Problem**: Filtering by type doesn't work
```
Checklist:
1. Run migration 009 in database
2. Restart dev server
3. Check browser console for errors
4. Verify items have clothing_type set
```

**Problem**: Outfit generation returns no outfits
```
Checklist:
1. Ensure you have at least 3 items (1 top, 1 bottom, 1 shoes)
2. Check that items match the occasion/weather filters
3. Try "Any Style" instead of specific style
4. Add more items to your closet
```

### Performance

**Problem**: Slow outfit generation
```
Solution: Algorithm limits to 100 combinations max.
Current limit: 5 tops × 5 bottoms × 3 shoes = 75 combinations
```

---

## 📚 Related Documentation

- **DATABASE_SETUP.md**: Database migration instructions
- **TASKS.md**: Task completion status
- **tasks/09-item-catalog-system.md**: Catalog system details
- **tasks/11-outfit-generation.md**: Outfit generation algorithm
- **src/utils/clothing-constants.js**: Constants source code

---

**Last Updated**: October 2025  
**Version**: 1.0 (Initial Release)
