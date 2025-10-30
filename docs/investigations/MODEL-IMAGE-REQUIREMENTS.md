# Model Image Requirements for Virtual Try-On

## Answer

**Technically YES, but practically NO - you only need top and bottom images.**

## Details

### API Requirement
The virtual try-on APIs (OOTDiffusion, IDM-VTON) **require** both:
- `model_image` - The person/model wearing the clothes
- `cloth_image` - The clothing item(s)

### Current Implementation
```javascript
async generateTryOn({ topImageUrl, bottomImageUrl, modelImageUrl = null })
```

**Model image is OPTIONAL:**
- ✅ If `modelImageUrl` is **provided** → uses your custom model image
- ✅ If `modelImageUrl` is **null/undefined** → automatically uses a default placeholder

### Default Placeholder
When no model image is provided, the code creates a simple placeholder:

```javascript
// Creates a 768x1024px placeholder with:
// - Gray background (#F5F5F5)
// - Simple gray silhouette (ellipse shape)
// - Text: "Model Placeholder - Use your own model photo for better results"
```

**Quality:** Basic silhouette placeholder - functional but not realistic.

## Usage Examples

### ✅ Option 1: Just Top + Bottom (Default Placeholder)
```javascript
await virtualTryOnService.generateTryOn({
  topImageUrl: "https://cloudinary.com/.../shirt.jpg",
  bottomImageUrl: "https://cloudinary.com/.../pants.jpg"
  // modelImageUrl not provided - uses default placeholder
})
```

### ✅ Option 2: With Custom Model Image (Better Results)
```javascript
await virtualTryOnService.generateTryOn({
  topImageUrl: "https://cloudinary.com/.../shirt.jpg",
  bottomImageUrl: "https://cloudinary.com/.../pants.jpg",
  modelImageUrl: "https://cloudinary.com/.../person-photo.jpg" // Your model
})
```

## Recommendations

### For Production:
1. **Provide a real model image** for best results
   - Use a standard fashion model photo
   - Size: 768x1024px (recommended by OOTDiffusion docs)
   - Format: JPG, PNG, WebP
   - Neutral pose, plain background

2. **Or use a default model** in your database
   - Store a standard model photo
   - Reuse it across all try-ons

### For Development/Testing:
- ✅ **Default placeholder is fine** - it works functionally
- Results will show clothing on a gray silhouette

## Code Behavior

```javascript
// From generateTryOn():
let modelImageBlob
if (modelImageUrl) {
  // Use provided model image
  modelImageBlob = await this.urlToBlob(modelImageUrl)
} else {
  // Use default placeholder (always available)
  modelImageBlob varied await this.getDefaultModelImage()
}

// Both cases result in a valid Blob → API call succeeds
await this.callIDMVTONApi(modelImageBlob, outfitImageBlob)
```

## Summary

| Requirement | Status |
|------------|--------|
| **Top/Bottom Images** | ✅ **REQUIRED** |
| **Model Image** | ⚠️ **Optional** (default placeholder used if not provided) |
| **Quality Results** | 📸 **Better with real model image** |

**Bottom Line:** You can call with just top and bottom images - it will work with the default placeholder. But for production-quality results, provide a real model image.

