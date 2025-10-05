# Task 5: Suggestion System (Core Feature)

**Estimated Duration**: 7 days  
**Dependencies**: Task 4 complete  
**Requirements**: [REQ: api-endpoints], [REQ: frontend-components], [REQ: performance]

## 5.1 Suggestion API
- [ ] Implement POST /suggestions endpoint
  - Validate item ownership
  - Create notification for recipient
  - Store suggestion with message
- [ ] Implement GET /suggestions endpoint
  - Filter received suggestions
  - Mark as read/unread functionality

## 5.2 Suggestion Canvas UI
- [ ] **CRITICAL**: Build `SuggestionCanvas.vue` component
  - Drag-and-drop interface using vue-draggable
  - Mobile-optimized touch controls
  - Friend's items panel (left)
  - Canvas area (right)
  - Optional message input (100 char limit)
- [ ] Implement visual feedback for drag operations
- [ ] Add undo/redo functionality
- [ ] Test performance with 50+ items

## 5.3 Notification System
- [ ] Build in-app notification component
- [ ] Display unread suggestion count in navigation
- [ ] Create notification preferences
- [ ] Implement real-time notification updates

## 5.4 Suggestion Management
- [ ] Build `Suggestions.vue` page for viewing received suggestions
- [ ] Create suggestion detail view
- [ ] Implement suggestion deletion/archiving
- [ ] Add suggestion response system (future)

## Files to Create:
src/
components/
social/
SuggestionCanvas.vue
SuggestionList.vue
SuggestionItem.vue
NotificationBell.vue
pages/
Suggestions.vue
stores/
suggestions-store.js
services/
suggestions-service.js
utils/
drag-drop-helpers.js


## Acceptance Criteria:
- [ ] Drag-and-drop works smoothly on desktop and mobile
- [ ] Suggestions are created with selected items and message
- [ ] Notifications appear for new suggestions
- [ ] Performance remains smooth with 50+ items
- [ ] Canvas is fully responsive on all screen sizes

