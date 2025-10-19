#!/usr/bin/env python3
"""
Downloader Component - Downloads images to temporary folder
"""

import os
import sys
import logging
from pathlib import Path
import time
import hashlib
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse, parse_qs, urlunparse

import requests
from PIL import Image

# Configuration
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUTPUT_DIR = PROJECT_ROOT / "catalog-data"
IMAGE_LINKS_FILE = OUTPUT_DIR / "image_links.txt"
TMP_DOWNLOAD_DIR = OUTPUT_DIR / "tmp_images"
DOWNLOADED_HASHES_FILE = OUTPUT_DIR / ".downloaded_hashes.txt"

MIN_IMAGE_SIZE = 100
MAX_IMAGE_SIZE = 2000
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/539.36'
MAX_WORKERS = 2
MAX_RETRIES = 3

TRACKING_PARAMS = {
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'fbclid', 'gclid', 'msclkid', 'ref', 'referrer', 'source', 'campaign',
    '_ga', '_gl', 'mc_cid', 'mc_eid'
}

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class ImageDownloader:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        })
        self.downloaded_hashes = self._load_downloaded_hashes()
        self.lock = threading.Lock()
        self.stats = {
            'total_urls': 0,
            'successful_downloads': 0,
            'failed_downloads': 0,
            'skipped_duplicates': 0
        }

    def _load_downloaded_hashes(self):
        hashes = set()
        try:
            if DOWNLOADED_HASHES_FILE.exists():
                with open(DOWNLOADED_HASHES_FILE, 'r') as f:
                    hashes = set(line.strip() for line in f if line.strip())
        except Exception:
            logger.warning("Failed to read downloaded hashes file")
        return hashes

    def _save_downloaded_hash(self, image_hash):
        DOWNLOADED_HASHES_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(DOWNLOADED_HASHES_FILE, 'a') as f:
            f.write(f"{image_hash}\n")

    def _remove_url_from_file(self, image_url):
        """Remove a URL from the image_links.txt file"""
        try:
            if not IMAGE_LINKS_FILE.exists():
                return
                
            # Read all URLs
            with open(IMAGE_LINKS_FILE, 'r', encoding='utf-8') as f:
                urls = [line.strip() for line in f if line.strip()]
            
            # Remove the downloaded URL
            cleaned_target = self._clean_url(image_url)
            new_urls = []
            removed_count = 0
            
            for url in urls:
                cleaned_current = self._clean_url(url)
                if cleaned_current == cleaned_target:
                    removed_count += 1
                else:
                    new_urls.append(url)
            
            # Write back the remaining URLs
            with open(IMAGE_LINKS_FILE, 'w', encoding='utf-8') as f:
                for url in new_urls:
                    f.write(f"{url}\n")
                    
            if removed_count > 0:
                logger.debug("Removed %d occurrence(s) of URL from links file", removed_count)
                
        except Exception as e:
            logger.error("Failed to remove URL from file: %s", e)

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

    def _safe_delete(self, file_path):
        """Safely delete a file with retries"""
        if file_path is None or not file_path.exists():
            return
            
        max_retries = 3
        for attempt in range(max_retries):
            try:
                os.remove(str(file_path))
                break
            except PermissionError:
                if attempt < max_retries - 1:
                    time.sleep(0.2)
                    continue
                else:
                    logger.warning("Could not delete file %s after %d attempts", file_path, max_retries)
            except FileNotFoundError:
                break
            except Exception as e:
                logger.warning("Error deleting file %s: %s", file_path, e)
                break

    def download_image(self, image_url, output_path, max_retries=MAX_RETRIES):
        """Download and validate a single image"""
        for attempt in range(max_retries + 1):
            temp_output = output_path.with_suffix('.tmp')
            try:
                response = self.session.get(image_url, timeout=15, stream=True)
                response.raise_for_status()
                
                # Check content length
                content_length = response.headers.get('Content-Length')
                if content_length:
                    try:
                        cl = int(content_length)
                        max_bytes = 10 * 1024 * 1024
                        if cl > max_bytes:
                            logger.info("Skipping large image (>10MB): %s", image_url)
                            self._safe_delete(temp_output)
                            return False
                    except ValueError:
                        pass
                
                # Download to temporary file
                with open(temp_output, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                
                # Verify and process the image
                try:
                    with Image.open(temp_output) as img:
                        img.verify()  # Verify it's a valid image
                    
                    # Re-open for processing
                    with Image.open(temp_output) as img:
                        width, height = img.size
                        
                        # Check minimum size
                        if width < MIN_IMAGE_SIZE or height < MIN_IMAGE_SIZE:
                            logger.info("Image too small: %dx%d", width, height)
                            self._safe_delete(temp_output)
                            return False
                        
                        # Convert and resize if needed
                        if img.mode != 'RGB':
                            img = img.convert('RGB')
                        
                        # Resize if too large
                        if width > MAX_IMAGE_SIZE or height > MAX_IMAGE_SIZE:
                            img.thumbnail((MAX_IMAGE_SIZE, MAX_IMAGE_SIZE), Image.Resampling.LANCZOS)
                        
                        # Save final image
                        img.save(output_path, 'JPEG', quality=100, optimize=True)
                        
                    # Clean up temp file
                    self._safe_delete(temp_output)
                    return True
                    
                except Exception as img_error:
                    logger.warning("Image processing failed: %s", img_error)
                    self._safe_delete(temp_output)
                    self._safe_delete(output_path)
                    if attempt < max_retries:
                        time.sleep(1)
                        continue
                    return False
                    
            except Exception as e:
                logger.warning("Download attempt %d failed for %s: %s", attempt + 1, image_url, e)
                self._safe_delete(temp_output)
                self._safe_delete(output_path)
                if attempt < max_retries:
                    time.sleep(1)
                    continue
                return False
        
        return False

    def download_images(self, image_urls):
        """Download multiple images concurrently"""
        TMP_DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
        
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {}
            
            for image_url in image_urls:
                # Check if already downloaded
                img_hash = self._get_image_hash(image_url)
                if img_hash in self.downloaded_hashes:
                    with self.lock:
                        self.stats['skipped_duplicates'] += 1
                    continue
                
                # Create filename from URL hash
                filename = f"temp_{img_hash}.jpg"
                output_path = TMP_DOWNLOAD_DIR / filename
                
                future = executor.submit(self._download_single, image_url, output_path, img_hash)
                futures[future] = (image_url, output_path, img_hash)
            
            # Process completed downloads
            for future in as_completed(futures):
                image_url, output_path, img_hash = futures[future]
                try:
                    success = future.result()
                    if success:
                        with self.lock:
                            self.stats['successful_downloads'] += 1
                            self.downloaded_hashes.add(img_hash)
                            self._save_downloaded_hash(img_hash)
                            # Remove the URL from the links file immediately
                            self._remove_url_from_file(image_url)
                    else:
                        with self.lock:
                            self.stats['failed_downloads'] += 1
                except Exception as e:
                    logger.error("Unexpected error downloading %s: %s", image_url, e)
                    with self.lock:
                        self.stats['failed_downloads'] += 1

    def _download_single(self, image_url, output_path, img_hash):
        """Wrapper for single download with logging"""
        logger.info("Downloading: %s", image_url[:100])
        success = self.download_image(image_url, output_path)
        if success:
            logger.info("Downloaded and removed from queue: %s", image_url[:100])
        else:
            logger.warning("Failed to download: %s", image_url[:100])
        return success

    def get_downloaded_images(self):
        """Get list of successfully downloaded images"""
        return list(TMP_DOWNLOAD_DIR.glob("temp_*.jpg"))

def load_image_links(links_file):
    """Load image URLs from file with encoding detection"""
    if not links_file.exists():
        logger.error("Image links file not found: %s", links_file)
        return []
    
    # Try different encodings
    encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
    
    for encoding in encodings:
        try:
            with open(links_file, 'r', encoding=encoding) as f:
                urls = [line.strip() for line in f if line.strip()]
            logger.info("Successfully loaded %d image URLs using %s encoding", len(urls), encoding)
            return urls
        except UnicodeDecodeError:
            continue
        except Exception as e:
            logger.error("Error reading file with %s: %s", encoding, e)
            continue
    
    logger.error("Failed to read image links file with any encoding")
    return []

def main():
    logger.info("Starting Downloader - Image Downloader")
    
    # Load image URLs from spider output
    image_urls = load_image_links(IMAGE_LINKS_FILE)
    if not image_urls:
        logger.error("No image URLs to download")
        return
    
    downloader = ImageDownloader()
    downloader.stats['total_urls'] = len(image_urls)
    
    # Download images
    downloader.download_images(image_urls)
    
    # Print summary
    logger.info("DOWNLOAD SUMMARY:")
    logger.info("Total URLs: %d", downloader.stats['total_urls'])
    logger.info("Successful downloads: %d", downloader.stats['successful_downloads'])
    logger.info("Failed downloads: %d", downloader.stats['failed_downloads'])
    logger.info("Skipped duplicates: %d", downloader.stats['skipped_duplicates'])
    logger.info("Temporary images folder: %s", TMP_DOWNLOAD_DIR)
    
    downloaded_images = downloader.get_downloaded_images()
    logger.info("Ready for processing: %d images", len(downloaded_images))

if __name__ == '__main__':
    main()