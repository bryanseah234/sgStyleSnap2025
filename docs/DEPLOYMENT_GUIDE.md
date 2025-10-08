# 🚀 Complete Deployment Guide - StyleSnap

**Last Updated:** October 8, 2025  
**This is your single source of truth for deployment.**

---

## 📋 Quick Start Checklist

Before deploying, make sure you have:

- [ ] Node.js 18+ installed
- [ ] GitHub account with repo access
- [ ] Supabase account and project created
- [ ] Vercel account (or other hosting provider)
- [ ] Cloudinary account for image storage
- [ ] All secrets ready (see section below)

---

## 🔑 Environment Variables - Complete Reference

### Where Everything Goes

```
┌─────────────────────────────────────────────────────────────┐
│ YOUR LOCAL MACHINE (.env.local)                            │
│ - All VITE_* variables for development                     │
│ - Never committed to git                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ GITHUB SECRETS (for CI/CD)                                 │
│ - All VITE_* variables                                     │
│ - Vercel deployment tokens                                 │
│ - NO server secrets here!                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ VERCEL (Production Environment)                            │
│ - All VITE_* variables                                     │
│ - Auto-deployed from GitHub or manual                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SUPABASE EDGE FUNCTIONS (Server Secrets)                   │
│ - VAPID_PRIVATE_KEY                                        │
│ - VAPID_PUBLIC_KEY                                         │
│ - VAPID_SUBJECT                                            │
│ - NEVER exposed to client!                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Local Development (.env.local)

Create `.env.local` in your project root:

```bash
# ==================================================
# SUPABASE (Required)
# ==================================================
# Get from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# ==================================================
# GOOGLE OAUTH (REQUIRED - Only Authentication Method)
# ==================================================
# Get from: https://console.cloud.google.com/
# 1. Create OAuth 2.0 Client ID
# 2. Add redirect URI: https://your-project.supabase.co/auth/v1/callback
# 3. Configure in Supabase Dashboard → Authentication → Providers → Google
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# ==================================================
# CLOUDINARY (Required)
# ==================================================
# Get from: https://cloudinary.com/console
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset

# ==================================================
# PUSH NOTIFICATIONS (Required for push features)
# ==================================================
# Generate with: npm install -g web-push && web-push generate-vapid-keys
VITE_VAPID_PUBLIC_KEY=BKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ==================================================
# OPTIONAL FEATURES
# ==================================================
# Weather API (optional)
VITE_OPENWEATHER_API_KEY=your-api-key-here
```

---

## 2️⃣ GitHub Secrets (Repository Settings → Secrets)

Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

Click **"New repository secret"** and add each of these:

### Required Secrets

```bash
# Vercel Deployment
VERCEL_TOKEN=xxxxx                    # From: https://vercel.com/account/tokens
VERCEL_ORG_ID=team_xxxxx              # From: .vercel/project.json after running 'vercel link'
VERCEL_PROJECT_ID=prj_xxxxx           # From: .vercel/project.json after running 'vercel link'

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# Google OAuth (REQUIRED - only authentication method)
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset

# Push Notifications
VITE_VAPID_PUBLIC_KEY=BKxYjz3Q9YVs...
```

### Optional Secrets

```bash
# Weather API (only if using weather features)
VITE_OPENWEATHER_API_KEY=your-api-key
```

**⚠️ IMPORTANT:** Never add `VAPID_PRIVATE_KEY` to GitHub secrets - it goes in Supabase only!

---

## 3️⃣ Vercel Environment Variables

Go to: `https://vercel.com/YOUR_USERNAME/YOUR_PROJECT/settings/environment-variables`

Add these variables (same as GitHub, but without VERCEL_* tokens):

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset

# Push Notifications
VITE_VAPID_PUBLIC_KEY=BKxYjz3Q9YVs...

# Optional
VITE_OPENWEATHER_API_KEY=your-api-key
```

**Apply to:** Production, Preview, and Development (select all three)

---

## 4️⃣ Supabase Edge Function Secrets

These are **server-side only** and used by your Edge Functions to send push notifications.

### Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (using Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or download from: https://github.com/supabase/cli/releases
```

### Login and Get Project Reference

```bash
# Login
supabase login

# List your projects to get reference ID
supabase projects list

# Note your project reference ID (looks like: abcdefghijk)
```

### Generate VAPID Keys (First Time Only)

```bash
# Install web-push globally
npm install -g web-push

# Generate keys
web-push generate-vapid-keys
```

**Save the output:**
```
=======================================
Public Key:
BKxYjz3Q9YVs... (87 characters)

Private Key:
4T1cZ8Hq... (43 characters)
=======================================
```

### Deploy Edge Function & Set Secrets

```bash
# Navigate to your project
cd /path/to/ClosetApp

# Deploy the push notification function
supabase functions deploy send-push-notification --project-ref YOUR_PROJECT_REF

# Set VAPID secrets (replace with your actual keys)
supabase secrets set VAPID_PRIVATE_KEY="4T1cZ8Hq..." --project-ref YOUR_PROJECT_REF
supabase secrets set VAPID_PUBLIC_KEY="BKxYjz3Q9YVs..." --project-ref YOUR_PROJECT_REF
supabase secrets set VAPID_SUBJECT="mailto:support@yourdomain.com" --project-ref YOUR_PROJECT_REF

# Verify secrets were set
supabase secrets list --project-ref YOUR_PROJECT_REF
```

---

## 📊 Complete Variables Reference Table

| Variable | .env.local | GitHub Secrets | Vercel | Supabase | Example Value |
|----------|------------|----------------|--------|----------|---------------|
| **VITE_SUPABASE_URL** | ✅ | ✅ | ✅ | ❌ | `https://abc.supabase.co` |
| **VITE_SUPABASE_ANON_KEY** | ✅ | ✅ | ✅ | ❌ | `eyJhbGciOi...` |
| **VITE_GOOGLE_CLIENT_ID** | ✅ | ✅ | ✅ | ❌ | `123-abc.apps.googleusercontent.com` |
| **VITE_CLOUDINARY_CLOUD_NAME** | ✅ | ✅ | ✅ | ❌ | `stylesnap-app` |
| **VITE_CLOUDINARY_UPLOAD_PRESET** | ✅ | ✅ | ✅ | ❌ | `unsigned_preset` |
| **VITE_VAPID_PUBLIC_KEY** | ✅ | ✅ | ✅ | ❌ | `BKxYjz3Q9YVs...` |
| **VITE_OPENWEATHER_API_KEY** | ✅ | ✅ | ✅ | ❌ | `a1b2c3d4e5f6` |
| **VERCEL_TOKEN** | ❌ | ✅ | ❌ | ❌ | `xxxxx` |
| **VERCEL_ORG_ID** | ❌ | ✅ | ❌ | ❌ | `team_xxxxx` |
| **VERCEL_PROJECT_ID** | ❌ | ✅ | ❌ | ❌ | `prj_xxxxx` |
| **VAPID_PRIVATE_KEY** | ❌ | ❌ | ❌ | ✅ | `4T1cZ8Hq...` |
| **VAPID_PUBLIC_KEY** | ❌ | ❌ | ❌ | ✅ | `BKxYjz3Q9YVs...` |
| **VAPID_SUBJECT** | ❌ | ❌ | ❌ | ✅ | `mailto:you@example.com` |

**Legend:**
- ✅ = Must be added
- ❌ = Do not add here

---

## 🗄️ Supabase Database Setup

### Apply All Migrations

1. Go to your Supabase SQL Editor: `https://supabase.com/dashboard/project/YOUR_REF/sql`

2. Run migrations in order:

```bash
# Copy and paste contents of each file into SQL Editor, then click "Run"
sql/001_initial_schema.sql
sql/002_rls_policies.sql
sql/003_indexes_functions.sql
sql/004_advanced_features.sql
sql/005_catalog_system.sql
sql/006_color_detection.sql
sql/007_outfit_generation.sql
sql/008_likes_feature.sql
sql/009_notifications_system.sql
sql/010_push_notifications.sql
```

### Enable Required Extensions

Make sure these PostgreSQL extensions are enabled in Supabase:

```sql
-- Run this in SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Verify Database Setup

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should see: users, clothes, friends, suggestions, generated_outfits,
-- shared_outfits, notifications, push_subscriptions, etc.
```

---

## 🌐 Vercel/Frontend Deployment

### Option 1: Automatic Deployment via GitHub

**This is the recommended approach.**

1. **Link Vercel to GitHub:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Vue.js/Vite

2. **Configure Build Settings:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables** (see section 3 above)

4. **Deploy:**
   - Push to `main` branch → auto-deploys to production
   - Push to feature branch → creates preview deployment
   - GitHub Actions workflow handles this automatically

### Option 2: Manual Deployment via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Link your project (first time only)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## ⚙️ GitHub Actions Setup

Your repository has automated workflows in `.github/workflows/`:

### Required Workflows

1. **`deploy.yml`** - Auto-deploys to Vercel on push to main
2. **`e2e.yml`** - Runs end-to-end tests with Playwright
3. **`node.js.yml`** - Runs build and unit tests

### Setting Up GitHub Actions

1. **Enable Actions:**
   - Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
   - Click "I understand my workflows, go ahead and enable them"

2. **Add Secrets** (see section 2 above)

3. **Push to Main:**
   ```bash
   git add .
   git commit -m "Enable GitHub Actions deployment"
   git push origin main
   ```

4. **Monitor Deployment:**
   - Go to Actions tab
   - Watch workflows run
   - Green checkmark = success! 🎉

---

## 🧪 Testing Before Deployment

### Run All Tests Locally

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run linter
npm run lint

# Fix lint errors automatically
npm run lint -- --fix

# Build production bundle
npm run build

# Preview production build
npm run preview

# Run E2E tests (if Playwright configured)
npm run test:e2e
```

### Check Bundle Size

```bash
# Analyze bundle
npm run build

# Look for large dependencies
# Main bundle should be < 500KB gzipped
```

---

## 🐛 Troubleshooting

### "Environment variable not found"

**Problem:** App can't find `VITE_SUPABASE_URL` or similar

**Solution:**
1. Check variable name has `VITE_` prefix
2. Restart dev server: `npm run dev`
3. Verify `.env.local` exists and has no typos
4. On Vercel: Check environment variables are set for Production

### "VAPID keys invalid"

**Problem:** Push notifications not working

**Solution:**
1. Verify public key is exactly 87 characters (Base64 URL-safe)
2. Verify private key is exactly 43 characters
3. Check Supabase Edge Function has secrets: `supabase secrets list --project-ref YOUR_REF`
4. Redeploy Edge Function: `supabase functions deploy send-push-notification --project-ref YOUR_REF`

### "Vercel deployment fails"

**Problem:** GitHub Actions workflow fails on Vercel deployment

**Solution:**
1. Check all GitHub secrets are added (see section 2)
2. Verify `VERCEL_TOKEN` is valid (regenerate if needed)
3. Run `vercel link` locally to get correct `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`
4. Check build logs in Actions tab for specific error

### "Database queries fail"

**Problem:** RLS policies blocking queries

**Solution:**
1. Verify user is authenticated: `const { data: { user } } = await supabase.auth.getUser()`
2. Check RLS policies in Supabase dashboard
3. Enable RLS logs in Supabase: Settings → Database → Enable Statement Logs
4. Review logs to see which policy is blocking

### "Images not uploading"

**Problem:** Cloudinary upload fails

**Solution:**
1. Verify `VITE_CLOUDINARY_CLOUD_NAME` matches your Cloudinary account
2. Check upload preset exists and is set to "Unsigned"
3. In Cloudinary: Settings → Upload → Create unsigned preset
4. Verify preset name matches `VITE_CLOUDINARY_UPLOAD_PRESET`

---

## 📚 Additional Documentation

For more detailed information, see:

- **Push Notifications:** `docs/NOTIFICATIONS_GUIDE.md` - In-app & push notifications
- **Database Guide:** `DATABASE_GUIDE.md` - Complete database setup and schema
- **API Reference:** `API_GUIDE.md`
- **Testing Guide:** `TESTS_GUIDE.md`
- **Documentation Index:** `docs/README.md` - Complete feature guide index

---

## ✅ Deployment Checklist

Use this before going live:

### Pre-Deployment
- [ ] All migrations applied to Supabase
- [ ] Edge Function deployed with VAPID secrets
- [ ] All environment variables set (GitHub, Vercel, local)
- [ ] Tests passing: `npm test`
- [ ] Lint passing: `npm run lint`
- [ ] Build successful: `npm run build`
- [ ] Preview build works: `npm run preview`

### Post-Deployment
- [ ] Production URL loads correctly
- [ ] User can sign up/login
- [ ] Images upload to Cloudinary
- [ ] Push notifications work (test subscription)
- [ ] Database queries work (check browser console)
- [ ] No errors in Vercel logs
- [ ] No errors in Supabase logs

---

## 🆘 Need Help?

1. Check this guide first (you're reading it!)
2. Review error logs:
   - Vercel: `https://vercel.com/YOUR_USERNAME/YOUR_PROJECT/deployments`
   - Supabase: `https://supabase.com/dashboard/project/YOUR_REF/logs`
   - GitHub Actions: Repo → Actions tab
3. Check specific docs in `/docs` folder
4. Review migration files in `/sql` folder

---

**Last Updated:** October 8, 2025  
**Maintained By:** StyleSnap Team
