-- Migration 043: Fix Category Constraint for Manual Upload
-- This migration updates the clothes_category_check constraint to allow both
-- the old simple categories (used by manual upload) and new detailed categories

BEGIN;

-- ============================================
-- 1. DROP EXISTING CONSTRAINT
-- ============================================

-- Drop the existing constraint that only allows detailed categories
ALTER TABLE clothes DROP CONSTRAINT IF EXISTS clothes_category_check;

-- ============================================
-- 2. CREATE UPDATED CONSTRAINT WITH BOTH CATEGORY SYSTEMS
-- ============================================

-- Add new constraint that allows both old simple categories and new detailed categories
ALTER TABLE clothes 
  ADD CONSTRAINT clothes_category_check 
  CHECK (category IN (
    -- Old simple categories (used by manual upload form)
    'top',
    'bottom', 
    'outerwear',
    'shoes',
    'accessory',
    -- New detailed categories (used by catalog and enhanced features)
    'blazer',
    'blouse', 
    'body',
    'dress',
    'hat',
    'hoodie',
    'longsleeve',
    'not-sure',
    'other',
    'pants',
    'polo',
    'shirt',
    'shorts',
    'skip',
    'skirt',
    't-shirt',
    'undershirt'
  ));

-- ============================================
-- 3. UPDATE CATALOG_ITEMS CONSTRAINT AS WELL
-- ============================================

-- Drop existing constraint on catalog_items if it exists
ALTER TABLE catalog_items DROP CONSTRAINT IF EXISTS catalog_items_category_check;

-- Add updated constraint to catalog_items table
ALTER TABLE catalog_items 
  ADD CONSTRAINT catalog_items_category_check 
  CHECK (category IN (
    -- Old simple categories
    'top',
    'bottom', 
    'outerwear',
    'shoes',
    'accessory',
    -- New detailed categories
    'blazer',
    'blouse', 
    'body',
    'dress',
    'hat',
    'hoodie',
    'longsleeve',
    'not-sure',
    'other',
    'pants',
    'polo',
    'shirt',
    'shorts',
    'skip',
    'skirt',
    't-shirt',
    'undershirt'
  ));

-- ============================================
-- 4. VERIFY CONSTRAINTS WERE CREATED
-- ============================================

-- Check that constraints were created successfully
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_name IN ('clothes_category_check', 'catalog_items_category_check')
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================

-- After running this migration, test with:
-- INSERT INTO clothes (owner_id, name, category, image_url) 
-- VALUES ('user-uuid', 'Test Item', 'top', 'https://example.com/image.jpg');

-- INSERT INTO clothes (owner_id, name, category, image_url) 
-- VALUES ('user-uuid', 'Test Item', 'shirt', 'https://example.com/image.jpg');
