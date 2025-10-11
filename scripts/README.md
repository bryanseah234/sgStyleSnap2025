# Scripts Documentation

This directory contains utility scripts for database management, maintenance, and setup.

## Available Scripts

### 🆕 1. `scrape-catalog.py` (NEW!)
**AI-powered web scraper** that automatically downloads clothing images from websites, classifies them with machine learning, detects colors, and generates catalog entries.

**Purpose:**
- Automate catalog creation from e-commerce websites
- AI classification using trained ResNet50 model
- Face detection to filter out model photos
- Automatic color detection
- Generate ready-to-upload CSV

**Usage:**
```bash
# 1. Add URLs to scrape
vim scripts/scrape-urls.txt

# 2. Run scraper
python scripts/scrape-catalog.py

# 3. Upload to Supabase
node scripts/seed-catalog-from-csv.js catalog-data/scraped-items.csv catalog-data/images/
```

**Features:**
- 🌐 Scrapes images from any website URL
- 👤 Filters images with faces (no model shots)
- 🧠 AI classification (20 clothing types)
- 🎨 Auto color detection (18 colors)
- 💾 Smart filename generation
- 📝 CSV generation with required fields

**See:** [SCRAPER_GUIDE.md](./SCRAPER_GUIDE.md) for complete documentation

---

### 2. `populate-test-users.js` (NEW!)
Creates test users for testing the friends feature and other social functionality.

**Purpose:**
- Creates 10+ test users with realistic names and emails
- Includes diverse name patterns for search testing
- Creates some test friendships between users
- Provides comprehensive testing instructions

**Usage:**
```bash
node scripts/populate-test-users.js
```

**Requirements:**
- Supabase project set up
- Environment variables configured (`.env` file)
- Database migrations applied
- **Service role key** (recommended) or anon key for bypassing RLS policies

**What it does:**
1. Creates test users with @test.com email addresses
2. Skips users that already exist
3. Creates sample friendships between users
4. Displays detailed testing instructions

**Test Users Created:**
- Alice Johnson, Bob Smith, Carol Davis, etc.
- Diverse names for testing search functionality
- Realistic email addresses for testing

**Cleanup:**
```bash
node scripts/cleanup-test-users.js
```

---

### 3. `populate-catalog.js`
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

### 4. `cloudinary-cleanup.js`
Finds and deletes orphaned images in Cloudinary (images with no database record).

**Purpose:**
- Removes images that were uploaded but never saved to database
- Frees up Cloudinary storage quota
- 7-day grace period to avoid deleting recent uploads

**Usage:**
```bash
# Preview what would be deleted (dry run)
node scripts/cloudinary-cleanup.js --dry-run

# Actually delete orphaned images
node scripts/cloudinary-cleanup.js
```

**Requirements:**
- Supabase service role key in `.env` (not anon key!)
- Cloudinary API credentials in `.env`
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**What it does:**
1. Fetches all images from Cloudinary
2. Fetches all image URLs from database
3. Compares lists to find orphans
4. Filters orphans by grace period (7 days)
5. Deletes orphaned images in batches
6. Reports storage freed

**Safety Features:**
- Dry run mode (preview before deletion)
- 7-day grace period for new uploads
- Confirmation prompt before deletion
- Batch processing to avoid API limits
- Detailed logging and error handling

---

### 5. `purge-old-items.js`
Permanently deletes clothing items older than 2 years (configurable).

**Purpose:**
- Removes stale items to keep database clean
- Deletes both database records and Cloudinary images
- Configurable age threshold (default: 730 days / 2 years)

**Usage:**
```bash
# Preview what would be deleted (dry run)
node scripts/purge-old-items.js --dry-run

# Actually delete old items
node scripts/purge-old-items.js

# Custom age threshold (1 year)
MAX_AGE_DAYS=365 node scripts/purge-old-items.js
```

**Requirements:**
- Supabase service role key in `.env` (not anon key!)
- Cloudinary API credentials in `.env`
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Environment Variables:**
- `MAX_AGE_DAYS`: Age threshold in days (default: 730)

**What it does:**
1. Calculates cutoff date (now - MAX_AGE_DAYS)
2. Queries items older than cutoff date
3. For each old item:
   - Deletes image from Cloudinary
   - Deletes item from database
4. Reports deletion summary

**Safety Features:**
- Dry run mode (preview before deletion)
- Confirmation prompt before deletion
- Batch processing
- Transaction-safe deletion
- Detailed logging and error handling

---

### 6. `setup-database.sh`
Bash script to run all SQL migrations in order.

**Usage:**
```bash
./scripts/setup-database.sh
```

**Requirements:**
- PostgreSQL client tools (`psql`)
- Supabase database connection string

---

### 7. `validate-migrations.js`
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
SUPABASE_SERVICE_KEY=your-service-key  # Required for admin operations like creating test users
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

## Scheduling Maintenance Scripts

The `purge-old-items.js` and `cloudinary-cleanup.js` scripts should be run automatically on a schedule.

### Option 1: GitHub Actions (Recommended)

Create `.github/workflows/maintenance.yml`:

```yaml
name: Scheduled Maintenance

on:
  schedule:
    # Run purge script monthly (1st of month at 2 AM UTC)
    - cron: '0 2 1 * *'
    # Run cleanup script weekly (every Sunday at 3 AM UTC)
    - cron: '0 3 * * 0'
  workflow_dispatch: # Allow manual runs

jobs:
  purge-old-items:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 2 1 * *' || github.event_name == 'workflow_dispatch'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - name: Purge old items
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          CLOUDINARY_CLOUD_NAME: ${{ secrets.CLOUDINARY_CLOUD_NAME }}
          CLOUDINARY_API_KEY: ${{ secrets.CLOUDINARY_API_KEY }}
          CLOUDINARY_API_SECRET: ${{ secrets.CLOUDINARY_API_SECRET }}
        run: node scripts/purge-old-items.js

  cleanup-cloudinary:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 3 * * 0' || github.event_name == 'workflow_dispatch'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - name: Cleanup Cloudinary
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          CLOUDINARY_CLOUD_NAME: ${{ secrets.CLOUDINARY_CLOUD_NAME }}
          CLOUDINARY_API_KEY: ${{ secrets.CLOUDINARY_API_KEY }}
          CLOUDINARY_API_SECRET: ${{ secrets.CLOUDINARY_API_SECRET }}
        run: node scripts/cloudinary-cleanup.js
```

**Setup:**
1. Add secrets to GitHub repository settings
2. Navigate to: Settings > Secrets and variables > Actions
3. Add these secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY` (service role key, not anon key!)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### Option 2: Cron Jobs (Linux Server)

Add to crontab (`crontab -e`):

```bash
# Purge old items - Monthly (1st of month at 2 AM)
0 2 1 * * cd /path/to/sgStyleSnap2025 && node scripts/purge-old-items.js >> /var/log/stylesnap-purge.log 2>&1

# Cleanup Cloudinary - Weekly (every Sunday at 3 AM)
0 3 * * 0 cd /path/to/sgStyleSnap2025 && node scripts/cloudinary-cleanup.js >> /var/log/stylesnap-cleanup.log 2>&1
```

**Setup:**
1. Set environment variables in `~/.bashrc` or `~/.profile`
2. Ensure log directory exists: `sudo mkdir -p /var/log && sudo chmod 755 /var/log`
3. Test manually first: `node scripts/purge-old-items.js --dry-run`

### Option 3: Render Cron Jobs (Render.com)

If hosting on Render.com, use their Cron Jobs feature:

1. Create new Cron Job in Render dashboard
2. Command: `node scripts/purge-old-items.js`
3. Schedule: `0 2 1 * *` (monthly)
4. Add environment variables
5. Create another for `cloudinary-cleanup.js` with schedule `0 3 * * 0`

### Recommended Schedule

| Script | Frequency | Schedule | Reason |
|--------|-----------|----------|--------|
| `purge-old-items.js` | Monthly | 1st at 2 AM | Items older than 2 years, infrequent |
| `cloudinary-cleanup.js` | Weekly | Sunday at 3 AM | Failed uploads, more frequent |

**Testing scheduled jobs:**
```bash
# Test purge script (dry run)
node scripts/purge-old-items.js --dry-run

# Test cleanup script (dry run)
node scripts/cloudinary-cleanup.js --dry-run

# Verify environment variables are loaded
node -e "console.log(process.env.SUPABASE_SERVICE_KEY ? 'OK' : 'MISSING')"
```

## Maintenance

### Weekly Tasks
- `cloudinary-cleanup.js` runs automatically (scheduled)
- Check catalog item popularity and add trending items

### Monthly Tasks
- `purge-old-items.js` runs automatically (scheduled)
- Review and update catalog items based on user feedback

### Quarterly Tasks
- Audit catalog for outdated items
- Add seasonal collections
- Update image URLs if needed
- Review maintenance script logs for errors

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
