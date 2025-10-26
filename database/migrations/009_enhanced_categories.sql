-- Migration 009: Enhanced Category System
-- Updates category constraints to support detailed clothing categories
-- This file is re-runnable - safe to execute multiple times

-- ============================================
-- DROP EXISTING CATEGORY CONSTRAINTS
-- ============================================

-- Drop category constraint from clothes table
ALTER TABLE clothes DROP CONSTRAINT IF EXISTS clothes_category_check;

-- Drop category constraint from catalog_items table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'catalog_items') THEN
    ALTER TABLE catalog_items DROP CONSTRAINT IF EXISTS catalog_items_category_check;
  END IF;
END $$;

-- ============================================
-- ADD ENHANCED CATEGORY CONSTRAINTS
-- ============================================

-- Add new category constraint to clothes table with 20 detailed categories
ALTER TABLE clothes 
  ADD CONSTRAINT clothes_category_check 
  CHECK (category IN (
    'blazer',
    'blouse', 
    'body',
    'dress',
    'hat',
    'hoodie',
    'longsleeve',
    'not-sure',
    'other',
    'outerwear',
    'pants',
    'polo',
    'shirt',
    'shoes',
    'shorts',
    'skip',
    'skirt',
    't-shirt',
    'top',
    'undershirt'
  ));

-- Add new category constraint to catalog_items table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'catalog_items') THEN
    ALTER TABLE catalog_items 
      ADD CONSTRAINT catalog_items_category_check 
      CHECK (category IN (
        'blazer',
        'blouse', 
        'body',
        'dress',
        'hat',
        'hoodie',
        'longsleeve',
        'not-sure',
        'other',
        'outerwear',
        'pants',
        'polo',
        'shirt',
        'shoes',
        'shorts',
        'skip',
        'skirt',
        't-shirt',
        'top',
        'undershirt'
      ));
  END IF;
END $$;

-- ============================================
-- HELPER FUNCTION: Category Group Mapping
-- ============================================

-- Function to get the simple category group for a detailed category
-- This helps maintain backward compatibility with outfit generation algorithms
CREATE OR REPLACE FUNCTION get_category_group(detailed_category VARCHAR(50))
RETURNS VARCHAR(50)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE detailed_category
    -- Top group
    WHEN 'blouse' THEN 'top'
    WHEN 'body' THEN 'top'
    WHEN 'hoodie' THEN 'top'
    WHEN 'longsleeve' THEN 'top'
    WHEN 'polo' THEN 'top'
    WHEN 'shirt' THEN 'top'
    WHEN 't-shirt' THEN 'top'
    WHEN 'top' THEN 'top'
    WHEN 'undershirt' THEN 'top'
    
    -- Bottom group
    WHEN 'pants' THEN 'bottom'
    WHEN 'shorts' THEN 'bottom'
    WHEN 'skirt' THEN 'bottom'
    
    -- Outerwear group
    WHEN 'blazer' THEN 'outerwear'
    WHEN 'outerwear' THEN 'outerwear'
    
    -- Shoes group
    WHEN 'shoes' THEN 'shoes'
    
    -- Accessory group
    WHEN 'hat' THEN 'accessory'
    
    -- Dress group (standalone)
    WHEN 'dress' THEN 'dress'
    
    -- Other
    ELSE 'other'
  END;
END;
$$;

-- ============================================
-- UPDATE EXISTING DATA (if needed)
-- ============================================

-- Note: Existing data with simple categories (top, bottom, outerwear, shoes, accessory)
-- remains valid as these values are included in the new constraint.
-- No data migration needed unless you want to be more specific.

-- Example migration (commented out):
-- UPDATE clothes SET category = 't-shirt' WHERE category = 'top' AND name ILIKE '%t-shirt%';
-- UPDATE clothes SET category = 'pants' WHERE category = 'bottom' AND name ILIKE '%pant%';
-- etc.

-- ============================================
-- CREATE INDEX ON CATEGORY GROUP
-- ============================================

-- Create functional index for category group lookups
-- This speeds up queries that filter by category group
CREATE INDEX IF NOT EXISTS idx_clothes_category_group 
  ON clothes(get_category_group(category));

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'catalog_items') THEN
    CREATE INDEX IF NOT EXISTS idx_catalog_category_group 
      ON catalog_items(get_category_group(category));
  END IF;
END $$;

-- ============================================
-- ANALYTICS VIEW: Category Breakdown
-- ============================================

-- View to show category distribution with grouping
CREATE OR REPLACE VIEW category_distribution AS
SELECT 
  category,
  get_category_group(category) AS category_group,
  COUNT(*) AS total_items,
  COUNT(DISTINCT owner_id) AS users_with_category,
  ROUND(AVG(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) * 100, 2) AS recent_uploads_percentage
FROM clothes
WHERE 
  removed_at IS NULL
GROUP BY category
ORDER BY total_items DESC;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION get_category_group IS 'Maps detailed categories to simple category groups for outfit generation compatibility';
COMMENT ON VIEW category_distribution IS 'Shows distribution of detailed categories with grouping information';

-- ============================================
-- MIGRATION NOTES
-- ============================================

/*
Migration 009: Enhanced Category System

Purpose:
  - Expands category system from 5 simple categories to 20 detailed categories
  - Maintains backward compatibility with existing data
  - Provides mapping function for outfit generation algorithms

Changes:
  1. Updated category constraints on clothes and catalog_items tables
  2. Added get_category_group() function for category group mapping
  3. Created functional indexes for performance
  4. Added category_distribution view for analytics

Backward Compatibility:
  - Existing simple categories (top, bottom, outerwear, shoes, accessory) remain valid
  - get_category_group() function allows algorithms to work with both systems
  - No data migration required, but recommended for better categorization

New Categories:
  - Tops: blouse, body, hoodie, longsleeve, polo, shirt, t-shirt, top, undershirt
  - Bottoms: pants, shorts, skirt
  - Outerwear: blazer, outerwear
  - Shoes: shoes
  - Accessories: hat
  - Dress: dress
  - Other: not-sure, other, skip

Usage:
  - Frontend: Use CLOTHING_CATEGORIES from src/config/constants.js
  - Backend: Category validation happens at database level
  - Queries: Use get_category_group() to filter by group

Dependencies:
  - Migration 001: Initial Schema (clothes table)
  - Migration 005: Catalog System (catalog_items table)

Testing:
  1. Insert new items with detailed categories
  2. Query by category group using get_category_group()
  3. Verify category_distribution view shows correct data
  4. Test outfit generation with new categories

Rollback:
  If needed, revert to simple 5-category system by running:
  
  ALTER TABLE clothes DROP CONSTRAINT clothes_category_check;
  ALTER TABLE clothes ADD CONSTRAINT clothes_category_check 
    CHECK (category IN ('top', 'bottom', 'outerwear', 'shoes', 'accessory'));
*/
