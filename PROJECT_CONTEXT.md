# StyleSnap - Project Content tasks/
│ ├── 01│ │ ├── 09-item-catalog-system.md    │ ├── 09-item-catalog-system.md        # Item catalog implementation
│ ├── 10-color-detection-ai.md         # Color detection AI implementation
│ ├── 11-outfit-generation.md          # Outfit generation from permutations
│ ├── 12-likes-feature.md              # Likes feature implementation
│ ├── 13-advanced-outfit-features.md   # Task 13: Advanced outfit features
│ └── 14-notification-system.md        # Task 14: Push notifications, friend suggestions Item c│ │ │ ├── SuggestionItem.vue
│ │ │ ├── NotificationBell.vue
│ │ │ ├── LikersList.vue                 # Task 12: Modal showing likers
│ │ │ ├── PopularItemsCarousel.vue       # Task 12: Trending items carousel
│ │ │ ├── SharedOutfitsFeed.vue          # Task 13: Social outfit feed
│ │ │ ├── SharedOutfitCard.vue           # Task 13: Shared outfit post
│ │ │ ├── ShareOutfitModal.vue           # Task 13: Share outfit dialog
│ │ │ └── OutfitCommentsList.vue         # Task 13: Comments section
│ │ ├── outfits/
│ │ │ ├── OutfitHistoryList.vue          # Task 13: Outfit history list
│ │ │ ├── OutfitHistoryCard.vue          # Task 13: History entry card
│ │ │ └── RecordOutfitModal.vue          # Task 13: Record new outfit
│ │ ├── collections/
│ │ │ ├── CollectionsList.vue            # Task 13: Collections grid
│ │ │ ├── CollectionCard.vue             # Task 13: Single collection card
│ │ │ ├── CollectionDetailView.vue       # Task 13: Collection contents
│ │ │ └── CreateCollectionModal.vue      # Task 13: New collection dialog
│ │ ├── preferences/
│ │ │ ├── StylePreferencesEditor.vue     # Task 13: Preferences editor
│ │ │ ├── ColorPicker.vue                # Task 13: Color selection
│ │ │ └── StyleSelector.vue              # Task 13: Style chips
│ │ └── analytics/
│ │     ├── WardrobeAnalytics.vue        # Task 13: Analytics dashboard
│ │     ├── MostWornChart.vue            # Task 13: Chart component
│ │     └── SeasonalBreakdown.vue        # Task 13: Stats displayog implementation
│ │ ├── 10-color-detection-ai.md         # Color detection AI implementation
│ │ ├── 11-outfit-generation.md          # Outfit generation from permutations
│ │ ├── 12-likes-feature.md              # Likes feature implementation
│ │ └── 13-advanced-outfit-features.md   # Task 13: Advanced outfit featuresrastructure-setup.md
│ ├── 02-authentication-database.md
│ ├── 03-closet-crud-image-management.md
│ ├── 04-social-features-privacy.md
│ ├── 05-suggestion-system.md
│ ├── 06-quotas-maintenance.md
│ ├── 07-qa-security-launch.md
│ └── 08-mobile-mockups.md            # Design reference (optional)roject Overview
Digital closet app for outfit suggestions from friends.

## Technology Stack
Frontend: Vue.js 3 + Vite + Tailwind CSS
Backend: Supabase (PostgreSQL) + Cloudinary
Authentication: Google OAuth 2.0 (SSO) ONLY

## Authentication Flow
**CRITICAL: Google SSO Exclusively**
- `/login` page: "Sign in with Google" button
- `/register` page: "Sign up with Google" button  
- Both use same OAuth flow: `supabase.auth.signInWithOAuth({ provider: 'google' })`
- After successful auth: Redirect to `/closet` (home page)
- User profile auto-created in `users` table on first sign-in
- No email/password, magic links, or other authentication methods

## Complete File Structure
stylesnap/
├── API_GUIDE.md                       # **SINGLE SOURCE OF TRUTH** for all APIs
├── docs/
│ ├── design/
│ │ ├── DESIGN_REFERENCE.md           # Mobile UI mockup documentation
│ │ └── mobile-mockups/               # Figma PNG exports (reference only)
│ ├── CODE_STANDARDS.md
│ ├── CONTRIBUTING.md
│ └── DEPLOYMENT.md
├── requirements/
│ ├── database-schema.md
│ ├── frontend-components.md
│ ├── security.md
│ ├── error-handling.md
│ ├── performance.md
│ ├── item-catalog.md                  # Task 9: Item catalog specs
│ ├── color-detection.md               # Task 10: Color detection specs
│ └── outfit-generation.md             # Task 11: AI outfit generation specs
├── tasks/
│ ├── 01-infrastructure-setup.md
│ ├── 02-authentication-database.md
│ ├── 03-closet-crud-image-management.md
│ ├── 04-social-features-privacy.md
│ ├── 05-suggestion-system.md
│ ├── 06-quotas-maintenance.md
│ ├── 07-qa-security-launch.md
│ ├── 08-mobile-mockups.md             # Design reference (optional)
│ ├── 09-item-catalog-system.md        # Item catalog implementation
│ ├── 10-color-detection-ai.md         # Color detection AI implementation
│ ├── 11-outfit-generation.md          # Outfit generation (permutation-based, no ML)
│ ├── 12-likes-feature.md              # Likes feature implementation
│ └── 13-advanced-outfit-features.md   # Task 13: Advanced outfit features
├── sql/
│ ├── 001_initial_schema.sql
│ ├── 002_rls_policies.sql
│ ├── 003_indexes_functions.sql
│ ├── 004_advanced_features.sql        # Task 13: Advanced outfit features (8 tables)
│ ├── 005_catalog_system.sql           # Task 9: Catalog database
│ ├── 006_color_detection.sql          # Task 10: Color fields and functions
│ ├── 007_outfit_generation.sql        # Task 11: Outfit generation (permutation-based)
│ ├── 008_likes_feature.sql            # Task 12: Likes system
│ ├── 009_notifications_system.sql     # Task 14: Notifications, suggestions, item likes
│ └── 010_push_notifications.sql       # Task 14: Push subscription table
├── src/
│ ├── assets/
│ │ ├── styles/
│ │ │ ├── base.css
│ │ │ ├── components.css
│ │ │ └── mobile.css                   # Batch 10: Mobile-first styles
│ │ └── images/
│ ├── components/
│ │ ├── ui/
│ │ │ ├── Button.vue
│ │ │ ├── Modal.vue
│ │ │ ├── FormInput.vue
│ │ │ ├── Select.vue
│ │ │ ├── Notification.vue
│ │ │ ├── Badge.vue
│ │ │ ├── Skeleton.vue
│ │ │ ├── ProgressBar.vue
│ │ │ ├── QuotaIndicator.vue
│ │ │ └── LikeButton.vue               # Task 12: Like/unlike button
│ │ ├── layouts/
│ │ │ ├── MainLayout.vue
│ │ │ └── AuthLayout.vue
│ │ ├── closet/
│ │ │ ├── ClosetGrid.vue
│ │ │ ├── ItemDetailModal.vue          # Item details with statistics
│ │ │ ├── ClosetFilter.vue             # Filter by favorites, category, etc
│ │ │ ├── AddItemForm.vue
│ │ │ └── LikedItemsGrid.vue           # Task 12: Grid of liked items
│ │ ├── social/
│ │ │ ├── FriendsList.vue
│ │ │ ├── FriendProfile.vue
│ │ │ ├── FriendRequest.vue
│ │ │ ├── SuggestionCanvas.vue
│ │ │ ├── SuggestionList.vue
│ │ │ ├── SuggestionItem.vue
│ │ │ ├── NotificationBell.vue
│ │ │ ├── LikersList.vue                 # Task 12: Modal showing likers
│ │ │ ├── PopularItemsCarousel.vue       # Task 12: Trending items carousel
│ │ │ ├── SharedOutfitCard.vue           # Task 13: Instagram-style post card
│ │ │ ├── SharedOutfitsFeed.vue          # Task 13: Friends-only feed (chronological)
│ │ │ ├── ShareOutfitModal.vue           # Task 13: Share outfit form
│ │ │ ├── OutfitCommentsList.vue         # Task 13: Comments with add/delete
│ │ │ ├── CreateSuggestionModal.vue      # Task 14: Create outfit suggestion for friend
│ │ │ └── SuggestionApprovalCard.vue     # Task 14: Approve/reject friend suggestions
│ │ ├── notifications/
│ │ │ ├── NotificationsList.vue          # Task 14: Main notifications list
│ │ │ ├── NotificationItem.vue           # Task 14: Individual notification card
│ │ │ ├── NotificationBadge.vue          # Task 14: Unread count badge
│ │ │ └── EmptyNotifications.vue         # Task 14: Empty state component
│ │ ├── outfits/
│ │ │ ├── OutfitHistoryCard.vue          # Task 13: Single outfit entry card
│ │ │ ├── OutfitHistoryList.vue          # Task 13: History with filters
│ │ │ ├── RecordOutfitModal.vue          # Task 13: Record/edit outfit form
│ │ │ ├── ManualOutfitCreator.vue        # Task 11: Manual outfit creation page
│ │ │ ├── OutfitCanvas.vue               # Task 11: Drag-drop canvas component
│ │ │ ├── ClosetItemsSidebar.vue         # Task 11: Draggable items sidebar
│ │ │ └── SaveOutfitDialog.vue           # Task 11: Save outfit dialog
│ │ ├── collections/
│ │ │ ├── CollectionCard.vue             # Task 13: Collection grid card
│ │ │ ├── CollectionsList.vue            # Task 13: Collections grid view
│ │ │ ├── CollectionDetailView.vue       # Task 13: Detail with drag-drop
│ │ │ └── CreateCollectionModal.vue      # Task 13: Create/edit collection
│ │ ├── preferences/
│ │ │ ├── ColorPicker.vue                # Task 13: Multi-color selector
│ │ │ ├── StyleSelector.vue              # Task 13: Style cards selector
│ │ │ └── StylePreferencesEditor.vue     # Task 13: Complete preferences form
│ │ └── analytics/
│ │     ├── WardrobeAnalytics.vue        # Task 13: Main analytics dashboard
│ │     ├── MostWornChart.vue            # Task 13: Ranked items chart
│ │     └── SeasonalBreakdown.vue        # Task 13: Category/occasion/rating stats
│ ├── pages/
│ │ ├── Login.vue
│ │ ├── Closet.vue             # Home page with settings icon
│ │ ├── Friends.vue            # Social feed with friends' outfits only
│ │ ├── Settings.vue           # User settings with avatar selection
│ │ ├── Suggestions.vue
│ │ ├── Analytics.vue                  # Task 13: Wardrobe analytics page
│ │ └── Notifications.vue              # Task 14: Notifications page with tabs
│ ├── stores/
│ │ ├── index.js
│ │ ├── auth-store.js
│ │ ├── closet-store.js
│ │ ├── friends-store.js
│ │ ├── suggestions-store.js
│ │ ├── likes-store.js                 # Task 12: Likes state management
│ │ ├── outfit-history-store.js        # Task 13: Outfit history tracking
│ │ ├── shared-outfits-store.js        # Task 13: Social outfit sharing
│ │ ├── collections-store.js           # Task 13: Collections/lookbooks
│ │ ├── style-preferences-store.js     # Task 13: Style preferences
│ │ ├── analytics-store.js             # Task 13: Wardrobe analytics
│ │ └── notifications-store.js         # Task 14: Notifications state + real-time updates
│ ├── services/
│ │ ├── api.js
│ │ ├── auth-service.js
│ │ ├── clothes-service.js
│ │ ├── friends-service.js
│ │ ├── user-service.js            # User profile updates (avatar selection)
│ │ ├── suggestions-service.js
│ │ ├── likes-service.js               # Task 12/14: Likes API (outfits + items)
│ │ ├── outfit-service.js              # Task 11: Manual outfit creation API
│ │ ├── outfit-generator-service.js    # Task 11: Auto outfit generation
│ │ ├── outfit-history-service.js      # Task 13: Outfit history API
│ │ ├── shared-outfits-service.js      # Task 13: Shared outfits API
│ │ ├── collections-service.js         # Task 13: Collections API
│ │ ├── style-preferences-service.js   # Task 13: Preferences API
│ │ ├── analytics-service.js           # Task 13: Analytics API
│ │ ├── notifications-service.js       # Task 14: Notifications API
│ │ ├── friend-suggestions-service.js  # Task 14: Friend outfit suggestions API
│ │ ├── weather-service.js             # Batch 9: Weather integration
│ │ ├── push-notifications.js          # Batch 10: Push notifications
│ │ └── offline-sync.js                # Batch 10: Offline sync
│ ├── utils/
│ │ ├── auth-guard.js
│ │ ├── image-compression.js
│ │ ├── quota-calculator.js
│ │ ├── maintenance-helpers.js
│ │ ├── drag-drop-helpers.js
│ │ └── performance.js                 # Batch 10: Performance utilities
│ ├── config/
│ │ ├── theme.js
│ │ └── icons.js
│ ├── App.vue
│ └── main.js
├── public/
│ ├── manifest.json                    # PWA manifest
│ └── service-worker.js                # PWA service worker
├── tests/
│ ├── unit/
│ │ ├── image-compression.test.js
│ │ └── quota-calculator.test.js
│ ├── integration/
│ │ └── api-endpoints.test.js
│ └── e2e/
│ └── user-journeys.test.js
├── scripts/
│ ├── purge-old-items.js
│ └── cloudinary-cleanup.js
├── .github/
│ └── workflows/
│     └── supabase-keepalive.yml
├── templates/
│ ├── component-template.md
│ └── api-template.md
├── REQUIREMENTS.md                    # Requirements index
├── TASKS.md                           # Tasks index (includes Tasks 8-12)
├── PROJECT_CONTEXT.md                 # This file - Project overview
├── package.json
├── vite.config.js
├── tailwind.config.js
├── .env.example
└── .gitignore

## Code Conventions
- **SQL**: snake_case for tables and columns
- **JavaScript**: camelCase for variables/functions, PascalCase for components
- **CSS**: kebab-case for class names
- **Files**: kebab-case for file names

## Documentation Structure
- `REQUIREMENTS.md` - Main requirements index
- `TASKS.md` - Main tasks index
- `requirements/` - Detailed requirement files
- `tasks/` - Detailed task files
- `sql/` - SQL migration files
- `docs/` - Project documentation

## Cross-Reference Notation
When tasks reference requirements: `[REQ: database-schema#2.1]`
When requirements reference tasks: `[TASK: 01-infrastructure-setup#1.1]`

## Critical Files for Development
- **API Documentation**: `API_GUIDE.md` - **SINGLE SOURCE OF TRUTH** for all APIs
- **Database Setup**: `sql/001_initial_schema.sql`
- **Component Guidelines**: `requirements/frontend-components.md`
- **Security Requirements**: `requirements/security.md`
- **Friend Search**: `tasks/04-social-features-privacy.md` (includes anti-scraping measures)
- **Development Tasks**: Start with `tasks/01-infrastructure-setup.md`

## Development Workflow
1. Start with infrastructure setup (Task 1)
2. Follow sequential task order (1 → 2 → 3 → ...)
3. Reference requirements for each task
4. Use SQL files for database setup
5. Follow file structure for new components

## Documentation Index

### Design Documentation
- **Mobile UI Mockups**: `docs/design/DESIGN_REFERENCE.md` - Figma mockups and design intent (reference sketches only)

### Technical Documentation
- **API Guide**: `API_GUIDE.md` - **SINGLE SOURCE OF TRUTH** for all APIs (REST, services, database functions, Edge functions)
- **Code Standards**: `docs/CODE_STANDARDS.md` - Coding conventions and best practices
- **Contributing Guide**: `docs/CONTRIBUTING.md` - How to contribute to the project
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md` - **MAIN DEPLOYMENT GUIDE** (single source of truth)
- **Secrets Reference**: `SECRETS_REFERENCE.md` - Quick lookup for environment variables
- **Supabase Commands**: `SUPABASE_COMMANDS.md` - Complete CLI command reference
- **Legacy Deployment**: `docs/DEPLOYMENT.md` - Additional reference material