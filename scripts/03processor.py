#!/usr/bin/env python3
"""
Processor Component - Filters and classifies images, updates CSV
"""

import os
import sys
import logging
from pathlib import Path
import time
import csv
import re
import shutil
import gc
from datetime import datetime

import cv2
import numpy as np
from PIL import Image
from sklearn.cluster import KMeans

# Torch for classification
try:
    import torch
    import torch.nn as nn
    import torchvision.models as models
    from torchvision import transforms
except ImportError as e:
    logging.error("PyTorch import failed: %s", e)
    sys.exit(1)

# Configuration
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
MODEL_PATH = SCRIPT_DIR / "best_model.pth"
OUTPUT_DIR = PROJECT_ROOT / "catalog-data"
FINAL_IMAGE_DIR = OUTPUT_DIR / "images"
CSV_PATH = OUTPUT_DIR / "scraped-items.csv"

# Clothing categories
CATEGORY_NAMES = [
    'Blazer', 'Blouse', 'Body', 'Dress', 'Hat', 'Hoodie', 'Longsleeve',
    'Not sure', 'Other', 'Outwear', 'Pants', 'Polo', 'Shirt', 'Shoes',
    'Shorts', 'Skip', 'Skirt', 'T-Shirt', 'Top', 'Undershirt'
]

CLOTHING_CATEGORIES = {
    "Blouse": "top", "Body": "top", "Polo": "top", "Shirt": "top", 
    "T-Shirt": "top", "Top": "top", "Undershirt": "top", "Longsleeve": "top",
    "Pants": "bottom", "Shorts": "bottom", "Skirt": "bottom",
    "Blazer": "outerwear", "Hoodie": "outerwear", "Outwear": "outerwear", 
    "Dress": "outerwear", "Shoes": "shoes", "Hat": "accessory",
}

COLOR_NAMES = {
    'black': (0, 0, 0), 'white': (255, 255, 255), 'red': (255, 0, 0),
    'blue': (0, 0, 255), 'green': (0, 255, 0), 'yellow': (255, 255, 0),
    'orange': (255, 165, 0), 'purple': (128, 0, 128), 'pink': (255, 192, 203),
    'brown': (165, 42, 42), 'gray': (128, 128, 128), 'beige': (245, 245, 220),
    'navy': (0, 0, 128), 'maroon': (128, 0, 0), 'olive': (128, 128, 0),
    'teal': (0, 128, 128), 'cyan': (0, 255, 255), 'magenta': (255, 0, 255),
}

MIN_CLASSIFICATION_CONFIDENCE = 0.65
REJECTED_CATEGORIES = {'Not sure', 'Other', 'Skip'}

# Supported image extensions
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.webp'}

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# --------------------
# CLASSIFIER
# --------------------
class ClothingClassifier:
    def __init__(self, model_path):
        logger.info("Loading model from %s...", model_path)
        self.model = models.resnet50(pretrained=False)
        num_ftrs = self.model.fc.in_features
        self.model.fc = nn.Linear(num_ftrs, len(CATEGORY_NAMES))

        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        try:
            state = torch.load(model_path, map_location='cpu')
            if isinstance(state, dict) and 'state_dict' in state:
                state = state['state_dict']
            self.model.load_state_dict(state)
            self.model.to(device)
            self.model.eval()
            self.device = device
            logger.info("Model loaded (device: %s)", device)
        except Exception as e:
            logger.exception("Failed to load model: %s", e)
            raise

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def classify(self, image_path):
        """Classify image and validate category."""
        try:
            img = Image.open(image_path).convert('RGB')
            input_tensor = self.transform(img).unsqueeze(0).to(self.device)
            with torch.no_grad():
                output = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(output, dim=1)
                confidence, predicted_idx = torch.max(probabilities, dim=1)
            
            clothing_type = CATEGORY_NAMES[predicted_idx.item()]
            confidence_val = confidence.item()
            
            # Strict validation
            if clothing_type in REJECTED_CATEGORIES:
                logger.info("REJECTED: Invalid category '%s'", clothing_type)
                return "REJECTED", "rejected", 0.0
                
            if confidence_val < MIN_CLASSIFICATION_CONFIDENCE:
                logger.info("REJECTED: Low confidence %.2f for '%s'", confidence_val, clothing_type)
                return "REJECTED", "rejected", 0.0
                
            category = CLOTHING_CATEGORIES.get(clothing_type, 'uncategorized')
            if category == 'uncategorized':
                logger.info("REJECTED: Uncategorized clothing type '%s'", clothing_type)
                return "REJECTED", "rejected", 0.0
                
            return clothing_type, category, confidence_val
        except Exception as e:
            logger.exception("Classification error: %s", e)
            return "REJECTED", "rejected", 0.0

# --------------------
# BODY DETECTOR
# --------------------
class BodyDetector:
    def __init__(self):
        self.face_cascade = None
        try:
            haar_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            if os.path.exists(haar_path):
                self.face_cascade = cv2.CascadeClassifier(haar_path)
                logger.info("OpenCV Haar cascade available for face detection")
                
            upper_body_path = cv2.data.haarcascades + 'haarcascade_upperbody.xml'
            if os.path.exists(upper_body_path):
                self.upper_body_cascade = cv2.CascadeClassifier(upper_body_path)
                logger.info("OpenCV upper body cascade available")
            else:
                self.upper_body_cascade = None
                
        except Exception as e:
            logger.warning("OpenCV cascades not available: %s", e)

    def has_human_body(self, image_path):
        """Body detection using OpenCV."""
        try:
            img = cv2.imread(str(image_path))
            if img is None or img.size == 0:
                return True
                
            img_small = cv2.resize(img, (400, 400))
            gray = cv2.cvtColor(img_small, cv2.COLOR_BGR2GRAY)
            
            # Face detection
            if self.face_cascade is not None:
                faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(20, 20))
                if len(faces) > 0:
                    logger.info("REJECTED: Face detected")
                    return True

            # Upper body detection
            if self.upper_body_cascade is not None:
                upper_bodies = self.upper_body_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
                if len(upper_bodies) > 0:
                    logger.info("REJECTED: Upper body detected")
                    return True

            # Skin tone detection
            if self._has_skin_tone(img_small):
                logger.info("REJECTED: Skin tones detected")
                return True

            return False
            
        except Exception as e:
            logger.exception("Body detection error: %s", e)
            return True

    def _has_skin_tone(self, img):
        """Detect skin tones in image."""
        try:
            if img is None or img.size == 0:
                return False
                
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            lower_skin = np.array([0, 20, 70], dtype=np.uint8)
            upper_skin = np.array([20, 255, 255], dtype=np.uint8)
            
            mask = cv2.inRange(hsv, lower_skin, upper_skin)
            skin_pixels = np.sum(mask > 0)
            total_pixels = img.shape[0] * img.shape[1]
            
            if total_pixels == 0:
                return False
                
            skin_ratio = skin_pixels / total_pixels
            return skin_ratio > 0.05
        except Exception:
            return False

# --------------------
# TEXT DETECTOR
# --------------------
class TextDetector:
    def has_text(self, image_path):
        """Simple text detection using contour analysis."""
        try:
            img = cv2.imread(str(image_path))
            if img is None:
                return False
                
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5,5))
            grad = cv2.morphologyEx(gray, cv2.MORPH_GRADIENT, kernel)
            
            _, thresh = cv2.threshold(grad, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            text_contours = 0
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / h
                area = w * h
                
                if (0.1 < aspect_ratio < 10.0 and 
                    10 < area < (img.shape[0] * img.shape[1] * 0.1) and
                    h > 5 and w > 5):
                    text_contours += 1
                    
            if text_contours > 10:
                logger.info("REJECTED: Text detected (%d text regions)", text_contours)
                return True
                
            return False
        except Exception as e:
            logger.exception("Text detection error: %s", e)
            return False

# --------------------
# COLOR DETECTOR
# --------------------
class ColorDetector:
    @staticmethod
    def get_dominant_colors(image_path, n_colors=3):
        """Get dominant colors with improved center-based primary color detection."""
        try:
            img = cv2.imread(str(image_path))
            if img is None:
                return []
            
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Get primary color from 5x5 center region
            primary_color_name = ColorDetector._get_center_color(img_rgb)
            
            # Get additional colors from full image using k-means
            img_small = cv2.resize(img_rgb, (150, 150))
            pixels = img_small.reshape(-1, 3)
            kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
            kmeans.fit(pixels)
            colors = kmeans.cluster_centers_.astype(int)
            
            color_names = [primary_color_name] if primary_color_name else []
            
            for color in colors:
                color_name = ColorDetector._rgb_to_name(tuple(color))
                if color_name and color_name not in color_names:
                    color_names.append(color_name)
            
            # Ensure we return at least the primary color
            if not color_names:
                color_names.append('unknown')
            
            return color_names[:n_colors]
            
        except Exception as e:
            logger.exception("Color detection error: %s", e)
            return []

    @staticmethod
    def _get_center_color(img_rgb):
        """Extract and average color from 5x5 pixel center region."""
        try:
            height, width = img_rgb.shape[:2]
            center_y, center_x = height // 2, width // 2
            
            # Extract 5x5 region from center
            start_y = max(0, center_y - 2)
            end_y = min(height, center_y + 3)
            start_x = max(0, center_x - 2)
            end_x = min(width, center_x + 3)
            
            center_region = img_rgb[start_y:end_y, start_x:end_x]
            
            # Calculate average color
            avg_color = np.mean(center_region, axis=(0, 1)).astype(int)
            
            # Convert to color name
            color_name = ColorDetector._rgb_to_name(tuple(avg_color))
            logger.info("Center color (5x5): RGB%s -> %s", tuple(avg_color), color_name)
            
            return color_name
            
        except Exception as e:
            logger.exception("Center color extraction error: %s", e)
            return None

    @staticmethod
    def _rgb_to_name(rgb):
        """Map RGB value to nearest color name."""
        min_distance = float('inf')
        closest_name = None
        for name, named_rgb in COLOR_NAMES.items():
            distance = sum((a - b) ** 2 for a, b in zip(rgb, named_rgb)) ** 0.5
            if distance < min_distance:
                min_distance = distance
                closest_name = name
        return closest_name

# --------------------
# CSV MANAGER
# --------------------
class CatalogCSV:
    CSV_HEADERS = [
        'name', 'clothing_type', 'category', 'brand', 'size',
        'primary_color', 'secondary_colors', 'style_tags', 'weather_tags',
        'season', 'description', 'image_filename', 'privacy'
    ]

    def __init__(self, csv_path):
        self.csv_path = Path(csv_path)
        self._ensure_csv_exists()

    def _ensure_csv_exists(self):
        self.csv_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.csv_path.exists():
            with open(self.csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=self.CSV_HEADERS)
                writer.writeheader()
            logger.info("Created new CSV: %s", self.csv_path)

    def add_item(self, item_data):
        row = {header: item_data.get(header, '') for header in self.CSV_HEADERS}
        with open(self.csv_path, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=self.CSV_HEADERS)
            writer.writerow(row)
        logger.info("Added item to CSV: %s", item_data['name'])

# --------------------
# MAIN PROCESSOR
# --------------------
class ImageProcessor:
    def __init__(self, input_directory):
        self.input_directory = Path(input_directory)
        FINAL_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
        self.classifier = ClothingClassifier(MODEL_PATH)
        self.body_detector = BodyDetector()
        self.text_detector = TextDetector()
        self.color_detector = ColorDetector()
        self.csv_manager = CatalogCSV(CSV_PATH)
        self.stats = {
            'total_images': 0,
            'images_with_body': 0,
            'images_with_text': 0,
            'invalid_category': 0,
            'images_saved': 0,
            'items_added': 0
        }

    def process_images(self):
        """Process all image files in input directory"""
        # Find all image files regardless of filename
        image_files = []
        for ext in IMAGE_EXTENSIONS:
            image_files.extend(self.input_directory.glob(f"*{ext}"))
            image_files.extend(self.input_directory.glob(f"*{ext.upper()}"))
        
        self.stats['total_images'] = len(image_files)
        
        if not image_files:
            logger.warning("No image files found in %s", self.input_directory)
            return
            
        logger.info("Found %d image files to process", len(image_files))
        
        for image_path in image_files:
            self._process_single_image(image_path)
            
        self._print_summary()

    def _process_single_image(self, image_path):
        """Process a single image through the validation pipeline"""
        try:
            logger.info("Processing: %s", image_path.name)
            
            # 1. Check for body parts
            logger.info("Checking for body parts...")
            if self.body_detector.has_human_body(image_path):
                self.stats['images_with_body'] += 1
                return
                
            # 2. Check for text
            logger.info("Checking for text...")
            if self.text_detector.has_text(image_path):
                self.stats['images_with_text'] += 1
                return
                
            # 3. Classify clothing type
            logger.info("Classifying clothing type...")
            clothing_type, category, confidence = self.classifier.classify(image_path)
            
            if clothing_type == "REJECTED":
                self.stats['invalid_category'] += 1
                return
                
            logger.info("Classified as: %s (%.2f%%)", clothing_type, confidence * 100)
            
            # 4. Get colors (with improved center-based detection)
            colors = self.color_detector.get_dominant_colors(image_path, n_colors=3)
            primary_color = colors[0] if colors else 'unknown'
            secondary_colors = "|".join(colors[1:3]) if len(colors) > 1 else ''
            logger.info("Colors: %s", ', '.join(colors) if colors else 'unknown')
            
            # 5. Save valid image and update CSV
            final_filename = self._generate_filename(clothing_type, primary_color)
            final_path = FINAL_IMAGE_DIR / final_filename
            
            try:
                shutil.copy2(str(image_path), str(final_path))
            except Exception as e:
                logger.error("Failed to copy image: %s", e)
                return
            
            # Add to catalog
            item_name = f"{primary_color.capitalize()} {clothing_type}"
            item_data = {
                'name': item_name,
                'clothing_type': clothing_type,
                'category': category,
                'brand': '',
                'size': '',
                'primary_color': primary_color,
                'secondary_colors': secondary_colors,
                'style_tags': '',
                'weather_tags': '',
                'season': '',
                'description': f'Added by StyleSnap bot on {datetime.now().strftime("%Y-%m-%d")}',
                'image_filename': final_filename,
                'privacy': 'public'
            }
            
            self.csv_manager.add_item(item_data)
            self.stats['images_saved'] += 1
            self.stats['items_added'] += 1
            logger.info("APPROVED and saved as: %s", final_filename)
            
        except Exception as e:
            logger.exception("Error processing image %s: %s", image_path, e)
        finally:
            gc.collect()

    def _generate_filename(self, clothing_type, color):
        """Generate final filename"""
        timestamp = int(time.time())
        clean_type = re.sub(r'[^\w\-]', '', clothing_type.lower().replace(' ', '-'))
        clean_color = re.sub(r'[^\w\-]', '', color.lower())
        return f"{clean_color}-{clean_type}-{timestamp}.jpg"

    def _print_summary(self):
        logger.info("=" * 60)
        logger.info("PROCESSING SUMMARY")
        logger.info("=" * 60)
        logger.info("Total images processed: %d", self.stats['total_images'])
        logger.info("Rejected - body parts: %d", self.stats['images_with_body'])
        logger.info("Rejected - text: %d", self.stats['images_with_text'])
        logger.info("Rejected - invalid category: %d", self.stats['invalid_category'])
        logger.info("APPROVED product images: %d", self.stats['images_saved'])
        logger.info("Items added to catalog: %d", self.stats['items_added'])
        logger.info("=" * 60)
        logger.info("Final images folder: %s", FINAL_IMAGE_DIR)
        logger.info("CSV catalog: %s", CSV_PATH)
        logger.info("=" * 60)

def get_input_directory():
    """Prompt user for input directory"""
    print("\n" + "=" * 60)
    print("IMAGE PROCESSOR - StyleSnap")
    print("=" * 60)
    print("\nThis tool will process all image files in your specified directory.")
    print("Supported formats: JPG, JPEG, PNG, BMP, GIF, TIFF, WEBP")
    print()
    
    while True:
        user_input = input("Enter the directory path containing images to process: ").strip()
        
        if not user_input:
            print("Error: Please provide a directory path.\n")
            continue
            
        input_path = Path(user_input)
        
        if not input_path.exists():
            print(f"Error: Directory '{user_input}' does not exist.\n")
            continue
            
        if not input_path.is_dir():
            print(f"Error: '{user_input}' is not a directory.\n")
            continue
            
        # Check if directory contains any image files
        image_count = 0
        for ext in IMAGE_EXTENSIONS:
            image_count += len(list(input_path.glob(f"*{ext}")))
            image_count += len(list(input_path.glob(f"*{ext.upper()}")))
        
        if image_count == 0:
            print(f"Warning: No image files found in '{user_input}'.")
            proceed = input("Do you want to proceed anyway? (yes/no): ").strip().lower()
            if proceed not in ['yes', 'y']:
                continue
        else:
            print(f"\nFound {image_count} image file(s) in directory.")
        
        return input_path

def main():
    logger.info("Starting Processor - Image Validator and Catalog Builder")
    
    if not MODEL_PATH.exists():
        logger.error("Model not found at %s", MODEL_PATH)
        sys.exit(1)
    
    # Get input directory from user
    input_directory = get_input_directory()
    
    print(f"\nProcessing images from: {input_directory}")
    print(f"Output directory: {FINAL_IMAGE_DIR}")
    print(f"CSV catalog: {CSV_PATH}")
    print("\nStarting processing...\n")
    
    processor = ImageProcessor(input_directory)
    processor.process_images()
    
    logger.info("Processor completed successfully")

if __name__ == '__main__':
    main()