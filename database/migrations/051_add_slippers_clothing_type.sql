-- Migration 051: Add Slippers to Clothing Type Constraint
-- Adds 'Slippers' to the clothing_type check constraint
-- This file is re-runnable - safe to execute multiple times

BEGIN;

-- ============================================
-- UPDATE CLOTHING_TYPE CONSTRAINT ON CLOTHES
-- ============================================

-- Drop existing constraint
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

-- ============================================
-- UPDATE CLOTHING_TYPE CONSTRAINT ON CATALOG_ITEMS
-- ============================================

-- Drop existing constraint on catalog_items if it exists
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
-- UPDATE HELPER FUNCTION
-- ============================================

-- Update the function to include Slippers mapping
CREATE OR REPLACE FUNCTION get_category_from_clothing_type(p_clothing_type VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  RETURN CASE p_clothing_type
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
-- MIGRATION NOTES
-- ============================================

/*
Migration 051: Add Slippers to Clothing Type Constraint

Purpose:
  - Adds 'Slippers' to the clothing_type check constraint
  - Updates helper function to map Slippers to 'shoes' category

Changes:
  1. Updated clothes_clothing_type_check constraint to include 'Slippers'
  2. Updated catalog_items_clothing_type_check constraint (if table exists)
  3. Updated get_category_from_clothing_type function to map Slippers to 'shoes'

Testing:
  - Insert item with clothing_type = 'Slippers' should succeed
  - Category should auto-set to 'shoes' when clothing_type is 'Slippers'
*/

