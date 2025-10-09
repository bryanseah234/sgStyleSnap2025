# OAuth Redirect Loop Fix

## Problem
After successful Google OAuth sign-in:
- User is authenticated in Supabase (visible in Supabase dashboard)
- But user gets redirected back to login page
- Session is not being detected/loaded in the app

## Root Cause

The issue was a **race condition** in the authentication flow:

1. User completes Google OAuth → Supabase creates session
2. OAuth redirects to `/closet` with session token in URL hash
3. Vue Router guard runs **synchronously** 
4. Router checks `authStore.isAuthenticated` **before** Supabase detects the session from URL
5. Since `isAuthenticated` is false, router redirects to `/login`
6. Session is lost in the redirect

## Solution Applied

### 1. Made Router Guard Async (`src/router.js`)

**Before:**
```javascript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login') // ❌ Redirects before session is detected
  }
})
```

**After:**
```javascript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth if not already done - waits for session detection
  if (!authStore.isAuthenticated && !authStore.loading) {
    await authStore.initializeAuth() // ✅ Waits for session
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

### 2. Setup Auth State Listener in App.vue

Added proper auth state change listener to detect OAuth callbacks:

```javascript
onMounted(async () => {
  await authStore.initializeAuth()
  
  // Listen for auth state changes (SIGNED_IN, SIGNED_OUT, etc.)
  authListener = authStore.setupAuthListener()
})
```

This ensures the app:
- Detects when user signs in via OAuth callback
- Updates auth state in real-time
- Redirects properly after authentication

### 3. Enhanced Auth Store Listener

Added handling for `INITIAL_SESSION` event which fires when Supabase detects a session from the URL:

```javascript
setupAuthListener() {
  return authService.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      this.setUser(session.user)
    } else if (event === 'INITIAL_SESSION' && session) {
      // ✅ Handles OAuth callback with session in URL
      this.setUser(session.user)
    }
  })
}
```

### 4. Added Comprehensive Logging

Added console logs throughout the auth flow to help debug:
- Router navigation decisions
- Auth initialization steps
- Session detection
- Auth state changes

## How It Works Now

### Successful OAuth Flow:

1. **User clicks "Sign in with Google"**
   ```
   🔐 Starting Google OAuth sign-in...
   ✅ Redirecting to Google OAuth: https://accounts.google.com/...
   ```

2. **User authorizes on Google → Redirected back**
   ```
   URL: http://localhost:3001/closet#access_token=...&refresh_token=...
   ```

3. **App.vue initializes**
   ```
   🚀 App: Initializing authentication...
   ```

4. **Auth Store checks for session**
   ```
   🔄 AuthStore: Initializing auth...
   📦 AuthStore: Session retrieved: Found
   ✅ AuthStore: Setting user from session: user@example.com
   ```

5. **Auth listener detects initial session**
   ```
   🔔 AuthStore: Auth event received: INITIAL_SESSION user@example.com
   ✅ AuthStore: User signed in: user@example.com
   ```

6. **Router guard allows navigation**
   ```
   🔄 Router: Initializing auth before navigation...
   ✅ AuthStore: Auth initialization complete. Authenticated: true
   ✅ Router: Navigation allowed to /closet
   ```

7. **User stays on /closet - Success! ✅**

## Testing

### What to Look For in Console:

**Successful Sign-In:**
```
🔐 Starting Google OAuth sign-in...
✅ Redirecting to Google OAuth: https://accounts.google.com/...
(redirect happens)
🚀 App: Initializing authentication...
🔄 AuthStore: Initializing auth...
📦 AuthStore: Session retrieved: Found
✅ AuthStore: Setting user from session: user@example.com
🔔 AuthStore: Auth event received: INITIAL_SESSION user@example.com
✅ AuthStore: Auth initialization complete. Authenticated: true
🔄 Router: Initializing auth before navigation...
✅ Router: Navigation allowed to /closet
```

**Failed Sign-In (No Session):**
```
🔐 Starting Google OAuth sign-in...
✅ Redirecting to Google OAuth: https://accounts.google.com/...
(redirect happens)
🚀 App: Initializing authentication...
🔄 AuthStore: Initializing auth...
📦 AuthStore: Session retrieved: Not found
❌ AuthStore: No session found
✅ AuthStore: Auth initialization complete. Authenticated: false
🔒 Router: Route requires auth, redirecting to login
```

## Verification Steps

1. **Clear browser cache and cookies**
2. **Open DevTools Console (F12)**
3. **Navigate to login page**
4. **Click "Sign in with Google"**
5. **Watch console output**
6. **After Google auth, you should see the successful flow above**
7. **You should stay on `/closet` page**

## Common Issues

### Issue: Still redirected to login

**Check console for:**
- Does it say "Session retrieved: Found"?
  - **NO**: Session not being saved. Check OAuth redirect URLs in Google Console
  - **YES**: Continue checking

- Does it say "Setting user from session"?
  - **NO**: Session parsing issue. Check Supabase configuration
  - **YES**: Continue checking

- Does router say "Navigation allowed"?
  - **NO**: Router guard issue. Check if `isAuthenticated` is true
  - **YES**: Should work

### Issue: Session found but lost after redirect

**Possible causes:**
- Using `window.location.href` instead of router navigation
- Multiple redirects clearing session
- Cookies not being saved (third-party cookie blocking)

**Solutions:**
- Check browser cookie settings
- Ensure `persistSession: true` in Supabase config (already set)
- Try incognito/private window to rule out extensions

### Issue: Works locally but not on Vercel

**Checklist:**
- [ ] Environment variables set in Vercel
- [ ] Vercel URL added to Google OAuth redirect URIs
- [ ] Vercel URL added to Supabase redirect URLs
- [ ] Redeployed after adding environment variables
- [ ] Clear Vercel build cache: `vercel --prod --force`

## Related Files

- `src/router.js` - Async router guard with auth initialization
- `src/App.vue` - Auth state listener setup
- `src/stores/auth-store.js` - Auth state management with logging
- `src/services/auth-service.js` - Supabase auth API calls
- `src/config/supabase.js` - Supabase client with `detectSessionInUrl: true`

## Supabase Configuration Required

In `src/config/supabase.js`, ensure these options are set:

```javascript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,      // ✅ Auto-refresh tokens
    persistSession: true,         // ✅ Save session to localStorage
    detectSessionInUrl: true      // ✅ Detect OAuth callback in URL
  }
})
```

All three are **critical** for OAuth to work correctly.

## Next Steps

1. Test the fix locally
2. Check console logs to verify flow
3. If working locally, deploy to Vercel
4. Verify environment variables on Vercel
5. Test on Vercel deployment

## Debugging Commands

```bash
# Check if session exists in browser
# Open browser console and run:
localStorage.getItem('supabase.auth.token')

# Should show a token if session exists
# If null, session is not being saved
```

```javascript
// Check current auth state in console
import { supabase } from './config/supabase'
const { data: { session } } = await supabase.auth.getSession()
console.log(session)
```
