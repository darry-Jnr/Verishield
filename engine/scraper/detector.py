import logging
from datetime import datetime, timezone

from supabase import create_client, Client

from config import SUPABASE_URL, SUPABASE_SERVICE_KEY
from scraper.searcher import search_image

logger = logging.getLogger(__name__)

_CLIENT: Client | None = None


def _get_client() -> Client:
    global _CLIENT
    if _CLIENT is None:
        key = SUPABASE_SERVICE_KEY
        if not key:
            raise RuntimeError("SUPABASE_SERVICE_KEY not set")
        _CLIENT = create_client(SUPABASE_URL, key)
    return _CLIENT


def detect_all():
    client = _get_client()

    # Get all secured files with tracking IDs
    resp = (
        client.table("files")
        .select("id, name, url, tracking_id, user_id")
        .eq("status", "secured")
        .not_.is_("tracking_id", "null")
        .execute()
    )
    files = resp.data
    logger.info("Checking %d secured files", len(files))

    for f in files:
        logger.info("Searching for file %s (%s)", f["id"], f["name"])
        matches = search_image(f["url"])
        for m in matches:
            record = {
                "tracking_id": m["tracking_id"],
                "file_id": f["id"],
                "user_id": f["user_id"],
                "matched_url": m["source_url"],
                "matched_image_url": m["matched_image_url"],
                "page_title": m["page_title"],
                "site_email": m["site_email"],
                "detected_at": datetime.now(timezone.utc).isoformat(),
            }
            # Check if already recorded
            existing = (
                client.table("scan_results")
                .select("id")
                .eq("tracking_id", m["tracking_id"])
                .eq("matched_url", m["source_url"])
                .maybe_single()
                .execute()
            )
            if existing.data:
                logger.info("Match already recorded for %s on %s", m["tracking_id"], m["source_url"])
                continue

            client.table("scan_results").insert(record).execute()
            logger.info("Recorded match: %s on %s", m["tracking_id"], m["source_url"])

    logger.info("Scan complete")
