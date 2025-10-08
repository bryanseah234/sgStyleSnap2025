# Task 8: Mobile UI Mockups (Design Reference)

**Estimated Duration**: N/A (Design Documentation)  
**Dependencies**: None (Reference material only)  
**Status**: ✅ Complete (7 representative mockups present)

---

## Overview

This task involves storing Figma mobile UI mockups as visual reference for UX flows and design intent. These mockups serve as **conceptual sketches** to guide understanding of intended user experience.

### ⚠️ CRITICAL: For LLM Agents

**These mockups are REFERENCE SKETCHES ONLY** - NOT pixel-perfect specifications or exact implementation requirements.

**DO NOT:**
- ❌ Treat mockups as exact design specifications
- ❌ Assume exact colors, spacing, or typography from mockups
- ❌ Override existing implementation to match sketches
- ❌ Block implementation if mockups are missing
- ❌ Require all 35 mockups to be present

**DO:**
- ✅ Use available mockups for UX flow reference (user journeys, navigation patterns)
- ✅ Understand intended functionality per screen from mockups
- ✅ Reference for general layout concepts and interaction patterns
- ✅ Compare with actual implementation in `BATCH_10_FIXES.md` and code
- ✅ **Prioritize existing code and `src/assets/styles/mobile.css` over mockups**
- ✅ **Infer missing screens from available mockups and existing code**
- ✅ Work with partial mockups - use patterns from available screens

### 🎯 Handling Partial Mockups

**You may have only some of these 35 mockups.** The LLM agent should intelligently handle this:

**If mockup exists:**
- Use as visual reference for that specific screen
- Understand user flow and interaction intent
- Check against actual implementation

**If mockup is missing:**
- Infer design patterns from similar available mockups
- Rely on existing code implementation (highest priority)
- Use patterns from related screens (e.g., if `03-closet-grid.png` exists, infer list patterns for `09-friends-list.png`)
- Check `mobile.css` for established UI patterns

**Example Scenario:**
```
Available mockups: 01-login.png, 03-closet-grid.png, 06-outfit-suggestion.png
Missing mockups: 02-onboarding.png, 04-add-item.png, etc.

Agent should:
1. Use 01, 03, 06 as direct reference
2. Infer onboarding flow from login screen + existing code
3. Infer add-item form from closet-grid patterns + code
4. Follow mobile.css for all styling (bottom nav, modals, etc.)
5. Implement all features based on code, not mockup availability
```

---

## Implementation Status

**All 35 screens are already implemented in Batches 1-10.** 

Mockups serve as **design documentation only** to show original design intent. Implementation has evolved based on:
- Technical requirements
- User testing feedback
- Performance optimization
- Accessibility standards
- PWA best practices

See [DESIGN_REFERENCE.md](../docs/design/DESIGN_REFERENCE.md) for detailed mapping of mockups to actual implementation.

---

## 8.1 Export Mockups from Figma

### Export Settings

**Recommended Figma Export Configuration:**
- **Format**: PNG
- **Scale**: 2x (for retina displays)
- **Dimensions**: Mobile width (375px or 414px base)
- **Include**: Mobile screens and key interactions

### File Naming Convention

Use this exact naming pattern:
```
##-screen-name.png
```

**Examples:**
- `01-login.png`
- `02-onboarding.png`
- `03-closet-grid.png`
- `20-modal-filter.png`

### File Destination

Place all PNG files in:
```
/workspaces/ClosetApp/docs/design/mobile-mockups/
```

---

## 8.2 Expected Screen List (35 Total)

**⚠️ Important**: You don't need all 35 screens. Place whatever mockups you have, and the LLM agent will work with available references.

### Core Screens (14)

| # | Filename | Screen Description | Implementation |
|---|----------|-------------------|----------------|
| 01 | `01-login.png` | Login/splash screen with Google OAuth | ✅ `/src/pages/Login.vue` |
| 02 | `02-onboarding.png` | First-time user setup flow | ✅ `/src/pages/Onboarding.vue` |
| 03 | `03-closet-grid.png` | Main closet view with items grid | ✅ `/src/pages/Closet.vue` + `/src/components/closet/ClosetGrid.vue` |
| 04 | `04-add-item.png` | Add clothing item form with camera/gallery | ✅ `/src/components/closet/AddItemForm.vue` |
| 05 | `05-item-detail.png` | Individual item detail view | ✅ `/src/components/closet/ItemDetail.vue` |
| 06 | `06-outfit-suggestion.png` | AI suggestion screen with weather card | ✅ `/src/pages/Suggestions.vue` |
| 07 | `07-suggestion-detail.png` | Full outfit detail with accept/modify | ✅ `/src/components/social/SuggestionItem.vue` |
| 08 | `08-social-feed.png` | Friend outfit feed with infinite scroll | ✅ `/src/pages/Feed.vue` |
| 09 | `09-friends-list.png` | Friends list with requests | ✅ `/src/pages/Friends.vue` + `/src/components/social/FriendsList.vue` |
| 10 | `10-friend-profile.png` | Friend profile with public closet | ✅ `/src/components/social/FriendProfile.vue` |
| 11 | `11-collections.png` | Outfit collections grid | ✅ `/src/pages/Collections.vue` |
| 12 | `12-outfit-history.png` | Wear history calendar view | ✅ `/src/pages/OutfitHistory.vue` |
| 13 | `13-profile.png` | User profile with stats | ✅ `/src/pages/Profile.vue` |
| 14 | `14-settings.png` | Settings page with preferences | ✅ `/src/pages/Settings.vue` |

### Bottom Navigation (5)

| # | Filename | Screen Description | Implementation |
|---|----------|-------------------|----------------|
| 15 | `15-nav-home.png` | Home (Closet) tab in bottom nav | ✅ `/src/components/layouts/MainLayout.vue` |
| 16 | `16-nav-suggestions.png` | Suggestions tab with sparkle icon | ✅ `/src/components/layouts/MainLayout.vue` |
| 17 | `17-nav-feed.png` | Social feed tab with users icon | ✅ `/src/components/layouts/MainLayout.vue` |
| 18 | `18-nav-friends.png` | Friends tab with heart icon | ✅ `/src/components/layouts/MainLayout.vue` |
| 19 | `19-nav-profile.png` | Profile tab with user icon | ✅ `/src/components/layouts/MainLayout.vue` |

### Modals & Overlays (5)

| # | Filename | Screen Description | Implementation |
|---|----------|-------------------|----------------|
| 20 | `20-modal-filter.png` | Filter modal (bottom sheet) for closet | ✅ `mobile.css` `.modal-sheet` |
| 21 | `21-modal-photo.png` | Photo picker (camera/gallery choice) | ✅ Native file picker + crop UI |
| 22 | `22-modal-notification.png` | Notification permission request | ✅ `/src/services/push-notifications.js` |
| 23 | `23-modal-share.png` | Share menu with native share API | ✅ Web Share API integration |
| 24 | `24-modal-delete.png` | Delete confirmation dialog | ✅ `/src/components/ui/Modal.vue` |

### Gestures & Interactions (4)

| # | Filename | Screen Description | Implementation |
|---|----------|-------------------|----------------|
| 25 | `25-gesture-swipe.png` | Swipe-to-delete on list items | ✅ `mobile.css` `.swipe-actions` |
| 26 | `26-gesture-pull.png` | Pull-to-refresh on lists | ✅ Native + custom implementation |
| 27 | `27-gesture-pinch.png` | Pinch-to-zoom on images | ✅ Native browser zoom |
| 28 | `28-gesture-drag.png` | Drag-to-reorder in collections | ✅ Vue Draggable integration |

### Empty States (4)

| # | Filename | Screen Description | Implementation |
|---|----------|-------------------|----------------|
| 29 | `29-empty-closet.png` | Empty closet with CTA | ✅ `ClosetGrid.vue` empty state |
| 30 | `30-empty-suggestions.png` | No suggestions available | ✅ `Suggestions.vue` empty state |
| 31 | `31-empty-friends.png` | No friends added yet | ✅ `FriendsList.vue` empty state |
| 32 | `32-offline.png` | Offline mode indicator | ✅ `/src/services/offline-sync.js` |

### Loading & Error States (3)

| # | Filename | Screen Description | Implementation |
|---|----------|-------------------|----------------|
| 33 | `33-loading.png` | Loading spinner/skeleton | ✅ `/src/components/ui/Skeleton.vue` |
| 34 | `34-error.png` | Error message toast | ✅ `/src/components/ui/Notification.vue` |
| 35 | `35-network-error.png` | Network error state | ✅ Error boundary handling |

---

## 8.3 After Adding Mockups

### Validation Checklist

- [ ] Files follow naming convention (`##-screen-name.png`)
- [ ] File sizes are reasonable (< 500KB per image recommended)
- [ ] Images are readable at 2x scale
- [ ] Files are placed in `/docs/design/mobile-mockups/`

### Optional: Update Documentation

If you want to track which mockups are present:
- See `docs/design/DESIGN_REFERENCE.md` for detailed screen-by-screen documentation
- Mark available mockups in the tables
- Add any specific design notes or intentions

**Note**: This is optional - LLM agents will automatically detect which mockups exist and adapt accordingly.

---

## 8.4 For LLM Agents: Using Mockups in Development

### When Referencing Mockups

**1. Check What's Available:**
```javascript
// LLM should first check which mockups exist
const availableMockups = fs.readdirSync('docs/design/mobile-mockups/');
// Work with whatever is present
```

**2. Understand the Intent:**
- What user problem does this screen solve?
- What is the core functionality?
- How does it fit in the user journey?

**3. Prioritize Implementation Over Mockups:**
- Look at actual code first (see "Implementation" column in tables above)
- Review `src/assets/styles/mobile.css` for styling patterns
- Check API endpoints in `/API_GUIDE.md`
- Use mockup only for understanding UX flow intent

**4. Handle Missing Mockups Gracefully:**

**If Core Screen mockup is missing:**
```
Missing: 04-add-item.png
Strategy:
1. Check existing code: /src/components/closet/AddItemForm.vue
2. Look at similar screens: 03-closet-grid.png (for layout pattern)
3. Follow mobile.css patterns: .mobile-form, .form-input
4. Implement based on code + inferred patterns
```

**If Modal mockup is missing:**
```
Missing: 20-modal-filter.png
Strategy:
1. All modals use same base: mobile.css .modal-sheet
2. Check other modal mockups (21-24) for pattern
3. Follow bottom-sheet pattern in mobile.css
4. Implement filter content based on requirements
```

**If Gesture mockup is missing:**
```
Missing: 25-gesture-swipe.png
Strategy:
1. Check mobile.css for .swipe-actions implementation
2. Follow established touch interaction patterns
3. Ensure 44px minimum touch targets
4. Test on actual mobile device
```

### Design Pattern Inference

**From Available Mockups to Missing Ones:**

```
Have: 03-closet-grid.png, 09-friends-list.png
Missing: 11-collections.png

Infer:
- Grid layout from 03
- List interactions from 09
- Mobile patterns from mobile.css
- Create collections grid following established patterns
```

**Common Patterns to Reuse:**
- Bottom navigation (consistent across all screens)
- Mobile header with back button (consistent)
- FAB positioning (consistent at bottom: 80px + safe-area)
- Modal presentation (always bottom sheet)
- Touch targets (always 44px minimum)
- Swipe gestures (consistent left/right patterns)

---

## 8.5 Related Documentation

### Primary References
- **Design Documentation**: `docs/design/DESIGN_REFERENCE.md` - Comprehensive mockup mapping
- **Mobile Implementation**: `BATCH_10_FIXES.md` - Actual PWA and mobile features
- **Mobile Styles**: `src/assets/styles/mobile.css` - Complete mobile CSS framework

### Technical References
- **Component Guidelines**: `requirements/frontend-components.md` - Component specs
- **API Endpoints**: `API_GUIDE.md` - Backend integration
- **Database Schema**: `sql/001_initial_schema.sql` - Data structure
- **PWA Configuration**: `public/manifest.json`, `public/service-worker.js`

---

## 8.6 Design Notes

### Mockup vs. Implementation Differences

**Known Intentional Deviations:**

| Mockup Feature | Implementation | Reason |
|----------------|----------------|--------|
| Custom color picker | Predefined color palette | Better UX, faster selection |
| Swipe navigation | Bottom nav tabs | More discoverable, accessible |
| Custom camera UI | Native camera picker | Platform integration, security |
| Infinite categories | Fixed category list | Data consistency, quota management |
| Custom fonts | System fonts | Performance, PWA requirements |
| Complex animations | Simplified animations | Battery life, performance |

**These deviations are based on:**
- User testing feedback
- Performance benchmarks (Core Web Vitals)
- Accessibility requirements (WCAG 2.1)
- PWA best practices
- Browser compatibility
- Battery and data usage optimization

### Mobile-First Design Principles

**Implemented in mobile.css:**
- Touch targets: 44px minimum (Apple HIG)
- Safe area insets: For notched devices (iPhone X+)
- Bottom navigation: Thumb-friendly zone
- FAB placement: Right side, above bottom nav
- Modal patterns: Bottom sheets (swipe to dismiss)
- Gesture support: Swipe, pull, pinch, drag
- Responsive breakpoints: 768px (tablet), 1024px (desktop)

---

## Success Criteria

- [x] Mockups stored in designated directory
- [x] LLM agents can access mockups as reference
- [x] Clear instructions that mockups are reference only
- [x] Implementation takes precedence over mockups
- [x] Agents can work with partial mockup sets
- [x] Design intent documented and accessible

**Note**: This task is documentation-focused. Implementation of all features is complete (Batches 1-10).

---

## 8.7 Mockup Inventory (Current Status)

### Present Mockups (7 of 35)

The following representative mockups are available in `/docs/design/mobile-mockups/`:

✅ **03-closet-grid.png** - Core closet screen (shows grid layout, filters, navigation)  
✅ **04-add-item.png** - Add item flow (camera/gallery, form patterns)  
✅ **06-outfit-suggestion.png** - AI suggestion feature (weather card, outfit display)  
✅ **08-social-feed.png** - Social feed screen (infinite scroll, interactions)  
✅ **10-friend-profile.png** - Friend profile view (public closet, social features)  
✅ **17-nav-feed.png** - Bottom navigation pattern (all 5 tabs visible)  
✅ **22-modal-notification.png** - Modal/bottom sheet pattern (swipe to dismiss)

### Coverage Analysis

**These 7 mockups provide reference for:**

- ✅ Core closet functionality (grid, add item)
- ✅ AI suggestion system (outfit generation)
- ✅ Social features (feed, profiles)
- ✅ Navigation patterns (bottom nav)
- ✅ Modal/overlay patterns (bottom sheets)

**Missing mockups (28) can be inferred from:**

- Similar screen patterns (e.g., friends list from social feed pattern)
- Existing implementation in code (all 35 screens implemented)
- Mobile CSS framework (`src/assets/styles/mobile.css`)
- Bottom navigation consistency across screens
- Design documentation in `DESIGN_REFERENCE.md`

### Sufficiency Assessment

✅ **Current mockup set is sufficient** because:

1. All critical UX flows are represented
2. Core UI patterns are documented (grid, list, modal, nav)
3. All 35 screens are already implemented in code
4. Missing screens follow established patterns from available mockups
5. LLM agents can infer design intent from partial set + code

**Conclusion**: Task 8 is complete. The 7 representative mockups provide adequate design reference for understanding UX intent, and all features are already implemented.

---

**Related Tasks:**

- [TASK: 07-qa-security-launch] - Documentation and deployment
- [REQ: frontend-components] - Component specifications
- All implementation tasks (1-7) - Features are already built

**Implementation Status:** ✅ All 35 screens implemented across Batches 1-10
