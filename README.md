# StyleSnap - Digital Closet & Outfit Planner

> **A Progressive Web App for managing your wardrobe, getting AI-powered outfit suggestions, and sharing style ideas with friends.**

---

## 🎯 Project Overview

StyleSnap is a production-ready PWA that helps users digitize their wardrobe, receive weather-based outfit suggestions, track wear history, and share outfit ideas with friends. Built with Vue.js 3, Supabase, and Cloudinary.

### Key Features
- 📱 **PWA with Offline Support** - Installable, works offline, mobile-optimized
- 👔 **200-Item Digital Closet** - Upload & organize clothing with categories, tags, and filters
- 🤖 **AI-Powered Suggestions** - Weather-based outfit recommendations with learning
- 🌤️ **Weather Integration** - Real-time weather data for smart outfit suggestions
- 👥 **Social Features** - Friend system with outfit sharing and privacy controls
- 🔔 **Push Notifications** - Real-time alerts for friend requests, likes, comments
- 📊 **Analytics & Insights** - Wear tracking, most-worn items, outfit collections
- 🔐 **Google OAuth** - Secure authentication with session management
- 📈 **Performance Optimized** - Lazy loading, virtual scrolling, image optimization

---

## 📚 Documentation Structure

**START HERE for all development:**

### 1. **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** 📖
   - **Complete file structure** and codebase overview
   - Technology stack and architecture
   - Code conventions (snake_case SQL, camelCase JS, etc.)
   - Documentation index with links to all resources
   - **Read this first** to understand the project layout

### 2. **[REQUIREMENTS.md](REQUIREMENTS.md)** 📋
   - **Index of all requirement documents**
   - Quick reference (quotas, limits, categories)
   - Links to detailed requirements:
     - `requirements/database-schema.md` - Database structure
     - `requirements/api-endpoints.md` - Complete API specs
     - `requirements/frontend-components.md` - Component requirements
     - `requirements/security.md` - Security implementation
     - `requirements/error-handling.md` - Error patterns
     - `requirements/performance.md` - Performance targets

### 3. **[TASKS.md](TASKS.md)** ✅
   - **Index of all implementation tasks**
   - Task order (1-8) with dependencies
   - Links to detailed task files:
     - `tasks/01-infrastructure-setup.md`
     - `tasks/02-authentication-database.md`
     - `tasks/03-closet-crud-image-management.md`
     - `tasks/04-social-features-privacy.md`
     - `tasks/05-suggestion-system.md`
     - `tasks/06-quotas-maintenance.md`
     - `tasks/07-qa-security-launch.md`
     - `tasks/08-mobile-mockups.md` (Optional design reference)

### 4. **Technical Documentation**
   - `docs/CODE_STANDARDS.md` - Coding conventions and best practices
   - `docs/API_REFERENCE.md` - Complete API endpoint documentation
   - `docs/CONTRIBUTING.md` - How to contribute
   - `docs/DEPLOYMENT.md` - Production deployment guide
   - `docs/design/DESIGN_REFERENCE.md` - Mobile UI mockup documentation

---

## 🤖 Instructions for LLM Agents

### ⚠️ CRITICAL: Read This Before Starting

**You are an AI coding assistant working on the StyleSnap codebase. Follow these rules:**

### 1. **Always Start with Context**
```
Step 1: Read PROJECT_CONTEXT.md → Understand the codebase structure
Step 2: Read REQUIREMENTS.md → Understand what needs to be built
Step 3: Read TASKS.md → Understand implementation order
Step 4: Read specific task/requirement files → Get detailed specs
```

### 2. **Never Make Assumptions - ALWAYS Verify First**
- ❌ **DON'T** assume features exist without checking code
- ❌ **DON'T** assume files don't exist without searching
- ❌ **DON'T** create files without checking existing structure
- ❌ **DON'T** deviate from requirements without asking
- ✅ **DO** read the relevant requirement/task files first
- ✅ **DO** search for existing implementations before building
- ✅ **DO** ask for clarification if instructions are unclear
- ✅ **DO** follow existing code conventions (see `docs/CODE_STANDARDS.md`)

**Before claiming a file doesn't exist:**
```bash
# Check common documentation locations
tree docs/           # Standards, deployment, API docs, design
tree requirements/   # Detailed requirements
tree tasks/          # Task breakdowns
tree sql/            # Database schemas
find . -name "filename.md"  # Search for specific files
```

### 3. **Always Follow This Workflow**

**For ANY task:**
```
1. VERIFY files exist (use tree/find commands)
2. Read the task file (tasks/##-task-name.md)
3. Read related requirements (requirements/*.md)
4. Check existing code (grep/search - don't duplicate)
5. Verify dependencies are met
6. Implement following conventions (docs/CODE_STANDARDS.md)
7. Test against acceptance criteria
```

**Example: Adding a new API endpoint**
```
1. Read: requirements/api-endpoints.md
2. Check: SQL schema in sql/*.sql
3. Verify: RLS policies exist
4. Verify: Error handling patterns
5. Implement: Following API template
6. Test: Against security requirements
```

### 4. **Stick to Requirements - No Exceptions**
- **Max Items per User:** 200 (HARD LIMIT)
- **Image Size Limit:** 1MB after client-side resize
- **Supported Categories:** top, bottom, outerwear, shoes, accessory (ONLY)
- **Privacy Levels:** private, friends (ONLY)
- **Friend Status:** pending, accepted, rejected (ONLY)

**If requirement conflicts with request:**
- ❌ **DON'T** implement the conflicting feature
- ✅ **DO** explain the conflict and ask for guidance
- ✅ **DO** reference the specific requirement document

### 5. **Always Provide Solutions**
- ✅ **DO** suggest alternatives if a request isn't feasible
- ✅ **DO** explain trade-offs and implications
- ✅ **DO** offer multiple approaches when appropriate
- ✅ **DO** reference existing patterns in codebase

**Example:**
```
User: "Can I add unlimited items?"
Bad: "No, that's not possible."
Good: "The system has a 200-item quota (see REQUIREMENTS.md). 
       This is for:
       1. Cloudinary free tier limits
       2. Performance (virtual scrolling)
       3. User experience (curated closet)
       
       Alternatives:
       - Implement item rotation/archiving
       - Allow users to 'remove' old items
       - Suggest creating collections for different seasons"
```

### 6. **Ask for Clarification When Unsure**
- ✅ **DO** ask specific questions with context
- ✅ **DO** reference the relevant documentation
- ✅ **DO** suggest what you think the answer might be

**Example:**
```
Bad: "What should I do here?"
Good: "I'm implementing the outfit suggestion feature (Task 5).
       The requirement says 'max 10 items per suggestion'
       (requirements/api-endpoints.md line 558).
       
       Question: Should this be enforced:
       a) Client-side only (UX warning)
       b) Database constraint (hard limit)
       c) Both (recommended)
       
       I suggest option (c) for security. Confirm?"
```

### 7. **Code Conventions (ALWAYS Follow)**
```javascript
// SQL
snake_case for tables/columns

// JavaScript
camelCase for variables/functions
PascalCase for components/classes

// CSS
kebab-case for class names

// Files
kebab-case for file names
```

**⚠️ Read the complete guidelines:**
- **File location:** `docs/CODE_STANDARDS.md` (550+ lines)
- **Includes:** JSDoc standards, Vue documentation, naming conventions
- **NEVER assume this file doesn't exist - it's in the `docs/` folder!**

### 8. **Security First**
- ✅ **Always** check RLS policies exist (sql/002_rls_policies.sql)
- ✅ **Always** validate user inputs
- ✅ **Always** use parameterized queries
- ✅ **Always** enforce privacy boundaries
- ✅ **Always** check quota limits

See `requirements/security.md` for complete security requirements.

### 9. **Error Handling Patterns**
- ✅ **Always** provide user-friendly error messages
- ✅ **Always** implement proper loading states
- ✅ **Always** handle offline scenarios
- ✅ **Always** log errors for debugging

**⚠️ Read the complete patterns:**
- **File location:** `requirements/error-handling.md`
- **Check it exists:** `tree requirements/` or `find . -name "error-handling.md"`

### 10. **Performance Requirements**
- ✅ **Always** implement lazy loading for images
- ✅ **Always** use virtual scrolling for large lists (200 items)
- ✅ **Always** optimize images (Cloudinary transformations)
- ✅ **Always** implement pagination for API calls

**⚠️ Read the complete requirements:**
- **File location:** `requirements/performance.md`
- **Check it exists:** `tree requirements/` or `find . -name "performance.md"`

---

## 🛠️ Development Workflow

### For New Features

1. **Check if it exists (CRITICAL STEP):**
   ```bash
   # Search codebase for feature
   grep -r "feature_name" src/
   
   # Check if documentation exists
   tree docs/
   tree requirements/
   tree tasks/
   
   # Search for specific files
   find . -name "*feature*"
   ```

2. **Create/Update Task File:**
   - Add to `tasks/` if it's a major feature
   - Follow format of existing tasks (01-07)
   - Reference requirements: `[REQ: requirement-name#section]`

3. **Create/Update Requirement File:**
   - Add to `requirements/` for detailed specs
   - Include API endpoints, DB schema, component specs
   - Reference tasks: `[TASK: task-name#section]`

4. **Implement Following Structure:**
   ```
   sql/          → Database changes
   src/services/ → API integration
   src/stores/   → State management
   src/pages/    → Route components
   src/components/ → Reusable components
   ```

5. **Test Against Acceptance Criteria:**
   - Check task file for acceptance criteria
   - Verify all requirements met
   - Test security (RLS, quotas, privacy)

### For Bug Fixes

1. **Identify the Issue:**
   - Check error logs
   - Review related requirement (verify file exists first!)
   - Check security implications

2. **Locate the Code:**
   - **First:** Check `PROJECT_CONTEXT.md` for file structure
   - **Then:** Use `grep -r "pattern" src/` to find relevant code
   - **Verify:** Use `tree` to see actual directory structure
   - **Review:** Check related components (don't assume they exist)

3. **Fix Following Standards:**
   - Follow `docs/CODE_STANDARDS.md` (verify it exists: `ls docs/CODE_STANDARDS.md`)
   - Maintain existing patterns (grep for similar implementations)
   - Add error handling if missing (check `requirements/error-handling.md`)

4. **Verify Fix:**
   - Test the specific scenario
   - Check for regressions (test related features)
   - Verify security still intact (check `requirements/security.md`)
   - Document what was fixed

---

## 📊 Project Status

### Implementation Status
- **Tasks 1-7:** ✅ Complete (Core features implemented)
- **Task 8:** ⏳ Optional (Mobile mockup documentation)
- **Database:** ✅ Complete (4 migrations: schema, RLS, indexes, advanced features)
- **API Endpoints:** ✅ Complete (60+ endpoints documented)
- **Frontend:** ✅ Complete (Vue 3 + mobile-first design)
- **PWA:** ✅ Complete (Offline, push notifications, installable)
- **Security:** ✅ Complete (RLS, OAuth, input validation)
- **Performance:** ✅ Complete (Lazy loading, virtual scroll, Core Web Vitals)

### Database Tables
- `users` - User accounts (Google OAuth)
- `clothes` - Clothing items (max 200 per user)
- `friends` - Friend relationships
- `suggestions` - Outfit suggestions between friends
- `outfit_history` - Wear tracking and analytics
- `outfit_collections` - Curated outfit collections
- `user_preferences` - Style and AI learning data
- `suggestion_feedback` - Like/dislike tracking
- `social_feed_posts` - Public outfit sharing

### Current Capabilities
- ✅ User authentication with Google OAuth
- ✅ Clothing item CRUD with image upload (Cloudinary)
- ✅ Friend system with privacy controls
- ✅ Outfit suggestion creation and management
- ✅ Weather-based AI suggestions
- ✅ Wear history tracking and analytics
- ✅ Outfit collections and lookbooks
- ✅ Social feed for sharing outfits
- ✅ Push notifications
- ✅ Offline mode with sync
- ✅ Mobile-optimized PWA

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Cloudinary account
- Google OAuth credentials
- OpenWeatherMap API key (for weather integration)

### Environment Setup
```bash
# Copy example environment file
cp .env.example .env

# Fill in credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_OPENWEATHER_API_KEY=your_weather_api_key
```

### Database Setup
```bash
# Run migrations in order
psql -d your_database -f sql/001_initial_schema.sql
psql -d your_database -f sql/002_rls_policies.sql
psql -d your_database -f sql/003_indexes_functions.sql
psql -d your_database -f sql/004_advanced_features.sql
```

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 🔑 Key Constraints & Limits

| Constraint | Value | Reason |
|------------|-------|--------|
| Max Items per User | 200 | Cloudinary free tier, performance, UX |
| Max Image Size | 1MB | After client-side resize, Cloudinary limits |
| Max Suggestion Items | 10 | UX consideration, mobile performance |
| Max Message Length | 100 chars | Quick comments, mobile-friendly |
| Supported Categories | 5 | top, bottom, outerwear, shoes, accessory |
| Privacy Levels | 2 | private (owner only), friends (friends can see) |
| Friend Status | 3 | pending, accepted, rejected |
| Item Purge | 30 days | Auto-delete removed items after 30 days |

---

## 📁 File Structure (Key Directories)

```
stylesnap/
├── docs/                      # Documentation
│   ├── design/                # Mobile UI mockups (reference only)
│   ├── CODE_STANDARDS.md      # Coding conventions
│   ├── API_REFERENCE.md       # API documentation
│   ├── CONTRIBUTING.md        # Contribution guidelines
│   └── DEPLOYMENT.md          # Deployment guide
├── requirements/              # Detailed requirement specifications
├── tasks/                     # Detailed implementation tasks
├── sql/                       # Database migrations
├── src/
│   ├── assets/styles/         # CSS (including mobile.css)
│   ├── components/            # Vue components
│   ├── pages/                 # Route components
│   ├── stores/                # Pinia state management
│   ├── services/              # API integration
│   └── utils/                 # Utility functions
├── public/                    # PWA assets (manifest, service worker)
├── PROJECT_CONTEXT.md         # START HERE - Project overview
├── REQUIREMENTS.md            # Requirements index
├── TASKS.md                   # Tasks index
└── README.md                  # This file
```

---

## 🎨 Tech Stack

### Frontend
- **Framework:** Vue.js 3 (Composition API)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Custom mobile.css
- **State Management:** Pinia
- **Routing:** Vue Router
- **PWA:** Workbox (service worker, manifest)
- **Offline Storage:** IndexedDB
- **Image Compression:** browser-image-compression
- **Drag & Drop:** vue-draggable

### Backend
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth (Google OAuth)
- **Storage:** Cloudinary (image hosting & CDN)
- **APIs:** 
  - OpenWeatherMap (weather data)
  - Web Push API (notifications)

### Infrastructure
- **Hosting:** TBD (Vercel, Netlify, or similar)
- **Database:** Supabase (managed PostgreSQL)
- **CDN:** Cloudinary
- **Monitoring:** Core Web Vitals tracking

---

## ⚠️ Known Limitations

### Current Scope (MVP Features Only)
- ❌ No item catalog/database of suggested items (see "Missing Features" below)
- ❌ No color detection/recognition AI
- ❌ No outfit generation from scratch
- ❌ No shopping/e-commerce integration
- ❌ No user-generated tags (predefined only)
- ❌ No outfit rating system (planned for future)

### Intentional Design Decisions
- **200-item quota:** Prevents database bloat, Cloudinary limits
- **Friends-only privacy:** No public profiles (privacy-first)
- **Manual item upload:** Users photograph/upload their own clothes
- **Simple categories:** 5 categories only (extensible in future)

---

## 🆕 Missing Features (Potential Future Additions)

### 1. **Item Catalog / Suggested Items Database**

**Current State:** ❌ **NOT IMPLEMENTED**

**What's Missing:**
- No pre-populated database of clothing items
- No way to browse/add items without uploading photos
- No stock photos or template items
- Users MUST upload their own clothing photos

**Why It's Missing:**
- Not part of original MVP scope
- Focuses on personal wardrobe digitization
- Avoids legal issues with stock photos
- Simplifies initial database design

**To Implement This Feature (Instructions for Future LLM):**

1. **Create New Task File:**
   ```
   tasks/09-item-catalog-system.md
   ```

2. **Create New Requirement File:**
   ```
   requirements/item-catalog.md
   ```

3. **Database Changes Needed:**
   ```sql
   -- New table for catalog items
   CREATE TABLE catalog_items (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name VARCHAR(255) NOT NULL,
     category VARCHAR(50) NOT NULL,
     image_url TEXT NOT NULL,
     thumbnail_url TEXT NOT NULL,
     tags TEXT[],
     brand VARCHAR(100),
     color VARCHAR(50),
     season VARCHAR(20),
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Link user items to catalog (optional)
   ALTER TABLE clothes ADD COLUMN catalog_item_id UUID REFERENCES catalog_items(id);
   ```

4. **API Endpoints Needed:**
   - `GET /api/catalog` - Browse catalog with pagination, filtering
   - `GET /api/catalog/:id` - Get catalog item details
   - `POST /api/catalog/:id/add-to-closet` - Add catalog item to user's closet

5. **Frontend Components Needed:**
   - `src/pages/CatalogBrowse.vue` - Browse catalog page
   - `src/components/catalog/CatalogGrid.vue` - Catalog item grid
   - `src/components/catalog/CatalogFilter.vue` - Filter sidebar
   - `src/components/catalog/CatalogItemCard.vue` - Individual item card

6. **Implementation Considerations:**
   - **Pagination:** Essential (could be thousands of items)
   - **Filtering:** Category, color, brand, season, tags
   - **Search:** Full-text search on name, tags, brand
   - **Quota:** Adding from catalog still counts toward 200-item limit
   - **Image Licensing:** Must use properly licensed stock photos
   - **Performance:** Implement lazy loading, virtual scrolling

7. **Mobile Mockup Needed:**
   - `36-catalog-browse.png` - Catalog browsing screen
   - Add to `tasks/08-mobile-mockups.md`

**Reference Documentation:**
- Follow patterns in `requirements/api-endpoints.md`
- Follow component patterns in `requirements/frontend-components.md`
- Check security requirements in `requirements/security.md`
- Follow task structure in `tasks/01-infrastructure-setup.md`

---

## 🆘 Getting Help

### For LLM Agents

**If you're stuck:**
1. ✅ Re-read the relevant task/requirement file
2. ✅ Check PROJECT_CONTEXT.md for file structure
3. ✅ Search codebase for similar implementations
4. ✅ Ask specific questions with context
5. ✅ Reference exact file names and line numbers

**Good Question Format:**
```
I'm implementing [feature] from [task-file.md section #].
The requirement says [quote requirement].
I found [existing code] at [file path].

Question: Should I [option A] or [option B]?
I think [option A] because [reasoning].

Context:
- Related files: [list]
- Dependencies: [list]
- Security concern: [if any]
```

### For Developers

- 📖 Read documentation files first
- 💬 Check code comments for context
- 🔍 Use grep/search to find examples
- 📝 Follow CODE_STANDARDS.md conventions
- 🔐 Always verify security implications

---

**Built with ❤️ for StyleSnap** 

*Last Updated: October 5, 2025*
