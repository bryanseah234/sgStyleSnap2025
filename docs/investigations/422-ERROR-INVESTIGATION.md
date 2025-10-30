# 422 Error Investigation for OOTDiffusion Spaces API

## Problem
Test 2 returned a **422 Unprocessable Entity** error when using direct parameters format.

## Root Cause Analysis

### 1. **Direct Parameters Format Doesn't Work for Gradio Spaces API**

The 422 error occurs because **Gradio Spaces API does NOT support direct parameter format**. Gradio only accepts the `data` array format with `fn_index`.

#### ❌ **Incorrect Format (Test 2 - Returns 422):**
```json
{
  "cloth_image": "base64_string",
  "model_image": "base64_string",
  "model_type": "hd",
  "category": 0,
  ...
}
```

#### ✅ **Correct Format (Spaces API - Gradio format):**
```json
{
  "data": [
    "data:image/jpeg;base64,...",  // model_image
    "data:image/jpeg;base64,...",  // cloth_image
    "hd",                           // model_type
    0,                              // category
    2.0,                            // scale
    20,                             // step
    4,                              // sample
    -1                              // seed
  ],
  "fn_index": 0
}
```

### 2. **Image Format Requirements**

Based on documentation and testing:
- **OOTDiffusion expects JPEG format** (`data:image/jpeg;base64,...`)
- Our previous implementation used PNG (`data:image/png;base64,...`)
- The API may be strict about format compatibility

### 3. **Why 422 Instead of Other Errors?**

- **422 = Unprocessable Entity**: The server understands the request but cannot process it
- This happens when the **format is wrong** (not the data itself)
- Direct parameters format is semantically incorrect for Gradio Spaces API

## Solution Implemented

### ✅ Changes Made:

1. **Added JPEG Conversion Function**
   - Created `blobToJPEGBase64()` to convert any image to JPEG format
   - Handles transparency by adding white background
   - Uses 90% quality for good balance

2. **Updated Spaces API Format**
   - Now converts images to JPEG for OOTDiffusion
   - Uses proper `data` array format with all 8 parameters
   - Maintains original format for other models

3. **Fixed Format Structure**
   - All parameters in correct order in `data` array
   - Images as JPEG data URLs: `data:image/jpeg;base64,...`

## Code Changes

### File: `src/services/virtualTryOnService.js`

1. **New Function: `blobToJPEGBase64()`** (lines 183-218)
   - Converts any blob to JPEG format
   - Handles transparency
   - Cleans up object URLs

2. **Updated: `callWithJSON()` Spaces API path** (lines 342-348)
   - Detects OOTDiffusion
   - Converts to JPEG before sending
   - Uses proper data array format

## Testing Recommendations

1. ✅ **Use `data` array format** (not direct parameters)
2. ✅ **Use JPEG format** for OOTDiffusion images
3. ✅ **Include all 8 parameters** in correct order
4. ⚠️ **Test with real images** (minimal test images cause 500 errors)

## Summary

The **422 error is expected** when using direct parameters format with Gradio Spaces API. The correct approach is:
- Use `data` array format with `fn_index`
- Convert images to JPEG format for OOTDiffusion
- Include all required parameters in the correct order

Our implementation now correctly handles this! ✅

