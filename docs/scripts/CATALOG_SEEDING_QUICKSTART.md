# Catalog Seeding - Quick Start Guide

## 🎯 Purpose

Bulk upload clothing items to the StyleSnap catalog from a CSV file with automatic image upload to Cloudinary.

## ⚡ Quick Steps

### 1. Prepare Your Data

```bash
# Use the template as a starting point
cp scripts/catalog-items-template.csv my-items.csv

# Edit my-items.csv with your catalog data
# Add your product images to a directory (e.g., ./my-images/)
```

### 2. Run the Seeder

```bash
# Basic usage
node scripts/seed-catalog-from-csv.js <csv-file> <images-directory>

# Example
node scripts/seed-catalog-from-csv.js ./my-items.csv ./my-images/

# Or use npm script
npm run seed-catalog-csv -- ./my-items.csv ./my-images/
```

### 3. Verify Results

- Check the console output for success/failure summary
- View items in the app at `/catalog`
- Query the database: `SELECT COUNT(*) FROM catalog_items WHERE is_active = true;`

## 📋 CSV Format Quick Reference

**Required columns:**
- `name` - Item name
- `image_filename` - Image file in the images directory

**Optional columns:**
- `clothing_type` - One of 20 types (T-Shirt, Pants, Shoes, etc.)
- `category` - top, bottom, outerwear, shoes, accessory
- `brand` - Brand name
- `size` - Size (any format: S, M, L, 32x34, etc.)
- `primary_color` - Main color
- `secondary_colors` - Additional colors (pipe-separated: `navy|white`)
- `style_tags` - Style keywords (pipe-separated: `casual|minimalist`)
- `weather_tags` - Weather suitability (pipe-separated: `warm|hot`)
- `season` - spring, summer, fall, winter, all
- `description` - Item description
- `privacy` - public (default), friends, private

## 🎨 Image Guidelines

- **Format:** JPG, PNG, WebP, or GIF
- **Size:** 1200x1200px recommended
- **Aspect:** Square (1:1) preferred
- **Filename:** Must match `image_filename` in CSV exactly

## 🔑 Environment Setup

Required in `.env` file:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
VITE_CLOUDINARY_CLOUD_NAME=your-cloud
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset
```

## ✅ Example CSV

```csv
name,clothing_type,category,brand,size,primary_color,secondary_colors,style_tags,weather_tags,season,description,image_filename,privacy
White Tee,T-Shirt,top,Uniqlo,M,white,,casual|basic,warm|hot,summer,Essential crew neck tee,white-tee.jpg,public
Denim Jacket,Outwear,outerwear,Levi's,L,blue,,casual|classic,cool|warm,spring,Classic denim jacket,denim-jacket.jpg,public
```

## 🆘 Common Issues

### "Missing required environment variables"
- Ensure `.env` file exists with all required variables
- Run `source .env` or restart your terminal

### "CSV file not found"
- Check file path is correct
- Use absolute paths or paths relative to project root

### "Image not found"
- Verify `image_filename` matches actual file name exactly (case-sensitive)
- Check images are in the specified directory

### "Invalid clothing_type"
- Use one of: Blazer, Blouse, Body, Dress, Hat, Hoodie, Longsleeve, Other, Outwear, Pants, Polo, Shirt, Shoes, Shorts, Skirt, T-Shirt, Top, Undershirt, Not sure, Skip

### "Cloudinary upload failed"
- Verify cloud name and upload preset are correct
- Ensure preset is **unsigned**
- Check internet connection

## 📚 Full Documentation

See [docs/CATALOG_SEEDING.md](../docs/CATALOG_SEEDING.md) for comprehensive guide.

## 🎬 Complete Example

```bash
# 1. Create directories
mkdir catalog-data
mkdir catalog-data/images

# 2. Create CSV
cat > catalog-data/items.csv << EOF
name,clothing_type,category,brand,size,primary_color,secondary_colors,style_tags,weather_tags,season,description,image_filename,privacy
White Tee,T-Shirt,top,Uniqlo,M,white,,casual|basic,warm|hot,summer,Essential crew neck,white-tee.jpg,public
EOF

# 3. Add images to catalog-data/images/
# (copy white-tee.jpg to catalog-data/images/)

# 4. Run seeder
node scripts/seed-catalog-from-csv.js catalog-data/items.csv catalog-data/images/

# 5. Check results
# ✅ Successfully added: 1
# Users can now browse these items at /catalog
```

---

**Need Help?** Check the [full documentation](../docs/CATALOG_SEEDING.md) or file an issue.
