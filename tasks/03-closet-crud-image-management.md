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

## 3.3 Closet UI Components
- [ ] Build `MainLayout.vue` component with navigation
- [ ] Create `Closet.vue` page component
- [ ] Build `ClosetGrid.vue` component
  - Responsive grid layout (3 cols mobile, 4-6 desktop)
  - Category filter bar
  - Loading states and empty state
- [ ] Build `AddItemForm.vue` component
  - Device-specific upload: Desktop/laptop = file upload only, Mobile/tablet = camera + file upload
  - Image preview and compression
  - Required fields validation
  - Optional fields under "Advanced" toggle
  - Color detection integration

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
- [ ] Users can add items with required fields
- [ ] 50 upload quota enforced with clear messaging (catalog additions unlimited)
- [ ] Closet displays items in responsive grid
- [ ] Category filtering works correctly
- [ ] Soft delete moves items to "trash" (removed_at set)