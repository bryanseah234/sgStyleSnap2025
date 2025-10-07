# 🎨 Notification System - Visual Components Guide

## Component Hierarchy

```
MainLayout.vue (Navigation Bar)
├── 🔔 NotificationBadge (Red badge with count)
│
Notifications.vue (Page)
├── NotificationsList
│   ├── Tabs: "All" | "Unread"
│   ├── NotificationItem (Repeated for each notification)
│   │   ├── Actor Avatar
│   │   ├── Message Text
│   │   ├── Timestamp
│   │   ├── Type Icon
│   │   └── Preview (if applicable)
│   │
│   └── EmptyNotifications (When no notifications)
│
└── SuggestionApprovalCard (Modal)
    ├── Suggester Info
    ├── Message
    ├── Outfit Items Grid
    └── Approve/Reject Buttons
```

## 📱 Screen-by-Screen Breakdown

### 1. Navigation Bar (Bottom)
```
┌────────────────────────────────────────────┐
│  👔      🛍️      ✨      🔔       👥      │
│ Closet  Catalog  Suggest  [●3]  Friends  │
│                           ↑               │
│                      Badge shows          │
│                      unread count         │
└────────────────────────────────────────────┘
```

**Component**: `MainLayout.vue` (Updated)
**Features**:
- Bell icon with SVG
- NotificationBadge overlay showing "3" unread
- Pulses when new notification arrives
- Click navigates to `/notifications`

---

### 2. Notifications Page - Header
```
┌────────────────────────────────────────────┐
│  ← Notifications [●3]    Mark all as read  │
└────────────────────────────────────────────┘
```

**Component**: `Notifications.vue`
**Features**:
- Back button (mobile only)
- Page title with badge
- "Mark all as read" button (only visible when unread exist)

---

### 3. Notifications Page - Tabs
```
┌────────────────────────────────────────────┐
│  All                      Unread (3)       │
│  ────────────                              │
└────────────────────────────────────────────┘
```

**Component**: `NotificationsList.vue`
**Features**:
- "All" tab (active by default)
- "Unread" tab with count badge
- Active tab has blue underline
- Click to switch views

---

### 4. Notification Item - Friend Outfit Suggestion
```
┌────────────────────────────────────────────┐
│ ● 👤 Sarah Smith suggested an outfit for   │
│      you                                    │
│                                             │
│      ┌───────────────────────────────┐    │
│      │ ✨ New outfit suggestion      │    │
│      └───────────────────────────────┘    │
│                                             │
│      2 hours ago                      ✨   │
└────────────────────────────────────────────┘
```

**Component**: `NotificationItem.vue`
**Features**:
- Blue dot (●) for unread
- Avatar of actor (Sarah)
- Action text: "suggested an outfit for you"
- Preview box with sparkle icon
- Timestamp: "2 hours ago"
- Type icon on right (sparkle)
- Blue background tint for unread
- Click opens `SuggestionApprovalCard` modal

---

### 5. Notification Item - Item Like
```
┌────────────────────────────────────────────┐
│   👤 Alex Johnson liked your item          │
│                                             │
│      ┌────┐                                │
│      │img │  (16x16 item thumbnail)        │
│      └────┘                                │
│                                             │
│      5 minutes ago                    ❤️   │
└────────────────────────────────────────────┘
```

**Component**: `NotificationItem.vue`
**Features**:
- No blue dot (already read)
- Actor name: "Alex Johnson"
- Action: "liked your item"
- Small item thumbnail preview
- Timestamp
- Red heart icon on right
- Click navigates to `/closet?item=<id>`

---

### 6. Notification Item - Outfit Like
```
┌────────────────────────────────────────────┐
│ ● 👤 Mike Davis liked your outfit          │
│                                             │
│      ┌────┐                                │
│      │img │  (16x16 outfit thumbnail)      │
│      └────┘                                │
│                                             │
│      1 day ago                        ❤️   │
└────────────────────────────────────────────┘
```

**Component**: `NotificationItem.vue`
**Features**:
- Blue dot (unread)
- Actor: "Mike Davis"
- Action: "liked your outfit"
- Outfit thumbnail
- Timestamp
- Heart icon
- Click navigates to `/outfits/<id>`

---

### 7. Empty State - No Notifications
```
┌────────────────────────────────────────────┐
│                                             │
│              🔔                             │
│         (large bell icon)                   │
│                                             │
│     No notifications yet                    │
│                                             │
│     When your friends interact with your    │
│     outfits and items, you'll see          │
│     notifications here.                     │
│                                             │
└────────────────────────────────────────────┘
```

**Component**: `EmptyNotifications.vue`
**Features**:
- Large bell icon (24x24)
- Title: "No notifications yet"
- Friendly description
- Optional action button slot
- Centered layout

---

### 8. Empty State - All Caught Up
```
┌────────────────────────────────────────────┐
│                                             │
│              🔔                             │
│                                             │
│         All caught up!                      │
│                                             │
│     You're all up to date. No unread       │
│     notifications.                          │
│                                             │
└────────────────────────────────────────────┘
```

**Component**: `EmptyNotifications.vue` (Unread tab)
**Features**:
- Same layout as empty state
- Different message for "Unread" tab
- Positive messaging

---

### 9. Suggestion Approval Modal
```
┌────────────────────────────────────────────┐
│  👤 Sarah Smith      Outfit Suggestion   ×  │
│     From Sarah Smith           2 hours ago  │
│                                             │
├─────────────────────────────────────────────┤
│  💬 "This would look amazing on you! The   │
│     colors match perfectly!"                │
├─────────────────────────────────────────────┤
│  Suggested Items (4)                        │
│                                             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐              │
│  │img │ │img │ │img │ │img │              │
│  │Shirt│ │Pants│ │Shoe │ │Hat  │             │
│  └────┘ └────┘ └────┘ └────┘              │
│                                             │
├─────────────────────────────────────────────┤
│  [   Decline   ]  [ Add to My Closet ]     │
└────────────────────────────────────────────┘
```

**Component**: `SuggestionApprovalCard.vue`
**Features**:
- Header with suggester info
- Close button (×)
- Message from suggester (if provided)
- Grid of suggested items (2-4 columns responsive)
- Item thumbnails with names
- Two action buttons:
  - "Decline" (gray outline)
  - "Add to My Closet" (blue solid)
- Loading state during processing

---

### 10. Item Like Button (in Closet)
```
┌────────────────┐
│   ┌────────┐   │
│   │  img   │   │  Item Card
│   │ Shirt  │   │
│   └────────┘   │
│   ❤️ 5         │  ← Like button + count
└────────────────┘
```

**Component**: `ItemLikeButton.vue`
**Features**:
- Heart icon (outline when not liked, filled when liked)
- Red color when liked, gray when not
- Like count next to heart
- Click to toggle like
- Shows "k" notation for 1000+ (e.g., "1.2k")
- Smooth animation on click
- Click count opens modal showing who liked

---

## 🎨 Color Scheme

### Notification States
- **Unread**: `bg-blue-50 dark:bg-blue-900/10` (light blue tint)
- **Read**: `bg-white dark:bg-gray-800` (normal background)
- **Hover**: `bg-gray-50 dark:bg-gray-800` (slight hover effect)

### Icons
- **Suggestion**: `text-indigo-600 dark:text-indigo-400` (purple-ish)
- **Like**: `text-red-500 dark:text-red-400` (red)
- **Unread Dot**: `bg-blue-500` (blue)

### Badge
- **Background**: `bg-red-500` (red)
- **Text**: `text-white`
- **Pulse Effect**: `animate-pulse` when new notifications

### Buttons
- **Primary (Approve)**: `bg-indigo-600 hover:bg-indigo-700` (blue)
- **Secondary (Decline)**: `border-gray-300 hover:bg-gray-100` (gray outline)
- **Mark as Read**: `text-indigo-600 hover:text-indigo-700` (text button)

---

## 📐 Responsive Breakpoints

### Mobile (< 640px)
- Nav icons smaller
- Single column notification list
- Full-screen approval modal
- Smaller item grid (2 columns)

### Tablet (640px - 1024px)
- Standard nav icons
- Full-width notification list
- Modal with padding
- Item grid (3 columns)

### Desktop (> 1024px)
- Standard nav icons
- Max-width container (1200px)
- Centered modal (max 600px width)
- Item grid (4 columns)

---

## ✨ Animations & Transitions

### Badge Pulse
```css
@keyframes pulse-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
```
Applied when new notification arrives.

### Notification Item Hover
```css
.notification-item:hover {
  background: linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.05), transparent);
}
```
Subtle blue gradient on hover.

### Heart Click Animation
```css
@keyframes heart-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```
Heart "beats" when clicked.

### Modal Entrance
```css
/* Fade in + scale up from 90% */
opacity: 0 → 1
transform: scale(0.9) translateY(20px) → scale(1) translateY(0)
```

---

## 🔄 State Management Flow

```
User Action (like/suggest/click)
         ↓
    Service Layer
         ↓
Supabase Database (with triggers)
         ↓
  Notification Created
         ↓
Real-time Subscription (WebSocket)
         ↓
  Notifications Store
         ↓
   Vue Reactivity
         ↓
  UI Updates (badge, list)
         ↓
Browser Notification (optional)
```

---

## 📊 Component Props & Events

### NotificationBadge.vue
**Props:**
- `count: Number` - Unread count
- `pulse: Boolean` - Enable pulse animation

### NotificationItem.vue
**Props:**
- `notification: Object` - Notification data
- `previewImage: String` - Optional preview image URL

**Events:**
- `click` - Emits notification object

### NotificationsList.vue
**Props:**
- `notifications: Array` - Array of notifications
- `unreadCount: Number` - Unread count for badge
- `loading: Boolean` - Show loading spinner
- `hasMore: Boolean` - Show "Load More" button

**Events:**
- `notification-click` - Emits notification
- `load-more` - Request more notifications

### SuggestionApprovalCard.vue
**Props:**
- `suggestion: Object` - Suggestion data

**Events:**
- `approve` - Emits suggestion ID
- `reject` - Emits suggestion ID

### ItemLikeButton.vue
**Props:**
- `itemId: String` - Item ID
- `isLiked: Boolean` - Current like state
- `likesCount: Number` - Total likes
- `showCount: Boolean` - Show like count

**Events:**
- `toggle-like` - Emits { itemId, currentlyLiked }
- `show-likers` - Opens likers modal

---

## 🎯 Accessibility Features

- ✅ Semantic HTML (`<nav>`, `<button>`, `<article>`)
- ✅ ARIA labels on icon buttons
- ✅ Keyboard navigation support
- ✅ Focus states on interactive elements
- ✅ Color contrast meets WCAG AA standards
- ✅ Screen reader friendly text
- ✅ Reduced motion support (disable animations if preferred)

---

## 📱 Mobile-Specific Features

1. **Pull to Refresh** (can be added)
2. **Swipe to Delete** (can be added)
3. **Haptic Feedback** (can be added)
4. **Bottom Sheet Modal** (instead of center modal on mobile)

---

This visual guide provides a complete overview of all UI components in the notification system!
