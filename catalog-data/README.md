# Catalog Data Directory

> Place your catalog CSV files and product images here for bulk seeding.

## 📁 Expected Structure

```
catalog-data/
├── README.md          # This file
├── my-items.csv       # Your CSV with item data
└── images/            # Your product images
    ├── white-tee.jpg
    ├── denim-jacket.jpg
    └── ...
```

## 🚀 Quick Start

**Complete documentation:** [docs/CATALOG_SEEDING_COMPLETE.md](../docs/CATALOG_SEEDING_COMPLETE.md)

### 1. Add Your Images

Copy your product photos to the `images/` directory:

```bash
cp ~/Downloads/*.jpg catalog-data/images/
```

### 2. Create or Edit CSV

Use the template from `scripts/catalog-items-template.csv` or create your own:

```csv
name,clothing_type,category,brand,size,primary_color,secondary_colors,style_tags,weather_tags,season,description,image_filename,privacy
White T-Shirt,T-Shirt,top,Uniqlo,M,white,,casual|basic,warm|hot,summer,Essential tee,white-tee.jpg,public
```

**Important**: The `image_filename` column must exactly match files in `images/` directory!

### 3. Run Seeding Script

From the repository root:

```bash
node scripts/seed-catalog-from-csv.js catalog-data/my-items.csv catalog-data/images/
```

## 📝 CSV Format

**Required columns:**
- `name` - Item name
- `image_filename` - Filename in images/ directory

**Optional columns:**
- `clothing_type` - T-Shirt, Pants, Shoes, etc.
- `category` - top, bottom, outerwear, shoes, accessory
- `brand` - Brand name
- `size` - Any format (S, M, L, 32x34, etc.)
- `primary_color` - Main color
- `secondary_colors` - Pipe-separated: `blue|white`
- `style_tags` - Pipe-separated: `casual|minimalist`
- `weather_tags` - Pipe-separated: `warm|hot`
- `season` - spring, summer, fall, winter, all
- `description` - Item description
- `privacy` - public, friends, private

## 🎨 Image Guidelines

- **Format**: JPG, PNG, WebP, GIF
- **Size**: 1200x1200px recommended
- **Aspect**: Square (1:1) preferred
- **Filename**: Must match CSV exactly (case-sensitive)

## 📚 Complete Documentation

**[→ CATALOG_SEEDING_COMPLETE.md](../docs/CATALOG_SEEDING_COMPLETE.md)** - Everything in one place

## 🔍 Example

```
catalog-data/
├── my-items.csv
│   # Contains:
│   # name,image_filename,category
│   # White Tee,white-tee.jpg,top
│   # Denim Jacket,jacket.jpg,outerwear
│
└── images/
    ├── white-tee.jpg    ← Referenced in CSV
    └── jacket.jpg       ← Referenced in CSV
```

## ⚠️ Important

- **This directory is gitignored** - Images won't be committed to git
- **Images are uploaded to Cloudinary** - Not stored in Supabase
- **Filenames are case-sensitive** - `Image.jpg` ≠ `image.jpg`

## 🆘 Need Help?

See [CATALOG_SEEDING_COMPLETE.md](../docs/CATALOG_SEEDING_COMPLETE.md) for complete guide.
