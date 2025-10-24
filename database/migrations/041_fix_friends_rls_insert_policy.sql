-- Migration 041: Fix Friends Table RLS Insert Policy
-- This migration fixes the RLS policy for inserting friend requests
-- to allow users to send friend requests without the ordering constraint

BEGIN;

-- ============================================
-- 1. DROP EXISTING INSERT POLICY
-- ============================================

-- Drop the existing insert policy that requires ordering
DROP POLICY IF EXISTS "Users can send friend requests" ON friends;

-- ============================================
-- 2. CREATE NEW INSERT POLICY WITHOUT ORDERING CONSTRAINT
-- ============================================

-- Users can send friend requests (as the actual requester)
-- This allows the authenticated user to be the requester_id
CREATE POLICY "Users can send friend requests" ON friends
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        auth.uid() = requester_id AND
        requester_id != receiver_id AND
        status = 'pending'
    );

-- ============================================
-- 3. VERIFY POLICY WAS CREATED
-- ============================================

-- Check that the policy was created successfully
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
WHERE tablename = 'friends' AND policyname = 'Users can send friend requests';

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================

-- After running this migration, test with:
-- INSERT INTO friends (requester_id, receiver_id, status) 
-- VALUES (auth.uid(), 'some-other-user-id', 'pending');
