-- ============================================
-- Migration 013: Clothing Types and Enhanced Categories
-- ============================================
-- Purpose: Adds granular clothing_type field and updates category constraints to support detailed categories
-- Dependencies: 001_initial_schema.sql, 005_catalog_system.sql
-- Creates: 
--   - clothing_type column on clothes and catalog_items tables
--   - get_category_from_clothing_type() function
--   - get_category_group() function
--   - category_distribution view
-- Modifies:
--   - clothes table (adds clothing_type column, updates category constraint)
--   - catalog_items table (adds clothing_type column, updates category constraint)
-- 
-- IMPORTANT: Run migrations in sequential order!
-- ============================================

-- This file is re-runnable - safe to execute multiple times

-- ============================================
-- STEP 1: DROP EXISTING CATEGORY CONSTRAINTS
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
-- STEP 2: ADD ENHANCED CATEGORY CONSTRAINTS
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
-- STEP 3: ADD CLOTHING_TYPE COLUMN
-- ============================================

-- Add clothing_type column to clothes table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clothes' AND column_name = 'clothing_type'
  ) THEN
    ALTER TABLE clothes 
    ADD COLUMN clothing_type VARCHAR(50) CHECK (
      clothing_type IN (
        'Blazer', 'Blouse', 'Body', 'Dress', 'Hat', 'Hoodie', 
        'Longsleeve', 'Not sure', 'Other', 'Outwear', 'Pants', 
        'Polo', 'Shirt', 'Shoes', 'Shorts', 'Skip', 'Skirt', 
        'T-Shirt', 'Top', 'Undershirt'
      )
    );
  END IF;
END $$;

-- Add clothing_type to catalog_items table if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'catalog_items'
  ) THEN
    -- Add column if not exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'catalog_items' AND column_name = 'clothing_type'
    ) THEN
      ALTER TABLE catalog_items 
      ADD COLUMN clothing_type VARCHAR(50) CHECK (
        clothing_type IN (
          'Blazer', 'Blouse', 'Body', 'Dress', 'Hat', 'Hoodie', 
          'Longsleeve', 'Not sure', 'Other', 'Outwear', 'Pants', 
          'Polo', 'Shirt', 'Shoes', 'Shorts', 'Skip', 'Skirt', 
          'T-Shirt', 'Top', 'Undershirt'
        )
      );
    END IF;
  END IF;
END $$;

-- ============================================
-- STEP 4: CREATE INDEXES
-- ============================================

-- Create index for fast filtering by clothing_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_clothes_clothing_type'
  ) THEN
    CREATE INDEX idx_clothes_clothing_type ON clothes(clothing_type);
  END IF;
END $$;

-- Create index for catalog_items clothing_type if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'catalog_items') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_catalog_clothing_type'
    ) THEN
      CREATE INDEX idx_catalog_clothing_type ON catalog_items(clothing_type);
    END IF;
  END IF;
END $$;

-- Create functional index for category group lookups
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
-- STEP 5: CREATE HELPER FUNCTIONS
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

-- Function to automatically derive category from clothing_type
CREATE OR REPLACE FUNCTION get_category_from_clothing_type(p_clothing_type VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  RETURN CASE p_clothing_type
    WHEN 'Blazer' THEN 'outerwear'
    WHEN 'Blouse' THEN 'top'
    WHEN 'Body' THEN 'top'
    WHEN 'Dress' THEN 'top'
    WHEN 'Hat' THEN 'accessory'
    WHEN 'Hoodie' THEN 'outerwear'
    WHEN 'Longsleeve' THEN 'top'
    WHEN 'Not sure' THEN 'top'
    WHEN 'Other' THEN 'accessory'
    WHEN 'Outwear' THEN 'outerwear'
    WHEN 'Pants' THEN 'bottom'
    WHEN 'Polo' THEN 'top'
    WHEN 'Shirt' THEN 'top'
    WHEN 'Shoes' THEN 'shoes'
    WHEN 'Shorts' THEN 'bottom'
    WHEN 'Skip' THEN 'top'
    WHEN 'Skirt' THEN 'bottom'
    WHEN 'T-Shirt' THEN 'top'
    WHEN 'Top' THEN 'top'
    WHEN 'Undershirt' THEN 'top'
    ELSE 'top'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- STEP 6: CREATE TRIGGER
-- ============================================

-- Trigger function to auto-set category based on clothing_type
CREATE OR REPLACE FUNCTION auto_set_category_from_type()
RETURNS TRIGGER AS $$
BEGIN
  -- If clothing_type is provided but category is not, auto-set category
  IF NEW.clothing_type IS NOT NULL AND NEW.category IS NULL THEN
    NEW.category := get_category_from_clothing_type(NEW.clothing_type);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS set_category_from_type_trigger ON clothes;

-- Create trigger
CREATE TRIGGER set_category_from_type_trigger
  BEFORE INSERT OR UPDATE ON clothes
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_category_from_type();

-- ============================================
-- STEP 7: CREATE ANALYTICS VIEW
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
-- STEP 8: COMMENTS
-- ============================================

COMMENT ON COLUMN clothes.clothing_type IS 'Granular clothing type for detailed filtering (Blazer, T-Shirt, etc.)';
COMMENT ON COLUMN clothes.category IS 'Broad category for outfit generation (top, bottom, outerwear, shoes, accessory)';
COMMENT ON FUNCTION get_category_from_clothing_type IS 'Helper function to map clothing_type to category';
COMMENT ON FUNCTION get_category_group IS 'Maps detailed categories to simple category groups for outfit generation compatibility';
COMMENT ON TRIGGER set_category_from_type_trigger ON clothes IS 'Auto-sets category when clothing_type is provided';
COMMENT ON VIEW category_distribution IS 'Shows distribution of detailed categories with grouping information';

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify column was added
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clothes' AND column_name = 'clothing_type'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE 'SUCCESS: clothing_type column added to clothes table';
  ELSE
    RAISE WARNING 'WARNING: clothing_type column not found in clothes table';
  END IF;
END $$;

-- Verify index was created
DO $$
DECLARE
  index_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_clothes_clothing_type'
  ) INTO index_exists;
  
  IF index_exists THEN
    RAISE NOTICE 'SUCCESS: Index idx_clothes_clothing_type created';
  ELSE
    RAISE WARNING 'WARNING: Index idx_clothes_clothing_type not found';
  END IF;
END $$;

-- Test the helper functions
DO $$
BEGIN
  RAISE NOTICE 'Testing helper functions:';
  RAISE NOTICE '  get_category_from_clothing_type(T-Shirt) -> %', get_category_from_clothing_type('T-Shirt');
  RAISE NOTICE '  get_category_from_clothing_type(Pants) -> %', get_category_from_clothing_type('Pants');
  RAISE NOTICE '  get_category_group(t-shirt) -> %', get_category_group('t-shirt');
  RAISE NOTICE '  get_category_group(pants) -> %', get_category_group('pants');
END $$;

