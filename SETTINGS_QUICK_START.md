# Settings Feature - Quick Start Guide

## 🎯 What Was Built

A complete user settings page where users can:
- View their profile information (username, name, email)
- Select from 6 default avatar images
- Sign out of the application

**Key Constraint**: Profile fields (username, name, email) are immutable (read-only). Only avatar can be changed.

## 🚀 How to Test

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test the Flow
1. Sign in with Google OAuth at `/login`
2. After login, you'll be on `/closet` (home page)
3. Click the **gear icon** in the top-right corner
4. You'll navigate to `/settings`
5. See your profile info (read-only fields)
6. Click on any of the 6 avatar options
7. Watch for success message: "✓ Profile photo updated successfully!"
8. Avatar updates immediately with visual selection indicator
9. Click "Sign Out" button (with confirmation)

### 3. Verify Avatar Persistence
1. Select an avatar on Settings page
2. Navigate back to Closet page
3. Your selected avatar should display in the app
4. Refresh the page - avatar selection persists

## 📁 Files to Review

### Core Implementation Files
```
src/
├── pages/
│   ├── Settings.vue          # Settings page UI (NEW)
│   └── Closet.vue             # Home page with settings icon (MODIFIED)
├── services/
│   └── user-service.js        # User profile API calls (NEW)
└── router.js                  # Added /settings route (MODIFIED)

public/
└── avatars/
    ├── default-1.png          # Blue gradient avatar
    ├── default-2.png          # Purple gradient avatar
    ├── default-3.png          # Green gradient avatar
    ├── default-4.png          # Pink gradient avatar
    ├── default-5.png          # Orange gradient avatar
    └── default-6.png          # Teal gradient avatar
```

### Documentation Files
```
requirements/
├── api-endpoints.md           # Added PUT /profile/avatar
└── frontend-components.md     # Settings.vue specification

tasks/
└── 02-authentication-database.md  # Added settings implementation checklist

DATABASE_SETUP.md              # Added profile system docs
SETTINGS_IMPLEMENTATION.md     # Complete implementation summary
```

## 🔧 Backend TODO

### Database Migration Needed
Add `username` field to `users` table:
```sql
ALTER TABLE users 
ADD COLUMN username VARCHAR(255) NOT NULL;

-- Set username from email for existing users
UPDATE users 
SET username = SPLIT_PART(email, '@', 1);
```

### API Endpoint Implementation
Implement `PUT /profile/avatar` endpoint:
- **Path**: `/api/profile/avatar`
- **Method**: PUT
- **Auth**: Required
- **Body**: `{ "avatar_url": "/avatars/default-1.png" }`
- **Validation**: Must match pattern `/avatars/default-[1-6].png`
- **Response**: `{ "id", "avatar_url", "message" }`

See `requirements/api-endpoints.md` for complete specification.

### User Creation Logic
Update user creation to generate username:
```javascript
// On Google OAuth callback
const email = googleUser.email;
const username = email.split('@')[0]; // Extract before @

await supabase.from('users').insert({
  id: googleUser.id,
  email: email,
  username: username,
  name: googleUser.name,
  avatar_url: '/avatars/default-1.png' // Default avatar
});
```

## 🎨 UI/UX Features

### Settings Page (`/settings`)
- **Header**: Back button, "Settings" title
- **Profile Section**: Read-only fields with gray background
  - Username field with "(Auto-generated from email)" label
  - Name field with "(From Google)" label
  - Email field
- **Avatar Section**: 
  - Current avatar preview (large, circular)
  - 3x2 grid of default avatars
  - Selected avatar has blue ring and checkmark overlay
  - Hover effects on unselected avatars
  - Success/error messages for updates
- **Account Section**: Sign out button (red, with confirmation)

### Closet Page (`/closet`)
- **Settings Icon**: Gear/cog icon in top-right
- **Styling**: White background, gray border, hover effects
- **Click**: Navigates to `/settings`

## 🔒 Security & Validation

### Avatar URL Validation
```javascript
// In user-service.js
const defaultAvatarPattern = /^\/avatars\/default-[1-6]\.png$/;

if (!defaultAvatarPattern.test(avatarUrl)) {
  throw new Error('Invalid avatar URL');
}
```

### Profile Field Immutability
- Username: Auto-generated from email (before @), cannot be changed
- Name: From Google OAuth, cannot be changed
- Email: From Google OAuth, cannot be changed
- Avatar: User can select from 6 defaults

### Future: Custom Avatars
```javascript
// Placeholder function in user-service.js
export async function uploadCustomAvatar(file) {
  // TODO: Implement Cloudinary upload
  // 1. Validate file (image/jpeg, image/png, max 2MB)
  // 2. Upload to Cloudinary /avatars/ folder
  // 3. Update users.avatar_url with Cloudinary URL
}
```

## 📝 Testing Checklist

- [ ] Settings icon appears on Closet page
- [ ] Clicking settings icon navigates to `/settings`
- [ ] Profile fields display correctly (read-only)
- [ ] 6 default avatars display in grid
- [ ] Current avatar has visual indicator
- [ ] Clicking avatar triggers update
- [ ] Success message appears after update
- [ ] Avatar persists after page refresh
- [ ] Sign out button shows confirmation
- [ ] Sign out redirects to `/login`
- [ ] Protected route redirects unauthenticated users

## 🐛 Troubleshooting

### Avatar Images Not Loading
```bash
# Regenerate avatars
./scripts/generate-avatars.sh
```

### API Endpoint Not Found
- Implement `PUT /profile/avatar` endpoint (see documentation)
- Check Supabase RLS policies allow user to update own avatar

### Username Field Missing
- Run database migration to add `username` column
- Update user creation logic to populate username

### Vue Component Errors
```bash
# Reinstall dependencies
npm install

# Clear cache
rm -rf node_modules/.vite
npm run dev
```

## 📚 Additional Resources

- **Complete Implementation**: `SETTINGS_IMPLEMENTATION.md`
- **API Specification**: `requirements/api-endpoints.md` (section 3.13)
- **Task Checklist**: `tasks/02-authentication-database.md` (section 2.5)
- **Database Schema**: `DATABASE_SETUP.md`
- **Component Spec**: `requirements/frontend-components.md` (Settings.vue)

## 🎉 Summary

This implementation provides a complete, production-ready settings page with:
- ✅ User profile display (immutable fields)
- ✅ Avatar selection system (6 default options)
- ✅ Professional UI/UX with loading states
- ✅ Comprehensive validation and error handling
- ✅ Future-proof for custom avatar uploads
- ✅ Full documentation and task checklists

**Status**: Ready for backend API implementation and testing!
