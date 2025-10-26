-- Migration 039: Comprehensive Friends Table Fix
-- This migration fixes all friends table RLS issues and ensures
-- friend requests can be sent successfully

BEGIN;

-- ============================================
-- 1. VERIFY FRIENDS TABLE STRUCTURE
-- ============================================

-- Check if friends table exists and has correct structure
DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'friends' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Friends table does not exist!';
    END IF;
    
    -- Check if required columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'friends' AND column_name = 'requester_id') THEN
        RAISE EXCEPTION 'requester_id column missing from friends table!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'friends' AND column_name = 'receiver_id') THEN
        RAISE EXCEPTION 'receiver_id column missing from friends table!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'friends' AND column_name = 'status') THEN
        RAISE EXCEPTION 'status column missing from friends table!';
    END IF;
    
    RAISE NOTICE '✅ Friends table structure verified';
END $$;

-- ============================================
-- 2. ENABLE RLS AND DROP ALL EXISTING POLICIES
-- ============================================

-- Ensure RLS is enabled
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
-- 3. CREATE COMPREHENSIVE RLS POLICIES
-- ============================================

-- Policy 1: Users can view their own friendships (both sent and received)
CREATE POLICY "Users can view own friendships" ON friends
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            auth.uid() = requester_id OR auth.uid() = receiver_id
        )
    );

-- Policy 2: Users can send friend requests (with proper ordering constraint)
CREATE POLICY "Users can send friend requests" ON friends
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        auth.uid() = requester_id AND
        requester_id < receiver_id AND
        status = 'pending' AND
        requester_id != receiver_id
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
-- 4. GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant table permissions to authenticated users
GRANT SELECT ON public.friends TO authenticated;
GRANT INSERT ON public.friends TO authenticated;
GRANT UPDATE ON public.friends TO authenticated;
GRANT DELETE ON public.friends TO authenticated;

-- Grant permissions to service_role (for any triggers or functions)
GRANT SELECT ON public.friends TO service_role;
GRANT INSERT ON public.friends TO service_role;
GRANT UPDATE ON public.friends TO service_role;
GRANT DELETE ON public.friends TO service_role;

-- ============================================
-- 5. VERIFY POLICIES WERE CREATED
-- ============================================

-- Check that all policies were created successfully
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    '✅ Policy created' as status
FROM pg_policies 
WHERE tablename = 'friends'
ORDER BY policyname;

-- ============================================
-- 6. TEST POLICY PERMISSIONS
-- ============================================

-- Test that we can query the friends table
DO $$
DECLARE
    policy_count INTEGER;
    rls_enabled BOOLEAN;
BEGIN
    -- Check RLS is enabled
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class 
    WHERE relname = 'friends' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    IF NOT rls_enabled THEN
        RAISE EXCEPTION 'RLS is not enabled on friends table!';
    END IF;
    
    -- Check policy count
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'friends';
    
    IF policy_count < 4 THEN
        RAISE EXCEPTION 'Not all policies were created! Expected 4, got %', policy_count;
    END IF;
    
    RAISE NOTICE '✅ RLS enabled and % policies created', policy_count;
END $$;

-- ============================================
-- 7. CREATE HELPER FUNCTION FOR FRIEND REQUESTS
-- ============================================

-- Create a helper function to safely create friend requests
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
    
    -- Ensure proper ordering (requester_id < receiver_id)
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
    
    -- Create the friend request
    INSERT INTO friends (requester_id, receiver_id, status)
    VALUES (requester_id, receiver_id, 'pending');
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'requester_id', requester_id,
        'receiver_id', receiver_id,
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

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION create_friend_request(UUID) TO authenticated;

-- ============================================
-- 8. VERIFICATION QUERIES
-- ============================================

-- Final verification
SELECT '
╔════════════════════════════════════════════════════════════╗
║  ✅ MIGRATION 039 COMPLETED SUCCESSFULLY!                  ║
╚════════════════════════════════════════════════════════════╝

📋 What was fixed:
  ✅ Verified friends table structure
  ✅ Enabled RLS on friends table
  ✅ Dropped all conflicting policies
  ✅ Created comprehensive RLS policies
  ✅ Granted necessary permissions
  ✅ Created helper function for friend requests
  ✅ Verified all policies and permissions

🔍 RLS Policies Created:
  ✅ Users can view own friendships (SELECT)
  ✅ Users can send friend requests (INSERT with ordering)
  ✅ Users can accept friend requests (UPDATE)
  ✅ Users can delete own friendships (DELETE)

🧪 Test now:
  1. Try sending a friend request from the frontend
  2. Check Supabase → Logs → Postgres Logs for success messages
  3. Verify friend request appears in friends table
  4. Test accepting/rejecting friend requests

🐛 If still failing:
  - Check Supabase → Logs → Postgres Logs for specific error messages
  - Look for RLS policy violations
  - Verify user authentication status
  - Check if the helper function works: SELECT create_friend_request(''target-user-id'');

' as result;

COMMIT;

COMMENT ON SCHEMA public IS 'StyleSnap friends table RLS fix applied (migration 039)';
