# Environment Variables Setup Guide

## 📋 Complete Credentials Checklist

### ✅ Required for Local Development

| Variable | Where to Get It | Instructions |
|----------|----------------|--------------|
| `VITE_SUPABASE_URL` | Supabase Dashboard | Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard | Settings → API → Project API keys → anon public |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard | Dashboard shows "Cloud name" |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary Settings | Settings → Upload → Upload presets → Create unsigned preset |
| `VITE_GOOGLE_CLIENT_ID` | Google Cloud Console | APIs & Services → Credentials → Create OAuth 2.0 Client ID |

### ✅ Required for GitHub Actions Deployment

| Variable | Where to Get It | How to Add |
|----------|----------------|------------|
| `VERCEL_TOKEN` | Vercel Account | Run: `vercel login` then get token from account/tokens |
| `VERCEL_ORG_ID` | After `vercel link` | Check `.vercel/project.json` → "orgId" |
| `VERCEL_PROJECT_ID` | After `vercel link` | Check `.vercel/project.json` → "projectId" |

### ⚠️ Optional (Can Skip for MVP)

| Variable | Purpose | Where to Get It |
|----------|---------|----------------|
| `VITE_OPENWEATHER_API_KEY` | Weather-based outfit suggestions | https://openweathermap.org/api (free tier) |
| `VITE_SENTRY_DSN` | Error tracking | https://sentry.io/ |
| `VITE_DATADOG_CLIENT_TOKEN` | Performance monitoring | https://www.datadoghq.com/ |

---

## 🚀 Step-by-Step Setup

### 1. Supabase Setup

**Go to:** https://supabase.com/dashboard

1. Sign in and select your project (or create new)
2. Go to **Settings** (⚙️ icon) → **API**
3. Copy these values:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
```

**⚠️ Security Note:** 
- Use the **anon** key (safe for frontend)
- NEVER use the **service_role** key in frontend code!

---

### 2. Cloudinary Setup

**Go to:** https://cloudinary.com/console

#### Part 1: Get Cloud Name
1. Sign in to Cloudinary
2. Dashboard shows your **Cloud name** at the top
3. Copy it:

```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

#### Part 2: Create Upload Preset
1. Go to **Settings** (⚙️) → **Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Set:
   - **Preset name:** `stylesnap-closet` (or your choice)
   - **Signing Mode:** **Unsigned** ⚠️ (Important!)
   - **Folder:** `closet-items` (optional, for organization)
   - **Transformation:** 
     - Width: 1200
     - Height: 1200
     - Crop: Limit
     - Quality: Auto
     - Format: Auto
5. Click **Save**
6. Copy the preset name:

```env
VITE_CLOUDINARY_UPLOAD_PRESET=stylesnap-closet
```

#### Part 3: API Credentials (for maintenance scripts)
1. Go to **Settings** → **Access Keys**
2. Copy:

```env
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

**⚠️ Keep Secret:** These are for server-side scripts only!

---

### 3. Google OAuth Setup (SSO Only)

**CRITICAL: This is the ONLY authentication method for StyleSnap**
- No email/password authentication
- No magic links or other auth methods
- Both `/login` and `/register` pages use Google OAuth
- After successful auth, users redirect to `/closet` (home page)

**Go to:** https://console.cloud.google.com/

#### Step 1: Create Project (if needed)
1. Click project dropdown → **New Project**
2. Name: "StyleSnap"
3. Click **Create**

#### Step 2: Enable Google+ API
1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable**

#### Step 3: Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** → **Create**
3. Fill in:
   - **App name:** StyleSnap
   - **User support email:** your email
   - **Developer contact:** your email
   - **Scopes:** Add `email` and `profile` (default)
4. Click **Save and Continue**
5. Scopes: Default (email, profile, openid) is sufficient
6. Test users: Add your email (and any testers)
7. Click **Save and Continue**

#### Step 4: Create OAuth 2.0 Client ID
1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: "StyleSnap Web Client"
5. **Authorized JavaScript origins:**
   - `http://localhost:5173` (Vite dev server)
   - `http://localhost:3000` (alternative dev)
   - `https://your-domain.vercel.app` (production)
6. **Authorized redirect URIs (CRITICAL):**
   - `https://xxxxx.supabase.co/auth/v1/callback` (YOUR Supabase URL)
   - Replace `xxxxx` with your actual Supabase project reference
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**:

```env
# Add to .env (frontend only needs Client ID)
VITE_GOOGLE_CLIENT_ID=123456789012-abc123def456.apps.googleusercontent.com
```

#### Step 5: Configure in Supabase (CRITICAL)
1. Go to Supabase Dashboard
2. **Authentication** → **Providers** → **Google**
3. **Enable** Google provider (toggle ON)
4. **Client ID:** Paste from Google Cloud Console
5. **Client Secret:** Paste from Google Cloud Console
6. **Redirect URL:** Should show `https://xxxxx.supabase.co/auth/v1/callback`
7. Click **Save**

#### Step 6: Test the Flow
1. Start your dev server: `npm run dev`
2. Go to `http://localhost:5173/login`
3. Click "Sign in with Google"
4. Should redirect to Google OAuth consent screen
5. After authorization, should redirect back to `/closet`
6. Check Supabase → **Authentication** → **Users** to see new user

**⚠️ Common Issues:**
- **"redirect_uri_mismatch":** Verify Supabase callback URL is in Google Console authorized URIs
- **"unauthorized_client":** Check Client ID and Secret are correct in Supabase
- **Infinite redirect loop:** Clear browser cache and cookies

---

### 4. Vercel Setup (for Deployment)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```
Follow the authentication flow.

#### Step 3: Link Your Project
```bash
cd /workspaces/ClosetApp
vercel link
```

Answer the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No (first time)
- **What's your project's name?** stylesnap
- **In which directory is your code located?** ./ (press Enter)

This creates `.vercel/project.json`

#### Step 4: Get Vercel Credentials
```bash
cat .vercel/project.json
```

You'll see:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

#### Step 5: Get Vercel Token
1. Go to https://vercel.com/account/tokens
2. Click **Create Token**
3. Name: "GitHub Actions - StyleSnap"
4. Expiration: No expiration
5. Scope: Full Account
6. Click **Create**
7. **Copy the token** (you won't see it again!)

#### Step 6: Add to GitHub Secrets
Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Click **New repository secret** for each:

```
Name: VERCEL_TOKEN
Value: [paste token]

Name: VERCEL_ORG_ID  
Value: team_xxxxxxxxxxxxx

Name: VERCEL_PROJECT_ID
Value: prj_xxxxxxxxxxxxx
```

**⚠️ Important:** These go in **GitHub Secrets**, NOT in `.env`!

---

### 5. OpenWeatherMap (Optional)

**Go to:** https://openweathermap.org/api

1. Click **Sign Up** (or sign in)
2. Go to **API keys** tab
3. Create new key (or use default)
4. Copy:

```env
VITE_OPENWEATHER_API_KEY=abcdef1234567890abcdef1234567890
```

**Free tier includes:**
- 1,000 calls/day
- Current weather data
- Perfect for MVP!

---

## 📝 Creating Your .env File

### Step 1: Copy the Example
```bash
cd /workspaces/ClosetApp
cp .env.example .env
```

### Step 2: Fill in Your Values
Open `.env` and replace all the placeholders:

```env
# Required
VITE_SUPABASE_URL=https://[your-actual-value].supabase.co
VITE_SUPABASE_ANON_KEY=[your-actual-key]
VITE_CLOUDINARY_CLOUD_NAME=[your-cloud-name]
VITE_CLOUDINARY_UPLOAD_PRESET=[your-preset]
CLOUDINARY_API_KEY=[your-api-key]
CLOUDINARY_API_SECRET=[your-api-secret]
VITE_GOOGLE_CLIENT_ID=[your-client-id].apps.googleusercontent.com

# Optional
VITE_OPENWEATHER_API_KEY=[your-key-or-leave-commented]

# App config (can leave as-is)
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
VITE_APP_URL=http://localhost:3000
```

### Step 3: Verify .env is Ignored
```bash
# This should show nothing (file is ignored)
git status .env
```

If it shows up, add to `.gitignore`:
```
.env
```

---

## 🔒 GitHub Secrets Setup

For GitHub Actions (deployment), add ALL environment variables as secrets:

**Go to:** Your GitHub Repo → **Settings** → **Secrets and variables** → **Actions**

Click **New repository secret** for each:

### Required Secrets:
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET
VITE_GOOGLE_CLIENT_ID
```

### Optional Secrets:
```
VITE_OPENWEATHER_API_KEY
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

## ✅ Testing Your Setup

### Test 1: Build Locally
```bash
npm run build
```
✅ Should complete without errors

### Test 2: Run Dev Server
```bash
npm run dev
```
✅ Should start on http://localhost:3000

### Test 3: Check Supabase Connection
Open browser console and try:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
```
✅ Should show your Supabase URL

### Test 4: Push to GitHub
```bash
git add .env.example
git commit -m "Update env example with Vercel credentials"
git push origin main
```
✅ Check GitHub Actions - workflows should run

---

## 🆘 Troubleshooting

### "Missing environment variable" error
- Check `.env` file exists in project root
- Verify all `VITE_*` variables are set
- Restart dev server after changing `.env`

### Vercel deployment fails
- Verify all secrets are added to GitHub
- Check secret names match exactly (case-sensitive)
- Ensure Vercel token has correct permissions

### Google OAuth not working
- Verify redirect URIs match exactly
- Check Client ID is added to both `.env` AND Supabase
- Ensure Google+ API is enabled

### Cloudinary uploads fail
- Verify upload preset is **unsigned**
- Check cloud name is correct (no spaces)
- Ensure CORS is configured in Cloudinary settings

---

## 📋 Quick Checklist

Before deploying, verify:

- [ ] `.env` file created with all values
- [ ] `.env` is in `.gitignore` (NOT committed!)
- [ ] All GitHub secrets added
- [ ] Vercel project linked (`vercel link` completed)
- [ ] Google OAuth configured in both Google Cloud and Supabase
- [ ] Cloudinary upload preset is **unsigned**
- [ ] Local build works (`npm run build`)
- [ ] Local dev server works (`npm run dev`)

---

**Once everything is set up, you're ready to deploy! 🚀**
