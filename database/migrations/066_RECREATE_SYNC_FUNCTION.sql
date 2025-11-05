-- FIX: Recreate Missing sync_auth_user_to_public Function
-- This function is called by the existing trigger on auth.users
-- It MUST handle errors gracefully to avoid blocking authentication

BEGIN;

-- ============================================
-- 1. CREATE HELPER FUNCTION FOR USERNAME GENERATION
-- ============================================

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

-- ============================================
-- 2. RECREATE THE MISSING SYNC FUNCTION
-- ============================================
-- CRITICAL: This function MUST NEVER raise exceptions that would block auth
-- It should ALWAYS return NEW, even if sync fails

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

COMMENT ON FUNCTION sync_auth_user_to_public() IS 'Syncs auth users to public.users. NEVER fails authentication even if sync fails.';

-- ============================================
-- 3. ENSURE RLS POLICIES ALLOW INSERTS
-- ============================================

DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

GRANT INSERT ON public.users TO service_role;
GRANT SELECT ON public.users TO service_role;
GRANT INSERT ON public.users TO postgres;
GRANT SELECT ON public.users TO postgres;

-- ============================================
-- 4. GRANT FUNCTION PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;
GRANT EXECUTE ON FUNCTION generate_unique_username_for_sync(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION generate_unique_username_for_sync(UUID, TEXT) TO postgres;

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify function exists
SELECT 
    '========== FUNCTION VERIFICATION ==========' as info,
    proname as function_name,
    CASE WHEN prosecdef THEN '✅ SECURITY DEFINER' ELSE '❌ No SECURITY DEFINER' END as security_type,
    '✅ Function exists' as status
FROM pg_proc 
WHERE proname = 'sync_auth_user_to_public';

-- Verify RLS policy exists
SELECT 
    '========== RLS POLICY VERIFICATION ==========' as info,
    policyname,
    cmd,
    roles,
    '✅ Policy exists' as status
FROM pg_policies
WHERE tablename = 'users' 
  AND policyname = 'Service role can insert users';

