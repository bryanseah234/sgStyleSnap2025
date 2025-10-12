# 🚀 OAuth Quick Start

**TL;DR for getting Google OAuth working in StyleSnap**

📘 **For complete details, see:** [`OAUTH_COMPLETE_GUIDE.md`](OAUTH_COMPLETE_GUIDE.md)

---

## ⚡ 5-Minute Setup

### 1. Google Console Setup (2 min)

```bash
# Open Google Cloud Console
$BROWSER https://console.cloud.google.com/apis/credentials
```

**Create OAuth Client:**
1. Create new project: "StyleSnap"
2. Enable APIs: Google+ API, People API
3. OAuth consent screen → External → Add test users
4. Create Credentials → OAuth 2.0 Client ID
5. Application type: **Web application**
6. Add redirect URI:
   ```
   https://YOUR-PROJECT.supabase.co/auth/v1/callback
   ```
7. Copy **Client ID** and **Client Secret**

### 2. Supabase Setup (1 min)

```bash
# Open Supabase Dashboard
$BROWSER https://supabase.com/dashboard/project/YOUR_PROJECT/auth/providers
```

**Enable Google Provider:**
1. Find "Google" in providers list
2. Toggle to **ON**
3. Paste **Client ID** and **Client Secret**
4. Save

**Important:** Disable all other auth providers (Email, Phone, etc.)

### 3. Frontend Environment (1 min)

Create `.env.local`:

```bash
# Supabase
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth (PUBLIC - Client ID only!)
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com

# DO NOT add Client Secret here - it stays in Supabase Dashboard only!

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset
```

### 4. Test (1 min)

```bash
npm run dev
```

1. Open http://localhost:5173/login
2. Click "Sign in with Google"
3. Should redirect to Google consent screen
4. Click "Allow"
5. Should return to `/closet` page

✅ **If you're logged in → OAuth is working!**

---

## 🔑 Key Concepts

### What Goes Where?

```yaml
Google Console:
  - Client ID: ✅ Public (goes in .env.local)
  - Client Secret: ❌ Private (goes in Supabase Dashboard ONLY)

Supabase Dashboard:
  - Client ID: ✅ Copy from Google Console
  - Client Secret: ✅ Copy from Google Console (backend only)

Frontend (.env.local):
  - VITE_GOOGLE_CLIENT_ID: ✅ Public Client ID
  - Client Secret: ❌ NEVER add this!
```

### OAuth Scopes

StyleSnap uses these scopes:
- `openid` - Core OpenID Connect
- `email` - User's email address
- `profile` - User's name and photo

**Why these?** Minimal scopes = better security + easier approval + user trust

### Redirect URLs

**Critical:** Must match exactly!

```yaml
Google Console Authorized Redirect URIs:
  - http://localhost:5173/auth/callback        # Dev
  - https://YOUR-PROJECT.supabase.co/auth/v1/callback  # Backend ⚠️ REQUIRED
  - https://YOUR-APP.vercel.app/auth/callback  # Production

Supabase Site URL:
  Development: http://localhost:5173
  Production: https://YOUR-APP.vercel.app
```

---

## 🐛 Quick Troubleshooting

### "redirect_uri_mismatch"

**Problem:** Google says redirect URI doesn't match

**Solution:** Add exact Supabase callback URL to Google Console:
```
https://YOUR-PROJECT.supabase.co/auth/v1/callback
```

### "invalid_client"

**Problem:** Google says client not found

**Solution:** 
1. Check Client ID in `.env.local` matches Google Console
2. Check Client Secret in Supabase matches Google Console
3. Wait 5 minutes after changes (Google propagation delay)

### "Access blocked"

**Problem:** Google says app not verified

**Solution:** 
- **Development:** Add your email to test users in OAuth consent screen
- **Production:** Submit app for verification

### User can't sign in

**Problem:** OAuth works but user stuck on login

**Solution:** Check browser console for errors:
- Missing environment variables?
- Supabase URL correct?
- Session storage blocked? (try different browser)

---

## 📖 Learn More

### Complete Guides

- **[OAUTH_COMPLETE_GUIDE.md](OAUTH_COMPLETE_GUIDE.md)** - Comprehensive OAuth documentation
  - How OAuth 2.0 works (detailed flow)
  - Security model (PKCE, state, tokens)
  - Testing strategies (unit, integration, e2e)
  - Troubleshooting guide with solutions

- **[AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)** - Authentication implementation
  - Database schema
  - Session management
  - Auth service API
  - RLS policies

- **[TESTS_GUIDE.md](TESTS_GUIDE.md)** - Testing documentation
  - OAuth testing section
  - Unit test examples
  - Integration test patterns
  - E2E test scenarios

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production deployment
  - Environment variable setup
  - Vercel configuration
  - Production OAuth setup

### Testing OAuth

```bash
# Manual testing checklist
1. ✅ Fresh user sign-up (incognito)
2. ✅ Existing user sign-in
3. ✅ Session persistence (refresh page)
4. ✅ Sign out
5. ✅ Multiple accounts
6. ✅ Error handling (cancel consent)

# Automated tests
npm test tests/unit/auth-service.test.js
npm test tests/integration/oauth-flow.test.js
npx playwright test tests/e2e/oauth.test.js
```

### Security Checklist

```yaml
✅ Client Secret only in Supabase Dashboard (never in frontend)
✅ HTTPS in production (http:// blocked by Google)
✅ Minimal scopes (openid email profile)
✅ State parameter (CSRF protection - automatic)
✅ PKCE enabled (automatic with Supabase)
✅ Tokens in localStorage/IndexedDB (not cookies/URL)
✅ Session auto-refresh enabled
✅ Test users added in Google Console (for development)
```

---

## 🎯 Common Tasks

### Add New Test User

```bash
$BROWSER https://console.cloud.google.com/apis/credentials/consent
```
OAuth consent screen → Test users → Add users → Enter email → Save

### Regenerate Client Secret

1. Google Console → Credentials → Your OAuth Client
2. Click "Reset secret" 
3. Copy new secret
4. Update in Supabase Dashboard
5. Wait 5 minutes for propagation

### Change Redirect URL

1. Google Console → Credentials → Your OAuth Client
2. Add new URL to "Authorized redirect URIs"
3. Save
4. Wait 5 minutes

### Check OAuth Parameters

Open browser console during OAuth flow:
```javascript
// Check URL parameters
const url = new URL(window.location.href)
console.log('client_id:', url.searchParams.get('client_id'))
console.log('redirect_uri:', url.searchParams.get('redirect_uri'))
console.log('scope:', url.searchParams.get('scope'))
console.log('state:', url.searchParams.get('state'))
```

---

## 💡 Pro Tips

1. **Use incognito for testing** - Fresh session every time
2. **Add multiple test emails** - Test different users
3. **Check Supabase logs** - Dashboard → Logs → Auth Logs
4. **Monitor token expiry** - Tokens expire after 1 hour
5. **Test consent screen** - Use `prompt: consent` to always show
6. **Separate dev/prod clients** - Different OAuth clients for each environment

---

**Need more details?** Read [`OAUTH_COMPLETE_GUIDE.md`](OAUTH_COMPLETE_GUIDE.md) for:
- Complete OAuth 2.0 explanation
- Security deep dive
- Comprehensive testing guide
- Advanced troubleshooting
- Best practices

---

**Last Updated:** October 9, 2025
