# StyleSnap 2025

A modern, full-stack fashion styling application built with Vue.js 3, Supabase, and Tailwind CSS. StyleSnap allows users to manage their wardrobe, create outfit combinations, connect with friends, and discover new styles.

## 🚀 Features

### Core Functionality
- **Wardrobe Management**: Upload, organize, and categorize clothing items
- **Outfit Creation**: Build and save outfit combinations with drag-and-drop interface
- **Social Features**: Connect with friends, share outfits, and get style suggestions
- **Search & Discovery**: Advanced search across closet items and outfits
- **Real-time Notifications**: Stay updated with friend requests and outfit interactions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Technical Features
- **Modern UI/UX**: Liquid glass effects with smooth animations
- **Dark/Light Mode**: Automatic theme switching with system preference detection
- **Real-time Updates**: Live data synchronization using Supabase realtime
- **Image Management**: Cloudinary integration for optimized image storage
- **Authentication**: Secure user authentication with Supabase Auth
- **Database**: PostgreSQL with Row-Level Security (RLS)

## 🛠️ Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Fast build tool and development server
- **Vue Router** - Client-side routing
- **Pinia** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Vue Next** - Icon library
- **Motion** - Animation library for liquid glass effects

### Backend & Database
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Relational database
- **Row-Level Security (RLS)** - Database-level security policies
- **Supabase Auth** - Authentication and user management
- **Supabase Realtime** - Real-time data synchronization

### External Services
- **Cloudinary** - Image storage and optimization
- **Vercel** - Deployment platform (optional)

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Supabase Account** - For backend services
- **Cloudinary Account** - For image storage (optional)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sgStyleSnap2025
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration (Optional)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
VITE_CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Database Setup
Run the database migrations in order:

```bash
# Apply all migrations
psql -h your-db-host -U your-username -d your-database -f database/migrations/001_initial_schema.sql
psql -h your-db-host -U your-username -d your-database -f database/migrations/002_auth_setup.sql
# ... continue with all migration files in order
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
sgStyleSnap2025/
├── src/
│   ├── components/           # Reusable Vue components
│   │   ├── cabinet/         # Closet-related components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── friends/         # Social features components
│   │   └── ui/              # Base UI components
│   ├── composables/         # Vue composables for reusable logic
│   │   ├── useAuth.js       # Authentication composable
│   │   ├── useTheme.js      # Theme management
│   │   ├── useLiquidGlass.js # Animation effects
│   │   └── usePopup.js      # Modal/popup management
│   ├── pages/               # Route components
│   │   ├── Home.vue         # Dashboard/home page
│   │   ├── Cabinet.vue      # Closet management
│   │   ├── Outfits.vue      # Outfit creation/management
│   │   ├── Friends.vue      # Social features
│   │   └── Profile.vue      # User profile
│   ├── services/            # API service layers
│   │   ├── authService.js   # Authentication API
│   │   ├── clothesService.js # Wardrobe management API
│   │   ├── outfitsService.js # Outfit management API
│   │   ├── friendsService.js # Social features API
│   │   └── notificationsService.js # Notifications API
│   ├── stores/              # Pinia state management
│   │   ├── auth-store.js    # Authentication state
│   │   └── theme-store.js   # Theme state
│   ├── assets/              # Static assets
│   │   ├── css/             # Global styles
│   │   └── images/          # Image assets
│   └── router/              # Vue Router configuration
├── database/
│   └── migrations/          # Database migration files
├── public/                  # Public static files
└── docs/                    # Documentation files
```

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests (when implemented)
npm run test
```

### Code Style

The project follows Vue.js 3 Composition API patterns with:
- **ESLint** configuration for code quality
- **Prettier** for code formatting (recommended)
- **Vue 3 Composition API** for component logic
- **TypeScript-ready** structure (can be migrated)

## 🗄️ Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Clothes
```sql
CREATE TABLE clothes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  color TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Outfits
```sql
CREATE TABLE outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  outfit_name TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Friends
```sql
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);
```

#### Notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  reference_id UUID,
  custom_message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row-Level Security (RLS)

All tables implement RLS policies to ensure data security:

- **Users**: Can only access their own profile data
- **Clothes**: Users can only access their own clothing items
- **Outfits**: Users can only access their own outfits
- **Friends**: Users can only access their own friend relationships
- **Notifications**: Users can only access notifications sent to them

## 🔍 Search Functionality

### Implementation Overview

The search functionality is implemented consistently across all pages using Vue.js computed properties and reactive filtering.

### Closet Search (Cabinet.vue)
```javascript
const filteredItems = computed(() => {
  let filtered = items.value

  // Apply search filter
  if (searchTerm.value) {
    const query = searchTerm.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.name?.toLowerCase().includes(query) ||
      item.brand?.toLowerCase().includes(query) ||
      item.color?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    )
  }

  // Apply additional filters (category, favorites)
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => item.category === activeCategory.value)
  }

  if (showFavoritesOnly.value) {
    filtered = filtered.filter(item => item.is_favorite)
  }

  return filtered
})
```

### Outfits Search (Outfits.vue)
```javascript
const filteredOutfits = computed(() => {
  let filtered = outfits.value

  // Apply search filter
  if (searchTerm.value) {
    const query = searchTerm.value.toLowerCase()
    filtered = filtered.filter(outfit => 
      outfit.outfit_name?.toLowerCase().includes(query) ||
      outfit.name?.toLowerCase().includes(query) ||
      outfit.description?.toLowerCase().includes(query)
    )
  }

  // Apply favorites filter
  if (activeFilter.value === 'favorites') {
    filtered = filtered.filter(outfit => outfit.is_favorite)
  }

  return filtered
})
```

### Friends Search (Friends.vue)
```javascript
const filteredFriends = computed(() => {
  if (!searchTerm.value) return friends.value
  
  const query = searchTerm.value.toLowerCase()
  return friends.value.filter(friend => 
    friend.name?.toLowerCase().includes(query) ||
    friend.username?.toLowerCase().includes(query)
  )
})
```

### Search Features
- **Real-time Filtering**: Results update as you type
- **Multi-field Search**: Searches across multiple relevant fields
- **Case-insensitive**: Search is not case-sensitive
- **Combined Filters**: Works alongside existing filters (categories, favorites)
- **Empty State Handling**: Shows appropriate messages when no results found

## 🔔 Notification System

### Architecture

The notification system uses Supabase realtime subscriptions and database triggers for automatic notification creation.

### Database Schema
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'friend_request',
    'friend_request_accepted',
    'outfit_shared',
    'friend_outfit_suggestion',
    'outfit_like',
    'item_like'
  )),
  reference_id UUID,
  custom_message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Notification Types
- **friend_request**: New friend request received
- **friend_request_accepted**: Friend request was accepted
- **outfit_shared**: Friend shared an outfit with you
- **friend_outfit_suggestion**: Friend suggested an outfit
- **outfit_like**: Someone liked your outfit
- **item_like**: Someone liked your clothing item

### Service Implementation
```javascript
// notificationsService.js
export class NotificationsService {
  async getNotifications(filters = {}) {
    const { data: { user } } = await supabase.auth.getUser()
    
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })

    if (filters.limit) query = query.limit(filters.limit)
    if (filters.unread_only) query = query.eq('is_read', false)

    const { data, error } = await query
    return data || []
  }

  async subscribe(callback) {
    const { data: { user } } = await supabase.auth.getUser()
    
    return supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${user.id}`
      }, callback)
      .subscribe()
  }
}
```

### Database Triggers
```sql
-- Friend request notification trigger
CREATE OR REPLACE FUNCTION create_friend_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (recipient_id, actor_id, type, reference_id)
  VALUES (NEW.friend_id, NEW.user_id, 'friend_request', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER friend_request_notification_trigger
  AFTER INSERT ON friends
  FOR EACH ROW
  EXECUTE FUNCTION create_friend_request_notification();
```

## 🎨 UI Components

### Design System

The application uses a consistent design system with:

#### Color Palette
- **Light Mode**: White backgrounds, black text, stone/zinc grays
- **Dark Mode**: Black backgrounds, white text, zinc grays
- **Accent Colors**: Brand-specific accent colors for interactive elements

#### Typography
- **Headings**: Bold, large text for page titles and section headers
- **Body Text**: Regular weight for content
- **Captions**: Smaller, muted text for secondary information

#### Components
- **Cards**: Rounded corners, subtle borders, hover effects
- **Buttons**: Consistent styling with hover states and transitions
- **Inputs**: Clean, accessible form elements
- **Modals**: Overlay dialogs with backdrop blur effects

### Liquid Glass Effects

The application features custom liquid glass animations using the Motion library:

```javascript
// useLiquidGlass.js
export function useLiquidHover() {
  const hoverIn = async () => {
    await loadMotionOne()
    
    if (animate && elementRef.value) {
      animate(elementRef.value, {
        scale: 1.05,
        rotateX: 5,
        rotateY: 5,
        filter: 'blur(0px) brightness(1.1)'
      }, {
        duration: 0.3,
        easing: spring({ stiffness: 300, damping: 30 })
      })
    }
  }
}
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add all required environment variables in Vercel dashboard
3. **Build Settings**: 
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_CLOUDINARY_CLOUD_NAME=your_production_cloudinary_name
VITE_CLOUDINARY_API_KEY=your_production_cloudinary_key
VITE_CLOUDINARY_API_SECRET=your_production_cloudinary_secret
```

### Database Migration for Production
```bash
# Run migrations on production database
psql -h production-db-host -U production-user -d production-db -f database/migrations/001_initial_schema.sql
# ... continue with all migrations
```

## 🧪 Testing

### Current Status
- **Unit Tests**: Not yet implemented
- **Integration Tests**: Not yet implemented
- **E2E Tests**: Not yet implemented

### Planned Testing Strategy
- **Unit Tests**: Jest + Vue Test Utils for component testing
- **Integration Tests**: API service testing with mock data
- **E2E Tests**: Playwright for full user journey testing

## 📚 API Documentation

### Authentication Endpoints
```javascript
// authService.js
class AuthService {
  async signUp(email, password, userData) {
    // Creates new user account
  }
  
  async signIn(email, password) {
    // Authenticates user
  }
  
  async signOut() {
    // Signs out current user
  }
  
  async getCurrentUser() {
    // Returns current authenticated user
  }
}
```

### Clothes Management
```javascript
// clothesService.js
class ClothesService {
  async getClothes(userId) {
    // Returns user's clothing items
  }
  
  async addClothingItem(itemData) {
    // Adds new clothing item
  }
  
  async updateClothingItem(itemId, updates) {
    // Updates existing clothing item
  }
  
  async deleteClothingItem(itemId) {
    // Removes clothing item
  }
}
```

### Outfit Management
```javascript
// outfitsService.js
class OutfitsService {
  async getOutfits(userId) {
    // Returns user's outfits
  }
  
  async createOutfit(outfitData) {
    // Creates new outfit
  }
  
  async updateOutfit(outfitId, updates) {
    // Updates existing outfit
  }
  
  async deleteOutfit(outfitId) {
    // Removes outfit
  }
}
```

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- Follow Vue.js 3 Composition API patterns
- Use ESLint configuration provided
- Write clear, descriptive commit messages
- Add comments for complex logic
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

#### Build Errors
- Ensure all dependencies are installed: `npm install`
- Check environment variables are properly set
- Verify database migrations are applied

#### Runtime Errors
- Check browser console for detailed error messages
- Verify Supabase connection and authentication
- Ensure Cloudinary credentials are correct (if using image uploads)

#### Performance Issues
- Check network tab for slow API calls
- Verify database queries are optimized
- Consider implementing pagination for large datasets

### Getting Help
- **Issues**: Create a GitHub issue with detailed description
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check this README and inline code comments

## 🔄 Changelog

### Version 1.0.0 (Current)
- ✅ Initial release with core functionality
- ✅ Wardrobe management system
- ✅ Outfit creation and management
- ✅ Social features (friends, sharing)
- ✅ Search functionality across all pages
- ✅ Real-time notifications
- ✅ Responsive design with dark/light mode
- ✅ Liquid glass animations

### Planned Features
- 🔄 Advanced outfit recommendations
- 🔄 Weather-based outfit suggestions
- 🔄 Style trend analysis
- 🔄 Mobile app (React Native)
- 🔄 AI-powered style matching
- 🔄 Social feed and discovery

---

**StyleSnap 2025** - Where fashion meets technology! 🎨✨