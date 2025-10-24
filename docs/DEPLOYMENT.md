# Deployment Documentation

## Overview

StyleSnap 2025 is designed for easy deployment on modern cloud platforms. This guide covers deployment strategies, environment configuration, and production considerations.

## Deployment Platforms

### Vercel (Recommended)
**Best for**: Frontend deployment with automatic CI/CD
**Pros**: 
- Automatic deployments from Git
- Built-in CDN and edge functions
- Easy environment variable management
- Zero-config deployments

**Deployment Steps**:
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Set build settings
4. Deploy automatically

### Netlify
**Best for**: Static site hosting with form handling
**Pros**:
- Easy drag-and-drop deployment
- Built-in form handling
- Edge functions support
- Good free tier

### Railway
**Best for**: Full-stack applications
**Pros**:
- Database hosting included
- Automatic deployments
- Good for Node.js applications

### Self-Hosted
**Best for**: Custom infrastructure requirements
**Options**:
- Docker containers
- VPS deployment
- Kubernetes clusters

## Environment Configuration

### Required Environment Variables

#### Supabase Configuration
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Cloudinary Configuration (Optional)
```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_API_SECRET=your-api-secret
```

#### Production Configuration
```env
NODE_ENV=production
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=StyleSnap
```

### Environment Variable Security

#### Vercel Environment Variables
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add each variable with appropriate environment scope:
   - **Production**: `VITE_SUPABASE_URL`
   - **Preview**: `VITE_SUPABASE_URL`
   - **Development**: `VITE_SUPABASE_URL`

#### Netlify Environment Variables
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add variables with appropriate scopes:
   - **Production**: All production variables
   - **Deploy Previews**: All variables for testing

## Build Configuration

### Vite Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "build:production": "NODE_ENV=production vite build"
  }
}
```

## Database Deployment

### Supabase Database Setup

#### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and project name
4. Set database password
5. Select region closest to your users

#### 2. Configure Database
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

#### 3. Run Migrations
```bash
# Using Supabase CLI
supabase db push

# Or manually with psql
psql -h db.your-project.supabase.co -U postgres -d postgres -f database/migrations/001_initial_schema.sql
```

#### 4. Configure RLS Policies
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

### Database Security Configuration

#### Authentication Settings
```sql
-- Configure JWT settings
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';
ALTER DATABASE postgres SET "app.settings.jwt_exp" TO '3600';
```

#### CORS Configuration
```sql
-- Allow frontend domain
UPDATE auth.config SET 
  site_url = 'https://your-domain.com',
  additional_redirect_urls = 'https://your-domain.com/**'
WHERE id = 1;
```

## Vercel Deployment Guide

### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository and click "Import"

### Step 2: Configure Build Settings
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### Step 3: Environment Variables
Add the following environment variables in Vercel dashboard:

**Production Environment**:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
```

**Preview Environment**:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=preview
```

### Step 4: Deploy
1. Click "Deploy" button
2. Wait for build to complete
3. Access your deployed application

### Step 5: Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable SSL certificate

## Netlify Deployment Guide

### Step 1: Connect Repository
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Select the repository and branch

### Step 2: Build Settings
```
Build command: npm run build
Publish directory: dist
```

### Step 3: Environment Variables
Add environment variables in Site Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_API_SECRET=your-api-secret
```

### Step 4: Deploy
1. Click "Deploy site"
2. Wait for build to complete
3. Access your deployed application

## Docker Deployment

### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

### Docker Compose
```yaml
version: '3.8'

services:
  stylesnap:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=https://your-project.supabase.co
      - VITE_SUPABASE_ANON_KEY=your-anon-key
    restart: unless-stopped
```

### Build and Run
```bash
# Build Docker image
docker build -t stylesnap .

# Run container
docker run -p 80:80 stylesnap

# Or use Docker Compose
docker-compose up -d
```

## Production Considerations

### Performance Optimization

#### Code Splitting
```javascript
// Route-based code splitting
const Cabinet = () => import('@/pages/Cabinet.vue')
const Outfits = () => import('@/pages/Outfits.vue')
const Friends = () => import('@/pages/Friends.vue')
```

#### Image Optimization
```javascript
// Lazy loading images
<img 
  :src="item.image_url" 
  :alt="item.name"
  loading="lazy"
  class="w-full h-full object-cover"
/>
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm install -g vite-bundle-analyzer
vite-bundle-analyzer dist
```

### Security Headers

#### Vercel Security Headers
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

#### Netlify Security Headers
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Monitoring and Analytics

#### Error Tracking
```javascript
// Add error tracking service
import { init } from '@sentry/vue'

init({
  app,
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV
})
```

#### Performance Monitoring
```javascript
// Add performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

### CDN Configuration

#### Cloudflare CDN
1. Add domain to Cloudflare
2. Configure DNS records
3. Enable caching rules
4. Configure security settings

#### Vercel CDN
- Automatic CDN included
- Global edge network
- Automatic image optimization
- Automatic compression

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Environment-Specific Deployments

#### Staging Environment
```yaml
# Deploy to staging on PR
on:
  pull_request:
    branches: [main]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      # ... build steps
      - name: Deploy to Staging
        run: npm run deploy:staging
        env:
          VITE_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}
```

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Check build logs
npm run build --verbose

# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Environment Variable Issues
```bash
# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Check in browser console
console.log(import.meta.env.VITE_SUPABASE_URL)
```

#### Database Connection Issues
```javascript
// Test database connection
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Test connection
const { data, error } = await supabase.from('users').select('count')
console.log('Database connection:', { data, error })
```

### Performance Issues

#### Slow Loading
1. Check bundle size
2. Enable compression
3. Optimize images
4. Use CDN

#### Database Performance
1. Check query performance
2. Add database indexes
3. Optimize RLS policies
4. Monitor connection usage

### Security Issues

#### CORS Errors
```javascript
// Check CORS configuration
const { data, error } = await supabase
  .from('users')
  .select('*')
  .limit(1)

if (error) {
  console.error('CORS or authentication error:', error)
}
```

#### RLS Policy Violations
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Test policies
SET ROLE authenticated;
SELECT * FROM users WHERE id = auth.uid();
```

## Maintenance

### Regular Tasks

#### Database Maintenance
```sql
-- Update table statistics
ANALYZE users;
ANALYZE clothes;
ANALYZE outfits;
ANALYZE friends;
ANALYZE notifications;

-- Check table bloat
SELECT 
  schemaname,
  tablename,
  n_dead_tup,
  n_live_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000;
```

#### Application Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

#### Backup Verification
```bash
# Test backup restoration
pg_restore --list backup.sql
pg_restore --dry-run backup.sql
```

---

This deployment documentation provides comprehensive guidance for deploying StyleSnap 2025 to various platforms, including configuration, security, and maintenance considerations.
