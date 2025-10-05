# StyleSnap - Project Context

## Project Overview
Digital closet app for outfit suggestions from friends.

## Technology Stack
Frontend: Vue.js 3 + Vite + Tailwind CSS
Backend: Supabase (PostgreSQL) + Cloudinary
Authentication: Google OAuth

## Complete File Structure
stylesnap/
├── docs/
│ ├── design/
│ │ ├── DESIGN_REFERENCE.md           # Mobile UI mockup documentation
│ │ └── mobile-mockups/               # Figma PNG exports (reference only)
│ ├── CODE_STANDARDS.md
│ ├── CONTRIBUTING.md
│ ├── DEPLOYMENT.md
│ └── API_REFERENCE.md
├── requirements/
│ ├── database-schema.md
│ ├── api-endpoints.md
│ ├── frontend-components.md
│ ├── security.md
│ ├── error-handling.md
│ └── performance.md
├── tasks/
│ ├── 01-infrastructure-setup.md
│ ├── 02-authentication-database.md
│ ├── 03-closet-crud-image-management.md
│ ├── 04-social-features-privacy.md
│ ├── 05-suggestion-system.md
│ ├── 06-quotas-maintenance.md
│ ├── 07-qa-security-launch.md
│ └── 08-mobile-mockups.md            # Design reference (optional)
├── sql/
│ ├── 001_initial_schema.sql
│ ├── 002_rls_policies.sql
│ ├── 003_indexes_functions.sql
│ └── 004_advanced_features.sql        # Batch 9 features
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
│ │ │ └── QuotaIndicator.vue
│ │ ├── layouts/
│ │ │ ├── MainLayout.vue
│ │ │ └── AuthLayout.vue
│ │ ├── closet/
│ │ │ ├── ClosetGrid.vue
│ │ │ └── AddItemForm.vue
│ │ └── social/
│ │ ├── FriendsList.vue
│ │ ├── FriendProfile.vue
│ │ ├── FriendRequest.vue
│ │ ├── SuggestionCanvas.vue
│ │ ├── SuggestionList.vue
│ │ ├── SuggestionItem.vue
│ │ └── NotificationBell.vue
│ ├── pages/
│ │ ├── Login.vue
│ │ ├── Closet.vue
│ │ ├── Friends.vue
│ │ ├── Profile.vue
│ │ └── Suggestions.vue
│ ├── stores/
│ │ ├── index.js
│ │ ├── auth-store.js
│ │ ├── closet-store.js
│ │ ├── friends-store.js
│ │ └── suggestions-store.js
│ ├── services/
│ │ ├── api.js
│ │ ├── auth-service.js
│ │ ├── clothes-service.js
│ │ ├── friends-service.js
│ │ ├── suggestions-service.js
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
├── TASKS.md                           # Tasks index (includes Task 8: Mobile Mockups)
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
- **Database Setup**: `sql/001_initial_schema.sql`
- **API Specifications**: `requirements/api-endpoints.md`
- **Component Guidelines**: `requirements/frontend-components.md`
- **Security Requirements**: `requirements/security.md`
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
- **Mobile Implementation**: `BATCH_10_FIXES.md` - Actual PWA and mobile feature implementation

### Technical Documentation
- **Code Standards**: `docs/CODE_STANDARDS.md` - Coding conventions and best practices
- **API Reference**: `docs/API_REFERENCE.md` - Complete API endpoint documentation
- **Contributing Guide**: `docs/CONTRIBUTING.md` - How to contribute to the project
- **Deployment Guide**: `docs/DEPLOYMENT.md` - Production deployment instructions

### Implementation Batches
- **Batch 1-9**: Core features and advanced functionality (database, auth, CRUD, social, suggestions, quotas, security, docs, analytics)
- **Batch 10**: `BATCH_10_FIXES.md` - PWA and mobile optimization (Final batch)

### Status
- **Project Status**: ✅ Production Ready (All 10 batches complete)
- **Total Issues Fixed**: 73 issues across 10 batches
- **PWA Status**: Installable, offline-capable, mobile-optimized