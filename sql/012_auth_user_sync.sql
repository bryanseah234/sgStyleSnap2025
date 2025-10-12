-- Migration 012: Auth User Sync
-- This migration adds a trigger to automatically sync auth.users to public.users
-- and imports existing users from auth.users following the Google OAuth-only policy

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;
DROP FUNCTION IF EXISTS sync_auth_user_to_public();
DROP FUNCTION IF EXISTS get_google_profile_data();

-- Helper function to extract Google profile data from auth.users
CREATE OR REPLACE FUNCTION get_google_profile_data(raw_meta jsonb)
RETURNS TABLE (
    full_name text,
    avatar_url text,
    google_id text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(
            raw_meta->>'full_name',
            raw_meta->>'name',
            raw_meta->'user_metadata'->>'full_name',
            raw_meta->'user_metadata'->>'name'
        ),
        COALESCE(
            raw_meta->>'avatar_url',
            raw_meta->'user_metadata'->>'avatar_url',
            '/public/avatars/default-' || (floor(random() * 6) + 1)::text || '.png'
        ),
        COALESCE(
            raw_meta->>'sub',
            raw_meta->'user_metadata'->>'sub'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle the sync
CREATE OR REPLACE FUNCTION sync_auth_user_to_public()
RETURNS TRIGGER AS $$
DECLARE
    username_base TEXT;
    counter INT := 0;
    temp_username TEXT;
    google_data RECORD;
BEGIN
    -- Only process Google OAuth users (guard for NULL jsonb)
    IF (NEW.raw_app_meta_data IS NULL OR (NEW.raw_app_meta_data->>'provider') IS NULL)
       OR (NEW.raw_app_meta_data->>'provider' != 'google') THEN
        RAISE EXCEPTION 'Only Google OAuth authentication is supported';
    END IF;

    -- Extract username base from email (part before @)
    username_base := split_part(NEW.email, '@', 1);
    temp_username := username_base;
    
    -- Handle username conflicts by appending numbers if needed
    WHILE EXISTS (SELECT 1 FROM public.users WHERE username = temp_username) LOOP
        counter := counter + 1;
        temp_username := username_base || counter::text;
    END LOOP;

    -- Insert the new user into public.users using raw_user_meta_data where appropriate
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
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->'user_metadata'->>'name'),
        COALESCE(NEW.raw_user_meta_data->>'picture', NEW.raw_user_meta_data->'user_metadata'->>'avatar_url'),
        COALESCE(NEW.raw_user_meta_data->>'sub', NEW.raw_user_meta_data->'user_metadata'->>'sub'),
        NEW.created_at,
        NEW.updated_at
    );
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- If we hit a unique constraint, just return NEW to allow the auth.users insert to complete
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error in sync_auth_user_to_public: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
CREATE TRIGGER sync_auth_user_to_public
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_auth_user_to_public();

-- Import existing users from auth.users that aren't in public.users
DO $$
DECLARE
    auth_user RECORD;
    google_data RECORD;
    username_base TEXT;
    temp_username TEXT;
    counter INT;
BEGIN
    FOR auth_user IN 
        SELECT au.* 
        FROM auth.users au
        LEFT JOIN public.users pu ON au.id = pu.id
        WHERE pu.id IS NULL
          AND (
              (au.raw_user_meta_data->>'provider' = 'google')
              OR (au.raw_app_meta_data->>'provider' = 'google')
          )
    LOOP
        BEGIN
            -- Extract username from email
            username_base := split_part(auth_user.email, '@', 1);
            temp_username := username_base;
            counter := 0;
            
            -- Handle username conflicts
            WHILE EXISTS (SELECT 1 FROM public.users WHERE username = temp_username) LOOP
                counter := counter + 1;
                temp_username := username_base || counter::text;
            END LOOP;

            -- Get Google profile data (safe if raw_user_meta_data is NULL)
            SELECT * INTO google_data 
            FROM get_google_profile_data(COALESCE(auth_user.raw_user_meta_data, '{}'::jsonb));

            -- Insert directly into public.users
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
                auth_user.id,
                auth_user.email,
                temp_username,
                google_data.full_name,
                google_data.avatar_url,
                google_data.google_id,
                auth_user.created_at,
                auth_user.updated_at
            );
            
            RAISE NOTICE 'Successfully imported user %: %', auth_user.id, auth_user.email;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to import user %: %', auth_user.id, SQLERRM;
        END;
    END LOOP;
END
$$;

-- Create an index to speed up email lookups (since we use email for login)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;