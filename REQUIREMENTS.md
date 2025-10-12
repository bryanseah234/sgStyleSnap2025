# StyleSnap - Requirements Index

## 🤖 For LLM Agents: Requirements Navigation

### How to Use This File

This file serves as the **requirements index** for the StyleSnap project. Follow this workflow:

1. **Start Here**: Review the core requirements below
2. **Deep Dive**: Read detailed requirement files in `requirements/*.md`
3. **Find Tasks**: Cross-reference with [TASKS.md](TASKS.md) for implementation tasks
4. **Consult Guides**: Check [docs/README.md](docs/README.md) for feature-specific documentation
5. **Review API**: Use [API_GUIDE.md](API_GUIDE.md) as **SINGLE SOURCE OF TRUTH** for all APIs

### Quick Reference

- **Database Schema**: [requirements/database-schema.md](requirements/database-schema.md)
- **Frontend Components**: [requirements/frontend-components.md](requirements/frontend-components.md)
- **Security Rules**: [requirements/security.md](requirements/security.md)
- **Error Handling**: [requirements/error-handling.md](requirements/error-handling.md)
- **Performance**: [requirements/performance.md](requirements/performance.md)
- **Item Catalog**: [requirements/item-catalog.md](requirements/item-catalog.md)
- **Color Detection**: [requirements/color-detection.md](requirements/color-detection.md)
- **Outfit Generation**: [requirements/outfit-generation.md](requirements/outfit-generation.md)

---

## Core Requirements

1. [Database Schema](requirements/database-schema.md)
2. **[API Guide](API_GUIDE.md)** - **SINGLE SOURCE OF TRUTH** for all APIs
3. [Frontend Components](requirements/frontend-components.md)
4. [Security](requirements/security.md)
5. [Error Handling](requirements/error-handling.md)
6. [Performance](requirements/performance.md)

## Authentication

### CRITICAL: Google SSO Only

- Authentication: Google OAuth 2.0 (Single Sign-On) exclusively
- No email/password, magic links, or other auth methods
- Pages: `/login` and `/register` (both use Google OAuth)
- After successful authentication: Redirect to `/closet` (home page)
- User profile auto-created on first Google sign-in
- Secrets stored in `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## User Settings

### Profile Photo

- 6 default avatars in `/public/avatars/default-1.png` through `default-6.png`
- User selects from defaults in Settings page (accessible via settings icon on home page)
- Future extensibility: Custom avatar upload via Cloudinary

### Username & Name Rules

- Username: Auto-generated from email (part before @), cannot be changed
- Name: From Google OAuth (first + last name), cannot be changed
- Email: From Google OAuth, cannot be changed
- All profile fields are display-only except avatar selection

## Additional References

- **[API Guide](API_GUIDE.md)** - Complete API documentation
- [Project Context](PROJECT_CONTEXT.md)
- [Tasks Overview](TASKS.md)
- [SQL Migrations](sql/)

## System Requirements

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

Purpose: Create a polished, professional app feel with smooth animations and visual feedback

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

### Notification System (Friends-Only Interactions)
**Notification Tab in Navigation:**
- Bell icon in nav bar with unread badge (red dot with count)
- Tapping icon navigates to `/notifications` page
- Badge shows count of unread notifications (max display: 99+)
- Real-time updates via Supabase subscriptions

**Notification Types:**
1. **Friend Outfit Suggestions** (type: `friend_outfit_suggestion`)
   - Friend manually creates outfit using items from YOUR closet
   - Notification shows: friend's avatar, "X suggested an outfit for you", preview
   - Action required: Approve or Reject
   - On approval: Outfit added to your `generated_outfits` table automatically
   - On rejection: Suggestion marked as rejected, no outfit added

2. **Outfit Likes** (type: `outfit_like`)
   - Friend likes your shared outfit in social feed
   - Notification shows: friend's avatar, "X liked your outfit", outfit preview
   - Only friends can like your outfits (enforced by RLS)
   - Clicking navigates to outfit details

3. **Item Likes** (type: `item_like`)
   - Friend likes individual item in your closet
   - Notification shows: friend's avatar, "X liked your [item name]", item image
   - Only friends can like your items (enforced by RLS)
   - Cannot like own items
   - Clicking navigates to item details

**Friend Outfit Suggestion Workflow:**
1. **Creation (Friend's perspective):**
   - Friend browses YOUR closet items
   - Selects multiple items (no category restrictions)
   - Optionally adds message (max 500 chars)
   - Submits suggestion
   - Stored in `friend_outfit_suggestions` table with status='pending'
   - Notification automatically created via database trigger

2. **Approval (Your perspective):**
   - Receive notification with outfit preview
   - View full outfit with all items
   - Read friend's message (if provided)
   - Options: "Approve" or "Reject" buttons
   - **On Approve:**
     - Database function `approve_friend_outfit_suggestion()` called
     - New entry created in `generated_outfits` table
     - Fields set: `is_manual=true`, `created_by_friend=true`, `friend_suggester_id=[friend's ID]`
     - Suggestion status updated to 'approved'
     - Notification marked as read
     - Toast: "Outfit added to your closet!"
   - **On Reject:**
     - Database function `reject_friend_outfit_suggestion()` called
     - Suggestion status updated to 'rejected'
     - Notification marked as read
     - Toast: "Suggestion rejected"

3. **Validation:**
   - All items MUST belong to your closet (enforced by RLS)
   - Friend MUST have accepted friend status (enforced by RLS)
   - Cannot suggest to yourself

**Item Likes System:**
- New table: `item_likes` (separate from old `likes` table)
- Each like creates notification (via trigger)
- Only friends can like (enforced by RLS)
- Cannot like own items (check constraint)
- Likes count denormalized on `clothes.likes_count`
- Triggers auto-increment/decrement count

**Outfit Likes System:**
- Table: `shared_outfit_likes` (for social feed posts)
- Each like creates notification (via trigger)
- Only friends can like (enforced by RLS and trigger logic)
- Likes count denormalized on `shared_outfits.likes_count`
- Triggers auto-increment/decrement count

**Notification Management:**
- **Mark as Read:** Individual notifications or "Mark All as Read"
- **Delete:** Swipe to delete individual notifications
- **Filter:** Tabs for "All" and "Unread"
- **Pagination:** Load 20 at a time, infinite scroll
- **Real-time:** New notifications appear instantly (Supabase subscription)
- **Browser Notifications:** Request permission, show desktop notifications
- **Sound:** Optional notification sound (user can disable)

**Privacy & Security:**
- RLS policies enforce friends-only access
- Suggestions validate item ownership
- Triggers prevent duplicate notifications
- Only owner can approve/reject suggestions
- Notification actor must be friend

**Database Tables:**
- `notifications` - Centralized notification storage
- `friend_outfit_suggestions` - Suggestion records with status
- `item_likes` - Individual item likes
- `shared_outfit_likes` - Outfit likes (social feed)
- `generated_outfits` - Extended with `created_by_friend` and `friend_suggester_id`

**UI Components:**
- NotificationsList.vue - Main list with tabs
- NotificationItem.vue - Individual notification card
- NotificationBadge.vue - Unread count badge
- SuggestionApprovalCard.vue - Approve/reject interface
- CreateSuggestionModal.vue - Friend creates suggestion
- ItemLikeButton.vue - Heart button on items
- ItemLikersList.vue - Modal showing who liked

**API Endpoints:**
- `GET /api/notifications` - Get notifications (paginated)
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `POST /api/friend-suggestions` - Create suggestion
- `POST /api/friend-suggestions/:id/approve` - Approve
- `POST /api/friend-suggestions/:id/reject` - Reject
- `POST /api/items/:id/like` - Like item
- `DELETE /api/items/:id/like` - Unlike item
### Notification System (Friends-Only Interactions) + Push Notifications

**Web Push API Integration:**
- Browser push notifications for real-time updates
- Service Worker handles push events and displays notifications
- User-controlled preferences with quiet hours
- Multi-device support (mobile, tablet, desktop)
- VAPID protocol for secure push delivery

**Push Notification Types:**
1. **Friend Requests** - When someone sends a friend request
2. **Friend Accepted** - When your friend request is accepted
3. **Outfit Likes** - When someone likes your shared outfit
4. **Outfit Comments** - When someone comments on your outfit
5. **Item Likes** - When someone likes your closet item
6. **Friend Outfit Suggestions** - When a friend suggests an outfit
7. **Daily Suggestions** (optional) - Morning outfit recommendations
8. **Weather Alerts** (optional) - Outfit updates based on weather
9. **Quota Warnings** - When approaching upload limit

**Notification Preferences:**
- Master toggle for all push notifications
- Individual toggles for each notification type
- Quiet hours (e.g., 10 PM - 8 AM, no non-urgent notifications)
- Daily suggestion time customization (e.g., 8:00 AM)
- Test notification button in settings

**Technical Implementation:**
- Push subscriptions stored in `push_subscriptions` table
- Preferences stored in `notification_preferences` table
- Delivery log in `notification_delivery_log` table
- Supabase Edge Function `send-push-notification` for sending
- Service worker in `public/service-worker.js` for receiving
- Client service in `src/services/push-notifications.js`

**Database Functions:**
- `should_send_notification()` - Check if notification should be sent
- `get_user_push_subscriptions()` - Get active subscriptions
- `mark_subscription_failed()` - Track failed deliveries
- `reset_subscription_failed_count()` - Reset on success
- `cleanup_expired_push_subscriptions()` - Remove expired/failed

**Components:**
- `PushNotificationPrompt.vue` - Permission request prompt
- `NotificationSettings.vue` - Preferences management
- `NotificationToggle.vue` - Individual type toggle
- `ToggleSwitch.vue` - UI switch component

**Automatic Triggers:**
- Push notifications sent automatically on relevant events
- Respects user preferences before sending
- Supports multiple devices per user
- Automatic retry on temporary failures
- Auto-disable after 5 consecutive failures

/* Lines 267-383 omitted */
- `GET /api/items/:id/likes` - Get likers

**Push Notification Endpoints:**
- Subscription managed client-side via Service Worker + Supabase
- Preferences via direct Supabase queries to `notification_preferences`
- Sending via Supabase Edge Function `send-push-notification`
- See `API_GUIDE.md` for full API details