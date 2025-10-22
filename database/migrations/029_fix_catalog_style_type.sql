-- Migration: Fix catalog_items style column type mismatch
-- Description: The style column needs to be TEXT[] to match function return types
-- Author: StyleSnap Team
-- Date: 2025-10-22

-- ============================================
-- FIX STYLE COLUMN TYPE
-- ============================================

-- Drop dependent functions first
DROP FUNCTION IF EXISTS get_catalog_excluding_owned(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS search_catalog(TEXT, VARCHAR, VARCHAR, INTEGER, INTEGER);

-- Alter the column type to TEXT[]
ALTER TABLE catalog_items 
  ALTER COLUMN style TYPE TEXT[] USING style::TEXT[];

-- Recreate the get_catalog_excluding_owned function
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
    -- Apply filters
    AND (category_filter IS NULL OR ci.category = category_filter)
    AND (color_filter IS NULL OR ci.color = color_filter)
    AND (brand_filter IS NULL OR ci.brand ILIKE '%' || brand_filter || '%')
    AND (season_filter IS NULL OR ci.season = season_filter)
    -- Exclude items user already owns (by catalog_item_id OR image_url)
    AND (
      user_id_param IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM clothes c
        WHERE c.owner_id = user_id_param
          AND c.removed_at IS NULL
          AND (
            c.catalog_item_id = ci.id
            OR c.image_url = ci.image_url
          )
      )
    )
  ORDER BY ci.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;

COMMENT ON FUNCTION get_catalog_excluding_owned IS 'Get catalog items excluding items user already owns. Filters by catalog_item_id or image_url match.';

-- Recreate the search_catalog function
CREATE OR REPLACE FUNCTION search_catalog(
  search_query TEXT,
  filter_category VARCHAR(50) DEFAULT NULL,
  filter_color VARCHAR(50) DEFAULT NULL,
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
    ts_rank(to_tsvector('english', 
      ci.name || ' ' || 
      ci.category || ' ' || 
      COALESCE(ci.brand, '') || ' ' || 
      COALESCE(ci.color, '') || ' ' ||
      COALESCE(array_to_string(ci.tags, ' '), '')
    ), plainto_tsquery('english', search_query)) AS rank
  FROM catalog_items ci
  WHERE 
    ci.is_active = true
    AND to_tsvector('english', 
      ci.name || ' ' || 
      ci.category || ' ' || 
      COALESCE(ci.brand, '') || ' ' || 
      COALESCE(ci.color, '') || ' ' ||
      COALESCE(array_to_string(ci.tags, ' '), '')
    ) @@ plainto_tsquery('english', search_query)
    AND (filter_category IS NULL OR ci.category = filter_category)
    AND (filter_color IS NULL OR ci.color = filter_color)
  ORDER BY rank DESC, ci.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;

COMMENT ON FUNCTION search_catalog IS 'Full-text search catalog items with optional category and color filters';

RAISE NOTICE '✅ Fixed catalog_items style column type to TEXT[]';

