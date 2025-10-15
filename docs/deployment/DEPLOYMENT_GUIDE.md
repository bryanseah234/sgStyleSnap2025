# 🚀 Complete Deployment Guide - StyleSnap

**Last Updated:** January 2025  
**Version:** 2.0.0  
**This is your single source of truth for deployment.**

---

## 📋 Quick Start Checklist

Before deploying, make sure you have:

- [ ] Node.js 18+ installed
- [ ] GitHub account with repo access
- [ ] Supabase account and project created
- [ ] Vercel account (or other hosting provider)
- [ ] Cloudinary account for image storage
- [ ] All secrets ready (see section below)

---

## 🔑 Environment Variables - Complete Reference

### Where Everything Goes

```
┌─────────────────────────────────────────────────────────────┐
│ YOUR LOCAL MACHINE (.env.local)                            │
│ - All VITE_* variables for development                     │
│ - Never committed to git                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ GITHUB SECRETS (for CI/CD)                                 │
│ - All VITE_* variables                                     │
│ - Vercel deployment tokens                                 │
│ - NO server secrets here!                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ VERCEL (Production Environment)                            │
│ - All VITE_* variables                                     │
│ - Auto-deployed from GitHub or manual                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SUPABASE EDGE FUNCTIONS (Server Secrets)                   │
│ - VAPID_PRIVATE_KEY                                        │
│ - VAPID_PUBLIC_KEY                                         │
│ - VAPID_SUBJECT                                            │
│ - NEVER exposed to client!                                 │
└─────────────────────────────────────────────────────────────┘
```

### Required Environment Variables

#### Frontend Variables (VITE_*)
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Weather API (Optional)
VITE_OPENWEATHER_API_KEY=your_openweather_api_key

# Google OAuth (Optional - handled by Supabase)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

#### Server Variables (Supabase Edge Functions)
```env
# Push Notifications (VAPID)
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_SUBJECT=mailto:your-email@example.com

# Service Role Key (for server operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🏗️ Architecture Overview

### Current Architecture (v2.0.0)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Vercel)      │    │   (Supabase)    │    │   Services      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Vue.js 3      │    │ • PostgreSQL    │    │ • Cloudinary    │
│ • Pinia Store   │    │ • Auth          │    │ • Google OAuth  │
│ • Tailwind CSS  │    │ • Real-time     │    │ • Weather API   │
│ • PWA Support   │    │ • Edge Functions│    │ • AI Models     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Features
- **7-Day Notification Retention** - Automatic cleanup system
- **Multi-Theme Support** - 6 color themes and 6 font styles
- **Session Management** - Enhanced user session handling
- **Real-time Updates** - Live data synchronization
- **Mobile-First Design** - Responsive across all devices

---

## 🚀 Deployment Steps

### Step 1: Supabase Setup

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com
   # Create new project
   # Note down your project URL and anon key
   ```

2. **Run Database Migrations**
   ```bash
   # Navigate to database directory
   cd database/migrations
   
   # Run all migrations in order
   # Use Supabase SQL Editor or CLI
   ```

3. **Configure Authentication**
   ```bash
   # Go to Authentication > Providers
   # Enable Google provider
   # Add your Google OAuth credentials
   # Set redirect URL: https://your-domain.vercel.app/closet
   ```

4. **Set up Edge Functions**
   ```bash
   # Deploy push notifications function
   supabase functions deploy push-notifications
   
   # Set environment variables
   supabase secrets set VAPID_PRIVATE_KEY=your_key
   supabase secrets set VAPID_PUBLIC_KEY=your_key
   supabase secrets set VAPID_SUBJECT=mailto:your-email@example.com
   ```

### Step 2: Cloudinary Setup

1. **Create Cloudinary Account**
   ```bash
   # Go to https://cloudinary.com
   # Create free account
   # Note down cloud name
   ```

2. **Configure Upload Preset**
   ```bash
   # Go to Settings > Upload
   # Create unsigned upload preset
   # Set folder: stylesnap
   # Set transformation: auto-format, quality: auto
   ```

### Step 3: Vercel Deployment

1. **Connect GitHub Repository**
   ```bash
   # Go to https://vercel.com
   # Import your GitHub repository
   # Select the repository
   ```

2. **Configure Build Settings**
   ```bash
   # Build Command: npm run build
   # Output Directory: dist
   # Install Command: npm install
   # Node.js Version: 18.x
   ```

3. **Set Environment Variables**
   ```bash
   # In Vercel dashboard, go to Settings > Environment Variables
   # Add all VITE_* variables
   # Set for Production, Preview, and Development
   ```

4. **Deploy**
   ```bash
   # Vercel will automatically deploy
   # Or manually trigger deployment
   # Check deployment logs for any issues
   ```

### Step 4: Post-Deployment Configuration

1. **Update OAuth Redirect URLs**
   ```bash
   # In Google Cloud Console
   # Add your Vercel domain to authorized origins
   # Add redirect URI: https://your-domain.vercel.app/closet
   ```

2. **Test All Features**
   ```bash
   # Test user registration
   # Test item upload
   # Test friend requests
   # Test notifications
   # Test theme switching
   ```

---

## 🔧 Configuration Files

### Vercel Configuration (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "src/pages/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
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
        }
      ]
    }
  ]
}
```

### Vite Configuration (`config/vite.config.js`)
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'supabase': ['@supabase/supabase-js']
        }
      }
    }
  }
})
```

---

## 🗄️ Database Setup

### Migration Order
```bash
# Run migrations in this exact order
001_initial_schema.sql
002_rls_policies.sql
003_indexes_functions.sql
004_advanced_features.sql
005_catalog_system.sql
006_color_detection.sql
007_outfit_generation.sql
008_likes_feature.sql
009_clothing_types.sql
009_enhanced_categories.sql
009_notifications_system.sql
010_push_notifications.sql
011_catalog_enhancements.sql
012_auth_user_sync.sql
014_fix_catalog_insert_policy.sql
015_dev_user_setup.sql
016_disable_auto_contribution.sql
017_fix_catalog_privacy.sql
018_notification_cleanup_system.sql
```

### Key Database Features
- **Row Level Security (RLS)** - Data isolation per user
- **Real-time Subscriptions** - Live updates
- **Custom Functions** - Complex business logic
- **7-Day Notification Retention** - Automatic cleanup
- **Triggers** - Automated data processing

---

## 🔐 Security Configuration

### Supabase Security
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE closet_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for data access
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own closet items" ON closet_items
  FOR SELECT USING (auth.uid() = user_id);
```

### Vercel Security Headers
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        }
      ]
    }
  ]
}
```

---

## 📊 Monitoring and Analytics

### Vercel Analytics
```javascript
// Enable Vercel Analytics
import { Analytics } from '@vercel/analytics/react'

// Add to main.js
app.use(Analytics)
```

### Error Tracking
```javascript
// Add error tracking
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  // Send to your error tracking service
})
```

### Performance Monitoring
```javascript
// Monitor Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

---

## 🧪 Testing Deployment

### Pre-Deployment Checklist
- [ ] All environment variables set
- [ ] Database migrations completed
- [ ] OAuth redirect URLs configured
- [ ] Cloudinary upload preset created
- [ ] Build process successful
- [ ] No console errors

### Post-Deployment Testing
- [ ] User registration works
- [ ] User login works
- [ ] Item upload works
- [ ] Friend requests work
- [ ] Notifications work
- [ ] Theme switching works
- [ ] Mobile responsiveness works

### Performance Testing
```bash
# Test page load times
# Test image upload performance
# Test real-time updates
# Test mobile performance
```

---

## 🔄 Maintenance and Updates

### Regular Maintenance Tasks
```bash
# Clean up expired notifications (daily)
npm run cleanup-notifications

# Monitor Cloudinary usage
# Check Supabase usage
# Review error logs
# Update dependencies
```

### Update Process
```bash
# 1. Update code
git pull origin main

# 2. Run tests
npm test

# 3. Build locally
npm run build

# 4. Deploy to Vercel
# (Automatic if connected to GitHub)

# 5. Test production
# Verify all features work
```

### Database Maintenance
```sql
-- Clean up expired notifications
SELECT cleanup_expired_notifications();

-- Monitor database size
SELECT pg_size_pretty(pg_database_size('stylesnap'));

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

---

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

#### OAuth Issues
```bash
# Check redirect URLs in Google Console
# Verify Supabase auth configuration
# Check environment variables
# Test OAuth flow manually
```

#### Database Issues
```bash
# Check Supabase connection
# Verify RLS policies
# Check migration status
# Review error logs
```

#### Image Upload Issues
```bash
# Check Cloudinary configuration
# Verify upload preset
# Check file size limits
# Test upload manually
```

### Debug Mode
```javascript
// Enable debug mode
localStorage.setItem('debug', 'true')

// Check console for debug logs
// Review network requests
// Check Supabase logs
```

---

## 📈 Performance Optimization

### Frontend Optimization
- **Code Splitting** - Lazy load components
- **Image Optimization** - Compress images before upload
- **Bundle Analysis** - Monitor bundle size
- **Caching** - Implement proper caching strategies

### Backend Optimization
- **Database Indexes** - Optimize query performance
- **Connection Pooling** - Manage database connections
- **CDN** - Use Cloudinary CDN for images
- **Caching** - Cache frequently accessed data

### Monitoring
- **Vercel Analytics** - Track performance metrics
- **Supabase Monitoring** - Monitor database performance
- **Error Tracking** - Track and fix errors
- **User Analytics** - Understand user behavior

---

## 🔮 Future Enhancements

### Planned Features
- **Mobile App** - Native iOS and Android apps
- **Advanced AI** - Enhanced outfit generation
- **Social Features** - Enhanced social interactions
- **Analytics** - Advanced analytics dashboard

### Technical Improvements
- **Performance** - Further optimization
- **Security** - Enhanced security measures
- **Scalability** - Better handling of growth
- **Monitoring** - Advanced monitoring tools

---

This deployment guide provides comprehensive instructions for deploying StyleSnap v2.0.0, ensuring a smooth and successful deployment process.