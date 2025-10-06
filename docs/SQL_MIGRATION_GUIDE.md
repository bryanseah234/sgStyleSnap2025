# SQL Migration Guide - StyleSnap

Complete guide for understanding, running, and managing SQL migrations for the StyleSnap database.

---

## 📋 Table of Contents

1. [Migration Overview](#migration-overview)
2. [Migration Order](#migration-order)
3. [Dependencies](#dependencies)
4. [Running Migrations](#running-migrations)
5. [Verification Steps](#verification-steps)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Guide](#rollback-guide)

---

## 📦 Migration Overview

StyleSnap uses 8 SQL migration files that must be run in order. Each migration is **re-runnable** (safe to execute multiple times) thanks to `DROP IF EXISTS` statements.

### Migration Files

| File | Tables Created | Purpose |
|------|----------------|---------|
| `001_initial_schema.sql` | users, clothes, friends, suggestions (4) | Core database structure |
| `002_rls_policies.sql` | None | Row Level Security policies |
| `003_indexes_functions.sql` | None | Performance indexes & helper functions |
| `004_advanced_features.sql` | 8 tables | Social features, analytics, collections |
| `005_catalog_system.sql` | catalog_items (1) | Pre-populated clothing catalog |
| `006_color_detection.sql` | None (alters clothes) | Color detection fields |
| `007_outfit_generation.sql` | 3 tables | AI outfit generation |
| `008_likes_feature.sql` | likes (1) | Item likes system |

**Total Tables:** 17 tables

---

## 🔢 Migration Order

**⚠️ CRITICAL: Migrations MUST be run in this exact order:**

```
001_initial_schema.sql          (Foundation - run first!)
  ↓
002_rls_policies.sql           (Security layer)
  ↓
003_indexes_functions.sql      (Performance)
  ↓
004_advanced_features.sql      (Social features)
  ↓
005_catalog_system.sql         (Catalog browsing)
  ↓
006_color_detection.sql        (Color AI)
  ↓
007_outfit_generation.sql      (Outfit AI)
  ↓
008_likes_feature.sql          (Likes system)
```

### Why Order Matters

- **001** creates base tables that others depend on
- **002** adds security policies to base tables
- **003** adds performance indexes to base tables
- **004-008** add new tables that reference base tables

---

## 🔗 Dependencies

### Migration Dependency Tree

```
001_initial_schema.sql (NO DEPENDENCIES)
├── 002_rls_policies.sql
├── 003_indexes_functions.sql
├── 004_advanced_features.sql
│   └── Also needs: 002_rls_policies.sql
├── 005_catalog_system.sql
├── 006_color_detection.sql
├── 007_outfit_generation.sql
└── 008_likes_feature.sql
```

### Table Dependencies

**Core Tables (001):**
- `users` - Referenced by ALL other tables
- `clothes` - Referenced by: likes, outfit_history, generated_outfits
- `friends` - Referenced by: RLS policies
- `suggestions` - Referenced by: suggestion_feedback

**Advanced Tables (004):**
- `outfit_history` → requires: users, suggestions
- `shared_outfits` → requires: users
- `shared_outfit_likes` → requires: users, shared_outfits
- `outfit_comments` → requires: users, shared_outfits
- `style_preferences` → requires: users
- `suggestion_feedback` → requires: users, suggestions
- `outfit_collections` → requires: users
- `collection_outfits` → requires: outfit_collections, suggestions

**Catalog Tables (005):**
- `catalog_items` → standalone (no foreign keys)

**Outfit Generation Tables (007):**
- `generated_outfits` → requires: users
- `outfit_generation_history` → requires: users, generated_outfits
- `outfit_likes` → requires: users, generated_outfits

**Likes Tables (008):**
- `likes` → requires: users, clothes

---

## 🚀 Running Migrations

### Method 1: Supabase SQL Editor (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Click "+ New query"
3. Copy entire contents of migration file
4. Click "Run" or press Ctrl+Enter
5. Verify success message
6. Repeat for next migration

**Expected Result:** `✅ Success. No rows returned`

### Method 2: Supabase CLI

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Run migrations in order
supabase db push --file sql/001_initial_schema.sql
supabase db push --file sql/002_rls_policies.sql
supabase db push --file sql/003_indexes_functions.sql
supabase db push --file sql/004_advanced_features.sql
supabase db push --file sql/005_catalog_system.sql
supabase db push --file sql/006_color_detection.sql
supabase db push --file sql/007_outfit_generation.sql
supabase db push --file sql/008_likes_feature.sql
```

### Method 3: psql Command Line

```bash
# Connect to database
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Run migrations
\i sql/001_initial_schema.sql
\i sql/002_rls_policies.sql
\i sql/003_indexes_functions.sql
\i sql/004_advanced_features.sql
\i sql/005_catalog_system.sql
\i sql/006_color_detection.sql
\i sql/007_outfit_generation.sql
\i sql/008_likes_feature.sql
```

---

## ✅ Verification Steps

### Step 1: Check All Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected:** 17 tables
- catalog_items
- clothes
- collection_outfits
- friends
- generated_outfits
- likes
- outfit_collections
- outfit_comments
- outfit_generation_history
- outfit_history
- outfit_likes
- shared_outfit_likes
- shared_outfits
- style_preferences
- suggestion_feedback
- suggestions
- users

### Step 2: Verify RLS is Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected:** All tables show `rowsecurity = true`

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

**Expected Functions:**
- check_user_quota()
- is_friends_with()
- get_friend_closet()
- increment_likes_count()
- decrement_likes_count()
- get_complementary_color()
- get_analogous_colors()
- get_triadic_colors()
- And more...

### Step 5: Test Basic Queries

```sql
-- Should return 0 rows but no errors
SELECT * FROM users LIMIT 1;
SELECT * FROM clothes LIMIT 1;
SELECT * FROM friends LIMIT 1;
SELECT * FROM likes LIMIT 1;
```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue 1: "relation does not exist"

**Cause:** Migration ran out of order or previous migration failed

**Solution:**
```sql
-- Check which tables exist
\dt

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
- Check migration file has proper guards:
  ```sql
  ALTER TABLE clothes
    ADD COLUMN IF NOT EXISTS primary_color VARCHAR(50);
  ```

#### Issue 5: "duplicate key value violates unique constraint"

**Cause:** Trying to insert test data that already exists

**Solution:**
- Migrations should NOT insert data
- Use separate seed scripts for test data

### Validation Script

Run the validation script to check for issues:

```bash
node scripts/validate-migrations.js
```

This checks:
- ✅ All migration files exist
- ✅ DROP IF EXISTS statements present
- ✅ Expected tables are created
- ✅ Dependencies are correct

---

## 🔄 Rollback Guide

### Full Rollback (Drop Everything)

**⚠️ WARNING: This deletes ALL data!**

```sql
-- Drop all tables (in reverse order)
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

### Partial Rollback (Specific Migration)

To rollback a specific migration, drop its tables:

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

**Rollback 004 (Advanced Features):**
```sql
DROP TABLE IF EXISTS collection_outfits CASCADE;
DROP TABLE IF EXISTS outfit_collections CASCADE;
DROP TABLE IF EXISTS suggestion_feedback CASCADE;
DROP TABLE IF EXISTS style_preferences CASCADE;
DROP TABLE IF EXISTS outfit_comments CASCADE;
DROP TABLE IF EXISTS shared_outfit_likes CASCADE;
DROP TABLE IF EXISTS shared_outfits CASCADE;
DROP TABLE IF EXISTS outfit_history CASCADE;
```

After rollback, re-run migrations from the rolled-back point forward.

---

## 📊 Migration Statistics

**Total Lines of SQL:** ~3,500 lines
**Total Tables:** 17 tables
**Total Indexes:** 40+ indexes
**Total Functions:** 20+ functions
**Total RLS Policies:** 50+ policies
**Estimated Run Time:** 2-3 minutes (all migrations)

---

## 🔐 Security Notes

- All tables have RLS enabled
- Users can only see their own data
- Friends can see each other's data (based on privacy settings)
- Public access is explicitly denied by default
- Each policy has been tested for privacy enforcement

---

## 📚 Related Documentation

- [DATABASE_SETUP.md](../DATABASE_SETUP.md) - Quick start guide
- [tasks/13-advanced-outfit-features.md](../tasks/13-advanced-outfit-features.md) - Advanced features details
- [tasks/12-likes-feature.md](../tasks/12-likes-feature.md) - Likes system details
- [requirements/database-schema.md](../requirements/database-schema.md) - Schema reference

---

**Last Updated:** October 2025
**Maintainer:** StyleSnap Development Team
