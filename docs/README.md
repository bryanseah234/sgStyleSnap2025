# StyleSnap Documentation

Welcome to the StyleSnap documentation hub. This directory contains comprehensive documentation for all aspects of the StyleSnap application - a modern digital closet and social fashion platform.

## 🎯 Project Overview

**StyleSnap** is a comprehensive digital closet application that combines personal wardrobe management with social features, AI-powered outfit suggestions, and advanced analytics. Built with Vue.js 3, Supabase, and modern web technologies.

### 🌟 Key Features (Version 3.0.0)

#### Core Functionality
- **Digital Closet Management** - Upload, organize, and manage personal clothing items with category-based organization
- **Interactive Outfit Canvas** - Drag-and-drop canvas for creating outfits with full editing controls (scale, rotate, layer)
- **AI-Powered Outfit Suggestions** - Auto-generated outfit suggestions with smart item selection and positioning
- **Friend Outfit Creation** - Create outfit suggestions for friends using items from their closet
- **Outfit Gallery** - Visual gallery of saved outfits with preview images, filters, and quick actions
- **Edit Outfits** - Full editing capability for existing outfits with preserved transformations
- **Social Fashion Network** - Connect with friends, share outfits, and receive/send outfit suggestions
- **Real-time Notifications** - Comprehensive notification system for friend requests, outfit suggestions, and social interactions
- **Personalized Dashboard** - Welcome message, stats cards, and notifications overview on home page

#### Technical Features
- **Interactive Canvas System** - 600px canvas with 128x128px items, grid overlay, undo/redo (50 steps)
- **7-Day Notification Retention** - Automatic cleanup system for optimal performance
- **Multi-Theme Support** - Light/dark modes with custom color schemes and 6 font styles
- **Google OAuth Authentication** - Secure authentication with profile synchronization
- **Session Management** - Persistent login sessions with theme preferences
- **Responsive Design** - Mobile-first design with desktop optimization
- **Row-Level Security** - Database-level access control and privacy
- **Real-time Updates** - Live data synchronization across devices via Supabase
- **Legal Compliance** - Terms of Service and Privacy Policy modals

## 📚 Documentation Structure

### 🚀 Getting Started
- **[Project Structure](./PROJECT_STRUCTURE.md)** - Complete project organization overview
- **[Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md)** - How to deploy StyleSnap
- **[OAuth Quick Start](./guides/OAUTH_QUICK_START.md)** - Quick OAuth setup
- **[Credentials Setup](./guides/CREDENTIALS_SETUP.md)** - Environment setup

### 🔧 API & Architecture
- **[API Guide](./api/API_GUIDE.md)** - Complete API documentation
- **[Architecture](./api/ARCHITECTURE.md)** - System architecture overview
- **[Database Guide](./guides/DATABASE_GUIDE.md)** - Database management

### 🎨 Features & Functionality

#### Core Features
- **[Feature Overview](./FEATURE_OVERVIEW.md)** - Complete feature overview (v3.0.0)
- **[Closet Guide](./guides/CLOSET_GUIDE.md)** - Digital closet management
- **[Catalog Guide](./guides/CATALOG_GUIDE.md)** - Clothing catalog system
- **[Social Guide](./guides/SOCIAL_GUIDE.md)** - Friends and social features
- **[Notifications Guide](./guides/NOTIFICATIONS_GUIDE.md)** - Notification system

#### Outfit System (NEW v3.0.0)
- **[AI Outfit Suggestions](./features/AI_OUTFIT_SUGGESTIONS.md)** - Auto-generated outfit suggestions with smart positioning
- **[Friend Outfit Creation](./features/FRIEND_OUTFIT_CREATION.md)** - Create outfits for friends using their items
- **[Edit Outfit](./features/EDIT_OUTFIT.md)** - Full editing mode for existing outfits
- **[Friend Notifications](./features/FRIEND_NOTIFICATIONS.md)** - Comprehensive notification system

#### Advanced Features
- **[Outfit Generation](./guides/OUTFIT_GENERATION_GUIDE.md)** - AI-powered outfit suggestions
- **[Color Detection](./guides/COLOR_DETECTION_GUIDE.md)** - Automatic color detection
- **[Likes System](./guides/LIKES_GUIDE.md)** - Item and outfit likes
- **[Google Profile Sync](./features/GOOGLE_PROFILE_SYNC.md)** - OAuth profile synchronization

### 🛠️ Development & Maintenance

#### Setup & Configuration
- **[Authentication Guide](./guides/AUTHENTICATION_GUIDE.md)** - Auth system setup
- **[OAuth Complete Guide](./guides/OAUTH_COMPLETE_GUIDE.md)** - Full OAuth implementation
- **[Secrets Reference](./guides/SECRETS_REFERENCE.md)** - Environment variables

#### Data Management
- **[Catalog Seeding](./guides/CATALOG_SEEDING.md)** - Populate catalog data
- **[Seeding Guide](./guides/SEEDING_GUIDE.md)** - General data seeding
- **[Categories Guide](./guides/CATEGORIES_GUIDE.md)** - Clothing categories

#### Maintenance
- **[Notification Cleanup](./guides/NOTIFICATION_CLEANUP_GUIDE.md)** - 7-day retention system
- **[Cloudinary Monitoring](./guides/CLOUDINARY_MONITORING.md)** - Image management
- **[Code Standards](./guides/CODE_STANDARDS.md)** - Development standards

### 🎨 Customization
- **[Theme Customization](./theme/THEME_CUSTOMIZATION_GUIDE.md)** - UI theming
- **[User Flows](./guides/USER_FLOWS.md)** - User experience flows

### 🧪 Testing & Quality
- **[Tests Guide](./guides/TESTS_GUIDE.md)** - Testing framework
- **[LLM Agent Guide](./guides/LLM_AGENT_GUIDE.md)** - AI integration

### 🚨 Emergency & Troubleshooting
- **[OAuth Emergency Fix](./emergency-fixes/OAUTH_EMERGENCY_FIX.md)** - OAuth issues
- **[Routing Fix](./emergency-fixes/ROUTING_FIX.md)** - Routing problems
- **[OAuth Fix Guide](./oauth/OAUTH_FIX_GUIDE.md)** - OAuth troubleshooting

### 📦 Deployment & Infrastructure

#### Deployment Platforms
- **[Vercel Deployment](./deployment/vercel/)** - Vercel configuration
- **[Railway Deployment](./deployment/railway/)** - Railway API setup

#### AI & Models
- **[AI Models](./ai-models/)** - Machine learning models
- **[Model Deployment](./deployment/MODEL_DEPLOYMENT_GUIDE.md)** - Model deployment
- **[Hugging Face Integration](./deployment/HUGGINGFACE_INTEGRATION.md)** - HF integration

### 🔧 Scripts & Utilities
- **[Scripts Documentation](./scripts/)** - All utility scripts
- **[Catalog Seeding Quickstart](./scripts/CATALOG_SEEDING_QUICKSTART.md)** - Quick catalog setup

### 📋 Project Management
- **[Contributing](./deployment/CONTRIBUTING.md)** - How to contribute
- **[Requirements](./deployment/REQUIREMENTS.md)** - Project requirements
- **[Tasks](./deployment/TASKS.md)** - Task management
- **[Project Context](./deployment/PROJECT_CONTEXT.md)** - Project background

## 🎯 Quick Navigation

### For Developers
1. **[Project Structure](./PROJECT_STRUCTURE.md)** - Understand the codebase
2. **[API Guide](./api/API_GUIDE.md)** - Learn the API
3. **[Code Standards](./guides/CODE_STANDARDS.md)** - Follow best practices
4. **[Tests Guide](./guides/TESTS_GUIDE.md)** - Write tests

### For DevOps
1. **[Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md)** - Deploy the app
2. **[Database Guide](./guides/DATABASE_GUIDE.md)** - Manage database
3. **[Cloudinary Monitoring](./guides/CLOUDINARY_MONITORING.md)** - Monitor images
4. **[Notification Cleanup](./guides/NOTIFICATION_CLEANUP_GUIDE.md)** - Maintenance

### For Product Managers
1. **[User Flows](./guides/USER_FLOWS.md)** - Understand user journeys
2. **[Features Overview](./PROJECT_STRUCTURE.md#key-features-by-directory)** - Feature breakdown
3. **[Requirements](./deployment/REQUIREMENTS.md)** - Project requirements
4. **[Tasks](./deployment/TASKS.md)** - Development tasks

### For New Team Members
1. **[Project Context](./deployment/PROJECT_CONTEXT.md)** - Project background
2. **[Getting Started](./guides/OAUTH_QUICK_START.md)** - Quick setup
3. **[Contributing](./deployment/CONTRIBUTING.md)** - How to contribute
4. **[Architecture](./api/ARCHITECTURE.md)** - System overview

## 🔍 Search & Find

### By Technology
- **Vue.js**: Components, pages, stores
- **Supabase**: Database, auth, real-time
- **Tailwind**: Styling, themes
- **Vite**: Build, development
- **Python**: AI models, scraping
- **Node.js**: Scripts, utilities

### By Feature
- **Authentication**: OAuth, sessions, users
- **Social**: Friends, suggestions, likes
- **Catalog**: Items, categories, search
- **Closet**: Personal items, outfits
- **Notifications**: Real-time, push, cleanup
- **Analytics**: Usage, insights, charts

### By Environment
- **Development**: Setup, local, testing
- **Staging**: Preview, testing, validation
- **Production**: Deployment, monitoring, maintenance

## 📖 Documentation Standards

### Writing Guidelines
- Use clear, concise language
- Include code examples
- Provide step-by-step instructions
- Add troubleshooting sections
- Keep documentation up-to-date

### File Naming
- Use descriptive names
- Follow kebab-case convention
- Include file type in name
- Group related files in directories

### Structure
- Start with overview
- Include prerequisites
- Provide detailed steps
- Add examples and screenshots
- Include troubleshooting

## 🆘 Getting Help

### Documentation Issues
- Check the relevant guide first
- Look for troubleshooting sections
- Search for similar issues
- Check emergency fix guides

### Development Issues
- Review code standards
- Check API documentation
- Look at existing implementations
- Consult architecture docs

### Deployment Issues
- Check deployment guides
- Review environment setup
- Look at platform-specific docs
- Check emergency fixes

## 🔄 Keeping Documentation Updated

### When to Update
- After adding new features
- When changing APIs
- After fixing bugs
- When updating dependencies
- After deployment changes

### How to Update
- Update relevant guides
- Add new documentation
- Remove outdated information
- Update examples and screenshots
- Review and test instructions

## 📝 Contributing to Documentation

1. **Identify the need** - What's missing or outdated?
2. **Choose the right location** - Where should it go?
3. **Follow the standards** - Use consistent format
4. **Test the instructions** - Make sure they work
5. **Submit for review** - Get feedback from team

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Maintainer**: StyleSnap Development Team