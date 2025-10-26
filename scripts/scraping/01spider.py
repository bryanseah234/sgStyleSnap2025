#!/usr/bin/env python3
"""
Spider Component - Collects image links from websites
"""

import os
import sys
import logging
from pathlib import Path
import time
import hashlib
import re
import threading
from urllib.parse import urljoin, urlparse, parse_qs, urlunparse
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from bs4 import BeautifulSoup

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
except ImportError:
    SELENIUM_AVAILABLE = False

# Configuration
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
URLS_FILE = SCRIPT_DIR / "scrape-urls.txt"
OUTPUT_DIR = PROJECT_ROOT / "catalog-data"
IMAGE_LINKS_FILE = OUTPUT_DIR / "image_links.txt"

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
MIN_IMAGE_SIZE = 100
MAX_IMAGE_SIZE = 2000
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

MAX_PAGES_PER_DOMAIN = 6
MAX_DEPTH = 5
CRAWL_DELAY = 0.5
MAX_WORKERS = 39

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
        self.driver = None
        self.lock = threading.Lock()
        self.output_file = IMAGE_LINKS_FILE

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
            logger.error("Could not initialize Selenium: %s", e)
            self.driver = None

    def _close_selenium(self):
        if self.driver:
            try:
                self.driver.quit()
            except Exception:
                pass
            self.driver = None

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

    def _save_image_links_immediately(self, image_urls):
        """Save image URLs to file immediately as they are found"""
        if not image_urls:
            return
            
        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.output_file, 'a', encoding='utf-8') as f:
            for url in image_urls:
                f.write(f"{url}\n")
        logger.debug("Immediately saved %d new image links", len(image_urls))

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
                logger.error("Error crawling page %s: %s", current_url, e)
                continue
                
        logger.info("Crawling complete. Pages crawled: %d | Unique images: %d", pages_crawled, len(self.image_urls))
        self._close_selenium()
        return list(self.image_urls)

    def _fetch_page(self, url):
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
                logger.warning("Selenium fetch failed for %s. Falling back to requests.", url)
                
        try:
            resp = self.session.get(url, timeout=15)
            resp.raise_for_status()
            return resp.text
        except Exception:
            logger.error("Requests fetch failed for %s", url)
            return None

    def _extract_images(self, soup, page_url):
        images_found = 0
        img_tags = soup.find_all('img')
        new_urls = []
        
        for img in img_tags:
            img_url = (img.get('src') or img.get('data-src') or img.get('data-lazy-src'))
            if not img_url or img_url.startswith('data:'):
                continue
                
            img_url = urljoin(page_url, img_url)
            cleaned_url = self._clean_url(img_url)
            
            if self._is_valid_image_url(cleaned_url) and cleaned_url not in self.image_urls:
                self.image_urls.add(cleaned_url)
                new_urls.append(cleaned_url)
                images_found += 1
        
        # Save new URLs immediately as they are found
        if new_urls:
            self._save_image_links_immediately(new_urls)
                
        return images_found

    def _extract_links(self, soup, page_url, base_domain, current_depth):
        new_links = []
        for link in soup.find_all('a', href=True):
            href = link.get('href')
            if not href:
                continue
            full_url = urljoin(page_url, href)
            full_url = full_url.split('#')[0]
            if (self.is_valid_page_url(full_url) and 
                self.is_same_domain(full_url, base_domain) and 
                full_url not in self.visited_urls):
                new_links.append((full_url, current_depth + 1))
        return new_links

    def scrape_images(self, url, max_images=200):
        self.visited_urls.clear()
        self.image_urls.clear()
        return self.crawl(url, max_images)

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

def save_image_links(image_urls, output_file):
    """Save image URLs to file for downloader (backup function)"""
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'a', encoding='utf-8') as f:
        for url in image_urls:
            f.write(f"{url}\n")
    logger.info("Saved %d image links to %s", len(image_urls), output_file)

def load_urls(urls_file):
    """Load URLs from file"""
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
    logger.info("Starting Spider - Image Link Collector")
    
    urls = load_urls(URLS_FILE)
    if not urls:
        logger.error("No URLs found in %s", URLS_FILE)
        return
        
    spider = WebSpider()
    all_image_urls = []
    
    for i, url in enumerate(urls):
        logger.info("Processing URL %d/%d: %s", i+1, len(urls), url)
        image_urls = spider.scrape_images(url)
        all_image_urls.extend(image_urls)
        logger.info("Progress: %d/%d URLs processed", i+1, len(urls))
        
    # Remove duplicates and save final consolidated list
    all_image_urls = list(set(all_image_urls))
    logger.info("Total unique image URLs found: %d", len(all_image_urls))
    
    # Optional: Save final deduplicated list (commented out since we're saving in real-time)
    # save_image_links(all_image_urls, IMAGE_LINKS_FILE)
    
    logger.info("Spider completed successfully")

if __name__ == '__main__':
    main()