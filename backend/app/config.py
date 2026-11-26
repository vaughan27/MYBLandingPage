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

STAFF_COOKIE_NAME = "myb_staff_session"
STAFF_COOKIE_SECURE = os.getenv("STAFF_COOKIE_SECURE", "false").lower() == "true"
STAFF_SESSION_HOURS = 8
STAFF_UPLOAD_DIR = Path(os.getenv("STAFF_UPLOAD_DIR", str(BACKEND_DIR / "uploads"))).resolve()
MAX_UPLOAD_BYTES = 25 * 1024 * 1024
BOOTSTRAP_ADMIN_USERNAME = os.getenv("BOOTSTRAP_ADMIN_USERNAME", "").strip().lower()
BOOTSTRAP_ADMIN_PASSWORD = os.getenv("BOOTSTRAP_ADMIN_PASSWORD", "")
