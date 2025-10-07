# Scripts Documentation

This directory contains utility scripts for database management, maintenance, and setup.

## Available Scripts

### 1. `populate-catalog.js`
Populates the catalog database with curated clothing items for users to browse and add to their virtual closets.

**Purpose:**
- Provides alternative to scanning own items
- Covers all 20 clothing types
- Includes diverse brands, colors, and seasons
- WebP optimized image URLs

**Usage:**
```bash
node scripts/populate-catalog.js
```

**Requirements:**
- Supabase project set up
- Environment variables configured (`.env` file)
- Database migrations 005 (catalog system) and 009 (clothing types) applied

**What it does:**
1. Checks if catalog is already populated
2. Inserts 25+ sample items covering all clothing types
3. Verifies data integrity
4. Prints summary by clothing type

**Clothing Types Included:**
- T-Shirt, Shirt, Blouse, Longsleeve, Top, Polo
- Hoodie, Blazer, Outwear
- Dress, Pants, Shorts, Skirt
- Shoes, Hat
- Body, Undershirt

---

### 2. `cloudinary-cleanup.js`
Cleans up unused images from Cloudinary storage.

**Usage:**
```bash
node scripts/cloudinary-cleanup.js
```

**Requirements:**
- Cloudinary API credentials in `.env`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

### 3. `purge-old-items.js`
Archives or permanently deletes soft-deleted items older than a specified threshold.

**Usage:**
```bash
node scripts/purge-old-items.js [--days=90] [--dry-run]
```

**Options:**
- `--days=N`: Delete items removed more than N days ago (default: 90)
- `--dry-run`: Preview what would be deleted without actually deleting

---

### 4. `setup-database.sh`
Bash script to run all SQL migrations in order.

**Usage:**
```bash
./scripts/setup-database.sh
```

**Requirements:**
- PostgreSQL client tools (`psql`)
- Supabase database connection string

---

### 5. `validate-migrations.js`
Validates that all SQL migration files are syntactically correct and in proper order.

**Usage:**
```bash
node scripts/validate-migrations.js
```

---

## Setup Instructions

### Prerequisites
1. Install dependencies:
```bash
npm install @supabase/supabase-js dotenv
```

2. Create `.env` file with required variables:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

3. Apply database migrations:
```bash
./scripts/setup-database.sh
```

### First-Time Catalog Setup
```bash
# 1. Ensure migrations are applied
./scripts/setup-database.sh

# 2. Populate catalog
node scripts/populate-catalog.js

# 3. Verify in Supabase dashboard
# Navigate to: Table Editor > catalog_items
```

## Maintenance

### Weekly Tasks
- Run `cloudinary-cleanup.js` to remove orphaned images
- Check catalog item popularity and add trending items

### Monthly Tasks
- Run `purge-old-items.js` to clean up soft-deleted items
- Review and update catalog items based on user feedback

### Quarterly Tasks
- Audit catalog for outdated items
- Add seasonal collections
- Update image URLs if needed

## Troubleshooting

### "Catalog already has items"
The populate script won't overwrite existing data. To repopulate:
1. Delete existing items via Supabase dashboard
2. Run script again

### "Error: Missing environment variables"
Ensure `.env` file exists with all required variables:
```bash
# Check .env file
cat .env

# Verify variables are loaded
node -e "require('dotenv').config(); console.log(process.env.VITE_SUPABASE_URL)"
```

### "Error inserting catalog items"
Check that migrations 005 and 009 are applied:
```bash
# Connect to database
psql $DATABASE_URL

# Check if table exists
\dt catalog_items

# Check columns
\d catalog_items
```

## Contributing

When adding new scripts:
1. Add documentation to this README
2. Include error handling
3. Add console logging for progress tracking
4. Use environment variables for configuration
5. Add dry-run mode for destructive operations

## Resources

- [Supabase Client Documentation](https://supabase.com/docs/reference/javascript/introduction)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Database Schema](../sql/)
