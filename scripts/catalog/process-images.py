#!/usr/bin/env python3
"""
Process Images with Background Removal and AI Detection - StyleSnap Catalog Tool

This script processes clothing images by:
1. Removing backgrounds using rembg
2. Classifying clothing type using RNN model
3. Detecting colors and metadata
4. Generating CSV file compatible with seed-catalog-from-csv.js

Usage:
    python scripts/catalog/process-images.py <input_directory> [--output-dir <output_dir>] [--model-path <model_path>]

Example:
    python scripts/catalog/process-images.py ./my-images --output-dir ./catalog-output
"""

import os
import sys
import logging
from pathlib import Path
import time
import csv
import re
import gc
from datetime import datetime
import argparse

import cv2
import numpy as np
from PIL import Image
from sklearn.cluster import KMeans

# Background removal
try:
    from rembg import remove
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False
    logging.warning("rembg not available. Install with: pip install rembg")

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
PROJECT_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_MODEL_PATH = PROJECT_ROOT / "docs" / "ai-models" / "best_model.pth"
ALTERNATIVE_MODEL_PATH = SCRIPT_DIR.parent / "scraping" / "best_model.pth"

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
# BACKGROUND REMOVER
# --------------------
class BackgroundRemover:
    def __init__(self):
        self.available = REMBG_AVAILABLE
        if not self.available:
            logger.warning("Background removal disabled - rembg not available")
    
    def remove_background(self, image_path, output_path=None):
        """Remove background from image using rembg."""
        if not self.available:
            logger.warning("Background removal skipped - rembg not installed")
            return None
        
        try:
            logger.info("Removing background from: %s", image_path.name)
            
            # Read image
            with open(image_path, 'rb') as f:
                input_image = f.read()
            
            # Remove background
            output_image = remove(input_image)
            
            # Save processed image
            if output_path:
                output_path.parent.mkdir(parents=True, exist_ok=True)
                with open(output_path, 'wb') as f:
                    f.write(output_image)
                logger.info("Background removed, saved to: %s", output_path)
            
            # Convert to PIL Image for further processing
            from io import BytesIO
            processed_img = Image.open(BytesIO(output_image)).convert('RGB')
            
            # Convert to numpy array for color detection
            img_array = np.array(processed_img)
            
            return img_array
            
        except Exception as e:
            logger.exception("Background removal failed: %s", e)
            return None

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

    def classify(self, image):
        """Classify image (PIL Image or numpy array) and validate category."""
        try:
            # Convert to PIL if needed
            if isinstance(image, np.ndarray):
                img = Image.fromarray(image).convert('RGB')
            elif isinstance(image, (str, Path)):
                img = Image.open(image).convert('RGB')
            else:
                img = image.convert('RGB') if hasattr(image, 'convert') else image
            
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
# COLOR DETECTOR
# --------------------
class ColorDetector:
    @staticmethod
    def get_dominant_colors(image_array, n_colors=3):
        """Get dominant colors from image array (numpy array)."""
        try:
            if image_array is None or image_array.size == 0:
                return []
            
            img_rgb = image_array
            
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
    def __init__(self, input_directory, output_directory, model_path):
        self.input_directory = Path(input_directory)
        self.output_directory = Path(output_directory)
        self.images_dir = self.output_directory / "images"
        self.images_dir.mkdir(parents=True, exist_ok=True)
        
        csv_path = self.output_directory / "catalog-items.csv"
        
        self.classifier = ClothingClassifier(model_path)
        self.bg_remover = BackgroundRemover()
        self.color_detector = ColorDetector()
        self.csv_manager = CatalogCSV(csv_path)
        
        self.stats = {
            'total_images': 0,
            'background_removed': 0,
            'background_removal_failed': 0,
            'invalid_category': 0,
            'images_saved': 0,
            'items_added': 0
        }

    def process_images(self):
        """Process all image files in input directory"""
        # Find all image files
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
        """Process a single image through the pipeline"""
        try:
            logger.info("=" * 60)
            logger.info("Processing: %s", image_path.name)
            
            # Step 1: Remove background
            processed_image_array = None
            temp_image_path = None
            
            if self.bg_remover.available:
                output_filename = image_path.stem + '-nobg.png'
                temp_image_path = self.images_dir / output_filename
                processed_image_array = self.bg_remover.remove_background(image_path, temp_image_path)
                
                if processed_image_array is not None:
                    self.stats['background_removed'] += 1
                    image_for_classification = processed_image_array
                else:
                    self.stats['background_removal_failed'] += 1
                    logger.warning("Background removal failed, using original image")
                    # Fallback to original image
                    img = Image.open(image_path).convert('RGB')
                    processed_image_array = np.array(img)
                    image_for_classification = processed_image_array
                    # Clean up temp file if it exists
                    if temp_image_path and temp_image_path.exists():
                        temp_image_path.unlink()
            else:
                # No background removal available, use original
                logger.info("Using original image (background removal not available)")
                img = Image.open(image_path).convert('RGB')
                processed_image_array = np.array(img)
                image_for_classification = processed_image_array
            
            # Step 2: Classify clothing type
            logger.info("Classifying clothing type...")
            clothing_type, category, confidence = self.classifier.classify(image_for_classification)
            
            if clothing_type == "REJECTED":
                self.stats['invalid_category'] += 1
                logger.warning("REJECTED: %s", image_path.name)
                # Clean up temp file if it exists
                if temp_image_path and temp_image_path.exists():
                    temp_image_path.unlink()
                return
                
            logger.info("Classified as: %s (%.2f%%)", clothing_type, confidence * 100)
            
            # Step 3: Get colors
            logger.info("Detecting colors...")
            colors = self.color_detector.get_dominant_colors(processed_image_array, n_colors=3)
            primary_color = colors[0] if colors else 'unknown'
            secondary_colors = "|".join(colors[1:3]) if len(colors) > 1 else ''
            logger.info("Colors: %s", ', '.join(colors) if colors else 'unknown')
            
            # Step 4: Generate final filename with clothing type and color
            final_filename = self._generate_filename(clothing_type, primary_color)
            final_image_path = self.images_dir / final_filename
            
            # Save image with proper filename (or rename temp file)
            if temp_image_path and temp_image_path.exists():
                # Rename temp file to final filename
                temp_image_path.rename(final_image_path)
            else:
                # Save processed image
                Image.fromarray(processed_image_array).save(final_image_path, 'PNG' if final_filename.endswith('.png') else 'JPEG')
            
            # Step 5: Save to CSV
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
                'season': 'all',
                'description': f'AI-detected {clothing_type} processed on {datetime.now().strftime("%Y-%m-%d")}',
                'image_filename': final_image_path.name,
                'privacy': 'public'
            }
            
            self.csv_manager.add_item(item_data)
            self.stats['images_saved'] += 1
            self.stats['items_added'] += 1
            logger.info("✅ APPROVED and saved as: %s", final_image_path.name)
            
        except Exception as e:
            logger.exception("Error processing image %s: %s", image_path, e)
        finally:
            gc.collect()

    def _generate_filename(self, clothing_type, color):
        """Generate final filename"""
        timestamp = int(time.time())
        clean_type = re.sub(r'[^\w\-]', '', clothing_type.lower().replace(' ', '-'))
        clean_color = re.sub(r'[^\w\-]', '', color.lower())
        return f"{clean_color}-{clean_type}-{timestamp}.png"

    def _print_summary(self):
        logger.info("=" * 60)
        logger.info("PROCESSING SUMMARY")
        logger.info("=" * 60)
        logger.info("Total images processed: %d", self.stats['total_images'])
        logger.info("Background removed: %d", self.stats['background_removed'])
        logger.info("Background removal failed: %d", self.stats['background_removal_failed'])
        logger.info("Rejected - invalid category: %d", self.stats['invalid_category'])
        logger.info("✅ APPROVED items: %d", self.stats['images_saved'])
        logger.info("Items added to catalog CSV: %d", self.stats['items_added'])
        logger.info("=" * 60)
        logger.info("Output directory: %s", self.output_directory)
        logger.info("Images folder: %s", self.images_dir)
        logger.info("CSV catalog: %s", self.csv_manager.csv_path)
        logger.info("=" * 60)

def find_model_path():
    """Find the best_model.pth file in common locations."""
    if DEFAULT_MODEL_PATH.exists():
        return DEFAULT_MODEL_PATH
    elif ALTERNATIVE_MODEL_PATH.exists():
        return ALTERNATIVE_MODEL_PATH
    else:
        logger.error("Model not found. Checked:")
        logger.error("  - %s", DEFAULT_MODEL_PATH)
        logger.error("  - %s", ALTERNATIVE_MODEL_PATH)
        return None

def main():
    parser = argparse.ArgumentParser(
        description='Process clothing images with background removal and AI detection'
    )
    parser.add_argument('input_dir', help='Directory containing images to process')
    parser.add_argument(
        '--output-dir',
        default='catalog-output',
        help='Output directory for processed images and CSV (default: catalog-output)'
    )
    parser.add_argument(
        '--model-path',
        help='Path to best_model.pth (auto-detected if not specified)'
    )
    
    args = parser.parse_args()
    
    # Find model
    model_path = args.model_path
    if not model_path:
        model_path = find_model_path()
        if not model_path:
            sys.exit(1)
    
    model_path = Path(model_path)
    if not model_path.exists():
        logger.error("Model file not found: %s", model_path)
        sys.exit(1)
    
    # Validate input directory
    input_directory = Path(args.input_dir)
    if not input_directory.exists():
        logger.error("Input directory not found: %s", input_directory)
        sys.exit(1)
    
    if not input_directory.is_dir():
        logger.error("Input path is not a directory: %s", input_directory)
        sys.exit(1)
    
    # Setup output directory
    output_directory = Path(args.output_dir)
    
    logger.info("=" * 60)
    logger.info("StyleSnap Image Processor")
    logger.info("=" * 60)
    logger.info("Input directory: %s", input_directory)
    logger.info("Output directory: %s", output_directory)
    logger.info("Model: %s", model_path)
    logger.info("Background removal: %s", "Available" if REMBG_AVAILABLE else "Not available")
    logger.info("=" * 60)
    logger.info("")
    
    processor = ImageProcessor(input_directory, output_directory, model_path)
    processor.process_images()
    
    logger.info("")
    logger.info("✅ Processing complete!")
    logger.info("Next step: Run the upload script:")
    logger.info("  node scripts/catalog/seed-catalog-from-csv.js %s %s", 
                output_directory / "catalog-items.csv",
                output_directory / "images")

if __name__ == '__main__':
    main()

