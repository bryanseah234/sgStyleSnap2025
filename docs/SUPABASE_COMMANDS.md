# Supabase Commands for Push Notifications Setup

Complete step-by-step commands to set up push notifications with Supabase.

---

## ✅ Prerequisites Completed

- ✅ Supabase CLI installed (version 2.48.3)
- ✅ Logged into Supabase account
- ✅ Database migration file ready: `sql/010_push_notifications.sql`
- ✅ Edge Function ready: `supabase/functions/send-push-notification/`

---

## 📋 Step-by-Step Commands

### **Step 1: Get Your Supabase Project Reference ID**

You need your project reference ID for all commands. Find it in:

**Method 1: From Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **General**
4. Copy the **Reference ID** (looks like: `abcdefghijk`)

**Method 2: From Command Line**
```bash
# List all your projects
supabase projects list
```

Save this reference ID - you'll need it for every command below.

**For convenience, set it as an environment variable:**
```bash
export SUPABASE_PROJECT_REF="your-project-ref-here"
```

---

### **Step 2: Link Your Local Project (Optional but Recommended)**

This links your local folder to your Supabase project:

```bash
# Link to your project
supabase link --project-ref $SUPABASE_PROJECT_REF

# Or without the environment variable:
supabase link --project-ref your-project-ref
```

This creates a `.supabase/` folder with your project configuration.

---

### **Step 3: Apply Database Migration**

Run the push notifications migration to create the required tables and functions:

```bash
# Method 1: Using psql (if you have connection string)
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  -f sql/010_push_notifications.sql

# Method 2: Using Supabase SQL Editor (Recommended)
# 1. Go to https://supabase.com/dashboard/project/[PROJECT-REF]/sql
# 2. Click "New query"
# 3. Copy contents of sql/010_push_notifications.sql
# 4. Paste and click "Run"

# Method 3: Using Supabase CLI (if linked)
supabase db push
```

**What this creates:**
- ✅ `push_subscriptions` table
- ✅ `notification_preferences` table
- ✅ `notification_delivery_log` table
- ✅ Helper functions (get_user_push_subscriptions, should_send_notification, etc.)
- ✅ RLS policies for all tables

**Verify migration:**
```bash
# Check if tables exist
supabase db dump --project-ref $SUPABASE_PROJECT_REF --data-only -t push_subscriptions
```

---

### **Step 4: Generate VAPID Keys**

Generate your VAPID keys locally (only needed once):

```bash
# Install web-push globally (one-time)
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

**Save the output:**
```
=======================================

Public Key:
BKxYj...87-character-string...

Private Key:
4T1c...43-character-string...

=======================================
```

**⚠️ IMPORTANT:**
- Save both keys in a secure location (password manager)
- Public key: Goes to GitHub Secrets and Vercel
- Private key: ONLY goes to Supabase Edge Function secrets (never GitHub!)

---

### **Step 5: Deploy Edge Function**

Deploy the push notification Edge Function:

```bash
# Make sure you're in the project root
cd /workspaces/ClosetApp

# Deploy the function
supabase functions deploy send-push-notification --project-ref $SUPABASE_PROJECT_REF

# Or without environment variable:
supabase functions deploy send-push-notification --project-ref your-project-ref
```

**Expected output:**
```
Deploying send-push-notification (project ref: your-project-ref)
Bundled send-push-notification with supabase/send-push-notification:latest
Function deployed successfully
```

**Verify deployment:**
```bash
# List all deployed functions
supabase functions list --project-ref $SUPABASE_PROJECT_REF
```

---

### **Step 6: Set Edge Function Secrets (VAPID Keys)**

Set the VAPID keys as secrets for your Edge Function:

```bash
# Set VAPID private key (CRITICAL - never expose!)
supabase secrets set VAPID_PRIVATE_KEY="4T1c...your-private-key-here" \
  --project-ref $SUPABASE_PROJECT_REF

# Set VAPID public key
supabase secrets set VAPID_PUBLIC_KEY="BKxYj...your-public-key-here" \
  --project-ref $SUPABASE_PROJECT_REF

# Set VAPID subject (your contact email)
supabase secrets set VAPID_SUBJECT="mailto:support@yourdomain.com" \
  --project-ref $SUPABASE_PROJECT_REF
```

**Without environment variable:**
```bash
supabase secrets set VAPID_PRIVATE_KEY="your-private-key" --project-ref your-project-ref
supabase secrets set VAPID_PUBLIC_KEY="your-public-key" --project-ref your-project-ref
supabase secrets set VAPID_SUBJECT="mailto:support@yourdomain.com" --project-ref your-project-ref
```

**Verify secrets are set:**
```bash
# List all secrets (values are hidden for security)
supabase secrets list --project-ref $SUPABASE_PROJECT_REF
```

**Expected output:**
```
NAME                 VALUE
VAPID_PRIVATE_KEY    **********
VAPID_PUBLIC_KEY     **********
VAPID_SUBJECT        **********
```

---

### **Step 7: Test Edge Function**

Test that the Edge Function is working:

```bash
# Get your project URL
echo "https://$SUPABASE_PROJECT_REF.supabase.co/functions/v1/send-push-notification"

# Test with curl (you need a valid JWT token)
# First, get a token by logging into your app, then:
curl -X POST \
  "https://your-project-ref.supabase.co/functions/v1/send-push-notification" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "type": "outfit_like",
    "title": "Test Notification",
    "body": "Testing push notifications from Supabase"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "sent_count": 1,
  "failed_count": 0,
  "results": [...]
}
```

---

### **Step 8: Monitor Function Logs**

Check Edge Function logs for debugging:

```bash
# View recent logs
supabase functions logs send-push-notification --project-ref $SUPABASE_PROJECT_REF

# Stream logs in real-time (useful during testing)
supabase functions logs send-push-notification --follow --project-ref $SUPABASE_PROJECT_REF

# Filter logs by level
supabase functions logs send-push-notification --level error --project-ref $SUPABASE_PROJECT_REF
```

---

## 🔄 Common Operations

### Update Edge Function

After making changes to `supabase/functions/send-push-notification/index.ts`:

```bash
# Redeploy the function
supabase functions deploy send-push-notification --project-ref $SUPABASE_PROJECT_REF
```

### Update Secrets

If you need to rotate VAPID keys or change secrets:

```bash
# Update a secret (same command as initial set)
supabase secrets set VAPID_PRIVATE_KEY="new-private-key" --project-ref $SUPABASE_PROJECT_REF

# Unset a secret (remove it)
supabase secrets unset VAPID_PRIVATE_KEY --project-ref $SUPABASE_PROJECT_REF
```

### Delete Edge Function

If you need to remove the function:

```bash
# Delete function
supabase functions delete send-push-notification --project-ref $SUPABASE_PROJECT_REF
```

### Check Database Tables

Verify push notification tables exist:

```bash
# Connect to database
supabase db connect --project-ref $SUPABASE_PROJECT_REF

# Then run SQL queries:
# \dt push_*
# SELECT * FROM push_subscriptions LIMIT 5;
# SELECT * FROM notification_preferences LIMIT 5;
```

---

## 🎯 Quick Setup Script

Here's a complete script you can run (after filling in your values):

```bash
#!/bin/bash

# Configuration
export SUPABASE_PROJECT_REF="your-project-ref-here"
export VAPID_PUBLIC_KEY="your-public-key-here"
export VAPID_PRIVATE_KEY="your-private-key-here"
export VAPID_SUBJECT="mailto:support@yourdomain.com"

echo "🚀 Setting up push notifications..."

# Step 1: Link project
echo "📎 Linking project..."
supabase link --project-ref $SUPABASE_PROJECT_REF

# Step 2: Apply migration (use SQL Editor method instead)
echo "📊 Apply sql/010_push_notifications.sql manually in Supabase SQL Editor"
echo "   URL: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF/sql"
read -p "Press Enter after migration is applied..."

# Step 3: Deploy Edge Function
echo "🚀 Deploying Edge Function..."
supabase functions deploy send-push-notification --project-ref $SUPABASE_PROJECT_REF

# Step 4: Set secrets
echo "🔐 Setting VAPID secrets..."
supabase secrets set VAPID_PRIVATE_KEY="$VAPID_PRIVATE_KEY" --project-ref $SUPABASE_PROJECT_REF
supabase secrets set VAPID_PUBLIC_KEY="$VAPID_PUBLIC_KEY" --project-ref $SUPABASE_PROJECT_REF
supabase secrets set VAPID_SUBJECT="$VAPID_SUBJECT" --project-ref $SUPABASE_PROJECT_REF

# Step 5: Verify
echo "✅ Verifying setup..."
supabase functions list --project-ref $SUPABASE_PROJECT_REF
supabase secrets list --project-ref $SUPABASE_PROJECT_REF

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add VITE_VAPID_PUBLIC_KEY to GitHub Secrets"
echo "2. Add VITE_VAPID_PUBLIC_KEY to Vercel environment variables"
echo "3. Test push notifications in your app"
```

**To use this script:**
```bash
# Save as setup-push.sh
chmod +x setup-push.sh
./setup-push.sh
```

---

## 🐛 Troubleshooting Commands

### Function not found
```bash
# Re-deploy function
supabase functions deploy send-push-notification --project-ref $SUPABASE_PROJECT_REF
```

### Secrets not working
```bash
# Check secrets exist
supabase secrets list --project-ref $SUPABASE_PROJECT_REF

# Re-set secrets
supabase secrets set VAPID_PRIVATE_KEY="your-key" --project-ref $SUPABASE_PROJECT_REF
```

### Function errors
```bash
# Check logs for detailed errors
supabase functions logs send-push-notification --project-ref $SUPABASE_PROJECT_REF
```

### Database tables missing
```bash
# Verify connection
supabase db dump --project-ref $SUPABASE_PROJECT_REF --data-only

# Re-apply migration in SQL Editor
# Copy sql/010_push_notifications.sql to:
# https://supabase.com/dashboard/project/[PROJECT-REF]/sql
```

### Permission errors
```bash
# Make sure you're logged in
supabase login

# Check project access
supabase projects list
```

---

## 📚 Related Documentation

- [DEPLOYMENT_SETUP.md](./DEPLOYMENT_SETUP.md) - GitHub Actions and deployment
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Production deployment guide
- [docs/PUSH_NOTIFICATIONS.md](./docs/PUSH_NOTIFICATIONS.md) - Push notification implementation
- [docs/ENVIRONMENT_VARIABLES.md](./docs/ENVIRONMENT_VARIABLES.md) - Environment variables reference

---

## ✅ Checklist

Before considering setup complete, verify:

- [ ] Supabase CLI installed and logged in
- [ ] Project reference ID obtained
- [ ] VAPID keys generated and saved securely
- [ ] Database migration applied (3 tables created)
- [ ] Edge Function deployed successfully
- [ ] VAPID secrets configured in Supabase
- [ ] Edge Function appears in `supabase functions list`
- [ ] Secrets appear in `supabase secrets list`
- [ ] Function logs accessible
- [ ] Public VAPID key added to GitHub Secrets
- [ ] Public VAPID key added to Vercel environment variables

---

**Status: ✅ Ready to test push notifications!**

Once all steps are complete, push notifications will work in your deployed app.
