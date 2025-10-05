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

- Check user's current item count (where `removed_at` IS NULL)
- If count >= 200, return `403` with a friendly message
- Create item with `owner_id` from JWT

---

### 2.2 `GET /closet`

Get user's clothing items.

**Query Parameters:**

- `category` (optional) - Comma-separated categories

**Response:**

```json
{
  "items": [ClothingItem],
  "count": 42,
  "quota": {
    "used": 42,
    "limit": 200
  }
}
```

---

### 2.3 `PUT /clothes/:id`

Update a clothing item.

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

---

### 2.4 `POST /clothes/:id/remove`

Soft delete a clothing item.

**Response:**

```json
{
  "message": "Item moved to trash"
}
```

**Business Logic:**

- Set `removed_at = NOW()`
- Keep in database for 30-day recovery period

---

## 3. Social Endpoints

### 3.1 `GET /friends/:id/cabinet`

Get a friend's viewable closet.

**Response:**

```json
{
  "items": [ClothingItem] // Only 'friends' privacy items
}
```

**CRITICAL Security Requirements:**

- Verify friendship exists and status = `'accepted'`
- Only return items where `privacy = 'friends'`
- Never expose `'private'` items
- Exclude soft-deleted items

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
  "status": "pending"
}
```

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
  "suggested_item_ids": ["string"], // Array of clothing item IDs
  "message": "string" // Optional, max 100 chars
}
```

**Business Logic:**

- Verify friendship exists and is accepted
- Verify all items belong to `to_user_id`
- Create a notification for the recipient