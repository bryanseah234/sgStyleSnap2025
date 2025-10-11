#!/usr/bin/env python3
"""
FashionRNN Model on Hugging Face Spaces
"""

import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms
from PIL import Image
import numpy as np
import base64
import io
import gradio as gr

# FashionRNN categories
CATEGORY_NAMES = [
    'Blazer', 'Blouse', 'Body', 'Dress', 'Hat', 'Hoodie', 'Longsleeve', 
    'Not sure', 'Other', 'Outwear', 'Pants', 'Polo', 'Shirt', 'Shoes', 
    'Shorts', 'Skip', 'Skirt', 'T-Shirt', 'Top', 'Undershirt'
]

# Mapping to StyleSnap categories
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
    
    def load_model(self):
        """Load the FashionRNN model"""
        try:
            # Try different possible model paths
            model_paths = ['best_model.pth', 'model/best_model.pth', '/app/best_model.pth']
            
            model_path = None
            for path in model_paths:
                try:
                    if torch.cuda.is_available():
                        model = models.resnet50(pretrained=False)
                        num_ftrs = model.fc.in_features
                        model.fc = nn.Linear(num_ftrs, 20)
                        model.load_state_dict(torch.load(path))
                    else:
                        model = models.resnet50(pretrained=False)
                        num_ftrs = model.fc.in_features
                        model.fc = nn.Linear(num_ftrs, 20)
                        model.load_state_dict(torch.load(path, map_location=torch.device('cpu')))
                    
                    model.eval()
                    print(f"Model loaded successfully from {path}")
                    return model
                except:
                    continue
            
            print("Model not found")
            return None
        except Exception as e:
            print(f"Error loading model: {e}")
            return None
    
    def classify(self, image):
        """Classify clothing item"""
        if self.model is None:
            return "Model not available", {}
        
        try:
            # Convert PIL image to tensor
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.softmax(outputs, dim=1)
                top3_probs, top3_indices = torch.topk(probabilities, 3)
                
                results = {}
                for i in range(3):
                    category = CATEGORY_NAMES[top3_indices[0][i].item()]
                    confidence = top3_probs[0][i].item()
                    results[category] = f"{confidence:.3f}"
                
                top_prediction = CATEGORY_NAMES[top3_indices[0][0].item()]
                top_confidence = top3_probs[0][0].item()
                
                return f"{top_prediction} ({top_confidence:.3f})", results
                
        except Exception as e:
            return f"Error: {str(e)}", {}

# Initialize classifier
classifier = FashionRNNClassifier()

def classify_image(image):
    """Gradio interface function"""
    if image is None:
        return "Please upload an image", {}
    
    result, details = classifier.classify(image)
    return result, details

# Create Gradio interface
interface = gr.Interface(
    fn=classify_image,
    inputs=gr.Image(type="pil", label="Upload Clothing Image"),
    outputs=[
        gr.Textbox(label="Prediction"),
        gr.Label(label="All Predictions", num_top_classes=3)
    ],
    title="FashionRNN Clothing Classifier",
    description="Upload a clothing image to classify it using FashionRNN",
    examples=[
        ["example1.jpg"],
        ["example2.jpg"],
        ["example3.jpg"]
    ]
)

if __name__ == "__main__":
    interface.launch(server_name="0.0.0.0", server_port=7860)
