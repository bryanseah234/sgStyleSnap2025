-- Migration 028: Fix User Creation RLS Issue
-- This migration fixes the issue where new users cannot be created
-- because the trigger function is being blocked by RLS policies
--
-- Problem: sync_auth_user_to_public() trigger is failing to insert
-- new users into public.users table due to RLS restrictions
--
-- Solution: Add proper RLS policy and ensure trigger has correct permissions

BEGIN;

-- ============================================
-- 1. DROP OLD RESTRICTIVE INSERT POLICY
-- ============================================

-- Remove the old admin-only insert policy
DROP POLICY IF EXISTS "Admin can insert users" ON users;

-- ============================================
-- 2. CREATE NEW INSERT POLICY FOR SERVICE ROLE
-- ============================================

-- Allow service_role to insert users (used by triggers)
-- This is needed because triggers run as the postgres user
-- but the RLS policies still apply
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

-- ============================================
-- 3. ENSURE TRIGGER FUNCTION HAS CORRECT GRANTS
-- ============================================

-- Make sure the function can be executed by postgres and service_role
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;

-- Grant necessary table permissions
GRANT INSERT ON public.users TO service_role;
GRANT INSERT ON public.users TO postgres;
GRANT SELECT ON public.users TO service_role;
GRANT SELECT ON public.users TO postgres;

-- ============================================
-- 4. VERIFICATION
-- ============================================

-- Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    '✅ Policy exists' as status
FROM pg_policies
WHERE tablename = 'users' 
  AND policyname = 'Service role can insert users';

-- ============================================
-- 5. ADD MISSING UNIQUE CONSTRAINT ON USERNAME
-- ============================================

-- Add unique constraint to prevent duplicate usernames
-- This was missing from the original schema
DO $$
BEGIN
    -- Only add if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_username_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
        RAISE NOTICE '✅ Added unique constraint on username';
    ELSE
        RAISE NOTICE 'ℹ️ Unique constraint on username already exists';
    END IF;
END $$;

-- ============================================
-- 6. TEST THE FIX
-- ============================================

-- Log success message
SELECT '
╔════════════════════════════════════════════════════════════╗
║  ✅ MIGRATION 028 COMPLETED SUCCESSFULLY!                  ║
╚════════════════════════════════════════════════════════════╝

📋 Changes made:
  ✅ Removed restrictive "Admin can insert users" policy
  ✅ Added "Service role can insert users" policy
  ✅ Granted execute permissions to trigger functions
  ✅ Granted table permissions to service_role and postgres
  ✅ Added unique constraint on username (if missing)

🔍 What this fixes:
  - New users can now sign up successfully
  - The sync_auth_user_to_public() trigger can insert into public.users
  - Existing users can still login normally
  - Username uniqueness is now enforced at database level

🧪 Test now:
  1. Try creating a new user via Google OAuth
  2. Check Supabase → Logs → Postgres Logs for success messages
  3. Verify user appears in public.users table

' as result;

COMMIT;

COMMENT ON SCHEMA public IS 'StyleSnap user creation RLS fix applied (migration 028)';

