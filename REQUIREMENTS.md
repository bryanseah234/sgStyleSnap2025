# StyleSnap - Requirements Index

## Core Requirements
1. [Database Schema](requirements/database-schema.md)
2. [API Endpoints](requirements/api-endpoints.md)
3. [Frontend Components](requirements/frontend-components.md)
4. [Security](requirements/security.md)
5. [Error Handling](requirements/error-handling.md)
6. [Performance](requirements/performance.md)

## Authentication
**CRITICAL: Google SSO Only**
- Authentication: Google OAuth 2.0 (Single Sign-On) exclusively
- No email/password, magic links, or other auth methods
- Pages: `/login` and `/register` (both use Google OAuth)
- After successful authentication: Redirect to `/closet` (home page)
- User profile auto-created on first Google sign-in
- Secrets stored in `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## User Settings
**Profile Photo:**
- 6 default avatars in `/public/avatars/default-1.png` through `default-6.png`
- User selects from defaults in Settings page (accessible via settings icon on home page)
- Future extensibility: Custom avatar upload via Cloudinary

**Username & Name Rules:**
- Username: Auto-generated from email (part before @), cannot be changed
- Name: From Google OAuth (first + last name), cannot be changed
- Email: From Google OAuth, cannot be changed
- All profile fields are display-only except avatar selection

## Additional References
- [Project Context](PROJECT_CONTEXT.md)
- [Tasks Overview](TASKS.md)
- [SQL Migrations](sql/)

## Quick Reference
### Quota Limits
- **Max User Uploads:** 50 items (images uploaded by user)
- **Catalog Additions:** Unlimited (items added from pre-populated catalog)
- **Warning Threshold:** 45 uploads (90%)
- **Blocked:** At 50 uploads, can only add from catalog
- **Image Size Limit**: 1MB after resize
- **Supported Categories**: top, bottom, outerwear, shoes, accessory
- **Privacy Levels**: private, friends
- **Friend Status**: pending, accepted, rejected
- **Favorite Items**: Users can mark items as favorites for quick access (heart icon toggle)

### Filtering & Organization
- **Favorites Filter:** Show only favorited items with toggle button
- **Category Filter:** Filter by category (dropdown populated with user's available categories)
- **Clothing Type Filter:** Filter by specific type within category
- **Privacy Filter:** Filter by privacy level (private/friends)
- **Multiple Filters:** All filters can be applied simultaneously
- **Clear Filters:** Reset all filters with single button

### UI/UX Animations & Motion Design
**Purpose:** Create a polished, professional app feel with smooth animations and visual feedback

**Loading States:**
- **Spinner animations** - Rotating spinner for all async operations
- **Skeleton loaders** - Shimmer effect placeholders for content loading
- **Progress bars** - Smooth filling animations for uploads
- **Pull-to-refresh** - Mobile gesture with spinner indicator

**Interactive Animations:**
- **Button interactions:**
  - Hover: Scale (1.05x) + shadow expansion
  - Click: Scale down (0.95x) momentarily
  - Loading: Pulse animation + inline spinner
- **Icon buttons:**
  - Hover: Scale (1.1x) + optional rotate
  - Favorite heart: Bounce effect (3x) when toggled
- **Cards (clothing items):**
  - Entrance: Staggered fade-in + slide-up (100ms delay per card)
  - Hover: Scale (1.05x) + translate up (-8px) + shadow expansion
  - Hover image: Scale (1.1x) with overflow hidden
  - Hover overlay: Fade in dark overlay (20% opacity)
- **Floating Action Button (FAB):**
  - Hover: Scale (1.1x) + rotate (90deg) + shadow expansion
  - Click: Scale (0.95x)
  - Page load: Bounce entrance
  - Near quota limit: Pulse animation

**Modal & Overlay Animations:**
- **Entrance:** Fade in overlay (0.3s) + slide up content (0.3s)
- **Exit:** Fade out overlay + slide down content
- **Backdrop:** Blur effect on background

**List & Grid Animations:**
- **Entrance:** Staggered animation (50-100ms delay per item)
- **Filter changes:** Smooth fade out → reorder → fade in
- **Item removal:** Scale down + fade out
- **Item addition:** Scale up + fade in from 0.95

**Notifications & Feedback:**
- **Toast notifications:** Slide down from top, auto-dismiss with fade
- **Success checkmark:** Animated SVG checkmark with circle
- **Error shake:** Horizontal shake animation
- **Form validation:** Smooth color transitions for errors

**Micro-interactions:**
- **Heart favorite:** Scale + bounce + color fill animation
- **Settings gear:** Rotate 180deg on hover
- **Search icon:** Rotate while searching
- **Filter badges:** Pop in with scale animation
- **Quota indicator:** Progress bar fills smoothly, pulse on warning

**Performance:**
- All animations use CSS transforms (GPU accelerated)
- Respect `prefers-reduced-motion` for accessibility
- Maximum duration: 400ms for most animations
- Easing: `ease-out` for entrances, `ease-in` for exits

### Item Statistics & Details
When viewing an item in the virtual closet, users can see comprehensive statistics:
- **Days in Closet:** Calculated from when item was added (created_at)
- **Favorite Status:** Whether item is marked as favorite (with toggle button)
- **Category & Type:** Item's category and specific clothing type
- **Detected Color:** AI-detected color with visual color swatch
- **Times Worn:** Count of how many times item has been worn (from outfit_history)
- **Last Worn Date:** Most recent date the item was worn
- **In Outfits:** Number of outfit combinations including this item
- **Times Shared:** Count of times item was shared with friends
- **Last Updated:** When item information was last modified
- **Brand & Size:** Brand name and size information (if provided)
- **Privacy Level:** Current privacy setting (private/friends)
- **Style Tags:** User-defined tags for organization

### Upload Methods (Device-Specific)
- **Desktop/Laptop:** File upload only (select from file system)
- **Mobile/Tablet:** File upload + camera capture (take photo directly)

### Catalog Privacy
- **Anonymous Browsing:** All catalog items displayed without owner information
- **No Attribution:** Users cannot see who uploaded catalog items (admin or other users)
- **Privacy by Design:** catalog_items table has no owner_id column

### Catalog Auto-Contribution
- **Automatic Addition:** User uploads automatically added to catalog (no prompt)
- **Background Process:** Catalog contribution happens silently after successful upload
- **Smart Filtering:** Catalog browse excludes items user already owns

### Friend Search & Relationships
- **Secure Search:** Find users by username (fuzzy match) or email (exact match)
- **Anti-Scraping Protection:** Prevents database enumeration
  - Minimum 3-character query
  - Rate limiting: 20 searches per minute
  - Result limit: 10 users maximum
  - Random ordering (no pagination)
  - Email addresses never exposed
- **Friendship States:**
  - `pending`: Friend request sent, awaiting response
  - `accepted`: Mutual friendship established
  - `rejected`: Friend request declined
- **Relationship Management:** Send requests, accept/reject, unfriend

### Outfit Generation (Permutation-Based)
**Algorithm Type:** Rule-based permutation system (NO machine learning)

**How It Works:**
1. Group user's closet items by category (top, bottom, shoes, outerwear, accessories)
2. Generate permutations with **exactly ONE item per category**
3. Score outfits using color harmony rules and style compatibility
4. Filter by weather, occasion, and user preferences
5. Return top-scoring combinations

**Category Rules (CRITICAL):**
- ✅ Valid: 1 top + 1 bottom + 1 shoes
- ❌ Invalid: 2 tops, 2 bottoms, 2 shoes in same outfit
- ✅ Valid: 1 top + 1 bottom + 1 shoes + 1 outerwear + 1 accessory
- ❌ Invalid: 1 top + 1 top (even if different styles)
- **Enforcement:** Algorithm validates NO duplicate categories before scoring

**Scoring System (0-100):**
- Color Harmony (40%): Monochromatic, complementary, analogous, neutral
- Completeness (60%): Required items (top+bottom+shoes) + optional (outerwear, accessories)

**Visual Presentation:**
- Outfits displayed as **item images on blank canvas**
- NO superimposition on person/mannequin
- Items arranged vertically or in grid layout
- Order: top → bottom → shoes → outerwear → accessories
- Each item shown in original uploaded photo

**User Actions:**
- Generate outfit with weather/occasion parameters
- Rate outfits (1-5 stars) for personal tracking
- Save favorite outfits to collection
- Regenerate to get different permutation
- Swap individual items (respects category rules)

**Manual Outfit Creation:**
- **Create outfits manually** via drag-and-drop interface
- **Drag items** from closet sidebar onto blank canvas
- **Search/filter items** while creating (category, name, color)
- **Position items freely** anywhere on canvas (x, y coordinates)
- **No category restrictions** - Add any combination (2 tops for layering, 3 accessories, etc.)
- **Z-index reordering** - Layer items for visual depth
- **Save with metadata** - Custom name, notes, and tags
- **Edit existing outfits** - Add/remove/reposition items
- **Auto-save drafts** - Work saved automatically
- **Max 10 items per outfit** - Practical limit

**Storage:**
- Manual outfits stored in same table as auto-generated
- Flagged with `is_manual: true`
- Includes `item_positions` (x, y, z_index for each item)
- Includes `outfit_name`, `outfit_notes`, `tags`

**Future Enhancements (NOT implemented yet):**
- Machine learning from user preferences
- Photo overlay on mannequin/person
- Style transfer from inspiration photos
- Collaborative filtering ("Users like you also liked...")
- Canvas item resize/rotate controls
- Outfit templates/layouts

### Social Feed (Friends-Only Outfits)
**Feed Display:**
- Shows outfits shared by **accepted friends only**
- Sorted **chronologically** (newest first)
- Displays username, avatar, outfit image, caption, like/comment counts
- Real-time like/unlike functionality
- Navigate to full outfit details on tap

**Friends-Only Filtering:**
- Uses `friends` table with canonical ordering (requester_id < receiver_id)
- Checks **both directions** of friendship relationship
- Only shows outfits when `status = 'accepted'`
- **Automatically excludes:**
  - Non-friends (no friendship record)
  - Pending requests (status = 'pending')
  - Rejected requests (status = 'rejected')
  - Unfriended users (friendship deleted from database)

**Dynamic Updates:**
- When user unfriends someone → Their outfits **immediately disappear** from feed
- When friendship changes to 'rejected' → Outfits removed from feed
- When friendship accepted → Outfits appear in feed
- No caching of old friendships - queries live data every time

**Bidirectional Query:**
```sql
WHERE user_id IN (
  SELECT CASE 
    WHEN requester_id = current_user THEN receiver_id
    WHEN receiver_id = current_user THEN requester_id
  END
  FROM friends
  WHERE (requester_id = current_user OR receiver_id = current_user)
    AND status = 'accepted'
)
ORDER BY created_at DESC
```

**Empty State:**
- If user has 0 accepted friends → Shows "Add friends to see their outfits"
- Friendly message with link to Friends page

**Pagination:**
- Default: 20 outfits per page
- Max: 50 outfits per request
- Infinite scroll or "Load More" button