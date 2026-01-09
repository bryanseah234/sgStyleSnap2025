# StyleSnap Project Structure

This document provides a comprehensive overview of the StyleSnap project structure and organization as of January 2026.

## 📁 Root Directory Structure

```
sgStyleSnap2025/
├── 📁 api/                       # Serverless API functions (Vercel)
├── 📁 database/                  # Database migrations and utilities
├── 📁 docs/                      # All documentation
├── 📁 public/                    # Static assets
├── 📁 scripts/                   # Utility scripts (organized by category)
├── 📁 src/                       # Source code
├── 📁 supabase/                  # Supabase Edge Functions
├── 📁 tests/                     # Test files
├── 📄 .env.example               # Environment variables template
├── 📄 index.html                 # Main HTML file
├── 📄 package.json               # Dependencies and scripts
├── 📄 vite.config.ts             # Vite build configuration
├── 📄 tailwind.config.js         # Tailwind CSS configuration
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 vercel.json                # Vercel deployment configuration
├── 📄 playwright.config.js       # Playwright E2E test configuration
├── 📄 README.md                  # Project overview
└── 📄 LICENSE                    # MIT License
```

## 📁 Source Code (`src/`)

### Core Application Files
- **`App.vue`** - Root Vue component with global layout and theme handling
- **`main.js`** - Application entry point with Vue Router, Pinia, and auth guards
- **`index.css`** - Global styles and Tailwind imports
- **`vite-env.d.ts`** - Vite environment type declarations

### Configuration (`src/config/`)
- **`supabase.js`** - Supabase client configuration and connection

### API Clients (`src/api/`)
- **`base44Client.js`** - Base44 API client
- **`client.js`** - Main API client with authentication
- **`hybrid-api.js`** - Hybrid API for offline/online operations

### Composables (`src/composables/`)

Vue 3 composable functions for reusable logic:

| File | Description |
|------|-------------|
| `useDebounce.js` | Debounce utility for input handling |
| `useDebugMode.js` | Debug mode toggle and utilities |
| `useIdleCallback.js` | Idle callback scheduling |
| `useKeyboardShortcuts.js` | Keyboard shortcut management |
| `useKonamiCode.js` | Easter egg Konami code detection |
| `useLazyLoad.js` | Lazy loading for images and components |
| `useLiquidGlass.js` | Liquid glass visual effect |
| `useMicroPhysics.js` | Micro-physics animations |
| `usePageTransition.ts` | Page transition animations |
| `usePerformanceMonitor.js` | Performance monitoring utilities |
| `usePopup.js` | Popup/modal management |
| `useSanitize.js` | Input sanitization utilities |
| `useScrollAnimation.js` | Scroll-based animations |
| `useSmoothScroll.ts` | Smooth scrolling behavior |
| `useTextAnimation.ts` | Text animation effects |
| `useTheme.js` | Theme management composable |
| `useThrottle.js` | Throttle utility |
| `useTripleClick.js` | Triple-click detection |

### Components (`src/components/`)

#### Root Components (19 files)
| Component | Description |
|-----------|-------------|
| `Avatar3DCarousel.vue` | 3D avatar carousel using Three.js |
| `Avatar3DCarousel.optimized.vue` | Performance-optimized version |
| `Avatar3DCarousel.backup.vue` | Backup version |
| `BlobCursor.vue` | Custom blob cursor effect |
| `DebugOverlay.vue` | Debug information overlay |
| `FPSCounter.vue` | Frames per second counter |
| `GlobalPopup.vue` | Global popup component |
| `Layout.vue` | Main application layout with navigation |
| `LoadingAnimation.vue` | Loading state animation |
| `PageTransition.vue` | Page transition wrapper |
| `PrivacyPolicyModal.vue` | Privacy policy display modal |
| `ScrollHint.vue` | Scroll hint indicator |
| `SectionTransition.vue` | Section transition animations |
| `SingleAvatar3D.vue` | Single 3D avatar display |
| `SkeletonLoader.vue` | Skeleton loading placeholders |
| `StyleSnapBrand.vue` | Brand logo component |
| `StyleSnapLogo.vue` | Logo display component |
| `TermsOfServiceModal.vue` | Terms of service modal |
| `ThemeToggle.vue` | Light/dark theme toggle |

#### Cabinet (`cabinet/`) - 7 files
- **`AddItemForm.vue`** - Form for adding new clothing items
- **`CatalogueBrowser.vue`** - Browse catalog items to add to closet
- **`CategoryFilter.vue`** - Filter items by category
- **`ClothingItemCard.vue`** - Individual clothing item display card
- **`ItemDetailsModal.vue`** - Detailed view modal for items
- **`ManualUploadForm.vue`** - Manual item upload with image processing
- **`UploadItemModal.vue`** - Modal wrapper for item upload

#### Dashboard/Outfits (`dashboard/`) - 6 files
- **`ItemSelector.vue`** - Select items for outfit canvas
- **`OutfitCanvas.vue`** - Interactive drag-and-drop outfit canvas
- **`OutfitCanvasMiniature.vue`** - Miniature outfit preview
- **`SaveOutfitDialog.vue`** - Dialog for saving outfits
- **`ShareOutfitDialog.vue`** - Dialog for sharing outfits with friends
- **`VirtualTryOnModal.vue`** - Virtual try-on using AI

#### Friends (`friends/`) - 3 files
- **`AddFriendDialog.vue`** - Dialog for adding friends by username
- **`FriendCard.vue`** - Friend profile card display
- **`FriendRequestCard.vue`** - Pending friend request card

#### Outfits (`outfits/`) - 1 file
- Additional outfit-related components

#### UI Components (`ui/`) - 17 files
| Component | Description |
|-----------|-------------|
| `Badge.vue` | Badge/label component |
| `BrandAutocomplete.vue` | Brand name autocomplete input |
| `Button.vue` | Styled button component |
| `ConfirmationPopup.vue` | Confirmation dialog popup |
| `Dialog.vue` | Base dialog component |
| `DialogContent.vue` | Dialog content wrapper |
| `DialogHeader.vue` | Dialog header section |
| `DialogTitle.vue` | Dialog title component |
| `Input.vue` | Styled input component |
| `InputPopup.vue` | Input with popup functionality |
| `Label.vue` | Form label component |
| `Select.vue` | Styled select dropdown |
| `SelectContent.vue` | Select dropdown content |
| `SelectItem.vue` | Select dropdown item |
| `SelectTrigger.vue` | Select dropdown trigger |
| `SelectValue.vue` | Select current value display |
| `Textarea.vue` | Styled textarea component |

### Pages (`src/pages/`) - 13 files

| Page | Route | Description |
|------|-------|-------------|
| `Landing.vue` | `/` | Public landing page with features showcase |
| `Home.vue` | `/home` | Authenticated user dashboard |
| `Cabinet.vue` | `/closet` | Personal closet management |
| `Outfits.vue` | `/outfits` | Outfit gallery and management |
| `OutfitCreator.vue` | `/outfits/add/*`, `/outfits/edit/:id` | Interactive outfit creation canvas |
| `Friends.vue` | `/friends` | Friends list and management |
| `FriendProfile.vue` | `/friends/:username` | Individual friend profile view |
| `FriendCabinet.vue` | `/friends/:username/cabinet` | View friend's closet |
| `Profile.vue` | `/profile` | User profile settings |
| `Login.vue` | `/login` | Google OAuth login page |
| `Logout.vue` | `/logout` | Logout handling |
| `OAuthCallback.vue` | `/auth/callback` | OAuth redirect handler |
| `NotFound.vue` | `/*` | 404 error page |

### Services (`src/services/`) - 19 files

| Service | Description |
|---------|-------------|
| `analyticsService.js` | Wardrobe analytics and statistics |
| `authService.js` | Authentication with Google OAuth |
| `catalogService.js` | Catalog item management |
| `clothesService.js` | Clothing item CRUD operations |
| `edgeFunctionHealthService.js` | Edge function health monitoring |
| `edgeFunctionSyncService.js` | Edge function user synchronization |
| `fashion-rnn-service.js` | AI clothing classification (RNN model) |
| `fashion-transformer-service.js` | AI fashion analysis (Transformer model) |
| `friendSuggestionsService.js` | Friend outfit suggestions |
| `friendsService.js` | Friends management (add, remove, requests) |
| `llamaDescriptionService.js` | AI-powered item descriptions |
| `notificationsService.js` | Notification management with 7-day retention |
| `outfitsService.js` | Outfit CRUD and sharing |
| `quotaService.js` | User quota tracking and limits |
| `recommendation-service.js` | AI outfit recommendations |
| `session-service.js` | Session management |
| `userService.js` | User profile management |
| `virtualTryOnService.js` | Hugging Face virtual try-on integration |
| `weatherService.js` | Weather data for outfit suggestions |

### Stores (`src/stores/`) - 2 files

Pinia state management stores:

- **`auth-store.js`** - Authentication state, user session, login/logout
- **`theme-store.js`** - Theme preferences, color schemes, font settings

### Utils (`src/utils/`) - 12 files

| Utility | Description |
|---------|-------------|
| `avatar-cache.js` | Avatar image caching |
| `clothing-constants.js` | Clothing categories and types |
| `color-detector.js` | AI color detection from images |
| `console-art.js` | Console ASCII art and branding |
| `imageProxy.js` | Image proxy utilities |
| `index.js` | Utility exports |
| `log-sanitizer.js` | Log sanitization for production |
| `performance.js` | Performance monitoring and optimization |
| `physics.js` | Physics calculations for animations |
| `replace-console-logs.js` | Console log replacement for production |
| `sanitize.js` | Input sanitization functions |
| `textFormatting.js` | Text formatting utilities |

### Types (`src/types/`) - 3 files
- TypeScript type definitions

### Tokens (`src/tokens/`) - 1 file
- Design tokens and constants

### Assets (`src/assets/`) - 5 files
- Static assets like images and icons

### Test (`src/test/`) - 1 file
- Test utilities

## 📁 API Functions (`api/`)

Serverless functions for Vercel deployment:

- **`notifications/`** - Notification handling functions
- **`ping-supabase.js`** - Supabase health check
- **`proxy-gemini.js`** - Google Gemini API proxy
- **`proxy-image.js`** - Image proxy for CORS
- **`proxy-transformer.js`** - AI transformer model proxy

## 📁 Database (`database/`)

### Migrations (`migrations/`) - 38 files

Database schema migrations (run sequentially):

| Migration | Description |
|-----------|-------------|
| `000_reset_database.sql` | Database reset utility |
| `001_initial_schema.sql` | Initial tables (users, clothing_items) |
| `002_rls_policies.sql` | Row Level Security policies |
| `003_indexes_functions.sql` | Database indexes and functions |
| `004_advanced_features.sql` | Advanced features setup |
| `005_catalog_system.sql` | Catalog browsing system |
| `006_color_detection.sql` | Color detection metadata |
| `007_outfit_generation.sql` | Outfit generation tables |
| `008_likes_feature.sql` | Likes and social features |
| `009_notifications_system.sql` | Notifications system |
| `010_push_notifications.sql` | Push notification support |
| `011_catalog_enhancements.sql` | Catalog improvements |
| `012_auth_user_sync.sql` | Auth user synchronization |
| `013_clothing_types_categories.sql` | Clothing categorization |
| `014-033` | Various fixes and enhancements |
| `048_improve_username_generation.sql` | Username generation improvements |

### Utilities
- **`clear-catalog-data.js`** - Clear catalog data script
- **`manual_create_profile.sql`** - Manual profile creation
- **`diagnostics/`** - Database diagnostic queries
- **`emergency/`** - Emergency fix scripts

## 📁 Scripts (`scripts/`)

### Catalog (`catalog/`) - 66 files
- Catalog data population and seeding scripts
- CSV import utilities

### Cleanup (`cleanup/`) - 4 files
- `cleanup-notifications.js` - Clean old notifications
- `cloudinary-cleanup.js` - Remove unused Cloudinary images
- `purge-old-items.js` - Purge old data
- Additional cleanup utilities

### Database (`database/`) - 4 files
- Database maintenance scripts
- Migration validation

### Scraping (`scraping/`) - 7 files
- Web scraping for catalog data
- Image downloading utilities

### Utilities (`utilities/`) - 1 file
- General utility scripts

### Root Scripts
- **`run-migrations.js`** - Run database migrations
- **`test-*.js`** - Various test scripts

## 📁 Tests (`tests/`)

### E2E (`e2e/`) - 2 files
- Playwright end-to-end tests

### Integration (`integration/`) - 5 files
- Service integration tests

### Unit (`unit/`) - 27 files
- Unit tests for services and stores

### Helpers (`helpers/`) - 3 files
- Test helper utilities and mock data

### Setup
- **`setup.js`** - Test environment setup

## 📁 Public Assets (`public/`)

- **`avatars/`** - Default avatar images
- **`manifest.json`** - PWA manifest
- **`oauth-debug.html`** - OAuth debugging page
- **`service-worker.js`** - Service worker for PWA

## 📁 Supabase (`supabase/`)

Edge Functions for Supabase:
- **`functions/`** - Supabase Edge Functions

## 📁 Documentation (`docs/`)

Comprehensive documentation organized by category:

- **`api/`** - API documentation
- **`deployment/`** - Deployment guides
- **`features/`** - Feature documentation
- **`guides/`** - Setup and usage guides
- **`emergency-fixes/`** - Historical emergency fixes
- **`performance/`** - Performance optimization docs
- **`security/`** - Security documentation

## 📋 Key Metrics

| Category | Count |
|----------|-------|
| Vue Components | 53 |
| Composables | 18 |
| Services | 19 |
| Pages | 13 |
| Stores | 2 |
| Utilities | 12 |
| Database Migrations | 38 |
| Unit Tests | 27+ |
| Integration Tests | 5 |
| E2E Tests | 2 |

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/bryanseah234/sgStyleSnap2025.git
   cd sgStyleSnap2025
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Run database migrations**
   ```bash
   node scripts/run-migrations.js
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📚 Related Documentation

- [README.md](../README.md) - Project overview
- [API Guide](api/API_GUIDE.md) - API documentation
- [Getting Started](GETTING_STARTED.md) - Beginner setup guide
- [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md) - Production deployment

---

**Last Updated:** January 2026  
**Version:** 3.0.0  
**Maintained by:** StyleSnap Team