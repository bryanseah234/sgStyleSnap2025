# CORS Issue with Fashion Transformer API

## Issue Overview

The Fashion Transformer API hosted at `https://ftransformer.onrender.com` returns CORS (Cross-Origin Resource Sharing) errors when called from the frontend.

### Error Message
```
Access to fetch at 'https://ftransformer.onrender.com/recommendation/score' 
from origin 'https://sgstylesnap-git-base44-theprawnvercel.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header 
is present on the requested resource.
```

## Why This Happens

CORS is a browser security policy that prevents web pages from making requests to different domains unless the server explicitly allows it. The backend API at `ftransformer.onrender.com` does not have CORS headers configured to allow requests from your frontend domain.

## Current Behavior

✅ **The app continues to work normally!** 

The app has a built-in fallback system that uses color-based outfit scoring when the Fashion Transformer API is unavailable. This means:
- Users can still score outfits
- The feature degrades gracefully
- No functionality is lost

### Fallback System

When the API fails, the app automatically:
1. Detects the CORS error
2. Falls back to `calculateColorBasedScore()` function
3. Provides outfit compatibility scores based on color theory
4. Returns results to the user

## Solutions

### Option 1: Fix CORS on Backend (Recommended)

Configure the Fashion Transformer backend to allow CORS from your frontend:

```python
# In your backend code (Flask/FastAPI)
from flask_cors import CORS

# Allow all origins (for development)
CORS(app)

# OR allow specific origin (for production)
CORS(app, origins=["https://sgstylesnap-git-base44-theprawnvercel.vercel.app"])
```

**Backend file location**: You'll need to update the backend repository hosting the `ftransformer.onrender.com` API.

### Option 2: Use a Proxy/Edge Function (Quick Fix)

Create a Supabase Edge Function that acts as a proxy to the API:

```typescript
// supabase/functions/outfit-scoring/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const outfitData = await req.json()
  
  // Forward the request to the Fashion Transformer API
  const response = await fetch('https://ftransformer.onrender.com/recommendation/score', {
    method: 'POST',
    body: JSON.stringify(outfitData)
  })
  
  const data = await response.json()
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

Then update the frontend to call your Edge Function instead:

```javascript
const response = await fetch(`${SUPABASE_URL}/functions/v1/outfit-scoring`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  },
  body: formData
})
```

### Option 3: Keep the Fallback (No Action Required)

The current fallback system works well enough. The color-based scoring provides reasonable outfit compatibility scores and the app continues to function normally.

## Impact on Users

**Minimal** - Users may notice slightly different scoring results, but the core functionality remains intact. The fallback color-based scoring is still useful for outfit compatibility.

## Monitoring

Check console logs for these messages:
- `ℹ️ Fashion Transformer: API unavailable (CORS), using fallback scoring` - Graceful fallback
- `Transformer API failed, using color score as fallback` - Fallback in action

## Related Files

- `src/services/fashion-transformer-service.js` - API client code
- `src/services/recommendation-service.js` - Fallback color scoring logic

