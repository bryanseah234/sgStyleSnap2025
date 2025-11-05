-- Migration: Update user sync trigger to call Edge Function
-- This modifies the existing trigger to call sync-auth-users-realtime edge function
-- instead of directly inserting into public.users
--
-- IMPORTANT: After running this migration, you MUST set the Supabase URL:
-- INSERT INTO app_config (key, value) VALUES ('supabase_url', 'https://YOUR-PROJECT-REF.supabase.co') 
-- ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
--
-- Replace YOUR-PROJECT-REF with your actual Supabase project reference (e.g., nztqjmknblelnzpeatyx)

BEGIN;

-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create app_config table if it doesn't exist (for storing Supabase URL)
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or replace function that calls Edge Function
CREATE OR REPLACE FUNCTION sync_auth_user_to_public()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  supabase_url TEXT;
  payload JSONB;
  request_id BIGINT;
  error_msg TEXT;
  use_edge_function BOOLEAN := TRUE;
BEGIN
  RAISE NOTICE '========== NEW USER SYNC START ==========';
  RAISE NOTICE '👤 User ID: %', NEW.id;
  RAISE NOTICE '📧 Email: %', NEW.email;

  -- Get Supabase URL from app_config table (preferred method, no superuser needed)
  BEGIN
    SELECT value INTO supabase_url FROM app_config WHERE key = 'supabase_url' LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not get supabase_url from app_config table: %', SQLERRM;
    supabase_url := NULL;
  END;

  -- Fallback: Try to get from database settings (may fail without superuser)
  IF supabase_url IS NULL OR supabase_url = '' THEN
    BEGIN
      supabase_url := current_setting('app.settings.supabase_url', TRUE);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not get supabase_url from database settings: %', SQLERRM;
    END;
  END IF;

  -- Construct Edge Function URL
  IF supabase_url IS NOT NULL AND supabase_url != '' THEN
    -- Remove trailing slash if present
    supabase_url := rtrim(supabase_url, '/');
    edge_function_url := supabase_url || '/functions/v1/sync-auth-users-realtime';
  ELSE
    RAISE WARNING '⚠️ Supabase URL not configured. Cannot call Edge Function.';
    RAISE WARNING '⚠️ Configure by running: INSERT INTO app_config (key, value) VALUES (''supabase_url'', ''https://YOUR-PROJECT-REF.supabase.co'') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;';
    -- Fall back to direct insert (old behavior)
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
    -- Note: Edge Function is deployed with --no-verify-jwt, so no auth needed
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
      RAISE NOTICE '========== NEW USER SYNC COMPLETE ==========';
      RETURN NEW;
      
    EXCEPTION WHEN OTHERS THEN
      error_msg := 'Failed to call Edge Function: ' || SQLERRM;
      RAISE WARNING '⚠️ %', error_msg;
      RAISE WARNING '⚠️ Edge Function URL: %', edge_function_url;
      RAISE WARNING '⚠️ Falling back to direct insert...';
      use_edge_function := FALSE;
    END;
  END IF;

  -- Fallback: Direct insert (old behavior) if Edge Function not configured or failed
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
        COALESCE(split_part(NEW.email, '@', 1), 'user' || SUBSTRING(NEW.id::text, 1, 8)),
        COALESCE(
          NEW.raw_user_meta_data->>'name',
          NEW.raw_user_meta_data->>'full_name',
          split_part(NEW.email, '@', 1)
        ),
        NEW.raw_user_meta_data->>'picture',
        COALESCE(
          NEW.raw_user_meta_data->>'sub',
          NEW.raw_user_meta_data->>'provider_id'
        ),
        NEW.created_at,
        NEW.updated_at
      ) ON CONFLICT (id) DO NOTHING;
      
      RAISE NOTICE '✅ Fallback: User created directly in public.users';
      RAISE NOTICE '========== NEW USER SYNC COMPLETE (FALLBACK) ==========';
      RETURN NEW;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '⚠️ Fallback insert also failed: %', SQLERRM;
      RAISE NOTICE '========== NEW USER SYNC COMPLETE (WITH ERRORS) ==========';
      RETURN NEW;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION sync_auth_user_to_public() IS 'Calls Edge Function to sync auth users to public.users (with fallback to direct insert)';

-- Recreate trigger
DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;

CREATE TRIGGER sync_auth_user_to_public
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_auth_user_to_public();

COMMENT ON TRIGGER sync_auth_user_to_public ON auth.users IS 'Automatically syncs new auth users to public.users via Edge Function';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;

-- Grant permissions on app_config table (if needed)
GRANT SELECT ON app_config TO service_role;
GRANT SELECT ON app_config TO postgres;

COMMIT;

-- ============================================
-- IMPORTANT: After running this migration, set your Supabase URL:
-- ============================================
-- 
-- INSERT INTO app_config (key, value) 
-- VALUES ('supabase_url', 'https://nztqjmknblelnzpeatyx.supabase.co')
-- ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
--
-- Replace 'nztqjmknblelnzpeatyx' with your actual project reference if different
--
-- To verify it's set:
-- SELECT * FROM app_config WHERE key = 'supabase_url';

