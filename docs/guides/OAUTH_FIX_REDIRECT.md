# Fix OAuth Redirect Issue - "Login to Vercel" Error

## Problem
When clicking "Sign in with Google", you're being redirected to a Vercel login page instead of Google OAuth.

## Root Cause
The authorized redirect URIs are not properly configured in:
1. **Google Cloud Console** - Google OAuth 2.0 Client
2. **Supabase Dashboard** - Authentication settings

## Solution

### Step 1: Get Your URLs

**Your Supabase Callback URL:**
```
https://nztqjmknblelnzpeatyx.supabase.co/auth/v1/callback
```

**Your Development URL (Codespace):**
```
https://cautious-fortnight-gw4xv6wg46hgq7-5173.app.github.dev
```

**Your Production URL (if deployed on Vercel):**
```
https://your-app-name.vercel.app
```

---

### Step 2: Configure Google Cloud Console

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select your project (or create one if needed)

2. **Navigate to OAuth 2.0 Client:**
   - Go to **APIs & Services** → **Credentials**
   - Click on your OAuth 2.0 Client ID (or create one)

3. **Add Authorized Redirect URIs:**
   Add ALL of these URLs to "Authorized redirect URIs":
   
   ```
   https://nztqjmknblelnzpeatyx.supabase.co/auth/v1/callback
   http://localhost:5173
   http://localhost:3000
   https://cautious-fortnight-gw4xv6wg46hgq7-5173.app.github.dev
   ```
   
   **If you have a production Vercel URL, also add:**
   ```
   https://your-app-name.vercel.app
   ```

4. **Add Authorized JavaScript Origins:**
   Add ALL of these to "Authorized JavaScript origins":
   
   ```
   http://localhost:5173
   http://localhost:3000
   https://cautious-fortnight-gw4xv6wg46hgq7-5173.app.github.dev
   https://nztqjmknblelnzpeatyx.supabase.co
   ```

5. **Save Changes**

---

### Step 3: Configure Supabase Dashboard

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/nztqjmknblelnzpeatyx

2. **Navigate to Authentication Settings:**
   - Click **Authentication** → **URL Configuration**

3. **Add Site URLs:**
   Add these to "Site URL" or "Redirect URLs":
   
   ```
   http://localhost:5173
   https://cautious-fortnight-gw4xv6wg46hgq7-5173.app.github.dev
   ```
   
   **If you have production URL:**
   ```
   https://your-app-name.vercel.app
   ```

4. **Configure Google Provider:**
   - Go to **Authentication** → **Providers**
   - Enable **Google** provider
   - Add your Google Client ID: `175364816920-u06gjt8ktd4nl8ak66dq07m7i52dt54q.apps.googleusercontent.com`
   - Add your Google Client Secret (from Google Cloud Console)
   - **Enable** the provider

5. **Save Changes**

---

### Step 4: Update Your Environment Variables (Optional)

If running locally or need to test, update `.env.local`:

```bash
# Make sure these match your configuration
VITE_SUPABASE_URL=https://nztqjmknblelnzpeatyx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GOOGLE_CLIENT_ID=175364816920-u06gjt8ktd4nl8ak66dq07m7i52dt54q.apps.googleusercontent.com
```

---

### Step 5: Test the Fix

1. **Clear your browser cache and cookies** for your app
2. **Restart your dev server:**
   ```bash
   npm run dev
   ```
3. **Open your app** in the browser
4. **Click "Sign in with Google"**
5. You should now see the **Google OAuth consent screen**, not Vercel login

---

## Common Issues & Troubleshooting

### Issue 1: Still seeing Vercel login
**Solution:** 
- Wait 5-10 minutes for Google OAuth settings to propagate
- Clear browser cache completely
- Try in incognito/private window

### Issue 2: "redirect_uri_mismatch" error
**Solution:** 
- Double-check the redirect URI in Google Cloud Console matches EXACTLY:
  ```
  https://nztqjmknblelnzpeatyx.supabase.co/auth/v1/callback
  ```
- No trailing slashes
- Use the exact domain

### Issue 3: "Invalid redirect URI" from Supabase
**Solution:**
- Add your app URL to Supabase → Authentication → URL Configuration
- Make sure it's in the "Redirect URLs" list

### Issue 4: Codespace URL keeps changing
**Solution:**
- Each time you restart Codespace, the URL changes
- You'll need to add the new URL to Google Cloud Console
- Alternative: Use `github.dev` URL forwarding or deploy to a stable URL

---

## Why This Happens

1. **Google OAuth requires pre-approved redirect URLs** for security
2. When you click "Sign in with Google", the flow is:
   - App → Supabase → Google → **Callback URL**
3. If the callback URL is not in Google's approved list, Google blocks it
4. Vercel may be intercepting the request, showing their login page

---

## Production Deployment Notes

When deploying to production (Vercel):

1. **Add your production domain** to Google OAuth authorized URIs:
   ```
   https://your-app.vercel.app
   https://your-custom-domain.com
   ```

2. **Update Supabase** redirect URLs with production domain

3. **Set environment variables** in Vercel dashboard:
   - All `VITE_*` variables from `.env.local`

4. **Redeploy** after configuration changes

---

## Quick Reference

**Supabase Project:** nztqjmknblelnzpeatyx
**Supabase URL:** https://nztqjmknblelnzpeatyx.supabase.co
**Google Client ID:** 175364816920-u06gjt8ktd4nl8ak66dq07m7i52dt54q
**Callback URL:** https://nztqjmknblelnzpeatyx.supabase.co/auth/v1/callback

---

## Additional Resources

- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
