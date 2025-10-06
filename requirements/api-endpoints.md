# API Endpoints Requirements

## 1. Authentication Headers

All endpoints (except auth) require an `Authorization` header:

```javascript
headers: {
  'Authorization': 'Bearer <jwt_token>',
  'Content-Type': 'application/json'
}
```

---

## 2. Clothes Management Endpoints

### 2.1 `POST /clothes`

Create a new clothing item.

**Request:**

```json
{
  "name": "string",           // Required, max 255 chars
  "category": "string",       // Required: top/bottom/outerwear/shoes/accessory
  "image_url": "string",      // Required (from Cloudinary)
  "style_tags": ["string"],   // Optional
  "privacy": "string",        // Required: private/friends, default: friends
  "size": "string",           // Optional
  "brand": "string"           // Optional
}
```

**Responses:**

- `200 OK` - Item created successfully
- `403 Forbidden` - Quota exceeded (200 items max)
- `400 Bad Request` - Validation errors

**Business Logic:**

- **CRITICAL: Quota Enforcement**
  - Check user's current item count (where `removed_at` IS NULL)
  - If count >= 200, return `403` with quota error
  - Use database function `check_item_quota(user_id)` for accuracy
- **Validate `image_url`:**
  - Must be from Cloudinary domain (e.g., `res.cloudinary.com`)
  - Must be HTTPS
  - Verify image exists and hasn't been deleted
- Create item with `owner_id` from JWT
- Auto-generate `thumbnail_url` using Cloudinary transformation

**Quota Enforcement Middleware:**

```javascript
// middleware/quotaCheck.js
import { supabase } from '../config/supabase.js';

export async function checkQuotaMiddleware(req, res, next) {
  const userId = req.user.id;
  
  try {
    // Use database function for accurate count
    const { data, error } = await supabase
      .rpc('check_item_quota', { user_id: userId });
    
    if (error) throw error;
    
    const currentCount = data;
    const limit = 200;
    
    // Set quota headers for client awareness
    res.setHeader('X-Quota-Used', currentCount);
    res.setHeader('X-Quota-Limit', limit);
    res.setHeader('X-Quota-Remaining', Math.max(0, limit - currentCount));
    
    if (currentCount >= limit) {
      return res.status(403).json({
        error: "You've reached your 200 item limit. Please remove some items to add new ones.",
        code: 'QUOTA_EXCEEDED',
        details: {
          current: currentCount,
          limit: limit,
          remaining: 0
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Attach quota info to request for logging
    req.quota = { current: currentCount, limit, remaining: limit - currentCount };
    next();
    
  } catch (error) {
    console.error('Quota check failed:', error);
    // Fail open - allow request if quota check fails
    // Log error for monitoring
    next();
  }
}

// Apply to POST /clothes route
app.post('/api/clothes', 
  authenticate,
  checkQuotaMiddleware,
  rateLimitMiddleware,
  handleCreateClothes
);
```

**Client-Side Quota Warning:**

```javascript
// Show warning at 180 items (90% capacity)
if (quota.used >= 180) {
  showQuotaWarning({
    message: `You're approaching your item limit (${quota.used}/200)`,
    severity: 'warning',
    action: 'Manage Items'
  });
}

// Block UI at 200 items
if (quota.used >= 200) {
  disableUploadButton();
  showQuotaError({
    message: "You've reached your 200 item limit",
    severity: 'error',
    action: 'Remove Items'
  });
}
```

---

### 2.2 `GET /closet`

Get user's clothing items with pagination.

**Query Parameters:**

- `category` (optional) - Comma-separated categories
- `limit` (optional) - Items per page, default: 20, max: 100
- `offset` (optional) - Number of items to skip, default: 0
- `sort` (optional) - Sort order: `newest` (default), `oldest`, `name`

**Response:**

```json
{
  "items": [ClothingItem],
  "count": 42,
  "total": 150,
  "quota": {
    "used": 150,
    "limit": 200
  },
  "pagination": {
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

**Business Logic:**

- Default to 20 items per page for performance
- Exclude soft-deleted items (`removed_at IS NULL`)
- Order by `created_at DESC` for newest first

---

### 2.3 `PUT /clothes/:id`

Update a clothing item (metadata only).

**Request:**

```json
{
  "name": "string",
  "category": "string",
  "style_tags": ["string"],
  "privacy": "string",
  "size": "string",
  "brand": "string"
}
```

**Business Logic:**

- Verify `owner_id` matches authenticated user
- Update only provided fields
- **NOTE:** `image_url` cannot be changed via this endpoint
- To change image, delete item and create new one
- Old images remain in Cloudinary (manual cleanup may be needed)

---

### 2.4 `POST /clothes/:id/remove`

Soft delete a clothing item.

**Response:**

```json
{
  "message": "Item moved to trash",
  "recoverable_until": "2025-11-04T12:00:00Z"
}
```

**Business Logic:**

- Set `removed_at = NOW()`
- Keep in database for 30-day recovery period
- Return recovery deadline timestamp
- Item excluded from quota count

---

### 2.5 `POST /clothes/:id/restore`

Restore a soft-deleted clothing item.

**Response:**

```json
{
  "message": "Item restored successfully",
  "item": ClothingItem
}
```

**Responses:**

- `200 OK` - Item restored successfully
- `404 Not Found` - Item not found or recovery period expired (30+ days)
- `403 Forbidden` - Quota would be exceeded after restore

**Business Logic:**

- Verify `owner_id` matches authenticated user
- Check if `removed_at` is within 30 days
- Check if restoring would exceed quota (200 items)
- Set `removed_at = NULL`
- Item counts toward quota again

---

### 2.6 `GET /clothes/trash`

Get user's soft-deleted items (recoverable).

**Response:**

```json
{
  "items": [ClothingItem],
  "count": 5
}
```

**Business Logic:**

- Only return items where `removed_at IS NOT NULL`
- Only return items within 30-day recovery window
- Exclude items older than 30 days

---

### 2.7 `GET /quota`

Get user's quota usage and statistics.

**Response:**

```json
{
  "quota": {
    "used": 150,
    "limit": 200,
    "remaining": 50,
    "percentage": 75.0
  },
  "breakdown": {
    "active_items": 150,
    "trash_items": 8,
    "trash_recoverable": 5
  },
  "warnings": [
    {
      "type": "approaching_limit",
      "message": "You're at 75% capacity. Consider removing unused items.",
      "threshold": 180
    }
  ],
  "storage": {
    "estimated_mb": 234.5,
    "cloudinary_credits_used": 1523
  }
}
```

**Business Logic:**

- Calculate active items: `COUNT(*) WHERE removed_at IS NULL`
- Calculate trash items: `COUNT(*) WHERE removed_at IS NOT NULL`
- Calculate recoverable: `COUNT(*) WHERE removed_at > NOW() - INTERVAL '30 days'`
- Add warnings at:
  - 90% (180 items): "Approaching limit"
  - 95% (190 items): "Nearly full - remove items soon"
  - 100% (200 items): "Limit reached - remove items to add new ones"
- Estimate storage from Cloudinary metadata (if available)

**Implementation:**

```javascript
// routes/quota.js
app.get('/api/quota', authenticate, async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Get active item count
    const { data: activeData } = await supabase
      .from('clothes')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .is('removed_at', null);
    
    const activeCount = activeData?.length || 0;
    
    // Get trash item counts
    const { data: trashData } = await supabase
      .from('clothes')
      .select('id, removed_at')
      .eq('owner_id', userId)
      .not('removed_at', 'is', null);
    
    const trashCount = trashData?.length || 0;
    const recoverable = trashData?.filter(item => {
      const removedDate = new Date(item.removed_at);
      const daysSinceRemoval = (Date.now() - removedDate) / (1000 * 60 * 60 * 24);
      return daysSinceRemoval <= 30;
    }).length || 0;
    
    const limit = 200;
    const remaining = Math.max(0, limit - activeCount);
    const percentage = (activeCount / limit) * 100;
    
    // Generate warnings
    const warnings = [];
    if (activeCount >= 190) {
      warnings.push({
        type: 'nearly_full',
        message: 'Nearly full - remove items soon to add new ones',
        threshold: 190
      });
    } else if (activeCount >= 180) {
      warnings.push({
        type: 'approaching_limit',
        message: `You're at ${Math.round(percentage)}% capacity. Consider removing unused items.`,
        threshold: 180
      });
    }
    
    res.json({
      quota: {
        used: activeCount,
        limit,
        remaining,
        percentage: Math.round(percentage * 10) / 10
      },
      breakdown: {
        active_items: activeCount,
        trash_items: trashCount,
        trash_recoverable: recoverable
      },
      warnings
    });
    
  } catch (error) {
    console.error('Failed to get quota info:', error);
    res.status(500).json({
      error: 'Failed to retrieve quota information',
      code: 'QUOTA_CHECK_FAILED'
    });
  }
});
```

**Quota Dashboard Component:**

```vue
<!-- components/QuotaIndicator.vue -->
<template>
  <div class="quota-dashboard">
    <div class="quota-header">
      <h3>Storage Quota</h3>
      <span class="quota-badge" :class="quotaStatus">
        {{ quota.used }}/{{ quota.limit }}
      </span>
    </div>
    
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: `${quota.percentage}%` }"
        :class="quotaStatus"
      />
    </div>
    
    <div v-if="warnings.length" class="warnings">
      <div v-for="warning in warnings" :key="warning.type" class="warning">
        ⚠️ {{ warning.message }}
      </div>
    </div>
    
    <div class="breakdown">
      <div>Active: {{ breakdown.active_items }}</div>
      <div>Trash: {{ breakdown.trash_items }} ({{ breakdown.trash_recoverable }} recoverable)</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  quota: Object,
  breakdown: Object,
  warnings: Array
});

const quotaStatus = computed(() => {
  if (props.quota.percentage >= 100) return 'full';
  if (props.quota.percentage >= 90) return 'warning';
  return 'ok';
});
</script>
```

---

## 3. Social Endpoints

### 3.1 `GET /friends/:id/cabinet`

Get a friend's viewable closet.

**Response:**

```json
{
  "items": [ClothingItem], // Only 'friends' privacy items
  "owner": {
    "id": "string",
    "name": "string",
    "avatar_url": "string"
  },
  "count": 42
}
```

**Responses:**

- `200 OK` - Friend's items returned
- `404 Not Found` - User not found OR not friends (same response to prevent enumeration)
- `403 Forbidden` - NOT USED (would reveal friendship status)

**CRITICAL Security Requirements:**

- Verify friendship exists and status = `'accepted'`
- **Return `404` for both non-existent users AND non-friends** (prevents user enumeration)
- Only return items where `privacy = 'friends'`
- Never expose `'private'` items
- Exclude soft-deleted items (`removed_at IS NULL`)
- Use consistent response time to prevent timing attacks

---

### 3.2 `POST /friends/request`

Send a friend request by email.

**Request:**

```json
{
  "email": "string" // Target user's email
}
```

**Response:**

```json
{
  "id": "string",
  "status": "pending",
  "message": "Friend request sent successfully"
}
```

**Responses:**

- `200 OK` - Request sent (or already exists - same response to prevent enumeration)
- `400 Bad Request` - Invalid email format
- `429 Too Many Requests` - Rate limit exceeded

**Business Logic:**

- **Rate Limiting:** Max 10 requests per user per hour
- **Anti-Spam:** Max 3 requests to same email per day
- **Email Validation:** Check format client-side and server-side
- **Response Consistency:** Always return success message, even if:
  - User doesn't exist (prevents email enumeration)
  - Request already sent (prevents duplicate detection)
  - Already friends (prevents friendship detection)
- If user exists, create friend request with canonical ordering
- If user doesn't exist, log attempt but return success
- **Security:** Never reveal if email exists in system

---

### 3.3 `POST /friends/:id/accept`

Accept a friend request.

**Response:**

```json
{
  "status": "accepted"
}
```

---

### 3.4 `POST /suggestions`

Create an outfit suggestion.

**Request:**

```json
{
  "to_user_id": "string",
  "suggested_item_ids": ["string"], // Array of clothing item IDs, min: 1, max: 10
  "message": "string" // Optional, max 100 chars
}
```

**Responses:**

- `200 OK` - Suggestion created successfully
- `400 Bad Request` - Validation errors
- `403 Forbidden` - Not friends with target user
- `404 Not Found` - Target user doesn't exist or invalid item IDs

**Business Logic:**

- **Friendship Validation:**
  - Verify friendship exists between `auth.uid()` and `to_user_id`
  - Verify friendship status = `'accepted'`
  - Return `403` if not friends
- **Item Validation:**
  - Array must contain 1-10 items (enforced by DB constraint)
  - All `suggested_item_ids` must exist in database
  - All items must belong to `to_user_id`
  - All items must have `privacy = 'friends'`
  - All items must not be soft-deleted (`removed_at IS NULL`)
  - Return `400` with specific error if validation fails
- **Message Validation:**
  - Optional field
  - Max 100 characters (enforced by DB constraint)
- Create notification for `to_user_id`
- Set `from_user_id` from JWT token

---

### 3.5 `GET /suggestions`

Get suggestions received by the authenticated user.

**Query Parameters:**

- `unread_only` (optional) - Boolean, filter unread suggestions

**Response:**

```json
{
  "suggestions": [
    {
      "id": "string",
      "from_user": {
        "id": "string",
        "name": "string",
        "avatar_url": "string"
      },
      "items": [ClothingItem],
      "message": "string",
      "is_read": false,
      "viewed_at": null,
      "created_at": "2025-10-05T12:00:00Z"
    }
  ],
  "count": 5,
  "unread_count": 3
}
```

**Business Logic:**

- Return suggestions where `to_user_id = auth.uid()`
- Order by `created_at DESC` (newest first)
- Include sender's user info
- Include full item details for suggested items
- If `unread_only=true`, filter where `is_read = false`

---

### 3.6 `GET /suggestions/sent`

Get suggestions sent by the authenticated user.

**Response:**

```json
{
  "suggestions": [
    {
      "id": "string",
      "to_user": {
        "id": "string",
        "name": "string",
        "avatar_url": "string"
      },
      "items": [ClothingItem],
      "message": "string",
      "is_read": true,
      "viewed_at": "2025-10-05T14:30:00Z",
      "created_at": "2025-10-05T12:00:00Z"
    }
  ],
  "count": 8
}
```

**Business Logic:**

- Return suggestions where `from_user_id = auth.uid()`
- Order by `created_at DESC` (newest first)
- Include recipient's user info
- Show read status to see if recipient viewed it

---

### 3.7 `PUT /suggestions/:id/read`

Mark a suggestion as read.

**Response:**

```json
{
  "message": "Suggestion marked as read",
  "viewed_at": "2025-10-05T14:30:00Z"
}
```

**Business Logic:**

- Verify `to_user_id = auth.uid()`
- Set `is_read = true`
- Set `viewed_at = NOW()`
- Return `404` if suggestion doesn't exist or not owned by user

---

### 3.8 `DELETE /suggestions/:id`

Delete a suggestion.

**Response:**

```json
{
  "message": "Suggestion deleted successfully"
}
```

**Responses:**

- `200 OK` - Suggestion deleted
- `404 Not Found` - Suggestion doesn't exist
- `403 Forbidden` - User is not sender or recipient

**Business Logic:**

- Verify user is either `from_user_id` OR `to_user_id`
- Permanently delete suggestion (not soft delete)
- Both sender and recipient can delete

---

### 3.9 `GET /friends`

Get user's friends list.

**Query Parameters:**

- `status` (optional) - Filter by status: `pending`, `accepted`, `rejected`

**Response:**

```json
{
  "friends": [
    {
      "id": "string",
      "user": {
        "id": "string",
        "name": "string",
        "avatar_url": "string",
        "email": "string" // Only if status = pending and user is receiver
      },
      "status": "accepted",
      "created_at": "2025-10-01T12:00:00Z"
    }
  ],
  "counts": {
    "accepted": 15,
    "pending_sent": 3,
    "pending_received": 2
  }
}
```

**Business Logic:**

- Return friendships where user is requester OR receiver
- Distinguish between sent and received pending requests
- Order accepted friends by name
- Order pending by `created_at DESC`

---

### 3.10 `DELETE /friends/:id`

Unfriend a user or reject/cancel a friend request.

**Response:**

```json
{
  "message": "Friendship removed successfully"
}
```

**Business Logic:**

- Verify user is either requester or receiver
- Delete friendship record permanently
- Can be used to:
  - Unfriend (status = accepted)
  - Cancel sent request (requester, status = pending)
  - Reject received request (receiver, status = pending)

---

### 3.11 `GET /profile`

Get authenticated user's profile.

**Response:**

```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "avatar_url": "string",
  "created_at": "2025-10-01T12:00:00Z",
  "quota": {
    "used": 150,
    "limit": 200,
    "percentage": 75
  },
  "stats": {
    "total_items": 150,
    "friends_count": 15,
    "suggestions_received": 23,
    "suggestions_sent": 18
  }
}
```

**Business Logic:**

- Return authenticated user's full profile
- Calculate quota usage
- Include basic statistics

---

### 3.12 `GET /clothes/:id`

Get details of a single clothing item.

**Response:**

```json
{
  "id": "string",
  "owner_id": "string",
  "owner": {
    "id": "string",
    "name": "string",
    "avatar_url": "string"
  },
  "name": "string",
  "category": "string",
  "image_url": "string",
  "thumbnail_url": "string",
  "style_tags": ["string"],
  "privacy": "friends",
  "size": "string",
  "brand": "string",
  "created_at": "2025-10-01T12:00:00Z"
}
```

**Responses:**

- `200 OK` - Item details returned
- `404 Not Found` - Item doesn't exist, is deleted, or user lacks permission

**Business Logic:**

- If user is owner, return full details
- If user is friend and privacy = 'friends', return details
- Otherwise return `404` (don't reveal existence)
- RLS policies enforce this at database level

---

### 3.13 `POST /clothes/:id/like`

Like a friend's clothing item.

**Response:**

```json
{
  "message": "Item liked successfully"
}
```

**Responses:**

- `201 Created` - Like added
- `200 OK` - Already liked (idempotent)
- `403 Forbidden` - Not friends or item is private
- `404 Not Found` - Item doesn't exist

**Business Logic:**

- Verify friendship exists and status = `'accepted'`
- Verify item belongs to a friend (not self)
- Verify item privacy = `'friends'` or owner is self
- Insert like record (ignore if duplicate)
- Notify item owner

---

### 3.14 `DELETE /clothes/:id/like`

Unlike a friend's clothing item.

**Response:**

```json
{
  "message": "Like removed successfully"
}
```

**Business Logic:**

- Remove like record
- Return success even if like didn't exist (idempotent)

---

### 3.15 `GET /likes/my-items`

Get items the current user has liked.

**Query Parameters:**

- `limit` (optional) - Items per page, default: 20, max: 100
- `offset` (optional) - Number of items to skip, default: 0

**Response:**

```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "owner": {
        "id": "string",
        "display_name": "string",
        "avatar_url": "string"
      },
      "image_url": "string",
      "thumbnail_url": "string",
      "likes_count": 15,
      "liked_at": "2025-10-05T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

**Business Logic:**

- Return items user has liked, ordered by `liked_at DESC`
- Include owner information for each item
- Support pagination
- Only include items user still has permission to view

---

### 3.16 `GET /clothes/:id/likers`

Get users who liked a specific item.

**Query Parameters:**

- `limit` (optional) - Users per page, default: 20, max: 100

**Response:**

```json
{
  "likers": [
    {
      "user_id": "string",
      "display_name": "string",
      "avatar_url": "string",
      "liked_at": "2025-10-05T14:30:00Z"
    }
  ],
  "total_likes": 15
}
```

**Business Logic:**

- Return users who liked the item
- Order by `liked_at DESC`
- Include user profile information
- Only accessible if user owns item or can view it (friends)

---

### 3.17 `GET /likes/popular`

Get popular items from friends (trending).

**Query Parameters:**

- `limit` (optional) - Items to return, default: 10, max: 50

**Response:**

```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "owner": {
        "id": "string",
        "display_name": "string",
        "avatar_url": "string"
      },
      "image_url": "string",
      "thumbnail_url": "string",
      "likes_count": 42,
      "category": "string"
    }
  ],
  "count": 10
}
```

**Business Logic:**

- Return items with most likes from user's friends
- Only include items from accepted friends
- Order by likes_count DESC, then created_at DESC
- Use database function `get_popular_items_from_friends()`

---

### 3.18 `GET /likes/stats`

Get current user's like statistics.

**Response:**

```json
{
  "items_liked_by_me": 25,
  "likes_received_on_my_items": 142,
  "most_liked_item": {
    "id": "string",
    "name": "string",
    "likes_count": 38
  }
}
```

**Business Logic:**

- Calculate total items user has liked
- Calculate total likes received on user's items
- Find user's most liked item
- Use database function `get_user_likes_stats()`

---

## 4. Scheduled Maintenance & Cleanup

### 4.1 Automated 30-Day Purge Script

**Purpose:** Automatically delete items that have been in trash for more than 30 days.

**Implementation:**

```javascript
// scripts/purge-old-items.js
import { createClient } from '@supabase/supabase-js';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key for admin access
);

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function purgeOldItems() {
  console.log('[PURGE] Starting 30-day purge job...');
  const startTime = Date.now();
  
  try {
    // Find items removed more than 30 days ago
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const { data: itemsToDelete, error } = await supabase
      .from('clothes')
      .select('id, image_url, thumbnail_url, owner_id, name')
      .not('removed_at', 'is', null)
      .lt('removed_at', cutoffDate.toISOString());
    
    if (error) throw error;
    
    if (!itemsToDelete || itemsToDelete.length === 0) {
      console.log('[PURGE] No items to purge');
      return { purged: 0, duration: Date.now() - startTime };
    }
    
    console.log(`[PURGE] Found ${itemsToDelete.length} items to purge`);
    
    let cloudinaryDeleted = 0;
    let cloudinaryFailed = 0;
    
    // Delete images from Cloudinary
    for (const item of itemsToDelete) {
      try {
        // Extract public_id from Cloudinary URL
        const publicIds = [];
        
        if (item.image_url) {
          const imagePublicId = extractCloudinaryPublicId(item.image_url);
          if (imagePublicId) publicIds.push(imagePublicId);
        }
        
        if (item.thumbnail_url) {
          const thumbPublicId = extractCloudinaryPublicId(item.thumbnail_url);
          if (thumbPublicId) publicIds.push(thumbPublicId);
        }
        
        // Delete from Cloudinary
        for (const publicId of publicIds) {
          const result = await cloudinary.v2.uploader.destroy(publicId);
          if (result.result === 'ok') {
            cloudinaryDeleted++;
          } else {
            cloudinaryFailed++;
            console.warn(`[PURGE] Failed to delete ${publicId}:`, result);
          }
        }
        
      } catch (error) {
        cloudinaryFailed++;
        console.error(`[PURGE] Error deleting images for item ${item.id}:`, error);
      }
    }
    
    // Hard delete from database
    const { error: deleteError } = await supabase
      .from('clothes')
      .delete()
      .in('id', itemsToDelete.map(i => i.id));
    
    if (deleteError) throw deleteError;
    
    const duration = Date.now() - startTime;
    
    console.log('[PURGE] Purge job completed:', {
      items_purged: itemsToDelete.length,
      cloudinary_deleted: cloudinaryDeleted,
      cloudinary_failed: cloudinaryFailed,
      duration_ms: duration
    });
    
    // Log to monitoring
    await logMaintenanceEvent({
      type: 'purge',
      items_purged: itemsToDelete.length,
      cloudinary_deleted: cloudinaryDeleted,
      cloudinary_failed: cloudinaryFailed,
      duration_ms: duration
    });
    
    return {
      purged: itemsToDelete.length,
      cloudinary_deleted: cloudinaryDeleted,
      cloudinary_failed: cloudinaryFailed,
      duration
    };
    
  } catch (error) {
    console.error('[PURGE] Purge job failed:', error);
    throw error;
  }
}

function extractCloudinaryPublicId(url) {
  // Extract public_id from Cloudinary URL
  // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/stylesnap/user123/abc123.jpg
  // Returns: stylesnap/user123/abc123
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find 'upload' in path
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    // Skip version (v1234567890)
    let startIndex = uploadIndex + 1;
    if (pathParts[startIndex].startsWith('v')) {
      startIndex++;
    }
    
    // Get remaining path and remove extension
    const publicIdParts = pathParts.slice(startIndex);
    const publicId = publicIdParts.join('/').replace(/\.[^.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Failed to extract public_id:', error);
    return null;
  }
}

async function logMaintenanceEvent(event) {
  await supabase.from('maintenance_logs').insert({
    event_type: event.type,
    details: event,
    timestamp: new Date().toISOString()
  });
}

// Run immediately if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  purgeOldItems()
    .then(result => {
      console.log('[PURGE] Success:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('[PURGE] Fatal error:', error);
      process.exit(1);
    });
}

export { purgeOldItems };
```

**Cron Job Setup:**

```yaml
# .github/workflows/purge-old-items.yml
name: Purge Old Items

on:
  schedule:
    - cron: '0 2 * * *'  # Run daily at 2 AM UTC
  workflow_dispatch:      # Allow manual trigger

jobs:
  purge:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run purge script
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          CLOUDINARY_CLOUD_NAME: ${{ secrets.CLOUDINARY_CLOUD_NAME }}
          CLOUDINARY_API_KEY: ${{ secrets.CLOUDINARY_API_KEY }}
          CLOUDINARY_API_SECRET: ${{ secrets.CLOUDINARY_API_SECRET }}
        run: node scripts/purge-old-items.js
      
      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Purge job failed!'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

**Alternative: Supabase Edge Function**

```sql
-- Create database function for purge
CREATE OR REPLACE FUNCTION purge_old_items()
RETURNS TABLE (
  purged_count INTEGER,
  image_urls TEXT[]
) AS $$
DECLARE
  cutoff_date TIMESTAMPTZ;
  deleted_items RECORD;
BEGIN
  cutoff_date := NOW() - INTERVAL '30 days';
  
  -- Collect items to delete
  CREATE TEMP TABLE items_to_purge AS
  SELECT id, image_url, thumbnail_url
  FROM clothes
  WHERE removed_at IS NOT NULL
    AND removed_at < cutoff_date;
  
  -- Return image URLs for external cleanup
  SELECT 
    COUNT(*)::INTEGER,
    ARRAY_AGG(image_url) || ARRAY_AGG(thumbnail_url)
  INTO purged_count, image_urls
  FROM items_to_purge;
  
  -- Hard delete from database
  DELETE FROM clothes
  WHERE id IN (SELECT id FROM items_to_purge);
  
  RETURN QUERY SELECT purged_count, image_urls;
END;
$$ LANGUAGE plpgsql;
```

### 4.2 Cloudinary Usage Monitoring

**Monitor Cloudinary Credits:**

```javascript
// scripts/check-cloudinary-usage.js
import cloudinary from 'cloudinary';

async function checkCloudinaryUsage() {
  try {
    const usage = await cloudinary.v2.api.usage();
    
    console.log('Cloudinary Usage:', {
      plan: usage.plan,
      credits_used: usage.credits.usage,
      credits_limit: usage.credits.limit,
      percentage: (usage.credits.usage / usage.credits.limit * 100).toFixed(2) + '%',
      bandwidth_used_mb: (usage.bandwidth.usage / 1024 / 1024).toFixed(2),
      storage_used_mb: (usage.storage.usage / 1024 / 1024).toFixed(2),
      transformations: usage.transformations.usage
    });
    
    // Alert if approaching limit
    const usagePercentage = (usage.credits.usage / usage.credits.limit) * 100;
    if (usagePercentage > 80) {
      console.warn('⚠️ Approaching Cloudinary credit limit!');
      // Send alert to team
    }
    
  } catch (error) {
    console.error('Failed to check Cloudinary usage:', error);
  }
}

checkCloudinaryUsage();
```

**Optimize Image Storage:**

```javascript
// Generate optimized thumbnails with Cloudinary transformations
function generateThumbnailUrl(imageUrl, size = 'medium') {
  const transformations = {
    small: 'c_fill,w_150,h_150,q_auto,f_auto',
    medium: 'c_fill,w_400,h_400,q_auto,f_auto',
    large: 'c_limit,w_1080,q_auto,f_auto'
  };
  
  // Insert transformation into URL
  return imageUrl.replace('/upload/', `/upload/${transformations[size]}/`);
}

// Cache transformed URLs aggressively
const thumbnailCache = new Map();

function getCachedThumbnail(imageUrl, size) {
  const cacheKey = `${imageUrl}:${size}`;
  
  if (!thumbnailCache.has(cacheKey)) {
    thumbnailCache.set(cacheKey, generateThumbnailUrl(imageUrl, size));
  }
  
  return thumbnailCache.get(cacheKey);
}
```

### 4.3 Maintenance Logging Table

**Database Schema:**

```sql
-- Create maintenance logs table
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  duration_ms INTEGER,
  status VARCHAR(20) DEFAULT 'success'
);

CREATE INDEX idx_maintenance_logs_timestamp 
ON maintenance_logs(timestamp DESC);

CREATE INDEX idx_maintenance_logs_type 
ON maintenance_logs(event_type);
```

**Query Recent Maintenance:**

```sql
-- Get recent purge jobs
SELECT 
  timestamp,
  details->>'items_purged' as items_purged,
  details->>'cloudinary_deleted' as cloudinary_deleted,
  duration_ms,
  status
FROM maintenance_logs
WHERE event_type = 'purge'
ORDER BY timestamp DESC
LIMIT 10;
```

**Maintenance Dashboard Endpoint:**

```javascript
// GET /api/admin/maintenance
app.get('/api/admin/maintenance', authenticateAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(50);
  
  if (error) {
    return res.status(500).json({ error: 'Failed to fetch maintenance logs' });
  }
  
  res.json({ logs: data });
});
```

---

## 9. Outfit History & Analytics Endpoints (Batch 9)

### 9.1 `POST /api/outfit-history`

Record an outfit that was worn.

**Request:**

```json
{
  "suggestion_id": "uuid",        // Optional: reference to original suggestion
  "outfit_name": "string",        // Optional
  "outfit_items": [               // Required: array of items
    {
      "cloth_id": "uuid",
      "name": "string",
      "category": "string",
      "image_url": "string"
    }
  ],
  "worn_date": "2025-10-05",     // Required: date outfit was worn
  "occasion": "string",           // Optional: work, casual, date, party, etc.
  "weather_temp": 72,             // Optional: temperature in Fahrenheit
  "weather_condition": "sunny",   // Optional: sunny, rainy, cloudy, etc.
  "rating": 4,                    // Optional: 1-5 stars
  "notes": "string",              // Optional: user notes
  "photo_url": "string"           // Optional: photo of actual outfit
}
```

**Response:**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "outfit_items": [...],
  "worn_date": "2025-10-05",
  "occasion": "work",
  "rating": 4,
  "created_at": "2025-10-05T10:00:00Z"
}
```

**Status Codes:**
- `201 Created` - History entry created
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Not authenticated

### 9.2 `GET /api/outfit-history`

Get user's outfit history.

**Query Parameters:**
- `limit` (default: 20, max: 100)
- `offset` (default: 0)
- `occasion` (optional: filter by occasion)
- `start_date` (optional: filter by date range)
- `end_date` (optional: filter by date range)

**Response:**

```json
{
  "history": [
    {
      "id": "uuid",
      "outfit_name": "Work Monday",
      "outfit_items": [...],
      "worn_date": "2025-10-05",
      "occasion": "work",
      "rating": 4,
      "weather_temp": 72,
      "created_at": "2025-10-05T10:00:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

### 9.3 `GET /api/analytics/stats`

Get user's outfit analytics and statistics.

**Response:**

```json
{
  "total_outfits_worn": 45,
  "avg_rating": 4.2,
  "most_worn_occasion": "work",
  "favorite_season": "spring/fall",
  "total_items_used": 32,
  "most_worn_item": {
    "id": "uuid",
    "name": "Black Blazer",
    "category": "outerwear",
    "wear_count": 12,
    "avg_rating": 4.5,
    "last_worn": "2025-10-01"
  }
}
```

### 9.4 `GET /api/analytics/most-worn`

Get most frequently worn items.

**Query Parameters:**
- `limit` (default: 10, max: 50)

**Response:**

```json
{
  "items": [
    {
      "cloth_id": "uuid",
      "item_name": "Black Jeans",
      "category": "bottom",
      "wear_count": 15,
      "avg_rating": 4.3,
      "last_worn": "2025-10-05"
    }
  ]
}
```

### 9.5 `GET /api/analytics/unworn`

Get items that haven't been worn recently (for suggestions).

**Response:**

```json
{
  "items": [
    {
      "cloth_id": "uuid",
      "item_name": "Red Dress",
      "category": "top",
      "last_worn_days_ago": 45
    }
  ]
}
```

---

## 10. Outfit Sharing & Social Feed Endpoints (Batch 9)

### 10.1 `POST /api/shared-outfits`

Share an outfit to social feed.

**Request:**

```json
{
  "suggestion_id": "uuid",           // Optional
  "outfit_history_id": "uuid",       // Optional
  "caption": "string",               // Optional
  "outfit_items": [...],             // Required if no suggestion_id
  "visibility": "friends"            // Required: public, friends, private
}
```

**Response:**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "caption": "Love this combo!",
  "outfit_items": [...],
  "visibility": "friends",
  "share_token": "abc123...",
  "likes_count": 0,
  "comments_count": 0,
  "created_at": "2025-10-05T10:00:00Z"
}
```

**Status Codes:**
- `201 Created` - Outfit shared
- `400 Bad Request` - Invalid data

### 10.2 `GET /api/shared-outfits/feed`

Get social feed of shared outfits.

**Query Parameters:**
- `limit` (default: 20, max: 50)
- `offset` (default: 0)
- `visibility` (optional: public, friends)

**Response:**

```json
{
  "feed": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "display_name": "Jane Doe",
        "avatar_url": "https://..."
      },
      "caption": "Date night!",
      "outfit_items": [...],
      "likes_count": 5,
      "comments_count": 2,
      "user_has_liked": false,
      "created_at": "2025-10-05T10:00:00Z"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

### 10.3 `POST /api/shared-outfits/:id/like`

Like a shared outfit.

**Response:**

```json
{
  "liked": true,
  "likes_count": 6
}
```

**Status Codes:**
- `200 OK` - Liked successfully
- `400 Bad Request` - Already liked
- `404 Not Found` - Outfit not found

### 10.4 `DELETE /api/shared-outfits/:id/like`

Unlike a shared outfit.

**Response:**

```json
{
  "liked": false,
  "likes_count": 5
}
```

### 10.5 `POST /api/shared-outfits/:id/comments`

Comment on a shared outfit.

**Request:**

```json
{
  "comment_text": "string"  // Required, max 1000 chars
}
```

**Response:**

```json
{
  "id": "uuid",
  "outfit_id": "uuid",
  "user": {
    "id": "uuid",
    "display_name": "John Doe",
    "avatar_url": "https://..."
  },
  "comment_text": "Great outfit!",
  "created_at": "2025-10-05T10:00:00Z"
}
```

### 10.6 `GET /api/shared-outfits/:id/comments`

Get comments on a shared outfit.

**Query Parameters:**
- `limit` (default: 20, max: 100)
- `offset` (default: 0)

**Response:**

```json
{
  "comments": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "display_name": "Jane Doe",
        "avatar_url": "https://..."
      },
      "comment_text": "Love it!",
      "created_at": "2025-10-05T10:00:00Z"
    }
  ],
  "total": 5
}
```

### 10.7 `GET /api/shared-outfits/public/:share_token`

View shared outfit via public link (no auth required).

**Response:**

```json
{
  "outfit": {
    "id": "uuid",
    "user": {
      "display_name": "Anonymous User"  // Limited info for privacy
    },
    "caption": "Check out this outfit!",
    "outfit_items": [...],
    "likes_count": 10,
    "created_at": "2025-10-05T10:00:00Z"
  }
}
```

---

## 11. Style Preferences & AI Learning Endpoints (Batch 9)

### 11.1 `GET /api/style-preferences`

Get user's style preferences.

**Response:**

```json
{
  "user_id": "uuid",
  "favorite_colors": ["black", "navy", "gray"],
  "avoid_colors": ["neon green"],
  "preferred_styles": ["casual", "business"],
  "preferred_brands": ["Uniqlo", "J.Crew"],
  "fit_preference": "regular",
  "common_occasions": ["work", "casual"],
  "updated_at": "2025-10-05T10:00:00Z"
}
```

### 11.2 `PUT /api/style-preferences`

Update style preferences.

**Request:**

```json
{
  "favorite_colors": ["black", "navy"],
  "avoid_colors": ["yellow"],
  "preferred_styles": ["casual", "streetwear"],
  "preferred_brands": ["Nike", "Adidas"],
  "fit_preference": "regular",
  "common_occasions": ["casual", "gym"]
}
```

**Response:**

```json
{
  "user_id": "uuid",
  "favorite_colors": ["black", "navy"],
  "updated_at": "2025-10-05T10:00:00Z"
}
```

### 11.3 `POST /api/suggestions/:id/feedback`

Provide feedback on a suggestion (like/dislike).

**Request:**

```json
{
  "feedback_type": "like",        // Required: like, dislike, love
  "feedback_reason": "string"     // Optional: why they liked/disliked
}
```

**Response:**

```json
{
  "id": "uuid",
  "suggestion_id": "uuid",
  "feedback_type": "like",
  "created_at": "2025-10-05T10:00:00Z"
}
```

**Status Codes:**
- `201 Created` - Feedback recorded
- `400 Bad Request` - Invalid feedback type

### 11.4 `GET /api/suggestions/recommended`

Get AI-recommended suggestions based on preferences and history.

**Query Parameters:**
- `occasion` (optional: filter by occasion)
- `weather_temp` (optional: temperature-based suggestions)

**Response:**

```json
{
  "suggestions": [
    {
      "items": [...],
      "confidence_score": 0.85,
      "reason": "Based on your favorite colors and most worn items",
      "occasion": "work"
    }
  ],
  "based_on": {
    "wear_history": true,
    "preferences": true,
    "feedback": true
  }
}
```

---

## 12. Outfit Collections & Lookbooks Endpoints (Batch 9)

### 12.1 `POST /api/collections`

Create a new outfit collection.

**Request:**

```json
{
  "name": "Work Outfits",         // Required, max 255 chars
  "description": "string",        // Optional
  "theme": "work",                // Optional
  "cover_image_url": "string",    // Optional
  "visibility": "private"         // Required: public, friends, private
}
```

**Response:**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Work Outfits",
  "description": "...",
  "visibility": "private",
  "outfits_count": 0,
  "created_at": "2025-10-05T10:00:00Z"
}
```

**Status Codes:**
- `201 Created` - Collection created
- `400 Bad Request` - Invalid data

### 12.2 `GET /api/collections`

Get user's collections.

**Query Parameters:**
- `limit` (default: 20, max: 100)
- `favorites_only` (optional: true/false)

**Response:**

```json
{
  "collections": [
    {
      "id": "uuid",
      "name": "Work Outfits",
      "description": "...",
      "cover_image_url": "https://...",
      "visibility": "private",
      "outfits_count": 5,
      "is_favorite": true,
      "created_at": "2025-10-05T10:00:00Z"
    }
  ],
  "total": 10
}
```

### 12.3 `POST /api/collections/:id/outfits`

Add an outfit to a collection.

**Request:**

```json
{
  "suggestion_id": "uuid",        // Optional
  "outfit_name": "string",        // Optional
  "outfit_items": [...],          // Required if no suggestion_id
  "notes": "string",              // Optional
  "position": 0                   // Optional: order in collection
}
```

**Response:**

```json
{
  "id": "uuid",
  "collection_id": "uuid",
  "outfit_name": "Monday Work",
  "outfit_items": [...],
  "position": 0,
  "created_at": "2025-10-05T10:00:00Z"
}
```

### 12.4 `GET /api/collections/:id/outfits`

Get outfits in a collection.

**Response:**

```json
{
  "collection": {
    "id": "uuid",
    "name": "Work Outfits",
    "outfits_count": 5
  },
  "outfits": [
    {
      "id": "uuid",
      "outfit_name": "Monday Work",
      "outfit_items": [...],
      "position": 0,
      "notes": "Wear with brown shoes",
      "created_at": "2025-10-05T10:00:00Z"
    }
  ]
}
```

### 12.5 `DELETE /api/collections/:collection_id/outfits/:outfit_id`

Remove an outfit from a collection.

**Response:**

```json
{
  "message": "Outfit removed from collection",
  "outfits_count": 4
}
```

### 12.6 `DELETE /api/collections/:id`

Delete a collection.

**Response:**

```json
{
  "message": "Collection deleted"
}
```

**Status Codes:**
- `200 OK` - Collection deleted
- `404 Not Found` - Collection not found

---

## 13. Advanced Outfit Features API

### 13.1 Outfit History Endpoints

#### 13.1.1 `POST /api/outfit-history`

Record a worn outfit.

**Request:**

```json
{
  "outfit_items": [1, 2, 3],      // Required: Array of clothing_item IDs
  "occasion": "string",            // Optional: work/casual/formal/party/date/sport/travel/other
  "date_worn": "2025-10-06",      // Optional: ISO date (defaults to today)
  "rating": 5,                     // Optional: 1-5 stars
  "notes": "string",               // Optional: User notes
  "weather_temp": 72,              // Optional: Temperature in Fahrenheit
  "weather_condition": "sunny"     // Optional: sunny/cloudy/rainy/snowy/windy
}
```

**Response:**

```json
{
  "id": 1,
  "user_id": "uuid",
  "outfit_items": [1, 2, 3],
  "occasion": "casual",
  "date_worn": "2025-10-06",
  "rating": 5,
  "notes": "Felt great!",
  "weather_temp": 72,
  "weather_condition": "sunny",
  "created_at": "2025-10-06T10:00:00Z"
}
```

**Status Codes:**
- `201 Created` - Outfit recorded
- `400 Bad Request` - Invalid outfit_items or validation error
- `404 Not Found` - One or more clothing items not found

#### 13.1.2 `GET /api/outfit-history`

Get user's outfit history with pagination and filters.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `occasion` (string) - Filter by occasion
- `min_rating` (number, 1-5) - Filter by minimum rating
- `start_date` (ISO date) - Filter from date
- `end_date` (ISO date) - Filter to date
- `order` (string) - Sort order: 'date_desc' (default), 'date_asc', 'rating_desc', 'rating_asc'

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "user_id": "uuid",
      "outfit_items": [1, 2, 3],
      "occasion": "casual",
      "date_worn": "2025-10-06",
      "rating": 5,
      "notes": "Felt great!",
      "weather_temp": 72,
      "weather_condition": "sunny",
      "created_at": "2025-10-06T10:00:00Z",
      "items": [
        {
          "id": 1,
          "name": "Blue Shirt",
          "category": "top",
          "image_url": "https://..."
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### 13.1.3 `GET /api/outfit-history/:id`

Get a specific outfit history entry.

**Response:**

```json
{
  "id": 1,
  "user_id": "uuid",
  "outfit_items": [1, 2, 3],
  "occasion": "casual",
  "date_worn": "2025-10-06",
  "rating": 5,
  "notes": "Felt great!",
  "weather_temp": 72,
  "weather_condition": "sunny",
  "created_at": "2025-10-06T10:00:00Z",
  "items": [
    {
      "id": 1,
      "name": "Blue Shirt",
      "category": "top",
      "image_url": "https://...",
      "style_tags": ["casual", "summer"]
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Entry found
- `404 Not Found` - Entry not found

#### 13.1.4 `PUT /api/outfit-history/:id`

Update an outfit history entry.

**Request:**

```json
{
  "occasion": "string",        // Optional
  "rating": 5,                 // Optional: 1-5 stars
  "notes": "string"            // Optional
}
```

**Response:**

```json
{
  "id": 1,
  "user_id": "uuid",
  "outfit_items": [1, 2, 3],
  "occasion": "work",
  "date_worn": "2025-10-06",
  "rating": 4,
  "notes": "Updated notes",
  "weather_temp": 72,
  "weather_condition": "sunny",
  "created_at": "2025-10-06T10:00:00Z",
  "updated_at": "2025-10-06T15:30:00Z"
}
```

#### 13.1.5 `DELETE /api/outfit-history/:id`

Delete an outfit history entry.

**Response:**

```json
{
  "message": "Outfit history entry deleted"
}
```

**Status Codes:**
- `200 OK` - Entry deleted
- `404 Not Found` - Entry not found

#### 13.1.6 `GET /api/outfit-history/stats`

Get outfit statistics for the user.

**Response:**

```json
{
  "total_outfits_worn": 45,
  "avg_rating": 4.2,
  "most_worn_occasion": "casual",
  "favorite_season": "summer",
  "total_items_used": 32,
  "most_worn_item_id": 5,
  "most_worn_item_count": 12
}
```

#### 13.1.7 `GET /api/outfit-history/most-worn`

Get most worn items.

**Query Parameters:**
- `limit` (number, default: 10, max: 50)

**Response:**

```json
{
  "data": [
    {
      "item_id": 5,
      "item_name": "Black Jeans",
      "category": "bottom",
      "image_url": "https://...",
      "times_worn": 12
    }
  ]
}
```

---

### 13.2 Shared Outfits Endpoints

#### 13.2.1 `POST /api/shared-outfits`

Share an outfit to social feed.

**Request:**

```json
{
  "outfit_items": [1, 2, 3],      // Required: Array of clothing_item IDs
  "caption": "string",             // Optional: Caption for the outfit
  "occasion": "string",            // Optional: work/casual/formal/party/date/sport/travel/other
  "visibility": "public"           // Optional: public/friends (default: friends)
}
```

**Response:**

```json
{
  "id": 1,
  "user_id": "uuid",
  "username": "johndoe",
  "profile_picture": "https://...",
  "outfit_items": [1, 2, 3],
  "caption": "Love this combo!",
  "occasion": "casual",
  "visibility": "public",
  "likes_count": 0,
  "comments_count": 0,
  "created_at": "2025-10-06T10:00:00Z",
  "items": [
    {
      "id": 1,
      "name": "Blue Shirt",
      "category": "top",
      "image_url": "https://..."
    }
  ]
}
```

**Status Codes:**
- `201 Created` - Outfit shared
- `400 Bad Request` - Invalid outfit_items
- `404 Not Found` - One or more clothing items not found

#### 13.2.2 `GET /api/shared-outfits/feed`

Get social feed of shared outfits.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `visibility` (string) - Filter by visibility: 'public', 'friends', 'all' (default: 'all')
- `user_id` (uuid) - Filter by specific user

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "user_id": "uuid",
      "username": "johndoe",
      "profile_picture": "https://...",
      "outfit_items": [1, 2, 3],
      "caption": "Love this combo!",
      "occasion": "casual",
      "visibility": "public",
      "likes_count": 15,
      "comments_count": 3,
      "created_at": "2025-10-06T10:00:00Z",
      "is_liked": false,
      "items": [
        {
          "id": 1,
          "name": "Blue Shirt",
          "category": "top",
          "image_url": "https://..."
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

**Privacy Rules:**
- Public outfits: Visible to all users
- Friends outfits: Visible only to friends (mutual friendship required)
- Users see their own outfits regardless of visibility

#### 13.2.3 `GET /api/shared-outfits/:id`

Get a specific shared outfit.

**Response:**

```json
{
  "id": 1,
  "user_id": "uuid",
  "username": "johndoe",
  "profile_picture": "https://...",
  "outfit_items": [1, 2, 3],
  "caption": "Love this combo!",
  "occasion": "casual",
  "visibility": "public",
  "likes_count": 15,
  "comments_count": 3,
  "created_at": "2025-10-06T10:00:00Z",
  "is_liked": false,
  "items": [
    {
      "id": 1,
      "name": "Blue Shirt",
      "category": "top",
      "image_url": "https://...",
      "style_tags": ["casual", "summer"]
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Outfit found
- `403 Forbidden` - No permission to view (friends-only outfit from non-friend)
- `404 Not Found` - Outfit not found

#### 13.2.4 `PUT /api/shared-outfits/:id`

Update a shared outfit (owner only).

**Request:**

```json
{
  "caption": "string",         // Optional
  "visibility": "public"       // Optional: public/friends
}
```

**Response:**

```json
{
  "id": 1,
  "user_id": "uuid",
  "username": "johndoe",
  "outfit_items": [1, 2, 3],
  "caption": "Updated caption",
  "occasion": "casual",
  "visibility": "public",
  "likes_count": 15,
  "comments_count": 3,
  "created_at": "2025-10-06T10:00:00Z",
  "updated_at": "2025-10-06T15:30:00Z"
}
```

#### 13.2.5 `DELETE /api/shared-outfits/:id`

Delete a shared outfit (owner only).

**Response:**

```json
{
  "message": "Shared outfit deleted"
}
```

**Status Codes:**
- `200 OK` - Outfit deleted
- `403 Forbidden` - Not the owner
- `404 Not Found` - Outfit not found

#### 13.2.6 `POST /api/shared-outfits/:id/like`

Like a shared outfit.

**Response:**

```json
{
  "message": "Outfit liked",
  "likes_count": 16
}
```

**Status Codes:**
- `200 OK` - Outfit liked
- `409 Conflict` - Already liked
- `404 Not Found` - Outfit not found

#### 13.2.7 `DELETE /api/shared-outfits/:id/like`

Unlike a shared outfit.

**Response:**

```json
{
  "message": "Outfit unliked",
  "likes_count": 15
}
```

**Status Codes:**
- `200 OK` - Outfit unliked
- `404 Not Found` - Outfit not found or not liked

#### 13.2.8 `GET /api/shared-outfits/:id/has-liked`

Check if user has liked an outfit.

**Response:**

```json
{
  "has_liked": true
}
```

#### 13.2.9 `GET /api/shared-outfits/:id/comments`

Get comments on a shared outfit.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "outfit_id": 1,
      "user_id": "uuid",
      "username": "janedoe",
      "profile_picture": "https://...",
      "comment_text": "Love this outfit!",
      "created_at": "2025-10-06T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "pages": 1
  }
}
```

#### 13.2.10 `POST /api/shared-outfits/:id/comments`

Add a comment to a shared outfit.

**Request:**

```json
{
  "comment_text": "string"    // Required, max 500 chars
}
```

**Response:**

```json
{
  "id": 1,
  "outfit_id": 1,
  "user_id": "uuid",
  "username": "janedoe",
  "profile_picture": "https://...",
  "comment_text": "Love this outfit!",
  "created_at": "2025-10-06T10:30:00Z"
}
```

**Status Codes:**
- `201 Created` - Comment added
- `400 Bad Request` - Invalid comment_text
- `404 Not Found` - Outfit not found

#### 13.2.11 `PUT /api/shared-outfits/:id/comments/:commentId`

Update a comment (owner only).

**Request:**

```json
{
  "comment_text": "string"    // Required, max 500 chars
}
```

**Response:**

```json
{
  "id": 1,
  "outfit_id": 1,
  "user_id": "uuid",
  "comment_text": "Updated comment",
  "created_at": "2025-10-06T10:30:00Z",
  "updated_at": "2025-10-06T11:00:00Z"
}
```

#### 13.2.12 `DELETE /api/shared-outfits/:id/comments/:commentId`

Delete a comment (owner or outfit owner can delete).

**Response:**

```json
{
  "message": "Comment deleted"
}
```

**Status Codes:**
- `200 OK` - Comment deleted
- `403 Forbidden` - Not the comment owner or outfit owner
- `404 Not Found` - Comment not found

---

### 13.3 Style Preferences Endpoints

#### 13.3.1 `GET /api/style-preferences`

Get user's style preferences.

**Response:**

```json
{
  "user_id": "uuid",
  "favorite_colors": ["blue", "black", "white"],
  "avoid_colors": ["yellow"],
  "preferred_styles": ["casual", "minimalist"],
  "preferred_brands": ["Nike", "Adidas"],
  "fit_preference": "regular",
  "common_occasions": ["work", "casual"],
  "created_at": "2025-10-01T10:00:00Z",
  "updated_at": "2025-10-06T15:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Preferences found
- `404 Not Found` - No preferences set (returns empty object)

#### 13.3.2 `PUT /api/style-preferences`

Update style preferences (creates if not exists).

**Request:**

```json
{
  "favorite_colors": ["string"],      // Optional: Array of color names
  "avoid_colors": ["string"],         // Optional: Array of color names
  "preferred_styles": ["string"],     // Optional: casual/formal/minimalist/bohemian/streetwear/vintage/athletic/preppy/edgy
  "preferred_brands": ["string"],     // Optional: Array of brand names
  "fit_preference": "string",         // Optional: slim/regular/loose/oversized
  "common_occasions": ["string"]      // Optional: Array of occasions
}
```

**Response:**

```json
{
  "user_id": "uuid",
  "favorite_colors": ["blue", "black", "white"],
  "avoid_colors": ["yellow"],
  "preferred_styles": ["casual", "minimalist"],
  "preferred_brands": ["Nike", "Adidas"],
  "fit_preference": "regular",
  "common_occasions": ["work", "casual"],
  "created_at": "2025-10-01T10:00:00Z",
  "updated_at": "2025-10-06T15:30:00Z"
}
```

**Status Codes:**
- `200 OK` - Preferences updated
- `400 Bad Request` - Invalid values

#### 13.3.3 `POST /api/style-preferences/feedback`

Submit feedback on a suggestion.

**Request:**

```json
{
  "suggestion_id": 1,              // Required: ID of the suggestion
  "feedback_type": "positive",     // Required: positive/negative
  "feedback_text": "string"        // Optional: User comment
}
```

**Response:**

```json
{
  "id": 1,
  "user_id": "uuid",
  "suggestion_id": 1,
  "feedback_type": "positive",
  "feedback_text": "Love this combination!",
  "created_at": "2025-10-06T10:00:00Z"
}
```

**Status Codes:**
- `201 Created` - Feedback submitted
- `400 Bad Request` - Invalid feedback_type
- `404 Not Found` - Suggestion not found

#### 13.3.4 `GET /api/style-preferences/feedback`

Get all feedback for the user.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "user_id": "uuid",
      "suggestion_id": 1,
      "feedback_type": "positive",
      "feedback_text": "Love this combination!",
      "created_at": "2025-10-06T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

#### 13.3.5 `GET /api/style-preferences/feedback/:suggestionId`

Get feedback for a specific suggestion.

**Response:**

```json
{
  "id": 1,
  "user_id": "uuid",
  "suggestion_id": 1,
  "feedback_type": "positive",
  "feedback_text": "Love this combination!",
  "created_at": "2025-10-06T10:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Feedback found
- `404 Not Found` - No feedback for this suggestion

#### 13.3.6 `DELETE /api/style-preferences/feedback/:id`

Delete feedback.

**Response:**

```json
{
  "message": "Feedback deleted"
}
```

**Status Codes:**
- `200 OK` - Feedback deleted
- `404 Not Found` - Feedback not found

---

### 13.4 Analytics Endpoints

#### 13.4.1 `GET /api/analytics/stats`

Get overall wardrobe statistics.

**Response:**

```json
{
  "total_outfits_worn": 45,
  "avg_rating": 4.2,
  "most_worn_occasion": "casual",
  "favorite_season": "summer",
  "total_items_used": 32,
  "most_worn_item_id": 5,
  "most_worn_item_count": 12
}
```

#### 13.4.2 `GET /api/analytics/most-worn`

Get most worn items.

**Query Parameters:**
- `limit` (number, default: 10, max: 50)

**Response:**

```json
{
  "data": [
    {
      "item_id": 5,
      "item_name": "Black Jeans",
      "category": "bottom",
      "image_url": "https://...",
      "times_worn": 12,
      "last_worn": "2025-10-05"
    }
  ]
}
```

#### 13.4.3 `GET /api/analytics/unworn`

Get items that are rarely/never worn.

**Response:**

```json
{
  "data": [
    {
      "item_id": 15,
      "item_name": "Red Dress",
      "category": "top",
      "image_url": "https://...",
      "times_worn": 0,
      "last_worn": null,
      "last_worn_days_ago": 999
    },
    {
      "item_id": 20,
      "item_name": "White Sneakers",
      "category": "shoes",
      "image_url": "https://...",
      "times_worn": 1,
      "last_worn": "2025-08-15",
      "last_worn_days_ago": 52
    }
  ]
}
```

#### 13.4.4 `GET /api/analytics/category-breakdown`

Get usage breakdown by category.

**Response:**

```json
{
  "top": 25,
  "bottom": 20,
  "shoes": 15,
  "outerwear": 8,
  "accessory": 5
}
```

#### 13.4.5 `GET /api/analytics/occasion-breakdown`

Get outfit breakdown by occasion.

**Response:**

```json
{
  "casual": 20,
  "work": 15,
  "formal": 5,
  "party": 3,
  "date": 2
}
```

#### 13.4.6 `GET /api/analytics/rating-distribution`

Get rating distribution.

**Response:**

```json
{
  "1": 2,
  "2": 3,
  "3": 8,
  "4": 15,
  "5": 17
}
```

#### 13.4.7 `GET /api/analytics/weather-preferences`

Get weather-related preferences.

**Response:**

```json
{
  "avg_temp": 72.5,
  "conditions": {
    "sunny": 25,
    "cloudy": 15,
    "rainy": 5
  }
}
```

---

## 14. Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common Status Codes:**
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid auth token
- `403 Forbidden` - No permission (quota, privacy, ownership)
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate action (e.g., already liked)
- `500 Internal Server Error` - Server error

````
