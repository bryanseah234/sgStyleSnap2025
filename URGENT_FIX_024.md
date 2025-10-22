# URGENT: Fix Migration 024 Functions

## The Problem

The error in your URL shows:
```
ERROR: function update_user_google_profile(uuid) does not exist (SQLSTATE 42883)
```

This function is from **migration 024** (Google profile sync). It's triggered when a user **updates** (re-authenticates), not on initial signup.

## Why This Happens

Even though you ran migration 024 in Supabase with "no error", the functions might not have been created due to:
1. Silent failures in function creation
2. Schema/permission issues
3. The script was partially executed
4. Functions were created in wrong schema

## Quick Fix (5 minutes)

### Step 1: Verify Functions Exist

1. Open **Supabase SQL Editor**
2. Run this query:

```sql
SELECT 
    p.proname as function_name,
    pg_catalog.pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
WHERE p.proname IN (
    'update_user_google_profile',
    'get_current_google_profile_data',
    'sync_google_profile_photo'
);
```

**Expected Result**: You should see 3 functions listed.

**If you see 0 rows** or missing functions → Functions don't exist, proceed to Step 2.

### Step 2: Recreate Functions

Copy and run the **ENTIRE contents** of `database/VERIFY_AND_FIX_024.sql` in Supabase SQL Editor.

This will:
- ✅ Drop any partial/broken functions
- ✅ Recreate all migration 024 functions with proper error handling
- ✅ Add logging for debugging
- ✅ Set correct permissions
- ✅ Verify everything was created

### Step 3: Verify Success

After running the script, you should see at the end:

```
✅ Migration 024 functions and triggers recreated successfully!
```

And the verification queries should show all 4 functions exist.

### Step 4: Test Login

1. Clear browser cache and cookies
2. Try to login with Google
3. This time it should work!

## What These Functions Do

- **`get_current_google_profile_data(uuid)`**: Fetches user's current Google profile data from auth.users
- **`update_user_google_profile(uuid)`**: Updates public.users with latest Google data  
- **`sync_google_profile_photo()`**: Trigger function that runs when auth.users is updated
- **Trigger `sync_google_profile_photo`**: Automatically syncs profile when user re-authenticates

## Why You're Seeing This Error Now

The error appears in the OAuth callback URL because:

1. You click "Sign in with Google"
2. Google authenticates you
3. Supabase receives the auth data
4. Supabase **UPDATES** the auth.users record (for re-authentication)
5. The UPDATE trigger `sync_google_profile_photo` fires
6. The trigger calls `update_user_google_profile(user_id)`
7. **ERROR**: Function doesn't exist!
8. OAuth fails and redirects back with error in URL

## After the Fix

After running the fix script:

1. The functions will exist
2. The trigger will work
3. Login will succeed
4. You'll see helpful logs in Supabase → Logs → Postgres Logs like:
   ```
   🔔 sync_google_profile_photo: Trigger fired for user <uuid>
   ✅ Profile synchronized for user <uuid>
   ```

## If You Still Have Issues

1. **Check Supabase Logs** (Dashboard → Logs → Postgres Logs)
   - Look for the 🔔 and ✅ NOTICE messages
   - Look for any ERROR or WARNING messages

2. **Check Browser Console**
   - Look for the detailed auth flow logs we added
   - Should show session creation and profile fetching

3. **Verify User Tables**
   ```sql
   -- Check if user is in auth.users
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   
   -- Check if user is in public.users
   SELECT id, email FROM public.users WHERE email = 'your-email@example.com';
   ```

## Quick Checklist

- [ ] Run verification query (Step 1)
- [ ] Functions missing? Run `VERIFY_AND_FIX_024.sql` (Step 2)
- [ ] See success message? (Step 3)
- [ ] Clear browser cache
- [ ] Try login again (Step 4)
- [ ] Login successful? ✅ Done!

## Why This Wasn't Caught Earlier

- Migration 024 is for **UPDATE** operations (existing users re-authenticating)
- Migration 025 we just created is for **INSERT** operations (new users)
- If you were only testing new user signups, you wouldn't hit this error
- This error appears when existing users try to login

## Prevention

Going forward, always verify functions were created after running migrations:

```sql
-- After running ANY migration with functions, verify with:
\df+ function_name

-- Or:
SELECT proname FROM pg_proc WHERE proname LIKE '%your_function%';
```

---

**Need Help?** If this doesn't work, share:
1. Results of Step 1 verification query
2. Any errors from running the fix script
3. Browser console logs
4. Supabase Postgres logs

