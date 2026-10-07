import os
from pathlib import Path
from dotenv import load_dotenv

# Load backend/.env regardless of the current working directory.
BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://myb_app:myb_app_pw@localhost:5432/myb",
)

# Dashboard configuration
DASHBOARD_PATH = os.getenv("DASHBOARD_PATH", "/dashboard-2709")

DASHBOARD_KEY = os.getenv(
    "DASHBOARD_KEY",
    "change-me-before-deploying",
)

# Visitor tracking
VISITOR_COOKIE_NAME = "myb_vid"
VISITOR_COOKIE_MAX_AGE_DAYS = 365

# CORS
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173",
    ).split(",")
    if origin.strip()
]