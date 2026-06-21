import logging
import google.generativeai as genai

from config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

_MODEL = None


def get_model():
    global _MODEL
    if _MODEL is None:
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY not set")
        genai.configure(api_key=GEMINI_API_KEY)
        _MODEL = genai.GenerativeModel("gemini-1.5-flash")
        logger.info("Initialized gemini-1.5-flash")
    return _MODEL


def ask(prompt: str, system_instruction: str | None = None) -> str:
    model = get_model()
    kwargs = {}
    if system_instruction:
        kwargs["system_instruction"] = system_instruction
    response = model.generate_content(prompt, **kwargs)
    return response.text
