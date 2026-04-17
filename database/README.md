# Database Setup

Run `schema.sql` once against your Supabase project to create all tables, policies, triggers, and functions.

## Steps

1. Open your [Supabase project](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Copy the contents of `schema.sql`
4. Paste and click **Run**

## What's included

- Core tables: `users`, `clothes`, `friends`, `outfits`, `outfit_items`, `outfit_likes`, `likes`
- Catalog: `catalog_items`
- Social: `friend_outfit_suggestions`, `notifications`
- Push: `push_subscriptions`, `notification_preferences`
- All RLS policies, indexes, triggers, and helper functions
- Auth sync trigger (auto-creates `public.users` on new Google OAuth sign-in)

## Notes

- The schema is idempotent-safe for a fresh project — run it once on a clean database
- Authentication is Google OAuth only — configure the Google provider in your Supabase Auth settings
- After running the schema, configure your `.env` file using `.env.example` as a template
