# StyleSnap Testing Guide

Complete guide for testing the StyleSnap digital closet application.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Infrastructure Setup](#test-infrastructure-setup)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Writing Tests](#writing-tests)
6. [Test Coverage Goals](#test-coverage-goals)
7. [Best Practices](#best-practices)
8. [Debugging Tests](#debugging-tests)
9. [CI/CD Integration](#cicd-integration)
10. [Troubleshooting](#troubleshooting)

---

## 📖 Overview

StyleSnap uses a comprehensive testing strategy covering:

- **Unit Tests** - Individual functions, utilities, stores, and services
- **Component Tests** - Vue component behavior and rendering
- **Integration Tests** - API endpoints, database operations, RLS policies
- **E2E Tests** - Complete user workflows and journeys

### Testing Stack

| Layer | Framework | Environment |
|-------|-----------|-------------|
| Unit/Component | Vitest | happy-dom |
| Integration | Vitest | happy-dom + Mock Supabase |
| E2E | Playwright | Chromium/Firefox/WebKit |
| Coverage | V8 | Native V8 coverage |

---

## 🛠️ Test Infrastructure Setup

### 1. Install Dependencies

```bash
# Install all dependencies
npm install

# Install Playwright browsers for E2E tests
npx playwright install
```

### 2. Environment Variables

Create a `.env.test` file for testing:

```env
# Test Supabase Instance (use separate test project)
VITE_SUPABASE_URL=https://your-test-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-test-anon-key

# Test Cloudinary (optional, can be mocked)
VITE_CLOUDINARY_CLOUD_NAME=test-cloud
VITE_CLOUDINARY_UPLOAD_PRESET=test-preset

# Test Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_WEATHER=false
```

### 3. Test Database Setup

```bash
# Set up test database schema (run once)
cd sql
psql -h your-test-db.supabase.co -U postgres -d postgres -f 001_initial_schema.sql
psql -h your-test-db.supabase.co -U postgres -d postgres -f 002_rls_policies.sql
# ... repeat for all migration files
```

### 4. Project Configuration

The test configuration is in `vite.config.js`:

```javascript
test: {
  globals: true,
  environment: 'happy-dom',
  setupFiles: './tests/setup.js',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: [
      'node_modules/',
      'tests/',
      '*.config.js',
      'dist/'
    ]
  }
}
```

---

## 🚀 Running Tests

### Quick Start

```bash
# Run all unit tests
npm test

# Run tests in watch mode (development)
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm test -- --coverage
```

### Advanced Test Running

```bash
# Run specific test file
npm test tests/unit/quota-calculator.test.js

# Run tests matching pattern
npm test -- --grep="quota"

# Run only tests in a specific directory
npm test tests/unit/

# Run tests for changed files only
npm test -- --changed

# Run tests with verbose output
npm test -- --reporter=verbose

# Run tests in parallel (faster)
npm test -- --threads

# Run E2E tests headlessly
npm run test:e2e

# Run E2E tests with UI (interactive)
npx playwright test --ui

# Run E2E tests in headed mode (see browser)
npx playwright test --headed

# Run specific E2E test file
npx playwright test tests/e2e/authentication.test.js
```

### Validate Migrations

```bash
# Check SQL migration syntax and dependencies
npm run validate-migrations
```

---

## 📁 Test Structure

```
tests/
├── setup.js                              # Global test configuration
│
├── unit/                                 # Unit tests (fast, isolated)
│   ├── utils/
│   │   ├── quota-calculator.test.js     # Quota calculation logic
│   │   ├── image-compression.test.js    # Image processing
│   │   ├── color-detector.test.js       # Color detection
│   │   ├── clothing-constants.test.js   # Constants validation
│   │   ├── drag-drop-helpers.test.js    # Drag and drop utilities
│   │   ├── maintenance-helpers.test.js  # Maintenance utilities
│   │   └── performance.test.js          # Performance utilities
│   │
│   ├── stores/
│   │   ├── auth-store.test.js           # Authentication state
│   │   ├── closet-store.test.js         # Closet management
│   │   ├── friends-store.test.js        # Friends system
│   │   ├── likes-store.test.js          # Likes feature
│   │   ├── notifications-store.test.js  # Notifications
│   │   ├── outfit-generation-store.test.js
│   │   ├── outfit-history-store.test.js
│   │   ├── shared-outfits-store.test.js
│   │   ├── collections-store.test.js
│   │   ├── analytics-store.test.js
│   │   ├── catalog-store.test.js
│   │   └── style-preferences-store.test.js
│   │
│   ├── services/
│   │   ├── auth-service.test.js         # Auth operations
│   │   ├── clothes-service.test.js      # Closet CRUD
│   │   ├── friends-service.test.js      # Friend operations
│   │   ├── suggestions-service.test.js  # Outfit suggestions
│   │   ├── likes-service.test.js        # Likes operations
│   │   ├── notifications-service.test.js
│   │   ├── outfit-generator-service.test.js
│   │   ├── outfit-history-service.test.js
│   │   ├── shared-outfits-service.test.js
│   │   ├── collections-service.test.js
│   │   ├── analytics-service.test.js
│   │   ├── catalog-service.test.js
│   │   ├── style-preferences-service.test.js
│   │   ├── friend-suggestions-service.test.js
│   │   ├── push-notifications.test.js
│   │   └── weather-service.test.js
│   │
│   └── components/
│       ├── ui/
│       │   ├── Button.test.js
│       │   ├── Modal.test.js
│       │   ├── FormInput.test.js
│       │   ├── LikeButton.test.js
│       │   └── QuotaIndicator.test.js
│       ├── closet/
│       │   ├── ClosetGrid.test.js
│       │   ├── AddItemForm.test.js
│       │   └── ItemDetailModal.test.js
│       └── social/
│           ├── FriendsList.test.js
│           ├── FriendRequest.test.js
│           └── NotificationBell.test.js
│
├── integration/                          # Integration tests
│   ├── api-endpoints.test.js            # All API endpoints
│   ├── auth-flow.test.js                # Complete auth flow
│   ├── closet-api.test.js               # Closet CRUD operations
│   ├── friends-api.test.js              # Friend system
│   ├── suggestions-api.test.js          # Outfit suggestions
│   ├── likes-api.test.js                # Likes feature
│   ├── notifications-api.test.js        # Notifications
│   ├── outfit-generation-api.test.js    # AI outfit generation
│   ├── shared-outfits-api.test.js       # Social feed
│   ├── collections-api.test.js          # Collections
│   ├── analytics-api.test.js            # Analytics
│   ├── catalog-api.test.js              # Item catalog
│   ├── rls-policies.test.js             # Row-level security
│   └── advanced-outfit-features-api.test.js
│
└── e2e/                                  # End-to-end tests
    ├── authentication.test.js           # Login/logout flow
    ├── closet-management.test.js        # Add/edit/delete items
    ├── friend-requests.test.js          # Friend request flow
    ├── outfit-suggestions.test.js       # Suggestion workflow
    ├── likes-feature.test.js            # Liking items
    ├── sharing-outfits.test.js          # Social feed
    ├── collections.test.js              # Collections feature
    ├── analytics.test.js                # Analytics dashboard
    ├── notifications.test.js            # Notification center
    ├── catalog-browsing.test.js         # Browse catalog
    ├── outfit-generator.test.js         # Generate outfits
    ├── quota-enforcement.test.js        # Quota limits
    └── user-journeys.test.js            # Complete user flows
```

---

## ✍️ Writing Tests

### Unit Test Template

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('FeatureName', () => {
  // Setup before each test
  beforeEach(() => {
    // Initialize test data
    // Mock dependencies
  })
  
  // Cleanup after each test
  afterEach(() => {
    // Clear mocks
    vi.clearAllMocks()
  })
  
  it('should perform expected behavior', () => {
    // Arrange
    const input = 'test-data'
    
    // Act
    const result = functionToTest(input)
    
    // Assert
    expect(result).toBe('expected-output')
  })
  
  it('should handle edge cases', () => {
    // Test null, undefined, empty, boundaries
  })
  
  it('should handle errors gracefully', () => {
    // Test error conditions
    expect(() => functionToTest(null)).toThrow()
  })
})
```

### Store Test Example

```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth-store'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('should initialize with default state', () => {
    const store = useAuthStore()
    
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })
  
  it('should set user on login', () => {
    const store = useAuthStore()
    const mockUser = { id: '1', email: 'test@example.com' }
    
    store.setUser(mockUser)
    
    expect(store.user).toEqual(mockUser)
    expect(store.isAuthenticated).toBe(true)
  })
  
  it('should clear user on logout', async () => {
    const store = useAuthStore()
    store.setUser({ id: '1', email: 'test@example.com' })
    
    await store.logout()
    
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })
})
```

### Service Test Example

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { ClothesService } from '@/services/clothes-service'

// Mock Supabase
vi.mock('@supabase/supabase-js')

describe('Clothes Service', () => {
  let service
  let mockSupabase
  
  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
      }))
    }
    
    service = new ClothesService(mockSupabase)
  })
  
  it('should fetch user clothes', async () => {
    const mockClothes = [
      { id: 1, name: 'Blue Jeans', category: 'bottom' }
    ]
    
    mockSupabase.from().single.mockResolvedValue({
      data: mockClothes,
      error: null
    })
    
    const result = await service.getUserClothes('user-123')
    
    expect(result).toEqual(mockClothes)
    expect(mockSupabase.from).toHaveBeenCalledWith('clothes')
  })
  
  it('should handle errors gracefully', async () => {
    mockSupabase.from().single.mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    })
    
    await expect(service.getUserClothes('user-123'))
      .rejects.toThrow('Database error')
  })
})
```

### Component Test Example

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/ui/Button.vue'

describe('Button Component', () => {
  it('should render with text', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    })
    
    expect(wrapper.text()).toBe('Click me')
  })
  
  it('should emit click event', async () => {
    const wrapper = mount(Button)
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted()).toHaveProperty('click')
  })
  
  it('should be disabled when loading', () => {
    const wrapper = mount(Button, {
      props: {
        loading: true
      }
    })
    
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
  
  it('should apply variant classes', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'primary'
      }
    })
    
    expect(wrapper.classes()).toContain('btn-primary')
  })
})
```

### Integration Test Example

```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('Closet API Integration', () => {
  let supabase
  let testUserId
  let testItemId
  
  beforeEach(async () => {
    // Use test database
    supabase = createClient(
      import.meta.env.VITE_TEST_SUPABASE_URL,
      import.meta.env.VITE_TEST_SUPABASE_KEY
    )
    
    // Create test user
    const { data: user } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    })
    testUserId = user.user.id
  })
  
  afterEach(async () => {
    // Cleanup test data
    if (testItemId) {
      await supabase.from('clothes').delete().eq('id', testItemId)
    }
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId)
    }
  })
  
  it('should create a closet item', async () => {
    const { data, error } = await supabase
      .from('clothes')
      .insert({
        user_id: testUserId,
        name: 'Test Shirt',
        category: 'top',
        privacy: 'private'
      })
      .select()
      .single()
    
    expect(error).toBeNull()
    expect(data.name).toBe('Test Shirt')
    expect(data.user_id).toBe(testUserId)
    
    testItemId = data.id
  })
  
  it('should enforce RLS policies', async () => {
    // Create item as user A
    const { data: item } = await supabase
      .from('clothes')
      .insert({
        user_id: testUserId,
        name: 'Private Item',
        privacy: 'private'
      })
      .select()
      .single()
    
    // Try to access as user B (should fail)
    const { data: userB } = await supabase.auth.signUp({
      email: 'userb@example.com',
      password: 'testpassword123'
    })
    
    const { data, error } = await supabase
      .from('clothes')
      .select()
      .eq('id', item.id)
      .single()
    
    // Should not return private items of other users
    expect(data).toBeNull()
  })
})
```

### E2E Test Example

```javascript
import { test, expect } from '@playwright/test'

test.describe('Add Item Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.click('button:has-text("Sign in with Google")')
    await page.waitForURL('/closet')
  })
  
  test('should add item successfully', async ({ page }) => {
    // Navigate to closet
    await page.goto('/closet')
    
    // Click add button
    await page.click('button[aria-label="Add item"]')
    
    // Fill form
    await page.fill('input[name="name"]', 'Blue Jeans')
    await page.selectOption('select[name="category"]', 'bottom')
    await page.selectOption('select[name="privacy"]', 'friends')
    
    // Upload image
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/jeans.jpg')
    
    // Submit
    await page.click('button[type="submit"]')
    
    // Verify success
    await expect(page.locator('.notification.success')).toBeVisible()
    await expect(page.locator('text=Blue Jeans')).toBeVisible()
  })
  
  test('should show validation errors', async ({ page }) => {
    await page.goto('/closet')
    await page.click('button[aria-label="Add item"]')
    
    // Submit without filling form
    await page.click('button[type="submit"]')
    
    // Check for error messages
    await expect(page.locator('.error:has-text("Name is required")')).toBeVisible()
  })
  
  test('should enforce quota limit', async ({ page }) => {
    // Assume user already has 50 uploads
    await page.goto('/closet')
    
    // Try to add item
    await page.click('button[aria-label="Add item"]')
    
    // Should see quota message
    await expect(page.locator('text=Upload quota reached')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
  })
})
```

---

## 📊 Test Coverage Goals

### Coverage Targets by Category

| Category | Target | Priority | Status |
|----------|--------|----------|--------|
| Utilities | 90%+ | High | 🟡 In Progress |
| Stores | 85%+ | High | 🔴 Not Started |
| Services | 85%+ | High | 🔴 Not Started |
| Components (UI) | 80%+ | Medium | 🔴 Not Started |
| Components (Feature) | 75%+ | Medium | 🔴 Not Started |
| Integration Tests | 70%+ | High | 🟡 In Progress |
| E2E (Critical Paths) | 100% | High | 🔴 Not Started |

### Critical Features (100% E2E Coverage)

✅ **Must be fully tested:**
- Authentication (Google OAuth)
- Add/Edit/Delete closet items
- Friend requests (send/accept/reject)
- Outfit suggestions
- Privacy controls (RLS)
- Quota enforcement
- Image upload
- Likes feature
- Outfit sharing
- Notifications

### High Priority Features (80%+ Coverage)

- Collections
- Outfit generation
- Outfit history
- Analytics
- Catalog browsing
- Color detection
- Style preferences

### Medium Priority Features (60%+ Coverage)

- Weather integration
- Push notifications
- Friend suggestions
- Comment system

### Generating Coverage Reports

```bash
# Generate coverage report
npm test -- --coverage

# Open HTML coverage report
open coverage/index.html

# Check coverage thresholds
npm test -- --coverage --coverage.statements=80
```

---

## 🎯 Best Practices

### DO's ✅

1. **Write Descriptive Test Names**
   ```javascript
   // Good ✅
   it('should prevent adding items when quota is full')
   
   // Bad ❌
   it('test quota')
   ```

2. **Follow AAA Pattern (Arrange, Act, Assert)**
   ```javascript
   it('should calculate quota percentage', () => {
     // Arrange
     const current = 45
     const limit = 50
     
     // Act
     const result = calculateQuota(current, limit)
     
     // Assert
     expect(result.percentage).toBe(90)
   })
   ```

3. **Test Edge Cases**
   ```javascript
   describe('calculateQuota', () => {
     it('should handle zero items')
     it('should handle full quota')
     it('should handle over quota')
     it('should handle negative numbers')
     it('should handle null/undefined')
   })
   ```

4. **Mock External Dependencies**
   ```javascript
   vi.mock('@supabase/supabase-js')
   vi.mock('axios')
   ```

5. **Use beforeEach/afterEach for Setup/Cleanup**
   ```javascript
   beforeEach(() => {
     // Fresh state for each test
   })
   
   afterEach(() => {
     // Clean up mocks
     vi.clearAllMocks()
   })
   ```

6. **Test User Behavior, Not Implementation**
   ```javascript
   // Good ✅
   it('should show success message when item is added')
   
   // Bad ❌
   it('should call addItem function with correct parameters')
   ```

7. **Keep Tests Independent**
   - No shared state between tests
   - Each test should run in isolation
   - Tests should pass in any order

8. **Use Test Fixtures for Data**
   ```javascript
   // tests/fixtures/users.js
   export const mockUser = {
     id: '123',
     email: 'test@example.com',
     name: 'Test User'
   }
   ```

### DON'Ts ❌

1. **Don't Test Third-Party Libraries**
   ```javascript
   // Bad ❌
   it('should test Vue Router navigation')
   
   // Good ✅
   it('should navigate to profile after clicking button')
   ```

2. **Don't Use Real API Keys in Tests**
   ```javascript
   // Bad ❌
   const REAL_API_KEY = 'prod-key-123'
   
   // Good ✅
   const TEST_API_KEY = import.meta.env.VITE_TEST_API_KEY
   ```

3. **Don't Write Flaky Tests**
   ```javascript
   // Bad ❌ (timing-dependent)
   setTimeout(() => {
     expect(element).toBeVisible()
   }, 1000)
   
   // Good ✅ (deterministic)
   await waitFor(() => {
     expect(element).toBeVisible()
   })
   ```

4. **Don't Skip Cleanup**
   ```javascript
   // Bad ❌
   it('test', () => {
     const store = useStore()
     store.setData(data)
     // No cleanup
   })
   
   // Good ✅
   afterEach(() => {
     vi.clearAllMocks()
     resetAllStores()
   })
   ```

5. **Don't Test Implementation Details**
   ```javascript
   // Bad ❌
   expect(component.vm.internalCounter).toBe(5)
   
   // Good ✅
   expect(component.text()).toContain('Count: 5')
   ```

6. **Don't Use sleep/delay**
   ```javascript
   // Bad ❌
   await new Promise(resolve => setTimeout(resolve, 1000))
   
   // Good ✅
   await waitFor(() => expect(element).toBeVisible())
   ```

---

## 🐛 Debugging Tests

### Debugging Vitest Tests

```bash
# Run with debugger
node --inspect-brk ./node_modules/.bin/vitest

# Then open chrome://inspect in Chrome
# Click "inspect" on the Node process
```

**In VS Code:**
1. Add breakpoint in test file
2. Open Debug panel (Ctrl+Shift+D)
3. Select "Debug Vitest Tests"
4. Press F5

### Debugging Playwright Tests

```bash
# Run with UI mode (interactive debugging)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Debug specific test
npx playwright test --debug tests/e2e/authentication.test.js

# Generate trace for debugging
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip

# Slow down execution
npx playwright test --slow-mo=1000
```

### Common Debugging Techniques

```javascript
// 1. Console logging
it('should work', () => {
  console.log('Current state:', store.state)
  expect(store.state).toBe('expected')
})

// 2. Vitest inspect
import { test } from 'vitest'
test('debug', () => {
  const data = getData()
  test.inspect(data) // Opens Node inspector
})

// 3. Playwright pause
test('debug e2e', async ({ page }) => {
  await page.goto('/closet')
  await page.pause() // Opens Playwright Inspector
  await page.click('button')
})

// 4. Screenshot on failure (Playwright)
test('should work', async ({ page }) => {
  await page.goto('/closet')
  await page.screenshot({ path: 'debug.png' })
})
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unit
          name: unit-coverage
  
  integration-tests:
    runs-on: ubuntu-latest
    
    env:
      VITE_TEST_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
      VITE_TEST_SUPABASE_KEY: ${{ secrets.TEST_SUPABASE_KEY }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm test tests/integration/
  
  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  validate-migrations:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate SQL migrations
        run: npm run validate-migrations
```

### Pre-commit Hook (Husky)

```bash
# Install Husky
npm install -D husky

# Add pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm test -- --run"
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Tests Fail in CI but Pass Locally

**Problem:** Environment differences

**Solutions:**
- Check Node.js version matches
- Verify environment variables
- Clear npm cache: `npm ci` instead of `npm install`
- Check for timing issues (use `waitFor`)

#### 2. Flaky E2E Tests

**Problem:** Tests pass/fail randomly

**Solutions:**
```javascript
// Bad ❌
await page.click('button')
await page.waitForTimeout(1000) // Fixed wait

// Good ✅
await page.click('button')
await page.waitForSelector('.success-message') // Wait for condition
```

#### 3. Mock Not Working

**Problem:** Mock is not being used

**Solutions:**
```javascript
// Ensure mock is before import
vi.mock('@supabase/supabase-js')
import { createClient } from '@supabase/supabase-js'

// Or use vi.doMock for dynamic mocking
vi.doMock('@supabase/supabase-js', () => ({
  createClient: vi.fn()
}))
```

#### 4. Component Test Failing

**Problem:** Component not rendering

**Solutions:**
```javascript
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'

const wrapper = mount(Component, {
  global: {
    plugins: [createPinia()],
    stubs: ['router-link'] // Stub Vue Router
  }
})
```

#### 5. Coverage Not Generated

**Problem:** Coverage report is empty

**Solutions:**
```bash
# Install coverage provider
npm install -D @vitest/coverage-v8

# Run with coverage flag
npm test -- --coverage

# Check vite.config.js has coverage config
```

#### 6. Playwright Browser Not Found

**Problem:** Browser binary missing

**Solutions:**
```bash
# Reinstall browsers
npx playwright install

# Or install specific browser
npx playwright install chromium
```

---

## 📚 Additional Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/)

### StyleSnap Docs
- [Architecture](docs/ARCHITECTURE.md)
- [API Guide](API_GUIDE.md)
- [Database Guide](DATABASE_GUIDE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

### Test Examples
- Official Vitest examples: https://github.com/vitest-dev/vitest/tree/main/examples
- Playwright examples: https://github.com/microsoft/playwright/tree/main/tests

---

## 📝 Test Checklist

Before committing code:

- [ ] All tests pass locally (`npm test`)
- [ ] New features have unit tests
- [ ] New features have integration tests (if applicable)
- [ ] Critical user flows have E2E tests
- [ ] Test coverage hasn't decreased
- [ ] No `.only` or `.skip` in test files
- [ ] Tests run in < 10 seconds (unit) / < 2 minutes (E2E)
- [ ] Tests are deterministic (no flaky tests)
- [ ] Mocks are properly cleaned up
- [ ] Test names are descriptive
- [ ] Edge cases are covered

---

## 🎓 Testing Tips

### Writing Good Tests

1. **Test behavior, not implementation**
2. **One assertion per test** (when possible)
3. **Tests should be self-documenting**
4. **Avoid test interdependence**
5. **Keep tests simple and focused**

### Test Naming Convention

```javascript
describe('Feature/Component Name', () => {
  it('should [expected behavior] when [condition]', () => {
    // Test implementation
  })
})

// Examples:
it('should display error when form is invalid')
it('should add item to closet when form is submitted')
it('should show quota warning when reaching 90%')
```

### Organizing Tests

Group related tests:
```javascript
describe('Quota Calculator', () => {
  describe('calculateQuota', () => {
    it('should calculate percentage correctly')
    it('should handle edge cases')
  })
  
  describe('canAddItems', () => {
    it('should allow adding when under quota')
    it('should block adding when at quota')
  })
})
```

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Maintainer:** StyleSnap Development Team

For questions or issues with testing, please open an issue or contact the development team.
