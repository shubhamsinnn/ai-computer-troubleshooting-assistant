import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
SAMPLES_DIR = BASE_DIR / "samples"
MODELS_DIR.mkdir(exist_ok=True)
SAMPLES_DIR.mkdir(exist_ok=True)

# Configuration settings
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

# Autonomous Vehicle Default Physics Parameters
MAX_SPEED_KMH = 120.0
CRUISING_SPEED_KMH = 65.0
EMERGENCY_BRAKE_DECEL = 8.5 # m/s^2
NORMAL_BRAKE_DECEL = 3.5    # m/s^2
SENSOR_RANGE_METERS = 120.0
AEB_TTC_THRESHOLD = 2.2     # seconds to trigger Autonomous Emergency Braking
