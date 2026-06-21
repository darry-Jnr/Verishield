import logging
from datetime import datetime, timezone

from supabase import create_client, Client

from config import SUPABASE_URL, SUPABASE_SERVICE_KEY, PRE_CONFIGURED_DOMAINS
from scraper.crawler import crawl
from scraper.searcher import _download_and_scan
from ai import ask

logger = logging.getLogger(__name__)

_CLIENT: Client | None = None

_IMPACT_PROMPT = """\
Given the information below, write a concise 2-3 sentence summary describing what was detected and how the asset is being used on the external site. Be factual — state what file was found, what page it appeared on, and what the site seems to be doing with it (e.g. selling a product, promoting a service, hosting content). Write like a reporter telling you what others are using this content for.

Asset: {file_name}
Found at: {source_url}
Page title: {page_title}
Contact email: {site_email}
Tracking ID: {tracking_id}"""


def _get_client() -> Client:
    global _CLIENT
    if _CLIENT is None:
        key = SUPABASE_SERVICE_KEY
        if not key:
            raise RuntimeError("SUPABASE_SERVICE_KEY not set")
        _CLIENT = create_client(SUPABASE_URL, key)
    return _CLIENT


def _generate_impact_summary(file_name: str, source_url: str, page_title: str, site_email: str | None, tracking_id: str) -> str:
    try:
        prompt = _IMPACT_PROMPT.format(
            file_name=file_name,
            source_url=source_url,
            page_title=page_title or "N/A",
            site_email=site_email or "N/A",
            tracking_id=tracking_id,
        )
        return ask(prompt)
    except Exception as e:
        logger.warning("Failed to generate impact summary: %s", e)
        return ""


def _lookup_file_by_tracking_id(client: Client, tracking_id: str) -> dict | None:
    resp = (
        client.table("files")
        .select("id, name, user_id")
        .eq("tracking_id", tracking_id)
        .maybe_single()
        .execute()
    )
    return resp.data


def _record_match(client: Client, file_record: dict, match: dict) -> None:
    existing = (
        client.table("scan_results")
        .select("id")
        .eq("tracking_id", match["tracking_id"])
        .eq("matched_url", match["source_url"])
        .maybe_single()
        .execute()
    )
    if existing.data:
        logger.info("Match already recorded for %s on %s", match["tracking_id"], match["source_url"])
        return

    impact_summary = _generate_impact_summary(
        file_name=file_record.get("name", "Unknown"),
        source_url=match.get("source_url", ""),
        page_title=match.get("page_title", ""),
        site_email=match.get("site_email"),
        tracking_id=match.get("tracking_id", ""),
    )

    record = {
        "tracking_id": match["tracking_id"],
        "file_id": file_record["id"],
        "user_id": file_record["user_id"],
        "matched_url": match["source_url"],
        "matched_image_url": match["matched_image_url"],
        "page_title": match["page_title"],
        "site_email": match["site_email"],
        "impact_summary": impact_summary,
        "detected_at": datetime.now(timezone.utc).isoformat(),
    }
    client.table("scan_results").insert(record).execute()
    logger.info("Recorded match: %s on %s", match["tracking_id"], match["source_url"])


def detect_all():
    client = _get_client()

    # Crawl all pre-configured domains and scan images for tracking IDs
    logger.info("Scanning %d pre-configured domains", len(PRE_CONFIGURED_DOMAINS))
    for domain in PRE_CONFIGURED_DOMAINS:
        try:
            page = crawl(domain)
            for img_url in page["images"]:
                tracking_id = _download_and_scan(img_url)
                if not tracking_id:
                    continue

                file_record = _lookup_file_by_tracking_id(client, tracking_id)
                if not file_record:
                    logger.info("No file found for tracking ID %s — skipping", tracking_id)
                    continue

                match = {
                    "tracking_id": tracking_id,
                    "source_url": domain,
                    "matched_image_url": img_url,
                    "page_title": page.get("title", ""),
                    "site_email": page.get("emails", [None])[0],
                }
                _record_match(client, file_record, match)
        except Exception as e:
            logger.warning("Error scanning %s: %s", domain, e)

    logger.info("Scan complete")
