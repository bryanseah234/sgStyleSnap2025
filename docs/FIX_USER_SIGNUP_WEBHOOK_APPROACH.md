# Fix: "Database error saving new user" - Webhook + Edge Function Approach

## Problem
You're getting "Database error saving new user" because:
1. ❌ You CAN'T create triggers on `auth.users` (requires superuser privileges)
2. ✅ You're using Edge Functions + Webhooks (correct approach!)
3. ❌ But the Edge Function can't insert users due to missing RLS policies

## Solution: Fix RLS Policies (NO TRIGGERS NEEDED)

### Step 1: Run the Migration

1. Go to **Supabase Dashboard → SQL Editor**
2. Open `database/migrations/063_fix_rls_for_edge_function_no_triggers.sql`
3. Copy and paste the entire contents
4. Click **Run**
5. You should see success messages with ✅ emojis

This migration:
- ✅ Creates RLS policy allowing `service_role` to insert users
- ✅ Grants necessary permissions
- ✅ Creates username generation helper function
- ✅ **Does NOT create triggers** (no superuser needed!)

### Step 2: Verify Edge Function is Deployed

```bash
supabase functions deploy sync-auth-users-realtime --no-verify-jwt
```

Or check in Dashboard:
- Go to **Edge Functions** → `sync-auth-users-realtime`
- Status should be **Active**

### Step 3: Verify Webhook is Configured

You need ONE of these configured:

#### Option A: Database Webhook (Recommended)

1. Go to **Supabase Dashboard → Database → Webhooks**
2. Click **"New Webhook"**
3. Configure:
   - **Name**: `Sync Auth Users to Public Users`
   - **Table**: `auth.users` (if available) OR use **Database → Webhooks → Create Webhook**
   - **Events**: ✅ `INSERT`
   - **HTTP Method**: `POST`
   - **HTTP URL**: `https://YOUR-PROJECT-REF.supabase.co/functions/v1/sync-auth-users-realtime`
   - **HTTP Headers**: 
     ```
     Content-Type: application/json
     ```
   - **Enabled**: ✅ ON

#### Option B: Auth Webhook (Alternative)

1. Go to **Supabase Dashboard → Authentication → Webhooks**
2. Click **"Add Webhook"**
3. Configure:
   - **Name**: `Sync Auth Users to Public Users`
   - **Events**: ✅ `user.created`
   - **HTTP URL**: `https://YOUR-PROJECT-REF.supabase.co/functions/v1/sync-auth-users-realtime`
   - **HTTP Method**: `POST`
   - **Enabled**: ✅ ON

### Step 4: Verify Edge Function Uses Service Role Key

The Edge Function should use `SUPABASE_SERVICE_ROLE_KEY` environment variable. Check:

1. Go to **Dashboard → Edge Functions → sync-auth-users-realtime → Settings**
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in **Secrets**
3. If not set, add it:
   - Go to **Dashboard → Settings → API**
   - Copy the **service_role** key (⚠️ Keep it secret!)
   - Go to **Edge Functions → sync-auth-users-realtime → Settings → Secrets**
   - Add: `SUPABASE_SERVICE_ROLE_KEY` = `[your service role key]`

### Step 5: Test

1. Sign up a new user via Google OAuth
2. Check **Edge Function logs**: **Dashboard → Edge Functions → sync-auth-users-realtime → Logs**
   - Look for: `✅ Successfully upserted user`
3. Verify user exists in `public.users`:
   ```sql
   SELECT id, email, username FROM users ORDER BY created_at DESC LIMIT 5;
   ```

## How It Works

```
User Signs Up → auth.users created → Webhook triggers → Edge Function called
→ Edge Function uses service_role key → Inserts into public.users (RLS allows it)
```

## Troubleshooting

### If Edge Function logs show "Failed to upsert user"

Check the error message:
- **"permission denied"** → RLS policy missing (run migration 063)
- **"unique violation"** → Username conflict (Edge Function handles this)
- **"relation does not exist"** → Edge Function can't access `public.users` table

### If webhook isn't triggering

1. Check webhook is enabled: **Dashboard → Database → Webhooks** → Verify ✅ Enabled
2. Check Edge Function logs for incoming requests
3. Verify webhook URL is correct (should match Edge Function URL)
4. Try manually calling Edge Function:
   ```bash
   curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/sync-auth-users-realtime \
     -H "Content-Type: application/json" \
     -d '{"type":"user.created","user":{"id":"test-id","email":"test@example.com"}}'
   ```

### If still getting "Database error saving new user"

This error comes from Supabase Auth when the webhook/Edge Function fails. Check:

1. **Edge Function logs** for specific error
2. **Database logs** for RLS policy violations
3. **Webhook configuration** - ensure it's enabled and URL is correct

## Key Points

- ✅ **No triggers needed** - This approach uses webhooks only
- ✅ **No superuser needed** - All operations use service_role
- ✅ **Edge Function handles sync** - Better error handling and logging
- ✅ **RLS policies allow inserts** - Migration 063 fixes this

## What Migration 063 Does

1. ✅ Creates RLS policy: `Service role can insert users` 
2. ✅ Grants INSERT permission to `service_role` and `postgres`
3. ✅ Creates `generate_unique_username_for_sync()` helper function
4. ✅ Ensures `app_config` table exists (for future use)
5. ❌ **Does NOT create triggers** (avoids privilege issues)

After running this migration, your Edge Function should be able to insert users successfully!

