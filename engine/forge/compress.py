import os
import tempfile
import logging

from PIL import Image

from config import COMPRESS_IMAGES, IMAGE_QUALITY

logger = logging.getLogger(__name__)

SUPPORTED = ("JPEG", "PNG", "WEBP")


def compress_image(path: str) -> str:
    if not COMPRESS_IMAGES:
        return path

    img = Image.open(path)
    fmt = img.format or "PNG"

    if fmt not in SUPPORTED:
        img.close()
        return path

    base = os.path.basename(path)
    name_no_ext = os.path.splitext(base)[0]
    ext_map = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}
    ext = ext_map.get(fmt, ".png")

    out_path = os.path.join(tempfile.gettempdir(), f"compressed_{name_no_ext}{ext}")

    before = os.path.getsize(path)
    save_kwargs = {"optimize": True}

    if fmt in ("JPEG", "WEBP"):
        save_kwargs["quality"] = IMAGE_QUALITY

    img.save(out_path, format=fmt, **save_kwargs)
    img.close()

    after = os.path.getsize(out_path)
    pct = (1 - after / before) * 100 if before else 0
    logger.info("Compressed %s %.1fMB → %.1fKB (%.0f%%)", base, before / 1e6, after / 1024, pct)

    return out_path
