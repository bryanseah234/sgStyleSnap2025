# 🚀 Auth Webhook Setup - Quick Start Guide

**Goal**: Automatically create users in `public.users` when they sign up via Auth Webhooks instead of SQL triggers.

## ✅ Step 1: Deploy Edge Function

```bash
# Deploy the sync function
supabase functions deploy sync-auth-users-realtime --no-verify-jwt
```

Verify it's deployed:
- Go to **Supabase Dashboard** → **Edge Functions**
- You should see `sync-auth-users-realtime` with status "Active"

## ✅ Step 2: Get Your Function URL

1. In **Supabase Dashboard** → **Edge Functions** → Click `sync-auth-users-realtime`
2. Copy the **Function URL** - it looks like:
   ```
   https://YOUR-PROJECT-REF.supabase.co/functions/v1/sync-auth-users-realtime
   ```
   📝 **Save this URL** - you'll need it in Step 3

## ✅ Step 3: Get Your Service Role Key

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Find **service_role** key (NOT the anon key!)
3. Click the **eye icon** to reveal it
4. Copy it - it looks like:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0cXFqbWt...
   ```
   📝 **Save this key** - you'll need it in Step 4

## ✅ Step 4: Create Auth Webhook

1. Go to **Supabase Dashboard** → **Authentication** → **Webhooks**
   - (If you don't see "Webhooks", try **Settings** → **Webhooks** or **Project Settings** → **Webhooks**)

2. Click **"Add Webhook"** or **"Create Webhook"**

3. Fill in the webhook configuration:

   **Name:**
   ```
   Sync Auth Users to Public Users
   ```

   **HTTP Request:**
   - **URL**: Paste the Function URL from Step 2
   - **HTTP Method**: `POST`
   - **HTTP Headers**: Click "Add Header" and add:
     ```
     Key: Authorization
     Value: Bearer YOUR_SERVICE_ROLE_KEY_HERE
     ```
     (Replace `YOUR_SERVICE_ROLE_KEY_HERE` with the key from Step 3)

   **Events:**
   - ✅ Check **`user.created`** (required - triggers when new user signs up)
   - ✅ Optionally check **`user.updated`** (if you want to sync profile updates)

   **Enabled:**
   - ✅ Toggle to **ON** (enabled)

4. Click **"Save"** or **"Create Webhook"**

## ✅ Step 5: Disable Old SQL Triggers

Since we're using Auth Webhooks now, disable the old SQL triggers:

1. Go to **Supabase Dashboard** → **SQL Editor**

2. Run this SQL:

```sql
-- Disable the old trigger
ALTER TABLE auth.users DISABLE TRIGGER sync_auth_user_to_public;

-- Optional: Drop the trigger completely (recommended)
DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;
```

## ✅ Step 6: Test It!

1. **Sign up a new user:**
   - Go to your app's login page
   - Sign up with a NEW Google account (or test account)

2. **Check Edge Function Logs:**
   - Go to **Dashboard** → **Edge Functions** → `sync-auth-users-realtime` → **Logs**
   - You should see logs like:
     ```
     🔄 ========== SYNC AUTH USERS FUNCTION CALLED ==========
     ✅ Detected Supabase Auth Webhook format
     ✅ Extracted auth user: { id: '...', email: '...' }
     ✅ Successfully upserted user: { id: '...', email: '...', username: '...' }
     ```

3. **Verify User Created:**
   - Go to **Dashboard** → **Table Editor** → `users` table
   - Check if the new user was created in `public.users`

## 🐛 Troubleshooting

### Webhook Not Triggering?

**Check 1: Webhook Status**
- Go to **Authentication** → **Webhooks**
- Make sure webhook shows **Enabled** and **Active**

**Check 2: Function Logs**
- Go to **Edge Functions** → `sync-auth-users-realtime` → **Logs**
- Look for errors or failed requests

**Check 3: Service Role Key**
- Make sure you used the **service_role** key (not anon key!)
- The key should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Check it's correctly set in webhook headers as: `Bearer YOUR_KEY`

### User Not Created in public.users?

**Check 1: Function Response**
- Look at function logs for errors
- Verify `upsertUserFromAuth` succeeded

**Check 2: RLS Policies**
- Make sure service role key has permission to insert into `users` table
- Go to **Table Editor** → `users` → **Policies** to check

**Check 3: Payload Format**
- Check function logs for "Detected Supabase Auth Webhook format"
- If you see "Could not extract user record", the payload format might be different

### Still Not Working?

**Manual Test:**
Test the webhook manually by calling the function:

```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/sync-auth-users-realtime \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "user.created",
    "user": {
      "id": "test-user-id-123",
      "email": "test@example.com",
      "raw_user_meta_data": {
        "name": "Test User",
        "picture": "https://example.com/avatar.jpg"
      },
      "created_at": "2025-01-01T00:00:00Z"
    }
  }'
```

You should see a successful response with the created user.

## ✅ Success Checklist

- [ ] Edge function `sync-auth-users-realtime` is deployed
- [ ] Auth Webhook is created in Supabase Dashboard
- [ ] Webhook URL points to edge function
- [ ] Service Role Key is set in webhook headers
- [ ] `user.created` event is enabled
- [ ] Webhook is enabled/toggled ON
- [ ] SQL triggers are disabled
- [ ] Test user signup creates user in `public.users`
- [ ] Edge function logs show successful sync

## 🎉 Done!

Once configured, every new user signup will automatically:
1. Create user in `auth.users` (Supabase Auth) ✅
2. Trigger Auth Webhook → Edge Function ✅
3. Create user in `public.users` with auto-generated username ✅

No SQL triggers needed! 🚀

---

**Need more details?** See `docs/guides/AUTH_WEBHOOK_SETUP.md` for comprehensive documentation.

