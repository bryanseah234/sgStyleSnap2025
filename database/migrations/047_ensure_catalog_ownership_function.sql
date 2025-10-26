-- ============================================
-- Migration: Ensure Catalog Ownership Function Exists
-- Description: Creates or replaces the is_catalog_item_owned function
--              to check if a user already owns a catalog item
-- Date: 2025-10-25
-- ============================================

-- Drop existing function if it exists (handles signature changes)
DROP FUNCTION IF EXISTS is_catalog_item_owned(UUID, UUID);
DROP FUNCTION IF EXISTS is_catalog_item_owned(user_id_param UUID, catalog_item_id UUID);

-- Create the function to check if user owns a catalog item
CREATE OR REPLACE FUNCTION is_catalog_item_owned(
  user_id_param UUID,
  catalog_item_id UUID
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

COMMENT ON FUNCTION is_catalog_item_owned IS 'Helper function to check if user already owns a catalog item (or similar item) using multiple matching criteria. Used for duplicate detection.';

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION is_catalog_item_owned(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_catalog_item_owned(UUID, UUID) TO anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 047: Catalog ownership function created successfully';
END $$;

