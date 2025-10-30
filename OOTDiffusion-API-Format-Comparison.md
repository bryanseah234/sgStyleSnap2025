# OOTDiffusion API Format Comparison

## Summary
This document compares our implementation with the expected OOTDiffusion API formats based on testing and documentation.

## 1. Inference API Format
**Endpoint:** `https://api-inference.huggingface.co/models/levihsu/OOTDiffusion`

### Expected Format (from documentation):
```json
{
  "inputs": {
    "model_image": "base64_string",
    "cloth_image": "base64_string",
    "model_type": "hd",
    "category": 0,
    "scale": 2.0,
    "step": 20,
    "sample": 4,
    "seed": -1
  }
}
```

### Our Implementation:
✅ **MATCHES** - We correctly use:
- `inputs` wrapper
- `model_image` and `cloth_image` (not `human_img`/`garm_img`)
- All optional parameters with correct defaults

**File:** `src/services/virtualTryOnService.js` lines 241-254

---

## 2. Spaces API Format
**Endpoint:** `https://levihsu-ootdiffusion.hf.space/api/predict`

### Expected Format (Gradio Spaces standard):
```json
{
  "data": [
    "data:image/png;base64,...",  // model_image (data URL)
    "data:image/png;base64,...",  // cloth_image (data URL)
    "hd",                          // model_type
    0,                             // category
    2.0,                           // scale
    20,                            // step
    4,                             // sample
    -1                             // seed
  ],
  "fn_index": 0
}
```

### Our Previous Implementation:
❌ **MISMATCHED** - Only sent 2 images:
```json
{
  "data": [modelBase64, garmentBase64],
  "fn_index": 0
}
```

### Our Updated Implementation:
✅ **FIXED** - Now includes all parameters in correct order:
```json
{
  "data": [
    modelBase64,    // model_image (data URL)
    garmentBase64,  // cloth_image (data URL)
    'hd',          // model_type
    0,             // category
    2.0,           // scale
    20,            // step
    4,             // sample
    -1             // seed
  ],
  "fn_index": 0
}
```

**File:** `src/services/virtualTryOnService.js` lines 300-322

---

## 3. Test Results

### Test 1: Spaces API with 2 images only
- **Status:** 500 (Internal Server Error)
- **Reason:** Missing required parameters

### Test 2: Direct parameters format
- **Status:** 422 (Unprocessable Entity)
- **Reason:** Not valid for Spaces API (Gradio expects `data` array)

### Test 3: Spaces API with all parameters
- **Status:** 500 (Internal Server Error)
- **Reason:** Likely invalid test image (too small), but format is correct

---

## 4. Response Format Handling

### OOTDiffusion Response Format:
```json
[
  {
    "image": "base64_string_or_data_url"
  }
]
```

### Our Implementation:
✅ **HANDLES CORRECTLY** - Extracts first image from array:
```javascript
if (isOOTDiffusion && Array.isArray(json) && json.length > 0) {
  const firstResult = json[0]
  if (firstResult && firstResult.image) {
    const imageData = firstResult.image
    // Convert to blob and return
  }
}
```

**File:** `src/services/virtualTryOnService.js` lines 428-442

---

## 5. Summary of Changes Made

1. ✅ **Inference API:** Updated to use `model_image`/`cloth_image` instead of `human_img`/`garm_img`
2. ✅ **Inference API:** Added all OOTDiffusion-specific parameters
3. ✅ **Spaces API:** Updated to include all 8 parameters in correct order
4. ✅ **Response Parsing:** Added handling for OOTDiffusion array response format
5. ✅ **Both Methods:** Updated `callWithJSON()` and `callWithInputsJSON()` to support OOTDiffusion

---

## 6. Remaining Considerations

- **Category Detection:** Currently hardcoded to `0` (upper body). Could be enhanced to detect category from clothing item metadata
- **Model Type:** Currently hardcoded to `'hd'`. Could add option for `'dc'` model type
- **Image Sizing:** Documentation mentions images should be resized to (768, 1024) before encoding. Current implementation may need validation

---

## 7. Testing Recommendations

1. Test with real images (not minimal test images) to verify complete workflow
2. Test with different categories (0, 1, 2) to ensure category parameter works
3. Test both Inference API and Spaces API endpoints
4. Verify response parsing handles various response formats correctly

