# Database Migrations - StyleSnap

This directory contains SQL migration files for the StyleSnap database schema. All SQL files have been consolidated here for better organization.

## 📋 Migration Order

Migrations must be executed in numerical order:

### Core Schema (001-004)
1. `001_initial_schema.sql` - Core tables (users, clothes, outfits, friends)
2. `002_rls_policies.sql` - Row Level Security policies
3. `003_indexes_functions.sql` - Performance indexes and utility functions
4. `004_advanced_features.sql` - Collections, outfit history, analytics

### Feature Extensions (005-012)
5. `005_catalog_system.sql` - Catalog items table
6. `006_color_detection.sql` - Color fields for AI detection
7. `007_outfit_generation.sql` - Outfit generation algorithms
8. `008_likes_feature.sql` - Like system for items and outfits
9. `009_clothing_types.sql` - Granular clothing types (20 types)
10. `009_enhanced_categories.sql` - Enhanced category constraints
11. `009_notifications_system.sql` - Notification tables
12. `010_push_notifications.sql` - Push notification subscriptions
13. `011_catalog_enhancements.sql` - Catalog seeding support
14. `012_auth_user_sync.sql` - User authentication sync

### Bug Fixes (014-019)
15. `014_fix_catalog_insert_policy.sql` - Fix catalog insert permissions
16. `015_dev_user_setup.sql` - Development user setup
17. `016_disable_auto_contribution.sql` - Disable auto-contribution
18. `017_fix_catalog_privacy.sql` - Fix catalog privacy settings
19. `018_notification_cleanup_system.sql` - Notification cleanup
20. `019_fix_notification_function_types.sql` - Fix notification functions

### New Features (020+)
21. `020_add_outfits_table.sql` - Add outfits table and relationships
22. `021_seed_data.sql` - Seed data for categories, colors, styles, brands
23. `022_disable_auto_contribution.sql` - Disable auto-contribution (utility)
24. `023_clear_catalog_data.sql` - Clear catalog data (utility)

## 🆕 Migration 011: Catalog Enhancements

**Required for CSV catalog seeding script**

This migration adds essential columns to `catalog_items` table:

### New Columns
- `size` - Item size (S, M, L, 32x34, etc.)
- `primary_color` - Main color (replaces legacy `color`)
- `secondary_colors` - Array of additional colors
- `cloudinary_public_id` - For image management
- `privacy` - Visibility level (public, friends, private)
- `clothing_type` - Specific clothing type (from 009)

### New RPC Function
- `get_catalog_excluding_owned(user_id, filters...)` - Returns catalog items user doesn't already own

### Updated Policies
- Only public catalog items are visible to all users
- Users cannot see items they already have in their closet

## 🚀 Running Migrations

### Via Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy/paste each migration file content in order
4. Click **Run**

### Via Migration Script (Recommended)

```bash
# Run all migrations automatically
node scripts/run-migrations.js
```

### Via psql (Command Line)

```bash
# Set connection string
export DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Run migrations in order
psql $DATABASE_URL -f database/migrations/001_initial_schema.sql
psql $DATABASE_URL -f database/migrations/002_rls_policies.sql
psql $DATABASE_URL -f database/migrations/003_indexes_functions.sql
psql $DATABASE_URL -f database/migrations/004_advanced_features.sql
psql $DATABASE_URL -f database/migrations/005_catalog_system.sql
psql $DATABASE_URL -f database/migrations/006_color_detection.sql
psql $DATABASE_URL -f database/migrations/007_outfit_generation.sql
psql $DATABASE_URL -f database/migrations/008_likes_feature.sql
psql $DATABASE_URL -f database/migrations/009_clothing_types.sql
psql $DATABASE_URL -f database/migrations/009_enhanced_categories.sql
psql $DATABASE_URL -f database/migrations/009_notifications_system.sql
psql $DATABASE_URL -f database/migrations/010_push_notifications.sql
psql $DATABASE_URL -f database/migrations/011_catalog_enhancements.sql
psql $DATABASE_URL -f database/migrations/012_auth_user_sync.sql
psql $DATABASE_URL -f database/migrations/014_fix_catalog_insert_policy.sql
psql $DATABASE_URL -f database/migrations/015_dev_user_setup.sql
psql $DATABASE_URL -f database/migrations/016_disable_auto_contribution.sql
psql $DATABASE_URL -f database/migrations/017_fix_catalog_privacy.sql
psql $DATABASE_URL -f database/migrations/018_notification_cleanup_system.sql
psql $DATABASE_URL -f database/migrations/019_fix_notification_function_types.sql
psql $DATABASE_URL -f database/migrations/020_add_outfits_table.sql
psql $DATABASE_URL -f database/migrations/021_seed_data.sql
psql $DATABASE_URL -f database/migrations/022_disable_auto_contribution.sql
psql $DATABASE_URL -f database/migrations/023_clear_catalog_data.sql
```

### Via Supabase CLI

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## ✅ Verification

### Check Migration Status

```sql
-- Check if catalog_items table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'catalog_items';

-- Verify new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'catalog_items'
ORDER BY ordinal_position;

-- Check RPC function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'get_catalog_excluding_owned';

-- Test the function
SELECT * FROM get_catalog_excluding_owned(
  user_id_param := NULL,
  category_filter := 'top',
  page_limit := 10
);
```

### Expected Columns in catalog_items

After all migrations, `catalog_items` should have:

- `id` (UUID, PRIMARY KEY)
- `name` (VARCHAR(255), NOT NULL)
- `clothing_type` (VARCHAR(50)) - From Migration 009
- `category` (VARCHAR(50), NOT NULL)
- `brand` (VARCHAR(100))
- `size` (VARCHAR(20)) - From Migration 011
- `primary_color` (VARCHAR(50)) - From Migration 011
- `secondary_colors` (TEXT[]) - From Migration 011
- `style` (TEXT[])
- `tags` (TEXT[])
- `season` (VARCHAR(20))
- `description` (TEXT)
- `image_url` (TEXT, NOT NULL)
- `thumbnail_url` (TEXT, NOT NULL)
- `cloudinary_public_id` (TEXT) - From Migration 011
- `privacy` (VARCHAR(20), DEFAULT 'public') - From Migration 011
- `is_active` (BOOLEAN, DEFAULT true)
- `search_vector` (tsvector)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔒 Security Notes

### Row Level Security (RLS)

All tables have RLS enabled with specific policies:

- **catalog_items**: Public read access for active public items only
- **clothes**: Users can only see their own items and friends' shared items
- **users**: Public read access for basic profile info
- **friends**: Users can only manage their own friendships

### Privacy Levels

Catalog items support three privacy levels:

- `public` - Visible to all users (default for seed data)
- `friends` - Visible only to friends
- `private` - Not visible in catalog

## 🆘 Troubleshooting

### Migration Fails with "relation already exists"

All migrations are **re-runnable** - they check for existence before creating objects:

```sql
-- Example pattern
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'catalog_items' AND column_name = 'size'
  ) THEN
    ALTER TABLE catalog_items ADD COLUMN size VARCHAR(20);
  END IF;
END $$;
```

Safe to run multiple times!

### "function get_catalog_excluding_owned does not exist"

Run Migration 011:
```bash
psql $DATABASE_URL -f database/migrations/011_catalog_enhancements.sql
```

### "column primary_color does not exist"

Run Migration 011, which adds `primary_color` and migrates data from legacy `color` column.

## 📚 Additional Resources

- [Database Guide](../docs/DATABASE_GUIDE.md) - Complete schema documentation
- [Catalog Seeding Guide](../docs/CATALOG_SEEDING.md) - How to populate catalog
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

---

**Note:** Always backup your database before running migrations in production!
