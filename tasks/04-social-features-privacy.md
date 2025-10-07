# Task 4: Social Features & Privacy

**Estimated Duration**: 6 days  
**Dependencies**: Task 3 complete  
**Requirements**: [REQ: api-endpoints], [REQ: frontend-components], [REQ: security]

## 4.1 Friend Management System
- [ ] **CRITICAL**: Implement POST /users/search endpoint with anti-scraping measures
  - Minimum 3-character query requirement
  - Rate limiting: 20 searches per minute
  - Result limit: 10 users maximum
  - Random ordering (no pagination)
  - Never return email addresses
  - Search by username (fuzzy) or email (exact match only)
  - Include friendship status in results
- [ ] Implement POST /friends/request endpoint (by user_id, not email)
- [ ] Implement POST /friends/:id/accept endpoint
- [ ] Implement POST /friends/:id/reject endpoint
- [ ] Build secure friend search UI with debouncing
- [ ] Create pending requests notification system

## 4.2 Privacy-Critical Features
- [ ] **CRITICAL**: Implement GET /friends/:id/cabinet endpoint
  - Enforce privacy='friends' filter
  - Verify accepted friendship status
  - Never expose private items
  - Add comprehensive test cases
- [ ] Build privacy toggle in item creation/edit
- [ ] Display privacy indicators in UI

## 4.3 Friends UI Components
- [ ] Build `Friends.vue` page component
- [ ] Create `FriendsList.vue` component
  - Accepted friends section
  - Pending requests section
  - Search bar for adding friends
- [ ] Build `FriendProfile.vue` component
  - Display friend's shareable closet
  - "Create Suggestion" button
- [ ] Implement friend request notifications

## 4.4 Profile Management
- [ ] Build `Profile.vue` page component
- [ ] Create user profile update functionality
- [ ] Implement theme toggle (light/dark mode)
- [ ] Add sign out button with confirmation

## Files to Create:
src/
pages/
Friends.vue
Profile.vue
components/
social/
FriendsList.vue
FriendProfile.vue
FriendRequest.vue
stores/
friends-store.js
services/
friends-service.js


## Acceptance Criteria:
- [ ] Users can search for friends by username or email (secure)
- [ ] **CRITICAL**: Search prevents database scraping:
  - Minimum 3-character queries enforced
  - Rate limiting active (20/minute)
  - Results limited to 10 users
  - No pagination or result counts
  - Random ordering on each search
  - Email addresses never exposed
- [ ] Friend requests can be sent and accepted
- [ ] Privacy settings are strictly enforced
- [ ] Friend's closets only show 'friends' privacy items
- [ ] Profile page displays user info and settings
- [ ] Monitoring alerts on suspicious search patterns

