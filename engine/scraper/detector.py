import logging
from datetime import datetime, timezone

from supabase import create_client, Client

from config import SUPABASE_URL, SUPABASE_SERVICE_KEY
from scraper.searcher import search_image
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

            impact_summary = _generate_impact_summary(
                file_name=f.get("name", "Unknown"),
                source_url=m.get("source_url", ""),
                page_title=m.get("page_title", ""),
                site_email=m.get("site_email"),
                tracking_id=m.get("tracking_id", ""),
            )

            record = {
                "tracking_id": m["tracking_id"],
                "file_id": f["id"],
                "user_id": f["user_id"],
                "matched_url": m["source_url"],
                "matched_image_url": m["matched_image_url"],
                "page_title": m["page_title"],
                "site_email": m["site_email"],
                "impact_summary": impact_summary,
                "detected_at": datetime.now(timezone.utc).isoformat(),
            }
            client.table("scan_results").insert(record).execute()
            logger.info("Recorded match: %s on %s", m["tracking_id"], m["source_url"])

    logger.info("Scan complete")
