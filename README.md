# StyleSnap - Digital Closet & Social Fashion Platform

A modern, full-stack digital wardrobe application built with Vue 3, Supabase, and Tailwind CSS. StyleSnap combines personal wardrobe management with social features, AI-powered outfit suggestions, and advanced analytics.

## 🌟 Features

### Core Functionality
- **Digital Closet Management** - Upload, organize, and manage personal clothing items
- **AI-Powered Outfit Generation** - Get intelligent outfit suggestions based on weather, occasion, and personal style
- **Social Fashion Network** - Connect with friends, share outfits, and get suggestions
- **Real-time Notifications** - Stay updated with friend activities and suggestions
- **Advanced Analytics** - Track wardrobe usage, seasonal trends, and style preferences

### Technical Features
- **7-Day Notification Retention** - Automatic cleanup system for optimal performance
- **Multi-Theme Support** - Light and dark themes with system preference detection
- **Session Management** - Secure user session handling with Google OAuth
- **Responsive Design** - Mobile-first design with desktop optimization
- **PWA Support** - Progressive Web App capabilities
- **Real-time Updates** - Live data synchronization across devices

## 🚀 Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vue Router** - Client-side routing
- **Pinia** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Vue** - Beautiful icons
- **Vite** - Build tool and dev server

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication (Google OAuth)
  - Real-time subscriptions
  - Row Level Security (RLS)
- **Cloudinary** - Image CDN and management

### Deployment
- **Vercel** - Frontend deployment
- **Supabase Cloud** - Backend hosting

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stylesnap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Cloudinary Configuration
   VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-cloudinary-upload-preset

   # Google OAuth Configuration
   VITE_GOOGLE_CLIENT_ID=your-google-client-id

   # Optional: Weather API
   VITE_OPENWEATHER_API_KEY=your-openweather-api-key
   ```

4. **Set up the database**
   ```bash
   # Run the SQL migrations in your Supabase dashboard
   # Files: sql/001_initial_schema.sql, sql/002_rls_policies.sql, sql/003_seed_data.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

1. **Create a new Supabase project**
2. **Run the SQL migrations in order:**
   - `sql/001_initial_schema.sql` - Creates all tables and relationships
   - `sql/002_rls_policies.sql` - Sets up Row Level Security
   - `sql/003_seed_data.sql` - Inserts initial data (categories, colors, styles, brands)

3. **Configure Google OAuth in Supabase:**
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials

## 🎨 Project Structure

```
src/
├── api/                 # API client and services
├── components/          # Reusable Vue components
│   ├── ui/             # Base UI components
│   ├── cabinet/        # Wardrobe-specific components
│   └── dashboard/      # Outfits components
├── composables/        # Vue composables (useTheme, etc.)
├── lib/                # Utility libraries
├── pages/              # Page components
├── services/           # Backend service classes
└── utils/              # Helper functions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🌐 Deployment

### Vercel Deployment

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

The `vercel.json` configuration is already set up for optimal deployment.

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_OPENWEATHER_API_KEY` (optional)

## 🔐 Authentication

StyleSnap uses Google OAuth exclusively for authentication:

1. **Set up Google OAuth in Google Cloud Console**
2. **Configure redirect URIs:**
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://your-domain.vercel.app/auth/callback`
   - Supabase: `https://your-project.supabase.co/auth/v1/callback`

3. **Add credentials to Supabase Authentication settings**

## 📱 Features Overview

### Digital Closet
- Upload clothing items with images
- Categorize by type, brand, color, style
- Mark favorites and add notes
- Search and filter items

### Outfits
- Drag-and-drop outfit creation
- AI-powered outfit suggestions
- Weather-based recommendations
- Save and share outfits

### Social Features
- Add friends and view their wardrobes
- Share outfits with friends
- Activity feed
- Like and comment on outfits

### Analytics
- Wardrobe statistics
- Style insights
- Usage analytics
- Color and brand analysis

## 🎯 Key Components

### Pages
- **Home** - Dashboard with stats and quick actions
- **Cabinet** - Wardrobe management
- **Dashboard** - Outfits with AI generation
- **Friends** - Social features and friend management
- **Profile** - User settings and preferences
- **Login** - Google OAuth authentication

### Services
- **AuthService** - Authentication and user management
- **ClothesService** - Wardrobe item management
- **OutfitsService** - Outfit creation and AI generation
- **FriendsService** - Social features
- **NotificationsService** - Real-time notifications
- **AnalyticsService** - Data insights and statistics
- **WeatherService** - Weather-based recommendations

## 🔒 Security

- **Row Level Security (RLS)** - Database-level access control
- **Google OAuth** - Secure authentication
- **Environment Variables** - Sensitive data protection
- **Input Validation** - Client and server-side validation
- **CORS Configuration** - Proper cross-origin setup

## 🚀 Performance

- **Vite Build** - Fast development and optimized builds
- **Image Optimization** - Cloudinary CDN integration
- **Lazy Loading** - Component and route-based code splitting
- **Real-time Updates** - Efficient Supabase subscriptions
- **Caching** - Smart data caching strategies

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ using Vue 3, Supabase, and modern web technologies.**