# Fix: New Users Not Created in public.users Table

## Problem
New users are being created in `auth.users` but NOT in `public.users`, causing authentication to fail with "Database error saving new user".

## Root Cause
The database trigger `sync_auth_user_to_public()` that should automatically create users in `public.users` is either:
1. Not firing (trigger missing)
2. Blocked by RLS policies
3. Missing permissions

## Solution: Fix in Supabase Dashboard

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project (`sgstylesnap`)
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run Diagnostic Query
Copy and paste this query to check the current state:

```sql
-- Check if trigger exists
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE WHEN tgisinternal THEN '✅ Internal' ELSE '✅ User-defined' END as trigger_type
FROM pg_trigger 
WHERE tgname = 'sync_auth_user_to_public' 
  AND tgrelid = 'auth.users'::regclass;

-- Check if function exists
SELECT 
    proname as function_name,
    CASE WHEN prosecdef THEN '✅ SECURITY DEFINER' ELSE '❌ No SECURITY DEFINER' END as security_type
FROM pg_proc 
WHERE proname = 'sync_auth_user_to_public';

-- Check RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users' 
  AND schemaname = 'public'
ORDER BY cmd, policyname;
```

### Step 3: Run the Fix Migration
Copy and paste the entire contents of `database/migrations/060_fix_user_creation_trigger.sql` into the SQL Editor and click **Run**.

**OR** manually run these commands:

```sql
-- 1. Recreate the trigger function with proper permissions
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
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;

    -- Generate unique username
    generated_username := generate_unique_username(NEW.id, NEW.email);

    -- Extract user data from auth metadata
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );
    
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
    EXCEPTION
        WHEN unique_violation THEN
            -- User already exists, skip
            NULL;
        WHEN OTHERS THEN
            -- Log error but don't fail auth
            RAISE WARNING 'Error inserting user: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;

-- 2. Recreate the trigger
DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;

CREATE TRIGGER sync_auth_user_to_public
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_auth_user_to_public();

-- 3. Ensure generate_unique_username function exists (if missing)
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
    username_base := split_part(user_email, '@', 1);
    username_base := LOWER(REGEXP_REPLACE(username_base, '[^a-zA-Z0-9]', '', 'g'));
    
    IF LENGTH(username_base) > 20 THEN
        username_base := SUBSTRING(username_base, 1, 20);
    END IF;
    
    unique_suffix := SUBSTRING(user_id::TEXT, 33, 4);
    final_username := username_base || '_' || unique_suffix;
    
    RETURN final_username;
END;
$$;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;
GRANT EXECUTE ON FUNCTION generate_unique_username(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION generate_unique_username(UUID, TEXT) TO postgres;

-- 5. Ensure RLS policy allows service_role to insert
DROP POLICY IF EXISTS "Service role can insert users" ON users;

CREATE POLICY "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

-- 6. Grant table permissions
GRANT INSERT ON public.users TO service_role;
GRANT INSERT ON public.users TO postgres;
GRANT SELECT ON public.users TO service_role;
GRANT SELECT ON public.users TO postgres;
```

### Step 4: Verify the Fix
Run this query to verify everything is set up correctly:

```sql
-- Verify trigger exists
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname = 'sync_auth_user_to_public';

-- Verify function exists
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'sync_auth_user_to_public';

-- Verify RLS policy exists
SELECT policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'users' 
  AND cmd = 'INSERT';
```

### Step 5: Test
1. Try signing up a new user via Google OAuth
2. Check **Logs → Postgres Logs** for any errors
3. Verify the user appears in `public.users` table:
   ```sql
   SELECT id, email, username, created_at 
   FROM public.users 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

## Alternative: Check Edge Function
If the trigger still doesn't work, check if the Edge Function `sync-auth-users-realtime` is enabled and working.

1. Go to **Edge Functions** in Supabase Dashboard
2. Check if `sync-auth-users-realtime` exists and is enabled
3. Check the logs for any errors

## Still Having Issues?
Check the Postgres Logs:
1. Go to **Logs → Postgres Logs** in Supabase Dashboard
2. Look for errors related to `sync_auth_user_to_public`
3. Look for RLS policy violations

