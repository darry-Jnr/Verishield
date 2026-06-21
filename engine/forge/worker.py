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


def process_file(client, file_record: dict) -> None:
    file_id = file_record["id"]
    file_type = file_record.get("type", "")
    storage_path = file_record.get("storage_path", "")
    logger.info("Processing file %s (type=%s, path=%s)", file_id, file_type, storage_path)

    stamper = get_stamper(file_type)
    if stamper is None:
        msg = f"No stamper for type={file_type}"
        logger.warning(msg)
        mark_as_failed(client, file_id, msg)
        return

    _, ext = os.path.splitext(file_record.get("name", ""))
    tmp_original = os.path.join(tempfile.gettempdir(), f"orig_{file_id}{ext}")
    try:
        logger.info("Downloading via Supabase client: media/%s", storage_path)
        data = client.storage.from_(STORAGE_BUCKET).download(storage_path)
        with open(tmp_original, "wb") as f:
            f.write(data)

        tracking_id = f"{TRACKING_ID_PREFIX}-{uuid.uuid4().hex[:8].upper()}"
        stamped_path = stamper(tmp_original, tracking_id)
        logger.info("Stamped to %s", stamped_path)

        with open(stamped_path, "rb") as f:
            client.storage.from_(STORAGE_BUCKET).update(
                storage_path,
                f,
                file_options={"content-disposition": "attachment"},
            )

        mark_as_secured(client, file_id, tracking_id)
        logger.info("Secured file %s with tracking_id=%s", file_id, tracking_id)
    except Exception as e:
        err = traceback.format_exc()
        logger.error("Failed to process file %s:\n%s", file_id, err)
        mark_as_failed(client, file_id, err[:2000])
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
