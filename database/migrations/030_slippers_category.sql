-- ============================================
-- Migration 030: Add Slippers Category and Clothing Type
-- ============================================
-- Purpose: Adds 'slippers' as a new clothing category and 'Slippers' as a clothing type
--          Maps slippers to 'shoes' category group for outfit generation
-- Dependencies: 001_initial_schema.sql, 005_catalog_system.sql, 013_clothing_types_categories.sql
-- Creates: None
-- Modifies:
--   - clothes table (category constraint, clothing_type constraint)
--   - catalog_items table (category constraint, clothing_type constraint)
--   - get_category_group() function (adds slippers mapping)
--   - get_category_from_clothing_type() function (adds Slippers mapping)
-- 
-- IMPORTANT: Run migrations in sequential order!
-- ============================================

-- This file is re-runnable - safe to execute multiple times

BEGIN;

-- ============================================
-- STEP 1: UPDATE CATEGORY CONSTRAINTS
-- ============================================

-- Drop existing constraints
ALTER TABLE clothes DROP CONSTRAINT IF EXISTS clothes_category_check;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'catalog_items') THEN
    ALTER TABLE catalog_items DROP CONSTRAINT IF EXISTS catalog_items_category_check;
  END IF;
END $$;

-- Add 'slippers' to clothes table constraint
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
    'slippers',
    't-shirt',
    'top',
    'undershirt'
  ));

-- Add 'slippers' to catalog_items table constraint if it exists
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
        'slippers',
        't-shirt',
        'top',
        'undershirt'
      ));
  END IF;
END $$;

-- ============================================
-- STEP 2: UPDATE CLOTHING_TYPE CONSTRAINTS
-- ============================================

-- Drop existing clothing_type constraints
ALTER TABLE clothes DROP CONSTRAINT IF EXISTS clothes_clothing_type_check;

-- Recreate constraint with Slippers included
ALTER TABLE clothes 
  ADD CONSTRAINT clothes_clothing_type_check 
  CHECK (
    clothing_type IS NULL OR
    clothing_type IN (
      'Blazer', 'Blouse', 'Body', 'Dress', 'Hat', 'Hoodie', 
      'Longsleeve', 'Not sure', 'Other', 'Outwear', 'Pants', 
      'Polo', 'Shirt', 'Shoes', 'Shorts', 'Skip', 'Skirt', 
      'Slippers', 'T-Shirt', 'Top', 'Undershirt'
    )
  );

-- Update clothing_type constraint on catalog_items if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'catalog_items'
  ) THEN
    ALTER TABLE catalog_items DROP CONSTRAINT IF EXISTS catalog_items_clothing_type_check;
    
    ALTER TABLE catalog_items 
      ADD CONSTRAINT catalog_items_clothing_type_check 
      CHECK (
        clothing_type IS NULL OR
        clothing_type IN (
          'Blazer', 'Blouse', 'Body', 'Dress', 'Hat', 'Hoodie', 
          'Longsleeve', 'Not sure', 'Other', 'Outwear', 'Pants', 
          'Polo', 'Shirt', 'Shoes', 'Shorts', 'Skip', 'Skirt', 
          'Slippers', 'T-Shirt', 'Top', 'Undershirt'
        )
      );
  END IF;
END $$;

-- ============================================
-- STEP 3: UPDATE HELPER FUNCTIONS
-- ============================================

-- Update get_category_group function to include slippers mapping to 'shoes'
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
    
    -- Shoes group (includes slippers)
    WHEN 'shoes' THEN 'shoes'
    WHEN 'slippers' THEN 'shoes'
    
    -- Accessory group
    WHEN 'hat' THEN 'accessory'
    
    -- Dress group (standalone)
    WHEN 'dress' THEN 'dress'
    
    -- Other
    ELSE 'other'
  END;
END;
$$;

-- Update get_category_from_clothing_type function to include Slippers mapping
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
    WHEN 'Slippers' THEN 'shoes'
    WHEN 'T-Shirt' THEN 'top'
    WHEN 'Top' THEN 'top'
    WHEN 'Undershirt' THEN 'top'
    ELSE 'top'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMIT;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION get_category_group IS 'Maps detailed categories to simple category groups. Maps slippers to shoes group.';

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify constraints were updated
DO $$
DECLARE
  category_check_exists BOOLEAN;
  clothing_type_check_exists BOOLEAN;
BEGIN
  -- Check category constraint includes slippers
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'clothes_category_check'
    AND pg_get_constraintdef(oid) LIKE '%slippers%'
  ) INTO category_check_exists;
  
  IF category_check_exists THEN
    RAISE NOTICE '✅ Category constraint includes slippers';
  ELSE
    RAISE WARNING '⚠️ Category constraint may not include slippers';
  END IF;
  
  -- Check clothing_type constraint includes Slippers
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'clothes_clothing_type_check'
    AND pg_get_constraintdef(oid) LIKE '%Slippers%'
  ) INTO clothing_type_check_exists;
  
  IF clothing_type_check_exists THEN
    RAISE NOTICE '✅ Clothing type constraint includes Slippers';
  ELSE
    RAISE WARNING '⚠️ Clothing type constraint may not include Slippers';
  END IF;
END $$;

-- Test helper functions
DO $$
BEGIN
  RAISE NOTICE 'Testing helper functions:';
  RAISE NOTICE '  get_category_group(slippers) -> %', get_category_group('slippers');
  RAISE NOTICE '  get_category_from_clothing_type(Slippers) -> %', get_category_from_clothing_type('Slippers');
END $$;

