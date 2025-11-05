-- Migration 062: Fix User Sync with Robust Fallback
-- This migration fixes the "Database error saving new user" issue by:
-- 1. Improving username generation in fallback to prevent conflicts
-- 2. Ensuring proper error handling that doesn't fail authentication
-- 3. Ensuring RLS policies allow inserts
--
-- This fixes the issue where Edge Function calls fail silently and fallback
-- also fails due to username conflicts or RLS policies.

BEGIN;

-- ============================================
-- 1. CREATE HELPER FUNCTION FOR USERNAME GENERATION
-- ============================================

-- Create a function to generate unique usernames with conflict resolution
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

COMMENT ON FUNCTION generate_unique_username_for_sync IS 'Generates a unique username for user sync, handling conflicts';

-- ============================================
-- 2. UPDATE SYNC FUNCTION WITH IMPROVED FALLBACK
-- ============================================

CREATE OR REPLACE FUNCTION sync_auth_user_to_public()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  supabase_url TEXT;
  payload JSONB;
  request_id BIGINT;
  error_msg TEXT;
  use_edge_function BOOLEAN := TRUE;
  generated_username TEXT;
  user_name TEXT;
  user_avatar TEXT;
  user_google_id TEXT;
BEGIN
  RAISE NOTICE '========== NEW USER SYNC START ==========';
  RAISE NOTICE '👤 User ID: %', NEW.id;
  RAISE NOTICE '📧 Email: %', NEW.email;

  -- Check if user already exists (prevent duplicate processing)
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    RAISE NOTICE '✅ User already exists in public.users, skipping sync';
    RETURN NEW;
  END IF;

  -- Get Supabase URL from app_config table
  BEGIN
    SELECT value INTO supabase_url FROM app_config WHERE key = 'supabase_url' LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not get supabase_url from app_config table: %', SQLERRM;
    supabase_url := NULL;
  END;

  -- Fallback: Try to get from database settings
  IF supabase_url IS NULL OR supabase_url = '' THEN
    BEGIN
      supabase_url := current_setting('app.settings.supabase_url', TRUE);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not get supabase_url from database settings: %', SQLERRM;
    END;
  END IF;

  -- Prepare user data (needed for both Edge Function and fallback)
  generated_username := generate_unique_username_for_sync(NEW.id, NEW.email);
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

  -- Construct Edge Function URL
  IF supabase_url IS NOT NULL AND supabase_url != '' THEN
    supabase_url := rtrim(supabase_url, '/');
    edge_function_url := supabase_url || '/functions/v1/sync-auth-users-realtime';
  ELSE
    RAISE WARNING '⚠️ Supabase URL not configured. Using direct insert fallback.';
    use_edge_function := FALSE;
  END IF;

  -- Try to call Edge Function if configured
  IF use_edge_function THEN
    RAISE NOTICE '🔗 Edge Function URL: %', edge_function_url;

    -- Prepare payload with user data
    payload := jsonb_build_object(
      'type', 'user.created',
      'user', jsonb_build_object(
        'id', NEW.id,
        'email', NEW.email,
        'raw_user_meta_data', COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
        'created_at', NEW.created_at,
        'updated_at', NEW.updated_at
      )
    );

    -- Call Edge Function using pg_net (async HTTP POST)
    BEGIN
      SELECT net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json'
        )::jsonb,
        body := payload::text
      ) INTO request_id;

      RAISE NOTICE '✅ Edge Function call queued successfully (request_id: %)', request_id;
      RAISE NOTICE '✅ User sync will be handled by Edge Function';
      
      -- IMPORTANT: Don't wait for Edge Function response - it's async
      -- Instead, do a synchronous fallback insert immediately to ensure user is created
      -- This prevents authentication errors if Edge Function fails
      RAISE NOTICE 'ℹ️ Performing synchronous fallback insert to ensure user is created...';
      
      -- Fall through to fallback insert below
      use_edge_function := FALSE;
      
    EXCEPTION WHEN OTHERS THEN
      error_msg := 'Failed to call Edge Function: ' || SQLERRM;
      RAISE WARNING '⚠️ %', error_msg;
      RAISE WARNING '⚠️ Falling back to direct insert...';
      use_edge_function := FALSE;
    END;
  END IF;

  -- Fallback: Direct insert (synchronous, ensures user is created)
  IF NOT use_edge_function THEN
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
      ) ON CONFLICT (id) DO NOTHING;
      
      RAISE NOTICE '✅ User created successfully in public.users';
      RAISE NOTICE '✅ Username: %', generated_username;
      RAISE NOTICE '========== NEW USER SYNC COMPLETE ==========';
      RETURN NEW;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail authentication
      -- This allows user to authenticate even if profile creation fails
      RAISE WARNING '⚠️ Failed to create user profile: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
      RAISE NOTICE 'ℹ️ User will still be authenticated. Profile can be created manually later.';
      RAISE NOTICE '========== NEW USER SYNC COMPLETE (WITH ERRORS) ==========';
      -- Still return NEW to allow auth to proceed
      RETURN NEW;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

COMMENT ON FUNCTION sync_auth_user_to_public() IS 'Syncs auth users to public.users with robust fallback';

-- ============================================
-- 3. ENSURE TRIGGER EXISTS
-- ============================================

DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;

CREATE TRIGGER sync_auth_user_to_public
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_auth_user_to_public();

COMMENT ON TRIGGER sync_auth_user_to_public ON auth.users IS 'Automatically syncs new auth users to public.users';

-- ============================================
-- 4. ENSURE PERMISSIONS AND RLS POLICIES
-- ============================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;
GRANT EXECUTE ON FUNCTION generate_unique_username_for_sync(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION generate_unique_username_for_sync(UUID, TEXT) TO postgres;

-- Grant table permissions
GRANT INSERT ON public.users TO service_role;
GRANT SELECT ON public.users TO service_role;
GRANT UPDATE ON public.users TO service_role;
GRANT INSERT ON public.users TO postgres;
GRANT SELECT ON public.users TO postgres;
GRANT UPDATE ON public.users TO postgres;

-- Ensure RLS policy exists for inserts
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Comprehensive user insert policy" ON users;

CREATE POLICY "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

COMMENT ON POLICY "Service role can insert users" ON users IS 'Allows trigger function to insert new users';

-- Grant permissions on app_config table
GRANT SELECT ON app_config TO service_role;
GRANT SELECT ON app_config TO postgres;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify trigger exists
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    '✅ Trigger exists' as status
FROM pg_trigger 
WHERE tgname = 'sync_auth_user_to_public' 
  AND tgrelid = 'auth.users'::regclass;

-- Verify function exists
SELECT 
    proname as function_name,
    CASE WHEN prosecdef THEN '✅ SECURITY DEFINER' ELSE '❌ No SECURITY DEFINER' END as security_type
FROM pg_proc 
WHERE proname = 'sync_auth_user_to_public';

-- Verify RLS policy exists
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

