# StyleSnap - Development Tasks

## Task Order
1. [Infrastructure Setup](tasks/01-infrastructure-setup.md)
2. [Authentication & Database](tasks/02-authentication-database.md)
3. [Closet CRUD & Image Management](tasks/03-closet-crud-image-management.md)
4. [Social Features & Privacy](tasks/04-social-features-privacy.md)
5. [Suggestion System](tasks/05-suggestion-system.md)
6. [Quotas & Maintenance](tasks/06-quotas-maintenance.md)
7. [QA, Security & Launch](tasks/07-qa-security-launch.md)

## Task Dependencies
Each task may depend on the previous ones. Check individual task files for detailed dependencies.

## Critical Path Tasks
- ✅ Database schema setup
- ✅ Google OAuth implementation
- ✅ Image upload with client-side resizing
- ✅ Friend system with privacy enforcement
- ✅ Suggestion canvas with drag-and-drop
- ✅ 200-item quota system

## Additional Tasks

### Task 8: Mobile UI Mockups (Design Reference)

**Status**: ⏳ Mockup Placement Pending

**Purpose**: Store Figma mobile UI mockups as visual reference for UX flows and design intent.

**⚠️ Important**: These mockups are **REFERENCE SKETCHES ONLY** - not pixel-perfect specifications. Implementation (Batches 1-10) takes precedence.

#### Instructions for Adding Mockups

1. **Export from Figma**:
   - Format: PNG
   - Scale: 2x (for retina displays)
   - Dimensions: Mobile width (375px or 414px base)
   - Include: All mobile screens and key interactions

2. **File Naming Convention**:
   ```
   ##-screen-name.png
   ```
   Examples:
   - `01-login.png`
   - `02-onboarding.png`
   - `03-closet-grid.png`
   - `04-add-item.png`

3. **Place Files In**:
   ```
   /workspaces/ClosetApp/docs/design/mobile-mockups/
   ```

4. **Expected Screens** (35 total):

   **Core Screens (14)**:
   - `01-login.png` - Login/splash screen
   - `02-onboarding.png` - First-time user setup
   - `03-closet-grid.png` - Main closet view
   - `04-add-item.png` - Add clothing item
   - `05-item-detail.png` - Item detail view
   - `06-outfit-suggestion.png` - AI suggestion with weather
   - `07-suggestion-detail.png` - Full outfit detail
   - `08-social-feed.png` - Friend outfit feed
   - `09-friends-list.png` - Friends list
   - `10-friend-profile.png` - Friend profile view
   - `11-collections.png` - Outfit collections
   - `12-outfit-history.png` - Wear history
   - `13-profile.png` - User profile
   - `14-settings.png` - Settings page

   **Bottom Navigation (5)**:
   - `15-nav-home.png` - Home tab
   - `16-nav-suggestions.png` - Suggestions tab
   - `17-nav-feed.png` - Feed tab
   - `18-nav-friends.png` - Friends tab
   - `19-nav-profile.png` - Profile tab

   **Modals & Overlays (5)**:
   - `20-modal-filter.png` - Filter modal
   - `21-modal-photo.png` - Photo picker
   - `22-modal-notification.png` - Notification permission
   - `23-modal-share.png` - Share menu
   - `24-modal-delete.png` - Delete confirmation

   **Gestures & Interactions (4)**:
   - `25-gesture-swipe.png` - Swipe to delete
   - `26-gesture-pull.png` - Pull to refresh
   - `27-gesture-pinch.png` - Pinch to zoom
   - `28-gesture-drag.png` - Drag to reorder

   **Empty States (4)**:
   - `29-empty-closet.png` - Empty closet state
   - `30-empty-suggestions.png` - No suggestions
   - `31-empty-friends.png` - No friends
   - `32-offline.png` - Offline mode

   **Loading & Error States (3)**:
   - `33-loading.png` - Loading spinner
   - `34-error.png` - Error message
   - `35-network-error.png` - Network error

5. **After Adding Files**:
   - Verify all files follow naming convention
   - Keep file sizes under 500KB per image
   - Ensure images are readable (2x scale)
   - See `docs/design/DESIGN_REFERENCE.md` for implementation mapping

#### For LLM Agents

**DO NOT**:
- ❌ Treat mockups as exact design specifications
- ❌ Assume exact colors, spacing, or typography
- ❌ Override existing implementation to match sketches

**DO**:
- ✅ Use for UX flow reference (user journeys)
- ✅ Understand intended functionality per screen
- ✅ Reference for general layout concepts
- ✅ Compare with actual implementation in `BATCH_10_FIXES.md`
- ✅ Prioritize existing code and `mobile.css` over mockups

**Implementation Status**: All 35 screens are already implemented in Batches 1-10. Mockups serve as design documentation only.

**Related Files**:
- Design documentation: `docs/design/DESIGN_REFERENCE.md`
- Mobile implementation: `BATCH_10_FIXES.md`
- Mobile styles: `src/assets/styles/mobile.css`
- PWA config: `public/manifest.json`, `public/service-worker.js`