# Category System Guide - StyleSnap

## Overview

StyleSnap uses a two-tier category system that provides both detailed categorization and simple grouping for algorithms and analytics.

## Category Hierarchy

### Detailed Categories (20 total)

These are the user-facing categories that provide precise classification:

#### Top Group (9 categories)
- **Blouse** - Formal or casual shirts with feminine styling
- **Body** - Form-fitting one-piece tops (bodysuits)
- **Hoodie** - Hooded sweatshirts
- **Longsleeve** - Long-sleeve shirts (general)
- **Polo** - Polo shirts with collars
- **Shirt** - Button-up or casual shirts
- **T-Shirt** - Short-sleeve casual tops
- **Top** - General tops that don't fit other categories
- **Undershirt** - Base layer shirts

#### Bottom Group (3 categories)
- **Pants** - Full-length pants (jeans, trousers, etc.)
- **Shorts** - Short pants
- **Skirt** - Skirts of any length

#### Outerwear Group (2 categories)
- **Blazer** - Formal jackets
- **Outerwear** - Jackets, coats, and outer layers

#### Shoes Group (1 category)
- **Shoes** - All footwear

#### Accessory Group (1 category)
- **Hat** - Headwear accessories

#### Dress Group (1 category)
- **Dress** - One-piece dresses (can be both top and bottom)

#### Other Group (3 categories)
- **Not sure** - When user is uncertain about category
- **Other** - Items that don't fit standard categories
- **Skip** - Placeholder for categorization later

## Simple Category Groups

For backward compatibility and algorithmic purposes, all detailed categories map to 7 simple groups:

1. **top** - Upper body clothing
2. **bottom** - Lower body clothing
3. **outerwear** - Outer layers
4. **shoes** - Footwear
5. **accessory** - Accessories
6. **dress** - Dresses
7. **other** - Miscellaneous

## Usage

### Frontend (Vue Components)

```javascript
import { 
  CLOTHING_CATEGORIES, 
  CATEGORY_GROUPS,
  getCategoryLabel,
  getCategoryGroup 
} from '@/config/constants'

// Display all categories in a select
<select v-model="category">
  <optgroup
    v-for="(items, group) in CATEGORY_GROUPS"
    :key="group"
    :label="group"
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

// Get category label
const label = getCategoryLabel('t-shirt') // Returns "T-Shirt"

// Get category group
const group = getCategoryGroup('hoodie') // Returns "top"
```

### Backend (SQL)

```sql
-- Get all items in the "top" group
SELECT * FROM clothes
WHERE get_category_group(category) = 'top';

-- Category distribution analytics
SELECT * FROM category_distribution
ORDER BY total_items DESC;

-- Filter by specific category
SELECT * FROM clothes
WHERE category = 'hoodie'
AND removed_at IS NULL;
```

### API (Services)

```javascript
import catalogService from '@/services/catalog-service'

// Browse catalog by category
const { items } = await catalogService.browse({
  category: 'hoodie',
  page: 1,
  limit: 20
})

// Search with category filter
const results = await catalogService.search({
  q: 'blue',
  category: 't-shirt'
})
```

## Category Selection Guidelines

### For Users

**Choose "T-Shirt" when:**
- Short-sleeve casual tops
- Basic tees
- Graphic tees

**Choose "Shirt" when:**
- Button-up shirts
- Dress shirts
- Casual button-downs

**Choose "Top" when:**
- Tank tops
- Camisoles
- Sweaters
- Cardigans
- Any tops that don't fit other categories

**Choose "Blouse" when:**
- Feminine styled shirts
- Formal tops
- Professional tops with details

**Choose "Hoodie" when:**
- Any sweatshirt with a hood
- Zip-up or pullover hoodies

**Choose "Longsleeve" when:**
- Long-sleeve shirts that aren't formal
- Long-sleeve tees
- Thermal shirts

**Choose "Polo" when:**
- Collared polo shirts
- Golf shirts

**Choose "Body" when:**
- Bodysuits
- Leotards
- Form-fitting one-piece tops

**Choose "Undershirt" when:**
- Base layers
- Undershirts
- Tank tops worn under other clothes

**Choose "Not sure" when:**
- You're uncertain about the category
- You want to categorize it later

**Choose "Skip" when:**
- Temporary placeholder
- Will categorize during review

## Migration from Simple Categories

If you have existing data with simple categories, no migration is needed! The simple categories are still valid:

**Existing "top" items:**
- Remain valid
- Can optionally be recategorized to specific types (t-shirt, hoodie, etc.)
- Will show as "Top" in the UI

**To migrate data:**
```sql
-- Example: Update generic "top" items to specific categories
UPDATE clothes 
SET category = 't-shirt' 
WHERE category = 'top' 
AND name ILIKE '%t-shirt%';

UPDATE clothes 
SET category = 'hoodie' 
WHERE category = 'top' 
AND name ILIKE '%hoodie%';

-- Continue for other patterns...
```

## Outfit Generation Compatibility

The outfit generation algorithm uses simple category groups:

```javascript
// Algorithm still works with simple groups
const outfit = {
  top: getItem('top'),      // Can be any: t-shirt, hoodie, shirt, etc.
  bottom: getItem('bottom'), // Can be any: pants, shorts, skirt
  shoes: getItem('shoes')
}

// Internally uses get_category_group() to handle both systems
```

## Best Practices

### For Developers

1. **Always use constants:**
   ```javascript
   import { CLOTHING_CATEGORIES } from '@/config/constants'
   // Good: CLOTHING_CATEGORIES
   // Bad: hardcoded array
   ```

2. **Use helper functions:**
   ```javascript
   import { getCategoryLabel, getCategoryGroup } from '@/config/constants'
   // Good: getCategoryLabel(category)
   // Bad: manual lookup
   ```

3. **Support both systems:**
   ```javascript
   // Filter can accept detailed or simple categories
   const items = clothes.filter(item => 
     getCategoryGroup(item.category) === targetGroup
   )
   ```

4. **Validate categories:**
   ```javascript
   import { CATEGORY_VALUES } from '@/config/constants'
   if (!CATEGORY_VALUES.includes(category)) {
     throw new Error('Invalid category')
   }
   ```

### For Database Queries

1. **Use the function for grouping:**
   ```sql
   SELECT get_category_group(category) as group, COUNT(*)
   FROM clothes
   GROUP BY group;
   ```

2. **Use indexes:**
   ```sql
   -- Uses functional index
   SELECT * FROM clothes
   WHERE get_category_group(category) = 'top';
   ```

3. **Use the view for analytics:**
   ```sql
   SELECT * FROM category_distribution
   WHERE category_group = 'top';
   ```

## FAQ

**Q: Can I still use simple categories like "top"?**
A: Yes! They remain valid and work everywhere.

**Q: What if I don't know the exact category?**
A: Use "Not sure" or the simple category (e.g., "top").

**Q: Can I add new categories?**
A: Yes, but requires:
1. Adding to constants.js
2. Updating SQL constraint in Migration 009
3. Updating get_category_group() function

**Q: How do I filter by multiple categories?**
A: Use the category group or multiple WHERE conditions:
```sql
WHERE category IN ('t-shirt', 'hoodie', 'shirt')
-- OR
WHERE get_category_group(category) = 'top'
```

**Q: Are the categories case-sensitive?**
A: Yes, use lowercase with hyphens: `'t-shirt'` not `'T-Shirt'`

**Q: What about future categories?**
A: The system is extensible. Add to CLOTHING_CATEGORIES and update SQL constraint.

## Related Files

- `src/config/constants.js` - Category definitions
- `sql/009_enhanced_categories.sql` - SQL migration
- `DATABASE_SETUP.md` - Migration documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
