# 🔧 Troubleshooting Guide - StyleSnap

**Complete guide to diagnosing and fixing common issues in StyleSnap.**

This guide covers authentication, database, frontend, backend, and deployment issues with step-by-step solutions and preventive measures.

---

## 📋 Table of Contents

1. [Authentication & OAuth Issues](#authentication--oauth-issues)
2. [Database Issues](#database-issues)
3. [Frontend Issues](#frontend-issues)
4. [Backend Issues](#backend-issues)
5. [Deployment Issues](#deployment-issues)
6. [Build & Development Issues](#build--development-issues)
7. [Preventive Best Practices](#preventive-best-practices)

---

## 🔐 Authentication & OAuth Issues

### Issue: "Database error saving new user"

**Symptoms:**
- New users cannot sign up with Google OAuth
- Error message: `"server_error: Database error saving new user"`
- User appears in `auth.users` but not in `public.users`

**Root Causes:**
1. Database trigger function not configured properly
2. Edge Function call failing and fallback also fails
3. Missing RLS policies that allow inserts
4. Username conflicts causing insert failures

**Solution:**

#### Step 1: Run Diagnostic (Optional but Recommended)

1. Go to **Supabase Dashboard → SQL Editor**
2. Run this diagnostic query:

```sql
-- Check if trigger exists
SELECT tgname FROM pg_trigger 
WHERE tgname = 'sync_auth_user_to_public';

-- Check if function exists
SELECT proname FROM pg_proc 
WHERE proname = 'sync_auth_user_to_public';

-- Check RLS policies
SELECT policyname FROM pg_policies
WHERE tablename = 'users' 
  AND policyname = 'Service role can insert users';
```

#### Step 2: Apply the Fix Migration

1. In **Supabase Dashboard → SQL Editor**
2. Run migration `062_fix_user_sync_with_robust_fallback.sql`
3. Or manually run:

```sql
-- Ensure RLS policy exists
CREATE POLICY IF NOT EXISTS "Service role can insert users" ON users
    FOR INSERT 
    TO service_role, postgres
    WITH CHECK (true);

-- Grant permissions
GRANT INSERT ON public.users TO service_role;
GRANT INSERT ON public.users TO postgres;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO service_role;
GRANT EXECUTE ON FUNCTION sync_auth_user_to_public() TO postgres;
```

#### Step 3: Verify Edge Function and Webhook Setup

If using Edge Function approach (recommended):

1. **Verify Edge Function is deployed:**
   ```bash
   supabase functions deploy sync-auth-users-realtime --no-verify-jwt
   ```

2. **Check Edge Function URL:**
   - Go to **Dashboard → Edge Functions → sync-auth-users-realtime**
   - Copy the Function URL

3. **Verify Auth Webhook is configured:**
   - Go to **Authentication → Webhooks**
   - Ensure webhook is enabled and points to Edge Function URL
   - Check that `user.created` event is enabled

**Prevention:**
- Always run migrations in order
- Test user signup after deploying Edge Functions
- Monitor Edge Function logs regularly

---

### Issue: OAuth Redirect Mismatch / "Login to Vercel" Error

**Symptoms:**
- Clicking "Sign in with Google" redirects to Vercel login instead of Google
- Error: `redirect_uri_mismatch`
- OAuth flow doesn't complete

**Root Causes:**
- Redirect URIs not configured in Google Cloud Console
- Site URLs not configured in Supabase Dashboard
- Port mismatch (e.g., running on 5174 but configured for 5173)

**Solution:**

#### Step 1: Update Google Cloud Console

1. Go to **Google Cloud Console → APIs & Services → Credentials**
2. Click on your OAuth 2.0 Client ID
3. Add **ALL** authorized redirect URIs:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   http://localhost:5173
   http://localhost:5174
   http://localhost:3000
   ```
   (Replace with your actual Supabase project reference)

4. Add **ALL** authorized JavaScript origins:
   ```
   http://localhost:5173
   http://localhost:5174
   http://localhost:3000
   https://YOUR-PROJECT-REF.supabase.co
   ```

5. **Save Changes** and wait 5-10 minutes for propagation

#### Step 2: Update Supabase Dashboard

1. Go to **Authentication → URL Configuration**
2. Add to **Site URL**: `http://localhost:5173` (or your development port)
3. Add to **Redirect URLs**:
   ```
   http://localhost:5173
   http://localhost:5174
   http://localhost:3000
   ```

4. Verify **Google Provider** is enabled:
   - Go to **Authentication → Providers → Google**
   - Ensure Client ID and Secret are correct
   - Toggle provider **ON**

#### Step 3: Clear Browser Cache

1. Clear browser cache and cookies
2. Try in incognito/private window
3. Restart dev server

**Prevention:**
- Document all development URLs
- Use consistent port numbers
- Add production URLs to Google Console before deployment

---

### Issue: Edge Function Not Triggering for User Sync

**Symptoms:**
- Users created in `auth.users` but not in `public.users`
- Edge Function logs show no activity
- Webhook not receiving events

**Solution:**

#### Step 1: Verify Edge Function Deployment

```bash
supabase functions deploy sync-auth-users-realtime --no-verify-jwt
```

Check deployment status in **Dashboard → Edge Functions**

#### Step 2: Verify Auth Webhook Configuration

1. **Check Webhook exists:**
   - Go to **Authentication → Webhooks**
   - Verify webhook "Sync Auth Users to Public Users" exists

2. **Verify webhook settings:**
   - **URL**: Must match Edge Function URL exactly
   - **HTTP Method**: `POST`
   - **Headers**: Include `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`
   - **Events**: `user.created` must be checked
   - **Enabled**: Must be toggled ON

#### Step 3: Test Webhook Manually

```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/sync-auth-users-realtime \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "user.created",
    "user": {
      "id": "test-user-id-123",
      "email": "test@example.com",
      "raw_user_meta_data": {
        "name": "Test User",
        "picture": "https://example.com/avatar.jpg"
      },
      "created_at": "2025-01-01T00:00:00Z"
    }
  }'
```

Check Edge Function logs for successful response.

**Prevention:**
- Test webhook after every deployment
- Monitor Edge Function logs regularly
- Set up alerts for failed webhook calls

---

## 🗄️ Database Issues

### Issue: Duplicate Migration Numbers

**Symptoms:**
- Migrations fail to run
- Migration conflicts when tracking
- Database state inconsistent

**Root Causes:**
- Multiple migration files with same number
- Migrations not run in sequential order

**Solution:**

#### Step 1: Identify Duplicate Migrations

Check your `database/migrations/` folder for files with duplicate numbers:

Common duplicates found:
- `009_clothing_types.sql`, `009_enhanced_categories.sql`, `009_notifications_system.sql`
- `028_fix_notifications_insert_policy.sql`, `028_fix_user_creation_rls.sql`
- `035_fix_approve_friend_suggestion.sql`, `035_implement_soft_caps.sql`
- `041_cleanup_old_user_sync_triggers.sql`, `041_fix_friends_rls_insert_policy.sql`
- `050_add_slippers_category.sql`, `050_email_notifications.sql`
- `051_add_ai_description.sql`, `051_add_slippers_clothing_type.sql`, `051_fix_email_notification_message_field.sql`

#### Step 2: Renumber Migrations

1. Create a script to check which migrations have been applied
2. Renumber duplicate migrations sequentially
3. Update any references to old migration numbers

**Prevention:**
- Always check existing migration numbers before creating new ones
- Use GitHub issues or PR reviews to catch duplicates
- Maintain a migration log file

---

### Issue: Missing Transaction Wrapper

**Symptoms:**
- Migrations fail partially
- Database state inconsistent
- Rollback issues

**Solution:**

Add transaction wrappers to migrations missing them:

```sql
BEGIN;

-- Your migration SQL here

COMMIT;
```

**Prevention:**
- Always wrap migrations in transactions
- Use migration templates
- Review migrations before applying

---

### Issue: Function Not Found Errors

**Symptoms:**
- Error: `Could not find the function public.is_catalog_item_owned(...)`
- 404 errors when using catalog features
- Database functions not available

**Solution:**

#### Step 1: Check Function Exists

```sql
SELECT proname FROM pg_proc 
WHERE proname = 'is_catalog_item_owned';
```

#### Step 2: Run Missing Migration

If function doesn't exist, run migration `047_ensure_catalog_ownership_function.sql`:

1. **Via Supabase Dashboard:**
   - Go to **SQL Editor**
   - Copy contents of `database/migrations/047_ensure_catalog_ownership_function.sql`
   - Paste and run

2. **Via Terminal:**
   ```bash
   psql $DATABASE_URL -f database/migrations/047_ensure_catalog_ownership_function.sql
   ```

#### Step 3: Verify Function Created

```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'is_catalog_item_owned';
```

**Prevention:**
- Test all database functions after migrations
- Document required functions in deployment checklist
- Set up function existence checks in CI/CD

---

### Issue: Foreign Key Constraint Violations

**Symptoms:**
- Error: `insert or update on table "friends" violates foreign key constraint`
- Error Code: `23503`
- New users unable to add friends

**Root Causes:**
- User profile doesn't exist in `public.users` table
- Race condition: User trying to use features before profile creation completes

**Solution:**

The codebase now includes automatic profile creation checks in `friendsService.js`. If you still encounter this:

#### Step 1: Verify Profile Exists

```sql
SELECT id, email, username FROM users 
WHERE id = 'your-user-id-here';
```

#### Step 2: Manually Create Missing Profile

If profile doesn't exist, create it manually using `database/manual_create_profile.sql` or:

```sql
INSERT INTO public.users (id, email, username, name, avatar_url, created_at, updated_at)
VALUES (
  'user-id-from-auth-users',
  'user@example.com',
  'generated_username',
  'User Name',
  NULL,
  NOW(),
  NOW()
);
```

#### Step 3: Verify Edge Function Working

Check that Edge Function `sync-auth-users-realtime` is working:

1. Check Edge Function logs
2. Verify webhook is enabled
3. Test with new user signup

**Prevention:**
- Always wait for profile creation before allowing user actions
- Add checks in service layer (already implemented)
- Monitor Edge Function success rates

---

### Issue: Type Mismatch in Database Functions

**Symptoms:**
- Error: `structure of query does not match function result type`
- Error: `Returned type character varying(255) does not match expected type text`

**Root Causes:**
- Function return types don't match table column types
- VARCHAR vs TEXT mismatches

**Solution:**

Cast VARCHAR columns to TEXT in function SELECT statements:

```sql
-- Instead of:
SELECT outfit_name, occasion, weather_condition FROM outfits;

-- Use:
SELECT outfit_name::TEXT, occasion::TEXT, weather_condition::TEXT FROM outfits;
```

For the `get_friend_outfits` function specifically, run migration that fixes type casts.

**Prevention:**
- Always use TEXT for function return types
- Test functions with sample data
- Document column types clearly

---

## 💻 Frontend Issues

### Issue: Items Count Mismatch on Home Page

**Symptoms:**
- Home page shows incorrect item count
- Count doesn't match actual closet items

**Root Cause:**
- Home page only loading recent items, not total count

**Solution:**

The fix has been implemented in `src/pages/Home.vue`. If you need to apply it:

1. Add `totalItemsCount` ref
2. Call `clothesService.getClothesStats()` to get total
3. Update stats computed property to use `totalItemsCount.value`

**Prevention:**
- Always load total counts separately from lists
- Use aggregation queries for statistics
- Test counts match actual data

---

### Issue: Animation Errors in Console

**Symptoms:**
- Console errors: `TypeError: Cannot read properties of undefined (reading '0')`
- Errors: `⚠️ Press in animation error`, `⚠️ Press out animation error`

**Root Cause:**
- Animation functions not validating element existence
- Motion library errors not caught

**Solution:**

The fix has been implemented in `src/composables/useLiquidGlass.js`. Ensure:

1. `pressIn()` and `pressOut()` accept optional `targetElement` parameter
2. Elements are validated before animating
3. Error handling with try-catch blocks
4. Type checking for `animate` function

**Prevention:**
- Always validate DOM elements before manipulating
- Add defensive checks in animation functions
- Handle errors gracefully

---

### Issue: Hugging Face Inference API Quota Exceeded (402 Error)

**Symptoms:**
- Console error: `❌ LlamaDescriptionService: Error generating description: Object`
- Error message: `Failed to perform inference: You have exceeded your monthly included credits for Inference Providers. Subscribe to PRO to get 20x more monthly included credits.`
- HTTP 402 status code in network requests
- AI-generated clothing descriptions fail to generate
- Virtual try-on feature may still work (descriptions are optional)

**Root Cause:**
- Free tier Hugging Face Inference API has monthly included credits
- Credits have been exhausted for the current billing period
- The `LlamaDescriptionService` uses Hugging Face Inference API for generating AI descriptions of clothing items

**Solution:**

#### Option 1: Wait for Quota Reset (Free Tier)
- Monthly credits reset at the start of each billing cycle
- Virtual try-on feature will continue to work without AI descriptions
- The app gracefully handles this error and continues functioning

#### Option 2: Upgrade to Hugging Face PRO Plan
- Upgrade your Hugging Face account to PRO plan
- PRO plan provides 20x more monthly included credits
- Visit: https://huggingface.co/pricing

#### Option 3: Use Alternative Description Service (For Developers)
- Implement fallback to manual descriptions or other AI services
- The error is caught and logged, but doesn't break the app
- Descriptions are optional for the virtual try-on feature

**Current Behavior:**
- The error is caught gracefully in `OutfitCreator.vue`
- Virtual try-on generation continues even if descriptions fail
- User sees a warning in console but functionality continues

**Prevention:**
- Monitor Hugging Face API usage in your account dashboard
- Set up usage alerts if available
- Consider implementing fallback description methods
- Cache descriptions when possible to reduce API calls

---

### Issue: Routing Issues on Vercel

**Symptoms:**
- Routes like `/closet` not working when accessed directly
- 404 errors on refresh
- Authentication state not initialized before routing

**Solution:**

#### Step 1: Verify `vercel.json` Exists

Ensure `vercel.json` exists in root directory with:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Step 2: Verify Auth Initialization

Ensure `src/main.js` initializes auth before mounting:

```javascript
// Initialize auth before mounting
await initializeAuth()
app.mount('#app')
```

#### Step 3: Verify Router Guards

Ensure router guards wait for auth initialization:

```javascript
router.beforeEach(async (to, from, next) => {
  // Wait for auth to be ready
  await waitForAuthReady()
  // ... rest of guard logic
})
```

**Prevention:**
- Always test routing after deployment
- Use `vercel.json` for SPA routing
- Initialize auth before app mount

---

### Issue: Mobile Navigation Colors

**Symptoms:**
- Mobile navigation icons/text hard to see
- Colors change unexpectedly with theme

**Solution:**

The fix has been implemented to use consistent black icons and text. If you need to apply it:

1. Update mobile navigation to always use:
   - Inactive icons: `text-black`
   - Active icons: `bg-black text-white`
   - Text: `text-black`
   - Background: `bg-white`

**Prevention:**
- Use consistent color scheme for mobile UI
- Test on multiple devices and themes
- Ensure high contrast for accessibility

---

## 🔧 Backend Issues

### Issue: ESLint TypeScript Parsing Errors

**Symptoms:**
- ESLint errors: `Parsing error: Unexpected token interface/type/module`
- TypeScript files not being parsed correctly

**Root Cause:**
- ESLint not configured for TypeScript parsing

**Solution:**

#### Option 1: Add TypeScript Parser

Install and configure `@typescript-eslint/parser`:

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Update `.eslintrc.cjs`:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/recommended'
  ]
}
```

#### Option 2: Exclude TypeScript Files

Add to `.eslintrc.cjs`:

```javascript
module.exports = {
  ignorePatterns: ['**/*.ts', '**/*.tsx']
}
```

**Prevention:**
- Configure ESLint correctly from the start
- Use TypeScript-specific ESLint configs
- Exclude TypeScript if not using full TypeScript support

---

### Issue: Unused Variables Warnings

**Symptoms:**
- ESLint warnings about unused variables
- Potential incomplete code

**Solution:**

Review and either:
1. Remove unused variables
2. Use them if they're needed
3. Prefix with underscore if intentionally unused: `_unusedVar`

**Prevention:**
- Clean up unused code regularly
- Use ESLint auto-fix where possible
- Review code before committing

---

## 🚀 Deployment Issues

### Issue: Environment Variables Not Available

**Symptoms:**
- `process.env.VITE_*` variables undefined
- API calls failing
- Build errors

**Root Causes:**
- Missing `VITE_` prefix
- Variables not set in deployment platform
- `.env` file not loaded

**Solution:**

#### Step 1: Verify Variable Names

All environment variables must start with `VITE_` for Vite to expose them:

```env
# ✅ Correct
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# ❌ Wrong (won't be exposed)
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

#### Step 2: Set Variables in Deployment Platform

**Vercel:**
1. Go to **Project Settings → Environment Variables**
2. Add all `VITE_*` variables
3. Select correct environments (Production, Preview, Development)

**Other Platforms:**
- Set environment variables in platform dashboard
- Ensure they're available at build time

**Prevention:**
- Document all required environment variables
- Use `.env.example` file
- Validate variables at startup

---

### Issue: Build Failures

**Symptoms:**
- Build fails with missing dependencies
- TypeScript compilation errors
- Module not found errors

**Solution:**

#### Step 1: Clean Install

```bash
rm -rf node_modules package-lock.json
npm install
```

#### Step 2: Check Node Version

Ensure Node.js version matches requirements:

```bash
node -v  # Should be >= 18
```

#### Step 3: Check TypeScript Errors

```bash
npm run build  # Check for TypeScript errors
```

Fix any TypeScript errors before deploying.

**Prevention:**
- Pin Node.js version in `.nvmrc`
- Use CI/CD to catch build errors early
- Test builds locally before pushing

---

### Issue: CORS Policy Errors

**Symptoms:**
- Error: `Access to fetch at ... has been blocked by CORS policy`
- API requests failing from frontend

**Root Causes:**
- Supabase not allowing requests from your domain
- Missing CORS configuration

**Solution:**

#### Step 1: Check Supabase Settings

1. Go to **Supabase Dashboard → Settings → API**
2. Verify **Site URL** includes your domain
3. Check **CORS** settings

#### Step 2: Add Domain to Allowed Origins

In Supabase, add your domains to allowed origins:
- `http://localhost:5173`
- `https://your-production-domain.com`

**Prevention:**
- Configure CORS before deployment
- Document all domains that need access
- Test API calls from each domain

---

## 🛠️ Build & Development Issues

### Issue: Module Not Found Errors

**Symptoms:**
- `Module not found: Can't resolve '...'`
- Missing dependencies

**Solution:**

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# If still failing, check package.json
npm list <package-name>
```

**Prevention:**
- Use `package-lock.json` in version control
- Document all dependencies
- Update dependencies regularly

---

### Issue: `npm run dev` Fails

**Symptoms:**
- Dev server won't start
- Port already in use
- Node version mismatch

**Solution:**

#### Check Port Availability

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 5174
```

#### Check Node Version

```bash
node -v  # Should be >= 18
```

Update Node.js if needed.

**Prevention:**
- Document required Node.js version
- Use `.nvmrc` for version management
- Check port availability before starting

---

## 🛡️ Preventive Best Practices

### General Guidelines

1. **Always Test After Changes**
   - Test locally before pushing
   - Verify deployment works
   - Check logs for errors

2. **Monitor Logs Regularly**
   - Edge Function logs
   - Database logs
   - Browser console
   - Deployment logs

3. **Document Everything**
   - Environment variables
   - Configuration changes
   - Known issues and solutions

4. **Use Version Control**
   - Commit often
   - Write clear commit messages
   - Tag releases

5. **Backup Before Migrations**
   - Always backup database before migrations
   - Test migrations in staging first
   - Have rollback plan ready

### Database Best Practices

1. **Run Migrations in Order**
   - Always run migrations sequentially
   - Check for duplicates before creating new ones
   - Test migrations in development first

2. **Use Transactions**
   - Wrap all migrations in transactions
   - Test rollback procedures
   - Verify data integrity after migrations

3. **Monitor RLS Policies**
   - Test policies regularly
   - Document policy changes
   - Verify permissions are correct

### Authentication Best Practices

1. **Test OAuth Flow Regularly**
   - Test signup flow
   - Test login flow
   - Test redirect URLs

2. **Monitor Edge Functions**
   - Check Edge Function logs regularly
   - Set up alerts for failures
   - Test webhooks after deployment

3. **Keep Credentials Secure**
   - Never commit secrets
   - Use environment variables
   - Rotate keys regularly

### Frontend Best Practices

1. **Handle Errors Gracefully**
   - Show user-friendly error messages
   - Log errors for debugging
   - Provide fallback UI

2. **Validate Input**
   - Validate on client side
   - Validate on server side
   - Sanitize user input

3. **Test on Multiple Devices**
   - Test mobile responsiveness
   - Test different browsers
   - Test with different screen sizes

---

## 📞 Getting More Help

If you're still experiencing issues:

1. **Check Documentation**
   - Review relevant guides in `docs/guides/`
   - Check [README.md](../README.md) for setup instructions

2. **Check Logs**
   - Browser console
   - Supabase Dashboard logs
   - Edge Function logs
   - Deployment platform logs

3. **Review Recent Changes**
   - Check git history
   - Review recent migrations
   - Check environment variable changes

4. **Search Existing Issues**
   - Check emergency-fixes folder
   - Review error messages carefully
   - Look for similar issues online

---

**Last Updated:** January 2025  
**Maintained by:** StyleSnap Team

