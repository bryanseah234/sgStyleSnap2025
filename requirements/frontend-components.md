# Frontend Components Requirements

## 1. Design System & Theming

### 1.1 Design Tokens Structure

```javascript
// /src/config/theme.js
export const theme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      // ... shades up to 900
    },
    secondary: {
      50: '#fdf4ff',
      // ... shades up to 900
    },
    neutral: {
      50: '#f8fafc',
      // ... shades up to 900
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  typography: {
    font_family: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'monospace']
    },
    font_size: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  }
};
```

---

### 1.2 Icon Mapping System

```javascript
// /src/config/icons.js
export const icons = {
  add: 'plus-circle',
  edit: 'pencil',
  delete: 'trash',
  close: 'x',
  menu: 'menu',
  search: 'search',
  filter: 'filter',
  camera: 'camera',
  gallery: 'photo',
  user: 'user',
  friends: 'users',
  closet: 'hanger',
  suggestion: 'lightbulb'
};
```

---

## 2. Core Layout Components

### 2.1 MainLayout.vue

**Requirements:**

- Persistent bottom navigation bar (mobile)
- Side navigation (desktop)
- Three primary tabs: My Closet, Friends, Profile
- Notification badge indicator
- Theme toggle button
- Responsive breakpoint handling

---

### 2.2 AuthLayout.vue

**Requirements:**

- Centered content container
- StyleSnap mascot display
- App branding elements
- Clean, minimal design

---

## 3. Page Components

### 3.1 Login.vue

**Requirements:**

- Uses AuthLayout wrapper
- Single "Sign in with Google" button
- Display app logo and mascot
- Handle OAuth redirect flow
- Store JWT securely
- Show loading state during authentication

---

### 3.2 Closet.vue

**Requirements:**

- Uses MainLayout wrapper
- Integrates ClosetGrid component
- Floating action button for adding items
- Category filter controls
- Item count with quota indicator
- Search functionality

---

### 3.3 Friends.vue

**Requirements:**

- Uses MainLayout wrapper
- Tab navigation for Friends/Requests
- Search bar with email validation
- Friend list with status indicators
- Pending request badges

**ISSUE #31 FIX: Enhanced Request Management in FriendsList**

**Tab Structure:**

```javascript
const tabs = [
  { name: 'Friends', count: friendsCount },
  { name: 'Received', count: receivedRequestsCount, badge: true },
  { name: 'Sent', count: sentRequestsCount }
];
```

**Received Requests Tab:**

```vue
<template>
  <div v-for="request in receivedRequests" :key="request.id" class="request-card">
    <UserAvatar :user="request.requester" />
    <div class="request-info">
      <p class="name">{{ request.requester.name }}</p>
      <p class="email">{{ request.requester.email }}</p>
      <p class="time">{{ timeAgo(request.created_at) }}</p>
    </div>
    <div class="actions">
      <Button
        variant="primary"
        @click="acceptRequest(request.id)"
        :loading="acceptLoading[request.id]"
      >
        Accept
      </Button>
      <Button
        variant="outline"
        @click="rejectRequest(request.id)"
        :loading="rejectLoading[request.id]"
      >
        Decline
      </Button>
    </div>
  </div>
</template>
```

**Sent Requests Tab:**

```vue
<template>
  <div v-for="request in sentRequests" :key="request.id" class="request-card">
    <UserAvatar :user="request.receiver" />
    <div class="request-info">
      <p class="name">{{ request.receiver.name }}</p>
      <p class="status pending">Pending</p>
      <p class="time">Sent {{ timeAgo(request.created_at) }}</p>
    </div>
    <Button
      variant="ghost"
      @click="cancelRequest(request.id)"
      :loading="cancelLoading[request.id]"
    >
      Cancel
    </Button>
  </div>
</template>
```

**Request Actions:**

```javascript
// Accept friend request
async function acceptRequest(requestId) {
  acceptLoading.value[requestId] = true;
  try {
    await friendsService.acceptRequest(requestId);
    // Optimistic update: move to friends list immediately
    const request = receivedRequests.value.find(r => r.id === requestId);
    friends.value.push({
      id: requestId,
      user: request.requester,
      status: 'accepted'
    });
    receivedRequests.value = receivedRequests.value.filter(r => r.id !== requestId);
    showNotification('Friend request accepted!', 'success');
  } catch (error) {
    showNotification('Failed to accept request', 'error');
  } finally {
    acceptLoading.value[requestId] = false;
  }
}

// Reject friend request
async function rejectRequest(requestId) {
  rejectLoading.value[requestId] = true;
  try {
    await friendsService.rejectRequest(requestId);
    receivedRequests.value = receivedRequests.value.filter(r => r.id !== requestId);
    showNotification('Friend request declined', 'info');
  } catch (error) {
    showNotification('Failed to decline request', 'error');
  } finally {
    rejectLoading.value[requestId] = false;
  }
}

// Cancel sent request
async function cancelRequest(requestId) {
  cancelLoading.value[requestId] = true;
  try {
    await friendsService.cancelRequest(requestId);
    sentRequests.value = sentRequests.value.filter(r => r.id !== requestId);
    showNotification('Friend request cancelled', 'info');
  } catch (error) {
    showNotification('Failed to cancel request', 'error');
  } finally {
    cancelLoading.value[requestId] = false;
  }
}
```

**Status Indicators:**

- **Pending (Received):** Yellow badge with "New" label
- **Pending (Sent):** Gray badge with "Pending" label
- **Accepted:** Green checkmark icon
- **Rejected:** Not shown (removed from list)

**Real-Time Updates:**

```javascript
// Poll for new requests every 30 seconds
const pollInterval = setInterval(async () => {
  const newRequests = await friendsService.getReceivedRequests();
  if (newRequests.length > receivedRequests.value.length) {
    // New request received - show notification
    showNotification('You have a new friend request!', 'info');
    playNotificationSound();
  }
  receivedRequests.value = newRequests;
}, 30000);

onUnmounted(() => clearInterval(pollInterval));
```

**Empty States:**

- **No Friends:** "You haven't added any friends yet. Search by email to get started!"
- **No Received Requests:** "No pending friend requests"
- **No Sent Requests:** "You haven't sent any friend requests"

---

### 3.4 Profile.vue

**Requirements:**

- Uses MainLayout wrapper
- User avatar and name display
- Quota usage visualization
- Theme toggle
- Settings links
- Sign out button

---

## 4. Reusable UI Components (/components/ui/)

### 4.1 Button.vue

**Props:**

- `variant`: primary, secondary, outline, ghost
- `size`: sm, md, lg
- `loading`: Boolean
- `disabled`: Boolean

---

### 4.2 Modal.vue

**Props:**

- `is_open`: Boolean
- `title`: String
- `size`: sm, md, lg

---

### 4.3 FormInput.vue

**Props:**

- `type`: text, email, password
- `label`: String
- `error`: String
- `required`: Boolean

---

### 4.4 Select.vue

**Props:**

- `options`: Array
- `value`: Any
- `placeholder`: String

---

### 4.5 Notification.vue

**Props:**

- `type`: success, warning, error, info
- `message`: String
- `duration`: Number

---

### 4.6 Badge.vue

**Props:**

- `count`: Number
- `variant`: default, secondary, destructive

---

### 4.7 Skeleton.vue

**Props:**

- `height`: String
- `width`: String
- `variant`: text, circular, rectangular

---

## 5. Feature-Specific Components

### 5.1 ClosetGrid.vue

**Requirements:**

- Responsive grid (3 cols mobile, 4-6 desktop)
- Lazy loading with Intersection Observer
- Category filter integration
- Item click → detail modal
- Empty state with illustration

**ISSUE #30 FIX: Virtual Scrolling & Lazy Loading Implementation**

**Virtual Scrolling for Large Closets:**

```javascript
// Use vue-virtual-scroller for performance with 200+ items
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

// Component setup
<RecycleScroller
  :items="clothingItems"
  :item-size="280"
  key-field="id"
  :buffer="300"
  class="closet-grid"
>
  <template #default="{ item }">
    <ClothingCard :item="item" />
  </template>
</RecycleScroller>
```

**Lazy Image Loading:**

```javascript
// Use Intersection Observer for image lazy loading
const imageObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src; // Load actual image
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  },
  { rootMargin: '50px' } // Load images 50px before they enter viewport
);

// In ClothingCard component
<img
  :data-src="item.thumbnail_url"
  src="/placeholder.jpg"
  :alt="item.name"
  @load="onImageLoad"
  ref="imageRef"
/>
```

**Progressive Loading Strategy:**

1. **Initial Load:** Load first 20 items immediately
2. **Scroll-Based:** Load next 20 items when user scrolls to 80% of current content
3. **Skeleton States:** Show skeleton cards while loading
4. **Thumbnail Priority:** Load thumbnails first, full image on click

**Skeleton Loading State:**

```vue
<div v-if="loading" class="grid grid-cols-3 md:grid-cols-4 gap-4">
  <Skeleton
    v-for="n in 12"
    :key="n"
    height="280px"
    variant="rectangular"
  />
</div>
```

**Performance Optimizations:**

- Debounce category filter changes (300ms)
- Throttle scroll events (16ms - 60fps)
- Use `v-memo` for item cards to prevent unnecessary re-renders
- Implement infinite scroll pagination (20 items per page)
- Cache loaded images in memory

**Memory Management:**

```javascript
// Unload images far from viewport to save memory
const UNLOAD_THRESHOLD = 1000; // px from viewport

const memoryObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        const img = entry.target;
        // Replace with thumbnail after scrolling far away
        if (img.src !== img.dataset.thumbnail) {
          img.src = img.dataset.thumbnail;
        }
      }
    });
  },
  { rootMargin: `${UNLOAD_THRESHOLD}px` }
);
```

---

### 5.2 AddItemForm.vue

**CRITICAL Requirements:**

- Image selection (camera/gallery)
- CLIENT-SIDE RESIZE to max 1080px
- Target < 1MB file size
- Required fields with validation
- Optional fields in collapsible section
- Upload progress with percentage

**ISSUE #28 FIX: Client-Side Image Compression Implementation**

**Library Choice:**

```javascript
// Use browser-image-compression library
import imageCompression from 'browser-image-compression';
```

**Compression Configuration:**

```javascript
const compressionOptions = {
  maxSizeMB: 1,              // Target file size < 1MB
  maxWidthOrHeight: 1080,    // Max dimension 1080px
  useWebWorker: true,        // Offload to Web Worker for performance
  fileType: 'image/jpeg',    // Convert to JPEG for better compression
  initialQuality: 0.8        // Start with 80% quality
};

async function compressImage(file) {
  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    return compressedFile;
  } catch (error) {
    console.error('Compression failed:', error);
    throw new Error('Failed to compress image. Please try a different image.');
  }
}
```

**Progress Tracking:**

```javascript
const compressionOptions = {
  // ... other options
  onProgress: (progress) => {
    // progress is a number between 0 and 100
    compressionProgress.value = progress;
  }
};
```

**Error Handling:**

- Handle file type errors (only JPEG, PNG, WebP)
- Handle file size errors (original > 10MB)
- Handle browser compatibility issues
- Provide fallback for older browsers
- Show clear error messages to users

**UI Flow:**

1. User selects image from camera/gallery
2. Show immediate preview of original image
3. Display "Compressing..." progress bar (0-100%)
4. Show compressed file size vs original size
5. Enable upload button only after successful compression
6. Handle upload with separate progress indicator

---

### 5.3 SuggestionCanvas.vue

**CRITICAL Requirements:**

- Split view layout: items panel + canvas drop zone
- Drag-and-drop with vue-draggable
- Touch gesture support
- Visual feedback for drag operations
- Message input (100 char limit)
- Undo/redo functionality

**ISSUE #29 FIX: Canvas State Persistence & Recovery**

**Unsaved Work Detection:**

```javascript
// Track if canvas has unsaved changes
const hasUnsavedChanges = computed(() => {
  return canvasItems.value.length > 0 || message.value.length > 0;
});

// Warn user before leaving
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges.value) {
    const confirmed = window.confirm(
      'You have unsaved changes. Are you sure you want to leave?'
    );
    if (confirmed) next();
    else next(false);
  } else {
    next();
  }
});
```

**Auto-Save to LocalStorage:**

```javascript
// Save draft every 5 seconds
const STORAGE_KEY = 'suggestion_draft';

watchEffect(() => {
  if (hasUnsavedChanges.value) {
    const draft = {
      toUserId: props.friendId,
      items: canvasItems.value.map(item => item.id),
      message: message.value,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }
});

// Clear draft on successful send
function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}
```

**Restore Draft on Mount:**

```javascript
onMounted(() => {
  const savedDraft = localStorage.getItem(STORAGE_KEY);
  if (savedDraft) {
    const draft = JSON.parse(savedDraft);
    
    // Check if draft is for current friend and < 24 hours old
    if (draft.toUserId === props.friendId && 
        Date.now() - draft.timestamp < 86400000) {
      
      // Show restore dialog
      showRestoreDialog.value = true;
      pendingDraft.value = draft;
    } else {
      // Clear old/invalid draft
      localStorage.removeItem(STORAGE_KEY);
    }
  }
});
```

**Restore Dialog:**

- Show modal: "You have an unsaved suggestion. Would you like to restore it?"
- Buttons: "Restore" | "Discard" | "Cancel"
- On Restore: Load items and message from draft
- On Discard: Clear localStorage and start fresh
- On Cancel: Go back to previous page

**Browser Refresh Handling:**

```javascript
// Warn before page refresh/close
window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault();
    e.returnValue = ''; // Chrome requires returnValue to be set
  }
});
```

**Related Tasks:** [TASK: 03-closet-crud-image-management#3.3], [TASK: 05-suggestion-system#5.2]

---

## 6. Error Handling & Resilience

### 6.1 Error Boundaries

**ISSUE #32 FIX: Vue Error Boundary Implementation**

**Global Error Handler:**

```javascript
// In main.js
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err);
  console.error('Component:', instance);
  console.error('Error info:', info);
  
  // Send to error tracking service
  if (import.meta.env.PROD) {
    errorTrackingService.captureException(err, {
      component: instance?.$options?.name,
      info
    });
  }
  
  // Show user-friendly error notification
  notificationStore.error('Something went wrong. Please refresh the page.');
};
```

**Component-Level Error Boundaries:**

```vue
<!-- ErrorBoundary.vue -->
<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <h2>Oops! Something went wrong</h2>
      <p>{{ userFriendlyMessage }}</p>
      <div class="error-actions">
        <Button @click="retry">Try Again</Button>
        <Button variant="outline" @click="goHome">Go to Home</Button>
      </div>
      <details v-if="showDetails">
        <summary>Technical Details</summary>
        <pre>{{ error.stack }}</pre>
      </details>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';

const error = ref(null);
const showDetails = import.meta.env.DEV;

onErrorCaptured((err, instance, info) => {
  error.value = err;
  console.error('Error boundary caught:', err);
  return false; // Prevent error from propagating
});

function retry() {
  error.value = null;
}

function goHome() {
  router.push('/');
}
</script>
```

**Usage in Critical Components:**

```vue
<template>
  <ErrorBoundary>
    <ClosetGrid :items="items" />
  </ErrorBoundary>
  
  <ErrorBoundary>
    <SuggestionCanvas :friendId="friendId" />
  </ErrorBoundary>
</template>
```

**Error Recovery Strategies:**

1. **Network Errors:** Show retry button with exponential backoff
2. **Validation Errors:** Highlight problematic fields with clear messages
3. **Permission Errors:** Redirect to appropriate page with explanation
4. **Unexpected Errors:** Show generic error with option to refresh or go home

---

### 6.2 Loading States

**ISSUE #33 FIX: Comprehensive Loading State Patterns**

**Skeleton Screens:**

```vue
<!-- SkeletonCard.vue -->
<template>
  <div class="skeleton-card animate-pulse">
    <div class="skeleton-image bg-gray-300 h-64 w-full rounded-t"></div>
    <div class="skeleton-content p-4">
      <div class="skeleton-title bg-gray-300 h-4 w-3/4 rounded mb-2"></div>
      <div class="skeleton-text bg-gray-300 h-3 w-1/2 rounded"></div>
    </div>
  </div>
</template>
```

**Loading States by Component:**

**ClosetGrid Loading:**
```vue
<template>
  <div class="grid grid-cols-3 gap-4">
    <SkeletonCard v-for="n in 12" :key="n" v-if="loading" />
    <ClothingCard v-for="item in items" :key="item.id" v-else />
  </div>
</template>
```

**Button Loading States:**
```vue
<Button :loading="isSubmitting" :disabled="isSubmitting">
  <Spinner v-if="isSubmitting" class="mr-2" />
  {{ isSubmitting ? 'Saving...' : 'Save' }}
</Button>
```

**Progress Indicators:**

```vue
<!-- For uploads with known progress -->
<div class="upload-progress">
  <div class="progress-bar">
    <div 
      class="progress-fill"
      :style="{ width: `${uploadProgress}%` }"
    ></div>
  </div>
  <p class="progress-text">{{ uploadProgress }}% uploaded</p>
</div>

<!-- For indeterminate operations -->
<div class="loading-spinner">
  <Spinner size="lg" />
  <p>Loading your closet...</p>
</div>
```

**Suspense for Async Components:**

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <SkeletonLoader />
    </template>
  </Suspense>
</template>
```

---

### 6.3 Optimistic Updates

**ISSUE #34 FIX: Optimistic UI Update Patterns**

**Like/Unlike Item:**

```javascript
async function toggleLike(itemId) {
  const item = items.value.find(i => i.id === itemId);
  const wasLiked = item.isLiked;
  const previousLikeCount = item.likeCount;
  
  // Optimistic update
  item.isLiked = !wasLiked;
  item.likeCount += wasLiked ? -1 : 1;
  
  try {
    if (wasLiked) {
      await clothesService.unlikeItem(itemId);
    } else {
      await clothesService.likeItem(itemId);
    }
  } catch (error) {
    // Rollback on error
    item.isLiked = wasLiked;
    item.likeCount = previousLikeCount;
    showNotification('Failed to update like', 'error');
  }
}
```

**Add Item to Closet:**

```javascript
async function addItem(itemData) {
  // Generate temporary ID
  const tempId = `temp_${Date.now()}`;
  
  // Optimistic insert
  const optimisticItem = {
    ...itemData,
    id: tempId,
    isPending: true,
    created_at: new Date().toISOString()
  };
  items.value.unshift(optimisticItem);
  
  try {
    const newItem = await clothesService.createItem(itemData);
    
    // Replace temporary item with real one
    const index = items.value.findIndex(i => i.id === tempId);
    items.value[index] = newItem;
  } catch (error) {
    // Remove optimistic item on error
    items.value = items.value.filter(i => i.id !== tempId);
    showNotification('Failed to add item', 'error');
    throw error;
  }
}
```

**Accept Friend Request:**

```javascript
async function acceptFriendRequest(requestId) {
  const request = pendingRequests.value.find(r => r.id === requestId);
  
  // Optimistic update
  pendingRequests.value = pendingRequests.value.filter(r => r.id !== requestId);
  friends.value.push({
    id: requestId,
    user: request.requester,
    status: 'accepted',
    created_at: new Date().toISOString()
  });
  
  try {
    await friendsService.acceptRequest(requestId);
    showNotification(`You're now friends with ${request.requester.name}!`, 'success');
  } catch (error) {
    // Rollback on error
    friends.value = friends.value.filter(f => f.id !== requestId);
    pendingRequests.value.push(request);
    showNotification('Failed to accept friend request', 'error');
  }
}
```

**Conflict Resolution:**

```javascript
// Handle conflicts when optimistic update doesn't match server response
function reconcileServerState(optimisticItem, serverItem) {
  if (optimisticItem.updated_at < serverItem.updated_at) {
    // Server has newer data, use it
    return serverItem;
  } else if (hasConflict(optimisticItem, serverItem)) {
    // Show conflict resolution UI
    showConflictDialog(optimisticItem, serverItem);
    return null;
  } else {
    // No conflict, keep optimistic update
    return optimisticItem;
  }
}
```

**Visual Feedback for Pending Operations:**

```vue
<template>
  <div class="item-card" :class="{ 'is-pending': item.isPending }">
    <Spinner v-if="item.isPending" class="pending-indicator" />
    <!-- Item content -->
  </div>
</template>

<style>
.is-pending {
  opacity: 0.6;
  pointer-events: none;
}
</style>
```