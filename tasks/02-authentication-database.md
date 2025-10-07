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

## 2.2 Google Authentication Setup (SSO Only)
- [ ] **CRITICAL:** Configure Google OAuth in Supabase Auth settings (provider: google)
- [ ] Create Google Cloud Project with OAuth consent screen
- [ ] Add OAuth credentials to `.env` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] **No email/password authentication** - Google SSO only
- [ ] Implement frontend Google Sign-In component (Login.vue)
- [ ] Implement frontend Google Sign-Up component (Register.vue)
- [ ] Both pages use same OAuth flow (`signInWithOAuth`)
- [ ] Create auth state management in Pinia store
- [ ] Build auth guard for protected routes
- [ ] Redirect to `/closet` (home page) after successful authentication

## 2.3 User Profile Management
- [ ] Auto-create user record on first sign-in
- [ ] Map Google profile data to users table
- [ ] Create user profile update functionality
- [ ] Handle edge cases (duplicate emails, failed creation)

## 2.4 Authentication UI Components
- [ ] Build `AuthLayout.vue` component (centered layout for auth pages)
- [ ] Create `Login.vue` page with "Sign in with Google" button
- [ ] Create `Register.vue` page with "Sign up with Google" button
- [ ] Both pages use same Google OAuth flow (`signInWithOAuth({ provider: 'google' })`)
- [ ] Add cross-links: Login → Register ("Don't have account?"), Register → Login ("Already have account?")
- [ ] Implement loading states during authentication
- [ ] Add error handling for auth failures
- [ ] Redirect to `/closet` (home page) after successful auth

## 2.5 User Settings & Profile Management
- [ ] Add settings icon (gear/cog) to Closet page header (top-right)
- [ ] Create `Settings.vue` page at `/settings` route
- [ ] Upload 6 default avatar images to `/public/avatars/default-1.png` through `default-6.png`
- [ ] Display user profile info (username, name, email) as read-only
- [ ] Implement avatar selection grid (3x2 layout) with 6 default options
- [ ] Create `PUT /profile/avatar` API endpoint
- [ ] Create `user-service.js` with `updateUserAvatar()` function
- [ ] Add visual indicator for currently selected avatar
- [ ] Implement sign out button with confirmation
- [ ] Add username generation logic: Extract part before @ from email
- [ ] Document future extensibility for custom avatar uploads via Cloudinary

## Files to Create:
src/
components/
layouts/
AuthLayout.vue
pages/
Login.vue          # Google SSO sign in
Register.vue       # Google SSO sign up (same OAuth flow)
Settings.vue       # User settings with avatar selection
stores/
auth-store.js
services/
auth-service.js
user-service.js    # Avatar updates, profile management
utils/
auth-guard.js

public/
avatars/
default-1.png      # Default avatar option 1
default-2.png      # Default avatar option 2
default-3.png      # Default avatar option 3
default-4.png      # Default avatar option 4
default-5.png      # Default avatar option 5
default-6.png      # Default avatar option 6

## Acceptance Criteria:
- [ ] Database schema deployed with all RLS policies
- [ ] Users can sign in with Google OAuth
- [ ] User records auto-created on first login with username from email
- [ ] Protected routes redirect unauthenticated users
- [ ] Auth state persists across page refreshes
- [ ] Settings icon visible on Closet page (home)
- [ ] Settings page displays user profile info (username, name, email) as read-only
- [ ] 6 default avatars available for selection
- [ ] Selected avatar displays with visual indicator
- [ ] Avatar selection persists and updates in database
- [ ] Username is auto-generated from email (part before @), cannot be changed
- [ ] Name from Google OAuth, cannot be changed