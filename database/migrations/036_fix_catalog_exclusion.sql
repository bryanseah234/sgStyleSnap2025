-- ============================================
-- Fix Catalog Exclusion Logic
-- ============================================
-- This migration improves the catalog exclusion logic to better handle
-- cases where users might have manually uploaded items that match catalog items.

BEGIN;

-- ============================================
-- 1. IMPROVE CATALOG EXCLUSION FUNCTION
-- ============================================

-- Drop existing function to recreate with better logic
DROP FUNCTION IF EXISTS get_catalog_excluding_owned(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER, INTEGER);

-- Enhanced function to get catalog items excluding items user already owns
-- This function uses multiple matching criteria to prevent duplicates:
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

-- ============================================
-- 2. IMPROVE SEARCH CATALOG FUNCTION
-- ============================================

-- Drop existing search function to recreate with better exclusion logic
DROP FUNCTION IF EXISTS search_catalog(TEXT, VARCHAR, VARCHAR, INTEGER, INTEGER);

-- Enhanced search function with same exclusion logic
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
  search_rank REAL
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
    ts_rank(ci.search_vector, plainto_tsquery('english', search_query)) as search_rank
  FROM catalog_items ci
  WHERE 
    ci.is_active = true
    AND ci.privacy = 'public'
    AND ci.search_vector @@ plainto_tsquery('english', search_query)
    -- Apply filters
    AND (filter_category IS NULL OR ci.category = filter_category)
    AND (filter_color IS NULL OR ci.color = filter_color)
    -- Enhanced exclusion logic: exclude items user already owns
    AND NOT EXISTS (
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
  ORDER BY search_rank DESC, ci.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;

COMMENT ON FUNCTION search_catalog IS 'Enhanced catalog search with exclusion logic: prevents showing items user already owns via multiple matching criteria.';

-- ============================================
-- 3. CREATE HELPER FUNCTION FOR EXCLUSION CHECK
-- ============================================

-- Helper function to check if a catalog item is already owned by user
CREATE OR REPLACE FUNCTION is_catalog_item_owned(
  user_id_param UUID,
  catalog_item_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  catalog_item RECORD;
  owned_count INTEGER;
BEGIN
  -- Get catalog item details
  SELECT * INTO catalog_item
  FROM catalog_items
  WHERE id = catalog_item_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user owns this item (or similar item)
  SELECT COUNT(*) INTO owned_count
  FROM clothes c
  WHERE c.owner_id = user_id_param
    AND c.removed_at IS NULL
    AND (
      -- Direct catalog match
      c.catalog_item_id = catalog_item_id
      OR
      -- Image URL match
      c.image_url = catalog_item.image_url
      OR
      -- Similar item match
      (
        LOWER(TRIM(c.name)) = LOWER(TRIM(catalog_item.name))
        AND LOWER(TRIM(COALESCE(c.brand, ''))) = LOWER(TRIM(COALESCE(catalog_item.brand, '')))
        AND c.category = catalog_item.category
      )
    );
  
  RETURN owned_count > 0;
END;
$$;

COMMENT ON FUNCTION is_catalog_item_owned IS 'Helper function to check if user already owns a catalog item (or similar item) using multiple matching criteria.';

-- ============================================
-- 4. GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_catalog_excluding_owned(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION search_catalog(TEXT, VARCHAR, VARCHAR, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION is_catalog_item_owned(UUID, UUID) TO authenticated;

-- ============================================
-- 5. VERIFY FUNCTIONS WERE CREATED
-- ============================================

-- Check that all functions were created successfully
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN (
  'get_catalog_excluding_owned',
  'search_catalog',
  'is_catalog_item_owned'
)
AND routine_schema = 'public'
ORDER BY routine_name;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- After running this migration, test with these queries:

-- 1. Test catalog exclusion for a specific user:
-- SELECT * FROM get_catalog_excluding_owned('user-uuid-here', NULL, NULL, NULL, NULL, 10, 0);

-- 2. Test search exclusion:
-- SELECT * FROM search_catalog('shirt', NULL, NULL, 10, 0);

-- 3. Test individual item ownership check:
-- SELECT is_catalog_item_owned('user-uuid-here', 'catalog-item-uuid-here');

-- 4. Verify exclusion logic by checking what items are excluded:
-- SELECT ci.*, c.name as owned_name, c.brand as owned_brand
-- FROM catalog_items ci
-- LEFT JOIN clothes c ON (
--   c.owner_id = 'user-uuid-here' 
--   AND c.removed_at IS NULL
--   AND (
--     c.catalog_item_id = ci.id
--     OR c.image_url = ci.image_url
--     OR (LOWER(TRIM(c.name)) = LOWER(TRIM(ci.name)) AND LOWER(TRIM(COALESCE(c.brand, ''))) = LOWER(TRIM(COALESCE(ci.brand, ''))) AND c.category = ci.category)
--   )
-- )
-- WHERE ci.is_active = true AND ci.privacy = 'public'
-- ORDER BY ci.created_at DESC
-- LIMIT 20;
