#!/usr/bin/env python3
"""
Clothing Image Spider & Catalog Generator

Web spider that crawls e-commerce sites, collects clothing images, classifies them 
using a trained ResNet50 model, detects colors, filters out faces, and generates a CSV catalog.

Features:
- Spider mode: Automatically crawls multiple pages on the same domain
- CDN support: Downloads images from any domain (CDN/external hosts allowed)
- Face detection: Filters out model photos automatically
- AI classification: 20 clothing types with confidence scoring
- Color detection: Automatic primary and secondary color detection
- Supported formats: JPG, JPEG, PNG, WEBP (no GIF or AVIF)

Usage:
    1. Add starting URLs to scripts/scrape-urls.txt (one per line)
    2. Run: python scripts/scrape-catalog.py
    3. Spider crawls pages on same domain, collects images from any domain
    4. Check results in catalog-data/images/ and catalog-data/scraped-items.csv
"""

import os
import sys
import csv
import time
import hashlib
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse, parse_qs, urlunparse
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from queue import Queue
import threading

import requests
from bs4 import BeautifulSoup
import cv2
import numpy as np
from PIL import Image

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
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}  # No GIF or AVIF
MIN_IMAGE_SIZE = 100  # Minimum width/height in pixels
MAX_IMAGE_SIZE = 2000  # Maximum width/height in pixels
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

# Spider/Crawler settings
MAX_PAGES_PER_DOMAIN = 20  # Maximum pages to crawl per domain
MAX_DEPTH = 3  # Maximum crawl depth from start URL
CRAWL_DELAY = 1.0  # Delay between page requests (seconds)
MAX_WORKERS = 5  # Number of parallel workers for image processing
IGNORE_ROBOTS_TXT = True  # Ignore robots.txt restrictions

# Downloaded images tracking
DOWNLOADED_IMAGES_FILE = PROJECT_ROOT / "catalog-data" / ".downloaded_hashes.txt"

# URL cleaning - remove tracking parameters
TRACKING_PARAMS = {
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'fbclid', 'gclid', 'msclkid', 'ref', 'referrer', 'source', 'campaign',
    '_ga', '_gl', 'mc_cid', 'mc_eid'
}

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
# WEB SPIDER/CRAWLER
# ============================================================================

class WebSpider:
    """Web spider that crawls pages on the same domain and collects images."""
    
    def __init__(self):
        """Initialize spider."""
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': USER_AGENT})
        self.visited_urls = set()  # Track visited pages
        self.image_urls = set()    # Track collected image URLs
        self.downloaded_hashes = self._load_downloaded_hashes()  # Track downloaded images
        self.image_queue = Queue()  # Queue for parallel processing
        self.lock = threading.Lock()  # Thread safety for stats
    
    def _load_downloaded_hashes(self):
        """Load previously downloaded image hashes."""
        hashes = set()
        if DOWNLOADED_IMAGES_FILE.exists():
            with open(DOWNLOADED_IMAGES_FILE, 'r') as f:
                hashes = set(line.strip() for line in f if line.strip())
        return hashes
    
    def _save_downloaded_hash(self, image_hash):
        """Save a downloaded image hash to file."""
        DOWNLOADED_IMAGES_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(DOWNLOADED_IMAGES_FILE, 'a') as f:
            f.write(f"{image_hash}\n")
    
    def _get_image_hash(self, url):
        """Generate hash from cleaned image URL."""
        cleaned_url = self._clean_url(url)
        return hashlib.md5(cleaned_url.encode()).hexdigest()
    
    @staticmethod
    def _clean_url(url):
        """Remove tracking parameters and clean URL."""
        try:
            parsed = urlparse(url)
            
            # Parse query parameters
            query_params = parse_qs(parsed.query)
            
            # Remove tracking parameters
            cleaned_params = {
                k: v for k, v in query_params.items() 
                if k.lower() not in TRACKING_PARAMS
            }
            
            # Rebuild query string
            if cleaned_params:
                from urllib.parse import urlencode
                query_string = urlencode(cleaned_params, doseq=True)
            else:
                query_string = ''
            
            # Rebuild URL without tracking params
            cleaned = urlunparse((
                parsed.scheme,
                parsed.netloc,
                parsed.path,
                parsed.params,
                query_string,
                ''  # Remove fragment
            ))
            
            return cleaned
        except:
            return url
    
    def get_domain(self, url):
        """Extract domain from URL."""
        parsed = urlparse(url)
        return f"{parsed.scheme}://{parsed.netloc}"
    
    def is_same_domain(self, url1, url2):
        """Check if two URLs are on the same domain."""
        return urlparse(url1).netloc == urlparse(url2).netloc
    
    def is_valid_page_url(self, url):
        """Check if URL is a valid page to crawl."""
        try:
            parsed = urlparse(url)
            path = parsed.path.lower()
            
            # Skip common non-page URLs
            skip_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.pdf', '.zip', 
                             '.css', '.js', '.xml', '.json', '.webp', '.avif'}
            if any(path.endswith(ext) for ext in skip_extensions):
                return False
            
            # Skip common non-crawlable paths
            skip_paths = {'#', 'javascript:', 'mailto:', 'tel:'}
            if any(url.startswith(skip) for skip in skip_paths):
                return False
            
            return True
        except:
            return False
    
    def crawl(self, start_url, max_images=200):
        """
        Crawl pages starting from start_url and collect images.
        
        Args:
            start_url: Starting URL to begin crawling
            max_images: Maximum number of images to collect
            
        Returns:
            list: List of unique image URLs
        """
        print(f"\n🕷️  Starting spider crawl from: {start_url}")
        
        base_domain = self.get_domain(start_url)
        to_visit = [(start_url, 0)]  # Queue of (url, depth) tuples
        pages_crawled = 0
        
        while to_visit and pages_crawled < MAX_PAGES_PER_DOMAIN and len(self.image_urls) < max_images:
            current_url, depth = to_visit.pop(0)
            
            # Skip if already visited or too deep
            if current_url in self.visited_urls or depth > MAX_DEPTH:
                continue
            
            self.visited_urls.add(current_url)
            pages_crawled += 1
            
            print(f"\n📄 [{pages_crawled}/{MAX_PAGES_PER_DOMAIN}] Crawling: {current_url} (depth: {depth})")
            
            try:
                # Fetch page
                response = self.session.get(current_url, timeout=15)
                response.raise_for_status()
                
                # Parse HTML
                soup = BeautifulSoup(response.text, 'lxml')
                
                # Collect images from this page
                images_found = self._extract_images(soup, current_url)
                print(f"   🖼️  Found {images_found} images on this page")
                
                # Find links to other pages on same domain
                if depth < MAX_DEPTH:
                    links_found = self._extract_links(soup, current_url, base_domain, depth)
                    to_visit.extend(links_found)
                    print(f"   🔗 Found {len(links_found)} new links to crawl")
                
                # Rate limiting
                time.sleep(CRAWL_DELAY)
                
            except Exception as e:
                print(f"   ❌ Error crawling page: {e}")
                continue
        
        print(f"\n✅ Crawling complete!")
        print(f"   📄 Pages crawled: {pages_crawled}")
        print(f"   🖼️  Unique images found: {len(self.image_urls)}")
        
        return list(self.image_urls)
    
    def _extract_images(self, soup, page_url):
        """Extract image URLs from a page."""
        images_found = 0
        
        # Find all image tags
        img_tags = soup.find_all('img')
        
        for img in img_tags:
            # Get image URL from various attributes
            img_url = (img.get('src') or 
                      img.get('data-src') or 
                      img.get('data-lazy-src'))
            
            if not img_url or img_url.startswith('data:'):
                continue
            
            # Convert relative URLs to absolute
            img_url = urljoin(page_url, img_url)
            
            # Clean URL (remove tracking params)
            cleaned_url = self._clean_url(img_url)
            
            # Get hash for duplicate checking
            img_hash = self._get_image_hash(cleaned_url)
            
            # Skip if already downloaded in previous runs
            if img_hash in self.downloaded_hashes:
                continue
            
            # Check if it's a valid image URL (images can be from ANY domain/CDN)
            if self._is_valid_image_url(cleaned_url) and cleaned_url not in self.image_urls:
                self.image_urls.add(cleaned_url)
                images_found += 1
        
        return images_found
    
    def _extract_links(self, soup, page_url, base_domain, current_depth):
        """Extract links to other pages on the same domain."""
        new_links = []
        
        # Find all anchor tags
        for link in soup.find_all('a', href=True):
            href = link.get('href')
            
            if not href:
                continue
            
            # Convert relative URLs to absolute
            full_url = urljoin(page_url, href)
            
            # Remove fragment
            full_url = full_url.split('#')[0]
            
            # Check if valid and on same domain
            if (self.is_valid_page_url(full_url) and 
                self.is_same_domain(full_url, base_domain) and
                full_url not in self.visited_urls):
                new_links.append((full_url, current_depth + 1))
        
        return new_links
    
    def scrape_images(self, url, max_images=200):
        """
        Main entry point - crawls pages and collects images.
        
        Args:
            url: Starting URL to begin crawling
            max_images: Maximum number of images to collect
            
        Returns:
            list: List of unique image URLs
        """
        # Reset state for new crawl
        self.visited_urls.clear()
        self.image_urls.clear()
        
        # Start crawling
        return self.crawl(url, max_images)
    
    def download_image(self, image_url, output_path, max_retries=2):
        """
        Download an image from URL.
        
        Args:
            image_url: URL of image
            output_path: Path to save image
            max_retries: Number of retry attempts
            
        Returns:
            bool: True if successful, False otherwise
        """
        for attempt in range(max_retries + 1):
            try:
                response = self.session.get(image_url, timeout=15, stream=True)
                response.raise_for_status()
                
                # Check content type
                content_type = response.headers.get('content-type', '').lower()
                if 'image' not in content_type and attempt == 0:
                    # Skip if not an image on first attempt
                    return False
                
                # Save image
                with open(output_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                
                # Verify it's a valid image
                img = Image.open(output_path)
                img.verify()  # Verify image integrity
                
                # Reopen after verify
                img = Image.open(output_path)
                width, height = img.size
                
                # Check size constraints
                if width < MIN_IMAGE_SIZE or height < MIN_IMAGE_SIZE:
                    os.remove(output_path)
                    return False
                
                if width > MAX_IMAGE_SIZE or height > MAX_IMAGE_SIZE:
                    # Resize if too large
                    img.thumbnail((MAX_IMAGE_SIZE, MAX_IMAGE_SIZE), Image.Resampling.LANCZOS)
                    # Convert to RGB if needed
                    if img.mode in ('RGBA', 'P', 'LA'):
                        img = img.convert('RGB')
                    img.save(output_path, 'JPEG', quality=85, optimize=True)
                elif img.mode not in ('RGB', 'L'):
                    # Convert to RGB for consistency
                    img = img.convert('RGB')
                    img.save(output_path, 'JPEG', quality=90)
                
                return True
                
            except Exception as e:
                if attempt < max_retries:
                    time.sleep(1)  # Wait before retry
                    continue
                # Clean up failed download
                if output_path.exists():
                    try:
                        os.remove(output_path)
                    except OSError:
                        pass
                return False
        
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
        self.spider = WebSpider()
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
        """Process a single URL - spider crawls pages and collects images."""
        # Spider crawls pages on same domain and collects images
        image_urls = self.spider.scrape_images(url)
        
        if not image_urls:
            print(f"⚠️  No valid images found on this page")
            return
        
        for idx, img_url in enumerate(image_urls, 1):
            print(f"\n[{idx}/{len(image_urls)}]")
            self._process_image(img_url)
            
            # Rate limiting - be polite to servers
            if idx < len(image_urls):
                time.sleep(0.3)
    
    def _process_image(self, image_url):
        """Process a single image."""
        # Generate unique filename
        url_hash = hashlib.md5(image_url.encode()).hexdigest()[:8]
        timestamp = int(time.time())
        temp_filename = f"temp_{timestamp}_{url_hash}.jpg"
        temp_path = OUTPUT_DIR / temp_filename
        
        try:
            # Download image
            if not self.spider.download_image(image_url, temp_path):
                return
            
            self.stats['images_scraped'] += 1
            print(f"📥 Downloaded: {image_url[:80]}...")
            
            # Check for faces (fast check first)
            if self.face_detector.has_face(temp_path):
                print(f"   👤 Face detected - skipping")
                try:
                    os.remove(temp_path)
                except OSError:
                    pass
                self.stats['images_with_faces'] += 1
                return
            
            # Classify clothing
            clothing_type, category, confidence = self.classifier.classify(temp_path)
            print(f"   🏷️  Classified as: {clothing_type} ({confidence:.2%} confidence)")
            
            # Skip if classification is uncertain
            if category == 'uncategorized' or confidence < 0.3:
                print(f"   ⚠️  Low confidence - skipping")
                try:
                    os.remove(temp_path)
                except OSError:
                    pass
                return
            
            # Detect colors
            colors = self.color_detector.get_dominant_colors(temp_path, n_colors=3)
            primary_color = colors[0] if colors else "unknown"
            secondary_colors = "|".join(colors[1:3]) if len(colors) > 1 else ""
            
            print(f"   🎨 Colors: {', '.join(colors) if colors else 'unknown'}")
            
            # Generate final filename
            final_filename = self._generate_filename(clothing_type, primary_color, timestamp)
            final_path = OUTPUT_DIR / final_filename
            
            # Rename to final filename
            try:
                os.rename(temp_path, final_path)
            except OSError:
                # If rename fails, copy and delete
                import shutil
                shutil.copy2(temp_path, final_path)
                os.remove(temp_path)
            
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
                try:
                    os.remove(temp_path)
                except OSError:
                    pass
    
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
    print("�️  CLOTHING IMAGE SPIDER & CATALOG GENERATOR")
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
