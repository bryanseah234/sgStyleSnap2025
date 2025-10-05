# Batch 3 Fixes - API Endpoint Documentation Issues

**Status:** ✅ COMPLETE  
**Date:** January 2025  
**Files Modified:** `requirements/api-endpoints.md`

## Overview

Batch 3 addresses **8 critical API documentation issues** focused on validation, pagination, security, and missing endpoints. These fixes ensure the API specification is complete, secure, and implementable.

---

## Issues Fixed

### Issue #20: POST /clothes Missing Image URL Validation

**Problem:**
- No validation requirements for `image_url` field
- Could allow non-Cloudinary URLs or HTTP URLs (insecure)
- No format/domain checking specified

**Solution:**
Added comprehensive validation requirements:
- Must be HTTPS URL
- Must match Cloudinary domain pattern: `https://res.cloudinary.com/{cloud_name}/image/upload/...`
- Reject URLs from other domains
- Return `400 Bad Request` with specific error message if validation fails

**Security Impact:** Prevents hotlinking attacks and ensures all images go through Cloudinary's CDN and security features.

---

### Issue #21: GET /closet Missing Pagination

**Problem:**
- No pagination parameters defined
- Could return thousands of items in single response
- No sorting options specified
- Performance issues for users with large closets

**Solution:**
Added pagination and sorting parameters:
```json
{
  "limit": 50,        // Default: 50, Max: 200
  "offset": 0,        // Default: 0
  "sort": "newest",   // Options: newest, oldest, name, category
  "category": "string" // Optional filter
}
```

Updated response to include:
```json
{
  "items": [ClothingItem],
  "total_count": 150,
  "returned_count": 50,
  "has_more": true
}
```

**Performance Impact:** Prevents large payload responses and enables efficient client-side pagination.

---

### Issue #22 & #23: PUT /clothes Image Update Confusion + Missing Restore Endpoint

**Problem:**
- Unclear if `image_url` can be updated via PUT
- Users could potentially change image_url to arbitrary URLs
- No way to restore soft-deleted items
- No endpoint to view trash/deleted items

**Solution:**

1. **Clarified PUT /clothes:**
   - Explicitly excludes `image_url` from updateable fields
   - Image changes require delete + re-upload
   - Return `400` if `image_url` included in request body

2. **Added POST /clothes/:id/restore:**
   ```json
   POST /clothes/:id/restore
   Response: 200 OK with restored item
   ```
   - Clears `removed_at` timestamp
   - Only works if item deleted within 30 days
   - Return `410 Gone` if permanently deleted

3. **Added GET /clothes/trash:**
   ```json
   GET /clothes/trash?limit=50&offset=0
   Response: { "items": [DeletedClothingItem], "total_count": 5 }
   ```
   - Returns items where `removed_at IS NOT NULL`
   - Shows days remaining until permanent deletion
   - Allows users to review before permanent purge

**User Impact:** Clear soft-delete recovery workflow with time-limited restoration.

---

### Issue #24: GET /friends/:id/cabinet Allows User Enumeration

**Problem:**
- Different responses for non-existent users vs. non-friends
- `404` for user not found, `403` for not friends
- Attackers can enumerate valid user IDs by observing response codes

**Solution:**
Changed to consistent `404` response:
- Return `404` for both non-existent users AND non-friends
- Same response time to prevent timing attacks
- Updated documentation: "User not found OR not friends (same response to prevent enumeration)"
- Marked `403` as "NOT USED (would reveal friendship status)"

**Security Impact:** Prevents user enumeration attacks while maintaining proper authorization checks.

---

### Issue #25: POST /friends/request Missing Rate Limiting & Anti-Spam

**Problem:**
- No rate limiting specified
- Could spam users with unlimited friend requests
- Email enumeration possible by observing different responses
- No protection against abuse

**Solution:**
Added comprehensive anti-abuse measures:

1. **Rate Limiting:**
   - 10 requests per hour per user (global limit)
   - 3 requests per day to same email address
   - Return `429 Too Many Requests` with `Retry-After` header

2. **Email Enumeration Protection:**
   - Always return `200 OK` with "Friend request sent" message
   - Even if email doesn't exist or user is self
   - Consistent response time
   - Failed requests logged silently

3. **Validation:**
   - Can't send request to self
   - Can't send duplicate pending requests
   - Verify email format

**Security Impact:** Prevents spam, abuse, and user enumeration while maintaining good UX.

---

### Issue #26: POST /suggestions Missing Validation Requirements

**Problem:**
- No item count limits specified (could suggest 100+ items)
- No validation for item ownership
- No privacy checks (could suggest private items)
- No friendship verification documented

**Solution:**
Added comprehensive validation rules:

1. **Array Size Validation:**
   - Minimum: 1 item
   - Maximum: 10 items
   - Enforced at both API and database level

2. **Friendship Validation:**
   - Verify friendship exists between sender and recipient
   - Verify status = `'accepted'`
   - Return `403 Forbidden` if not friends

3. **Item Validation:**
   - All items must exist in database
   - All items must belong to `to_user_id` (recipient)
   - All items must have `privacy = 'friends'` (can't suggest private items)
   - All items must not be deleted (`removed_at IS NULL`)
   - Return `400 Bad Request` with specific error

4. **Message Validation:**
   - Optional field
   - Max 100 characters (DB constraint)

**User Impact:** Prevents confusing suggestions and ensures only appropriate items are suggested.

---

### Issue #27: Missing Essential Endpoints

**Problem:**
- No endpoint to view received suggestions
- No endpoint to view sent suggestions
- No endpoint to mark suggestions as read
- No endpoint to delete suggestions
- No endpoint to get friends list
- No endpoint to unfriend/reject requests
- No endpoint to get user profile
- No endpoint to get single item details
- No like/unlike endpoints

**Solution:**
Added 10 missing endpoints:

#### 3.5 `GET /suggestions`
- Get suggestions received by authenticated user
- Filter by `unread_only` parameter
- Include sender info and full item details
- Return counts (total, unread)

#### 3.6 `GET /suggestions/sent`
- Get suggestions sent by authenticated user
- Include recipient info and read status
- Allow sender to see if suggestion was viewed

#### 3.7 `PUT /suggestions/:id/read`
- Mark suggestion as read
- Set `is_read = true` and `viewed_at = NOW()`
- Only recipient can mark as read

#### 3.8 `DELETE /suggestions/:id`
- Delete a suggestion permanently
- Both sender and recipient can delete
- No soft delete for suggestions

#### 3.9 `GET /friends`
- Get user's friends list
- Filter by status: `pending`, `accepted`, `rejected`
- Distinguish between sent and received pending requests
- Include counts summary

#### 3.10 `DELETE /friends/:id`
- Unfriend a user
- Cancel sent request
- Reject received request
- Single endpoint for all friendship removal actions

#### 3.11 `GET /profile`
- Get authenticated user's profile
- Include quota usage (used/limit/percentage)
- Include statistics (items, friends, suggestions)

#### 3.12 `GET /clothes/:id`
- Get single item details
- Include owner info
- Enforce privacy via RLS
- Return `404` if not authorized (don't reveal existence)

#### 3.13 `POST /clothes/:id/like`
- Like a friend's item
- Verify friendship and privacy
- Notify item owner
- Idempotent (return 200 if already liked)

#### 3.14 `DELETE /clothes/:id/like`
- Unlike an item
- Idempotent (return 200 even if not liked)

**Completeness Impact:** API specification now covers all user workflows end-to-end.

---

## Summary

### Changes Made
- ✅ Added image URL validation (Cloudinary domain, HTTPS)
- ✅ Added pagination to closet endpoint (limit, offset, sort)
- ✅ Clarified image_url is immutable in PUT /clothes
- ✅ Added restore endpoint for soft-deleted items
- ✅ Added trash endpoint to view deleted items
- ✅ Fixed user enumeration in friend cabinet endpoint
- ✅ Added rate limiting and anti-spam to friend requests
- ✅ Added validation requirements to POST /suggestions
- ✅ Added 10 missing critical endpoints

### Validation Improvements
- Image URLs must be Cloudinary HTTPS URLs
- Pagination limits prevent oversized responses
- Suggestion items limited to 1-10 per suggestion
- All suggestion items must be friend-visible
- Rate limiting prevents abuse (10/hour, 3/day per email)

### Security Improvements
- Consistent 404 responses prevent user enumeration
- Email enumeration protection in friend requests
- Privacy validation for suggested items
- Timing attack protection with consistent response times

### Completeness Improvements
- Full suggestion lifecycle (create, view, read, delete)
- Complete friend management (list, unfriend, reject)
- Profile and statistics endpoint
- Single item detail endpoint
- Like/unlike functionality
- Soft delete recovery workflow

### Documentation Quality
- All endpoints now have request/response examples
- Error codes clearly documented
- Business logic explicitly stated
- Security considerations highlighted

---

## Next Steps

**Batch 4: Frontend Component Issues (7 issues)**
- AddItemForm client-side image compression
- SuggestionCanvas persistence and restoration
- ClosetGrid lazy loading and virtualization
- FriendsList request management
- Component error boundaries
- Loading states
- Optimistic updates

Ready to proceed with Batch 4 when approved! 🚀
