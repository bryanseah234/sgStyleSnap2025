# 📚 StyleSnap Documentation Index

**Last Updated**: October 8, 2025

Welcome to the StyleSnap documentation! This directory contains comprehensive guides for all features in the application.

---

## 🤖 For LLM Agents: Documentation Navigation Guide

### How to Use This Documentation

**1. Start Here**:

- **First Time**: Read [../PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) for complete project overview
- **Finding Tasks**: Check [../TASKS.md](../TASKS.md) for task index, then read specific task file in `../tasks/*.md`
- **Finding Requirements**: Check [../REQUIREMENTS.md](../REQUIREMENTS.md), then read specific requirement in `../requirements/*.md`
- **API Reference**: Always use [../API_GUIDE.md](../API_GUIDE.md) as **SINGLE SOURCE OF TRUTH** for APIs

**2. Feature Implementation Workflow**:

```text
Step 1: Read task file (../tasks/XX-*.md)
  ↓
Step 2: Review requirements (../requirements/*.md)
  ↓
Step 3: Consult feature guide (docs/*_GUIDE.md) ← YOU ARE HERE
  ↓
Step 4: Check database schema (../DATABASE_GUIDE.md or ../sql/*.sql)
  ↓
Step 5: Review API endpoints (../API_GUIDE.md)
  ↓
Step 6: Follow code standards (./CODE_STANDARDS.md)
  ↓
Step 7: Implement & test (./TESTS_GUIDE.md)
```

**3. Quick Lookup Tables**:

| Need to... | Go to... |
|------------|----------|
| Understand auth flow | `AUTHENTICATION_GUIDE.md` |
| Work with closet/items | `CLOSET_GUIDE.md` |
| Implement catalog browsing | `CATALOG_GUIDE.md` |
| Add color detection | `COLOR_DETECTION_GUIDE.md` |
| Build outfit generation | `OUTFIT_GENERATION_GUIDE.md` |
| Create social features | `SOCIAL_GUIDE.md` |
| Add likes functionality | `LIKES_GUIDE.md` |
| Implement notifications | `NOTIFICATIONS_GUIDE.md` |
| Use categories/types | `CATEGORIES_GUIDE.md` |
| Understand architecture | `ARCHITECTURE.md` |
| Follow coding rules | `CODE_STANDARDS.md` (**MANDATORY**) |
| Set up database | `../DATABASE_GUIDE.md` |
| Run tests | `../TESTS_GUIDE.md` |
| Deploy to production | `../DEPLOYMENT_GUIDE.md` |

**4. Critical Rules**:

- ⚠️ **NEVER DELETE** any `.md` documentation files
- ⚠️ **ALWAYS FOLLOW** [CODE_STANDARDS.md](./CODE_STANDARDS.md) conventions
- ⚠️ **ALWAYS UPDATE** relevant documentation when changing code
- ⚠️ **ALWAYS CROSS-REFERENCE** between task files, requirements, and guides

---

## 🗂️ Feature Guides

### Core Features

#### [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)

Google OAuth 2.0 Authentication:

- Google OAuth SSO (exclusive auth method)
- Session management & token refresh
- User profile creation
- Row Level Security integration
- Environment setup

#### [CLOSET_GUIDE.md](./CLOSET_GUIDE.md)

Digital Wardrobe Management:

- Upload & manage clothing items (50 uploads + unlimited catalog)
- Image optimization (WebP, Cloudinary)
- Quota system (200 items total)
- Soft delete with 30-day recovery
- Favorite items, filtering, search
- Categories & clothing types

#### [CATALOG_GUIDE.md](./CATALOG_GUIDE.md)

Pre-Populated Clothing Catalog:

- Browse & search catalog items
- Add to closet (quota-free)
- Anonymous browsing (no owner attribution)
- Auto-contribution system
- Full-text search & filters
- Smart de-duplication

---

### AI & Intelligence

#### [COLOR_DETECTION_GUIDE.md](./COLOR_DETECTION_GUIDE.md)

AI-Powered Color Recognition:

- Automatic color detection (40+ colors)
- Primary & secondary color identification
- Color harmony algorithms (complementary, analogous, triadic)
- Manual color override
- Color-based filtering
- Analytics & insights

#### [OUTFIT_GENERATION_GUIDE.md](./OUTFIT_GENERATION_GUIDE.md)

Smart Outfit Combinations:

- Permutation-based algorithm (no ML)
- Category-aware combinations
- Color harmony scoring
- Weather & occasion filtering
- Style matching
- Performance optimized

---

### Social Features

#### [SOCIAL_GUIDE.md](./SOCIAL_GUIDE.md)

Friends & Social Feed:

- Friend requests & management
- Canonical friendship storage
- Outfit sharing to friends
- Comments & interactions
- Real-time feed updates
- Privacy controls

#### [LIKES_GUIDE.md](./LIKES_GUIDE.md)

Like System:

- Like items & outfits
- Real-time like counts
- View likers list
- Popular items carousel
- Friend-only liking
- Notification integration

#### [NOTIFICATIONS_GUIDE.md](./NOTIFICATIONS_GUIDE.md)

In-App & Push Notifications:

- Real-time WebSocket notifications
- Browser push notifications (Web Push API)
- 9 notification types
- User preferences & quiet hours
- Multi-device support
- Delivery tracking & analytics

---

### System Guides

#### [CATEGORIES_GUIDE.md](./CATEGORIES_GUIDE.md)

Category System:

- 7 main categories
- 20 detailed clothing types
- Two-tier system
- Database functions
- Frontend helpers
- Extensible design

#### [ARCHITECTURE.md](./ARCHITECTURE.md)

System Architecture:

- Component diagrams
- Class diagrams
- Sequence diagrams
- Data flow
- Technology stack
- Deployment architecture

#### [USER_FLOWS.md](./USER_FLOWS.md)

User Journey Maps:

- Authentication flow
- Closet management flow
- Outfit generation flow
- Social features flow
- Notification flow
- Error handling flows

---

## 📖 Additional Documentation

### Development

- **[CODE_STANDARDS.md](./CODE_STANDARDS.md)** - Coding conventions & style guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[../API_GUIDE.md](../API_GUIDE.md)** - Complete API reference
- **[../DATABASE_GUIDE.md](../DATABASE_GUIDE.md)** - Database schema & migrations
- **[../TESTS_GUIDE.md](../TESTS_GUIDE.md)** - Testing documentation

### Setup & Deployment

- **[../REQUIREMENTS.md](../REQUIREMENTS.md)** - Feature requirements
- **[../CREDENTIALS_SETUP.md](../CREDENTIALS_SETUP.md)** - API keys & credentials
- **[../DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)** - Production deployment
- **[../PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md)** - Project overview
- **[../README.md](../README.md)** - Quick start guide

---

## 🗺️ Documentation Map

```text
docs/
├── README.md (this file)
├── Feature Guides:
│   ├── AUTHENTICATION_GUIDE.md
│   ├── CLOSET_GUIDE.md
│   ├── CATALOG_GUIDE.md
│   ├── COLOR_DETECTION_GUIDE.md
│   ├── OUTFIT_GENERATION_GUIDE.md
│   ├── SOCIAL_GUIDE.md
│   ├── LIKES_GUIDE.md
│   ├── NOTIFICATIONS_GUIDE.md
│   └── CATEGORIES_GUIDE.md
├── System Guides:
│   ├── ARCHITECTURE.md
│   ├── USER_FLOWS.md
│   ├── CODE_STANDARDS.md
│   └── CONTRIBUTING.md
└── design/
    ├── DESIGN_REFERENCE.md
    └── mobile-mockups/
```

---

## 🎯 Quick Navigation

### By User Role

**New Developers**:

1. Start with [../PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md)
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Review [CODE_STANDARDS.md](./CODE_STANDARDS.md)
4. Check [../API_GUIDE.md](../API_GUIDE.md)

**Feature Developers**:

1. Find your feature guide above
2. Check [../DATABASE_GUIDE.md](../DATABASE_GUIDE.md) for schema
3. Review [../TESTS_GUIDE.md](../TESTS_GUIDE.md) for testing
4. See [USER_FLOWS.md](./USER_FLOWS.md) for UX

**DevOps/Infrastructure**:

1. Read [../DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
2. Check [../CREDENTIALS_SETUP.md](../CREDENTIALS_SETUP.md)
3. Review [ARCHITECTURE.md](./ARCHITECTURE.md) deployment section

---

## 📝 Documentation Standards

### File Naming Convention

- Feature guides: `FEATURENAME_GUIDE.md` (e.g., `CLOSET_GUIDE.md`)
- System docs: `DESCRIPTIVE_NAME.md` (e.g., `ARCHITECTURE.md`)
- Always UPPERCASE with underscores

### Content Structure

1. **Overview** - High-level summary
2. **Features** - Key capabilities
3. **How It Works** - Technical explanation
4. **Database Schema** - Tables & fields
5. **API/Services** - Functions & usage
6. **UI Components** - Component reference
7. **Testing** - Test guidelines
8. **Related Documentation** - Cross-references
9. **Status** - Implementation status

### Cross-References

- Use relative links: `[GUIDE](./GUIDE.md)`
- Link to parent docs: `[../FILE.md](../FILE.md)`
- Reference specific sections: `[Title](./FILE.md#section)`

---

## 🔍 Search Tips

### Find Documentation By Feature Name

**Feature Name**:

- Authentication → `AUTHENTICATION_GUIDE.md`
- Closet → `CLOSET_GUIDE.md`
- Catalog → `CATALOG_GUIDE.md`
- Colors → `COLOR_DETECTION_GUIDE.md`
- Outfits → `OUTFIT_GENERATION_GUIDE.md`
- Social/Friends → `SOCIAL_GUIDE.md`
- Likes → `LIKES_GUIDE.md`
- Notifications → `NOTIFICATIONS_GUIDE.md`

**Component Type**:

- Database schemas → Feature guides or `../DATABASE_GUIDE.md`
- API endpoints → `../API_GUIDE.md`
- Services → Feature guides (API section)
- Vue components → Feature guides (UI section)
- Tests → `../TESTS_GUIDE.md`

**Task/Implementation**:

- Task files → `../tasks/*.md`
- Requirements → `../requirements/*.md`
- SQL migrations → `../sql/*.sql`

---

## 🆕 What's New (October 2025)

### Documentation Reorganization

- ✅ Consolidated all feature docs into `*_GUIDE.md` format
- ✅ Created comprehensive documentation index (this file)
- ✅ Removed redundant/outdated docs
- ✅ Updated all cross-references across codebase
- ✅ Standardized naming conventions

### New Guides

- ✅ `AUTHENTICATION_GUIDE.md` - Complete auth documentation
- ✅ `CLOSET_GUIDE.md` - Comprehensive closet guide
- ✅ `CATALOG_GUIDE.md` - Catalog system guide
- ✅ `COLOR_DETECTION_GUIDE.md` - Color AI guide
- ✅ `NOTIFICATIONS_GUIDE.md` - Unified notifications guide
- ✅ `LIKES_GUIDE.md` - Like system guide

### Updated Guides

- ✅ Renamed `OUTFIT_GENERATION.md` → `OUTFIT_GENERATION_GUIDE.md`
- ✅ Renamed `CATEGORIES.md` → `CATEGORIES_GUIDE.md`
- ✅ Renamed `SOCIAL_FEED.md` → `SOCIAL_GUIDE.md`

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/StyleSnap/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/StyleSnap/discussions)
- **Email**: <support@stylesnap.app>

---

## 📜 License

See [../LICENSE](../LICENSE) for details.

---

Happy coding! 🚀
