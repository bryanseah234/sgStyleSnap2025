# Task 3: Closet CRUD & Image Management

**Estimated Duration**: 6 days  
**Dependencies**: Task 2 complete  
**Requirements**: [REQ: api-endpoints], [REQ: frontend-components], [REQ: performance]

## 3.1 Image Upload Pipeline
- [ ] **CRITICAL**: Implement client-side image resizing
  - Use browser-image-compression library
  - Enforce max width 1080px
  - Target file size < 1MB
  - Test on various image formats (JPEG, PNG, WebP)
- [ ] Configure Cloudinary unsigned upload preset
- [ ] Build upload progress indicator component
- [ ] Handle upload failures with retry mechanism

## 3.2 Closet Management API
- [ ] Implement POST /clothes endpoint
  - **CRITICAL**: Add quota check (50 user uploads max, catalog additions unlimited)
  - Return 403 with friendly message at limit
  - **NEW**: Automatically add uploaded item to catalog_items table (anonymous)
  - Background catalog contribution after successful upload
- [ ] Implement GET /closet endpoint
  - Filter by authenticated user
  - Support category filtering
  - Exclude soft-deleted items
- [ ] Implement PUT /clothes/:id endpoint
- [ ] Implement POST /clothes/:id/remove (soft delete)

## 3.3 Item Management
- [ ] Build `ClosetGrid.vue` to display all items
- [ ] Add favorite toggle (heart icon) to each item card
  - [ ] Filled heart for favorited items
  - [ ] Outlined heart for non-favorited items
  - [ ] Click to toggle favorite status
  - [ ] Optimistic UI update
- [ ] Add `ClosetFilter.vue` for filtering
  - [ ] Favorites filter (toggle button)
  - [ ] Category filter (dropdown with user's available categories)
  - [ ] Clothing type filter
  - [ ] Privacy filter
  - [ ] Clear all filters button
  - [ ] Active filter indicators
- [ ] Implement `ItemDetailModal.vue` component
  - [ ] Full-resolution image display with zoom
  - [ ] Display all item properties (name, category, brand, size, color, privacy, tags)
  - [ ] **Statistics section** with:
    - [ ] Days in closet (calculated from created_at)
    - [ ] Favorite status (with toggle button)
    - [ ] Category and clothing type
    - [ ] Detected color (with color swatch)
    - [ ] Times worn (from outfit_history)
    - [ ] Last worn date
    - [ ] In outfits count (from outfit_generation_history)
    - [ ] Times shared with friends (from shared_outfits)
    - [ ] Last updated date
  - [ ] Action buttons (Edit, Delete, Share, Favorite/Unfavorite)
  - [ ] Responsive design (full-screen mobile, centered desktop)
- [ ] Create `GET /clothes/:id` API endpoint with statistics
- [ ] Add `getItemDetails(id)` function to clothes-service.js
- [ ] Add edit functionality
- [ ] Add delete functionality with confirmation
- [ ] Handle empty states (no items yet, no favorites, no results)

## 3.4 Base UI Components
- [ ] Create reusable UI components in `/components/ui/`:
  - `Button.vue` with variants and sizes
  - `Modal.vue` with backdrop close
  - `FormInput.vue` with validation
  - `Select.vue` with custom styling
  - `Notification.vue` for alerts

## Files to Create:
src/
components/
layouts/
MainLayout.vue
ui/
Button.vue
Modal.vue
FormInput.vue
Select.vue
Notification.vue
closet/
ClosetGrid.vue
AddItemForm.vue
pages/
Closet.vue
stores/
closet-store.js
services/
clothes-service.js
utils/
image-compression.js

## Acceptance Criteria:
- [ ] Images resized to < 1MB before upload
## Acceptance Criteria:
- [ ] Users can upload clothing items with images
- [ ] Images optimized and stored in Cloudinary
- [ ] Items display in grid with thumbnails
- [ ] **Users can mark items as favorites** (heart icon on each card)
- [ ] **Filter by favorites** shows only favorited items
- [ ] **Filter by category** shows only items in selected category
- [ ] **Category filter dropdown** only shows categories user has items in
- [ ] Multiple filters can be applied simultaneously
- [ ] Clear filters button resets all filters
- [ ] **Clicking item opens detail modal** with full information and statistics
- [ ] **Item statistics display correctly:**
  - [ ] Days in closet calculated from created_at
  - [ ] Favorite status shown with toggle
  - [ ] Category and type displayed
  - [ ] Color shown with visual swatch
  - [ ] Wear count from outfit history
  - [ ] Last worn date displayed
  - [ ] Outfit count shown
  - [ ] Share count displayed
  - [ ] Last updated timestamp
- [ ] CRUD operations work correctly
- [ ] Quota system enforces 50 upload limit
- [ ] Privacy settings control item visibility
- [ ] Category filtering works correctly
- [ ] Soft delete moves items to "trash" (removed_at set)