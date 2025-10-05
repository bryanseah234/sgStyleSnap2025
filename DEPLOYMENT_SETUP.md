# GitHub Workflows & Deployment Setup Guide

## ✅ New Files Created

1. **`.github/workflows/deploy.yml`** - Vercel deployment workflow
2. **`.github/workflows/e2e.yml`** - Playwright E2E testing workflow
3. **`.gitignore`** - Complete git ignore rules for Vue 3 + Vite

---

## 🚀 Vercel Deployment Setup

### Step 1: Install Vercel CLI Locally (Optional)
```bash
npm install -g vercel
```

### Step 2: Link Your Project to Vercel
```bash
cd /workspaces/ClosetApp
vercel link
```
Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Select your account**
- Link to existing project? **No** (first time) or **Yes** (if already exists)
- Project name? **stylesnap** (or your choice)

This creates `.vercel/` folder with project config.

### Step 3: Get Your Vercel IDs
After linking, check the file:
```bash
cat .vercel/project.json
```

You'll see:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

### Step 4: Get Your Vercel Token
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Give it a name: "GitHub Actions StyleSnap"
4. Copy the token (you won't see it again!)

### Step 5: Add GitHub Secrets
Go to your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret Name | Value | Where to Get It |
|------------|-------|-----------------|
| `VERCEL_TOKEN` | `xxxxx` | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | `team_xxxxx` | `.vercel/project.json` (orgId) |
| `VERCEL_PROJECT_ID` | `prj_xxxxx` | `.vercel/project.json` (projectId) |
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Your Supabase project settings |
| `VITE_SUPABASE_ANON_KEY` | `eyJxxx...` | Your Supabase project API settings |
| `VITE_CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | Cloudinary dashboard |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `your-preset` | Cloudinary settings |
| `VITE_OPENWEATHER_API_KEY` | `your-api-key` | OpenWeatherMap (optional) |

### Step 6: Test Deployment
Push to main branch or create a PR:
```bash
git add .
git commit -m "Add Vercel deployment workflow"
git push origin main
```

Watch the deployment in GitHub Actions tab!

### How It Works
- **Pull Request:** Creates a preview deployment
- **Push to main:** Deploys to production
- **Automatic:** Runs on every push/PR

---

## 🎭 Playwright E2E Testing Setup

### Step 1: Install Playwright (if not already)
```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Step 2: Verify playwright.config.js Exists
Check if you have `/workspaces/ClosetApp/playwright.config.js`

If not, create it:
```javascript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Step 3: Update Your E2E Test File
Check `tests/e2e/user-journeys.test.js` - update the imports:

```javascript
import { test, expect } from '@playwright/test'

// Example test
test('should load login page', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('StyleSnap')
})
```

### Step 4: Run Tests Locally
```bash
# Run all tests
npm run test:e2e

# Run tests with UI
npx playwright test --ui

# Run specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug
```

### Step 5: GitHub Actions Will Run Automatically
The E2E workflow runs:
- ✅ On every pull request
- ✅ Daily at 2 AM UTC (catches regressions)
- ✅ Can be manually triggered from Actions tab

### Test Reports on Failure
When tests fail, GitHub uploads:
- 📊 Playwright HTML report
- 📸 Screenshots of failures
- 🎥 Videos of failed tests
- 📄 Test results (JUnit XML)

Access them in: **GitHub Actions → Failed workflow → Artifacts**

---

## 📝 .gitignore Explanation

Your new `.gitignore` includes:

### ✅ What's Ignored:
- `node_modules/` - Dependencies (don't commit!)
- `dist/` - Build output (generated)
- `.env` - Your secrets (NEVER COMMIT!)
- `.vercel/` - Vercel project config (has secrets)
- `.vscode/` - Your editor settings
- `coverage/` - Test coverage reports
- `test-results/` - Playwright results
- `playwright-report/` - Playwright HTML reports
- `.DS_Store` - macOS junk files
- `Thumbs.db` - Windows junk files

### ✅ What's Kept (NOT Ignored):
- `README.md` - Documentation
- `package.json` - Dependencies list
- `.env.example` - Template (no secrets)
- `.github/` - Your workflows
- All config files (vite, tailwind, etc.)
- All source code (`src/`)

### ⚠️ Important: Package Lock Files
By default, I kept `package-lock.json` and ignored yarn/pnpm locks.

**If you use yarn instead:**
```gitignore
# Uncomment these lines in .gitignore:
# package-lock.json
# pnpm-lock.yaml
```

**If you use pnpm instead:**
```gitignore
# Uncomment these lines in .gitignore:
# package-lock.json
# yarn.lock
```

---

## 🎯 All GitHub Workflows Summary

Now you have **8 workflows**:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `node.js.yml` | Push/PR to main | Build & test (CI) |
| `deploy.yml` | Push/PR to main | Deploy to Vercel |
| `e2e.yml` | PR + Daily | E2E tests (Playwright) |
| `manual.yml` | Manual | One-off operations |
| `supabase-keepalive.yml` | Every 5 days | Keep Supabase active |
| `greetings.yml` | First issue/PR | Welcome contributors |
| `label.yml` | PR | Auto-label PRs |
| `summary.yml` | New issue | AI issue summary |

---

## 🚨 Before Your First Deployment

### Checklist:
- [ ] Add all GitHub secrets (see Step 5 above)
- [ ] Link Vercel project (`vercel link`)
- [ ] Create `playwright.config.js` if missing
- [ ] Update E2E tests to use Playwright syntax
- [ ] Test build locally (`npm run build`)
- [ ] Test E2E locally (`npm run test:e2e`)
- [ ] Commit and push to trigger workflows

### Test Locally First:
```bash
# Build
npm run build

# Preview production build
npm run preview

# Run E2E tests
npm run test:e2e

# If all pass, you're ready to deploy!
git add .
git commit -m "Add deployment and E2E workflows"
git push origin main
```

---

## 🆘 Troubleshooting

### Vercel Deployment Fails
**Error: Missing environment variables**
- Solution: Add all `VITE_*` secrets to GitHub (see Step 5)

**Error: Build fails**
- Solution: Test `npm run build` locally first
- Check for missing dependencies in `package.json`

### E2E Tests Fail
**Error: Cannot find browser**
- Solution: Workflow installs browsers automatically, but locally run:
  ```bash
  npx playwright install
  ```

**Error: baseURL not accessible**
- Solution: Make sure `webServer` in `playwright.config.js` starts your dev server

### GitHub Actions Not Running
**No workflows appear**
- Solution: Make sure `.github/workflows/` files are in the main branch
- Check workflow syntax with GitHub's validator

---

## ✅ You're All Set!

Your project now has:
- ✅ Automatic deployment to Vercel
- ✅ E2E testing with Playwright (3 browsers)
- ✅ Complete `.gitignore` for Vue 3 + Vite
- ✅ All secrets properly configured

**Next:** Push your changes and watch the magic happen! 🚀
