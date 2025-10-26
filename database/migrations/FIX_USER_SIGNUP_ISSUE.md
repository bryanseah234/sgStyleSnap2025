# Fix for "Database error saving new user"

## 🔴 Problem
New users cannot sign up with Google OAuth. Error message: **"server_error: Database error saving new user"**

Existing users can login normally.

## 🔍 Root Cause
The database trigger `sync_auth_user_to_public()` is being blocked by Row Level Security (RLS) policies when trying to create a new user record in the `public.users` table.

Even though the trigger function has `SECURITY DEFINER`, it still respects RLS policies and doesn't have the necessary permissions to INSERT into the users table.

## ✅ Solution

### Option 1: Quick Fix via Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to: **SQL Editor**

2. **Run the Diagnostic Query First** (optional but recommended)
   - Open: `database/migrations/DIAGNOSE_USER_CREATION_ISSUE.sql`
   - Copy and paste the entire contents
   - Click **Run**
   - Review the output to confirm the diagnosis

3. **Apply the Fix**
   - Open: `database/migrations/028_fix_user_creation_rls.sql`
   - Copy and paste the entire contents
   - Click **Run**
   - You should see a success message

4. **Test the Fix**
   - Try signing up a new user via Google OAuth
   - Check **Logs → Postgres Logs** for success messages with ✅ emoji
   - Verify the new user appears in the `public.users` table

### Option 2: Manual Fix (If migration fails)

If the migration file doesn't work, run these commands manually in SQL Editor:

```sql
-- 1. Remove old restrictive policy
DROP POLICY IF EXISTS "Admin can insert users" ON users;

-- 2. Create new policy for service role
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

-- 3. Grant permissions to trigger function
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;

-- 4. Grant table permissions
GRANT INSERT ON public.users TO service_role;
GRANT INSERT ON public.users TO postgres;
GRANT SELECT ON public.users TO service_role;
GRANT SELECT ON public.users TO postgres;

-- 5. Add unique constraint on username (prevents duplicates)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_username_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
    END IF;
END $$;
```

### Option 3: Via psql Command Line

If you have `psql` installed:

```bash
# Set your database connection string
export DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Run the fix migration
psql $DATABASE_URL -f database/migrations/028_fix_user_creation_rls.sql
```

## 🧪 Testing

After applying the fix:

1. **Clear browser cache** (to ensure fresh auth state)

2. **Try signing up a new user**:
   - Go to your app's signup page
   - Click "Sign in with Google"
   - Complete the Google OAuth flow

3. **Check Supabase Logs**:
   - Go to **Supabase → Logs → Postgres Logs**
   - Look for messages like:
     ```
     ========== NEW USER SYNC START ==========
     👤 User ID: xxx-xxx-xxx
     📧 Email: user@example.com
     ✅ Successfully created user in public.users
     ```

4. **Verify in Database**:
   - Go to **Table Editor → users**
   - The new user should appear with:
     - Correct email
     - Auto-generated username (from email)
     - Google profile picture
     - Name from Google

## 📊 What Changed

| Before (Broken) | After (Fixed) |
|----------------|--------------|
| Policy: "Admin can insert users" | Policy: "Service role can insert users" |
| No explicit service_role grants | Explicit INSERT/SELECT grants to service_role and postgres |
| No username unique constraint | Username has UNIQUE constraint (prevents duplicates) |
| Trigger fails silently | Trigger logs detailed messages |

## 🔐 Security Impact

This fix does **NOT** compromise security:

- ✅ Only the `service_role` and `postgres` roles can insert users
- ✅ Regular authenticated users still cannot insert users directly
- ✅ The trigger still validates Google OAuth (only Google users allowed)
- ✅ All other RLS policies remain intact
- ✅ Existing users are unaffected

The `service_role` is a Supabase system role that bypasses RLS when needed for internal operations like triggers. This is the correct way to handle automated user creation.

## 🐛 If the Fix Doesn't Work

1. **Check if the migration actually ran**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users' AND policyname = 'Service role can insert users';
   ```
   Should return 1 row.

2. **Verify trigger exists and is enabled**:
   ```sql
   SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'sync_auth_user_to_public';
   ```
   Should show `tgenabled` as 'O' (origin enabled).

3. **Check for other errors in Postgres Logs**:
   - Look for `RAISE WARNING` or `RAISE EXCEPTION` messages
   - Note any specific error codes or constraint violations

4. **Verify Google OAuth is configured correctly**:
   - Supabase → Authentication → Providers → Google (should be enabled)
   - Redirect URLs should match your app domain

## 📞 Still Having Issues?

If the problem persists after applying the fix:

1. **Export diagnostic output**:
   - Run `DIAGNOSE_USER_CREATION_ISSUE.sql`
   - Save the output
   
2. **Check these logs**:
   - Supabase → Logs → Postgres Logs
   - Supabase → Logs → Auth Logs
   - Browser console errors

3. **Common additional issues**:
   - Google OAuth credentials incorrect
   - Redirect URLs misconfigured
   - Service role key not set correctly
   - Database connection pool exhausted

## 📝 Technical Details

### Why This Happened

The original migration (002_rls_policies.sql) created this policy:

```sql
CREATE POLICY "Admin can insert users" ON users
    FOR INSERT WITH CHECK (true);
```

This policy allows INSERT, but doesn't specify which roles it applies to. By default, it applies to the role making the insert (which in a trigger context is ambiguous).

PostgreSQL RLS policies need explicit role grants, especially for `SECURITY DEFINER` functions that run with elevated privileges.

### Why `SECURITY DEFINER` Alone Isn't Enough

A common misconception is that `SECURITY DEFINER` bypasses RLS. It doesn't!

- `SECURITY DEFINER` = Function runs with owner's privileges
- But RLS policies still apply to the function's queries
- You need to explicitly grant permissions to the roles that will execute the function

### The Correct Pattern

For triggers that insert/update data:

1. Create RLS policy for `service_role` and `postgres`
2. Grant EXECUTE on the function to those roles
3. Grant table-level permissions (INSERT, SELECT, etc.)
4. Use `SECURITY DEFINER` for the function
5. Add proper error handling in the function

This is now implemented in the fix!

---

**After applying this fix, new user signups should work perfectly! 🎉**

