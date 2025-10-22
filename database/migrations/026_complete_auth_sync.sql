-- Migration 026: Complete Auth User Synchronization System
-- This migration combines and fixes all authentication triggers and functions
-- Handles both NEW user creation (INSERT) and EXISTING user updates (UPDATE)
-- 
-- What this does:
-- 1. NEW USERS: Automatically creates profile in public.users when signing up
-- 2. EXISTING USERS: Automatically syncs profile data when re-authenticating
-- 3. Comprehensive error handling - auth succeeds even if profile sync has issues
-- 4. Detailed logging for debugging authentication issues

-- ============================================
-- CLEANUP: DROP ALL EXISTING OBJECTS
-- ============================================

-- Drop all triggers
DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;
DROP TRIGGER IF EXISTS sync_google_profile_photo ON auth.users;

-- Drop all functions
DROP FUNCTION IF EXISTS sync_auth_user_to_public();
DROP FUNCTION IF EXISTS sync_google_profile_photo();
DROP FUNCTION IF EXISTS update_user_google_profile(UUID);
DROP FUNCTION IF EXISTS get_current_google_profile_data(UUID);
DROP FUNCTION IF EXISTS get_current_google_profile_photo(UUID);
DROP FUNCTION IF EXISTS sync_user_profile_photo(UUID);
DROP FUNCTION IF EXISTS sync_all_user_profiles();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get current Google profile data from auth.users
-- This extracts all Google OAuth data with multiple fallback paths
CREATE OR REPLACE FUNCTION get_current_google_profile_data(user_id UUID)
RETURNS JSON AS $$
DECLARE
    profile_data JSON;
BEGIN
    -- Get comprehensive Google profile data from auth.users
    SELECT json_build_object(
        'email', au.email,
        'name', COALESCE(
            au.raw_user_meta_data->>'name',
            au.raw_user_meta_data->>'full_name',
            au.raw_user_meta_data->'user_metadata'->>'name',
            au.raw_user_meta_data->'user_metadata'->>'full_name'
        ),
        'avatar_url', COALESCE(
            au.raw_user_meta_data->>'picture',
            au.raw_user_meta_data->'user_metadata'->>'avatar_url',
            au.raw_user_meta_data->>'avatar_url'
        ),
        'google_id', COALESCE(
            au.raw_user_meta_data->>'sub',
            au.raw_user_meta_data->'user_metadata'->>'sub'
        ),
        'given_name', COALESCE(
            au.raw_user_meta_data->>'given_name',
            au.raw_user_meta_data->'user_metadata'->>'given_name'
        ),
        'family_name', COALESCE(
            au.raw_user_meta_data->>'family_name',
            au.raw_user_meta_data->'user_metadata'->>'family_name'
        ),
        'locale', COALESCE(
            au.raw_user_meta_data->>'locale',
            au.raw_user_meta_data->'user_metadata'->>'locale'
        ),
        'verified_email', COALESCE(
            (au.raw_user_meta_data->>'email_verified')::boolean,
            (au.raw_user_meta_data->'user_metadata'->>'email_verified')::boolean,
            false
        )
    )
    INTO profile_data
    FROM auth.users au
    WHERE au.id = user_id;
    
    RETURN profile_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Legacy function for backward compatibility
CREATE OR REPLACE FUNCTION get_current_google_profile_photo(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    current_photo_url TEXT;
BEGIN
    -- Get the current Google profile photo from auth.users
    SELECT 
        COALESCE(
            au.raw_user_meta_data->>'picture',
            au.raw_user_meta_data->'user_metadata'->>'avatar_url',
            au.raw_user_meta_data->>'avatar_url'
        )
    INTO current_photo_url
    FROM auth.users au
    WHERE au.id = user_id;
    
    RETURN current_photo_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update existing user profile with current Google data
CREATE OR REPLACE FUNCTION update_user_google_profile(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    google_data JSON;
    current_email TEXT;
    current_name TEXT;
    current_avatar_url TEXT;
    current_google_id TEXT;
    
    existing_email TEXT;
    existing_name TEXT;
    existing_avatar_url TEXT;
    existing_google_id TEXT;
    
    profile_updated BOOLEAN := FALSE;
    changes_made TEXT[] := '{}';
BEGIN
    RAISE NOTICE '🔄 update_user_google_profile: Starting for user %', user_id;
    
    -- Get current Google profile data
    SELECT get_current_google_profile_data(user_id) INTO google_data;
    
    RAISE NOTICE '🔄 Google data: %', google_data::text;
    
    -- Extract individual fields from JSON
    current_email := google_data->>'email';
    current_name := google_data->>'name';
    current_avatar_url := google_data->>'avatar_url';
    current_google_id := google_data->>'google_id';
    
    -- Get existing profile data
    SELECT email, name, avatar_url, google_id
    INTO existing_email, existing_name, existing_avatar_url, existing_google_id
    FROM public.users
    WHERE id = user_id;
    
    -- Check if user exists in public.users
    IF NOT FOUND THEN
        RAISE NOTICE '⚠️ User % not found in public.users, skipping update', user_id;
        RETURN FALSE;
    END IF;
    
    RAISE NOTICE '🔄 Existing - email: %, name: %, avatar: %', existing_email, existing_name, existing_avatar_url;
    RAISE NOTICE '🔄 Current - email: %, name: %, avatar: %', current_email, current_name, current_avatar_url;
    
    -- Check for changes and update accordingly
    IF current_email IS NOT NULL AND current_email != existing_email THEN
        changes_made := array_append(changes_made, 'email');
        profile_updated := TRUE;
    END IF;
    
    IF current_name IS NOT NULL AND current_name != existing_name THEN
        changes_made := array_append(changes_made, 'name');
        profile_updated := TRUE;
    END IF;
    
    IF current_avatar_url IS NOT NULL AND current_avatar_url != existing_avatar_url THEN
        changes_made := array_append(changes_made, 'avatar_url');
        profile_updated := TRUE;
    END IF;
    
    IF current_google_id IS NOT NULL AND current_google_id != existing_google_id THEN
        changes_made := array_append(changes_made, 'google_id');
        profile_updated := TRUE;
    END IF;
    
    -- Update profile if there are changes
    IF profile_updated THEN
        UPDATE public.users 
        SET 
            email = COALESCE(current_email, email),
            name = COALESCE(current_name, name),
            avatar_url = COALESCE(current_avatar_url, avatar_url),
            google_id = COALESCE(current_google_id, google_id),
            updated_at = NOW()
        WHERE id = user_id;
        
        RAISE NOTICE '✅ Updated profile for user %: %', user_id, array_to_string(changes_made, ', ');
    ELSE
        RAISE NOTICE 'ℹ️ No changes needed for user %', user_id;
    END IF;
    
    RETURN profile_updated;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '⚠️ Error in update_user_google_profile: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER FUNCTION #1: NEW USER CREATION (INSERT)
-- ============================================

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
    RAISE NOTICE '🕐 Created: %', NEW.created_at;
    
    -- Extract provider information with multiple fallback paths
    provider_value := COALESCE(
        NEW.raw_app_meta_data->>'provider',
        NEW.app_metadata->>'provider',
        'unknown'
    );
    
    RAISE NOTICE '🔑 Provider: %', provider_value;
    
    -- Only process Google OAuth users, but with a warning instead of hard error
    IF provider_value IS NULL OR provider_value != 'google' THEN
        RAISE WARNING '⚠️ Non-Google provider detected: %. Skipping user sync. Only Google OAuth is supported.', provider_value;
        RAISE NOTICE 'ℹ️ User will not be added to public.users table';
        -- Return NEW to allow the auth.users insert to complete
        -- This prevents authentication from failing completely
        RETURN NEW;
    END IF;

    -- Extract username base from email (part before @)
    username_base := split_part(NEW.email, '@', 1);
    temp_username := username_base;
    
    -- Handle username conflicts by appending numbers if needed
    WHILE EXISTS (SELECT 1 FROM public.users WHERE username = temp_username) LOOP
        counter := counter + 1;
        temp_username := username_base || counter::text;
        RAISE NOTICE '⚠️ Username conflict, trying: %', temp_username;
    END LOOP;
    
    RAISE NOTICE '👤 Final username: %', temp_username;

    -- Extract user data with multiple fallback paths for robustness
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->'user_metadata'->>'name',
        NEW.raw_user_meta_data->'user_metadata'->>'full_name',
        split_part(NEW.email, '@', 1)
    );
    
    user_avatar := COALESCE(
        NEW.raw_user_meta_data->>'picture',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->'user_metadata'->>'picture',
        NEW.raw_user_meta_data->'user_metadata'->>'avatar_url',
        '/avatars/default-1.png'
    );
    
    user_google_id := COALESCE(
        NEW.raw_user_meta_data->>'sub',
        NEW.raw_user_meta_data->'user_metadata'->>'sub',
        NEW.raw_user_meta_data->>'provider_id'
    );
    
    RAISE NOTICE '📝 Data - Name: %, Avatar: %, Google ID: %', user_name, user_avatar, user_google_id;

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
            -- If we hit a unique constraint, log it but don't fail
            RAISE WARNING '⚠️ User already exists in public.users (unique violation)';
            RAISE NOTICE 'ℹ️ This is normal for existing users or re-authentication';
        WHEN OTHERS THEN
            -- Log any other errors but don't fail the authentication
            RAISE WARNING '⚠️ Error inserting user: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
            RAISE NOTICE 'ℹ️ User will still be authenticated via auth.users';
    END;
    
    RAISE NOTICE '========== NEW USER SYNC COMPLETE ==========';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER FUNCTION #2: EXISTING USER UPDATE (UPDATE)
-- ============================================

CREATE OR REPLACE FUNCTION sync_google_profile_photo()
RETURNS TRIGGER AS $$
DECLARE
    profile_updated BOOLEAN;
BEGIN
    RAISE NOTICE '========== EXISTING USER SYNC START ==========';
    RAISE NOTICE '🔔 Trigger fired for user: %', NEW.id;
    RAISE NOTICE '🔔 Operation: %', TG_OP;
    
    -- Only process if this is an update to an existing user
    IF TG_OP = 'UPDATE' AND OLD.id = NEW.id THEN
        RAISE NOTICE '🔄 Processing UPDATE for user %', NEW.id;
        
        -- Check if the user exists in public.users
        IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
            RAISE NOTICE '✅ User found in public.users, attempting sync';
            
            -- Update the profile with current Google data
            BEGIN
                SELECT update_user_google_profile(NEW.id) INTO profile_updated;
                
                IF profile_updated THEN
                    RAISE NOTICE '✅ Profile synchronized successfully';
                ELSE
                    RAISE NOTICE 'ℹ️ Profile already up-to-date (no changes)';
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE WARNING '⚠️ Error calling update_user_google_profile: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
                    RAISE NOTICE 'ℹ️ User will still be authenticated';
            END;
        ELSE
            RAISE NOTICE 'ℹ️ User % not found in public.users, skipping sync', NEW.id;
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Skipping sync - operation is %', TG_OP;
    END IF;
    
    RAISE NOTICE '========== EXISTING USER SYNC COMPLETE ==========';
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the trigger
        RAISE WARNING '⚠️ Error in sync_google_profile_photo: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
        RAISE NOTICE 'ℹ️ Authentication will continue despite error';
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CREATE TRIGGERS
-- ============================================

-- Trigger for NEW users (INSERT into auth.users)
CREATE TRIGGER sync_auth_user_to_public
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_auth_user_to_public();

-- Trigger for EXISTING users (UPDATE in auth.users)
CREATE TRIGGER sync_google_profile_photo
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_google_profile_photo();

-- ============================================
-- RPC FUNCTIONS (for manual sync operations)
-- ============================================

-- Function to manually sync a specific user's profile
CREATE OR REPLACE FUNCTION sync_user_profile_photo(user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    google_data JSON;
    profile_updated BOOLEAN;
    changes_summary TEXT;
BEGIN
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found in public.users table'
        );
    END IF;
    
    -- Get current Google data for comparison
    SELECT get_current_google_profile_data(user_id) INTO google_data;
    
    -- Update the profile
    SELECT update_user_google_profile(user_id) INTO profile_updated;
    
    -- Get updated profile data
    SELECT json_build_object(
        'id', id,
        'email', email,
        'name', name,
        'avatar_url', avatar_url,
        'google_id', google_id,
        'updated_at', updated_at
    ) INTO result
    FROM public.users
    WHERE id = user_id;
    
    -- Create changes summary
    changes_summary := CASE 
        WHEN profile_updated THEN 'Profile synchronized with Google data'
        ELSE 'Profile already up-to-date'
    END;
    
    RETURN json_build_object(
        'success', true,
        'profile_updated', profile_updated,
        'changes_summary', changes_summary,
        'google_data', google_data,
        'profile', result
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync all users' profiles (admin/maintenance function)
CREATE OR REPLACE FUNCTION sync_all_user_profiles()
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    total_users INTEGER := 0;
    updated_users INTEGER := 0;
    results JSON[] := '{}';
    profile_updated BOOLEAN;
BEGIN
    -- Loop through all users and sync their profiles
    FOR user_record IN 
        SELECT id, email 
        FROM public.users 
        WHERE removed_at IS NULL
    LOOP
        total_users := total_users + 1;
        
        -- Update the profile
        SELECT update_user_google_profile(user_record.id) INTO profile_updated;
        
        IF profile_updated THEN
            updated_users := updated_users + 1;
        END IF;
        
        -- Add to results
        results := array_append(results, json_build_object(
            'user_id', user_record.id,
            'email', user_record.email,
            'updated', profile_updated
        ));
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'total_users', total_users,
        'updated_users', updated_users,
        'results', results
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions to authenticated users for RPC functions
GRANT EXECUTE ON FUNCTION sync_user_profile_photo(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_all_user_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_google_profile_photo(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_google_profile_data(UUID) TO authenticated;

-- Grant to service_role for trigger execution
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;
GRANT EXECUTE ON FUNCTION sync_google_profile_photo() TO service_role;
GRANT EXECUTE ON FUNCTION update_user_google_profile(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_current_google_profile_data(UUID) TO service_role;

-- ============================================
-- COMMENTS (for documentation)
-- ============================================

COMMENT ON FUNCTION get_current_google_profile_data(UUID) IS 'Gets comprehensive Google profile data from auth.users';
COMMENT ON FUNCTION get_current_google_profile_photo(UUID) IS 'Gets current Google profile photo URL (legacy function)';
COMMENT ON FUNCTION update_user_google_profile(UUID) IS 'Updates user profile with current Google data';
COMMENT ON FUNCTION sync_auth_user_to_public() IS 'Trigger: Creates profile in public.users when new user signs up';
COMMENT ON FUNCTION sync_google_profile_photo() IS 'Trigger: Syncs profile when existing user re-authenticates';
COMMENT ON FUNCTION sync_user_profile_photo(UUID) IS 'RPC: Manually sync a specific user profile';
COMMENT ON FUNCTION sync_all_user_profiles() IS 'RPC: Sync all user profiles (admin function)';

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify all functions were created
SELECT 
    p.proname as function_name,
    pg_catalog.pg_get_function_arguments(p.oid) as arguments,
    '✅ Function exists' as status
FROM pg_proc p
WHERE p.proname IN (
    'sync_auth_user_to_public',
    'sync_google_profile_photo',
    'update_user_google_profile',
    'get_current_google_profile_data',
    'get_current_google_profile_photo',
    'sync_user_profile_photo',
    'sync_all_user_profiles'
)
ORDER BY p.proname;

-- Verify both triggers were created
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE 
        WHEN tgtype & 2 = 2 THEN 'BEFORE'
        ELSE 'AFTER'
    END as timing,
    CASE 
        WHEN tgtype & 4 = 4 THEN 'INSERT'
        WHEN tgtype & 8 = 8 THEN 'DELETE'
        WHEN tgtype & 16 = 16 THEN 'UPDATE'
        ELSE 'OTHER'
    END as event,
    proname as function_name,
    '✅ Trigger exists' as status
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname IN ('sync_auth_user_to_public', 'sync_google_profile_photo')
ORDER BY tgname;

-- Final success message
SELECT '
╔════════════════════════════════════════════════════════════╗
║  ✅ MIGRATION 026 COMPLETED SUCCESSFULLY!                  ║
╚════════════════════════════════════════════════════════════╝

📋 What was installed:
  ✅ NEW USER trigger (INSERT) - Creates profile on signup
  ✅ EXISTING USER trigger (UPDATE) - Syncs profile on re-auth
  ✅ 5 Helper functions for profile management
  ✅ 2 RPC functions for manual sync operations
  ✅ All permissions granted correctly

🔍 Next steps:
  1. Check the verification results above
  2. Deploy your frontend changes to Vercel
  3. Test login with new and existing users
  4. Monitor Supabase Postgres Logs for emoji logs (🔔 ✅ ⚠️)

🐛 Debugging:
  - Check Supabase → Logs → Postgres Logs for NOTICE messages
  - Look for emoji markers: ✅ success, ⚠️ warning, 🔄 processing
  - Browser console will show detailed auth flow logs

' as result;

