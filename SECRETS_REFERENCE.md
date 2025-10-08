# 🔐 Secrets & Environment Variables Quick Reference

**Use this as a quick lookup. For full deployment guide, see [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)**

---

## 📍 Where Each Secret Goes

### 🏠 Local Development (`.env.local`)

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset
VITE_VAPID_PUBLIC_KEY=BKxYjz3Q9YVs...
VITE_OPENWEATHER_API_KEY=your-api-key     # Optional
```

---

### 🐙 GitHub Secrets (CI/CD)

Repository → Settings → Secrets → Actions

```
VERCEL_TOKEN=xxxxx
VERCEL_ORG_ID=team_xxxxx
VERCEL_PROJECT_ID=prj_xxxxx
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset
VITE_VAPID_PUBLIC_KEY=BKxYjz3Q9YVs...
VITE_OPENWEATHER_API_KEY=your-api-key     # Optional
```

**⚠️ DO NOT ADD:** `VAPID_PRIVATE_KEY` (never in GitHub!)

---

### ▲ Vercel (Production Frontend)

Project → Settings → Environment Variables

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset
VITE_VAPID_PUBLIC_KEY=BKxYjz3Q9YVs...
VITE_OPENWEATHER_API_KEY=your-api-key     # Optional
```

**⚠️ DO NOT ADD:** `VAPID_PRIVATE_KEY` (never in frontend!)

---

### 🔧 Supabase Edge Functions (Server-Side)

Set via Supabase CLI:

```bash
supabase secrets set VAPID_PRIVATE_KEY="4T1cZ8Hq..." --project-ref YOUR_REF
supabase secrets set VAPID_PUBLIC_KEY="BKxYjz3Q9YVs..." --project-ref YOUR_REF
supabase secrets set VAPID_SUBJECT="mailto:support@yourdomain.com" --project-ref YOUR_REF
```

**✅ ONLY HERE:** `VAPID_PRIVATE_KEY` - never expose this anywhere else!

---

## 🔑 How to Get Each Value

| Variable | Where to Get It |
|----------|----------------|
| **VITE_SUPABASE_URL** | Supabase Dashboard → Project Settings → API → Project URL |
| **VITE_SUPABASE_ANON_KEY** | Supabase Dashboard → Project Settings → API → anon public key |
| **VITE_CLOUDINARY_CLOUD_NAME** | Cloudinary Console → Dashboard → Cloud name |
| **VITE_CLOUDINARY_UPLOAD_PRESET** | Cloudinary → Settings → Upload → Create unsigned preset |
| **VITE_VAPID_PUBLIC_KEY** | Generate: `web-push generate-vapid-keys` |
| **VAPID_PRIVATE_KEY** | Generate: `web-push generate-vapid-keys` (keep secret!) |
| **VAPID_SUBJECT** | Your support email: `mailto:support@yourdomain.com` |
| **VERCEL_TOKEN** | Vercel → Account Settings → Tokens → Create Token |
| **VERCEL_ORG_ID** | Run `vercel link` → Open `.vercel/project.json` |
| **VERCEL_PROJECT_ID** | Run `vercel link` → Open `.vercel/project.json` |
| **VITE_OPENWEATHER_API_KEY** | OpenWeatherMap → API Keys → Create Key (optional) |

---

## 🛡️ Security Rules

### ✅ Safe to Expose (Client-Side)
- All `VITE_*` variables (bundled into frontend code)
- Supabase anon key (protected by RLS policies)
- Cloudinary cloud name (public by design)
- VAPID public key (meant to be public)

### ❌ NEVER Expose (Server-Only)
- `VAPID_PRIVATE_KEY` (only in Supabase Edge Functions)
- `VERCEL_TOKEN` (deployment access)
- Any database connection strings with passwords

---

## 📝 Quick Copy Templates

### `.env.local` Template

```bash
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=

# Push Notifications
VITE_VAPID_PUBLIC_KEY=

# Optional
VITE_OPENWEATHER_API_KEY=
```

### Supabase Commands

```bash
# Generate VAPID keys (first time)
npm install -g web-push
web-push generate-vapid-keys

# Set secrets in Supabase
supabase secrets set VAPID_PRIVATE_KEY="<private-key>" --project-ref YOUR_REF
supabase secrets set VAPID_PUBLIC_KEY="<public-key>" --project-ref YOUR_REF
supabase secrets set VAPID_SUBJECT="mailto:your@email.com" --project-ref YOUR_REF

# Deploy Edge Function
supabase functions deploy send-push-notification --project-ref YOUR_REF
```

---

**For full deployment instructions, see:** [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)
