-- Migration: Drop all search_catalog overloads and recreate canonical functions
-- Warning: This will DROP all functions named search_catalog in the current database (public schema).
-- Backup before running.

-- 1) Show existing search_catalog signatures for logging
-- (This SELECT is harmless and helps confirm what existed before drops)
SELECT oid::regprocedure AS signature
FROM pg_proc
WHERE proname = 'search_catalog'
  AND pronamespace = 'public'::regnamespace
ORDER BY signature;

-- 2) Drop all search_catalog overloads (use the exact signatures)
-- If the SELECT above returned signatures different from the examples below, replace accordingly.
-- We'll programmatically generate and execute DROP FUNCTION for each signature found.
DO $$
DECLARE
  r RECORD;
  stmt TEXT;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text AS sig
    FROM pg_proc
    WHERE proname = 'search_catalog'
      AND pronamespace = 'public'::regnamespace
  LOOP
    -- Build DROP FUNCTION statement
    stmt := format('DROP FUNCTION IF EXISTS %s CASCADE;', r.sig);
    RAISE NOTICE 'Executing: %', stmt;
    EXECUTE stmt;
  END LOOP;
END
$$ LANGUAGE plpgsql;

-- 3) Ensure get_catalog_excluding_owned is dropped if any conflicting overloads exist
-- (Drop by signature if you know other overloads exist; this is safe-guard)
DROP FUNCTION IF EXISTS public.get_catalog_excluding_owned(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER, INTEGER) CASCADE;

-- 4) Alter the column type to TEXT[] (safe cast using USING)
ALTER TABLE IF EXISTS public.catalog_items
  ALTER COLUMN style TYPE TEXT[] USING style::TEXT[];

-- 5) Recreate get_catalog_excluding_owned
CREATE OR REPLACE FUNCTION public.get_catalog_excluding_owned(
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
  FROM public.catalog_items ci
  WHERE 
    ci.is_active = true
    AND (category_filter IS NULL OR ci.category = category_filter)
    AND (color_filter IS NULL OR ci.color = color_filter)
    AND (brand_filter IS NULL OR ci.brand ILIKE '%' || brand_filter || '%')
    AND (season_filter IS NULL OR ci.season = season_filter)
    AND (
      user_id_param IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM public.clothes c
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

COMMENT ON FUNCTION public.get_catalog_excluding_owned IS 'Get catalog items excluding items user already owns. Filters by catalog_item_id or image_url match.';

-- 6) Recreate the canonical search_catalog (single overload)
CREATE OR REPLACE FUNCTION public.search_catalog(
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
    ts_rank(
      to_tsvector('english', 
        ci.name || ' ' || 
        ci.category || ' ' || 
        COALESCE(ci.brand, '') || ' ' || 
        COALESCE(ci.color, '') || ' ' ||
        COALESCE(array_to_string(ci.tags, ' '), '')
      ),
      plainto_tsquery('english', search_query)
    ) AS rank
  FROM public.catalog_items ci
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

COMMENT ON FUNCTION public.search_catalog IS 'Full-text search catalog items with optional category and color filters';

-- 7) Emit completion notice
DO $$
BEGIN
  RAISE NOTICE '✅ Dropped all search_catalog overloads (if any) and recreated canonical functions; catalog_items.style set to TEXT[]';
END;
$$ LANGUAGE plpgsql;