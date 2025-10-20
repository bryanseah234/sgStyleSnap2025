# 🚨 URGENT: OAuth Callback Error Fix

## Problem
The OAuth callback is failing with this error:
```
❌ OAuthCallback: OAuth error: server_error ERROR: function update_user_google_profile(uuid) does not exist (SQLSTATE 42883)
```

## Root Cause
The `update_user_google_profile` function doesn't exist in your Supabase database because the migration `024_google_profile_sync.sql` hasn't been run yet.

## Quick Fix (Recommended)

### Option 1: Run Migration via Supabase Dashboard (Easiest)

1. **Go to your Supabase Dashboard**
   - Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your StyleSnap project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the Migration**
   - Click "New Query"
   - Copy and paste the entire contents of `database/migrations/024_google_profile_sync.sql`
   - Click "Run" to execute the migration

4. **Verify the Function Exists**
   - Run this query to verify:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'update_user_google_profile';
   ```
   - You should see `update_user_google_profile` in the results

### Option 2: Run Migration via Command Line

1. **Create .env file** (if you don't have one):
   ```bash
   # Create .env file
   touch .env
   ```

2. **Add your Supabase credentials to .env**:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Run the migration**:
   ```bash
   node scripts/run-migrations.js
   ```

## What This Migration Does

The `024_google_profile_sync.sql` migration creates:

- ✅ `get_current_google_profile_data(uuid)` - Gets Google profile data
- ✅ `update_user_google_profile(uuid)` - Updates user profile with Google data
- ✅ `sync_user_profile_photo(uuid)` - RPC function for manual sync
- ✅ `sync_all_user_profiles()` - RPC function for bulk sync
- ✅ Trigger to auto-sync on auth.users updates
- ✅ Proper permissions for authenticated users

## After Running the Migration

1. **Test OAuth Login**
   - Try logging in with Google again
   - The OAuth callback should now work properly

2. **Verify Profile Sync**
   - Check that your profile data is synced with Google
   - Go to `/profile` page to see your Google profile data

## Why This Happened

The OAuth callback process tries to sync your Google profile data with the database, but the required database functions weren't created yet. This is a one-time setup issue that will be resolved after running the migration.

## Need Help?

If you continue to have issues:
1. Check the Supabase logs for any SQL errors
2. Verify your Supabase project has Google OAuth properly configured
3. Make sure you have the correct permissions in your Supabase project

---

**This is a critical fix needed for OAuth authentication to work properly!** 🚨
