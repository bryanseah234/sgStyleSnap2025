# Task 2: Authentication & Database Foundation

**Estimated Duration**: 5 days  
**Dependencies**: Task 1 complete  
**Requirements**: [REQ: database-schema], [REQ: api-endpoints], [REQ: security]  
**Status**: ✅ COMPLETE

## 2.1 Database Schema Implementation
- [x] Run initial SQL migrations in Supabase:
  - Execute `sql/001_initial_schema.sql`
  - Execute `sql/002_rls_policies.sql`
  - Execute `sql/003_indexes_functions.sql`
- [x] Verify all tables, constraints, and indexes created
- [x] Test Row Level Security policies with test users
- [x] Create database backup strategy

## 2.2 Google Authentication Setup (SSO Only)
- [x] **CRITICAL:** Configure Google OAuth in Supabase Auth settings (provider: google)
- [x] Create Google Cloud Project with OAuth consent screen
- [x] Add OAuth credentials to `.env` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [x] **No email/password authentication** - Google SSO only
- [x] Implement frontend Google Sign-In component (Login.vue)
- [x] Implement frontend Google Sign-Up component (Register.vue)
- [x] Both pages use same OAuth flow (`signInWithOAuth`)
- [x] Create auth state management in Pinia store
- [x] Build auth guard for protected routes
- [x] Redirect to `/closet` (home page) after successful authentication

## 2.3 User Profile Management
- [x] Auto-create user record on first sign-in
- [x] Map Google profile data to users table
- [x] Create user profile update functionality
- [x] Handle edge cases (duplicate emails, failed creation)

## 2.4 Authentication UI Components
- [x] Build `AuthLayout.vue` component (centered layout for auth pages)
- [x] Create `Login.vue` page with "Sign in with Google" button
- [x] Create `Register.vue` page with "Sign up with Google" button
- [x] Both pages use same Google OAuth flow (`signInWithOAuth({ provider: 'google' })`)
- [x] Add cross-links: Login → Register ("Don't have account?"), Register → Login ("Already have account?")
- [x] Implement loading states during authentication
- [x] Add error handling for auth failures
- [x] Redirect to `/closet` (home page) after successful auth

## 2.5 User Settings & Profile Management
- [x] Add settings icon (gear/cog) to Closet page header (top-right)
- [x] Create `Settings.vue` page at `/settings` route
- [x] Upload 6 default avatar images to `/public/avatars/default-1.png` through `default-6.png`
- [x] Display user profile info (username, name, email) as read-only
- [x] Implement avatar selection grid (3x2 layout) with 6 default options
- [x] Create `PUT /profile/avatar` API endpoint
- [x] Create `user-service.js` with `updateUserAvatar()` function
- [x] Add visual indicator for currently selected avatar
- [x] Implement sign out button with confirmation
- [x] Add username generation logic: Extract part before @ from email
- [x] Document future extensibility for custom avatar uploads via Cloudinary

## Files Created

✅ **SQL Migrations:**
- `sql/001_initial_schema.sql` - Core database tables
- `sql/002_rls_policies.sql` - Row Level Security policies
- `sql/003_indexes_functions.sql` - Performance indexes and helper functions

✅ **Components & Pages:**
- `src/components/layouts/AuthLayout.vue` - Authentication page layout
- `src/pages/Login.vue` - Google SSO sign in page
- `src/pages/Register.vue` - Google SSO sign up page (same OAuth flow)
- `src/pages/Settings.vue` - User settings with avatar selection

✅ **State Management:**
- `src/stores/auth-store.js` - Authentication state (Pinia)
  - Methods: `loginWithGoogle()`, `logout()`, `setUser()`, `clearUser()`, `initializeAuth()`, `setupAuthListener()`
  - State: `user`, `isAuthenticated`, `loading`, `error`
  - Getters: `userId`, `userName`, `userEmail`, `userAvatar`

✅ **Services:**
- `src/services/auth-service.js` - Authentication API calls
  - `signInWithGoogle()`, `signOut()`, `getSession()`, `getCurrentUser()`, `refreshSession()`, `onAuthStateChange()`
- `src/services/user-service.js` - User profile management
  - `getUserProfile()`, `updateUserAvatar()`

✅ **Utilities:**
- `src/utils/auth-guard.js` - Route protection middleware
  - `authGuard()` - Protects authenticated routes
  - `guestGuard()` - Redirects authenticated users from auth pages
  - `initializeAuthState()` - Initialize auth on app mount

✅ **Assets:**
- `public/avatars/default-1.png` through `default-6.png` - 6 default avatar options

✅ **Tests:**
- `tests/unit/auth-integration.test.js` - 22 passing tests covering:
  - Auth store functionality
  - Google OAuth flow
  - User profile management
  - Auth service exports
  - User service validation
  - Protected routes
  - Default avatars
  - Auth state persistence

## Acceptance Criteria

- [x] Database schema deployed with all RLS policies
- [x] Users can sign in with Google OAuth
- [x] User records auto-created on first login with username from email
- [x] Protected routes redirect unauthenticated users (`auth-guard.js`)
- [x] Auth state persists across page refreshes (Supabase session storage)
- [x] Settings icon visible on Closet page (home)
- [x] Settings page displays user profile info (username, name, email) as read-only
- [x] 6 default avatars available for selection
- [x] Selected avatar displays with visual indicator
- [x] Avatar selection persists and updates in database
- [x] Username is auto-generated from email (part before @), cannot be changed
- [x] Name from Google OAuth, cannot be changed
- [x] Build completes successfully (✅ 516 KB output)
- [x] Authentication tests passing (22/22 ✅)

## Implementation Notes

### Authentication Flow
1. User clicks "Sign in with Google" or "Sign up with Google"
2. Both pages use same `signInWithGoogle()` from auth-service
3. Redirects to Google OAuth consent screen
4. Google returns auth code to Supabase callback
5. Supabase creates session and user record
6. Database trigger creates entry in `users` table with auto-generated username
7. User redirected to `/closet` (home page)
8. Session persists in browser storage (handled by Supabase)

### State Management
- Auth store uses Pinia for reactive state
- Store exposes both `loading` and `isLoading` (getter) for backward compatibility
- Errors tracked in `error` state property
- Auth state changes broadcast via `setupAuthListener()`

### Route Protection
- `authGuard()` checks `requiresAuth` meta property
- Unauthenticated users redirected to `/login` with return URL
- `guestGuard()` prevents authenticated users from accessing `/login` or `/register`
- Auth state initialized before first navigation

### Profile Management
- Username: Auto-generated from email (text before @), immutable
- Name: From Google OAuth profile, immutable
- Email: From Google OAuth, immutable
- Avatar: User-selectable from 6 default options, mutable
- Future: Custom avatar uploads via Cloudinary (infrastructure in place)

### Security
- Row Level Security (RLS) policies enforce data access rules
- All database queries filtered by authenticated user ID
- Google OAuth handles credential validation
- Session tokens auto-refresh via Supabase
- HTTPS enforced in production

## Next Steps

Proceed to Task 3: Closet CRUD & Image Management
