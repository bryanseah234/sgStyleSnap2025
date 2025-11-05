-- Migration 063: Fix RLS Policies for Edge Function User Sync (NO TRIGGERS)
-- This migration fixes RLS policies WITHOUT creating triggers on auth.users
-- Perfect for webhook-based Edge Function approach
--
-- IMPORTANT: This does NOT create triggers on auth.users (which requires superuser)
-- Instead, it ensures the Edge Function can insert users when called via webhook

BEGIN;

-- ============================================
-- 1. CREATE HELPER FUNCTION FOR USERNAME GENERATION
-- ============================================

-- Create a function to generate unique usernames with conflict resolution
-- This is used by the Edge Function when inserting users
CREATE OR REPLACE FUNCTION generate_unique_username_for_sync(
  user_id UUID,
  email TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  candidate_username TEXT;
  counter INTEGER := 0;
  max_attempts INTEGER := 100;
BEGIN
  -- Extract base username from email
  IF email IS NOT NULL AND email != '' THEN
    base_username := LOWER(REGEXP_REPLACE(split_part(email, '@', 1), '[^a-zA-Z0-9]', '', 'g'));
    -- Ensure base username is not empty
    IF base_username IS NULL OR base_username = '' THEN
      base_username := 'user';
    END IF;
  ELSE
    base_username := 'user';
  END IF;

  -- Try base username first
  candidate_username := base_username;
  
  -- Check for conflicts and append number if needed
  WHILE EXISTS (
    SELECT 1 FROM public.users 
    WHERE username = candidate_username
  ) AND counter < max_attempts LOOP
    counter := counter + 1;
    candidate_username := base_username || counter::TEXT;
  END LOOP;
  
  -- If we hit max attempts, append UUID fragment
  IF counter >= max_attempts THEN
    candidate_username := base_username || '_' || SUBSTRING(user_id::TEXT, 1, 8);
  END IF;
  
  RETURN candidate_username;
END;
$$;

COMMENT ON FUNCTION generate_unique_username_for_sync IS 'Generates a unique username for user sync, handling conflicts. Used by Edge Function.';

-- ============================================
-- 2. ENSURE RLS POLICIES ALLOW INSERTS
-- ============================================

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Comprehensive user insert policy" ON users;
DROP POLICY IF EXISTS "Admin can insert users" ON users;
DROP POLICY IF EXISTS "Edge Function can insert users" ON users;

-- Create policy that allows service_role (used by Edge Function) to insert users
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

COMMENT ON POLICY "Service role can insert users" ON users IS 'Allows Edge Function (service_role) to insert new users when called via webhook';

-- ============================================
-- 3. ENSURE TABLE PERMISSIONS
-- ============================================

-- Grant all necessary permissions to service_role (used by Edge Function)
GRANT INSERT ON public.users TO service_role;
GRANT SELECT ON public.users TO service_role;
GRANT UPDATE ON public.users TO service_role;
GRANT INSERT ON public.users TO postgres;
GRANT SELECT ON public.users TO postgres;
GRANT UPDATE ON public.users TO postgres;

-- ============================================
-- 4. ENSURE FUNCTION PERMISSIONS
-- ============================================

-- Grant execute permissions on username generation function
GRANT EXECUTE ON FUNCTION generate_unique_username_for_sync(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION generate_unique_username_for_sync(UUID, TEXT) TO postgres;

-- ============================================
-- 5. CREATE/ENSURE APP_CONFIG TABLE EXISTS
-- ============================================

-- Create app_config table if it doesn't exist (for storing Supabase URL)
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions on app_config table (if Edge Function needs it)
GRANT SELECT ON app_config TO service_role;
GRANT SELECT ON app_config TO postgres;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify RLS policy exists
SELECT 
    '========== RLS POLICY CHECK ==========' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    '✅ Policy exists' as status
FROM pg_policies
WHERE tablename = 'users' 
  AND schemaname = 'public'
  AND policyname = 'Service role can insert users';

-- Verify function exists
SELECT 
    '========== FUNCTION CHECK ==========' as section,
    proname as function_name,
    CASE WHEN prosecdef THEN '✅ SECURITY DEFINER' ELSE '❌ No SECURITY DEFINER' END as security_type
FROM pg_proc 
WHERE proname = 'generate_unique_username_for_sync';

-- Verify table permissions
SELECT 
    '========== TABLE PERMISSIONS CHECK ==========' as section,
    grantee,
    privilege_type,
    '✅ Permission granted' as status
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND grantee IN ('service_role', 'postgres')
  AND privilege_type = 'INSERT';

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 
-- This migration does NOT create triggers on auth.users (which requires superuser)
-- Instead, it ensures your Edge Function can insert users when called via webhook
--
-- To complete the setup:
-- 1. Ensure Edge Function is deployed: supabase functions deploy sync-auth-users-realtime --no-verify-jwt
-- 2. Configure Database Webhook or Auth Webhook to call the Edge Function
-- 3. Test by signing up a new user
--
-- The Edge Function will use service_role key to insert users, which this migration enables

