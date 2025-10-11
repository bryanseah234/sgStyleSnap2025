-- Migration 006: Color Detection System
-- Adds color fields to clothes table for AI-powered color detection
-- This file is re-runnable - safe to execute multiple times

-- ============================================
-- DROP EXISTING OBJECTS
-- ============================================
DO $$
BEGIN
    DROP FUNCTION IF EXISTS get_complementary_color(VARCHAR) CASCADE;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$
BEGIN
    DROP FUNCTION IF EXISTS get_analogous_colors(VARCHAR) CASCADE;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$
BEGIN
    DROP FUNCTION IF EXISTS get_triadic_colors(VARCHAR) CASCADE;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$
BEGIN
    DROP FUNCTION IF EXISTS suggest_matching_colors(VARCHAR, VARCHAR) CASCADE;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$
BEGIN
    DROP INDEX IF EXISTS idx_clothes_primary_color;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$
BEGIN
    DROP INDEX IF EXISTS idx_clothes_secondary_colors;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;


-- Drop constraints
ALTER TABLE clothes DROP CONSTRAINT IF EXISTS check_primary_color;
ALTER TABLE clothes DROP CONSTRAINT IF EXISTS check_secondary_colors;

-- Drop columns
ALTER TABLE clothes DROP COLUMN IF EXISTS primary_color;
ALTER TABLE clothes DROP COLUMN IF EXISTS secondary_colors;

-- ============================================
-- ADD COLOR FIELDS TO CLOTHES TABLE
-- ============================================

-- Primary color (dominant color detected by AI)
ALTER TABLE clothes 
  ADD COLUMN primary_color VARCHAR(50);

-- Secondary colors (additional colors detected, max 2-3)
ALTER TABLE clothes 
  ADD COLUMN secondary_colors VARCHAR(50)[];

-- ============================================
-- COLOR VALIDATION CONSTRAINT
-- ============================================

-- Ensure only valid color names are used
ALTER TABLE clothes 
  ADD CONSTRAINT check_primary_color 
  CHECK (primary_color IN (
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
-- INDEXES FOR COLOR FILTERING
-- ============================================

-- Index for primary color filtering (most common query)
CREATE INDEX idx_clothes_primary_color ON clothes(primary_color);

-- GIN index for secondary colors array (for "contains" queries)
CREATE INDEX idx_clothes_secondary_colors ON clothes USING gin(secondary_colors);

-- Composite index for category + color filtering
CREATE INDEX idx_clothes_category_color ON clothes(category, primary_color);

-- ============================================
-- FUNCTIONS FOR COLOR ANALYSIS
-- ============================================

-- Function to find items by color (including secondary colors)
CREATE OR REPLACE FUNCTION find_items_by_color(
  user_id_param UUID,
  color_param VARCHAR(50)
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  category VARCHAR(50),
  image_url TEXT,
  thumbnail_url TEXT,
  primary_color VARCHAR(50),
  secondary_colors VARCHAR(50)[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.category,
    c.image_url,
    c.thumbnail_url,
    c.primary_color,
    c.secondary_colors
  FROM clothes c
  WHERE 
    c.owner_id = user_id_param
    AND c.removed_at IS NULL
    AND (
      c.primary_color = color_param
      OR color_param = ANY(c.secondary_colors)
    )
  ORDER BY c.created_at DESC;
END;
$$;

-- Function to get color statistics for user's closet
CREATE OR REPLACE FUNCTION get_color_stats(
  user_id_param UUID
)
RETURNS TABLE (
  color VARCHAR(50),
  item_count INTEGER,
  percentage NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  total_items INTEGER;
BEGIN
  -- Get total item count
  SELECT COUNT(*) INTO total_items
  FROM clothes
  WHERE owner_id = user_id_param
    AND removed_at IS NULL
    AND primary_color IS NOT NULL;
  
  -- Return color statistics
  RETURN QUERY
  SELECT 
    c.primary_color AS color,
    COUNT(*)::INTEGER AS item_count,
    ROUND((COUNT(*) * 100.0 / NULLIF(total_items, 0))::NUMERIC, 2) AS percentage
  FROM clothes c
  WHERE 
    c.owner_id = user_id_param
    AND c.removed_at IS NULL
    AND c.primary_color IS NOT NULL
  GROUP BY c.primary_color
  ORDER BY item_count DESC;
END;
$$;

-- Function to suggest complementary colors based on existing items
CREATE OR REPLACE FUNCTION suggest_complementary_colors(
  user_id_param UUID
)
RETURNS TABLE (
  base_color VARCHAR(50),
  complement_color VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
DECLARE
  color_map JSONB := '{
    "red": "green",
    "green": "red",
    "blue": "orange",
    "orange": "blue",
    "yellow": "purple",
    "purple": "yellow",
    "pink": "teal",
    "teal": "pink"
  }'::JSONB;
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    c.primary_color AS base_color,
    (color_map->>c.primary_color)::VARCHAR(50) AS complement_color
  FROM clothes c
  WHERE 
    c.owner_id = user_id_param
    AND c.removed_at IS NULL
    AND c.primary_color IS NOT NULL
    AND color_map ? c.primary_color
  ORDER BY base_color;
END;
$$;

-- ============================================
-- UPDATE EXISTING CATALOG ITEMS (if catalog exists)
-- ============================================

-- Add color fields to catalog_items if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'catalog_items'
  ) THEN
    -- Add primary_color if not exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'catalog_items' 
      AND column_name = 'primary_color'
    ) THEN
      ALTER TABLE catalog_items 
        ADD COLUMN primary_color VARCHAR(50);
    END IF;
    
    -- Add secondary_colors if not exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'catalog_items' 
      AND column_name = 'secondary_colors'
    ) THEN
      ALTER TABLE catalog_items 
        ADD COLUMN secondary_colors VARCHAR(50)[];
    END IF;
    
    -- Add color indexes to catalog_items
    CREATE INDEX IF NOT EXISTS idx_catalog_primary_color 
      ON catalog_items(primary_color);
    CREATE INDEX IF NOT EXISTS idx_catalog_secondary_colors 
      ON catalog_items USING gin(secondary_colors);
  END IF;
END $$;

-- ============================================
-- VIEWS FOR COLOR ANALYSIS
-- ============================================

-- View: Color distribution across all users (analytics)
CREATE OR REPLACE VIEW color_distribution AS
SELECT 
  primary_color,
  COUNT(*) AS total_items,
  COUNT(DISTINCT owner_id) AS users_with_color,
  ROUND(AVG(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) * 100, 2) AS recent_uploads_percentage
FROM clothes
WHERE 
  removed_at IS NULL
  AND primary_color IS NOT NULL
GROUP BY primary_color
ORDER BY total_items DESC;

-- ============================================
-- MIGRATION NOTES
-- ============================================

-- This migration adds color detection capability to the clothes table.
-- After running this migration:
--
-- 1. Existing items will have NULL color values (expected)
-- 2. New items uploaded will have colors auto-detected
-- 3. Users can manually update colors using the ColorPicker component
-- 4. Use the color-detector.js utility on the frontend for detection
--
-- To backfill colors for existing items, run a script that:
--   - Fetches each item's image
--   - Runs color detection
--   - Updates the primary_color and secondary_colors fields

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN clothes.primary_color IS 'Dominant color detected by AI color detection algorithm';
COMMENT ON COLUMN clothes.secondary_colors IS 'Additional colors present in the item (max 2-3), detected by AI';
COMMENT ON FUNCTION find_items_by_color IS 'Find all items containing a specific color (primary or secondary)';
COMMENT ON FUNCTION get_color_stats IS 'Get color distribution statistics for a user''s closet';
COMMENT ON FUNCTION suggest_complementary_colors IS 'Suggest complementary colors based on user''s existing items';
COMMENT ON VIEW color_distribution IS 'Analytics view showing color distribution across all users';
