-- Migration 025: Fix Auth User Sync with Better Error Handling
-- This migration fixes the sync_auth_user_to_public trigger to be more resilient
-- and adds comprehensive logging for debugging authentication issues

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;
DROP FUNCTION IF EXISTS sync_auth_user_to_public();

-- Create improved function with better error handling and logging
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
    RAISE NOTICE '========== Auth User Sync Start ==========';
    RAISE NOTICE 'User ID: %', NEW.id;
    RAISE NOTICE 'User email: %', NEW.email;
    RAISE NOTICE 'Created at: %', NEW.created_at;
    
    -- Extract provider information with multiple fallback paths
    provider_value := COALESCE(
        NEW.raw_app_meta_data->>'provider',
        NEW.app_metadata->>'provider',
        'unknown'
    );
    
    RAISE NOTICE 'Provider: %', provider_value;
    RAISE NOTICE 'raw_app_meta_data: %', NEW.raw_app_meta_data::text;
    RAISE NOTICE 'raw_user_meta_data: %', NEW.raw_user_meta_data::text;
    
    -- Only process Google OAuth users, but with a warning instead of hard error
    IF provider_value IS NULL OR provider_value != 'google' THEN
        RAISE WARNING 'Non-Google provider detected: %. Skipping user sync. Only Google OAuth is supported.', provider_value;
        RAISE NOTICE 'User will not be added to public.users table';
        -- Return NEW to allow the auth.users insert to complete
        -- This prevents authentication from failing completely
        RETURN NEW;
    END IF;

    -- Extract username base from email (part before @)
    username_base := split_part(NEW.email, '@', 1);
    temp_username := username_base;
    
    RAISE NOTICE 'Username base: %', username_base;
    
    -- Handle username conflicts by appending numbers if needed
    WHILE EXISTS (SELECT 1 FROM public.users WHERE username = temp_username) LOOP
        counter := counter + 1;
        temp_username := username_base || counter::text;
        RAISE NOTICE 'Username conflict, trying: %', temp_username;
    END LOOP;
    
    RAISE NOTICE 'Final username: %', temp_username;

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
    
    RAISE NOTICE 'Extracted data - Name: %, Avatar: %, Google ID: %', 
        user_name, user_avatar, user_google_id;

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
        RAISE NOTICE 'User ID: %, Email: %, Username: %', NEW.id, NEW.email, temp_username;
    EXCEPTION
        WHEN unique_violation THEN
            -- If we hit a unique constraint, log it but don't fail
            RAISE WARNING 'User already exists in public.users (unique violation). Skipping insert.';
            RAISE NOTICE 'This is normal for existing users or re-authentication.';
        WHEN OTHERS THEN
            -- Log any other errors but don't fail the authentication
            RAISE WARNING 'Error inserting user into public.users: % - %', SQLERRM, SQLSTATE;
            RAISE NOTICE 'User will still be authenticated via auth.users';
            RAISE NOTICE 'Error details - Message: %, State: %', SQLERRM, SQLSTATE;
    END;
    
    RAISE NOTICE '========== Auth User Sync Complete ==========';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
CREATE TRIGGER sync_auth_user_to_public
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_auth_user_to_public();

-- Add comment for documentation
COMMENT ON FUNCTION sync_auth_user_to_public() IS 'Automatically syncs new Google OAuth users from auth.users to public.users with comprehensive error handling and logging';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;

