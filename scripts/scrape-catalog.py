#!/usr/bin/env python3
"""
Clothing Image Scraper & Catalog Generator

Scrapes clothing images from websites, classifies them using a trained ResNet50 model,
detects colors, filters out images with faces, and generates a CSV catalog.

Usage:
    1. Add URLs to scripts/scrape-urls.txt (one per line)
    2. Run: python scripts/scrape-catalog.py
    3. Check results in catalog-data/images/ and catalog-data/scraped-items.csv
"""

import os
import sys
import csv
import time
import hashlib
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse
from datetime import datetime

import requests
from bs4 import BeautifulSoup
import cv2
import numpy as np
from PIL import Image
import pillow_avif

import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms

from sklearn.cluster import KMeans

# ============================================================================
# CONFIGURATION
# ============================================================================

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
MODEL_PATH = SCRIPT_DIR / "best_model.pth"
URLS_FILE = SCRIPT_DIR / "scrape-urls.txt"
OUTPUT_DIR = PROJECT_ROOT / "catalog-data" / "images"
CSV_PATH = PROJECT_ROOT / "catalog-data" / "scraped-items.csv"

# Clothing categories from the model
CATEGORY_NAMES = [
    'Blazer', 'Blouse', 'Body', 'Dress', 'Hat', 'Hoodie', 'Longsleeve',
    'Not sure', 'Other', 'Outwear', 'Pants', 'Polo', 'Shirt', 'Shoes',
    'Shorts', 'Skip', 'Skirt', 'T-Shirt', 'Top', 'Undershirt'
]

# Category mapping (clothing_type -> category)
CLOTHING_CATEGORIES = {
    "Blouse": "top",
    "Body": "top",
    "Polo": "top",
    "Shirt": "top",
    "T-Shirt": "top",
    "Top": "top",
    "Undershirt": "top",
    "Longsleeve": "top",
    "Pants": "bottom",
    "Shorts": "bottom",
    "Skirt": "bottom",
    "Blazer": "outerwear",
    "Hoodie": "outerwear",
    "Outwear": "outerwear",
    "Dress": "outerwear",
    "Shoes": "shoes",
    "Hat": "accessory",
    "Not sure": "uncategorized",
    "Other": "uncategorized",
    "Skip": "uncategorized"
}

# Color name mapping (RGB -> name)
COLOR_NAMES = {
    'black': (0, 0, 0),
    'white': (255, 255, 255),
    'red': (255, 0, 0),
    'blue': (0, 0, 255),
    'green': (0, 255, 0),
    'yellow': (255, 255, 0),
    'orange': (255, 165, 0),
    'purple': (128, 0, 128),
    'pink': (255, 192, 203),
    'brown': (165, 42, 42),
    'gray': (128, 128, 128),
    'beige': (245, 245, 220),
    'navy': (0, 0, 128),
    'maroon': (128, 0, 0),
    'olive': (128, 128, 0),
    'teal': (0, 128, 128),
    'cyan': (0, 255, 255),
    'magenta': (255, 0, 255),
}

# Scraping settings
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
MIN_IMAGE_SIZE = 100  # Minimum width/height in pixels
MAX_IMAGE_SIZE = 2000  # Maximum width/height in pixels
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

# ============================================================================
# MODEL SETUP
# ============================================================================

class ClothingClassifier:
    """Wrapper for the ResNet50 clothing classification model."""
    
    def __init__(self, model_path):
        """Initialize the model."""
        print(f"🧠 Loading model from {model_path}...")
        
        # Define model architecture
        self.model = models.resnet50(pretrained=False)
        num_ftrs = self.model.fc.in_features
        self.model.fc = nn.Linear(num_ftrs, 20)
        
        # Load trained weights
        self.model.load_state_dict(
            torch.load(model_path, map_location=torch.device('cpu'))
        )
        self.model.eval()
        
        # Image preprocessing pipeline
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        print("✅ Model loaded successfully!")
    
    def classify(self, image_path):
        """
        Classify a clothing image.
        
        Args:
            image_path: Path to image file
            
        Returns:
            tuple: (clothing_type, category, confidence)
        """
        try:
            # Load and preprocess image
            img = Image.open(image_path).convert('RGB')
            input_tensor = self.transform(img).unsqueeze(0)
            
            # Run inference
            with torch.no_grad():
                output = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(output, dim=1)
                confidence, predicted_idx = torch.max(probabilities, dim=1)
            
            # Get predicted label
            clothing_type = CATEGORY_NAMES[predicted_idx.item()]
            category = CLOTHING_CATEGORIES.get(clothing_type, 'uncategorized')
            
            return clothing_type, category, confidence.item()
            
        except Exception as e:
            print(f"⚠️  Classification error: {e}")
            return "Other", "uncategorized", 0.0

# ============================================================================
# FACE DETECTION
# ============================================================================

class FaceDetector:
    """Detects faces in images using OpenCV Haar Cascades."""
    
    def __init__(self):
        """Initialize face detector."""
        # Load pre-trained Haar Cascade classifier
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        if self.face_cascade.empty():
            print("⚠️  Warning: Could not load face detection model")
    
    def has_face(self, image_path, min_face_size=50):
        """
        Check if image contains a face.
        
        Args:
            image_path: Path to image file
            min_face_size: Minimum face size in pixels
            
        Returns:
            bool: True if face detected, False otherwise
        """
        try:
            # Read image
            img = cv2.imread(str(image_path))
            if img is None:
                return False
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(min_face_size, min_face_size)
            )
            
            return len(faces) > 0
            
        except Exception as e:
            print(f"⚠️  Face detection error: {e}")
            return False

# ============================================================================
# COLOR DETECTION
# ============================================================================

class ColorDetector:
    """Detects dominant colors in images."""
    
    @staticmethod
    def get_dominant_colors(image_path, n_colors=3):
        """
        Extract dominant colors from image.
        
        Args:
            image_path: Path to image file
            n_colors: Number of dominant colors to extract
            
        Returns:
            list: List of color names
        """
        try:
            # Load image
            img = cv2.imread(str(image_path))
            if img is None:
                return []
            
            # Convert BGR to RGB
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Resize for faster processing
            img_small = cv2.resize(img_rgb, (150, 150))
            
            # Reshape to list of pixels
            pixels = img_small.reshape(-1, 3)
            
            # Use KMeans to find dominant colors
            kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
            kmeans.fit(pixels)
            
            # Get cluster centers (dominant colors)
            colors = kmeans.cluster_centers_.astype(int)
            
            # Convert RGB to color names
            color_names = []
            for color in colors:
                color_name = ColorDetector._rgb_to_name(tuple(color))
                if color_name and color_name not in color_names:
                    color_names.append(color_name)
            
            return color_names
            
        except Exception as e:
            print(f"⚠️  Color detection error: {e}")
            return []
    
    @staticmethod
    def _rgb_to_name(rgb):
        """Convert RGB tuple to closest color name."""
        min_distance = float('inf')
        closest_name = None
        
        for name, named_rgb in COLOR_NAMES.items():
            # Calculate Euclidean distance
            distance = sum((a - b) ** 2 for a, b in zip(rgb, named_rgb)) ** 0.5
            if distance < min_distance:
                min_distance = distance
                closest_name = name
        
        return closest_name

# ============================================================================
# WEB SCRAPER
# ============================================================================

class ImageScraper:
    """Scrapes images from websites."""
    
    def __init__(self):
        """Initialize scraper."""
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': USER_AGENT})
    
    def scrape_images(self, url, max_images=50):
        """
        Scrape image URLs from a webpage.
        
        Args:
            url: Website URL to scrape
            max_images: Maximum number of images to collect
            
        Returns:
            list: List of image URLs
        """
        print(f"\n🌐 Scraping {url}...")
        
        try:
            # Fetch webpage
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.text, 'lxml')
            
            # Find all image tags
            img_tags = soup.find_all('img')
            
            image_urls = []
            for img in img_tags[:max_images * 2]:  # Get extra to account for filtering
                # Get image URL from various attributes
                img_url = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                
                if not img_url:
                    continue
                
                # Convert relative URLs to absolute
                img_url = urljoin(url, img_url)
                
                # Check if it's a valid image URL
                if self._is_valid_image_url(img_url):
                    image_urls.append(img_url)
                
                if len(image_urls) >= max_images:
                    break
            
            print(f"✅ Found {len(image_urls)} image URLs")
            return image_urls
            
        except Exception as e:
            print(f"❌ Error scraping {url}: {e}")
            return []
    
    def download_image(self, image_url, output_path):
        """
        Download an image from URL.
        
        Args:
            image_url: URL of image
            output_path: Path to save image
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            response = self.session.get(image_url, timeout=10, stream=True)
            response.raise_for_status()
            
            # Save image
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Verify it's a valid image
            img = Image.open(output_path)
            width, height = img.size
            
            # Check size constraints
            if width < MIN_IMAGE_SIZE or height < MIN_IMAGE_SIZE:
                os.remove(output_path)
                return False
            
            if width > MAX_IMAGE_SIZE or height > MAX_IMAGE_SIZE:
                # Resize if too large
                img.thumbnail((MAX_IMAGE_SIZE, MAX_IMAGE_SIZE), Image.Resampling.LANCZOS)
                img.save(output_path)
            
            return True
            
        except Exception as e:
            # Clean up failed download
            if output_path.exists():
                os.remove(output_path)
            return False
    
    @staticmethod
    def _is_valid_image_url(url):
        """Check if URL points to a valid image."""
        try:
            parsed = urlparse(url)
            path = parsed.path.lower()
            
            # Check file extension
            if any(path.endswith(ext) for ext in IMAGE_EXTENSIONS):
                return True
            
            # Check for image in query parameters
            if 'image' in url.lower() or 'img' in url.lower():
                return True
            
            return False
            
        except:
            return False

# ============================================================================
# CSV MANAGER
# ============================================================================

class CatalogCSV:
    """Manages the scraped items CSV file."""
    
    CSV_HEADERS = [
        'name', 'clothing_type', 'category', 'brand', 'size',
        'primary_color', 'secondary_colors', 'style_tags', 'weather_tags',
        'season', 'description', 'image_filename', 'privacy'
    ]
    
    def __init__(self, csv_path):
        """Initialize CSV manager."""
        self.csv_path = Path(csv_path)
        self._ensure_csv_exists()
    
    def _ensure_csv_exists(self):
        """Create CSV file with headers if it doesn't exist."""
        if not self.csv_path.exists():
            with open(self.csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=self.CSV_HEADERS)
                writer.writeheader()
            print(f"📄 Created new CSV: {self.csv_path}")
    
    def add_item(self, item_data):
        """
        Add an item to the CSV.
        
        Args:
            item_data: Dictionary with item information
        """
        # Ensure all required fields are present
        row = {header: item_data.get(header, '') for header in self.CSV_HEADERS}
        
        # Append to CSV
        with open(self.csv_path, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=self.CSV_HEADERS)
            writer.writerow(row)

# ============================================================================
# MAIN PIPELINE
# ============================================================================

class ClothingScraperPipeline:
    """Main pipeline coordinating all components."""
    
    def __init__(self):
        """Initialize the pipeline."""
        # Create output directory
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        
        # Initialize components
        self.classifier = ClothingClassifier(MODEL_PATH)
        self.face_detector = FaceDetector()
        self.color_detector = ColorDetector()
        self.scraper = ImageScraper()
        self.csv_manager = CatalogCSV(CSV_PATH)
        
        # Statistics
        self.stats = {
            'total_urls': 0,
            'images_scraped': 0,
            'images_with_faces': 0,
            'images_saved': 0,
            'items_added': 0
        }
    
    def process_urls(self, urls):
        """
        Process a list of URLs.
        
        Args:
            urls: List of website URLs to scrape
        """
        self.stats['total_urls'] = len(urls)
        
        print(f"\n{'='*60}")
        print(f"🚀 Starting scraper pipeline")
        print(f"{'='*60}")
        print(f"📋 Processing {len(urls)} URL(s)")
        print(f"📁 Output directory: {OUTPUT_DIR}")
        print(f"📄 CSV output: {CSV_PATH}")
        print(f"{'='*60}\n")
        
        for url in urls:
            self._process_url(url)
        
        self._print_summary()
    
    def _process_url(self, url):
        """Process a single URL."""
        # Scrape image URLs
        image_urls = self.scraper.scrape_images(url)
        
        for img_url in image_urls:
            self._process_image(img_url)
            time.sleep(0.5)  # Be polite to servers
    
    def _process_image(self, image_url):
        """Process a single image."""
        # Generate unique filename
        url_hash = hashlib.md5(image_url.encode()).hexdigest()[:8]
        timestamp = int(time.time())
        temp_filename = f"temp_{timestamp}_{url_hash}.jpg"
        temp_path = OUTPUT_DIR / temp_filename
        
        try:
            # Download image
            if not self.scraper.download_image(image_url, temp_path):
                return
            
            self.stats['images_scraped'] += 1
            print(f"📥 Downloaded: {image_url[:80]}...")
            
            # Check for faces
            if self.face_detector.has_face(temp_path):
                print(f"   👤 Face detected - skipping")
                os.remove(temp_path)
                self.stats['images_with_faces'] += 1
                return
            
            # Classify clothing
            clothing_type, category, confidence = self.classifier.classify(temp_path)
            print(f"   🏷️  Classified as: {clothing_type} ({confidence:.2%} confidence)")
            
            # Skip if classification is uncertain
            if category == 'uncategorized' or confidence < 0.3:
                print(f"   ⚠️  Low confidence - skipping")
                os.remove(temp_path)
                return
            
            # Detect colors
            colors = self.color_detector.get_dominant_colors(temp_path, n_colors=3)
            primary_color = colors[0] if colors else "unknown"
            secondary_colors = "|".join(colors[1:3]) if len(colors) > 1 else ""
            
            print(f"   🎨 Colors: {', '.join(colors)}")
            
            # Generate final filename
            final_filename = self._generate_filename(clothing_type, primary_color, timestamp)
            final_path = OUTPUT_DIR / final_filename
            
            # Rename to final filename
            os.rename(temp_path, final_path)
            
            # Generate item name
            item_name = f"{primary_color.capitalize()} {clothing_type}"
            
            # Add to CSV
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
            
            print(f"   ✅ Saved as: {final_filename}")
            
        except Exception as e:
            print(f"   ❌ Error processing image: {e}")
            if temp_path.exists():
                os.remove(temp_path)
    
    def _generate_filename(self, clothing_type, color, timestamp):
        """Generate a unique filename for the image."""
        # Clean up clothing type and color
        clean_type = re.sub(r'[^\w\-]', '', clothing_type.lower().replace(' ', '-'))
        clean_color = re.sub(r'[^\w\-]', '', color.lower())
        
        return f"{clean_color}-{clean_type}-{timestamp}.jpg"
    
    def _print_summary(self):
        """Print processing summary."""
        print(f"\n{'='*60}")
        print(f"📊 SCRAPING SUMMARY")
        print(f"{'='*60}")
        print(f"✅ URLs processed: {self.stats['total_urls']}")
        print(f"📥 Images downloaded: {self.stats['images_scraped']}")
        print(f"👤 Images with faces (skipped): {self.stats['images_with_faces']}")
        print(f"💾 Images saved: {self.stats['images_saved']}")
        print(f"📝 Items added to catalog: {self.stats['items_added']}")
        print(f"{'='*60}")
        print(f"\n✨ Results:")
        print(f"   Images: {OUTPUT_DIR}")
        print(f"   CSV: {CSV_PATH}")
        print(f"\n💡 Next steps:")
        print(f"   1. Review images in {OUTPUT_DIR}")
        print(f"   2. Check CSV at {CSV_PATH}")
        print(f"   3. Run: node scripts/seed-catalog-from-csv.js catalog-data/scraped-items.csv catalog-data/images/")
        print(f"{'='*60}\n")

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

def load_urls(urls_file):
    """Load URLs from text file."""
    urls = []
    
    if not urls_file.exists():
        print(f"❌ Error: {urls_file} not found!")
        print(f"   Please create the file and add URLs (one per line)")
        return urls
    
    with open(urls_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            # Skip empty lines and comments
            if line and not line.startswith('#'):
                urls.append(line)
    
    return urls

def main():
    """Main entry point."""
    print("\n" + "="*60)
    print("🛍️  CLOTHING IMAGE SCRAPER & CATALOG GENERATOR")
    print("="*60 + "\n")
    
    # Check if model exists
    if not MODEL_PATH.exists():
        print(f"❌ Error: Model not found at {MODEL_PATH}")
        print(f"   Please copy FASHION_RNN/best_model.pth to scripts/")
        sys.exit(1)
    
    # Load URLs
    urls = load_urls(URLS_FILE)
    
    if not urls:
        print(f"⚠️  No URLs found in {URLS_FILE}")
        print(f"\n📝 To use this scraper:")
        print(f"   1. Edit {URLS_FILE}")
        print(f"   2. Add website URLs (one per line)")
        print(f"   3. Run this script again")
        sys.exit(0)
    
    # Run pipeline
    pipeline = ClothingScraperPipeline()
    pipeline.process_urls(urls)

if __name__ == "__main__":
    main()
