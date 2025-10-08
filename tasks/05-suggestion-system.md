# Task 5: Suggestion System (Core Feature)

**Estimated Duration**: 7 days  
**Dependencies**: Task 4 complete  
**Requirements**: [REQ: api-endpoints], [REQ: frontend-components], [REQ: performance]  
**Status**: Backend Complete, Frontend Stub

## 5.1 Suggestion API
- [x] Implement POST /suggestions endpoint
  - ✅ `createSuggestion()` in suggestions-service.js
  - ✅ Validates item IDs array (required)
  - ✅ Stores message (100 char limit)
  - ✅ Tracks from_user_id and to_user_id
- [x] Implement GET /suggestions endpoint
  - ✅ `getReceivedSuggestions()` fetches suggestions to current user
  - ✅ `getSentSuggestions()` fetches suggestions from current user
  - ✅ `getSuggestion()` fetches specific suggestion details
  - ✅ Filters by is_read status
  - ✅ Orders by created_at descending

## 5.2 Suggestion Canvas UI
- [ ] **CRITICAL**: Build `SuggestionCanvas.vue` component
  - ⚠️ Currently STUB with TODOs only
  - [ ] Drag-and-drop interface using vue-draggable
  - [ ] Mobile-optimized touch controls
  - [ ] Friend's items panel (left)
  - [ ] Canvas area (right)
  - [ ] Optional message input (100 char limit)
- [ ] Implement visual feedback for drag operations
- [ ] Add undo/redo functionality
- [ ] Test performance with 50+ items

## 5.3 Notification System
- [x] Backend notification tracking
  - ✅ `markAsRead()` updates is_read status
  - ✅ `getUnreadCount()` fetches count of unread suggestions
  - ✅ Store tracks unreadCount state
- [ ] Build in-app notification component
- [ ] Display unread suggestion count in navigation
- [ ] Create notification preferences
- [ ] Implement real-time notification updates

## 5.4 Suggestion Management
- [x] Backend management functions
  - ✅ `deleteSuggestion()` removes suggestion
  - ✅ Store `fetchSuggestion()` loads specific suggestion
  - ✅ Store separates receivedSuggestions and sentSuggestions
- [x] Build `Suggestions.vue` page for viewing received suggestions
  - ✅ Page structure exists
- [x] Create suggestion detail view
  - ✅ `SuggestionItem.vue` component exists
- [x] Implement suggestion deletion/archiving
  - ✅ `deleteSuggestion()` function exists
- [ ] Add suggestion response system (future)

## Files Created:
```
src/
  components/
    social/
      SuggestionCanvas.vue     ⚠️ STUB ONLY - needs implementation
      SuggestionList.vue       ✅ Created
      SuggestionItem.vue       ✅ Created
      SuggestionApprovalCard.vue ✅ Created
  pages/
    Suggestions.vue            ✅ Created
  stores/
    suggestions-store.js       ✅ Complete (state, getters, actions)
  services/
    suggestions-service.js     ✅ Complete (7 functions)
```

## Backend Implementation Details:

### suggestions-service.js (✅ Complete)
- `getReceivedSuggestions()` - Fetch suggestions to current user with sender info
- `getSentSuggestions()` - Fetch suggestions from current user with recipient info
- `getSuggestion(id)` - Fetch specific suggestion with full details
- `createSuggestion(toUserId, itemIds, message)` - Create new suggestion
- `deleteSuggestion(id)` - Delete suggestion (creator only)
- `markAsRead(id)` - Mark suggestion as read (recipient only)
- `getUnreadCount()` - Get count of unread suggestions

### suggestions-store.js (✅ Complete)
State:
- `receivedSuggestions[]` - Suggestions received by current user
- `sentSuggestions[]` - Suggestions sent by current user
- `currentSuggestion` - Currently viewed suggestion
- `unreadCount` - Count of unread suggestions
- `isLoading` - Loading state

Getters:
- `receivedCount` - Total received suggestions count
- `sentCount` - Total sent suggestions count
- `newSuggestionsCount` - Count of unread suggestions

Actions:
- `fetchReceivedSuggestions()` - Load all received suggestions
- `fetchSentSuggestions()` - Load all sent suggestions
- `fetchSuggestion(id)` - Load specific suggestion
- `createSuggestion(toUserId, itemIds, message)` - Create new suggestion
- `deleteSuggestion(id)` - Delete suggestion
- `markAsRead(id)` - Mark as read and update state
- `fetchUnreadCount()` - Update unread count

## Test Coverage:

### tests/unit/suggestions-integration.test.js (✅ 47 tests passing)
- ✅ Store state management (3 tests)
- ✅ Store suggestion management functions (7 tests)
- ✅ Service API functions (7 tests)
- ✅ Suggestion data structure validation (4 tests)
- ✅ Item IDs validation (2 tests)
- ✅ Received suggestions viewing (4 tests)
- ✅ Sent suggestions viewing (2 tests)
- ✅ Mark as read operations (3 tests)
- ✅ Suggestion deletion (2 tests)
- ✅ Unread count tracking (3 tests)
- ✅ Task 5 acceptance criteria (10 tests)

**Test Summary**: 47/47 tests passing
**Build Status**: ✅ Successful (212.60 kB main bundle)

## Acceptance Criteria:
- [ ] Drag-and-drop works smoothly on desktop and mobile
  - ⚠️ SuggestionCanvas.vue not implemented
- [x] Suggestions are created with selected items and message
  - ✅ Backend API `createSuggestion()` working
  - ✅ Accepts array of item IDs
  - ✅ Supports optional message (100 char validated in tests)
- [ ] Notifications appear for new suggestions
  - ⚠️ Backend ready, frontend notification UI not implemented
- [ ] Performance remains smooth with 50+ items
  - ⚠️ Cannot test until canvas implemented
- [ ] Canvas is fully responsive on all screen sizes
  - ⚠️ Canvas not implemented

## Next Steps:
1. Implement SuggestionCanvas.vue drag-and-drop interface
2. Build notification UI components
3. Add real-time notifications using Supabase subscriptions
4. Test canvas performance with 50+ items
5. Implement drag-and-drop helpers utility

---

## Implementation Summary

### ✅ Completed (Backend)

- **Service Layer**: 7 API functions implemented in `suggestions-service.js`
- **State Management**: Complete Pinia store with reactive state, getters, and actions
- **Test Coverage**: 47 comprehensive integration tests (100% passing)
- **Data Model**: Suggestions support item arrays, messages, read tracking, user relations
- **Build**: Clean production build (212.60 kB main bundle)

### ⚠️ Pending (Frontend)

- **SuggestionCanvas.vue**: Drag-and-drop interface (currently stub)
- **Notification UI**: In-app notification components
- **Real-time Updates**: Supabase subscriptions for live notifications
- **Performance Testing**: Canvas with 50+ items
- **Utils**: Drag-and-drop helper utilities

### Test Results

```text
Task 5: Suggestion System Integration Tests
✅ 47/47 tests passing

Test Breakdown:
- Store state management: 3 tests
- Store suggestion functions: 7 tests  
- Service API functions: 7 tests
- Data structure validation: 4 tests
- Item IDs validation: 2 tests
- Received suggestions: 4 tests
- Sent suggestions: 2 tests
- Mark as read: 3 tests
- Deletion: 2 tests
- Unread count: 3 tests
- Acceptance criteria: 10 tests
```

### Overall Task Status: 🚧 Backend Complete, Frontend Stub

**Backend**: Fully functional and tested  
**Frontend**: Structure exists, implementation needed  
**Recommendation**: Prioritize SuggestionCanvas.vue for feature completion

