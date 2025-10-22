# StyleSnap - Digital Closet & Social Fashion Platform

**Version 3.0.0** - Complete Outfit Management System

A modern, full-stack digital wardrobe application built with Vue 3, Supabase, and Tailwind CSS. StyleSnap combines personal wardrobe management with social features, AI-powered outfit suggestions, and an interactive canvas-based outfit creation system.

## 🌟 Features

### 🎨 Core Functionality
- **Digital Closet Management** - Upload, organize, and manage personal clothing items with category-based organization
- **Interactive Outfit Canvas** - Drag-and-drop 600px canvas for creating outfits with full editing controls (scale, rotate, layer)
- **AI-Powered Outfit Suggestions** - Auto-generated outfit suggestions with smart category-based positioning
- **Friend Outfit Creation** - Create outfit suggestions for friends using items from their closet
- **Outfit Gallery** - Visual gallery of saved outfits with preview images, filters, and quick edit/delete actions
- **Edit Outfits** - Full editing mode for existing outfits with preserved transformations
- **Social Fashion Network** - Connect with friends, share outfits, receive/send outfit suggestions
- **Real-time Notifications** - Comprehensive notification system for friend requests, outfit suggestions, likes, and social interactions
- **Personalized Dashboard** - Welcome message with user's name, stats cards, and notifications overview

### ⚡ Technical Features
- **Interactive Canvas System** - 600px canvas with 128x128px items, grid overlay, undo/redo (50 steps)
- **7-Day Notification Retention** - Automatic cleanup system for optimal performance
- **Multi-Theme Support** - Light and dark modes with custom color schemes and 6 font styles
- **Google OAuth Authentication** - Secure authentication with profile synchronization
- **Session Management** - Persistent login sessions with theme preferences
- **Terms of Service & Privacy Policy** - Comprehensive legal documents in dismissible modals
- **Responsive Design** - Mobile-first design with desktop optimization
- **Row-Level Security** - Database-level access control and privacy
- **Real-time Updates** - Live data synchronization across devices via Supabase

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
   # Files: database/migrations/001_initial_schema.sql, database/migrations/002_rls_policies.sql, etc.
   # Or use the migration script: node scripts/run-migrations.js
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

1. **Create a new Supabase project**
2. **Run the SQL migrations in order:**
   - Use the migration script: `node scripts/run-migrations.js` (recommended)
   - Or manually run files from `database/migrations/` folder:
     - `001_initial_schema.sql` - Creates all tables and relationships
     - `002_rls_policies.sql` - Sets up Row Level Security
     - `021_seed_data.sql` - Inserts initial data (categories, colors, styles, brands)

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
│   ├── TermsOfServiceModal.vue  # TOS modal
│   ├── PrivacyPolicyModal.vue   # Privacy policy modal
│   └── ThemeToggle.vue          # Theme switcher
├── composables/        # Vue composables (useTheme, etc.)
├── lib/                # Utility libraries
├── pages/              # Page components
│   ├── Home.vue        # Dashboard with notifications
│   ├── Cabinet.vue     # Closet management
│   ├── Outfits.vue     # Outfit gallery
│   ├── OutfitCreator.vue  # Canvas for outfit creation
│   ├── Friends.vue     # Friend management
│   ├── Profile.vue     # User profile
│   └── Login.vue       # Authentication
├── services/           # Backend service classes
│   ├── AuthService.js  # Authentication
│   ├── ClothesService.js  # Closet items
│   ├── OutfitsService.js  # Outfits CRUD
│   ├── FriendsService.js  # Friend management
│   └── NotificationsService.js  # Notifications
└── utils/              # Helper functions

docs/
├── features/           # Feature-specific documentation
│   ├── AI_OUTFIT_SUGGESTIONS.md
│   ├── FRIEND_OUTFIT_CREATION.md
│   ├── EDIT_OUTFIT.md
│   └── FRIEND_NOTIFICATIONS.md
├── guides/             # How-to guides
├── FEATURE_OVERVIEW.md # Complete feature list
├── ROUTES.md           # All application routes
├── CHANGELOG.md        # Version history
└── README.md           # Documentation hub

database/
└── migrations/         # SQL migration files
    ├── 020_add_outfits_table.sql
    ├── 027_friend_notifications.sql
    └── ...
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

### 👔 Digital Closet
- Upload clothing items with images
- Categorize by type (tops, bottoms, shoes, accessories, outerwear)
- Mark favorites and add notes
- Search and filter items
- Category-based organization
- View friend's closets

### 👗 Outfit System (NEW v3.0)
- **Interactive Canvas** - 600px drag-and-drop canvas with grid overlay
- **Personal Creation** - Create outfits using your own items
- **AI Suggestions** - Auto-generated outfits with smart positioning
- **Friend Suggestions** - Create outfits for friends using their items
- **Edit Mode** - Full editing of saved outfits
- **Gallery View** - Visual grid of all saved outfits
- **Canvas Controls**:
  - Scale items (zoom in/out)
  - Rotate items (15° increments)
  - Layer items (z-index)
  - Delete items
  - Undo/Redo (50 steps)
  - Grid toggle
  - Clear canvas

### 👥 Social Features
- Add friends and manage connections
- View friend's closets and profiles
- Create outfit suggestions for friends
- Share outfits with friends
- Like items and outfits
- Real-time notifications for:
  - Friend requests (sent/received)
  - Friend request accepted
  - Outfit shared
  - Friend outfit suggestions
  - Outfit and item likes

### 🔔 Notifications
- Comprehensive notification system
- Displayed on home page
- Unread count badges
- Mark as read functionality
- 7-day auto-cleanup
- Database triggers for automatic creation
- Support for:
  - Friend requests
  - Outfit suggestions
  - Outfit/item likes
  - System updates

## 🎯 Key Components

### Pages
- **Home** (`/home`) - Dashboard with stats, welcome message, and notifications
- **Closet** (`/closet`) - Wardrobe management and item gallery
- **Outfits** (`/outfits`) - Outfit gallery with filter options
- **OutfitCreator** (`/outfits/add/*`) - Interactive canvas for outfit creation
  - `/outfits/add/personal` - Personal outfit creation
  - `/outfits/add/suggested` - AI outfit suggestions
  - `/outfits/add/friend/:username` - Friend outfit creation
  - `/outfits/edit/:outfitId` - Edit existing outfit
- **Friends** (`/friends`) - Social features and friend management
- **Profile** (`/profile`) - User settings and preferences
- **Login** (`/login`) - Google OAuth authentication with legal modals

### Services
- **AuthService** - Authentication and user management
- **ClothesService** - Wardrobe item CRUD operations
- **OutfitsService** - Outfit creation, update, delete, and retrieval
- **FriendsService** - Friend connections and management
- **NotificationsService** - Notification creation, retrieval, and management
- **ThemeService** - Theme management and preferences

### Components
- **TermsOfServiceModal** - Terms of Service legal document
- **PrivacyPolicyModal** - Privacy Policy legal document
- **ThemeToggle** - Light/dark mode switcher
- **Navbar** - Main navigation
- **Various UI Components** - Buttons, cards, modals, etc.

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

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Feature Overview](docs/FEATURE_OVERVIEW.md)** - Complete feature list (v3.0.0)
- **[Routes Guide](docs/ROUTES.md)** - All application routes and navigation
- **[Changelog](docs/CHANGELOG.md)** - Version history and updates
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Code organization

### New Features Documentation (v3.0.0)
- **[AI Outfit Suggestions](docs/features/AI_OUTFIT_SUGGESTIONS.md)** - Auto-generated outfits
- **[Friend Outfit Creation](docs/features/FRIEND_OUTFIT_CREATION.md)** - Create outfits for friends
- **[Edit Outfit](docs/features/EDIT_OUTFIT.md)** - Edit existing outfits
- **[Friend Notifications](docs/features/FRIEND_NOTIFICATIONS.md)** - Notification system

### Guides
- **[Authentication Guide](docs/guides/AUTHENTICATION_GUIDE.md)** - OAuth setup
- **[Database Guide](docs/guides/DATABASE_GUIDE.md)** - Database schema and management
- **[User Flows](docs/guides/USER_FLOWS.md)** - User experience flows

## 🎉 What's New in v3.0.0

### Major Features
- ✨ **Interactive Outfit Canvas** - Drag-and-drop canvas with full editing controls
- 🤖 **AI Outfit Suggestions** - Auto-generated outfits with smart positioning
- 👥 **Friend Outfit Creation** - Create outfit suggestions for friends
- ✏️ **Edit Mode** - Full editing capability for existing outfits
- 🖼️ **Outfit Gallery** - Visual grid display of saved outfits
- 🔔 **Enhanced Notifications** - Comprehensive notification system
- 📜 **Legal Compliance** - Terms of Service and Privacy Policy modals
- 👋 **Personalized Dashboard** - Welcome message with user's name

### Technical Improvements
- Canvas system with transform controls
- Undo/Redo history (50 steps)
- Database triggers for notifications
- Enhanced RLS policies
- Custom scrollbar styling
- Improved responsive design

See [CHANGELOG.md](docs/CHANGELOG.md) for complete details.

## 📞 Support

For support and questions:
- **Documentation**: Check the `docs/` directory
- **Issues**: Open an issue in the repository
- **Guides**: Refer to specific guides in `docs/guides/`

---

**Version 3.0.0** - Built with ❤️ using Vue 3, Supabase, and modern web technologies.

**Last Updated**: October 22, 2025