# Task 12: Likes Feature

**Status:** ✅ Complete (Frontend Integration Finished)  
**Priority:** Medium  
**Estimated Time:** 2-3 days (Completed)

## Overview
Implement likes/reactions feature for individual clothing items. Users can like their friends' clothing items to show appreciation and save items they admire. This feature enhances social engagement and helps users discover popular items.

## Dependencies
- Task 1: Infrastructure Setup (Supabase, database)
- Task 2: Authentication & Database (users table)
- Task 3: Closet CRUD & Image Management (clothes table)
- Task 4: Social Features & Privacy (friends system)

## Acceptance Criteria
- [ ] Users can like individual clothing items
- [ ] Users can unlike items (toggle behavior)
- [ ] Like count displays on each item
- [ ] Liked items show filled heart icon
- [ ] Users can view all items they've liked
- [ ] Users can see who liked their items
- [ ] Likes respect privacy settings (only friends can like friends' items)
- [ ] Real-time like count updates
- [ ] Like animations provide visual feedback
- [ ] Offline support with sync when online

## Database Changes

### SQL Migration: `sql/008_likes_feature.sql`

```sql
-- Migration 008: Likes Feature
-- Enables likes/reactions on individual clothing items

-- ============================================
-- LIKES TABLE
-- ============================================

-- Uncomment the likes table from 001_initial_schema.sql
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Indexes for performance
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_item_id ON likes(item_id);
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);

-- ============================================
-- ADD LIKES COUNT TO CLOTHES TABLE
-- ============================================

-- Add likes_count column to clothes table for caching
ALTER TABLE clothes
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Create index on likes_count for sorting by popularity
CREATE INDEX idx_clothes_likes_count ON clothes(likes_count DESC);

-- ============================================
-- TRIGGERS FOR AUTOMATIC LIKES COUNT
-- ============================================

-- Function to increment likes count
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clothes
  SET likes_count = likes_count + 1
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT to likes table
CREATE TRIGGER increment_likes_count_trigger
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_likes_count();

-- Function to decrement likes count
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clothes
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = OLD.item_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger on DELETE from likes table
CREATE TRIGGER decrement_likes_count_trigger
  AFTER DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_likes_count();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on likes table
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all likes (for seeing who liked items)
CREATE POLICY "Users can view all likes"
ON likes FOR SELECT
USING (true);

-- Policy: Users can only create likes for themselves
CREATE POLICY "Users can create own likes"
ON likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own likes
CREATE POLICY "Users can delete own likes"
ON likes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get items liked by a specific user
CREATE OR REPLACE FUNCTION get_user_liked_items(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 50,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  item_id UUID,
  item_name VARCHAR(255),
  category VARCHAR(50),
  image_url TEXT,
  thumbnail_url TEXT,
  owner_id UUID,
  owner_name VARCHAR(255),
  liked_at TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.category,
    c.image_url,
    c.thumbnail_url,
    c.owner_id,
    u.name,
    l.created_at,
    c.likes_count
  FROM likes l
  JOIN clothes c ON l.item_id = c.id
  JOIN users u ON c.owner_id = u.id
  WHERE 
    l.user_id = user_id_param
    AND c.removed_at IS NULL
  ORDER BY l.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Get users who liked a specific item
CREATE OR REPLACE FUNCTION get_item_likers(
  item_id_param UUID,
  limit_param INTEGER DEFAULT 50
)
RETURNS TABLE (
  user_id UUID,
  user_name VARCHAR(255),
  avatar_url TEXT,
  liked_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.avatar_url,
    l.created_at
  FROM likes l
  JOIN users u ON l.user_id = u.id
  WHERE l.item_id = item_id_param
  ORDER BY l.created_at DESC
  LIMIT limit_param;
END;
$$;

-- Get most liked items from friends
CREATE OR REPLACE FUNCTION get_popular_items_from_friends(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 20
)
RETURNS TABLE (
  item_id UUID,
  item_name VARCHAR(255),
  category VARCHAR(50),
  image_url TEXT,
  thumbnail_url TEXT,
  owner_id UUID,
  owner_name VARCHAR(255),
  likes_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.category,
    c.image_url,
    c.thumbnail_url,
    c.owner_id,
    u.name,
    c.likes_count
  FROM clothes c
  JOIN users u ON c.owner_id = u.id
  WHERE 
    -- Item owner is a friend
    EXISTS (
      SELECT 1 FROM friends f
      WHERE 
        f.status = 'accepted'
        AND (
          (f.requester_id = user_id_param AND f.receiver_id = c.owner_id)
          OR (f.receiver_id = user_id_param AND f.requester_id = c.owner_id)
        )
    )
    AND c.removed_at IS NULL
    AND c.likes_count > 0
  ORDER BY c.likes_count DESC, c.created_at DESC
  LIMIT limit_param;
END;
$$;

-- ============================================
-- ANALYTICS VIEW
-- ============================================

-- View: Most liked items overall
CREATE OR REPLACE VIEW popular_items AS
SELECT 
  c.id,
  c.name,
  c.category,
  c.image_url,
  c.thumbnail_url,
  c.owner_id,
  u.name AS owner_name,
  c.likes_count,
  c.created_at
FROM clothes c
JOIN users u ON c.owner_id = u.id
WHERE 
  c.removed_at IS NULL
  AND c.likes_count > 0
ORDER BY c.likes_count DESC, c.created_at DESC;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE likes IS 'User likes on individual clothing items';
COMMENT ON COLUMN clothes.likes_count IS 'Cached count of likes for performance';
COMMENT ON FUNCTION get_user_liked_items IS 'Get all items liked by a specific user';
COMMENT ON FUNCTION get_item_likers IS 'Get all users who liked a specific item';
COMMENT ON FUNCTION get_popular_items_from_friends IS 'Get most liked items from user''s friends';
COMMENT ON VIEW popular_items IS 'Most liked items across all users';
```

## API Endpoints

### 1. Like an Item
```
POST /api/likes
Body:
  {
    "itemId": "uuid"
  }
Response:
  {
    "success": true,
    "like": {
      "id": "uuid",
      "userId": "uuid",
      "itemId": "uuid",
      "createdAt": "2025-10-06T12:00:00Z"
    },
    "likesCount": 5
  }
Error Cases:
  - 400: Invalid itemId
  - 401: Not authenticated
  - 403: Item is private and user is not friend
  - 404: Item not found
  - 409: Already liked (idempotent - return existing like)
```

### 2. Unlike an Item
```
DELETE /api/likes/:itemId
Response:
  {
    "success": true,
    "likesCount": 4
  }
Error Cases:
  - 401: Not authenticated
  - 404: Like not found (already unliked)
```

### 3. Get User's Liked Items
```
GET /api/likes/user/:userId?limit=50&offset=0
Response:
  {
    "items": [
      {
        "itemId": "uuid",
        "itemName": "Blue Denim Jacket",
        "category": "outerwear",
        "imageUrl": "https://...",
        "thumbnailUrl": "https://...",
        "ownerId": "uuid",
        "ownerName": "Alice Smith",
        "likedAt": "2025-10-06T12:00:00Z",
        "likesCount": 5
      }
    ],
    "total": 42,
    "limit": 50,
    "offset": 0
  }
```

### 4. Get Item Likers
```
GET /api/likes/item/:itemId?limit=50
Response:
  {
    "likers": [
      {
        "userId": "uuid",
        "userName": "Bob Johnson",
        "avatarUrl": "https://...",
        "likedAt": "2025-10-06T12:00:00Z"
      }
    ],
    "total": 5
  }
```

### 5. Get Popular Items from Friends
```
GET /api/likes/popular?limit=20
Response:
  {
    "items": [
      {
        "itemId": "uuid",
        "itemName": "Black Leather Boots",
        "category": "shoes",
        "imageUrl": "https://...",
        "thumbnailUrl": "https://...",
        "ownerId": "uuid",
        "ownerName": "Alice Smith",
        "likesCount": 15
      }
    ]
  }
```

## Frontend Components

### 1. LikeButton.vue (New Component)

**Location:** `src/components/ui/LikeButton.vue`

**Props:**
- `itemId` (String, required) - ID of the item to like
- `isLiked` (Boolean, required) - Current like state
- `likesCount` (Number, default: 0) - Number of likes
- `size` (String, default: 'md') - Button size ('sm', 'md', 'lg')
- `showCount` (Boolean, default: true) - Show like count

**Events:**
- `@like` - Emitted when item is liked
- `@unlike` - Emitted when item is unliked

**Features:**
- Heart icon (outline when not liked, filled when liked)
- Smooth animation on like/unlike
- Loading state during API call
- Optimistic UI update
- Show like count next to icon

**Example:**
```vue
<LikeButton
  :item-id="item.id"
  :is-liked="item.isLikedByMe"
  :likes-count="item.likesCount"
  @like="handleLike"
  @unlike="handleUnlike"
/>
```

### 2. LikersList.vue (New Component)

**Location:** `src/components/social/LikersList.vue`

**Props:**
- `itemId` (String, required) - ID of the item

**Features:**
- Modal/drawer to show list of users who liked an item
- User avatars and names
- Link to user profiles (future)
- "You and 4 others" format for current user

### 3. LikedItemsGrid.vue (New Component)

**Location:** `src/components/closet/LikedItemsGrid.vue`

**Features:**
- Grid of items the user has liked
- Same layout as ClosetGrid
- Shows item owner's name
- Click to view item details
- Unlike button on hover

### 4. PopularItemsCarousel.vue (New Component)

**Location:** `src/components/social/PopularItemsCarousel.vue`

**Features:**
- Horizontal scrollable carousel
- Shows most liked items from friends
- "Trending in your circle" heading
- Click to view item details

## Updates to Existing Components

### 1. ClosetItemCard.vue
**Changes:**
- Add `<LikeButton>` to card (top-right corner)
- Show like count below item name
- Add "liked by you" badge if user liked own item

### 2. SuggestionItem.vue
**Changes:**
- Add `<LikeButton>` for each suggested item
- Show aggregate likes for the suggestion

### 3. Profile.vue
**Changes:**
- Add "Liked Items" tab
- Show count of items user has liked
- Use `<LikedItemsGrid>` component

### 4. Friends.vue
**Changes:**
- Add `<PopularItemsCarousel>` at top of page
- "See what's trending in your circle"

## Pinia Store: `likes-store.js`

**Location:** `src/stores/likes-store.js`

### State
```javascript
{
  // User's liked items (cache)
  likedItemIds: new Set(), // Set of item IDs liked by current user
  
  // Like counts cache (itemId -> count)
  likeCounts: {}, // { itemId: count }
  
  // Likers cache (itemId -> array of users)
  likers: {}, // { itemId: [{ userId, userName, avatarUrl }] }
  
  // User's liked items history
  myLikedItems: [],
  
  // Popular items
  popularItems: [],
  
  // Loading states
  loading: false,
  liking: {}, // { itemId: boolean }
  
  // Error state
  error: null
}
```

### Actions
```javascript
// Like an item
async likeItem(itemId)

// Unlike an item
async unlikeItem(itemId)

// Toggle like (smart function)
async toggleLike(itemId)

// Check if user liked an item
isLiked(itemId): boolean

// Get likes count for item
getLikesCount(itemId): number

// Fetch user's liked items
async fetchMyLikedItems(limit = 50, offset = 0)

// Fetch likers for an item
async fetchItemLikers(itemId, limit = 50)

// Fetch popular items from friends
async fetchPopularItems(limit = 20)

// Initialize likes data for current user
async initializeLikes()
```

### Getters
```javascript
// Get liked items sorted by date
sortedLikedItems: computed(() => [...])

// Get popular items
getPopularItems: computed(() => [...])

// Check if specific item is liked
isItemLiked: (itemId) => boolean
```

## Service: `likes-service.js`

**Location:** `src/services/likes-service.js`

```javascript
import { supabase } from './api'

export const likesService = {
  /**
   * Like an item
   */
  async likeItem(itemId) {
    const { data: like, error } = await supabase
      .from('likes')
      .insert({ item_id: itemId })
      .select()
      .single()
    
    if (error) {
      // Handle duplicate likes (409)
      if (error.code === '23505') {
        // Already liked, fetch existing
        const { data: existing } = await supabase
          .from('likes')
          .select()
          .eq('item_id', itemId)
          .eq('user_id', (await supabase.auth.getUser()).data.user.id)
          .single()
        return { data: existing, error: null }
      }
      throw error
    }
    
    // Get updated likes count
    const { data: item } = await supabase
      .from('clothes')
      .select('likes_count')
      .eq('id', itemId)
      .single()
    
    return { data: like, likesCount: item.likes_count }
  },

  /**
   * Unlike an item
   */
  async unlikeItem(itemId) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('item_id', itemId)
      .eq('user_id', (await supabase.auth.getUser()).data.user.id)
    
    if (error) throw error
    
    // Get updated likes count
    const { data: item } = await supabase
      .from('clothes')
      .select('likes_count')
      .eq('id', itemId)
      .single()
    
    return { likesCount: item.likes_count }
  },

  /**
   * Get user's liked items
   */
  async getUserLikedItems(userId, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .rpc('get_user_liked_items', {
        user_id_param: userId,
        limit_param: limit,
        offset_param: offset
      })
    
    if (error) throw error
    return data
  },

  /**
   * Get likers for an item
   */
  async getItemLikers(itemId, limit = 50) {
    const { data, error } = await supabase
      .rpc('get_item_likers', {
        item_id_param: itemId,
        limit_param: limit
      })
    
    if (error) throw error
    return data
  },

  /**
   * Get popular items from friends
   */
  async getPopularItemsFromFriends(limit = 20) {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .rpc('get_popular_items_from_friends', {
        user_id_param: user.id,
        limit_param: limit
      })
    
    if (error) throw error
    return data
  },

  /**
   * Initialize likes for current user
   */
  async initializeUserLikes() {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('likes')
      .select('item_id')
      .eq('user_id', user.id)
    
    if (error) throw error
    return data.map(like => like.item_id)
  }
}
```

## Offline Support

**Service Worker Updates** (`public/service-worker.js`):

Already has `syncLikes()` function stub. Complete the implementation:

```javascript
async function syncLikes() {
  console.log('[Service Worker] Syncing likes...');
  
  // Get pending likes from IndexedDB
  const pendingLikes = await getPendingLikes();
  
  for (const like of pendingLikes) {
    try {
      if (like.action === 'like') {
        await fetch('/api/likes', {
          method: 'POST',
          body: JSON.stringify({ itemId: like.itemId }),
          headers: { 'Content-Type': 'application/json' }
        });
      } else if (like.action === 'unlike') {
        await fetch(`/api/likes/${like.itemId}`, {
          method: 'DELETE'
        });
      }
      
      // Remove from pending queue
      await removePendingLike(like.id);
    } catch (error) {
      console.error('[Service Worker] Failed to sync like:', error);
    }
  }
}
```

## Privacy Considerations

**Who can like items?**
- Users can only like items from their accepted friends
- Users cannot like their own items (frontend prevention)
- Private items cannot be liked by anyone except owner

**Who can see likes?**
- Anyone can see the like count on an item
- Only friends can see who liked an item
- Users can see their own liked items list

## Testing Requirements

### Unit Tests

**likes-service.test.js:**
- Test `likeItem()` success
- Test `likeItem()` duplicate (idempotent)
- Test `unlikeItem()` success
- Test `getUserLikedItems()` pagination
- Test `getItemLikers()` returns correct users

**likes-store.test.js:**
- Test `toggleLike()` changes state
- Test `isLiked()` returns correct value
- Test optimistic updates
- Test error handling

### Integration Tests

**api-endpoints.test.js:**
- Test POST /api/likes creates like
- Test DELETE /api/likes/:itemId removes like
- Test GET /api/likes/user/:userId returns liked items
- Test privacy: cannot like private items
- Test privacy: cannot like non-friend items

### E2E Tests

**user-journeys.test.js:**
1. User browses friend's closet
2. User clicks heart icon on item
3. Like count increases
4. Heart icon fills in
5. User clicks heart again to unlike
6. Like count decreases
7. Heart icon outlines
8. User views their liked items in profile
9. User sees item they just liked/unliked

## Implementation Steps

### Phase 1: Database (Day 1 - Morning)
1. ✅ Create `sql/008_likes_feature.sql` migration
2. ✅ Run migration in Supabase SQL Editor
3. ✅ Verify tables, indexes, functions, RLS policies
4. ✅ Test helper functions with sample queries

### Phase 2: Backend Services (Day 1 - Afternoon)
1. ✅ Create `src/services/likes-service.js`
2. ✅ Implement all API methods
3. ✅ Test API methods in browser console

### Phase 3: State Management (Day 1 - Evening)
1. ✅ Create `src/stores/likes-store.js`
2. ✅ Implement state, actions, getters
3. ✅ Test store in dev tools

### Phase 4: UI Components (Day 2 - Full Day)
1. ✅ Create `LikeButton.vue` component
2. ✅ Create `LikersList.vue` modal
3. ✅ Create `LikedItemsGrid.vue` component
4. ✅ Create `PopularItemsCarousel.vue` component
5. ⏭️ Update `ClosetItemCard.vue` (skipped - component not functional yet)
6. ✅ Update `Profile.vue` with liked items tab (COMPLETED)
7. ✅ Update `Friends.vue` with popular items (COMPLETED)

### Phase 5: Testing & Polish (Day 3)
1. ⏳ Write unit tests (pending)
2. ⏳ Write integration tests (pending)
3. ⏳ Write E2E tests (pending)
4. ⏳ Test offline support (pending)
5. ✅ Add loading states and error handling (COMPLETED in components)
6. ✅ Add animations and transitions (COMPLETED in components)
7. ✅ Update documentation (API_REFERENCE.md already updated)

### Phase 6: Frontend Integration (Completed)
1. ✅ Initialize likes store in `App.vue` on user login
2. ✅ Integrated `LikedItemsGrid` into `Profile.vue` with tabs
3. ✅ Integrated `PopularItemsCarousel` into `Friends.vue`
4. ✅ Implemented pagination for liked items
5. ✅ Implemented unlike functionality
6. ✅ Added dark mode support across all integrated components
7. ✅ Created `vite.config.js` for build configuration
8. ✅ Fixed supabase import in `likes-service.js`
9. ✅ Build process verified (successful)

## Success Metrics
- Like/unlike operations complete in < 500ms
- Like button animations are smooth (60fps)
- Offline likes sync successfully when back online
- Users like at least 5 items per week on average
- 80%+ of users use the likes feature within first week

## Future Enhancements
1. **Like notifications**: Push notification when someone likes your item
2. **Top liked items**: Analytics dashboard showing most liked items
3. **Like trends**: "Your friends are loving blue this season"
4. **Double-tap to like**: Instagram-style double-tap on item images
5. **Reaction types**: Beyond likes - love, fire, cool, etc.
6. **Like collections**: Save liked items to custom collections
7. **Similar items**: "Users who liked this also liked..."

---

## 🐛 Troubleshooting Guide

### Issue: Likes Not Showing Up

**Symptoms:** Like button shows incorrect state, counts don't update

**Solutions:**
1. **Verify SQL migration ran successfully:**
   ```sql
   -- Check if likes table exists
   SELECT * FROM likes LIMIT 1;
   
   -- Verify likes count column exists
   SELECT likes_count FROM clothes LIMIT 1;
   ```

2. **Check RLS policies are enabled:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'likes';
   ```
   Should return 3 policies: view, create, delete

3. **Verify user authentication:**
   ```javascript
   console.log(authStore.user) // Should show current user object
   ```

4. **Check browser console for errors**

### Issue: Optimistic Updates Not Working

**Symptoms:** UI doesn't update immediately when clicking like button

**Solutions:**
1. **Check store initialization:**
   ```javascript
   console.log(likesStore.likedItemIds) // Should be a Set object
   console.log(likesStore.likedItemIds.size) // Should show count
   ```

2. **Verify API responses:**
   - Open DevTools → Network tab
   - Click like button
   - Check for 201/200 response
   - Verify response includes updated likes_count

3. **Check error handling:**
   - Look for console errors
   - Check if optimistic update is being rolled back
   - Verify network connectivity

4. **Ensure store is initialized on login:**
   ```javascript
   // In App.vue or auth handler
   await likesStore.initializeLikes()
   ```

### Issue: Modal Not Closing

**Symptoms:** LikersList modal doesn't close when clicking X or background

**Solutions:**
1. **Verify @close event is emitted:**
   ```vue
   <!-- In LikersList.vue -->
   <button @click="$emit('close')">✕</button>
   <div @click.self="$emit('close')">...</div>
   ```

2. **Check isOpen prop binding:**
   ```vue
   <!-- In parent component -->
   <LikersList
     :is-open="showLikersList"
     @close="showLikersList = false"
   />
   ```

3. **Ensure Teleport target exists:**
   ```html
   <!-- In index.html -->
   <div id="app"></div>
   ```

4. **Check for event.stopPropagation() blocking clicks**

### Issue: Images Not Loading

**Symptoms:** Item images show broken or don't load in liked items grid

**Solutions:**
1. **Verify image URLs are valid:**
   ```javascript
   console.log(item.image_url) // Should be full Cloudinary URL
   console.log(item.thumbnail_url) // Should exist
   ```

2. **Check CORS settings on Cloudinary:**
   - Ensure Cloudinary allows requests from your domain
   - Add domain to Cloudinary's allowed origins

3. **Add loading="lazy" for better performance:**
   ```vue
   <img :src="item.image_url" loading="lazy" />
   ```

4. **Check network tab for 403/404 errors on images**

### Issue: Like Button Animation Stuttering

**Symptoms:** Heart animation is choppy or laggy

**Solutions:**
1. **Use CSS transitions instead of JavaScript animations**
2. **Add `will-change` property:**
   ```css
   .like-button {
     will-change: transform;
   }
   ```
3. **Reduce animation complexity**
4. **Check browser performance (too many elements rendering)**

### Issue: Self-Like Prevention Not Working

**Symptoms:** User can like their own items

**Solutions:**
1. **Verify trigger exists in database:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'prevent_self_like_trigger';
   ```

2. **Check if trigger is enabled:**
   ```sql
   SELECT tgrelid::regclass, tgname, tgenabled 
   FROM pg_trigger 
   WHERE tgname = 'prevent_self_like_trigger';
   ```
   `tgenabled` should be 'O' (enabled)

3. **Re-run migration if trigger is missing**

### Issue: Popular Items Not Showing

**Symptoms:** PopularItemsCarousel shows empty state

**Solutions:**
1. **Verify you have friends:**
   ```sql
   SELECT * FROM friends 
   WHERE (requester_id = '<your_user_id>' OR receiver_id = '<your_user_id>')
   AND status = 'accepted';
   ```

2. **Check if friends have liked items:**
   ```sql
   SELECT COUNT(*) FROM likes 
   WHERE user_id IN (
     SELECT requester_id FROM friends WHERE receiver_id = '<your_user_id>' AND status = 'accepted'
     UNION
     SELECT receiver_id FROM friends WHERE requester_id = '<your_user_id>' AND status = 'accepted'
   );
   ```

3. **Verify function exists:**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'get_popular_items_from_friends';
   ```

4. **Test function directly:**
   ```sql
   SELECT * FROM get_popular_items_from_friends('<your_user_id>', 10);
   ```

### Issue: Performance Degradation

**Symptoms:** App slows down with many likes

**Solutions:**
1. **Check indexes exist:**
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'likes';
   ```
   Should see: idx_likes_user_id, idx_likes_item_id, idx_likes_user_item

2. **Verify likes_count column is being used:**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM clothes WHERE likes_count > 10;
   ```

3. **Add pagination to liked items:**
   ```javascript
   // Limit queries to 20 items at a time
   likesStore.fetchMyLikedItems(20, offset)
   ```

4. **Use virtual scrolling for large lists**

### General Debugging Tips

1. **Enable verbose logging:**
   ```javascript
   // In likes-service.js
   const DEBUG = true;
   if (DEBUG) console.log('API call:', endpoint, params);
   ```

2. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs
   - Filter by table: `likes`
   - Look for errors or slow queries

3. **Test with curl:**
   ```bash
   # Test like endpoint
   curl -X POST https://your-project.supabase.co/rest/v1/likes \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_JWT" \
     -H "Content-Type: application/json" \
     -d '{"item_id": "uuid", "user_id": "uuid"}'
   ```

4. **Clear localStorage cache:**
   ```javascript
   localStorage.clear()
   location.reload()
   ```
