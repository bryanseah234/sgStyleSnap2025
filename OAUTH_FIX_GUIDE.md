# 🔧 Google OAuth Fix Guide - StyleSnap

## 🚨 Current Issue
Your development server is running on **port 5174**, but your OAuth configuration is set up for **port 5173**. This causes the "Sign in with Google" button to fail.

## ✅ Quick Fix Steps

### Step 1: Update Google Cloud Console

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth 2.0 Client:**
   - Go to **APIs & Services** → **Credentials**
   - Click on your OAuth 2.0 Client ID

3. **Add Port 5174 to Authorized JavaScript Origins:**
   ```
   http://localhost:5173
   http://localhost:5174  ← ADD THIS
   http://localhost:3000
   https://nztqjmknblelnzpeatyx.supabase.co
   ```

4. **Add Port 5174 to Authorized Redirect URIs:**
   ```
   https://nztqjmknblelnzpeatyx.supabase.co/auth/v1/callback
   http://localhost:5173
   http://localhost:5174  ← ADD THIS
   http://localhost:3000
   ```

5. **Save Changes**

### Step 2: Update Supabase Dashboard

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/nztqjmknblelnzpeatyx

2. **Update URL Configuration:**
   - Go to **Authentication** → **URL Configuration**
   - Update **Site URL** to: `http://localhost:5174`
   - Add to **Redirect URLs**:
     ```
     http://localhost:5173
     http://localhost:5174  ← ADD THIS
     http://localhost:3000
     ```

3. **Verify Google Provider:**
   - Go to **Authentication** → **Providers** → **Google**
   - Ensure it's **enabled**
   - Verify **Client ID**: `175364816920-u06gjt8ktd4nl8ak66dq07m7i52dt54q.apps.googleusercontent.com`
   - Verify **Client Secret** is set (from Google Console)

4. **Save Changes**

### Step 3: Test the Fix

1. **Wait 5 minutes** for Google OAuth settings to propagate
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Open your app**: http://localhost:5174/login
4. **Open browser console** (F12)
5. **Click "Sign in with Google"**
6. **Check console logs** for detailed information

## 🧪 Expected Behavior

✅ **Success:**
1. Click "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. After authorization, redirect back to `/closet`
4. User is logged in

❌ **Still Failing:**
- Check browser console for specific error messages
- Verify all URLs are added correctly
- Wait longer for Google propagation (up to 10 minutes)

## 🔍 Debug Information

**Current Configuration:**
- Server: http://localhost:5174
- Supabase: https://nztqjmknblelnzpeatyx.supabase.co
- Google Client ID: 175364816920-u06gjt8ktd4nl8ak66dq07m7i52dt54q.apps.googleusercontent.com
- Callback URL: https://nztqjmknblelnzpeatyx.supabase.co/auth/v1/callback

**Required URLs in Google Console:**
- Authorized JavaScript Origins: `http://localhost:5174`
- Authorized Redirect URIs: `https://nztqjmknblelnzpeatyx.supabase.co/auth/v1/callback`

**Required URLs in Supabase:**
- Site URL: `http://localhost:5174`
- Redirect URLs: `http://localhost:5174`

## 🚨 Common Issues

### Issue 1: "redirect_uri_mismatch"
**Solution:** Add `http://localhost:5174` to Google Console authorized URIs

### Issue 2: "invalid_client"
**Solution:** Check Client ID and Secret in Supabase Dashboard

### Issue 3: "Access blocked"
**Solution:** Add your email to test users in Google Console OAuth consent screen

### Issue 4: Still seeing Vercel login
**Solution:** 
- Wait 10 minutes for Google propagation
- Clear browser cache completely
- Try incognito/private window

## 📞 Need Help?

If you're still having issues:

1. **Check browser console** for detailed error messages
2. **Verify all URLs** are added correctly in both Google Console and Supabase
3. **Wait for propagation** (Google OAuth changes can take up to 10 minutes)
4. **Try different browser** or incognito mode

The enhanced error handling in the app will now show specific configuration issues in the browser console.
