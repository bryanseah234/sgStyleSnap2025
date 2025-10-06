# Database Setup Guide - StyleSnap

This guide will walk you through setting up your Supabase PostgreSQL database for StyleSnap.

---

## ⚠️ Important: Recent SQL Fixes (October 6, 2025)

**Issues Fixed:** Multiple SQL files had relation errors and table naming conflicts:

### 004_advanced_features.sql (Task 13)
- ✅ **Renamed**: `outfit_likes` → `shared_outfit_likes` (to avoid conflict with Task 11)
- ✅ **Fixed**: All indexes, triggers, RLS policies updated to use new name
- ✅ **Fixed**: Removed duplicate `ON outfit_likes FOR DELETE` syntax error
- ❌ **Removed**: `notifications` table references (planned but never implemented)
- ✅ **Fixed**: Changed `friendships` → `friends` (correct table name)
- ✅ **Fixed**: Changed `user1_id/user2_id` → `requester_id/receiver_id` (correct columns)

### 005_catalog_system.sql (Task 9)
- ✅ **Fixed**: Added existence checks before altering tables
- ✅ **Fixed**: Wrapped ALTER TABLE in DO blocks to prevent errors

### 007_outfit_generation.sql (Task 11)
- ✅ **Fixed**: Added missing `outfit_generation_history` table drop
- ✅ **Fixed**: Removed incorrect DROP POLICY statements for `outfit_collections` (belongs to 004)
- ✅ **Clarified**: `outfit_likes` in this file is for generated outfits (different from Task 13)

**All SQL files are now re-runnable and error-free!** Each file has proper `DROP IF EXISTS` statements.

**Service Updates:** `shared-outfits-service.js` updated to use `shared_outfit_likes` table.

For detailed fix information, see:
- `SQL_MIGRATION_FIXES.md` - Previous fixes (table renames, existence checks)
- `SQL_DEPENDENCIES_FIX.md` - outfit_collections dependency fix
- `SQL_SYNTAX_CHECK_RESULTS.md` - Comprehensive syntax validation

---

## 📋 Prerequisites

- ✅ Supabase account (sign up at https://supabase.com)
- ✅ SQL files in `sql/` folder (you have them!)
- ✅ 10-15 minutes of time

---

## 🚀 Quick Setup (3 Options)

### Option 1: Supabase SQL Editor (Recommended - Easiest)
**Best for:** First-time setup, visual interface

### Option 2: Supabase CLI
**Best for:** Automated deployments, version control

### Option 3: psql Command Line
**Best for:** Advanced users, direct database access

---

## 📝 Option 1: Supabase SQL Editor (RECOMMENDED)

### Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name:** StyleSnap (or your choice)
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free tier is fine for development
4. Click **"Create new project"**
5. ⏳ Wait 2-3 minutes for database to provision

### Step 2: Get Your Credentials

1. Go to **Settings** (⚙️ icon in sidebar) → **API**
2. Copy these values (you'll need them for `.env` file):
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Run Migration Files

**✨ NEW: All migrations are now re-runnable!** You can safely run them multiple times without errors.

#### Option A: Run All Migrations at Once (Fastest)

1. Click **SQL Editor** (in left sidebar)
2. Click **"+ New query"**
3. Copy and paste the **ENTIRE contents** of `sql/run_all_migrations.sql`
4. Click **"Run"** or press `Ctrl+Enter`
5. ✅ Done! All 8 migrations will run in order

**Expected result:** You'll see 8 success messages, one for each migration.

---

#### Option B: Run Migrations One-by-One (Recommended for Learning)

**⚠️ IMPORTANT: Run these IN ORDER (001 → 008)!**

For each migration below:
1. Click **SQL Editor** (in left sidebar)
2. Click **"+ New query"**
3. Copy the entire contents of the SQL file
4. Click **"Run"**
5. Verify success before moving to next migration

---

**Migration 001: Initial Schema** (`sql/001_initial_schema.sql`)
- Creates all core tables (users, clothes, friends, suggestions)
- Sets up UUID extensions and timestamps
- Expected: ✅ "Success. No rows returned"

**Migration 002: RLS Policies** (`sql/002_rls_policies.sql`)
- Enables Row Level Security
- Users can only see their own data + friends' items
- Expected: ✅ "Success. No rows returned"

**Migration 003: Indexes & Functions** (`sql/003_indexes_functions.sql`)
- Performance indexes for fast queries
- Helper functions (quota check, friend closet)
- Expected: ✅ "Success. No rows returned"

**Migration 004: Advanced Features** (`sql/004_advanced_features.sql`)
- Outfit history, collections, notifications
- User statistics view
- Expected: ✅ "Success. No rows returned"

**Migration 005: Catalog System** (`sql/005_catalog_system.sql`)
- Pre-populated clothing catalog with full-text search
- Function to add catalog items to closet
- Expected: ✅ "Success. No rows returned"

**Migration 006: Color Detection** (`sql/006_color_detection.sql`)
- Color fields (primary_color, secondary_colors)
- Color harmony functions (complementary, analogous, triadic)
- Expected: ✅ "Success. No rows returned"

**Migration 007: Outfit Generation** (`sql/007_outfit_generation.sql`)
- Permutation-based outfit generation (no external APIs)
- Outfit scoring and ranking functions
- Outfit likes system
- Expected: ✅ "Success. No rows returned"

**Migration 008: Likes Feature** (`sql/008_likes_feature.sql`)
- Item likes system (like Instagram)
- Auto-increment likes count
- Popular items queries
- Expected: ✅ "Success. No rows returned"

**What this does:**
- Enables Row Level Security on all tables
- Creates policies so users can only see their own data
- Implements privacy controls (friends-only access)
- Protects against unauthorized access

**Expected result:** ✅ "Success. No rows returned"

---

#### Migration 3: Indexes & Functions
```sql
-- Copy and paste the ENTIRE contents of sql/003_indexes_functions.sql
-- Then click "Run" or press Ctrl+Enter
```

**What this does:**
- Creates database indexes for fast queries
- Adds helper functions (quota checking, friend verification)
- Optimizes common lookups
- Improves performance

**Expected result:** ✅ "Success. No rows returned"

---

#### Migration 4: Advanced Features
```sql
-- Copy and paste the ENTIRE contents of sql/004_advanced_features.sql
-- Then click "Run" or press Ctrl+Enter
```

**What this does:**
- Adds social feed functionality
- Creates outfit collections
- Adds AI learning tables (user preferences, feedback)
- Implements analytics (wear history tracking)

**Expected result:** ✅ "Success. No rows returned"

---

### Step 4: Verify Setup

1. In SQL Editor, run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected tables (should see 9):**
- ✅ `clothes`
- ✅ `friends`
- ✅ `outfit_collections`
- ✅ `outfit_history`
- ✅ `social_feed_posts`
- ✅ `suggestion_feedback`
- ✅ `suggestions`
- ✅ `user_preferences`
- ✅ `users`

2. Check RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected:** All tables should show `rowsecurity = true`

3. Check indexes exist:
```sql
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY indexname;
```

**Expected:** Should see 15+ indexes

---

## 📝 Option 2: Supabase CLI

### Step 1: Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (use Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or use NPM (any platform)
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link to Your Project

```bash
cd /workspaces/ClosetApp
supabase link --project-ref your-project-ref
```

**To find your project ref:**
- Go to Supabase dashboard
- Project URL is `https://YOUR-PROJECT-REF.supabase.co`
- Copy the `YOUR-PROJECT-REF` part

### Step 4: Run Migrations

```bash
# Create migrations directory (if needed)
mkdir -p supabase/migrations

# Copy SQL files
cp sql/001_initial_schema.sql supabase/migrations/001_initial_schema.sql
cp sql/002_rls_policies.sql supabase/migrations/002_rls_policies.sql
cp sql/003_indexes_functions.sql supabase/migrations/003_indexes_functions.sql
cp sql/004_advanced_features.sql supabase/migrations/004_advanced_features.sql

# Push to database
supabase db push
```

---

## 📝 Option 3: psql Command Line

### Step 1: Get Database Connection String

1. Go to Supabase dashboard
2. **Settings** → **Database**
3. Scroll to **Connection string**
4. Copy the **psql** connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### Step 2: Run Migrations

```bash
cd /workspaces/ClosetApp

# Set your connection string
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Run migrations in order
psql $DATABASE_URL -f sql/001_initial_schema.sql
psql $DATABASE_URL -f sql/002_rls_policies.sql
psql $DATABASE_URL -f sql/003_indexes_functions.sql
psql $DATABASE_URL -f sql/004_advanced_features.sql
```

---

## 🔐 Configure Google OAuth (Required for Login)

### Step 1: Get Google OAuth Credentials

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
8. Copy your **Client ID**

### Step 2: Configure in Supabase

1. Go to Supabase dashboard
2. **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Google provider**
5. Paste your **Google Client ID**
6. Paste your **Google Client Secret** (from Google Console)
7. Click **Save**

---

## 📝 Update Your .env File

Now that you have all credentials, create your `.env` file:

```bash
cd /workspaces/ClosetApp
cp .env.example .env
```

Edit `.env` and fill in:

```bash
# Supabase (from Step 2 of Option 1)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth (from Configure Google OAuth section)
VITE_GOOGLE_CLIENT_ID=123456-abc123.apps.googleusercontent.com

# Cloudinary (get from https://cloudinary.com/console)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset

# Weather API (optional - get from https://openweathermap.org/api)
VITE_OPENWEATHER_API_KEY=your-api-key
```

---

## ✅ Test Your Database Connection

### Test 1: Simple Connection Test

1. Go to Supabase dashboard → **SQL Editor**
2. Run this query:
```sql
SELECT NOW();
```
**Expected:** Current timestamp

### Test 2: Insert Test User (Manual)

```sql
-- Insert a test user (you'll normally use Google OAuth)
INSERT INTO users (email, full_name, avatar_url)
VALUES ('test@example.com', 'Test User', 'https://via.placeholder.com/150')
RETURNING *;
```

**Expected:** Returns the user object with UUID

### Test 3: Check Quota Function

```sql
-- Test the quota calculator function
SELECT check_user_quota('YOUR-USER-UUID-HERE');
```

**Expected:** Returns quota information (0 items used, 200 available)

---

## 🚨 Troubleshooting

### Error: "permission denied for table users"
**Solution:** Run migration `002_rls_policies.sql` again

### Error: "relation 'users' does not exist"
**Solution:** Run migration `001_initial_schema.sql` first

### Error: "function check_user_quota does not exist"
**Solution:** Run migration `003_indexes_functions.sql`

### Error: "password authentication failed"
**Solution:** Double-check your database password from Supabase dashboard

### Can't see tables in Supabase Table Editor
**Solution:** 
1. Go to **Database** → **Tables** in sidebar
2. If empty, check **SQL Editor** → Run:
   ```sql
   SELECT * FROM users LIMIT 1;
   ```
3. If this works, tables exist but RLS is blocking the view (this is correct!)

### Google OAuth not working
**Solution:**
1. Verify redirect URI in Google Console matches exactly: `https://YOUR-REF.supabase.co/auth/v1/callback`
2. Check Client ID is added to both `.env` AND Supabase Auth settings
3. Enable Google provider in Supabase Auth

---

## 📚 What Each Migration Does

### 001_initial_schema.sql
- **Tables:** users, clothes, friends, suggestions
- **Purpose:** Core data structure
- **Key Features:** 200-item quota, 5 categories, privacy levels
- **Dependencies:** None (run first!)

### 002_rls_policies.sql
- **Purpose:** Security layer
- **Key Features:** User can only see own data, friends-only privacy
- **Dependencies:** Requires 001_initial_schema.sql
- **Critical:** Without this, anyone can see anyone's data!

### 003_indexes_functions.sql
- **Purpose:** Performance optimization
- **Key Features:** Fast lookups, quota checking, friend verification
- **Dependencies:** Requires 001_initial_schema.sql
- **Impact:** 10-100x faster queries

### 004_advanced_features.sql
- **Tables:** outfit_collections, outfit_history, user_preferences, suggestion_feedback, social_feed_posts
- **Purpose:** Advanced features (analytics, AI learning, social feed)
- **Dependencies:** Requires 001, 002, 003
- **Optional:** Can skip for basic MVP, but recommended

---

## 🎯 Next Steps

Once your database is set up:

1. ✅ **Verify .env file** has all credentials
2. ✅ **Test Google OAuth** login flow
3. ✅ **Set up Cloudinary** for image uploads (see `.github/CREDENTIALS_SETUP_GUIDE.md`)
4. ✅ **Install dependencies:** `npm install`
5. ✅ **Run development server:** `npm run dev`
6. ✅ **Test the app:** Open http://localhost:3000

---

## 📖 Additional Resources

- **Full Credentials Guide:** `.github/CREDENTIALS_SETUP_GUIDE.md`
- **API Documentation:** `docs/API_REFERENCE.md`
- **Database Schema:** `requirements/database-schema.md`
- **Security Requirements:** `requirements/security.md`

---

## 🆘 Still Stuck?

If you encounter issues:

1. ✅ Check Supabase dashboard logs (Logs & Reports)
2. ✅ Verify all 4 migrations ran successfully
3. ✅ Confirm RLS is enabled (security check)
4. ✅ Test connection with simple `SELECT NOW();` query
5. ✅ Review error messages carefully (they're usually helpful!)

---

**Database setup complete! 🎉**

*Last Updated: October 6, 2025*
