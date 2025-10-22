# Migration 025 Deployment Guide

## Overview
This migration fixes the authentication user sync trigger to be more resilient and adds comprehensive logging for debugging login issues.

## What Changed

### Fixed Issues
1. **Trigger Exception Handling**: The previous trigger would raise an exception if the provider wasn't exactly 'google', which could prevent authentication from completing. Now it logs a warning and allows the auth.users insert to complete.

2. **Better Metadata Extraction**: Added multiple fallback paths for extracting user data (name, avatar, google_id) to handle different metadata structures from Supabase/Google OAuth.

3. **Comprehensive Logging**: Added detailed NOTICE and WARNING logs to help diagnose authentication issues:
   - User ID, email, provider information
   - Metadata structure
   - Username generation
   - Success/failure of profile creation

4. **Non-Failing Profile Creation**: The trigger now catches and logs errors but doesn't fail the authentication process. Users can still authenticate even if profile creation has an issue.

## Deployment Steps

### Step 1: Run in Supabase SQL Editor

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy the contents of `database/migrations/025_fix_auth_user_sync.sql`
4. Execute the SQL

### Step 2: Verify Deployment

Run this query to verify the trigger is installed:

```sql
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'sync_auth_user_to_public';
```

You should see:
- trigger_name: `sync_auth_user_to_public`
- table_name: `auth.users`
- function_name: `sync_auth_user_to_public`

### Step 3: Test Authentication

1. Clear your browser cache and cookies for the application
2. Try to sign in with Google
3. Check the Supabase Logs (Dashboard → Logs → Postgres Logs) for the NOTICE messages:
   - Look for "========== Auth User Sync Start =========="
   - Check provider, metadata, and username information
   - Confirm "✅ Successfully created user in public.users"

### Step 4: Monitor for Errors

After deployment, monitor for these specific log patterns:

#### Success Pattern
```
NOTICE: ========== Auth User Sync Start ==========
NOTICE: User ID: <uuid>
NOTICE: User email: <email>
NOTICE: Provider: google
NOTICE: ✅ Successfully created user in public.users
NOTICE: ========== Auth User Sync Complete ==========
```

#### Warning Pattern (Non-Google Provider)
```
WARNING: Non-Google provider detected: <provider>. Skipping user sync.
NOTICE: User will not be added to public.users table
```

#### Error Pattern (Profile Creation Failed)
```
WARNING: Error inserting user into public.users: <error message>
NOTICE: User will still be authenticated via auth.users
```

## Rollback Plan

If you need to rollback to the previous version, run:

```sql
-- Drop the new trigger and function
DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;
DROP FUNCTION IF EXISTS sync_auth_user_to_public();

-- Re-run migration 012 to restore the original version
-- (see database/migrations/012_auth_user_sync.sql)
```

## Frontend Changes

The following frontend files have been updated with enhanced logging:

### src/services/authService.js
- Added detailed logging to `signInWithGoogle()`
- Added detailed logging to `setupAuthListener()`
- Added detailed logging to `createUserProfile()`

### src/stores/auth-store.js
- Added comprehensive OAuth callback logging
- Added proactive profile fetching/creation
- Enhanced session retrieval logging

### src/pages/OAuthCallback.vue
- Added URL parameter logging
- Added hash parameter logging
- Added auth state logging

## Expected Behavior After Deployment

1. **New Users**: When a new user signs in with Google:
   - They authenticate successfully via auth.users
   - The trigger creates their profile in public.users
   - They are redirected to the home page
   - All logs are visible in Supabase Postgres Logs

2. **Existing Users**: When an existing user signs in:
   - They authenticate successfully
   - The trigger detects the user already exists (unique violation)
   - Logs a warning but continues successfully
   - They are redirected to the home page

3. **Error Cases**: If profile creation fails:
   - Authentication still succeeds
   - User can access the app
   - Frontend attempts to create profile on next page load
   - Error is logged but doesn't break the flow

## Troubleshooting

### Users Can't Login

1. Check Supabase Postgres Logs for NOTICE/WARNING messages
2. Verify the trigger is installed (see Step 2)
3. Check if users are being created in auth.users (Supabase Dashboard → Authentication → Users)
4. Check if users are being created in public.users (run: `SELECT * FROM public.users`)

### Profile Not Created

1. Check Postgres Logs for the error message
2. Verify RLS policies allow insert (see migration 002)
3. Check for constraint violations (unique username, email, etc.)
4. Manually create profile using the frontend (it will auto-create on next page load)

### Browser Console Shows No Session

1. Check if cookies/localStorage are being blocked
2. Verify Supabase URL is correct in environment variables
3. Check CORS settings in Supabase
4. Verify redirect URL matches Supabase Auth settings

## Additional Notes

- This migration is backward compatible
- Existing users won't be affected
- The trigger only runs for new user signups
- All existing authentication flows remain unchanged

