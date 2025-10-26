# LLM Agent Guide for StyleSnap

**Version:** 2.0.0  
**Last Updated:** January 2025

This guide is designed for LLM agents to understand and work with the StyleSnap codebase effectively. It provides comprehensive information about the current state, architecture, and capabilities of the application.

---

## 🎯 Project Overview

**StyleSnap** is a modern digital closet and social fashion platform built with Vue.js 3, Supabase, and AI-powered features. The application allows users to manage their wardrobe, get AI-powered outfit suggestions, connect with friends, and share fashion inspiration.

### Current Version: 2.0.0 (January 2025)

---

## 🏗️ Architecture Overview

### Frontend Stack
- **Vue.js 3** with Composition API
- **Pinia** for state management
- **Vue Router** for navigation
- **Tailwind CSS** for styling
- **Vite** for build tooling

### Backend Stack
- **Supabase** for database and authentication
- **Cloudinary** for image management
- **Google OAuth** for authentication
- **Real-time subscriptions** for live updates

### AI/ML Components
- **FashionRNN** for clothing classification
- **Color detection** algorithms
- **Outfit generation** AI
- **Weather integration** for contextual suggestions

---

## 📁 Key Directories and Their Purpose

### `src/components/` - UI Components
- **18 UI components** in `ui/` directory
- **6 notification components** in `notifications/`
- **8 social components** in `social/`
- **4 analytics components** in `analytics/`
- **4 catalog components** in `catalog/`
- **8 closet components** in `closet/`

### `src/pages/` - Application Pages
- **15 main pages** including Closet, Friends, Notifications, Settings
- **Authentication pages** (Login, Register, SessionConfirmation)
- **Feature pages** (Analytics, OutfitGenerator, Suggestions)

### `src/services/` - Business Logic
- **20+ service files** handling API calls and business logic
- **Authentication service** with Google OAuth
- **Notification service** with 7-day retention
- **AI services** for outfit generation and color detection

### `src/stores/` - State Management
- **15+ Pinia stores** for different features
- **Centralized state management** for all application data
- **Real-time updates** through Supabase subscriptions

---

## 🔧 Current Features and Capabilities

### Core Features
1. **Digital Closet Management**
   - Upload and organize personal clothing items
   - 50-item upload quota per user
   - Unlimited catalog item additions
   - Image compression and optimization

2. **AI-Powered Outfit Generation**
   - Weather-based outfit suggestions
   - Occasion-specific recommendations
   - Personal style learning
   - Manual outfit creation tools

3. **Social Features**
   - Friend connections and management
   - Outfit sharing and suggestions
   - Like system for items and outfits
   - Real-time notifications

4. **Advanced Analytics**
   - Wardrobe usage tracking
   - Seasonal breakdown
   - Most worn items analysis
   - Style preference insights

5. **Theme Customization**
   - 6 color themes (Purple, Blue, Green, Pink, Orange, Indigo)
   - 6 font styles (Open Sans, Inter, Roboto, Poppins, Nunito, Lato)
   - Light and dark mode support
   - Persistent user preferences

### Technical Features
1. **7-Day Notification Retention System**
   - Automatic cleanup of expired notifications
   - Extended visibility for acted-upon notifications
   - Database-level retention policies

2. **Session Management**
   - Google OAuth authentication
   - Session persistence and switching
   - Single-user enforcement

3. **Real-time Updates**
   - Live notification updates
   - Real-time friend activity
   - Instant UI updates

4. **Mobile-First Design**
   - Responsive layout system
   - Touch-friendly interactions
   - PWA capabilities

---

## 🗄️ Database Schema

### Key Tables
- **`users`** - User profiles and preferences
- **`closet_items`** - Personal clothing items
- **`catalog_items`** - Public clothing catalog
- **`friends`** - Friend relationships
- **`notifications`** - User notifications with retention
- **`outfits`** - Generated and saved outfits
- **`collections`** - User-created collections

### Recent Schema Updates
- **Notification cleanup system** (Migration 018)
- **Enhanced privacy controls** (Migration 017)
- **Catalog system improvements** (Migration 011)
- **Push notifications** (Migration 010)

---

## 🔌 API Endpoints and Services

### Authentication
- **Google OAuth** integration
- **Session management** with automatic refresh
- **User profile** management

### Core Services
- **Closet Service** - Personal item management
- **Catalog Service** - Public item browsing
- **Friends Service** - Social connections
- **Notifications Service** - Real-time notifications
- **Outfit Service** - Outfit generation and management

### AI Services
- **FashionRNN Service** - Clothing classification
- **Color Detection Service** - Automatic color detection
- **Outfit Generator Service** - AI-powered suggestions

---

## 🎨 UI/UX System

### Design System
- **Tailwind CSS** for styling
- **Custom CSS variables** for theming
- **Component-based architecture**
- **Consistent spacing and typography**

### Theme System
- **6 color themes** with light/dark variants
- **6 font families** with complete weight sets
- **CSS custom properties** for dynamic theming
- **User preference persistence**

### Responsive Design
- **Mobile-first approach**
- **Breakpoint system** (sm, md, lg, xl)
- **Touch-friendly interactions**
- **Optimized for all screen sizes**

---

## 🧪 Testing and Quality

### Test Structure
- **Unit tests** for stores and services
- **Integration tests** for API endpoints
- **E2E tests** for user flows
- **Component tests** for UI components

### Code Quality
- **ESLint** for code linting
- **Prettier** for code formatting
- **Vue-specific linting rules**
- **Consistent code standards**

---

## 🚀 Deployment and Infrastructure

### Current Deployment
- **Vercel** for frontend hosting
- **Supabase** for backend services
- **Cloudinary** for image storage
- **GitHub** for version control

### Environment Configuration
- **Environment variables** for API keys
- **Build configuration** with Vite
- **Production optimizations**
- **CDN integration**

---

## 🔧 Development Workflow

### Getting Started
1. **Clone repository**
2. **Install dependencies** (`npm install`)
3. **Set up environment variables**
4. **Run database migrations**
5. **Start development server** (`npm run dev`)

### Available Scripts
- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm run test`** - Run test suite
- **`npm run lint`** - Lint code
- **`npm run cleanup-notifications`** - Clean up expired notifications

### Code Organization
- **Feature-based structure** in components
- **Service layer** for business logic
- **Store layer** for state management
- **Utility functions** for common operations

---

## 🐛 Common Issues and Solutions

### Authentication Issues
- **OAuth redirect problems** - Check redirect URLs in Google Console
- **Session persistence** - Verify localStorage and sessionStorage
- **Token refresh** - Check Supabase auth configuration

### Database Issues
- **RLS policies** - Verify row-level security policies
- **Migration errors** - Check migration order and dependencies
- **Connection issues** - Verify Supabase credentials

### UI/UX Issues
- **Theme not applying** - Check CSS custom properties
- **Responsive problems** - Verify Tailwind classes
- **Component not rendering** - Check Vue component structure

---

## 📈 Performance Considerations

### Optimization Strategies
- **Image compression** before upload
- **Lazy loading** for large lists
- **Debounced search** for better UX
- **Efficient state management** with Pinia

### Monitoring
- **Performance metrics** tracking
- **Error logging** and reporting
- **User analytics** and insights
- **Database query optimization**

---

## 🔮 Future Enhancements

### Planned Features
- **Advanced AI recommendations**
- **Social feed improvements**
- **Enhanced analytics**
- **Mobile app development**

### Technical Improvements
- **Performance optimizations**
- **Accessibility enhancements**
- **Testing coverage expansion**
- **Documentation updates**

---

## 📚 Key Documentation Files

### Essential Reading
- **`PROJECT_STRUCTURE.md`** - Complete project overview
- **`API_GUIDE.md`** - API documentation
- **`DATABASE_GUIDE.md`** - Database management
- **`CODE_STANDARDS.md`** - Development standards

### Feature-Specific Guides
- **`CLOSET_GUIDE.md`** - Closet management
- **`SOCIAL_GUIDE.md`** - Social features
- **`NOTIFICATIONS_GUIDE.md`** - Notification system
- **`OUTFIT_GENERATION_GUIDE.md`** - AI outfit generation

---

## 🤖 LLM Agent Best Practices

### When Working with This Codebase
1. **Always check the current state** - The codebase is actively maintained
2. **Follow existing patterns** - Maintain consistency with current architecture
3. **Test thoroughly** - Ensure changes don't break existing functionality
4. **Update documentation** - Keep docs in sync with code changes
5. **Consider performance** - Optimize for the 50-item quota and real-time updates

### Common Tasks
- **Adding new features** - Follow the component-service-store pattern
- **Fixing bugs** - Check logs and error handling first
- **Optimizing performance** - Focus on image handling and state management
- **Improving UX** - Consider mobile-first and accessibility

### Code Quality Standards
- **Use TypeScript-style JSDoc** for better IDE support
- **Follow Vue 3 Composition API** patterns
- **Implement proper error handling** throughout
- **Write comprehensive tests** for new features
- **Maintain consistent naming** conventions

---

This guide provides a comprehensive overview of the StyleSnap codebase for LLM agents to understand and work with the application effectively.