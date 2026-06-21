import re
import logging
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
TIMEOUT = 15


def crawl(url: str) -> dict:
    logger.info("Crawling %s", url)
    try:
        resp = requests.get(url, timeout=TIMEOUT, headers={"User-Agent": "AuraGuard/1.0"})
        resp.raise_for_status()
    except Exception as e:
        logger.warning("Failed to fetch %s: %s", url, e)
        return {"images": [], "emails": [], "title": "", "description": ""}

    soup = BeautifulSoup(resp.text, "html.parser")

    images = []
    for tag in soup.find_all("img"):
        src = tag.get("src") or tag.get("data-src") or ""
        if src.startswith("//"):
            src = "https:" + src
        elif src.startswith("/"):
            from urllib.parse import urlparse
            parsed = urlparse(url)
            src = f"{parsed.scheme}://{parsed.netloc}{src}"
        if src and not src.startswith("data:"):
            images.append(src)

    emails = set()
    for tag in soup.find_all("a", href=True):
        href = tag["href"]
        if href.startswith("mailto:"):
            emails.add(href[7:].split("?")[0])
    for match in EMAIL_PATTERN.findall(resp.text):
        emails.add(match.lower())

    title = ""
    t_tag = soup.find("title")
    if t_tag:
        title = t_tag.get_text(strip=True)

    description = ""
    meta = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
    if meta:
        description = meta.get("content", "")

    logger.info("Crawled %s — %d images, %d emails", url, len(images), len(emails))
    return {
        "images": images,
        "emails": list(emails),
        "title": title,
        "description": description,
    }
