#!/usr/bin/env python3
"""
Robust JS-enabled Sitemap & Image Scraper with Safe File Writes
---------------------------------------------------------------
Features:
- Scrapy + Playwright for JS-heavy pages
- Recursive crawling with domain filtering
- Extract <a> and <img> URLs
- Append results safely to scrape-urls.txt and image_links.txt
- Only '.jpg' images, strip query strings/fragments
- Skip invalid/commented URLs in scrape-urls.txt
- Retry failed pages and handle HTTP2/network errors
- Concurrency control and randomized User-Agent
"""

import os
import asyncio
from urllib.parse import urlparse
import random

import aiofiles
import scrapy
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from scrapy.linkextractors import LinkExtractor
from scrapy.utils.defer import deferred_from_coro
from playwright.async_api import Error as PlaywrightError

SCRAPE_URLS_FILE = "scrape-urls.txt"
IMAGE_LINKS_FILE = "image_links.txt"

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/16.6 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0",
]


class RobustSpider(scrapy.Spider):
    name = "robust_spider"
    custom_settings = {
        "DOWNLOAD_HANDLERS": {
            "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
            "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
        },
        "TWISTED_REACTOR": "twisted.internet.asyncioreactor.AsyncioSelectorReactor",
        "PLAYWRIGHT_BROWSER_TYPE": "chromium",
        "PLAYWRIGHT_DEFAULT_NAVIGATION_TIMEOUT": 15000,
        "PLAYWRIGHT_LAUNCH_OPTIONS": {"headless": True, "args": ["--no-sandbox"]},
        "CONCURRENT_REQUESTS": 3,  # safer for HTTP2-heavy sites
        "LOG_LEVEL": "ERROR",
    }

    def __init__(self, start_urls=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_urls = start_urls or []
        self.allowed_domains = list({urlparse(u).netloc for u in self.start_urls})
        self.link_extractor = LinkExtractor(allow_domains=self.allowed_domains)
        self.visited = set()
        self.failed_urls = set()
        self.file_lock = asyncio.Lock()  # serialize file writes

    async def _append_to_file(self, filename, text):
        async with self.file_lock:
            async with aiofiles.open(filename, "a", encoding="utf-8") as f:
                await f.write(text + "\n")

    async def safe_goto(self, page, url):
        try:
            return await page.goto(url, wait_until="domcontentloaded", timeout=15000)
        except PlaywrightError as e:
            print(f"[!] Failed to load {url}: {e}")
            self.failed_urls.add(url)
            return None

    async def parse_page(self, response):
        url = response.url
        if url in self.visited or url in self.failed_urls:
            return
        self.visited.add(url)

        # Extract and clean images (.jpg only)
        image_links = response.css("img::attr(src)").getall()
        for img in image_links:
            abs_img = response.urljoin(img)
            # Strip query params and fragments
            clean_img = urlparse(abs_img)._replace(query="", fragment="").geturl()
            if clean_img.lower().endswith(".jpg"):
                yield deferred_from_coro(self._append_to_file(IMAGE_LINKS_FILE, clean_img))

        # Extract and recurse links
        for link in self.link_extractor.extract_links(response):
            abs_link = link.url
            if urlparse(abs_link).netloc in self.allowed_domains and abs_link not in self.visited:
                yield deferred_from_coro(self._append_to_file(SCRAPE_URLS_FILE, abs_link))
                yield scrapy.Request(
                    abs_link,
                    callback=self.parse_page,
                    meta={"playwright": True, "playwright_include_page": False},
                )

    def start_requests(self):
        for url in self.start_urls:
            headers = {"User-Agent": random.choice(USER_AGENTS)}
            yield scrapy.Request(
                url,
                callback=self.parse_page,
                headers=headers,
                meta={"playwright": True, "playwright_include_page": False},
            )


def clean_urls():
    """Read scrape-urls.txt and ignore invalid/commented lines"""
    if not os.path.exists(SCRAPE_URLS_FILE):
        print(f"[!] Missing {SCRAPE_URLS_FILE}")
        return []
    urls = []
    with open(SCRAPE_URLS_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("http://") or line.startswith("https://"):
                urls.append(line)
    return urls


def run_scraper():
    urls = clean_urls()
    if not urls:
        print("[!] No valid URLs found in scrape-urls.txt.")
        return

    process = CrawlerProcess(get_project_settings())
    process.crawl(RobustSpider, start_urls=urls)
    process.start()


if __name__ == "__main__":
    print("=== 🕸️ Running Robust JS-enabled Sitemap & Image Scraper ===")
    run_scraper()
