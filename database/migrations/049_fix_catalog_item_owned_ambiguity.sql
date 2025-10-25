-- Migration 049: Fix Ambiguous Column Reference in is_catalog_item_owned Function
-- This migration fixes the ambiguous column reference error in the is_catalog_item_owned function
-- by properly qualifying the parameter name to avoid conflict with table columns

BEGIN;

-- ============================================
-- 1. DROP EXISTING FUNCTION
-- ============================================

-- Drop the existing function that has the ambiguous reference
DROP FUNCTION IF EXISTS is_catalog_item_owned(UUID, UUID);
DROP FUNCTION IF EXISTS is_catalog_item_owned(user_id_param UUID, catalog_item_id UUID);

-- ============================================
-- 2. CREATE FIXED FUNCTION WITH PROPER PARAMETER QUALIFICATION
-- ============================================

-- Helper function to check if a catalog item is already owned by user
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

COMMENT ON FUNCTION is_catalog_item_owned IS 'Helper function to check if user already owns a catalog item (or similar item) using multiple matching criteria. Fixed ambiguous column reference by renaming parameter.';

-- ============================================
-- 3. GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION is_catalog_item_owned(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_catalog_item_owned(UUID, UUID) TO anon;

-- ============================================
-- 4. VERIFY FUNCTION WAS CREATED
-- ============================================

-- Check that the function was created successfully
SELECT 
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'is_catalog_item_owned'
  AND routine_schema = 'public';

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================

-- After running this migration, test with:
-- SELECT is_catalog_item_owned('user-uuid-here', 'catalog-item-uuid-here');
