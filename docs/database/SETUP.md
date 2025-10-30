# StyleSnap Database Setup

This guide will help you set up the StyleSnap database with all necessary tables, triggers, and policies.

## Prerequisites

1. **Supabase Project**: You need a Supabase project with the following:
   - Google OAuth configured
   - Service role key available
   - Database access enabled

2. **Environment Variables**: Set up these environment variables:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Quick Setup

### Option 1: Using the Migration Script (Recommended)

1. Install dependencies:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Run the migration script:
   ```bash
   node scripts/run-migrations.js
   ```

### Option 2: Manual Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run each migration file in order:
   - `001_initial_schema.sql` - Core database schema
   - `002_rls_policies.sql` - Row Level Security policies
   - `003_indexes_functions.sql` - Database indexes and functions
   - `004_advanced_features.sql` - Advanced features and triggers
   - `005_catalog_system.sql` - Catalog system for browsing items
   - `006_color_detection.sql` - Color detection and analysis
   - `007_outfit_generation.sql` - AI outfit generation system
   - `008_likes_feature.sql` - Likes and favorites system
   - `009_clothing_types.sql` - Clothing type definitions
   - `009_enhanced_categories.sql` - Enhanced category system
   - `009_notifications_system.sql` - Notification system
   - `010_push_notifications.sql` - Push notification support
   - `011_catalog_enhancements.sql` - Catalog system improvements
   - `012_auth_user_sync.sql` - User authentication sync
   - `014_fix_catalog_insert_policy.sql` - Fix catalog insert permissions
   - `015_dev_user_setup.sql` - Development user setup
   - `016_disable_auto_contribution.sql` - Disable auto-contribution
   - `017_fix_catalog_privacy.sql` - Fix catalog privacy settings
   - `018_notification_cleanup_system.sql` - Notification cleanup
   - `019_fix_notification_function_types.sql` - Fix notification functions
   - `020_add_outfits_table.sql` - Add outfits table and relationships
   - `021_seed_data.sql` - Seed data for categories, colors, styles, brands
   - `022_disable_auto_contribution.sql` - Disable auto-contribution (utility)
   - `023_clear_catalog_data.sql` - Clear catalog data (utility)

## What Gets Created

### Core Tables
- **users**: User profiles synced from Supabase Auth
- **clothes**: User's clothing items
- **friends**: Friend relationships
- **suggestions**: AI-generated outfit suggestions

### Key Features
- **Automatic User Sync**: When a user signs in with Google, they're automatically added to the `users` table
- **Row Level Security (RLS)**: Users can only access their own data
- **Soft Deletes**: Items are marked as deleted instead of permanently removed
- **Favorites System**: Users can mark items as favorites
- **Privacy Controls**: Items can be private or visible to friends

### Triggers
- **User Sync**: Automatically creates user profile when they sign in
- **Updated At**: Automatically updates timestamps when records change

## Troubleshooting

### "Auth session missing" Error
This means the user is not authenticated. Make sure:
1. Google OAuth is properly configured in Supabase
2. The user has signed in through the login page
3. The database migrations have been applied

### "Cannot save new user" Error
This usually means:
1. The `012_auth_user_sync.sql` migration hasn't been applied
2. The trigger for syncing auth users to public users is missing
3. There's a permission issue with the database

### Database Connection Issues
Check that:
1. Your Supabase URL is correct
2. Your service role key has the right permissions
3. Your Supabase project is active and not paused

## Testing the Setup

1. Start your development server
2. Go to `/login` and sign in with Google
3. You should be redirected to `/home`
4. Navigate to `/closet` - you should see your items (or an empty state)
5. Check the browser console for any errors

## Need Help?

If you're still having issues:
1. Check the browser console for error messages
2. Verify your environment variables are set correctly
3. Make sure all migrations have been applied successfully
4. Check that Google OAuth is properly configured in Supabase
