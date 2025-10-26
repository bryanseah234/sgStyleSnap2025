# 🚨 OAuth Emergency Fix - StyleSnap

## Current Status
Google OAuth is still not working despite configuration attempts. Let's try a different approach.

## 🔍 Step 1: Use the Debug Tool

1. **Open the debug tool:** http://localhost:5174/oauth-debug.html
2. **Click "Test Google OAuth"** button
3. **Copy the exact error message** you see
4. **Share the error message** so we can provide specific fixes

## 🛠️ Step 2: Alternative OAuth Setup

If the current OAuth setup is not working, we can try a fresh setup:

### Option A: Create New Google OAuth Client

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API:**
   - Go to APIs & Services → Library
   - Search for "Google+ API"
   - Click Enable

3. **Configure OAuth Consent Screen:**
   - Go to APIs & Services → OAuth consent screen
   - Choose "External" user type
   - Fill in required fields:
     - App name: StyleSnap
     - User support email: your-email@gmail.com
     - Developer contact: your-email@gmail.com
   - Add your email to test users

4. **Create OAuth 2.0 Client:**
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: Web application
   - Name: StyleSnap Web Client
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     http://localhost:5174
     http://localhost:3000
     ```
   - Authorized redirect URIs:
     ```
     https://nztqjmknblelnzpeatyx.supabase.co/auth/v1/callback
     http://localhost:5173
     http://localhost:5174
     http://localhost:3000
     ```

5. **Update Supabase:**
   - Go to Supabase Dashboard → Authentication → Providers → Google
   - Use the new Client ID and Client Secret
   - Enable the provider

### Option B: Use Mock Login for Development

Since the mock login is working, you can use it for development:

1. **Use Mock Login:** Click "🚀 Mock Login (Dev)" button
2. **Continue development** with the mock user
3. **Fix OAuth later** when you have more time

## 🔧 Step 3: Quick OAuth Test

1. **Open browser console** (F12)
2. **Go to:** http://localhost:5174/login
3. **Click "Sign in with Google"**
4. **Check console for error messages**
5. **Copy any error messages** you see

## 📋 Common Error Messages and Fixes

### "redirect_uri_mismatch"
- **Fix:** Add `http://localhost:5174` to Google Console authorized URIs

### "invalid_client"
- **Fix:** Check Client ID and Secret in Supabase Dashboard

### "Access blocked"
- **Fix:** Add your email to test users in Google Console

### "unauthorized_client"
- **Fix:** Check OAuth consent screen configuration

## 🚀 Step 4: Alternative Development Approach

If OAuth continues to be problematic:

1. **Use Mock Login** for development
2. **Focus on app features** first
3. **Fix OAuth later** when deploying to production
4. **Use a stable domain** for OAuth (not localhost)

## 📞 Need Help?

1. **Use the debug tool** at http://localhost:5174/oauth-debug.html
2. **Copy the exact error message** you see
3. **Share the error message** for specific fixes
4. **Try the mock login** to continue development

The debug tool will show exactly what's wrong and how to fix it!
