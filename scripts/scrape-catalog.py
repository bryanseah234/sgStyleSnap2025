#!/usr/bin/env python3
"""
Patched Clothing Image Spider & Catalog Generator

This patched script includes the following improvements made by the assistant:
- Safer dependency installation: auto-installs only light packages and prints clear instructions for heavy ones (torch, selenium, mediapipe).
- Robust model loading with device fallback and clearer errors.
- Fallback body-detection using OpenCV Haar cascades if MediaPipe not available.
- Perceptual color matching (RGB -> LAB) for better color naming.
- Content-Length guard to skip very large images early.
- Safer cross-filesystem moves using shutil.move / os.replace fallback.
- Ensures CSV parent directories exist.
- Logging used instead of print for improved observability.
- Selenium usage is optional; requests-based fetching used as fallback when Selenium unavailable.
- Legal/ethical warning about robots.txt and copyright.

USAGE: same as original; create scripts/scrape-urls.txt, place model at scripts/best_model.pth, then run.

Note: This script still requires heavy packages: torch, torchvision, mediapipe (optional but recommended for body detection), selenium+webdriver-manager (optional for JS-heavy pages). The script will explain missing heavy packages and exit where required.
"""

import os
import sys
import csv
import time
import hashlib
import re
import gc
import subprocess
import logging
import shutil
from pathlib import Path
from urllib.parse import urljoin, urlparse, parse_qs, urlunparse
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from queue import Queue
import threading

# --------------------
# Logging
# --------------------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# --------------------
# AUTO-INSTALL (SAFE)
# --------------------

def install_dependencies():
    """Install only light dependencies automatically. Warn for heavy/complex ones.

    This function avoids attempting to install large or platform-specific
    packages (torch, selenium, mediapipe). It will install pure-Python
    packages that are usually safe to pip-install.
    """
    required_packages = {
        'requests': 'requests',
        'beautifulsoup4': 'bs4',
        'Pillow': 'PIL',
        'opencv-python': 'cv2',
        'scikit-learn': 'sklearn',
        'lxml': 'lxml',
    }

    missing = []
    for pkg, mod in required_packages.items():
        try:
            __import__(mod)
        except ImportError:
            missing.append(pkg)

    if missing:
        logger.info("Installing missing light packages: %s", ", ".join(missing))
        for pkg in missing:
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])
            except subprocess.CalledProcessError:
                logger.error("Failed to install %s. Please run: pip install %s", pkg, pkg)
                sys.exit(1)

    heavy = []
    for pkg in ('torch', 'torchvision', 'selenium', 'webdriver-manager', 'mediapipe'):
        try:
            __import__(pkg.replace('-', '_'))
        except Exception:
            heavy.append(pkg)
    if heavy:
        logger.warning("The following packages are large or platform-specific and are NOT auto-installed: %s", ", ".join(heavy))
        logger.info("Please install them yourself. Example (CPU PyTorch):")
        logger.info("  pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu")
        logger.info("And for Selenium + webdriver-manager:")
        logger.info("  pip install selenium webdriver-manager")
        logger.info("And for MediaPipe (optional, for better body detection):")
        logger.info("  pip install mediapipe")

# Run lightweight auto-installs
install_dependencies()

# --------------------
# Safe/conditional imports
# --------------------
import requests
from bs4 import BeautifulSoup

# OpenCV and PIL
import cv2
import numpy as np
from PIL import Image

# Selenium optional
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
    from webdriver_manager.chrome import ChromeDriverManager
    SELENIUM_AVAILABLE = True
    logger.info("Selenium is available")
except Exception:
    SELENIUM_AVAILABLE = False
    logger.warning("Selenium not available: Selenium-based page rendering will be disabled")

# Torch is mandatory for classification. Exit early with clear instructions if missing.
try:
    import torch
    import torch.nn as nn
    import torchvision.models as models
    from torchvision import transforms
except Exception:
    logger.error("PyTorch / torchvision not found. This script requires torch and torchvision to run the classifier.")
    logger.info("Install example (CPU): pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu")
    sys.exit(1)

# scikit-learn
from sklearn.cluster import KMeans

# Mediapipe optional (preferred for body detection)
try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
    logger.info("MediaPipe available for body detection")
except Exception:
    mp = None
    MEDIAPIPE_AVAILABLE = False
    logger.warning("MediaPipe not available: falling back to OpenCV-based face/body heuristics")

# --------------------
# CONFIGURATION
# --------------------
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
MODEL_PATH = SCRIPT_DIR / "best_model.pth"
URLS_FILE = SCRIPT_DIR / "scrape-urls.txt"
OUTPUT_DIR = PROJECT_ROOT / "catalog-data" / "images"
CSV_PATH = PROJECT_ROOT / "catalog-data" / "scraped-items.csv"

CATEGORY_NAMES = [
    'Blazer', 'Blouse', 'Body', 'Dress', 'Hat', 'Hoodie', 'Longsleeve',
    'Not sure', 'Other', 'Outwear', 'Pants', 'Polo', 'Shirt', 'Shoes',
    'Shorts', 'Skip', 'Skirt', 'T-Shirt', 'Top', 'Undershirt'
]

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

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
MIN_IMAGE_SIZE = 100
MAX_IMAGE_SIZE = 2000
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

MIN_CLASSIFICATION_CONFIDENCE = 0.3

MAX_PAGES_PER_DOMAIN = 10
MAX_DEPTH = 9
CRAWL_DELAY = 1.0
MAX_WORKERS = 4
IGNORE_ROBOTS_TXT = True  # WARNING: See legal note below

DOWNLOADED_IMAGES_FILE = PROJECT_ROOT / "catalog-data" / ".downloaded_hashes.txt"

TRACKING_PARAMS = {
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'fbclid', 'gclid', 'msclkid', 'ref', 'referrer', 'source', 'campaign',
    '_ga', '_gl', 'mc_cid', 'mc_eid'
}

# --------------------
# LEGAL WARNING
# --------------------
logger.warning("IGNORE_ROBOTS_TXT=%s is set. Scraping may violate site terms or copyright. Consider setting IGNORE_ROBOTS_TXT=False and respecting robots.txt and site policies.", IGNORE_ROBOTS_TXT)

# --------------------
# CLASSIFIER
# --------------------
class ClothingClassifier:
    def __init__(self, model_path):
        logger.info("Loading model from %s...", model_path)
        self.model = models.resnet50(pretrained=False)
        num_ftrs = self.model.fc.in_features
        self.model.fc = nn.Linear(num_ftrs, len(CATEGORY_NAMES))

        # Load weights robustly (map to cpu first)
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        try:
            state = torch.load(model_path, map_location='cpu')
            # Support if saved as {'state_dict': ...}
            if isinstance(state, dict) and 'state_dict' in state:
                state = state['state_dict']
            self.model.load_state_dict(state)
            self.model.to(device)
            self.model.eval()
            self.device = device
            logger.info("Model loaded (device: %s)", device)
        except Exception as e:
            logger.exception("Failed to load model: %s", e)
            logger.error("Ensure the model file matches architecture and is not a GPU-only pickle. Example: use torch.save(model.state_dict()) when saving.)")
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
        try:
            img = Image.open(image_path).convert('RGB')
            input_tensor = self.transform(img).unsqueeze(0).to(self.device)
            with torch.no_grad():
                output = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(output, dim=1)
                confidence, predicted_idx = torch.max(probabilities, dim=1)
            clothing_type = CATEGORY_NAMES[predicted_idx.item()]
            category = CLOTHING_CATEGORIES.get(clothing_type, 'uncategorized')
            return clothing_type, category, confidence.item()
        except Exception as e:
            logger.exception("Classification error: %s", e)
            return "Other", "uncategorized", 0.0

# --------------------
# BODY DETECTOR
# --------------------
class BodyDetector:
    def __init__(self):
        self.use_mediapipe = MEDIAPIPE_AVAILABLE
        if self.use_mediapipe:
            try:
                self.mp_pose = mp.solutions.pose
                self.pose = self.mp_pose.Pose(static_image_mode=True, model_complexity=1, min_detection_confidence=0.5)
                logger.info("Using MediaPipe for body detection")
            except Exception:
                self.use_mediapipe = False
                logger.exception("Failed to initialize MediaPipe, falling back")

        # Fallback: use OpenCV Haar cascade for face detection as a heuristic
        self.face_cascade = None
        try:
            haar_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            if os.path.exists(haar_path):
                self.face_cascade = cv2.CascadeClassifier(haar_path)
                logger.info("OpenCV Haar cascade available for fallback face detection")
        except Exception:
            logger.warning("Haar cascade not available; fallback body detection disabled")

    def has_human_body(self, image_path):
        try:
            img = cv2.imread(str(image_path))
            if img is None or img.size == 0:
                return False
            # Quick heuristic: detect faces first (fast)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            if self.face_cascade is not None:
                faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
                if len(faces) > 0:
                    return True

            if self.use_mediapipe:
                img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                results = self.pose.process(img_rgb)
                if results.pose_landmarks:
                    visible_landmarks = sum(1 for lm in results.pose_landmarks.landmark if lm.visibility > 0.5)
                    if visible_landmarks >= 10:
                        return True

            # If neither method finds a human, assume product-only
            return False
        except Exception as e:
            logger.exception("Body detection error: %s", e)
            # conservative approach: if body detection fails, treat as containing body and skip
            return True

    def __del__(self):
        try:
            if self.use_mediapipe:
                self.pose.close()
        except Exception:
            pass

# --------------------
# COLOR DETECTION
# --------------------
class ColorDetector:
    @staticmethod
    def get_dominant_colors(image_path, n_colors=3):
        try:
            img = cv2.imread(str(image_path))
            if img is None:
                return []
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img_small = cv2.resize(img_rgb, (150, 150))
            pixels = img_small.reshape(-1, 3)
            kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
            kmeans.fit(pixels)
            colors = kmeans.cluster_centers_.astype(int)
            color_names = []
            for color in colors:
                color_name = ColorDetector._rgb_to_name(tuple(color))
                if color_name and color_name not in color_names:
                    color_names.append(color_name)
            return color_names
        except Exception as e:
            logger.exception("Color detection error: %s", e)
            return []

    @staticmethod
    def _rgb_to_name(rgb):
        try:
            # Convert RGB (r,g,b) to LAB using OpenCV (cv2 uses BGR)
            bgr = np.uint8([[[rgb[2], rgb[1], rgb[0]]]])
            lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)[0][0].astype(int)
            min_dist = float('inf')
            best_name = None
            for name, named_rgb in COLOR_NAMES.items():
                nbgr = np.uint8([[[named_rgb[2], named_rgb[1], named_rgb[0]]]])
                nlab = cv2.cvtColor(nbgr, cv2.COLOR_BGR2LAB)[0][0].astype(int)
                dist = np.linalg.norm(lab - nlab)
                if dist < min_dist:
                    min_dist = dist
                    best_name = name
            return best_name
        except Exception:
            # Fallback to simple RGB Euclidean
            min_distance = float('inf')
            closest_name = None
            for name, named_rgb in COLOR_NAMES.items():
                distance = sum((a - b) ** 2 for a, b in zip(rgb, named_rgb)) ** 0.5
                if distance < min_distance:
                    min_distance = distance
                    closest_name = name
            return closest_name

# --------------------
# WEB SPIDER / CRAWLER
# --------------------
class WebSpider:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        })
        self.visited_urls = set()
        self.image_urls = set()
        self.downloaded_hashes = self._load_downloaded_hashes()
        self.image_queue = Queue()
        self.lock = threading.Lock()
        self.driver = None

    def _init_selenium(self):
        if self.driver is not None or not SELENIUM_AVAILABLE:
            return
        try:
            logger.info("Initializing Selenium headless browser...")
            chrome_options = ChromeOptions()
            chrome_options.add_argument('--headless=new')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')
            chrome_options.add_argument(f'user-agent={USER_AGENT}')
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            logger.info("Selenium initialized successfully")
        except Exception as e:
            logger.exception("Could not initialize Selenium: %s", e)
            self.driver = None

    def _close_selenium(self):
        if self.driver:
            try:
                self.driver.quit()
            except Exception:
                pass
            self.driver = None

    def _load_downloaded_hashes(self):
        hashes = set()
        try:
            if DOWNLOADED_IMAGES_FILE.exists():
                with open(DOWNLOADED_IMAGES_FILE, 'r') as f:
                    hashes = set(line.strip() for line in f if line.strip())
        except Exception:
            logger.warning("Failed to read downloaded hashes file")
        return hashes

    def _save_downloaded_hash(self, image_hash):
        DOWNLOADED_IMAGES_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(DOWNLOADED_IMAGES_FILE, 'a') as f:
            f.write(f"{image_hash}\n")

    def _get_image_hash(self, url):
        cleaned_url = self._clean_url(url)
        return hashlib.md5(cleaned_url.encode()).hexdigest()

    @staticmethod
    def _clean_url(url):
        try:
            parsed = urlparse(url)
            query_params = parse_qs(parsed.query)
            cleaned_params = {k: v for k, v in query_params.items() if k.lower() not in TRACKING_PARAMS}
            if cleaned_params:
                from urllib.parse import urlencode
                query_string = urlencode(cleaned_params, doseq=True)
            else:
                query_string = ''
            cleaned = urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, query_string, ''))
            return cleaned
        except Exception:
            return url

    def get_domain(self, url):
        parsed = urlparse(url)
        return f"{parsed.scheme}://{parsed.netloc}"

    def is_same_domain(self, url1, url2):
        return urlparse(url1).netloc == urlparse(url2).netloc

    def is_valid_page_url(self, url):
        try:
            parsed = urlparse(url)
            path = parsed.path.lower()
            skip_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.pdf', '.zip', '.css', '.js', '.xml', '.json', '.webp', '.avif'}
            if any(path.endswith(ext) for ext in skip_extensions):
                return False
            skip_paths = {'#', 'javascript:', 'mailto:', 'tel:'}
            if any(url.startswith(skip) for skip in skip_paths):
                return False
            return True
        except Exception:
            return False

    def crawl(self, start_url, max_images=200):
        logger.info("Starting spider crawl from: %s", start_url)
        base_domain = self.get_domain(start_url)
        to_visit = [(start_url, 0)]
        pages_crawled = 0
        while to_visit and pages_crawled < MAX_PAGES_PER_DOMAIN and len(self.image_urls) < max_images:
            current_url, depth = to_visit.pop(0)
            if current_url in self.visited_urls or depth > MAX_DEPTH:
                continue
            self.visited_urls.add(current_url)
            pages_crawled += 1
            logger.info("[%d/%d] Crawling: %s (depth: %d)", pages_crawled, MAX_PAGES_PER_DOMAIN, current_url, depth)
            try:
                html_content = self._fetch_page(current_url)
                if html_content is None:
                    logger.warning("Failed to fetch page: %s", current_url)
                    continue
                soup = BeautifulSoup(html_content, 'lxml')
                images_found = self._extract_images(soup, current_url)
                logger.info("Found %d images on page", images_found)
                if depth < MAX_DEPTH:
                    links_found = self._extract_links(soup, current_url, base_domain, depth)
                    to_visit.extend(links_found)
                    logger.info("Found %d new links to crawl", len(links_found))
                time.sleep(CRAWL_DELAY)
            except Exception as e:
                logger.exception("Error crawling page %s: %s", current_url, e)
                continue
        logger.info("Crawling complete. Pages crawled: %d | Unique images: %d", pages_crawled, len(self.image_urls))
        self._close_selenium()
        return list(self.image_urls)

    def _fetch_page(self, url):
        # Prefer Selenium when available and necessary
        if SELENIUM_AVAILABLE:
            try:
                if self.driver is None:
                    self._init_selenium()
                if self.driver:
                    self.driver.get(url)
                    try:
                        WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
                    except Exception:
                        pass
                    time.sleep(1.5)
                    return self.driver.page_source
            except Exception:
                logger.exception("Selenium fetch failed for %s. Falling back to requests.", url)
        # Requests fallback
        try:
            resp = self.session.get(url, timeout=15)
            resp.raise_for_status()
            return resp.text
        except Exception:
            logger.exception("Requests fetch failed for %s", url)
            return None

    def _extract_images(self, soup, page_url):
        images_found = 0
        img_tags = soup.find_all('img')
        for img in img_tags:
            img_url = (img.get('src') or img.get('data-src') or img.get('data-lazy-src'))
            if not img_url or img_url.startswith('data:'):
                continue
            img_url = urljoin(page_url, img_url)
            cleaned_url = self._clean_url(img_url)
            img_hash = self._get_image_hash(cleaned_url)
            if img_hash in self.downloaded_hashes:
                continue
            if self._is_valid_image_url(cleaned_url) and cleaned_url not in self.image_urls:
                self.image_urls.add(cleaned_url)
                images_found += 1
        return images_found

    def _extract_links(self, soup, page_url, base_domain, current_depth):
        new_links = []
        for link in soup.find_all('a', href=True):
            href = link.get('href')
            if not href:
                continue
            full_url = urljoin(page_url, href)
            full_url = full_url.split('#')[0]
            if (self.is_valid_page_url(full_url) and self.is_same_domain(full_url, base_domain) and full_url not in self.visited_urls):
                new_links.append((full_url, current_depth + 1))
        return new_links

    def scrape_images(self, url, max_images=200):
        self.visited_urls.clear()
        self.image_urls.clear()
        return self.crawl(url, max_images)

    def download_image(self, image_url, output_path, max_retries=2):
        for attempt in range(max_retries + 1):
            try:
                response = self.session.get(image_url, timeout=15, stream=True)
                response.raise_for_status()
                content_length = response.headers.get('Content-Length') or response.headers.get('content-length')
                if content_length:
                    try:
                        cl = int(content_length)
                        max_bytes = 10 * 1024 * 1024  # 10 MB guard
                        if cl > max_bytes:
                            logger.info("Skipping large image (>10MB): %s", image_url)
                            return False
                    except ValueError:
                        pass
                with open(output_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                img = Image.open(output_path)
                img.verify()
                img = Image.open(output_path)
                width, height = img.size
                if width < MIN_IMAGE_SIZE or height < MIN_IMAGE_SIZE:
                    os.remove(output_path)
                    return False
                if width > MAX_IMAGE_SIZE or height > MAX_IMAGE_SIZE:
                    img.thumbnail((MAX_IMAGE_SIZE, MAX_IMAGE_SIZE), Image.Resampling.LANCZOS)
                    if img.mode in ('RGBA', 'P', 'LA'):
                        img = img.convert('RGB')
                    img.save(output_path, 'JPEG', quality=85, optimize=True)
                elif img.mode not in ('RGB', 'L'):
                    img = img.convert('RGB')
                    img.save(output_path, 'JPEG', quality=90)
                return True
            except Exception as e:
                logger.warning("Download attempt %d failed for %s: %s", attempt + 1, image_url, e)
                if attempt < max_retries:
                    time.sleep(1)
                    continue
                if output_path.exists():
                    try:
                        os.remove(output_path)
                    except OSError:
                        pass
                return False
        return False

    @staticmethod
    def _is_valid_image_url(url):
        try:
            parsed = urlparse(url)
            path = parsed.path.lower()
            if any(path.endswith(ext) for ext in IMAGE_EXTENSIONS):
                return True
            if 'image' in url.lower() or 'img' in url.lower():
                return True
            return False
        except Exception:
            return False

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

# --------------------
# MAIN PIPELINE
# --------------------
class ClothingScraperPipeline:
    def __init__(self):
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        self.classifier = ClothingClassifier(MODEL_PATH)
        self.body_detector = BodyDetector()
        self.color_detector = ColorDetector()
        self.spider = WebSpider()
        self.csv_manager = CatalogCSV(CSV_PATH)
        self.stats = {'total_urls': 0, 'images_scraped': 0, 'images_with_faces': 0, 'images_saved': 0, 'items_added': 0}

    def process_urls(self, urls):
        self.stats['total_urls'] = len(urls)
        logger.info("Starting scraper pipeline | URLs to process: %d", len(urls))
        for url in urls:
            self._process_url(url)
        self._print_summary()

    def _process_url(self, url):
        image_urls = self.spider.scrape_images(url)
        if not image_urls:
            logger.warning("No valid images found on %s", url)
            return
        logger.info("Processing %d images with %d concurrent workers...", len(image_urls), MAX_WORKERS)
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {executor.submit(self._process_image, img_url): img_url for img_url in image_urls}
            for idx, future in enumerate(as_completed(futures), 1):
                img_url = futures[future]
                logger.info("[%d/%d]", idx, len(image_urls))
                try:
                    future.result()
                except Exception as e:
                    logger.exception("Error processing %s: %s", img_url[:120], e)

    def _process_image(self, image_url):
        url_hash = hashlib.md5(image_url.encode()).hexdigest()[:8]
        timestamp = int(time.time())
        temp_filename = f"temp_{timestamp}_{url_hash}.jpg"
        temp_path = OUTPUT_DIR / temp_filename
        try:
            if not self.spider.download_image(image_url, temp_path):
                return
            with self.spider.lock:
                self.stats['images_scraped'] += 1
            logger.info("Downloaded: %s", image_url[:120])
            logger.info("Checking for human body/model...")
            try:
                if self.body_detector.has_human_body(temp_path):
                    logger.info("Model/Body detected - skipping")
                    try:
                        os.remove(temp_path)
                    except OSError:
                        pass
                    with self.spider.lock:
                        self.stats['images_with_faces'] += 1
                    return
                logger.info("No body detected - product-only image")
            except Exception as e:
                logger.exception("Body detection failed: %s", e)
                try:
                    os.remove(temp_path)
                except OSError:
                    pass
                return
            logger.info("Classifying clothing type...")
            try:
                clothing_type, category, confidence = self.classifier.classify(temp_path)
                logger.info("Classified as: %s (%.2f%%)", clothing_type, confidence * 100)
            except Exception as e:
                logger.exception("Classification failed: %s", e)
                try:
                    os.remove(temp_path)
                except OSError:
                    pass
                return
            if category == 'uncategorized' or confidence < MIN_CLASSIFICATION_CONFIDENCE:
                logger.info("Low confidence or uncategorized (threshold %.0f%%) - skipping", MIN_CLASSIFICATION_CONFIDENCE * 100)
                try:
                    os.remove(temp_path)
                except OSError:
                    pass
                return
            colors = self.color_detector.get_dominant_colors(temp_path, n_colors=3)
            primary_color = colors[0] if colors else 'unknown'
            secondary_colors = "|".join(colors[1:3]) if len(colors) > 1 else ''
            logger.info("Colors: %s", ', '.join(colors) if colors else 'unknown')
            final_filename = self._generate_filename(clothing_type, primary_color, timestamp)
            final_path = OUTPUT_DIR / final_filename
            try:
                try:
                    shutil.move(str(temp_path), str(final_path))
                except Exception:
                    try:
                        os.replace(str(temp_path), str(final_path))
                    except Exception:
                        shutil.copy2(str(temp_path), str(final_path))
                        os.remove(str(temp_path))
            except Exception as e:
                logger.exception("Failed to move final file: %s", e)
                try:
                    if temp_path.exists():
                        os.remove(temp_path)
                except Exception:
                    pass
                return
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
            with self.spider.lock:
                self.csv_manager.add_item(item_data)
                self.stats['images_saved'] += 1
                self.stats['items_added'] += 1
            img_hash = self.spider._get_image_hash(image_url)
            self.spider._save_downloaded_hash(img_hash)
            with self.spider.lock:
                self.spider.downloaded_hashes.add(img_hash)
            logger.info("Saved as: %s", final_filename)
        except Exception as e:
            logger.exception("Error processing image: %s", e)
            if temp_path.exists():
                try:
                    os.remove(temp_path)
                except OSError:
                    pass
        finally:
            gc.collect()

    def _generate_filename(self, clothing_type, color, timestamp):
        clean_type = re.sub(r'[^\w\-]', '', clothing_type.lower().replace(' ', '-'))
        clean_color = re.sub(r'[^\w\-]', '', color.lower())
        return f"{clean_color}-{clean_type}-{timestamp}.jpg"

    def _print_summary(self):
        logger.info("SCRAPING SUMMARY")
        logger.info("URLs processed: %d", self.stats['total_urls'])
        logger.info("Images downloaded: %d", self.stats['images_scraped'])
        logger.info("Images with models (skipped): %d", self.stats['images_with_faces'])
        logger.info("Product images saved: %d", self.stats['images_saved'])
        logger.info("Items added to catalog: %d", self.stats['items_added'])
        logger.info("Images folder: %s", OUTPUT_DIR)
        logger.info("CSV: %s", CSV_PATH)
        logger.info("Next steps: 1) Review images 2) Check CSV 3) Run seed script if available")

# --------------------
# ENTRY POINT
# --------------------
def load_urls(urls_file):
    urls = []
    if not urls_file.exists():
        logger.error("URLs file not found: %s", urls_file)
        return urls
    with open(urls_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                urls.append(line)
    return urls


def main():
    logger.info("Clothing Image Spider & Catalog Generator (patched)")
    if not MODEL_PATH.exists():
        logger.error("Model not found at %s", MODEL_PATH)
        logger.info("Please place your model (state_dict) at: %s", MODEL_PATH)
        sys.exit(1)
    urls = load_urls(URLS_FILE)
    if not urls:
        logger.warning("No URLs found in %s", URLS_FILE)
        logger.info("Add one URL per line to the file and run again")
        sys.exit(0)
    pipeline = ClothingScraperPipeline()
    pipeline.process_urls(urls)

if __name__ == '__main__':
    main()
