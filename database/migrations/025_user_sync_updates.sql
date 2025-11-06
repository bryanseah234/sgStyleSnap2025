-- ============================================
-- Migration 025: User Sync Updates and Fixes
-- ============================================
-- Purpose: Comprehensive fixes for user synchronization from auth.users to public.users
-- Dependencies: 001_initial_schema.sql, 002_rls_policies.sql
-- Creates:
--   - generate_unique_username_for_sync() function
--   - sync_auth_user_to_public() function (for Edge Functions/webhooks)
--   - app_config table (for storing Supabase URL)
-- Modifies:
--   - users table (RLS policies for inserts)
-- 
-- IMPORTANT: This migration sets up webhook-based user sync (no triggers on auth.users)
-- Run migrations in sequential order!
-- ============================================

-- This file is re-runnable - safe to execute multiple times

BEGIN;

-- ============================================
-- STEP 1: CREATE APP_CONFIG TABLE
-- ============================================

-- Create app_config table for storing configuration (e.g., Supabase URL)
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions on app_config table
GRANT SELECT ON app_config TO service_role;
GRANT SELECT ON app_config TO postgres;
GRANT SELECT ON app_config TO authenticated;

-- ============================================
-- STEP 2: CREATE USERNAME GENERATION FUNCTION
-- ============================================

-- Function to generate unique usernames with conflict resolution
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
    IF base_username IS NULL OR base_username = '' THEN
      base_username := 'user';
    END IF;
  ELSE
    base_username := 'user';
  END IF;

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

COMMENT ON FUNCTION generate_unique_username_for_sync IS 'Generates a unique username for user sync, handling conflicts. Used by Edge Functions/webhooks.';

-- ============================================
-- STEP 3: CREATE SYNC FUNCTION (FOR EDGE FUNCTION/WEBHOOK)
-- ============================================

-- Function to sync auth users to public.users
-- This function is called by Edge Functions or webhooks, NOT by triggers
-- CRITICAL: This function MUST NEVER raise exceptions that would block auth
CREATE OR REPLACE FUNCTION sync_auth_user_to_public()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_name TEXT;
    user_avatar TEXT;
    user_google_id TEXT;
    generated_username TEXT;
BEGIN
    -- Wrap everything in exception handler to ensure we never block auth
    BEGIN
        RAISE NOTICE '========== NEW USER SYNC START ==========';
        RAISE NOTICE '👤 User ID: %', NEW.id;
        RAISE NOTICE '📧 Email: %', NEW.email;
        
        -- Check if user already exists
        IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
            RAISE NOTICE '✅ User already exists in public.users, skipping sync';
            RETURN NEW;
        END IF;

        -- Generate unique username
        BEGIN
            generated_username := generate_unique_username_for_sync(NEW.id, NEW.email);
        EXCEPTION WHEN OTHERS THEN
            -- Fallback username if generation fails
            generated_username := 'user' || SUBSTRING(NEW.id::TEXT, 1, 8);
            RAISE WARNING '⚠️ Username generation failed, using fallback: %', generated_username;
        END;

        RAISE NOTICE '👤 Generated username: %', generated_username;

        -- Extract user data from auth metadata
        user_name := COALESCE(
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1)
        );
        
        user_avatar := NEW.raw_user_meta_data->>'picture';
        
        user_google_id := COALESCE(
            NEW.raw_user_meta_data->>'sub',
            NEW.raw_user_meta_data->>'provider_id'
        );

        -- Insert the new user into public.users
        BEGIN
            INSERT INTO public.users (
                id,
                email,
                username,
                name,
                avatar_url,
                google_id,
                created_at,
                updated_at
            ) VALUES (
                NEW.id,
                NEW.email,
                generated_username,
                user_name,
                user_avatar,
                user_google_id,
                NEW.created_at,
                NEW.updated_at
            );
            
            RAISE NOTICE '✅ Successfully created user in public.users';
            RAISE NOTICE '✅ Username: %', generated_username;
        EXCEPTION
            WHEN unique_violation THEN
                RAISE WARNING '⚠️ User already exists (unique violation) - this is OK';
                -- Don't fail auth, just continue
            WHEN OTHERS THEN
                -- Log error but DON'T fail authentication
                RAISE WARNING '⚠️ Error inserting user: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
                RAISE NOTICE 'ℹ️ Authentication will continue despite sync error';
                -- Still return NEW to allow auth to proceed
        END;
        
        RAISE NOTICE '========== NEW USER SYNC COMPLETE ==========';
        
    EXCEPTION WHEN OTHERS THEN
        -- CRITICAL: Catch ANY exception and still return NEW
        -- This ensures authentication NEVER fails due to sync issues
        RAISE WARNING '⚠️ CRITICAL: Sync function error: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
        RAISE NOTICE 'ℹ️ Authentication will proceed despite sync failure';
    END;
    
    -- ALWAYS return NEW to allow auth to complete
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION sync_auth_user_to_public() IS 'Syncs auth users to public.users. NEVER fails authentication even if sync fails. Used by Edge Functions/webhooks.';

-- ============================================
-- STEP 4: CREATE DIRECT INSERT FUNCTION (FOR EDGE FUNCTIONS)
-- ============================================

-- Function for Edge Functions to directly insert users (without trigger)
-- This is called by Edge Functions using service_role
CREATE OR REPLACE FUNCTION insert_user_from_auth(
  p_user_id UUID,
  p_email TEXT,
  p_raw_user_meta_data JSONB DEFAULT '{}'::JSONB,
  p_created_at TIMESTAMPTZ DEFAULT NOW(),
  p_updated_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_username TEXT;
  user_name TEXT;
  user_avatar TEXT;
  user_google_id TEXT;
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    RETURN p_user_id;
  END IF;

  -- Generate unique username
  generated_username := generate_unique_username_for_sync(p_user_id, p_email);

  -- Extract user data from metadata
  user_name := COALESCE(
    p_raw_user_meta_data->>'name',
    p_raw_user_meta_data->>'full_name',
    split_part(p_email, '@', 1)
  );
  
  user_avatar := p_raw_user_meta_data->>'picture';
  
  user_google_id := COALESCE(
    p_raw_user_meta_data->>'sub',
    p_raw_user_meta_data->>'provider_id'
  );

  -- Insert the new user
  INSERT INTO public.users (
    id,
    email,
    username,
    name,
    avatar_url,
    google_id,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_email,
    generated_username,
    user_name,
    user_avatar,
    user_google_id,
    p_created_at,
    p_updated_at
  ) ON CONFLICT (id) DO NOTHING;
  
  RETURN p_user_id;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail
  RAISE WARNING 'Error inserting user: %', SQLERRM;
  RETURN p_user_id;
END;
$$;

COMMENT ON FUNCTION insert_user_from_auth IS 'Direct insert function for Edge Functions to sync users. Used by webhooks instead of triggers.';

-- ============================================
-- STEP 5: ENSURE RLS POLICIES ALLOW INSERTS
-- ============================================

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Comprehensive user insert policy" ON users;
DROP POLICY IF EXISTS "Admin can insert users" ON users;
DROP POLICY IF EXISTS "Edge Function can insert users" ON users;

-- Create policy that allows service_role (used by Edge Functions) to insert users
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

COMMENT ON POLICY "Service role can insert users" ON users IS 'Allows Edge Function (service_role) to insert new users when called via webhook';

-- ============================================
-- STEP 6: GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant table permissions
GRANT INSERT ON public.users TO service_role;
GRANT SELECT ON public.users TO service_role;
GRANT UPDATE ON public.users TO service_role;
GRANT INSERT ON public.users TO postgres;
GRANT SELECT ON public.users TO postgres;
GRANT UPDATE ON public.users TO postgres;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;
GRANT EXECUTE ON FUNCTION generate_unique_username_for_sync(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION generate_unique_username_for_sync(UUID, TEXT) TO postgres;
GRANT EXECUTE ON FUNCTION insert_user_from_auth(UUID, TEXT, JSONB, TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION insert_user_from_auth(UUID, TEXT, JSONB, TIMESTAMPTZ, TIMESTAMPTZ) TO postgres;

-- ============================================
-- STEP 7: VERIFICATION
-- ============================================

-- Verify function exists
DO $$
DECLARE
    func_exists BOOLEAN;
    policy_exists BOOLEAN;
BEGIN
    -- Check function
    SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'sync_auth_user_to_public'
    ) INTO func_exists;
    
    IF NOT func_exists THEN
        RAISE WARNING 'sync_auth_user_to_public function not found';
    ELSE
        RAISE NOTICE '✅ sync_auth_user_to_public function exists';
    END IF;
    
    -- Check policy
    SELECT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'users' 
        AND policyname = 'Service role can insert users'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        RAISE WARNING 'Service role insert policy not found';
    ELSE
        RAISE NOTICE '✅ Service role insert policy exists';
    END IF;
END $$;

COMMIT;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE app_config IS 'Application configuration table for storing settings like Supabase URL';

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 
-- This migration sets up user sync for webhook-based approach (no triggers on auth.users)
-- 
-- To complete the setup:
-- 1. Deploy Edge Function: supabase functions deploy sync-auth-users-realtime --no-verify-jwt
-- 2. Configure Database Webhook or Auth Webhook to call the Edge Function
-- 3. Optionally set Supabase URL in app_config:
--    INSERT INTO app_config (key, value) VALUES ('supabase_url', 'https://YOUR-PROJECT.supabase.co')
--    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
-- 4. Test by signing up a new user
-- 
-- The Edge Function will use service_role key to call insert_user_from_auth() function
-- This avoids the need for triggers on auth.users (which requires superuser privileges)

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify RLS policy exists
SELECT 
    '========== RLS POLICY CHECK ==========' as section,
    schemaname,
    tablename,
    policyname,
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
WHERE proname IN ('sync_auth_user_to_public', 'insert_user_from_auth', 'generate_unique_username_for_sync')
ORDER BY proname;

