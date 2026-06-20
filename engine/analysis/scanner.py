import re
import logging
from PIL import Image
import piexif
from mutagen import File as MutagenFile
from mutagen.mp4 import MP4
from mutagen.flac import FLAC
from mutagen.id3 import ID3, TXXX

logger = logging.getLogger(__name__)

TRACKING_PATTERN = re.compile(r"AURAGUARD_TRACKING_ID=([\w-]+)")


def _scan_image(file_path: str) -> str | None:
    try:
        img = Image.open(file_path)
        exif_data = img.info.get("exif", None)
        if not exif_data:
            return None
        exif_dict = piexif.load(exif_data)
        user_comment = exif_dict.get("Exif", {}).get(
            piexif.ExifIFD.UserComment, b""
        )
        if isinstance(user_comment, bytes):
            match = TRACKING_PATTERN.search(user_comment.decode("utf-8", errors="ignore"))
            if match:
                return match.group(1)
    except Exception as e:
        logger.debug("Image scan failed: %s", e)
    return None


def _scan_media(file_path: str) -> str | None:
    try:
        mfile = MutagenFile(file_path)
        if mfile is None:
            return None

        if isinstance(mfile, MP4):
            for tag in mfile.get("©xyz", []):
                match = TRACKING_PATTERN.search(str(tag))
                if match:
                    return match.group(1)

        elif isinstance(mfile, FLAC):
            val = mfile.get("AURAGUARD_TRACKING_ID", [None])[0]
            if val:
                return str(val)

        else:
            if hasattr(mfile, "tags") and mfile.tags:
                for frame in mfile.tags.values():
                    if isinstance(frame, TXXX):
                        if "AURAGUARD" in str(frame.text).upper():
                            match = TRACKING_PATTERN.search(str(frame.text))
                            if match:
                                return match.group(1)
    except Exception as e:
        logger.debug("Media scan failed: %s", e)
    return None


def scan(file_path: str) -> str | None:
    tracking_id = _scan_image(file_path)
    if tracking_id:
        return tracking_id
    tracking_id = _scan_media(file_path)
    return tracking_id
