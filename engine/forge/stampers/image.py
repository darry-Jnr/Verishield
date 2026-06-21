import os
import tempfile
from PIL import Image
import piexif

from forge.compress import compress_image

TRACKING_PREFIX = "AURAGUARD_TRACKING_ID="


def read_tracking_id(file_path: str) -> str | None:
    img = Image.open(file_path)
    exif_data = img.info.get("exif", b"")
    if not exif_data:
        return None
    exif_dict = piexif.load(exif_data)
    comment = exif_dict.get("Exif", {}).get(piexif.ExifIFD.UserComment, b"")
    if isinstance(comment, bytes):
        comment = comment.decode("utf-8", errors="replace")
    if comment.startswith(TRACKING_PREFIX):
        return comment[len(TRACKING_PREFIX):].strip()
    return None


def can_stamp(file_type: str) -> bool:
    return file_type in ("image",)


def stamp(file_path: str, tracking_id: str) -> str:
    compressed = compress_image(file_path)
    img = Image.open(compressed)

    exif_data = img.info.get("exif", b"")
    if exif_data:
        exif_dict = piexif.load(exif_data)
    else:
        exif_dict = {"Exif": {}, "0th": {}, "1st": {}, "GPS": {}, "Interop": {}}

    exif_dict["Exif"][piexif.ExifIFD.UserComment] = (
        f"{TRACKING_PREFIX}{tracking_id}".encode("utf-8")
    )

    exif_bytes = piexif.dump(exif_dict)

    ext_map = {'JPEG': '.jpg', 'PNG': '.png', 'WEBP': '.webp', 'TIFF': '.tiff', 'GIF': '.gif'}
    img_format = img.format or 'PNG'
    ext = ext_map.get(img_format, '.png')

    base = os.path.basename(compressed)
    name_no_ext = os.path.splitext(base)[0]
    out_path = os.path.join(tempfile.gettempdir(), f"stamped_{name_no_ext}{ext}")
    img.save(out_path, exif=exif_bytes)
    img.close()

    if compressed != file_path:
        os.remove(compressed)

    return out_path
