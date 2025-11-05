# Auth Webhook Setup Guide

This guide shows you how to use Supabase Auth Webhooks to automatically sync new users from `auth.users` to `public.users` when they sign up.

## 🎯 Why Auth Webhooks?

- ✅ **Secure**: Uses Supabase's official Auth Webhook system
- ✅ **Reliable**: Built-in retry mechanism
- ✅ **No SQL Triggers**: Doesn't require direct database access
- ✅ **Supported**: Official Supabase feature

## 📋 Prerequisites

- Edge Function `sync-auth-users-realtime` must be deployed
- Service Role Key available (for edge function)

## 🚀 Step-by-Step Setup

### Step 1: Verify Edge Function is Deployed

```bash
# Deploy the edge function (if not already deployed)
supabase functions deploy sync-auth-users-realtime --no-verify-jwt
```

Verify it's deployed:
1. Go to Supabase Dashboard → Edge Functions
2. Look for `sync-auth-users-realtime`
3. Status should be "Active"

### Step 2: Get Your Edge Function URL

1. In Supabase Dashboard → Edge Functions → `sync-auth-users-realtime`
2. Copy the **Function URL** (looks like):
   ```
   https://YOUR-PROJECT-REF.supabase.co/functions/v1/sync-auth-users-realtime
   ```

### Step 3: Configure Auth Webhook in Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to: **Authentication** → **Webhooks** (or **Settings** → **Webhooks**)

2. **Click "Add Webhook"** or **"Create Webhook"**

3. **Configure the Webhook:**
   
   **Name:**
   ```
   Sync Auth Users to Public Users
   ```

   **HTTP Request:**
   - **URL**: Paste your edge function URL from Step 2
   - **HTTP Method**: `POST`
   - **HTTP Headers**: 
     ```
     Authorization: Bearer YOUR_SERVICE_ROLE_KEY
     Content-Type: application/json
     ```
     *(Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key from Settings → API)*

   **Events:**
   - ✅ Check **`user.created`** (when new user signs up)
   - ✅ Optionally check **`user.updated`** (if you want to sync profile updates)

   **Enabled:**
   - ✅ Toggle to **ON**

4. **Click "Save"** or **"Create Webhook"**

### Step 4: Test the Webhook

1. **Create a test user:**
   - Go to your app's login page
   - Sign up with a new Google account (or create a test user)

2. **Check Edge Function Logs:**
   - Go to Supabase Dashboard → Edge Functions → `sync-auth-users-realtime` → **Logs**
   - You should see logs like:
     ```
     🔄 ========== SYNC AUTH USERS FUNCTION CALLED ==========
     ✅ Extracted auth user: { id: '...', email: '...' }
     ✅ Successfully upserted user: { id: '...', email: '...', username: '...' }
     ```

3. **Verify User Created:**
   - Go to Supabase Dashboard → Table Editor → `users`
   - Check if new user was created in `public.users` table

### Step 5: Disable SQL Triggers (If They Exist)

Since we're using Auth Webhooks now, we should disable the old SQL triggers:

```sql
-- Connect to your Supabase database via SQL Editor

-- Check if trigger exists
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname = 'sync_auth_user_to_public' 
AND tgrelid = 'auth.users'::regclass;

-- Disable the trigger (if it exists)
ALTER TABLE auth.users DISABLE TRIGGER sync_auth_user_to_public;

-- Or drop it completely (optional, but recommended)
DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;
```

## 🔍 Troubleshooting

### Webhook Not Triggering

1. **Check Webhook Status:**
   - Go to Dashboard → Authentication → Webhooks
   - Verify webhook is **Enabled** and shows **Active** status

2. **Check Function Logs:**
   - Dashboard → Edge Functions → `sync-auth-users-realtime` → Logs
   - Look for errors or failed requests

3. **Verify Service Role Key:**
   - Dashboard → Settings → API
   - Copy the **service_role** key (not anon key!)
   - Make sure it's correctly set in webhook headers

4. **Test Webhook Manually:**
   ```bash
   curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/sync-auth-users-realtime \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "id": "test-user-id",
       "email": "test@example.com",
       "raw_user_meta_data": {
         "name": "Test User",
         "picture": "https://example.com/avatar.jpg"
       },
       "created_at": "2025-01-01T00:00:00Z"
     }'
   ```

### User Not Created in public.users

1. **Check Edge Function Response:**
   - Look at function logs for errors
   - Verify `upsertUserFromAuth` function succeeded

2. **Check RLS Policies:**
   - Make sure service role key has permission to insert into `users` table
   - Check table policies: Dashboard → Table Editor → `users` → Policies

3. **Verify Username Generation:**
   - Check logs for username conflicts
   - Username generation might be failing

### Webhook Returns 401 Unauthorized

- **Issue**: Service Role Key incorrect or missing
- **Fix**: 
  1. Get correct key from Dashboard → Settings → API → service_role key
  2. Update webhook headers with correct key

## 📝 Auth Webhook Payload Format

Supabase Auth Webhooks send payloads in this format:

```json
{
  "type": "user.created",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "raw_user_meta_data": {
      "name": "User Name",
      "picture": "https://...",
      "sub": "google-user-id"
    },
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

The edge function `sync-auth-users-realtime` already handles this format in the `extractAuthUserFromPayload` function.

## ✅ Verification Checklist

- [ ] Edge function `sync-auth-users-realtime` is deployed
- [ ] Auth Webhook is created in Supabase Dashboard
- [ ] Webhook URL points to correct edge function
- [ ] Service Role Key is set in webhook headers
- [ ] `user.created` event is enabled
- [ ] Webhook is enabled/toggled ON
- [ ] SQL triggers are disabled (if they existed)
- [ ] Test user signup creates user in `public.users`
- [ ] Edge function logs show successful sync

## 🎉 Success!

Once configured, every new user signup will automatically:
1. Create user in `auth.users` (Supabase Auth)
2. Trigger Auth Webhook → Edge Function
3. Create user in `public.users` with auto-generated username

No manual intervention needed! 🚀

