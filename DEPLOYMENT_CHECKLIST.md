# Login Fix Deployment Checklist

## Pre-Deployment

- [ ] **Backup Database**: Ensure Supabase has recent backup (automatic daily backups are enabled)
- [ ] **Review Changes**: Check all modified files in git diff
- [ ] **Verify Environment Variables**: Confirm VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel

## Database Deployment

### Step 1: Deploy Migration 025
- [ ] Open Supabase SQL Editor
- [ ] Copy SQL from `database/migrations/025_fix_auth_user_sync.sql`
- [ ] Execute the SQL
- [ ] Verify no errors in execution

### Step 2: Verify Trigger Installation
Run this query:
```sql
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'sync_auth_user_to_public';
```

Expected result:
- trigger_name: `sync_auth_user_to_public`
- table_name: `auth.users`  
- function_name: `sync_auth_user_to_public`

- [ ] Trigger verified successfully

### Step 3: Test Trigger Function
Run this to verify the function exists:
```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'sync_auth_user_to_public';
```

- [ ] Function exists and returns code

## Frontend Deployment

### Step 1: Commit and Push Changes
```bash
git add .
git commit -m "Fix: Enhanced auth logging and improved user profile creation

- Fixed database trigger to handle auth errors gracefully
- Added comprehensive logging to auth flow
- Added proactive profile creation in OAuth callback
- Enhanced error handling throughout auth service"
git push
```

- [ ] Changes committed
- [ ] Changes pushed to repository

### Step 2: Verify Vercel Deployment
- [ ] Check Vercel dashboard for deployment status
- [ ] Wait for build to complete (usually 2-3 minutes)
- [ ] Verify deployment is successful (green checkmark)
- [ ] Note the deployment URL

## Testing

### Test 1: New User Signup

1. **Prepare**:
   - [ ] Open browser in incognito/private mode
   - [ ] Clear all site data for your app domain
   - [ ] Have a Google account ready (not previously used)

2. **Execute**:
   - [ ] Navigate to login page
   - [ ] Open browser console (F12)
   - [ ] Click "Sign in with Google"
   - [ ] Complete Google OAuth
   - [ ] Watch console logs

3. **Verify**:
   - [ ] Console shows "🔑 AuthService: ========== Initiating Google OAuth =========="
   - [ ] Redirects to Google
   - [ ] Returns to /auth/callback
   - [ ] Console shows "🔄 OAuthCallback: =============== START OAuth Callback ==============="
   - [ ] Console shows session found
   - [ ] Console shows profile created/fetched
   - [ ] Redirects to home page
   - [ ] User sees dashboard/home content

4. **Check Supabase**:
   - [ ] Go to Supabase → Authentication → Users
   - [ ] New user appears in list
   - [ ] Go to Supabase → SQL Editor
   - [ ] Run: `SELECT * FROM public.users WHERE email = 'test-email@example.com'`
   - [ ] User appears in public.users table

5. **Check Logs**:
   - [ ] Go to Supabase → Logs → Postgres Logs
   - [ ] Look for "========== Auth User Sync Start =========="
   - [ ] Verify "✅ Successfully created user in public.users"
   - [ ] No ERROR messages related to auth

### Test 2: Existing User Login

1. **Prepare**:
   - [ ] Clear browser cache and cookies
   - [ ] Use Google account from Test 1 (or any existing user)

2. **Execute**:
   - [ ] Navigate to login page
   - [ ] Open browser console
   - [ ] Click "Sign in with Google"
   - [ ] Complete Google OAuth

3. **Verify**:
   - [ ] OAuth completes successfully
   - [ ] Console shows session found
   - [ ] Console shows profile loaded
   - [ ] Redirects to home page
   - [ ] User sees their existing data

4. **Check Supabase Logs**:
   - [ ] Logs show either "unique violation" warning (expected) OR
   - [ ] Logs show "Profile already up-to-date"
   - [ ] No ERROR messages

### Test 3: Error Handling

1. **Test Scenario: Profile Creation Fails**:
   
   Temporarily break profile creation to test fallback:
   ```sql
   -- In Supabase SQL Editor (DO NOT RUN IN PRODUCTION)
   -- This is just to simulate an error
   ALTER TABLE public.users ADD CONSTRAINT test_constraint CHECK (false);
   ```

2. **Execute**:
   - [ ] Try to login with new Google account
   - [ ] Watch console and Supabase logs

3. **Verify**:
   - [ ] User still authenticates (appears in auth.users)
   - [ ] Console shows profile creation error
   - [ ] User is not blocked from accessing app
   - [ ] Supabase logs show WARNING (not ERROR)

4. **Cleanup**:
   ```sql
   ALTER TABLE public.users DROP CONSTRAINT IF EXISTS test_constraint;
   ```
   - [ ] Constraint removed

### Test 4: Multi-Device/Multi-Tab

1. **Prepare**:
   - [ ] Login on desktop browser
   - [ ] Open same app on mobile browser (or another tab)

2. **Execute**:
   - [ ] Login with same Google account
   - [ ] Verify both sessions work

3. **Verify**:
   - [ ] Both devices/tabs show user as logged in
   - [ ] No conflicts or errors

## Post-Deployment Monitoring

### Day 1
- [ ] Check Supabase Auth users count - should increase with new signups
- [ ] Check Postgres logs every 2-3 hours for errors
- [ ] Monitor Vercel logs for frontend errors
- [ ] Verify `auth.users` count matches `public.users` count

### Day 2-7
- [ ] Daily check of Supabase logs
- [ ] Monitor for any user reports of login issues
- [ ] Check user count growth is consistent

### Week 2
- [ ] Final verification that all new users have profiles
- [ ] Check for any orphaned users (in auth.users but not public.users)
- [ ] If any orphaned users found, run manual sync:
```sql
-- Check for orphaned users
SELECT au.id, au.email 
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Manual sync if needed (contact for instructions)
```

## Rollback Procedure (If Needed)

### If Database Migration Causes Issues

```sql
-- Drop the new trigger
DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;
DROP FUNCTION IF EXISTS sync_auth_user_to_public();

-- Re-run migration 012 (old version)
-- Get SQL from: database/migrations/012_auth_user_sync.sql
```

- [ ] Old trigger restored
- [ ] Test login again

### If Frontend Changes Cause Issues

```bash
git revert HEAD
git push
```

- [ ] Reverted to previous version
- [ ] Vercel deployed old version
- [ ] Login working again

## Success Criteria

✅ **All Tests Passed**:
- [ ] New users can sign up
- [ ] Existing users can login  
- [ ] Users appear in both auth.users and public.users
- [ ] No errors in Supabase logs
- [ ] Console logs show successful flow

✅ **Monitoring**:
- [ ] First 24 hours - no critical errors
- [ ] User count growing normally
- [ ] No user complaints about login

## Troubleshooting Quick Reference

### Issue: User stuck on login page
**Check**: Browser console for session errors
**Fix**: Verify Supabase redirect URL matches: `https://your-domain.vercel.app/auth/callback`

### Issue: User in auth.users but not public.users
**Check**: Supabase Postgres logs for trigger errors
**Fix**: Check trigger function logs, verify RLS policies

### Issue: "Provider not Google" warning
**Check**: Supabase logs for provider value
**Fix**: Verify Google OAuth is configured correctly in Supabase

### Issue: Profile creation timeout
**Check**: Console shows profile fetch errors
**Fix**: Profile will auto-create on next page load (by design)

## Documentation Updated

- [x] Migration file created: `database/migrations/025_fix_auth_user_sync.sql`
- [x] Deployment guide created: `database/MIGRATION_025_DEPLOYMENT.md`
- [x] Fix summary created: `docs/LOGIN_FIX_SUMMARY.md`
- [x] This checklist created: `DEPLOYMENT_CHECKLIST.md`

## Notes

- Keep this checklist handy during deployment
- Mark each item as you complete it
- If you encounter any issues not covered here, refer to `docs/LOGIN_FIX_SUMMARY.md`
- All detailed logs and error patterns are documented in the summary

