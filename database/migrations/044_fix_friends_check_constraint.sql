-- Migration 044: Fix Friends Check Constraint
-- This migration removes the ordering constraint from the friends table
-- that was causing "friends_check" constraint violations

BEGIN;

-- ============================================
-- 1. DROP EXISTING CHECK CONSTRAINT
-- ============================================

-- Drop the existing check constraint that enforces requester_id < receiver_id
ALTER TABLE friends DROP CONSTRAINT IF EXISTS friends_check;

-- ============================================
-- 2. VERIFY CONSTRAINT WAS REMOVED
-- ============================================

-- Check that the constraint was removed successfully
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'friends'
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'CHECK'
ORDER BY tc.constraint_name;

-- ============================================
-- 3. VERIFY TABLE STRUCTURE
-- ============================================

-- Show current friends table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'friends'
  AND table_schema = 'public'
ORDER BY ordinal_position;

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================

-- After running this migration, test with:
-- INSERT INTO friends (requester_id, receiver_id, status) 
-- VALUES ('user-uuid-1', 'user-uuid-2', 'pending');

-- Note: The UNIQUE constraint on (requester_id, receiver_id) still prevents duplicates
-- and the RLS policies ensure proper access control
