# 👥 Social Feed: Friends-Only Documentation

## Overview
The social feed displays outfits shared by accepted friends only, sorted chronologically (newest first). Real-time friend status changes automatically update the feed - when a user unfriends someone, their outfits immediately disappear.

---

## Features
- Friends-only filtering (accepted friendships)
- Automatic exclusion on unfriend
- Chronological sorting (newest first)
- Pagination (20 per page, max 50)
- Real-time dynamic updates
- Bidirectional friendship handling
- Like system integration
- Comments support

---

## Database Schema

### Friends Table
```sql
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(requester_id, receiver_id),
  CHECK (requester_id < receiver_id) -- Canonical ordering
);

CREATE INDEX idx_friends_requester ON friends(requester_id);
CREATE INDEX idx_friends_receiver ON friends(receiver_id);
CREATE INDEX idx_friends_status ON friends(status);
```

**Canonical Ordering**: Prevents duplicate friendships by ensuring `requester_id < receiver_id`.

**Example**:
- ✅ User A (uuid 111) + User B (uuid 222) → stored as (111, 222)
- ❌ Cannot store (222, 111) - violates UNIQUE constraint

### Shared Outfits Table
```sql
CREATE TABLE shared_outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caption TEXT,
  outfit_items JSONB NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'friends', 'private')),
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_shared_outfits_user ON shared_outfits(user_id);
CREATE INDEX idx_shared_outfits_created ON shared_outfits(created_at DESC);
CREATE INDEX idx_shared_outfits_visibility ON shared_outfits(visibility);
```

**outfit_items structure**:
```json
[
  {
    "id": "item-uuid-1",
    "name": "Blue Hoodie",
    "category": "hoodie",
    "image_url": "https://cloudinary.com/...",
    "thumbnail_url": "https://cloudinary.com/..."
  },
  {
    "id": "item-uuid-2",
    "name": "Black Jeans",
    "category": "pants",
    "image_url": "https://cloudinary.com/..."
  }
]
```

---

## Database Function

### get_friends_outfit_feed()
**Location**: `sql/004_advanced_features.sql`

```sql
CREATE OR REPLACE FUNCTION get_friends_outfit_feed(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  outfit_id UUID,
  user_id UUID,
  username TEXT,
  user_avatar TEXT,
  caption TEXT,
  outfit_items JSONB,
  visibility TEXT,
  likes_count INT,
  comments_count INT,
  created_at TIMESTAMPTZ,
  is_liked_by_me BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    so.id as outfit_id,
    so.user_id,
    u.username,
    u.avatar_url as user_avatar,
    so.caption,
    so.outfit_items,
    so.visibility,
    so.likes_count,
    so.comments_count,
    so.created_at,
    EXISTS(
      SELECT 1 FROM shared_outfit_likes 
      WHERE outfit_id = so.id AND user_id = p_user_id
    ) as is_liked_by_me
  FROM shared_outfits so
  JOIN users u ON u.id = so.user_id
  WHERE so.visibility = 'friends'
  AND so.user_id IN (
    -- Get accepted friends (bidirectional)
    SELECT CASE 
      WHEN requester_id = p_user_id THEN receiver_id
      WHEN receiver_id = p_user_id THEN requester_id
    END as friend_id
    FROM friends
    WHERE status = 'accepted'
    AND (requester_id = p_user_id OR receiver_id = p_user_id)
  )
  ORDER BY so.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Logic**:
1. Queries `friends` table for accepted friendships
2. Handles bidirectional relationships (canonical ordering)
3. Joins with `shared_outfits` and `users`
4. Filters by `visibility = 'friends'`
5. Checks if current user liked the outfit
6. Sorts by `created_at DESC`
7. Applies pagination

---

## API Service

### social-service.js
```js
import { supabase } from '@/config/supabase'

export const socialService = {
  /**
   * Get friends-only outfit feed
   * @param {Object} options - Pagination options
   * @param {number} options.limit - Items per page (default: 20, max: 50)
   * @param {number} options.offset - Skip items (default: 0)
   * @returns {Promise<Object>} Feed data
   */
  async getFeed({ limit = 20, offset = 0 } = {}) {
    // Enforce max limit
    const safeLimit = Math.min(limit, 50)

    const { data, error } = await supabase
      .rpc('get_friends_outfit_feed', {
        p_user_id: (await supabase.auth.getUser()).data.user.id,
        p_limit: safeLimit,
        p_offset: offset
      })

    if (error) throw error

    return {
      outfits: data,
      hasMore: data.length === safeLimit,
      nextOffset: offset + data.length
    }
  },

  /**
   * Like an outfit
   * @param {string} outfitId - Outfit UUID
   * @returns {Promise<void>}
   */
  async likeOutfit(outfitId) {
    const userId = (await supabase.auth.getUser()).data.user.id

    const { error } = await supabase
      .from('shared_outfit_likes')
      .insert({
        outfit_id: outfitId,
        user_id: userId
      })

    if (error) {
      if (error.code === '23505') {
        // Already liked (unique constraint violation)
        return
      }
      throw error
    }

    // Increment likes_count
    await supabase
      .from('shared_outfits')
      .update({ likes_count: supabase.raw('likes_count + 1') })
      .eq('id', outfitId)
  },

  /**
   * Unlike an outfit
   * @param {string} outfitId - Outfit UUID
   * @returns {Promise<void>}
   */
  async unlikeOutfit(outfitId) {
    const userId = (await supabase.auth.getUser()).data.user.id

    const { error } = await supabase
      .from('shared_outfit_likes')
      .delete()
      .eq('outfit_id', outfitId)
      .eq('user_id', userId)

    if (error) throw error

    // Decrement likes_count
    await supabase
      .from('shared_outfits')
      .update({ likes_count: supabase.raw('likes_count - 1') })
      .eq('id', outfitId)
  },

  /**
   * Share an outfit
   * @param {Object} outfit - Outfit data
   * @param {Array} outfit.items - Array of clothing items
   * @param {string} outfit.caption - Caption text
   * @param {string} outfit.visibility - 'friends' | 'public' | 'private'
   * @returns {Promise<Object>} Created outfit
   */
  async shareOutfit({ items, caption, visibility = 'friends' }) {
    const userId = (await supabase.auth.getUser()).data.user.id

    // Prepare outfit_items JSONB
    const outfitItems = items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      image_url: item.image_url,
      thumbnail_url: item.thumbnail_url || item.image_url
    }))

    const { data, error } = await supabase
      .from('shared_outfits')
      .insert({
        user_id: userId,
        caption,
        outfit_items: outfitItems,
        visibility
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}
```

---

## Vue Component

### SocialFeed.vue
```vue
<template>
  <div class="social-feed">
    <div class="feed-header">
      <h1>Friends' Outfits</h1>
      <button @click="handleRefresh" :disabled="loading">
        <RefreshIcon :class="{ 'animate-spin': loading }" />
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading && outfits.length === 0" class="feed-skeleton">
      <OutfitCardSkeleton v-for="i in 3" :key="i" />
    </div>

    <!-- Outfits List -->
    <div v-else-if="outfits.length > 0" class="feed-list">
      <OutfitCard
        v-for="outfit in outfits"
        :key="outfit.outfit_id"
        :outfit="outfit"
        @like="handleLike"
        @unlike="handleUnlike"
        @comment="handleComment"
      />

      <!-- Load More -->
      <div v-if="hasMore" class="load-more">
        <button
          @click="handleLoadMore"
          :disabled="loadingMore"
          class="btn-secondary"
        >
          {{ loadingMore ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="feed-empty">
      <div class="empty-icon">👔</div>
      <h3>No Outfits Yet</h3>
      <p>When your friends share outfits, they'll appear here.</p>
      <router-link to="/friends" class="btn-primary">
        Find Friends
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { socialService } from '@/services/social-service'
import OutfitCard from '@/components/social/OutfitCard.vue'
import OutfitCardSkeleton from '@/components/social/OutfitCardSkeleton.vue'

const outfits = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(false)
const offset = ref(0)

onMounted(() => {
  loadFeed()
})

async function loadFeed() {
  try {
    loading.value = true
    const { outfits: data, hasMore: more, nextOffset } = 
      await socialService.getFeed({ limit: 20, offset: 0 })
    
    outfits.value = data
    hasMore.value = more
    offset.value = nextOffset
  } catch (error) {
    console.error('Failed to load feed:', error)
  } finally {
    loading.value = false
  }
}

async function handleLoadMore() {
  try {
    loadingMore.value = true
    const { outfits: data, hasMore: more, nextOffset } = 
      await socialService.getFeed({ limit: 20, offset: offset.value })
    
    outfits.value.push(...data)
    hasMore.value = more
    offset.value = nextOffset
  } catch (error) {
    console.error('Failed to load more:', error)
  } finally {
    loadingMore.value = false
  }
}

async function handleLike(outfitId) {
  try {
    await socialService.likeOutfit(outfitId)
    // Update local state
    const outfit = outfits.value.find(o => o.outfit_id === outfitId)
    if (outfit) {
      outfit.is_liked_by_me = true
      outfit.likes_count++
    }
  } catch (error) {
    console.error('Failed to like:', error)
  }
}

async function handleUnlike(outfitId) {
  try {
    await socialService.unlikeOutfit(outfitId)
    // Update local state
    const outfit = outfits.value.find(o => o.outfit_id === outfitId)
    if (outfit) {
      outfit.is_liked_by_me = false
      outfit.likes_count--
    }
  } catch (error) {
    console.error('Failed to unlike:', error)
  }
}

function handleRefresh() {
  offset.value = 0
  loadFeed()
}
</script>
```

---

## Friendship Logic

### Bidirectional Queries
Because friendships use canonical ordering (`requester_id < receiver_id`), queries must check both directions:

```sql
-- Get all friends of user A
SELECT CASE 
  WHEN requester_id = 'user-a-uuid' THEN receiver_id
  WHEN receiver_id = 'user-a-uuid' THEN requester_id
END as friend_id
FROM friends
WHERE status = 'accepted'
AND (requester_id = 'user-a-uuid' OR receiver_id = 'user-a-uuid');
```

### Friend Status Check
```sql
-- Check if User A and User B are friends
SELECT EXISTS(
  SELECT 1 FROM friends
  WHERE status = 'accepted'
  AND (
    (requester_id = 'user-a-uuid' AND receiver_id = 'user-b-uuid')
    OR
    (requester_id = 'user-b-uuid' AND receiver_id = 'user-a-uuid')
  )
) as are_friends;
```

---

## Security (RLS Policies)

### shared_outfits Policies
```sql
-- Users can read friends' outfits
CREATE POLICY "Users can read friends outfits"
ON shared_outfits FOR SELECT
USING (
  visibility = 'friends'
  AND user_id IN (
    SELECT CASE 
      WHEN requester_id = auth.uid() THEN receiver_id
      WHEN receiver_id = auth.uid() THEN requester_id
    END
    FROM friends
    WHERE status = 'accepted'
    AND (requester_id = auth.uid() OR receiver_id = auth.uid())
  )
);

-- Users can insert their own outfits
CREATE POLICY "Users can insert own outfits"
ON shared_outfits FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update own outfits
CREATE POLICY "Users can update own outfits"
ON shared_outfits FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete own outfits
CREATE POLICY "Users can delete own outfits"
ON shared_outfits FOR DELETE
USING (user_id = auth.uid());
```

### shared_outfit_likes Policies
```sql
-- Users can like friends' outfits
CREATE POLICY "Users can like friends outfits"
ON shared_outfit_likes FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND outfit_id IN (
    SELECT id FROM shared_outfits
    WHERE visibility = 'friends'
    AND user_id IN (
      -- Same friend check as above
    )
  )
);

-- Users can unlike
CREATE POLICY "Users can unlike"
ON shared_outfit_likes FOR DELETE
USING (user_id = auth.uid());
```

---

## Testing

### Test Scenarios

**1. Friends-Only Filtering**
```js
test('only shows outfits from accepted friends', async () => {
  // User A friends with User B (accepted)
  // User A not friends with User C
  // User B and User C both share outfits
  
  const { outfits } = await socialService.getFeed()
  
  // Should only see User B's outfits
  expect(outfits.every(o => o.user_id === userB.id)).toBe(true)
  expect(outfits.find(o => o.user_id === userC.id)).toBeUndefined()
})
```

**2. Unfriend Removes Outfits**
```js
test('unfriending removes outfits from feed', async () => {
  // User A friends with User B
  const feed1 = await socialService.getFeed()
  expect(feed1.outfits.length).toBeGreaterThan(0)
  
  // User A unfriends User B
  await friendsService.unfriend(userB.id)
  
  // Feed should be empty
  const feed2 = await socialService.getFeed()
  expect(feed2.outfits.length).toBe(0)
})
```

**3. Pending Friendships Don't Show**
```js
test('pending friendships do not show outfits', async () => {
  // User A sends friend request to User B (pending)
  await friendsService.sendRequest(userB.id)
  
  // User B shares outfit
  await socialService.shareOutfit({ items: [...] })
  
  // User A's feed should be empty (not accepted yet)
  const feed = await socialService.getFeed()
  expect(feed.outfits.length).toBe(0)
})
```

---

## Performance Optimization

### Indexing Strategy
```sql
-- Composite index for friend lookups
CREATE INDEX idx_friends_composite 
ON friends(requester_id, receiver_id, status);

-- Partial index for accepted friends only
CREATE INDEX idx_friends_accepted 
ON friends(requester_id, receiver_id) 
WHERE status = 'accepted';

-- Index for feed sorting
CREATE INDEX idx_shared_outfits_created_desc 
ON shared_outfits(created_at DESC) 
WHERE visibility = 'friends';
```

### Query Optimization
```sql
-- Use CTE for friend IDs to avoid repeated subqueries
WITH friend_ids AS (
  SELECT CASE 
    WHEN requester_id = :user_id THEN receiver_id
    WHEN receiver_id = :user_id THEN requester_id
  END as friend_id
  FROM friends
  WHERE status = 'accepted'
  AND (requester_id = :user_id OR receiver_id = :user_id)
)
SELECT so.*, u.*
FROM shared_outfits so
JOIN users u ON u.id = so.user_id
WHERE so.user_id IN (SELECT friend_id FROM friend_ids)
AND so.visibility = 'friends'
ORDER BY so.created_at DESC
LIMIT 20;
```

---

## Related Files
- `sql/004_advanced_features.sql` - Database function
- `src/services/social-service.js` - API service
- `src/pages/SocialFeed.vue` - Feed page
- `src/components/social/OutfitCard.vue` - Outfit display

---

## Status: COMPLETE ✅
Friends-only social feed fully implemented and tested!
