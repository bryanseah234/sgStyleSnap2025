# OAuth Sign-In Troubleshooting Guide

## Current Issue Summary

You're experiencing two problems:
1. **Locally**: Clicking "Sign in with Google" does nothing
2. **On Vercel**: Being redirected to "Login to Vercel" page

---

## ✅ Fixes Applied

### 1. Enhanced Auth Service with Better Error Handling
- Added validation to check if Supabase is configured
- Added console logging to track OAuth flow
- Added better error messages

### 2. Created Debug Page
- Visit `/debug-auth` to diagnose authentication issues
- Shows environment variables status
- Tests OAuth configuration
- Provides configuration guidance

### 3. Added Logging to Login Process
- Track button clicks
- Monitor auth store calls
- See error details in console

---

## 🔍 How to Debug

### Step 1: Open the Debug Page

Navigate to: **`/debug-auth`** in your browser

The debug page will show you:
- ✅ or ❌ Environment variables status
- ✅ or ❌ Supabase client status
- Current URLs and redirect configuration
- Test buttons to verify OAuth

### Step 2: Check Browser Console

Open Developer Tools (F12) and look for:

**If you see:**
```
❌ Supabase is not configured!
```
**Solution:** Your environment variables are missing or incorrect.

**If you see:**
```
🔐 Starting Google OAuth sign-in...
📍 Redirect URL: https://your-url/closet
```
**Good:** OAuth is initiating correctly.

**If you see:**
```
✅ Redirecting to Google OAuth: https://accounts.google.com/...
```
**Good:** OAuth URL was generated successfully.

**If nothing happens:**
- Supabase client might be null
- Environment variables not loaded
- Button click not being registered

---

## 🛠️ Common Issues & Solutions

### Issue 1: Button Click Does Nothing (Locally)

**Possible Causes:**
1. ❌ Environment variables not loaded
2. ❌ Supabase client is null
3. ❌ Dev server needs restart

**Solutions:**

1. **Check your `.env.local` file exists:**
   ```bash
   ls -la .env.local
   ```

2. **Verify environment variables are set:**
   - Open `/debug-auth` page
   - Check if all variables show ✅

3. **Restart the dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

4. **Check console for errors:**
   - Press F12
   - Go to Console tab
   - Click "Sign in" button
   - Look for error messages

### Issue 2: Redirected to Vercel Login Page

**Root Cause:** OAuth redirect URLs not configured in Google Cloud Console

**Solutions:**

1. **Add Supabase Callback URL to Google Cloud Console:**
   
   Go to: https://console.cloud.google.com/apis/credentials
   
   - Click your OAuth 2.0 Client ID
   - Add to "Authorized redirect URIs":
     ```
     https://nztqjmknblelnzpeatyx.supabase.co/auth/v1/callback
     ```
   - **Save**

2. **Add Your App URLs to Google Cloud Console:**
   
   Add ALL of these to "Authorized redirect URIs":
   ```
   http://localhost:5173
   http://localhost:3000
   http://localhost:3001
   https://cautious-fortnight-gw4xv6wg46hgq7-5173.app.github.dev
   https://cautious-fortnight-gw4xv6wg46hgq7-3000.app.github.dev
   https://cautious-fortnight-gw4xv6wg46hgq7-3001.app.github.dev
   https://your-vercel-app.vercel.app
   ```

3. **Add JavaScript Origins to Google Cloud Console:**
   
   Add to "Authorized JavaScript origins":
   ```
   http://localhost:5173
   http://localhost:3000
   http://localhost:3001
   https://cautious-fortnight-gw4xv6wg46hgq7-5173.app.github.dev
   https://cautious-fortnight-gw4xv6wg46hgq7-3000.app.github.dev
   https://cautious-fortnight-gw4xv6wg46hgq7-3001.app.github.dev
   https://your-vercel-app.vercel.app
   https://nztqjmknblelnzpeatyx.supabase.co
   ```

4. **Configure Supabase Redirect URLs:**
   
   Go to: https://supabase.com/dashboard/project/nztqjmknblelnzpeatyx/auth/url-configuration
   
   Add to "Redirect URLs":
   ```
   http://localhost:5173/**
   http://localhost:3000/**
   http://localhost:3001/**
   https://cautious-fortnight-gw4xv6wg46hgq7-5173.app.github.dev/**
   https://cautious-fortnight-gw4xv6wg46hgq7-3000.app.github.dev/**
   https://cautious-fortnight-gw4xv6wg46hgq7-3001.app.github.dev/**
   https://your-vercel-app.vercel.app/**
   ```

5. **Wait 5-10 minutes** for changes to propagate

6. **Clear browser cache** and try again

### Issue 3: "redirect_uri_mismatch" Error

**Solution:**
The redirect URI in the error message must EXACTLY match what's in Google Cloud Console.

Copy the exact URL from the error and add it to Google Cloud Console.

### Issue 4: Environment Variables Not Working on Vercel

**Possible Causes:**
- Variables not set in Vercel dashboard
- Missing `VITE_` prefix
- Need to redeploy after adding variables

**Solutions:**

1. **Go to Vercel Dashboard:**
   - Your Project → Settings → Environment Variables

2. **Add ALL these variables:**
   ```
   VITE_SUPABASE_URL=https://nztqjmknblelnzpeatyx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_GOOGLE_CLIENT_ID=175364816920-u06gjt8ktd4nl8ak66dq07m7i52dt54q.apps.googleusercontent.com
   VITE_CLOUDINARY_CLOUD_NAME=sgstylesnap
   VITE_CLOUDINARY_UPLOAD_PRESET=sgstylesnap
   ```

3. **Set for all environments:**
   - Production ✓
   - Preview ✓
   - Development ✓

4. **Redeploy:**
   - Trigger new deployment after adding variables
   - Or use: `vercel --prod`

---

## 📝 Testing Checklist

### Local Development

- [ ] `.env.local` file exists
- [ ] All `VITE_*` variables are set
- [ ] Dev server restarted after adding variables
- [ ] `/debug-auth` page shows all ✅
- [ ] Browser console shows OAuth logs
- [ ] Clicking button redirects to Google

### Vercel Deployment

- [ ] All environment variables added to Vercel
- [ ] Redeployed after adding variables
- [ ] Production URL added to Google OAuth
- [ ] Production URL added to Supabase
- [ ] Tested in incognito/private window

### Google Cloud Console

- [ ] Supabase callback URL added
- [ ] All app URLs added (localhost + codespace + vercel)
- [ ] JavaScript origins configured
- [ ] Waited 5-10 minutes for propagation

### Supabase Dashboard

- [ ] Google provider enabled
- [ ] Google Client ID configured
- [ ] Google Client Secret configured
- [ ] Redirect URLs configured with wildcards
- [ ] Site URL set

---

## 🎯 Quick Test Commands

### Test 1: Check Environment Variables
```bash
cd /workspaces/sgStyleSnap2025
cat .env.local | grep VITE_
```

### Test 2: Check if Dev Server is Running
```bash
lsof -ti:5173 && echo "Running on 5173" || lsof -ti:3000 && echo "Running on 3000" || lsof -ti:3001 && echo "Running on 3001"
```

### Test 3: Check Build
```bash
npm run build
# Should build without errors
```

### Test 4: Test Supabase Connection
Open browser console on your app and run:
```javascript
// This should not be null
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
```

---

## 🔗 Quick Links

- **Debug Page:** `/debug-auth`
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **Supabase Dashboard:** https://supabase.com/dashboard/project/nztqjmknblelnzpeatyx
- **Vercel Dashboard:** https://vercel.com/dashboard
- **OAuth Fix Guide:** `/docs/OAUTH_FIX_REDIRECT.md`

---

## 📞 What to Check Right Now

1. **Open your app in browser**
2. **Navigate to `/debug-auth`**
3. **Look at the status indicators:**
   - Are all environment variables ✅?
   - Is Supabase client ✅?
   - Is Auth available ✅?

4. **Click "Test Google OAuth" button**
5. **Watch the console output**
6. **Report back what you see**

---

## 🎓 Expected Flow (When Working)

1. User clicks "Sign in with Google"
2. Console shows: `🔐 Starting Google OAuth sign-in...`
3. Console shows: `✅ Redirecting to Google OAuth: https://accounts.google.com/...`
4. Browser redirects to Google login page
5. User selects Google account
6. Google redirects to: `https://your-supabase-url/auth/v1/callback?code=...`
7. Supabase exchanges code for session
8. User redirected to: `/closet`
9. User is logged in ✅

---

## 🚨 If Nothing Works

1. **Share console output:**
   - Open browser console (F12)
   - Click "Sign in" button
   - Copy ALL console messages
   - Share them

2. **Share debug page screenshot:**
   - Navigate to `/debug-auth`
   - Take screenshot
   - Share it

3. **Check these files:**
   ```bash
   # Does .env.local exist?
   ls -la .env.local
   
   # Are variables set?
   cat .env.local
   
   # Is server running?
   ps aux | grep vite
   ```

---

## 💡 Pro Tips

- **Use incognito/private window** for testing to avoid cache issues
- **Check network tab** in DevTools to see if request is being made
- **Try different ports** (3000, 3001, 5173) - might need different OAuth URLs
- **Codespace URLs change** when you restart - add new URL to Google OAuth each time
- **Wait 5-10 minutes** after changing Google OAuth settings for propagation
