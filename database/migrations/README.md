# Database Migrations - StyleSnap

This directory contains SQL migration files for the StyleSnap database schema. Migrations have been consolidated and organized for easier setup.

## 🚨 IMPORTANT: Start Here

**Before running any migrations**, read this entire README to understand the migration order and prerequisites.

## 📋 Prerequisites

- PostgreSQL database (Supabase recommended)
- Database admin access (service_role credentials)
- Extensions: `uuid-ossp`, `pgcrypto`, `pg_trgm` (auto-installed by migrations)

## 🔄 Migration Order

**Migrations MUST be executed in sequential order (000, 001, 002, etc.).**

### Step 0: Reset Database (Optional - Development Only)

```sql
-- ⚠️ WARNING: This deletes ALL data!
-- Only run this if you need to start completely fresh
-- Run: database/migrations/000_reset_database.sql
```

### Execution Order (Sequential)

Execute migrations in this exact order:

#### Core Schema (001-004)
1. ✅ `001_initial_schema.sql` - Core tables (users, clothes, friends, suggestions)
2. ✅ `002_rls_policies.sql` - Row Level Security policies
3. ✅ `003_indexes_functions.sql` - Performance indexes and utility functions
4. ✅ `004_advanced_features.sql` - Collections, outfit history, analytics

#### Feature Extensions (005-011)
5. ✅ `005_catalog_system.sql` - Catalog items table and functions
6. ✅ `006_color_detection.sql` - Color fields for AI detection
7. ✅ `007_outfit_generation.sql` - Outfit generation algorithms
8. ✅ `008_likes_feature.sql` - Like system for items and outfits
9. ✅ `009_notifications_system.sql` - Notification tables and functions
10. ✅ `010_push_notifications.sql` - Push notification subscriptions
11. ✅ `011_catalog_enhancements.sql` - Catalog seeding support

#### Enhanced Features (012-020)
12. ✅ `012_auth_user_sync.sql` - User authentication sync (basic)
13. ✅ `013_clothing_types_categories.sql` - Enhanced categories and clothing types ⚠️ **CONSOLIDATED**
14. ✅ `014_fix_catalog_insert_policy.sql` - Fix catalog insert permissions
15. ✅ `015_dev_user_setup.sql` - Development user setup
16. ✅ `016_disable_auto_contribution.sql` - Disable auto-contribution to catalog
17. ✅ `017_fix_catalog_privacy.sql` - Fix catalog privacy settings
18. ✅ `018_notification_cleanup_system.sql` - Notification cleanup functions
19. ✅ `019_fix_notification_function_types.sql` - Fix notification function types
20. ✅ `020_add_outfits_table.sql` - Add outfits table and relationships

#### Additional Features (021-025)
21. ✅ `021_seed_data.sql` - Seed data for categories, colors, styles, brands
22. ✅ `022_disable_auto_contribution.sql` - Disable auto-contribution (utility)
23. ✅ `023_friends_fixes.sql` - Comprehensive friends table fixes ⚠️ **CONSOLIDATED**
24. ✅ `024_google_profile_sync.sql` - Enhanced Google profile synchronization
25. ✅ `025_user_sync_updates.sql` - User sync updates and fixes ⚠️ **CONSOLIDATED**

#### Email & Notifications (026-028)
26. ✅ `026_email_notifications.sql` - Email notification system ⚠️ **CONSOLIDATED**
27. ✅ `027_catalog_updates.sql` - Catalog-related fixes ⚠️ **CONSOLIDATED**
28. ✅ `028_notification_fixes.sql` - Notification fixes ⚠️ **CONSOLIDATED**

#### Additional Utilities (029-032)
29. ✅ `029_fix_catalog_style_type.sql` - Fix catalog style column type
30. ✅ `030_slippers_category.sql` - Add slippers category ⚠️ **CONSOLIDATED**
31. ✅ `031_ai_description.sql` - AI-generated descriptions (rename from 051)
32. ✅ `032_email_notification_fixes.sql` - Email notification fixes (disable triggers) ⚠️ **CONSOLIDATED**

#### Username Generation (048)
33. ✅ `048_improve_username_generation.sql` - Username generation improvements

## 📝 Consolidated Migrations

The following migrations have been consolidated from multiple files:

### ✅ `013_clothing_types_categories.sql`
**Merged files:**
- `009_clothing_types.sql`
- `009_enhanced_categories.sql`

**Purpose:** Enhanced clothing categories and detailed clothing types

---

### ✅ `023_friends_fixes.sql`
**Merged files:**
- `031_fix_friends_rls.sql`
- `032_fix_users_rls_for_friends.sql`
- `033_fix_friends_rls_final.sql`
- `034_add_get_friend_outfits.sql`
- `035_fix_approve_friend_suggestion.sql`
- `035_implement_soft_caps.sql`
- `039_comprehensive_friends_fix.sql`
- `040_fix_users_rls_for_friends.sql`
- `041_fix_friends_rls_insert_policy.sql`
- `044_fix_friends_check_constraint.sql`

**Purpose:** Comprehensive fixes for friends table RLS policies, functions, and constraints

---

### ✅ `025_user_sync_updates.sql`
**Merged files:**
- `060_fix_user_creation_trigger.sql`
- `061_update_user_sync_to_edge_function.sql`
- `062_fix_user_sync_with_robust_fallback.sql`
- `064_disable_triggers_on_auth_users.sql`
- `066_RECREATE_SYNC_FUNCTION.sql`

**Purpose:** Updates and fixes for user synchronization from auth.users to public.users

---

### ✅ `026_email_notifications.sql`
**Merged files:**
- `050_email_notifications.sql`
- `051_fix_email_notification_message_field.sql`
- `052_fix_email_trigger_with_logging.sql`
- `054_configure_email_settings.sql`
- `055_fix_email_trigger_read_config.sql`
- `056_fix_pg_net_function_call.sql`

**Purpose:** Comprehensive email notification system setup

---

### ✅ `027_catalog_updates.sql`
**Merged files:**
- `036_fix_catalog_exclusion.sql`
- `042_fix_catalog_function_ambiguity.sql`
- `043_fix_category_constraint_compatibility.sql`
- `046_fix_primary_color_constraint.sql`
- `047_ensure_catalog_ownership_function.sql`
- `049_fix_catalog_item_owned_ambiguity.sql`

**Purpose:** Comprehensive catalog system fixes including exclusion logic, constraints, and functions

---

### ✅ `028_notification_fixes.sql`
**Merged files:**
- `028_fix_notifications_insert_policy.sql`
- `028_fix_user_creation_rls.sql` (misnumbered - actually about users)
- `045_fix_notifications_rls_comprehensive.sql`

**Purpose:** Comprehensive notification RLS policy fixes and trigger function updates

---

### ✅ `030_slippers_category.sql`
**Merged files:**
- `050_add_slippers_category.sql`
- `051_add_slippers_clothing_type.sql`

**Purpose:** Add slippers category to both clothes and catalog_items tables

---

### ✅ `032_email_notification_fixes.sql`
**Merged files:**
- `057_recreate_email_trigger.sql`
- `058_disable_email_trigger.sql`
- `059_ensure_email_trigger_disabled.sql`
- `060_disable_email_function.sql`

**Purpose:** Disable email triggers (use webhooks instead)

---

## 🗑️ Old Files (Can Be Deleted)

After consolidations, the following files are obsolete and can be safely deleted:

- All numbered files that were merged into consolidated migrations (see above)
- `065_EMERGENCY_DISABLE_TRIGGERS.sql` (moved to `database/emergency/`)
- `037_diagnose_user_creation_issue.sql` (diagnostic, moved to `database/emergency/`)
- `038_comprehensive_user_creation_fix.sql` (merged into `025_user_sync_updates.sql`)
- `041_cleanup_old_user_sync_triggers.sql` (merged into `025_user_sync_updates.sql`)
- `053_manual_email_test.sql` (test file, can be deleted)
- `063_fix_rls_for_edge_function_no_triggers.sql` (merged into `025_user_sync_updates.sql`)

**Note:** Files have been moved to `database/emergency/` folder for reference but are not part of the migration sequence.

## 🚀 Running Migrations

### Via Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy/paste each migration file content **in numerical order** (000, 001, 002, etc.)
4. Click **Run**

### Via psql (Command Line)

```bash
# Set connection string
export DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Run migrations in order (example)
psql $DATABASE_URL -f database/migrations/000_reset_database.sql
psql $DATABASE_URL -f database/migrations/001_initial_schema.sql
psql $DATABASE_URL -f database/migrations/002_rls_policies.sql
# ... continue for all migrations in order
```

### Via Supabase CLI

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## ⚠️ Important Notes

### Migration Safety

- All migrations are **re-runnable** - they check for existence before creating objects
- Safe to run multiple times without errors
- Use `IF NOT EXISTS` and `DROP IF EXISTS` patterns throughout

### Execution Order

- **CRITICAL:** Migrations must be run in numerical order
- Skipping migrations will cause errors
- Some migrations depend on previous ones

### Reset Database

- `000_reset_database.sql` will **DELETE ALL DATA**
- Only use in development or when starting fresh
- Always backup production databases before running migrations

## ✅ Verification

### Check Migration Status

```sql
-- Check if catalog_items table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'catalog_items';

-- Verify functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('get_catalog_excluding_owned', 'search_catalog');

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' ORDER BY tablename, policyname;
```

### Test Functions

```sql
-- Test catalog exclusion
SELECT * FROM get_catalog_excluding_owned(
  user_id_param := NULL,
  category_filter := 'top',
  page_limit := 10
);

-- Test catalog search
SELECT * FROM search_catalog('shirt', NULL, NULL, NULL, NULL, 10, 0);
```

## 🆘 Troubleshooting

### Migration Fails with "relation already exists"

All migrations are re-runnable. Check if the object already exists:

```sql
SELECT table_name FROM information_schema.tables WHERE table_name = 'your_table';
```

### "function does not exist"

Ensure you've run all migrations in order. Check dependencies:

```sql
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'your_function';
```

### RLS Policy Violations

Check that policies exist and are correct:

```sql
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

### User Sync Issues

See `database/emergency/DIAGNOSE_USER_SYNC.sql` for diagnostic queries.

## 📚 Additional Resources

- Emergency scripts: `database/emergency/` folder
- Diagnostic tools: `database/diagnostics/` folder
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

---

**Note:** Always backup your database before running migrations in production!
