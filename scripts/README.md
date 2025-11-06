# Scripts Directory

This directory contains all utility scripts for StyleSnap organized by category.

## 📁 Directory Structure

### `/catalog/`
Scripts for managing the clothing catalog system.

- **`populate-catalog.js`** - Populate catalog with items from CSV
- **`seed-catalog-from-csv.js`** - Seed catalog from CSV file with Cloudinary upload
- **`process-images.py`** - Process images with background removal and AI detection (Python)
- **`catalog-items-template.csv`** - Template CSV for catalog items

**Usage:**
```bash
# Python: Process images with background removal and AI detection
python scripts/catalog/process-images.py <input_dir> [--output-dir <output_dir>]

# Node.js: Upload processed CSV and images to catalog
node scripts/catalog/seed-catalog-from-csv.js <csv_file> <images_directory>

# Example workflow:
python scripts/catalog/process-images.py my-images --output-dir catalog-output
node scripts/catalog/seed-catalog-from-csv.js catalog-output/catalog-items.csv catalog-output/images
```

### `/cleanup/`
Scripts for cleaning up old data and maintaining database health.

- **`cleanup-notifications.js`** - Clean up expired notifications (7-day retention)
- **`cloudinary-cleanup.js`** - Clean up orphaned Cloudinary images
- **`purge-old-items.js`** - Purge old clothing items (2+ years)
- **`cleanup-test-users.js`** - Clean up test user data

**Usage:**
```bash
npm run cleanup-notifications
npm run cloudinary-cleanup
npm run purge-old-items
```

### `/database/`
Scripts for database management and migrations.

- **`fix-existing-users.js`** - Fix existing user records
- **`fix-user-insert-policy.js`** - Fix user insert policies
- **`validate-migrations.js`** - Validate database migrations
- **`setup-database.sh`** - Setup database environment

**Usage:**
```bash
node scripts/database/validate-migrations.js
bash scripts/database/setup-database.sh
```

### Migration Runner
- **`run-migrations.js`** - 🎯 **Primary migration runner** - Runs all database migrations in correct order

**Usage:**
```bash
node scripts/run-migrations.js
```

**Note:** Individual migration runner scripts have been removed. Use `run-migrations.js` to run all migrations, or run migrations manually via Supabase Dashboard → SQL Editor.

### Test Scripts
Helper scripts for testing and debugging specific functionality:

- **`test-routing.js`** - Tests router guard logic and route configuration
- **`test-router-guard.js`** - Tests router guard implementation (static file analysis)
- **`test-profile-sync.js`** - Tests Google profile synchronization functions (requires DB connection)
- **`test-logout.js`** - Tests logout functionality and spinner behavior
- **`test-logout-timeout.js`** - Tests logout timeout fixes

**Usage:**
```bash
node scripts/test-routing.js
node scripts/test-logout.js
# etc.
```

**Note:** These are debugging/validation scripts that analyze code patterns and test database functions. They don't modify code - they verify implementations.

### `/scraping/`
Scripts for web scraping and data collection.

- **`00sitemap.py`** - Generate sitemap for scraping
- **`01spider.py`** - Web spider for crawling
- **`02downloader.py`** - Download scraped content
- **`03processor.py`** - Process downloaded data
- **`scrape-catalog.py`** - Scrape clothing catalog data
- **`scrape-urls.txt`** - URLs to scrape

**Usage:**
```bash
python scripts/scraping/00sitemap.py
python scripts/scraping/01spider.py
```

### `/utilities/`
General utility scripts.

- **`generate-avatars.sh`** - Generate default avatar images

**Usage:**
```bash
bash scripts/utilities/generate-avatars.sh
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+ (for scraping scripts)
- Database access (for database scripts)

### Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Install Python dependencies (for scraping and catalog processing)
pip install -r scripts/scraping/requirements.txt
```

### Common Operations

#### Catalog Management
```bash
# Process images with background removal and AI detection (Python)
python scripts/catalog/process-images.py my-images --output-dir catalog-output

# Upload processed CSV and images to catalog (Node.js)
node scripts/catalog/seed-catalog-from-csv.js catalog-output/catalog-items.csv catalog-output/images

# Populate catalog from CSV (legacy)
npm run populate-catalog
```

#### Database Maintenance
```bash
# Run all migrations (primary method)
node scripts/run-migrations.js

# Validate migrations
node scripts/database/validate-migrations.js

# Clean up expired notifications
npm run cleanup-notifications

# Clean up old items
npm run purge-old-items
```

#### Data Scraping
```bash
# Run full scraping pipeline
python scripts/scraping/00sitemap.py
python scripts/scraping/01spider.py
python scripts/scraping/02downloader.py
python scripts/scraping/03processor.py
```

## 📋 Script Categories

| Category | Purpose | Frequency |
|----------|---------|-----------|
| **Migration Runner** | Run database migrations | Initial setup / updates |
| **Catalog** | Manage clothing catalog | As needed |
| **Cleanup** | Database maintenance | Daily/Weekly |
| **Database** | Schema management | As needed |
| **Test Scripts** | Debug/validate functionality | As needed |
| **Scraping** | Data collection | Periodic |
| **Utilities** | General tools | As needed |

## 🔧 Configuration

### Environment Variables
Most scripts require these environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Script Options
Many scripts support command-line options:
- `--dry-run` - Preview changes without executing
- `--verbose` - Show detailed output
- `--help` - Show help information

## 📚 Documentation

For detailed documentation on specific scripts, see:
- [Complete Catalog Upload Guide](../docs/guides/CATALOG_UPLOAD_COMPLETE.md) - Full workflow with background removal and AI detection
- [Catalog Seeding Guide](../docs/scripts/CATALOG_SEEDING_QUICKSTART.md)
- [Scripts Documentation](../docs/scripts/scripts-readme.md)
- [Database Guide](../docs/guides/DATABASE_GUIDE.md)
- [Cloudinary Monitoring](../docs/guides/CLOUDINARY_MONITORING.md)

## ⚠️ Safety Notes

- Always run scripts with `--dry-run` first to preview changes
- Backup your database before running cleanup scripts
- Test scripts in development environment before production
- Some scripts require service role permissions

## 🆘 Troubleshooting

### Common Issues
1. **Permission errors** - Ensure proper database permissions
2. **Environment variables** - Check all required variables are set
3. **Dependencies** - Ensure all packages are installed
4. **Network issues** - Check internet connection for scraping scripts

### Getting Help
- Check script documentation in `/docs/scripts/`
- Review error logs for specific issues
- Test with `--dry-run` flag first
- Contact development team for assistance
