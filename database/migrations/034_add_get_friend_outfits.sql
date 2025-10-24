-- ============================================
-- Add get_friend_outfits RPC Function
-- ============================================
-- This function allows friends to view each other's outfits
-- that are marked for friends privacy level.

BEGIN;

-- ============================================
-- 1. CREATE get_friend_outfits FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_friend_outfits(
  friend_id UUID,
  viewer_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  owner_id UUID,
  outfit_name TEXT,
  description TEXT,
  occasion TEXT,
  weather_condition TEXT,
  temperature INTEGER,
  is_public BOOLEAN,
  style_tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  removed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify that the viewer and friend are actually friends
  IF NOT EXISTS (
    SELECT 1 FROM friends
    WHERE status = 'accepted'
    AND (
      (requester_id = viewer_id AND receiver_id = friend_id) OR
      (requester_id = friend_id AND receiver_id = viewer_id)
    )
  ) THEN
    -- Return empty result if not friends
    RETURN;
  END IF;

  -- Return outfits that are either:
  -- 1. Public outfits (is_public = true)
  -- 2. Friends-level outfits (is_public = false) - these are visible to friends
  RETURN QUERY
  SELECT 
    o.id,
    o.owner_id,
    o.outfit_name,
    o.description,
    o.occasion,
    o.weather_condition,
    o.temperature,
    o.is_public,
    o.style_tags,
    o.created_at,
    o.updated_at,
    o.removed_at
  FROM outfits o
  WHERE o.owner_id = friend_id
    AND o.removed_at IS NULL
    AND (
      o.is_public = true OR  -- Public outfits visible to everyone
      o.is_public = false    -- Friends-level outfits visible to friends
    )
  ORDER BY o.created_at DESC
  LIMIT p_limit;
END;
$$;

-- ============================================
-- 2. GRANT EXECUTE PERMISSION
-- ============================================

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_friend_outfits(UUID, UUID, INTEGER) TO authenticated;

-- ============================================
-- 3. VERIFY FUNCTION WAS CREATED
-- ============================================

-- Check that the function was created successfully
SELECT 
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_friend_outfits'
  AND routine_schema = 'public';

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================

-- After running this migration, test with:
-- SELECT * FROM get_friend_outfits('friend-uuid', 'viewer-uuid', 10);

-- Note: This function will only return outfits if the users are friends
-- and the outfits are either public or friends-level privacy.
