-- Migration 017: Fix catalog_items privacy field in auto-contribution
-- Purpose: Ensure auto-contributed items have privacy='public' so they appear in catalog
-- Date: 2024-01-XX
-- Author: System

-- ============================================
-- UPDATE AUTO-CONTRIBUTION FUNCTION
-- ============================================

-- Update the auto_contribute_to_catalog function to include privacy field
CREATE OR REPLACE FUNCTION auto_contribute_to_catalog()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only auto-contribute if:
  -- 1. This is a new item (INSERT)
  -- 2. It's not already linked to a catalog item (catalog_item_id IS NULL)
  -- 3. It has valid image URLs
  IF (TG_OP = 'INSERT' AND 
      NEW.catalog_item_id IS NULL AND 
      NEW.image_url IS NOT NULL AND 
      NEW.thumbnail_url IS NOT NULL) THEN
    
    -- Check if this exact image already exists in catalog
    -- (prevents duplicate catalog entries for same image)
    IF NOT EXISTS (
      SELECT 1 FROM catalog_items 
      WHERE image_url = NEW.image_url
    ) THEN
      -- Insert into catalog (without owner_id for anonymity)
      INSERT INTO catalog_items (
        name,
        category,
        image_url,
        thumbnail_url,
        tags,
        brand,
        color,
        season,
        style,
        privacy,
        is_active
      ) VALUES (
        NEW.name,
        NEW.category,
        NEW.image_url,
        NEW.thumbnail_url,
        NEW.style_tags,
        NEW.brand,
        NEW.primary_color,
        'all-season', -- Default season
        NEW.style_tags, -- Use style_tags as style array
        'public', -- Make catalog items public by default
        true
      )
      ON CONFLICT (image_url) DO NOTHING; -- Safety: prevent duplicates
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- UPDATE EXISTING CATALOG ITEMS
-- ============================================

-- Update any existing catalog items that don't have privacy set
UPDATE catalog_items 
SET privacy = 'public' 
WHERE privacy IS NULL;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION auto_contribute_to_catalog IS 'Automatically adds user uploads to catalog_items table (anonymous, no owner_id). Now includes privacy=public to ensure items appear in catalog.';
