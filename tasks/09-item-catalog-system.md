# Task 9: Item Catalog System

**Status:** 🚧 In Progress  
**Priority:** High  
**Estimated Time:** 3-4 days  
**Dependencies:** Task 1, Task 2, Task 3

---

## 📋 Overview

Implement a pre-populated catalog of clothing items that users can browse and add to their closet without uploading photos. This feature allows users to quickly populate their wardrobe with stock images.

**Key Benefits:**
- Faster onboarding (no photo upload required)
- Consistent image quality
- Easier to browse and discover items
- Reduces friction for new users
- Community-driven catalog (users auto-contribute uploads)

**Privacy Requirements:**
- **CRITICAL**: All catalog items must be displayed anonymously
- Never show who uploaded an item (admin or user)
- No owner attribution in UI (no "uploaded by" or user names)
- Owner information excluded from API responses for catalog browsing

**Auto-Contribution:**
- **CRITICAL**: User uploads automatically added to catalog behind the scenes
- No prompt or confirmation needed from user
- Contribution happens silently after successful upload
- Items added with same image, name, category from user's upload

**Smart Filtering:**
- Catalog browse excludes items user already owns
- Prevents showing duplicates in suggested items list
- Uses catalog_item_id or image matching to detect owned items

---

## 🎯 Acceptance Criteria

### Database
- [ ] `catalog_items` table created with all fields
- [ ] RLS policies for catalog (public read access)
- [ ] Indexes for fast filtering and search
- [ ] Migration file created: `sql/005_catalog_system.sql`
- [ ] Optional link from `clothes` to `catalog_items`

### API Endpoints
- [ ] `GET /api/catalog` - Browse catalog with pagination
- [ ] `GET /api/catalog/search` - Search catalog items
- [ ] `GET /api/catalog/:id` - Get single catalog item
- [ ] `POST /api/catalog/:id/add-to-closet` - Add to user's closet
- [ ] Proper error handling and validation

### Frontend Components
- [ ] `CatalogBrowse.vue` page created
- [ ] `CatalogGrid.vue` component (virtual scrolling)
- [ ] `CatalogFilter.vue` sidebar component
- [ ] `CatalogItemCard.vue` card component
- [ ] `CatalogSearch.vue` search bar component
- [ ] Route added to `src/router/index.js`

### Store
- [ ] `catalog-store.js` created with Pinia
- [ ] Actions: fetchCatalog, searchCatalog, addToCloset
- [ ] State: items, filters, pagination, loading

### Performance
- [ ] Virtual scrolling for large catalogs
- [ ] Lazy loading images
- [ ] Debounced search
- [ ] Pagination (20 items per page)

### UX
- [ ] Filter by category, color, brand, season
- [ ] Full-text search
- [ ] Visual feedback on add-to-closet
- [ ] Quota warning if near 50 uploads (catalog additions don't count)
- [ ] Mobile-optimized layout

### Privacy & Security
- [ ] **CRITICAL**: Owner information never exposed in catalog API responses
- [ ] **CRITICAL**: No user attribution displayed in catalog UI
- [ ] Catalog items appear identical whether uploaded by admin or user
- [ ] RLS policies prevent owner_id leakage in catalog views

### Auto-Contribution
- [ ] **CRITICAL**: User uploads automatically create catalog_items entries
- [ ] No user prompt or confirmation for catalog contribution
- [ ] Happens in background after successful upload
- [ ] Catalog entry uses same image_url, name, category as user's item

### Smart Filtering
- [ ] **CRITICAL**: Catalog browse excludes items user already owns
- [ ] Query filters by catalog_item_id in user's clothes table
- [ ] Prevents duplicate item suggestions
- [ ] "Already in your closet" handling for edge cases

---

## 📊 Database Schema

### New Table: `catalog_items`

```sql
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('top', 'bottom', 'outerwear', 'shoes', 'accessory')),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  tags TEXT[],
  brand VARCHAR(100),
  color VARCHAR(50),
  season VARCHAR(20) CHECK (season IN ('spring', 'summer', 'fall', 'winter', 'all-season')),
  style TEXT[], -- casual, formal, sporty, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast filtering
CREATE INDEX idx_catalog_category ON catalog_items(category);
CREATE INDEX idx_catalog_color ON catalog_items(color);
CREATE INDEX idx_catalog_brand ON catalog_items(brand);
CREATE INDEX idx_catalog_season ON catalog_items(season);
CREATE INDEX idx_catalog_active ON catalog_items(is_active) WHERE is_active = true;

-- Full-text search index
CREATE INDEX idx_catalog_search ON catalog_items USING gin(to_tsvector('english', name || ' ' || COALESCE(brand, '') || ' ' || array_to_string(tags, ' ')));
```

### Optional: Link User Items to Catalog

```sql
ALTER TABLE clothes ADD COLUMN catalog_item_id UUID REFERENCES catalog_items(id);
CREATE INDEX idx_clothes_catalog_item ON clothes(catalog_item_id);
```

---

## 🔌 API Endpoints

### 1. Browse Catalog

**Endpoint:** `GET /api/catalog`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 50)
- `category` (optional: top, bottom, outerwear, shoes, accessory)
- `color` (optional)
- `brand` (optional)
- `season` (optional: spring, summer, fall, winter, all-season)
- `style` (optional: casual, formal, sporty, etc.)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Blue Denim Jacket",
      "category": "outerwear",
      "image_url": "https://...",
      "thumbnail_url": "https://...",
      "tags": ["denim", "casual", "blue"],
      "brand": "Levi's",
      "color": "blue",
      "season": "all-season",
      "style": ["casual"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "total_pages": 25
  }
}
```

### 2. Search Catalog

**Endpoint:** `GET /api/catalog/search`

**Query Parameters:**
- `q` (required: search query)
- `page` (default: 1)
- `limit` (default: 20)

**Response:** Same as browse endpoint

### 3. Get Single Item

**Endpoint:** `GET /api/catalog/:id`

**Response:**
```json
{
  "id": "uuid",
  "name": "Blue Denim Jacket",
  "category": "outerwear",
  "image_url": "https://...",
  "thumbnail_url": "https://...",
  "tags": ["denim", "casual", "blue"],
  "brand": "Levi's",
  "color": "blue",
  "season": "all-season",
  "style": ["casual"]
}
```

### 4. Add to Closet

**Endpoint:** `POST /api/catalog/:id/add-to-closet`

**Request Body:**
```json
{
  "privacy": "friends" // or "private"
}
```

**Response:**
```json
{
  "success": true,
  "item": {
    "id": "new-uuid",
    "owner_id": "user-uuid",
    "name": "Blue Denim Jacket",
    "category": "outerwear",
    "image_url": "https://...",
    "thumbnail_url": "https://...",
    "catalog_item_id": "catalog-uuid",
    "privacy": "friends",
    "created_at": "2025-10-06T12:00:00Z"
  },
  "quota": {
    "used": 46,
    "limit": 200,
    "available": 154
  }
}
```

**Error Responses:**
- `400` - Upload quota exceeded (50 uploads, use catalog for more)
- `404` - Catalog item not found
- `409` - Item already in closet

---

## 🎨 Frontend Components

### 1. Page: `CatalogBrowse.vue`

```vue
<template>
  <MainLayout>
    <div class="catalog-browse">
      <header class="catalog-header">
        <h1>Browse Catalog</h1>
        <CatalogSearch @search="handleSearch" />
      </header>
      
      <div class="catalog-content">
        <CatalogFilter 
          :filters="filters"
          @update:filters="handleFilterChange"
        />
        
        <CatalogGrid 
          :items="catalogItems"
          :loading="loading"
          @add-to-closet="handleAddToCloset"
          @load-more="loadMore"
        />
      </div>
    </div>
  </MainLayout>
</template>
```

### 2. Component: `CatalogGrid.vue`

```vue
<template>
  <div class="catalog-grid">
    <VirtualScroller
      :items="items"
      :item-height="300"
      class="grid-container"
    >
      <template #default="{ item }">
        <CatalogItemCard 
          :item="item"
          @add-to-closet="$emit('add-to-closet', item)"
        />
      </template>
    </VirtualScroller>
    
    <div v-if="loading" class="loading">
      <Skeleton count="6" />
    </div>
  </div>
</template>
```

### 3. Component: `CatalogFilter.vue`

```vue
<template>
  <aside class="catalog-filter">
    <h2>Filters</h2>
    
    <div class="filter-group">
      <h3>Category</h3>
      <Select 
        v-model="localFilters.category"
        :options="categoryOptions"
        @update:modelValue="emitFilters"
      />
    </div>
    
    <div class="filter-group">
      <h3>Color</h3>
      <Select 
        v-model="localFilters.color"
        :options="colorOptions"
        @update:modelValue="emitFilters"
      />
    </div>
    
    <div class="filter-group">
      <h3>Season</h3>
      <Select 
        v-model="localFilters.season"
        :options="seasonOptions"
        @update:modelValue="emitFilters"
      />
    </div>
    
    <Button @click="clearFilters">Clear All</Button>
  </aside>
</template>
```

### 4. Component: `CatalogItemCard.vue`

```vue
<template>
  <div class="catalog-item-card">
    <img 
      :src="item.thumbnail_url"
      :alt="item.name"
      loading="lazy"
      class="item-image"
    />
    
    <div class="item-info">
      <h3>{{ item.name }}</h3>
      <p class="brand">{{ item.brand }}</p>
      <div class="tags">
        <Badge v-for="tag in item.tags" :key="tag">{{ tag }}</Badge>
      </div>
    </div>
    
    <Button 
      @click="handleAdd"
      :loading="adding"
      class="add-button"
    >
      Add to Closet
    </Button>
  </div>
</template>
```

### 5. Component: `CatalogSearch.vue`

```vue
<template>
  <div class="catalog-search">
    <FormInput
      v-model="searchQuery"
      type="search"
      placeholder="Search catalog..."
      @input="debouncedSearch"
    >
      <template #icon>
        <SearchIcon />
      </template>
    </FormInput>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { debounce } from 'lodash-es';

const searchQuery = ref('');
const emit = defineEmits(['search']);

const debouncedSearch = debounce(() => {
  emit('search', searchQuery.value);
}, 300);
</script>
```

---

## 🗄️ Pinia Store: `catalog-store.js`

```javascript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import catalogService from '@/services/catalog-service';

export const useCatalogStore = defineStore('catalog', () => {
  // State
  const items = ref([]);
  const filters = ref({
    category: null,
    color: null,
    brand: null,
    season: null,
    style: null
  });
  const searchQuery = ref('');
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const loading = ref(false);
  const error = ref(null);

  // Actions
  async function fetchCatalog() {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await catalogService.browse({
        ...filters.value,
        page: pagination.value.page,
        limit: pagination.value.limit
      });
      
      items.value = response.items;
      pagination.value = response.pagination;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function searchCatalog(query) {
    searchQuery.value = query;
    loading.value = true;
    error.value = null;
    
    try {
      const response = await catalogService.search({
        q: query,
        page: 1,
        limit: pagination.value.limit
      });
      
      items.value = response.items;
      pagination.value = response.pagination;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function addToCloset(catalogItemId, privacy = 'friends') {
    try {
      const response = await catalogService.addToCloset(catalogItemId, { privacy });
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters };
    pagination.value.page = 1; // Reset to first page
    fetchCatalog();
  }

  function loadMore() {
    if (pagination.value.page < pagination.value.totalPages) {
      pagination.value.page++;
      fetchCatalog();
    }
  }

  function clearFilters() {
    filters.value = {
      category: null,
      color: null,
      brand: null,
      season: null,
      style: null
    };
    searchQuery.value = '';
    pagination.value.page = 1;
    fetchCatalog();
  }

  return {
    // State
    items,
    filters,
    searchQuery,
    pagination,
    loading,
    error,
    // Actions
    fetchCatalog,
    searchCatalog,
    addToCloset,
    updateFilters,
    loadMore,
    clearFilters
  };
});
```

---

## 🔧 Implementation Steps

### Phase 1: Database Setup (Day 1)
1. Create `sql/005_catalog_system.sql` migration
2. Add `catalog_items` table
3. Add RLS policies (public read)
4. Add indexes for filtering and search
5. Optional: Add `catalog_item_id` to `clothes` table
6. Run migration on Supabase

### Phase 2: Backend API (Day 1-2)
1. Create `src/services/catalog-service.js`
2. Implement browse endpoint
3. Implement search endpoint
4. Implement get single item endpoint
5. Implement add-to-closet endpoint
6. Add error handling and validation
7. Test all endpoints

### Phase 3: Frontend Components (Day 2-3)
1. Create catalog components folder
2. Implement `CatalogItemCard.vue`
3. Implement `CatalogGrid.vue` with virtual scrolling
4. Implement `CatalogFilter.vue`
5. Implement `CatalogSearch.vue`
6. Implement `CatalogBrowse.vue` page
7. Add route to router

### Phase 4: State Management (Day 3)
1. Create `src/stores/catalog-store.js`
2. Implement actions (fetch, search, add)
3. Implement filters and pagination
4. Connect store to components

### Phase 5: Styling & Polish (Day 4)
1. Mobile-responsive design
2. Loading states
3. Error states
4. Empty states
5. Animations and transitions
6. Performance optimization

### Phase 6: Testing (Day 4)
1. Test pagination
2. Test filtering
3. Test search
4. Test add-to-closet with quota
5. Test mobile layout
6. Test performance (large catalogs)

---

## 🚨 Security Considerations

### RLS Policies

```sql
-- Catalog items are publicly readable
CREATE POLICY "Anyone can view active catalog items"
ON catalog_items FOR SELECT
USING (is_active = true);

-- Only admins can modify catalog (not implemented in MVP)
-- CREATE POLICY "Only admins can modify catalog"
-- ON catalog_items FOR ALL
-- USING (auth.uid() IN (SELECT id FROM admins));
```

### API Validation

- Validate catalog item exists before adding
- Check user upload quota before direct uploads (50 limit, catalog additions unlimited)
- Prevent duplicate adds (check if already in closet)
- Sanitize search queries (prevent SQL injection)
- Rate limit search endpoint

---

## 📈 Performance Optimization

### Virtual Scrolling
- Render only visible items (20-30 at a time)
- Use `vue-virtual-scroller` or custom implementation
- Recycle DOM nodes

### Image Optimization
- Use Cloudinary transformations for thumbnails
- Lazy load images (Intersection Observer)
- WebP format with PNG fallback
- Blur-up placeholder technique

### Search Optimization
- Debounce search input (300ms)
- Full-text search index in PostgreSQL
- Consider Algolia for advanced search (future)

### Caching
- Cache catalog results (5 minutes)
- Use HTTP caching headers
- Consider Redis for API caching (future)

---

## 🎨 Design Considerations

### Mobile-First
- Card-based layout (1-2 columns)
- Bottom sheet for filters
- Pull-to-refresh
- Infinite scroll

### Desktop
- Grid layout (3-4 columns)
- Sidebar filters
- Hover effects on cards
- Keyboard navigation

### Accessibility
- Alt text for images
- Keyboard navigation
- Screen reader support
- Focus indicators
- ARIA labels

---

## 📝 Sample Data

### Seed Catalog Items

```sql
-- Insert sample catalog items
INSERT INTO catalog_items (name, category, image_url, thumbnail_url, tags, brand, color, season, style) VALUES
('Classic White T-Shirt', 'top', 'https://example.com/white-tshirt.jpg', 'https://example.com/white-tshirt-thumb.jpg', ARRAY['basic', 'cotton', 'versatile'], 'Generic', 'white', 'all-season', ARRAY['casual']),
('Blue Denim Jacket', 'outerwear', 'https://example.com/denim-jacket.jpg', 'https://example.com/denim-jacket-thumb.jpg', ARRAY['denim', 'casual', 'blue'], 'Levi''s', 'blue', 'all-season', ARRAY['casual']),
('Black Leather Boots', 'shoes', 'https://example.com/leather-boots.jpg', 'https://example.com/leather-boots-thumb.jpg', ARRAY['leather', 'boots', 'black'], 'Dr. Martens', 'black', 'fall', ARRAY['casual', 'formal']);
```

---

## 🔗 Related Documentation

- **[requirements/item-catalog.md](../requirements/item-catalog.md)** - Detailed requirements
- **[API_GUIDE.md](../API_GUIDE.md)** - API patterns
- **[requirements/frontend-components.md](../requirements/frontend-components.md)** - Component patterns
- **[requirements/security.md](../requirements/security.md)** - Security requirements
- **[docs/CODE_STANDARDS.md](../docs/CODE_STANDARDS.md)** - Coding conventions

---

## ✅ Definition of Done

- [ ] All acceptance criteria met
- [ ] Database migration created and run
- [ ] All API endpoints implemented and tested
- [ ] All frontend components created and styled
- [ ] Pinia store implemented
- [ ] Route added to router
- [ ] Mobile-responsive
- [ ] Performance optimized (virtual scrolling, lazy loading)
- [ ] Error handling implemented
- [ ] Quota checks in place
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Tested on mobile and desktop

---

**Ready to implement? Let's build it! 🚀**
