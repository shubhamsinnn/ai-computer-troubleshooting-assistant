import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

# AI Inference Engine Configuration
DEFAULT_CERTAINTY_THRESHOLD = 50.0 # Percentage match to trigger diagnosis
AMBIGUITY_THRESHOLD = 75.0         # Below this, follow-up questions are prompted
MAX_SYMPTOMS_EXTRACTED = 12
