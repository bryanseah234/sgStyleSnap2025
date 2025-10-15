# StyleSnap Project Structure

This document provides a comprehensive overview of the StyleSnap project structure and organization.

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
- **`App.vue`** - Root Vue component
- **`main.js`** - Application entry point
- **`router.js`** - Vue Router configuration

### Configuration (`src/config/`)
- **`supabase.js`** - Supabase client configuration
- **`colors.js`** - Color theme definitions
- **`fonts.js`** - Font theme definitions
- **`color-themes.js`** - Color theme configurations
- **`theme.js`** - Theme configuration
- **`constants.js`** - Application constants
- **`env.js`** - Environment configuration

### Components (`src/components/`)

#### Analytics (`analytics/`)
- **`WardrobeAnalytics.vue`** - Wardrobe analytics dashboard
- **`MostWornChart.vue`** - Most worn items chart
- **`SeasonalBreakdown.vue`** - Seasonal breakdown chart

#### Catalog (`catalog/`)
- **`CatalogGrid.vue`** - Catalog items grid
- **`CatalogItemCard.vue`** - Individual catalog item
- **`CatalogSearch.vue`** - Catalog search functionality
- **`CatalogFilter.vue`** - Catalog filtering options

#### Closet (`closet/`)
- **`ClosetGrid.vue`** - User's closet items grid
- **`ClosetFilter.vue`** - Closet filtering options
- **`AddItemModal.vue`** - Modal for adding items
- **`AddItemForm.vue`** - Form for adding new items
- **`ItemDetailModal.vue`** - Item detail view
- **`ItemLikeButton.vue`** - Like button for items
- **`ItemLikersList.vue`** - List of item likers
- **`LikedItemsGrid.vue`** - Grid of liked items

#### Collections (`collections/`)
- **`CollectionCard.vue`** - Collection display card
- **`CollectionDetailView.vue`** - Collection detail view
- **`CollectionsList.vue`** - List of collections
- **`CreateCollectionModal.vue`** - Modal for creating collections

#### Layouts (`layouts/`)
- **`MainLayout.vue`** - Main application layout
- **`AuthLayout.vue`** - Authentication layout

#### Notifications (`notifications/`)
- **`NotificationBadge.vue`** - Notification count badge
- **`NotificationBell.vue`** - Notification bell icon
- **`NotificationItem.vue`** - Individual notification
- **`NotificationSettings.vue`** - Notification preferences
- **`NotificationToggle.vue`** - Notification toggle
- **`NotificationsList.vue`** - List of notifications
- **`PushNotificationPrompt.vue`** - Push notification prompt
- **`EmptyNotifications.vue`** - Empty state for notifications

#### Outfits (`outfits/`)
- **`ClosetItemsSidebar.vue`** - Sidebar for outfit creation
- **`OutfitCanvas.vue`** - Outfit creation canvas
- **`OutfitHistoryCard.vue`** - Outfit history card
- **`OutfitHistoryList.vue`** - List of outfit history
- **`RecordOutfitModal.vue`** - Modal for recording outfits

#### Preferences (`preferences/`)
- **`ColorPicker.vue`** - Color selection component
- **`StylePreferencesEditor.vue`** - Style preferences editor
- **`StyleSelector.vue`** - Style selection component

#### Social (`social/`)
- **`CreateSuggestionModal.vue`** - Modal for creating suggestions
- **`FriendProfile.vue`** - Friend profile view
- **`FriendRequest.vue`** - Friend request component
- **`FriendsList.vue`** - List of friends
- **`LikersList.vue`** - List of likers
- **`NotificationBell.vue`** - Notification bell
- **`OutfitCommentsList.vue`** - Outfit comments
- **`PopularItemsCarousel.vue`** - Popular items carousel
- **`SharedOutfitCard.vue`** - Shared outfit card
- **`SharedOutfitsFeed.vue`** - Shared outfits feed
- **`ShareOutfitModal.vue`** - Modal for sharing outfits
- **`SuggestionApprovalCard.vue`** - Suggestion approval card
- **`SuggestionCanvas.vue`** - Suggestion canvas
- **`SuggestionDetailModal.vue`** - Suggestion detail modal
- **`SuggestionItem.vue`** - Individual suggestion
- **`SuggestionList.vue`** - List of suggestions
- **`SuggestionPreview.vue`** - Suggestion preview

#### UI Components (`ui/`)
- **`Badge.vue`** - Badge component
- **`Button.vue`** - Button component
- **`ColorThemePicker.vue`** - Color theme picker
- **`FontThemeSelector.vue`** - Font theme selector
- **`FormInput.vue`** - Form input component
- **`LikeButton.vue`** - Like button component
- **`Modal.vue`** - Modal component
- **`Notification.vue`** - Notification component
- **`ProgressBar.vue`** - Progress bar component
- **`QuotaIndicator.vue`** - Quota indicator
- **`Select.vue`** - Select component
- **`SettingsDropdown.vue`** - Settings dropdown
- **`Skeleton.vue`** - Loading skeleton
- **`Spinner.vue`** - Loading spinner
- **`StylePreferenceModal.vue`** - Style preference modal
- **`ToggleSwitch.vue`** - Toggle switch
- **`UserGreeting.vue`** - User greeting component
- **`WeatherWidget.vue`** - Weather widget

### Pages (`src/pages/`)
- **`Analytics.vue`** - Analytics dashboard
- **`Catalog.vue`** - Catalog page
- **`Closet.vue`** - Closet page (main dashboard)
- **`DebugAuth.vue`** - Authentication debug page
- **`FontDemo.vue`** - Font demonstration page
- **`Friends.vue`** - Friends page
- **`FriendProfileView.vue`** - Friend profile view
- **`Login.vue`** - Login page
- **`ManualOutfitCreator.vue`** - Manual outfit creator
- **`Notifications.vue`** - Notifications page
- **`OutfitGenerator.vue`** - Outfit generator
- **`Profile.vue`** - User profile page
- **`Register.vue`** - Registration page
- **`SessionConfirmation.vue`** - Session confirmation
- **`Settings.vue`** - Settings page
- **`StyleSettings.vue`** - Style settings page
- **`Suggestions.vue`** - Suggestions page

### Services (`src/services/`)
- **`api.js`** - General API utilities
- **`auth-service.js`** - Authentication service
- **`catalog-service.js`** - Catalog management
- **`cloudinary-service.js`** - Cloudinary integration
- **`color-detection-service.js`** - Color detection
- **`friend-suggestions-service.js`** - Friend suggestions
- **`friends-service.js`** - Friends management
- **`likes-service.js`** - Likes management
- **`notifications-service.js`** - Notifications service
- **`offline-sync.js`** - Offline synchronization
- **`outfit-generation-service.js`** - Outfit generation
- **`outfit-service.js`** - Outfit management
- **`push-notifications.js`** - Push notifications
- **`session-service.js`** - Session management
- **`style-preferences-service.js`** - Style preferences
- **`user-service.js`** - User management
- **`weather-service.js`** - Weather integration
- **`closet-service.js`** - Closet management
- **`analytics-service.js`** - Analytics service
- **`collection-service.js`** - Collections service
- **`item-service.js`** - Item management
- **`suggestion-service.js`** - Suggestions service

### Stores (`src/stores/`)
- **`auth-store.js`** - Authentication state
- **`catalog-store.js`** - Catalog state
- **`closet-store.js`** - Closet state
- **`friends-store.js`** - Friends state
- **`likes-store.js`** - Likes state
- **`notifications-store.js`** - Notifications state
- **`outfit-store.js`** - Outfit state
- **`style-preferences-store.js`** - Style preferences state
- **`suggestions-store.js`** - Suggestions state
- **`user-store.js`** - User state
- **`weather-store.js`** - Weather state
- **`analytics-store.js`** - Analytics state
- **`collection-store.js`** - Collections state
- **`item-store.js`** - Item state
- **`session-store.js`** - Session state

### Utils (`src/utils/`)
- **`auth-guard.js`** - Route guards
- **`color-system.js`** - Color system utilities
- **`font-system.js`** - Font system utilities
- **`quota-calculator.js`** - Quota calculations
- **`date-utils.js`** - Date utilities
- **`image-utils.js`** - Image utilities
- **`validation.js`** - Validation utilities
- **`constants.js`** - Application constants
- **`helpers.js`** - General helpers
- **`storage.js`** - Storage utilities
- **`api-helpers.js`** - API helper functions

### Assets (`src/assets/`)
- **`styles/`** - Global stylesheets
  - **`theme.css`** - Theme variables and styles
  - **`components.css`** - Component styles
  - **`utilities.css`** - Utility classes
  - **`animations.css`** - Animation styles

## 📁 Documentation (`docs/`)

### API Documentation (`api/`)
- **`API_GUIDE.md`** - Complete API documentation
- **`ARCHITECTURE.md`** - System architecture

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
| **`src/components/`** | Reusable UI components |
| **`src/pages/`** | Application pages/views |
| **`src/services/`** | API and business logic |
| **`src/stores/`** | State management |
| **`src/utils/`** | Utility functions |
| **`docs/`** | Comprehensive documentation |
| **`scripts/`** | Maintenance and utility scripts |
| **`database/`** | Database schema and migrations |
| **`tests/`** | Test suites and helpers |

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

This structure provides a clean, organized, and maintainable codebase for the StyleSnap application.
