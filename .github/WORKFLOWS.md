# StyleSnap GitHub Workflows Documentation

This document describes all GitHub Actions workflows configured for the StyleSnap project.

## 📋 Workflow Overview

| Workflow | Trigger | Purpose | Status |
|----------|---------|---------|--------|
| [Deploy to Vercel](#deploy-to-vercel) | Push to main, PRs | Deploy to Vercel | ✅ Ready |
| [StyleSnap CI](#stylesnap-ci) | Push to main, PRs | Build and test | ✅ Ready |
| [E2E Tests](#e2e-tests) | PRs, Daily schedule | End-to-end testing | ⚠️ Configured |
| [Manual Operations](#manual-operations) | Manual trigger | Maintenance tasks | ✅ Ready |
| [Supabase Keep-Alive](#supabase-keep-alive) | Every 5 days | Keep DB active | ✅ Ready |
| [Greetings](#greetings) | Issues, PRs | Welcome messages | ✅ Ready |
| [Labeler](#labeler) | PRs | Auto-label PRs | ✅ Ready |
| [Issue Summary](#issue-summary) | New issues | Auto-summarize | ✅ Ready |
| [Status Check](#status-check) | Manual, Weekly | Validate workflows | ✅ Ready |

## 🚀 Deploy to Vercel

**File:** `.github/workflows/deploy.yml`

Automatically deploys the application to Vercel on pushes to main branch and pull requests.

### Features:
- ✅ Automatic deployment to Vercel
- ✅ Preview deployments for PRs
- ✅ Production deployments for main branch
- ✅ Environment variable validation
- ✅ Build artifact generation

### Required Secrets:
```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_OPENWEATHER_API_KEY=your_weather_api_key
```

### Setup Instructions:
1. Get Vercel token from [Vercel Account Settings](https://vercel.com/account/tokens)
2. Get Org/Project IDs by running `vercel link` in your project
3. Add all secrets in GitHub: Settings → Secrets and variables → Actions

## 🔧 StyleSnap CI

**File:** `.github/workflows/node.js.yml`

Runs the main CI/CD pipeline with build and test steps.

### Features:
- ✅ Multi-Node.js version testing (18.x, 20.x)
- ✅ Dependency installation with caching
- ✅ Linting with ESLint
- ✅ Build with Vite
- ✅ Unit testing (when configured)
- ✅ Artifact upload

### Matrix Strategy:
- Tests on Node.js 18.x and 20.x
- Only uploads artifacts from Node.js 20.x builds

## 🧪 E2E Tests

**File:** `.github/workflows/e2e.yml`

Runs end-to-end tests using Playwright across multiple browsers.

### Features:
- ✅ Multi-browser testing (Chromium, Firefox, WebKit)
- ✅ Daily scheduled runs
- ✅ Manual trigger support
- ✅ Artifact upload on failure
- ✅ Graceful handling of missing test config

### Browser Matrix:
- Chromium
- Firefox  
- WebKit (Safari)

### Artifacts Uploaded on Failure:
- Playwright reports
- Test results
- Screenshots
- Videos

## 🛠️ Manual Operations

**File:** `.github/workflows/manual.yml`

Provides manual triggers for various maintenance and testing operations.

### Available Operations:
- `build-only` - Build the application
- `test-only` - Run tests only
- `full-ci` - Complete CI pipeline
- `purge-old-items` - Clean up old data (dry run)
- `cloudinary-cleanup` - Clean up unused images (dry run)

### Environments:
- `staging` - Development environment
- `production` - Production environment

## 💾 Supabase Keep-Alive

**File:** `.github/workflows/supabase-keepalive.yml`

Prevents Supabase free tier projects from pausing due to inactivity.

### Features:
- ✅ Runs every 5 days (within 7-day limit)
- ✅ Simple database ping to keep project active
- ✅ Manual trigger support
- ✅ Error handling and logging

### Required Secrets:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 👋 Greetings

**File:** `.github/workflows/greetings.yml`

Automatically welcomes new contributors with helpful messages.

### Features:
- ✅ First-time issue opener welcome
- ✅ First-time PR contributor welcome
- ✅ Helpful guidance and links
- ✅ Maintainer notification

## 🏷️ Labeler

**File:** `.github/workflows/labeler.yml` + `.github/labeler.yml`

Automatically applies labels to pull requests based on modified files.

### Label Categories:
- `frontend` - UI/component changes
- `backend` - API/service changes
- `documentation` - Documentation updates
- `configuration` - Config file changes
- `database` - Schema/migration changes
- `testing` - Test-related changes
- `dependencies` - Package updates
- `security` - Security-related changes
- `performance` - Performance improvements
- `accessibility` - A11y improvements
- `mobile` - Mobile/responsive changes
- `bug` - Bug fixes
- `feature` - New features
- `refactor` - Code refactoring
- `critical` - Critical changes

## 📝 Issue Summary

**File:** `.github/workflows/summary.yml`

Automatically generates summaries for new issues.

### Features:
- ✅ Automatic issue type detection
- ✅ Priority assessment
- ✅ Structured summary format
- ✅ Helpful context for maintainers

### Summary Types:
- Bug Report
- Feature Request
- Question
- General Issue

### Priority Levels:
- High (urgent, critical, asap, emergency)
- Medium (default)
- Low (low, minor, nice to have)

## ✅ Status Check

**File:** `.github/workflows/status-check.yml`

Validates that all workflows are properly configured and working.

### Validation Checks:
- ✅ Package.json scripts exist
- ✅ Workflow YAML syntax is valid
- ✅ Required secrets are documented
- ✅ Labeler configuration exists
- ✅ Build process works
- ✅ Linting passes

### Triggers:
- Manual dispatch
- Weekly schedule (Mondays at 9 AM UTC)

## 🔧 Configuration Files

### Required Files:
- `.github/workflows/*.yml` - Workflow definitions
- `.github/labeler.yml` - Labeler configuration
- `package.json` - Script definitions
- `vercel.json` - Vercel configuration

### Optional Files:
- `playwright.config.js` - E2E test configuration
- `vitest.config.js` - Unit test configuration
- `eslint.config.js` - Linting configuration

## 🚨 Troubleshooting

### Common Issues:

1. **Workflow fails with "Missing secrets"**
   - Add required secrets in GitHub repository settings
   - Check secret names match exactly

2. **Build fails**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for syntax errors in code

3. **Deployment fails**
   - Verify Vercel token is valid
   - Check Vercel project configuration
   - Ensure environment variables are set

4. **Tests fail**
   - Check if test scripts are configured
   - Verify test environment setup
   - Check for test file syntax errors

### Debug Steps:
1. Check workflow logs in GitHub Actions tab
2. Run `npm run build` locally to test
3. Verify all required files exist
4. Check secret values are correct

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Playwright Documentation](https://playwright.dev/)
- [Supabase Documentation](https://supabase.com/docs)

## 🔄 Workflow Maintenance

### Regular Tasks:
- Update action versions quarterly
- Review and update Node.js versions
- Check for deprecated features
- Update documentation as needed

### Monitoring:
- Check workflow status weekly
- Review failed runs promptly
- Monitor resource usage
- Update secrets as needed

---

**Last Updated:** $(date)
**Maintainer:** StyleSnap Team
