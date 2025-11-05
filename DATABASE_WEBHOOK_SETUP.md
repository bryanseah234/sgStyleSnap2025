# Database Webhook Setup for User Sync (Recommended)

**This is the BEST approach** - Edge Function subscribed to auth events via Database Webhooks.

## ✅ Why This Is Better

- ✅ **No SQL Triggers** - Avoids DB-level trigger ownership issues
- ✅ **No Permission Problems** - Edge Function handles everything
- ✅ **Cleaner Architecture** - Separation of concerns
- ✅ **Easier to Debug** - Check Edge Function logs
- ✅ **Supabase Recommended** - Official best practice

## 🚀 Setup Steps

### Step 1: Ensure Edge Function is Deployed

```bash
supabase functions deploy sync-auth-users-realtime --no-verify-jwt
```

### Step 2: Get Your Edge Function URL

1. Go to **Supabase Dashboard** → **Edge Functions** → `sync-auth-users-realtime`
2. Copy the **Function URL**:
   ```
   https://nztqjmknblelnzpeatyx.supabase.co/functions/v1/sync-auth-users-realtime
   ```

### Step 3: Create Database Webhook

**Option A: If you can create webhook on `auth.users` table**

1. Go to **Supabase Dashboard** → **Database** → **Webhooks**
2. Click **"New Webhook"**
3. Configure:
   - **Name**: `Sync Auth Users to Public Users`
   - **Table**: `auth.users` (if available)
   - **Events**: ✅ `INSERT`
   - **HTTP Method**: `POST`
   - **HTTP URL**: Your Edge Function URL from Step 2
   - **HTTP Headers**: 
     ```
     Content-Type: application/json
     ```
   - **Enabled**: ✅ ON

**Option B: If `auth.users` table is not available**

Since `auth.users` is a system table, you might not be able to create webhooks on it directly. In this case, use **Database Webhooks** configured differently:

1. Go to **Supabase Dashboard** → **Database** → **Webhooks**
2. Look for an option to create webhooks on **system tables** or **auth events**
3. OR use **Database Triggers** → **Webhook** option (if available)

### Step 4: Disable SQL Triggers

Since we're using Database Webhooks now, disable the old SQL triggers:

```sql
-- Disable the old trigger
ALTER TABLE auth.users DISABLE TRIGGER sync_auth_user_to_public;

-- Or drop it completely
DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;
```

### Step 5: Test

1. Sign up a new user
2. Check Edge Function logs: **Dashboard** → **Edge Functions** → `sync-auth-users-realtime` → **Logs**
3. Verify user was created in `public.users` table

## 📝 Alternative: Using Supabase's Built-in Auth Webhooks

If Database Webhooks on `auth.users` don't work, Supabase might have a built-in way to subscribe Edge Functions to auth events. Check:

1. **Dashboard** → **Authentication** → **Webhooks** (if available)
2. Look for options like:
   - "Subscribe Edge Function to auth events"
   - "Auth Event Webhooks"
   - "User Created Webhook"

## 🔍 Current Status

Your Edge Function (`sync-auth-users-realtime`) is already set up and ready to receive webhook calls. It just needs to be triggered by:
- Database Webhook on `auth.users` INSERT (if available)
- OR Supabase Auth Webhook for `user.created` event (if available)
- OR Keep SQL trigger approach (fallback)

The Edge Function will handle the sync logic regardless of how it's triggered!

