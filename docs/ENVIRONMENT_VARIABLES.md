# Environment Variables Reference

Complete guide to all environment variables required for StyleSnap deployment.

---

## Table of Contents
1. [Quick Reference](#quick-reference)
2. [Client-Side Variables (VITE_*)](#client-side-variables)
3. [Server-Side Variables (Supabase Edge Functions)](#server-side-variables)
4. [Where to Store](#where-to-store)
5. [Security Guidelines](#security-guidelines)

---

## Quick Reference

### Must Have for Basic App
| Variable | Where | Required | Description |
|----------|-------|----------|-------------|
| `VITE_SUPABASE_URL` | Client | ✅ Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Client | ✅ Yes | Supabase anonymous key (safe to expose) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Client | ✅ Yes | Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Client | ✅ Yes | Cloudinary upload preset (unsigned) |

### Push Notifications
| Variable | Where | Required | Description |
|----------|-------|----------|-------------|
| `VITE_VAPID_PUBLIC_KEY` | Client | ✅ Yes | VAPID public key (safe to expose) |
| `VAPID_PRIVATE_KEY` | Server | ✅ Yes | VAPID private key (NEVER expose!) |
| `VAPID_SUBJECT` | Server | ✅ Yes | Contact email (mailto:you@domain.com) |

### Optional Features
| Variable | Where | Required | Description |
|----------|-------|----------|-------------|
| `VITE_OPENWEATHER_API_KEY` | Client | ⚠️ Optional | Weather alerts for outfit suggestions |

---

## Client-Side Variables

These variables are prefixed with `VITE_` and are bundled into your frontend JavaScript. They are **safe to expose publicly**.

### Required Variables

#### `VITE_SUPABASE_URL`
- **Type:** String (URL)
- **Example:** `https://abcdefghijk.supabase.co`
- **Where to get:** Supabase Dashboard → Settings → API → Project URL
- **Used for:** Connecting to Supabase backend

#### `VITE_SUPABASE_ANON_KEY`
- **Type:** String (JWT)
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to get:** Supabase Dashboard → Settings → API → anon/public key
- **Used for:** Client-side authentication (Row Level Security enforced)
- **Security:** Safe to expose - RLS policies protect data

#### `VITE_CLOUDINARY_CLOUD_NAME`
- **Type:** String
- **Example:** `stylesnap-app`
- **Where to get:** Cloudinary Dashboard → Account Details → Cloud Name
- **Used for:** Uploading and serving images

#### `VITE_CLOUDINARY_UPLOAD_PRESET`
- **Type:** String
- **Example:** `stylesnap_unsigned`
- **Where to get:** Cloudinary Settings → Upload → Upload Presets
- **Used for:** Unsigned client-side uploads
- **Security:** Create an unsigned preset with restricted folder access

#### `VITE_VAPID_PUBLIC_KEY`
- **Type:** String (Base64)
- **Example:** `BKxYjz3Q9YVs...` (87 characters)
- **Where to get:** Generate with `web-push generate-vapid-keys` (see [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md))
- **Used for:** Push notification subscription identification
- **Security:** Safe to expose - corresponds to private key on server

### Optional Variables

#### `VITE_OPENWEATHER_API_KEY`
- **Type:** String
- **Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- **Where to get:** [OpenWeatherMap API](https://openweathermap.org/api)
- **Used for:** Weather-based outfit suggestions
- **Required:** Only if using weather alert features

---

## Server-Side Variables

These variables are stored **ONLY** in Supabase Edge Function secrets. They are **NEVER exposed to client code**.

### Push Notification Secrets

#### `VAPID_PRIVATE_KEY`
- **Type:** String (Base64)
- **Example:** `4T1cZ8Hq...` (43 characters)
- **Where to get:** Generate with `web-push generate-vapid-keys` (see [PUSH_NOTIFICATIONS.md](./PUSH_NOTIFICATIONS.md))
- **Used for:** Signing push notification requests
- **Security:** ⚠️ **CRITICAL - NEVER EXPOSE!** Keep server-side only

#### `VAPID_SUBJECT`
- **Type:** String (mailto: URL)
- **Example:** `mailto:support@yourdomain.com`
- **Format:** Must start with `mailto:` or be a valid URL
- **Used for:** Push service contact information
- **Why needed:** Push services can contact you if issues arise

#### `VAPID_PUBLIC_KEY` (Server Copy)
- **Type:** String (Base64)
- **Example:** Same as `VITE_VAPID_PUBLIC_KEY`
- **Used for:** Server-side push notification signing
- **Note:** Same key as client-side, stored separately for server access

### Automatic Supabase Variables

These are automatically available in Edge Functions:

- `SUPABASE_URL` - Your project URL (auto-injected)
- `SUPABASE_ANON_KEY` - Anon key (auto-injected)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (auto-injected)

---

## Where to Store

### Development (Local)

**Create `.env.local` file:**
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset

# Push Notifications
VITE_VAPID_PUBLIC_KEY=BKxYjz3Q9YVs...

# Optional
VITE_OPENWEATHER_API_KEY=a1b2c3d4e5f6g7h8i9j0
```

**Note:** `.env.local` is gitignored and NEVER committed.

### Production - GitHub Secrets

**For Vercel deployment via GitHub Actions:**

1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add repository secrets:

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET
VITE_VAPID_PUBLIC_KEY
VITE_OPENWEATHER_API_KEY (optional)
```

**What NOT to add to GitHub:**
- ❌ `VAPID_PRIVATE_KEY` - Goes to Supabase secrets only!
- ❌ `VAPID_SUBJECT` - Goes to Supabase secrets only!

### Production - Vercel Dashboard

**Alternative to GitHub Actions:**

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add all `VITE_*` variables
3. Apply to: **Production**, **Preview**, **Development**

### Production - Supabase Edge Function Secrets

**For push notification server-side:**

```bash
# Set VAPID keys in Supabase
supabase secrets set VAPID_PRIVATE_KEY="4T1cZ8Hq..." --project-ref YOUR_PROJECT_REF
supabase secrets set VAPID_PUBLIC_KEY="BKxYjz3Q9YVs..." --project-ref YOUR_PROJECT_REF
supabase secrets set VAPID_SUBJECT="mailto:support@yourdomain.com" --project-ref YOUR_PROJECT_REF
```

**Verify secrets:**
```bash
supabase secrets list --project-ref YOUR_PROJECT_REF
```

---

## Security Guidelines

### ✅ Safe to Expose (Client-Side)

These variables are compiled into your frontend JavaScript and visible to users:

- `VITE_SUPABASE_URL` - Protected by RLS policies
- `VITE_SUPABASE_ANON_KEY` - Protected by RLS policies
- `VITE_CLOUDINARY_CLOUD_NAME` - Public cloud name
- `VITE_CLOUDINARY_UPLOAD_PRESET` - Use unsigned presets with folder restrictions
- `VITE_VAPID_PUBLIC_KEY` - Public key by design
- `VITE_OPENWEATHER_API_KEY` - Low-risk API key (optional)

### ⚠️ NEVER Expose (Server-Side Only)

These variables must NEVER be in client-side code or committed to git:

- ❌ `VAPID_PRIVATE_KEY` - Can send push notifications as you
- ❌ Supabase Service Role Key - Full database access
- ❌ Cloudinary API Secret - Can delete/modify all assets

### Best Practices

1. **Never commit secrets to git**
   - Use `.env.local` for development (gitignored)
   - Use GitHub Secrets or Vercel Environment Variables for production

2. **Separate client and server secrets**
   - `VITE_*` prefix = Client-side (safe to expose)
   - No `VITE_` prefix = Server-side (keep secret)

3. **Rotate keys regularly**
   - Regenerate VAPID keys if compromised
   - Update all deployment environments

4. **Use RLS for database security**
   - Don't rely on obscuring Supabase anon key
   - Implement proper Row Level Security policies

5. **Monitor secret usage**
   - Check Edge Function logs for unauthorized access
   - Review Cloudinary upload logs

---

## Troubleshooting

### "Supabase URL not defined"
- ✅ Check `.env.local` has `VITE_SUPABASE_URL`
- ✅ Restart dev server after adding variable
- ✅ Verify variable name has `VITE_` prefix

### "VAPID public key invalid"
- ✅ Ensure key is exactly 87 characters (Base64 URL-safe)
- ✅ No extra spaces or line breaks
- ✅ Generated with `web-push generate-vapid-keys`

### "Push notification not sending"
- ✅ Verify `VAPID_PRIVATE_KEY` set in Supabase secrets
- ✅ Check Edge Function logs: `supabase functions logs send-push-notification --project-ref YOUR_REF`
- ✅ Ensure public and private keys match (generated together)

### "Build fails on Vercel"
- ✅ All `VITE_*` secrets added to GitHub/Vercel
- ✅ Test build locally: `npm run build`
- ✅ Check Vercel deployment logs for specific missing variable

---

## Migration Checklist

When deploying to production for the first time:

- [ ] Generate VAPID keys with `web-push generate-vapid-keys`
- [ ] Add all `VITE_*` variables to GitHub Secrets
- [ ] Add `VAPID_*` secrets to Supabase with `supabase secrets set`
- [ ] Deploy Edge Function: `supabase functions deploy send-push-notification`
- [ ] Test push notifications in production
- [ ] Verify all environment variables in Vercel dashboard
- [ ] Monitor Edge Function logs for errors

---

## Quick Copy Templates

### .env.local Template
```bash
# Copy this template and fill in your values

# Supabase (Required)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# Cloudinary (Required)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset-name

# Push Notifications (Required for push features)
VITE_VAPID_PUBLIC_KEY=BKxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Weather (Optional)
VITE_OPENWEATHER_API_KEY=your-api-key
```

### Supabase Secrets Template
```bash
# Run these commands with your actual values

supabase secrets set VAPID_PRIVATE_KEY="your-private-key" --project-ref YOUR_REF
supabase secrets set VAPID_PUBLIC_KEY="your-public-key" --project-ref YOUR_REF
supabase secrets set VAPID_SUBJECT="mailto:support@yourdomain.com" --project-ref YOUR_REF
```

---

## Related Documentation

- [Push Notifications Setup](./PUSH_NOTIFICATIONS.md) - Complete push notification guide
- [Deployment Guide](./DEPLOYMENT.md) - Full production deployment
- [Deployment Setup](../DEPLOYMENT_SETUP.md) - GitHub Actions workflow setup
- [API Reference](./API_REFERENCE.md) - API endpoints requiring these variables

---

**Last Updated:** January 2025
**Applies To:** StyleSnap v2.0+
