import mimetypes
import os
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
STORAGE_BUCKET = "shop-media"

app = FastAPI()


def get_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


@app.get("/")
async def index():
    import pathlib
    html = (pathlib.Path(__file__).parent / "index.html").read_text()

    try:
        client = get_client()
        items = (
            client.schema("shop")
            .table("items")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        ).data
    except Exception:
        items = []

    cards = ""

    for item in items:
        is_video = bool(item.get("video_url"))
        src = item.get("video_url") or item.get("image_url") or ""
        media = (
            f'<video class="card-img" muted loop playsinline><source src="{src}" type="video/mp4"></video>'
            if is_video
            else f'<img class="card-img" src="{src}" alt="{item["title"]}" loading="lazy">'
        )
        desc = f"<p>{item['description']}</p>" if item.get("description") else ""
        cards += f"""
      <div class="card">
        {media}
        <div class="card-body">
          <h3>{item['title']}</h3>
          <div class="price">${float(item['price']):.2f}</div>
          {desc}
          <div class="meta">ID: {item['id']}</div>
        </div>
      </div>"""

    try:
        secured = (
            client.from_("files")
            .select("name, url, type, tracking_id, created_at")
            .eq("status", "secured")
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        ).data
        for f in secured:
            is_video = f["type"] == "video"
            src = f["url"]
            media = (
                f'<video class="card-img" muted loop playsinline><source src="{src}" type="video/mp4"></video>'
                if is_video
                else f'<img class="card-img" src="{src}" alt="{f["name"]}" loading="lazy">'
            )
            title = f["name"].rsplit(".", 1)[0] if "." in f["name"] else f["name"]
            tid = f["tracking_id"] or ""
            cards += f"""
      <div class="card">
        {media}
        <div class="card-body">
          <h3>{title}</h3>
          <div class="price">$0.00</div>
          <p style="font-size:11px;color:#999;font-family:monospace">{tid}</p>
          <div class="meta">Secured asset</div>
        </div>
      </div>"""
    except Exception:
        pass

    html = html.replace("<!-- SSR_ITEMS -->", cards)
    return HTMLResponse(html)


class ShopItem(BaseModel):
    id: int
    title: str
    price: float
    description: str | None = None
    image_url: str | None = None
    video_url: str | None = None
    created_at: str


@app.get("/api/items")
async def list_items():
    client = get_client()
    resp = (
        client.schema("shop")
        .table("items")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return resp.data


@app.post("/api/items")
async def create_item(
    title: str = Form(...),
    price: float = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
):
    client = get_client()

    content = await file.read()
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
    storage_path = f"shop/{uuid.uuid4().hex}.{ext}"

    client.storage.from_(STORAGE_BUCKET).upload(
        storage_path, content, {"content-type": file.content_type or "application/octet-stream"}
    )

    proxy_url = f"/api/media/{storage_path}"

    is_video = (file.content_type or "").startswith("video/")

    record = {
        "title": title,
        "price": price,
        "description": description or "",
        "image_url": None if is_video else proxy_url,
        "video_url": proxy_url if is_video else None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    resp = client.schema("shop").table("items").insert(record).execute()

    return resp.data[0] if resp.data else {"ok": True}


@app.get("/api/media/{storage_path:path}")
async def serve_media(storage_path: str):
    client = get_client()
    try:
        data = client.storage.from_(STORAGE_BUCKET).download(storage_path)
    except Exception as e:
        raise HTTPException(404, "File not found")

    content_type, _ = mimetypes.guess_type(storage_path)
    if not content_type:
        content_type = "application/octet-stream"

    filename = storage_path.rsplit("/", 1)[-1]
    return StreamingResponse(
        iter([data]),
        media_type=content_type,
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )
