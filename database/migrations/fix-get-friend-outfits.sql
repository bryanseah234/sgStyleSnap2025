-- Fix get_friend_outfits function to handle VARCHAR/TEXT type mismatch
-- Run this in your Supabase SQL Editor

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
    o.outfit_name::TEXT,        -- Cast VARCHAR(255) to TEXT
    o.description,
    o.occasion::TEXT,           -- Cast VARCHAR(50) to TEXT
    o.weather_condition::TEXT,  -- Cast VARCHAR(50) to TEXT
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_friend_outfits(UUID, UUID, INTEGER) TO authenticated;

