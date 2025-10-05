# Task 2: Authentication & Database Foundation

**Estimated Duration**: 5 days  
**Dependencies**: Task 1 complete  
**Requirements**: [REQ: database-schema], [REQ: api-endpoints], [REQ: security]

## 2.1 Database Schema Implementation
- [ ] Run initial SQL migrations in Supabase:
  - Execute `sql/001_initial_schema.sql`
  - Execute `sql/002_rls_policies.sql`
  - Execute `sql/003_indexes_functions.sql`
- [ ] Verify all tables, constraints, and indexes created
- [ ] Test Row Level Security policies with test users
- [ ] Create database backup strategy

## 2.2 Google Authentication Setup
- [ ] Configure Google OAuth in Supabase Auth settings
- [ ] Create Google Cloud Project with OAuth consent screen
- [ ] Implement frontend Google Sign-In component
- [ ] Create auth state management in Pinia store
- [ ] Build auth guard for protected routes

## 2.3 User Profile Management
- [ ] Auto-create user record on first sign-in
- [ ] Map Google profile data to users table
- [ ] Create user profile update functionality
- [ ] Handle edge cases (duplicate emails, failed creation)

## 2.4 Authentication UI Components
- [ ] Build `AuthLayout.vue` component
- [ ] Create `Login.vue` page with Google OAuth
- [ ] Implement loading states during authentication
- [ ] Add error handling for auth failures

## Files to Create:
src/
components/
layouts/
AuthLayout.vue
pages/
Login.vue
stores/
auth-store.js
services/
auth-service.js
utils/
auth-guard.js

## Acceptance Criteria:
- [ ] Database schema deployed with all RLS policies
- [ ] Users can sign in with Google OAuth
- [ ] User records auto-created on first login
- [ ] Protected routes redirect unauthenticated users
- [ ] Auth state persists across page refreshes