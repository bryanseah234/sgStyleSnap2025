# Code Standards & Documentation

## Table of Contents
1. [JSDoc Standards](#jsdoc-standards)
2. [Vue Component Documentation](#vue-component-documentation)
3. [Code Comments](#code-comments)
4. [Naming Conventions](#naming-conventions)
5. [File Organization](#file-organization)

---

## JSDoc Standards

### Function Documentation

All exported functions must have JSDoc comments:

```javascript
/**
 * Compresses an image file to meet size and dimension requirements.
 * Supports device-specific upload methods:
 * - Desktop/Laptop: File upload only (no camera access)
 * - Mobile/Tablet: File upload + camera capture via HTML capture attribute
 * 
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} [options.maxWidth=1080] - Maximum width in pixels
 * @param {number} [options.maxSizeMB=1] - Maximum file size in megabytes
 * @param {number} [options.quality=0.8] - JPEG quality (0-1)
 * @returns {Promise<File>} The compressed image file
 * @throws {Error} If file type is unsupported or compression fails
 * 
 * @example
 * const compressed = await compressImage(file, {
 *   maxWidth: 1080,
 *   maxSizeMB: 1,
 *   quality: 0.8
 * });
 */
export async function compressImage(file, options = {}) {
  // Implementation...
}
```

### API Service Documentation

```javascript
/**
 * Service for managing clothing items.
 * @module services/clothes-service
 */

/**
 * Fetches all clothing items for the authenticated user.
 * 
 * @async
 * @param {Object} filters - Filter options
 * @param {string[]} [filters.categories] - Filter by categories
 * @param {number} [filters.limit=20] - Items per page
 * @param {number} [filters.offset=0] - Number of items to skip
 * @returns {Promise<{items: ClothingItem[], count: number, total: number}>}
 * @throws {ApiError} When request fails or authentication is invalid
 * 
 * @example
 * const { items, total } = await clothesService.fetchItems({
 *   categories: ['top', 'bottom'],
 *   limit: 20
 * });
 */
export async function fetchItems(filters = {}) {
  // Implementation...
}
```

### Type Definitions

Use JSDoc for type definitions:

```javascript
/**
 * @typedef {Object} ClothingItem
 * @property {string} id - Unique identifier (UUID)
 * @property {string} owner_id - User ID of the owner
 * @property {string} name - Item name (max 255 chars)
 * @property {('top'|'bottom'|'outerwear'|'shoes'|'accessory')} category - Item category
 * @property {string} image_url - Cloudinary image URL (HTTPS)
 * @property {string} [thumbnail_url] - Cloudinary thumbnail URL
 * @property {string[]} [style_tags] - Style tags for filtering
 * @property {('private'|'friends')} privacy - Privacy level
 * @property {string} [size] - Clothing size
 * @property {string} [brand] - Brand name
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 * @property {string|null} removed_at - Soft delete timestamp
 */

/**
 * @typedef {Object} ApiError
 * @property {string} error - Human-readable error message
 * @property {string} code - Machine-readable error code
 * @property {Object} [details] - Additional error context
 * @property {string} timestamp - ISO timestamp
 */

/**
 * @typedef {Object} QuotaInfo
 * @property {number} used - Current item count
 * @property {number} limit - Maximum allowed uploads (50, catalog items unlimited)
 * @property {number} remaining - Items remaining before limit
 * @property {number} percentage - Usage percentage (0-100)
 */

/**
 * @typedef {Object} CatalogItem
 * @property {string} id - Unique identifier (UUID)
 * @property {string} name - Item name (max 255 chars)
 * @property {('top'|'bottom'|'outerwear'|'shoes'|'accessory')} category - Item category
 * @property {string} image_url - Cloudinary image URL (HTTPS)
 * @property {string} thumbnail_url - Cloudinary thumbnail URL
 * @property {string[]} [tags] - Search tags
 * @property {string} [brand] - Brand name
 * @property {string} [color] - Primary color
 * @property {string} [season] - Season (spring/summer/fall/winter/all-season)
 * @property {string[]} [style] - Style tags (casual/formal/sporty/etc)
 * @property {boolean} is_active - Whether item is active in catalog
 * @property {string} created_at - ISO timestamp
 * 
 * PRIVACY NOTE: CatalogItem has NO owner_id or user attribution.
 * All catalog items are displayed anonymously by design.
 * Users cannot determine who uploaded an item (admin or other users).
 */
```

### Utility Function Documentation

```javascript
/**
 * Calculates the number of days remaining in the 30-day recovery period.
 * 
 * @param {string|Date} removedAt - When the item was soft deleted
 * @returns {number} Days remaining (0 if expired)
 * 
 * @example
 * const days = getDaysRemaining('2025-10-01T12:00:00Z');
 * // Returns: 5 (if today is Oct 6)
 */
export function getDaysRemaining(removedAt) {
  const removed = new Date(removedAt);
  const daysSince = (Date.now() - removed.getTime()) / (1000 * 60 * 60 * 24);
  const remaining = 30 - Math.floor(daysSince);
  return Math.max(0, remaining);
}

/**
 * Validates a Cloudinary image URL.
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid Cloudinary URL
 * 
 * @example
 * isValidCloudinaryUrl('https://res.cloudinary.com/demo/image/upload/sample.jpg')
 * // Returns: true
 * 
 * isValidCloudinaryUrl('http://evil.com/fake.jpg')
 * // Returns: false
 */
export function isValidCloudinaryUrl(url) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && 
           urlObj.hostname.includes('cloudinary.com');
  } catch {
    return false;
  }
}
```

### Middleware Documentation

```javascript
/**
 * Middleware to check user's item quota before allowing new uploads.
 * Returns 403 if user has reached the 50 upload limit (catalog items don't count).
 * 
 * @middleware
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * 
 * @example
 * app.post('/api/clothes', 
 *   authenticate,
 *   checkQuotaMiddleware,
 *   handleCreateClothes
 * );
 */
export async function checkQuotaMiddleware(req, res, next) {
  // Implementation...
}
```

---

## Vue Component Documentation

### Component Header

Every Vue component should have a documentation block:

```vue
<!--
  @component ClosetGrid
  @description Displays user's clothing items in a responsive grid with virtual scrolling.
  Supports filtering, sorting, and lazy image loading for optimal performance.
  
  @example
  <ClosetGrid
    :items="clothingItems"
    :loading="isLoading"
    @item-click="handleItemClick"
    @item-delete="handleDelete"
  />
-->
<template>
  <!-- Component template -->
</template>
```

### Props Documentation

Document all props with JSDoc in script block:

```vue
<script setup>
import { computed } from 'vue';

/**
 * @typedef {Object} ClothingItem
 * @property {string} id
 * @property {string} name
 * @property {string} image_url
 * @property {string} category
 */

/**
 * Props for ClosetGrid component
 */
const props = defineProps({
  /**
   * Array of clothing items to display
   * @type {ClothingItem[]}
   */
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  
  /**
   * Whether items are currently loading
   */
  loading: {
    type: Boolean,
    default: false
  },
  
  /**
   * Selected category filter
   * @type {'all'|'top'|'bottom'|'outerwear'|'shoes'|'accessory'}
   */
  category: {
    type: String,
    default: 'all',
    validator: (value) => {
      return ['all', 'top', 'bottom', 'outerwear', 'shoes', 'accessory'].includes(value);
    }
  },
  
  /**
   * Number of columns in grid (responsive)
   */
  columns: {
    type: Number,
    default: 3,
    validator: (value) => value >= 1 && value <= 6
  }
});

/**
 * Emitted events
 */
const emit = defineEmits({
  /**
   * Emitted when user clicks an item
   * @param {ClothingItem} item - The clicked item
   */
  'item-click': (item) => item && typeof item.id === 'string',
  
  /**
   * Emitted when user deletes an item
   * @param {string} itemId - ID of item to delete
   */
  'item-delete': (itemId) => typeof itemId === 'string',
  
  /**
   * Emitted when user reaches end of list (for infinite scroll)
   */
  'load-more': null
});

/**
 * Computed property: filtered items based on category
 * @type {import('vue').ComputedRef<ClothingItem[]>}
 */
const filteredItems = computed(() => {
  if (props.category === 'all') return props.items;
  return props.items.filter(item => item.category === props.category);
});

/**
 * Handles item click event
 * @param {ClothingItem} item - The clicked item
 */
function handleItemClick(item) {
  emit('item-click', item);
}
</script>
```

### Composable Documentation

```javascript
/**
 * Composable for managing quota state and warnings.
 * 
 * @returns {Object} Quota management functions and reactive state
 * @returns {import('vue').Ref<QuotaInfo>} quota - Current quota information
 * @returns {import('vue').ComputedRef<boolean>} isNearLimit - True if at 90%+ capacity
 * @returns {import('vue').ComputedRef<boolean>} isAtLimit - True if at 100% capacity
 * @returns {Function} fetchQuota - Function to refresh quota data
 * @returns {Function} getWarningMessage - Get appropriate warning message
 * 
 * @example
 * const { quota, isNearLimit, fetchQuota } = useQuota();
 * 
 * onMounted(() => {
 *   fetchQuota();
 * });
 * 
 * watch(() => quota.value.used, (newValue) => {
 *   if (isNearLimit.value) {
 *     showWarning();
 *   }
 * });
 */
export function useQuota() {
  const quota = ref({ used: 0, limit: 50, remaining: 50, percentage: 0 }); // Upload quota
  
  const isNearLimit = computed(() => quota.value.percentage >= 90);
  const isAtLimit = computed(() => quota.value.used >= quota.value.limit);
  
  async function fetchQuota() {
    // Implementation...
  }
  
  function getWarningMessage() {
    // Implementation...
  }
  
  return {
    quota,
    isNearLimit,
    isAtLimit,
    fetchQuota,
    getWarningMessage
  };
}
```

---

## Code Comments

### When to Comment

**DO comment:**
- Complex business logic
- Non-obvious algorithms
- Security-sensitive code
- Performance optimizations
- Workarounds for bugs
- Public APIs and interfaces

**DON'T comment:**
- Obvious code (e.g., `// increment counter` above `counter++`)
- Redundant information already in function names
- Outdated or incorrect information

### Good Comment Examples

```javascript
// ✅ GOOD: Explains WHY, not WHAT
// Use exponential backoff to avoid overwhelming the API during network issues
const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);

// ✅ GOOD: Explains non-obvious business logic
// Users can only restore items within 30 days of deletion.
// After 30 days, items are permanently purged by the cleanup job.
if (daysSinceRemoval > 30) {
  return { error: 'Recovery period expired' };
}

// ✅ GOOD: Documents security consideration
// SECURITY: Always validate Cloudinary URLs to prevent injection attacks.
// Only allow HTTPS URLs from res.cloudinary.com domain.
if (!url.startsWith('https://res.cloudinary.com/')) {
  throw new Error('Invalid image URL');
}

// ✅ GOOD: Explains performance optimization
// Virtual scrolling is critical here because users can have up to 200 items.
// Rendering all at once would cause significant lag on mobile devices.
const virtualScrollConfig = {
  itemHeight: 250,
  buffer: 5
};
```

### Bad Comment Examples

```javascript
// ❌ BAD: States the obvious
// Set the name variable to the user's name
const name = user.name;

// ❌ BAD: Outdated comment (no longer accurate)
// TODO: Add validation here (actually, validation was added 3 months ago)
validateInput(data);

// ❌ BAD: Commented-out code without explanation
// const oldMethod = () => {
//   doSomething();
// };

// ❌ BAD: Redundant with function name
// Function to calculate total
function calculateTotal() {
  // Calculate the total and return it
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### TODO Comments

Use standardized TODO format:

```javascript
// TODO: Implement image caching strategy (Issue #42)
// TODO: Add retry logic for failed uploads (Priority: High)
// FIXME: Memory leak in subscription cleanup (Bug #123)
// HACK: Temporary workaround for Safari bug, remove when iOS 18 is released
// NOTE: This assumes UTC timezone - may need localization later
```

---

## Naming Conventions

### JavaScript/TypeScript

```javascript
// ✅ Variables and Functions: camelCase
const userProfile = {};
function fetchUserData() {}

// ✅ Classes and Components: PascalCase
class ClothingItem {}
class UserService {}

// ✅ Constants: UPPER_SNAKE_CASE
const MAX_ITEMS = 200;
const API_BASE_URL = 'https://api.stylesnap.com';

// ✅ Private properties: prefix with _
class Service {
  _cache = new Map();
  _refreshToken = null;
}

// ✅ Boolean variables: use is/has/can prefix
const isLoading = false;
const hasPermission = true;
const canEdit = false;
```

### Vue Components

```javascript
// ✅ Component files: PascalCase
ClosetGrid.vue
QuotaIndicator.vue
FriendsList.vue

// ✅ Component names in usage: PascalCase
<ClosetGrid :items="items" />

// ✅ Props: camelCase
defineProps({
  itemCount: Number,
  isLoading: Boolean
});

// ✅ Events: kebab-case
emit('item-deleted', id);
emit('quota-exceeded');

// ✅ Slots: kebab-case
<template #header-content>
```

### CSS

```css
/* ✅ Classes: kebab-case with BEM */
.closet-grid {}
.closet-grid__item {}
.closet-grid__item--selected {}

/* ✅ Utility classes: descriptive */
.text-center {}
.mt-4 {}
.flex-column {}
```

### SQL

```sql
-- ✅ Tables: snake_case, plural
CREATE TABLE clothing_items ();
CREATE TABLE friend_requests ();

-- ✅ Columns: snake_case
owner_id UUID
created_at TIMESTAMPTZ
removed_at TIMESTAMPTZ

-- ✅ Indexes: idx_table_columns
CREATE INDEX idx_clothes_user_active ON clothes(owner_id, removed_at);

-- ✅ Functions: snake_case, verb_noun
CREATE FUNCTION check_item_quota()
CREATE FUNCTION get_friend_closet()
```

### Files

```
✅ JavaScript/Vue: kebab-case
closet-grid.vue
clothes-service.js
quota-calculator.js

✅ Documentation: UPPER_CASE or PascalCase
README.md
CONTRIBUTING.md
API_REFERENCE.md

✅ Configuration: lowercase or kebab-case
package.json
vite.config.js
.env.example
```

---

## File Organization

### Service Files

```javascript
// services/clothes-service.js

/**
 * Service for managing clothing items
 * @module services/clothes-service
 */

import api from './api';

// ==========================================
// Type Definitions
// ==========================================

/** @typedef {import('../types').ClothingItem} ClothingItem */

// ==========================================
// Constants
// ==========================================

const BASE_URL = '/api/clothes';
const MAX_ITEMS = 200;

// ==========================================
// Public API
// ==========================================

export async function fetchItems(filters = {}) {
  // Implementation
}

export async function createItem(data) {
  // Implementation
}

// ==========================================
// Private Helpers
// ==========================================

function validateItemData(data) {
  // Implementation
}

function transformResponse(data) {
  // Implementation
}
```

### Component Files

```vue
<!-- components/closet/ClosetGrid.vue -->

<!-- Component documentation at top -->
<!--
  @component ClosetGrid
  @description ...
-->

<template>
  <!-- Template organized by sections -->
  <div class="closet-grid">
    <!-- Header section -->
    <header>...</header>
    
    <!-- Main content -->
    <main>...</main>
    
    <!-- Footer section -->
    <footer>...</footer>
  </div>
</template>

<script setup>
// ==========================================
// Imports
// ==========================================
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// ==========================================
// Props & Emits
// ==========================================
const props = defineProps({...});
const emit = defineEmits([...]);

// ==========================================
// Composables
// ==========================================
const route = useRoute();
const router = useRouter();
const { quota, fetchQuota } = useQuota();

// ==========================================
// Reactive State
// ==========================================
const items = ref([]);
const loading = ref(false);
const selectedId = ref(null);

// ==========================================
// Computed Properties
// ==========================================
const filteredItems = computed(() => {...});
const hasMore = computed(() => {...});

// ==========================================
// Watchers
// ==========================================
watch(() => props.category, (newCategory) => {...});

// ==========================================
// Methods
// ==========================================
function handleItemClick(item) {...}
async function deleteItem(id) {...}

// ==========================================
// Lifecycle Hooks
// ==========================================
onMounted(() => {
  fetchItems();
});
</script>

<style scoped>
/* Component-specific styles */
.closet-grid {
  /* Layout styles */
}

.closet-grid__item {
  /* Item styles */
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .closet-grid {
    /* Mobile styles */
  }
}
</style>
```

### Utility Files

```javascript
// utils/quota-calculator.js

/**
 * Utility functions for quota calculations
 * @module utils/quota-calculator
 */

// ==========================================
// Constants
// ==========================================

export const QUOTA_LIMIT = 50; // Upload limit (catalog items don't count)
export const WARNING_THRESHOLD = 0.9; // 90%
export const CRITICAL_THRESHOLD = 0.95; // 95%

// ==========================================
// Functions
// ==========================================

/**
 * Calculates quota percentage
 */
export function calculatePercentage(used, limit = QUOTA_LIMIT) {
  return Math.round((used / limit) * 100 * 10) / 10;
}

/**
 * Determines if quota is near limit
 */
export function isNearLimit(percentage) {
  return percentage >= WARNING_THRESHOLD * 100;
}

/**
 * Gets appropriate warning message
 */
export function getWarningMessage(percentage) {
  if (percentage >= 100) {
    return 'Limit reached - remove items to add new ones';
  }
  if (percentage >= CRITICAL_THRESHOLD * 100) {
    return 'Nearly full - remove items soon';
  }
  if (percentage >= WARNING_THRESHOLD * 100) {
    return `You're at ${percentage}% capacity`;
  }
  return null;
}
```

---

## Documentation Checklist

### For Every New Function
- [ ] JSDoc comment with description
- [ ] Parameter types and descriptions
- [ ] Return type and description
- [ ] Example usage
- [ ] Error conditions documented

### For Every Component
- [ ] Component description comment
- [ ] All props documented with types
- [ ] All emitted events documented
- [ ] Slots documented (if any)
- [ ] Usage example provided

### For Every API Endpoint
- [ ] Request format documented
- [ ] Response format documented
- [ ] Error responses listed
- [ ] Business logic explained
- [ ] Example request/response

### For Every Module
- [ ] Module-level JSDoc comment
- [ ] Exported functions documented
- [ ] Type definitions provided
- [ ] Constants explained
- [ ] Dependencies noted

---

## Tools & Automation

### Generate Documentation

```bash
# Generate JSDoc HTML documentation
npm run docs:generate

# This runs:
jsdoc -c jsdoc.json -r src/
```

### Linting

```bash
# ESLint checks for missing JSDoc
npm run lint

# Auto-fix documentation issues
npm run lint:fix
```

### VSCode Extensions

Recommended extensions for documentation:
- **Document This** - Generate JSDoc comments automatically
- **Better Comments** - Highlight TODO, FIXME, etc.
- **Vetur** - Vue component documentation support
- **ESLint** - Enforce documentation requirements

---

## References

- [JSDoc Official Documentation](https://jsdoc.app/)
- [Vue Style Guide](https://vuejs.org/style-guide/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
