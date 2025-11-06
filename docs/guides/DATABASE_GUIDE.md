# 🗄️ Complete Database Guide - StyleSnap

**Comprehensive guide for setting up, understanding, and managing the StyleSnap database.**

This guide covers everything from quick setup to detailed schema documentation, migrations, troubleshooting, and best practices.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Migration Guide](#migration-guide)
5. [Database Schema](#database-schema)
6. [User Synchronization](#user-synchronization)
7. [Verification & Testing](#verification--testing)
8. [Troubleshooting](#troubleshooting)
9. [Security & Privacy](#security--privacy)
10. [Deployment Considerations](#deployment-considerations)

---

## 🚀 Quick Start

**TL;DR:** Run database migrations in order on your Supabase database.

### Basic Setup Steps

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com/dashboard)
   - Create new project
   - Wait 2-3 minutes for initialization

2. **Run Migrations**
   - Go to **SQL Editor** in Supabase Dashboard
   - Run migrations sequentially from `database/migrations/` folder
   - Start with `001_initial_schema.sql`, then `002_*`, `003_*`, etc.

3. **Configure User Sync**
   - Deploy Edge Function: `supabase functions deploy sync-auth-users-realtime`
   - Set up Auth Webhook (see [User Synchronization](#user-synchronization) section)

**Expected Result:** 20+ tables, 50+ RLS policies, 40+ indexes, 20+ functions

---

## 📋 Prerequisites

Before you begin:

- ✅ Supabase account (sign up at https://supabase.com)
- ✅ SQL migration files in `database/migrations/` folder
- ✅ 10-15 minutes of time
- ✅ Google Cloud account (for OAuth credentials)
- ✅ Cloudinary account (for image hosting)

---

## 🗄️ Database Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the form:
   - **Name:** StyleSnap (or your choice)
   - **Database Password:** Generate a strong password (⚠️ **SAVE THIS** - you'll need it!)
   - **Region:** Choose closest to your location
   - **Pricing Plan:** Free tier is fine for development
4. Click **"Create new project"**
5. ⏳ **Wait 2-3 minutes** for the project to initialize

### Step 2: Get Your Credentials

1. Go to **Settings** (⚙️ icon in sidebar) → **API**
2. Copy these values (you'll need them for `.env.local` file):
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Project API Key (anon/public):** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Project Ref:** `xxxxx` (from the URL)
   - **Service Role Key:** ⚠️ Keep this secret! (used for Edge Functions)

---

## 📝 Migration Guide

### Migration Overview

StyleSnap uses **SQL migration files** that must be run in order. Each migration is **re-runnable** (safe to execute multiple times) thanks to `DROP IF EXISTS` statements.

### ⚠️ CRITICAL: Run Migrations in This Exact Order

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
010_push_notifications.sql      → Push subscriptions
  ↓
011_catalog_enhancements.sql   → Catalog improvements
  ↓
... (continue with remaining migrations sequentially)
```

### Key Migrations Explained

#### Migration 001: Initial Schema (`001_initial_schema.sql`)

**Creates tables:** `users`, `clothes`, `friends`, `suggestions` (4 core tables)

**Key Features:**
- 50 upload quota per user (unlimited catalog additions)
- 5 categories (top/bottom/outerwear/shoes/accessory)
- Soft delete support
- UUID extensions and timestamps

**Expected:** ✅ "Success. No rows returned"

#### Migration 002: RLS Policies (`002_rls_policies.sql`)

**Creates:** Row Level Security policies (no new tables)

**Key Features:**
- Users can only see their own data
- Friends can see each other's data (based on privacy settings)
- Privacy controls (public/friends/private)
- Protects against unauthorized access

**Expected:** ✅ "Success. No rows returned"

#### Migration 003: Indexes & Functions (`003_indexes_functions.sql`)

**Creates:** Performance indexes and helper functions

**Key Features:**
- Performance indexes for fast queries (10-100x faster)
- Helper functions: `add_catalog_item_to_closet()`, `is_friends_with()`, `get_friend_closet()`
- Quota checking: `check_user_quota()`

**Expected:** ✅ "Success. No rows returned"

#### Migration 005: Catalog System (`005_catalog_system.sql`)

**Creates table:** `catalog_items` (1 table)

**Key Features:**
- Catalog browsing (no owner attribution - anonymous)
- Full-text search with filters (category, color, brand, season)
- Function to add catalog items to user's closet
- Privacy: Anonymous browsing (no owner_id column)

**Expected:** ✅ "Success. No rows returned"

#### Migration 009: Notifications System (`009_notifications_system.sql`)

**Creates tables:** `notifications`, `friend_outfit_suggestions`, `item_likes` (3 tables)

**Key Features:**
- Centralized notification system with real-time updates
- Friend outfit suggestions
- Item likes system
- Notification triggers for auto-creation on events

**Expected:** ✅ "Success. No rows returned"

### Running Migrations

#### Option 1: Supabase SQL Editor (Recommended - Easiest)

1. In Supabase dashboard, click **SQL Editor** (in left sidebar)
2. Click **"+ New query"**
3. Copy the **entire contents** of the first SQL file (`001_initial_schema.sql`)
4. Click **"Run"** or press Ctrl+Enter
5. Verify success message: ✅ "Success. No rows returned"
6. Repeat for remaining migrations in order (002 → 010 → ...)

**⚠️ IMPORTANT:** Copy the ENTIRE file contents, not line-by-line!

#### Option 2: Migration Script

If you have a migration script:

```bash
node scripts/run-migrations.js
```

#### Option 3: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
cd /path/to/sgStyleSnap2025
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

#### Option 4: psql Command Line

```bash
# Get connection string from Supabase dashboard
# Settings → Database → Connection string → psql

# Connect to database
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Run migrations in order
\i database/migrations/001_initial_schema.sql
\i database/migrations/002_rls_policies.sql
\i database/migrations/003_indexes_functions.sql
# ... continue with all migrations
```

---

## 📊 Database Schema

### Complete Table List (20+ Tables)

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

### Key Schema Details

#### users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  google_id VARCHAR(255) UNIQUE,
  removed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Key Features:**
- Links to Supabase Auth (`auth.users.id`)
- Unique email and username
- Default avatar system (6 default avatars)
- Soft delete support (`removed_at`)

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
- Soft delete support (`removed_at`)
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
    'friend_request_accepted',
    'outfit_shared',
    'comment'
  )),
  reference_id UUID,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Key Features:**
- 7 notification types
- Real-time updates support
- Read/unread tracking
- Links to actor and reference objects
- Automatic cleanup (7-day retention)

### Database Functions

**Core Functions:**
- `check_user_quota()` - Check user upload quota (50 uploads, unlimited catalog)
- `is_friends_with()` - Check if two users are friends
- `get_friend_closet()` - Get friend's closet items (respects privacy)
- `add_catalog_item_to_closet()` - Add catalog item to user's closet
- `is_catalog_item_owned()` - Check if user already owns catalog item

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

## 👤 User Synchronization

### Architecture Overview

StyleSnap uses **Edge Function + Auth Webhook** approach for user synchronization (recommended), with database triggers as fallback.

### Modern Approach: Edge Function + Auth Webhook (Recommended)

**How it works:**
1. User signs up with Google OAuth
2. Supabase Auth creates user in `auth.users`
3. Auth Webhook triggers Edge Function `sync-auth-users-realtime`
4. Edge Function creates user in `public.users` with auto-generated username

**Benefits:**
- ✅ No SQL triggers needed
- ✅ Better error handling
- ✅ Easier to debug (check Edge Function logs)
- ✅ Scalable architecture
- ✅ Supabase recommended approach

**Setup:**
1. Deploy Edge Function: `supabase functions deploy sync-auth-users-realtime`
2. Configure Auth Webhook in Supabase Dashboard
3. See **[OAuth Guide](OAUTH_GUIDE.md#auth-webhook-setup)** for detailed instructions

### Legacy Approach: Database Triggers (Fallback)

**How it works:**
1. User signs up with Google OAuth
2. Supabase Auth creates user in `auth.users`
3. Database trigger `sync_auth_user_to_public` fires
4. Trigger function creates user in `public.users`

**Note:** This approach is still supported but not recommended. Use Edge Function approach for new setups.

### Username Generation

Usernames are auto-generated from email addresses:

```javascript
// Example: john.doe@gmail.com → john.doe
const username = email.split('@')[0].toLowerCase()

// If username already exists, append numbers: john.doe_1234
```

The Edge Function handles username conflicts automatically.

---

## ✅ Verification & Testing

### Step 1: Check All Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected:** 20+ tables (see Complete Table List above)

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

-- Should return 0 rows (empty database initially)
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM clothes;
SELECT COUNT(*) FROM notifications;
```

### Step 6: Test User Creation

1. Sign up a new user via Google OAuth
2. Check user appears in `auth.users` table:
   ```sql
   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```
3. Check user appears in `public.users` table:
   ```sql
   SELECT id, email, username FROM users ORDER BY created_at DESC LIMIT 5;
   ```

**Expected:** User should appear in both tables with matching IDs

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

#### Issue 4: "permission denied for table users"

**Solution:** Run migration `002_rls_policies.sql` again

#### Issue 5: "function does not exist"

**Solution:** Run migration `003_indexes_functions.sql` or the specific migration that creates the function

#### Issue 6: "Cannot save new user" / "Database error saving new user"

**Symptoms:**
- New users cannot sign up
- Error: "Database error saving new user"

**Causes:**
1. Edge Function not deployed
2. Auth Webhook not configured
3. Missing RLS policies
4. Username conflicts

**Solution:**
1. Verify Edge Function is deployed: `supabase functions deploy sync-auth-users-realtime`
2. Check Auth Webhook is configured correctly
3. Run migration `062_fix_user_sync_with_robust_fallback.sql`
4. Check Edge Function logs for errors

See **[Troubleshooting Guide](TROUBLESHOOTING.md#issue-database-error-saving-new-user)** for detailed steps.

#### Issue 7: "Could not find the function public.is_catalog_item_owned(...)"

**Symptoms:**
- 404 error when adding catalog items to closet
- Catalog "Add to Closet" feature doesn't work

**Solution:**
Run migration `047_ensure_catalog_ownership_function.sql`:

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy contents of `database/migrations/047_ensure_catalog_ownership_function.sql`
3. Paste and run

**Verify:**
```sql
SELECT proname FROM pg_proc 
WHERE proname = 'is_catalog_item_owned';
```

Should return: `is_catalog_item_owned`

#### Issue 8: "structure of query does not match function result type"

**Symptoms:**
- Error when viewing friend outfits
- Type mismatch errors

**Cause:** Function return types don't match table column types (VARCHAR vs TEXT)

**Solution:**
Run migration that fixes type casts in functions. Functions should cast VARCHAR columns to TEXT:

```sql
-- Instead of:
SELECT outfit_name, occasion FROM outfits;

-- Use:
SELECT outfit_name::TEXT, occasion::TEXT FROM outfits;
```

#### Issue 9: Duplicate Migration Numbers

**Symptoms:**
- Migrations fail to run
- Migration conflicts

**Cause:** Multiple migration files with same number

**Solution:**
1. Identify duplicate migration numbers:
   ```bash
   ls database/migrations/ | grep -E '^[0-9]+_' | sort
   ```
2. Renumber duplicate migrations sequentially
3. Update any references to old migration numbers

**Common duplicates found:**
- `009_clothing_types.sql`, `009_enhanced_categories.sql`, `009_notifications_system.sql`
- `028_fix_notifications_insert_policy.sql`, `028_fix_user_creation_rls.sql`
- `035_fix_approve_friend_suggestion.sql`, `035_implement_soft_caps.sql`

#### Issue 10: Foreign Key Constraint Violations

**Symptoms:**
- Error: `insert or update on table "friends" violates foreign key constraint`
- Error Code: `23503`
- New users unable to add friends

**Cause:** User profile doesn't exist in `public.users` table

**Solution:**
1. Verify profile exists:
   ```sql
   SELECT id, email, username FROM users 
   WHERE id = 'your-user-id-here';
   ```
2. If profile doesn't exist, check Edge Function logs
3. Verify Auth Webhook is working
4. Manually create missing profile if needed (see troubleshooting guide)

**Prevention:** The codebase includes automatic profile creation checks in `friendsService.js`

---

## 🔒 Security & Privacy

### Row-Level Security (RLS)

All tables implement RLS policies to ensure data security:

**Users Table:**
- Users can only access their own profile data
- Service role can insert users (for Edge Function)

**Clothes Table:**
- Users can only access their own clothing items
- Friends can view items with `privacy = 'friends'`
- Public items visible to all authenticated users

**Friends Table:**
- Users can only access their own friend relationships
- Cannot add themselves as friends
- Status-based access control

**Notifications Table:**
- Users can only access notifications sent to them
- Cannot access other users' notifications

**Catalog Items Table:**
- All users can read catalog items (public browsing)
- Only service role can insert/edit (prevented via RLS)

### Best Practices

1. **Always enable RLS** on all tables
2. **Test RLS policies** after migrations
3. **Document policy changes** in migration files
4. **Use service_role** sparingly (only for Edge Functions)
5. **Validate user permissions** in application code

---

## 🚀 Deployment Considerations

### Production Database Setup

1. **Run all migrations** in production database
2. **Test migrations** in staging first
3. **Backup database** before running migrations
4. **Monitor migration logs** for errors

### Database Migrations Checklist

- [ ] All migrations run successfully
- [ ] All tables created
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Functions created
- [ ] User sync working (Edge Function + Webhook)
- [ ] Test user signup creates profile
- [ ] Basic queries work

### Performance Considerations

1. **Indexes:** All foreign keys and commonly queried columns are indexed
2. **Query Optimization:** Use functions for complex queries
3. **Pagination:** Implement pagination for large result sets
4. **Connection Pooling:** Supabase handles this automatically

### Backup Strategy

1. **Regular Backups:** Supabase provides automatic backups (paid plans)
2. **Manual Backups:** Export schema via Supabase Dashboard
3. **Version Control:** Keep migrations in Git repository
4. **Rollback Plan:** Document rollback procedures for each migration

---

## 📚 Additional Resources

### Related Documentation

- **[OAuth Guide](OAUTH_GUIDE.md)** - Complete OAuth setup including Edge Function
- **[Getting Started Guide](GETTING_STARTED.md)** - Complete setup from scratch
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Fix common database issues

### Supabase Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated:** January 2025  
**Maintained by:** StyleSnap Team
