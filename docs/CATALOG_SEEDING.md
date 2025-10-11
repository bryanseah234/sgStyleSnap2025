# Catalog Seeding Guide

This guide explains how to populate the StyleSnap catalog with clothing items using a CSV file and image directory.

## 📋 Overview

The catalog seeding system allows you to:
- Upload clothing items in bulk from a CSV file
- Automatically upload images to Cloudinary
- Populate the `catalog_items` database table
- Set items as public by default
- Prevent users from seeing items they already own

## 🚀 Quick Start

### 1. Prepare Your Data

Create a CSV file with your catalog items using the provided template:

```bash
# Copy the template
cp scripts/catalog-items-template.csv my-catalog-items.csv
```

Edit `my-catalog-items.csv` with your clothing data.

### 2. Organize Your Images

Place all product images in a directory:

```bash
mkdir catalog-images
# Add your images: white-tshirt.jpg, denim-jacket.jpg, etc.
```

**Important:** Image filenames in the CSV must match the actual files in the directory.

### 3. Install Dependencies

```bash
npm install csv-parse form-data node-fetch
```

### 4. Run the Seeder

```bash
node scripts/seed-catalog-from-csv.js ./my-catalog-items.csv ./catalog-images/
```

## 📝 CSV Format

### Required Columns

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `name` | String | Item name | `Classic White T-Shirt` |
| `image_filename` | String | Image file name | `white-tshirt.jpg` |

### Optional Columns

| Column | Type | Description | Valid Values | Example |
|--------|------|-------------|--------------|---------|
| `clothing_type` | String | Specific clothing type | See [Clothing Types](#clothing-types) | `T-Shirt` |
| `category` | String | Broad category | `top`, `bottom`, `outerwear`, `shoes`, `accessory` | `top` |
| `brand` | String | Brand name | Any string | `Uniqlo` |
| `size` | String | Size | Any string | `M`, `32x34` |
| `primary_color` | String | Main color | Any color name | `white` |
| `secondary_colors` | String (pipe-delimited) | Additional colors | Pipe-separated colors | `navy\|white` |
| `style_tags` | String (pipe-delimited) | Style keywords | Pipe-separated tags | `casual\|basic` |
| `weather_tags` | String (pipe-delimited) | Weather suitability | Pipe-separated tags | `warm\|hot` |
| `season` | String | Suitable season | `spring`, `summer`, `fall`, `winter`, `all` | `summer` |
| `description` | String | Item description | Any text | `Essential crew neck tee` |
| `privacy` | String | Visibility level | `public`, `friends`, `private` | `public` (default) |

### CSV Example

```csv
name,clothing_type,category,brand,size,primary_color,secondary_colors,style_tags,weather_tags,season,description,image_filename,privacy
Classic White T-Shirt,T-Shirt,top,Uniqlo,M,white,,casual|basic,warm|hot,summer,Essential white crew neck t-shirt,white-tshirt.jpg,public
Blue Denim Jacket,Outwear,outerwear,Levi's,L,blue,,casual|classic,cool|warm,spring,Classic denim jacket perfect for layering,denim-jacket.jpg,public
```

## 👕 Clothing Types

The system supports 20 specific clothing types:

| Type | Category Mapping | Description |
|------|-----------------|-------------|
| `Blazer` | outerwear | Formal jackets |
| `Blouse` | top | Dress shirts for women |
| `Body` | top | Bodysuits |
| `Dress` | top | One-piece dresses |
| `Hat` | accessory | Headwear |
| `Hoodie` | outerwear | Hooded sweatshirts |
| `Longsleeve` | top | Long-sleeve tops |
| `Not sure` | top | Undefined items |
| `Other` | accessory | Miscellaneous |
| `Outwear` | outerwear | Coats and jackets |
| `Pants` | bottom | Trousers and jeans |
| `Polo` | top | Polo shirts |
| `Shirt` | top | Button-up shirts |
| `Shoes` | shoes | Footwear |
| `Shorts` | bottom | Short pants |
| `Skip` | top | Items to skip |
| `Skirt` | bottom | Skirts |
| `T-Shirt` | top | T-shirts |
| `Top` | top | General tops |
| `Undershirt` | top | Base layers |

**Note:** If `clothing_type` is not specified, the item will use the `category` field.

## 🖼️ Image Requirements

### Supported Formats
- JPEG/JPG
- PNG
- WebP
- GIF

### Recommended Specifications
- **Resolution:** 1200x1200px minimum
- **Aspect Ratio:** Square (1:1) preferred
- **File Size:** Under 5MB per image
- **Background:** Clean, solid color preferred

### Image Naming
- Use descriptive, lowercase filenames
- Separate words with hyphens: `white-cotton-tshirt.jpg`
- Match exactly with CSV `image_filename` column (case-sensitive)

## 🔧 Environment Variables

Ensure these variables are set in your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to **Settings** → **Upload**
3. Create an **unsigned upload preset**:
   - Name: `stylesnap-catalog` (or your choice)
   - Mode: **Unsigned**
   - Folder: `catalog-items` (optional)
4. Copy the cloud name and preset to your `.env` file

## 📊 Database Schema

The seeder populates the `catalog_items` table with these columns:

```sql
catalog_items (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  clothing_type VARCHAR(50),
  category VARCHAR(50) NOT NULL,
  brand VARCHAR(100),
  size VARCHAR(20),
  primary_color VARCHAR(50),
  secondary_colors TEXT[],
  style TEXT[],
  tags TEXT[],
  season VARCHAR(20),
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  privacy VARCHAR(20) DEFAULT 'public',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🔒 Privacy & Ownership

### Default Privacy
All catalog items are set to **`public`** by default, making them visible to all users.

### User Ownership
- **Critical:** The `catalog_items` table has **no owner_id column**
- Items are displayed anonymously (no attribution)
- Users cannot see which items are admin-uploaded vs user-contributed

### Preventing Duplicates
Users are automatically prevented from seeing catalog items they already own:

```sql
-- RPC function filters out owned items
SELECT * FROM get_catalog_excluding_owned(user_id);
```

This is implemented in:
- SQL: `sql/011_catalog_enhancements.sql` (RPC function)
- Service: `src/services/catalog-service.js` (browse method)

## 🎯 Usage Examples

### Basic Seeding
```bash
node scripts/seed-catalog-from-csv.js catalog.csv images/
```

### With Relative Paths
```bash
node scripts/seed-catalog-from-csv.js ./data/items.csv ./data/photos/
```

### With Absolute Paths
```bash
node scripts/seed-catalog-from-csv.js /home/user/catalog.csv /home/user/images/
```

## ⚠️ Troubleshooting

### Error: CSV file not found
- Verify the CSV path is correct
- Use absolute paths or relative paths from project root

### Error: Images directory not found
- Ensure the directory exists and contains images
- Check directory path spelling

### Error: Image not found: [filename]
- Verify image filename matches CSV exactly (case-sensitive)
- Check file extension (.jpg vs .jpeg)

### Error: Invalid clothing_type
- Use exact values from [Clothing Types](#clothing-types)
- Check for typos (case-sensitive)

### Error: Cloudinary upload failed
- Verify `VITE_CLOUDINARY_CLOUD_NAME` is correct
- Ensure upload preset is **unsigned**
- Check internet connection

### Error: Duplicate item
- Item already exists in database
- Use a different name or check existing items first

## 📈 Monitoring & Verification

### Check Seeded Items in Database

```sql
-- Count catalog items
SELECT COUNT(*) FROM catalog_items WHERE is_active = true;

-- View items by clothing type
SELECT clothing_type, COUNT(*) 
FROM catalog_items 
WHERE is_active = true 
GROUP BY clothing_type;

-- View recent additions
SELECT name, clothing_type, brand, created_at 
FROM catalog_items 
ORDER BY created_at DESC 
LIMIT 10;
```

### View in Application

Navigate to `/catalog` in the StyleSnap application to browse seeded items.

## 🔄 Re-running the Seeder

The seeder is **idempotent-safe** - you can run it multiple times:

- **Duplicate detection:** Items with the same details will be skipped
- **New items:** Only new items will be added
- **Failed items:** Previously failed items can be retried

## 📚 Additional Resources

- [Cloudinary Upload Presets](https://cloudinary.com/documentation/upload_presets)
- [CSV Format Specification](https://tools.ietf.org/html/rfc4180)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review error messages carefully
3. Verify all environment variables are set
4. Ensure database migrations are up to date:
   ```bash
   # Run migrations in order
   psql -f sql/005_catalog_system.sql
   psql -f sql/009_clothing_types.sql
   psql -f sql/011_catalog_enhancements.sql
   ```

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-XX  
**Maintained by:** StyleSnap Team
