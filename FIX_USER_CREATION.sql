-- Complete fix for user creation issue
-- Run this entire script in Supabase SQL Editor

BEGIN;

-- ============================================
-- 1. DROP ALL EXISTING USER INSERT POLICIES
-- ============================================
DROP POLICY IF EXISTS "Admin can insert users" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON users;

-- ============================================
-- 2. CREATE PERMISSIVE POLICY FOR USER INSERTION
-- ============================================
-- This allows the auth trigger (running as postgres/service_role) to insert
CREATE POLICY "Allow authenticated user creation" ON users
    FOR INSERT 
    WITH CHECK (true);

-- ============================================
-- 3. ENSURE TRIGGER FUNCTION EXISTS AND IS CORRECT
-- ============================================
-- Check if function exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'sync_auth_user_to_public'
    ) THEN
        RAISE EXCEPTION 'Function sync_auth_user_to_public does not exist! Need to run migration 026 first.';
    END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO authenticated;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO anon;

-- ============================================
-- 4. GRANT TABLE PERMISSIONS
-- ============================================
GRANT ALL ON public.users TO postgres;
GRANT ALL ON public.users TO service_role;
GRANT INSERT, SELECT, UPDATE ON public.users TO authenticated;

-- ============================================
-- 5. CHECK AND FIX USERNAME CONSTRAINT
-- ============================================
-- Make username nullable temporarily to allow auto-generation
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;

-- Ensure unique constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_username_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
    END IF;
END $$;

-- ============================================
-- 6. VERIFY TRIGGER EXISTS
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'sync_auth_user_to_public'
          AND event_object_schema = 'auth'
          AND event_object_table = 'users'
    ) THEN
        RAISE WARNING 'Trigger sync_auth_user_to_public does not exist! Creating it now...';
        
        -- Create the trigger
        CREATE TRIGGER sync_auth_user_to_public
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION sync_auth_user_to_public();
    END IF;
END $$;

COMMIT;

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================
SELECT '✅ User creation fix applied!' as status;

SELECT 'Policies:' as check_type, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'users' AND cmd = 'INSERT'
UNION ALL
SELECT 'Triggers:', trigger_name, event_manipulation, ''
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

