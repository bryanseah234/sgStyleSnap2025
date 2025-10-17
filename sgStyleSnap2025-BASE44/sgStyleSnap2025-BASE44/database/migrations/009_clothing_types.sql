-- Migration 009: Add Clothing Types Field
-- Adds granular clothing_type field to clothes table for detailed filtering
-- This file is re-runnable - safe to execute multiple times

-- ============================================
-- ADD CLOTHING_TYPE COLUMN
-- ============================================

-- Add clothing_type column if it doesn't exist
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

-- ============================================
-- CREATE INDEX FOR CLOTHING_TYPE
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

-- ============================================
-- UPDATE EXISTING DATA (Optional)
-- ============================================

-- Optionally set default clothing_type based on category
-- This helps with existing data migration
-- Users can update their items with more specific types later

-- COMMENT: Uncomment below to set defaults for existing items
/*
UPDATE clothes 
SET clothing_type = CASE 
  WHEN category = 'top' THEN 'Top'
  WHEN category = 'bottom' THEN 'Pants'
  WHEN category = 'outerwear' THEN 'Outwear'
  WHEN category = 'shoes' THEN 'Shoes'
  WHEN category = 'accessory' THEN 'Other'
  ELSE 'Not sure'
END
WHERE clothing_type IS NULL;
*/

-- ============================================
-- UPDATE CATALOG_ITEMS (if exists)
-- ============================================

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
    
    -- Create index if not exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_catalog_clothing_type'
    ) THEN
      CREATE INDEX idx_catalog_clothing_type ON catalog_items(clothing_type);
    END IF;
  END IF;
END $$;

-- ============================================
-- HELPER FUNCTION: Get Category from Clothing Type
-- ============================================

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
-- TRIGGER: Auto-set Category from Clothing Type
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
DO $$
BEGIN
  DROP TRIGGER IF EXISTS set_category_from_type_trigger ON clothes;
EXCEPTION WHEN undefined_object THEN
  NULL;
END $$;

-- Create trigger
CREATE TRIGGER set_category_from_type_trigger
  BEFORE INSERT OR UPDATE ON clothes
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_category_from_type();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN clothes.clothing_type IS 'Granular clothing type for detailed filtering (Blazer, T-Shirt, etc.)';
COMMENT ON COLUMN clothes.category IS 'Broad category for outfit generation (top, bottom, outerwear, shoes, accessory)';
COMMENT ON FUNCTION get_category_from_clothing_type IS 'Helper function to map clothing_type to category';
COMMENT ON TRIGGER set_category_from_type_trigger ON clothes IS 'Auto-sets category when clothing_type is provided';

-- ============================================
-- VERIFICATION QUERIES
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

-- Test the helper function
DO $$
BEGIN
  RAISE NOTICE 'Testing get_category_from_clothing_type:';
  RAISE NOTICE '  T-Shirt -> %', get_category_from_clothing_type('T-Shirt');
  RAISE NOTICE '  Pants -> %', get_category_from_clothing_type('Pants');
  RAISE NOTICE '  Blazer -> %', get_category_from_clothing_type('Blazer');
  RAISE NOTICE '  Shoes -> %', get_category_from_clothing_type('Shoes');
  RAISE NOTICE '  Hat -> %', get_category_from_clothing_type('Hat');
END $$;
