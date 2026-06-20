import logging

from config import SUPABASE_URL, SUPABASE_ANON_KEY
from db import get_client, get_file_by_tracking_id, get_user

logger = logging.getLogger(__name__)

CLIENT = None


def _get_client():
    global CLIENT
    if CLIENT is None:
        CLIENT = get_client()
    return CLIENT


def trace(tracking_id: str) -> dict | None:
    client = _get_client()
    file_record = get_file_by_tracking_id(client, tracking_id)
    if not file_record:
        logger.warning("No file found with tracking_id=%s", tracking_id)
        return None

    result = {
        "tracking_id": file_record.get("tracking_id"),
        "file_name": file_record.get("name"),
        "uploaded_at": file_record.get("created_at"),
        "user": None,
    }

    user_id = file_record.get("user_id")
    if user_id:
        user = get_user(client, user_id)
        if user:
            result["user"] = {
                "email": user.get("email"),
                "id": user_id,
            }

    return result
