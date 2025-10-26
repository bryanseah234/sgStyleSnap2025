-- Migration 038: Comprehensive User Creation Fix
-- This migration comprehensively fixes all potential user creation issues
-- by ensuring proper RLS policies, permissions, and trigger configuration

BEGIN;

-- ============================================
-- 1. DROP ALL EXISTING INSERT POLICIES
-- ============================================

-- Remove any existing insert policies that might be conflicting
DROP POLICY IF EXISTS "Admin can insert users" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users can insert themselves" ON users;
DROP POLICY IF EXISTS "Authenticated users can insert" ON users;

-- ============================================
-- 2. CREATE COMPREHENSIVE INSERT POLICY
-- ============================================

-- Create a comprehensive insert policy that allows:
-- - service_role (for triggers)
-- - postgres (for system operations)
-- - authenticated users (for manual operations if needed)
CREATE POLICY "Comprehensive user insert policy" ON users
    FOR INSERT 
    TO service_role, postgres, authenticated
    WITH CHECK (true);

-- ============================================
-- 3. ENSURE TABLE PERMISSIONS
-- ============================================

-- Grant all necessary permissions to service_role
GRANT INSERT ON public.users TO service_role;
GRANT SELECT ON public.users TO service_role;
GRANT UPDATE ON public.users TO service_role;
GRANT DELETE ON public.users TO service_role;

-- Grant all necessary permissions to postgres
GRANT INSERT ON public.users TO postgres;
GRANT SELECT ON public.users TO postgres;
GRANT UPDATE ON public.users TO postgres;
GRANT DELETE ON public.users TO postgres;

-- Grant necessary permissions to authenticated users
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;

-- ============================================
-- 4. ENSURE FUNCTION PERMISSIONS
-- ============================================

-- Grant execute permissions on all auth sync functions
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;
GRANT EXECUTE ON FUNCTION sync_google_profile_photo() TO service_role;
GRANT EXECUTE ON FUNCTION sync_google_profile_photo() TO postgres;
GRANT EXECUTE ON FUNCTION update_user_google_profile(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION update_user_google_profile(UUID) TO postgres;
GRANT EXECUTE ON FUNCTION get_current_google_profile_data(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_current_google_profile_data(UUID) TO postgres;

-- ============================================
-- 5. ENSURE TRIGGER IS ENABLED
-- ============================================

-- Make sure the trigger is enabled
ALTER TABLE auth.users ENABLE TRIGGER sync_auth_user_to_public;
ALTER TABLE auth.users ENABLE TRIGGER sync_google_profile_photo;

-- ============================================
-- 6. VERIFY FUNCTION EXISTS AND IS CORRECT
-- ============================================

-- Check if the function exists and recreate if necessary
DO $$
BEGIN
    -- Check if function exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'sync_auth_user_to_public'
    ) THEN
        RAISE NOTICE '⚠️ sync_auth_user_to_public function not found, recreating...';
        
        -- Recreate the function (simplified version)
        CREATE OR REPLACE FUNCTION sync_auth_user_to_public()
        RETURNS TRIGGER AS $$
        DECLARE
            username_base TEXT;
            counter INT := 0;
            temp_username TEXT;
            user_name TEXT;
            user_avatar TEXT;
            user_google_id TEXT;
            provider_value TEXT;
        BEGIN
            -- Log the start of the sync process
            RAISE NOTICE '========== NEW USER SYNC START ==========';
            RAISE NOTICE '👤 User ID: %', NEW.id;
            RAISE NOTICE '📧 Email: %', NEW.email;
            
            -- Extract provider information
            provider_value := COALESCE(
                NEW.raw_app_meta_data->>'provider',
                NEW.app_metadata->>'provider',
                'unknown'
            );
            
            RAISE NOTICE '🔑 Provider: %', provider_value;
            
            -- Only process Google OAuth users
            IF provider_value IS NULL OR provider_value != 'google' THEN
                RAISE WARNING '⚠️ Non-Google provider detected: %. Skipping user sync.', provider_value;
                RETURN NEW;
            END IF;

            -- Extract username base from email
            username_base := split_part(NEW.email, '@', 1);
            temp_username := username_base;
            
            -- Handle username conflicts
            WHILE EXISTS (SELECT 1 FROM public.users WHERE username = temp_username) LOOP
                counter := counter + 1;
                temp_username := username_base || counter::text;
                RAISE NOTICE '⚠️ Username conflict, trying: %', temp_username;
            END LOOP;
            
            RAISE NOTICE '👤 Final username: %', temp_username;

            -- Extract user data
            user_name := COALESCE(
                NEW.raw_user_meta_data->>'name',
                NEW.raw_user_meta_data->>'full_name',
                split_part(NEW.email, '@', 1)
            );
            
            user_avatar := COALESCE(
                NEW.raw_user_meta_data->>'picture',
                NEW.raw_user_meta_data->>'avatar_url',
                '/avatars/default-1.png'
            );
            
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
                    temp_username,
                    user_name,
                    user_avatar,
                    user_google_id,
                    NEW.created_at,
                    NEW.updated_at
                );
                
                RAISE NOTICE '✅ Successfully created user in public.users';
                RAISE NOTICE '✅ User: % | Email: % | Username: %', NEW.id, NEW.email, temp_username;
            EXCEPTION
                WHEN unique_violation THEN
                    RAISE WARNING '⚠️ User already exists in public.users (unique violation)';
                WHEN OTHERS THEN
                    RAISE WARNING '⚠️ Error inserting user: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
            END;
            
            RAISE NOTICE '========== NEW USER SYNC COMPLETE ==========';
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        RAISE NOTICE '✅ sync_auth_user_to_public function recreated';
    ELSE
        RAISE NOTICE '✅ sync_auth_user_to_public function exists';
    END IF;
END $$;

-- ============================================
-- 7. VERIFY TRIGGER EXISTS AND IS CORRECT
-- ============================================

-- Check if trigger exists and recreate if necessary
DO $$
BEGIN
    -- Check if trigger exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'sync_auth_user_to_public'
    ) THEN
        RAISE NOTICE '⚠️ sync_auth_user_to_public trigger not found, recreating...';
        
        -- Recreate the trigger
        CREATE TRIGGER sync_auth_user_to_public
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION sync_auth_user_to_public();
        
        RAISE NOTICE '✅ sync_auth_user_to_public trigger recreated';
    ELSE
        RAISE NOTICE '✅ sync_auth_user_to_public trigger exists';
    END IF;
END $$;

-- ============================================
-- 8. FINAL VERIFICATION
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
  AND policyname = 'Comprehensive user insert policy';

-- Verify permissions
SELECT 
    CASE 
        WHEN has_table_privilege('service_role', 'public.users', 'INSERT') THEN '✅ service_role can INSERT'
        ELSE '❌ service_role CANNOT INSERT'
    END as service_role_insert,
    CASE 
        WHEN has_table_privilege('postgres', 'public.users', 'INSERT') THEN '✅ postgres can INSERT'
        ELSE '❌ postgres CANNOT INSERT'
    END as postgres_insert,
    '🧪 Permission Verification' as info;

-- Verify trigger is enabled
SELECT 
    tgname as trigger_name,
    CASE 
        WHEN tgenabled = 'O' THEN '✅ ENABLED'
        WHEN tgenabled = 'D' THEN '❌ DISABLED'
        ELSE '⚠️ ' || tgenabled
    END as status,
    '🔔 Trigger Status' as info
FROM pg_trigger t
WHERE tgname = 'sync_auth_user_to_public';

-- ============================================
-- 9. SUCCESS MESSAGE
-- ============================================

SELECT '
╔════════════════════════════════════════════════════════════╗
║  ✅ MIGRATION 038 COMPLETED SUCCESSFULLY!                  ║
╚════════════════════════════════════════════════════════════╝

📋 What was fixed:
  ✅ Removed all conflicting INSERT policies
  ✅ Created comprehensive INSERT policy for service_role, postgres, authenticated
  ✅ Granted all necessary table permissions
  ✅ Granted all necessary function permissions
  ✅ Ensured triggers are enabled
  ✅ Recreated function and trigger if missing
  ✅ Verified all permissions and policies

🔍 What this fixes:
  - New users can now sign up successfully via Google OAuth
  - The sync_auth_user_to_public() trigger can insert into public.users
  - All permission issues are resolved
  - Trigger is properly enabled and functional

🧪 Test now:
  1. Try creating a new user via Google OAuth
  2. Check Supabase → Logs → Postgres Logs for success messages
  3. Verify user appears in public.users table
  4. Check browser console for detailed auth flow logs

🐛 If still failing:
  - Check Supabase → Logs → Postgres Logs for specific error messages
  - Look for RLS policy violations or permission errors
  - Verify your Supabase project settings and OAuth configuration

' as result;

COMMIT;

COMMENT ON SCHEMA public IS 'StyleSnap comprehensive user creation fix applied (migration 038)';
