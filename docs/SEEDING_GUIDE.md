# Catalog Seeding Guide

## 📋 Overview

This guide covers the complete CSV-based catalog seeding system for StyleSnap, which allows administrators to bulk upload clothing items from a CSV file with automatic Cloudinary image upload.

## 🎯 Key Features

### 1. **Bulk Upload Capability**
- Upload hundreds of clothing items in minutes
- Automatic image upload to Cloudinary
- Database insertion with validation
- Comprehensive error reporting

### 2. **Privacy & Ownership**
- All seeded items default to `public` visibility
- Users automatically don't see items they already own
- RLS policies ensure proper access control

### 3. **Robust Validation**
- CSV schema validation
- Image file verification
- Duplicate detection
- Graceful error handling

## 🚀 Quick Start

### Prerequisites

1. **Environment Variables** (in `.env`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

2. **Database Migration**:
```bash
# Ensure migration 011 is applied
psql $DATABASE_URL -f sql/011_catalog_enhancements.sql
```

3. **Dependencies**:
```bash
npm install
```

### Basic Usage

```bash
# 1. Prepare your data
mkdir my-catalog
mkdir my-catalog/images
# Add your images to my-catalog/images/

# 2. Create CSV file (see template below)
# Save as my-catalog/items.csv

# 3. Run the seeder
node scripts/seed-catalog-from-csv.js my-catalog/items.csv my-catalog/images/
```

## 📄 CSV Format

### Required Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | Text | ✅ | Item name (e.g., "Classic White Tee") |
| `image_filename` | Text | ✅ | Filename in images directory (e.g., "shirt.jpg") |

### Optional Columns

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `clothing_type` | Text | NULL | One of 20 valid types (see below) |
| `category` | Text | NULL | `top`, `bottom`, `footwear`, `outerwear`, `accessory` |
| `brand` | Text | NULL | Brand name (e.g., "Uniqlo") |
| `size` | Text | NULL | Size (e.g., "M", "32x32") |
| `primary_color` | Text | NULL | Main color (e.g., "blue") |
| `secondary_colors` | Text | NULL | Pipe-separated colors (e.g., "red\|white") |
| `style_tags` | Text | NULL | Pipe-separated tags (e.g., "casual\|formal") |
| `weather_tags` | Text | NULL | Pipe-separated tags (e.g., "warm\|hot") |
| `season` | Text | NULL | `spring`, `summer`, `fall`, `winter`, `all` |
| `description` | Text | NULL | Item description |
| `privacy` | Text | `public` | `public`, `friends`, `private` |

### Valid Clothing Types

```
T-Shirt, Shirt, Blouse, Sweater, Jacket, Coat, Dress, Skirt,
Pants, Jeans, Shorts, Shoes, Boots, Sneakers, Sandals,
Hat, Scarf, Belt, Bag, Jewelry
```

### CSV Template

```csv
name,clothing_type,category,brand,size,primary_color,secondary_colors,style_tags,weather_tags,season,description,image_filename,privacy
Classic White Tee,T-Shirt,top,Uniqlo,M,white,,casual|basic,warm|hot,summer,Essential crew neck tee,white-tee.jpg,public
Dark Denim Jeans,Jeans,bottom,Levi's,32x32,blue,,casual|classic,cool|warm,all,Versatile dark denim,jeans.jpg,public
Leather Jacket,Jacket,outerwear,Zara,L,black,,edgy|cool,cool|cold,fall,Classic black leather,jacket.jpg,public
Running Shoes,Sneakers,footwear,Nike,10,white,black|red,sporty|athletic,warm|hot,all,Comfortable running shoes,shoes.jpg,public
Summer Dress,Dress,top,H&M,S,yellow,white,floral|feminine,hot,summer,Light floral pattern,dress.jpg,public
```

## 🖼️ Image Requirements

### Supported Formats
- JPG/JPEG
- PNG
- WEBP

### Recommendations
- **Resolution:** At least 800x800px
- **Aspect Ratio:** Square or 3:4 portrait
- **File Size:** Under 5MB per image
- **Background:** Plain or transparent preferred
- **Lighting:** Even, well-lit photos

### File Organization

```
my-catalog/
├── items.csv
└── images/
    ├── white-tee.jpg
    ├── jeans.jpg
    ├── jacket.jpg
    ├── shoes.jpg
    └── dress.jpg
```

**Important:** Filenames in CSV must exactly match image files (case-sensitive).

## 🔧 The Seeding Script

### Script Location
```
scripts/seed-catalog-from-csv.js
```

### Command Syntax
```bash
node scripts/seed-catalog-from-csv.js <csv_file> <images_directory>
```

### What It Does

1. **Validates Environment**
   - Checks for required environment variables
   - Verifies Supabase and Cloudinary credentials

2. **Parses CSV**
   - Reads and validates CSV structure
   - Checks for required columns
   - Validates data types and values

3. **Validates Images**
   - Verifies each image file exists
   - Checks file accessibility

4. **Uploads to Cloudinary**
   - Uploads each image with automatic thumbnail generation
   - Stores `cloudinary_public_id` for management

5. **Inserts to Database**
   - Creates records in `catalog_items` table
   - Handles duplicates gracefully
   - Reports success/failure for each item

### Example Output

```
🌱 StyleSnap Catalog Seeder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CSV File: /path/to/items.csv
Images Directory: /path/to/images
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 Reading CSV file: /path/to/items.csv
✅ Parsed 5 items from CSV

🔄 Processing 5 catalog items...

[1/5] Processing: Classic White Tee
  📤 Uploading white-tee.jpg to Cloudinary...
  ✅ Uploaded: https://res.cloudinary.com/.../white-tee.jpg
  ✅ Added: Classic White Tee (ID: abc123)

[2/5] Processing: Dark Denim Jeans
  📤 Uploading jeans.jpg to Cloudinary...
  ✅ Uploaded: https://res.cloudinary.com/.../jeans.jpg
  ✅ Added: Dark Denim Jeans (ID: def456)

... (3 more items)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Successfully added: 5
❌ Failed: 0

🎉 Catalog seeding complete!
Users can now browse these items at /catalog
```

## 🗄️ Database Schema

### Table: `catalog_items`

The seeder populates the following columns:

```sql
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  clothing_type VARCHAR(50),
  category VARCHAR(50),
  brand VARCHAR(100),
  size VARCHAR(20),
  primary_color VARCHAR(50),
  secondary_colors TEXT[],
  style_tags TEXT[],
  weather_tags TEXT[],
  season VARCHAR(20),
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  cloudinary_public_id TEXT,
  privacy VARCHAR(20) DEFAULT 'public',
  is_active BOOLEAN DEFAULT true,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### RPC Function: `get_catalog_excluding_owned`

Automatically filters out items the user already owns:

```sql
get_catalog_excluding_owned(
  user_id_param UUID,
  category_filter VARCHAR(50),
  color_filter VARCHAR(50),
  brand_filter VARCHAR(100),
  season_filter VARCHAR(20),
  page_limit INTEGER,
  page_offset INTEGER
)
```

**How It Works:**
1. Checks if user has item in their `clothes` table
2. Filters out items where `clothes.catalog_item_id` matches
3. Only returns items user doesn't already own
4. Supports filtering and pagination

## 🔒 Privacy & Security

### Privacy Levels

| Level | Description | Visibility |
|-------|-------------|------------|
| `public` | Default for seeded items | All users |
| `friends` | Friends-only | Future feature |
| `private` | User-only | Future feature |

### Row Level Security (RLS)

The `catalog_items` table has RLS policies that:
- Allow all users to read `public` items
- Hide `friends` and `private` items from catalog browsing
- Prevent unauthorized modifications

### Ownership Filtering

- Catalog items have no `owner_id` (anonymous)
- Users can't see items they already own in their closet
- Filtering happens automatically via RPC function
- No UI changes required

## 🐛 Troubleshooting

### Common Issues

#### 1. Missing Environment Variables
```
Error: Missing required environment variable: VITE_CLOUDINARY_CLOUD_NAME
```
**Solution:** Check your `.env` file has all required variables.

#### 2. Image Not Found
```
Error: Image file not found: images/shirt.jpg
```
**Solution:** Verify the image filename in CSV matches the actual file (case-sensitive).

#### 3. Invalid Clothing Type
```
Error: Invalid clothing_type "tshirt". Must be one of: T-Shirt, Shirt, ...
```
**Solution:** Use exact spelling from valid types list (case-sensitive).

#### 4. Cloudinary Upload Failed
```
Error: Failed to upload image to Cloudinary
```
**Solution:** 
- Verify `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`
- Check preset is set to "unsigned" in Cloudinary dashboard
- Ensure image file is valid and under 10MB

#### 5. Duplicate Items
```
Skipping: Classic White Tee (already exists)
```
**Solution:** This is normal. Script detects duplicates by name and skips them.

### Debug Mode

For detailed error logs:
```bash
DEBUG=true node scripts/seed-catalog-from-csv.js items.csv images/
```

## 📊 Complete Example Workflow

### Step 1: Prepare Data Structure

```bash
mkdir fashion-catalog
cd fashion-catalog
mkdir images
```

### Step 2: Download/Add Images

```bash
# Copy your images to the images directory
cp ~/Downloads/clothing-photos/* images/
```

### Step 3: Create CSV File

Create `items.csv`:

```csv
name,clothing_type,category,brand,size,primary_color,secondary_colors,style_tags,weather_tags,season,description,image_filename,privacy
Essential White Tee,T-Shirt,top,Uniqlo,M,white,,casual|basic,warm|hot,summer,Soft cotton crew neck,white-tee.jpg,public
Classic Blue Jeans,Jeans,bottom,Levi's,32x32,blue,,casual|timeless,all,all,501 original fit,jeans.jpg,public
Black Leather Jacket,Jacket,outerwear,Zara,L,black,,edgy|rock,cool|cold,fall,Genuine leather moto jacket,jacket.jpg,public
White Canvas Sneakers,Sneakers,footwear,Converse,10,white,,casual|versatile,warm|hot,all,Chuck Taylor All Star,sneakers.jpg,public
Striped T-Shirt,T-Shirt,top,H&M,M,white,navy,nautical|casual,warm,summer,Navy and white stripes,striped-tee.jpg,public
Khaki Chinos,Pants,bottom,Gap,32x32,khaki,,smart-casual,all,all,Slim fit cotton chinos,chinos.jpg,public
Running Shoes,Sneakers,footwear,Nike,10,black,white|red,sporty|athletic,all,all,Air Max performance,running-shoes.jpg,public
Denim Jacket,Jacket,outerwear,Levi's,L,blue,,casual|classic,cool,spring,Light wash trucker jacket,denim-jacket.jpg,public
Black Dress Shoes,Shoes,footwear,Clarks,10,black,,formal|business,all,all,Oxford leather shoes,dress-shoes.jpg,public
Grey Hoodie,Sweater,top,Champion,L,grey,,casual|sporty,cool|cold,fall,Reverse weave hoodie,hoodie.jpg,public
```

### Step 4: Run Seeder

```bash
cd /workspaces/sgStyleSnap2025
node scripts/seed-catalog-from-csv.js \
  fashion-catalog/items.csv \
  fashion-catalog/images/
```

### Step 5: Verify Results

```bash
# Check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM catalog_items WHERE privacy = 'public';"

# Or use Supabase dashboard
# Navigate to Table Editor > catalog_items
```

### Step 6: Test in App

1. Open your app at `http://localhost:5173`
2. Navigate to `/catalog`
3. Verify items appear
4. Add an item to your closet
5. Verify it disappears from catalog (owned item filtering)

## 🔄 Re-running the Seeder

The seeder is **idempotent** - safe to run multiple times:

- Detects duplicates by `name` field
- Skips items that already exist
- Only adds new items
- Reports skipped duplicates in summary

To re-seed with updates:
1. Delete old items from database
2. Re-run seeder with updated CSV

```sql
-- Delete all catalog items (careful!)
DELETE FROM catalog_items WHERE privacy = 'public';
```

## 📈 Best Practices

### 1. **Start Small**
- Test with 5-10 items first
- Verify everything works correctly
- Then scale up to full catalog

### 2. **Organize Images**
- Use descriptive filenames
- Keep naming consistent (e.g., `brand-type-color.jpg`)
- Avoid spaces in filenames

### 3. **Data Quality**
- Fill in as many optional fields as possible
- Consistent brand naming (e.g., always "Levi's", not "Levis")
- Accurate color names

### 4. **Backup First**
- Export existing catalog before major changes
- Keep CSV files for records
- Test in development environment first

### 5. **Use Templates**
- Start with `scripts/catalog-items-template.csv`
- Duplicate and modify for your needs
- Maintain multiple templates for different categories

## 🎯 NPM Script

Add to your workflow:

```bash
# Using npm script
npm run seed-catalog-csv items.csv images/

# Equivalent to
node scripts/seed-catalog-from-csv.js items.csv images/
```

Defined in `package.json`:
```json
{
  "scripts": {
    "seed-catalog-csv": "node scripts/seed-catalog-from-csv.js"
  }
}
```

## 📚 Related Documentation

- **[CATALOG_SEEDING.md](./CATALOG_SEEDING.md)** - Detailed technical documentation
- **[CATALOG_GUIDE.md](./CATALOG_GUIDE.md)** - Catalog feature overview
- **[DATABASE_GUIDE.md](./DATABASE_GUIDE.md)** - Database schema reference
- **[scripts/CATALOG_SEEDING_QUICKSTART.md](../scripts/CATALOG_SEEDING_QUICKSTART.md)** - Quick reference guide

## 🆘 Getting Help

If you encounter issues:

1. **Check Documentation**
   - Review this guide thoroughly
   - Check related guides above

2. **Verify Setup**
   - Environment variables correct?
   - Database migration applied?
   - Images in correct location?

3. **Test with Template**
   - Use `scripts/catalog-items-template.csv`
   - Verify basic functionality works

4. **File an Issue**
   - Include error messages
   - Share CSV sample (anonymized)
   - Provide environment details

## 🚀 Future Enhancements

Planned improvements:

- [ ] Support for remote image URLs (skip local upload)
- [ ] Batch processing for very large datasets (1000+ items)
- [ ] Progress bar for long uploads
- [ ] Dry-run mode (validate without inserting)
- [ ] CSV export of existing catalog items
- [ ] Admin UI for catalog management
- [ ] Automatic image optimization
- [ ] Multi-language support

## ✅ Summary

The catalog seeding system provides:

- ✅ Efficient bulk upload of clothing items
- ✅ Automatic Cloudinary image management
- ✅ Comprehensive validation and error handling
- ✅ Privacy-aware catalog browsing
- ✅ Automatic filtering of owned items
- ✅ Production-ready and thoroughly documented

Start seeding your catalog today and provide users with a rich shopping experience!

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Maintainer:** StyleSnap Team
