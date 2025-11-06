-- ============================================
-- Migration 023: Friends Table Comprehensive Fixes
-- ============================================
-- Purpose: Fixes all RLS policies, constraints, and functions related to friends functionality
-- Dependencies: 001_initial_schema.sql, 020_add_outfits_table.sql, 009_notifications_system.sql
-- Creates:
--   - get_friend_outfits() function
--   - create_friend_request() helper function
--   - Updates approve_friend_outfit_suggestion() function
-- Modifies:
--   - friends table (RLS policies, constraints)
--   - users table (RLS policies for friends)
--   - friend_outfit_suggestions table (outfit_id column)
-- 
-- IMPORTANT: Run migrations in sequential order!
-- ============================================

-- This file is re-runnable - safe to execute multiple times

BEGIN;

-- ============================================
-- STEP 1: VERIFY FRIENDS TABLE EXISTS
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'friends' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Friends table does not exist! Run migration 001_initial_schema.sql first.';
    END IF;
    
    RAISE NOTICE '✅ Friends table structure verified';
END $$;

-- ============================================
-- STEP 2: FIX FRIENDS TABLE CONSTRAINTS
-- ============================================

-- Remove ordering constraint that was causing constraint violations
-- The UNIQUE constraint on (requester_id, receiver_id) still prevents duplicates
ALTER TABLE friends DROP CONSTRAINT IF EXISTS friends_check;

-- ============================================
-- STEP 3: ENABLE RLS AND DROP EXISTING POLICIES
-- ============================================

-- Ensure RLS is enabled on friends table
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own friendships" ON friends;
DROP POLICY IF EXISTS "Users can send friend requests" ON friends;
DROP POLICY IF EXISTS "Users can accept friend requests" ON friends;
DROP POLICY IF EXISTS "Users can delete own friendships" ON friends;
DROP POLICY IF EXISTS "Users can view own friend requests" ON friends;
DROP POLICY IF EXISTS "Users can update own friend requests" ON friends;
DROP POLICY IF EXISTS "Authenticated users can view friends" ON friends;
DROP POLICY IF EXISTS "Authenticated users can insert friends" ON friends;
DROP POLICY IF EXISTS "Authenticated users can update friends" ON friends;
DROP POLICY IF EXISTS "Authenticated users can delete friends" ON friends;

-- ============================================
-- STEP 4: CREATE COMPREHENSIVE FRIENDS RLS POLICIES
-- ============================================

-- Policy 1: Users can view their own friendships (both sent and received)
CREATE POLICY "Users can view own friendships" ON friends
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            auth.uid() = requester_id OR auth.uid() = receiver_id
        )
    );

-- Policy 2: Users can send friend requests (as requester, no ordering constraint)
CREATE POLICY "Users can send friend requests" ON friends
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        auth.uid() = requester_id AND
        requester_id != receiver_id AND
        status = 'pending'
    );

-- Policy 3: Only the receiver can accept/reject pending requests
CREATE POLICY "Users can accept friend requests" ON friends
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND
        auth.uid() = receiver_id AND
        status = 'pending'
    )
    WITH CHECK (
        auth.uid() = receiver_id AND
        status IN ('accepted', 'rejected')
    );

-- Policy 4: Either party can delete the friendship
CREATE POLICY "Users can delete own friendships" ON friends
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND (
            auth.uid() = requester_id OR auth.uid() = receiver_id
        )
    );

-- ============================================
-- STEP 5: FIX USERS TABLE RLS FOR FRIENDS
-- ============================================

-- Ensure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Friends can view each other" ON users;
DROP POLICY IF EXISTS "Authenticated users can search users" ON users;

-- Policy: Friends can view each other's basic info
CREATE POLICY "Friends can view each other" ON users
    FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND removed_at IS NULL
        AND EXISTS (
            SELECT 1 FROM friends
            WHERE status = 'accepted'
            AND (
                (requester_id = auth.uid() AND receiver_id = id) OR
                (requester_id = id AND receiver_id = auth.uid())
            )
        )
    );

-- Policy: Authenticated users can search users (for friend search)
CREATE POLICY "Authenticated users can search users" ON users
    FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND removed_at IS NULL
    );

-- ============================================
-- STEP 6: GRANT NECESSARY PERMISSIONS
-- ============================================

-- Friends table permissions
GRANT SELECT ON public.friends TO authenticated;
GRANT INSERT ON public.friends TO authenticated;
GRANT UPDATE ON public.friends TO authenticated;
GRANT DELETE ON public.friends TO authenticated;

-- Users table permissions
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;

-- Service role permissions (for triggers/functions)
GRANT SELECT ON public.friends TO service_role;
GRANT INSERT ON public.friends TO service_role;
GRANT UPDATE ON public.friends TO service_role;
GRANT DELETE ON public.friends TO service_role;
GRANT SELECT ON public.users TO service_role;
GRANT INSERT ON public.users TO service_role;
GRANT UPDATE ON public.users TO service_role;

-- ============================================
-- STEP 7: CREATE HELPER FUNCTIONS
-- ============================================

-- Helper function to safely create friend requests
CREATE OR REPLACE FUNCTION create_friend_request(
    target_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    current_user_id UUID;
    requester_id UUID;
    receiver_id UUID;
    result JSON;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not authenticated'
        );
    END IF;
    
    -- Ensure proper ordering (requester_id < receiver_id) for consistency
    IF current_user_id < target_user_id THEN
        requester_id := current_user_id;
        receiver_id := target_user_id;
    ELSE
        requester_id := target_user_id;
        receiver_id := current_user_id;
    END IF;
    
    -- Check if friendship already exists
    IF EXISTS (
        SELECT 1 FROM friends 
        WHERE requester_id = requester_id AND receiver_id = receiver_id
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Friendship already exists'
        );
    END IF;
    
    -- Create the friend request (authenticated user must be requester)
    INSERT INTO friends (requester_id, receiver_id, status)
    VALUES (current_user_id, target_user_id, 'pending');
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'requester_id', current_user_id,
        'receiver_id', target_user_id,
        'status', 'pending'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_friend_request(UUID) TO authenticated;

-- ============================================
-- STEP 8: CREATE/FIX get_friend_outfits FUNCTION
-- ============================================

-- Function to get friend's outfits (only if they are friends)
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
    o.occasion::TEXT,          -- Cast VARCHAR(50) to TEXT
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_friend_outfits(UUID, UUID, INTEGER) TO authenticated;

-- ============================================
-- STEP 9: FIX approve_friend_outfit_suggestion FUNCTION
-- ============================================

-- Update friend_outfit_suggestions table structure if needed
DO $$
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'friend_outfit_suggestions_generated_outfit_id_fkey'
    AND table_name = 'friend_outfit_suggestions'
  ) THEN
    ALTER TABLE friend_outfit_suggestions 
      DROP CONSTRAINT friend_outfit_suggestions_generated_outfit_id_fkey;
  END IF;

  -- Drop old column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'friend_outfit_suggestions' 
    AND column_name = 'generated_outfit_id'
  ) THEN
    ALTER TABLE friend_outfit_suggestions DROP COLUMN generated_outfit_id;
  END IF;
END $$;

-- Add outfit_id column if it doesn't exist
ALTER TABLE friend_outfit_suggestions
  ADD COLUMN IF NOT EXISTS outfit_id UUID REFERENCES outfits(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_friend_outfit_suggestions_outfit_id ON friend_outfit_suggestions(outfit_id);

-- Update approve_friend_outfit_suggestion function
CREATE OR REPLACE FUNCTION approve_friend_outfit_suggestion(p_suggestion_id UUID)
RETURNS UUID AS $$
DECLARE
  v_suggestion RECORD;
  v_outfit_id UUID;
  v_item JSONB;
  v_clothes_id UUID;
BEGIN
  -- Get suggestion details
  SELECT * INTO v_suggestion
  FROM friend_outfit_suggestions
  WHERE id = p_suggestion_id
    AND owner_id = auth.uid()
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Suggestion not found or already processed';
  END IF;
  
  -- Create outfit
  INSERT INTO outfits (
    owner_id,
    outfit_name,
    description,
    is_public,
    is_favorite
  ) VALUES (
    v_suggestion.owner_id,
    COALESCE(v_suggestion.message, 'Outfit Suggested by Friend'),
    'Created from friend suggestion',
    false,
    false
  ) RETURNING id INTO v_outfit_id;
  
  -- Add outfit items from the JSONB outfit_items array
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_suggestion.outfit_items)
  LOOP
    -- Extract the clothes_id (could be clothing_item_id or clothes_id)
    v_clothes_id := v_item->>'clothes_id';
    
    -- If clothes_id is not present, try clothing_item_id
    IF v_clothes_id IS NULL THEN
      v_clothes_id := v_item->>'clothing_item_id';
    END IF;
    
    -- Skip if no valid ID
    IF v_clothes_id IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Insert outfit item with positioning data
    INSERT INTO outfit_items (
      outfit_id,
      clothing_item_id,
      x_position,
      y_position,
      z_index,
      scale,
      rotation
    ) VALUES (
      v_outfit_id,
      v_clothes_id::UUID,
      COALESCE((v_item->>'x_position')::DECIMAL, 0),
      COALESCE((v_item->>'y_position')::DECIMAL, 0),
      COALESCE((v_item->>'z_index')::INTEGER, 1),
      COALESCE((v_item->>'scale')::DECIMAL, 1.0),
      COALESCE((v_item->>'rotation')::DECIMAL, 0)
    )
    ON CONFLICT (outfit_id, clothing_item_id) DO NOTHING;
  END LOOP;
  
  -- Update suggestion status
  UPDATE friend_outfit_suggestions
  SET 
    status = 'approved',
    outfit_id = v_outfit_id,
    responded_at = NOW()
  WHERE id = p_suggestion_id;
  
  -- Mark notification as read
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE reference_id = p_suggestion_id
    AND recipient_id = auth.uid()
    AND type = 'friend_outfit_suggestion';
  
  RETURN v_outfit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION approve_friend_outfit_suggestion(UUID) TO authenticated;

-- ============================================
-- STEP 10: VERIFICATION
-- ============================================

-- Verify RLS is enabled
DO $$
DECLARE
    friends_rls_enabled BOOLEAN;
    users_rls_enabled BOOLEAN;
    friends_policy_count INTEGER;
    users_policy_count INTEGER;
BEGIN
    -- Check friends RLS
    SELECT relrowsecurity INTO friends_rls_enabled
    FROM pg_class 
    WHERE relname = 'friends' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    IF NOT friends_rls_enabled THEN
        RAISE EXCEPTION 'RLS is not enabled on friends table!';
    END IF;
    
    -- Check users RLS
    SELECT relrowsecurity INTO users_rls_enabled
    FROM pg_class 
    WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    IF NOT users_rls_enabled THEN
        RAISE EXCEPTION 'RLS is not enabled on users table!';
    END IF;
    
    -- Check policy counts
    SELECT COUNT(*) INTO friends_policy_count FROM pg_policies WHERE tablename = 'friends';
    SELECT COUNT(*) INTO users_policy_count FROM pg_policies WHERE tablename = 'users' AND policyname LIKE '%friend%' OR policyname LIKE '%search%';
    
    RAISE NOTICE '✅ Friends table RLS enabled with % policies', friends_policy_count;
    RAISE NOTICE '✅ Users table RLS enabled with friend/search policies';
END $$;

COMMIT;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION create_friend_request IS 'Helper function to safely create friend requests with proper handling';
COMMENT ON FUNCTION get_friend_outfits IS 'Returns friend outfits only if users are friends';
COMMENT ON FUNCTION approve_friend_outfit_suggestion IS 'Approve suggestion and add outfit to user collection using outfits and outfit_items tables';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- After running this migration, verify with:
-- 1. Check RLS is enabled:
--    SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('friends', 'users');

-- 2. Check policies exist:
--    SELECT policyname, cmd FROM pg_policies WHERE tablename IN ('friends', 'users') ORDER BY tablename, policyname;

-- 3. Test friend request creation:
--    SELECT create_friend_request('target-user-id');

-- 4. Test getting friend outfits:
--    SELECT * FROM get_friend_outfits('friend-id', 'viewer-id', 10);

