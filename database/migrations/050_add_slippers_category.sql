-- Migration 050: Add Slippers Category
-- Adds 'slippers' as a new clothing category that maps to 'shoes' group
-- This file is re-runnable - safe to execute multiple times

BEGIN;

-- ============================================
-- UPDATE CATEGORY CONSTRAINTS
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
-- UPDATE CATEGORY GROUP FUNCTION
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
    
    -- Shoes group
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

COMMIT;

-- ============================================
-- MIGRATION NOTES
-- ============================================

/*
Migration 050: Add Slippers Category

Purpose:
  - Adds 'slippers' as a new clothing category
  - Maps slippers to 'shoes' category group for outfit generation
  - Maintains backward compatibility with existing categories

Changes:
  1. Added 'slippers' to category constraints on clothes and catalog_items tables
  2. Updated get_category_group() function to map 'slippers' to 'shoes' group
  3. Slippers are now treated as footwear in outfit generation logic

Usage:
  - Frontend: 'slippers' option available in clothing type selection
  - Backend: Category validation allows 'slippers' value
  - Outfit Generation: Slippers count as shoes for completeness scoring
*/

