# 🚀 Getting Started with StyleSnap

**Complete beginner-friendly guide to set up StyleSnap from scratch.**

This guide will walk you through everything you need to get StyleSnap running locally, step by step.

---

## 📋 What You'll Learn

After completing this guide, you will:
- ✅ Have StyleSnap running on your local machine
- ✅ Understand how to configure all required services
- ✅ Know how to set up the database and authentication
- ✅ Be able to test the application locally
- ✅ Understand common first-time issues and how to fix them

---

## 🎯 Prerequisites Checklist

Before you begin, make sure you have:

- [ ] **Git** installed (v2.4+) - [Download Git](https://git-scm.com/)
- [ ] **Node.js** installed (v18+) - [Download Node.js](https://nodejs.org/)
- [ ] **npm** installed (v9+) - Comes with Node.js
- [ ] **Modern browser** (Chrome, Firefox, Safari, Edge)
- [ ] **Internet connection** (for downloading dependencies and accessing cloud services)
- [ ] **Accounts created** (we'll show you how):
  - [ ] Supabase account (free tier)
  - [ ] Cloudinary account (free tier)
  - [ ] Google Cloud account (for OAuth)

**Estimated Setup Time:** 30-45 minutes

---

## 📥 Step 1: Download the Project

### 1.1 Clone the Repository

Open your terminal (or Command Prompt on Windows) and run:

```bash
git clone https://github.com/<org-or-user>/sgStyleSnap2025.git
cd sgStyleSnap2025
```

**What this does:**
- Downloads the entire StyleSnap project to your computer
- Changes directory into the project folder

### 1.2 Install Dependencies

```bash
npm install
```

**What this does:**
- Downloads all required packages (Vue.js, Supabase client, etc.)
- Creates `node_modules/` folder with dependencies
- May take 2-5 minutes depending on your internet speed

**Expected output:**
```
added 543 packages, and audited 544 packages in 2m
```

---

## 📝 Step 2: Create Environment Variables File

### 2.1 Copy the Example File

```bash
cp env.example .env.local
```

**Windows users:**
```cmd
copy env.example .env.local
```

**What this does:**
- Creates a new `.env.local` file based on the example
- This file contains placeholder values we'll fill in later

### 2.2 Important Notes About `.env.local`

- ✅ **DO**: Keep this file local (it's already in `.gitignore`)
- ✅ **DO**: Add your actual credentials here
- ❌ **DON'T**: Commit this file to Git (it contains secrets!)
- ❌ **DON'T**: Share this file with others

---

## ☁️ Step 3: Set Up Supabase (Backend)

### 3.1 Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

### 3.2 Create a New Project

1. Click **"New Project"** in Supabase dashboard
2. Fill in the form:
   - **Name**: `StyleSnap` (or your choice)
   - **Database Password**: Generate a strong password (⚠️ **SAVE THIS** - you'll need it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is fine for development
3. Click **"Create new project"**
4. ⏳ **Wait 2-3 minutes** for the project to initialize

### 3.3 Get Your Supabase Credentials

Once your project is ready:

1. Go to **Settings** (⚙️ icon in sidebar) → **API**
2. Copy these values (you'll need them in Step 5):

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

### 3.4 Set Up Database Migrations

We need to create all the database tables and structures:

1. Go to **SQL Editor** in Supabase dashboard
2. We'll run migrations here - see **[Database Setup Guide](guides/DATABASE_GUIDE.md)** for detailed instructions

**Quick Start (Simplified):**
- Run migrations sequentially from `database/migrations/` folder
- Start with `001_initial_schema.sql`, then `002_*`, `003_*`, etc.
- See **[Database Guide](guides/DATABASE_GUIDE.md)** for complete instructions

---

## 📸 Step 4: Set Up Cloudinary (Image Storage)

### 4.1 Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click **"Sign Up for Free"**
3. Create account (email or social login)
4. Verify your email

### 4.2 Get Your Cloud Name

1. In Cloudinary dashboard, your **Cloud Name** is displayed at the top
2. Copy this value - you'll need it for `.env.local`

**Example format:**
```
dqxz8abcd
```

### 4.3 Create Upload Preset

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

---

## 🔐 Step 5: Set Up Google OAuth (Authentication)

### 5.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `StyleSnap` (or your choice)
4. Click **"Create"**

### 5.2 Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - ✅ **Google+ API**
   - ✅ **People API**

### 5.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **"External"** user type → Click **"Create"**
3. Fill in required fields:
   - **App name**: `StyleSnap`
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **"Save and Continue"**
5. Add your email to **Test users** section
6. Click **"Save and Continue"** → **"Back to Dashboard"**

### 5.4 Create OAuth Credentials

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

### 5.5 Configure Supabase Google Provider

1. Go back to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google** in the list
3. Toggle **"Enabled"** to ON
4. Paste your **Client ID** and **Client Secret** from Step 5.4
5. Click **"Save"**

**Important:** Disable all other auth providers (Email, Phone, etc.) - StyleSnap only uses Google OAuth.

---

## 🔧 Step 6: Configure Environment Variables

### 6.1 Open `.env.local` File

Open `.env.local` in your code editor (VS Code, Sublime Text, etc.)

### 6.2 Fill in Your Values

Replace the placeholder values with your actual credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=stylesnap-unsigned

# Google OAuth (Public - Client ID only!)
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com

# ⚠️ DO NOT add Client Secret here - it stays in Supabase Dashboard only!
```

**Important Notes:**
- All variables must start with `VITE_` for Vite to expose them
- Google Client Secret goes in Supabase Dashboard, NOT in `.env.local`
- No quotes needed around values
- No spaces around the `=` sign

### 6.3 Verify Your File

Your `.env.local` should look similar to this (with your actual values):

```env
VITE_SUPABASE_URL=https://nztqjmknblelnzpeatyx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56dHFqa21uYmxl...
VITE_CLOUDINARY_CLOUD_NAME=dqxz8abcd
VITE_CLOUDINARY_UPLOAD_PRESET=stylesnap-unsigned
VITE_GOOGLE_CLIENT_ID=175364816920-u06gjt8ktd4nl8ak66dq07m7i52dt54q.apps.googleusercontent.com
```

---

## 🗄️ Step 7: Set Up Database (Detailed)

### 7.1 Run Database Migrations

For complete instructions, see **[Database Setup Guide](guides/DATABASE_GUIDE.md)**.

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

### 7.2 Verify Database Setup

Run this query in SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see tables like: `users`, `clothes`, `outfits`, `friends`, `notifications`, etc.

---

## 🚀 Step 8: Start the Development Server

### 8.1 Start the Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 8.2 Open in Browser

1. Open your browser
2. Go to: `http://localhost:5173`
3. You should see the StyleSnap landing page!

**If you see errors:**
- Check browser console (F12) for error messages
- Verify all environment variables are set correctly
- See **[Troubleshooting Guide](TROUBLESHOOTING.md)** for common issues

---

## ✅ Step 9: Verify Everything Works

### 9.1 Test Authentication

1. Click **"Sign in with Google"**
2. You should be redirected to Google OAuth consent screen
3. Authorize the app
4. You should be redirected back to `/closet` page
5. You should be logged in!

**If this fails:**
- Check OAuth redirect URLs are correct
- Verify Google OAuth credentials in Supabase
- See **[OAuth Troubleshooting](TROUBLESHOOTING.md#issue-oauth-redirect-mismatch--login-to-vercel-error)** section

### 9.2 Test Image Upload

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
- See **[Cloudinary Setup](guides/CLOUDINARY_SETUP.md)** for details

### 9.3 Test Database Access

1. Create a clothing item
2. Check **Supabase Dashboard** → **Table Editor** → `clothes` table
3. You should see your new item!

**If this fails:**
- Verify database migrations ran successfully
- Check RLS policies are configured
- See **[Database Troubleshooting](TROUBLESHOOTING.md#database-issues)** section

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

See **[User Signup Troubleshooting](TROUBLESHOOTING.md#issue-database-error-saving-new-user)** for detailed steps.

---

## 📚 Next Steps

Now that you have StyleSnap running locally:

1. **Explore the Application**
   - Try creating clothing items
   - Build outfits
   - Add friends
   - Test different features

2. **Read the Documentation**
   - **[Complete Setup Guide](guides/SETUP_COMPLETE.md)** - Detailed setup instructions
   - **[OAuth Guide](guides/OAUTH_GUIDE.md)** - Complete OAuth documentation
   - **[Database Guide](guides/DATABASE_GUIDE.md)** - Database setup and schema
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
- [ ] Development server starts without errors
- [ ] Can sign in with Google OAuth
- [ ] Can upload images
- [ ] Can create clothing items

**If all checkboxes are checked, congratulations! 🎉 You're ready to use StyleSnap!**

---

## 🚀 What's Next?

- Start building features
- Customize the application
- Deploy to production (see **[Deployment Guide](deployment/DEPLOYMENT_GUIDE.md)**)
- Contribute to the project

**Happy coding! 💻**

---

**Last Updated:** January 2025  
**Maintained by:** StyleSnap Team

