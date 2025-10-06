# Item Catalog System - Requirements

## Overview
The Item Catalog System provides a pre-populated database of clothing items that users can browse and add to their closet. This feature helps users quickly populate their closet without manually uploading photos of every item.

## Business Requirements

### User Stories
1. **As a new user**, I want to browse pre-populated clothing items so I can quickly build my closet without taking photos
2. **As a user**, I want to search for specific items by category, color, brand, or style so I can find exactly what I need
3. **As a user**, I want to filter catalog items by season, occasion, and weather so I see relevant items
4. **As a user**, I want to add catalog items to my closet with one click so I can build my wardrobe efficiently
5. **As a user**, I want to see high-quality placeholder images for catalog items so I know what each item looks like
6. **As an admin**, I want to manage the catalog database so I can add, update, or remove items

### Success Criteria
- Users can browse at least 100+ pre-populated catalog items
- Search returns results in < 500ms
- Users can add catalog items to their closet in < 2 clicks
- Catalog items display high-quality placeholder images
- Filter and search reduce results effectively

## Functional Requirements

### 1. Catalog Browsing
- **FR-001**: Display catalog items in a responsive grid layout
- **FR-002**: Support infinite scroll or pagination (20 items per page)
- **FR-003**: Show item thumbnail, name, category, and brand
- **FR-004**: Display item price range (optional) and season tags
- **FR-005**: Allow users to click items to view detailed information

### 2. Search & Filtering
- **FR-006**: Full-text search across name, description, brand, and tags
- **FR-007**: Filter by category (top, bottom, shoes, outerwear, accessory)
- **FR-008**: Filter by color (18 standardized colors)
- **FR-009**: Filter by season (spring, summer, fall, winter, all-season)
- **FR-010**: Filter by brand (popular brands)
- **FR-011**: Filter by style (casual, formal, sporty, business, trendy)
- **FR-012**: Combine multiple filters (AND logic)
- **FR-013**: Clear all filters with one click
- **FR-014**: Display active filter count

### 3. Item Details
- **FR-015**: Show full-resolution item image
- **FR-016**: Display complete item information (name, category, color, brand, season, style)
- **FR-017**: Show detailed description (material, fit, care instructions)
- **FR-018**: Display tags for search optimization
- **FR-019**: Show "Add to Closet" button prominently

### 4. Add to Closet
- **FR-020**: Add catalog item to user's closet with one click
- **FR-021**: Allow user to customize item name before adding
- **FR-022**: Create link between user's item and catalog item (`catalog_item_id`)
- **FR-023**: Prevent duplicate additions (warn if item already in closet)
- **FR-024**: Show success confirmation after adding
- **FR-025**: Redirect to closet after adding (optional)

### 5. Admin Management (Future)
- **FR-026**: Admin dashboard to add/edit/delete catalog items
- **FR-027**: Bulk import catalog items via CSV
- **FR-028**: Upload item images to Cloudinary
- **FR-029**: Tag management for SEO and search
- **FR-030**: Analytics on most-added catalog items

## Technical Requirements

### Database Schema
```sql
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category clothing_category NOT NULL,
  subcategory VARCHAR(50),
  primary_color VARCHAR(50),
  secondary_colors VARCHAR(50)[],
  brand VARCHAR(100),
  season season_type,
  style VARCHAR(50),
  image_url TEXT NOT NULL,
  image_thumbnail_url TEXT,
  price_range VARCHAR(50),
  tags TEXT[],
  metadata JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### API Endpoints

#### 1. Browse Catalog
```
GET /api/catalog
Query Params:
  - page (integer, default: 1)
  - limit (integer, default: 20, max: 100)
  - category (string, optional)
  - color (string, optional)
  - brand (string, optional)
  - season (string, optional)
  - style (string, optional)
Response:
  {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
```

#### 2. Search Catalog
```
GET /api/catalog/search
Query Params:
  - q (string, required) - Search query
  - category (string, optional)
  - color (string, optional)
  - limit (integer, default: 20)
Response:
  {
    "query": "denim jacket",
    "results": [...],
    "count": 12
  }
```

#### 3. Get Single Catalog Item
```
GET /api/catalog/:id
Response:
  {
    "id": "uuid",
    "name": "Classic Denim Jacket",
    "description": "...",
    "category": "outerwear",
    ...
  }
```

#### 4. Add Catalog Item to Closet
```
POST /api/catalog/:id/add-to-closet
Body:
  {
    "customName": "My Blue Jacket" (optional)
  }
Response:
  {
    "success": true,
    "clothingItem": { ... }
  }
```

### Frontend Components

#### 1. CatalogBrowse.vue (Page)
- Main catalog browsing page
- Contains: search bar, filters, grid, pagination
- Integrates: CatalogSearch, CatalogFilter, CatalogGrid

#### 2. CatalogGrid.vue
- Displays catalog items in responsive grid
- Props: `items`, `loading`
- Emits: `itemClick`, `loadMore`
- Uses: CatalogItemCard

#### 3. CatalogItemCard.vue
- Individual catalog item card
- Props: `item`, `showAddButton`
- Shows: thumbnail, name, category, brand, color
- Emits: `click`, `addToCloset`

#### 4. CatalogFilter.vue
- Filter sidebar/drawer
- Multi-select filters: category, color, brand, season, style
- Emits: `filterChange`, `clearFilters`
- Shows active filter count

#### 5. CatalogSearch.vue
- Search input with autocomplete
- Debounced search (300ms delay)
- Shows recent searches (localStorage)
- Emits: `search`, `clear`

#### 6. CatalogItemModal.vue
- Full-screen modal for item details
- Shows: full image, complete info, add-to-closet button
- Props: `item`, `isOpen`
- Emits: `close`, `addToCloset`

### Pinia Store (catalog-store.js)

#### State
```javascript
{
  items: [],
  filters: {
    category: null,
    color: null,
    brand: null,
    season: null,
    style: null
  },
  searchQuery: '',
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null,
  selectedItem: null
}
```

#### Actions
- `fetchCatalog()` - Load catalog items with filters
- `searchCatalog(query)` - Search catalog
- `setFilters(filters)` - Update filters
- `clearFilters()` - Reset all filters
- `loadMore()` - Load next page
- `getItemById(id)` - Get single item
- `addToCloset(itemId, customName)` - Add to user's closet

## Non-Functional Requirements

### Performance
- **NFR-001**: Catalog page loads in < 2 seconds
- **NFR-002**: Search returns results in < 500ms
- **NFR-003**: Images load progressively (thumbnails first, then full)
- **NFR-004**: Support 100+ catalog items without performance degradation
- **NFR-005**: Filters update UI in < 100ms

### Usability
- **NFR-006**: Mobile-responsive design (works on 320px+ screens)
- **NFR-007**: Touch-friendly UI (buttons at least 44x44px)
- **NFR-008**: Accessible (ARIA labels, keyboard navigation)
- **NFR-009**: Clear visual feedback for loading states
- **NFR-010**: Empty states show helpful messages

### Security
- **NFR-011**: Catalog items are public (no authentication required)
- **NFR-012**: Add-to-closet requires authentication
- **NFR-013**: Admin management requires admin role
- **NFR-014**: SQL injection prevention on search queries
- **NFR-015**: Rate limiting on search (10 requests/second/user)

### Data
- **NFR-016**: Catalog database seeded with at least 100 items
- **NFR-017**: All catalog items have valid image URLs
- **NFR-018**: Images hosted on Cloudinary with CDN
- **NFR-019**: Thumbnail images optimized (< 50KB)
- **NFR-020**: Full images compressed (< 200KB)

## Dependencies
- **Task 1**: Infrastructure Setup (Supabase, Cloudinary)
- **Task 2**: Authentication (for add-to-closet)
- **Task 3**: Closet CRUD (to add items to user's closet)
- **SQL Migration 005**: Catalog database schema

## Testing Requirements

### Unit Tests
- Test catalog store actions (fetch, search, filter)
- Test search query sanitization
- Test filter logic (AND combinations)
- Test pagination calculations

### Integration Tests
- Test API endpoint responses
- Test database queries (search, filter)
- Test add-to-closet flow
- Test image URL generation

### E2E Tests
1. User browses catalog and sees items
2. User filters by category and sees filtered results
3. User searches for "jacket" and sees relevant items
4. User clicks item to view details
5. User adds catalog item to closet successfully
6. User is warned when trying to add duplicate item

## Future Enhancements
1. **Personalized Recommendations**: Show catalog items based on user's existing closet
2. **Trending Items**: Highlight most-added catalog items
3. **Seasonal Collections**: Curated collections for each season
4. **User-Generated Catalog**: Allow users to suggest items for catalog
5. **AI Image Matching**: Suggest catalog items that match user's uploaded photos
6. **Price Tracking**: Track price ranges and show deals
7. **Multi-language Support**: Translate catalog items
8. **Size Information**: Include sizing charts and fit guides

## Acceptance Criteria
- [ ] Users can browse catalog with 100+ items
- [ ] Search returns relevant results in < 500ms
- [ ] Filters reduce results accurately
- [ ] Users can add catalog items to closet with 1 click
- [ ] Mobile UI is responsive and touch-friendly
- [ ] Loading states and errors display properly
- [ ] No duplicate items are added to closet
- [ ] Images load efficiently with progressive enhancement
- [ ] All tests pass (unit, integration, E2E)
- [ ] Code follows StyleSnap standards

## Estimated Effort
- **Database Setup**: 2 hours (run migration, seed data)
- **API Endpoints**: 4 hours (browse, search, add-to-closet)
- **Pinia Store**: 3 hours (state management, actions)
- **Frontend Components**: 8 hours (6 components)
- **Styling & Responsive**: 4 hours
- **Testing**: 4 hours
- **Total**: ~25 hours (3-4 days)
