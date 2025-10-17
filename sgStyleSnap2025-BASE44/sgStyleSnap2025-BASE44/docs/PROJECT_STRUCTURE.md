# StyleSnap Project Structure

This document provides a comprehensive overview of the StyleSnap project structure and organization as of January 2025.

## 📁 Root Directory Structure

```
sgStyleSnap2025/
├── 📁 config/                    # Build and configuration files
├── 📁 database/                  # Database migrations and utilities
├── 📁 docs/                      # All documentation
├── 📁 public/                    # Static assets
├── 📁 scripts/                   # Utility scripts (organized by category)
├── 📁 src/                       # Source code
├── 📁 supabase/                  # Supabase functions
├── 📁 tests/                     # Test files
├── 📄 index.html                 # Main HTML file
├── 📄 package.json               # Dependencies and scripts
├── 📄 README.md                  # Project overview
└── 📄 LICENSE                    # License file
```

## 📁 Source Code (`src/`)

### Core Application Files
- **`App.vue`** - Root Vue component with global layout
- **`main.js`** - Application entry point with store initialization
- **`router.js`** - Vue Router configuration with auth guards

### Configuration (`src/config/`)
- **`supabase.js`** - Supabase client configuration and connection
- **`colors.js`** - Color palette definitions and utilities
- **`fonts.js`** - Font theme definitions and configurations
- **`color-themes.js`** - Complete color theme system (6 themes)
- **`theme.js`** - Theme configuration and utilities
- **`constants.js`** - Application constants and enums
- **`icons.js`** - Icon definitions and mappings

### Components (`src/components/`)

#### Analytics (`analytics/`)
- **`WardrobeAnalytics.vue`** - Main analytics dashboard
- **`MostWornChart.vue`** - Most worn items visualization
- **`SeasonalBreakdown.vue`** - Seasonal usage analytics

#### Catalog (`catalog/`)
- **`CatalogGrid.vue`** - Grid display for catalog items
- **`CatalogItemCard.vue`** - Individual catalog item card
- **`CatalogSearch.vue`** - Search functionality for catalog
- **`CatalogFilter.vue`** - Filtering options for catalog

#### Closet (`closet/`)
- **`ClosetGrid.vue`** - User's personal closet items grid
- **`ClosetFilter.vue`** - Filtering options for closet
- **`AddItemModal.vue`** - Modal for adding new items
- **`AddItemForm.vue`** - Form component for item creation
- **`ItemDetailModal.vue`** - Detailed view of individual items
- **`ItemLikeButton.vue`** - Like functionality for items
- **`ItemLikersList.vue`** - Display list of item likers
- **`LikedItemsGrid.vue`** - Grid of user's liked items

#### Collections (`collections/`)
- **`CollectionCard.vue`** - Collection display card
- **`CollectionDetailView.vue`** - Detailed collection view
- **`CollectionsList.vue`** - List of user collections
- **`CreateCollectionModal.vue`** - Modal for creating collections

#### Layouts (`layouts/`)
- **`MainLayout.vue`** - Main application layout with navigation
- **`AuthLayout.vue`** - Authentication-specific layout

#### Notifications (`notifications/`)
- **`NotificationBadge.vue`** - Notification count badge
- **`NotificationItem.vue`** - Individual notification display
- **`NotificationSettings.vue`** - Notification preferences
- **`NotificationToggle.vue`** - Notification toggle switch
- **`NotificationsList.vue`** - List of all notifications
- **`PushNotificationPrompt.vue`** - Push notification permission prompt
- **`EmptyNotifications.vue`** - Empty state for notifications
- **`SuggestionNotificationItem.vue`** - Specialized notification for suggestions

#### Outfits (`outfits/`)
- **`ClosetItemsSidebar.vue`** - Sidebar for outfit creation
- **`OutfitCanvas.vue`** - Main outfit creation canvas
- **`OutfitHistoryCard.vue`** - Individual outfit history card
- **`OutfitHistoryList.vue`** - List of outfit history
- **`RecordOutfitModal.vue`** - Modal for recording outfits

#### Preferences (`preferences/`)
- **`ColorPicker.vue`** - Color selection component
- **`StylePreferencesEditor.vue`** - Style preferences editor
- **`StyleSelector.vue`** - Style selection component

#### Social (`social/`)
- **`CreateSuggestionModal.vue`** - Modal for creating outfit suggestions
- **`FriendProfile.vue`** - Friend profile display
- **`FriendRequest.vue`** - Friend request component
- **`FriendsList.vue`** - List of friends
- **`LikersList.vue`** - List of item likers
- **`NotificationBell.vue`** - Notification bell icon
- **`OutfitCommentsList.vue`** - Comments on outfits
- **`PopularItemsCarousel.vue`** - Popular items carousel
- **`SharedOutfitCard.vue`** - Shared outfit display card
- **`SharedOutfitsFeed.vue`** - Feed of shared outfits
- **`ShareOutfitModal.vue`** - Modal for sharing outfits
- **`SuggestionApprovalCard.vue`** - Card for approving suggestions
- **`SuggestionCanvas.vue`** - Canvas for creating suggestions
- **`SuggestionDetailModal.vue`** - Detailed suggestion view
- **`SuggestionItem.vue`** - Individual suggestion item
- **`SuggestionList.vue`** - List of suggestions
- **`SuggestionPreview.vue`** - Preview of suggestions

#### UI Components (`ui/`)
- **`Badge.vue`** - Badge component
- **`Button.vue`** - Button component
- **`ColorThemePicker.vue`** - Color theme selection
- **`FontThemeSelector.vue`** - Font theme selection
- **`FormInput.vue`** - Form input component
- **`LikeButton.vue`** - Like button component
- **`Modal.vue`** - Modal component
- **`Notification.vue`** - Notification component
- **`ProgressBar.vue`** - Progress bar component
- **`QuotaIndicator.vue`** - Quota usage indicator
- **`Select.vue`** - Select dropdown component
- **`SettingsDropdown.vue`** - Settings dropdown
- **`Skeleton.vue`** - Loading skeleton component
- **`Spinner.vue`** - Loading spinner
- **`StylePreferenceModal.vue`** - Style preference modal
- **`ToggleSwitch.vue`** - Toggle switch component
- **`UserGreeting.vue`** - User greeting with weather
- **`WeatherWidget.vue`** - Weather information widget

### Pages (`src/pages/`)
- **`Analytics.vue`** - Analytics dashboard page
- **`Catalog.vue`** - Catalog browsing page
- **`Closet.vue`** - Main closet page (dashboard)
- **`DebugAuth.vue`** - Authentication debugging page
- **`FontDemo.vue`** - Font demonstration page
- **`Friends.vue`** - Friends management page
- **`FriendProfileView.vue`** - Individual friend profile view
- **`Login.vue`** - User login page
- **`ManualOutfitCreator.vue`** - Manual outfit creation page
- **`Notifications.vue`** - Notifications management page
- **`OutfitGenerator.vue`** - AI outfit generation page
- **`Profile.vue`** - User profile page
- **`Register.vue`** - User registration page
- **`SessionConfirmation.vue`** - Session confirmation page
- **`Settings.vue`** - User settings page
- **`Suggestions.vue`** - Outfit suggestions page

### Services (`src/services/`)
- **`api.js`** - General API utilities and configuration
- **`auth-service.js`** - Authentication service with Google OAuth
- **`catalog-service.js`** - Catalog management service
- **`clothes-service.js`** - Clothing items service
- **`collections-service.js`** - Collections management service
- **`fashion-rnn-service.js`** - AI clothing classification service
- **`friend-suggestions-service.js`** - Friend suggestion service
- **`friends-service.js`** - Friends management service
- **`likes-service.js`** - Likes management service
- **`manual-outfit-service.js`** - Manual outfit creation service
- **`notifications-service.js`** - Notifications service with 7-day retention
- **`offline-sync.js`** - Offline synchronization service
- **`outfit-generator-service.js`** - AI outfit generation service
- **`outfit-history-service.js`** - Outfit history service
- **`push-notifications.js`** - Push notifications service
- **`session-service.js`** - Session management service
- **`shared-outfits-service.js`** - Shared outfits service
- **`style-preferences-service.js`** - Style preferences service
- **`suggestions-service.js`** - Suggestions service
- **`user-service.js`** - User management service
- **`weather-service.js`** - Weather integration service
- **`analytics-service.js`** - Analytics service

### Stores (`src/stores/`)
- **`index.js`** - Store index and Pinia configuration
- **`auth-store.js`** - Authentication state management
- **`catalog-store.js`** - Catalog state management
- **`closet-store.js`** - Closet state management
- **`collections-store.js`** - Collections state management
- **`friends-store.js`** - Friends state management
- **`likes-store.js`** - Likes state management
- **`notifications-store.js`** - Notifications state management
- **`outfit-generation-store.js`** - Outfit generation state
- **`outfit-history-store.js`** - Outfit history state
- **`shared-outfits-store.js`** - Shared outfits state
- **`style-preferences-store.js`** - Style preferences state
- **`suggestions-store.js`** - Suggestions state management
- **`theme-store.js`** - Theme state management
- **`analytics-store.js`** - Analytics state management

### Utils (`src/utils/`)
- **`auth-guard.js`** - Route guards for authentication
- **`clothing-constants.js`** - Clothing-related constants
- **`color-detector.js`** - AI color detection utilities
- **`color-system.js`** - Color system utilities
- **`debug-auth.js`** - Authentication debugging utilities
- **`drag-drop-helpers.js`** - Drag and drop functionality
- **`font-system.js`** - Font system utilities
- **`image-compression.js`** - Image compression utilities
- **`maintenance-helpers.js`** - Maintenance utilities
- **`performance.js`** - Performance monitoring utilities
- **`quota-calculator.js`** - Quota calculation utilities

### Assets (`src/assets/`)
- **`styles/`** - Global stylesheets
  - **`base.css`** - Base styles and resets
  - **`components.css`** - Component-specific styles
  - **`mobile.css`** - Mobile-specific styles
  - **`theme.css`** - Theme variables and styles

## 📁 Documentation (`docs/`)

### API Documentation (`api/`)
- **`API_GUIDE.md`** - Complete API documentation
- **`ARCHITECTURE.md`** - System architecture overview

### Deployment (`deployment/`)
- **`DEPLOYMENT_GUIDE.md`** - Deployment instructions
- **`CONTRIBUTING.md`** - Contribution guidelines
- **`HUGGINGFACE_INTEGRATION.md`** - Hugging Face integration
- **`MODEL_DEPLOYMENT_GUIDE.md`** - Model deployment
- **`PROJECT_CONTEXT.md`** - Project context
- **`REQUIREMENTS.md`** - Requirements
- **`TASKS.md`** - Task list

#### Railway (`deployment/railway/`)
- **`app.py`** - Railway API application
- **`Procfile`** - Railway deployment config
- **`requirements.txt`** - Python dependencies

#### Vercel (`deployment/vercel/`)
- **`vercel.json`** - Vercel configuration
- **`vercel-main.json`** - Main Vercel config

### Guides (`guides/`)
- **`AUTHENTICATION_GUIDE.md`** - Authentication setup
- **`CATALOG_GUIDE.md`** - Catalog management
- **`CATALOG_SEEDING.md`** - Catalog seeding
- **`CATEGORIES_GUIDE.md`** - Categories management
- **`CLOSET_GUIDE.md`** - Closet management
- **`CLOUDINARY_MONITORING.md`** - Cloudinary monitoring
- **`CODE_STANDARDS.md`** - Code standards
- **`COLOR_DETECTION_GUIDE.md`** - Color detection
- **`CREDENTIALS_SETUP.md`** - Credentials setup
- **`DATABASE_GUIDE.md`** - Database management
- **`LIKES_GUIDE.md`** - Likes system
- **`LLM_AGENT_GUIDE.md`** - LLM agent integration
- **`NOTIFICATION_CLEANUP_GUIDE.md`** - Notification cleanup
- **`NOTIFICATIONS_GUIDE.md`** - Notifications system
- **`OAUTH_COMPLETE_GUIDE.md`** - OAuth setup
- **`OAUTH_FIX_REDIRECT.md`** - OAuth redirect fixes
- **`OAUTH_QUICK_START.md`** - OAuth quick start
- **`OUTFIT_GENERATION_GUIDE.md`** - Outfit generation
- **`PROJECT_STRUCTURE.md`** - Project structure (this file)
- **`SECRETS_REFERENCE.md`** - Secrets reference
- **`SEEDING_GUIDE.md`** - Data seeding
- **`SOCIAL_GUIDE.md`** - Social features
- **`TESTS_GUIDE.md`** - Testing guide
- **`USER_FLOWS.md`** - User flow documentation

### Emergency Fixes (`emergency-fixes/`)
- **`OAUTH_EMERGENCY_FIX.md`** - OAuth emergency fixes
- **`ROUTING_FIX.md`** - Routing fixes

### OAuth (`oauth/`)
- **`OAUTH_FIX_GUIDE.md`** - OAuth fix guide

### Theme (`theme/`)
- **`THEME_CUSTOMIZATION_GUIDE.md`** - Theme customization

### Scripts (`scripts/`)
- **`CATALOG_SEEDING_QUICKSTART.md`** - Catalog seeding quick start
- **`scripts-readme.md`** - Scripts documentation

### AI Models (`ai-models/`)
- **`best_model.pth`** - Trained model file
- **`bjeans.jpg`** - Sample image
- **`black_tshirt.jpg`** - Sample image
- **`brown_shirt.jpg`** - Sample image
- **`jeans.jpg`** - Sample image
- **`IS216.ipynb`** - Jupyter notebook

#### Hugging Face (`ai-models/huggingface-deploy/`)
- **`app.py`** - Hugging Face deployment app
- **`best_model.pth`** - Model file
- **`README.md`** - Deployment README
- **`requirements.txt`** - Python dependencies

## 📁 Database (`database/`)

### Migrations (`migrations/`)
- **`001_initial_schema.sql`** - Initial database schema
- **`002_rls_policies.sql`** - Row Level Security policies
- **`003_indexes_functions.sql`** - Database indexes and functions
- **`004_advanced_features.sql`** - Advanced features
- **`005_catalog_system.sql`** - Catalog system
- **`006_color_detection.sql`** - Color detection features
- **`007_outfit_generation.sql`** - Outfit generation
- **`008_likes_feature.sql`** - Likes feature
- **`009_clothing_types.sql`** - Clothing types
- **`009_enhanced_categories.sql`** - Enhanced categories
- **`009_notifications_system.sql`** - Notifications system
- **`010_push_notifications.sql`** - Push notifications
- **`011_catalog_enhancements.sql`** - Catalog enhancements
- **`012_auth_user_sync.sql`** - Auth user sync
- **`014_fix_catalog_insert_policy.sql`** - Catalog insert policy fix
- **`015_dev_user_setup.sql`** - Development user setup
- **`016_disable_auto_contribution.sql`** - Disable auto contribution
- **`017_fix_catalog_privacy.sql`** - Catalog privacy fix
- **`018_notification_cleanup_system.sql`** - Notification cleanup system
- **`README.md`** - Database documentation

### Database Utilities
- **`clear-catalog.sql`** - Clear catalog data
- **`clear-catalog-data.js`** - Clear catalog script

## 📁 Scripts (`scripts/`)

### Catalog (`catalog/`)
- **`populate-catalog.js`** - Populate catalog
- **`seed-catalog-from-csv.js`** - Seed from CSV
- **`catalog-items-template.csv`** - CSV template

### Cleanup (`cleanup/`)
- **`cleanup-notifications.js`** - Notification cleanup
- **`cloudinary-cleanup.js`** - Cloudinary cleanup
- **`purge-old-items.js`** - Purge old items
- **`cleanup-test-users.js`** - Cleanup test users

### Database (`database/`)
- **`fix-existing-users.js`** - Fix existing users
- **`fix-user-insert-policy.js`** - Fix user policies
- **`validate-migrations.js`** - Validate migrations
- **`setup-database.sh`** - Database setup
- **`disable-auto-contribution.sql`** - Disable auto contribution

### Scraping (`scraping/`)
- **`00sitemap.py`** - Sitemap generation
- **`01spider.py`** - Web spider
- **`02downloader.py`** - Content downloader
- **`03processor.py`** - Data processor
- **`scrape-catalog.py`** - Catalog scraper
- **`scrape-urls.txt`** - URLs to scrape

### Utilities (`utilities/`)
- **`generate-avatars.sh`** - Avatar generation

## 📁 Tests (`tests/`)

### E2E Tests (`e2e/`)
- **`auth.spec.js`** - Authentication tests

### Helpers (`helpers/`)
- **`auth-helpers.js`** - Authentication helpers
- **`test-helpers.js`** - General test helpers
- **`mock-data.js`** - Mock data

### Integration Tests (`integration/`)
- **`auth-integration.spec.js`** - Auth integration tests
- **`catalog-integration.spec.js`** - Catalog integration tests
- **`friends-integration.spec.js`** - Friends integration tests
- **`notifications-integration.spec.js`** - Notifications integration tests
- **`outfits-integration.spec.js`** - Outfits integration tests

### Unit Tests (`unit/`)
- **`auth-store.spec.js`** - Auth store tests
- **`catalog-store.spec.js`** - Catalog store tests
- **`closet-store.spec.js`** - Closet store tests
- **`friends-store.spec.js`** - Friends store tests
- **`likes-store.spec.js`** - Likes store tests
- **`notifications-store.spec.js`** - Notifications store tests
- **`outfit-store.spec.js`** - Outfit store tests
- **`user-store.spec.js`** - User store tests
- **`weather-store.spec.js`** - Weather store tests
- **`analytics-store.spec.js`** - Analytics store tests
- **`collection-store.spec.js`** - Collection store tests
- **`item-store.spec.js`** - Item store tests
- **`session-store.spec.js`** - Session store tests
- **`style-preferences-store.spec.js`** - Style preferences store tests
- **`suggestions-store.spec.js`** - Suggestions store tests
- **`auth-service.spec.js`** - Auth service tests
- **`catalog-service.spec.js`** - Catalog service tests
- **`closet-service.spec.js`** - Closet service tests
- **`friends-service.spec.js`** - Friends service tests
- **`likes-service.spec.js`** - Likes service tests
- **`notifications-service.spec.js`** - Notifications service tests
- **`outfit-service.spec.js`** - Outfit service tests
- **`user-service.spec.js`** - User service tests
- **`weather-service.spec.js`** - Weather service tests
- **`analytics-service.spec.js`** - Analytics service tests
- **`collection-service.spec.js`** - Collection service tests
- **`item-service.spec.js`** - Item service tests
- **`suggestion-service.spec.js`** - Suggestion service tests

### Test Setup
- **`setup.js`** - Test setup configuration

## 📁 Public Assets (`public/`)

### Avatars (`avatars/`)
- **`default-1.png`** - Default avatar 1
- **`default-2.png`** - Default avatar 2
- **`default-3.png`** - Default avatar 3
- **`default-4.png`** - Default avatar 4
- **`default-5.png`** - Default avatar 5
- **`default-6.png`** - Default avatar 6

### Other Assets
- **`manifest.json`** - PWA manifest
- **`oauth-debug.html`** - OAuth debug page
- **`service-worker.js`** - Service worker

## 📁 Supabase (`supabase/`)

### Functions (`functions/`)
- **`push-notifications.ts`** - Push notifications function

## 🔧 Configuration Files

### Build Configuration
- **`config/vite.config.js`** - Vite build configuration
- **`config/tailwind.config.js`** - Tailwind CSS configuration
- **`config/postcss.config.js`** - PostCSS configuration

### Package Management
- **`package.json`** - Dependencies and scripts
- **`package-lock.json`** - Dependency lock file

### Project Files
- **`index.html`** - Main HTML file
- **`README.md`** - Project overview
- **`LICENSE`** - License file

## 📋 Key Features by Directory

| Directory | Key Features |
|-----------|--------------|
| **`src/components/`** | Reusable UI components with 18 UI components, 6 notification components, 8 social components |
| **`src/pages/`** | Application pages/views with 15 main pages |
| **`src/services/`** | API and business logic with 20+ service files |
| **`src/stores/`** | State management with 15+ Pinia stores |
| **`src/utils/`** | Utility functions with 11 utility modules |
| **`docs/`** | Comprehensive documentation with 50+ guide files |
| **`scripts/`** | Maintenance and utility scripts organized by category |
| **`database/`** | Database schema and migrations with 18 migration files |
| **`tests/`** | Test suites and helpers with comprehensive coverage |

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up environment variables**: Copy `.env.example` to `.env`
4. **Run database migrations**: See `database/README.md`
5. **Start development server**: `npm run dev`

## 📚 Documentation

- **Main README**: `README.md`
- **API Documentation**: `docs/api/`
- **Guides**: `docs/guides/`
- **Deployment**: `docs/deployment/`
- **Scripts**: `scripts/README.md`

## 🔄 Recent Updates (January 2025)

### New Features Added
- **7-Day Notification Retention System** - Automatic cleanup for optimal performance
- **Multi-Theme Support** - 6 color themes and 6 font styles
- **Session Management** - Enhanced user session handling
- **Weather Integration** - Real-time weather widget
- **Enhanced Analytics** - Comprehensive wardrobe analytics

### Technical Improvements
- **Code Organization** - Better file structure and organization
- **Error Handling** - Improved error handling throughout
- **Performance** - Optimized loading and rendering
- **Accessibility** - Enhanced accessibility features
- **Mobile Responsiveness** - Improved mobile experience

This structure provides a clean, organized, and maintainable codebase for the StyleSnap application with comprehensive documentation and testing coverage.