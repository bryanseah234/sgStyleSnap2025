# Database Schema Requirements

## 1. Overview
All database tables and relationships for StyleSnap application.

## 2. Table Specifications

### 2.1 Users Table
Stores user account information from Google OAuth.

**Columns:**
- `id` (UUID, Primary Key)
- `email` (VARCHAR(255), Unique, Not Null)
- `name` (VARCHAR(255))
- `avatar_url` (TEXT)
- `provider_id` (VARCHAR(255), Unique, Not Null)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

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
- `removed_at` (TIMESTAMP) - Soft delete timestamp
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 2.3 Friends Table
Manages friend relationships and requests.

**Columns:**
- `id` (UUID, Primary Key)
- `requester_id` (UUID, Foreign Key to users)
- `receiver_id` (UUID, Foreign Key to users)
- `status` (VARCHAR(20), Default: 'pending', Check: pending/accepted/rejected)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- Unique constraint on (requester_id, receiver_id)

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
- `idx_clothes_removed_at` - Filter active items
- `idx_friends_status` - Quick friend request lookups
- `idx_suggestions_to_user_id` - Fast suggestion retrieval

## 5. Database Functions
- `check_item_quota(user_id)` - Returns current item count
- `get_friend_closet(friend_id, viewer_id)` - Secure friend closet access

**Related Tasks**: [TASK: 02-authentication-database#2.1], [TASK: 06-quotas-maintenance#1.1]

**SQL Files**: [001_initial_schema.sql](../sql/001_initial_schema.sql), [002_rls_policies.sql](../sql/002_rls_policies.sql), [003_indexes_functions.sql](../sql/003_indexes_functions.sql)