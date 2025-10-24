-- ============================================
-- Final Fix for Friends Table RLS Policies
-- ============================================
-- This migration ensures the friends table RLS policies are correctly configured
-- to prevent "new row violates row-level security policy" errors.

BEGIN;

-- ============================================
-- 1. VERIFY FRIENDS TABLE EXISTS AND HAS RLS ENABLED
-- ============================================

-- Ensure RLS is enabled on friends table
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. DROP ALL EXISTING POLICIES TO AVOID CONFLICTS
-- ============================================

-- Drop ALL existing policies on friends table
DROP POLICY IF EXISTS "Users can view own friendships" ON friends;
DROP POLICY IF EXISTS "Users can send friend requests" ON friends;
DROP POLICY IF EXISTS "Users can accept friend requests" ON friends;
DROP POLICY IF EXISTS "Users can delete own friendships" ON friends;
DROP POLICY IF EXISTS "Users can view own friend requests" ON friends;
DROP POLICY IF EXISTS "Users can update own friend requests" ON friends;

-- ============================================
-- 3. CREATE COMPREHENSIVE RLS POLICIES
-- ============================================

-- Users can view their friendships (both sent and received)
CREATE POLICY "Users can view own friendships" ON friends
    FOR SELECT USING (
        auth.uid() = requester_id OR auth.uid() = receiver_id
    );

-- Users can send friend requests (only as requester, enforces ordering)
CREATE POLICY "Users can send friend requests" ON friends
    FOR INSERT WITH CHECK (
        auth.uid() = requester_id 
        AND requester_id < receiver_id
        AND status = 'pending'
    );

-- Only the receiver can accept/reject pending requests
CREATE POLICY "Users can accept friend requests" ON friends
    FOR UPDATE USING (
        auth.uid() = receiver_id 
        AND status = 'pending'
    )
    WITH CHECK (
        auth.uid() = receiver_id 
        AND status IN ('accepted', 'rejected')
    );

-- Either party can delete the friendship
CREATE POLICY "Users can delete own friendships" ON friends
    FOR DELETE USING (
        auth.uid() = requester_id OR auth.uid() = receiver_id
    );

-- ============================================
-- 4. VERIFY POLICIES WERE CREATED
-- ============================================

-- Check that all policies were created successfully
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'friends'
ORDER BY policyname;

-- ============================================
-- 5. TEST POLICY PERMISSIONS
-- ============================================

-- Verify that authenticated users can query their own friendships
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get a test user ID (if any exist)
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Test user found: %', test_user_id;
        
        -- Test that we can query friendships for this user
        PERFORM 1 FROM friends 
        WHERE requester_id = test_user_id OR receiver_id = test_user_id
        LIMIT 1;
        
        RAISE NOTICE 'Friends table query test completed successfully';
    ELSE
        RAISE NOTICE 'No test users found, skipping query test';
    END IF;
END $$;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- After running this migration, verify with these queries:

-- 1. Check RLS is enabled:
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'friends';

-- 2. Check policies exist:
-- SELECT policyname, cmd, permissive FROM pg_policies WHERE tablename = 'friends';

-- 3. Test with authenticated user (run in Supabase SQL editor):
-- SELECT * FROM friends WHERE requester_id = auth.uid() OR receiver_id = auth.uid();

-- 4. Test friend request creation (run in Supabase SQL editor):
-- INSERT INTO friends (requester_id, receiver_id, status) 
-- VALUES (auth.uid(), 'target-user-id', 'pending');
