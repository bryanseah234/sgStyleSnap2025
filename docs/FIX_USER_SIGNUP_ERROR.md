# Fix: "Database error saving new user"

## Problem
New users cannot sign up with Google OAuth. The error message is: **"server_error: Database error saving new user"**

This happens when the database trigger that creates user profiles fails.

## Root Cause
The trigger function `sync_auth_user_to_public()` is either:
1. Not configured properly (missing Supabase URL for Edge Function)
2. Edge Function call is failing and fallback also fails
3. Missing RLS policies that allow inserts
4. Username conflicts causing insert failures

## Solution

### Step 1: Run Diagnostic (Optional but Recommended)

1. Go to **Supabase Dashboard → SQL Editor**
2. Open `database/migrations/DIAGNOSE_USER_SYNC.sql`
3. Copy and paste the entire contents
4. Click **Run**
5. Review the output to identify specific issues

### Step 2: Apply the Fix

1. In **Supabase Dashboard → SQL Editor**
2. Open `database/migrations/062_fix_user_sync_with_robust_fallback.sql`
3. Copy and paste the entire contents
4. Click **Run**
5. You should see success messages with ✅ emojis

### Step 3: Configure Supabase URL (If Using Edge Function)

If you want to use the Edge Function approach (optional), configure your Supabase URL:

```sql
INSERT INTO app_config (key, value) 
VALUES ('supabase_url', 'https://YOUR-PROJECT-REF.supabase.co')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
```

Replace `YOUR-PROJECT-REF` with your actual Supabase project reference (e.g., `nztqjmknblelnzpeatyx`).

**Note**: The fix includes a robust fallback that will work even without the Edge Function configured, so this step is optional.

### Step 4: Test the Fix

1. Try signing up a new user via Google OAuth
2. Check **Logs → Postgres Logs** for success messages:
   - ✅ User created successfully in public.users
   - ✅ Username: [username]
   - ✅ NEW USER SYNC COMPLETE
3. Verify the new user appears in the `public.users` table

## What This Fix Does

The migration `062_fix_user_sync_with_robust_fallback.sql`:

1. ✅ Creates a helper function `generate_unique_username_for_sync()` that properly handles username conflicts
2. ✅ Updates the trigger function with:
   - Better error handling that doesn't fail authentication
   - Proper username conflict resolution
   - Synchronous fallback insert that ensures user is created even if Edge Function fails
3. ✅ Ensures RLS policies allow `service_role` and `postgres` to insert users
4. ✅ Grants all necessary permissions
5. ✅ Provides comprehensive logging for debugging

## Key Improvements

- **Robust Username Generation**: Handles conflicts by appending numbers or UUID fragments
- **Synchronous Fallback**: Even if Edge Function is called, a synchronous insert ensures the user is created immediately
- **Better Error Handling**: Errors are logged but don't fail authentication
- **Duplicate Prevention**: Checks if user already exists before attempting insert

## Verification

After running the migration, verify everything is working:

```sql
-- Check trigger exists
SELECT tgname FROM pg_trigger 
WHERE tgname = 'sync_auth_user_to_public';

-- Check function exists
SELECT proname FROM pg_proc 
WHERE proname = 'sync_auth_user_to_public';

-- Check RLS policy exists
SELECT policyname FROM pg_policies
WHERE tablename = 'users' 
  AND policyname = 'Service role can insert users';
```

All three queries should return results.

## Troubleshooting

If the issue persists:

1. **Check Postgres Logs** in Supabase Dashboard for specific error messages
2. **Verify RLS is enabled** on the users table (it should be)
3. **Check for username conflicts** manually:
   ```sql
   SELECT username, COUNT(*) 
   FROM users 
   GROUP BY username 
   HAVING COUNT(*) > 1;
   ```
4. **Manually create missing profiles** using `database/manual_create_profile.sql`

## Alternative: Quick Manual Fix

If you need an immediate fix without running the migration:

```sql
-- 1. Ensure RLS policy exists
CREATE POLICY IF NOT EXISTS "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

-- 2. Grant permissions
GRANT INSERT ON public.users TO service_role;
GRANT INSERT ON public.users TO postgres;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;
```

However, the full migration is recommended as it includes username conflict resolution and better error handling.

