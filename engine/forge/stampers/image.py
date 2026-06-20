import os
import tempfile
from PIL import Image
import piexif


def can_stamp(file_type: str) -> bool:
    return file_type in ("image",)


def stamp(file_path: str, tracking_id: str) -> str:
    img = Image.open(file_path)

    exif_data = img.info.get("exif", b"")
    if exif_data:
        exif_dict = piexif.load(exif_data)
    else:
        exif_dict = {"Exif": {}, "0th": {}, "1st": {}, "GPS": {}, "Interop": {}}

    exif_dict["Exif"][piexif.ExifIFD.UserComment] = (
        f"AURAGUARD_TRACKING_ID={tracking_id}".encode("utf-8")
    )

    exif_bytes = piexif.dump(exif_dict)

    out_path = os.path.join(tempfile.gettempdir(), f"stamped_{os.path.basename(file_path)}")
    img.save(out_path, exif=exif_bytes)
    img.close()

    return out_path
