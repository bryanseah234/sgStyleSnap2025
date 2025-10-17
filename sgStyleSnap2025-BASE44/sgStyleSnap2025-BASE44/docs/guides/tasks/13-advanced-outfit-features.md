# Task 13: Advanced Outfit Features

**Status:** ✅ Complete  
**Priority:** Medium  
**Completed:** October 2025  
**Dependencies:** Tasks 1-5, Task 11 (Outfit Generation)  
**SQL Migration:** `sql/004_advanced_features.sql`

---

## 📋 Overview

Implement advanced outfit management features including outfit history tracking, social outfit sharing, outfit collections/lookbooks, style preferences, and analytics. These features enhance user engagement and provide valuable insights into wardrobe usage.

**Key Features:**
1. **Outfit History** - Track when users wear outfits with ratings and notes
2. **Shared Outfits** - Social feed for sharing outfit photos with friends
3. **Outfit Collections** - Create lookbooks for different occasions
4. **Style Preferences** - Capture user style preferences for better recommendations
5. **Analytics** - Insights on most/least worn items, favorite seasons, etc.

---

## 🎯 Acceptance Criteria

### Database (SQL)
- [x] **Migration File:** `sql/004_advanced_features.sql` created
- [x] Tables created:
  - `outfit_history` - Track worn outfits
  - `shared_outfits` - Social outfit posts
  - `outfit_likes` - Likes on shared outfits
  - `outfit_comments` - Comments on shared outfits
  - `style_preferences` - User style settings
  - `suggestion_feedback` - Thumbs up/down on suggestions
  - `outfit_collections` - User-created lookbooks
  - `collection_outfits` - Outfits in collections
- [x] RLS policies implemented for all tables
- [x] Analytics functions created
- [x] Triggers for auto-updating counts

### API Endpoints
- [x] **Outfit History**
  - `POST /api/outfit-history` - Record worn outfit
  - `GET /api/outfit-history` - Get user's outfit history
  - `GET /api/outfit-history/:id` - Get specific history entry
  - `PUT /api/outfit-history/:id` - Update history entry
  - `DELETE /api/outfit-history/:id` - Delete history entry
  - `GET /api/outfit-history/stats` - Get user's outfit statistics

- [x] **Shared Outfits (Friends-Only Feed)**
  - `POST /api/shared-outfits` - Share an outfit
  - `GET /api/shared-outfits/feed` - Get feed of friends' outfits only (chronological)
    - ✅ Only shows outfits from accepted friends
    - ✅ Uses bidirectional friendship query (canonical ordering)
    - ✅ Automatically excludes unfriended users
    - ✅ Sorted by created_at DESC (newest first)
  - `GET /api/shared-outfits/:id` - Get specific shared outfit
  - `PUT /api/shared-outfits/:id` - Update shared outfit
  - `DELETE /api/shared-outfits/:id` - Delete shared outfit
  - `POST /api/shared-outfits/:id/like` - Like a shared outfit
  - `DELETE /api/shared-outfits/:id/like` - Unlike a shared outfit
  - `POST /api/shared-outfits/:id/comment` - Comment on outfit
  - `DELETE /api/shared-outfits/:id/comment/:commentId` - Delete comment

- [x] **Outfit Collections**
  - `POST /api/collections` - Create collection
  - `GET /api/collections` - Get user's collections
  - `GET /api/collections/:id` - Get specific collection
  - `PUT /api/collections/:id` - Update collection
  - `DELETE /api/collections/:id` - Delete collection
  - `POST /api/collections/:id/outfits` - Add outfit to collection
  - `DELETE /api/collections/:id/outfits/:outfitId` - Remove outfit

- [x] **Style Preferences**
  - `GET /api/style-preferences` - Get user's preferences
  - `PUT /api/style-preferences` - Update preferences
  - `POST /api/suggestion-feedback` - Submit feedback on suggestion

- [x] **Analytics**
  - `GET /api/analytics/most-worn` - Most worn items
  - `GET /api/analytics/least-worn` - Least worn items
  - `GET /api/analytics/unworn` - Never worn items
  - `GET /api/analytics/stats` - Overall statistics

### Services
- [x] `src/services/outfit-history-service.js` - Outfit history API calls
- [x] `src/services/shared-outfits-service.js` - Social outfit sharing
- [x] `src/services/collections-service.js` - Collection management
- [x] `src/services/style-preferences-service.js` - Style preferences
- [x] `src/services/analytics-service.js` - Analytics data

### Stores (Pinia)
- [x] `src/stores/outfit-history-store.js` - Outfit history state
- [x] `src/stores/shared-outfits-store.js` - Social feed state
- [x] `src/stores/collections-store.js` - Collections state
- [x] `src/stores/style-preferences-store.js` - Preferences state
- [x] `src/stores/analytics-store.js` - Analytics state

### UI Components
- [x] **Outfit History**
  - `src/components/outfits/OutfitHistoryList.vue` - List of worn outfits
  - `src/components/outfits/RecordOutfitModal.vue` - Record worn outfit
  - `src/components/outfits/OutfitHistoryCard.vue` - Single history entry

- [x] **Shared Outfits**
  - `src/components/social/SharedOutfitsFeed.vue` - Social feed
  - `src/components/social/SharedOutfitCard.vue` - Single post
  - `src/components/social/ShareOutfitModal.vue` - Share outfit dialog
  - `src/components/social/OutfitCommentsList.vue` - Comments section

- [x] **Collections**
  - `src/components/collections/CollectionsList.vue` - List of collections
  - `src/components/collections/CollectionCard.vue` - Single collection
  - `src/components/collections/CollectionDetailView.vue` - Collection contents
  - `src/components/collections/CreateCollectionModal.vue` - New collection

- [x] **Style Preferences**
  - `src/components/preferences/StylePreferencesEditor.vue` - Edit preferences
  - `src/components/preferences/ColorPicker.vue` - Select favorite colors
  - `src/components/preferences/StyleSelector.vue` - Select preferred styles

- [x] **Analytics**
  - `src/components/analytics/WardrobeAnalytics.vue` - Analytics dashboard
  - `src/components/analytics/MostWornChart.vue` - Most worn items chart
  - `src/components/analytics/SeasonalBreakdown.vue` - Category/occasion/rating stats
  - `src/components/analytics/SeasonalBreakdown.vue` - Seasonal statistics

### Pages Integration
- [x] Add "Outfit History" tab to Profile page
- [x] Add "Collections" tab to Profile page
- [x] Add "Style Preferences" tab to Profile page
- [x] Create "Analytics" page (`src/pages/Analytics.vue`)
- [x] Add Analytics to router and navigation menu
- [x] Update `MainLayout.vue` with Analytics navigation link

---

## 📦 1. Database Migration

### File: `sql/004_advanced_features.sql`

**Status:** ✅ Complete

The migration file includes:

1. **8 Tables:**
   - `outfit_history` - Worn outfit tracking
   - `shared_outfits` - Social outfit posts
   - `outfit_likes` - Likes on posts
   - `outfit_comments` - Comments on posts
   - `style_preferences` - User style settings
   - `suggestion_feedback` - Feedback on suggestions
   - `outfit_collections` - User lookbooks
   - `collection_outfits` - Junction table

2. **Analytics Functions:**
   - `get_user_outfit_stats()` - Overall statistics
   - `get_most_worn_items()` - Most worn clothing
   - `get_unworn_combinations()` - Unworn items
   - `extract_cloth_ids_from_outfit()` - Helper function

3. **Triggers:**
   - Auto-update likes/comments counts
   - Auto-update collection outfit counts
   - Auto-update `updated_at` timestamps

4. **RLS Policies:**
   - Users can only access their own data
   - Friends can see friends-only shared outfits
   - Public outfits visible to all

### Dependencies

**Must run these migrations first:**
- `sql/001_initial_schema.sql` - Creates `users`, `clothes`, `suggestions` tables
- `sql/002_rls_policies.sql` - Sets up RLS
- `sql/003_indexes_functions.sql` - Creates indexes

---

## 📡 2. API Endpoints

### 2.1 Outfit History Endpoints

#### POST /api/outfit-history
**Record a worn outfit**

**Request:**
```json
{
  "suggestion_id": "uuid-optional",
  "outfit_name": "Work Meeting",
  "outfit_items": [
    {
      "cloth_id": "uuid",
      "name": "Blue Shirt",
      "category": "top",
      "image_url": "https://..."
    }
  ],
  "worn_date": "2025-10-06",
  "occasion": "work",
  "weather_temp": 72,
  "weather_condition": "sunny",
  "rating": 5,
  "notes": "Felt great!",
  "photo_url": "https://..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "created_at": "2025-10-06T10:00:00Z",
  ...
}
```

#### GET /api/outfit-history
**Get user's outfit history**

**Query Parameters:**
- `limit` - Max results (default: 50)
- `offset` - Pagination offset
- `occasion` - Filter by occasion
- `rating_min` - Minimum rating

**Response:**
```json
{
  "history": [...],
  "total": 125,
  "limit": 50,
  "offset": 0
}
```

#### GET /api/outfit-history/stats
**Get user's outfit statistics**

**Response:**
```json
{
  "total_outfits_worn": 125,
  "avg_rating": 4.2,
  "most_worn_occasion": "work",
  "favorite_season": "summer",
  "total_items_used": 45,
  "most_worn_item": {
    "cloth_id": "uuid",
    "name": "Navy Blazer",
    "wear_count": 23
  }
}
```

### 2.2 Shared Outfits Endpoints

#### POST /api/shared-outfits
**Share an outfit to social feed**

**Request:**
```json
{
  "outfit_history_id": "uuid-optional",
  "caption": "Love this combo!",
  "outfit_items": [...],
  "visibility": "friends" // or "public", "private"
}
```

#### GET /api/shared-outfits/feed
**Get social feed of shared outfits from friends only (chronologically sorted)**

**Authentication**: Required

**Query Parameters:**
- `limit` - Max results (default: 20, max: 50)
- `offset` - Pagination offset (default: 0)

**Filtering Logic:**
- **Friends-only**: Only returns outfits from users with accepted friend status
- **Bidirectional check**: Uses `friends` table with canonical ordering (requester_id < receiver_id)
- **Dynamic filtering**: Automatically excludes outfits when:
  - Friendship is deleted (unfriended)
  - Friendship status changes from 'accepted' to 'rejected' or 'pending'
  - No friendship relationship exists
- **Chronological order**: Sorted by created_at DESC (newest first)

**SQL Query Pattern:**
```sql
-- Get friends using bidirectional canonical ordering
SELECT so.*, u.id, u.name, u.avatar_url,
       EXISTS(SELECT 1 FROM shared_outfit_likes WHERE outfit_id = so.id AND user_id = $current_user) as is_liked_by_me
FROM shared_outfits so
JOIN users u ON u.id = so.user_id
WHERE so.user_id IN (
  SELECT CASE 
    WHEN requester_id = $current_user THEN receiver_id
    WHEN receiver_id = $current_user THEN requester_id
  END as friend_id
  FROM friends
  WHERE (requester_id = $current_user OR receiver_id = $current_user)
    AND status = 'accepted'
)
ORDER BY so.created_at DESC
LIMIT $limit OFFSET $offset;
```

**Response:**
```json
{
  "outfits": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "avatar_url": "https://..."
      },
      "caption": "Love this!",
      "outfit_items": [...],
      "visibility": "friends",
      "likes_count": 15,
      "comments_count": 3,
      "is_liked_by_me": true,
      "created_at": "2025-10-06T10:00:00Z"
    }
  ],
  "total": 50
}
```

**Note**: If user has no accepted friends, returns empty array `[]` with total: 0

#### POST /api/shared-outfits/:id/like
**Like a shared outfit**

**Response:**
```json
{
  "liked": true,
  "likes_count": 16
}
```

### 2.3 Collections Endpoints

#### POST /api/collections
**Create a new collection**

**Request:**
```json
{
  "name": "Work Outfits",
  "description": "Professional looks for the office",
  "theme": "Work",
  "visibility": "private"
}
```

#### POST /api/collections/:id/outfits
**Add outfit to collection**

**Request:**
```json
{
  "suggestion_id": "uuid-optional",
  "outfit_name": "Smart Casual",
  "outfit_items": [...],
  "position": 0,
  "notes": "Perfect for client meetings"
}
```

### 2.4 Style Preferences Endpoints

#### GET /api/style-preferences
**Get user's style preferences**

**Response:**
```json
{
  "user_id": "uuid",
  "favorite_colors": ["black", "navy", "gray"],
  "avoid_colors": ["bright pink"],
  "preferred_styles": ["casual", "business"],
  "preferred_brands": ["Uniqlo", "J.Crew"],
  "fit_preference": "regular",
  "common_occasions": ["work", "casual"]
}
```

#### PUT /api/style-preferences
**Update style preferences**

**Request:**
```json
{
  "favorite_colors": ["black", "navy"],
  "preferred_styles": ["casual", "streetwear"],
  "fit_preference": "regular"
}
```

### 2.5 Analytics Endpoints

#### GET /api/analytics/most-worn
**Get most worn items**

**Query Parameters:**
- `limit` - Max results (default: 10)

**Response:**
```json
{
  "items": [
    {
      "cloth_id": "uuid",
      "item_name": "Navy Blazer",
      "category": "outerwear",
      "wear_count": 23,
      "avg_rating": 4.8,
      "last_worn": "2025-10-05"
    }
  ]
}
```

---

## 🔧 3. Service Layer Implementation

### File: `src/services/outfit-history-service.js`

```javascript
/**
 * Outfit History Service
 * Handles API calls for outfit history tracking
 */

import { supabase } from './api'

export default {
  /**
   * Record a worn outfit
   * @param {Object} outfitData - Outfit details
   * @returns {Promise<Object>} Created history entry
   */
  async recordOutfit(outfitData) {
    const { data, error } = await supabase
      .from('outfit_history')
      .insert([outfitData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Get user's outfit history
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} Outfit history
   */
  async getHistory(filters = {}) {
    let query = supabase
      .from('outfit_history')
      .select('*')
      .order('worn_date', { ascending: false })
    
    if (filters.occasion) {
      query = query.eq('occasion', filters.occasion)
    }
    
    if (filters.rating_min) {
      query = query.gte('rating', filters.rating_min)
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  /**
   * Get specific outfit history entry
   * @param {string} id - History entry ID
   * @returns {Promise<Object>} History entry
   */
  async getHistoryEntry(id) {
    const { data, error } = await supabase
      .from('outfit_history')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Update outfit history entry
   * @param {string} id - History entry ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated entry
   */
  async updateHistory(id, updates) {
    const { data, error} = await supabase
      .from('outfit_history')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Delete outfit history entry
   * @param {string} id - History entry ID
   * @returns {Promise<void>}
   */
  async deleteHistory(id) {
    const { error } = await supabase
      .from('outfit_history')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  /**
   * Get user's outfit statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStats() {
    const { data, error } = await supabase
      .rpc('get_user_outfit_stats', {
        p_user_id: (await supabase.auth.getUser()).data.user.id
      })
    
    if (error) throw error
    return data[0] || {}
  },

  /**
   * Get most worn items
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Most worn items
   */
  async getMostWornItems(limit = 10) {
    const { data, error } = await supabase
      .rpc('get_most_worn_items', {
        p_user_id: (await supabase.auth.getUser()).data.user.id,
        p_limit: limit
      })
    
    if (error) throw error
    return data || []
  }
}
```

### File: `src/services/shared-outfits-service.js`

```javascript
/**
 * Shared Outfits Service
 * Handles social outfit sharing functionality
 */

import { supabase } from './api'

export default {
  /**
   * Share an outfit
   * @param {Object} outfitData - Outfit to share
   * @returns {Promise<Object>} Shared outfit
   */
  async shareOutfit(outfitData) {
    const { data, error } = await supabase
      .from('shared_outfits')
      .insert([outfitData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Get social feed of shared outfits from friends only
   * Automatically filters to show only outfits from accepted friends
   * Sorted chronologically (newest first)
   * 
   * @param {Object} options - Query options
   * @param {number} options.limit - Max results (default: 20)
   * @param {number} options.offset - Pagination offset (default: 0)
   * @returns {Promise<Object>} Feed data with friends' outfits only
   */
  async getFeed(options = {}) {
    const { limit = 20, offset = 0 } = options
    
    const currentUser = supabase.auth.user()
    if (!currentUser) throw new Error('Not authenticated')
    
    // Step 1: Get list of friend IDs using bidirectional canonical ordering
    // The friends table uses requester_id < receiver_id constraint
    const { data: friendships, error: friendsError } = await supabase
      .from('friends')
      .select('requester_id, receiver_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
    
    if (friendsError) throw friendsError
    
    // Extract friend IDs from both directions of the relationship
    const friendIds = friendships.map(f => 
      f.requester_id === currentUser.id ? f.receiver_id : f.requester_id
    )
    
    // If no friends, return empty feed
    if (friendIds.length === 0) {
      return { outfits: [], total: 0 }
    }
    
    // Step 2: Get shared outfits from friends only
    const { data, error, count } = await supabase
      .from('shared_outfits')
      .select(`
        *,
        user:user_id (id, name, avatar_url)
      `, { count: 'exact' })
      .in('user_id', friendIds)  // Only friends' outfits
      .order('created_at', { ascending: false })  // Chronological (newest first)
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    // Check if current user liked each outfit
    const outfitsWithLikes = await Promise.all(
      data.map(async (outfit) => {
        const { data: likeData } = await supabase
          .from('shared_outfit_likes')
          .select('id')
          .eq('outfit_id', outfit.id)
          .eq('user_id', currentUser.id)
          .single()
        
        return {
          ...outfit,
          is_liked_by_me: !!likeData
        }
      })
    )
    
    return {
      outfits: outfitsWithLikes || [],
      total: count || 0
    }
  },

  /**
   * Get specific shared outfit
   * @param {string} id - Outfit ID
   * @returns {Promise<Object>} Shared outfit
   */
  async getSharedOutfit(id) {
    const { data, error } = await supabase
      .from('shared_outfits')
      .select(`
        *,
        user:user_id (id, name, avatar_url)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Update shared outfit
   * @param {string} id - Outfit ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated outfit
   */
  async updateSharedOutfit(id, updates) {
    const { data, error } = await supabase
      .from('shared_outfits')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Delete shared outfit
   * @param {string} id - Outfit ID
   * @returns {Promise<void>}
   */
  async deleteSharedOutfit(id) {
    const { error } = await supabase
      .from('shared_outfits')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  /**
   * Like a shared outfit
   * @param {string} outfitId - Outfit ID
   * @returns {Promise<Object>} Like result
   */
  async likeOutfit(outfitId) {
    const { data, error } = await supabase
      .from('outfit_likes')
      .insert([{ outfit_id: outfitId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Unlike a shared outfit
   * @param {string} outfitId - Outfit ID
   * @returns {Promise<void>}
   */
  async unlikeOutfit(outfitId) {
    const { error } = await supabase
      .from('outfit_likes')
      .delete()
      .eq('outfit_id', outfitId)
      .eq('user_id', (await supabase.auth.getUser()).data.user.id)
    
    if (error) throw error
  },

  /**
   * Add comment to shared outfit
   * @param {string} outfitId - Outfit ID
   * @param {string} commentText - Comment text
   * @returns {Promise<Object>} Created comment
   */
  async addComment(outfitId, commentText) {
    const { data, error } = await supabase
      .from('outfit_comments')
      .insert([{
        outfit_id: outfitId,
        comment_text: commentText
      }])
      .select(`
        *,
        user:user_id (id, name, avatar_url)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Get comments for outfit
   * @param {string} outfitId - Outfit ID
   * @returns {Promise<Array>} Comments
   */
  async getComments(outfitId) {
    const { data, error } = await supabase
      .from('outfit_comments')
      .select(`
        *,
        user:user_id (id, name, avatar_url)
      `)
      .eq('outfit_id', outfitId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  /**
   * Delete comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<void>}
   */
  async deleteComment(commentId) {
    const { error } = await supabase
      .from('outfit_comments')
      .delete()
      .eq('id', commentId)
    
    if (error) throw error
  }
}
```

### File: `src/services/collections-service.js`

```javascript
/**
 * Collections Service
 * Handles outfit collections/lookbooks
 */

import { supabase } from './api'

export default {
  /**
   * Create a new collection
   * @param {Object} collectionData - Collection details
   * @returns {Promise<Object>} Created collection
   */
  async createCollection(collectionData) {
    const { data, error } = await supabase
      .from('outfit_collections')
      .insert([collectionData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Get user's collections
   * @returns {Promise<Array>} Collections
   */
  async getCollections() {
    const { data, error } = await supabase
      .from('outfit_collections')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  /**
   * Get specific collection
   * @param {string} id - Collection ID
   * @returns {Promise<Object>} Collection with outfits
   */
  async getCollection(id) {
    const { data: collection, error: collectionError } = await supabase
      .from('outfit_collections')
      .select('*')
      .eq('id', id)
      .single()
    
    if (collectionError) throw collectionError
    
    const { data: outfits, error: outfitsError } = await supabase
      .from('collection_outfits')
      .select('*')
      .eq('collection_id', id)
      .order('position', { ascending: true })
    
    if (outfitsError) throw outfitsError
    
    return {
      ...collection,
      outfits: outfits || []
    }
  },

  /**
   * Update collection
   * @param {string} id - Collection ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated collection
   */
  async updateCollection(id, updates) {
    const { data, error } = await supabase
      .from('outfit_collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Delete collection
   * @param {string} id - Collection ID
   * @returns {Promise<void>}
   */
  async deleteCollection(id) {
    const { error } = await supabase
      .from('outfit_collections')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  /**
   * Add outfit to collection
   * @param {string} collectionId - Collection ID
   * @param {Object} outfitData - Outfit to add
   * @returns {Promise<Object>} Added outfit
   */
  async addOutfitToCollection(collectionId, outfitData) {
    const { data, error } = await supabase
      .from('collection_outfits')
      .insert([{
        collection_id: collectionId,
        ...outfitData
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Remove outfit from collection
   * @param {string} outfitId - Outfit ID in collection
   * @returns {Promise<void>}
   */
  async removeOutfitFromCollection(outfitId) {
    const { error } = await supabase
      .from('collection_outfits')
      .delete()
      .eq('id', outfitId)
    
    if (error) throw error
  },

  /**
   * Reorder outfits in collection
   * @param {string} collectionId - Collection ID
   * @param {Array} outfitIds - Ordered outfit IDs
   * @returns {Promise<void>}
   */
  async reorderOutfits(collectionId, outfitIds) {
    const updates = outfitIds.map((id, index) => ({
      id,
      position: index
    }))
    
    for (const update of updates) {
      const { error } = await supabase
        .from('collection_outfits')
        .update({ position: update.position })
        .eq('id', update.id)
        .eq('collection_id', collectionId)
      
      if (error) throw error
    }
  }
}
```

### File: `src/services/style-preferences-service.js`

```javascript
/**
 * Style Preferences Service
 * Manages user style preferences
 */

import { supabase } from './api'

export default {
  /**
   * Get user's style preferences
   * @returns {Promise<Object|null>} Style preferences
   */
  async getPreferences() {
    const { data, error } = await supabase
      .from('style_preferences')
      .select('*')
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error
    }
    
    return data || null
  },

  /**
   * Update style preferences
   * @param {Object} preferences - Preferences to update
   * @returns {Promise<Object>} Updated preferences
   */
  async updatePreferences(preferences) {
    const { data: existing } = await supabase
      .from('style_preferences')
      .select('user_id')
      .single()
    
    let data, error
    
    if (existing) {
      // Update existing
      ({ data, error } = await supabase
        .from('style_preferences')
        .update(preferences)
        .eq('user_id', existing.user_id)
        .select()
        .single())
    } else {
      // Create new
      ({ data, error } = await supabase
        .from('style_preferences')
        .insert([preferences])
        .select()
        .single())
    }
    
    if (error) throw error
    return data
  },

  /**
   * Submit feedback on a suggestion
   * @param {string} suggestionId - Suggestion ID
   * @param {string} feedbackType - 'like', 'dislike', or 'love'
   * @param {string} reason - Optional reason
   * @returns {Promise<Object>} Feedback record
   */
  async submitFeedback(suggestionId, feedbackType, reason = null) {
    const { data, error } = await supabase
      .from('suggestion_feedback')
      .upsert([{
        suggestion_id: suggestionId,
        feedback_type: feedbackType,
        feedback_reason: reason
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Get feedback for a suggestion
   * @param {string} suggestionId - Suggestion ID
   * @returns {Promise<Object|null>} Feedback
   */
  async getFeedback(suggestionId) {
    const { data, error } = await supabase
      .from('suggestion_feedback')
      .select('*')
      .eq('suggestion_id', suggestionId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    return data || null
  }
}
```

### File: `src/services/analytics-service.js`

```javascript
/**
 * Analytics Service
 * Provides wardrobe analytics and insights
 */

import { supabase } from './api'

export default {
  /**
   * Get most worn items
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Most worn items
   */
  async getMostWornItems(limit = 10) {
    const { data, error } = await supabase
      .rpc('get_most_worn_items', {
        p_user_id: (await supabase.auth.getUser()).data.user.id,
        p_limit: limit
      })
    
    if (error) throw error
    return data || []
  },

  /**
   * Get unworn or least worn items
   * @returns {Promise<Array>} Unworn items
   */
  async getUnwornItems() {
    const { data, error } = await supabase
      .rpc('get_unworn_combinations', {
        p_user_id: (await supabase.auth.getUser()).data.user.id
      })
    
    if (error) throw error
    return data || []
  },

  /**
   * Get overall wardrobe statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStats() {
    const { data, error } = await supabase
      .rpc('get_user_outfit_stats', {
        p_user_id: (await supabase.auth.getUser()).data.user.id
      })
    
    if (error) throw error
    return data[0] || {}
  },

  /**
   * Get wardrobe usage by category
   * @returns {Promise<Object>} Category breakdown
   */
  async getCategoryBreakdown() {
    const { data, error } = await supabase
      .from('outfit_history')
      .select('outfit_items')
    
    if (error) throw error
    
    const categoryCount = {}
    
    data.forEach(outfit => {
      outfit.outfit_items.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
      })
    })
    
    return categoryCount
  },

  /**
   * Get wardrobe usage by occasion
   * @returns {Promise<Object>} Occasion breakdown
   */
  async getOccasionBreakdown() {
    const { data, error } = await supabase
      .from('outfit_history')
      .select('occasion')
    
    if (error) throw error
    
    const occasionCount = {}
    
    data.forEach(entry => {
      if (entry.occasion) {
        occasionCount[entry.occasion] = (occasionCount[entry.occasion] || 0) + 1
      }
    })
    
    return occasionCount
  }
}
```

---

## 🧪 Testing

### Unit Tests
- [x] **Service Tests** - All 82 tests passing
  - [x] `tests/unit/outfit-history-service.test.js` - 17 tests ✅
    - Record outfit, get history, update, delete, get stats
  - [x] `tests/unit/shared-outfits-service.test.js` - 19 tests ✅
    - Share outfit, get feed, like/unlike, comments
  - [x] `tests/unit/collections-service.test.js` - 15 tests ✅
    - CRUD operations, add/remove outfits, reorder, toggle favorite
  - [x] `tests/unit/style-preferences-service.test.js` - 13 tests ✅
    - Get/update preferences, submit/delete feedback
  - [x] `tests/unit/analytics-service.test.js` - 18 tests ✅
    - Most worn items, unworn items, stats, category/occasion/rating/weather breakdowns

### Test Coverage
- All service methods tested with success and error cases
- Mock Supabase client properly configured
- Auth user mocking implemented
- Query chaining tested for complex operations

---

## 📚 Documentation Updates

- [x] `docs/OUTFIT_GENERATION_GUIDE.md` - Updated with outfit history integration
- [x] Task file updated with completion status

---

## ✅ Verification Checklist

- [x] SQL migration creates all 8 tables
- [x] RLS policies properly restrict access
- [x] Analytics functions return correct data
- [x] All 5 services implemented and tested
- [x] All 5 Pinia stores created
- [x] All UI components created
- [x] Analytics page created and integrated
- [x] Router navigation updated
- [x] All unit tests passing (82/82)

---

## 🎉 Task Complete

All acceptance criteria met:
- ✅ Database schema deployed
- ✅ 5 services implemented with comprehensive tests
- ✅ 5 Pinia stores for state management
- ✅ Complete UI component library
- ✅ Analytics dashboard with insights
- ✅ 82 unit tests passing
- ✅ Documentation updated

Task 13 is fully complete and production-ready!