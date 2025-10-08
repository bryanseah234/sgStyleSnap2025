# 🔔 Notification System Documentation

## Overview
A comprehensive, real-time notification system for StyleSnap that enables friend interactions including outfit suggestions, likes on outfits, and likes on individual closet items.

---

## Features
- Friend outfit suggestions (with approval workflow)
- Outfit likes and item likes (with real-time notifications)
- Real-time updates via Supabase subscriptions
- Notification badge with unread count and pulse
- Browser notifications (optional)
- Security: RLS, friendship validation, ownership checks
- Performance: indexed, paginated, denormalized counts

---

## File Structure
```
Components:
  src/components/notifications/NotificationBadge.vue
  src/components/notifications/NotificationItem.vue
  src/components/notifications/NotificationsList.vue
  src/components/notifications/EmptyNotifications.vue
  src/components/social/SuggestionApprovalCard.vue
  src/components/closet/ItemLikeButton.vue
Pages:
  src/pages/Notifications.vue
Services:
  src/services/notifications-service.js
  src/services/friend-suggestions-service.js
  src/services/likes-service.js
Stores:
  src/stores/notifications-store.js
Database:
  sql/009_notifications_system.sql
Router:
  src/router.js (with /notifications route)
Layout:
  src/components/layouts/MainLayout.vue (bell icon)
```

---

## Database Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| notifications | All notifications | recipient_id, actor_id, type, reference_id, is_read |
| friend_outfit_suggestions | Outfit suggestions from friends | owner_id, suggester_id, outfit_items (JSONB), status, message |
| item_likes | Likes on individual items | item_id, user_id, created_at |
| shared_outfit_likes | Likes on shared outfits | outfit_id, user_id, created_at |

---

## Notification Types
| Type | Description | Reference ID |
|------|-------------|--------------|
| friend_outfit_suggestion | Friend suggests outfit | suggestion_id |
| outfit_like | Friend likes outfit | outfit_id |
| item_like | Friend likes item | item_id |

---

## RPC Functions
```sql
-- Notifications
get_user_notifications(user_id, limit, offset)
mark_notification_read(notification_id)
mark_all_notifications_read(user_id)
get_unread_notification_count(user_id)
-- Suggestions
approve_friend_outfit_suggestion(suggestion_id)
reject_friend_outfit_suggestion(suggestion_id)
```

---

## Component Usage
### NotificationBadge
```vue
<NotificationBadge :count="5" :pulse="true" />
```
### NotificationsList
```vue
<NotificationsList
  :notifications="notifications"
  :unread-count="unreadCount"
  :loading="loading"
  :has-more="hasMore"
  @notification-click="handleClick"
  @load-more="loadMore"
/>
```
### ItemLikeButton
```vue
<ItemLikeButton
  :item-id="item.id"
  :is-liked="item.is_liked"
  :likes-count="item.likes_count"
  @toggle-like="handleToggleLike"
/>
```

---

## Store Usage
```js
import { useNotificationsStore } from './stores/notifications-store'
const store = useNotificationsStore()
// State
store.notifications        // Array of notifications
store.unreadCount         // Number
store.loading             // Boolean
store.hasUnread           // Boolean (getter)
// Actions
await store.initialize()                  // Initialize + start real-time
await store.markAsRead(notificationId)   // Mark single as read
await store.markAllAsRead()              // Mark all as read
await store.refresh()                    // Refresh notifications
await store.loadMore()                   // Load next page
```

---

## Service Usage
### Notifications Service
```js
import { notificationsService } from './services/notifications-service'
// Fetch notifications
const data = await notificationsService.getNotifications({ limit: 20, offset: 0, unreadOnly: false })
// Get unread count
const count = await notificationsService.getUnreadCount()
// Mark as read
await notificationsService.markAsRead(notificationId)
// Subscribe to real-time
const subscription = notificationsService.subscribeToNotifications(
  userId,
  (notification) => console.log('New:', notification)
)
```
### Friend Suggestions Service
```js
import { friendSuggestionsService } from './services/friend-suggestions-service'
// Create suggestion
await friendSuggestionsService.createSuggestion({
  friendId: 'uuid',
  outfitItems: [ { id: 'item1', name: 'Shirt', image_url: '...', category: 'Top' } ],
  message: 'This would look great!'
})
// Get received suggestions
const suggestions = await friendSuggestionsService.getReceivedSuggestions()
// Approve/Reject
await friendSuggestionsService.approveSuggestion(suggestionId)
await friendSuggestionsService.rejectSuggestion(suggestionId)
```
### Likes Service
```js
import { likesService } from './services/likes-service'
// Like item
await likesService.likeClosetItem(itemId)
// Unlike item
await likesService.unlikeClosetItem(itemId)
// Check if liked
const isLiked = await likesService.hasUserLikedClosetItem(itemId)
// Get likers
const likers = await likesService.getClosetItemLikers(itemId)
// Toggle like
await likesService.toggleClosetItemLike(itemId)
```

---

## Quick Setup
```bash
npm install
# Run database migration in Supabase SQL Editor: sql/009_notifications_system.sql
npm run dev
```

---

## Testing
- Open 2 browser windows, log in as 2 friends
- Like an item, see notification in real-time
- Test suggestion workflow (approve/reject)
- Test badge, mark as read, pagination

---

## Security Checklist
- RLS enabled on all tables
- Users can only see their own notifications
- Only friends can like items/outfits
- Cannot like own items
- Cannot suggest to self
- Friendship verified in triggers
- Ownership checked in RPC functions

---

## Performance Tips
- Real-time uses WebSocket (not polling)
- Pagination: 20 per page (configurable)
- Denormalized counts on items/outfits
- Indexed foreign keys
- Filtered subscriptions at DB level
- Cached in Pinia store

---

## Data Flow
```
User Action → Service → Database → Trigger → Notification Created
     ↓
Real-time Subscription (WebSocket)
     ↓
Store Updates → Vue Reactivity → UI Updates
```

---

## Complete Feature List
- View all/unread
- Mark as read (single/all)
- Real-time updates
- Browser notifications
- Pagination
- Create suggestion
- Preview outfit
- Approve/Reject
- Auto-add to closet
- Like items/outfits
- View likers
- Like counts
- Friend-only

---

## Visual Guide
- Bell icon in nav bar with badge
- Notifications page with tabs (All/Unread)
- Notification cards for suggestions, likes
- Suggestion approval modal
- Empty states for no notifications
- Responsive, touch-friendly, dark mode

---

## Status: COMPLETE
All components built, integrated, and ready for testing!

---

**For more details, see the technical spec in `tasks/14-notification-system.md`.**
