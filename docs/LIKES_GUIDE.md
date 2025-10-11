# ❤️ Likes Feature Guide

## Overview

Users can like closet items and shared outfits from their friends. Likes create real-time notifications and update denormalized counts.

---

## Features

- Like/unlike closet items
- Like/unlike shared outfits
- Real-time notifications
- Denormalized like counts
- View likers list
- Popular items carousel
- Friend-only liking
- Cannot like own items

---

## Database Schema

### likes Table (Item Likes)

```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, user_id)
);

CREATE INDEX idx_likes_item ON likes(item_id);
CREATE INDEX idx_likes_user ON likes(user_id);
```

### shared_outfit_likes Table

```sql
CREATE TABLE shared_outfit_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id UUID NOT NULL REFERENCES shared_outfits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outfit_id, user_id)
);
```

---

## API Service

### File: `src/services/likes-service.js`

#### Functions

##### `likeItem(itemId)`

Like a closet item.

```javascript
import { likesService } from '@/services/likes-service'

const { like, likesCount } = await likesService.likeItem('item-uuid')
// Creates notification for item owner
// Updates denormalized likes_count on item
```

---

##### `unlikeItem(itemId)`

Unlike a closet item.

```javascript
await likesService.unlikeItem('item-uuid')
// Deletes like record
// Updates denormalized likes_count on item
```

---

##### `toggleItemLike(itemId)`

Toggle like status (like if not liked, unlike if liked).

```javascript
const { liked, likesCount } = await likesService.toggleItemLike('item-uuid')
// Returns: { liked: true/false, likesCount: number }
```

---

##### `hasUserLikedItem(itemId)`

Check if current user has liked an item.

```javascript
const isLiked = await likesService.hasUserLikedItem('item-uuid')
// Returns: true or false
```

---

##### `getItemLikers(itemId)`

Get list of users who liked an item.

```javascript
const likers = await likesService.getItemLikers('item-uuid')
```

**Response**:
```json
[
  {
    "user_id": "uuid",
    "username": "johndoe",
    "name": "John Doe",
    "avatar_url": "https://...",
    "created_at": "2025-10-08T12:00:00Z"
  }
]
```

---

##### `getUserLikedItems(userId)`

Get items liked by a user.

```javascript
const likedItems = await likesService.getUserLikedItems('user-uuid')
```

**Response**: Array of clothing items with full details.

---

##### `getPopularItems(options)`

Get popular items from friends (most liked).

```javascript
const popular = await likesService.getPopularItems({
  limit: 10,
  minLikes: 3
})
```

**Use Case**: "Trending in your circle" carousel on social feed.

---

## UI Components

### ItemLikeButton.vue

**Props**:
```javascript
{
  itemId: String,        // Item UUID
  isLiked: Boolean,      // Current like status
  likesCount: Number     // Total likes
}
```

**Events**:
```javascript
@toggle-like="handleToggle"
```

**Example**:
```vue
<ItemLikeButton
  :item-id="item.id"
  :is-liked="item.is_liked"
  :likes-count="item.likes_count"
  @toggle-like="handleLike"
/>
```

---

### LikersList.vue

**Props**:
```javascript
{
  itemId: String,        // Item UUID
  visible: Boolean       // Modal visibility
}
```

**Features**:
- Shows list of users who liked item
- Avatar, name, username
- "You" badge for current user
- Empty state for no likes

---

### PopularItemsCarousel.vue

**Props**:
```javascript
{
  items: Array,          // Popular items
  loading: Boolean
}
```

**Features**:
- Horizontal scrollable carousel
- Shows most-liked items from friends
- Like count badge
- Click to view item detail

---

## Business Rules

### Friend-Only Liking

Users can only like items from friends:

```sql
CREATE POLICY "Users can only like friends' items"
  ON likes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clothes
      JOIN friends ON (
        (friends.requester_id = auth.uid() AND friends.receiver_id = clothes.owner_id)
        OR (friends.receiver_id = auth.uid() AND friends.requester_id = clothes.owner_id)
      )
      WHERE clothes.id = item_id
        AND friends.status = 'accepted'
    )
  );
```

---

### Cannot Like Own Items

```sql
CREATE POLICY "Users cannot like their own items"
  ON likes FOR INSERT
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM clothes
      WHERE id = item_id AND owner_id = auth.uid()
    )
  );
```

---

### Privacy Respect

Only items with `privacy = 'friends'` can be liked by friends. Private items are excluded from friend views.

---

## Denormalized Counts

### Why Denormalize?

For performance - avoid counting likes on every query.

### Triggers

```sql
-- Increment count on like
CREATE TRIGGER increment_likes_count
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION update_likes_count();

-- Decrement count on unlike
CREATE TRIGGER decrement_likes_count
AFTER DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION update_likes_count();
```

### Update Function

```sql
CREATE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clothes
    SET likes_count = likes_count + 1
    WHERE id = NEW.item_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE clothes
    SET likes_count = likes_count - 1
    WHERE id = OLD.item_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

---

## Notifications

### Automatic Notification Creation

When a user likes an item, a notification is automatically created:

```sql
-- Trigger on likes table
CREATE TRIGGER create_like_notification
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION create_notification_for_like();
```

### Notification Details

```json
{
  "type": "item_like",
  "recipient_id": "item-owner-uuid",
  "actor_id": "liker-uuid",
  "reference_id": "item-uuid",
  "message": "John Doe liked your Blue T-Shirt"
}
```

See [NOTIFICATIONS_GUIDE.md](./NOTIFICATIONS_GUIDE.md) for details.

---

## Analytics

### Most Liked Items

```sql
SELECT 
  id,
  name,
  likes_count,
  category
FROM clothes
WHERE likes_count > 0
  AND owner_id = auth.uid()
ORDER BY likes_count DESC
LIMIT 10;
```

### Like Activity

```sql
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as likes_received
FROM likes
WHERE item_id IN (
  SELECT id FROM clothes WHERE owner_id = auth.uid()
)
GROUP BY date
ORDER BY date DESC;
```

---

## Testing

### Unit Tests

See `tests/unit/likes-service.test.js`:
- Like item
- Unlike item
- Toggle like
- Check if liked
- Get likers
- Popular items

### Integration Tests

See `tests/integration/likes-flow.test.js`:
- Like creates notification
- Denormalized count updates
- Friend-only validation
- Cannot like own items

---

## Performance

### Indexes

```sql
CREATE INDEX idx_likes_item ON likes(item_id);
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_likes_created ON likes(created_at DESC);
CREATE INDEX idx_clothes_likes_count ON clothes(likes_count DESC) WHERE likes_count > 0;
```

### Caching

Denormalized counts reduce query complexity:
- No need to `COUNT(*)` on every item fetch
- Counts stored directly on `clothes.likes_count`
- Updated via triggers (real-time)

---

## Related Documentation

- **API Guide**: [../API_GUIDE.md](../API_GUIDE.md#likes-api) - Likes API endpoints
- **Database**: [../DATABASE_GUIDE.md](../DATABASE_GUIDE.md) - Schema details
- **Notifications**: [NOTIFICATIONS_GUIDE.md](./NOTIFICATIONS_GUIDE.md) - Notification system
- **Social**: [SOCIAL_GUIDE.md](./SOCIAL_GUIDE.md) - Friend interactions
- **Tasks**: [../tasks/12-likes-feature.md](../tasks/12-likes-feature.md)

---

## Status

✅ **Production Ready**

**Last Updated**: October 8, 2025
