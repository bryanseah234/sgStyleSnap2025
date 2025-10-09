# Complete Catalog Seeding Guide - StyleSnap

> **Purpose:** Bulk upload clothing items to the StyleSnap catalog from a CSV file with automatic image upload to Cloudinary.

---

## 📑 Table of Contents

1. [Quick Start](#-quick-start)
2. [Directory Structure](#-directory-structure)
3. [CSV Format Reference](#-csv-format-reference)
4. [Image Guidelines](#-image-guidelines)
5. [Environment Setup](#-environment-setup)
6. [How Image Storage Works](#-how-image-storage-works)
7. [Clothing Types Reference](#-clothing-types-reference)
8. [Database Schema](#-database-schema)
9. [Privacy & Ownership](#-privacy--ownership)
10. [Usage Examples](#-usage-examples)
11. [Troubleshooting](#-troubleshooting)
12. [Verification & Monitoring](#-verification--monitoring)

---

## 🚀 Quick Start

### Three Simple Steps

**1. Prepare Your Data Structure**

```bash
# Navigate to repository root
cd /workspaces/sgStyleSnap2025

# Create catalog data directory
mkdir -p catalog-data/images

# Your structure should look like:
# catalog-data/
# ├── my-items.csv          ← Your CSV file
# └── images/               ← Your local images
#     ├── white-tee.jpg
#     ├── denim-jacket.jpg
#     └── ...
```

**2. Create Your CSV File**

```bash
# Option 1: Copy the template
cp scripts/catalog-items-template.csv catalog-data/my-items.csv

# Option 2: Create from scratch
cat > catalog-data/my-items.csv << 'EOF'
name,clothing_type,category,brand,size,primary_color,secondary_colors,style_tags,weather_tags,season,description,image_filename,privacy
White T-Shirt,T-Shirt,top,Uniqlo,M,white,,casual|basic,warm|hot,summer,Essential crew neck tee,white-tee.jpg,public
Denim Jacket,Outwear,outerwear,Levi's,L,blue,,casual|classic,cool|warm,spring,Classic denim jacket,denim-jacket.jpg,public
Black Pants,Pants,bottom,H&M,32,black,,formal|business,cool|warm,all,Slim fit dress pants,black-pants.jpg,public
White Sneakers,Shoes,shoes,Nike,10,white,,casual|athletic,warm|hot,all,Classic white sneakers,sneakers.png,public
EOF

# Then add matching image files to catalog-data/images/
```

**3. Run the Seeding Script**

```bash
# From repository root
node scripts/seed-catalog-from-csv.js catalog-data/my-items.csv catalog-data/images/

# Or use npm script
npm run seed-catalog-csv -- catalog-data/my-items.csv catalog-data/images/
```

**Expected Output:**
```
📖 Reading CSV file: catalog-data/my-items.csv
✅ Parsed 4 items from CSV

Processing item 1/4: White T-Shirt
  📤 Uploading white-tee.jpg to Cloudinary...
  ✅ Uploaded: https://res.cloudinary.com/.../white-tee.jpg
  ✅ Inserted into database

... (continues for all items)

✅ Successfully added: 4
❌ Failed: 0
⚠️  Duplicates: 0
```

---

## 📁 Directory Structure

### Complete Repository Structure

```
sgStyleSnap2025/                          # Repository root
│
├── .env.local                            # ⚠️ REQUIRED: Environment variables
│   # Must contain:
│   # VITE_SUPABASE_URL=https://xxx.supabase.co
│   # VITE_SUPABASE_ANON_KEY=your-anon-key
│   # VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
│   # VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
│
├── package.json
├── .gitignore                            # Already configured to ignore images
│
├── scripts/                              # Seeding scripts
│   ├── seed-catalog-from-csv.js         # ⭐ Main seeding script
│   ├── catalog-items-template.csv       # CSV template
│   └── README.md
│
├── docs/                                 # Documentation
│   └── CATALOG_SEEDING_COMPLETE.md      # ⭐ This file
│
├── sql/                                  # Database migrations
│   ├── 005_catalog_system.sql           # Catalog table schema
│   ├── 009_clothing_types.sql           # Clothing types enum
│   └── 011_catalog_enhancements.sql     # RPC functions
│
├── src/                                  # Vue.js application
│   ├── pages/
│   │   └── Catalog.vue                  # Catalog browsing page
│   └── services/
│       └── catalog-service.js           # Catalog API service
│
└── catalog-data/                         # ⭐ YOUR DATA GOES HERE
    ├── README.md                         # Directory guide
    ├── my-items.csv                      # ⭐ Your CSV file
    └── images/                           # ⭐ Your local images
        ├── white-tee.jpg                 # Referenced in CSV
        ├── denim-jacket.jpg              # Referenced in CSV
        ├── black-pants.jpg               # Referenced in CSV
        └── sneakers.png                  # Referenced in CSV
```

### Alternative Directory Structures

**Option 1: Separate Data Repository (Recommended for large catalogs)**

```
/workspaces/
├── sgStyleSnap2025/                      # Main app repo
│   └── scripts/seed-catalog-from-csv.js
│
└── stylesnap-catalog-data/               # Separate data repo
    ├── summer-collection/
    │   ├── items.csv
    │   └── images/
    ├── winter-collection/
    │   ├── items.csv
    │   └── images/
    └── accessories/
        ├── items.csv
        └── images/

# Run from app directory with relative paths:
cd /workspaces/sgStyleSnap2025
node scripts/seed-catalog-from-csv.js \
  ../stylesnap-catalog-data/summer-collection/items.csv \
  ../stylesnap-catalog-data/summer-collection/images/
```

**Option 2: Multiple Collections**

```
catalog-data/
├── collection-1/
│   ├── items.csv
│   └── images/
├── collection-2/
│   ├── items.csv
│   └── images/
└── collection-3/
    ├── items.csv
    └── images/

# Seed each collection separately
node scripts/seed-catalog-from-csv.js catalog-data/collection-1/items.csv catalog-data/collection-1/images/
node scripts/seed-catalog-from-csv.js catalog-data/collection-2/items.csv catalog-data/collection-2/images/
```

---

## 📋 CSV Format Reference

### Required Columns

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `name` | String | Item display name | `Classic White T-Shirt` |
| `image_filename` | String | **Local image filename** (case-sensitive!) | `white-tee.jpg` |

### Optional Columns

| Column | Type | Valid Values | Example | Notes |
|--------|------|--------------|---------|-------|
| `clothing_type` | String | See [Clothing Types](#-clothing-types-reference) | `T-Shirt` | One of 20 predefined types |
| `category` | String | `top`, `bottom`, `outerwear`, `shoes`, `accessory` | `top` | Broad category |
| `brand` | String | Any text | `Uniqlo` | Brand name |
| `size` | String | Any format | `M`, `32x34`, `EU 42` | Freeform text |
| `primary_color` | String | Any color name | `white`, `navy blue` | Main color |
| `secondary_colors` | String | Pipe-delimited: `color1\|color2` | `navy\|white` | Additional colors |
| `style_tags` | String | Pipe-delimited: `tag1\|tag2` | `casual\|minimalist` | Style keywords |
| `weather_tags` | String | Pipe-delimited: `tag1\|tag2` | `warm\|hot` | Weather suitability |
| `season` | String | `spring`, `summer`, `fall`, `winter`, `all` | `summer` | Best season |
| `description` | Text | Any text | `Essential white crew neck tee` | Item description |
| `privacy` | String | `public`, `friends`, `private` | `public` | Default: `public` |

### CSV Example

```csv
name,clothing_type,category,brand,size,primary_color,secondary_colors,style_tags,weather_tags,season,description,image_filename,privacy
Classic White T-Shirt,T-Shirt,top,Uniqlo,M,white,,casual|basic,warm|hot,summer,Essential white crew neck t-shirt,white-tee.jpg,public
Blue Denim Jacket,Outwear,outerwear,Levi's,L,blue,,casual|classic,cool|warm,spring,Classic denim jacket perfect for layering,denim-jacket.jpg,public
Black Dress Pants,Pants,bottom,H&M,32,black,,formal|business,cool|warm,all,Slim fit dress pants for office,black-pants.jpg,public
White Canvas Sneakers,Shoes,shoes,Nike,10,white,gray,casual|athletic,warm|hot,all,Classic white sneakers with gray accents,sneakers.png,public
```

### Field Notes

- **Pipe-delimited fields**: Use `|` to separate multiple values: `tag1|tag2|tag3`
- **Empty optional fields**: Leave blank (two commas: `,,`)
- **Quotes**: Use if values contain commas: `"Red, White, Blue"`
- **Case sensitivity**: 
  - `image_filename` is case-sensitive (must match actual file)
  - `clothing_type` values are case-sensitive (use exact spelling)
  - Color/tag values are case-insensitive

---

## 🎨 Image Guidelines

### Critical Information

**⚠️ IMPORTANT: `image_filename` refers to LOCAL files on your computer!**

The CSV references **local image files** that you have on disk. The seeding script will:
1. Read the image from your local directory
2. Upload it to **Cloudinary** (cloud CDN storage)
3. Store the **Cloudinary URL** in **Supabase database**
4. Your app loads images from Cloudinary (NOT from Supabase)

### Image Specifications

| Property | Recommendation | Notes |
|----------|----------------|-------|
| **Format** | JPG, PNG, WebP, GIF | WebP recommended for web |
| **Resolution** | 1200x1200px minimum | Higher is better, will be optimized |
| **Aspect Ratio** | Square (1:1) preferred | Looks best in grid layouts |
| **File Size** | Under 5MB | Cloudinary will optimize |
| **Background** | Clean, solid color | White or light gray preferred |
| **Filename** | Lowercase, hyphen-separated | `white-cotton-tshirt.jpg` |

### Image Naming Best Practices

✅ **Good filenames:**
- `white-tee.jpg`
- `denim-jacket-blue.png`
- `nike-sneakers-white.jpg`

❌ **Bad filenames:**
- `IMG_1234.jpg` (not descriptive)
- `White Tee.jpg` (spaces, capitals)
- `white_tee.JPG` (uppercase extension)

### Directory Structure Example

```
catalog-data/
├── my-items.csv
│   Contains:
│   name,image_filename
│   White Tee,white-tee.jpg        ← References local file
│   Denim Jacket,denim-jacket.jpg  ← References local file
│
└── images/
    ├── white-tee.jpg              ← Actual file (1-5MB)
    └── denim-jacket.jpg           ← Actual file (1-5MB)
```

---

## 🔑 Environment Setup

### Required Environment Variables

Create or edit `.env.local` in the repository root:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://nztqjmknblelnzpeatyx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudinary Configuration (REQUIRED)
VITE_CLOUDINARY_CLOUD_NAME=sgstylesnap
VITE_CLOUDINARY_UPLOAD_PRESET=sgstylesnap
```

### Cloudinary Setup Instructions

1. **Create Account**
   - Visit [cloudinary.com](https://cloudinary.com)
   - Sign up for free account (25GB storage, 25GB bandwidth/month)

2. **Get Cloud Name**
   - Dashboard → Copy "Cloud Name"
   - Add to `.env.local` as `VITE_CLOUDINARY_CLOUD_NAME`

3. **Create Upload Preset**
   - Go to **Settings** → **Upload** → **Upload Presets**
   - Click **Add upload preset**
   - Settings:
     - **Signing Mode**: `Unsigned` ⚠️ CRITICAL
     - **Preset Name**: `sgstylesnap` (or your choice)
     - **Folder**: `catalog-items` (optional)
   - **Save**
   - Add preset name to `.env.local` as `VITE_CLOUDINARY_UPLOAD_PRESET`

### Verify Environment Variables

```bash
# Check if .env.local exists
ls -la .env.local

# Verify variables are set (don't print full keys!)
grep -E "VITE_SUPABASE|VITE_CLOUDINARY" .env.local | cut -d'=' -f1
```

Expected output:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET
```

---

## 📦 How Image Storage Works

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              YOUR LOCAL COMPUTER                            │
├─────────────────────────────────────────────────────────────┤
│  catalog-data/                                              │
│  ├── items.csv                                              │
│  │   └── image_filename: "white-tee.jpg"  ──┐              │
│  │                                            │              │
│  └── images/                                  │              │
│      └── white-tee.jpg  ◄─────────────────────┘              │
│          (actual file, 1-5MB)                               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ node scripts/seed-catalog-from-csv.js
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                  SEEDING SCRIPT                             │
├─────────────────────────────────────────────────────────────┤
│  1. Read CSV                                                │
│  2. Read local image (white-tee.jpg)                       │
│  3. Upload to Cloudinary ────────────┐                     │
│  4. Get Cloudinary URL               │                     │
│  5. Store URL in Supabase ───────────┼──────┐              │
└──────────────────────────────────────┼──────┼──────────────┘
                                       │      │
                  ┌────────────────────┘      └────────────┐
                  ↓                                        ↓
┌──────────────────────────────────┐   ┌─────────────────────────────┐
│   CLOUDINARY (Image CDN)         │   │  SUPABASE (Database)        │
├──────────────────────────────────┤   ├─────────────────────────────┤
│ Stores: ACTUAL IMAGE FILES       │   │ Stores: METADATA & URLS     │
│                                  │   │                             │
│ white-tee.jpg (optimized)        │   │ catalog_items table:        │
│ ↓                                │   │ ┌─────────────────────────┐ │
│ https://res.cloudinary.com/      │   │ │ name: "White T-Shirt"   │ │
│ sgstylesnap/image/upload/        │   │ │ image_url: "https://..." ├─┤
│ v1234/catalog-items/white-tee.jpg│   │ │ category: "top"         │ │
│                                  │   │ └─────────────────────────┘ │
│ ✅ Global CDN                     │   │    (URL points to          │
│ ✅ Auto-optimization              │   │     Cloudinary) ────────────┘
│ ✅ Fast delivery                  │   │                             │
└──────────────────────────────────┘   └─────────────────────────────┘
                   │                                   │
                   └──────────────┬────────────────────┘
                                  ↓
                   ┌──────────────────────────────┐
                   │   VUE APP (Browser)          │
                   ├──────────────────────────────┤
                   │ 1. Query Supabase for items  │
                   │ 2. Get image_url from DB     │
                   │ 3. Load image from URL       │
                   │ 4. Browser fetches from      │
                   │    Cloudinary CDN            │
                   │                              │
                   │ <img :src="item.image_url">  │
                   └──────────────────────────────┘
```

### Why Cloudinary Instead of Supabase Storage?

| Feature | Cloudinary | Supabase Storage |
|---------|-----------|------------------|
| **Global CDN** | ✅ Worldwide edge locations | ❌ Single region |
| **Auto-optimization** | ✅ WebP, compression, quality | ❌ Manual handling |
| **On-the-fly transforms** | ✅ Resize, crop in URL | ❌ Pre-process required |
| **Free tier** | ✅ 25GB storage + bandwidth | ✅ 1GB storage |
| **Setup complexity** | ✅ Simple (unsigned preset) | ⚠️ RLS policies, buckets |
| **Performance** | ✅ Excellent (global CDN) | ⚠️ Good (single region) |

---

## 👕 Clothing Types Reference

### All 20 Supported Types

| Type | Category | Description | Example Use Cases |
|------|----------|-------------|-------------------|
| `Blazer` | outerwear | Formal jackets | Business blazers, sport coats |
| `Blouse` | top | Dress shirts for women | Button-up blouses, silk tops |
| `Body` | top | Bodysuits | Form-fitting one-pieces |
| `Dress` | top | One-piece dresses | Sundresses, cocktail dresses |
| `Hat` | accessory | Headwear | Baseball caps, beanies |
| `Hoodie` | outerwear | Hooded sweatshirts | Pullover/zip hoodies |
| `Longsleeve` | top | Long-sleeve tops | Long-sleeve tees, henley shirts |
| `Not sure` | top | Undefined items | When type is unclear |
| `Other` | accessory | Miscellaneous | Scarves, bags, belts |
| `Outwear` | outerwear | Coats and jackets | Denim jackets, windbreakers |
| `Pants` | bottom | Trousers and jeans | Dress pants, jeans, chinos |
| `Polo` | top | Polo shirts | Classic polo shirts |
| `Shirt` | top | Button-up shirts | Dress shirts, flannel shirts |
| `Shoes` | shoes | Footwear | Sneakers, boots, sandals |
| `Shorts` | bottom | Short pants | Cargo shorts, athletic shorts |
| `Skip` | top | Items to skip | Placeholder items |
| `Skirt` | bottom | Skirts | Mini skirts, midi skirts |
| `T-Shirt` | top | T-shirts | Crew neck, v-neck tees |
| `Top` | top | General tops | Tank tops, crop tops |
| `Undershirt` | top | Base layers | Undershirts, thermals |

### Usage Notes

- **Case-sensitive**: Use exact spelling (e.g., `T-Shirt`, not `t-shirt` or `tshirt`)
- **Optional**: If omitted, item uses the `category` field
- **Validation**: Script will reject invalid types with error message

---

## 🗄️ Database Schema

### `catalog_items` Table Structure

```sql
CREATE TABLE catalog_items (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Classification
  clothing_type VARCHAR(50),                -- One of 20 types
  category VARCHAR(50) NOT NULL,            -- top, bottom, outerwear, shoes, accessory
  
  -- Details
  brand VARCHAR(100),
  size VARCHAR(20),
  season VARCHAR(20) DEFAULT 'all',         -- spring, summer, fall, winter, all
  
  -- Colors & Styling
  primary_color VARCHAR(50),
  secondary_colors TEXT[],                  -- Array of colors
  style TEXT[],                             -- Array of style tags
  tags TEXT[],                              -- Array of weather tags
  
  -- Images
  image_url TEXT NOT NULL,                  -- Cloudinary URL (full size)
  thumbnail_url TEXT NOT NULL,              -- Cloudinary URL (thumbnail)
  cloudinary_public_id TEXT,                -- Cloudinary identifier
  
  -- Privacy & Status
  privacy VARCHAR(20) DEFAULT 'public',     -- public, friends, private
  is_active BOOLEAN DEFAULT true,           -- Active in catalog
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key Points

- **No `owner_id` column**: Catalog items are anonymous (no user attribution)
- **`privacy` defaults to `public`**: All items visible to all users by default
- **Array fields**: `secondary_colors`, `style`, `tags` stored as PostgreSQL arrays
- **Cloudinary URLs**: Both full-size and thumbnail URLs stored
- **`is_active` flag**: Soft-delete capability (set to `false` to hide)

---

## 🔒 Privacy & Ownership

### Default Privacy Setting

All catalog items are set to **`public`** visibility by default:
- Visible to all authenticated users
- No user attribution (anonymous)
- Cannot be edited or deleted by regular users (admin only)

### Ownership Model

**Critical: Catalog items have NO owner**
- No `owner_id` column in `catalog_items` table
- Items are "owned" by the system/admin
- Users cannot modify catalog items
- Users can add items to their personal closet (copy)

### Preventing Duplicate Viewing

Users are automatically prevented from seeing catalog items they already own:

**SQL RPC Function** (`sql/011_catalog_enhancements.sql`):
```sql
CREATE OR REPLACE FUNCTION get_catalog_excluding_owned(user_id_param UUID)
RETURNS SETOF catalog_items AS $$
BEGIN
  RETURN QUERY
  SELECT ci.*
  FROM catalog_items ci
  WHERE ci.is_active = true
    AND ci.id NOT IN (
      SELECT source_catalog_id
      FROM clothes
      WHERE owner_id = user_id_param
        AND source_catalog_id IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Usage in App** (`src/services/catalog-service.js`):
```javascript
const { data, error } = await supabase
  .rpc('get_catalog_excluding_owned', { user_id_param: userId })
```

---

## 💻 Usage Examples

### Basic Usage

```bash
# From repository root
node scripts/seed-catalog-from-csv.js catalog-data/my-items.csv catalog-data/images/
```

### With Relative Paths

```bash
# Relative to current directory
node scripts/seed-catalog-from-csv.js ./data/items.csv ./data/photos/
```

### With Absolute Paths

```bash
# Absolute paths
node scripts/seed-catalog-from-csv.js \
  /workspaces/sgStyleSnap2025/catalog-data/items.csv \
  /workspaces/sgStyleSnap2025/catalog-data/images/
```

### Multiple Collections

```bash
# Seed summer collection
node scripts/seed-catalog-from-csv.js \
  catalog-data/summer/items.csv \
  catalog-data/summer/images/

# Seed winter collection
node scripts/seed-catalog-from-csv.js \
  catalog-data/winter/items.csv \
  catalog-data/winter/images/
```

### Using npm Script

```bash
# Add to package.json scripts:
# "seed-catalog-csv": "node scripts/seed-catalog-from-csv.js"

npm run seed-catalog-csv -- catalog-data/my-items.csv catalog-data/images/
```

### Complete Example (Start to Finish)

```bash
# 1. Navigate to repository root
cd /workspaces/sgStyleSnap2025

# 2. Create directory structure
mkdir -p catalog-data/images

# 3. Create CSV file
cat > catalog-data/my-items.csv << 'EOF'
name,clothing_type,category,brand,size,primary_color,secondary_colors,style_tags,weather_tags,season,description,image_filename,privacy
White T-Shirt,T-Shirt,top,Uniqlo,M,white,,casual|basic,warm|hot,summer,Essential crew neck tee,white-tee.jpg,public
Denim Jacket,Outwear,outerwear,Levi's,L,blue,,casual|classic,cool|warm,spring,Classic denim jacket,denim-jacket.jpg,public
Black Pants,Pants,bottom,H&M,32,black,,formal|business,cool|warm,all,Slim fit dress pants,black-pants.jpg,public
EOF

# 4. Add images to catalog-data/images/
# (Download or copy your images here)

# 5. Verify setup
echo "=== Directory Structure ==="
tree catalog-data/ || ls -R catalog-data/

echo -e "\n=== CSV Preview ==="
head -n 3 catalog-data/my-items.csv

echo -e "\n=== Images ==="
ls -lh catalog-data/images/

echo -e "\n=== Environment Variables ==="
grep -E "VITE_SUPABASE|VITE_CLOUDINARY" .env.local | cut -d'=' -f1

# 6. Run seeding script
echo -e "\n=== Running Seeder ==="
node scripts/seed-catalog-from-csv.js catalog-data/my-items.csv catalog-data/images/

# 7. Verify in database
echo -e "\n=== Verification ==="
echo "Visit http://localhost:3001/catalog to view items"
```

---

## 🆘 Troubleshooting

### Environment & Setup Issues

#### Error: "Missing required environment variables"

**Symptoms:**
```
❌ Missing required environment variables:
   - VITE_SUPABASE_URL
   - VITE_CLOUDINARY_CLOUD_NAME
```

**Solutions:**
1. Ensure `.env.local` exists in repository root
2. Verify all required variables are set:
   ```bash
   cat .env.local | grep VITE_
   ```
3. Restart terminal after creating `.env.local`
4. Check for typos in variable names

#### Error: "Cannot find module"

**Symptoms:**
```
Error: Cannot find module 'csv-parse'
```

**Solutions:**
```bash
# Install dependencies
npm install csv-parse form-data node-fetch

# Or install all dependencies
npm install
```

### File Path Issues

#### Error: "CSV file not found"

**Symptoms:**
```
❌ Error parsing CSV: CSV file not found: my-items.csv
```

**Solutions:**
1. Verify file exists:
   ```bash
   ls -la catalog-data/my-items.csv
   ```
2. Use correct path from repository root:
   ```bash
   # ✅ Correct
   node scripts/seed-catalog-from-csv.js catalog-data/my-items.csv catalog-data/images/
   
   # ❌ Wrong
   node scripts/seed-catalog-from-csv.js /catalog-data/my-items.csv /catalog-data/images/
   ```
3. Check current directory:
   ```bash
   pwd  # Should be /workspaces/sgStyleSnap2025
   ```

#### Error: "Images directory not found"

**Symptoms:**
```
❌ Images directory not found: ./images/
```

**Solutions:**
1. Verify directory exists:
   ```bash
   ls -ld catalog-data/images/
   ```
2. Create if missing:
   ```bash
   mkdir -p catalog-data/images
   ```

#### Error: "Image not found: [filename]"

**Symptoms:**
```
❌ Image not found: catalog-data/images/white-tee.jpg
```

**Solutions:**
1. List images in directory:
   ```bash
   ls catalog-data/images/
   ```
2. Check exact filename match (case-sensitive!):
   ```bash
   # CSV says: white-tee.jpg
   # File is: White-Tee.JPG  ❌ Case mismatch!
   ```
3. Compare CSV with actual files:
   ```bash
   # Extract image filenames from CSV
   cat catalog-data/my-items.csv | cut -d',' -f12 | tail -n +2
   
   # Compare with actual files
   ls catalog-data/images/
   ```

### Data Validation Issues

#### Error: "Invalid clothing_type"

**Symptoms:**
```
⚠️  Row 2: Invalid clothing_type 'tshirt'. Must be one of: Blazer, Blouse, ...
```

**Solutions:**
1. Use exact spelling from [Clothing Types](#-clothing-types-reference):
   ```csv
   ❌ tshirt, t-shirt, T-shirt
   ✅ T-Shirt
   ```
2. Check case sensitivity:
   ```csv
   ❌ outwear (lowercase)
   ✅ Outwear (capital O)
   ```

#### Error: "Invalid category"

**Symptoms:**
```
⚠️  Row 3: Invalid category 'tops'. Must be one of: top, bottom, outerwear, shoes, accessory
```

**Solutions:**
Use exact category values (lowercase):
```csv
✅ top, bottom, outerwear, shoes, accessory
❌ tops, tops/bottoms, jacket
```

#### Error: "Invalid season"

**Symptoms:**
```
⚠️  Row 4: Invalid season 'autumn'. Must be one of: spring, summer, fall, winter, all
```

**Solutions:**
```csv
✅ spring, summer, fall, winter, all
❌ autumn, yearly, any
```

### Cloudinary Upload Issues

#### Error: "Cloudinary upload failed"

**Symptoms:**
```
❌ Failed to upload white-tee.jpg: Cloudinary upload failed: 400 Bad Request
```

**Solutions:**
1. Verify cloud name is correct:
   ```bash
   grep VITE_CLOUDINARY_CLOUD_NAME .env.local
   ```
2. Ensure upload preset is **unsigned**:
   - Cloudinary Dashboard → Settings → Upload → Upload Presets
   - Check preset "Signing Mode" is set to "Unsigned"
3. Test upload preset:
   ```bash
   curl -X POST https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload \
     -F "file=@catalog-data/images/white-tee.jpg" \
     -F "upload_preset=YOUR_PRESET"
   ```
4. Check internet connection

#### Error: "Invalid image format"

**Symptoms:**
```
❌ Cloudinary upload failed: Unsupported file type
```

**Solutions:**
1. Verify image format is supported (JPG, PNG, WebP, GIF)
2. Check file is not corrupted:
   ```bash
   file catalog-data/images/white-tee.jpg
   # Output should be: JPEG image data, ...
   ```
3. Re-download or re-export image

### Database Issues

#### Error: "Duplicate item"

**Symptoms:**
```
⚠️  Item already exists: White T-Shirt
```

**Solutions:**
1. This is expected behavior - item already in database
2. Check existing items:
   ```sql
   SELECT name, created_at FROM catalog_items ORDER BY created_at DESC LIMIT 10;
   ```
3. To re-seed, delete existing item first:
   ```sql
   DELETE FROM catalog_items WHERE name = 'White T-Shirt';
   ```

#### Error: "Database connection failed"

**Symptoms:**
```
❌ Failed to insert into database: connection refused
```

**Solutions:**
1. Verify Supabase URL is correct:
   ```bash
   grep VITE_SUPABASE_URL .env.local
   ```
2. Test connection:
   ```bash
   curl https://YOUR_PROJECT.supabase.co/rest/v1/
   ```
3. Check Supabase project is active (not paused)

### General Debugging

**Enable verbose logging:**
```bash
# Add DEBUG=true to see more details
DEBUG=true node scripts/seed-catalog-from-csv.js catalog-data/my-items.csv catalog-data/images/
```

**Check script output carefully:**
- ✅ Successfully added: X
- ❌ Failed: X
- ⚠️  Duplicates: X

Each section will show specific errors for debugging.

---

## ✅ Verification & Monitoring

### Verify Seeded Items

**1. Check Console Output**

Successful seeding shows:
```
✅ Successfully added: 4
❌ Failed: 0
⚠️  Duplicates: 0
```

**2. Query Database**

```sql
-- Count total items
SELECT COUNT(*) as total_items 
FROM catalog_items 
WHERE is_active = true;

-- View recent additions
SELECT name, clothing_type, brand, created_at 
FROM catalog_items 
ORDER BY created_at DESC 
LIMIT 10;

-- Group by clothing type
SELECT clothing_type, COUNT(*) as count
FROM catalog_items 
WHERE is_active = true 
GROUP BY clothing_type
ORDER BY count DESC;

-- Group by category
SELECT category, COUNT(*) as count
FROM catalog_items 
WHERE is_active = true 
GROUP BY category;

-- Check images are set
SELECT name, image_url, thumbnail_url
FROM catalog_items 
WHERE image_url IS NULL OR thumbnail_url IS NULL;
```

**3. View in Application**

Navigate to the catalog page:
```
http://localhost:3001/catalog
```

Expected: All seeded items should appear in the catalog grid.

**4. Verify Cloudinary Upload**

Visit your Cloudinary dashboard:
- **Media Library** → Check for uploaded images in `catalog-items` folder
- Verify images are accessible via URLs

**5. Check Image URLs**

```sql
-- Get sample image URL
SELECT name, image_url 
FROM catalog_items 
LIMIT 1;

-- Copy the image_url and paste in browser
-- Should display the image
```

### Monitoring Queries

```sql
-- Daily seeding activity
SELECT DATE(created_at) as date, COUNT(*) as items_added
FROM catalog_items
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Items by privacy level
SELECT privacy, COUNT(*) as count
FROM catalog_items
GROUP BY privacy;

-- Active vs inactive items
SELECT is_active, COUNT(*) as count
FROM catalog_items
GROUP BY is_active;

-- Items missing optional fields
SELECT 
  COUNT(CASE WHEN brand IS NULL THEN 1 END) as no_brand,
  COUNT(CASE WHEN size IS NULL THEN 1 END) as no_size,
  COUNT(CASE WHEN description IS NULL THEN 1 END) as no_description
FROM catalog_items;
```

### Re-running the Seeder

The seeder is **idempotent-safe**:
- Duplicate items are detected and skipped
- Failed items can be retried
- New items are added without affecting existing ones

**To re-seed:**
```bash
# Run again - duplicates will be skipped
node scripts/seed-catalog-from-csv.js catalog-data/my-items.csv catalog-data/images/
```

**To force re-seed (delete and re-add):**
```sql
-- Delete specific items
DELETE FROM catalog_items WHERE name IN ('Item 1', 'Item 2');

-- Or delete all catalog items
TRUNCATE catalog_items RESTART IDENTITY CASCADE;
```

Then run seeder again.

---

## 📚 Additional Resources

- [Cloudinary Upload API Documentation](https://cloudinary.com/documentation/upload_images)
- [Cloudinary Upload Presets Guide](https://cloudinary.com/documentation/upload_presets)
- [CSV Format Specification (RFC 4180)](https://tools.ietf.org/html/rfc4180)
- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions)
- [PostgreSQL Array Types](https://www.postgresql.org/docs/current/arrays.html)

---

## 🎯 Quick Reference Card

```bash
# Create directory structure
mkdir -p catalog-data/images

# Create CSV
cat > catalog-data/my-items.csv << 'EOF'
name,image_filename,category
White Tee,white-tee.jpg,top
EOF

# Add images
cp ~/my-photos/*.jpg catalog-data/images/

# Verify environment
grep VITE_ .env.local | cut -d'=' -f1

# Run seeder
node scripts/seed-catalog-from-csv.js catalog-data/my-items.csv catalog-data/images/

# Verify in DB
psql -c "SELECT COUNT(*) FROM catalog_items WHERE is_active = true;"

# View in app
open http://localhost:3001/catalog
```

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Repository:** https://github.com/bryanseah234/sgStyleSnap2025  
**Maintained by:** StyleSnap Team
