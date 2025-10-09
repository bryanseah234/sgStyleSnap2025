# Image Storage Flow - StyleSnap Catalog Seeding

## 🎯 Quick Answer

**Q: Where do images go - Supabase or Cloudinary?**

**A: Images are stored in Cloudinary, not Supabase!**

- ✅ **Cloudinary**: Stores actual image files (CDN/cloud storage)
- ✅ **Supabase**: Stores only the Cloudinary URL reference (database)

---

## 📊 Complete Image Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR LOCAL COMPUTER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  my-catalog/                                                    │
│  ├── items.csv                                                  │
│  │   ├── name: "White T-Shirt"                                 │
│  │   └── image_filename: "white-tee.jpg"  ←──┐                │
│  │                                             │                │
│  └── images/                                   │                │
│      └── white-tee.jpg  ◄──────────────────────┘                │
│          (actual image file, 1MB)                               │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ node scripts/seed-catalog-from-csv.js
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SEEDING SCRIPT                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Read CSV                                                    │
│  2. Read local image file (white-tee.jpg)                      │
│  3. Upload to Cloudinary    ──────────┐                        │
│  4. Get back Cloudinary URL           │                        │
│  5. Store URL in Supabase   ──────────┼─────────┐              │
│                                        │         │              │
└────────────────────────────────────────┼─────────┼──────────────┘
                                         │         │
                    ┌────────────────────┘         └────────────────┐
                    │                                               │
                    ↓                                               ↓
┌─────────────────────────────────────────┐   ┌──────────────────────────────────┐
│         CLOUDINARY (Image CDN)          │   │   SUPABASE (Database)            │
├─────────────────────────────────────────┤   ├──────────────────────────────────┤
│                                         │   │                                  │
│  📁 Stores: ACTUAL IMAGE FILES          │   │  📝 Stores: METADATA & URLs      │
│                                         │   │                                  │
│  white-tee.jpg (optimized, 200KB)      │   │  catalog_items table:            │
│  ↓                                      │   │  ┌──────────────────────────┐    │
│  https://res.cloudinary.com/           │   │  │ name: "White T-Shirt"    │    │
│  sgstylesnap/image/upload/             │   │  │ image_url: "https://..." ├─┐  │
│  v1234567890/catalog-items/            │   │  │ category: "top"          │ │  │
│  white-tee.jpg                         │   │  │ primary_color: "white"   │ │  │
│                                         │   │  └──────────────────────────┘ │  │
│  ✅ Global CDN                          │   │                               │  │
│  ✅ Auto-optimization                   │   │                               │  │
│  ✅ Fast delivery                       │   │  (URL points to Cloudinary) ──┘  │
│                                         │   │                                  │
└─────────────────────────────────────────┘   └──────────────────────────────────┘
                    │                                               │
                    │                                               │
                    │                                               │
                    └───────────────────┬───────────────────────────┘
                                        │
                                        ↓
                        ┌───────────────────────────────┐
                        │    YOUR VUE APP (Browser)     │
                        ├───────────────────────────────┤
                        │                               │
                        │  1. Query Supabase for items  │
                        │  2. Get image_url from DB     │
                        │  3. Load image from URL:      │
                        │     https://res.cloudinary... │
                        │  4. Browser fetches from      │
                        │     Cloudinary CDN            │
                        │                               │
                        │  <img :src="item.image_url">  │
                        │                               │
                        └───────────────────────────────┘
```

---

## 🔍 Detailed Explanation

### Step 1: Local Files (Your Computer)

**CSV File** (`items.csv`):
```csv
name,image_filename,category
White T-Shirt,white-tee.jpg,top
Denim Jacket,denim-jacket.jpg,outerwear
```

**Images Directory**:
```
images/
├── white-tee.jpg      ← Actual image file (1-5MB)
└── denim-jacket.jpg   ← Actual image file (1-5MB)
```

### Step 2: Run Seeding Script

```bash
node scripts/seed-catalog-from-csv.js items.csv images/
```

**What the script does:**

1. **Reads CSV**: Parses items from CSV
2. **Finds Image**: Looks for `white-tee.jpg` in `images/` directory
3. **Uploads to Cloudinary**:
   ```
   POST https://api.cloudinary.com/v1_1/sgstylesnap/image/upload
   ↓
   Returns: { 
     secure_url: "https://res.cloudinary.com/.../white-tee.jpg",
     public_id: "catalog-items/white-tee"
   }
   ```
4. **Stores in Supabase**:
   ```sql
   INSERT INTO catalog_items (
     name,
     image_url,  -- ← Cloudinary URL stored here!
     category
   ) VALUES (
     'White T-Shirt',
     'https://res.cloudinary.com/.../white-tee.jpg',
     'top'
   )
   ```

### Step 3: Data Storage

**Cloudinary Stores:**
- ✅ Actual image binary data
- ✅ Optimized versions (WebP, thumbnails)
- ✅ Serves via global CDN

**Supabase Stores:**
- ✅ Item metadata (name, category, etc.)
- ✅ **Cloudinary URL** (just a string!)
- ✅ NOT the actual image file

### Step 4: App Usage

**In your Vue app:**
```vue
<template>
  <img :src="item.image_url" />
  <!-- image_url is the Cloudinary URL -->
</template>

<script setup>
// Fetch from Supabase
const { data: items } = await supabase
  .from('catalog_items')
  .select('*')

// items[0].image_url = "https://res.cloudinary.com/.../white-tee.jpg"
// Browser fetches image directly from Cloudinary
</script>
```

---

## ❓ Common Questions

### Q: Why not store images in Supabase Storage?

**A:** Cloudinary offers better features:
- 🚀 **Global CDN**: Faster image delivery worldwide
- 🎨 **Auto-optimization**: WebP conversion, compression
- 📏 **On-the-fly transforms**: Resize, crop without re-uploading
- 💰 **Free tier**: 25GB storage + 25GB bandwidth/month
- 🔧 **Zero maintenance**: No need to manage storage buckets

### Q: Can I use Supabase Storage instead?

**A:** Yes, but you'd need to:
- Modify the seeding script to upload to Supabase Storage
- Update the upload logic in your app
- Handle image optimization manually
- Manage storage buckets and policies

**Current setup with Cloudinary is recommended** for better performance.

### Q: What if my CSV has a URL instead of a filename?

**A:** The current script expects **local files**. If you already have images online:

**Option 1:** Download images first, then seed
```bash
# Download images
wget -P ./images/ https://example.com/image1.jpg
wget -P ./images/ https://example.com/image2.jpg

# Then seed
node scripts/seed-catalog-from-csv.js items.csv images/
```

**Option 2:** Modify the script to accept URLs (custom implementation)

### Q: Where does Supabase Storage fit in?

**A:** Supabase Storage is used for **user-uploaded closet items**, not catalog:

- **Catalog items** (public, curated) → **Cloudinary**
- **User closet items** (private, user-uploaded) → **Could use either Cloudinary or Supabase Storage**

In StyleSnap, **everything goes to Cloudinary** for consistency.

---

## 📦 Summary

| Aspect | Local Files | Cloudinary | Supabase |
|--------|-------------|------------|----------|
| **What it stores** | Original images | Optimized images | Image URLs + metadata |
| **Storage type** | Your computer | Cloud CDN | Database (PostgreSQL) |
| **Purpose** | Source files | Image delivery | Data queries |
| **Size** | Full resolution | Optimized versions | URLs (text, <100 bytes) |
| **Access** | Not accessible online | Public CDN URLs | Query via API |

**Flow:**
```
Local Files → (upload) → Cloudinary → (URL) → Supabase → (query) → App → (display) → Cloudinary
```

---

## 🎯 Key Takeaway

The `image_filename` in your CSV refers to **local files on your computer**. The seeding script:
1. Reads the local file
2. Uploads it to Cloudinary
3. Stores the Cloudinary URL in Supabase

**You never manually upload to Supabase!** The script handles everything automatically.
