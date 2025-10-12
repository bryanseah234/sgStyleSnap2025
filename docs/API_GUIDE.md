# StyleSnap API Guide

**Version:** 1.0.0  
**Last Updated:** October 8, 2025

This is the **single source of truth** for all APIs in the StyleSnap project. It covers REST APIs, Supabase services, database functions, and Edge functions.

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Clothes Management API](#clothes-management-api)
3. [Friends & Social API](#friends--social-api)
4. [Suggestions & Outfits API](#suggestions--outfits-api)
5. [Likes API](#likes-api)
6. [Catalog API](#catalog-api)
7. [Outfit Generation API](#outfit-generation-api)
8. [Collections & History API](#collections--history-api)
9. [Analytics API](#analytics-api)
10. [Notifications API](#notifications-api)
11. [Weather API](#weather-api)
12. [User Management API](#user-management-api)
13. [Database Functions](#database-functions)
14. [Edge Functions](#edge-functions)
15. [Error Codes & Rate Limits](#error-codes--rate-limits)

---

## Authentication & Authorization

### Overview

**CRITICAL: Google OAuth 2.0 Only**
- **Method:** Google SSO (Single Sign-On) exclusively
- **Pages:** `/login` and `/register` (both use same OAuth flow)
- **Redirect:** After auth → `/closet` (home page)
- **No alternatives:** No email/password, magic links, or other methods

### Authentication Headers

All API endpoints (except auth) require JWT token:

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Google OAuth Configuration

**Required Environment Variables:**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Setup Steps:**
1. Create OAuth 2.0 Client ID in Google Cloud Console
2. Configure authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:5173` (for development)
3. Enable Google provider in Supabase Dashboard
4. Add Client ID and Client Secret to Supabase settings

### Get Auth Token

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Sign in with Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/closet`
  }
});

// Get current session
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

### Service: `auth-service.js`

```javascript
import { supabase } from './auth-service'

// Sign in
await supabase.auth.signInWithOAuth({ provider: 'google' })

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Sign out
await supabase.auth.signOut()
```

---

## Clothes Management API

### Service: `clothes-service.js`

Handles all clothing item CRUD operations with quota enforcement (50 user uploads max, unlimited catalog items).

### Upload Image

**Function:** `uploadImage(file)`

Uploads image to Cloudinary with WebP compression.

```javascript
import { uploadImage } from '@/services/clothes-service'

const result = await uploadImage(file)
// Returns: { url: string, thumbnail_url: string, public_id: string }
```

**Features:**
- Automatic WebP conversion
- Client-side compression
- Thumbnail generation
- Device-specific capture:
  - Desktop/Laptop: File upload only
  - Mobile/Tablet: File upload + camera (`capture="environment"`)

### Create Item

**Function:** `createClothingItem(itemData)`

Creates new clothing item with automatic catalog contribution.

```javascript
const item = await createClothingItem({
  name: "Blue Denim Jacket",
  category: "outerwear",
  clothing_type: "Jacket",
  image_url: "https://res.cloudinary.com/...",
  privacy: "friends",
  style_tags: ["casual", "denim"],
  size: "M",
  brand: "Levi's",
  primary_color: "blue",
  secondary_colors: ["white"]
})
```

**Response:**
```json
{
  "id": "uuid",
  "owner_id": "user-uuid",
  "name": "Blue Denim Jacket",
  "category": "outerwear",
  "clothing_type": "Jacket",
  "image_url": "https://...",
  "thumbnail_url": "https://...",
  "privacy": "friends",
  "is_favorite": false,
  "created_at": "2025-10-08T12:00:00Z",
  "updated_at": "2025-10-08T12:00:00Z"
}
```

**Quota Enforcement:**
- Max 50 user uploads (catalog items don't count)
- Returns `403` if quota exceeded
- Uses `check_item_quota()` database function

**Auto-Catalog Contribution:**
- Item automatically added to `catalog_items` table
- Anonymous (no `owner_id`)
- Background operation (no user prompt)

### Get Closet Items

**Function:** `getClosetItems(filters)`

Fetches user's clothing items with filtering and pagination.

```javascript
const items = await getClosetItems({
  category: 'top',
  clothing_type: 'T-Shirt',
  is_favorite: true,
  privacy: 'friends',
  limit: 20,
  offset: 0
})
```

**Filters:**
- `category`: Category filter
- `clothing_type`: Detailed type filter (20 types available)
- `is_favorite`: Boolean for favorites only
- `privacy`: `private` or `friends`
- `limit`: Items per page (default: 20, max: 100)
- `offset`: Pagination offset

### Update Item

**Function:** `updateClothingItem(itemId, updates)`

Updates item metadata (image cannot be changed).

```javascript
await updateClothingItem(itemId, {
  name: "Vintage Denim Jacket",
  privacy: "private",
  style_tags: ["vintage", "casual"]
})
```

### Toggle Favorite

**Function:** `toggleFavorite(itemId)`

Toggles favorite status (heart icon).

```javascript
const updated = await toggleFavorite(itemId)
// Returns updated item with new is_favorite value
```

### Soft Delete Item

**Function:** `deleteClothingItem(itemId)`

Soft deletes item (30-day recovery period).

```javascript
await deleteClothingItem(itemId)
// Sets removed_at timestamp
// Item recoverable for 30 days
```

### Restore Item

**Function:** `restoreClothingItem(itemId)`

Restores soft-deleted item within 30 days.

```javascript
await restoreClothingItem(itemId)
// Clears removed_at timestamp
// Checks quota before restore
```

### Get Trash Items

**Function:** `getTrashItems()`

Gets soft-deleted items (30-day recovery window).

```javascript
const trashedItems = await getTrashItems()
// Returns items with removed_at timestamp
```

### Get Categories

**Function:** `getCategories()`

Gets unique categories from user's closet.

```javascript
const categories = await getCategories()
// Returns: ['top', 'bottom', 'outerwear', 'shoes', 'accessory']
```

### Get Item Details

**Function:** `getItemById(itemId)`

Gets single item details.

```javascript
const item = await getItemById(itemId)
// Returns full item object with all fields
```

---

## Friends & Social API

### Service: `friends-service.js`

Manages friendships, friend requests, and secure user search with anti-scraping protection.

### Search Users (Secure)

**Function:** `searchUsers(query)`

**SECURE** search with anti-scraping measures.

```javascript
const results = await searchUsers("John")
// Returns: { users: Array, count: number, has_more: boolean }
```

**Security Features:**
- Min 3 characters required
- Max 10 results
- Random order (prevents enumeration)
- No email addresses in results
- Fuzzy name matching OR exact email match
- Excludes current user and deleted users
- Includes friendship status

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "display_name": "John Doe",
      "avatar_url": "https://...",
      "friendship_status": "accepted"
    }
  ],
  "count": 1,
  "has_more": false
}
```

**Friendship Status Values:**
- `none`: No relationship
- `pending_sent`: Current user sent request
- `pending_received`: Current user received request
- `accepted`: Friends

### Get Friends

**Function:** `getFriends()`

Gets all accepted friendships.

```javascript
const friends = await getFriends()
// Returns array of friend user objects
```

### Get Pending Requests

**Function:** `getPendingRequests()`

Gets incoming and outgoing friend requests.

```javascript
const { incoming, outgoing } = await getPendingRequests()
```

### Send Friend Request

**Function:** `sendFriendRequest(targetUserId)`

Sends friend request by user ID (not email).

```javascript
const friendship = await sendFriendRequest(targetUserId)
// Creates friendship with status='pending'
```

### Accept Friend Request

**Function:** `acceptFriendRequest(requestId)`

Accepts incoming friend request.

```javascript
const updated = await acceptFriendRequest(requestId)
// Updates status to 'accepted'
```

### Reject Friend Request

**Function:** `rejectFriendRequest(requestId)`

Rejects incoming friend request.

```javascript
await rejectFriendRequest(requestId)
// Updates status to 'rejected' or deletes
```

### Cancel Friend Request

**Function:** `cancelFriendRequest(requestId)`

Cancels outgoing friend request.

```javascript
await cancelFriendRequest(requestId)
// Deletes pending request
```

### Unfriend

**Function:** `unfriend(friendshipId)`

Removes accepted friendship.

```javascript
await unfriend(friendshipId)
// Deletes friendship record
```

### Get Friend Profile

**Function:** `getFriendProfile(friendId)`

Gets friend's profile and viewable items (friends-only privacy).

```javascript
const { user, items } = await getFriendProfile(friendId)
// Returns user profile + items with privacy='friends'
```

---

## Suggestions & Outfits API

### Service: `suggestions-service.js`

Manages outfit suggestions between friends.

### Get Received Suggestions

**Function:** `getReceivedSuggestions()`

Gets suggestions sent TO current user.

```javascript
const suggestions = await getReceivedSuggestions()
// Returns array with creator details
```

### Get Sent Suggestions

**Function:** `getSentSuggestions()`

Gets suggestions sent BY current user.

```javascript
const suggestions = await getSentSuggestions()
// Returns array with recipient details
```

### Get Suggestion

**Function:** `getSuggestion(id)`

Gets single suggestion details.

```javascript
const suggestion = await getSuggestion(suggestionId)
// Returns full suggestion with items_data JSON
```

**items_data Format:**
```json
[
  {
    "item_id": "uuid",
    "x": 100,
    "y": 150,
    "z_index": 1
  }
]
```

### Create Suggestion

**Function:** `createSuggestion(suggestionData)`

Creates new outfit suggestion for friend.

```javascript
const suggestion = await createSuggestion({
  target_user_id: friendUserId,
  items_data: [
    { item_id: "item1-uuid", x: 100, y: 50, z_index: 1 },
    { item_id: "item2-uuid", x: 100, y: 200, z_index: 2 }
  ]
})
```

### Delete Suggestion

**Function:** `deleteSuggestion(id)`

Deletes sent suggestion (creator only).

```javascript
await deleteSuggestion(suggestionId)
```

### Mark as Viewed

**Function:** `markAsViewed(id)`

Updates suggestion status to 'viewed'.

```javascript
const updated = await markAsViewed(suggestionId)
// Only target user can mark as viewed
```

### Like Suggestion

**Function:** `likeSuggestion(id)`

Likes suggestion (optional feature).

```javascript
const updated = await likeSuggestion(suggestionId)
// Only target user can like
```

---

## Likes API

### Service: `likes-service.js`

Handles like/unlike operations for clothing items and shared outfits. Creates notifications automatically via database triggers.

### Like Item

**Function:** `likesService.likeItem(itemId)`

Likes a clothing item.

```javascript
const { like, likesCount } = await likesService.likeItem(itemId)
```

**Response:**
```json
{
  "like": {
    "id": "uuid",
    "item_id": "item-uuid",
    "user_id": "user-uuid",
    "created_at": "2025-10-08T12:00:00Z"
  },
  "likesCount": 15
}
```

**Rules:**
- Users can only like friends' items
- Cannot like own items
- Duplicate likes return existing like
- Creates notification automatically

**Errors:**
- `403`: Cannot like own items
- `409`: Already liked (returns existing)

### Unlike Item

**Function:** `likesService.unlikeItem(itemId)`

Removes like from item.

```javascript
const { likesCount } = await likesService.unlikeItem(itemId)
```

**Response:**
```json
{
  "likesCount": 14
}
```

### Like Outfit

**Function:** `likesService.likeOutfit(outfitId)`

Likes a shared outfit.

```javascript
const { like, likesCount } = await likesService.likeOutfit(outfitId)
```

Same rules as item likes.

### Unlike Outfit

**Function:** `likesService.unlikeOutfit(outfitId)`

Removes like from outfit.

```javascript
const { likesCount } = await likesService.unlikeOutfit(outfitId)
```

### Get Liked Items

**Function:** `likesService.getLikedItems(options)`

Gets items current user has liked.

```javascript
const { items, total } = await likesService.getLikedItems({
  limit: 20,
  offset: 0
})
```

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Blue Jacket",
      "image_url": "https://...",
      "likes_count": 15,
      "liked_at": "2025-10-08T12:00:00Z",
      "owner": {
        "id": "uuid",
        "display_name": "Jane Doe",
        "avatar_url": "https://..."
      }
    }
  ],
  "total": 25
}
```

### Get Item Likers

**Function:** `likesService.getItemLikers(itemId, options)`

Gets users who liked an item.

```javascript
const { likers, total } = await likesService.getItemLikers(itemId, {
  limit: 20
})
```

**Response:**
```json
{
  "likers": [
    {
      "id": "uuid",
      "display_name": "John Doe",
      "avatar_url": "https://...",
      "liked_at": "2025-10-08T12:00:00Z"
    }
  ],
  "total": 15
}
```

### Get Popular Items

**Function:** `likesService.getPopularItems(options)`

Gets trending items from friends.

```javascript
const { items, count } = await likesService.getPopularItems({
  limit: 10
})
```

Only returns items from friends (accepted friendships).

### Get Like Statistics

**Function:** `likesService.getLikeStats()`

Gets current user's like statistics.

```javascript
const stats = await likesService.getLikeStats()
```

**Response:**
```json
{
  "items_liked_by_me": 25,
  "my_items_liked": 40,
  "outfits_liked_by_me": 10,
  "my_outfits_liked": 20,
  "most_liked_item": {
    "id": "uuid",
    "name": "Black Leather Jacket",
    "likes_count": 50
  }
}
```

### Check Like Status

**Function:** `likesService.isItemLiked(itemId)` / `likesService.isOutfitLiked(outfitId)`

Checks if user has liked an item/outfit.

```javascript
const isLiked = await likesService.isItemLiked(itemId)
// Returns: boolean
```

---

## Catalog API

### Service: `catalog-service.js`

Browse and search catalog of clothing items (anonymous, no owner attribution).

**CRITICAL Privacy:** All catalog items displayed anonymously. No owner information ever exposed.

### Browse Catalog

**Function:** `catalogService.browse(options)`

Browse catalog with filters and pagination.

```javascript
const result = await catalogService.browse({
  category: 'top',
  color: 'blue',
  brand: 'Nike',
  season: 'summer',
  style: 'casual',
  excludeOwned: true,  // Default: filters out items user already owns
  page: 1,
  limit: 20
})
```

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Blue T-Shirt",
      "category": "top",
      "image_url": "https://...",
      "thumbnail_url": "https://...",
      "primary_color": "blue",
      "secondary_colors": ["white"],
      "style_tags": ["casual"],
      "brand": "Nike",
      "season": "summer"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "has_more": true
}
```

**Note:** By default excludes items user already owns (smart filtering).

### Search Catalog

**Function:** `catalogService.search(query, options)`

Full-text search with filters.

```javascript
const result = await catalogService.search("blue jacket", {
  category: 'outerwear',
  limit: 20,
  page: 1
})
```

**Search Features:**
- Full-text search on name, brand, style_tags
- Fuzzy matching
- Combined with filters
- Ranked results

### Add Catalog Item to Closet

**Function:** `catalogService.addToCloset(catalogItemId, customizations)`

Adds catalog item to user's closet.

```javascript
const newItem = await catalogService.addToCloset(catalogItemId, {
  name: "My Blue Jacket",  // Optional: customize name
  privacy: "friends",
  size: "M"
})
```

**Quota Check:**
- Checks 50 user upload limit
- Returns `403` if quota exceeded
- Creates new item in `clothes` table with `catalog_item_id` reference

### Get Catalog Categories

**Function:** `catalogService.getCategories()`

Gets available categories with counts.

```javascript
const categories = await catalogService.getCategories()
// Returns: { top: 50, bottom: 30, outerwear: 20, ... }
```

### Get Catalog Colors

**Function:** `catalogService.getColors()`

Gets available colors with counts.

```javascript
const colors = await catalogService.getColors()
// Returns: { blue: 25, red: 15, black: 30, ... }
```

---

## Outfit Generation API

### Service: `outfit-generator-service.js`

AI-powered outfit generation using permutation-based algorithm. All processing happens locally (no external AI APIs).

### Generate Outfits

**Function:** `generateOutfits(items, preferences)`

Generates outfit combinations from user's closet.

```javascript
import { generateOutfits } from '@/services/outfit-generator-service'

const outfits = await generateOutfits(closetItems, {
  weather: 'warm',      // hot, warm, cool, cold
  occasion: 'casual',   // casual, formal, business, sporty, party
  colorPreference: 'complementary',  // monochromatic, analogous, complementary, triadic, neutral
  stylePreference: 'casual',         // casual, formal, sporty, business, street, boho, vintage
  limit: 10
})
```

**Algorithm:**
1. **Permutation Generation:** Creates all valid outfit combinations
2. **Rule Filtering:** Applies weather, occasion, style rules
3. **Scoring:** Ranks outfits by:
   - Color harmony (30%)
   - Style compatibility (25%)
   - Weather appropriateness (20%)
   - Occasion fit (15%)
   - Variety bonus (10%)
4. **Top Results:** Returns highest-scoring outfits

**Required Categories for Valid Outfit:**
- Must include: `top` (or `outerwear`)
- Must include: `bottom` (or `shoes`)
- Optional: `accessory`

**Response:**
```json
[
  {
    "items": [
      {
        "id": "uuid",
        "name": "White T-Shirt",
        "category": "top",
        "image_url": "https://...",
        "primary_color": "white"
      },
      {
        "id": "uuid",
        "name": "Blue Jeans",
        "category": "bottom",
        "image_url": "https://...",
        "primary_color": "blue"
      }
    ],
    "score": 85,
    "color_scheme": "complementary",
    "style_match": "casual",
    "weather_appropriate": true,
    "occasion_fit": "casual"
  }
]
```

### Get Outfit Rules

**Function:** `getOutfitRules()`

Gets outfit generation rules and configuration.

```javascript
const rules = getOutfitRules()
```

**Returns:**
- `colorSchemes`: Color harmony schemes
- `styleMatrix`: Style compatibility matrix
- `weatherRules`: Weather-based rules
- `occasionRules`: Occasion-based rules

---

## Collections & History API

### Outfit History Service: `outfit-history-service.js`

Track outfits worn over time.

### Record Outfit

**Function:** `outfitHistoryService.recordOutfit(outfitData)`

Records a worn outfit.

```javascript
const entry = await outfitHistoryService.recordOutfit({
  outfit_items: [
    { item_id: "uuid", category: "top" },
    { item_id: "uuid", category: "bottom" }
  ],
  worn_date: "2025-10-08",
  occasion: "work",
  weather: "cool",
  rating: 5,
  notes: "Great for the office"
})
```

### Get History

**Function:** `outfitHistoryService.getHistory(filters)`

Gets outfit history with filters.

```javascript
const history = await outfitHistoryService.getHistory({
  occasion: 'work',
  rating_min: 4,
  limit: 20,
  offset: 0
})
```

### Update History

**Function:** `outfitHistoryService.updateHistory(id, updates)`

Updates outfit history entry.

```javascript
await outfitHistoryService.updateHistory(entryId, {
  rating: 4,
  notes: "Updated notes"
})
```

### Delete History

**Function:** `outfitHistoryService.deleteHistory(id)`

Deletes outfit history entry.

```javascript
await outfitHistoryService.deleteHistory(entryId)
```

### Collections Service: `collections-service.js`

Manage outfit collections/lookbooks.

### Create Collection

**Function:** `collectionsService.createCollection(collectionData)`

Creates new collection.

```javascript
const collection = await collectionsService.createCollection({
  name: "Summer Vacation",
  description: "Outfits for beach trip",
  is_public: false
})
```

### Get Collections

**Function:** `collectionsService.getCollections()`

Gets user's collections.

```javascript
const collections = await collectionsService.getCollections()
```

### Add Outfit to Collection

**Function:** `collectionsService.addOutfit(collectionId, outfitId)`

Adds outfit to collection.

```javascript
await collectionsService.addOutfit(collectionId, outfitId)
```

### Shared Outfits Service: `shared-outfits-service.js`

Social outfit sharing (Instagram-style feed).

### Share Outfit

**Function:** `sharedOutfitsService.shareOutfit(outfitData)`

Shares outfit to social feed.

```javascript
const shared = await sharedOutfitsService.shareOutfit({
  outfit_items: [...],
  caption: "Love this combo!",
  visibility: "friends",  // friends, public
  tags: ["casual", "summer"]
})
```

### Get Feed

**Function:** `sharedOutfitsService.getFeed(options)`

Gets social feed of shared outfits (friends only).

```javascript
const { outfits, total } = await sharedOutfitsService.getFeed({
  limit: 20,
  offset: 0,
  visibility: 'friends'
})
```

**Feed Order:** Chronological (newest first)

### Add Comment

**Function:** `sharedOutfitsService.addComment(outfitId, text)`

Adds comment to shared outfit.

```javascript
const comment = await sharedOutfitsService.addComment(outfitId, "Looks great!")
```

### Delete Comment

**Function:** `sharedOutfitsService.deleteComment(commentId)`

Deletes comment (owner only).

```javascript
await sharedOutfitsService.deleteComment(commentId)
```

---

## Analytics API

### Service: `analytics-service.js`

Wardrobe analytics and insights.

### Get Most Worn Items

**Function:** `analyticsService.getMostWornItems(limit)`

Gets most worn items.

```javascript
const items = await analyticsService.getMostWornItems(10)
```

**Response:**
```json
[
  {
    "item_id": "uuid",
    "name": "Black T-Shirt",
    "wear_count": 25,
    "image_url": "https://..."
  }
]
```

### Get Unworn Items

**Function:** `analyticsService.getUnwornItems()`

Gets items never worn.

```javascript
const unwornItems = await analyticsService.getUnwornItems()
```

### Get Statistics

**Function:** `analyticsService.getStats()`

Gets overall wardrobe statistics.

```javascript
const stats = await analyticsService.getStats()
```

**Response:**
```json
{
  "total_outfits": 150,
  "total_items": 50,
  "average_rating": 4.2,
  "favorite_occasion": "casual",
  "most_worn_category": "top"
}
```

### Get Category Breakdown

**Function:** `analyticsService.getCategoryBreakdown()`

Gets usage by category.

```javascript
const breakdown = await analyticsService.getCategoryBreakdown()
// Returns: { top: 50, bottom: 30, outerwear: 20 }
```

### Get Occasion Breakdown

**Function:** `analyticsService.getOccasionBreakdown()`

Gets usage by occasion.

```javascript
const breakdown = await analyticsService.getOccasionBreakdown()
// Returns: { casual: 80, work: 50, party: 20 }
```

---

## Notifications API

### Service: `notifications-service.js`

Handles all notification operations with real-time subscriptions.

### Get Notifications

**Function:** `notificationsService.getNotifications(options)`

Gets user notifications with pagination.

```javascript
const result = await notificationsService.getNotifications({
  limit: 20,
  offset: 0,
  unreadOnly: false
})
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "actor_id": "actor-uuid",
      "type": "item_like",
      "title": "New Like",
      "message": "John liked your Blue Jacket",
      "is_read": false,
      "created_at": "2025-10-08T12:00:00Z",
      "actor": {
        "id": "uuid",
        "username": "john_doe",
        "avatar": "https://..."
      }
    }
  ],
  "pagination": {
    "total": 50,
    "offset": 0,
    "limit": 20,
    "hasMore": true
  },
  "unread_count": 15
}
```

**Notification Types:**
- `item_like`: Someone liked your item
- `outfit_like`: Someone liked your outfit
- `friend_suggestion`: Friend sent outfit suggestion
- `friend_request`: New friend request
- `comment`: New comment on outfit

### Mark Notification as Read

**Function:** `notificationsService.markAsRead(notificationId)`

Marks single notification as read.

```javascript
await notificationsService.markAsRead(notificationId)
```

### Mark All as Read

**Function:** `notificationsService.markAllAsRead()`

Marks all notifications as read.

```javascript
await notificationsService.markAllAsRead()
```

### Get Unread Count

**Function:** `notificationsService.getUnreadCount()`

Gets count of unread notifications.

```javascript
const count = await notificationsService.getUnreadCount()
// Returns: number
```

### Subscribe to Real-time Notifications

**Function:** `notificationsService.subscribeToNotifications(callback)`

Subscribes to real-time notification updates.

```javascript
const unsubscribe = notificationsService.subscribeToNotifications((notification) => {
  console.log('New notification:', notification)
  // Update UI
})

// Later: unsubscribe()
```

### Friend Suggestions Service: `friend-suggestions-service.js`

Handles friend outfit suggestions (Task 14 notifications).

### Get Friend Suggestions

**Function:** `friendSuggestionsService.getSuggestions()`

Gets outfit suggestions from friends.

```javascript
const suggestions = await friendSuggestionsService.getSuggestions()
```

### Approve Suggestion

**Function:** `friendSuggestionsService.approveSuggestion(suggestionId)`

Approves friend's outfit suggestion.

```javascript
await friendSuggestionsService.approveSuggestion(suggestionId)
// Updates status to 'approved'
// Deletes notification
```

### Reject Suggestion

**Function:** `friendSuggestionsService.rejectSuggestion(suggestionId)`

Rejects friend's outfit suggestion.

```javascript
await friendSuggestionsService.rejectSuggestion(suggestionId)
// Updates status to 'rejected'
// Deletes notification
```

---

## Weather API

### Service: `weather-service.js`

Integrates with OpenWeatherMap API for weather-aware outfit suggestions.

### Get Current Weather

**Function:** `getCurrentWeather(lat, lon)`

Gets current weather for location.

```javascript
const weather = await getCurrentWeather(40.7128, -74.0060)
```

**Response:**
```json
{
  "temp": 72,
  "feels_like": 70,
  "condition": "clear",
  "description": "clear sky",
  "humidity": 60,
  "wind_speed": 5,
  "icon": "01d",
  "location": "New York"
}
```

**Temperature Categories:**
- `very_cold`: < 40°F
- `cold`: 40-55°F
- `cool`: 55-65°F
- `mild`: 65-75°F
- `warm`: 75-85°F
- `hot`: > 85°F

### Get Weather Forecast

**Function:** `getWeatherForecast(lat, lon)`

Gets 5-day weather forecast.

```javascript
const forecast = await getWeatherForecast(40.7128, -74.0060)
```

**Response:**
```json
[
  {
    "date": "2025-10-08",
    "temp": 72,
    "condition": "clear",
    "description": "clear sky"
  }
]
```

### Get Weather-Based Recommendations

**Function:** `getWeatherBasedRecommendations(weather)`

Gets outfit recommendations based on weather.

```javascript
const recommendations = getWeatherBasedRecommendations(weather)
```

**Returns:**
- Recommended categories
- Items to avoid
- Style suggestions

---

## User Management API

### Service: `user-service.js`

User profile management and settings.

### Get Profile

**Function:** `userService.getProfile()`

Gets current user's profile.

```javascript
const profile = await userService.getProfile()
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "John Doe",
  "avatar_url": "https://...",
  "google_id": "google-id",
  "created_at": "2025-01-01T00:00:00Z",
  "settings": {
    "notifications_enabled": true,
    "privacy_default": "friends"
  }
}
```

### Update Profile

**Function:** `userService.updateProfile(updates)`

Updates user profile.

```javascript
await userService.updateProfile({
  display_name: "Jane Doe",
  avatar_url: "https://..."
})
```

### Select Avatar

**Function:** `userService.selectAvatar(avatarUrl)`

Updates user's avatar (from preset avatars).

```javascript
await userService.selectAvatar("/avatars/avatar-1.png")
```

**Available Avatars:** `/public/avatars/` (10+ preset avatars)

### Update Settings

**Function:** `userService.updateSettings(settings)`

Updates user settings.

```javascript
await userService.updateSettings({
  notifications_enabled: false,
  privacy_default: "private"
})
```

---

## Database Functions

These PostgreSQL functions are available via Supabase RPC calls.

### Quota & Cleanup Functions

#### `check_item_quota(user_id UUID)`

Returns count of user's active items (excludes catalog items).

```sql
SELECT check_item_quota('user-uuid');
-- Returns: INTEGER (count of user uploads)
```

```javascript
const { data } = await supabase.rpc('check_item_quota', {
  user_id: userId
})
// Returns count for quota enforcement (50 max)
```

#### `cleanup_old_removed_items()`

Permanently deletes items soft-deleted 30+ days ago.

```sql
SELECT cleanup_old_removed_items();
-- Returns: INTEGER (count of deleted items)
```

**Scheduled Job:** Should run daily via pg_cron or external scheduler.

#### `get_friend_closet(friend_id UUID, viewer_id UUID)`

Gets friend's viewable items (privacy='friends').

```sql
SELECT * FROM get_friend_closet('friend-uuid', 'viewer-uuid');
```

Enforces friendship requirement and privacy rules.

### Color Detection Functions (SQL Migration 006)

#### `get_color_harmony(color1 TEXT, color2 TEXT)`

Checks color harmony compatibility.

```sql
SELECT get_color_harmony('blue', 'orange');
-- Returns: TEXT ('complementary', 'analogous', 'monochromatic', 'neutral', 'none')
```

#### `suggest_colors(base_color TEXT, scheme TEXT)`

Suggests colors based on harmony scheme.

```sql
SELECT suggest_colors('blue', 'complementary');
-- Returns: TEXT[] (array of compatible colors)
```

### Outfit Generation Functions (SQL Migration 007)

#### `get_compatible_items(item_id UUID, user_id UUID)`

Finds compatible items for outfit combinations.

```sql
SELECT * FROM get_compatible_items('item-uuid', 'user-uuid');
```

Returns items that match color/style with base item.

#### `score_outfit(outfit_items JSONB)`

Scores outfit combination (color, style, balance).

```sql
SELECT score_outfit('[{"category": "top", "color": "blue"}, {"category": "bottom", "color": "black"}]'::jsonb);
-- Returns: INTEGER (0-100 score)
```

### Notification Functions (SQL Migration 009)

#### `get_user_notifications(p_user_id UUID, p_limit INTEGER, p_offset INTEGER)`

Gets user notifications with pagination.

```javascript
const { data } = await supabase.rpc('get_user_notifications', {
  p_user_id: userId,
  p_limit: 20,
  p_offset: 0
})
```

#### `mark_notification_read(p_notification_id UUID)`

Marks notification as read.

```javascript
await supabase.rpc('mark_notification_read', {
  p_notification_id: notificationId
})
```

#### `mark_all_notifications_read(p_user_id UUID)`

Marks all user notifications as read.

```javascript
await supabase.rpc('mark_all_notifications_read', {
  p_user_id: userId
})
```

#### `get_unread_notification_count(p_user_id UUID)`

Gets count of unread notifications.

```javascript
const { data } = await supabase.rpc('get_unread_notification_count', {
  p_user_id: userId
})
```

#### `approve_friend_outfit_suggestion(p_suggestion_id UUID)`

Approves friend outfit suggestion.

```javascript
await supabase.rpc('approve_friend_outfit_suggestion', {
  p_suggestion_id: suggestionId
})
```

#### `reject_friend_outfit_suggestion(p_suggestion_id UUID)`

Rejects friend outfit suggestion.

```javascript
await supabase.rpc('reject_friend_outfit_suggestion', {
  p_suggestion_id: suggestionId
})
```

### Push Notification Functions (SQL Migration 010)

#### `get_user_push_subscriptions(p_user_id UUID)`

Gets user's active push subscriptions.

```javascript
const { data } = await supabase.rpc('get_user_push_subscriptions', {
  p_user_id: userId
})
```

#### `mark_subscription_failed(p_subscription_id UUID)`

Increments failed delivery count.

```javascript
await supabase.rpc('mark_subscription_failed', {
  p_subscription_id: subscriptionId
})
```

#### `reset_subscription_failed_count(p_subscription_id UUID)`

Resets failed count to 0.

```javascript
await supabase.rpc('reset_subscription_failed_count', {
  p_subscription_id: subscriptionId
})
```

#### `should_send_notification(p_user_id UUID, p_notification_type TEXT)`

Checks if user should receive notification based on preferences.

```javascript
const { data } = await supabase.rpc('should_send_notification', {
  p_user_id: userId,
  p_notification_type: 'item_like'
})
// Returns: BOOLEAN
```

#### `cleanup_expired_push_subscriptions()`

Removes expired or repeatedly failed subscriptions.

```sql
SELECT cleanup_expired_push_subscriptions();
-- Returns: INTEGER (count cleaned)
```

**Scheduled Job:** Should run daily.

### Analytics Functions (SQL Migration 004)

#### `get_most_worn_items(p_user_id UUID, p_limit INTEGER)`

Gets most worn items with counts.

```javascript
const { data } = await supabase.rpc('get_most_worn_items', {
  p_user_id: userId,
  p_limit: 10
})
```

#### `get_unworn_combinations(p_user_id UUID)`

Gets unworn or least worn items.

```javascript
const { data } = await supabase.rpc('get_unworn_combinations', {
  p_user_id: userId
})
```

#### `get_user_outfit_stats(p_user_id UUID)`

Gets overall wardrobe statistics.

```javascript
const { data } = await supabase.rpc('get_user_outfit_stats', {
  p_user_id: userId
})
```

**Returns:**
- `total_outfits`: Total outfit count
- `total_items`: Total item count
- `average_rating`: Average outfit rating
- `favorite_occasion`: Most common occasion
- `most_worn_category`: Most used category

### Category Functions (SQL Migration 009)

#### `get_category_group(detailed_category VARCHAR)`

Maps clothing_type to category group.

```sql
SELECT get_category_group('T-Shirt');
-- Returns: 'top'
```

**Clothing Types (20 total):**
- Top: T-Shirt, Shirt, Blouse, Longsleeve, Polo, Tank Top, Hoodie
- Bottom: Pants, Shorts, Skirt, Jeans
- Outerwear: Jacket, Blazer, Coat
- Shoes: Sneakers, Boots, Sandals
- Accessory: Hat, Bag, Jewelry

---

## Edge Functions

### Send Push Notification

**Edge Function:** `send-push-notification`  
**Location:** `supabase/functions/send-push-notification/index.ts`  
**Runtime:** Deno

Sends push notifications to user devices using Web Push protocol.

### Deploy

```bash
supabase functions deploy send-push-notification
```

### Invoke

```javascript
const { data, error } = await supabase.functions.invoke('send-push-notification', {
  body: {
    user_id: targetUserId,
    type: 'item_like',
    title: 'New Like',
    body: 'Someone liked your Blue Jacket',
    data: {
      item_id: itemId,
      actor_id: actorId
    },
    icon: '/icon.png',
    badge: '/badge.png',
    tag: 'item_like',
    requireInteraction: false
  }
})
```

**Request Body:**
- `user_id` (required): Target user UUID
- `type` (required): Notification type
- `title` (required): Notification title
- `body` (required): Notification body
- `data` (optional): Additional data object
- `icon` (optional): Icon URL
- `badge` (optional): Badge URL
- `image` (optional): Image URL
- `tag` (optional): Notification tag
- `requireInteraction` (optional): Requires user action

**Process:**
1. Authenticates request (JWT required)
2. Checks user notification preferences
3. Fetches user's active push subscriptions
4. Sends push notification to all devices
5. Handles failed deliveries
6. Returns success/failure status

**Response:**
```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "subscriptions_removed": 0
}
```

**VAPID Keys Required:**
- `VAPID_PUBLIC_KEY`: Public key (in `.env`)
- `VAPID_PRIVATE_KEY`: Private key (Supabase secret)
- `VAPID_SUBJECT`: Contact email (Supabase secret)

Generate keys:
```bash
npm install -g web-push
web-push generate-vapid-keys
```

---

## Error Codes & Rate Limits

### Standard Error Response

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {},
  "timestamp": "2025-10-08T12:00:00Z"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | No authentication token provided |
| `INVALID_TOKEN` | 401 | JWT token is invalid or expired |
| `FORBIDDEN` | 403 | User lacks permission for this resource |
| `QUOTA_EXCEEDED` | 403 | User has reached 50 upload limit |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `PRIVACY_VIOLATION` | 403 | Attempt to access private items |
| `FRIENDSHIP_REQUIRED` | 403 | Action requires accepted friendship |
| `RECOVERY_EXPIRED` | 404 | Item's 30-day recovery period expired |
| `SELF_LIKE_NOT_ALLOWED` | 403 | Cannot like own items |
| `DUPLICATE_LIKE` | 409 | Already liked |

### Rate Limits

| Endpoint Type | Limit | Window | Code |
|--------------|-------|--------|------|
| Authentication | 5 attempts | 15 min | 429 |
| Friend Requests | 10 requests | 1 hour | 429 |
| File Upload | 20 uploads | 1 hour | 429 |
| API Reads (GET) | 100 requests | 1 min | 429 |
| API Writes (POST/PUT) | 30 requests | 1 min | 429 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-10-08T12:01:00Z
```

### Rate Limit Exceeded Response

```json
{
  "error": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 3600,
  "timestamp": "2025-10-08T12:00:00Z"
}
```

---

## Response Headers

### Common Headers

```http
Content-Type: application/json; charset=utf-8
X-Request-ID: uuid-for-debugging
X-Response-Time: 45ms
```

### Quota Headers

```http
X-Quota-Used: 35
X-Quota-Limit: 50
X-Quota-Remaining: 15
```

---

## SDK Usage Examples

### Complete Example: Create Item Workflow

```javascript
import { uploadImage, createClothingItem } from '@/services/clothes-service'
import { compressImage } from '@/utils/image-compression'

async function addItem(file, metadata) {
  try {
    // 1. Compress image (WebP conversion)
    const compressed = await compressImage(file)
    
    // 2. Upload to Cloudinary
    const { url, thumbnail_url } = await uploadImage(compressed)
    
    // 3. Create item (with auto-catalog contribution)
    const item = await createClothingItem({
      ...metadata,
      image_url: url,
      thumbnail_url
    })
    
    console.log('Item created:', item)
    return item
  } catch (error) {
    if (error.code === 'QUOTA_EXCEEDED') {
      alert('You have reached your 50 item limit')
    } else {
      console.error('Upload failed:', error)
    }
  }
}
```

### Complete Example: Friend Search & Request

```javascript
import { searchUsers, sendFriendRequest } from '@/services/friends-service'

async function findAndAddFriend(name) {
  try {
    // 1. Search users (secure, anti-scraping)
    const { users } = await searchUsers(name)
    
    // 2. Find user without pending/accepted friendship
    const user = users.find(u => u.friendship_status === 'none')
    
    if (user) {
      // 3. Send friend request
      await sendFriendRequest(user.id)
      console.log('Friend request sent to', user.display_name)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Complete Example: Generate & Share Outfit

```javascript
import { getClosetItems } from '@/services/clothes-service'
import { generateOutfits } from '@/services/outfit-generator-service'
import { shareOutfit } from '@/services/shared-outfits-service'
import { getCurrentWeather } from '@/services/weather-service'

async function generateAndShareOutfit() {
  try {
    // 1. Get user's items
    const items = await getClosetItems()
    
    // 2. Get current weather
    const weather = await getCurrentWeather(lat, lon)
    
    // 3. Generate outfits
    const outfits = await generateOutfits(items, {
      weather: weather.temp > 75 ? 'hot' : 'warm',
      occasion: 'casual',
      limit: 5
    })
    
    // 4. Share top outfit
    const topOutfit = outfits[0]
    const shared = await shareOutfit({
      outfit_items: topOutfit.items,
      caption: 'Perfect for today!',
      visibility: 'friends'
    })
    
    console.log('Outfit shared:', shared)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Complete Example: Real-time Notifications

```javascript
import { 
  getNotifications, 
  subscribeToNotifications 
} from '@/services/notifications-service'

async function setupNotifications() {
  try {
    // 1. Load initial notifications
    const { data, unread_count } = await getNotifications({
      limit: 20,
      unreadOnly: false
    })
    
    console.log(`You have ${unread_count} unread notifications`)
    
    // 2. Subscribe to real-time updates
    const unsubscribe = subscribeToNotifications((notification) => {
      console.log('New notification:', notification)
      
      // Update UI
      if (notification.type === 'item_like') {
        showToast(`${notification.actor.username} liked your item!`)
      }
    })
    
    // 3. Cleanup on component unmount
    return () => unsubscribe()
  } catch (error) {
    console.error('Error:', error)
  }
}
```

---

## Pagination

All paginated endpoints support:

```javascript
// First page
GET /api/endpoint?limit=20&offset=0

// Second page
GET /api/endpoint?limit=20&offset=20

// Third page
GET /api/endpoint?limit=20&offset=40
```

**Response:**
```json
{
  "items": [...],
  "total": 150,
  "limit": 20,
  "offset": 0,
  "has_more": true
}
```

---

## Constants & Enums

### Categories

```javascript
export const CATEGORIES = {
  TOP: 'top',
  BOTTOM: 'bottom',
  OUTERWEAR: 'outerwear',
  SHOES: 'shoes',
  ACCESSORY: 'accessory'
}
```

### Clothing Types (20 types)

```javascript
export const CLOTHING_TYPES = [
  'T-Shirt', 'Shirt', 'Blouse', 'Longsleeve', 'Polo',
  'Pants', 'Shorts', 'Skirt', 'Jeans',
  'Jacket', 'Blazer', 'Coat', 'Hoodie',
  'Sneakers', 'Boots', 'Sandals',
  'Hat', 'Bag', 'Jewelry',
  'Other'
]
```

### Colors (18 colors)

```javascript
export const COLORS = [
  'red', 'orange', 'yellow', 'green', 'blue', 'purple',
  'pink', 'brown', 'black', 'white', 'gray', 'beige',
  'navy', 'teal', 'maroon', 'olive', 'cream', 'multicolor'
]
```

### Privacy Levels

```javascript
export const PRIVACY_LEVELS = {
  PRIVATE: 'private',  // Only you
  FRIENDS: 'friends'   // Friends can view
}
```

### Weather Conditions

```javascript
export const WEATHER_CONDITIONS = {
  HOT: 'hot',           // > 85°F
  WARM: 'warm',         // 75-85°F
  MILD: 'mild',         // 65-75°F
  COOL: 'cool',         // 55-65°F
  COLD: 'cold',         // 40-55°F
  VERY_COLD: 'very_cold' // < 40°F
}
```

### Occasions

```javascript
export const OCCASIONS = {
  CASUAL: 'casual',
  WORK: 'work',
  FORMAL: 'formal',
  PARTY: 'party',
  SPORTS: 'sports',
  DATE: 'date',
  TRAVEL: 'travel'
}
```

---

## Environment Variables

### Required Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth (REQUIRED for authentication)
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset

# Push Notifications
VITE_VAPID_PUBLIC_KEY=your-public-key

# OpenWeatherMap (Optional)
VITE_OPENWEATHER_API_KEY=your-api-key
```

**Google OAuth Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID to `.env` file
5. Configure in Supabase Dashboard → Authentication → Providers → Google

### Supabase Secrets

```bash
# Set via Supabase CLI
supabase secrets set VAPID_PRIVATE_KEY="your-private-key" --project-ref YOUR_REF
supabase secrets set VAPID_PUBLIC_KEY="your-public-key" --project-ref YOUR_REF
supabase secrets set VAPID_SUBJECT="mailto:support@yourdomain.com" --project-ref YOUR_REF
```

---

## API Versioning

Current version: **1.0.0**

All APIs use the current version. No version prefix in URLs yet.

Future versions will use: `/api/v2/endpoint`

---

## Support & Documentation

- **Main Documentation:** `/API_GUIDE.md` (this file)
- **Project Context:** `/PROJECT_CONTEXT.md`
- **Tasks:** `/TASKS.md`
- **Deployment:** `/DEPLOYMENT_GUIDE.md`
- **Database:** `/DATABASE_GUIDE.md`

---

**Last Updated:** October 8, 2025  
**Maintained By:** StyleSnap Team
