# StyleSnap - Requirements Index

## Core Requirements
1. [Database Schema](requirements/database-schema.md)
2. [API Endpoints](requirements/api-endpoints.md)
3. [Frontend Components](requirements/frontend-components.md)
4. [Security](requirements/security.md)
5. [Error Handling](requirements/error-handling.md)
6. [Performance](requirements/performance.md)

## Authentication
**CRITICAL: Google SSO Only**
- Authentication: Google OAuth 2.0 (Single Sign-On) exclusively
- No email/password, magic links, or other auth methods
- Pages: `/login` and `/register` (both use Google OAuth)
- After successful authentication: Redirect to `/closet` (home page)
- User profile auto-created on first Google sign-in
- Secrets stored in `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## User Settings
**Profile Photo:**
- 6 default avatars in `/public/avatars/default-1.png` through `default-6.png`
- User selects from defaults in Settings page (accessible via settings icon on home page)
- Future extensibility: Custom avatar upload via Cloudinary

**Username & Name Rules:**
- Username: Auto-generated from email (part before @), cannot be changed
- Name: From Google OAuth (first + last name), cannot be changed
- Email: From Google OAuth, cannot be changed
- All profile fields are display-only except avatar selection

## Additional References
- [Project Context](PROJECT_CONTEXT.md)
- [Tasks Overview](TASKS.md)
- [SQL Migrations](sql/)

## Quick Reference
### Quota Limits
- **Max User Uploads:** 50 items (images uploaded by user)
- **Catalog Additions:** Unlimited (items added from pre-populated catalog)
- **Warning Threshold:** 45 uploads (90%)
- **Blocked:** At 50 uploads, can only add from catalog
- **Image Size Limit**: 1MB after resize
- **Supported Categories**: top, bottom, outerwear, shoes, accessory
- **Privacy Levels**: private, friends
- **Friend Status**: pending, accepted, rejected
- **Favorite Items**: Users can mark items as favorites for quick access (heart icon toggle)

### Filtering & Organization
- **Favorites Filter:** Show only favorited items with toggle button
- **Category Filter:** Filter by category (dropdown populated with user's available categories)
- **Clothing Type Filter:** Filter by specific type within category
- **Privacy Filter:** Filter by privacy level (private/friends)
- **Multiple Filters:** All filters can be applied simultaneously
- **Clear Filters:** Reset all filters with single button

### Item Statistics & Details
When viewing an item in the virtual closet, users can see comprehensive statistics:
- **Days in Closet:** Calculated from when item was added (created_at)
- **Favorite Status:** Whether item is marked as favorite (with toggle button)
- **Category & Type:** Item's category and specific clothing type
- **Detected Color:** AI-detected color with visual color swatch
- **Times Worn:** Count of how many times item has been worn (from outfit_history)
- **Last Worn Date:** Most recent date the item was worn
- **In Outfits:** Number of outfit combinations including this item
- **Times Shared:** Count of times item was shared with friends
- **Last Updated:** When item information was last modified
- **Brand & Size:** Brand name and size information (if provided)
- **Privacy Level:** Current privacy setting (private/friends)
- **Style Tags:** User-defined tags for organization

### Upload Methods (Device-Specific)
- **Desktop/Laptop:** File upload only (select from file system)
- **Mobile/Tablet:** File upload + camera capture (take photo directly)

### Catalog Privacy
- **Anonymous Browsing:** All catalog items displayed without owner information
- **No Attribution:** Users cannot see who uploaded catalog items (admin or other users)
- **Privacy by Design:** catalog_items table has no owner_id column

### Catalog Auto-Contribution
- **Automatic Addition:** User uploads automatically added to catalog (no prompt)
- **Background Process:** Catalog contribution happens silently after successful upload
- **Smart Filtering:** Catalog browse excludes items user already owns

### Friend Search & Relationships
- **Secure Search:** Find users by username (fuzzy match) or email (exact match)
- **Anti-Scraping Protection:** Prevents database enumeration
  - Minimum 3-character query
  - Rate limiting: 20 searches per minute
  - Result limit: 10 users maximum
  - Random ordering (no pagination)
  - Email addresses never exposed
- **Friendship States:**
  - `pending`: Friend request sent, awaiting response
  - `accepted`: Mutual friendship established
  - `rejected`: Friend request declined
- **Relationship Management:** Send requests, accept/reject, unfriend