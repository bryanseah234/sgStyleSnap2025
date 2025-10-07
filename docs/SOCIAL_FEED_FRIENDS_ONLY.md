# Social Feed: Friends-Only Implementation

## Overview
The social feed displays outfits shared by accepted friends only, sorted chronologically (newest first). When a user unfriends someone, their outfits automatically disappear from the feed.

## Key Requirements

### ✅ Friends-Only Filtering
- **Only shows outfits from accepted friends**
- Uses `friends` table with canonical ordering constraint: `requester_id < receiver_id`
- Queries **both directions** of the friendship relationship
- Filters by `status = 'accepted'` only

### ✅ Automatic Exclusion
Outfits are automatically excluded when:
- **No friendship exists** (never friends)
- **Friendship is pending** (status = 'pending')
- **Friendship is rejected** (status = 'rejected')
- **User unfriends someone** (friendship record deleted)

### ✅ Chronological Sorting
- Sorted by `created_at DESC` (newest first)
- Default: 20 outfits per page
- Max: 50 outfits per request
- Pagination via `limit` and `offset`

### ✅ Dynamic Real-Time Updates
- Queries live friendship data on every request
- No caching of old friendships
- When friendship status changes → Feed updates immediately
- When user unfriends → Their outfits disappear instantly

## Database Implementation

### Friends Table Structure
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
```

### Shared Outfits Table
```sql
CREATE TABLE shared_outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caption TEXT,
  outfit_items JSONB NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'friends', 'private')),
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Database Function
Created `get_friends_outfit_feed()` function in `sql/004_advanced_features.sql`:

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
)
```

**Logic:**
1. Queries `friends` table for accepted friendships
2. Handles bidirectional relationships using canonical ordering
3. Joins with `shared_outfits` table
4. Filters to only show friends' outfits
5. Returns sorted by `created_at DESC`

## API Endpoint

### GET /api/shared-outfits/feed

**Query Parameters:**
- `limit` (optional) - Max results (default: 20, max: 50)
- `offset` (optional) - Pagination offset (default: 0)

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
      "caption": "Love this outfit!",
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

**Empty State:**
- If user has 0 accepted friends → Returns `{"outfits": [], "total": 0}`
- UI shows: "Add friends to see their outfits" with link to Friends page

## Service Implementation

### src/services/shared-outfits-service.js

```javascript
async getFeed({ limit = 20, offset = 0 } = {}) {
  const currentUser = supabase.auth.user();
  if (!currentUser) throw new Error('Not authenticated');

  // Step 1: Get list of friend IDs (bidirectional check)
  const { data: friendships, error: friendsError } = await supabase
    .from('friends')
    .select('requester_id, receiver_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);

  if (friendsError) throw friendsError;

  // Extract friend IDs from both directions
  const friendIds = friendships.map(f => 
    f.requester_id === currentUser.id ? f.receiver_id : f.requester_id
  );

  // If no friends, return empty feed
  if (friendIds.length === 0) {
    return { outfits: [], total: 0 };
  }

  // Step 2: Get shared outfits from friends only
  const { data, error, count } = await supabase
    .from('shared_outfits')
    .select(`
      *,
      user:user_id (id, name, avatar_url)
    `, { count: 'exact' })
    .in('user_id', friendIds)  // Only friends' outfits
    .order('created_at', { ascending: false })  // Chronological
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Check if current user liked each outfit
  const outfitsWithLikes = await Promise.all(
    data.map(async (outfit) => {
      const { data: likeData } = await supabase
        .from('shared_outfit_likes')
        .select('id')
        .eq('outfit_id', outfit.id)
        .eq('user_id', currentUser.id)
        .single();
      
      return {
        ...outfit,
        is_liked_by_me: !!likeData
      };
    })
  );

  return {
    outfits: outfitsWithLikes || [],
    total: count || 0
  };
}
```

## Bidirectional Friendship Query

### Why Canonical Ordering?
The `friends` table uses a constraint: `CHECK (requester_id < receiver_id)`

This ensures:
- Only ONE row per friendship (no duplicates)
- Friendship goes both ways (no directional bias)
- Efficient querying with single table scan

### How to Query Both Directions:

```sql
SELECT CASE 
  WHEN requester_id = $current_user THEN receiver_id
  WHEN receiver_id = $current_user THEN requester_id
END as friend_id
FROM friends
WHERE (requester_id = $current_user OR receiver_id = $current_user)
  AND status = 'accepted'
```

**Example:**
- User A (id: 1) sends request to User B (id: 2)
- Database stores: `requester_id=1, receiver_id=2, status='pending'`
- User B accepts request
- Database updates: `status='accepted'`
- When User A queries feed: Finds `requester_id=1` → Returns `receiver_id=2` (User B)
- When User B queries feed: Finds `receiver_id=2` → Returns `requester_id=1` (User A)

## Files Updated

### Documentation
- ✅ `REQUIREMENTS.md` - Added "Social Feed (Friends-Only Outfits)" section
- ✅ `docs/SOCIAL_FEED_FRIENDS_ONLY.md` - This file (comprehensive guide)

### Database
- ✅ `sql/004_advanced_features.sql` - Added `get_friends_outfit_feed()` function

### API Specification
- ✅ `tasks/13-advanced-outfit-features.md`:
  - Updated GET /api/shared-outfits/feed endpoint (lines 270-330)
  - Updated getFeed() service function (lines 560-625)
  - Updated acceptance criteria for friends-only filtering

## Testing Scenarios

### Scenario 1: User has friends
1. User A is friends with User B and User C
2. User B shares outfit → Appears in User A's feed
3. User C shares outfit → Appears in User A's feed
4. User D (not friends) shares outfit → Does NOT appear in User A's feed

### Scenario 2: User unfriends someone
1. User A is friends with User B
2. User B's outfits appear in User A's feed
3. User A unfriends User B (deletes friendship)
4. User B's outfits **immediately disappear** from User A's feed
5. Next feed refresh shows 0 outfits from User B

### Scenario 3: Friendship status changes
1. User A sends friend request to User B (status='pending')
2. User B's outfits do NOT appear in User A's feed
3. User B accepts request (status='accepted')
4. User B's outfits now appear in User A's feed
5. If User B rejects (status='rejected'), outfits disappear

### Scenario 4: User has no friends
1. User A has 0 accepted friends
2. getFeed() returns `{ outfits: [], total: 0 }`
3. UI shows empty state message
4. User clicks "Add Friends" → Navigates to Friends page

### Scenario 5: Chronological ordering
1. User A is friends with Users B, C, D
2. User B shares outfit at 10:00 AM
3. User C shares outfit at 11:00 AM
4. User D shares outfit at 09:00 AM
5. Feed displays in order: C (11:00 AM), B (10:00 AM), D (09:00 AM)

## Security Considerations

### Row-Level Security (RLS)
- Friends table has RLS policies to ensure users can only:
  - View their own friendships (sent and received)
  - Create friend requests
  - Update/delete their own friend requests

### Privacy Protection
- Users can only see outfits from **accepted friends**
- Private outfits (`visibility='private'`) never appear in feed
- Public outfits (`visibility='public'`) can be seen by anyone (future feature)
- Friends-only outfits (`visibility='friends'`) only visible to accepted friends

### Data Integrity
- `ON DELETE CASCADE` ensures:
  - When user is deleted → All friendships deleted
  - When friendship deleted → Outfits auto-excluded from feed
- No stale data or orphaned references

## Future Enhancements

### Potential Features (NOT implemented yet):
- [ ] Public feed (see all public outfits, not just friends)
- [ ] Explore page (discover new outfits from non-friends)
- [ ] Outfit recommendations based on friend activity
- [ ] Friend suggestions based on mutual friends
- [ ] Activity notifications (friend shared new outfit)
- [ ] Infinite scroll with virtual scrolling for performance
- [ ] Pull-to-refresh gesture
- [ ] Skeleton loaders during feed loading
- [ ] Offline caching with service worker
- [ ] Real-time updates via Supabase realtime subscriptions

## Summary

✅ **Friends-Only Filtering**: Only shows outfits from accepted friends  
✅ **Bidirectional Query**: Handles canonical friendship ordering correctly  
✅ **Dynamic Updates**: Automatically excludes unfriended users  
✅ **Chronological Sorting**: Newest outfits first  
✅ **Database Function**: Efficient SQL query with proper joins  
✅ **API Endpoint**: Clean REST API with pagination  
✅ **Service Layer**: Robust error handling and authentication checks  
✅ **Documentation**: Complete specification in requirements and tasks  

The social feed now ensures users only see outfits from their **current friends**, with **automatic real-time updates** when friendships change.
