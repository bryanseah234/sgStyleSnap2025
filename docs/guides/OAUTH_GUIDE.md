# 🔐 Complete OAuth Guide - StyleSnap

**Comprehensive guide to Google OAuth authentication in StyleSnap.**

This guide covers everything from quick setup to advanced troubleshooting, security best practices, and detailed architecture explanations.

---

## 📋 Table of Contents

1. [Quick Start (5-Minute Setup)](#quick-start-5-minute-setup)
2. [Complete Setup Guide](#complete-setup-guide)
3. [OAuth 2.0 Fundamentals](#oauth-20-fundamentals)
4. [StyleSnap OAuth Architecture](#stylesnap-oauth-architecture)
5. [How OAuth Works (Step-by-Step)](#how-oauth-works-step-by-step)
6. [Security Model](#security-model)
7. [Testing OAuth](#testing-oauth)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)
10. [Auth Webhook Setup](#auth-webhook-setup)

---

## ⚡ Quick Start (5-Minute Setup)

**TL;DR for getting Google OAuth working quickly.**

### Step 1: Google Console Setup (2 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create new project: "StyleSnap"
3. Enable APIs: Google+ API, People API
4. OAuth consent screen → External → Add test users
5. Create Credentials → OAuth 2.0 Client ID
6. Application type: **Web application**
7. Add redirect URI:
   ```
   https://YOUR-PROJECT.supabase.co/auth/v1/callback
   ```
8. Copy **Client ID** and **Client Secret**

### Step 2: Supabase Setup (1 min)

1. Go to Supabase Dashboard → Authentication → Providers
2. Find "Google" in providers list
3. Toggle to **ON**
4. Paste **Client ID** and **Client Secret**
5. Save

**Important:** Disable all other auth providers (Email, Phone, etc.)

### Step 3: Frontend Environment (1 min)

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

### Step 4: Test (1 min)

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

## 🔧 Complete Setup Guide

### Google Cloud Console Configuration

#### 1. Create Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown → "New Project"
3. Project name: `StyleSnap`
4. Click "Create"
5. Wait ~30 seconds, then select your new project

#### 2. Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - ✅ **Google+ API** (deprecated but still needed for OAuth)
   - ✅ **People API** (modern API for user profile data)

#### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **"External"** user type → Click **"Create"**
3. Fill in required fields:
   - **App name**: `StyleSnap`
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **"Save and Continue"**

#### 4. Add OAuth Scopes

**Required Scopes:**
- ✅ `openid` - Authenticate using OpenID Connect
- ✅ `email` - See your email address
- ✅ `profile` - See your personal info

**What data you get:**
```json
{
  "sub": "1234567890",           // Unique Google ID
  "email": "user@gmail.com",     // Email address
  "email_verified": true,         // Email verification status
  "name": "John Doe",             // Full name
  "given_name": "John",           // First name
  "family_name": "Doe",           // Last name
  "picture": "https://...",       // Profile picture URL
  "locale": "en"                  // User locale
}
```

Click **"Save and Continue"**

#### 5. Add Test Users (Development Phase)

**While app is in Testing mode:**

1. Go to **Test users** section
2. Click **"Add Users"**
3. Add your test email addresses:
   - `your-email@gmail.com`
   - `developer@gmail.com`

**Why?** Only these users can sign in while your app is in "Testing" status.

**For Production:**
1. Complete OAuth consent screen info
2. Click **"Publish App"** when ready
3. Google reviews your app (2-4 weeks)
4. Once approved, anyone can sign in

#### 6. Create OAuth 2.0 Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**

**Configuration:**

```yaml
Application type: Web application
Name: StyleSnap Web Client

# Authorized JavaScript origins (where OAuth flow starts)
Authorized JavaScript origins:
  - http://localhost:5173                    # Vite dev server
  - http://localhost:5174                    # Alternative dev port
  - https://YOUR-PROJECT.supabase.co         # Supabase project
  - https://YOUR-APP.vercel.app              # Production URL

# Authorized redirect URIs (where Google sends users back)
Authorized redirect URIs:
  - https://YOUR-PROJECT.supabase.co/auth/v1/callback  # ⚠️ CRITICAL
  - http://localhost:5173/auth/callback      # Dev callback
  - https://YOUR-APP.vercel.app/auth/callback          # Production callback
```

**⚠️ CRITICAL:** The Supabase callback URL is the most important:
```
https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
```

3. Click **"Create"**

#### 7. Copy Credentials

**You'll see a popup with:**

```
Your Client ID:
123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com

Your Client Secret:
GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
```

**🔐 IMPORTANT:**
- **Client ID** → Public, goes in frontend `.env.local`
- **Client Secret** → Private, goes in Supabase Dashboard ONLY

**Save both in a password manager!**

---

### Supabase Configuration

#### 1. Configure Google Provider

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find "Google" in the providers list
3. Toggle **"Enable Sign in with Google"** to **ON**
4. Fill in credentials:

```yaml
Client ID (for OAuth):
  123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com

Client Secret (for OAuth):
  GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx

Authorized Client IDs: [Leave empty unless using Google One Tap]
Skip nonce check: [Leave unchecked]
```

5. Click **"Save"**

**Note the Callback URL shown:**
```
Callback URL (for Google):
https://YOUR-PROJECT.supabase.co/auth/v1/callback
```

**This MUST match the redirect URI in Google Console!**

#### 2. Configure Site URL and Redirect URLs

1. Go to **Authentication** → **URL Configuration**

**Site URL:**
```
Production: https://YOUR-APP.vercel.app
Development: http://localhost:5173
```

**Redirect URLs (one per line):**
```
http://localhost:5173/**
https://YOUR-APP.vercel.app/**
```

**Wildcard explanation:** `**` allows any path after domain for OAuth callbacks.

---

### Frontend Configuration

#### 1. Create `.env.local`

```bash
cd /path/to/sgStyleSnap2025
cp env.example .env.local
```

**Add credentials:**

```bash
# ==================================================
# SUPABASE (Required)
# ==================================================
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# ==================================================
# GOOGLE OAUTH (Required - Public Client ID Only)
# ==================================================
# ✅ Client ID is PUBLIC and safe to expose in frontend
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com

# ❌ DO NOT ADD CLIENT SECRET HERE!
# Client Secret stays in Supabase Dashboard only

# ==================================================
# CLOUDINARY (Required)
# ==================================================
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset
```

**Important Notes:**
- All variables must start with `VITE_` for Vite to expose them
- Google Client Secret goes in Supabase Dashboard, NOT in `.env.local`
- No quotes needed around values
- No spaces around the `=` sign

#### 2. Verify Supabase Configuration

Check `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
})
```

**Key settings:**
- `autoRefreshToken: true` - Automatically refresh expired tokens
- `persistSession: true` - Save session across page reloads
- `detectSessionInUrl: true` - Parse OAuth callback parameters

---

## 🎓 OAuth 2.0 Fundamentals

### What is OAuth 2.0?

OAuth 2.0 is an **authorization framework** that enables applications to obtain limited access to user accounts on an HTTP service (like Google) without exposing user passwords.

### Key Concepts

```
┌─────────────────────────────────────────────────────────────┐
│ OAuth 2.0 Actors                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. RESOURCE OWNER (User)                                    │
│    └─ The person who owns the Google account               │
│                                                             │
│ 2. CLIENT (StyleSnap Frontend)                              │
│    └─ Your application requesting access                   │
│                                                             │
│ 3. AUTHORIZATION SERVER (Google OAuth)                      │
│    └─ Google's server that authenticates users             │
│                                                             │
│ 4. RESOURCE SERVER (Google APIs)                            │
│    └─ Google's servers that host user data                 │
│                                                             │
│ 5. BACKEND (Supabase)                                       │
│    └─ Handles OAuth flow and token exchange                │
└─────────────────────────────────────────────────────────────┘
```

### OAuth Flow Types

StyleSnap uses **Authorization Code Flow with PKCE** (Proof Key for Code Exchange):

```
Authorization Code Flow = Most Secure
├─ Step 1: User clicks "Sign in with Google"
├─ Step 2: Redirect to Google for authorization
├─ Step 3: User grants permissions
├─ Step 4: Google returns authorization code
├─ Step 5: Backend exchanges code for access token
└─ Step 6: User authenticated with session
```

**Why this flow?**
- ✅ Most secure for web applications
- ✅ Tokens never exposed to browser
- ✅ Works with public clients (SPAs)
- ✅ PKCE prevents authorization code interception

---

## 🏗️ StyleSnap OAuth Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─────────────┐         ┌──────────────┐                  │
│  │   Browser   │────────▶│  StyleSnap   │                  │
│  │   (User)    │         │  (Frontend)  │                  │
│  └─────────────┘         └──────────────┘                  │
│        │                        │                            │
│        │ 1. Click Login         │ 2. Start OAuth            │
│        │                        │                            │
│        ▼                        ▼                            │
│  ┌─────────────┐         ┌──────────────┐                  │
│  │   Google    │◀────────│   Supabase   │                  │
│  │   OAuth     │         │   Auth       │                  │
│  └─────────────┘         └──────────────┘                  │
│        │                        │                            │
│        │ 3. Consent             │ 5. Token Exchange          │
│        │                        │                            │
│        ▼                        ▼                            │
│  ┌─────────────┐         ┌──────────────┐                  │
│  │  Authorize  │────────▶│  Create/Get  │                  │
│  │  & Return   │         │  User Session│                  │
│  └─────────────┘         └──────────────┘                  │
│                                 │                            │
│                                 │ 6. Session Token           │
│                                 ▼                            │
│                          ┌──────────────┐                  │
│                          │  Redirect to │                  │
│                          │    /closet   │                  │
│                          └──────────────┘                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### OAuth Components in StyleSnap

```
StyleSnap OAuth Stack:
├─ Frontend (Vue.js)
│  ├─ Login.vue - Login UI with Google button
│  ├─ auth-service.js - OAuth initiation
│  └─ auth-store.js - Session state management
│
├─ Backend (Supabase)
│  ├─ Supabase Auth - OAuth orchestration
│  ├─ Edge Functions - User sync (sync-auth-users-realtime)
│  ├─ Database Triggers - Auto user creation (legacy)
│  └─ RLS Policies - Row-level security
│
└─ External Services
   ├─ Google OAuth 2.0 - Authentication provider
   └─ Google Cloud Console - OAuth configuration
```

---

## 🔄 How OAuth Works (Step-by-Step)

### Complete OAuth Flow Sequence

```
1. User Initiates Login
   User clicks "Sign in with Google" → Frontend calls signInWithGoogle()

2. OAuth Redirect
   Frontend → Supabase → Google (with state & PKCE challenge)

3. Google Authorization
   User sees consent screen → Clicks "Allow"

4. Authorization Code Return
   Google → Supabase callback URL (with code & state)

5. Token Exchange (Backend - Hidden from Browser)
   Supabase → Google API (exchanges code for tokens)

6. Fetch User Profile
   Supabase decodes ID token → Gets user info

7. Create/Update User
   Supabase creates auth.users → Edge Function creates public.users

8. Create Session (JWT)
   Supabase generates JWT → Redirects user back

9. Frontend Session Setup
   Frontend parses session → Stores in localStorage → Updates app state
```

### Detailed Step Breakdown

#### Step 1: User Clicks "Sign in with Google"

**Location:** `src/pages/Login.vue`

```vue
<template>
  <button @click="handleGoogleLogin" class="google-button">
    <GoogleIcon />
    Sign in with Google
  </button>
</template>

<script setup>
import { signInWithGoogle } from '@/services/authService'

async function handleGoogleLogin() {
  try {
    await signInWithGoogle()
    // User is redirected to Google
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>
```

**What happens:**
1. User clicks button
2. `signInWithGoogle()` is called
3. Supabase initiates OAuth flow
4. User is **redirected** to Google (page navigation)

#### Step 2: OAuth Redirect to Google

**Backend:** Supabase Auth generates:

```javascript
// Supabase generates:
const state = generateRandomString()          // CSRF protection
const codeVerifier = generateRandomString()   // PKCE verifier
const codeChallenge = sha256(codeVerifier)    // PKCE challenge

// Redirect URL constructed:
const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${GOOGLE_CLIENT_ID}` +
  `&redirect_uri=${SUPABASE_CALLBACK_URL}` +
  `&response_type=code` +
  `&scope=openid%20email%20profile` +
  `&state=${state}` +
  `&code_challenge=${codeChallenge}` +
  `&code_challenge_method=S256` +
  `&access_type=offline` +
  `&prompt=consent`

// User browser navigates to this URL
window.location.href = googleAuthUrl
```

**URL Parameters Explained:**

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `client_id` | Your Google Client ID | Identifies your app |
| `redirect_uri` | Supabase callback URL | Where to send user back |
| `response_type` | `code` | Request authorization code |
| `scope` | `openid email profile` | Requested permissions |
| `state` | Random string | CSRF protection |
| `code_challenge` | SHA256 hash | PKCE security |
| `code_challenge_method` | `S256` | Hash algorithm |
| `access_type` | `offline` | Request refresh token |
| `prompt` | `consent` | Always show consent screen |

#### Step 3: User Authorizes on Google

User sees Google consent screen and clicks "Allow"

#### Step 4: Authorization Code Return

**Google redirects to:**
```
https://YOUR-PROJECT.supabase.co/auth/v1/callback?
  code=4/0AbcDefGhiJkl...                    # Authorization code
  &state=xyz123...                            # State (CSRF check)
  &scope=email+profile+openid                 # Granted scopes
```

**Supabase receives this request and:**
1. Verifies `state` matches (CSRF protection)
2. Extracts `code`
3. Proceeds to token exchange

#### Step 5: Token Exchange (Backend - Hidden from Browser)

**Supabase makes server-to-server request:**

```http
POST https://oauth2.googleapis.com/token
Content-Type: application/x-www-form-urlencoded

code=4/0AbcDefGhiJkl...
client_id=123456789-abc.apps.googleusercontent.com
client_secret=GOCSPX-xxxxxxxxxxxxxxxx
redirect_uri=https://YOUR-PROJECT.supabase.co/auth/v1/callback
grant_type=authorization_code
code_verifier=abc123...  # PKCE verifier
```

**Google responds with:**
```json
{
  "access_token": "ya29.a0AfH6SMBx...",
  "expires_in": 3599,
  "refresh_token": "1//0gZxYz...",
  "scope": "openid email profile",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Token Types:**
- **access_token**: Short-lived (1 hour) - Used to access Google APIs
- **refresh_token**: Long-lived - Used to get new access tokens
- **id_token**: JWT with user info - Verified by Supabase

#### Step 6: Fetch User Profile

**Supabase decodes `id_token` (JWT):**
```json
{
  "sub": "1234567890",                    // Google User ID
  "email": "john.doe@gmail.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "given_name": "John",
  "family_name": "Doe",
  "locale": "en"
}
```

#### Step 7: Create/Update User in Database

**Supabase creates/updates `auth.users` table** → **Edge Function creates `public.users` entry**

**Modern Approach (Recommended):**
- Edge Function `sync-auth-users-realtime` is triggered via Auth Webhook
- Creates user in `public.users` with auto-generated username
- Handles username conflicts gracefully

**Legacy Approach (Fallback):**
- Database trigger on `auth.users` INSERT
- Creates user in `public.users` synchronously

#### Step 8: Create Session (JWT)

**Supabase generates JWT access token** and redirects user back:

```
https://YOUR-APP.vercel.app/closet#
  access_token=eyJhbGciOiJIUzI1NiIs...
  &expires_in=3600
  &refresh_token=abc123...
  &token_type=bearer
```

**URL Hash Parameters:**
- Tokens are in hash (`#`) not query (`?`)
- Not sent to server (browser-only)
- Parsed by JavaScript

#### Step 9: Frontend Session Setup

**Supabase JS client automatically:**
1. Parses tokens from URL hash
2. Stores session in localStorage
3. Updates auth state
4. Triggers `onAuthStateChange` event

**User sees the Closet page!** 🎉

---

## 🔒 Security Model

### OAuth Security Features

#### 1. State Parameter (CSRF Protection)

**What:** Random string generated before redirect

**Purpose:** Prevent Cross-Site Request Forgery attacks

**How it works:**
- Before redirect: Generate random state, store in sessionStorage
- After callback: Verify returned state matches stored state
- If mismatch: Reject request (CSRF attack detected)

#### 2. PKCE (Proof Key for Code Exchange)

**What:** Additional security layer for public clients (SPAs)

**Purpose:** Prevent authorization code interception

**How it works:**
- Generate random code verifier
- Create SHA256 hash (code challenge)
- Send challenge in authorization request
- Send verifier in token exchange
- Attacker can't exchange code without verifier

#### 3. Client Secret Protection

**Never exposed to browser:**
- ❌ Frontend: Client Secret (NEVER!)
- ✅ Backend (Supabase): Client Secret stored securely

**Why this matters:**
- Client Secret in frontend = Anyone can impersonate your app
- Secret in backend = Only your server can get tokens

#### 4. Scope Limitation

**Principle of least privilege:**
- ✅ GOOD: `scope: 'openid email profile'`
- ❌ BAD: `scope: 'openid email profile drive calendar gmail'`

**Why:**
- Reduces security risk
- Increases user trust
- Easier to pass Google review

#### 5. Token Expiration

**Access tokens expire after 1 hour:**
- Automatic refresh using refresh_token
- `autoRefreshToken: true` in Supabase config

#### 6. Secure Token Storage

**Best practices:**
- ✅ IndexedDB (encrypted by browser)
- ✅ localStorage (less secure but convenient)
- ❌ Cookies without HttpOnly flag (vulnerable to XSS)
- ❌ URL parameters (visible in logs!)

#### 7. HTTPS Enforcement

**Production requirements:**
- ✅ Development: `http://localhost:5173`
- ✅ Production: `https://stylesnap.vercel.app`
- ❌ Production: `http://stylesnap.vercel.app` (Google will reject!)

---

## 🧪 Testing OAuth

### Manual Testing Checklist

#### Test 1: Fresh User Sign-Up Flow
1. Open incognito browser window
2. Navigate to login page
3. Click "Sign in with Google"
4. Select Google account (not previously used)
5. Review consent screen
6. Click "Allow"
7. Verify redirect to `/closet`
8. Check user appears in Supabase Dashboard → Authentication → Users
9. Check user profile in Database → Table Editor → `public.users`

**Expected results:**
- ✅ Smooth redirect to Google
- ✅ Consent screen shows correct scopes
- ✅ Return to app after authorization
- ✅ User lands on `/closet`
- ✅ User record created in `auth.users`
- ✅ Profile created in `public.users`
- ✅ Session persists after page reload

#### Test 2: Existing User Sign-In
1. Sign out if logged in
2. Navigate to login page
3. Click "Sign in with Google"
4. Select same Google account
5. Verify quick redirect (no consent screen)
6. Check returned to `/closet`

**Expected results:**
- ✅ No consent screen (already authorized)
- ✅ Fast redirect back
- ✅ User logged in successfully
- ✅ Existing user data loaded

#### Test 3: Session Persistence
1. Log in via Google OAuth
2. Navigate to `/closet`
3. Refresh page (F5)
4. Close browser tab
5. Reopen app in new tab

**Expected results:**
- ✅ User remains logged in after refresh
- ✅ User remains logged in after closing tab
- ✅ Session restored from localStorage

---

## 🐛 Troubleshooting

### Common OAuth Errors

#### Error: "redirect_uri_mismatch"

**Symptom:**
```
Error 400: redirect_uri_mismatch
The redirect URI in the request does not match the ones authorized.
```

**Solution:**
1. Get exact callback URL from Supabase:
   ```
   Dashboard → Authentication → Providers → Google
   Look for: "Callback URL (for Google)"
   ```
2. Add to Google Console:
   - Go to Credentials → Your OAuth Client
   - Add to "Authorized redirect URIs": `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
   - Save and wait 5 minutes

#### Error: "Access blocked: Authorization Error"

**Symptom:**
```
Access blocked: This app's request is invalid
```

**Solution:**

**For Development:**
1. Go to OAuth consent screen → Test users
2. Add your email: `your-email@gmail.com`

**For Production:**
1. Complete OAuth consent screen info
2. Submit for verification
3. Wait 2-4 weeks for Google review

#### Error: "invalid_client"

**Symptom:**
```
Error 401: invalid_client
The OAuth client was not found.
```

**Solution:**
1. Verify credentials in Supabase Dashboard
2. Re-copy from Google Console
3. Check `.env.local` has correct Client ID

#### Error: OAuth Redirects to Vercel Login Instead of Google

**Symptom:** Clicking "Sign in with Google" redirects to Vercel login page

**Solution:**
1. **Update Google Cloud Console:**
   - Add ALL authorized redirect URIs:
     ```
     https://YOUR-PROJECT.supabase.co/auth/v1/callback
     http://localhost:5173
     http://localhost:5174
     ```
   - Add ALL authorized JavaScript origins:
     ```
     http://localhost:5173
     http://localhost:5174
     https://YOUR-PROJECT.supabase.co
     ```

2. **Update Supabase Dashboard:**
   - Go to Authentication → URL Configuration
   - Add to Site URL: `http://localhost:5173` (or your port)
   - Add to Redirect URLs: `http://localhost:5173`, `http://localhost:5174`

3. **Clear browser cache** and wait 5-10 minutes for propagation

#### Error: "Database error saving new user"

**Symptom:** User can't sign up, error message appears

**Solution:**
1. Verify Edge Function is deployed: `supabase functions deploy sync-auth-users-realtime`
2. Check Auth Webhook is configured correctly
3. Run database migration `062_fix_user_sync_with_robust_fallback.sql`

See **[Troubleshooting Guide](TROUBLESHOOTING.md#issue-database-error-saving-new-user)** for detailed steps.

---

## 🚀 Auth Webhook Setup

**Modern approach:** Use Supabase Auth Webhooks instead of SQL triggers.

### Why Auth Webhooks?

- ✅ **No SQL Triggers** - Avoids DB-level trigger ownership issues
- ✅ **No Permission Problems** - Edge Function handles everything
- ✅ **Cleaner Architecture** - Separation of concerns
- ✅ **Easier to Debug** - Check Edge Function logs
- ✅ **Supabase Recommended** - Official best practice

### Step 1: Deploy Edge Function

```bash
supabase functions deploy sync-auth-users-realtime --no-verify-jwt
```

Verify it's deployed:
- Go to **Supabase Dashboard** → **Edge Functions**
- You should see `sync-auth-users-realtime` with status "Active"

### Step 2: Get Your Function URL

1. In **Supabase Dashboard** → **Edge Functions** → Click `sync-auth-users-realtime`
2. Copy the **Function URL**:
   ```
   https://YOUR-PROJECT-REF.supabase.co/functions/v1/sync-auth-users-realtime
   ```

### Step 3: Get Your Service Role Key

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Find **service_role** key (NOT the anon key!)
3. Click the **eye icon** to reveal it
4. Copy it

### Step 4: Create Auth Webhook

1. Go to **Supabase Dashboard** → **Authentication** → **Webhooks**
   - (If you don't see "Webhooks", try **Settings** → **Webhooks**)

2. Click **"Add Webhook"** or **"Create Webhook"**

3. Fill in the webhook configuration:

   **Name:**
   ```
   Sync Auth Users to Public Users
   ```

   **HTTP Request:**
   - **URL**: Paste the Function URL from Step 2
   - **HTTP Method**: `POST`
   - **HTTP Headers**: Click "Add Header" and add:
     ```
     Key: Authorization
     Value: Bearer YOUR_SERVICE_ROLE_KEY_HERE
     ```
     (Replace `YOUR_SERVICE_ROLE_KEY_HERE` with the key from Step 3)

   **Events:**
   - ✅ Check **`user.created`** (required - triggers when new user signs up)
   - ✅ Optionally check **`user.updated`** (if you want to sync profile updates)

   **Enabled:**
   - ✅ Toggle to **ON** (enabled)

4. Click **"Save"** or **"Create Webhook"**

### Step 5: Disable Old SQL Triggers

Since we're using Auth Webhooks now, disable the old SQL triggers:

1. Go to **Supabase Dashboard** → **SQL Editor**

2. Run this SQL:

```sql
-- Disable the old trigger
ALTER TABLE auth.users DISABLE TRIGGER sync_auth_user_to_public;

-- Optional: Drop the trigger completely (recommended)
DROP TRIGGER IF EXISTS sync_auth_user_to_public ON auth.users;
```

### Step 6: Test It!

1. **Sign up a new user:**
   - Go to your app's login page
   - Sign up with a NEW Google account

2. **Check Edge Function Logs:**
   - Go to **Dashboard** → **Edge Functions** → `sync-auth-users-realtime` → **Logs**
   - You should see logs like:
     ```
     🔄 ========== SYNC AUTH USERS FUNCTION CALLED ==========
     ✅ Detected Supabase Auth Webhook format
     ✅ Extracted auth user: { id: '...', email: '...' }
     ✅ Successfully upserted user: { id: '...', email: '...', username: '...' }
     ```

3. **Verify User Created:**
   - Go to **Dashboard** → **Table Editor** → `users` table
   - Check if the new user was created in `public.users`

### Troubleshooting Webhook Issues

**Webhook Not Triggering?**
- Check webhook status: **Authentication** → **Webhooks** → Verify Enabled
- Check function logs: **Edge Functions** → `sync-auth-users-realtime` → **Logs**
- Verify service role key is correct in webhook headers

**User Not Created in public.users?**
- Check function logs for errors
- Verify RLS policies allow service_role to insert users
- Check payload format in function logs

---

## ✅ Best Practices

### Security Best Practices

1. **Never commit Client Secret**
   - Keep in Supabase Dashboard only
   - Never in `.env.local` or code

2. **Use HTTPS in production**
   - Google requires HTTPS for production
   - Development can use HTTP localhost

3. **Rotate secrets regularly**
   - Regenerate Client Secret every 6-12 months
   - Update in Supabase Dashboard after rotation

4. **Limit OAuth scopes**
   - Only request what you need
   - Easier approval and better security

5. **Validate sessions on server**
   - RLS policies check JWT tokens
   - Server-side validation for sensitive operations

### Development Best Practices

1. **Use test users in development**
   - Add emails to Google Console test users
   - Only these users can sign in during testing

2. **Separate dev and prod OAuth clients**
   - Different Client IDs for each environment
   - Easier to manage and debug

3. **Monitor OAuth failures**
   - Check Edge Function logs regularly
   - Set up alerts for failed webhook calls

4. **Handle edge cases**
   - User closes popup
   - Network errors
   - Expired tokens

### User Experience Best Practices

1. **Clear sign-in button**
   - Visible Google icon
   - Clear "Sign in with Google" text

2. **Loading states**
   - Show spinner during OAuth flow
   - Disable button while processing

3. **Error messages**
   - User-friendly error messages
   - Don't show technical errors to users

4. **Privacy information**
   - Link to Terms and Privacy Policy
   - Explain what data you access

---

## 📚 Additional Resources

### Official Documentation

- **Google OAuth 2.0:** https://developers.google.com/identity/protocols/oauth2
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Supabase Google Auth:** https://supabase.com/docs/guides/auth/social-login/auth-google

### Quick Reference

**Environment Variables:**
```bash
# Frontend (.env.local)
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_GOOGLE_CLIENT_ID=123-abc.apps.googleusercontent.com

# Supabase Dashboard (Backend)
Client ID: 123-abc.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxxxxxx
```

**Important URLs:**
```yaml
Google Console:
  - OAuth Credentials: https://console.cloud.google.com/apis/credentials
  - Consent Screen: https://console.cloud.google.com/apis/credentials/consent

Supabase Dashboard:
  - Auth Providers: /auth/providers
  - URL Configuration: /auth/url-configuration
  - Auth Webhooks: /auth/webhooks

Callback URLs:
  - Supabase: https://YOUR-PROJECT.supabase.co/auth/v1/callback
```

---

**Last Updated:** January 2025  
**Maintained by:** StyleSnap Team

For more help, see:
- **[Getting Started Guide](GETTING_STARTED.md)** - Complete setup from scratch
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Fix common issues
- **[Database Guide](guides/DATABASE_GUIDE.md)** - Database setup and schema

