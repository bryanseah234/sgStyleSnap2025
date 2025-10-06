# Quick Start Guide - StyleSnap

Get up and running with StyleSnap development in 10 minutes.

---

## 🚀 Prerequisites

- Node.js 18+ and npm 9+
- Supabase account (free tier)
- Cloudinary account (free tier)
- Git

---

## ⚡ Setup Steps

### 1. Clone Repository

```bash
git clone https://github.com/bryanseah234/ClosetApp.git
cd ClosetApp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

#### Option A: Supabase SQL Editor (Easiest)

1. Go to https://supabase.com/dashboard
2. Create new project
3. Copy Project URL and API key
4. Go to SQL Editor
5. Run migrations **in order** (001 → 008):
   - `sql/001_initial_schema.sql`
   - `sql/002_rls_policies.sql`
   - `sql/003_indexes_functions.sql`
   - `sql/004_advanced_features.sql`
   - `sql/005_catalog_system.sql`
   - `sql/006_color_detection.sql`
   - `sql/007_outfit_generation.sql`
   - `sql/008_likes_feature.sql`

**See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.**

#### Verify Setup

```bash
npm run validate-migrations
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset

# Weather API (optional)
VITE_WEATHER_API_KEY=your-api-key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-client-id
```

**See [CREDENTIALS_SETUP.md](./CREDENTIALS_SETUP.md) for getting credentials.**

### 5. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## 🧪 Verify Installation

### Test Database Connection

```bash
# Should pass all checks
npm run validate-migrations
```

### Run Tests

```bash
# Unit tests
npm test

# E2E tests (requires database)
npm run test:e2e
```

---

## 📚 Next Steps

### Essential Reading (10 minutes)

1. **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - Project structure & conventions
2. **[REQUIREMENTS.md](./REQUIREMENTS.md)** - Feature requirements
3. **[TASKS.md](./TASKS.md)** - Implementation status

### Deep Dives

- **Database:** [docs/SQL_MIGRATION_GUIDE.md](./docs/SQL_MIGRATION_GUIDE.md)
- **Testing:** [docs/TESTING.md](./docs/TESTING.md)
- **API:** [docs/API_REFERENCE.md](./docs/API_REFERENCE.md)
- **Code Standards:** [docs/CODE_STANDARDS.md](./docs/CODE_STANDARDS.md)

---

## 🛠️ Development Workflow

### Adding a New Feature

1. **Check documentation:**
   ```bash
   # Search for existing implementation
   grep -r "feature_name" src/
   
   # Check task files
   ls tasks/
   ```

2. **Read requirements:**
   - Check `requirements/` for specs
   - Check `tasks/` for implementation details

3. **Implement:**
   - Follow [docs/CODE_STANDARDS.md](./docs/CODE_STANDARDS.md)
   - Add tests (see [docs/TESTING.md](./docs/TESTING.md))

4. **Test:**
   ```bash
   npm test           # Unit tests
   npm run lint       # Linting
   npm run build      # Build check
   ```

5. **Commit:**
   ```bash
   git add .
   git commit -m "feat: description"
   git push
   ```

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run unit tests
npm test -- --watch      # Watch mode
npm run test:ui          # Interactive UI
npm run test:e2e         # E2E tests

# Code Quality
npm run lint             # Lint code
npm run format           # Format code

# Database
npm run validate-migrations  # Validate SQL files

# Utilities
npm run purge-old-items      # Clean up old items
npm run cloudinary-cleanup   # Clean Cloudinary
```

---

## 🐛 Troubleshooting

### Database Issues

**Problem:** "relation does not exist"
```bash
# Re-run migrations in order
# See DATABASE_SETUP.md
```

**Problem:** "RLS policy violation"
```bash
# Check user is authenticated
# Check RLS policies in 002_rls_policies.sql
```

### Build Issues

**Problem:** Module not found
```bash
npm install    # Reinstall dependencies
```

**Problem:** Port 3000 in use
```bash
# Change port in vite.config.js or:
npm run dev -- --port 3001
```

### Test Issues

**Problem:** Tests fail
```bash
# Check test setup
cat tests/setup.js

# Run specific test
npm test tests/unit/quota-calculator.test.js
```

---

## 📊 Project Statistics

- **Files:** 100+ source files
- **Database:** 17 tables, 40+ indexes
- **Components:** 50+ Vue components
- **API Endpoints:** 80+ endpoints
- **Test Coverage:** Target 80%

---

## 🆘 Getting Help

1. **Check documentation:**
   - [README.md](./README.md) - Overview
   - [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) - Architecture
   - [docs/](./docs/) - Technical docs

2. **Search codebase:**
   ```bash
   grep -r "search_term" src/
   find . -name "*keyword*"
   ```

3. **Review tasks:**
   - [TASKS.md](./TASKS.md) - Implementation status
   - [tasks/](./tasks/) - Detailed breakdowns

---

## ✅ You're Ready!

You should now have:
- ✅ Code cloned
- ✅ Dependencies installed
- ✅ Database set up (17 tables)
- ✅ Environment configured
- ✅ Dev server running
- ✅ Tests passing

**Happy coding! 🚀**

---

**Last Updated:** October 2025
