# StyleSnap - Digital Closet & Outfit Planner

A Progressive Web App for managing your wardrobe and getting AI-powered outfit suggestions.

---

## 🤖 For LLM Agents: Quick Start Guide

**📖 Read the Complete Guide**: [docs/LLM_AGENT_GUIDE.md](docs/LLM_AGENT_GUIDE.md) - Comprehensive documentation navigation for AI assistants

### Step 1: Understand the Project Structure

1. **Read First**: [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) - Complete file structure and architecture
2. **Code Standards**: [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md) - **MANDATORY** coding conventions
3. **Tech Stack**: Vue.js 3, Vite, Tailwind CSS, Supabase (PostgreSQL), Cloudinary, Google OAuth

### Step 2: Find Your Task
1. **View All Tasks**: [TASKS.md](TASKS.md) - Index of all 14 development tasks
2. **Task Files**: `tasks/*.md` - Detailed implementation guides for each task
3. **Task Status**: Check ✅ Complete, ⏳ Pending, or 🚧 In Progress markers

### Step 3: Review Requirements
1. **Requirements Index**: [REQUIREMENTS.md](REQUIREMENTS.md) - Core requirements overview
2. **Requirement Files**: `requirements/*.md` - Detailed specs for each requirement
3. **API Reference**: [API_GUIDE.md](API_GUIDE.md) - **SINGLE SOURCE OF TRUTH** for all APIs

### Step 4: Consult Feature Documentation
1. **Documentation Index**: [docs/README.md](docs/README.md) - Complete guide catalog
2. **Feature Guides**: `docs/*_GUIDE.md` - Implementation details for each feature
   - `AUTHENTICATION_GUIDE.md` - Google OAuth (SSO only)
   - `CLOSET_GUIDE.md` - Digital wardrobe management
   - `CATALOG_GUIDE.md` - Pre-populated item catalog
   - `CATALOG_SEEDING.md` - **Bulk catalog upload from CSV**
   - `COLOR_DETECTION_GUIDE.md` - AI color recognition
   - `OUTFIT_GENERATION_GUIDE.md` - Smart outfit combinations
   - `SOCIAL_GUIDE.md` - Friends & social feed
   - `LIKES_GUIDE.md` - Like system
   - `NOTIFICATIONS_GUIDE.md` - Push notifications
   - `CATEGORIES_GUIDE.md` - Category & clothing types
3. **System Guides**: Architecture, user flows, database schema

### Step 5: Review Database Schema
1. **Database Guide**: [docs/DATABASE_GUIDE.md](docs/DATABASE_GUIDE.md) - Schema & migrations
2. **SQL Migrations**: `sql/*.sql` - 10 migration files (001-010)
3. **RLS Policies**: Check security rules in migration files

### Step 6: Execute Development
1. **Follow Code Standards**: [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md)
   - JSDoc for all functions
   - Vue component documentation
   - Naming conventions (camelCase, PascalCase, kebab-case)
   - File organization patterns
2. **Run Tests**: [docs/TESTS_GUIDE.md](docs/TESTS_GUIDE.md) - Unit, integration, E2E tests
3. **Update Documentation**: Keep all `.md` files in sync with changes

### Step 7: Verify & Deploy
1. **Testing**: Run test suite before committing
2. **Linting**: `npm run lint` - Check code standards
3. **Deployment**: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

---

## 📋 Critical Information for LLM Agents

### Authentication (CRITICAL)
- **Google OAuth ONLY** - No email/password, magic links, or other auth methods
- Login: `/login` page with "Sign in with Google" button
- Register: `/register` page with "Sign up with Google" button
- After auth: Redirect to `/closet` (home page)
- Implementation: `supabase.auth.signInWithOAuth({ provider: 'google' })`

### Code Standards (MANDATORY)
- **Never delete** any `.md` documentation files
- **Always follow** [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md)
- **SQL**: snake_case for tables/columns
- **JavaScript**: camelCase for variables/functions, PascalCase for components
- **CSS**: kebab-case with BEM methodology
- **Files**: kebab-case for file names
- **JSDoc**: Required for all exported functions
- **Vue Components**: Document props, emits, and usage

### File Organization
```
stylesnap/
├── docs/               # Feature guides & system documentation
├── tasks/              # Task implementation files (01-14)
├── requirements/       # Detailed requirement specifications
├── sql/                # Database migrations (001-010)
├── src/
│   ├── components/     # Vue components (organized by feature)
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── stores/         # Pinia state management
│   └── utils/          # Helper functions
├── tests/              # Unit, integration, E2E tests
└── scripts/            # Utility scripts
```

### Task Dependencies
- Tasks 1-7: Core MVP (✅ Complete)
- Task 8: Mobile mockups (⏳ Optional)
- Tasks 9-14: Enhanced features (✅ Complete)
- Check `TASKS.md` for detailed status

### Key Quotas & Limits
- **User Uploads**: 50 items max (images uploaded by user)
- **Catalog Additions**: Unlimited (pre-populated catalog items)
- **Total Closet**: 200 items max (uploads + catalog)
- **Image Size**: 1MB after resize
- **Friends**: Unlimited

---

## 🚀 Project Status

✅ **Production Ready** - All 14 tasks complete (73 issues fixed)

**Implemented Features**:
- 📱 PWA with offline support
- 🎨 200-item digital closet (50 uploads + unlimited catalog)
- 🤖 AI-powered outfit generation (permutation-based)
- 🎨 Automatic color detection (40+ colors)
- 🌤️ Weather-based recommendations
- 👥 Social features (friends, sharing, comments)
- 💙 Like system (items & outfits)
- 🔔 Push notifications (9 notification types)
- 📊 Analytics & insights
- 🔐 Google OAuth authentication (SSO only)
- 👕 20 granular clothing types
- 📚 Pre-populated item catalog

---

## 🛠️ Tech Stack

- **Frontend**: Vue.js 3 + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Storage**: Cloudinary (image hosting)
- **Auth**: Google OAuth 2.0 (SSO only)
- **Testing**: Vitest, Playwright
- **State Management**: Pinia
- **PWA**: Workbox, Web Push API
