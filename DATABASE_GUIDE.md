# 🗄️ StyleSnap Database Guide

**Complete guide for setting up, understanding, and managing the StyleSnap database.**

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Authentication Configuration](#authentication-configuration)
5. [Migration Guide](#migration-guide)
6. [Database Schema](#database-schema)
7. [Verification & Testing](#verification--testing)
8. [Troubleshooting](#troubleshooting)
9. [Security & Privacy](#security--privacy)

---

## 🚀 Quick Start

**TL;DR:** Run these 10 SQL migrations in order on your Supabase database:

1. `001_initial_schema.sql` - Core tables (users, clothes, friends, suggestions)
2. `002_rls_policies.sql` - Row Level Security policies
3. `003_indexes_functions.sql` - Performance indexes & helper functions
4. `004_advanced_features.sql` - Social features (8 tables)
5. `005_catalog_system.sql` - Item catalog browsing
6. `006_color_detection.sql` - Color detection fields
7. `007_outfit_generation.sql` - AI outfit generation
8. `008_likes_feature.sql` - Likes system
9. `009_notifications_system.sql` - Notifications, friend suggestions, item likes
10. `010_push_notifications.sql` - Push notification subscriptions

**Expected Result:** 20+ tables, 50+ RLS policies, 40+ indexes, 20+ functions

---

## 📋 Prerequisites

- ✅ Supabase account (sign up at https://supabase.com)
- ✅ SQL files in `sql/` folder
- ✅ 10-15 minutes of time
- ✅ Google Cloud account (for OAuth credentials)
- ✅ Cloudinary account (for image hosting)

---

## 🗄️ Database Setup

### Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name:** StyleSnap (or your choice)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is fine for development
4. Click **"Create new project"**
5. ⏳ Wait 2-3 minutes for database to provision

### Step 2: Get Your Credentials

1. Go to **Settings** (⚙️ icon in sidebar) → **API**
2. Copy these values (you'll need them for `.env` file):
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Project API Key (anon/public):** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Project Ref:** `xxxxx` (from the URL)

---

## 🔐 Authentication Configuration

### Google OAuth Setup (Required)

**CRITICAL:** This application uses Google OAuth 2.0 (Single Sign-On) exclusively.

- **Authentication Method:** Google OAuth only (no email/password)
- **Pages:** `/login` and `/register` (both use same Google OAuth flow)
- **After Auth:** Redirect to `/closet` (home page)
- **User Creation:** Auto-created in `users` table on first Google sign-in
  - `username`: Auto-generated from email (part before @)
  - `email`: From Google OAuth
  - `avatar_url`: Defaults to first default avatar or Google photo

#### Step 1: Get Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **+ Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Add Authorized redirect URIs:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback (for local dev)
   ```
7. Click **Create**
8. Copy your **Client ID** and **Client Secret**

#### Step 2: Configure in Supabase

1. Go to Supabase dashboard
2. **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Google provider**
5. Paste your **Google Client ID**
6. Paste your **Google Client Secret**
7. Click **Save**

### User Profile & Settings

**Profile Photo System:**
- 6 default avatars stored in `/public/avatars/default-1.png` through `default-6.png`
- User selects from defaults via Settings page (accessible from gear icon on home page)
- Future: Can be extended to support custom avatar uploads via Cloudinary

**Profile Fields:**
- **Username:** Auto-generated from email (part before @), immutable
- **Name:** From Google OAuth (first + last name), immutable
- **Email:** From Google OAuth, immutable
- **Avatar:** Can be changed by user (select from 6 defaults)

---

## 📝 Migration Guide

### Migration Overview

StyleSnap uses **10 SQL migration files** that must be run in order. Each migration is **re-runnable** (safe to execute multiple times) thanks to `DROP IF EXISTS` statements.

### ⚠️ CRITICAL: Run in This Exact Order

```
001_initial_schema.sql          → Foundation (run first!)
  ↓
002_rls_policies.sql           → Security layer
  ↓
003_indexes_functions.sql      → Performance
  ↓
004_advanced_features.sql      → Social features
  ↓
005_catalog_system.sql         → Catalog browsing
  ↓
006_color_detection.sql        → Color AI
  ↓
007_outfit_generation.sql      → Outfit AI
  ↓
008_likes_feature.sql          → Likes system
  ↓
009_notifications_system.sql   → Notifications
  ↓
010_push_notifications.sql     → Push subscriptions
```

### Migration Details

#### Migration 001: Initial Schema (`001_initial_schema.sql`)
- **Creates tables:** `users`, `clothes`, `friends`, `suggestions` (4 tables)
- **Purpose:** Core database structure
- **Key Features:** 
  - 50 upload quota per user (unlimited catalog additions)
  - 5 categories (top/bottom/outerwear/shoes/accessory)
  - Soft delete support
  - UUID extensions and timestamps
- **Expected:** ✅ "Success. No rows returned"

#### Migration 002: RLS Policies (`002_rls_policies.sql`)
- **Creates tables:** None (policies only)
- **Purpose:** Row Level Security policies
- **Key Features:**
  - Users can only see their own data
  - Friends can see each other's data (based on privacy settings)
  - Privacy controls (public/friends/private)
  - Protects against unauthorized access
- **Expected:** ✅ "Success. No rows returned"

#### Migration 003: Indexes & Functions (`003_indexes_functions.sql`)
- **Creates tables:** None (indexes & functions only)
- **Purpose:** Performance optimization
- **Key Features:**
  - Performance indexes for fast queries (10-100x faster)
  - Helper functions: `add_catalog_item_to_closet()`, `is_friends_with()`, `get_friend_closet()`
  - Quota checking: `check_user_quota()`
  - Optimizes common lookups
- **Expected:** ✅ "Success. No rows returned"

#### Migration 004: Advanced Features (`004_advanced_features.sql`)
- **Creates tables:** `outfit_history`, `shared_outfits`, `shared_outfit_likes`, `outfit_comments`, `style_preferences`, `suggestion_feedback`, `outfit_collections`, `collection_outfits` (8 tables)
- **Purpose:** Social sharing and outfit collections
- **Key Features:**
  - Social sharing and outfit collections
  - AI learning (user preferences, feedback tracking)
  - Analytics (wear history, statistics)
- **Expected:** ✅ "Success. No rows returned"

#### Migration 005: Catalog System (`005_catalog_system.sql`)
- **Creates table:** `catalog_items` (1 table)
- **Purpose:** Pre-populated clothing catalog
- **Key Features:**
  - Catalog browsing (no owner attribution - anonymous)
  - Full-text search with filters (category, color, brand, season)
  - Function to add catalog items to user's closet
  - Privacy: Anonymous browsing (no owner_id column)
- **Expected:** ✅ "Success. No rows returned"

#### Migration 006: Color Detection (`006_color_detection.sql`)
- **Modifies table:** Adds `primary_color` and `secondary_colors` columns to `clothes`
- **Purpose:** AI-powered color detection
- **Key Features:**
  - Color harmony functions: `get_complementary_color()`, `get_analogous_colors()`, `get_triadic_colors()`
  - AI-powered color matching for outfit suggestions
  - Supports 30+ color names (black, white, red, blue, etc.)
- **Expected:** ✅ "Success. No rows returned"

#### Migration 007: Outfit Generation (`007_outfit_generation.sql`)
- **Creates tables:** `generated_outfits`, `outfit_generation_history`, `outfit_likes` (3 tables)
- **Purpose:** AI outfit generation
- **Key Features:**
  - Permutation-based outfit generation (no external APIs)
  - Outfit scoring and ranking system
  - Weather and occasion-based filtering
  - Outfit likes system for generated outfits
- **Expected:** ✅ "Success. No rows returned"

#### Migration 008: Likes Feature (`008_likes_feature.sql`)
- **Creates table:** `likes` (1 table)
- **Purpose:** Item likes system
- **Key Features:**
  - Item likes system (like Instagram)
  - Auto-increment `likes_count` on clothes table
  - Functions: `toggle_like()`, `get_popular_items()`
- **Expected:** ✅ "Success. No rows returned"

#### Migration 009: Notifications System (`009_notifications_system.sql`)
- **Creates tables:** `notifications`, `friend_outfit_suggestions`, `item_likes` (3 tables)
- **Purpose:** Centralized notification system
- **Key Features:**
  - Centralized notification system with real-time updates
  - Friend outfit suggestions (friends can suggest outfits to each other)
  - Item likes system (separate from outfit likes)
  - Notification triggers for auto-creation on events
- **Expected:** ✅ "Success. No rows returned"

#### Migration 010: Push Notifications (`010_push_notifications.sql`)
- **Creates table:** `push_subscriptions` (1 table)
- **Purpose:** Web push notifications
- **Key Features:**
  - Web push notification subscriptions
  - Function: `send_push_notification()` for Edge Function integration
  - Browser push notification support
- **Expected:** ✅ "Success. No rows returned"

### Running Migrations

#### Option 1: Supabase SQL Editor (Recommended - Easiest)

1. In Supabase dashboard, click **SQL Editor** (in left sidebar)
2. Click **"+ New query"**
3. Copy the entire contents of the first SQL file (`001_initial_schema.sql`)
4. Click **"Run"** or press Ctrl+Enter
5. Verify success message: ✅ "Success. No rows returned"
6. Repeat for remaining migrations in order (002 → 010)

**⚠️ IMPORTANT:** Copy the ENTIRE file contents, not line-by-line!

#### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
cd /workspaces/ClosetApp
supabase link --project-ref your-project-ref

# Copy migrations to supabase directory
mkdir -p supabase/migrations
cp sql/*.sql supabase/migrations/

# Push to database
supabase db push
```

#### Option 3: psql Command Line

```bash
# Get connection string from Supabase dashboard
# Settings → Database → Connection string → psql

# Connect to database
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Run migrations in order
\i sql/001_initial_schema.sql
\i sql/002_rls_policies.sql
\i sql/003_indexes_functions.sql
\i sql/004_advanced_features.sql
\i sql/005_catalog_system.sql
\i sql/006_color_detection.sql
\i sql/007_outfit_generation.sql
\i sql/008_likes_feature.sql
\i sql/009_notifications_system.sql
\i sql/010_push_notifications.sql
```

---

## 📊 Database Schema

### Complete Table List (20 Tables)

#### Core Tables (Migration 001 - 4 tables)
1. **users** - User accounts and profiles
2. **clothes** - Virtual closet items owned by users
3. **friends** - Friendship relationships between users
4. **suggestions** - Outfit suggestions from friends

#### Advanced Features (Migration 004 - 8 tables)
5. **outfit_history** - Record of outfits worn by users
6. **shared_outfits** - Outfits shared to social feed
7. **shared_outfit_likes** - Likes on shared outfits
8. **outfit_comments** - Comments on shared outfits
9. **style_preferences** - User style preferences for AI learning
10. **suggestion_feedback** - User feedback on outfit suggestions
11. **outfit_collections** - User-created outfit collections/lookbooks
12. **collection_outfits** - Outfits in collections (many-to-many)

#### Catalog System (Migration 005 - 1 table)
13. **catalog_items** - Pre-populated clothing catalog (anonymous)

#### Outfit Generation (Migration 007 - 3 tables)
14. **generated_outfits** - AI-generated outfit combinations
15. **outfit_generation_history** - History of outfit generation requests
16. **outfit_likes** - Likes on generated outfits

#### Likes System (Migration 008 - 1 table)
17. **likes** - Likes on clothing items

#### Notifications (Migration 009 - 3 tables)
18. **notifications** - User notifications for all events
19. **friend_outfit_suggestions** - Outfit suggestions from friends
20. **item_likes** - Likes on individual items

#### Push Notifications (Migration 010 - 1 table)
21. **push_subscriptions** - Web push notification subscriptions

### Key Schema Features

#### users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Key Features:**
- Links to Supabase Auth
- Unique email and username
- Default avatar system (6 default avatars)

#### clothes Table
```sql
CREATE TABLE clothes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 255),
  category TEXT NOT NULL CHECK (category IN (
    'blouse', 'body', 'hoodie', 'longsleeve', 'polo', 
    'shirt', 't-shirt', 'top', 'undershirt',
    'pants', 'shorts', 'skirt',
    'blazer', 'outerwear',
    'shoes', 'hat', 'dress',
    'not-sure', 'other', 'skip'
  )),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  primary_color TEXT,
  secondary_colors TEXT[],
  style_tags TEXT[],
  privacy TEXT NOT NULL CHECK (privacy IN ('private', 'friends')) DEFAULT 'private',
  size TEXT,
  brand TEXT,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  removed_at TIMESTAMP WITH TIME ZONE
);
```

**Key Features:**
- 20 clothing categories (granular types)
- Color detection (primary + secondary colors)
- Privacy controls (private/friends)
- Soft delete support (removed_at)
- Likes counter

#### catalog_items Table
```sql
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 255),
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  tags TEXT[],
  brand TEXT,
  color TEXT,
  season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter', 'all-season')),
  style TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Key Features:**
- **NO owner_id column** - Anonymous by design
- Users cannot see who added items
- Full-text search support
- Season and style filters

#### notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'friend_outfit_suggestion',
    'outfit_like',
    'item_like',
    'friend_request',
    'comment'
  )),
  reference_id UUID NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Key Features:**
- 5 notification types
- Real-time updates support
- Read/unread tracking
- Links to actor and reference objects

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ clothes : owns
    users ||--o{ shared_outfits : creates
    users ||--o{ friends : participates
    users ||--o{ notifications : receives
    users ||--o{ friend_outfit_suggestions : creates_or_receives
    users ||--o{ shared_outfit_likes : likes
    users ||--o{ item_likes : likes
    users ||--o{ outfit_comments : writes
    
    clothes ||--o{ item_likes : has
    clothes }o--|| users : owned_by
    
    shared_outfits ||--o{ shared_outfit_likes : has
    shared_outfits ||--o{ outfit_comments : has
    shared_outfits }o--|| users : created_by
    
    friend_outfit_suggestions }o--|| users : owned_by
    friend_outfit_suggestions }o--|| users : suggested_by
    
    notifications }o--|| users : recipient
    notifications }o--|| users : actor
```

### Database Functions

**Core Functions:**
- `check_user_quota()` - Check user upload quota (50 uploads, unlimited catalog)
- `is_friends_with()` - Check if two users are friends
- `get_friend_closet()` - Get friend's closet items (respects privacy)
- `add_catalog_item_to_closet()` - Add catalog item to user's closet

**Color Functions:**
- `get_complementary_color()` - Get complementary color
- `get_analogous_colors()` - Get analogous colors
- `get_triadic_colors()` - Get triadic colors

**Likes Functions:**
- `toggle_like()` - Like/unlike an item
- `get_popular_items()` - Get trending items

**Analytics Functions:**
- `get_wardrobe_stats()` - Get wardrobe statistics
- `get_most_worn_items()` - Get most worn items
- `get_seasonal_breakdown()` - Get seasonal item breakdown

**Total:** 20+ functions

---

## ✅ Verification & Testing

### Step 1: Check All Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected:** 21 tables (see Complete Table List above)

### Step 2: Verify RLS is Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected:** All tables should show `rowsecurity = true`

### Step 3: Check Indexes

```sql
SELECT schemaname, tablename, indexname
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Expected:** 40+ indexes

### Step 4: Verify Functions

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

**Expected:** 20+ functions (see Database Functions section)

### Step 5: Test Basic Queries

```sql
-- Should return current timestamp
SELECT NOW();

-- Should return 0 rows (empty database)
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM clothes;
SELECT COUNT(*) FROM notifications;
```

### Step 6: Test Basic Connectivity

1. Go to Supabase dashboard → **SQL Editor**
2. Run this query:
```sql
SELECT NOW();
```
**Expected:** Current timestamp

### Validation Script

Run the validation script to check for issues:

```bash
npm run validate-migrations
```

This checks:
- ✅ All migration files exist
- ✅ DROP IF EXISTS statements present
- ✅ Expected tables are created
- ✅ Dependencies are correct

---

## 🔧 Troubleshooting

### Common Issues

#### Issue 1: "relation does not exist"

**Cause:** Migration ran out of order or previous migration failed

**Solution:**
```sql
-- Check which tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Re-run missing migrations in order
```

#### Issue 2: "syntax error at or near..."

**Cause:** Copied partial SQL or special characters

**Solution:**
- Copy entire file contents (don't copy line-by-line)
- Ensure no smart quotes (" vs ")
- Check for encoding issues

#### Issue 3: "policy already exists"

**Cause:** RLS policy wasn't dropped (old migration version)

**Solution:**
```sql
-- Drop all policies on a table
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Re-run the migration
```

#### Issue 4: "column already exists"

**Cause:** Migration 006 ran multiple times (ALTER TABLE)

**Solution:**
- This is safe if migration uses `IF NOT EXISTS`
- Check migration file has proper guards

#### Issue 5: "permission denied for table users"

**Solution:** Run migration `002_rls_policies.sql` again

#### Issue 6: "function check_user_quota does not exist"

**Solution:** Run migration `003_indexes_functions.sql`

#### Issue 7: "password authentication failed"

**Solution:** Double-check your database password from Supabase dashboard

#### Issue 8: Can't see tables in Supabase Table Editor

**Solution:** 
1. Go to **Database** → **Tables** in sidebar
2. If empty, check **SQL Editor** → Run:
   ```sql
   SELECT * FROM users LIMIT 1;
   ```
3. If this works, tables exist but RLS is blocking the view (this is correct!)

#### Issue 9: Google OAuth not working

**Solution:**
1. Verify redirect URI in Google Console matches exactly: `https://YOUR-REF.supabase.co/auth/v1/callback`
2. Check Client ID is added to both `.env` AND Supabase Auth settings
3. Enable Google provider in Supabase Auth

### Rollback Guide

#### Full Rollback (Drop Everything)

**⚠️ WARNING: This deletes ALL data!**

```sql
-- Drop all tables (in reverse order)
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS item_likes CASCADE;
DROP TABLE IF EXISTS friend_outfit_suggestions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS outfit_likes CASCADE;
DROP TABLE IF EXISTS outfit_generation_history CASCADE;
DROP TABLE IF EXISTS generated_outfits CASCADE;
DROP TABLE IF EXISTS catalog_items CASCADE;
DROP TABLE IF EXISTS collection_outfits CASCADE;
DROP TABLE IF EXISTS outfit_collections CASCADE;
DROP TABLE IF EXISTS suggestion_feedback CASCADE;
DROP TABLE IF EXISTS style_preferences CASCADE;
DROP TABLE IF EXISTS outfit_comments CASCADE;
DROP TABLE IF EXISTS shared_outfit_likes CASCADE;
DROP TABLE IF EXISTS shared_outfits CASCADE;
DROP TABLE IF EXISTS outfit_history CASCADE;
DROP TABLE IF EXISTS suggestions CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS clothes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

#### Partial Rollback (Specific Migration)

**Rollback 010 (Push Notifications):**
```sql
DROP TABLE IF EXISTS push_subscriptions CASCADE;
```

**Rollback 009 (Notifications):**
```sql
DROP TABLE IF EXISTS item_likes CASCADE;
DROP TABLE IF EXISTS friend_outfit_suggestions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
```

**Rollback 008 (Likes):**
```sql
DROP TABLE IF EXISTS likes CASCADE;
ALTER TABLE clothes DROP COLUMN IF EXISTS likes_count;
```

**Rollback 007 (Outfit Generation):**
```sql
DROP TABLE IF EXISTS outfit_likes CASCADE;
DROP TABLE IF EXISTS outfit_generation_history CASCADE;
DROP TABLE IF EXISTS generated_outfits CASCADE;
```

After rollback, re-run migrations from the rolled-back point forward.

---

## 🔐 Security & Privacy

### Row Level Security (RLS)

**All tables have RLS enabled.** This means users can only access data they're authorized to see.

#### Core RLS Policies

**users table:**
- ✅ Users can read all user profiles (public)
- ✅ Users can update own profile only

**clothes table:**
- ✅ Users can read own items
- ✅ Users can read friends' items (if privacy = 'friends')
- ✅ Users can insert/update/delete own items only
- ❌ Users cannot see other users' private items

**friends table:**
- ✅ Users can see friendships they're part of
- ✅ Users can send friend requests
- ✅ Users can accept/reject requests sent to them
- ❌ Users cannot see other users' friend lists

**catalog_items table:**
- ✅ Anyone can read active catalog items (public)
- ❌ Only admins can modify (service role)

**notifications table:**
- ✅ Users can read own notifications
- ✅ Users can update own notifications (mark as read)
- ❌ Users cannot see other users' notifications

### Privacy Features

**Item Privacy:**
- `private` - Only visible to owner
- `friends` - Visible to owner + friends

**Catalog Privacy:**
- No `owner_id` column - Anonymous by design
- Users cannot see who added items
- Admin and user-contributed items appear identical

**Anti-Scraping Protection:**
- Friend search: 3-char minimum, rate limiting, 10 result max, random order
- Email addresses never exposed in search results

**Friend Search:**
- Secure friend search by username (fuzzy) or email (exact match)
- Friendship states: pending, accepted, rejected
- Canonical ordering (requester_id < receiver_id) prevents duplicate rows

---

## 📝 Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456-abc123.apps.googleusercontent.com

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=sgstylesnap

# Weather API (optional)
VITE_OPENWEATHER_API_KEY=your-api-key
```

---

## 📊 Migration Statistics

**Total Lines of SQL:** ~4,000 lines
**Total Tables:** 21 tables
**Total Indexes:** 40+ indexes
**Total Functions:** 20+ functions
**Total RLS Policies:** 50+ policies
**Estimated Run Time:** 3-5 minutes (all migrations)

---

## 📚 Related Documentation

- [TASKS.md](TASKS.md) - Development tasks and implementation status
- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) - Project overview and file structure
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deployment instructions
- [SECRETS_REFERENCE.md](SECRETS_REFERENCE.md) - Environment variables reference
- [docs/SUPABASE_COMMANDS.md](docs/SUPABASE_COMMANDS.md) - Supabase CLI commands

---

## 🎯 Quick Reference

### Migration Order (Must Run in Order)
1. 001_initial_schema.sql
2. 002_rls_policies.sql
3. 003_indexes_functions.sql
4. 004_advanced_features.sql
5. 005_catalog_system.sql
6. 006_color_detection.sql
7. 007_outfit_generation.sql
8. 008_likes_feature.sql
9. 009_notifications_system.sql
10. 010_push_notifications.sql

### Key Features
- ✅ 50 upload quota per user (unlimited catalog additions)
- ✅ 20 clothing categories (granular types)
- ✅ Color detection (primary + secondary colors)
- ✅ Privacy controls (private/friends)
- ✅ Soft delete support
- ✅ Item likes system
- ✅ Outfit generation (AI-powered)
- ✅ Social feed with outfit sharing
- ✅ Notifications system
- ✅ Push notifications
- ✅ Friend system with privacy enforcement
- ✅ Catalog browsing (anonymous)
- ✅ Full-text search support

### Important Notes
- **⚠️ Run migrations in order!** Dependencies matter.
- **✅ All migrations are re-runnable.** Safe to run multiple times.
- **🔐 All tables have RLS enabled.** Privacy is enforced at database level.
- **📱 Google OAuth only.** No email/password authentication.
- **🎨 6 default avatars.** Users select from defaults (no custom uploads yet).

---

**Last Updated:** October 8, 2025  
**Version:** 1.0  
**Maintainer:** StyleSnap Development Team
