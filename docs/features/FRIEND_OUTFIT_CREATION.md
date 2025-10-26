# Friend Outfit Creation Feature

## Overview

The Friend Outfit Creation feature allows users to create outfit suggestions for their friends using items from the friend's closet. This helps friends inspire each other and collaborate on styling ideas.

---

## Route Information

**Path:** `/outfits/add/friend/:username`

**Component:** `OutfitCreator.vue`

**Sub-route:** `friend`

**Example:** `/outfits/add/friend/sarah_style`

---

## Features

### 1. Friend's Items Display
- ✅ **Dropdown Badge**: Shows "Friend's Items" with friend's username
- ✅ **Dynamic Title**: "Create Outfit for [friend username]"
- ✅ **Friend's Closet**: Sidebar displays friend's clothing items
- ✅ **Category Filters**: Filter friend's items by category

### 2. Canvas Interaction
- ✅ **Drag & Drop**: Drag friend's items onto canvas
- ✅ **Full Editing**: Scale, rotate, position, layer items
- ✅ **Undo/Redo**: Full history support
- ✅ **Visual Controls**: Same controls as personal outfit creation

### 3. Share Button
- ✅ **Dynamic Button**: "Share Outfit" instead of "Save Outfit"
- ✅ **Custom Message**: Optional message to friend
- ✅ **Notification Created**: Friend receives notification

### 4. Notification System
- ✅ **Notification Type**: `friend_outfit_suggestion`
- ✅ **Home Page Display**: Appears in notifications section
- ✅ **Accept/Reject**: Friend can approve or reject suggestion
- ✅ **Auto-Save on Approve**: Approved outfits added to friend's collection

---

## User Flow

```
User navigates to Friends page
  ↓
Clicks "Create Outfit" button on friend's profile
  ↓
Routes to /outfits/add/friend/:username
  ↓
Page loads friend's profile and closet items
  ↓
User sees friend's items in sidebar
  ↓
User drags items onto canvas
  ↓
User arranges, scales, rotates items
  ↓
User clicks "Share Outfit" button
  ↓
Prompted for optional message
  ↓
Outfit suggestion created in database
  ↓
Friend receives notification
  ↓
Friend can accept or reject in notifications
  ↓
If accepted, outfit added to friend's collection
```

---

## UI Components

### 1. Friend's Items Badge
```vue
<div class="flex items-center gap-2">
  <Users class="w-4 h-4" />
  <span>{{ friendProfile.username }}'s Items</span>
</div>
```

**Features:**
- Non-editable badge (not a dropdown)
- Shows friend's username
- Users icon for visual consistency

### 2. Items Sidebar
```vue
<h3>{{ friendProfile.username }}'s Closet</h3>
<span>{{ filteredItems.length }} items</span>
```

**Features:**
- Dynamic heading with friend's name
- Item counter
- Category filters
- Same layout as personal closet view

### 3. Share Button
```vue
<button @click="saveOutfit">
  <Save class="w-5 h-5" />
  <span>{{ saveButtonLabel }}</span> <!-- "Share Outfit" -->
</button>
```

**Features:**
- Same styling as Save button
- Different label based on route
- Disabled when canvas is empty

---

## Technical Implementation

### Data Flow

#### 1. Loading Friend Data
```javascript
// Load friend profile
const loadFriendProfile = async (username) => {
  const friend = await friendsService.getFriendByUsername(username)
  friendProfile.value = friend
}

// Load friend's items
const loadWardrobeItems = async () => {
  if (itemsSource.value === 'friends' && friendProfile.value) {
    const result = await clothesService.getClothes({
      owner_id: friendProfile.value.id,
      limit: 100
    })
    wardrobeItems.value = result.data
  }
}
```

#### 2. Sharing Outfit
```javascript
const shareOutfitWithFriend = async () => {
  const outfitItemsData = canvasItems.value.map(item => ({
    clothing_item_id: item.id.split('-')[0],
    position_x: item.x,
    position_y: item.y,
    z_index: item.zIndex,
    rotation: item.rotation,
    scale: item.scale
  }))
  
  await notificationsService.createFriendOutfitSuggestion(
    friendProfile.value.id,
    outfitItemsData,
    message
  )
}
```

#### 3. Creating Notification
```javascript
// In NotificationsService
async createFriendOutfitSuggestion(friendId, outfitItems, message) {
  const { data, error } = await supabase
    .from('friend_outfit_suggestions')
    .insert({
      owner_id: friendId,
      suggester_id: user.id,
      outfit_items: outfitItems,
      message: message,
      status: 'pending'
    })
  
  // Database trigger automatically creates notification
  return { success: true, data }
}
```

---

## Database Schema

### `friend_outfit_suggestions` Table
```sql
CREATE TABLE friend_outfit_suggestions (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL,           -- Friend who receives suggestion
  suggester_id UUID NOT NULL,       -- User who creates suggestion
  outfit_items JSONB NOT NULL,      -- Array of items with positions
  message TEXT,                      -- Optional message
  status TEXT DEFAULT 'pending',    -- pending/approved/rejected
  generated_outfit_id UUID,         -- If approved, references outfits(id)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ
)
```

### `outfit_items` JSONB Structure
```json
[
  {
    "clothing_item_id": "uuid-123",
    "position_x": 150,
    "position_y": 100,
    "z_index": 1,
    "rotation": 0,
    "scale": 1
  }
]
```

---

## Notification System

### Notification Creation

**Database Trigger:**
```sql
CREATE TRIGGER trigger_notify_friend_outfit_suggestion
AFTER INSERT ON friend_outfit_suggestions
FOR EACH ROW
EXECUTE FUNCTION create_friend_suggestion_notification();
```

**Function:**
```sql
CREATE FUNCTION create_friend_suggestion_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (recipient_id, actor_id, type, reference_id)
  VALUES (NEW.owner_id, NEW.suggester_id, 'friend_outfit_suggestion', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Notification Display (Home Page)

**Template:**
```javascript
{
  type: 'friend_outfit_suggestion',
  title: 'Outfit Suggestion',
  message: '{suggester_name} created an outfit suggestion using your items',
  icon: 'sparkles',
  action: 'View suggestion'
}
```

**Visual:**
- Sparkles icon
- Shows suggester's name
- Click to view/approve suggestion
- Unread indicator (blue dot)

---

## User Actions on Notification

### 1. View Suggestion
- Opens modal or page showing the outfit
- Displays all items on virtual canvas
- Shows suggester's message

### 2. Accept Suggestion
- Creates new outfit in user's collection
- Marks suggestion as 'approved'
- Marks notification as read
- Returns `generated_outfit_id`

**Database Function:**
```sql
CREATE FUNCTION approve_friend_outfit_suggestion(p_suggestion_id UUID)
RETURNS UUID -- Returns created outfit ID
```

### 3. Reject Suggestion
- Updates status to 'rejected'
- Marks notification as read
- Removes from suggestions list

**Database Function:**
```sql
CREATE FUNCTION reject_friend_outfit_suggestion(p_suggestion_id UUID)
RETURNS BOOLEAN -- Returns success
```

---

## Security & Permissions

### Row Level Security (RLS)

**Friend Outfit Suggestions:**
```sql
-- Users can view suggestions they received
CREATE POLICY "view_own_suggestions"
ON friend_outfit_suggestions FOR SELECT
USING (owner_id = auth.uid());

-- Users can view suggestions they created
CREATE POLICY "view_created_suggestions"
ON friend_outfit_suggestions FOR SELECT
USING (suggester_id = auth.uid());

-- Only friends can create suggestions
CREATE POLICY "create_friend_suggestions"
ON friend_outfit_suggestions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM friends
    WHERE status = 'accepted'
    AND ((requester_id = auth.uid() AND receiver_id = owner_id)
         OR (requester_id = owner_id AND receiver_id = auth.uid()))
  )
);
```

### Validation

**Backend Validation:**
1. ✅ Verify friendship exists
2. ✅ Verify clothing items belong to owner
3. ✅ Verify suggester has access to view items
4. ✅ Validate JSONB structure

---

## Code Structure

### Key Files

1. **`src/pages/OutfitCreator.vue`**
   - Main canvas component
   - Handles friend mode
   - Share outfit logic

2. **`src/services/notificationsService.js`**
   - `createFriendOutfitSuggestion()`
   - Creates suggestion and notification

3. **`src/services/friendsService.js`**
   - `getFriendByUsername()`
   - Fetches friend profile

4. **`src/services/clothesService.js`**
   - `getClothes({ owner_id })`
   - Fetches friend's items

5. **`src/pages/Home.vue`**
   - Displays notifications
   - Handles accept/reject actions

---

## Testing Checklist

### Setup
- [ ] Create two test user accounts
- [ ] Add them as friends
- [ ] Add clothing items to both accounts

### Creating Suggestion
- [ ] Navigate to friend's profile
- [ ] Click "Create Outfit"
- [ ] Verify friend's items load in sidebar
- [ ] Verify dropdown shows "Friend's Items"
- [ ] Verify title shows "Create Outfit for [friend]"
- [ ] Drag multiple items onto canvas
- [ ] Scale, rotate, position items
- [ ] Click "Share Outfit" button
- [ ] Add custom message
- [ ] Verify success message

### Receiving Notification
- [ ] Login as friend account
- [ ] Navigate to Home page
- [ ] Verify notification appears
- [ ] Verify notification shows suggester's name
- [ ] Verify unread indicator (blue dot)
- [ ] Click notification to view details

### Accepting Suggestion
- [ ] Click "Accept" on suggestion
- [ ] Verify outfit added to collection
- [ ] Navigate to /outfits page
- [ ] Verify new outfit appears
- [ ] Open outfit to verify items and positions

### Rejecting Suggestion
- [ ] Create another suggestion
- [ ] Click "Reject" on suggestion
- [ ] Verify suggestion removed from list
- [ ] Verify outfit NOT added to collection

---

## Error Handling

### Friend Not Found
```javascript
if (!friendProfile.value) {
  alert('Friend not found or no longer in your friends list')
  router.push('/friends')
}
```

### No Items in Friend's Closet
```javascript
if (wardrobeItems.value.length === 0) {
  // Show empty state
  "Your friend hasn't added any items to their closet yet"
}
```

### Not Friends
```javascript
// Backend validation will fail
// RLS policy prevents insert
"You must be friends to create outfit suggestions"
```

---

## Future Enhancements

### Phase 1: Enhanced UX
- [ ] Preview modal before sharing
- [ ] Outfit name suggestion field
- [ ] Occasion/weather tags
- [ ] Multiple message templates

### Phase 2: Collaboration
- [ ] Real-time co-editing
- [ ] Back-and-forth suggestions
- [ ] Comments on suggestions
- [ ] Suggestion threads

### Phase 3: Social Features
- [ ] Share suggestions publicly
- [ ] Vote on friend's suggestions
- [ ] "Styled by Friend" badge
- [ ] Friend collaboration leaderboard

### Phase 4: Advanced Features
- [ ] Suggest items friend should buy
- [ ] Mixed suggestions (friend's + user's items)
- [ ] AI-assisted friend suggestions
- [ ] Style profile matching

---

## Analytics Events

Track user engagement:

```javascript
// When outfit suggestion is shared
trackEvent('friend_outfit_suggested', {
  suggester_id: userId,
  recipient_id: friendId,
  num_items: canvasItems.length,
  has_message: !!message
})

// When suggestion is accepted
trackEvent('friend_outfit_accepted', {
  suggestion_id: suggestionId,
  suggester_id: suggesterId,
  recipient_id: userId,
  time_to_respond: responseTime
})

// When suggestion is rejected
trackEvent('friend_outfit_rejected', {
  suggestion_id: suggestionId,
  suggester_id: suggesterId,
  recipient_id: userId,
  time_to_respond: responseTime
})
```

---

## Troubleshooting

### Friend's items not loading
**Possible Causes:**
- Friend has privacy settings enabled
- Friendship not confirmed
- Database RLS policy issue

**Solution:**
- Check friendship status in database
- Verify RLS policies are enabled
- Check console for errors

### Share button not working
**Possible Causes:**
- Canvas empty
- Friend profile not loaded
- Network error

**Solution:**
- Verify canvasItems.value has items
- Check friendProfile.value is not null
- Check network tab for failed requests

### Notification not appearing
**Possible Causes:**
- Database trigger not fired
- Notification preferences disabled
- Page not refreshing

**Solution:**
- Check friend_outfit_suggestions table for new record
- Verify notification record created
- Check notification preferences
- Refresh home page

---

## Related Documentation

- [Outfit Creator Documentation](./OUTFIT_CREATOR.md)
- [Notifications System](./FRIEND_NOTIFICATIONS.md)
- [Friends System](./FRIENDS_SYSTEM.md)
- [Canvas Controls](./CANVAS_CONTROLS.md)

