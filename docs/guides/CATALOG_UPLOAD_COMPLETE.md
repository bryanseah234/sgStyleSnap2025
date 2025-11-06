# Complete Catalog Upload Guide with Background Removal and AI Detection

## Overview

This guide provides complete instructions for uploading clothing items to the StyleSnap catalog using automated background removal and AI-powered clothing detection.

## Workflow Summary

1. **Prepare Images** - Place your clothing images in a directory
2. **Python Processing** - Run script to remove backgrounds, classify items, detect colors
3. **Upload to Catalog** - Use generated CSV and images to upload to Supabase/Cloudinary

---

## Prerequisites

### 1. Python Environment

Ensure you have Python 3.8+ installed:
```bash
python --version  # Should be 3.8 or higher
```

### 2. Install Python Dependencies

```bash
# Navigate to project root
cd /path/to/sgStyleSnap2025

# Install requirements
pip install -r scripts/scraping/requirements.txt
```

**Key dependencies:**
- `rembg` - Background removal
- `torch`, `torchvision` - AI model inference
- `opencv-python` - Image processing
- `Pillow` - Image handling
- `scikit-learn` - Color detection
- `numpy` - Array operations

### 3. Model File

Ensure the AI model file exists:
- **Primary location:** `docs/ai-models/best_model.pth`
- **Alternative:** `scripts/scraping/best_model.pth`

The script will auto-detect the model if it's in either location.

### 4. Node.js Environment (for upload step)

Ensure you have Node.js installed for the final upload step.

---

## Step-by-Step Instructions

### Step 1: Prepare Your Images

1. **Create a directory** for your input images:
   ```bash
   mkdir my-clothing-images
   ```

2. **Add images** to this directory:
   - Supported formats: JPG, JPEG, PNG, BMP, GIF, TIFF, WEBP
   - Recommended: High-quality product photos (800x800px or larger)
   - Best results: Plain backgrounds, good lighting, single item per image

   Example structure:
   ```
   my-clothing-images/
   ├── shirt1.jpg
   ├── jeans1.jpg
   ├── jacket1.png
   └── shoes1.jpg
   ```

### Step 2: Run Python Processing Script

Run the image processing script:

```bash
python scripts/catalog/process-images.py my-clothing-images --output-dir catalog-output
```

**Command options:**
- `my-clothing-images` - Input directory containing your images
- `--output-dir catalog-output` - Output directory (default: `catalog-output`)
- `--model-path <path>` - Optional: specify model path if auto-detection fails

**What the script does:**
1. ✅ Removes backgrounds from images using AI
2. ✅ Classifies clothing type (T-Shirt, Jeans, etc.)
3. ✅ Detects primary and secondary colors
4. ✅ Generates CSV file with all metadata
5. ✅ Saves processed images (background removed) to output directory

**Example output:**
```
============================================================
StyleSnap Image Processor
============================================================
Input directory: my-clothing-images
Output directory: catalog-output
Model: docs/ai-models/best_model.pth
Background removal: Available
============================================================

Found 4 image files to process

============================================================
Processing: shirt1.jpg
Removing background from: shirt1.jpg
Background removed, saved to: catalog-output/images/white-tshirt-1234567890.png
Classifying clothing type...
Classified as: T-Shirt (87.34%)
Detecting colors...
Colors: white, gray
✅ APPROVED and saved as: white-tshirt-1234567890.png
...

============================================================
PROCESSING SUMMARY
============================================================
Total images processed: 4
Background removed: 4
Background removal failed: 0
Rejected - invalid category: 0
✅ APPROVED items: 4
Items added to catalog CSV: 4
============================================================
Output directory: catalog-output
Images folder: catalog-output/images
CSV catalog: catalog-output/catalog-items.csv
============================================================
```

### Step 3: Verify Output

After processing, verify the output:

```bash
# Check CSV file
cat catalog-output/catalog-items.csv

# Check images
ls catalog-output/images/
```

**Output structure:**
```
catalog-output/
├── catalog-items.csv       # CSV file ready for upload
└── images/
    ├── white-tshirt-1234567890.png
    ├── blue-jeans-1234567891.png
    ├── black-jacket-1234567892.png
    └── brown-shoes-1234567893.png
```

### Step 4: Prepare Environment Variables

Create or update `.env` file in project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

### Step 5: Upload to Catalog

Run the Node.js upload script:

```bash
node scripts/catalog/seed-catalog-from-csv.js catalog-output/catalog-items.csv catalog-output/images
```

**What the upload script does:**
1. ✅ Uploads images to Cloudinary
2. ✅ Creates thumbnail versions
3. ✅ Inserts items into Supabase database
4. ✅ Reports success/failure for each item

**Example output:**
```
🌱 StyleSnap Catalog Seeder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CSV File: catalog-output/catalog-items.csv
Images Directory: catalog-output/images
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/4] Processing: White T-Shirt
  📤 Uploading white-tshirt-1234567890.png to Cloudinary...
  ✅ Uploaded: https://res.cloudinary.com/.../white-tshirt.png
  ✅ Added: White T-Shirt (ID: abc123)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Successfully added: 4
❌ Failed: 0

🎉 Catalog seeding complete!
Users can now browse these items at /catalog
```

### Step 6: Verify in Database

Check your Supabase dashboard or run:

```sql
SELECT COUNT(*) FROM catalog_items;
SELECT name, clothing_type, category, primary_color FROM catalog_items ORDER BY created_at DESC LIMIT 10;
```

---

## Complete Example

Here's a complete example from start to finish:

```bash
# 1. Create directory and add images
mkdir my-catalog
mkdir my-catalog/images
# Copy your images to my-catalog/images/

# 2. Process images (Python)
python scripts/catalog/process-images.py my-catalog/images --output-dir my-catalog/processed

# 3. Upload to catalog (Node.js)
node scripts/catalog/seed-catalog-from-csv.js \
  my-catalog/processed/catalog-items.csv \
  my-catalog/processed/images
```

---

## CSV Format Generated

The Python script generates CSV files with this format:

| Column | Description | Example |
|--------|-------------|---------|
| `name` | Auto-generated name | `White T-Shirt` |
| `clothing_type` | AI-detected type | `T-Shirt` |
| `category` | Auto-mapped category | `top` |
| `brand` | Empty (fill manually) | `` |
| `size` | Empty (fill manually) | `` |
| `primary_color` | Detected color | `white` |
| `secondary_colors` | Pipe-separated colors | `gray\|navy` |
| `style_tags` | Empty (fill manually) | `` |
| `weather_tags` | Empty (fill manually) | `` |
| `season` | Default: `all` | `all` |
| `description` | Auto-generated | `AI-detected T-Shirt...` |
| `image_filename` | Generated filename | `white-tshirt-1234567890.png` |
| `privacy` | Default: `public` | `public` |

**Note:** You can manually edit the CSV before uploading to add brand, size, style_tags, etc.

---

## Troubleshooting

### Python Script Issues

#### 1. `rembg` Not Available
```
Warning: rembg not available. Install with: pip install rembg
```

**Solution:**
```bash
pip install rembg
# Or for latest model:
pip install rembg[new]
```

#### 2. Model Not Found
```
Error: Model not found. Checked:
  - docs/ai-models/best_model.pth
  - scripts/scraping/best_model.pth
```

**Solution:**
- Ensure model file exists in one of the locations
- Or specify path manually: `--model-path /path/to/best_model.pth`

#### 3. PyTorch Import Error
```
Error: PyTorch import failed
```

**Solution:**
```bash
pip install torch torchvision
# For CUDA support (if you have GPU):
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

#### 4. Background Removal Fails
```
Background removal failed, using original image
```

**Solution:**
- Check image format is supported
- Ensure image file is not corrupted
- Try with a different image
- Script will continue with original image if background removal fails

#### 5. Low Classification Confidence
```
REJECTED: Low confidence 0.45 for 'T-Shirt'
```

**Solution:**
- Use higher quality images
- Ensure images show clothing items clearly
- Avoid images with multiple items
- Check image has good lighting

### Upload Script Issues

#### 1. Missing Environment Variables
```
Error: Missing required environment variable: VITE_CLOUDINARY_CLOUD_NAME
```

**Solution:**
- Check your `.env` file has all required variables
- Ensure `.env` is in project root

#### 2. Image Not Found
```
Error: Image file not found: catalog-output/images/shirt.png
```

**Solution:**
- Verify CSV filename matches actual image filename (case-sensitive)
- Check images are in the correct directory

#### 3. Cloudinary Upload Failed
```
Error: Failed to upload image to Cloudinary
```

**Solution:**
- Verify Cloudinary credentials in `.env`
- Check upload preset is set to "unsigned"
- Ensure internet connection is stable
- Check image file size (should be under 10MB)

---

## Advanced Usage

### Custom Output Directory

```bash
python scripts/catalog/process-images.py my-images --output-dir custom-output
```

### Specify Model Path

```bash
python scripts/catalog/process-images.py my-images --model-path /path/to/custom-model.pth
```

### Manual CSV Editing

After processing, you can edit the CSV to add more details:

```bash
# Open CSV in your editor
nano catalog-output/catalog-items.csv

# Add brand, size, style_tags, etc.
# Example:
# White T-Shirt,T-Shirt,top,Uniqlo,M,white,,casual|basic,warm|hot,summer,Essential white tee,white-tshirt.png,public
```

### Batch Processing Multiple Directories

```bash
# Process multiple directories
for dir in images1 images2 images3; do
    python scripts/catalog/process-images.py $dir --output-dir processed-$dir
done
```

### Processing Single Image

```bash
# Create temp directory with single image
mkdir temp-images
cp my-image.jpg temp-images/
python scripts/catalog/process-images.py temp-images --output-dir output
```

---

## Best Practices

### Image Quality
- ✅ Use high-resolution images (800x800px minimum)
- ✅ Good lighting, clear focus
- ✅ Single item per image
- ✅ Plain or simple backgrounds work best
- ❌ Avoid images with people wearing items
- ❌ Avoid images with text overlays
- ❌ Avoid low-quality or blurry images

### Workflow
- ✅ Process small batches first (5-10 images) to test
- ✅ Review generated CSV before uploading
- ✅ Keep original images as backup
- ✅ Use descriptive filenames for original images
- ✅ Verify output images look correct before uploading

### Data Quality
- ✅ Manually edit CSV to add brand/size/style information
- ✅ Verify AI-detected colors are accurate
- ✅ Check clothing type classifications
- ✅ Add descriptions for better searchability

---

## Performance Tips

### Speed Up Processing

1. **Use GPU for PyTorch** (if available):
   ```bash
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
   ```

2. **Process in batches** - Don't process 1000+ images at once

3. **Close other applications** - Free up memory/CPU

### Memory Management

- Process images in smaller batches if you have memory issues
- Script automatically cleans up memory after each image
- Use `gc.collect()` to force garbage collection if needed

---

## File Structure Reference

```
sgStyleSnap2025/
├── scripts/
│   ├── catalog/
│   │   ├── process-images.py          # Python processing script
│   │   ├── seed-catalog-from-csv.js   # Node.js upload script
│   │   └── catalog-items-template.csv # CSV template
│   └── scraping/
│       └── requirements.txt            # Python dependencies
├── docs/
│   └── ai-models/
│       └── best_model.pth             # AI model file
└── .env                                # Environment variables
```

---

## Next Steps

After uploading items:

1. **Test in App** - Navigate to `/catalog` in your app
2. **Verify Items** - Check items appear correctly
3. **Add Details** - Manually add brands, sizes, styles if needed
4. **Monitor Usage** - Track which items users add to their closets

---

## Related Documentation

- **[SEEDING_GUIDE.md](./SEEDING_GUIDE.md)** - Detailed CSV seeding guide
- **[CATALOG_SEEDING.md](./CATALOG_SEEDING.md)** - Catalog system overview
- **[API.md](../API.md)** - API documentation

---

## Summary

**Complete Workflow:**
1. ✅ Prepare images → `my-images/`
2. ✅ Process with Python → `python scripts/catalog/process-images.py my-images`
3. ✅ Upload to catalog → `node scripts/catalog/seed-catalog-from-csv.js catalog-output/catalog-items.csv catalog-output/images`

**Total Time:** ~2-5 minutes per image (depending on your system)

**Result:** Items appear in catalog at `/catalog` ready for users to browse! 🎉

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Maintainer:** StyleSnap Team

