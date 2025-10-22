# Friend Notifications System

## Overview

The Friend Notifications system provides real-time notifications for social interactions within StyleSnap, including friend requests, outfit sharing, and outfit suggestions.

## Features

### 1. Friend Request Notifications

**When it triggers:**
- When someone sends you a friend request
- When someone accepts your friend request

**Notification Types:**

#### Friend Request Received (`friend_request`)
```json
{
  "type": "friend_request",
  "title": "New Friend Request",
  "message": "{requester_name} sent you a friend request",
  "reference_id": "<friendship_id>"
}
```

**Actions available:**
- Accept request
- Reject request
- View profile

#### Friend Request Accepted (`friend_request_accepted`)
```json
{
  "type": "friend_request_accepted",
  "title": "Friend Request Accepted",
  "message": "{accepter_name} accepted your friend request",
  "reference_id": "<friendship_id>"
}
```

**Actions available:**
- View friend's profile
- View friend's closet

---

### 2. Outfit Sharing Notifications

**When it triggers:**
- When a friend shares an outfit with you

**Notification Type:**

#### Outfit Shared (`outfit_shared`)
```json
{
  "type": "outfit_shared",
  "title": "Outfit Shared",
  "message": "{sharer_name} shared an outfit with you",
  "reference_id": "<outfit_share_id>",
  "custom_message": "Optional personal message from friend"
}
```

**Actions available:**
- View shared outfit
- Mark as viewed
- Save to your outfits

---

### 3. Friend Outfit Suggestions

**When it triggers:**
- When a friend creates an outfit using items from your closet

**Notification Type:**

#### Friend Outfit Suggestion (`friend_outfit_suggestion`)
```json
{
  "type": "friend_outfit_suggestion",
  "title": "Outfit Suggestion",
  "message": "{suggester_name} created an outfit suggestion using your items",
  "reference_id": "<suggestion_id>"
}
```

**Actions available:**
- Approve suggestion (adds to your outfits)
- Reject suggestion
- View suggestion details

---

### 4. Outfit & Item Likes

**When it triggers:**
- When a friend likes your outfit
- When a friend likes an item in your closet

**Notification Types:**

#### Outfit Liked (`outfit_like`)
```json
{
  "type": "outfit_like",
  "title": "Outfit Liked",
  "message": "{liker_name} liked your outfit",
  "reference_id": "<outfit_id>"
}
```

#### Item Liked (`item_like`)
```json
{
  "type": "item_like",
  "title": "Item Liked",
  "message": "{liker_name} liked your closet item",
  "reference_id": "<item_id>"
}
```

---

## Database Schema

### Tables

#### `notifications`
```sql
- id: UUID
- recipient_id: UUID (who receives the notification)
- actor_id: UUID (who triggered the notification)
- type: TEXT (notification type)
- reference_id: UUID (ID of related entity)
- is_read: BOOLEAN
- custom_message: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- read_at: TIMESTAMPTZ
```

#### `outfit_shares`
```sql
- id: UUID
- outfit_id: UUID
- sharer_id: UUID (who shared)
- recipient_id: UUID (who received)
- message: TEXT (optional message)
- is_viewed: BOOLEAN
- viewed_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### `friend_outfit_suggestions`
```sql
- id: UUID
- owner_id: UUID (closet owner)
- suggester_id: UUID (who suggested)
- outfit_items: JSONB (array of items)
- message: TEXT (optional)
- status: TEXT (pending/approved/rejected)
- generated_outfit_id: UUID (if approved)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- responded_at: TIMESTAMPTZ
```

---

## API Functions

### Friend Request Management

#### Accept Friend Request
```javascript
const result = await notificationsService.acceptFriendRequest(friendshipId)
```

**SQL Function:** `accept_friend_request(p_friendship_id UUID)`

**Returns:** Boolean (success/failure)

**Side effects:**
- Updates friendship status to 'accepted'
- Creates `friend_request_accepted` notification for requester
- Marks original `friend_request` notification as read

---

#### Reject Friend Request
```javascript
const result = await notificationsService.rejectFriendRequest(friendshipId)
```

**SQL Function:** `reject_friend_request(p_friendship_id UUID)`

**Returns:** Boolean (success/failure)

**Side effects:**
- Updates friendship status to 'rejected'
- Marks original `friend_request` notification as read

---

### Outfit Sharing

#### Share Outfit with Friends
```javascript
const result = await notificationsService.shareOutfitWithFriends(
  outfitId,
  [friendId1, friendId2],
  'Check out this outfit!'
)
```

**SQL Function:** `share_outfit_with_friends(p_outfit_id UUID, p_recipient_ids UUID[], p_message TEXT)`

**Returns:** Array of results with success status for each recipient

**Validation:**
- Verifies outfit belongs to current user
- Checks friendship status for each recipient
- Prevents duplicate shares

**Side effects:**
- Creates `outfit_shares` record for each friend
- Triggers `outfit_shared` notification

---

#### Get Shared Outfits
```javascript
const sharedOutfits = await notificationsService.getSharedOutfits(limit, offset)
```

**SQL Function:** `get_shared_outfits(p_user_id UUID, p_limit INT, p_offset INT)`

**Returns:** Array of shared outfits with sharer details

---

#### Mark Outfit Share as Viewed
```javascript
const result = await notificationsService.markOutfitShareViewed(shareId)
```

**SQL Function:** `mark_outfit_share_viewed(p_share_id UUID)`

**Returns:** Boolean (success/failure)

---

## Notification Preferences

Users can control which notifications they receive via the `notification_preferences` table:

```javascript
{
  push_enabled: true,
  friend_requests: true,           // ← Controls friend_request notifications
  friend_accepted: true,            // ← Controls friend_request_accepted
  outfit_likes: true,               // ← Controls outfit_like
  item_likes: true,                 // ← Controls item_like
  friend_outfit_suggestions: true,  // ← Controls friend_outfit_suggestion & outfit_shared
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00:00',
  quiet_hours_end: '08:00:00'
}
```

---

## Triggers

### Friend Request Notification Trigger
```sql
CREATE TRIGGER trigger_notify_friend_request
AFTER INSERT ON friends
FOR EACH ROW
EXECUTE FUNCTION create_friend_request_notification();
```

**Fires when:** New friend request is created (status = 'pending')

**Creates:** `friend_request` notification for receiver

---

### Friend Request Accepted Trigger
```sql
CREATE TRIGGER trigger_notify_friend_request_accepted
AFTER UPDATE ON friends
FOR EACH ROW
EXECUTE FUNCTION create_friend_request_accepted_notification();
```

**Fires when:** Friendship status changes from 'pending' to 'accepted'

**Creates:** `friend_request_accepted` notification for requester

**Also:**
- Marks original `friend_request` notification as read

---

### Outfit Shared Trigger
```sql
CREATE TRIGGER trigger_notify_outfit_shared
AFTER INSERT ON outfit_shares
FOR EACH ROW
EXECUTE FUNCTION create_outfit_shared_notification();
```

**Fires when:** Outfit is shared with a friend

**Creates:** `outfit_shared` notification for recipient

**Validation:** Verifies users are friends before creating notification

---

## Security (RLS Policies)

### Notifications
- ✅ Users can view their own notifications
- ✅ Users can update their own notifications (mark as read)
- ✅ Users can delete their own notifications

### Outfit Shares
- ✅ Users can view shares they received
- ✅ Users can view shares they sent
- ✅ Friends can share outfits with each other
- ✅ Users can update shares they received (mark as viewed)
- ✅ Users can delete shares they sent or received

### Friend Outfit Suggestions
- ✅ Users can view suggestions they received
- ✅ Users can view suggestions they created
- ✅ Friends can create outfit suggestions
- ✅ Users can update suggestions they received (approve/reject)

---

## Usage Examples

### Example 1: Accepting a Friend Request

```javascript
// In your notification handler
const handleNotificationAction = async (notification) => {
  if (notification.type === 'friend_request') {
    const result = await notificationsService.acceptFriendRequest(
      notification.reference_id
    )
    
    if (result.success) {
      console.log('Friend request accepted!')
      // Reload notifications
      await loadNotifications()
    }
  }
}
```

---

### Example 2: Sharing an Outfit

```javascript
// In your outfit page
const shareOutfit = async (outfitId) => {
  // Get user's friends
  const friends = await friendsService.getFriends()
  
  // Select friends to share with
  const selectedFriends = friends.filter(f => f.selected).map(f => f.id)
  
  // Share outfit
  const result = await notificationsService.shareOutfitWithFriends(
    outfitId,
    selectedFriends,
    'Check out this amazing outfit!'
  )
  
  if (result.success) {
    console.log('Outfit shared successfully!')
  }
}
```

---

### Example 3: Viewing Shared Outfits

```javascript
// Load shared outfits
const sharedOutfits = await notificationsService.getSharedOutfits(20, 0)

sharedOutfits.forEach(share => {
  console.log(`${share.sharer_username} shared: ${share.outfit_name}`)
  console.log(`Message: ${share.message}`)
  
  if (!share.is_viewed) {
    // Mark as viewed when user opens it
    await notificationsService.markOutfitShareViewed(share.share_id)
  }
})
```

---

## Migration

To enable these features, run the migration:

```bash
# Option 1: Using Node.js script
node scripts/run-friend-notifications-migration.js

# Option 2: Using psql
psql -h <host> -U postgres -d postgres -f database/migrations/027_friend_notifications.sql

# Option 3: Using Supabase Dashboard
# Copy contents of 027_friend_notifications.sql and run in SQL Editor
```

---

## Testing Checklist

- [ ] Send friend request → Verify notification appears
- [ ] Accept friend request → Verify both users get appropriate notifications
- [ ] Reject friend request → Verify notification is marked as read
- [ ] Share outfit with friend → Verify notification appears
- [ ] View shared outfit → Verify viewed status updates
- [ ] Create outfit suggestion → Verify notification appears
- [ ] Approve outfit suggestion → Verify outfit is added
- [ ] Like friend's outfit → Verify notification appears
- [ ] Like friend's item → Verify notification appears
- [ ] Test notification preferences → Verify filtering works
- [ ] Test quiet hours → Verify notifications are suppressed

---

## Troubleshooting

### Notifications not appearing

1. Check notification preferences:
   ```sql
   SELECT * FROM notification_preferences WHERE user_id = '<your_user_id>';
   ```

2. Verify triggers are enabled:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%notify%';
   ```

3. Check recent notifications:
   ```sql
   SELECT * FROM notifications WHERE recipient_id = '<your_user_id>' ORDER BY created_at DESC LIMIT 10;
   ```

### Friend request notifications not working

1. Verify friendship record was created:
   ```sql
   SELECT * FROM friends WHERE requester_id = '<user_id>' OR receiver_id = '<user_id>';
   ```

2. Check if trigger fired:
   ```sql
   SELECT * FROM notifications WHERE type = 'friend_request' AND recipient_id = '<user_id>';
   ```

---

## Future Enhancements

- [ ] Real-time notification delivery via WebSockets
- [ ] Push notifications for mobile devices
- [ ] Email notifications for important events
- [ ] Notification grouping (e.g., "3 friends liked your outfit")
- [ ] Notification sound effects
- [ ] Custom notification sounds per type
- [ ] Batch actions (mark all as read, delete all, etc.)
- [ ] Notification analytics (delivery rate, read rate, etc.)

