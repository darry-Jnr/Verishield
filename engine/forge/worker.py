import time
import uuid
import logging
import tempfile
import os
import traceback

from config import SUPABASE_URL, SUPABASE_ANON_KEY, POLL_INTERVAL, TRACKING_ID_PREFIX, STORAGE_BUCKET
from db import get_client, get_processing_files, mark_as_secured, mark_as_failed
from forge.stampers import image, media

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [FORGE] %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

CLIENT = None


def get_stamper(file_type: str):
    if image.can_stamp(file_type):
        return image.stamp
    if media.can_stamp(file_type):
        return media.stamp
    return None


def download_file(client, url: str, dest: str) -> None:
    if url.startswith("http"):
        import requests
        resp = requests.get(url, timeout=60)
        resp.raise_for_status()
        with open(dest, "wb") as f:
            f.write(resp.content)
    else:
        bucket = client.storage.from_(STORAGE_BUCKET)
        bucket_path = url.replace(f"{SUPABASE_URL}/storage/v1/object/public/media/", "")
        with open(dest, "wb") as f:
            resp = bucket.download(bucket_path)
            f.write(resp)


def upload_stamped(client, file_path: str, original_url: str) -> str:
    bucket = client.storage.from_("media")
    if original_url.startswith("http"):
        path_in_bucket = "/".join(original_url.split("/")[-2:])
    else:
        path_in_bucket = original_url
    with open(file_path, "rb") as f:
        bucket.update(path_in_bucket, f)
    return original_url


def process_file(client, file_record: dict) -> None:
    file_id = file_record["id"]
    file_type = file_record.get("type", "")
    file_url = file_record.get("url", "")
    logger.info("Processing file %s (type=%s)", file_id, file_type)

    stamper = get_stamper(file_type)
    if stamper is None:
        logger.warning("No stamper for type=%s, marking as failed", file_type)
        mark_as_failed(client, file_id)
        return

    tmp_original = os.path.join(tempfile.gettempdir(), f"orig_{file_id}")
    logger.info("Downloading from URL: %s", file_url)
    try:
        download_file(client, file_url, tmp_original)
        tracking_id = f"{TRACKING_ID_PREFIX}-{uuid.uuid4().hex[:8].upper()}"
        stamped_path = stamper(tmp_original, tracking_id)
        upload_stamped(client, stamped_path, file_url)
        mark_as_secured(client, file_id, tracking_id)
        logger.info("Secured file %s with tracking_id=%s", file_id, tracking_id)
    except Exception as e:
        logger.error("Failed to process file %s:\n%s", file_id, traceback.format_exc())
        mark_as_failed(client, file_id)
    finally:
        for p in (tmp_original,):
            if os.path.exists(p):
                os.remove(p)


def main_loop():
    global CLIENT
    logger.info("Forge worker starting...")
    CLIENT = get_client()
    logger.info("Connected to Supabase")

    while True:
        try:
            files = get_processing_files(CLIENT)
            if files:
                logger.info("Found %d file(s) to process", len(files))
            for f in files:
                process_file(CLIENT, f)
        except Exception as e:
            logger.error("Poll error: %s", e)
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main_loop()
