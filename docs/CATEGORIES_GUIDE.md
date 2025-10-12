# 👔 Category System Documentation

## Overview
StyleSnap uses a two-tier category system providing both detailed categorization (20 types) and simple grouping (7 groups) for algorithms and analytics. This enables precise user-facing classification while maintaining backward compatibility and simplifying outfit generation logic.

---

## Features
- 20 detailed clothing categories
- 7 simple category groups
- Backward compatible with existing data
- Optimized database queries with functional indexes
- Helper functions for both frontend and backend
- Extensible for future categories

---

## Category Hierarchy

### Detailed Categories (20 Total)

#### Top Group (9 categories)
| Category | Value | Description | Examples |
|----------|-------|-------------|----------|
| Blouse | `blouse` | Formal/feminine shirts | Silk blouse, ruffle top |
| Body | `body` | Form-fitting one-piece tops | Bodysuits, leotards |
| Hoodie | `hoodie` | Hooded sweatshirts | Zip-up, pullover hoodies |
| Longsleeve | `longsleeve` | Long-sleeve shirts | Long-sleeve tees, thermals |
| Polo | `polo` | Collared polo shirts | Golf shirts, polo tees |
| Shirt | `shirt` | Button-up/dress shirts | Oxford, flannel, dress shirt |
| T-Shirt | `t-shirt` | Short-sleeve casual tops | Basic tees, graphic tees |
| Top | `top` | General tops | Tank tops, sweaters, cardigans |
| Undershirt | `undershirt` | Base layers | Undershirts, base layers |

#### Bottom Group (3 categories)
| Category | Value | Description | Examples |
|----------|-------|-------------|----------|
| Pants | `pants` | Full-length pants | Jeans, trousers, slacks |
| Shorts | `shorts` | Short pants | Denim shorts, athletic shorts |
| Skirt | `skirt` | Skirts (any length) | Mini, midi, maxi skirts |

#### Outerwear Group (2 categories)
| Category | Value | Description | Examples |
|----------|-------|-------------|----------|
| Blazer | `blazer` | Formal jackets | Suit jackets, sport coats |
| Outerwear | `outerwear` | Jackets, coats | Winter coats, windbreakers |

#### Other Groups
| Category | Value | Group | Description |
|----------|-------|-------|-------------|
| Shoes | `shoes` | shoes | All footwear |
| Hat | `hat` | accessory | Headwear accessories |
| Dress | `dress` | dress | One-piece dresses |
| Not sure | `not-sure` | other | Uncertain category |
| Other | `other` | other | Miscellaneous items |
| Skip | `skip` | other | Placeholder for later |

---

## Simple Category Groups

All 20 detailed categories map to 7 simple groups for algorithms:

| Group | Detailed Categories | Use Case |
|-------|---------------------|----------|
| `top` | blouse, body, hoodie, longsleeve, polo, shirt, t-shirt, top, undershirt | Outfit generation (1 top per outfit) |
| `bottom` | pants, shorts, skirt | Outfit generation (1 bottom per outfit) |
| `outerwear` | blazer, outerwear | Optional layer for cold weather |
| `shoes` | shoes | Required for complete outfits |
| `accessory` | hat | Optional accessories |
| `dress` | dress | Special case (covers top + bottom) |
| `other` | not-sure, other, skip | Uncategorized items |

---

## Frontend Usage

### Constants (`src/config/constants.js`)
```js
export const CLOTHING_CATEGORIES = [
  // Top Group
  { value: 'blouse', label: 'Blouse', group: 'top' },
  { value: 'body', label: 'Body', group: 'top' },
  { value: 'hoodie', label: 'Hoodie', group: 'top' },
  { value: 'longsleeve', label: 'Longsleeve', group: 'top' },
  { value: 'polo', label: 'Polo', group: 'top' },
  { value: 'shirt', label: 'Shirt', group: 'top' },
  { value: 't-shirt', label: 'T-Shirt', group: 'top' },
  { value: 'top', label: 'Top', group: 'top' },
  { value: 'undershirt', label: 'Undershirt', group: 'top' },
  // ... (rest of categories)
]

export const CATEGORY_GROUPS = {
  top: CLOTHING_CATEGORIES.filter(c => c.group === 'top'),
  bottom: CLOTHING_CATEGORIES.filter(c => c.group === 'bottom'),
  outerwear: CLOTHING_CATEGORIES.filter(c => c.group === 'outerwear'),
  shoes: CLOTHING_CATEGORIES.filter(c => c.group === 'shoes'),
  accessory: CLOTHING_CATEGORIES.filter(c => c.group === 'accessory'),
  dress: CLOTHING_CATEGORIES.filter(c => c.group === 'dress'),
  other: CLOTHING_CATEGORIES.filter(c => c.group === 'other')
}

export const CATEGORY_VALUES = CLOTHING_CATEGORIES.map(c => c.value)
```

### Helper Functions
```js
/**
 * Get human-readable label for category
 * @param {string} category - Category value (e.g., 't-shirt')
 * @returns {string} Label (e.g., 'T-Shirt')
 */
export function getCategoryLabel(category) {
  const cat = CLOTHING_CATEGORIES.find(c => c.value === category)
  return cat ? cat.label : category
}

/**
 * Get simple group for category
 * @param {string} category - Category value (e.g., 'hoodie')
 * @returns {string} Group (e.g., 'top')
 */
export function getCategoryGroup(category) {
  const cat = CLOTHING_CATEGORIES.find(c => c.value === category)
  return cat ? cat.group : 'other'
}

/**
 * Validate category value
 * @param {string} category - Category to validate
 * @returns {boolean} True if valid
 */
export function isValidCategory(category) {
  return CATEGORY_VALUES.includes(category)
}
```

### Component Usage
```vue
<template>
  <!-- Grouped Select -->
  <select v-model="selectedCategory">
    <optgroup
      v-for="(items, group) in CATEGORY_GROUPS"
      :key="group"
      :label="formatGroupLabel(group)"
    >
      <option
        v-for="cat in items"
        :key="cat.value"
        :value="cat.value"
      >
        {{ cat.label }}
      </option>
    </optgroup>
  </select>

  <!-- Category Badges -->
  <div class="category-badges">
    <button
      v-for="group in ['top', 'bottom', 'outerwear', 'shoes']"
      :key="group"
      @click="filterByGroup(group)"
      :class="{ active: activeGroup === group }"
    >
      {{ formatGroupLabel(group) }}
    </button>
  </div>

  <!-- Display Category -->
  <span class="category-label">
    {{ getCategoryLabel(item.category) }}
  </span>
</template>

<script setup>
import {
  CATEGORY_GROUPS,
  getCategoryLabel,
  getCategoryGroup
} from '@/config/constants'

const selectedCategory = ref('t-shirt')
const activeGroup = ref('top')

function filterByGroup(group) {
  activeGroup.value = group
  // Filter items by group
  const filtered = items.value.filter(item =>
    getCategoryGroup(item.category) === group
  )
}

function formatGroupLabel(group) {
  return group.charAt(0).toUpperCase() + group.slice(1)
}
</script>
```

---

## Backend Usage

### Database Function (`sql/009_enhanced_categories.sql`)
```sql
CREATE OR REPLACE FUNCTION get_category_group(category TEXT)
RETURNS TEXT AS $$
BEGIN
  CASE category
    WHEN 'blouse', 'body', 'hoodie', 'longsleeve', 'polo', 
         'shirt', 't-shirt', 'top', 'undershirt' THEN RETURN 'top';
    WHEN 'pants', 'shorts', 'skirt' THEN RETURN 'bottom';
    WHEN 'blazer', 'outerwear' THEN RETURN 'outerwear';
    WHEN 'shoes' THEN RETURN 'shoes';
    WHEN 'hat' THEN RETURN 'accessory';
    WHEN 'dress' THEN RETURN 'dress';
    ELSE RETURN 'other';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create functional index
CREATE INDEX idx_clothes_category_group 
ON clothes(get_category_group(category));
```

### SQL Queries
```sql
-- Get all tops (includes t-shirts, hoodies, shirts, etc.)
SELECT * FROM clothes
WHERE get_category_group(category) = 'top'
AND removed_at IS NULL;

-- Category distribution
SELECT 
  category,
  get_category_group(category) as category_group,
  COUNT(*) as count
FROM clothes
WHERE removed_at IS NULL
GROUP BY category, category_group
ORDER BY count DESC;

-- Filter by specific detailed category
SELECT * FROM clothes
WHERE category = 'hoodie'
AND owner_id = '...'
AND removed_at IS NULL;

-- Get outfit-compatible items (has required categories)
SELECT get_category_group(category) as group, COUNT(*)
FROM clothes
WHERE owner_id = '...'
AND removed_at IS NULL
GROUP BY group
HAVING get_category_group(category) IN ('top', 'bottom', 'shoes');
```

### Analytics View
```sql
CREATE VIEW category_distribution AS
SELECT 
  category,
  get_category_group(category) as category_group,
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE removed_at IS NULL) as active_items,
  COUNT(*) FILTER (WHERE removed_at IS NOT NULL) as deleted_items,
  ROUND(AVG(CASE WHEN removed_at IS NULL THEN 1 ELSE 0 END) * 100, 2) as active_percentage
FROM clothes
GROUP BY category;

-- Query the view
SELECT * FROM category_distribution
WHERE category_group = 'top'
ORDER BY total_items DESC;
```

---

## API Service Usage

### Catalog Service
```js
// src/services/catalog-service.js
import { supabase } from '@/config/supabase'
import { isValidCategory } from '@/config/constants'

export const catalogService = {
  /**
   * Browse catalog items by category
   */
  async browse({ category, page = 1, limit = 20 }) {
    if (category && !isValidCategory(category)) {
      throw new Error(`Invalid category: ${category}`)
    }

    let query = supabase
      .from('catalog_items')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    if (category) {
      query = query.eq('category', category)
    }

    query = query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (error) throw error

    return { items: data, total: count, page, limit }
  },

  /**
   * Search with category filter
   */
  async search({ q, category, limit = 20 }) {
    let query = supabase
      .from('catalog_items')
      .select('*')
      .eq('is_active', true)
      .textSearch('name', q)

    if (category && isValidCategory(category)) {
      query = query.eq('category', category)
    }

    const { data, error } = await query.limit(limit)

    if (error) throw error
    return data
  }
}
```

### Closet Service
```js
// src/services/closet-service.js
import { getCategoryGroup } from '@/config/constants'

export const closetService = {
  /**
   * Get items grouped by category group
   */
  async getItemsByGroup(userId) {
    const { data, error } = await supabase
      .from('clothes')
      .select('*')
      .eq('owner_id', userId)
      .is('removed_at', null)

    if (error) throw error

    // Group items by simple category
    const grouped = {
      top: [],
      bottom: [],
      outerwear: [],
      shoes: [],
      accessory: [],
      dress: [],
      other: []
    }

    data.forEach(item => {
      const group = getCategoryGroup(item.category)
      grouped[group].push(item)
    })

    return grouped
  },

  /**
   * Check if user has outfit-ready items
   */
  async hasOutfitItems(userId) {
    const grouped = await this.getItemsByGroup(userId)
    return grouped.top.length > 0 && 
           grouped.bottom.length > 0 && 
           grouped.shoes.length > 0
  }
}
```

---

## Outfit Generation Integration

### Algorithm Usage
```js
// src/services/outfit-generation-service.js
import { getCategoryGroup } from '@/config/constants'

export function generateOutfits(items, options = {}) {
  // Group items by simple category for algorithm
  const grouped = {}
  items.forEach(item => {
    const group = getCategoryGroup(item.category)
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(item)
  })

  // Generate combinations: 1 top + 1 bottom + 1 shoes
  const outfits = []
  
  for (const top of grouped.top || []) {
    for (const bottom of grouped.bottom || []) {
      for (const shoes of grouped.shoes || []) {
        const outfit = [top, bottom, shoes]
        
        // Optional: add outerwear if cold weather
        if (options.weather === 'cold' && grouped.outerwear?.length) {
          grouped.outerwear.forEach(outer => {
            outfits.push([...outfit, outer])
          })
        }
        
        // Base outfit without outerwear
        outfits.push(outfit)
      }
    }
  }

  return outfits
}
```

---

## Migration Guide

### From Simple to Detailed Categories
```sql
-- Backup existing data
CREATE TABLE clothes_backup AS SELECT * FROM clothes;

-- Update T-Shirts
UPDATE clothes 
SET category = 't-shirt' 
WHERE category = 'top' 
AND (name ILIKE '%t-shirt%' OR name ILIKE '%tee%');

-- Update Hoodies
UPDATE clothes 
SET category = 'hoodie' 
WHERE category = 'top' 
AND (name ILIKE '%hoodie%' OR name ILIKE '%sweatshirt%');

-- Update Shirts
UPDATE clothes 
SET category = 'shirt' 
WHERE category = 'top' 
AND (name ILIKE '%shirt%' AND name NOT ILIKE '%t-shirt%');

-- Continue for other categories...

-- Verify migration
SELECT 
  category,
  get_category_group(category) as group,
  COUNT(*) 
FROM clothes 
GROUP BY category, group;
```

---

## Validation

### Frontend Validation
```js
import { isValidCategory, CATEGORY_VALUES } from '@/config/constants'

// In form submission
function validateItem(item) {
  const errors = {}

  if (!item.category) {
    errors.category = 'Category is required'
  } else if (!isValidCategory(item.category)) {
    errors.category = `Invalid category. Must be one of: ${CATEGORY_VALUES.join(', ')}`
  }

  return errors
}
```

### Database Constraint
```sql
-- In SQL migration
ALTER TABLE clothes 
ADD CONSTRAINT check_category 
CHECK (category IN (
  'blouse', 'body', 'hoodie', 'longsleeve', 'polo', 
  'shirt', 't-shirt', 'top', 'undershirt',
  'pants', 'shorts', 'skirt',
  'blazer', 'outerwear',
  'shoes', 'hat', 'dress',
  'not-sure', 'other', 'skip'
));
```

---

## Best Practices

### DO
✅ Use constants from `@/config/constants`  
✅ Use helper functions (`getCategoryGroup`, `getCategoryLabel`)  
✅ Validate categories before database operations  
✅ Support both detailed and simple categories  
✅ Use functional indexes for group queries  

### DON'T
❌ Hardcode category arrays  
❌ Manually map categories to groups  
❌ Assume case-insensitive categories  
❌ Skip validation  
❌ Use `category LIKE 'top%'` queries  

---

## FAQ

**Q: Are simple categories still supported?**  
A: Yes! `'top'`, `'bottom'`, etc. are still valid.

**Q: How do I add new categories?**  
A: 
1. Add to `CLOTHING_CATEGORIES` in constants.js
2. Update SQL constraint in migration
3. Update `get_category_group()` function
4. Run tests

**Q: Are categories case-sensitive?**  
A: Yes. Use lowercase with hyphens: `'t-shirt'` not `'T-Shirt'`.

**Q: Can outfits have multiple items per category?**  
A: No. Outfit generation requires exactly 1 per group (1 top, 1 bottom, 1 shoes).

**Q: How do dresses work in outfits?**  
A: Dresses count as both top and bottom, so they can be standalone outfits with just shoes.

---

## Related Files
- `src/config/constants.js` - Category definitions
- `sql/009_enhanced_categories.sql` - Database migration
- `src/services/outfit-generation-service.js` - Outfit algorithm
- `DATABASE_GUIDE.md` - Complete database setup and schema

---

## Status: COMPLETE ✅
All category systems implemented and documented!
