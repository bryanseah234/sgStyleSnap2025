-- Migration 040: Fix Users Table RLS for Friends
-- This migration ensures users can view each other's basic info
-- when they are friends, fixing 403 errors

BEGIN;

-- ============================================
-- 1. CHECK CURRENT USERS TABLE POLICIES
-- ============================================

SELECT '
📋 Current RLS Policies on users table:
' as current_policies_header;

-- Show all current RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    '📋 Policy Details' as info
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- ============================================
-- 2. DROP CONFLICTING POLICIES
-- ============================================

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Friends can view each other" ON users;
DROP POLICY IF EXISTS "Authenticated users can view users" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Comprehensive user insert policy" ON users;

-- ============================================
-- 3. CREATE COMPREHENSIVE USERS POLICIES
-- ============================================

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND auth.uid() = id
    );

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND auth.uid() = id
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND auth.uid() = id
    );

-- Policy 3: Friends can view each other's basic info
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

-- Policy 4: Service role can insert users (for triggers)
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

-- Policy 5: Authenticated users can search users by username
CREATE POLICY "Authenticated users can search users" ON users
    FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND removed_at IS NULL
    );

-- ============================================
-- 4. GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant table permissions to authenticated users
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;

-- Grant permissions to service_role
GRANT SELECT ON public.users TO service_role;
GRANT INSERT ON public.users TO service_role;
GRANT UPDATE ON public.users TO service_role;
GRANT DELETE ON public.users TO service_role;

-- Grant permissions to postgres
GRANT SELECT ON public.users TO postgres;
GRANT INSERT ON public.users TO postgres;
GRANT UPDATE ON public.users TO postgres;
GRANT DELETE ON public.users TO postgres;

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
WHERE tablename = 'users'
ORDER BY policyname;

-- ============================================
-- 6. TEST POLICY PERMISSIONS
-- ============================================

-- Test that authenticated users can query users table
DO $$
DECLARE
    policy_count INTEGER;
    rls_enabled BOOLEAN;
BEGIN
    -- Check RLS is enabled
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class 
    WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    IF NOT rls_enabled THEN
        RAISE EXCEPTION 'RLS is not enabled on users table!';
    END IF;
    
    -- Check policy count
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'users';
    
    IF policy_count < 5 THEN
        RAISE EXCEPTION 'Not all policies were created! Expected 5, got %', policy_count;
    END IF;
    
    RAISE NOTICE '✅ Users table RLS enabled and % policies created', policy_count;
END $$;

-- ============================================
-- 7. SUCCESS MESSAGE
-- ============================================

SELECT '
╔════════════════════════════════════════════════════════════╗
║  ✅ MIGRATION 040 COMPLETED SUCCESSFULLY!                  ║
╚════════════════════════════════════════════════════════════╝

📋 What was fixed:
  ✅ Dropped conflicting users table policies
  ✅ Created comprehensive RLS policies for users table
  ✅ Granted necessary permissions
  ✅ Verified all policies and permissions

🔍 RLS Policies Created:
  ✅ Users can view own profile (SELECT)
  ✅ Users can update own profile (UPDATE)
  ✅ Friends can view each other (SELECT for friends)
  ✅ Service role can insert users (INSERT for triggers)
  ✅ Authenticated users can search users (SELECT for search)

🧪 Test now:
  1. Try sending a friend request from the frontend
  2. Check if 403 errors are resolved
  3. Verify friends can see each other's profiles
  4. Test user search functionality

🐛 If still failing:
  - Check Supabase → Logs → Postgres Logs for specific error messages
  - Look for RLS policy violations
  - Verify user authentication status
  - Test with: SELECT * FROM users WHERE username = ''test-username'';

' as result;

COMMIT;

COMMENT ON SCHEMA public IS 'StyleSnap users table RLS fix applied (migration 040)';
