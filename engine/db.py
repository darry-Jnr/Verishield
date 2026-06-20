from supabase import create_client, Client

from config import SUPABASE_URL, SUPABASE_SERVICE_KEY


def get_client() -> Client:
    key = SUPABASE_SERVICE_KEY
    if not key:
        raise RuntimeError("SUPABASE_SERVICE_KEY not set")
    return create_client(SUPABASE_URL, key)


def get_processing_files(client: Client) -> list[dict]:
    resp = (
        client.table("files")
        .select("id, folder_id, name, type, url, storage_path, user_id")
        .eq("status", "processing")
        .execute()
    )
    return resp.data


def mark_as_secured(client: Client, file_id: int, tracking_id: str) -> None:
    client.table("files").update(
        {"status": "secured", "tracking_id": tracking_id}
    ).eq("id", file_id).execute()


def mark_as_failed(client: Client, file_id: int, error_log: str = "") -> None:
    client.table("files").update(
        {"status": "failed", "error_log": error_log}
    ).eq("id", file_id).execute()


def get_file_by_tracking_id(client: Client, tracking_id: str) -> dict | None:
    resp = (
        client.table("files")
        .select("id, name, tracking_id, user_id, created_at")
        .eq("tracking_id", tracking_id)
        .maybe_single()
        .execute()
    )
    return resp.data


def get_user(client: Client, user_id: str) -> dict | None:
    resp = (
        client.table("users")
        .select("email")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    return resp.data
