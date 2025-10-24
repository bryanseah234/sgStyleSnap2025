-- Migration 046: Fix Primary Color Constraint and Catalog Color Field
-- This migration fixes the primary_color constraint violation and ensures
-- catalog items use the correct color field name

BEGIN;

-- ============================================
-- 1. FIX CATALOG_ITEMS COLOR FIELD ISSUE
-- ============================================

-- Check if catalog_items has both 'color' and 'primary_color' columns
-- and migrate data if needed
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
    
    -- Add constraint to primary_color
    ALTER TABLE catalog_items 
      ADD CONSTRAINT check_catalog_primary_color 
      CHECK (primary_color IN (
        'black', 'white', 'gray', 'beige', 'brown',
        'red', 'blue', 'yellow',
        'green', 'orange', 'purple', 'pink',
        'navy', 'teal', 'maroon', 'olive', 'gold', 'silver'
      ));
  END IF;
END $$;

-- ============================================
-- 2. ENSURE COMPREHENSIVE COLOR CONSTRAINTS
-- ============================================

-- Drop existing constraints to recreate them
ALTER TABLE clothes DROP CONSTRAINT IF EXISTS check_primary_color;
ALTER TABLE catalog_items DROP CONSTRAINT IF EXISTS check_catalog_primary_color;

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

-- ============================================
-- 3. ADD SECONDARY COLORS CONSTRAINTS (SIMPLIFIED)
-- ============================================

-- Drop existing secondary colors constraints
ALTER TABLE clothes DROP CONSTRAINT IF EXISTS check_secondary_colors;
ALTER TABLE catalog_items DROP CONSTRAINT IF EXISTS check_catalog_secondary_colors;

-- Create simplified secondary colors constraints
-- Note: We can't use subqueries in check constraints, so we'll use a simpler approach
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
-- 4. CREATE HELPER FUNCTIONS FOR COLOR VALIDATION
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

-- Function to normalize color values (convert to lowercase, handle common variations)
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
-- 5. GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on color functions
GRANT EXECUTE ON FUNCTION is_valid_color(VARCHAR(50)) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_secondary_colors(VARCHAR(50)[]) TO authenticated;
GRANT EXECUTE ON FUNCTION normalize_color(VARCHAR(50)) TO authenticated;

-- ============================================
-- 6. VERIFY CONSTRAINTS
-- ============================================

-- Check that constraints were created successfully
DO $$
DECLARE
  clothes_constraint_count INTEGER;
  catalog_constraint_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO clothes_constraint_count
  FROM information_schema.check_constraints 
  WHERE constraint_name IN ('check_primary_color', 'check_secondary_colors')
    AND constraint_schema = 'public';
  
  SELECT COUNT(*) INTO catalog_constraint_count
  FROM information_schema.check_constraints 
  WHERE constraint_name IN ('check_catalog_primary_color', 'check_catalog_secondary_colors')
    AND constraint_schema = 'public';
  
  IF clothes_constraint_count = 2 THEN
    RAISE NOTICE 'SUCCESS: All clothes color constraints created';
  ELSE
    RAISE WARNING 'WARNING: Expected 2 clothes constraints, found %', clothes_constraint_count;
  END IF;
  
  IF catalog_constraint_count = 2 THEN
    RAISE NOTICE 'SUCCESS: All catalog_items color constraints created';
  ELSE
    RAISE WARNING 'WARNING: Expected 2 catalog_items constraints, found %', catalog_constraint_count;
  END IF;
END $$;

-- ============================================
-- 7. COMMENTS & DOCUMENTATION
-- ============================================

COMMENT ON CONSTRAINT check_primary_color ON clothes IS 
'Ensures primary_color contains only valid color values or NULL';

COMMENT ON CONSTRAINT check_catalog_primary_color ON catalog_items IS 
'Ensures primary_color contains only valid color values or NULL';

COMMENT ON CONSTRAINT check_secondary_colors ON clothes IS 
'Ensures secondary_colors array has max 3 elements or NULL (color validation done by application)';

COMMENT ON CONSTRAINT check_catalog_secondary_colors ON catalog_items IS 
'Ensures secondary_colors array has max 3 elements or NULL (color validation done by application)';

COMMENT ON FUNCTION is_valid_color IS 
'Validates if a color value is in the allowed list';

COMMENT ON FUNCTION validate_secondary_colors IS 
'Validates if all colors in an array are valid (use this in application logic)';

COMMENT ON FUNCTION normalize_color IS 
'Normalizes color values to standard format and handles common variations';

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- After running this migration, test with:
-- 1. Manual upload with valid colors (should work)
-- 2. Manual upload with invalid colors (should be prevented by dropdown)
-- 3. Catalog browsing (should work with primary_color field)
-- 4. Color filtering (should work correctly)
