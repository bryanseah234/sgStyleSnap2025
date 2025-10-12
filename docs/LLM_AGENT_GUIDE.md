# LLM Agent Guide - StyleSnap Repository

**Last Updated**: October 8, 2025

This guide is specifically designed for LLM agents (AI assistants) working with the StyleSnap codebase. Follow this structured approach to navigate the repository, understand requirements, and execute tasks effectively.

---

## 🎯 Quick Start: 5-Minute Orientation

### 1. What is StyleSnap?

A Progressive Web App (PWA) for managing digital wardrobes with AI-powered outfit suggestions. Built with Vue.js 3, Supabase, and Cloudinary.

### 2. Current Status

✅ **Production Ready** - All 14 tasks complete
- Core MVP: Tasks 1-7 (complete)
- Enhanced Features: Tasks 9-14 (complete)
- Task 8: Mobile mockups (optional, reference only)

### 3. Essential Files to Read First

1. **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** - Complete file structure and tech stack
2. **[docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md)** - **MANDATORY** coding conventions
3. **[API_GUIDE.md](API_GUIDE.md)** - **SINGLE SOURCE OF TRUTH** for all APIs
4. **[TASKS.md](TASKS.md)** - Task index with status
5. **[REQUIREMENTS.md](REQUIREMENTS.md)** - Core requirements overview

---

## 📚 Documentation Structure

### Primary Documentation Files (Root Level)

```text
/
├── README.md              # LLM agent quick start (you read this first!)
├── LLM_AGENT_GUIDE.md     # This file - comprehensive agent guide
├── PROJECT_CONTEXT.md     # Complete project overview & file structure
├── REQUIREMENTS.md        # Requirements index
├── TASKS.md               # Task index with implementation status
├── API_GUIDE.md           # **SINGLE SOURCE OF TRUTH** for all APIs
└── DATABASE_GUIDE.md      # Database schema & migrations
```

### Task Files

```text
tasks/
├── 01-infrastructure-setup.md         # ✅ Complete
├── 02-authentication-database.md      # ✅ Complete
├── 03-closet-crud-image-management.md # ✅ Complete
├── 04-social-features-privacy.md      # ✅ Complete
├── 05-suggestion-system.md            # ✅ Complete
├── 06-quotas-maintenance.md           # ✅ Complete
├── 07-qa-security-launch.md           # ✅ Complete
├── 08-mobile-mockups.md               # ⏳ Optional (design reference)
├── 09-item-catalog-system.md          # ✅ Complete
├── 10-color-detection-ai.md           # ✅ Complete
├── 11-outfit-generation.md            # ✅ Complete
├── 12-likes-feature.md                # ✅ Complete
├── 13-advanced-outfit-features.md     # ✅ Complete
└── 14-notification-system.md          # ✅ Complete
```

### Requirement Files

```text
requirements/
├── database-schema.md      # Database design
├── frontend-components.md  # UI component specs
├── security.md             # Security requirements
├── error-handling.md       # Error handling patterns
├── performance.md          # Performance requirements
├── item-catalog.md         # Catalog system specs
├── color-detection.md      # Color AI specs
└── outfit-generation.md    # Outfit generation specs
```

### Feature Documentation (docs/)

```text
docs/
├── README.md                       # Documentation index
├── CODE_STANDARDS.md              # **MANDATORY** coding rules
├── AUTHENTICATION_GUIDE.md        # Google OAuth (SSO only)
├── CLOSET_GUIDE.md                # Digital wardrobe
├── CATALOG_GUIDE.md               # Pre-populated catalog
├── COLOR_DETECTION_GUIDE.md       # AI color recognition
├── OUTFIT_GENERATION_GUIDE.md     # Smart outfits
├── SOCIAL_GUIDE.md                # Friends & feed
├── LIKES_GUIDE.md                 # Like system
├── NOTIFICATIONS_GUIDE.md         # Push notifications
├── CATEGORIES_GUIDE.md            # Category system
├── ARCHITECTURE.md                # System architecture
├── USER_FLOWS.md                  # User journey maps
├── CONTRIBUTING.md                # Contribution guide
├── DEPLOYMENT_GUIDE.md            # Production deployment
├── TESTS_GUIDE.md                 # Testing documentation
└── design/                        # Design mockups
```

### SQL Migrations

```text
sql/
├── 001_initial_schema.sql         # Users, clothes, friends, suggestions
├── 002_rls_policies.sql           # Row Level Security
├── 003_indexes_functions.sql      # Performance optimization
├── 004_advanced_features.sql      # Collections, sharing, preferences
├── 005_catalog_system.sql         # Pre-populated catalog
├── 006_color_detection.sql        # Color AI fields
├── 007_outfit_generation.sql      # Outfit generation
├── 008_likes_feature.sql          # Like system
├── 009_notifications_system.sql   # Notifications
└── 010_push_notifications.sql     # Push subscriptions
```

---

## 🔄 Standard Workflow for Task Execution

### Phase 1: Discovery & Understanding

```text
1. Read Task File (tasks/XX-*.md)
   ├─ Understand objectives
   ├─ Note dependencies
   └─ Check status markers

2. Review Requirements (requirements/*.md)
   ├─ Technical specifications
   ├─ Business rules
   └─ Constraints

3. Consult Feature Guide (docs/*_GUIDE.md)
   ├─ Implementation details
   ├─ Architecture
   └─ Best practices

4. Check Database Schema
   ├─ SQL migration files (sql/*.sql)
   └─ DATABASE_GUIDE.md for reference

5. Review API Reference (API_GUIDE.md)
   ├─ **SINGLE SOURCE OF TRUTH**
   ├─ Endpoint definitions
   └─ Request/response formats
```

### Phase 2: Implementation

```text
1. Follow Code Standards (docs/CODE_STANDARDS.md)
   ├─ Naming conventions
   ├─ File organization
   ├─ JSDoc documentation
   └─ Vue component structure

2. Write Code
   ├─ Follow existing patterns
   ├─ Add JSDoc comments
   ├─ Handle errors properly
   └─ Optimize for performance

3. Update Tests (docs/TESTS_GUIDE.md)
   ├─ Unit tests
   ├─ Integration tests
   └─ E2E tests (if applicable)
```

### Phase 3: Documentation & Validation

```text
1. Update Documentation
   ├─ Feature guides (docs/*_GUIDE.md)
   ├─ API_GUIDE.md (if API changes)
   ├─ README.md (if user-facing)
   └─ Inline code comments

2. Run Tests
   ├─ npm run test (unit + integration)
   └─ npm run test:e2e (E2E tests)

3. Check Linting
   └─ npm run lint

4. Verify Changes
   ├─ Test manually
   ├─ Check for regressions
   └─ Review documentation accuracy
```

---

## 🚨 Critical Rules (MUST FOLLOW)

### Authentication

- ⚠️ **Google OAuth ONLY** - No email/password, magic links, or other methods
- Login: `/login` with "Sign in with Google"
- Register: `/register` with "Sign up with Google"
- Redirect: After auth → `/closet` (home page)

### Code Standards

- ⚠️ **NEVER DELETE** any `.md` documentation files
- ⚠️ **ALWAYS FOLLOW** [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md)
- ⚠️ **ALWAYS ADD** JSDoc comments to all exported functions
- ⚠️ **ALWAYS UPDATE** documentation when changing code
- ⚠️ **NEVER COMMIT** without running tests and linting

### Naming Conventions

- **SQL**: snake_case (tables, columns, functions)
- **JavaScript**: camelCase (variables, functions), PascalCase (components, classes)
- **CSS**: kebab-case with BEM methodology
- **Files**: kebab-case
- **Constants**: UPPER_SNAKE_CASE

### File Organization

- Services: `src/services/*.js`
- Stores: `src/stores/*.js` (Pinia)
- Components: `src/components/*/*.vue` (organized by feature)
- Pages: `src/pages/*.vue`
- Utils: `src/utils/*.js`
- Tests: `tests/unit/`, `tests/integration/`, `tests/e2e/`

---

## 🗺️ Quick Reference: Find What You Need

### By Feature

| Feature | Task File | Requirement | Guide | SQL |
|---------|-----------|-------------|-------|-----|
| Auth | 02 | requirements/security.md | AUTHENTICATION_GUIDE.md | 001, 002 |
| Closet | 03 | requirements/database-schema.md | CLOSET_GUIDE.md | 001-003 |
| Catalog | 09 | requirements/item-catalog.md | CATALOG_GUIDE.md | 005 |
| Colors | 10 | requirements/color-detection.md | COLOR_DETECTION_GUIDE.md | 006 |
| Outfits | 11 | requirements/outfit-generation.md | OUTFIT_GENERATION_GUIDE.md | 007 |
| Social | 04 | requirements/frontend-components.md | SOCIAL_GUIDE.md | 001, 004 |
| Likes | 12 | - | LIKES_GUIDE.md | 008 |
| Notifications | 14 | - | NOTIFICATIONS_GUIDE.md | 009, 010 |

### By Component Type

| Component | Location | Documentation |
|-----------|----------|---------------|
| Database schemas | `sql/*.sql` | DATABASE_GUIDE.md |
| API endpoints | `src/services/*.js` | API_GUIDE.md |
| State management | `src/stores/*.js` | Feature guides |
| Vue components | `src/components/` | Feature guides |
| Pages | `src/pages/` | USER_FLOWS.md |
| Tests | `tests/` | TESTS_GUIDE.md |

### By Task Type

| Need to... | Go to... |
|------------|----------|
| Add new feature | Find task in TASKS.md → Read task file → Follow workflow |
| Fix bug | Find relevant feature guide → Check code → Update tests |
| Add API endpoint | API_GUIDE.md → Follow patterns → Update docs |
| Update database | DATABASE_GUIDE.md → Create migration → Update schema |
| Write tests | TESTS_GUIDE.md → Follow patterns → Run test suite |
| Deploy | DEPLOYMENT_GUIDE.md → Follow checklist |

---

## 💡 Best Practices for LLM Agents

### 1. Always Read Context First

Don't assume - read the relevant documentation before making changes:

- Task files explain **what** to build
- Requirements explain **why** and **how**
- Feature guides explain **implementation details**
- Code standards explain **coding rules**

### 2. Follow Existing Patterns

Look for similar implementations in the codebase:

- Services: Check existing service files for patterns
- Components: Review similar components
- Tests: Follow existing test structure
- SQL: Match existing migration patterns

### 3. Document Everything

- Add JSDoc comments to all functions
- Update feature guides when adding features
- Keep API_GUIDE.md in sync with code
- Update README.md if user-facing changes

### 4. Test Thoroughly

- Write unit tests for services and utilities
- Add integration tests for API endpoints
- Consider E2E tests for critical user flows
- Run full test suite before committing

### 5. Handle Errors Properly

- Use try-catch blocks appropriately
- Return meaningful error messages
- Log errors for debugging
- Follow error handling patterns in requirements/error-handling.md

### 6. Optimize for Performance

- Use indexes in database queries
- Implement pagination for large datasets
- Optimize images (Cloudinary transformations)
- Use virtual scrolling for long lists
- Follow performance guidelines in requirements/performance.md

---

## 🔍 Common Scenarios

### Scenario 1: "Add a new feature"

```text
1. Check if task exists (TASKS.md)
2. Read task file (tasks/XX-*.md)
3. Review requirements (requirements/*.md)
4. Check if SQL migration needed (DATABASE_GUIDE.md)
5. Review similar features (docs/*_GUIDE.md)
6. Implement following CODE_STANDARDS.md
7. Add tests (TESTS_GUIDE.md)
8. Update documentation (feature guide, API_GUIDE.md)
9. Run tests & lint
10. Verify manually
```

### Scenario 2: "Fix a bug"

```text
1. Identify affected feature (docs/README.md)
2. Read feature guide (docs/*_GUIDE.md)
3. Review relevant code (src/services/, src/components/)
4. Check database schema (sql/*.sql)
5. Identify root cause
6. Fix bug following CODE_STANDARDS.md
7. Add regression test
8. Run test suite
9. Update documentation if needed
```

### Scenario 3: "Update database schema"

```text
1. Read DATABASE_GUIDE.md
2. Review existing migrations (sql/*.sql)
3. Create new migration file (sql/XXX_*.sql)
4. Add tables, columns, indexes
5. Add RLS policies for security
6. Update feature guide (docs/*_GUIDE.md)
7. Update services to use new schema
8. Add migration to DEPLOYMENT_GUIDE.md
9. Test migration locally
```

### Scenario 4: "Add API endpoint"

```text
1. Read API_GUIDE.md (understand patterns)
2. Identify service file (src/services/*.js)
3. Add function with JSDoc
4. Follow naming conventions
5. Add error handling
6. Update API_GUIDE.md with endpoint
7. Add unit tests
8. Add integration tests
9. Test manually
```

---

## 📊 Project Key Metrics

### Quotas & Limits

- **User Uploads**: 50 items max
- **Catalog Additions**: Unlimited
- **Total Closet**: 200 items max
- **Image Size**: 1MB after resize
- **Friends**: Unlimited

### Feature Status

- ✅ **14/14 Tasks Complete** (100%)
- ✅ **10 SQL Migrations** (all deployed)
- ✅ **9 Feature Guides** (all documented)
- ✅ **200+ Tests** (unit + integration)

### Technology Stack

- **Frontend**: Vue.js 3, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Storage**: Cloudinary
- **Auth**: Google OAuth 2.0 (SSO only)
- **Testing**: Vitest, Playwright
- **State**: Pinia

---

## 🆘 Troubleshooting

### "I can't find the requirement for X"

1. Check [REQUIREMENTS.md](REQUIREMENTS.md) index
2. Search in `requirements/*.md` files
3. Check feature guide in `docs/*_GUIDE.md`
4. Review [API_GUIDE.md](API_GUIDE.md)

### "Task status unclear"

1. Check [TASKS.md](TASKS.md) for status markers
2. Look for ✅ Complete, ⏳ Pending, 🚧 In Progress
3. Read task file for detailed status section

### "Code standards unclear"

1. Read [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md) thoroughly
2. Look for examples in existing code
3. Check similar implementations in the codebase

### "API endpoint not documented"

1. Check [API_GUIDE.md](API_GUIDE.md) first (source of truth)
2. Review service file (src/services/*.js)
3. Check feature guide (docs/*_GUIDE.md)

---

## 📝 Documentation Maintenance

### When to Update Documentation

**Always update when**:

- Adding new features
- Changing API endpoints
- Modifying database schema
- Adding new requirements
- Changing user flows
- Fixing critical bugs

**Files to update**:

- Feature guides (`docs/*_GUIDE.md`)
- API reference (`API_GUIDE.md`)
- Database guide (`DATABASE_GUIDE.md`)
- Task status (`TASKS.md`)
- README.md (if user-facing)

### Documentation Standards

- Use markdown format
- Follow existing structure
- Add code examples
- Include cross-references
- Update table of contents
- Add status markers (✅ ⏳ 🚧)

---

## 🎓 Learning Path for New LLM Agents

### Day 1: Foundation (Read Only)

1. [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) - 15 minutes
2. [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md) - 20 minutes
3. [TASKS.md](TASKS.md) - 10 minutes
4. [REQUIREMENTS.md](REQUIREMENTS.md) - 10 minutes
5. [API_GUIDE.md](API_GUIDE.md) - 30 minutes

### Day 2: Feature Deep Dive (Read Only)

1. [docs/AUTHENTICATION_GUIDE.md](docs/AUTHENTICATION_GUIDE.md)
2. [docs/CLOSET_GUIDE.md](docs/CLOSET_GUIDE.md)
3. [docs/SOCIAL_GUIDE.md](docs/SOCIAL_GUIDE.md)
4. [docs/OUTFIT_GENERATION_GUIDE.md](docs/OUTFIT_GENERATION_GUIDE.md)
5. [docs/NOTIFICATIONS_GUIDE.md](docs/NOTIFICATIONS_GUIDE.md)

### Day 3: Implementation Practice

1. Review existing code in `src/services/`
2. Read test files in `tests/unit/`, `tests/integration/`
3. Study Vue components in `src/components/`
4. Examine SQL migrations in `sql/`
5. Practice with small bug fixes

### Day 4: Advanced Topics

1. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. [docs/USER_FLOWS.md](docs/USER_FLOWS.md)
3. [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
4. [docs/TESTS_GUIDE.md](docs/TESTS_GUIDE.md)
5. Practice with feature additions

---

## 📧 Support & Resources

- **Documentation Index**: [docs/README.md](docs/README.md)
- **Code Standards**: [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md)
- **Contributing Guide**: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)
- **Deployment Guide**: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

---

## ✅ Pre-Implementation Checklist

Before starting any task, verify:

- [ ] Read relevant task file completely
- [ ] Reviewed all related requirements
- [ ] Consulted feature guide
- [ ] Checked database schema
- [ ] Reviewed API reference
- [ ] Understood code standards
- [ ] Know which tests to add/update
- [ ] Identified documentation to update
- [ ] Checked for similar implementations
- [ ] Understood error handling patterns

---

**Remember**: When in doubt, read the documentation first. Every question has an answer in this repository's docs. Good luck! 🚀
