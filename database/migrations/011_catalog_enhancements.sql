-- Migration 011: Catalog Items Enhancements
-- Adds additional columns to catalog_items for comprehensive item details
-- This file is re-runnable - safe to execute multiple times

-- ============================================
-- ADD MISSING COLUMNS TO CATALOG_ITEMS
-- ============================================

-- Add size column for catalog items
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'catalog_items'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'catalog_items' AND column_name = 'size'
    ) THEN
      ALTER TABLE catalog_items ADD COLUMN size VARCHAR(20);
    END IF;
  END IF;
END $$;

-- Add primary_color column (replaces 'color' for consistency with clothes table)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'catalog_items'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'catalog_items' AND column_name = 'primary_color'
    ) THEN
      ALTER TABLE catalog_items ADD COLUMN primary_color VARCHAR(50);
      
      -- Migrate existing 'color' data to 'primary_color'
      UPDATE catalog_items SET primary_color = color WHERE color IS NOT NULL;
    END IF;
  END IF;
END $$;

-- Add secondary_colors array column
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'catalog_items'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'catalog_items' AND column_name = 'secondary_colors'
    ) THEN
      ALTER TABLE catalog_items ADD COLUMN secondary_colors TEXT[];
    END IF;
  END IF;
END $$;

-- Add cloudinary_public_id for image management
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'catalog_items'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'catalog_items' AND column_name = 'cloudinary_public_id'
    ) THEN
      ALTER TABLE catalog_items ADD COLUMN cloudinary_public_id TEXT;
    END IF;
  END IF;
END $$;

-- Add privacy column (default: public)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'catalog_items'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'catalog_items' AND column_name = 'privacy'
    ) THEN
      ALTER TABLE catalog_items 
        ADD COLUMN privacy VARCHAR(20) DEFAULT 'public' 
        CHECK (privacy IN ('public', 'friends', 'private'));
    END IF;
  END IF;
END $$;

-- ============================================
-- CREATE INDEXES FOR NEW COLUMNS
-- ============================================

-- Index for primary_color
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_catalog_primary_color'
  ) THEN
    CREATE INDEX idx_catalog_primary_color ON catalog_items(primary_color);
  END IF;
END $$;

-- Index for privacy (for filtering public items)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_catalog_privacy'
  ) THEN
    CREATE INDEX idx_catalog_privacy ON catalog_items(privacy);
  END IF;
END $$;

-- ============================================
-- UPDATE RLS POLICIES
-- ============================================

-- Drop old policies (if they exist)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view active catalog items" ON catalog_items;
EXCEPTION 
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view active public catalog items" ON catalog_items;
EXCEPTION 
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policy: Anyone can view active public catalog items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'catalog_items' 
      AND policyname = 'Anyone can view active public catalog items'
  ) THEN
    CREATE POLICY "Anyone can view active public catalog items"
    ON catalog_items FOR SELECT
    USING (is_active = true AND privacy = 'public');
  END IF;
END $$;

-- ============================================
-- CREATE RPC FUNCTION: Get Catalog Items Excluding Owned
-- ============================================

-- Drop existing function if it exists (handles signature changes)
DROP FUNCTION IF EXISTS get_catalog_excluding_owned(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER, INTEGER);

-- Function to get catalog items that user doesn't already own
-- This prevents showing duplicate suggestions to users
CREATE OR REPLACE FUNCTION get_catalog_excluding_owned(
  user_id_param UUID DEFAULT NULL,
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
  clothing_type VARCHAR(50),
  category VARCHAR(50),
  image_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[],
  brand VARCHAR(100),
  primary_color VARCHAR(50),
  secondary_colors TEXT[],
  season VARCHAR(20),
  style TEXT[],
  description TEXT,
  size VARCHAR(20)
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id,
    ci.name,
    ci.clothing_type,
    ci.category,
    ci.image_url,
    ci.thumbnail_url,
    ci.tags,
    ci.brand,
    ci.primary_color,
    ci.secondary_colors,
    ci.season,
    ci.style,
    ci.description,
    ci.size
  FROM catalog_items ci
  WHERE 
    ci.is_active = true
    AND ci.privacy = 'public'
    -- Exclude items user already owns
    AND (
      user_id_param IS NULL 
      OR NOT EXISTS (
        SELECT 1 FROM clothes c
        WHERE c.owner_id = user_id_param
          AND c.catalog_item_id = ci.id
          AND c.removed_at IS NULL
      )
    )
    -- Apply filters
    AND (category_filter IS NULL OR ci.category = category_filter)
    AND (color_filter IS NULL OR ci.primary_color = color_filter)
    AND (brand_filter IS NULL OR ci.brand ILIKE '%' || brand_filter || '%')
    AND (season_filter IS NULL OR ci.season = season_filter)
  ORDER BY ci.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;

COMMENT ON FUNCTION get_catalog_excluding_owned IS 
'Returns catalog items that are active, public, and not already in user''s closet. Supports filtering by category, color, brand, and season.';

-- ============================================
-- UPDATE SEARCH_VECTOR TRIGGER
-- ============================================

-- Update the search vector function to include new fields
CREATE OR REPLACE FUNCTION update_catalog_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.clothing_type, '') || ' ' ||
    COALESCE(NEW.brand, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.primary_color, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.style, ' '), '')
  );
  RETURN NEW;
END;
$$;

-- Recreate trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS catalog_items_search_vector_update ON catalog_items;
CREATE TRIGGER catalog_items_search_vector_update
  BEFORE INSERT OR UPDATE ON catalog_items
  FOR EACH ROW
  EXECUTE FUNCTION update_catalog_search_vector();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN catalog_items.size IS 'Size of the clothing item (e.g., S, M, L, 32x34)';
COMMENT ON COLUMN catalog_items.primary_color IS 'Primary color of the item';
COMMENT ON COLUMN catalog_items.secondary_colors IS 'Array of secondary colors in the item';
COMMENT ON COLUMN catalog_items.cloudinary_public_id IS 'Cloudinary public ID for image management';
COMMENT ON COLUMN catalog_items.privacy IS 'Privacy level: public (visible to all), friends (visible to friends), private (only owner)';
