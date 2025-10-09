# Web Scraper for Clothing Catalog

> Automatically scrape clothing images from websites, classify them with AI, detect colors, and generate catalog entries.

## 🎯 What It Does

The scraper automates the entire process of building your clothing catalog:

1. **🌐 Web Scraping** - Downloads images from any website URLs you provide
2. **👤 Face Detection** - Filters out images with human faces (no model photos)
3. **🧠 AI Classification** - Classifies clothing type using trained ResNet50 model (20 categories)
4. **🎨 Color Detection** - Automatically detects primary and secondary colors
5. **💾 Smart Saving** - Saves images with descriptive filenames
6. **📝 CSV Generation** - Creates catalog entries ready for Supabase upload

## 🚀 Quick Start

### 1. Add URLs to Scrape

Edit `scripts/scrape-urls.txt` and add website URLs (one per line):

```txt
https://www.uniqlo.com/us/en/men/tops
https://www.zara.com/us/en/man-shirts-l855.html
https://www2.hm.com/en_us/men/products/jeans.html
```

### 2. Run the Scraper

```bash
python scripts/scrape-catalog.py
```

### 3. Check Results

- **Images**: `catalog-data/images/` - Downloaded and classified images
- **CSV**: `catalog-data/scraped-items.csv` - Catalog entries ready to upload

### 4. Upload to Supabase

```bash
node scripts/seed-catalog-from-csv.js catalog-data/scraped-items.csv catalog-data/images/
```

## 📋 How It Works

### Pipeline Flow

```
URL Input → Web Scraper → Face Detection → AI Classification → 
Color Detection → Save Image → Generate CSV Entry → Done ✅
```

### Step-by-Step Process

1. **Load URLs** from `scripts/scrape-urls.txt`
2. **Scrape Images** - Download all images from each webpage
3. **Face Detection** - Use OpenCV Haar Cascades to detect faces
   - If face found → Skip (avoid model photos)
   - If no face → Continue to classification
4. **AI Classification** - Run image through ResNet50 model
   - Predicts 1 of 20 clothing types (T-Shirt, Pants, Shoes, etc.)
   - Maps to category (top, bottom, outerwear, shoes, accessory)
   - Calculates confidence score
5. **Color Detection** - Use K-Means clustering to find dominant colors
   - Extracts 3 dominant colors
   - Converts RGB to color names (red, blue, navy, etc.)
6. **Save Image** - Rename with descriptive filename
   - Format: `{color}-{clothing_type}-{timestamp}.jpg`
   - Example: `blue-tshirt-1728489234.jpg`
7. **Generate CSV Entry** - Add item to `scraped-items.csv`
   - **Required fields filled**: `name`, `image_filename`
   - **Auto-detected fields**: `clothing_type`, `category`, `primary_color`, `secondary_colors`
   - **Fixed field**: `privacy` = `public`

## 🏷️ Clothing Categories

The AI model recognizes **20 clothing types** and maps them to **6 categories**:

### Category Mapping

```python
Top: 
  - Blouse, Body, Polo, Shirt, T-Shirt, Top, Undershirt, Longsleeve

Bottom:
  - Pants, Shorts, Skirt

Outerwear:
  - Blazer, Hoodie, Outwear, Dress

Shoes:
  - Shoes

Accessory:
  - Hat

Uncategorized:
  - Not sure, Other, Skip
```

## 🎨 Color Detection

The scraper detects colors from this palette:

```
black, white, red, blue, green, yellow, orange, purple, 
pink, brown, gray, beige, navy, maroon, olive, teal, 
cyan, magenta
```

**Primary Color**: Most dominant color in the image  
**Secondary Colors**: Up to 2 additional colors (pipe-separated: `blue|white`)

## 📝 CSV Format

Generated CSV includes all fields from the catalog template:

### Auto-Filled Fields

| Field | Source | Example |
|-------|--------|---------|
| `name` | Auto-generated | "Blue T-Shirt" |
| `image_filename` | Auto-generated | "blue-tshirt-1728489234.jpg" |
| `clothing_type` | AI Classification | "T-Shirt" |
| `category` | Mapped from type | "top" |
| `primary_color` | Color Detection | "blue" |
| `secondary_colors` | Color Detection | "white\|gray" |
| `privacy` | Fixed value | "public" |
| `description` | Auto-generated | "Scraped from web on 2025-10-09" |

### Empty Fields (Fill Manually if Needed)

- `brand` - Brand name
- `size` - Size (S, M, L, etc.)
- `style_tags` - Style tags (casual|minimalist)
- `weather_tags` - Weather tags (warm|hot)
- `season` - Season (spring, summer, fall, winter, all)

## ⚙️ Configuration

### Image Constraints

```python
MIN_IMAGE_SIZE = 100   # Minimum width/height in pixels
MAX_IMAGE_SIZE = 2000  # Maximum (will resize if larger)
```

### Supported Formats

- JPG, JPEG, PNG, WebP, GIF, AVIF

### Classification Confidence

- **Minimum confidence**: 30% (images below this are skipped)
- Images classified as "Not sure", "Other", or "Skip" are skipped

### Face Detection

- **Minimum face size**: 50x50 pixels
- Uses OpenCV Haar Cascade for fast detection
- Any image with detected face is skipped

## 📊 Output Statistics

After scraping, you'll see a summary:

```
📊 SCRAPING SUMMARY
============================================================
✅ URLs processed: 3
📥 Images downloaded: 45
👤 Images with faces (skipped): 12
💾 Images saved: 28
📝 Items added to catalog: 28
============================================================

✨ Results:
   Images: /workspaces/sgStyleSnap2025/catalog-data/images
   CSV: /workspaces/sgStyleSnap2025/catalog-data/scraped-items.csv

💡 Next steps:
   1. Review images in catalog-data/images/
   2. Check CSV at catalog-data/scraped-items.csv
   3. Run: node scripts/seed-catalog-from-csv.js catalog-data/scraped-items.csv catalog-data/images/
```

## 🛠️ Troubleshooting

### Model Not Found

```
❌ Error: Model not found at scripts/best_model.pth
```

**Solution**: The model should already be copied. If missing, run:
```bash
cp FASHION_RNN/best_model.pth scripts/best_model.pth
```

### No URLs Found

```
⚠️  No URLs found in scripts/scrape-urls.txt
```

**Solution**: Edit `scripts/scrape-urls.txt` and add website URLs (one per line)

### Images Not Downloading

**Possible causes**:
- Website blocks bots (use different URLs)
- Images too small (< 100px)
- Invalid image format
- Network issues

**Solution**: Try different websites, check internet connection

### All Images Skipped (Face Detection)

**Possible causes**:
- Website has model photos (faces detected)
- Product photos with people

**Solution**: Look for websites with:
- Flat lay product photos
- Mannequin shots
- Product-only images (no models)

### Low Classification Confidence

**Possible causes**:
- Images are not clothing items
- Images are low quality
- Background is cluttered

**Solution**: Use websites with clear product photos on white/neutral backgrounds

## 💡 Best Practices

### Choose Good Sources

✅ **Good websites**:
- E-commerce product pages (Uniqlo, H&M, Zara)
- Product catalogs with clean photos
- Flat lay photography sites
- Fashion product databases

❌ **Avoid**:
- Fashion blogs (model photos)
- Instagram/Pinterest (faces, lifestyle shots)
- Lookbooks (styled photos with people)
- Low-quality images

### URL Selection Tips

1. **Product listing pages** work best (multiple items per page)
2. **Category pages** (e.g., /men/tops) better than homepage
3. **Search results pages** can work well
4. Start with 1-2 URLs to test before adding many

### Review Before Uploading

1. Check images in `catalog-data/images/`
2. Review CSV at `catalog-data/scraped-items.csv`
3. Manually edit CSV if needed (add brands, sizes, tags)
4. Delete unwanted images and their CSV rows
5. Then upload to Supabase with seed script

## 🔄 Complete Workflow

```bash
# 1. Add URLs to text file
vim scripts/scrape-urls.txt

# 2. Run scraper
python scripts/scrape-catalog.py

# 3. Review results
ls -lh catalog-data/images/
cat catalog-data/scraped-items.csv

# 4. (Optional) Edit CSV manually
vim catalog-data/scraped-items.csv

# 5. Upload to Supabase
node scripts/seed-catalog-from-csv.js catalog-data/scraped-items.csv catalog-data/images/

# 6. Check catalog page
# Visit: http://localhost:3001/catalog
```

## 📂 File Structure

```
scripts/
├── scrape-urls.txt           # Input: URLs to scrape (YOU EDIT THIS)
├── scrape-catalog.py         # Main scraper script
└── best_model.pth            # Trained ResNet50 model

catalog-data/
├── images/                   # Output: Downloaded images
│   ├── blue-tshirt-1728489234.jpg
│   ├── black-pants-1728489235.jpg
│   └── ...
├── scraped-items.csv         # Output: Generated catalog
└── README.md
```

## 🚨 Important Notes

1. **Privacy**: `privacy` field is always set to `public`
2. **Two Required Fields**: `name` and `image_filename` are always filled
3. **Face Filtering**: Images with faces are automatically skipped
4. **Color Names**: Limited to 18 predefined colors (closest match used)
5. **Rate Limiting**: Scraper waits 0.5s between images (be polite to servers)
6. **Image Processing**: Large images are resized to max 2000px
7. **Classification**: Items with <30% confidence are skipped

## 🆘 Need Help?

- **Model issues**: Check FASHION_RNN/IS216.ipynb for model details
- **CSV format**: See catalog-data/catalog-items-template.csv
- **Seeding issues**: See docs/CATALOG_SEEDING_COMPLETE.md
- **Database**: See docs/DATABASE_GUIDE.md

## 📜 License

Part of sgStyleSnap2025 project. See LICENSE file.
