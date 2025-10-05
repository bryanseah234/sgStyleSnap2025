# Task 1: Infrastructure Setup

**Estimated Duration**: 3 days  
**Dependencies**: None  
**Requirements**: [REQ: database-schema], [REQ: security]

## 1.1 Service Account Creation
- [ ] Create Supabase account and project
- [ ] Configure Supabase with settings from `sql/001_initial_schema.sql`
- [ ] Create Cloudinary account with unsigned upload preset
- [ ] Create hosting account (Vercel/Netlify/Cloudflare Pages)
- [ ] Store credentials in `.env.example` format

## 1.2 Repository Setup
- [ ] Initialize GitHub repository from Vue 3 + Vite template
- [ ] Configure CI/CD pipeline for chosen hosting platform
- [ ] Set up branch protection rules for main branch
- [ ] Create `develop` and `staging` branches
- [ ] Add `.gitignore` for Node.js and environment variables

## 1.3 Critical Infrastructure Tasks
- [ ] **CRITICAL**: Implement GitHub Action for weekly Supabase keepalive
  - Create `.github/workflows/supabase-keepalive.yml`
  - Schedule cron job: `0 0 * * 0` (weekly Sunday)
  - Execute: `SELECT 1 FROM users LIMIT 1;`
- [ ] **CRITICAL**: Finalize hosting platform decision
  - If Vercel: Document commercial use compliance
  - If Netlify: Configure form handling for feedback
  - Update `DEPLOYMENT.md` with decision

## 1.4 Development Environment
- [ ] Set up Vue 3 + Vite project with Tailwind CSS
- [ ] Configure Prettier and ESLint
- [ ] Set up Pinia for state management
- [ ] Create basic project structure from `PROJECT_CONTEXT.md`

## Files to Create:
.github/
workflows/
supabase-keepalive.yml
.env.example
package.json
vite.config.js
tailwind.config.js
src/
main.js
App.vue
stores/
index.js

## Acceptance Criteria:
- [ ] Supabase project created and accessible
- [ ] Cloudinary upload preset configured
- [ ] GitHub repository with proper branch protection
- [ ] Vue 3 project builds without errors
- [ ] Supabase keepalive action scheduled and tested