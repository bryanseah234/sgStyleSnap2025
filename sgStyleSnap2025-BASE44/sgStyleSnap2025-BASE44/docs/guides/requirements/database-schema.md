# Database Schema Requirements

## 1. Overview
All database tables and relationships for StyleSnap application.

## 2. Table Specifications

### 2.1 Users Table
Stores user account information from Google OAuth.

**CRITICAL: Google SSO Only**
- Authentication: Google OAuth 2.0 exclusively
- User auto-created on first Google sign-in
- Pages: `/login` and `/register` both use Google OAuth
- After auth: Redirect to `/closet` (home page)

**Profile Photo System:**
- 6 default avatars stored in `/public/avatars/default-1.png` through `default-6.png`
- User selects from defaults in Settings page (`/settings`)
- `avatar_url` stores: default avatar path OR Google photo URL OR (future) custom upload URL
- Future extensibility: Custom avatar upload via Cloudinary

**Username Rules:**
- `username`: Auto-generated from email (part before @), immutable
- `name`: Full name from Google OAuth (first + last), immutable
- Cannot be changed by user in settings

**Columns:**
- `id` (UUID, Primary Key) - Matches auth.users.id from Supabase Auth
- `email` (VARCHAR(255), Unique, Not Null) - From Google account, immutable
- `username` (VARCHAR(255), Not Null) - Auto-generated from email (before @), immutable
- `name` (VARCHAR(255)) - Full name from Google OAuth, immutable
- `avatar_url` (TEXT) - Path to default avatar OR Google photo OR custom upload
- `google_id` (VARCHAR(255), Unique) - Google OAuth provider ID
- `removed_at` (TIMESTAMP) - Soft delete support
- `created_at` (TIMESTAMP) - Auto-set on first sign-in
- `updated_at` (TIMESTAMP) - Auto-updated on changes

### 2.2 Clothes Table
Stores clothing items with privacy controls.

**Columns:**
- `id` (UUID, Primary Key)
- `owner_id` (UUID, Foreign Key to users)
- `name` (VARCHAR(255), Not Null)
- `category` (VARCHAR(50), Check: top/bottom/outerwear/shoes/accessory)
- `image_url` (TEXT, Not Null)
- `thumbnail_url` (TEXT)
- `style_tags` (TEXT[])
- `privacy` (VARCHAR(20), Default: 'friends', Check: private/friends)
- `size` (VARCHAR(20))
- `brand` (VARCHAR(100))
- `is_favorite` (BOOLEAN, Default: false) - User can mark items as favorites for quick access
- `removed_at` (TIMESTAMP) - Soft delete timestamp
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 2.3 Friends Table
Manages friend relationships and requests.

**Columns:**
- `id` (UUID, Primary Key)
- `requester_id` (UUID, Foreign Key to users)
- `receiver_id` (UUID, Foreign Key to users)
- `status` (TEXT, Check: pending/accepted/rejected)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- Unique constraint on (requester_id, receiver_id)
- Check constraint: `requester_id < receiver_id` (canonical ordering prevents duplicates)

**Friendship States:**
- `pending`: Friend request sent, awaiting acceptance
- `accepted`: Mutual friendship established
- `rejected`: Friend request declined

**Canonical Ordering:**
- Lower UUID stored as requester_id, higher as receiver_id
- Prevents duplicate rows for same friendship
- Single source of truth per relationship

### 2.4 Suggestions Table
Stores outfit suggestions between friends.

**Columns:**
- `id` (UUID, Primary Key)
- `from_user_id` (UUID, Foreign Key to users)
- `to_user_id` (UUID, Foreign Key to users)
- `suggested_item_ids` (UUID[], Not Null) - Array of clothing item IDs
- `message` (TEXT) - Optional message up to 100 characters
- `is_read` (BOOLEAN, Default: FALSE)
- `created_at` (TIMESTAMP)

### 2.5 Likes Table (Future Feature)
Stores item likes for social engagement.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to users)
- `item_id` (UUID, Foreign Key to clothes)
- `created_at` (TIMESTAMP)
- Unique constraint on (user_id, item_id)

## 3. Row Level Security (RLS)
All tables have RLS enabled with specific policies:
- Users can only access their own data
- Friends can view friends' items with privacy='friends'
- Suggestions are visible to recipients only

## 4. Indexes for Performance
- `idx_clothes_owner_id` - Fast user closet queries
- `idx_clothes_category` - Fast category filtering
- `idx_clothes_favorite` - Fast favorite items filtering (partial index on owner_id, is_favorite WHERE is_favorite = true)
- `idx_clothes_removed_at` - Filter active items
- `idx_friends_requester` - Friend relationship lookups
- `idx_friends_receiver` - Friend relationship lookups
- `idx_friends_status` - Quick friend request lookups
- `idx_suggestions_to_user_id` - Fast suggestion retrieval
- `idx_users_name_trgm` - Fuzzy name search (GIN index with trigram)

**Note on Email Index:**
- Email column has unique constraint but NO public search index
- Email searches use exact match only (`email = ?`)
- Prevents systematic enumeration of users

## 5. Database Functions
- `check_item_quota(user_id)` - Returns current item count
- `get_friend_closet(friend_id, viewer_id)` - Secure friend closet access

**Related Tasks**: [TASK: 02-authentication-database#2.1], [TASK: 06-quotas-maintenance#1.1]

**SQL Files**: [001_initial_schema.sql](../sql/001_initial_schema.sql), [002_rls_policies.sql](../sql/002_rls_policies.sql), [003_indexes_functions.sql](../sql/003_indexes_functions.sql)