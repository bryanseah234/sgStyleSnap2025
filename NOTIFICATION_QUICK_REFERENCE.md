# 🔔 Notification System - Quick Reference Card

## 📂 File Locations

```
Components:
├── src/components/notifications/NotificationBadge.vue
├── src/components/notifications/NotificationItem.vue
├── src/components/notifications/NotificationsList.vue
├── src/components/notifications/EmptyNotifications.vue
├── src/components/social/SuggestionApprovalCard.vue
└── src/components/closet/ItemLikeButton.vue

Pages:
└── src/pages/Notifications.vue

Services:
├── src/services/notifications-service.js
├── src/services/friend-suggestions-service.js
└── src/services/likes-service.js

Stores:
└── src/stores/notifications-store.js

Database:
└── sql/009_notifications_system.sql

Router:
└── src/router.js (updated with /notifications route)

Layout:
└── src/components/layouts/MainLayout.vue (updated with bell icon)
```

## 🗄️ Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `notifications` | All notifications | recipient_id, actor_id, type, reference_id, is_read |
| `friend_outfit_suggestions` | Outfit suggestions from friends | owner_id, suggester_id, outfit_items (JSONB), status, message |
| `item_likes` | Likes on individual items | item_id, user_id, created_at |
| `shared_outfit_likes` | Likes on shared outfits | outfit_id, user_id, created_at |

## 🔔 Notification Types

| Type | Description | Reference ID |
|------|-------------|--------------|
| `friend_outfit_suggestion` | Friend suggests outfit | suggestion_id |
| `outfit_like` | Friend likes outfit | outfit_id |
| `item_like` | Friend likes item | item_id |

## 🔧 RPC Functions

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

## 🎨 Component Usage

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

## 💾 Store Usage

```javascript
import { useNotificationsStore } from './stores/notifications-store'

const store = useNotificationsStore()

// State
store.notifications        // Array of notifications
store.unreadCount         // Number
store.loading             // Boolean
store.hasUnread          // Boolean (getter)

// Actions
await store.initialize()                  // Initialize + start real-time
await store.markAsRead(notificationId)   // Mark single as read
await store.markAllAsRead()              // Mark all as read
await store.refresh()                    // Refresh notifications
await store.loadMore()                   // Load next page
```

## 🔌 Service Usage

### Notifications Service
```javascript
import { notificationsService } from './services/notifications-service'

// Fetch notifications
const data = await notificationsService.getNotifications({ 
  limit: 20, 
  offset: 0, 
  unreadOnly: false 
})

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
```javascript
import { friendSuggestionsService } from './services/friend-suggestions-service'

// Create suggestion
await friendSuggestionsService.createSuggestion({
  friendId: 'uuid',
  outfitItems: [
    { id: 'item1', name: 'Shirt', image_url: '...', category: 'Top' }
  ],
  message: 'This would look great!'
})

// Get received suggestions
const suggestions = await friendSuggestionsService.getReceivedSuggestions()

// Approve/Reject
await friendSuggestionsService.approveSuggestion(suggestionId)
await friendSuggestionsService.rejectSuggestion(suggestionId)
```

### Likes Service
```javascript
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

## 🚀 Quick Setup

```bash
# 1. Install dependencies (already done)
npm install

# 2. Run database migration
# Open Supabase SQL Editor → Execute sql/009_notifications_system.sql

# 3. Start dev server
npm run dev

# 4. Test in browser
# Navigate to app → Look for bell icon in nav bar
```

## 🧪 Quick Test

**Test Real-time:**
1. Open 2 browser windows
2. Login as User A (window 1)
3. Login as User B (window 2) - must be friends
4. Window 2: Like User A's item
5. Window 1: Watch bell badge update to "1" ✨

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Notifications not appearing | Run database migration, check real-time enabled in Supabase |
| Badge wrong count | Call `store.initialize()` in MainLayout |
| Real-time not working | Check WebSocket not blocked, verify Supabase connection |
| Approval fails | Verify RPC function exists, check suggestion status is 'pending' |
| Date errors | Ensure `date-fns` installed (`npm list date-fns`) |

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `NOTIFICATION_README.md` | Quick start guide |
| `NOTIFICATION_SYSTEM_SUMMARY.md` | Complete architecture overview |
| `NOTIFICATION_SETUP_GUIDE.md` | Installation & testing |
| `NOTIFICATION_INTEGRATION_CHECKLIST.md` | 20+ test cases |
| `NOTIFICATION_VISUAL_GUIDE.md` | UI component reference |
| `NOTIFICATION_IMPLEMENTATION_COMPLETE.md` | Final summary |
| `tasks/14-notification-system.md` | Technical specification |

## 🔐 Security Checklist

- ✅ RLS enabled on all tables
- ✅ Users can only see their own notifications
- ✅ Only friends can like items/outfits
- ✅ Cannot like own items
- ✅ Cannot suggest to self
- ✅ Friendship verified in triggers
- ✅ Ownership checked in RPC functions

## ⚡ Performance Tips

- ✅ Real-time uses WebSocket (not polling)
- ✅ Pagination: 20 per page (configurable)
- ✅ Denormalized counts on items/outfits
- ✅ Indexed foreign keys
- ✅ Filtered subscriptions at DB level
- ✅ Cached in Pinia store

## 🎯 Key Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/notifications` | Notifications.vue | Main notifications page |
| Navigation bar | MainLayout.vue | Bell icon with badge |

## 📱 Mobile Features

- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Touch-friendly tap targets
- ✅ Bottom navigation bar
- ✅ Swipe gestures (can be added)
- ✅ Pull to refresh (can be added)

## 🎨 Color Scheme

| Element | Color |
|---------|-------|
| Badge | `bg-red-500` |
| Unread notification | `bg-blue-50 dark:bg-blue-900/10` |
| Unread dot | `bg-blue-500` |
| Suggestion icon | `text-indigo-600` |
| Like icon | `text-red-500` |
| Primary button | `bg-indigo-600` |

## 🔄 Data Flow

```
User Action → Service → Database → Trigger → Notification Created
     ↓
Real-time Subscription (WebSocket)
     ↓
Store Updates → Vue Reactivity → UI Updates
```

## ✅ Complete Feature List

**Notification Management:**
- View all/unread
- Mark as read (single/all)
- Real-time updates
- Browser notifications
- Pagination

**Friend Suggestions:**
- Create suggestion
- Preview outfit
- Approve/Reject
- Auto-add to closet

**Likes:**
- Like items
- Like outfits
- View likers
- Like counts
- Friend-only

## 🎉 Status: COMPLETE ✅

All components built, integrated, and ready for testing!

---

**Need help?** Check the full documentation files listed above.
