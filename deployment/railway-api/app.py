#!/usr/bin/env python3
"""
FashionRNN API Server for Railway
"""

import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms
from PIL import Image
import numpy as np
import base64
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# FashionRNN categories
CATEGORY_NAMES = [
    'Blazer', 'Blouse', 'Body', 'Dress', 'Hat', 'Hoodie', 'Longsleeve', 
    'Not sure', 'Other', 'Outwear', 'Pants', 'Polo', 'Shirt', 'Shoes', 
    'Shorts', 'Skip', 'Skirt', 'T-Shirt', 'Top', 'Undershirt'
]

CATEGORY_MAPPING = {
    'T-Shirt': 'top', 'Shirt': 'top', 'Blouse': 'top', 'Polo': 'top',
    'Top': 'top', 'Body': 'top', 'Longsleeve': 'top', 'Undershirt': 'top',
    'Pants': 'bottom', 'Shorts': 'bottom', 'Dress': 'dress', 'Skirt': 'dress',
    'Shoes': 'shoes', 'Hat': 'accessory', 'Blazer': 'outerwear',
    'Hoodie': 'outerwear', 'Outwear': 'outerwear', 'Other': 'top',
    'Not sure': 'top', 'Skip': 'top'
}

class FashionRNNClassifier:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = self.load_model()
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                               std=[0.229, 0.224, 0.225])
        ])
        print(f"FashionRNN Classifier initialized on {self.device}")
    
    def load_model(self):
        """Load the FashionRNN model"""
        try:
            # Try different possible model paths
            model_paths = [
                'best_model.pth',
                'model/best_model.pth',
                '/app/best_model.pth'
            ]
            
            model_path = None
            for path in model_paths:
                if os.path.exists(path):
                    model_path = path
                    break
            
            if not model_path:
                print("Model file not found")
                return None
            
            # Define the model architecture
            model = models.resnet50(pretrained=False)
            num_ftrs = model.fc.in_features
            model.fc = nn.Linear(num_ftrs, 20)
            
            # Load the trained weights
            model.load_state_dict(torch.load(model_path, map_location=self.device))
            model.eval()
            print(f"Model loaded successfully from {model_path}")
            return model
        except Exception as e:
            print(f"Error loading model: {e}")
            return None
    
    def classify(self, image_data):
        """Classify clothing item"""
        if self.model is None:
            return self.get_fallback_result()
        
        try:
            # Decode base64 image
            if isinstance(image_data, str):
                image_bytes = base64.b64decode(image_data)
            else:
                image_bytes = image_data
            
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.softmax(outputs, dim=1)
                top3_probs, top3_indices = torch.topk(probabilities, 3)
                
                predictions = []
                for i in range(3):
                    category = CATEGORY_NAMES[top3_indices[0][i].item()]
                    confidence = top3_probs[0][i].item()
                    predictions.append({'category': category, 'confidence': confidence})
                
                top_prediction = predictions[0]['category']
                top_confidence = predictions[0]['confidence']
                
                result = {
                    'success': True,
                    'predictions': predictions,
                    'top_prediction': top_prediction,
                    'confidence': top_confidence,
                    'style_snap_category': CATEGORY_MAPPING.get(top_prediction, 'top'),
                    'clothing_type': top_prediction.lower().replace('-', '_').replace(' ', '_'),
                    'all_predictions': [
                        {
                            'fashion_rnn_category': pred['category'],
                            'style_snap_category': CATEGORY_MAPPING.get(pred['category'], 'top'),
                            'clothing_type': pred['category'].lower().replace('-', '_').replace(' ', '_'),
                            'confidence': pred['confidence']
                        }
                        for pred in predictions
                    ]
                }
                
                print(f"Classification: {top_prediction} ({top_confidence:.3f})")
                return result
                
        except Exception as e:
            print(f"Error during classification: {e}")
            return self.get_fallback_result()
    
    def get_fallback_result(self):
        """Fallback result when model fails"""
        return {
            'success': False,
            'error': 'Model not available',
            'top_prediction': 'T-Shirt',
            'confidence': 0.85,
            'style_snap_category': 'top',
            'clothing_type': 't_shirt'
        }

# Initialize classifier
classifier = FashionRNNClassifier()

@app.route('/')
def home():
    """API home page"""
    return jsonify({
        'name': 'FashionRNN API',
        'version': '1.0.0',
        'description': 'AI-powered clothing classification API',
        'endpoints': {
            'classify': '/classify',
            'health': '/health',
            'categories': '/categories'
        }
    })

@app.route('/classify', methods=['POST'])
def classify_clothing():
    """Classify clothing item endpoint"""
    try:
        data = request.get_json()
        
        if 'image_data' not in data:
            return jsonify({'error': 'image_data is required'}), 400
        
        result = classifier.classify(data['image_data'])
        return jsonify(result)
        
    except Exception as e:
        print(f"Classification error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': classifier.model is not None,
        'device': str(classifier.device),
        'categories': len(CATEGORY_NAMES)
    })

@app.route('/categories', methods=['GET'])
def get_categories():
    """Get available FashionRNN categories"""
    return jsonify({
        'categories': CATEGORY_NAMES,
        'mapping': CATEGORY_MAPPING
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Starting FashionRNN API Server on port {port}")
    print(f"🔧 Model loaded: {classifier.model is not None}")
    print(f"🖥️  Device: {classifier.device}")
    
    app.run(host='0.0.0.0', port=port, debug=False)
