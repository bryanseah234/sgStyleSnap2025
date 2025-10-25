-- ============================================
-- EMERGENCY: Manually Create Missing User Profile
-- Run this if you're logged in but have no profile
-- ============================================

-- This will create a profile for all auth users that don't have a profile yet
INSERT INTO public.users (id, email, username, name, avatar_url, google_id, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    -- Generate unique username: emailprefix_uuid4chars
    LOWER(REGEXP_REPLACE(split_part(au.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '_' || SUBSTRING(au.id::TEXT, 33, 4),
    -- Extract name from metadata
    COALESCE(
        au.raw_user_meta_data->>'name',
        au.raw_user_meta_data->>'full_name',
        split_part(au.email, '@', 1)
    ),
    -- Use Google profile picture ONLY
    au.raw_user_meta_data->>'picture',
    -- Extract Google ID
    COALESCE(
        au.raw_user_meta_data->>'sub',
        au.raw_user_meta_data->>'provider_id'
    ),
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL  -- Only users without a profile
AND au.email IS NOT NULL;  -- Must have email

-- Show results
SELECT 
    'Created profile for: ' || email || ' (username: ' || username || ')' as result
FROM public.users
WHERE created_at > NOW() - INTERVAL '1 minute'
ORDER BY created_at DESC;

