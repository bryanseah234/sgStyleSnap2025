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

- Responsive navigation bar
- Three primary tabs: My Closet, Friends, Suggestions
- **Settings Access:** Settings icon (gear/cog) in top-right of header on Closet page
- Active tab highlighting
- Mobile-optimized bottom nav

**Note:** Settings is NOT a tab in main nav, but accessible via icon on home page

---

### 2.2 AuthLayout.vue

**Requirements:**

- Centered content container
- StyleSnap mascot display
- App branding elements
- Clean, minimal design

---

## 3. Page Components

**Authentication: Google SSO Only**

All authentication pages use Google OAuth 2.0 exclusively:
- No email/password authentication
- No magic links or other auth methods  
- `/login` and `/register` pages both use `supabase.auth.signInWithOAuth({ provider: 'google' })`
- After successful authentication: Redirect to `/closet` (home page)
- User profile auto-created in database on first sign-in

---

### 3.1 Login.vue

**Requirements:**

- Uses AuthLayout wrapper
- **Google SSO Only:** Single "Sign in with Google" button (no email/password)
- Display app logo and mascot
- Handle OAuth redirect flow to Google
- Supabase Auth handles JWT storage securely
- Show loading state during authentication
- Redirect to `/closet` (home page) after successful login
- Link to Register page: "Don't have an account? Sign up"

**Implementation:**

```vue
<template>
  <AuthLayout>
    <div class="login-container">
      <img src="@/assets/logo.png" alt="StyleSnap" class="logo" />
      <h1>Welcome to StyleSnap</h1>
      <p>Sign in with your Google account to get started</p>
      
      <button 
        @click="signInWithGoogle" 
        :disabled="loading"
        class="google-signin-btn"
      >
        <img src="@/assets/google-icon.svg" alt="Google" />
        {{ loading ? 'Signing in...' : 'Sign in with Google' }}
      </button>
      
      <p class="register-link">
        Don't have an account? 
        <router-link to="/register">Sign up</router-link>
      </p>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/auth-service'
import AuthLayout from '@/components/layouts/AuthLayout.vue'

const router = useRouter()
const loading = ref(false)

async function signInWithGoogle() {
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/closet`
      }
    })
    
    if (error) throw error
    // OAuth flow will redirect to Google, then back to /closet
  } catch (error) {
    console.error('Login failed:', error)
    alert('Failed to sign in. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>
```

---

### 3.1b Register.vue

**Requirements:**

- Uses AuthLayout wrapper
- **Google SSO Only:** Single "Sign up with Google" button (no email/password)
- Display app logo and mascot
- Same Google OAuth flow as Login page
- Redirect to `/closet` (home page) after successful registration
- Link to Login page: "Already have an account? Sign in"
- User profile auto-created on first Google sign-in

**Implementation:**

```vue
<template>
  <AuthLayout>
    <div class="register-container">
      <img src="@/assets/logo.png" alt="StyleSnap" class="logo" />
      <h1>Join StyleSnap</h1>
      <p>Create your account with Google to start organizing your wardrobe</p>
      
      <button 
        @click="signUpWithGoogle" 
        :disabled="loading"
        class="google-signup-btn"
      >
        <img src="@/assets/google-icon.svg" alt="Google" />
        {{ loading ? 'Creating account...' : 'Sign up with Google' }}
      </button>
      
      <p class="login-link">
        Already have an account? 
        <router-link to="/login">Sign in</router-link>
      </p>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/auth-service'
import AuthLayout from '@/components/layouts/AuthLayout.vue'

const router = useRouter()
const loading = ref(false)

async function signUpWithGoogle() {
  loading.value = true
  try {
    // Same Google OAuth flow - Supabase handles new user creation
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/closet`
      }
    })
    
    if (error) throw error
    // OAuth flow will redirect to Google, then back to /closet
    // User record auto-created in users table via trigger
  } catch (error) {
    console.error('Registration failed:', error)
    alert('Failed to create account. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>
```

---

### 3.2 Closet.vue (Home Page)

**Requirements:**

- Uses MainLayout wrapper
- **Settings Icon:** Gear/cog icon in top-right header (navigates to `/settings`)
  - **Animation:** Rotate on hover (360deg), scale on click
- Integrates ClosetGrid component
- **Floating action button** (FAB) for adding items
  - **Animation:** Scale up on hover (1.1x), rotate 90deg, shadow expansion
  - **Animation:** Scale down on click (0.95x)
  - **Animation:** Bounce on page load
  - **Animation:** Pulse when quota near limit (45+/50)
- **Filter Controls:**
  - **Favorites toggle button** - Show only favorited items
    - **Animation:** Smooth color transition when toggled
    - **Animation:** Heart icon fills with bounce effect when activated
  - **Category dropdown** - Filter by category (dynamically populated from user's items)
    - **Animation:** Slide down with stagger on options
  - **Clothing type filter** - Specific type within category
  - **Privacy filter** - private/friends
  - **Clear filters button** - Reset all filters
    - **Animation:** Shake animation on hover
  - **Active filter indicators** - Show which filters are applied
    - **Animation:** Fade in with slide up
    - **Animation:** Scale in badges
- Item count with quota indicator
  - **Animation:** Progress bar fills smoothly
  - **Animation:** Warning pulse when near limit
- Search functionality
  - **Animation:** Search icon rotates while searching
  - **Animation:** Results fade in with stagger
- **Loading States:**
  - Skeleton loaders for grid items
  - Spinner overlay for full-page loads
  - Shimmer effect on placeholders

**Loading States:**

```vue
<template>
  <MainLayout>
    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <Spinner size="xl" color="primary" message="Loading your closet..." />
    </div>
    
    <!-- Skeleton loader for initial load -->
    <div v-if="initialLoading" class="closet-skeleton">
      <div class="grid grid-cols-3 md:grid-cols-4 gap-4">
        <Skeleton v-for="n in 12" :key="n" variant="rectangular" height="280px" rounded="lg" />
      </div>
    </div>
    
    <!-- Actual content -->
    <div v-else>
      <div class="closet-header">
        <h1 class="animate-fade-in">My Closet</h1>
        <button 
          @click="$router.push('/settings')" 
          class="settings-btn transition-all duration-300 hover:rotate-180 hover:scale-110 active:scale-95"
        >
          <SettingsIcon />
        </button>
      </div>
      <!-- Rest of closet content -->
    </div>
  </MainLayout>
</template>
```

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

**Friend Search Component:**

```vue
<!-- Secure friend search with debouncing -->
<template>
  <div class="friend-search">
    <input
      v-model="searchQuery"
      @input="debouncedSearch"
      type="text"
      placeholder="Search by name or email (min 3 characters)"
      :disabled="searching"
      minlength="3"
    />
    
    <div v-if="searchQuery.length > 0 && searchQuery.length < 3" class="hint">
      Type at least 3 characters to search
    </div>
    
    <div v-if="searching" class="loading">Searching...</div>
    
    <div v-if="searchResults.length > 0" class="results">
      <div v-for="user in searchResults" :key="user.id" class="user-card">
        <img :src="user.avatar_url" :alt="user.name" />
        <span>{{ user.name }}</span>
        
        <!-- Show appropriate button based on friendship status -->
        <button 
          v-if="user.friendship_status === 'none'"
          @click="sendRequest(user.id)"
          :disabled="sending"
        >
          Add Friend
        </button>
        <span v-else-if="user.friendship_status === 'pending_sent'">
          Request Sent
        </span>
        <button 
          v-else-if="user.friendship_status === 'pending_received'"
          @click="acceptRequest(user.id)"
        >
          Accept Request
        </button>
        <span v-else-if="user.friendship_status === 'accepted'">
          ✓ Friends
        </span>
      </div>
    </div>
    
    <div v-if="!searching && searchQuery.length >= 3 && searchResults.length === 0" class="no-results">
      No users found
    </div>
    
    <div v-if="rateLimited" class="error">
      Too many searches. Please wait a moment.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import friendsService from '@/services/friends-service';

const searchQuery = ref('');
const searchResults = ref([]);
const searching = ref(false);
const sending = ref(false);
const rateLimited = ref(false);

// Debounce search to prevent excessive API calls (500ms delay)
const debouncedSearch = useDebounceFn(async () => {
  if (searchQuery.value.length < 3) {
    searchResults.value = [];
    return;
  }
  
  searching.value = true;
  rateLimited.value = false;
  
  try {
    const results = await friendsService.searchUsers(searchQuery.value);
    searchResults.value = results.users;
  } catch (error) {
    if (error.response?.status === 429) {
      rateLimited.value = true;
    }
    console.error('Search failed:', error);
  } finally {
    searching.value = false;
  }
}, 500);

async function sendRequest(userId) {
  sending.value = true;
  try {
    await friendsService.sendRequest(userId);
    // Update local state
    const user = searchResults.value.find(u => u.id === userId);
    if (user) user.friendship_status = 'pending_sent';
  } catch (error) {
    console.error('Failed to send request:', error);
  } finally {
    sending.value = false;
  }
}
</script>
```

**Empty States:**

- **No Friends:** "You haven't added any friends yet. Search by name or email to get started!"
- **No Received Requests:** "No pending friend requests"
- **No Sent Requests:** "You haven't sent any friend requests"
- **Search No Results:** "No users found matching your search"
- **Search Too Short:** "Type at least 3 characters to search"

---

### 3.4 Settings.vue

**Requirements:**

- Uses MainLayout wrapper
- Accessible via settings icon on home page (`/closet`)
- Profile information display (read-only)
- Profile photo selection from 6 default avatars
- Theme toggle (future)
- Sign out button

**Profile Information Display:**

```vue
<template>
  <MainLayout>
    <div class="settings-container">
      <h1>Settings</h1>
      
      <!-- Profile Section -->
      <section class="profile-section">
        <h2>Profile</h2>
        
        <!-- Current Avatar Display -->
        <div class="current-avatar">
          <img :src="user.avatar_url" :alt="user.name" class="avatar-large" />
        </div>
        
        <!-- Profile Info (Read-Only) -->
        <div class="profile-info">
          <div class="info-field">
            <label>Username</label>
            <p class="read-only">{{ user.username }}</p>
            <small class="hint">Username cannot be changed</small>
          </div>
          
          <div class="info-field">
            <label>Name</label>
            <p class="read-only">{{ user.name }}</p>
            <small class="hint">Name from Google account</small>
          </div>
          
          <div class="info-field">
            <label>Email</label>
            <p class="read-only">{{ user.email }}</p>
            <small class="hint">Email from Google account</small>
          </div>
        </div>
      </section>
      
      <!-- Profile Photo Selection -->
      <section class="avatar-selection">
        <h2>Profile Photo</h2>
        <p>Choose from our default avatars</p>
        
        <div class="avatar-grid">
          <button
            v-for="avatar in defaultAvatars"
            :key="avatar.id"
            @click="selectAvatar(avatar.url)"
            :class="['avatar-option', { selected: user.avatar_url === avatar.url }]"
          >
            <img :src="avatar.url" :alt="avatar.name" />
            <CheckIcon v-if="user.avatar_url === avatar.url" class="selected-icon" />
          </button>
        </div>
        
        <!-- Future: Custom Upload -->
        <!-- <button @click="uploadCustomAvatar" class="upload-btn" disabled>
          <UploadIcon /> Upload Custom Photo (Coming Soon)
        </button> -->
      </section>
      
      <!-- Account Actions -->
      <section class="account-actions">
        <button @click="signOut" class="sign-out-btn">
          Sign Out
        </button>
      </section>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { updateUserAvatar } from '@/services/user-service'
import MainLayout from '@/components/layouts/MainLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

// 6 Default Avatar Options
// Avatars stored in /public/avatars/
const defaultAvatars = [
  { id: 1, name: 'Avatar 1', url: '/avatars/default-1.png' },
  { id: 2, name: 'Avatar 2', url: '/avatars/default-2.png' },
  { id: 3, name: 'Avatar 3', url: '/avatars/default-3.png' },
  { id: 4, name: 'Avatar 4', url: '/avatars/default-4.png' },
  { id: 5, name: 'Avatar 5', url: '/avatars/default-5.png' },
  { id: 6, name: 'Avatar 6', url: '/avatars/default-6.png' }
]

async function selectAvatar(avatarUrl) {
  try {
    await updateUserAvatar(user.value.id, avatarUrl)
    // Update local state
    authStore.updateUser({ avatar_url: avatarUrl })
  } catch (error) {
    console.error('Failed to update avatar:', error)
    alert('Failed to update profile photo. Please try again.')
  }
}

async function signOut() {
  if (confirm('Are you sure you want to sign out?')) {
    await authStore.signOut()
    router.push('/login')
  }
}

// Future: Custom avatar upload
// async function uploadCustomAvatar() {
//   // TODO: Implement Cloudinary upload for custom avatars
//   // Similar to clothes image upload flow
//   // Store in /avatars/ folder in Cloudinary
// }
</script>

<style scoped>
.avatar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.avatar-option {
  position: relative;
  border: 3px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-option.selected {
  border-color: #4f46e5;
}

.avatar-option img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.selected-icon {
  position: absolute;
  top: 0;
  right: 0;
  background: #4f46e5;
  color: white;
  border-radius: 50%;
  padding: 0.25rem;
}

.read-only {
  font-weight: 500;
  color: #1f2937;
  margin: 0.25rem 0;
}

.hint {
  color: #6b7280;
  font-size: 0.875rem;
}
</style>
```

**Username Generation Rules:**

- **Username:** Automatically generated from email address (part before @)
  - Example: `john.doe@gmail.com` → username: `john.doe`
  - Cannot be changed by user (immutable)
  - Displayed in settings but not editable

- **Name:** Full name from Google OAuth (first + last name)
  - Pulled from Google account during sign-in
  - Cannot be changed in app (immutable)
  - Display only

- **Email:** From Google OAuth
  - Cannot be changed (immutable)
  - Display only

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
- **Item Card Animations:**
  - **Entrance:** Staggered fade-in + slide up (100ms delay per card)
  - **Hover:** Scale up (1.05x) + translate up (-8px) + shadow expansion
  - **Hover Image:** Scale up (1.1x) with overflow hidden
  - **Hover Overlay:** Fade in dark overlay (20% opacity)
  - **Click:** Scale down briefly (0.98x) then navigate
- **Favorite toggle button** on each item card (heart icon)
  - Filled heart for favorited items
  - Outlined heart for non-favorited items
  - Click to toggle favorite status
  - Positioned in top-right corner of card
  - Optimistic UI update (immediate visual feedback)
  - **Animations:**
    - **Hidden state:** Scale 0 when not favorite, scale 100 on card hover
    - **Visible state:** Scale 100 always when favorited
    - **Toggle animation:** Bounce effect (3 bounces) when favorited
    - **Unfavorite:** Scale down to 0 when unfavorited
    - **Hover heart:** Scale 1.25x on heart hover
- **Filter integration:**
  - Favorites filter (show only favorited items)
  - Category filter (top, bottom, outerwear, shoes, accessory)
  - Clothing type filter
  - Privacy filter
- **Item click → detail modal** (ItemDetailModal component)
- Empty states:
  - No items yet (first time user)
  - No favorites (when favorites filter active)
  - No results (when filters applied)

---

### 5.2 ItemDetailModal.vue

**Purpose:** Display detailed information and statistics for a clothing item

**Props:**
- `item` - Item object with full details and statistics
- `isOpen` - Boolean to control modal visibility

**Events:**
- `close` - Emitted when modal is closed
- `favorite-toggle` - Emitted when favorite status is toggled
- `delete` - Emitted when delete button is clicked
- `edit` - Emitted when edit button is clicked

**Features:**

**Main Image Display:**
- Full resolution image (image_url)
- Zoom on click/tap
- Swipe gestures on mobile

**Item Information:**
- **Name** - Item name (editable via edit button)
- **Category** - Display category with icon
- **Brand** - Brand name (if provided)
- **Size** - Size information (if provided)
- **Color** - Color detection result (if available)
- **Privacy** - Privacy level (private/friends) with icon
- **Style Tags** - Array of tags as chips/badges
- **Favorite Status** - Heart icon (clickable to toggle)

**Statistics Section:**

```vue
<template>
  <div class="item-statistics">
    <h3>Statistics</h3>
    
    <div class="stat-grid">
      <!-- Days in Closet -->
      <div class="stat-item">
        <CalendarIcon class="stat-icon" />
        <div class="stat-content">
          <p class="stat-label">In Your Closet</p>
          <p class="stat-value">{{ statistics.days_in_closet }} days</p>
          <p class="stat-sublabel">Added {{ formatDate(item.created_at) }}</p>
        </div>
      </div>
      
      <!-- Favorite Status -->
      <div class="stat-item">
        <HeartIcon :class="{ 'filled': item.is_favorite }" class="stat-icon" />
        <div class="stat-content">
          <p class="stat-label">Favorite</p>
          <p class="stat-value">{{ item.is_favorite ? 'Yes' : 'No' }}</p>
          <button @click="toggleFavorite" class="stat-action">
            {{ item.is_favorite ? 'Unfavorite' : 'Add to Favorites' }}
          </button>
        </div>
      </div>
      
      <!-- Category -->
      <div class="stat-item">
        <CategoryIcon class="stat-icon" />
        <div class="stat-content">
          <p class="stat-label">Category</p>
          <p class="stat-value">{{ getCategoryLabel(item.category) }}</p>
          <p class="stat-sublabel">{{ item.clothing_type || 'No specific type' }}</p>
        </div>
      </div>
      
      <!-- Color -->
      <div class="stat-item" v-if="item.color">
        <div class="stat-icon color-swatch" :style="{ backgroundColor: item.color }"></div>
        <div class="stat-content">
          <p class="stat-label">Detected Color</p>
          <p class="stat-value">{{ item.color }}</p>
        </div>
      </div>
      
      <!-- Times Worn -->
      <div class="stat-item">
        <OutfitIcon class="stat-icon" />
        <div class="stat-content">
          <p class="stat-label">Times Worn</p>
          <p class="stat-value">{{ statistics.times_worn || 0 }} times</p>
          <p class="stat-sublabel" v-if="statistics.last_worn">
            Last worn {{ formatDate(statistics.last_worn) }}
          </p>
          <p class="stat-sublabel" v-else>Never worn yet</p>
        </div>
      </div>
      
      <!-- In Outfits -->
      <div class="stat-item">
        <CollectionIcon class="stat-icon" />
        <div class="stat-content">
          <p class="stat-label">In Outfits</p>
          <p class="stat-value">{{ statistics.in_outfits || 0 }} outfits</p>
          <p class="stat-sublabel">Outfit combinations</p>
        </div>
      </div>
      
      <!-- Times Shared -->
      <div class="stat-item">
        <ShareIcon class="stat-icon" />
        <div class="stat-content">
          <p class="stat-label">Shared with Friends</p>
          <p class="stat-value">{{ statistics.times_shared || 0 }} times</p>
        </div>
      </div>
      
      <!-- Last Updated -->
      <div class="stat-item">
        <ClockIcon class="stat-icon" />
        <div class="stat-content">
          <p class="stat-label">Last Updated</p>
          <p class="stat-value">{{ formatDate(item.updated_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatDistanceToNow, format } from 'date-fns';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'favorite-toggle', 'delete', 'edit']);

const statistics = computed(() => props.item.statistics || {});

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

function toggleFavorite() {
  emit('favorite-toggle', props.item.id, !props.item.is_favorite);
}

function handleDelete() {
  if (confirm('Are you sure you want to delete this item?')) {
    emit('delete', props.item.id);
  }
}

function handleEdit() {
  emit('edit', props.item);
}
</script>
```

**Action Buttons:**
- **Favorite/Unfavorite** - Toggle favorite status
- **Edit** - Open edit form
- **Delete** - Delete item with confirmation
- **Share** - Share item with friends
- **Close** - Close modal

**Animations:**

- **Modal entrance:** Fade in overlay (0.3s) + slide up content (0.3s ease-out)
- **Modal exit:** Fade out overlay + slide down content
- **Image zoom:** Scale transform on click/tap with smooth transition
- **Favorite toggle:** Heart scale + bounce animation when clicked
- **Statistics grid:** Staggered fade-in for each stat item (50ms delay per item)
- **Action buttons:** Scale on hover (1.05x), scale on click (0.95x)
- **Delete confirmation:** Shake animation on delete button
- **Success actions:** Checkmark animation after save/update

**Styling:**
- Full-screen modal on mobile
- Centered modal on desktop (max-width: 800px)
- Smooth animations (300ms ease-out standard)
- Responsive grid for statistics (2 cols mobile, 3-4 cols desktop)
- Icon + text for each statistic
- Color-coded for visual hierarchy
- Backdrop blur effect on overlay

**Services Used:**
- `clothes-service.js`
  - `getItemDetails(id)` - Fetch item with statistics
  - `toggleFavorite(id, isFavorite)` - Toggle favorite
  - `deleteItem(id)` - Delete item

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

- Image selection: Device-specific (Desktop/laptop = file upload only, Mobile/tablet = camera + file upload)
- CLIENT-SIDE RESIZE to max 1080px
- Target < 1MB file size
- Required fields with validation
- Optional fields in collapsible section
- Upload progress with percentage
- Auto color detection using k-means clustering

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