# Contributing to StyleSnap

Thank you for considering contributing to StyleSnap! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Git Workflow](#git-workflow)
6. [Testing](#testing)
7. [Documentation](#documentation)
8. [Pull Request Process](#pull-request-process)

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- **Supabase Account** (free tier)
- **Cloudinary Account** (free tier)
- **Google OAuth** credentials

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/stylesnap.git
cd stylesnap

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-anon-key
# ... (see .env.example for all variables)

# Run database migrations
# 1. Go to your Supabase project dashboard
# 2. Open SQL Editor
# 3. Execute sql/001_initial_schema.sql
# 4. Execute sql/002_rls_policies.sql
# 5. Execute sql/003_indexes_functions.sql

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

---

## Development Setup

### 1. Supabase Configuration

**Create Supabase Project:**
1. Go to https://supabase.com
2. Create a new project
3. Copy your project URL and anon key
4. Add to `.env`:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxx
   ```

**Enable Google OAuth:**
1. In Supabase dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials
4. Add authorized redirect URLs

**Run Migrations:**
```bash
# Execute in Supabase SQL Editor (in order)
cat sql/001_initial_schema.sql
cat sql/002_rls_policies.sql
cat sql/003_indexes_functions.sql
```

### 2. Cloudinary Configuration

**Setup Cloudinary:**
1. Go to https://cloudinary.com
2. Create free account
3. Get your cloud name, API key, and API secret
4. Create unsigned upload preset:
   - Go to Settings → Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set mode to "Unsigned"
   - Configure folder: `stylesnap`
   - Enable auto-tagging

**Add to `.env`:**
```
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset
```

### 3. Google OAuth Setup

**Create OAuth Credentials:**
1. Go to Google Cloud Console
2. Create new project (or use existing)
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:5173`
   - Your production domain
6. Add authorized redirect URIs:
   - `http://localhost:5173/auth/callback`
   - Your Supabase redirect URL

**Add to `.env`:**
```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 4. Verify Setup

```bash
# Run development server
npm run dev

# In another terminal, run tests
npm test

# Check for linting errors
npm run lint

# Format code
npm run format
```

### 5. (Optional) Seed Catalog Items

To populate the catalog with sample items:

```bash
# Option 1: Use existing sample data (Unsplash images)
npm run populate-catalog

# Option 2: Seed from your own CSV + images
npm run seed-catalog-csv -- ./my-items.csv ./my-images/

# See docs/CATALOG_SEEDING.md for detailed guide
```

**Note:** Migration 011 must be run before seeding catalog items from CSV.

---

## Project Structure

```
stylesnap/
├── docs/                  # Documentation files
│   ├── API_GUIDE.md (moved to root)
│   ├── CODE_STANDARDS.md
│   └── DEPLOYMENT.md
├── requirements/          # Requirement specifications
├── tasks/                 # Development task breakdowns
├── sql/                   # Database migration scripts
├── src/
│   ├── assets/           # Images, styles
│   ├── components/       # Vue components
│   │   ├── ui/          # Reusable UI components
│   │   ├── closet/      # Closet-specific components
│   │   └── social/      # Social feature components
│   ├── pages/           # Page components (routes)
│   ├── stores/          # Pinia state stores
│   ├── services/        # API service layer
│   ├── utils/           # Utility functions
│   ├── composables/     # Vue composables
│   ├── App.vue
│   └── main.js
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # End-to-end tests
└── scripts/            # Utility scripts
```

---

## Coding Standards

### JavaScript/Vue

Follow the [Code Standards](docs/CODE_STANDARDS.md) document for:
- JSDoc comments for all functions
- Vue component prop documentation
- Consistent naming conventions
- Proper error handling

### Key Conventions

```javascript
// ✅ camelCase for variables/functions
const userName = 'John';
function fetchData() {}

// ✅ PascalCase for components
import ClosetGrid from './components/ClosetGrid.vue';

// ✅ UPPER_SNAKE_CASE for constants
const MAX_ITEMS = 200;
const API_BASE_URL = 'https://api.stylesnap.com';

// ✅ Always use JSDoc
/**
 * Compresses an image file
 * @param {File} file - Image to compress
 * @returns {Promise<File>} Compressed file
 */
async function compressImage(file) {
  // Implementation
}
```

### Vue Components

```vue
<!-- ✅ Document components -->
<!--
  @component ClosetGrid
  @description Displays clothing items in a grid
-->
<template>
  <!-- Use semantic HTML -->
  <main class="closet-grid">
    <article v-for="item in items" :key="item.id">
      <!-- Content -->
    </article>
  </main>
</template>

<script setup>
// ✅ Document props
const props = defineProps({
  /** @type {ClothingItem[]} */
  items: {
    type: Array,
    required: true
  }
});

// ✅ Document emits
const emit = defineEmits({
  /** @param {string} id - Item ID */
  'item-click': (id) => typeof id === 'string'
});
</script>

<style scoped>
/* ✅ Use kebab-case with BEM */
.closet-grid {}
.closet-grid__item {}
.closet-grid__item--selected {}
</style>
```

### SQL

```sql
-- ✅ snake_case for tables/columns
CREATE TABLE clothing_items (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ✅ Descriptive index names
CREATE INDEX idx_clothes_user_active 
ON clothes(owner_id, removed_at);

-- ✅ Comment complex logic
-- This function counts active items for quota enforcement
-- Excludes soft-deleted items (removed_at IS NOT NULL)
CREATE FUNCTION check_item_quota(user_id UUID) ...
```

---

## Git Workflow

### Branching Strategy

```bash
main              # Production-ready code
  ├── develop     # Integration branch
  ├── feature/*   # New features
  ├── bugfix/*    # Bug fixes
  └── hotfix/*    # Urgent production fixes
```

### Creating a Feature Branch

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/add-style-filters

# Make changes
git add .
git commit -m "feat: add style tag filtering"

# Push to remote
git push origin feature/add-style-filters

# Create pull request on GitHub
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <subject>

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation only
style:    # Code style (formatting, no logic change)
refactor: # Code change (no feature add or bug fix)
perf:     # Performance improvement
test:     # Adding or updating tests
chore:    # Build process, dependencies

# Examples:
git commit -m "feat(closet): add virtual scrolling to grid"
git commit -m "fix(quota): handle edge case at exactly 50 uploads"
git commit -m "docs(api): update endpoint examples"
git commit -m "perf(images): implement thumbnail caching"
```

### Before Committing

```bash
# Run linter
npm run lint

# Run tests
npm test

# Format code
npm run format

# Check types (if using TypeScript)
npm run type-check
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- quota-calculator.test.js

# Run with coverage
npm run test:coverage

# Watch mode (for development)
npm run test:watch
```

### Writing Tests

**Unit Test Example:**

```javascript
// tests/unit/quota-calculator.test.js
import { describe, it, expect } from 'vitest';
import { calculatePercentage, isNearLimit } from '@/utils/quota-calculator';

describe('quota-calculator', () => {
  describe('calculatePercentage', () => {
    it('calculates percentage correctly', () => {
      expect(calculatePercentage(150, 200)).toBe(75.0);
      expect(calculatePercentage(200, 200)).toBe(100.0);
      expect(calculatePercentage(0, 200)).toBe(0.0);
    });
    
    it('rounds to one decimal place', () => {
      expect(calculatePercentage(1, 3)).toBe(33.3);
    });
  });
  
  describe('isNearLimit', () => {
    it('returns true at 90%+', () => {
      expect(isNearLimit(90)).toBe(true);
      expect(isNearLimit(100)).toBe(true);
    });
    
    it('returns false below 90%', () => {
      expect(isNearLimit(89.9)).toBe(false);
      expect(isNearLimit(50)).toBe(false);
    });
  });
});
```

**Component Test Example:**

```javascript
// tests/unit/QuotaIndicator.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import QuotaIndicator from '@/components/ui/QuotaIndicator.vue';

describe('QuotaIndicator', () => {
  it('renders quota correctly', () => {
    const wrapper = mount(QuotaIndicator, {
      props: {
        quota: { used: 150, limit: 200, percentage: 75.0 }
      }
    });
    
    expect(wrapper.text()).toContain('150/200');
  });
  
  it('shows warning at 90%+', () => {
    const wrapper = mount(QuotaIndicator, {
      props: {
        quota: { used: 45, limit: 50, percentage: 90.0 }
      }
    });
    
    expect(wrapper.find('.warning').exists()).toBe(true);
  });
});
```

### Test Coverage Requirements

- **Unit Tests:** All utility functions and composables
- **Component Tests:** All UI components with complex logic
- **Integration Tests:** API endpoints and services
- **E2E Tests:** Critical user journeys

**Minimum coverage:** 80% for new code

---

## Documentation

### Required Documentation

1. **JSDoc for Functions**
   - Description
   - Parameters with types
   - Return type
   - Example usage

2. **Component Documentation**
   - Component description
   - Props with types
   - Emitted events
   - Usage example

3. **API Endpoints**
   - Request format
   - Response format
   - Error codes
   - Example requests

See [Code Standards](docs/CODE_STANDARDS.md) for detailed examples.

### Generating Documentation

```bash
# Generate JSDoc documentation
npm run docs:generate

# Output: docs/jsdoc/

# View generated docs
open docs/jsdoc/index.html
```

---

## Pull Request Process

### 1. Before Creating PR

- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation updated
- [ ] Commit messages follow convention

### 2. PR Title Format

```
<type>(<scope>): <description>

Examples:
feat(closet): add virtual scrolling support
fix(quota): correct count at boundary condition
docs(api): update authentication examples
```

### 3. PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Documentation updated
- [ ] No console errors
- [ ] Tests pass locally

## Screenshots (if applicable)
[Add screenshots]

## Related Issues
Fixes #123
Relates to #456
```

### 4. Code Review Process

**Reviewers check for:**
- Code quality and style
- Test coverage
- Documentation completeness
- Performance implications
- Security considerations

**Author responsibilities:**
- Address all review comments
- Keep PR focused and small
- Rebase on main if needed
- Ensure CI passes

### 5. Merge Requirements

- ✅ At least 1 approval from maintainer
- ✅ All CI checks pass
- ✅ No merge conflicts
- ✅ Documentation updated
- ✅ Tests pass

---

## Development Tips

### Hot Reload Issues

```bash
# If hot reload stops working:
rm -rf node_modules/.vite
npm run dev
```

### Database Reset

```bash
# Reset database to clean state
# WARNING: This deletes all data!

# 1. In Supabase dashboard, go to SQL Editor
# 2. Drop all tables:
DROP TABLE IF EXISTS suggestions CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS clothes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

# 3. Re-run migrations
# Execute sql/001_initial_schema.sql
# Execute sql/002_rls_policies.sql
# Execute sql/003_indexes_functions.sql
```

### Debugging

```javascript
// Enable verbose logging
localStorage.setItem('DEBUG', 'stylesnap:*');

// Disable RLS for testing (Supabase dashboard)
ALTER TABLE clothes DISABLE ROW LEVEL SECURITY;
// Remember to re-enable after testing!
```

### Common Issues

**Issue: CORS errors in development**
```javascript
// Solution: Configure Vite proxy in vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
};
```

**Issue: Quota check fails**
```sql
-- Verify function exists:
SELECT proname FROM pg_proc WHERE proname = 'check_item_quota';

-- Test function manually:
SELECT check_item_quota('user-uuid-here');
```

---

## Getting Help

### Resources

- **Documentation:** [docs/](docs/)
- **API Reference:** [API_GUIDE.md](../API_GUIDE.md)
- **Code Standards:** [docs/CODE_STANDARDS.md](docs/CODE_STANDARDS.md)
- **Requirements:** [requirements/](requirements/)

### Contact

- **GitHub Issues:** For bugs and feature requests
- **Discussions:** For questions and ideas
- **Email:** dev@stylesnap.com

---

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

---

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

Thank you for contributing to StyleSnap! 🎉
