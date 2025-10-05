# StyleSnap API Reference

**Version:** 1.0.0  
**Base URL:** `https://api.stylesnap.com` (production) or `http://localhost:3000` (development)  
**Authentication:** JWT Bearer Token (from Supabase Auth)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Clothes Management](#clothes-management)
3. [Social Features](#social-features)
4. [Suggestions](#suggestions)
5. [User Management](#user-management)
6. [Error Codes](#error-codes)
7. [Rate Limits](#rate-limits)

---

## Authentication

All API endpoints (except `/auth/*`) require authentication via JWT token.

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Get Token

Authentication is handled by Supabase Auth (Google OAuth).

```javascript
// Frontend: Get auth token
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign in with Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});

// Get current session
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

---

## Clothes Management

### POST /clothes

Create a new clothing item.

**Request:**

```http
POST /api/clothes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Blue Denim Jacket",
  "category": "outerwear",
  "image_url": "https://res.cloudinary.com/demo/image/upload/v1234/stylesnap/user123/jacket.jpg",
  "style_tags": ["casual", "denim", "blue"],
  "privacy": "friends",
  "size": "M",
  "brand": "Levi's"
}
```

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "owner_id": "user-uuid",
  "name": "Blue Denim Jacket",
  "category": "outerwear",
  "image_url": "https://res.cloudinary.com/.../jacket.jpg",
  "thumbnail_url": "https://res.cloudinary.com/.../c_fill,w_150,h_150/jacket.jpg",
  "style_tags": ["casual", "denim", "blue"],
  "privacy": "friends",
  "size": "M",
  "brand": "Levi's",
  "created_at": "2025-10-05T12:00:00Z",
  "updated_at": "2025-10-05T12:00:00Z",
  "removed_at": null
}
```

**Error Responses:**

```json
// 403 Forbidden - Quota exceeded
{
  "error": "You've reached your 200 item limit. Please remove some items to add new ones.",
  "code": "QUOTA_EXCEEDED",
  "details": {
    "current": 200,
    "limit": 200,
    "remaining": 0
  },
  "timestamp": "2025-10-05T12:00:00Z"
}

// 400 Bad Request - Validation error
{
  "error": "Invalid input data",
  "code": "VALIDATION_ERROR",
  "details": {
    "fields": {
      "category": "Category must be one of: top, bottom, outerwear, shoes, accessory",
      "image_url": "Image URL must be from Cloudinary (res.cloudinary.com)"
    }
  },
  "timestamp": "2025-10-05T12:00:00Z"
}
```

---

### GET /closet

Get user's clothing items with pagination and filtering.

**Request:**

```http
GET /api/closet?category=top,outerwear&limit=20&offset=0&sort=newest
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | all | Comma-separated categories |
| `limit` | number | 20 | Items per page (max: 100) |
| `offset` | number | 0 | Number of items to skip |
| `sort` | string | newest | Sort order: `newest`, `oldest`, `name` |

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Blue Denim Jacket",
      "category": "outerwear",
      "image_url": "https://...",
      "thumbnail_url": "https://...",
      "style_tags": ["casual", "denim"],
      "privacy": "friends",
      "created_at": "2025-10-05T12:00:00Z"
    }
  ],
  "count": 20,
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

---

### PUT /clothes/:id

Update a clothing item's metadata (image cannot be changed).

**Request:**

```http
PUT /api/clothes/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Vintage Denim Jacket",
  "style_tags": ["casual", "vintage", "denim"],
  "privacy": "private"
}
```

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Vintage Denim Jacket",
  "style_tags": ["casual", "vintage", "denim"],
  "privacy": "private",
  "updated_at": "2025-10-05T13:00:00Z"
}
```

---

### POST /clothes/:id/remove

Soft delete a clothing item (30-day recovery period).

**Request:**

```http
POST /api/clothes/550e8400-e29b-41d4-a716-446655440000/remove
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Item moved to trash",
  "recoverable_until": "2025-11-04T12:00:00Z"
}
```

---

### POST /clothes/:id/restore

Restore a soft-deleted item within 30 days.

**Request:**

```http
POST /api/clothes/550e8400-e29b-41d4-a716-446655440000/restore
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Item restored successfully",
  "item": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Blue Denim Jacket",
    "removed_at": null
  }
}
```

**Error Responses:**

```json
// 404 Not Found - Recovery period expired
{
  "error": "Recovery period expired (30 days)",
  "code": "RECOVERY_EXPIRED",
  "details": {
    "removed_at": "2025-09-01T12:00:00Z",
    "days_since_removal": 34
  }
}

// 403 Forbidden - Quota exceeded
{
  "error": "Cannot restore - you've reached your 200 item limit",
  "code": "QUOTA_EXCEEDED",
  "details": {
    "current": 200,
    "limit": 200,
    "action": "Remove some items before restoring"
  }
}
```

---

### GET /clothes/trash

Get soft-deleted items (recoverable for 30 days).

**Request:**

```http
GET /api/clothes/trash
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Old Sweater",
      "category": "top",
      "image_url": "https://...",
      "removed_at": "2025-10-01T12:00:00Z",
      "days_remaining": 26
    }
  ],
  "count": 5
}
```

---

### GET /quota

Get user's quota usage and warnings.

**Request:**

```http
GET /api/quota
Authorization: Bearer <token>
```

**Response (200 OK):**

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
  ]
}
```

---

## Social Features

### GET /friends

Get user's friend list with status.

**Request:**

```http
GET /api/friends?status=accepted
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | accepted | Filter by status: `pending`, `accepted`, `rejected` |

**Response (200 OK):**

```json
{
  "friends": [
    {
      "id": "friend-uuid",
      "user_id": "user-uuid",
      "friend_id": "friend-user-uuid",
      "status": "accepted",
      "created_at": "2025-10-01T12:00:00Z",
      "friend_profile": {
        "id": "friend-user-uuid",
        "display_name": "Jane Doe",
        "avatar_url": "https://..."
      }
    }
  ],
  "count": 15
}
```

---

### POST /friends/request

Send a friend request by email.

**Request:**

```http
POST /api/friends/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "friend@example.com"
}
```

**Response (200 OK):**

```json
{
  "id": "request-uuid",
  "status": "pending",
  "message": "Friend request sent successfully"
}
```

**Note:** Returns same success response even if:
- User doesn't exist (prevents email enumeration)
- Request already sent (prevents duplicate detection)
- Already friends (prevents friendship detection)

**Error Responses:**

```json
// 400 Bad Request - Invalid email
{
  "error": "Invalid email format",
  "code": "VALIDATION_ERROR"
}

// 429 Too Many Requests - Rate limit exceeded
{
  "error": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 3600
}
```

---

### POST /friends/:id/accept

Accept a friend request.

**Request:**

```http
POST /api/friends/request-uuid/accept
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Friend request accepted",
  "friendship_id": "friendship-uuid"
}
```

---

### POST /friends/:id/reject

Reject a friend request.

**Request:**

```http
POST /api/friends/request-uuid/reject
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Friend request rejected"
}
```

---

### DELETE /friends/:id

Remove a friend.

**Request:**

```http
DELETE /api/friends/friendship-uuid
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Friend removed successfully"
}
```

---

### GET /friends/:id/cabinet

Get a friend's viewable closet items.

**Request:**

```http
GET /api/friends/friend-user-uuid/cabinet?category=top&limit=20
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": "item-uuid",
      "name": "Blue Shirt",
      "category": "top",
      "image_url": "https://...",
      "thumbnail_url": "https://...",
      "style_tags": ["casual", "blue"]
    }
  ],
  "count": 20,
  "total": 45,
  "friend_profile": {
    "id": "friend-user-uuid",
    "display_name": "Jane Doe"
  }
}
```

**Note:** Only returns items with `privacy = 'friends'` if friendship is accepted.

---

## Suggestions

### POST /suggestions

Create a new outfit suggestion for a friend.

**Request:**

```http
POST /api/suggestions
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient_id": "friend-user-uuid",
  "item_ids": [
    "item-uuid-1",
    "item-uuid-2",
    "item-uuid-3"
  ],
  "message": "This would look great together!"
}
```

**Response (201 Created):**

```json
{
  "id": "suggestion-uuid",
  "sender_id": "user-uuid",
  "recipient_id": "friend-user-uuid",
  "item_ids": ["item-uuid-1", "item-uuid-2", "item-uuid-3"],
  "message": "This would look great together!",
  "status": "pending",
  "created_at": "2025-10-05T12:00:00Z"
}
```

**Error Responses:**

```json
// 403 Forbidden - Not friends
{
  "error": "You can only send suggestions to friends",
  "code": "FRIENDSHIP_REQUIRED"
}

// 400 Bad Request - Invalid items
{
  "error": "Invalid item IDs in suggestion",
  "code": "INVALID_ITEMS",
  "details": {
    "invalid_ids": ["item-uuid-3"]
  }
}

// 400 Bad Request - Message too long
{
  "error": "Message too long (max 100 characters)",
  "code": "MESSAGE_TOO_LONG",
  "details": {
    "length": 105,
    "max_length": 100
  }
}
```

---

### GET /suggestions

Get suggestions (received and sent).

**Request:**

```http
GET /api/suggestions?type=received&status=pending
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | received | `received` or `sent` |
| `status` | string | all | Filter by status: `pending`, `accepted`, `rejected` |

**Response (200 OK):**

```json
{
  "suggestions": [
    {
      "id": "suggestion-uuid",
      "sender_id": "friend-uuid",
      "recipient_id": "user-uuid",
      "items": [
        {
          "id": "item-uuid-1",
          "name": "Blue Shirt",
          "image_url": "https://...",
          "thumbnail_url": "https://..."
        }
      ],
      "message": "This would look great!",
      "status": "pending",
      "created_at": "2025-10-05T12:00:00Z",
      "sender_profile": {
        "id": "friend-uuid",
        "display_name": "Jane Doe"
      }
    }
  ],
  "count": 5
}
```

---

### PUT /suggestions/:id/accept

Accept a suggestion.

**Request:**

```http
PUT /api/suggestions/suggestion-uuid/accept
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Suggestion accepted",
  "suggestion_id": "suggestion-uuid"
}
```

---

### PUT /suggestions/:id/reject

Reject a suggestion.

**Request:**

```http
PUT /api/suggestions/suggestion-uuid/reject
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Suggestion rejected",
  "suggestion_id": "suggestion-uuid"
}
```

---

## User Management

### GET /profile

Get current user's profile.

**Request:**

```http
GET /api/profile
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "display_name": "John Doe",
  "avatar_url": "https://...",
  "google_id": "google-user-id",
  "created_at": "2025-01-01T12:00:00Z",
  "quota": {
    "used": 150,
    "limit": 200
  }
}
```

---

### PUT /profile

Update user profile.

**Request:**

```http
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "display_name": "Johnny Doe",
  "avatar_url": "https://..."
}
```

**Response (200 OK):**

```json
{
  "id": "user-uuid",
  "display_name": "Johnny Doe",
  "avatar_url": "https://...",
  "updated_at": "2025-10-05T12:00:00Z"
}
```

---

### GET /clothes/:id

Get details of a specific clothing item.

**Request:**

```http
GET /api/clothes/item-uuid
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "id": "item-uuid",
  "owner_id": "user-uuid",
  "name": "Blue Denim Jacket",
  "category": "outerwear",
  "image_url": "https://...",
  "thumbnail_url": "https://...",
  "style_tags": ["casual", "denim"],
  "privacy": "friends",
  "size": "M",
  "brand": "Levi's",
  "created_at": "2025-10-05T12:00:00Z",
  "updated_at": "2025-10-05T12:00:00Z"
}
```

**Note:** Returns 404 if item doesn't exist, is deleted, or user lacks permission (privacy enforcement).

---

## Error Codes

### Standard Error Response Format

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {
    "additional": "context"
  },
  "timestamp": "2025-10-05T12:00:00Z"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | No authentication token provided |
| `INVALID_TOKEN` | 401 | JWT token is invalid or expired |
| `FORBIDDEN` | 403 | User lacks permission for this resource |
| `QUOTA_EXCEEDED` | 403 | User has reached 200 item limit |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `PRIVACY_VIOLATION` | 403 | Attempt to access private items |
| `FRIENDSHIP_REQUIRED` | 403 | Action requires accepted friendship |
| `RECOVERY_EXPIRED` | 404 | Item's 30-day recovery period expired |
| `INVALID_ITEMS` | 400 | Invalid item IDs in request |
| `MESSAGE_TOO_LONG` | 400 | Message exceeds 100 character limit |

---

## Rate Limits

### Rate Limit Headers

All API responses include rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-10-05T12:01:00Z
```

### Rate Limit Tiers

| Endpoint Type | Limit | Window | Response Code |
|--------------|-------|--------|---------------|
| Authentication | 5 attempts | 15 min | 429 after 5 failures |
| Friend Requests | 10 requests | 1 hour | 429 |
| File Upload | 20 uploads | 1 hour | 429 |
| API Reads (GET) | 100 requests | 1 min | 429 |
| API Writes (POST/PUT) | 30 requests | 1 min | 429 |

### Rate Limit Exceeded Response

```json
{
  "error": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 3600,
  "timestamp": "2025-10-05T12:00:00Z"
}
```

**Headers:**

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-10-05T13:00:00Z
Retry-After: 3600
```

---

## Response Headers

### Common Headers

All API responses include:

```http
Content-Type: application/json; charset=utf-8
X-Request-ID: uuid-for-debugging
X-Response-Time: 45ms
```

### Quota Headers

Endpoints that affect quota include:

```http
X-Quota-Used: 150
X-Quota-Limit: 200
X-Quota-Remaining: 50
```

---

## SDK Usage Examples

### JavaScript/TypeScript

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.stylesnap.com',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Create clothing item
const item = await api.post('/clothes', {
  name: 'Blue Jacket',
  category: 'outerwear',
  image_url: cloudinaryUrl,
  privacy: 'friends'
});

// Get closet items
const { data } = await api.get('/closet', {
  params: {
    category: 'top,bottom',
    limit: 20,
    offset: 0
  }
});

// Send friend request
await api.post('/friends/request', {
  email: 'friend@example.com'
});

// Create suggestion
await api.post('/suggestions', {
  recipient_id: friendId,
  item_ids: [item1, item2, item3],
  message: 'Try this outfit!'
});
```

### Error Handling

```javascript
try {
  await api.post('/clothes', itemData);
} catch (error) {
  if (error.response?.status === 403) {
    const { code } = error.response.data;
    if (code === 'QUOTA_EXCEEDED') {
      showQuotaExceededDialog();
    }
  } else if (error.response?.status === 429) {
    const retryAfter = error.response.headers['retry-after'];
    showRateLimitMessage(retryAfter);
  }
}
```

---

## Pagination

Paginated endpoints support:

```javascript
// First page
GET /closet?limit=20&offset=0

// Second page
GET /closet?limit=20&offset=20

// Response includes pagination info
{
  "items": [...],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

---

## Changelog

### v1.0.0 (2025-10-05)
- Initial API release
- Clothes management endpoints
- Social features (friends, suggestions)
- Quota system (200 item limit)
- 30-day soft delete recovery
- Rate limiting
- Privacy controls

---

## Support

For API issues or questions:
- **Email:** api@stylesnap.com
- **GitHub Issues:** https://github.com/stylesnap/api/issues
- **Documentation:** https://docs.stylesnap.com

---

## License

© 2025 StyleSnap. All rights reserved.
