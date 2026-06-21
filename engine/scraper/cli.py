import logging

from scraper.detector import detect_all

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [SCANNER] %(levelname)s %(message)s",
)

if __name__ == "__main__":
    detect_all()
