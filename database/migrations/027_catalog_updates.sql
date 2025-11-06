-- ============================================
-- Migration 027: Catalog Updates and Fixes
-- ============================================
-- Purpose: Comprehensive fixes for catalog system including exclusion logic, constraints, and functions
-- Dependencies: 005_catalog_system.sql, 011_catalog_enhancements.sql, 013_clothing_types_categories.sql
-- Creates:
--   - Enhanced get_catalog_excluding_owned() function
--   - Enhanced search_catalog() function
--   - is_catalog_item_owned() helper function
--   - Color validation functions (is_valid_color, validate_secondary_colors, normalize_color)
-- Modifies:
--   - catalog_items table (category constraints, color constraints, style column type)
--   - clothes table (category constraints, color constraints)
--   - Functions to fix ambiguous references
-- 
-- IMPORTANT: Run migrations in sequential order!
-- ============================================

-- This file is re-runnable - safe to execute multiple times

BEGIN;

-- ============================================
-- STEP 1: FIX CATEGORY CONSTRAINTS FOR COMPATIBILITY
-- ============================================

-- Drop existing category constraints
ALTER TABLE clothes DROP CONSTRAINT IF EXISTS clothes_category_check;
ALTER TABLE catalog_items DROP CONSTRAINT IF EXISTS catalog_items_category_check;

-- Create updated constraint that allows both old simple categories and new detailed categories
-- This ensures compatibility with manual uploads (simple) and catalog (detailed)
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
    'slippers',
    't-shirt',
    'undershirt'
  ));

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
    'slippers',
    't-shirt',
    'undershirt'
  ));

-- ============================================
-- STEP 2: FIX CATALOG_ITEMS COLOR FIELD
-- ============================================

-- Migrate from 'color' to 'primary_color' if needed
DO $$
BEGIN
  -- If catalog_items has 'color' column but not 'primary_color', migrate data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'catalog_items' AND column_name = 'color'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'catalog_items' AND column_name = 'primary_color'
  ) THEN
    -- Add primary_color column
    ALTER TABLE catalog_items ADD COLUMN primary_color VARCHAR(50);
    
    -- Migrate data from color to primary_color
    UPDATE catalog_items SET primary_color = color WHERE color IS NOT NULL;
    
    RAISE NOTICE 'Migrated color column to primary_color in catalog_items';
  END IF;
END $$;

-- ============================================
-- STEP 3: FIX PRIMARY COLOR CONSTRAINTS
-- ============================================

-- Drop existing color constraints
ALTER TABLE clothes DROP CONSTRAINT IF EXISTS check_primary_color;
ALTER TABLE catalog_items DROP CONSTRAINT IF EXISTS check_catalog_primary_color;
ALTER TABLE clothes DROP CONSTRAINT IF EXISTS check_secondary_colors;
ALTER TABLE catalog_items DROP CONSTRAINT IF EXISTS check_catalog_secondary_colors;

-- Create comprehensive color constraints for both tables
ALTER TABLE clothes 
  ADD CONSTRAINT check_primary_color 
  CHECK (primary_color IS NULL OR primary_color IN (
    -- Neutrals
    'black', 'white', 'gray', 'beige', 'brown',
    -- Primary Colors
    'red', 'blue', 'yellow',
    -- Secondary Colors
    'green', 'orange', 'purple', 'pink',
    -- Additional
    'navy', 'teal', 'maroon', 'olive', 'gold', 'silver'
  ));

ALTER TABLE catalog_items 
  ADD CONSTRAINT check_catalog_primary_color 
  CHECK (primary_color IS NULL OR primary_color IN (
    -- Neutrals
    'black', 'white', 'gray', 'beige', 'brown',
    -- Primary Colors
    'red', 'blue', 'yellow',
    -- Secondary Colors
    'green', 'orange', 'purple', 'pink',
    -- Additional
    'navy', 'teal', 'maroon', 'olive', 'gold', 'silver'
  ));

-- Create simplified secondary colors constraints
ALTER TABLE clothes 
  ADD CONSTRAINT check_secondary_colors 
  CHECK (
    secondary_colors IS NULL OR 
    array_length(secondary_colors, 1) IS NULL OR
    array_length(secondary_colors, 1) <= 3
  );

ALTER TABLE catalog_items 
  ADD CONSTRAINT check_catalog_secondary_colors 
  CHECK (
    secondary_colors IS NULL OR 
    array_length(secondary_colors, 1) IS NULL OR
    array_length(secondary_colors, 1) <= 3
  );

-- ============================================
-- STEP 4: CREATE COLOR VALIDATION FUNCTIONS
-- ============================================

-- Function to validate color values
CREATE OR REPLACE FUNCTION is_valid_color(color_value VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
  RETURN color_value IS NULL OR color_value IN (
    'black', 'white', 'gray', 'beige', 'brown',
    'red', 'blue', 'yellow',
    'green', 'orange', 'purple', 'pink',
    'navy', 'teal', 'maroon', 'olive', 'gold', 'silver'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate secondary colors array
CREATE OR REPLACE FUNCTION validate_secondary_colors(colors_array VARCHAR(50)[])
RETURNS BOOLEAN AS $$
DECLARE
  color_item VARCHAR(50);
BEGIN
  -- If array is null or empty, it's valid
  IF colors_array IS NULL OR array_length(colors_array, 1) IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check each color in the array
  FOREACH color_item IN ARRAY colors_array
  LOOP
    IF NOT is_valid_color(color_item) THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to normalize color values
CREATE OR REPLACE FUNCTION normalize_color(color_value VARCHAR(50))
RETURNS VARCHAR(50) AS $$
BEGIN
  IF color_value IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Convert to lowercase and trim
  color_value := LOWER(TRIM(color_value));
  
  -- Handle common color variations
  CASE color_value
    WHEN 'grey' THEN RETURN 'gray';
    WHEN 'burgundy' THEN RETURN 'maroon';
    WHEN 'crimson' THEN RETURN 'red';
    WHEN 'scarlet' THEN RETURN 'red';
    WHEN 'azure' THEN RETURN 'blue';
    WHEN 'cyan' THEN RETURN 'teal';
    WHEN 'turquoise' THEN RETURN 'teal';
    WHEN 'lime' THEN RETURN 'green';
    WHEN 'emerald' THEN RETURN 'green';
    WHEN 'violet' THEN RETURN 'purple';
    WHEN 'magenta' THEN RETURN 'pink';
    WHEN 'rose' THEN RETURN 'pink';
    WHEN 'coral' THEN RETURN 'orange';
    WHEN 'amber' THEN RETURN 'yellow';
    WHEN 'cream' THEN RETURN 'beige';
    WHEN 'tan' THEN RETURN 'brown';
    WHEN 'chocolate' THEN RETURN 'brown';
    WHEN 'charcoal' THEN RETURN 'gray';
    WHEN 'ivory' THEN RETURN 'white';
    WHEN 'pearl' THEN RETURN 'white';
    WHEN 'platinum' THEN RETURN 'silver';
    WHEN 'bronze' THEN RETURN 'brown';
    ELSE RETURN color_value;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- STEP 5: FIX CATALOG_ITEMS STYLE COLUMN TYPE
-- ============================================

-- Ensure style column is TEXT[] (not JSONB or other types)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'catalog_items' AND column_name = 'style'
  ) THEN
    -- Try to alter column type safely
    BEGIN
      ALTER TABLE catalog_items
        ALTER COLUMN style TYPE TEXT[] USING style::TEXT[];
      RAISE NOTICE 'Updated catalog_items.style to TEXT[]';
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Could not alter style column type: %', SQLERRM;
    END;
  END IF;
END $$;

-- ============================================
-- STEP 6: ENHANCE CATALOG EXCLUSION FUNCTIONS
-- ============================================

-- Drop existing functions to recreate with improved logic
DROP FUNCTION IF EXISTS get_catalog_excluding_owned(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS search_catalog(TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS search_catalog(TEXT, VARCHAR, VARCHAR, INTEGER, INTEGER);

-- Enhanced function to get catalog items excluding items user already owns
-- Uses multiple matching criteria to prevent duplicates:
-- 1. Direct catalog_item_id match (for items added from catalog)
-- 2. Image URL match (for manually uploaded items that match catalog items)
-- 3. Name + brand + category match (for similar items with different images)
CREATE OR REPLACE FUNCTION get_catalog_excluding_owned(
  user_id_param UUID,
  category_filter VARCHAR(50) DEFAULT NULL,
  color_filter VARCHAR(50) DEFAULT NULL,
  brand_filter VARCHAR(100) DEFAULT NULL,
  season_filter VARCHAR(20) DEFAULT NULL,
  page_limit INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  category VARCHAR(50),
  image_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[],
  brand VARCHAR(100),
  color VARCHAR(50),
  season VARCHAR(20),
  style TEXT[]
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id,
    ci.name,
    ci.category,
    ci.image_url,
    ci.thumbnail_url,
    ci.tags,
    ci.brand,
    ci.color,
    ci.season,
    ci.style
  FROM catalog_items ci
  WHERE 
    ci.is_active = true
    AND ci.privacy = 'public'
    -- Apply filters
    AND (category_filter IS NULL OR ci.category = category_filter)
    AND (color_filter IS NULL OR ci.color = color_filter)
    AND (brand_filter IS NULL OR ci.brand ILIKE '%' || brand_filter || '%')
    AND (season_filter IS NULL OR ci.season = season_filter)
    -- Enhanced exclusion logic: exclude items user already owns
    AND (
      user_id_param IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM clothes c
        WHERE c.owner_id = user_id_param
          AND c.removed_at IS NULL
          AND (
            -- Direct catalog match (item was added from catalog)
            c.catalog_item_id = ci.id
            OR
            -- Image URL match (manually uploaded item with same image)
            c.image_url = ci.image_url
            OR
            -- Similar item match (same name, brand, and category)
            (
              LOWER(TRIM(c.name)) = LOWER(TRIM(ci.name))
              AND LOWER(TRIM(COALESCE(c.brand, ''))) = LOWER(TRIM(COALESCE(ci.brand, '')))
              AND c.category = ci.category
            )
          )
      )
    )
  ORDER BY ci.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;

COMMENT ON FUNCTION get_catalog_excluding_owned IS 'Enhanced catalog exclusion: prevents showing items user already owns via catalog_item_id, image_url, or name+brand+category matching.';

-- Enhanced search function with same exclusion logic
CREATE OR REPLACE FUNCTION search_catalog(
  search_query TEXT,
  filter_category VARCHAR(50) DEFAULT NULL,
  filter_color VARCHAR(50) DEFAULT NULL,
  filter_brand VARCHAR(100) DEFAULT NULL,
  filter_season VARCHAR(20) DEFAULT NULL,
  page_limit INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  category VARCHAR(50),
  image_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[],
  brand VARCHAR(100),
  color VARCHAR(50),
  season VARCHAR(20),
  style TEXT[],
  rank REAL
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id,
    ci.name,
    ci.category,
    ci.image_url,
    ci.thumbnail_url,
    ci.tags,
    ci.brand,
    ci.color,
    ci.season,
    ci.style,
    ts_rank(
      COALESCE(ci.search_vector, to_tsvector('english', 
        ci.name || ' ' || 
        ci.category || ' ' || 
        COALESCE(ci.brand, '') || ' ' || 
        COALESCE(ci.color, '') || ' ' ||
        COALESCE(array_to_string(ci.tags, ' '), '')
      )),
      plainto_tsquery('english', search_query)
    ) AS rank
  FROM catalog_items ci
  WHERE 
    ci.is_active = true
    AND ci.privacy = 'public'
    AND (
      ci.search_vector @@ plainto_tsquery('english', search_query)
      OR to_tsvector('english', 
        ci.name || ' ' || 
        ci.category || ' ' || 
        COALESCE(ci.brand, '') || ' ' || 
        COALESCE(ci.color, '') || ' ' ||
        COALESCE(array_to_string(ci.tags, ' '), '')
      ) @@ plainto_tsquery('english', search_query)
    )
    -- Apply filters
    AND (filter_category IS NULL OR ci.category = filter_category)
    AND (filter_color IS NULL OR ci.color = filter_color)
    AND (filter_brand IS NULL OR ci.brand ILIKE '%' || filter_brand || '%')
    AND (filter_season IS NULL OR ci.season = filter_season)
    -- Enhanced exclusion logic: exclude items user already owns
    AND (
      auth.uid() IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM clothes c
        WHERE c.owner_id = auth.uid()
          AND c.removed_at IS NULL
          AND (
            -- Direct catalog match
            c.catalog_item_id = ci.id
            OR
            -- Image URL match
            c.image_url = ci.image_url
            OR
            -- Similar item match
            (
              LOWER(TRIM(c.name)) = LOWER(TRIM(ci.name))
              AND LOWER(TRIM(COALESCE(c.brand, ''))) = LOWER(TRIM(COALESCE(ci.brand, '')))
              AND c.category = ci.category
            )
          )
      )
    )
  ORDER BY rank DESC, ci.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;

COMMENT ON FUNCTION search_catalog IS 'Enhanced catalog search with exclusion logic: prevents showing items user already owns via multiple matching criteria.';

-- ============================================
-- STEP 7: CREATE/FIX CATALOG OWNERSHIP HELPER FUNCTION
-- ============================================

-- Helper function to check if a catalog item is already owned by user
-- Fixed to avoid ambiguous column references
CREATE OR REPLACE FUNCTION is_catalog_item_owned(
  user_id_param UUID,
  catalog_item_id_param UUID  -- Renamed parameter to avoid ambiguity
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  catalog_item RECORD;
  owned_count INTEGER;
BEGIN
  -- Get catalog item details
  SELECT * INTO catalog_item
  FROM catalog_items
  WHERE id = catalog_item_id_param AND is_active = true;  -- Use renamed parameter
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user owns this item (or similar item)
  SELECT COUNT(*) INTO owned_count
  FROM clothes c
  WHERE c.owner_id = user_id_param
    AND c.removed_at IS NULL
    AND (
      -- Direct catalog match (now unambiguous)
      c.catalog_item_id = catalog_item_id_param
      OR
      -- Image URL match
      c.image_url = catalog_item.image_url
      OR
      -- Similar item match (same name, brand, and category)
      (
        LOWER(TRIM(c.name)) = LOWER(TRIM(catalog_item.name))
        AND LOWER(TRIM(COALESCE(c.brand, ''))) = LOWER(TRIM(COALESCE(catalog_item.brand, '')))
        AND c.category = catalog_item.category
      )
    );
  
  RETURN owned_count > 0;
END;
$$;

COMMENT ON FUNCTION is_catalog_item_owned IS 'Helper function to check if user already owns a catalog item (or similar item) using multiple matching criteria. Fixed ambiguous column reference.';

-- ============================================
-- STEP 8: GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on catalog functions
GRANT EXECUTE ON FUNCTION get_catalog_excluding_owned(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION search_catalog(TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION is_catalog_item_owned(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_valid_color(VARCHAR(50)) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_secondary_colors(VARCHAR(50)[]) TO authenticated;
GRANT EXECUTE ON FUNCTION normalize_color(VARCHAR(50)) TO authenticated;

-- ============================================
-- STEP 9: VERIFICATION
-- ============================================

-- Verify functions were created
DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM information_schema.routines 
  WHERE routine_name IN (
    'get_catalog_excluding_owned',
    'search_catalog',
    'is_catalog_item_owned',
    'is_valid_color',
    'validate_secondary_colors',
    'normalize_color'
  )
  AND routine_schema = 'public';
  
  IF func_count >= 6 THEN
    RAISE NOTICE '✅ All catalog functions created successfully';
  ELSE
    RAISE WARNING '⚠️ Expected 6 functions, found %', func_count;
  END IF;
END $$;

-- Verify constraints were created
DO $$
DECLARE
  constraint_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO constraint_count
  FROM information_schema.check_constraints 
  WHERE constraint_name IN (
    'clothes_category_check',
    'catalog_items_category_check',
    'check_primary_color',
    'check_catalog_primary_color',
    'check_secondary_colors',
    'check_catalog_secondary_colors'
  )
  AND constraint_schema = 'public';
  
  IF constraint_count >= 6 THEN
    RAISE NOTICE '✅ All catalog constraints created successfully';
  ELSE
    RAISE WARNING '⚠️ Expected 6 constraints, found %', constraint_count;
  END IF;
END $$;

COMMIT;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON CONSTRAINT check_primary_color ON clothes IS 'Ensures primary_color contains only valid color values or NULL';
COMMENT ON CONSTRAINT check_catalog_primary_color ON catalog_items IS 'Ensures primary_color contains only valid color values or NULL';
COMMENT ON CONSTRAINT check_secondary_colors ON clothes IS 'Ensures secondary_colors array has max 3 elements or NULL';
COMMENT ON CONSTRAINT check_catalog_secondary_colors ON catalog_items IS 'Ensures secondary_colors array has max 3 elements or NULL';
COMMENT ON FUNCTION is_valid_color IS 'Validates if a color value is in the allowed list';
COMMENT ON FUNCTION validate_secondary_colors IS 'Validates if all colors in an array are valid (use this in application logic)';
COMMENT ON FUNCTION normalize_color IS 'Normalizes color values to standard format and handles common variations';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- After running this migration, test with:
-- 1. Test catalog exclusion: 
--    SELECT * FROM get_catalog_excluding_owned('user-uuid', NULL, NULL, NULL, NULL, 10, 0);
-- 
-- 2. Test search exclusion:
--    SELECT * FROM search_catalog('shirt', NULL, NULL, NULL, NULL, 10, 0);
-- 
-- 3. Test ownership check:
--    SELECT is_catalog_item_owned('user-uuid', 'catalog-item-uuid');
-- 
-- 4. Test color validation:
--    SELECT is_valid_color('red');  -- Should return true
--    SELECT is_valid_color('invalid');  -- Should return false

