-- ============================================
-- Migration: Improve Username Generation to Prevent Collisions
-- Description: Changes username generation to use email prefix + last 4 chars of UUID
--              Example: john@gmail.com → john_a3f2
--                       john@smu.edu.sg → john_b8c1
-- Date: 2025-10-25
-- ============================================

-- ============================================
-- 1. CREATE IMPROVED USERNAME GENERATION FUNCTION
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

COMMENT ON FUNCTION generate_unique_username IS 'Generates a unique username from email and user ID. Format: emailprefix_uuid4chars (e.g., john_a3f2)';

-- ============================================
-- 2. UPDATE EXISTING USERS WITH NEW USERNAME FORMAT (OPTIONAL)
-- ============================================

-- This section is commented out by default to prevent changing existing usernames.
-- Uncomment if you want to update all existing users to the new format.

/*
UPDATE public.users
SET username = generate_unique_username(id, email),
    updated_at = NOW()
WHERE username NOT LIKE '%\_%';  -- Only update users without underscore (old format)

-- Log the update
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count
    FROM public.users
    WHERE username LIKE '%\_%';
    
    RAISE NOTICE 'Updated % users to new username format', updated_count;
END $$;
*/

-- ============================================
-- 3. RECREATE USER SYNC TRIGGER WITH NEW USERNAME LOGIC
-- ============================================

DROP FUNCTION IF EXISTS sync_auth_user_to_public() CASCADE;

CREATE OR REPLACE FUNCTION sync_auth_user_to_public()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
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

    -- Generate unique username using the new function
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
        WHEN OTHERS THEN
            RAISE WARNING '⚠️ Error inserting user: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    END;
    
    RAISE NOTICE '========== NEW USER SYNC COMPLETE ==========';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sync_auth_user_to_public IS 'Trigger function to sync auth.users to public.users with improved username generation';

-- ============================================
-- 4. RECREATE TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;

CREATE TRIGGER sync_auth_user_to_public
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_auth_user_to_public();

COMMENT ON TRIGGER sync_auth_user_to_public ON auth.users IS 'Automatically syncs new auth users to public.users table with unique usernames';

-- ============================================
-- 5. UPDATE FRONTEND SERVICE TO USE SAME LOGIC
-- ============================================

-- Note for developers: Update src/services/authService.js to use the same format:
-- username: `${email.split('@')[0]}_${authUser.id.slice(-4)}`

-- ============================================
-- 6. GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION generate_unique_username(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_unique_username(UUID, TEXT) TO anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Migration 048: Username generation improved!';
  RAISE NOTICE 'New format: emailprefix_uuid4chars';
  RAISE NOTICE 'Example: john@gmail.com → john_a3f2';
  RAISE NOTICE 'Example: john@smu.edu.sg → john_b8c1';
  RAISE NOTICE '==============================================';
END $$;

