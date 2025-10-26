# Scripts Directory

This directory contains all utility scripts for StyleSnap organized by category.

## 📁 Directory Structure

### `/catalog/`
Scripts for managing the clothing catalog system.

- **`populate-catalog.js`** - Populate catalog with items from CSV
- **`seed-catalog-from-csv.js`** - Seed catalog from CSV file
- **`catalog-items-template.csv`** - Template CSV for catalog items

**Usage:**
```bash
npm run populate-catalog
npm run seed-catalog-csv
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
- **`disable-auto-contribution.sql`** - Disable auto-contribution feature

**Usage:**
```bash
node scripts/database/validate-migrations.js
bash scripts/database/setup-database.sh
```

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

# Install Python dependencies (for scraping)
pip install -r requirements.txt
```

### Common Operations

#### Catalog Management
```bash
# Populate catalog from CSV
npm run populate-catalog

# Seed catalog with sample data
npm run seed-catalog-csv
```

#### Database Maintenance
```bash
# Clean up expired notifications
npm run cleanup-notifications

# Clean up old items
npm run purge-old-items

# Validate migrations
node scripts/database/validate-migrations.js
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
| **Catalog** | Manage clothing catalog | As needed |
| **Cleanup** | Database maintenance | Daily/Weekly |
| **Database** | Schema management | As needed |
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
