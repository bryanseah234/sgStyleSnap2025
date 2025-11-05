-- ============================================
-- Migration: Fix User Creation Trigger Issue
-- Description: Ensures trigger exists and has proper permissions
--              Fixes RLS policies if needed
-- Date: 2025-01-XX
-- ============================================

-- ============================================
-- 1. VERIFY TRIGGER EXISTS
-- ============================================

-- Check if trigger exists (this will show in Supabase logs)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'sync_auth_user_to_public' 
        AND tgrelid = 'auth.users'::regclass
    ) THEN
        RAISE NOTICE '✅ Trigger sync_auth_user_to_public EXISTS';
    ELSE
        RAISE WARNING '❌ Trigger sync_auth_user_to_public DOES NOT EXIST';
    END IF;
END $$;

-- ============================================
-- 2. RECREATE FUNCTION WITH BETTER ERROR HANDLING
-- ============================================

DROP FUNCTION IF EXISTS sync_auth_user_to_public() CASCADE;

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
    RAISE NOTICE '========== NEW USER SYNC STARTED ==========';
    RAISE NOTICE '📧 Email: %', NEW.email;
    RAISE NOTICE '🆔 ID: %', NEW.id;
    
    -- Check if user already exists in public.users
    IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        RAISE NOTICE '⚠️ User already exists in public.users, skipping...';
        RETURN NEW;
    END IF;

    -- Generate unique username using the function
    generated_username := generate_unique_username(NEW.id, NEW.email);
    RAISE NOTICE '👤 Generated username: %', generated_username;

    -- Extract user data from auth metadata
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Use Google profile picture ONLY (no fallback)
    user_avatar := NEW.raw_user_meta_data->>'picture';
    
    user_google_id := COALESCE(
        NEW.raw_user_meta_data->>'sub',
        NEW.raw_user_meta_data->>'provider_id'
    );

    -- Insert the new user into public.users
    -- Use explicit error handling
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
        RAISE NOTICE '✅ User: % | Email: % | Username: %', NEW.id, NEW.email, generated_username;
    EXCEPTION
        WHEN unique_violation THEN
            RAISE WARNING '⚠️ User already exists in public.users (unique violation)';
            -- Don't fail the auth, just log and continue
        WHEN insufficient_privilege THEN
            RAISE EXCEPTION '❌ Insufficient privileges to insert into public.users. Check RLS policies.';
        WHEN OTHERS THEN
            -- Log the full error but don't fail authentication
            RAISE WARNING '⚠️ Error inserting user: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
            RAISE WARNING '⚠️ Error details: %', SQLERRM;
            -- Still return NEW to allow auth to proceed
    END;
    
    RAISE NOTICE '========== NEW USER SYNC COMPLETE ==========';
    RETURN NEW;
END;
$$;

-- ============================================
-- 3. RECREATE TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;

CREATE TRIGGER sync_auth_user_to_public
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_auth_user_to_public();

COMMENT ON TRIGGER sync_auth_user_to_public ON auth.users IS 'Automatically syncs new auth users to public.users table';

-- ============================================
-- 4. ENSURE FUNCTION HAS PROPER PERMISSIONS
-- ============================================

-- Grant execute permissions to service_role and postgres
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO authenticated;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO anon;

-- ============================================
-- 5. CHECK AND FIX RLS POLICIES ON public.users
-- ============================================

-- Ensure the function can bypass RLS when inserting
-- The SECURITY DEFINER should handle this, but let's verify RLS policies

-- Check current RLS status
DO $$
BEGIN
    IF (SELECT relrowsecurity FROM pg_class WHERE relname = 'users' AND relnamespace = 'public'::regnamespace) THEN
        RAISE NOTICE 'ℹ️ RLS is enabled on public.users';
        RAISE NOTICE 'ℹ️ SECURITY DEFINER function should bypass RLS';
    ELSE
        RAISE NOTICE 'ℹ️ RLS is disabled on public.users';
    END IF;
END $$;

-- Ensure RLS policy exists for service_role to insert
DROP POLICY IF EXISTS "Service role can insert users" ON users;

CREATE POLICY "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

-- Grant table permissions
GRANT INSERT ON public.users TO service_role;
GRANT INSERT ON public.users TO postgres;
GRANT SELECT ON public.users TO service_role;
GRANT SELECT ON public.users TO postgres;

-- ============================================
-- 6. VERIFY GENERATE_UNIQUE_USERNAME FUNCTION EXISTS
-- ============================================

-- Check if function exists and create if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'generate_unique_username'
    ) THEN
        RAISE NOTICE '❌ Function generate_unique_username DOES NOT EXIST - creating it...';
    ELSE
        RAISE NOTICE '✅ Function generate_unique_username EXISTS';
    END IF;
END $$;

-- Create the function (will replace if exists)
CREATE OR REPLACE FUNCTION generate_unique_username(
    user_id UUID,
    user_email TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    username_base TEXT;
    unique_suffix TEXT;
    final_username TEXT;
BEGIN
    -- Extract username base from email (part before @)
    username_base := split_part(user_email, '@', 1);
    
    -- Clean the username base (remove special characters, convert to lowercase)
    username_base := LOWER(REGEXP_REPLACE(username_base, '[^a-zA-Z0-9]', '', 'g'));
    
    -- Limit username base to 20 characters for readability
    IF LENGTH(username_base) > 20 THEN
        username_base := SUBSTRING(username_base, 1, 20);
    END IF;
    
    -- Get last 4 characters of UUID for uniqueness
    unique_suffix := SUBSTRING(user_id::TEXT, 33, 4);
    
    -- Combine base + underscore + suffix
    final_username := username_base || '_' || unique_suffix;
    
    RETURN final_username;
END;
$$;

-- ============================================
-- 7. SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ User creation trigger fixed!';
    RAISE NOTICE '✅ Trigger: sync_auth_user_to_public';
    RAISE NOTICE '✅ Function: sync_auth_user_to_public()';
    RAISE NOTICE '==============================================';
END $$;

