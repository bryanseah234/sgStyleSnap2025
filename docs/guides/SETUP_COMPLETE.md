# 🚀 Complete Setup Guide - StyleSnap

**Step-by-step guide to set up StyleSnap from scratch with all services configured.**

This guide combines environment variables, Supabase setup, Cloudinary setup, database migrations, OAuth configuration, and Edge Functions into one comprehensive walkthrough.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Environment Variables](#step-1-environment-variables)
3. [Step 2: Supabase Backend Setup](#step-2-supabase-backend-setup)
4. [Step 3: Cloudinary Image Storage](#step-3-cloudinary-image-storage)
5. [Step 4: Google OAuth Authentication](#step-4-google-oauth-authentication)
6. [Step 5: Database Migrations](#step-5-database-migrations)
7. [Step 6: Edge Functions](#step-6-edge-functions)
8. [Step 7: Verification](#step-7-verification)
9. [Step 8: Testing](#step-8-testing)

---

## 📋 Prerequisites

Before you begin, ensure you have:

- [ ] **Git** installed (v2.4+)
- [ ] **Node.js** installed (v18+)
- [ ] **npm** installed (v9+)
- [ ] **Modern browser** (Chrome, Firefox, Safari, Edge)
- [ ] **Accounts created** (we'll show you how):
  - [ ] Supabase account (free tier)
  - [ ] Cloudinary account (free tier)
  - [ ] Google Cloud account (for OAuth)

**Estimated Setup Time:** 30-45 minutes

---

## 📝 Step 1: Environment Variables

### 1.1 Create `.env.local` File

```bash
cp env.example .env.local
```

**Windows users:**
```cmd
copy env.example .env.local
```

### 1.2 Important Notes About `.env.local`

- ✅ **DO**: Keep this file local (it's already in `.gitignore`)
- ✅ **DO**: Add your actual credentials here
- ❌ **DON'T**: Commit this file to Git (it contains secrets!)
- ❌ **DON'T**: Share this file with others

**Note:** All variables must start with `VITE_` for Vite to expose them to the frontend.

---

## ☁️ Step 2: Supabase Backend Setup

### 2.1 Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

### 2.2 Create a New Project

1. Click **"New Project"** in Supabase dashboard
2. Fill in the form:
   - **Name**: `StyleSnap` (or your choice)
   - **Database Password**: Generate a strong password (⚠️ **SAVE THIS** - you'll need it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is fine for development
3. Click **"Create new project"**
4. ⏳ **Wait 2-3 minutes** for the project to initialize

### 2.3 Get Your Supabase Credentials

Once your project is ready:

1. Go to **Settings** (⚙️ icon in sidebar) → **API**
2. Copy these values (you'll need them):

   **Project URL:**
   ```
   https://xxxxx.supabase.co
   ```

   **Anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **Service Role Key** (also on this page - **keep this secret!**):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Add to your `.env.local` file:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📸 Step 3: Cloudinary Image Storage

### 3.1 Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click **"Sign Up for Free"**
3. Create account (email or social login)
4. Verify your email

### 3.2 Get Your Cloud Name

1. In Cloudinary dashboard, your **Cloud Name** is displayed at the top
2. Copy this value - you'll need it for `.env.local`

**Example format:**
```
dqxz8abcd
```

### 3.3 Create Upload Preset

1. Go to **Settings** → **Upload** in Cloudinary dashboard
2. Scroll to **"Upload presets"** section
3. Click **"Add upload preset"**
4. Configure:
   - **Preset name**: `stylesnap-unsigned` (or your choice)
   - **Signing Mode**: Select **"Unsigned"** ⚠️ (Important!)
   - **Folder**: `stylesnap` (optional, for organization)
   - **Access mode**: `Public`
5. Click **"Save"**
6. Copy the **Preset name** - you'll need it for `.env.local`

**Why "Unsigned"?**
- Allows client-side uploads without exposing API secrets
- Required for frontend image uploads

### 3.4 Add to Environment Variables

Add to your `.env.local` file:

```env
VITE_CLOUDINARY_CLOUD_NAME=dqxz8abcd
VITE_CLOUDINARY_UPLOAD_PRESET=stylesnap-unsigned
```

---

## 🔐 Step 4: Google OAuth Authentication

### 4.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `StyleSnap` (or your choice)
4. Click **"Create"**

### 4.2 Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - ✅ **Google+ API**
   - ✅ **People API**

### 4.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **"External"** user type → Click **"Create"**
3. Fill in required fields:
   - **App name**: `StyleSnap`
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **"Save and Continue"**
5. Add your email to **Test users** section
6. Click **"Save and Continue"** → **"Back to Dashboard"**

### 4.4 Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Configure:
   - **Application type**: `Web application`
   - **Name**: `StyleSnap Web Client`
   - **Authorized JavaScript origins**: Add:
     ```
     http://localhost:5173
     http://localhost:5174
     ```
   - **Authorized redirect URIs**: Add:
     ```
     https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
     http://localhost:5173
     http://localhost:5174
     ```
     (Replace `YOUR-PROJECT-REF` with your Supabase project reference)
4. Click **"Create"**
5. **Copy these values** (you'll need them):
   - **Client ID**: `123456789-abc.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxxxxxxx` ⚠️ (Keep secret!)

### 4.5 Configure Supabase Google Provider

1. Go back to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google** in the list
3. Toggle **"Enabled"** to ON
4. Paste your **Client ID** and **Client Secret** from Step 4.4
5. Click **"Save"**

**Important:** Disable all other auth providers (Email, Phone, etc.) - StyleSnap only uses Google OAuth.

### 4.6 Configure Supabase URL Settings

1. Go to **Authentication** → **URL Configuration**
2. Add to **Site URL**: `http://localhost:5173` (or your development port)
3. Add to **Redirect URLs**:
   ```
   http://localhost:5173/**
   http://localhost:5174/**
   ```

### 4.7 Add to Environment Variables

Add to your `.env.local` file:

```env
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

**⚠️ DO NOT add Client Secret here - it stays in Supabase Dashboard only!**

---

## 🗄️ Step 5: Database Migrations

### 5.1 Run Database Migrations

For complete instructions, see **[Database Guide](DATABASE_GUIDE.md)**.

**Quick summary:**
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open migration files from `database/migrations/` folder
3. Run them in order: `001_`, `002_`, `003_`, etc.
4. Each migration creates tables, functions, and policies

**Expected result:**
- 20+ database tables created
- 50+ Row-Level Security policies
- Edge Functions configured
- User sync trigger/webhook set up

### 5.2 Verify Database Setup

Run this query in SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see tables like: `users`, `clothes`, `outfits`, `friends`, `notifications`, etc.

---

## 🔧 Step 6: Edge Functions

### 6.1 Deploy User Sync Edge Function

The Edge Function handles automatic user profile creation when users sign up.

```bash
supabase functions deploy sync-auth-users-realtime --no-verify-jwt
```

**Verify deployment:**
- Go to **Supabase Dashboard** → **Edge Functions**
- You should see `sync-auth-users-realtime` with status "Active"

### 6.2 Configure Auth Webhook

1. Go to **Supabase Dashboard** → **Authentication** → **Webhooks**
   - (If you don't see "Webhooks", try **Settings** → **Webhooks**)

2. Click **"Add Webhook"** or **"Create Webhook"**

3. Configure the webhook:

   **Name:**
   ```
   Sync Auth Users to Public Users
   ```

   **HTTP Request:**
   - **URL**: Get from **Edge Functions** → `sync-auth-users-realtime` → Copy Function URL
   - **HTTP Method**: `POST`
   - **HTTP Headers**: Click "Add Header" and add:
     ```
     Key: Authorization
     Value: Bearer YOUR_SERVICE_ROLE_KEY_HERE
     ```
     (Get Service Role Key from **Settings** → **API** → **service_role** key)

   **Events:**
   - ✅ Check **`user.created`** (required)
   - ✅ Optionally check **`user.updated`** (if you want to sync profile updates)

   **Enabled:**
   - ✅ Toggle to **ON** (enabled)

4. Click **"Save"** or **"Create Webhook"**

### 6.3 Disable Old SQL Triggers (If They Exist)

Since we're using Auth Webhooks now, disable the old SQL triggers:

1. Go to **Supabase Dashboard** → **SQL Editor**

2. Run this SQL:

```sql
-- Disable the old trigger
ALTER TABLE auth.users DISABLE TRIGGER sync_auth_user_to_public;

-- Optional: Drop the trigger completely (recommended)
DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;
```

---

## ✅ Step 7: Verification

### 7.1 Verify Environment Variables

Your `.env.local` should look similar to this (with your actual values):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://nztqjmknblelnzpeatyx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56dHFqa21uYmxl...

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=dqxz8abcd
VITE_CLOUDINARY_UPLOAD_PRESET=stylesnap-unsigned

# Google OAuth (Public - Client ID only!)
VITE_GOOGLE_CLIENT_ID=175364816920-u06gjt8ktd4nl8ak66dq07m7i52dt54q.apps.googleusercontent.com
```

### 7.2 Verify Database Tables

Run this query in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected:** 20+ tables including `users`, `clothes`, `outfits`, `friends`, `notifications`, etc.

### 7.3 Verify Edge Function

1. Go to **Edge Functions** → `sync-auth-users-realtime`
2. Check status is **"Active"**
3. Check logs tab (should be empty initially)

### 7.4 Verify Auth Webhook

1. Go to **Authentication** → **Webhooks**
2. Verify webhook is:
   - ✅ Enabled
   - ✅ Shows correct Edge Function URL
   - ✅ Has `user.created` event enabled
   - ✅ Has Authorization header with Service Role Key

---

## 🧪 Step 8: Testing

### 8.1 Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 8.2 Test Authentication

1. Open browser: `http://localhost:5173`
2. Click **"Sign in with Google"**
3. You should be redirected to Google OAuth consent screen
4. Authorize the app
5. You should be redirected back to `/closet` page
6. You should be logged in!

**If this fails:**
- Check OAuth redirect URLs are correct
- Verify Google OAuth credentials in Supabase
- See **[OAuth Troubleshooting](TROUBLESHOOTING.md#issue-oauth-redirect-mismatch--login-to-vercel-error)** section

### 8.3 Test User Creation

1. After signing in, check **Supabase Dashboard** → **Table Editor** → `users` table
2. You should see your new user with:
   - Matching ID from `auth.users`
   - Email from Google
   - Auto-generated username
   - Created timestamp

**If user not created:**
- Check Edge Function logs
- Verify Auth Webhook is configured correctly
- See **[Troubleshooting Guide](TROUBLESHOOTING.md#issue-database-error-saving-new-user)** section

### 8.4 Test Image Upload

1. Go to **Closet** page
2. Click **"Add Item"** or upload button
3. Select an image file
4. Fill in item details
5. Click **"Save"**

**Expected:**
- Image uploads to Cloudinary
- Item appears in your closet
- No errors in console

**If this fails:**
- Check Cloudinary credentials in `.env.local`
- Verify upload preset is set to "Unsigned"
- See **[Cloudinary Setup](CLOUDINARY_SETUP.md)** for details

### 8.5 Test Database Access

1. Create a clothing item
2. Check **Supabase Dashboard** → **Table Editor** → `clothes` table
3. You should see your new item!

**If this fails:**
- Verify database migrations ran successfully
- Check RLS policies are configured
- See **[Database Troubleshooting](TROUBLESHOOTING.md#database-issues)** section

---

## 🔍 Complete Verification Checklist

Before moving on, verify everything is working:

- [ ] Project cloned and dependencies installed (`npm install`)
- [ ] `.env.local` file created with all variables
- [ ] Supabase project created and credentials obtained
- [ ] Cloudinary account created and upload preset configured
- [ ] Google OAuth configured in both Google Console and Supabase
- [ ] Database migrations run successfully (20+ tables created)
- [ ] Edge Function deployed and active
- [ ] Auth Webhook configured correctly
- [ ] Development server starts without errors (`npm run dev`)
- [ ] Can sign in with Google OAuth
- [ ] User created in `public.users` table after signup
- [ ] Can upload images
- [ ] Can create clothing items
- [ ] No errors in browser console
- [ ] No errors in Edge Function logs

**If all checkboxes are checked, congratulations! 🎉 You're ready to use StyleSnap!**

---

## 🐛 Common First-Time Issues

### Issue 1: Port Already in Use

**Error:** `Port 5173 is already in use`

**Solution:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 5174
```

Then update Google OAuth redirect URIs to include the new port.

---

### Issue 2: Environment Variables Not Loading

**Error:** `VITE_SUPABASE_URL is undefined`

**Solutions:**
1. Verify variable names start with `VITE_`
2. Restart dev server after changing `.env.local`
3. Check file is named `.env.local` (not `.env`)

---

### Issue 3: OAuth Redirect Mismatch

**Error:** `redirect_uri_mismatch`

**Solution:**
1. Add all your URLs to Google Cloud Console:
   - `http://localhost:5173`
   - `http://localhost:5174` (if using different port)
   - `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
2. Wait 5-10 minutes for Google to update
3. Clear browser cache

See **[OAuth Troubleshooting](TROUBLESHOOTING.md#issue-oauth-redirect-mismatch--login-to-vercel-error)** for detailed steps.

---

### Issue 4: Database Error Saving New User

**Error:** `Database error saving new user`

**Solution:**
1. Verify Edge Function is deployed: `supabase functions deploy sync-auth-users-realtime`
2. Check Auth Webhook is configured correctly
3. Run database migration `062_fix_user_sync_with_robust_fallback.sql`

See **[Troubleshooting Guide](TROUBLESHOOTING.md#issue-database-error-saving-new-user)** for detailed steps.

---

### Issue 5: Images Not Uploading

**Error:** `Cloudinary upload failed` or `400 Bad Request`

**Solution:**
1. Verify Cloudinary credentials in `.env.local`
2. Ensure upload preset is set to "Unsigned"
3. Check upload preset name matches exactly
4. Verify Cloudinary account is active

See **[Cloudinary Setup](CLOUDINARY_SETUP.md)** for details.

---

## 📚 Next Steps

Now that you have StyleSnap running locally:

1. **Explore the Application**
   - Try creating clothing items
   - Build outfits
   - Add friends
   - Test different features

2. **Read the Documentation**
   - **[Getting Started Guide](GETTING_STARTED.md)** - Quick start overview
   - **[OAuth Guide](OAUTH_GUIDE.md)** - Complete OAuth documentation
   - **[Database Guide](DATABASE_GUIDE.md)** - Database setup and schema
   - **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Fix common issues

3. **Start Developing**
   - Read the codebase
   - Make changes
   - Test your changes
   - Deploy when ready

---

## 🎓 Learning Resources

- **[Vue.js Documentation](https://vuejs.org/)** - Learn Vue.js framework
- **[Supabase Documentation](https://supabase.com/docs)** - Backend-as-a-Service guide
- **[Cloudinary Documentation](https://cloudinary.com/documentation)** - Image management
- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)** - Utility-first CSS

---

## 🆘 Need Help?

If you're stuck:

1. **Check the Troubleshooting Guide**
   - See **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** for common issues

2. **Check Service Logs**
   - Browser console (F12)
   - Supabase Dashboard → Logs
   - Edge Function logs

3. **Verify Configuration**
   - Environment variables are set correctly
   - OAuth redirect URLs match
   - Database migrations ran successfully

4. **Review Documentation**
   - Check relevant guides in `docs/guides/`
   - Read the main README.md

---

## ✅ Success Checklist

Before moving on, verify:

- [ ] Project cloned and dependencies installed
- [ ] `.env.local` file created with all variables
- [ ] Supabase project created and credentials obtained
- [ ] Cloudinary account created and upload preset configured
- [ ] Google OAuth configured in both Google Console and Supabase
- [ ] Database migrations run successfully
- [ ] Edge Function deployed and active
- [ ] Auth Webhook configured correctly
- [ ] Development server starts without errors
- [ ] Can sign in with Google OAuth
- [ ] Can upload images
- [ ] Can create clothing items

**If all checkboxes are checked, congratulations! 🎉 You're ready to use StyleSnap!**

---

**Last Updated:** January 2025  
**Maintained by:** StyleSnap Team

