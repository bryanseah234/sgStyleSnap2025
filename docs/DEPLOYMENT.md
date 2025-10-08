# Deployment Guide

This guide covers deploying StyleSnap to production, including all services and configurations.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Deployment](#database-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Backend API Deployment](#backend-api-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] No console errors in browser
- [ ] All TypeScript/ESLint warnings resolved
- [ ] Code reviewed and approved

### Security

- [ ] All environment variables in secrets (not committed)
- [ ] Supabase RLS policies enabled
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] CSP headers configured
- [ ] Google OAuth credentials for production domain

### Performance

- [ ] Bundle size optimized (`npm run build -- --analyze`)
- [ ] Images compressed and optimized
- [ ] Lazy loading implemented
- [ ] Virtual scrolling for large lists
- [ ] Core Web Vitals meet targets

### Documentation

- [ ] README.md updated
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Deployment steps documented

---

## Environment Setup

> **📚 Complete Reference:** See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for detailed information about all environment variables, security guidelines, and where to store them.

### Production Environment Variables

Create `.env.production`:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=stylesnap-production

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-prod-client-id.apps.googleusercontent.com

# API (if separate backend)
VITE_API_URL=https://api.stylesnap.com

# Analytics (optional)
VITE_SENTRY_DSN=your-sentry-dsn
VITE_DATADOG_CLIENT_TOKEN=your-datadog-token

# Push Notifications (Web Push API)
VITE_VAPID_PUBLIC_KEY=BKxYj...your-public-key

# Environment
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

### Server-Side Environment Variables

For backend API (if deployed separately):

```bash
# Supabase Service Key (NEVER expose to client!)
SUPABASE_SERVICE_KEY=your-service-role-key

# Cloudinary API Credentials
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis (for rate limiting)
REDIS_URL=redis://your-redis-instance:6379

# Database (if direct connection)
DATABASE_URL=postgresql://...

# Security
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# Push Notifications (Server-Side Only)
VAPID_PRIVATE_KEY=4T1c...your-private-key
VAPID_SUBJECT=mailto:support@stylesnap.com

# Monitoring
SENTRY_DSN=your-backend-sentry-dsn
SLACK_WEBHOOK_URL=your-slack-webhook

# Node Environment
NODE_ENV=production
PORT=3000
```

### Generating VAPID Keys for Push Notifications

Push notifications require VAPID (Voluntary Application Server Identification) keys for authentication between your server and push services.

#### Method 1: Using web-push CLI (Recommended)

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

**Output:**
```
=======================================

Public Key:
BKxYjWm4VBitBjCrKyE_hJKxvIZrK3oVnEL8YlZnHqPZfDQqH1234567890abcdefghijklmnopqrstuvwxyz

Private Key:
4T1cABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijk

=======================================
```

#### Method 2: Using Online Generator

Visit [https://web-push-codelab.glitch.me](https://web-push-codelab.glitch.me) and click "Generate VAPID Keys".

#### Method 3: Using Node.js Script

```javascript
// generate-vapid-keys.js
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();

console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

Run:
```bash
npm install web-push
node generate-vapid-keys.js
```

#### Where to Store VAPID Keys

**Public Key (Client-Side):**
- Add to `.env.production`: `VITE_VAPID_PUBLIC_KEY=BKxYj...`
- Add to Vercel/Netlify environment variables
- Safe to expose to client

**Private Key (Server-Side Only):**
- Add to Supabase Edge Function secrets (see Supabase deployment section)
- Never commit to git or expose to client
- Used for signing push messages

**VAPID Subject:**
- Email or URL identifying your app
- Format: `mailto:support@yourdomain.com` or `https://yourdomain.com`
- Add to both client and server environments

---

## Database Deployment

### 1. Production Supabase Setup

**Create Production Project:**

1. Go to https://supabase.com/dashboard
2. Create new project: "StyleSnap Production"
3. Choose region closest to users
4. Note project URL and keys

**Database Configuration:**

```sql
-- In Supabase SQL Editor, execute in order:

-- 1. Schema
\i sql/001_initial_schema.sql

-- 2. RLS Policies
\i sql/002_rls_policies.sql

-- 3. Indexes and Functions
\i sql/003_indexes_functions.sql
```

### 2. Enable Row Level Security

**Verify RLS is enabled:**

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Should show true for all tables
-- If false, enable manually:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
```

### 3. Configure Authentication

**Enable Google OAuth:**

1. Supabase Dashboard → Authentication → Providers
2. Enable Google
3. Add production Google OAuth credentials:
   - Client ID: `xxx.apps.googleusercontent.com`
   - Client Secret: `xxx`
4. Add redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `https://your-project.supabase.co/auth/v1/callback`

**Configure JWT Settings:**

1. Authentication → Settings
2. JWT Expiry: 3600 (1 hour)
3. Refresh Token Expiry: 2592000 (30 days)
4. Enable email confirmations: No (using Google OAuth only)

### 4. Set up Database Backups

**Automated Backups (Supabase Pro):**
- Daily automated backups (included in Pro plan)
- Point-in-time recovery

**Manual Backup:**

```bash
# Using pg_dump
pg_dump "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres" \
  --format=custom \
  --file=backup_$(date +%Y%m%d).dump

# Restore from backup
pg_restore --dbname="postgresql://..." backup_20251005.dump
```

### 5. Deploy Supabase Edge Functions

StyleSnap uses Supabase Edge Functions for server-side operations like sending push notifications.

**Install Supabase CLI:**

```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux/WSL
brew install supabase/tap/supabase
```

**Login to Supabase:**

```bash
supabase login
```

**Deploy Edge Functions:**

```bash
# Navigate to project root
cd /path/to/ClosetApp

# Deploy send-push-notification function
supabase functions deploy send-push-notification --project-ref your-project-ref
```

**Set Edge Function Secrets:**

```bash
# Set VAPID private key (CRITICAL - server-side only)
supabase secrets set VAPID_PRIVATE_KEY="4T1c...your-private-key" --project-ref your-project-ref

# Set VAPID public key
supabase secrets set VAPID_PUBLIC_KEY="BKxYj...your-public-key" --project-ref your-project-ref

# Set VAPID subject (contact email)
supabase secrets set VAPID_SUBJECT="mailto:support@yourdomain.com" --project-ref your-project-ref
```

**Verify Function Deployment:**

```bash
# List deployed functions
supabase functions list --project-ref your-project-ref

# Test function
curl -X POST \
  'https://your-project.supabase.co/functions/v1/send-push-notification' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "test-user-id",
    "type": "outfit_like",
    "title": "Test Notification",
    "body": "This is a test notification"
  }'
```

**Function Logs:**

```bash
# View function logs
supabase functions logs send-push-notification --project-ref your-project-ref

# Stream logs in real-time
supabase functions logs send-push-notification --follow --project-ref your-project-ref
```

**Environment Variables for Functions:**

The Edge Function automatically has access to:
- `Deno.env.get('SUPABASE_URL')` - Your project URL
- `Deno.env.get('SUPABASE_ANON_KEY')` - Anon key
- `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` - Service role key
- `Deno.env.get('VAPID_PUBLIC_KEY')` - Your VAPID public key
- `Deno.env.get('VAPID_PRIVATE_KEY')` - Your VAPID private key
- `Deno.env.get('VAPID_SUBJECT')` - Your VAPID subject

**Important Security Notes:**

⚠️ **NEVER expose VAPID private key to client!**
- Private key only in Supabase Edge Function secrets
- Public key can be in client environment variables (with `VITE_` prefix)
- Private key is used to sign push messages on server

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

**Initial Setup:**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link project:
   ```bash
   vercel link
   ```

4. Add environment variables:
   ```bash
   # Add production env vars
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   vercel env add VITE_CLOUDINARY_CLOUD_NAME production
   vercel env add VITE_CLOUDINARY_UPLOAD_PRESET production
   vercel env add VITE_VAPID_PUBLIC_KEY production
   # ... add all VITE_* variables
   ```
   
   **See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for complete list of required variables.**

**Deploy:**

```bash
# Production deployment
vercel --prod

# Preview deployment (for testing)
vercel
```

**Configuration (`vercel.json`):**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.stylesnap.com/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://res.cloudinary.com; frame-ancestors 'none';"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

**Deploy via Git:**

1. Connect GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in Netlify dashboard
4. Deploy

**Configuration (`netlify.toml`):**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "https://api.stylesnap.com/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Content-Security-Policy = "default-src 'self'; ..."
```

### Build Optimization

**Before deploying:**

```bash
# Analyze bundle size
npm run build -- --analyze

# Check for issues
npm run build
npm run preview

# Lighthouse audit
lighthouse https://staging.stylesnap.com --view
```

**Vite Configuration (`vite.config.js`):**

```javascript
export default {
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'supabase': ['@supabase/supabase-js'],
          'utils': ['./src/utils/index.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
};
```

---

## Backend API Deployment

### Option 1: Railway

**Setup:**

1. Go to https://railway.app
2. Create new project
3. Connect GitHub repository
4. Add environment variables
5. Deploy

**Configuration:**

```yaml
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Option 2: Render

**Setup:**

1. Create new Web Service
2. Connect repository
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables

### Option 3: Docker (Self-Hosted)

**Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node healthcheck.js || exit 1

# Start server
CMD ["node", "server.js"]
```

**Deploy:**

```bash
# Build image
docker build -t stylesnap-api:1.0.0 .

# Run container
docker run -d \
  --name stylesnap-api \
  --env-file .env.production \
  -p 3000:3000 \
  --restart unless-stopped \
  stylesnap-api:1.0.0

# Check logs
docker logs -f stylesnap-api
```

---

## Monitoring & Maintenance

### 1. Set Up Monitoring

**Sentry (Error Tracking):**

```javascript
// main.js
import * as Sentry from '@sentry/vue';

if (import.meta.env.PROD) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    release: `stylesnap@${import.meta.env.VITE_APP_VERSION}`,
    tracesSampleRate: 0.1,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router)
      })
    ]
  });
}
```

**Performance Monitoring:**

```javascript
// utils/analytics.js
import { onCLS, onFID, onLCP } from 'web-vitals';

export function initPerformanceMonitoring() {
  onCLS(metric => reportMetric('CLS', metric));
  onFID(metric => reportMetric('FID', metric));
  onLCP(metric => reportMetric('LCP', metric));
}

function reportMetric(name, metric) {
  fetch('/api/analytics/metrics', {
    method: 'POST',
    body: JSON.stringify({ name, value: metric.value }),
    keepalive: true
  });
}
```

### 2. Set Up Automated Tasks

**GitHub Actions - Purge Old Items:**

```yaml
# .github/workflows/purge-old-items.yml
name: Purge Old Items

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  purge:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run purge script
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          CLOUDINARY_API_KEY: ${{ secrets.CLOUDINARY_API_KEY }}
          CLOUDINARY_API_SECRET: ${{ secrets.CLOUDINARY_API_SECRET }}
        run: node scripts/purge-old-items.js
      
      - name: Notify on failure
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"Purge job failed!"}'
```

**Supabase Keepalive:**

```yaml
# .github/workflows/supabase-keepalive.yml
name: Supabase Keepalive

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:

jobs:
  keepalive:
    runs-on: ubuntu-latest
    
    steps:
      - name: Ping Supabase
        run: |
          curl -X POST https://your-project.supabase.co/rest/v1/rpc/ping \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
```

### 3. Database Maintenance

**Weekly Tasks:**

```sql
-- Analyze tables for query optimization
ANALYZE clothes;
ANALYZE friendships;
ANALYZE suggestions;

-- Vacuum to reclaim storage
VACUUM ANALYZE;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### 4. Health Checks

**API Health Endpoint:**

```javascript
// server.js
app.get('/health', async (req, res) => {
  try {
    // Check database
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    
    // Check Redis (if using)
    await redis.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

**Monitor Health:**

```bash
# Add to monitoring service (e.g., UptimeRobot)
GET https://api.stylesnap.com/health

# Expected: 200 OK with { "status": "healthy" }
```

---

## Troubleshooting

### Common Issues

**Issue: CORS Errors**

```javascript
// server.js - Fix CORS configuration
import cors from 'cors';

app.use(cors({
  origin: [
    'https://stylesnap.com',
    'https://www.stylesnap.com'
  ],
  credentials: true
}));
```

**Issue: Database Connection Fails**

```bash
# Check Supabase status
curl https://your-project.supabase.co/rest/v1/

# Verify connection string
psql "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# Check RLS policies aren't blocking
SET ROLE anon;
SELECT * FROM clothes LIMIT 1;
```

**Issue: Images Not Loading**

```javascript
// Check Cloudinary URL format
const isValid = url.startsWith('https://res.cloudinary.com/');

// Verify CORS in Cloudinary dashboard
// Settings → Security → Allowed fetch domains
// Add: stylesnap.com
```

**Issue: High Memory Usage**

```bash
# Check Node.js memory
node --max-old-space-size=4096 server.js

# Monitor with PM2
pm2 start server.js --name stylesnap-api --max-memory-restart 1G
```

### Rollback Procedure

**Frontend:**

```bash
# Vercel
vercel rollback

# Netlify
# Go to Deploys → Click on previous deploy → Publish deploy

# Manual
git revert HEAD
git push origin main
```

**Database:**

```sql
-- Restore from backup
pg_restore --dbname="postgresql://..." backup.dump

-- Or use Supabase dashboard
-- Settings → Database → Backups → Restore
```

### Emergency Contacts

- **Supabase Support:** https://supabase.com/support
- **Vercel Support:** https://vercel.com/support
- **Cloudinary Support:** https://support.cloudinary.com

---

## Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] Authentication works (Google OAuth)
- [ ] Can create/view/delete items
- [ ] Images upload successfully
- [ ] Friend requests work
- [ ] Suggestions work
- [ ] Quota enforcement works
- [ ] Trash/restore works
- [ ] All pages accessible
- [ ] Mobile responsive
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] Monitoring configured
- [ ] Alerts configured
- [ ] Backups scheduled
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Analytics tracking

---

## Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| LCP | < 2.5s | < 4.0s |
| FID | < 100ms | < 300ms |
| CLS | < 0.1 | < 0.25 |
| TTI | < 3.8s | < 7.3s |
| Bundle Size | < 500KB | < 1MB |

---

## Security Checklist

- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] XSS protection enabled
- [ ] CSRF tokens (if using sessions)
- [ ] Rate limiting active
- [ ] RLS policies enabled
- [ ] API keys in secrets
- [ ] No sensitive data in logs
- [ ] Input validation on all endpoints
- [ ] File upload security (magic numbers, size limits)

---

## Support

For deployment issues:
- **Documentation:** https://docs.stylesnap.com
- **Issues:** https://github.com/stylesnap/issues
- **Email:** devops@stylesnap.com

---

**Last Updated:** October 5, 2025  
**Version:** 1.0.0
