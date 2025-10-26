# API Documentation

## Overview

StyleSnap 2025 uses Supabase as the backend service, providing a RESTful API with real-time capabilities. All API calls are made through Supabase client libraries with Row-Level Security (RLS) policies ensuring data privacy.

## Authentication

### Base Configuration
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
```

### Authentication Service

#### `signUp(email, password, userData)`
Creates a new user account.

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password (min 6 characters)
- `userData` (object): Additional user information
  - `username` (string): Unique username
  - `name` (string): Display name
  - `avatar_url` (string, optional): Profile image URL

**Returns:** Promise resolving to user object or error

**Example:**
```javascript
const authService = new AuthService()
const result = await authService.signUp(
  'user@example.com',
  'password123',
  {
    username: 'johndoe',
    name: 'John Doe'
  }
)
```

#### `signIn(email, password)`
Authenticates a user and creates a session.

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password

**Returns:** Promise resolving to session object or error

**Example:**
```javascript
const result = await authService.signIn('user@example.com', 'password123')
```

#### `signOut()`
Signs out the current user and clears the session.

**Returns:** Promise resolving to success/error

**Example:**
```javascript
await authService.signOut()
```

#### `getCurrentUser()`
Gets the currently authenticated user.

**Returns:** Promise resolving to user object or null

**Example:**
```javascript
const user = await authService.getCurrentUser()
```

## Clothes Management

### Clothes Service

#### `getClothes(userId)`
Retrieves all clothing items for a specific user.

**Parameters:**
- `userId` (string): UUID of the user

**Returns:** Promise resolving to array of clothing items

**Example:**
```javascript
const clothesService = new ClothesService()
const items = await clothesService.getClothes(userId)
```

**Response Format:**
```javascript
[
  {
    id: "uuid",
    user_id: "uuid",
    name: "Blue Jeans",
    brand: "Levi's",
    color: "Blue",
    category: "bottom",
    image_url: "https://...",
    is_favorite: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
]
```

#### `addClothingItem(itemData)`
Adds a new clothing item to the user's wardrobe.

**Parameters:**
- `itemData` (object): Clothing item information
  - `name` (string): Item name
  - `brand` (string, optional): Brand name
  - `color` (string, optional): Color description
  - `category` (string): Category (top, bottom, outerwear, shoes, hat)
  - `image_url` (string, optional): Image URL
  - `is_favorite` (boolean, optional): Favorite status

**Returns:** Promise resolving to created item or error

**Example:**
```javascript
const newItem = await clothesService.addClothingItem({
  name: "Red T-Shirt",
  brand: "Nike",
  color: "Red",
  category: "top",
  image_url: "https://cloudinary.com/image.jpg"
})
```

#### `updateClothingItem(itemId, updates)`
Updates an existing clothing item.

**Parameters:**
- `itemId` (string): UUID of the item to update
- `updates` (object): Fields to update

**Returns:** Promise resolving to updated item or error

**Example:**
```javascript
const updatedItem = await clothesService.updateClothingItem(itemId, {
  is_favorite: true,
  name: "Updated Item Name"
})
```

#### `deleteClothingItem(itemId)`
Removes a clothing item from the wardrobe.

**Parameters:**
- `itemId` (string): UUID of the item to delete

**Returns:** Promise resolving to success/error

**Example:**
```javascript
await clothesService.deleteClothingItem(itemId)
```

#### `toggleFavorite(itemId)`
Toggles the favorite status of a clothing item.

**Parameters:**
- `itemId` (string): UUID of the item

**Returns:** Promise resolving to updated item or error

**Example:**
```javascript
const updatedItem = await clothesService.toggleFavorite(itemId)
```

## Outfit Management

### Outfits Service

#### `getOutfits(userId)`
Retrieves all outfits for a specific user.

**Parameters:**
- `userId` (string): UUID of the user

**Returns:** Promise resolving to array of outfits

**Example:**
```javascript
const outfitsService = new OutfitsService()
const outfits = await outfitsService.getOutfits(userId)
```

**Response Format:**
```javascript
[
  {
    id: "uuid",
    user_id: "uuid",
    outfit_name: "Casual Friday",
    description: "Perfect for casual Friday at work",
    items: [
      {
        id: "uuid",
        name: "Blue Jeans",
        category: "bottom",
        image_url: "https://..."
      },
      {
        id: "uuid",
        name: "White Shirt",
        category: "top",
        image_url: "https://..."
      }
    ],
    is_favorite: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
]
```

#### `createOutfit(outfitData)`
Creates a new outfit combination.

**Parameters:**
- `outfitData` (object): Outfit information
  - `outfit_name` (string): Name of the outfit
  - `description` (string, optional): Outfit description
  - `items` (array): Array of clothing item IDs
  - `is_favorite` (boolean, optional): Favorite status

**Returns:** Promise resolving to created outfit or error

**Example:**
```javascript
const newOutfit = await outfitsService.createOutfit({
  outfit_name: "Summer Look",
  description: "Light and breezy for hot days",
  items: ["item-uuid-1", "item-uuid-2"],
  is_favorite: false
})
```

#### `updateOutfit(outfitId, updates)`
Updates an existing outfit.

**Parameters:**
- `outfitId` (string): UUID of the outfit to update
- `updates` (object): Fields to update

**Returns:** Promise resolving to updated outfit or error

**Example:**
```javascript
const updatedOutfit = await outfitsService.updateOutfit(outfitId, {
  outfit_name: "Updated Outfit Name",
  is_favorite: true
})
```

#### `deleteOutfit(outfitId)`
Removes an outfit from the collection.

**Parameters:**
- `outfitId` (string): UUID of the outfit to delete

**Returns:** Promise resolving to success/error

**Example:**
```javascript
await outfitsService.deleteOutfit(outfitId)
```

#### `toggleFavorite(outfitId)`
Toggles the favorite status of an outfit.

**Parameters:**
- `outfitId` (string): UUID of the outfit

**Returns:** Promise resolving to updated outfit or error

**Example:**
```javascript
const updatedOutfit = await outfitsService.toggleFavorite(outfitId)
```

## Friends & Social Features

### Friends Service

#### `getFriends(userId)`
Retrieves all friends for a specific user.

**Parameters:**
- `userId` (string): UUID of the user

**Returns:** Promise resolving to array of friends

**Example:**
```javascript
const friendsService = new FriendsService()
const friends = await friendsService.getFriends(userId)
```

**Response Format:**
```javascript
[
  {
    id: "uuid",
    user_id: "uuid",
    friend_id: "uuid",
    status: "accepted",
    created_at: "2024-01-01T00:00:00Z",
    friend: {
      id: "uuid",
      username: "johndoe",
      name: "John Doe",
      avatar_url: "https://..."
    }
  }
]
```

#### `sendFriendRequest(friendUsername)`
Sends a friend request to another user.

**Parameters:**
- `friendUsername` (string): Username of the user to add

**Returns:** Promise resolving to success/error

**Example:**
```javascript
await friendsService.sendFriendRequest("johndoe")
```

#### `acceptFriendRequest(requestId)`
Accepts a pending friend request.

**Parameters:**
- `requestId` (string): UUID of the friend request

**Returns:** Promise resolving to success/error

**Example:**
```javascript
await friendsService.acceptFriendRequest(requestId)
```

#### `rejectFriendRequest(requestId)`
Rejects a pending friend request.

**Parameters:**
- `requestId` (string): UUID of the friend request

**Returns:** Promise resolving to success/error

**Example:**
```javascript
await friendsService.rejectFriendRequest(requestId)
```

#### `getFriendRequests(userId)`
Retrieves pending friend requests for a user.

**Parameters:**
- `userId` (string): UUID of the user

**Returns:** Promise resolving to array of friend requests

**Example:**
```javascript
const requests = await friendsService.getFriendRequests(userId)
```

#### `getSentRequests(userId)`
Retrieves friend requests sent by the user.

**Parameters:**
- `userId` (string): UUID of the user

**Returns:** Promise resolving to array of sent requests

**Example:**
```javascript
const sentRequests = await friendsService.getSentRequests(userId)
```

#### `removeFriend(friendId)`
Removes a friend from the user's friend list.

**Parameters:**
- `friendId` (string): UUID of the friend to remove

**Returns:** Promise resolving to success/error

**Example:**
```javascript
await friendsService.removeFriend(friendId)
```

## Notifications

### Notifications Service

#### `getNotifications(filters)`
Retrieves notifications for the current user.

**Parameters:**
- `filters` (object, optional): Filter options
  - `limit` (number): Maximum number of notifications to return
  - `unread_only` (boolean): Only return unread notifications

**Returns:** Promise resolving to array of notifications

**Example:**
```javascript
const notificationsService = new NotificationsService()
const notifications = await notificationsService.getNotifications({
  limit: 10,
  unread_only: true
})
```

**Response Format:**
```javascript
[
  {
    id: "uuid",
    recipient_id: "uuid",
    actor_id: "uuid",
    type: "friend_request",
    reference_id: "uuid",
    custom_message: null,
    is_read: false,
    created_at: "2024-01-01T00:00:00Z",
    actor: {
      id: "uuid",
      username: "johndoe",
      name: "John Doe",
      avatar_url: "https://..."
    }
  }
]
```

#### `markAsRead(notificationId)`
Marks a specific notification as read.

**Parameters:**
- `notificationId` (string): UUID of the notification

**Returns:** Promise resolving to success/error

**Example:**
```javascript
await notificationsService.markAsRead(notificationId)
```

#### `markAllAsRead()`
Marks all notifications as read for the current user.

**Returns:** Promise resolving to success/error

**Example:**
```javascript
await notificationsService.markAllAsRead()
```

#### `deleteNotification(notificationId)`
Deletes a specific notification.

**Parameters:**
- `notificationId` (string): UUID of the notification

**Returns:** Promise resolving to success/error

**Example:**
```javascript
await notificationsService.deleteNotification(notificationId)
```

#### `getUnreadCount()`
Gets the count of unread notifications for the current user.

**Returns:** Promise resolving to number

**Example:**
```javascript
const count = await notificationsService.getUnreadCount()
```

#### `subscribe(callback)`
Subscribes to real-time notification updates.

**Parameters:**
- `callback` (function): Function to call when notifications change

**Returns:** Supabase realtime subscription

**Example:**
```javascript
const subscription = notificationsService.subscribe((payload) => {
  console.log('New notification:', payload)
})
```

## Real-time Subscriptions

### Clothes Updates
```javascript
const subscription = supabase
  .channel('clothes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'clothes',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Clothes updated:', payload)
  })
  .subscribe()
```

### Outfits Updates
```javascript
const subscription = supabase
  .channel('outfits')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'outfits',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Outfits updated:', payload)
  })
  .subscribe()
```

### Friends Updates
```javascript
const subscription = supabase
  .channel('friends')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'friends',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Friends updated:', payload)
  })
  .subscribe()
```

## Error Handling

### Common Error Types

#### Authentication Errors
```javascript
{
  code: 'auth/user-not-found',
  message: 'No user found with this email'
}
```

#### Permission Errors
```javascript
{
  code: '42501',
  message: 'new row violates row-level security policy'
}
```

#### Validation Errors
```javascript
{
  code: '23514',
  message: 'check constraint violation'
}
```

### Error Handling Pattern
```javascript
try {
  const result = await service.method()
  return result
} catch (error) {
  console.error('Service error:', error)
  
  if (error.code === 'auth/user-not-found') {
    // Handle authentication error
  } else if (error.code === '42501') {
    // Handle permission error
  } else {
    // Handle generic error
  }
  
  throw error
}
```

## Rate Limiting

Supabase has built-in rate limiting:
- **Free Tier**: 500 requests per hour
- **Pro Tier**: 100,000 requests per hour
- **Team Tier**: 1,000,000 requests per hour

## Security

### Row-Level Security (RLS)
All tables implement RLS policies to ensure users can only access their own data:

```sql
-- Example RLS policy for clothes table
CREATE POLICY "Users can only access their own clothes" ON clothes
  FOR ALL USING (auth.uid() = user_id);
```

### Authentication
- JWT tokens are used for authentication
- Tokens are automatically refreshed
- Sessions are managed by Supabase Auth

### Data Validation
- Database constraints ensure data integrity
- Input validation is performed on the client side
- Server-side validation through database schemas

## Testing

### Mock Data
For testing purposes, you can use the following mock data structures:

#### Mock Clothing Item
```javascript
const mockClothingItem = {
  id: "mock-uuid",
  user_id: "user-uuid",
  name: "Mock Item",
  brand: "Mock Brand",
  color: "Mock Color",
  category: "top",
  image_url: "https://example.com/image.jpg",
  is_favorite: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}
```

#### Mock Outfit
```javascript
const mockOutfit = {
  id: "mock-uuid",
  user_id: "user-uuid",
  outfit_name: "Mock Outfit",
  description: "Mock description",
  items: ["item-uuid-1", "item-uuid-2"],
  is_favorite: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}
```

---

This API documentation provides comprehensive information about all available endpoints and services in StyleSnap 2025. For additional support or questions, please refer to the main README.md file or create an issue in the repository.
