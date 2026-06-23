import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

STORAGE_BUCKET = "media"
POLL_INTERVAL = 5
TRACKING_ID_PREFIX = "AG"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

COMPRESS_IMAGES = True
IMAGE_QUALITY = 85

PRE_CONFIGURED_DOMAINS = [
    "http://localhost:8000",
    "https://test-shop.up.railway.app",
    # Add more sites to scan here
    # e.g. "https://suspicious-store.com"
]
