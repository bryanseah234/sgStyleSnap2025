# Virtual Try-On Feature

## Overview

The Virtual Try-On feature allows users to see their outfit combinations on an AI-generated model person. This feature uses IDM-VTON (Improved Diffusion Models for Virtual Try-On), a state-of-the-art AI model hosted on Hugging Face, to composite clothing items onto a human model.

## Features

- **AI-Powered Generation**: Uses IDM-VTON model via Hugging Face Inference API
- **Automatic Outfit Compositing**: Automatically combines top and bottom items
- **Beautiful Modal Interface**: Clean, responsive modal with loading states and error handling
- **Download Capability**: Download generated images for later use
- **Smart Validation**: Only enables when outfit has both top and bottom items

## Setup Instructions

### 1. Get a Hugging Face API Token

1. Go to [Hugging Face](https://huggingface.co/) and create a free account
2. Navigate to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
3. Click "New token"
4. Give it a name (e.g., "StyleSnap Virtual Try-On")
5. Select "Read" permissions (sufficient for inference)
6. Copy the generated token

### 2. Configure Environment Variable

Add the token to your `.env.local` file:

```bash
# Hugging Face API Configuration
VITE_HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Important**: Never commit your `.env.local` file to version control!

### 3. Restart Development Server

After adding the environment variable, restart your Vite development server:

```bash
npm run dev
```

## How to Use

### 1. Create an Outfit

1. Navigate to the "Create Your Outfit" page
2. Add at least one **top** item (shirt, t-shirt, blouse, etc.)
3. Add at least one **bottom** item (pants, shorts, skirt, etc.)
4. Arrange them on the canvas as desired

### 2. Generate Virtual Try-On

1. Click the **"Show on Model"** button (gradient purple-pink button)
2. Wait while the AI generates the image (typically 5-15 seconds)
3. View the result in the modal popup

### 3. Download or Close

- Click **"Download Image"** to save the generated image
- Click **"Close"** to dismiss the modal
- If generation fails, click **"Try Again"** to retry

## Technical Details

### IDM-VTON Model

- **Model**: `yisol/IDM-VTON` on Hugging Face
- **Type**: Diffusion-based virtual try-on
- **Input**: Human model image + garment images
- **Output**: Realistic image of person wearing the garments

### Implementation Architecture

```
OutfitCreator.vue
    ↓
VirtualTryOnService
    ↓
Hugging Face Inference API
    ↓
IDM-VTON Model
    ↓
Generated Image
```

### Files Modified

1. **`src/services/virtualTryOnService.js`** - Service for API integration
2. **`src/components/dashboard/VirtualTryOnModal.vue`** - Modal UI component
3. **`src/pages/OutfitCreator.vue`** - Integrated button and functionality
4. **`env.example`** - Added API token configuration

## Features Breakdown

### Outfit Compositing

The service automatically combines top and bottom clothing items into a single outfit image:

```javascript
compositeOutfit(topImageUrl, bottomImageUrl)
```

- Canvas size: 768x1024 (standard for virtual try-on)
- Top positioned in upper 40% of canvas
- Bottom positioned in lower 40% of canvas
- White background for clean composition

### Button Visibility Logic

The "Show on Model" button is only enabled when:

```javascript
const canShowVirtualTryOn = computed(() => {
  const hasTop = /* checks for top items */
  const hasBottom = /* checks for bottom items */
  return hasTop && hasBottom
})
```

### Supported Categories

**Tops:**
- tops, top, t-shirt, shirt, blouse
- hoodie, longsleeve, polo, body
- undershirt, outerwear, blazer

**Bottoms:**
- bottoms, bottom, pants, shorts, skirt

## Error Handling

### Common Errors

1. **"Model is loading"** (503 error)
   - **Cause**: Model needs to warm up (cold start)
   - **Solution**: Wait 30 seconds and try again

2. **"Invalid API token"** (401 error)
   - **Cause**: Token is missing or incorrect
   - **Solution**: Check `.env.local` and ensure token is correct

3. **"Failed to load image"**
   - **Cause**: CORS issues or invalid image URLs
   - **Solution**: Ensure clothing items have valid, accessible image URLs

4. **"No Hugging Face API token found"**
   - **Cause**: Environment variable not set
   - **Solution**: Add `VITE_HUGGINGFACE_API_TOKEN` to `.env.local`

### Retry Mechanism

The modal includes a "Try Again" button that:
- Resets error state
- Regenerates the outfit composite
- Makes a new API call to IDM-VTON

## Future Enhancements

### Planned Features

1. **Custom Model Photos**
   - Allow users to upload their own photo as the model
   - Better personalization and accuracy

2. **Multiple Garment Support**
   - Add shoes, accessories, and outerwear
   - Full outfit composition

3. **Pose Selection**
   - Choose different model poses
   - Front, side, back views

4. **Background Options**
   - Different background scenes
   - Studio, outdoor, indoor settings

5. **Batch Generation**
   - Generate multiple angles at once
   - Compare different outfit combinations

### Alternative Models

Consider these alternatives if IDM-VTON doesn't meet your needs:

1. **OOTDiffusion** (`levihsu/OOTDiffusion`)
   - Fast inference
   - Supports half-body and full-body modes

2. **Kolors Virtual Try-On** (`Kwai-Kolors/Kolors-Virtual-Try-On`)
   - Recent model (2024)
   - Excellent multi-garment support

3. **AnyDressing**
   - Multi-garment customization
   - Text prompt support

## API Rate Limits

Hugging Face free tier limits:
- **Rate limit**: Varies by model usage
- **Concurrent requests**: Limited
- **Cold starts**: First request may take longer

For production:
- Consider [Hugging Face Pro](https://huggingface.co/pricing) for higher limits
- Implement request queuing for better UX
- Cache generated images to reduce API calls

## Troubleshooting

### Button is Disabled

**Check:**
- ✅ Canvas has at least one top item
- ✅ Canvas has at least one bottom item
- ✅ Items have valid categories

### Generation Takes Too Long

**Typical causes:**
- Cold start (first request after inactivity)
- High API load
- Large image files

**Solutions:**
- Wait patiently (up to 30 seconds)
- Optimize clothing item image sizes
- Try again during off-peak hours

### Poor Quality Results

**Improvements:**
- Use high-quality, clear clothing images
- Ensure items are on white/neutral backgrounds
- Use consistent lighting in clothing photos

## Security Considerations

1. **API Token Protection**
   - Never expose token in client-side code
   - Use environment variables only
   - Rotate tokens periodically

2. **Image Privacy**
   - Generated images are temporary
   - Not stored on Hugging Face servers
   - URLs are local object URLs

3. **CORS Handling**
   - Images must be accessible via CORS
   - Cloudinary images work well
   - Consider proxy for restricted images

## Support

For issues or questions:
1. Check this documentation
2. Review console logs for error messages
3. Verify API token is correct and active
4. Check [Hugging Face Status](https://status.huggingface.co/)

## Credits

- **IDM-VTON Model**: [yisol/IDM-VTON](https://huggingface.co/yisol/IDM-VTON)
- **Hugging Face**: API hosting and infrastructure
- **StyleSnap Team**: Implementation and integration

