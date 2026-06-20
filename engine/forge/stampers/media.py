import os
import tempfile
import shutil
from mutagen import File as MutagenFile
from mutagen.mp4 import MP4, MP4Cover
from mutagen.id3 import ID3, TXXX
from mutagen.flac import FLAC


def can_stamp(file_type: str) -> bool:
    return file_type in ("video", "audio")


def _stamp_mutagen(mutagen_file, tracking_id: str) -> str:
    path = mutagen_file.filename

    if isinstance(mutagen_file, MP4):
        mutagen_file["©xyz"] = [f"AURAGUARD_TRACKING_ID={tracking_id}"]
    elif isinstance(mutagen_file, FLAC):
        mutagen_file["AURAGUARD_TRACKING_ID"] = tracking_id
    else:
        try:
            if mutagen_file.tags is None:
                mutagen_file.add_tags()
            mutagen_file.tags.add(
                TXXX(desc="AuraGuard Tracking ID", text=tracking_id)
            )
        except Exception:
            mutagen_file["AURAGUARD_TRACKING_ID"] = tracking_id

    out_path = os.path.join(
        tempfile.gettempdir(), f"stamped_{os.path.basename(path)}"
    )
    mutagen_file.save()
    shutil.copy2(path, out_path)
    return out_path


def stamp(file_path: str, tracking_id: str) -> str:
    mfile = MutagenFile(file_path)
    if mfile is None:
        raise ValueError(f"Unsupported media format: {file_path}")
    return _stamp_mutagen(mfile, tracking_id)
