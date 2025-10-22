-- Verify and Fix Migration 024 Functions
-- Run this in Supabase SQL Editor to check and fix the missing function issue

-- ============================================
-- STEP 1: CHECK IF FUNCTIONS EXIST
-- ============================================

-- Check for update_user_google_profile function
SELECT 
    p.proname as function_name,
    pg_catalog.pg_get_function_arguments(p.oid) as arguments,
    pg_catalog.pg_get_function_result(p.oid) as result_type,
    n.nspname as schema
FROM pg_proc p
LEFT JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname LIKE '%update_user_google_profile%';

-- Check for get_current_google_profile_data function
SELECT 
    p.proname as function_name,
    pg_catalog.pg_get_function_arguments(p.oid) as arguments,
    n.nspname as schema
FROM pg_proc p
LEFT JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname LIKE '%get_current_google_profile_data%';

-- Check for sync_google_profile_photo function
SELECT 
    p.proname as function_name,
    pg_catalog.pg_get_function_arguments(p.oid) as arguments,
    n.nspname as schema
FROM pg_proc p
LEFT JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname LIKE '%sync_google_profile_photo%';

-- Check for triggers
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname LIKE '%google_profile%';

-- ============================================
-- STEP 2: DROP AND RECREATE (IF NEEDED)
-- ============================================

-- If the above queries show the functions are missing or have issues,
-- run the rest of this script:

-- Drop existing objects (if they exist with issues)
DROP TRIGGER IF EXISTS sync_google_profile_photo ON auth.users;
DROP FUNCTION IF EXISTS sync_google_profile_photo();
DROP FUNCTION IF EXISTS update_user_google_profile(UUID);
DROP FUNCTION IF EXISTS get_current_google_profile_data(UUID);
DROP FUNCTION IF EXISTS get_current_google_profile_photo(UUID);

-- ============================================
-- RECREATE HELPER FUNCTIONS
-- ============================================

-- Function to get current Google profile data from auth.users
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

-- Function to update user profile with current Google data
CREATE OR REPLACE FUNCTION update_user_google_profile(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    google_data JSON;
    current_email TEXT;
    current_name TEXT;
    current_avatar_url TEXT;
    current_google_id TEXT;
    current_given_name TEXT;
    current_family_name TEXT;
    current_locale TEXT;
    current_verified_email BOOLEAN;
    
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
    current_given_name := google_data->>'given_name';
    current_family_name := google_data->>'family_name';
    current_locale := google_data->>'locale';
    current_verified_email := COALESCE((google_data->>'verified_email')::boolean, false);
    
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
    
    RAISE NOTICE '🔄 Existing data - email: %, name: %, avatar: %', existing_email, existing_name, existing_avatar_url;
    RAISE NOTICE '🔄 Current data - email: %, name: %, avatar: %', current_email, current_name, current_avatar_url;
    
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
        
        RAISE NOTICE '✅ Updated profile for user %: changes made to %', 
            user_id, array_to_string(changes_made, ', ');
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
-- RECREATE TRIGGER FUNCTION
-- ============================================

-- Function to handle profile synchronization on auth.users updates
CREATE OR REPLACE FUNCTION sync_google_profile_photo()
RETURNS TRIGGER AS $$
DECLARE
    profile_updated BOOLEAN;
BEGIN
    RAISE NOTICE '🔔 sync_google_profile_photo: Trigger fired for user %', NEW.id;
    RAISE NOTICE '🔔 Trigger operation: %', TG_OP;
    
    -- Only process if this is an update to an existing user
    IF TG_OP = 'UPDATE' AND OLD.id = NEW.id THEN
        RAISE NOTICE '🔔 Processing UPDATE for user %', NEW.id;
        
        -- Check if the user exists in public.users
        IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
            RAISE NOTICE '✅ User found in public.users, attempting sync';
            
            -- Update the profile with current Google data
            BEGIN
                SELECT update_user_google_profile(NEW.id) INTO profile_updated;
                
                IF profile_updated THEN
                    RAISE NOTICE '✅ Profile synchronized for user %', NEW.id;
                ELSE
                    RAISE NOTICE 'ℹ️ Profile sync completed with no changes for user %', NEW.id;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE WARNING '⚠️ Error calling update_user_google_profile: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
            END;
        ELSE
            RAISE NOTICE 'ℹ️ User % not found in public.users, skipping sync', NEW.id;
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Skipping sync - operation is % (expected UPDATE)', TG_OP;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the trigger
        RAISE WARNING '⚠️ Error in sync_google_profile_photo trigger: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RECREATE TRIGGER
-- ============================================

-- Create trigger to sync profile on auth.users updates
CREATE TRIGGER sync_google_profile_photo
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_google_profile_photo();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_current_google_profile_photo(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_google_profile_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_google_profile(UUID) TO authenticated;

-- Grant to service_role for trigger execution
GRANT EXECUTE ON FUNCTION sync_google_profile_photo() TO service_role;
GRANT EXECUTE ON FUNCTION update_user_google_profile(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_current_google_profile_data(UUID) TO service_role;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify functions were created successfully
SELECT 
    p.proname as function_name,
    pg_catalog.pg_get_function_arguments(p.oid) as arguments,
    'Function exists' as status
FROM pg_proc p
WHERE p.proname IN (
    'update_user_google_profile',
    'get_current_google_profile_data',
    'get_current_google_profile_photo',
    'sync_google_profile_photo'
);

-- Verify trigger was created
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    'Trigger exists' as status
FROM pg_trigger
WHERE tgname = 'sync_google_profile_photo';

-- Done!
SELECT '✅ Migration 024 functions and triggers recreated successfully!' as result;

