-- Migration 024: Google Profile Photo Synchronization
-- This migration adds automatic synchronization of Google profile photos
-- to ensure Supabase user records always match the current Google profile

-- ============================================
-- DROP EXISTING OBJECTS (if they exist)
-- ============================================
DROP TRIGGER IF EXISTS sync_google_profile_photo ON auth.users;
DROP FUNCTION IF EXISTS sync_google_profile_photo();
DROP FUNCTION IF EXISTS update_user_google_profile(UUID);
DROP FUNCTION IF EXISTS get_current_google_profile_photo(UUID);

-- ============================================
-- HELPER FUNCTIONS
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
    -- Get current Google profile data
    SELECT get_current_google_profile_data(user_id) INTO google_data;
    
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
        
        RAISE NOTICE 'Updated profile for user %: changes made to %', 
            user_id, array_to_string(changes_made, ', ');
    END IF;
    
    RETURN profile_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER FUNCTION
-- ============================================

-- Function to handle profile synchronization on auth.users updates
CREATE OR REPLACE FUNCTION sync_google_profile_photo()
RETURNS TRIGGER AS $$
DECLARE
    profile_updated BOOLEAN;
BEGIN
    -- Only process if this is an update to an existing user
    IF TG_OP = 'UPDATE' AND OLD.id = NEW.id THEN
        -- Check if the user exists in public.users
        IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
            -- Update the profile with current Google data
            SELECT update_user_google_profile(NEW.id) INTO profile_updated;
            
            IF profile_updated THEN
                RAISE NOTICE 'Profile synchronized for user %', NEW.id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Create trigger to sync profile on auth.users updates
CREATE TRIGGER sync_google_profile_photo
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_google_profile_photo();

-- ============================================
-- RPC FUNCTIONS (for manual sync)
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

-- Function to sync all users' profiles
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
-- GRANTS
-- ============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION sync_user_profile_photo(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_all_user_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_google_profile_photo(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_google_profile_data(UUID) TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION get_current_google_profile_data(UUID) IS 'Gets comprehensive Google profile data from auth.users including name, email, avatar, etc.';
COMMENT ON FUNCTION get_current_google_profile_photo(UUID) IS 'Gets the current Google profile photo URL from auth.users (legacy function)';
COMMENT ON FUNCTION update_user_google_profile(UUID) IS 'Updates user profile with current Google data if there are changes to any field';
COMMENT ON FUNCTION sync_google_profile_photo() IS 'Trigger function to sync profile on auth.users updates';
COMMENT ON FUNCTION sync_user_profile_photo(UUID) IS 'Manually sync a specific user profile with comprehensive Google data';
COMMENT ON FUNCTION sync_all_user_profiles() IS 'Sync all user profiles with their current Google data';
