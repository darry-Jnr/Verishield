import os
import logging
import tempfile
import requests

from config import PRE_CONFIGURED_DOMAINS
from scraper.crawler import crawl
from analysis.scanner import scan

logger = logging.getLogger(__name__)

REVERSE_API_URL = os.getenv("REVERSE_SEARCH_API_URL", "")


def search_image(image_url: str) -> list[dict]:
    results = []

    # Try reverse image search API (dummy key → will fail)
    if REVERSE_API_URL:
        try:
            logger.info("Trying reverse search API for %s", image_url)
            resp = requests.post(REVERSE_API_URL, json={"image_url": image_url}, timeout=10)
            if resp.ok:
                data = resp.json()
                if data.get("matches"):
                    results.extend(data["matches"])
                    logger.info("Reverse API returned %d matches", len(data["matches"]))
        except Exception as e:
            logger.info("Reverse API failed (expected with dummy key): %s", e)

    # Fallback: crawl PRE_CONFIGURED_DOMAINS
    logger.info("Falling back to crawling %d pre-configured domains", len(PRE_CONFIGURED_DOMAINS))
    for domain in PRE_CONFIGURED_DOMAINS:
        try:
            page = crawl(domain)
            for img_url in page["images"]:
                tracking_id = _download_and_scan(img_url)
                if tracking_id:
                    results.append({
                        "tracking_id": tracking_id,
                        "source_url": domain,
                        "matched_image_url": img_url,
                        "page_title": page.get("title", ""),
                        "site_email": page.get("emails", [None])[0],
                    })
        except Exception as e:
            logger.warning("Error scanning %s: %s", domain, e)

    return results


def _download_and_scan(img_url: str) -> str | None:
    try:
        resp = requests.get(img_url, timeout=10)
        if not resp.ok:
            return None
        ext = ".tmp"
        for e in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
            if e in img_url.lower():
                ext = e
                break
        tmp = tempfile.NamedTemporaryFile(suffix=ext, delete=False)
        tmp.write(resp.content)
        tmp.close()
        tracking_id = scan(tmp.name)
        os.unlink(tmp.name)
        return tracking_id
    except Exception:
        return None
