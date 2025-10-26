# StyleSnap API Guide

**Version:** 2.0.0  
**Last Updated:** January 2025

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
- **Session Management:** Enhanced session handling with user switching
- **No alternatives:** No email/password, magic links, or other methods

### Authentication Headers

All API endpoints (except auth) require JWT token:

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Google OAuth Configuration

**Required Environment Variables:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**OAuth Flow:**
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. User authorizes app
4. Google redirects back to Supabase
5. Supabase creates/updates user session
6. User redirected to `/closet`

### Session Management

**New Features (v2.0.0):**
- **Session Confirmation**: Users confirm identity on app access
- **Account Switching**: Switch between multiple user accounts
- **Single User Enforcement**: Only one active session per user
- **Session Persistence**: Maintain login across browser sessions

**Session Service Endpoints:**
```javascript
// Get stored sessions
getStoredSessions()

// Store new session
storeUserSession(userData)

// Switch to different session
switchToSession(session)

// Clear all sessions
clearAllSessions()
```

---

## Clothes Management API

### Overview
Manages personal closet items with 50-item upload quota and unlimited catalog additions.

### Endpoints

#### Get Closet Items
```http
GET /closet-items
```

**Query Parameters:**
- `category` (string): Filter by category
- `clothing_type` (string): Filter by clothing type
- `privacy` (string): Filter by privacy level
- `favorites` (boolean): Filter favorites only
- `search` (string): Search term
- `sort` (string): Sort order (recent, name, category)
- `limit` (number): Items per page (default: 20)
- `offset` (number): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Blue Jeans",
      "category": "bottom",
      "clothing_type": "jeans",
      "color": "blue",
      "brand": "Levi's",
      "image_url": "https://cloudinary.com/image.jpg",
      "privacy_level": "private",
      "is_favorite": false,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

#### Add Closet Item
```http
POST /closet-items
```

**Request Body:**
```json
{
  "name": "Blue Jeans",
  "category": "bottom",
  "clothing_type": "jeans",
  "color": "blue",
  "brand": "Levi's",
  "image_file": "base64_encoded_image",
  "privacy_level": "private",
  "notes": "Comfortable everyday jeans"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Blue Jeans",
    "image_url": "https://cloudinary.com/image.jpg",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### Update Closet Item
```http
PUT /closet-items/{id}
```

#### Delete Closet Item
```http
DELETE /closet-items/{id}
```

#### Toggle Favorite
```http
POST /closet-items/{id}/favorite
```

---

## Friends & Social API

### Overview
Manages friend relationships, friend requests, and social interactions.

### Endpoints

#### Get Friends
```http
GET /friends
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "friend_id": "uuid",
      "status": "accepted",
      "created_at": "2025-01-01T00:00:00Z",
      "friend": {
        "id": "uuid",
        "name": "John Doe",
        "username": "johndoe",
        "avatar_url": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

#### Send Friend Request
```http
POST /friends/request
```

**Request Body:**
```json
{
  "target_user_id": "uuid"
}
```

#### Accept Friend Request
```http
PUT /friends/{request_id}/accept
```

#### Reject Friend Request
```http
PUT /friends/{request_id}/reject
```

#### Search Users
```http
GET /users/search
```

**Query Parameters:**
- `query` (string): Search term (min 3 characters)
- `limit` (number): Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "John Doe",
        "username": "johndoe",
        "avatar_url": "https://example.com/avatar.jpg",
        "friendship_status": "none"
      }
    ],
    "count": 1,
    "has_more": false
  }
}
```

---

## Notifications API

### Overview
Manages user notifications with 7-day retention system and real-time updates.

### Endpoints

#### Get Notifications
```http
GET /notifications
```

**Query Parameters:**
- `limit` (number): Max results (default: 20, max: 50)
- `offset` (number): Pagination offset (default: 0)
- `unread_only` (boolean): Filter unread only (default: false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "friend_request",
      "message": "John Doe sent you a friend request",
      "is_read": false,
      "status": "pending",
      "expires_at": "2025-01-08T00:00:00Z",
      "created_at": "2025-01-01T00:00:00Z",
      "actor": {
        "id": "uuid",
        "username": "johndoe",
        "avatar_url": "https://example.com/avatar.jpg"
      }
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 20,
    "offset": 0,
    "unread_count": 5
  }
}
```

#### Mark Notification as Read
```http
PUT /notifications/{id}/read
```

#### Update Notification Status
```http
PUT /notifications/{id}/status
```

**Request Body:**
```json
{
  "status": "accepted"
}
```

#### Get Unread Count
```http
GET /notifications/unread-count
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### 7-Day Retention System

**Key Features:**
- Notifications expire after 7 days
- Acted-upon notifications get additional 7 days
- Automatic cleanup via database functions
- Status tracking (pending, accepted, rejected, expired)

**Database Functions:**
- `get_user_notifications_with_retention()` - Get non-expired notifications
- `update_notification_status()` - Update status and extend expiry
- `cleanup_expired_notifications()` - Remove expired notifications

---

## Catalog API

### Overview
Manages the public clothing catalog with unlimited items.

### Endpoints

#### Get Catalog Items
```http
GET /catalog
```

**Query Parameters:**
- `category` (string): Filter by category
- `clothing_type` (string): Filter by clothing type
- `search` (string): Search term
- `sort` (string): Sort order
- `limit` (number): Items per page
- `offset` (number): Pagination offset

#### Add to Closet from Catalog
```http
POST /catalog/{id}/add-to-closet
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "catalog_item_id": "uuid",
    "added_at": "2025-01-01T00:00:00Z"
  }
}
```

---

## Outfit Generation API

### Overview
AI-powered outfit generation based on weather, occasion, and user preferences.

### Endpoints

#### Generate Outfit
```http
POST /outfits/generate
```

**Request Body:**
```json
{
  "occasion": "casual",
  "weather": "sunny",
  "temperature": 22,
  "preferences": {
    "colors": ["blue", "white"],
    "styles": ["modern", "minimalist"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "items": [
      {
        "id": "uuid",
        "name": "Blue T-Shirt",
        "category": "top",
        "image_url": "https://cloudinary.com/image.jpg"
      }
    ],
    "confidence_score": 0.85,
    "reasoning": "Perfect for casual sunny weather"
  }
}
```

#### Save Generated Outfit
```http
POST /outfits
```

#### Get Outfit History
```http
GET /outfits/history
```

---

## Likes API

### Overview
Manages likes for items and outfits.

### Endpoints

#### Like Item
```http
POST /items/{id}/like
```

#### Unlike Item
```http
DELETE /items/{id}/like
```

#### Get Item Likers
```http
GET /items/{id}/likers
```

#### Like Outfit
```http
POST /outfits/{id}/like
```

#### Get Liked Items
```http
GET /likes/items
```

---

## Analytics API

### Overview
Provides wardrobe analytics and insights.

### Endpoints

#### Get Wardrobe Analytics
```http
GET /analytics/wardrobe
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_items": 45,
    "most_worn": [
      {
        "id": "uuid",
        "name": "Blue Jeans",
        "wear_count": 15,
        "last_worn": "2025-01-01T00:00:00Z"
      }
    ],
    "seasonal_breakdown": {
      "spring": 12,
      "summer": 18,
      "fall": 8,
      "winter": 7
    },
    "category_distribution": {
      "top": 20,
      "bottom": 15,
      "shoes": 5,
      "accessories": 5
    }
  }
}
```

#### Get Style Insights
```http
GET /analytics/style-insights
```

---

## User Management API

### Overview
Manages user profiles, preferences, and settings.

### Endpoints

#### Get User Profile
```http
GET /user/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### Update User Profile
```http
PUT /user/profile
```

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe"
}
```

#### Update User Avatar
```http
PUT /user/avatar
```

**Request Body:**
```json
{
  "avatar_url": "/avatars/default-1.png"
}
```

#### Get Style Preferences
```http
GET /user/style-preferences
```

**Response:**
```json
{
  "success": true,
  "data": {
    "font_theme": "openSans",
    "color_theme": "purple",
    "dark_mode": false
  }
}
```

#### Update Style Preferences
```http
PUT /user/style-preferences
```

**Request Body:**
```json
{
  "font_theme": "inter",
  "color_theme": "blue",
  "dark_mode": true
}
```

---

## Weather API

### Overview
Provides weather information for outfit suggestions.

### Endpoints

#### Get Current Weather
```http
GET /weather/current
```

**Response:**
```json
{
  "success": true,
  "data": {
    "temperature": 22,
    "condition": "sunny",
    "humidity": 65,
    "wind_speed": 10,
    "location": "New York, NY"
  }
}
```

---

## Database Functions

### Overview
Custom database functions for complex operations.

### Functions

#### Notification Management
```sql
-- Get user notifications with retention
get_user_notifications_with_retention(
  user_id UUID,
  limit_count INT DEFAULT 20,
  offset_count INT DEFAULT 0,
  unread_only BOOLEAN DEFAULT FALSE
)

-- Update notification status
update_notification_status(
  notification_id UUID,
  new_status TEXT
)

-- Cleanup expired notifications
cleanup_expired_notifications()
```

#### User Management
```sql
-- Create public user
create_public_user(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_avatar_url TEXT,
  user_google_id TEXT
)
```

#### Outfit Generation
```sql
-- Generate outfit suggestions
generate_outfit_suggestions(
  user_id UUID,
  occasion TEXT,
  weather_condition TEXT
)
```

---

## Error Codes & Rate Limits

### Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |

### Rate Limits

- **API Calls**: 1000 requests per hour per user
- **Image Uploads**: 10 uploads per minute per user
- **Search Queries**: 100 searches per minute per user
- **Friend Requests**: 50 requests per day per user

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

---

## API Versioning

**Current Version**: 2.0.0

**Versioning Strategy**:
- URL-based versioning: `/api/v2/`
- Header-based versioning: `API-Version: 2.0.0`
- Backward compatibility maintained for 6 months

---

## SDK and Client Libraries

### JavaScript/TypeScript
```javascript
import { StyleSnapClient } from '@stylesnap/client'

const client = new StyleSnapClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.stylesnap.com'
})

// Get closet items
const items = await client.closet.getItems()

// Generate outfit
const outfit = await client.outfits.generate({
  occasion: 'casual',
  weather: 'sunny'
})
```

### Python
```python
from stylesnap import StyleSnapClient

client = StyleSnapClient(api_key='your_api_key')

# Get closet items
items = client.closet.get_items()

# Generate outfit
outfit = client.outfits.generate(
    occasion='casual',
    weather='sunny'
)
```

---

## Webhooks

### Available Webhooks

- `user.created` - New user registered
- `item.added` - New item added to closet
- `outfit.generated` - New outfit generated
- `friend.requested` - Friend request sent
- `notification.created` - New notification created

### Webhook Payload

```json
{
  "event": "user.created",
  "timestamp": "2025-01-01T00:00:00Z",
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

This API guide provides comprehensive documentation for all StyleSnap APIs, making it easy for developers and LLM agents to understand and integrate with the platform.