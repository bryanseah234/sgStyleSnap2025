-- ============================================
-- Fix Users Table RLS for Friends Queries
-- ============================================
-- This migration adds a specific RLS policy to allow friends to view each other's
-- basic profile information when querying through the friends table.

BEGIN;

-- ============================================
-- 1. ADD FRIENDS CAN VIEW EACH OTHER POLICY
-- ============================================

-- Allow friends to view each other's basic profile information
-- This is needed for the friends service to work properly
DROP POLICY IF EXISTS "Friends can view each other" ON users;
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

-- ============================================
-- 2. VERIFY POLICY WAS CREATED
-- ============================================

-- Check that the policy was created successfully
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users' AND policyname = 'Friends can view each other';

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================

-- After running this migration, test with:
-- SELECT * FROM users WHERE id IN (
--   SELECT CASE 
--     WHEN requester_id = auth.uid() THEN receiver_id 
--     ELSE requester_id 
--   END
--   FROM friends 
--   WHERE status = 'accepted' 
--   AND (requester_id = auth.uid() OR receiver_id = auth.uid())
-- );
