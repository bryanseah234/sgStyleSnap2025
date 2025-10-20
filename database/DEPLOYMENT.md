# StyleSnap Deployment Guide

This guide will walk you through deploying StyleSnap to Vercel with Supabase backend.

## 🚀 Quick Deployment

### Prerequisites
- GitHub account
- Vercel account
- Supabase account
- Google Cloud Console account

### Step 1: Set up Supabase

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and enter project details

2. **Run database migrations**
   - Go to SQL Editor in your Supabase dashboard
   - Run the following files in order:
     ```
     database/migrations/001_initial_schema.sql
     database/migrations/002_rls_policies.sql
     database/migrations/021_seed_data.sql
     ```

3. **Configure Google OAuth**
   - Go to Authentication > Providers
   - Enable Google provider
   - You'll need Google OAuth credentials (see Step 2)

### Step 2: Set up Google OAuth

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one

2. **Enable APIs**
   - Go to APIs & Services > Library
   - Enable "Google+ API" and "People API"

3. **Create OAuth Credentials**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: Web application
   - Add authorized redirect URIs:
     ```
     https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
     http://localhost:5173/auth/callback (for development)
     ```

4. **Configure OAuth Consent Screen**
   - Go to APIs & Services > OAuth consent screen
   - Choose "External" user type
   - Fill in required fields
   - Add test users for development

5. **Add credentials to Supabase**
   - Copy Client ID and Client Secret
   - Paste them in Supabase Authentication > Providers > Google

### Step 3: Set up Cloudinary (Optional)

1. **Create Cloudinary account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free account

2. **Get credentials**
   - Note your Cloud Name
   - Create an upload preset (Settings > Upload > Upload presets)

### Step 4: Deploy to Vercel

1. **Connect repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure environment variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add the following variables:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-cloudinary-upload-preset
   VITE_OPENWEATHER_API_KEY=your-openweather-api-key
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Step 5: Update Google OAuth Settings

1. **Add production redirect URI**
   - Go back to Google Cloud Console
   - Edit your OAuth 2.0 Client ID
   - Add your Vercel domain:
     ```
     https://your-app.vercel.app/auth/callback
     ```

2. **Update Supabase Site URL**
   - Go to Supabase > Settings > General
   - Update Site URL to your Vercel domain

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789-abc.apps.googleusercontent.com` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `my-cloud` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset | `stylesnap-uploads` |
| `VITE_OPENWEATHER_API_KEY` | OpenWeather API key | `abc123def456` |

## 🗄️ Database Configuration

### Tables Created

- `users` - User profiles
- `clothes` - Clothing items
- `outfits` - Outfit collections
- `outfit_items` - Outfit-item relationships
- `friends` - Friend relationships
- `friend_requests` - Friend request management
- `notifications` - User notifications
- `activities` - Activity feed
- `categories` - Clothing categories
- `brands` - Clothing brands
- `colors` - Color palette
- `styles` - Style tags

### Row Level Security

All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Friends can view each other's public content
- Proper authentication checks for all operations

## 🔐 Security Checklist

- [ ] Supabase RLS policies enabled
- [ ] Google OAuth properly configured
- [ ] Environment variables secured
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Input validation implemented

## 📊 Monitoring

### Supabase Dashboard
- Monitor database performance
- Check authentication logs
- Review API usage

### Vercel Analytics
- Track page views
- Monitor performance
- Check error rates

### Google Cloud Console
- Monitor OAuth usage
- Check API quotas
- Review security logs

## 🚨 Troubleshooting

### Common Issues

1. **OAuth redirect mismatch**
   - Ensure redirect URIs match exactly
   - Check both Google Console and Supabase settings

2. **Database connection errors**
   - Verify Supabase URL and keys
   - Check RLS policies

3. **Build failures**
   - Check environment variables
   - Verify all dependencies are installed

4. **Image upload issues**
   - Verify Cloudinary credentials
   - Check upload preset configuration

### Debug Mode

Enable debug mode by adding to environment variables:
```env
VITE_DEBUG=true
```

## 🔄 Updates and Maintenance

### Database Migrations
- Always backup before running migrations
- Test migrations in staging environment
- Use Supabase CLI for complex migrations

### Dependency Updates
- Regularly update npm packages
- Test thoroughly after updates
- Monitor for breaking changes

### Security Updates
- Keep Supabase and Vercel updated
- Monitor security advisories
- Regular security audits

## 📈 Performance Optimization

### Frontend
- Enable Vercel's edge functions
- Use image optimization
- Implement proper caching

### Backend
- Monitor database performance
- Optimize queries
- Use Supabase's built-in caching

### CDN
- Use Cloudinary's image transformations
- Implement proper cache headers
- Optimize image formats

## 🎯 Production Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] OAuth properly configured
- [ ] SSL certificates valid
- [ ] Error monitoring enabled
- [ ] Performance monitoring set up
- [ ] Backup strategy implemented
- [ ] Security audit completed

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review Supabase and Vercel documentation
3. Open an issue in the repository

---

**Your StyleSnap app should now be live and ready to use! 🎉**
