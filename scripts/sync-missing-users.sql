-- ============================================
-- Script: Sync Missing Users from auth.users to public.users
-- Description: Copies all users from auth.users to public.users
--              that don't already exist in public.users
-- Usage: Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ENSURE GENERATE_UNIQUE_USERNAME FUNCTION EXISTS
-- ============================================

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
-- 2. SYNC MISSING USERS
-- ============================================

DO $$
DECLARE
    auth_user RECORD;
    user_name TEXT;
    user_avatar TEXT;
    user_google_id TEXT;
    generated_username TEXT;
    users_inserted INTEGER := 0;
    users_skipped INTEGER := 0;
    users_errors INTEGER := 0;
BEGIN
    RAISE NOTICE '========== STARTING USER SYNC ==========';
    RAISE NOTICE 'Scanning auth.users for missing users...';
    
    -- Loop through all users in auth.users
    FOR auth_user IN 
        SELECT 
            id,
            email,
            raw_user_meta_data,
            raw_app_meta_data,
            created_at,
            updated_at
        FROM auth.users
        WHERE email IS NOT NULL
    LOOP
        -- Check if user already exists in public.users
        IF EXISTS (SELECT 1 FROM public.users WHERE id = auth_user.id) THEN
            users_skipped := users_skipped + 1;
            CONTINUE;
        END IF;
        
        -- Generate unique username
        BEGIN
            generated_username := generate_unique_username(auth_user.id, auth_user.email);
            
            -- Extract user data from auth metadata
            user_name := COALESCE(
                auth_user.raw_user_meta_data->>'name',
                auth_user.raw_user_meta_data->>'full_name',
                split_part(auth_user.email, '@', 1)
            );
            
            -- Use Google profile picture ONLY (no fallback)
            user_avatar := auth_user.raw_user_meta_data->>'picture';
            
            user_google_id := COALESCE(
                auth_user.raw_user_meta_data->>'sub',
                auth_user.raw_user_meta_data->>'provider_id'
            );
            
            -- Insert the user into public.users
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
                generated_username,
                user_name,
                user_avatar,
                user_google_id,
                auth_user.created_at,
                auth_user.updated_at
            );
            
            users_inserted := users_inserted + 1;
            
            -- Log progress every 10 users
            IF users_inserted % 10 = 0 THEN
                RAISE NOTICE 'Progress: % users inserted...', users_inserted;
            END IF;
            
        EXCEPTION
            WHEN unique_violation THEN
                users_skipped := users_skipped + 1;
                RAISE WARNING 'User % already exists (unique violation)', auth_user.email;
            WHEN OTHERS THEN
                users_errors := users_errors + 1;
                RAISE WARNING 'Error inserting user %: % (SQLSTATE: %)', auth_user.email, SQLERRM, SQLSTATE;
        END;
    END LOOP;
    
    RAISE NOTICE '========== USER SYNC COMPLETE ==========';
    RAISE NOTICE '✅ Users inserted: %', users_inserted;
    RAISE NOTICE '⏭️  Users skipped (already exist): %', users_skipped;
    RAISE NOTICE '❌ Users with errors: %', users_errors;
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- 3. VERIFY RESULTS
-- ============================================

-- Show summary
SELECT 
    'Summary' as report_type,
    COUNT(*) as total_auth_users,
    (SELECT COUNT(*) FROM public.users) as total_public_users,
    COUNT(*) - (SELECT COUNT(*) FROM public.users) as difference
FROM auth.users
WHERE email IS NOT NULL;

-- Show users that are still missing (if any)
SELECT 
    'Missing Users' as report_type,
    au.id,
    au.email,
    au.created_at as auth_created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
  AND au.email IS NOT NULL
ORDER BY au.created_at DESC
LIMIT 10;

-- Show recently synced users
SELECT 
    'Recently Synced' as report_type,
    id,
    email,
    username,
    name,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

