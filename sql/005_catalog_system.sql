-- Migration 005: Item Catalog System
-- Creates tables and policies for browsing pre-populated clothing catalog
-- This file is re-runnable - safe to execute multiple times

-- ============================================
-- DROP EXISTING OBJECTS (in reverse dependency order)
-- ============================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_catalog_items_updated_at') THEN
    DROP TRIGGER update_catalog_items_updated_at ON catalog_items CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  DROP FUNCTION IF EXISTS add_catalog_item_to_closet(UUID, UUID, VARCHAR) CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP FUNCTION IF EXISTS search_catalog(TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER, INTEGER) CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view active catalog items" ON catalog_items;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP TABLE IF EXISTS catalog_items CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP INDEX IF EXISTS idx_catalog_color CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP INDEX IF EXISTS idx_catalog_category CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP INDEX IF EXISTS idx_catalog_brand CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP INDEX IF EXISTS idx_catalog_season CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP INDEX IF EXISTS idx_catalog_active CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP INDEX IF EXISTS idx_catalog_search CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP INDEX IF EXISTS idx_clothes_catalog_item CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Drop the generated column if it exists (only if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'catalog_items') THEN
    ALTER TABLE catalog_items DROP COLUMN IF EXISTS search_vector;
  END IF;
END $$;

-- Drop catalog_item_id from clothes if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clothes') THEN
    ALTER TABLE clothes DROP COLUMN IF EXISTS catalog_item_id;
  END IF;
END $$;

DROP TABLE IF EXISTS catalog_items CASCADE;

-- ============================================
-- CATALOG ITEMS TABLE
-- ============================================

CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('top', 'bottom', 'outerwear', 'shoes', 'accessory')),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  tags TEXT[],
  brand VARCHAR(100),
  color VARCHAR(50),
  season VARCHAR(20) CHECK (season IN ('spring', 'summer', 'fall', 'winter', 'all-season')),
  style TEXT[], -- casual, formal, sporty, business, etc.
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LINK USER ITEMS TO CATALOG (OPTIONAL)
-- ============================================

-- Add optional reference from clothes to catalog_items
ALTER TABLE clothes 
  ADD COLUMN IF NOT EXISTS catalog_item_id UUID REFERENCES catalog_items(id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Category filter (most common)
CREATE INDEX idx_catalog_category ON catalog_items(category);

-- Color filter
CREATE INDEX idx_catalog_color ON catalog_items(color);

-- Brand filter
CREATE INDEX idx_catalog_brand ON catalog_items(brand);

-- Season filter
CREATE INDEX idx_catalog_season ON catalog_items(season);

-- Active items only (most queries)
CREATE INDEX idx_catalog_active ON catalog_items(is_active) WHERE is_active = true;

-- Add search_vector column for full-text search (maintained by trigger)
ALTER TABLE catalog_items 
  ADD COLUMN search_vector tsvector;

-- Full-text search index
CREATE INDEX idx_catalog_search ON catalog_items USING gin(search_vector);

-- Index for user items linked to catalog
CREATE INDEX idx_clothes_catalog_item ON clothes(catalog_item_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on catalog_items
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active catalog items (public read, anonymous)
-- CRITICAL: catalog_items table has NO owner_id column to ensure anonymity
-- Items are displayed without attribution (admin or user-uploaded)
CREATE POLICY "Anyone can view active catalog items"
ON catalog_items FOR SELECT
USING (is_active = true);

-- Policy: Only admins can modify catalog (not implemented in MVP)
-- This prevents regular users from adding/editing catalog items
-- In the future, create an 'admins' table and use:
-- CREATE POLICY "Only admins can modify catalog"
-- ON catalog_items FOR ALL
-- USING (auth.uid() IN (SELECT id FROM admins));

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to search catalog with full-text search
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
    ts_rank(ci.search_vector, plainto_tsquery('english', search_query)) AS rank
  FROM catalog_items ci
  WHERE 
    ci.is_active = true
    AND (filter_category IS NULL OR ci.category = filter_category)
    AND (filter_color IS NULL OR ci.color = filter_color)
    AND (filter_brand IS NULL OR ci.brand = filter_brand)
    AND (filter_season IS NULL OR ci.season = filter_season)
    AND ci.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;

-- Function to add catalog item to user's closet
-- Note: When users upload items, they are automatically added to catalog_items
-- (without owner_id) for anonymous community contribution
CREATE OR REPLACE FUNCTION add_catalog_item_to_closet(
  user_id_param UUID,
  catalog_item_id_param UUID,
  privacy_param VARCHAR(20) DEFAULT 'friends'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  new_item_id UUID;
  catalog_item RECORD;
  user_item_count INTEGER;
BEGIN
  -- Check user's upload quota (50 user-uploaded items max)
  -- Catalog additions are unlimited
  SELECT COUNT(*) INTO user_item_count
  FROM clothes
  WHERE owner_id = user_id_param
    AND removed_at IS NULL
    AND catalog_item_id IS NULL; -- Only count user uploads
  
  -- Note: No quota check here since catalog additions are unlimited
  -- Users can add unlimited items from catalog
  
  -- Check if catalog item exists
  SELECT * INTO catalog_item
  FROM catalog_items
  WHERE id = catalog_item_id_param
    AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Catalog item not found or inactive';
  END IF;
  
  -- Check if user already has this item
  IF EXISTS (
    SELECT 1 FROM clothes
    WHERE owner_id = user_id_param
      AND catalog_item_id = catalog_item_id_param
      AND removed_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Item already in closet';
  END IF;
  
  -- Create new clothing item from catalog
  INSERT INTO clothes (
    owner_id,
    name,
    category,
    image_url,
    thumbnail_url,
    style_tags,
    privacy,
    catalog_item_id
  ) VALUES (
    user_id_param,
    catalog_item.name,
    catalog_item.category,
    catalog_item.image_url,
    catalog_item.thumbnail_url,
    catalog_item.style,
    privacy_param,
    catalog_item_id_param
  )
  RETURNING id INTO new_item_id;
  
  RETURN new_item_id;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update search_vector
CREATE OR REPLACE FUNCTION update_catalog_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    NEW.name || ' ' ||
    COALESCE(NEW.brand, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to update search_vector on insert/update
CREATE TRIGGER update_catalog_search_vector_trigger
  BEFORE INSERT OR UPDATE ON catalog_items
  FOR EACH ROW
  EXECUTE FUNCTION update_catalog_search_vector();

-- Trigger to update updated_at timestamp on catalog_items
CREATE TRIGGER update_catalog_items_updated_at
  BEFORE UPDATE ON catalog_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert sample catalog items for testing
/*
INSERT INTO catalog_items (name, category, image_url, thumbnail_url, tags, brand, color, season, style) VALUES
('Classic White T-Shirt', 'top', 'https://example.com/white-tshirt.jpg', 'https://example.com/white-tshirt-thumb.jpg', ARRAY['basic', 'cotton', 'versatile'], 'Generic', 'white', 'all-season', ARRAY['casual']),
('Blue Denim Jacket', 'outerwear', 'https://example.com/denim-jacket.jpg', 'https://example.com/denim-jacket-thumb.jpg', ARRAY['denim', 'casual', 'blue'], 'Levi''s', 'blue', 'all-season', ARRAY['casual']),
('Black Leather Boots', 'shoes', 'https://example.com/leather-boots.jpg', 'https://example.com/leather-boots-thumb.jpg', ARRAY['leather', 'boots', 'black'], 'Dr. Martens', 'black', 'fall', ARRAY['casual', 'formal']),
('Gray Wool Sweater', 'top', 'https://example.com/gray-sweater.jpg', 'https://example.com/gray-sweater-thumb.jpg', ARRAY['wool', 'warm', 'cozy'], 'Uniqlo', 'gray', 'winter', ARRAY['casual']),
('Black Slim Fit Jeans', 'bottom', 'https://example.com/black-jeans.jpg', 'https://example.com/black-jeans-thumb.jpg', ARRAY['denim', 'slim-fit', 'versatile'], 'Levi''s', 'black', 'all-season', ARRAY['casual', 'formal']);
*/

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE catalog_items IS 'Pre-populated catalog of clothing items that users can add to their closets';
COMMENT ON COLUMN clothes.catalog_item_id IS 'Optional reference to catalog item if added from catalog';
COMMENT ON FUNCTION search_catalog IS 'Full-text search of catalog with filtering and pagination';
COMMENT ON FUNCTION add_catalog_item_to_closet IS 'Add a catalog item to user''s closet (checks quota and duplicates)';
