# Testing Guide - StyleSnap

Comprehensive guide for testing the StyleSnap application.

---

## 📋 Table of Contents

1. [Test Infrastructure](#test-infrastructure)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Writing Tests](#writing-tests)
5. [Test Coverage](#test-coverage)
6. [CI/CD Integration](#cicd-integration)

---

## 🛠️ Test Infrastructure

StyleSnap uses the following testing frameworks:

### Unit & Integration Tests
- **Framework:** Vitest (fast, Vite-native)
- **Environment:** happy-dom (lightweight DOM simulation)
- **Mocking:** Vitest built-in mocking
- **Coverage:** V8 coverage provider

### E2E Tests
- **Framework:** Playwright
- **Browsers:** Chromium, Firefox, WebKit
- **Features:** Screenshots, video recording, trace viewer

### Configuration

#### Vitest Config (`vite.config.js`)
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

#### Test Setup (`tests/setup.js`)
- Mocks Supabase client
- Mocks window.matchMedia for responsive tests
- Global test utilities

---

## 🚀 Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# For E2E tests, install browsers
npx playwright install
```

### Test Commands

```bash
# Run all unit tests
npm test

# Run tests in watch mode (development)
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test tests/unit/quota-calculator.test.js

# Run tests with coverage
npm test -- --coverage

# Validate SQL migrations
npm run validate-migrations
```

---

## 📁 Test Structure

```
tests/
├── setup.js                      # Global test setup
├── unit/                         # Unit tests
│   ├── quota-calculator.test.js  # Quota utility tests
│   └── image-compression.test.js # Image utility tests
├── integration/                  # Integration tests
│   └── api-endpoints.test.js     # API integration tests
└── e2e/                         # End-to-end tests
    └── user-journeys.test.js     # User workflow tests
```

### Test Categories

#### Unit Tests (`tests/unit/`)
- Test individual functions/utilities
- No external dependencies
- Fast execution
- High coverage

**Examples:**
- Quota calculations
- Image compression
- Date formatting
- Validation functions

#### Integration Tests (`tests/integration/`)
- Test API endpoints
- Test database interactions
- Test component integration
- Mock external services

**Examples:**
- API endpoint responses
- RLS policy enforcement
- Database constraints
- State management

#### E2E Tests (`tests/e2e/`)
- Test complete user workflows
- Real browser automation
- Slow but comprehensive
- UI validation

**Examples:**
- Login flow
- Add item flow
- Friend request flow
- Outfit suggestion flow

---

## ✍️ Writing Tests

### Unit Test Example

```javascript
// tests/unit/quota-calculator.test.js
import { describe, it, expect } from 'vitest'
import { calculateQuota } from '@/utils/quota-calculator'

describe('calculateQuota', () => {
  it('should calculate percentage correctly', () => {
    const result = calculateQuota(100, 200)
    expect(result.percentage).toBe(50)
    expect(result.remaining).toBe(100)
  })
  
  it('should handle edge cases', () => {
    const result = calculateQuota(200, 200)
    expect(result.percentage).toBe(100)
    expect(result.remaining).toBe(0)
    expect(result.isFull).toBe(true)
  })
})
```

### Integration Test Example

```javascript
// tests/integration/api-endpoints.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('Closet API', () => {
  let supabase
  
  beforeEach(() => {
    // Use test database
    supabase = createClient(TEST_URL, TEST_KEY)
  })
  
  it('should create closet item', async () => {
    const { data, error } = await supabase
      .from('clothes')
      .insert({
        name: 'Test Shirt',
        category: 'top'
      })
      .select()
      .single()
    
    expect(error).toBeNull()
    expect(data.name).toBe('Test Shirt')
  })
})
```

### E2E Test Example

```javascript
// tests/e2e/user-journeys.test.js
import { test, expect } from '@playwright/test'

test('add item journey', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.click('button:has-text("Sign in with Google")')
  
  // Navigate to closet
  await page.goto('/closet')
  
  // Add item
  await page.click('button:has-text("Add Item")')
  await page.fill('input[name="name"]', 'Blue Jeans')
  await page.selectOption('select[name="category"]', 'bottom')
  await page.click('button[type="submit"]')
  
  // Verify item appears
  await expect(page.locator('text=Blue Jeans')).toBeVisible()
})
```

---

## 📊 Test Coverage

### Current Status

| Category | Coverage Target | Status |
|----------|----------------|--------|
| Unit Tests | 80% | ⏳ Pending |
| Integration Tests | 70% | ⏳ Pending |
| E2E Tests | Critical paths | ⏳ Pending |

### Coverage Goals

**High Priority (80%+ coverage):**
- Authentication flow
- Quota enforcement
- Privacy/RLS policies
- Image upload
- Friend system

**Medium Priority (60%+ coverage):**
- Outfit suggestions
- Analytics
- Collections
- Color detection

**Low Priority (40%+ coverage):**
- UI utilities
- Formatting functions
- Helper functions

### Generating Coverage Reports

```bash
# Generate HTML coverage report
npm test -- --coverage

# Open coverage report
open coverage/index.html
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Validate migrations
        run: npm run validate-migrations
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 🐛 Debugging Tests

### Debugging Vitest Tests

```bash
# Run tests with debugger
node --inspect-brk ./node_modules/.bin/vitest

# In Chrome, open: chrome://inspect
# Click "inspect" on the Node process
```

### Debugging Playwright Tests

```bash
# Run with UI mode (interactive)
npx playwright test --ui

# Run with headed browser
npx playwright test --headed

# Debug specific test
npx playwright test --debug tests/e2e/login.test.js

# Generate trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

---

## 📝 Best Practices

### DO's ✅

- Write tests BEFORE fixing bugs (TDD)
- Use descriptive test names
- Test edge cases and error conditions
- Keep tests independent (no shared state)
- Mock external dependencies
- Use beforeEach/afterEach for setup/cleanup
- Group related tests with describe()
- Test user workflows, not implementation

### DON'Ts ❌

- Don't test implementation details
- Don't write tests that depend on order
- Don't use real API keys in tests
- Don't skip cleanup (memory leaks)
- Don't test third-party libraries
- Don't use sleep/delays (use waitFor)

---

## 🔍 Test Checklist

Before committing code, verify:

- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Coverage doesn't decrease
- [ ] No skipped tests (unless documented)
- [ ] Tests run in < 10 seconds (unit)
- [ ] Tests are deterministic (no flaky tests)

---

## 📚 Related Documentation

- [docs/SQL_MIGRATION_GUIDE.md](./SQL_MIGRATION_GUIDE.md) - Database testing
- [docs/API_REFERENCE.md](./API_REFERENCE.md) - API testing reference
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

---

**Last Updated:** October 2025
**Maintainer:** StyleSnap Development Team
