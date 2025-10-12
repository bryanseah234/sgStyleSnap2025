---
title: FashionRNN Clothing Classifier
emoji: 👕
colorFrom: purple
colorTo: blue
sdk: gradio
sdk_version: 3.50.2
app_file: app.py
pinned: false
license: mit
short_description: AI-powered clothing classification using FashionRNN
---

# FashionRNN Clothing Classifier

This is an AI-powered clothing classification model that can identify different types of clothing items from images.

## Features

- **20 Clothing Categories**: T-Shirt, Shirt, Blouse, Pants, Dress, Shoes, etc.
- **High Accuracy**: Trained FashionRNN model with ResNet50 architecture
- **Real-time Classification**: Instant predictions with confidence scores
- **API Access**: Can be integrated into web applications

## How to Use

1. **Upload an image** of clothing item
2. **Get instant classification** with confidence scores
3. **View top 3 predictions** for better accuracy

## API Integration

This model can be integrated into web applications via the Gradio API:

```javascript
// Example API call
const response = await fetch('https://your-space.hf.space/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: [imageBase64],
    fn_index: 0
  })
})
```

## Categories

The model can classify these 20 clothing types:

- T-Shirt, Shirt, Blouse, Polo, Top, Body, Longsleeve, Undershirt
- Pants, Shorts, Dress, Skirt, Shoes, Hat
- Blazer, Hoodie, Outwear, Other, Not sure, Skip

Perfect for fashion apps, wardrobe organizers, and clothing recommendation systems!
