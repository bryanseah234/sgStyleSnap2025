# FashionRNN Model Deployment Guide

## 🎯 **Quick Start - Choose Your Platform**

### **Option 1: Hugging Face Spaces (Recommended - Free & Easy)**

**Perfect for ML models with a nice web interface**

#### **Steps:**

1. **Prepare your model:**

   ```bash
   cp fashion-rnn/best_model.pth huggingface-deploy/
   ```

2. **Go to Hugging Face:**
   - Visit https://huggingface.co/new-space
   - Choose "Gradio" as SDK
   - Name: `fashionrnn-classifier`
   - Set to Public

3. **Upload files:**
   - Upload `huggingface-deploy/app.py`
   - Upload `huggingface-deploy/requirements.txt`
   - Upload `huggingface-deploy/best_model.pth`

4. **Deploy:**
   - Hugging Face will automatically build and deploy
   - You'll get: `https://huggingface.co/spaces/yourusername/fashionrnn-classifier`

5. **Use in your webapp:**
   ```javascript
   // The Gradio interface provides an API at:
   // https://yourusername-fashionrnn-classifier.hf.space/api/predict
   ```

---

### **Option 2: Railway (Simple API)**

**Clean API endpoint for your webapp**

#### **Steps:**

1. **Prepare files:**

   ```bash
   cp fashion-rnn/best_model.pth railway-api/
   cd railway-api
   ```

2. **Go to Railway:**
   - Visit https://railway.app
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"

3. **Connect repository:**
   - Select your ClosetApp repository
   - Set root directory to `railway-api`
   - Railway will auto-detect Python

4. **Deploy:**
   - Railway builds and deploys automatically
   - You'll get: `https://your-app.railway.app`

5. **Update your webapp:**
   ```javascript
   // In src/services/fashion-rnn-service.js
   const response = await fetch('https://your-app.railway.app/classify', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ image_data: imageData })
   })
   ```

---

### **Option 3: Render (Free Tier)**

**Reliable hosting with free SSL**

#### **Steps:**

1. **Prepare files:**

   ```bash
   cp fashion-rnn/best_model.pth railway-api/
   ```

2. **Go to Render:**
   - Visit https://render.com
   - Sign up and click "New +" → "Web Service"
   - Connect your GitHub repo

3. **Configure:**
   - **Root Directory:** `railway-api`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app.py`

4. **Deploy:**
   - Render builds and deploys
   - You'll get: `https://your-app.onrender.com`

---

## 🔧 **Update Your Frontend**

Once you have your API URL, update the frontend:

### **1. Update the service:**

```javascript
// In src/services/fashion-rnn-service.js
export async function classifyClothingItem(image) {
  try {
    console.log('🧠 FashionRNN classification requested for:', image)

    // Convert image to base64
    let imageData
    if (image instanceof File) {
      imageData = await fileToBase64(image)
    } else {
      throw new Error('Invalid image parameter')
    }

    // Call your deployed API
    const response = await fetch('https://your-api-url.railway.app/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image_data: imageData })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Classification failed')
    }

    console.log(
      '✅ Real FashionRNN classification:',
      result.top_prediction,
      `(${Math.round(result.confidence * 100)}%)`
    )

    return {
      success: true,
      predictions: result.predictions,
      topPrediction: result.top_prediction,
      confidence: result.confidence,
      styleSnapCategory: result.style_snap_category,
      clothingType: result.clothing_type,
      allPredictions: result.all_predictions
    }
  } catch (error) {
    console.error('❌ FashionRNN classification failed:', error)

    // Fallback to mock if API is down
    return getFallbackClassification()
  }
}
```

### **2. Test the integration:**

1. Deploy your model to one of the platforms above
2. Update the API URL in your frontend service
3. Test in your AddItemModal by uploading images
4. You should see real FashionRNN predictions!

---

## 📊 **API Endpoints**

Your deployed API will have:

### **Health Check:**

```
GET https://your-api.railway.app/health
```

### **Classify Image:**

```
POST https://your-api.railway.app/classify
Content-Type: application/json

{
  "image_data": "base64_encoded_image"
}
```

**Response:**

```json
{
  "success": true,
  "top_prediction": "T-Shirt",
  "confidence": 0.89,
  "style_snap_category": "top",
  "clothing_type": "t_shirt",
  "predictions": [
    { "category": "T-Shirt", "confidence": 0.89 },
    { "category": "Shirt", "confidence": 0.08 },
    { "category": "Blouse", "confidence": 0.03 }
  ]
}
```

---

## 🎉 **Benefits of Hosted Model:**

✅ **Real AI Classification**: Your actual FashionRNN model
✅ **Public Access**: Anyone can use your API
✅ **Automatic Scaling**: Handles multiple requests
✅ **Free Hosting**: Most platforms offer free tiers
✅ **SSL/HTTPS**: Secure connections
✅ **Easy Integration**: Simple API calls from your webapp

---

## 🚀 **Recommended Workflow:**

1. **Start with Hugging Face Spaces** (easiest to set up)
2. **Test the model** works correctly
3. **Use Railway for production** (better for API-only)
4. **Update your frontend** to use the real API
5. **Deploy and enjoy** real AI-powered classification!

Your FashionRNN model will be publicly accessible and ready to power your StyleSnap app with real AI classification! 🎊
