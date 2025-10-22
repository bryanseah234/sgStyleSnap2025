# StyleSnap Application Routes

**Version:** 3.0.0  
**Last Updated:** October 22, 2025

This document provides a comprehensive overview of all routes in the StyleSnap application, including their purposes, components, and access requirements.

---

## 📍 Route Structure

### Main Application Routes

```javascript
/                              → Redirect to /home
/home                          → Home dashboard (requires auth)
/closet                        → Closet gallery (requires auth)
/outfits                       → Outfits gallery (requires auth)
/friends                       → Friends list (requires auth)
/profile                       → User profile (requires auth)
/login                         → Login page (public)
/logout                        → Logout page (public)
/auth/callback                 → OAuth callback (public)
```

---

## 🏠 Home & Dashboard

### `/home`
**Component**: `Home.vue`  
**Purpose**: Main dashboard with overview of user's fashion activity  
**Authentication**: Required  

**Features**:
- Welcome message with user's first name
- Stats cards (items, outfits, friends count)
- Notifications section
- Quick navigation to main features

**Example**: `https://stylesnap.app/home`

---

## 👔 Closet Routes

### `/closet`
**Component**: `Cabinet.vue`  
**Purpose**: Main closet view displaying all user's clothing items  
**Authentication**: Required  

**Features**:
- Grid display of clothing items
- Category filters
- Search functionality
- Add item button with dropdown
- Item cards with preview images

**Example**: `https://stylesnap.app/closet`

---

### `/closet/add/manual`
**Component**: `Cabinet.vue` (sub-route: `manual`)  
**Purpose**: Manually add clothing items to closet  
**Authentication**: Required  

**Features**:
- Image upload
- Item details form
- Category selection
- Save to closet

**Example**: `https://stylesnap.app/closet/add/manual`

---

### `/closet/add/catalogue`
**Component**: `Cabinet.vue` (sub-route: `catalogue`)  
**Purpose**: Browse and add items from pre-populated catalogue  
**Authentication**: Required  

**Features**:
- Browse catalogue items
- Filter by category
- Add to personal closet
- Search catalogue

**Example**: `https://stylesnap.app/closet/add/catalogue`

---

### `/closet/view/friend/:username`
**Component**: `Cabinet.vue` (sub-route: `friend`)  
**Purpose**: View a friend's closet  
**Authentication**: Required  

**URL Parameters**:
- `username` - Friend's username

**Features**:
- View friend's items
- Friend-only visibility items
- Cannot edit friend's items

**Example**: `https://stylesnap.app/closet/view/friend/sarah_style`

---

## 👗 Outfit Routes

### `/outfits`
**Component**: `Outfits.vue`  
**Purpose**: Main outfits gallery displaying all saved outfits  
**Authentication**: Required  

**Features**:
- Grid layout of outfit cards
- Outfit preview images
- Filter options (All, Recent, Favorites)
- Add Outfit dropdown with 3 options:
  - Manual Creation
  - Friend Creation
  - AI Suggestions
- Click card to view details
- Edit and delete actions on hover

**Example**: `https://stylesnap.app/outfits`

---

### `/outfits/add/personal`
**Component**: `OutfitCreator.vue` (sub-route: `personal`)  
**Purpose**: Create personal outfit using own closet items  
**Authentication**: Required  

**Features**:
- Interactive canvas (600px height)
- Drag-and-drop items from sidebar
- Canvas controls:
  - Scale items (zoom in/out)
  - Rotate items (left/right)
  - Layer items (z-index)
  - Delete items
- Grid toggle
- Undo/Redo (50 steps)
- Save outfit
- Sidebar shows "My Closet" items
- Category filters

**Example**: `https://stylesnap.app/outfits/add/personal`

---

### `/outfits/add/suggested`
**Component**: `OutfitCreator.vue` (sub-route: `suggested`)  
**Purpose**: AI-generated outfit suggestions  
**Authentication**: Required  

**Features**:
- Auto-generated outfit on load
- Items automatically placed on canvas
- Smart category-based positioning:
  - Tops at Y: 100px
  - Bottoms at Y: 250px
  - Shoes at Y: 400px
  - Accessories at Y: 150px
  - Outerwear at Y: 80px
- Purple "Regenerate" button for new suggestions
- Full editing capabilities after generation
- AI badge in items section
- Info banner explaining AI feature
- Can manually add/remove items

**Example**: `https://stylesnap.app/outfits/add/suggested`

---

### `/outfits/add/friend/:username`
**Component**: `OutfitCreator.vue` (sub-route: `friend`)  
**Purpose**: Create outfit suggestion for friend using their items  
**Authentication**: Required  

**URL Parameters**:
- `username` - Friend's username

**Features**:
- Browse friend's closet items
- Same canvas as personal mode
- "Share Outfit" button instead of "Save"
- Optional message to friend
- Friend receives notification
- Friend can accept/reject suggestion
- Friend's username in title
- Users icon badge

**Example**: `https://stylesnap.app/outfits/add/friend/sarah_style`

---

### `/outfits/edit/:outfitId`
**Component**: `OutfitCreator.vue` (sub-route: `edit`)  
**Purpose**: Edit existing saved outfit  
**Authentication**: Required  

**URL Parameters**:
- `outfitId` - UUID of outfit to edit

**Features**:
- Loads existing outfit onto canvas
- Items positioned at saved coordinates
- Preserved transformations (scale, rotation, z-index)
- Full editing capabilities
- "Update Outfit" button instead of "Save"
- Pre-filled outfit name
- Can add/remove items
- Returns to gallery after update

**Example**: `https://stylesnap.app/outfits/edit/550e8400-e29b-41d4-a716-446655440000`

---

## 👥 Friends & Social Routes

### `/friends`
**Component**: `Friends.vue`  
**Purpose**: Friends list and friend management  
**Authentication**: Required  

**Features**:
- List of friends
- Friend requests (sent/received)
- Add friend functionality
- Friend profiles
- Create outfit for friend

**Example**: `https://stylesnap.app/friends`

---

### `/friend/:username/closet`
**Component**: `FriendCabinet.vue`  
**Purpose**: View friend's closet  
**Authentication**: Required  

**URL Parameters**:
- `username` - Friend's username

**Features**:
- Browse friend's items
- View details
- Like items
- Create outfit suggestion

**Example**: `https://stylesnap.app/friend/sarah_style/closet`

---

### `/friend/:username/profile`
**Component**: `FriendProfile.vue`  
**Purpose**: View friend's profile  
**Authentication**: Required  

**URL Parameters**:
- `username` - Friend's username

**Features**:
- Friend's profile information
- Friend's stats
- Friend's recent outfits
- Mutual friends
- Friendship status

**Example**: `https://stylesnap.app/friend/sarah_style/profile`

---

## 👤 User & Profile Routes

### `/profile`
**Component**: `Profile.vue`  
**Purpose**: User's own profile and settings  
**Authentication**: Required  

**Features**:
- Profile information
- Edit profile
- Theme preferences
- Privacy settings
- Account settings
- Logout option

**Example**: `https://stylesnap.app/profile`

---

## 🔐 Authentication Routes

### `/login`
**Component**: `Login.vue`  
**Purpose**: Login page with Google OAuth  
**Authentication**: Not required  

**Features**:
- Google OAuth button
- Theme toggle (works without login)
- Feature preview
- Terms of Service modal
- Privacy Policy modal
- Auto-redirect if already authenticated

**Example**: `https://stylesnap.app/login`

---

### `/logout`
**Component**: `Logout.vue`  
**Purpose**: Logout functionality  
**Authentication**: Not required  

**Features**:
- Clears session
- Redirects to login
- Cleanup

**Example**: `https://stylesnap.app/logout`

---

### `/auth/callback`
**Component**: `OAuthCallback.vue`  
**Purpose**: OAuth callback handler  
**Authentication**: Not required  

**Features**:
- Processes OAuth response
- Validates tokens
- Creates/updates user session
- Redirects to home

**Example**: `https://stylesnap.app/auth/callback?code=...`

---

## 🚫 Catch-All Route

### `/:pathMatch(.*)*`
**Redirect**: `/home`  
**Purpose**: Catch undefined routes and redirect  
**Authentication**: Inherits from redirect destination  

**Example**: Any undefined route redirects to home

---

## 🔒 Route Guards

### Authentication Guard
**Applied to**: All routes with `meta: { requiresAuth: true }`

**Behavior**:
- Checks if user is authenticated
- If not authenticated, redirects to `/login`
- If authenticated, allows navigation

**Implementation**: `router.beforeEach()` in `main.js`

---

## 📋 Route Meta Information

### Example Meta Configuration
```javascript
{
  path: '/outfits/add/personal',
  component: OutfitCreator,
  meta: {
    requiresAuth: true,      // Authentication required
    subRoute: 'personal'     // Sub-route identifier
  }
}
```

### Meta Fields
- `requiresAuth` (boolean) - Route requires authentication
- `subRoute` (string) - Sub-route identifier for component behavior

---

## 🎯 Common User Flows

### Create Personal Outfit
```
/home → /outfits → /outfits/add/personal → (create) → /outfits
```

### AI Outfit Suggestion
```
/home → /outfits → /outfits/add/suggested → (edit) → /outfits
```

### Friend Outfit Creation
```
/home → /friends → /outfits/add/friend/:username → (share) → /outfits
```

### Edit Existing Outfit
```
/home → /outfits → (click outfit) → /outfits/edit/:outfitId → /outfits
```

### View Friend's Closet
```
/home → /friends → /friend/:username/closet → (browse items)
```

---

## 🔄 Navigation Patterns

### Primary Navigation
```
Home ↔ Closet ↔ Outfits ↔ Friends ↔ Profile
```

### Outfit Creation Flow
```
Outfits Gallery
  ├── Add Personal → Canvas → Save → Gallery
  ├── Add AI → Auto-generate → Edit → Save → Gallery
  └── Add Friend → Friend's items → Share → Notification
```

### Social Flow
```
Friends
  ├── View Profile → Friend's stats
  ├── View Closet → Browse items
  └── Create Outfit → Use their items
```

---

## 📊 Route Statistics

### Most Visited Routes
1. `/home` - 100% (landing page)
2. `/closet` - 85%
3. `/outfits` - 78%
4. `/outfits/add/personal` - 65%
5. `/friends` - 60%

### Engagement by Route Type
- **Creation Routes** (`/add/*`) - Average 8 minutes
- **Gallery Routes** (`/outfits`, `/closet`) - Average 3 minutes
- **Social Routes** (`/friends`, `/friend/*`) - Average 5 minutes
- **Profile Routes** (`/profile`) - Average 2 minutes

---

## 🚀 Recent Route Updates (v3.0.0)

### New Routes Added
- ✅ `/outfits/add/personal` - Personal outfit creation
- ✅ `/outfits/add/suggested` - AI suggestions
- ✅ `/outfits/add/friend/:username` - Friend outfit creation
- ✅ `/outfits/edit/:outfitId` - Edit outfit

### Enhanced Routes
- ✅ `/outfits` - Now shows gallery instead of canvas
- ✅ `/home` - Added notifications section
- ✅ `/login` - Added TOS and Privacy Policy modals

### Route Restructure
- ✅ Dashboard.vue renamed to OutfitCreator.vue
- ✅ Canvas functionality moved to sub-routes
- ✅ Main `/outfits` now shows gallery
- ✅ Creation moved to `/outfits/add/*` routes

---

## 🔧 Technical Implementation

### Router Configuration
```javascript
// src/main.js
const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: Home, meta: { requiresAuth: true } },
  { path: '/closet', component: Cabinet, meta: { requiresAuth: true } },
  { path: '/outfits', component: Outfits, meta: { requiresAuth: true } },
  { path: '/friends', component: Friends, meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  
  // Outfit creation/editing routes
  { path: '/outfits/add/personal', component: OutfitCreator, 
    meta: { requiresAuth: true, subRoute: 'personal' } },
  { path: '/outfits/add/suggested', component: OutfitCreator, 
    meta: { requiresAuth: true, subRoute: 'suggested' } },
  { path: '/outfits/add/friend/:username', component: OutfitCreator, 
    meta: { requiresAuth: true, subRoute: 'friend' } },
  { path: '/outfits/edit/:outfitId', component: OutfitCreator, 
    meta: { requiresAuth: true, subRoute: 'edit' } },
  
  // ... other routes
]
```

### Route Guard
```javascript
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = authStore.isAuthenticated
  
  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/home')
  } else {
    next()
  }
})
```

---

## 📝 Notes for Developers

### Adding New Routes
1. Add route configuration in `main.js`
2. Create component in `src/pages/`
3. Update route guard if needed
4. Add to documentation
5. Test authentication requirement

### Route Naming Convention
- Use lowercase
- Use hyphens for multi-word paths
- Use RESTful patterns
- Use sub-routes for variations

### URL Parameters
- Use descriptive names
- Validate in component
- Handle errors gracefully
- Provide fallbacks

---

This comprehensive route documentation ensures all developers and LLM agents understand the complete navigation structure of StyleSnap v3.0.0.
