# StyleSnap Test Suite

Comprehensive automated tests for the StyleSnap digital closet application.

---

## 📁 Test Structure

```
tests/
├── setup.js                              # Global test configuration & mocks
│
├── unit/                                 # Unit tests (fast, isolated)
│   ├── utils/                           # Utility function tests
│   │   ├── quota-calculator.test.js    ✅ Quota calculations
│   │   ├── image-compression.test.js   ✅ Image processing
│   │   └── color-detector.test.js      ✅ AI color detection
│   │
│   ├── stores/                          # Pinia store tests
│   │   └── auth-store.test.js          ✅ Authentication state
│   │
│   ├── services/                        # Service layer tests
│   │   └── [To be created]             📋 API service tests
│   │
│   └── components/                      # Vue component tests
│       └── [To be created]              📋 Component tests
│
├── integration/                         # Integration tests
│   ├── api-endpoints.test.js           ✅ Complete API testing
│   └── [Additional tests]               📋 More integration tests
│
└── e2e/                                 # End-to-end tests
    └── user-journeys.test.js           ✅ Complete user workflows
```

---

## 🚀 Quick Start

### Run Tests

```bash
# All unit tests
npm test

# Watch mode (for development)
npm test -- --watch

# With UI
npm run test:ui

# E2E tests
npm run test:e2e

# With coverage
npm test -- --coverage
```

### Specific Tests

```bash
# Run one test file
npm test tests/unit/utils/quota-calculator.test.js

# Run E2E with browser UI
npx playwright test --ui

# Run tests matching pattern
npm test -- --grep="quota"
```

---

## 📊 Current Test Coverage

| Category | Files | Status | Test Cases |
|----------|-------|--------|-----------|
| **Utilities** | 3 | ✅ Complete | 150+ |
| **Stores** | 1 | ✅ Complete | 40+ |
| **Services** | 0 | 📋 Pending | - |
| **Components** | 0 | 📋 Pending | - |
| **Integration** | 1 | ✅ Complete | 25+ |
| **E2E** | 1 | ✅ Complete | 35+ |

**Total:** ~250+ test cases across 6 files

---

## ✅ What's Tested

### Unit Tests

#### ✅ Quota Calculator (`quota-calculator.test.js`)
- Quota calculation at various levels (0%, 50%, 90%, 100%)
- Item addition validation
- Color coding based on usage
- User-friendly messages
- Edge cases (over quota, negative numbers, boundaries)

#### ✅ Image Compression (`image-compression.test.js`)
- File validation (type, size, format)
- Image compression with quality settings
- Aspect ratio preservation
- WebP format conversion
- Preview generation
- Error handling

#### ✅ Color Detection (`color-detector.test.js`)
- Dominant color extraction
- Color palette mapping
- Confidence calculation
- White/black exclusion
- Performance optimization

#### ✅ Auth Store (`auth-store.test.js`)
- Login/logout flows
- User state management
- Session persistence
- Error handling
- Profile fetching

### Integration Tests

#### ✅ API Endpoints (`api-endpoints.test.js`)
- **Closet CRUD:** Create, read, update, delete items
- **RLS Policies:** Privacy enforcement
- **Friends:** Send, accept, reject requests
- **Suggestions:** Create and view outfit suggestions
- **Likes:** Like/unlike items, get counts
- **Analytics:** Statistics and outfit tracking

### E2E Tests

#### ✅ User Journeys (`user-journeys.test.js`)
- **Authentication:** Login, logout, session persistence
- **Closet Management:** Add, edit, delete, favorite items
- **Quota Enforcement:** Warnings, blocking, catalog additions
- **Friends:** Send and accept requests
- **Suggestions:** Create and view outfit suggestions
- **Likes:** Like/unlike items, view likers
- **Outfit Generation:** Generate and save AI outfits
- **Analytics:** View wardrobe statistics
- **Notifications:** View and mark as read

---

## 🧪 Test Examples

### Unit Test Example

```javascript
// tests/unit/utils/quota-calculator.test.js
it('should calculate quota at 90% (warning threshold)', () => {
  const result = calculateQuota(45, 50)
  
  expect(result.used).toBe(45)
  expect(result.remaining).toBe(5)
  expect(result.percentage).toBe(90)
  expect(result.isNearLimit).toBe(true)
  expect(result.isFull).toBe(false)
})
```

### Integration Test Example

```javascript
// tests/integration/api-endpoints.test.js
it('should create clothing item', async () => {
  const { data, error } = await supabase
    .from('clothes')
    .insert({
      user_id: testUserId,
      name: 'Test Shirt',
      category: 'top',
      privacy: 'private',
      source: 'upload'
    })
    .select()
    .single()

  expect(error).toBeNull()
  expect(data.name).toBe('Test Shirt')
  expect(data.user_id).toBe(testUserId)
})
```

### E2E Test Example

```javascript
// tests/e2e/user-journeys.test.js
test('should add item successfully', async ({ page }) => {
  await page.goto(`${BASE_URL}/closet`)
  await page.click('button[aria-label="Add item"]')
  await page.fill('input[name="name"]', 'Blue Jeans')
  await page.selectOption('select[name="category"]', 'bottom')
  await page.setInputFiles('input[type="file"]', 'tests/fixtures/jeans.jpg')
  await page.click('button[type="submit"]')
  
  await expect(page.locator('.notification.success')).toBeVisible()
  await expect(page.locator('.closet-item:has-text("Blue Jeans")')).toBeVisible()
})
```

---

## 🎯 Writing New Tests

### 1. Unit Test Template

```javascript
import { describe, it, expect, beforeEach } from 'vitest'

describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  })

  it('should [expected behavior]', () => {
    // Arrange
    const input = 'test-data'
    
    // Act
    const result = functionToTest(input)
    
    // Assert
    expect(result).toBe('expected-output')
  })
})
```

### 2. Store Test Template

```javascript
import { setActivePinia, createPinia } from 'pinia'
import { useYourStore } from '@/stores/your-store'

describe('Your Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default state', () => {
    const store = useYourStore()
    expect(store.someProperty).toBe(expectedValue)
  })
})
```

### 3. Integration Test Template

```javascript
import { createClient } from '@supabase/supabase-js'

describe('Feature API', () => {
  let supabase
  let testUserId

  beforeEach(async () => {
    supabase = createClient(TEST_URL, TEST_KEY)
    // Create test data
  })

  afterEach(async () => {
    // Cleanup test data
  })

  it('should perform operation', async () => {
    const { data, error } = await supabase.from('table').insert(...)
    expect(error).toBeNull()
  })
})
```

### 4. E2E Test Template

```javascript
import { test, expect } from '@playwright/test'

test.describe('Feature Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('should complete workflow', async ({ page }) => {
    await page.goto('/path')
    await page.click('button')
    await expect(page.locator('.result')).toBeVisible()
  })
})
```

---

## 🔍 Debugging Tests

### Vitest (Unit/Integration)

```bash
# Run with Node debugger
node --inspect-brk ./node_modules/.bin/vitest

# Then open chrome://inspect in Chrome
```

### Playwright (E2E)

```bash
# Interactive mode
npx playwright test --ui

# Debug mode
npx playwright test --debug

# With trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

---

## 📈 Coverage Reports

```bash
# Generate coverage
npm test -- --coverage

# Open HTML report
open coverage/index.html

# Coverage with thresholds
npm test -- --coverage --coverage.statements=80
```

---

## ✨ Best Practices

### DO ✅

- Write descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Test edge cases and errors
- Keep tests independent
- Mock external dependencies
- Clean up after tests
- Test behavior, not implementation

### DON'T ❌

- Test third-party libraries
- Write flaky tests
- Use real API keys in tests
- Skip cleanup
- Use sleep/delays (use waitFor)
- Test implementation details
- Share state between tests

---

## 🔄 CI/CD Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# .github/workflows/test.yml
- name: Run unit tests
  run: npm test

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

---

## 📚 Documentation

- **[TESTS_GUIDE.md](../TESTS_GUIDE.md)** - Complete testing guide
- **[TESTING_SUMMARY.md](../TESTING_SUMMARY.md)** - Implementation summary
- **[docs/TESTING.md](../docs/TESTING.md)** - Architecture docs

---

## 🎓 Learning Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/)

---

## 🐛 Common Issues

### Tests Fail Locally

```bash
# Clear cache
npm run test -- --clearCache

# Reinstall dependencies
rm -rf node_modules
npm install
```

### E2E Browsers Not Found

```bash
# Install browsers
npx playwright install

# Or specific browser
npx playwright install chromium
```

### Coverage Not Generated

```bash
# Install coverage provider
npm install -D @vitest/coverage-v8

# Check vite.config.js has test.coverage config
```

---

## 📞 Getting Help

1. Check [TESTS_GUIDE.md](../TESTS_GUIDE.md)
2. Review existing test files for examples
3. Check error messages carefully
4. Use `--debug` flag for E2E tests
5. Open an issue with reproduction steps

---

## 📝 Checklist Before Commit

- [ ] All tests pass (`npm test`)
- [ ] New features have tests
- [ ] Coverage hasn't decreased
- [ ] No `.only` or `.skip` in tests
- [ ] Tests run in < 10 seconds (unit)
- [ ] No hardcoded values (use env vars)
- [ ] Cleanup is implemented
- [ ] Test names are descriptive

---

## 🏆 Test Statistics

- **Total Test Files:** 6
- **Total Test Cases:** 250+
- **Lines of Test Code:** 2,735+
- **Coverage Goal:** 80%+ critical paths
- **E2E Scenarios:** 35+ complete workflows
- **Integration Tests:** 25+ API endpoints

---

**Last Updated:** January 2025  
**Maintainer:** StyleSnap Development Team  
**Status:** ✅ Comprehensive test suite in place
