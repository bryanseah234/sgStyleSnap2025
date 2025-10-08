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


See full details in the original implementation files and database schemas.
