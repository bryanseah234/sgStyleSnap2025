# StyleSnap Vue 3 Setup Guide

## 🚀 Quick Start

Your React app has been successfully converted to Vue 3! Here's how to get it running:

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Google OAuth (Optional - handled by Supabase)
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Weather API (Optional)
VITE_OPENWEATHER_API_KEY=your_openweather_api_key

# App Configuration
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
VITE_APP_URL=http://localhost:5173
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## 🔄 What Was Converted

### From React to Vue 3:
- ✅ `package.json` - Updated dependencies
- ✅ `vite.config.js` - Vue plugin instead of React
- ✅ `index.html` - Vue root element
- ✅ `src/main.js` - Vue 3 entry point
- ✅ `src/App.vue` - Main app component
- ✅ `src/components/Layout.vue` - Navigation layout
- ✅ `src/pages/` - All page components converted
- ✅ `src/composables/useTheme.js` - Theme management
- ✅ `vercel.json` - Updated for Vue deployment

### Key Features Preserved:
- 🎨 Dark/Light theme switching
- 📱 Responsive design (mobile + desktop)
- 🧭 Navigation with active states
- 📦 Local storage API client
- 🎯 Component structure maintained
- 🎨 Tailwind CSS styling

## 🚀 Deploy to Vercel

1. **Connect to GitHub**: Push your code to GitHub
2. **Import to Vercel**: Go to [vercel.com](https://vercel.com) and import your repository
3. **Set Environment Variables**: Add all your `VITE_*` variables in Vercel dashboard
4. **Deploy**: Vercel will automatically build and deploy your Vue 3 app

## 📁 Project Structure

```
src/
├── components/
│   └── Layout.vue          # Main navigation layout
├── pages/
│   ├── Home.vue           # Dashboard/home page
│   ├── Cabinet.vue        # Wardrobe management
│   ├── Dashboard.vue      # Outfit studio (placeholder)
│   ├── Friends.vue        # Social features (placeholder)
│   ├── Profile.vue        # User profile
│   └── FriendCabinet.vue  # Friend's wardrobe (placeholder)
├── composables/
│   └── useTheme.js        # Theme management
├── api/
│   └── client.js          # Local storage API
├── utils/
│   └── index.jsx          # Utility functions
├── App.vue                # Main app component
└── main.js                # Vue 3 entry point
```

## 🎯 Next Steps

1. **Set up Supabase**: Follow the database migration guide in `docs/database/migrations/`
2. **Configure OAuth**: Set up Google OAuth in Supabase dashboard
3. **Set up Cloudinary**: Configure image uploads
4. **Add Real API**: Replace the local storage API with Supabase calls
5. **Implement Features**: Complete the placeholder pages (Dashboard, Friends, etc.)

## 🆘 Troubleshooting

### Build Issues
- Make sure all dependencies are installed: `npm install`
- Check that all environment variables are set
- Verify Vue 3 syntax in components

### Runtime Issues
- Check browser console for errors
- Verify API client is working
- Test theme switching functionality

## 📚 Documentation

Check the `docs/` folder for comprehensive guides:
- `docs/deployment/DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `docs/guides/CREDENTIALS_SETUP.md` - Environment setup
- `docs/database/` - Database migration files

Your Vue 3 app is now ready to deploy! 🎉
