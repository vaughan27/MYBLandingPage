import os

# Central place for the handful of things you'll want to change per environment.
# Everything is overridable via env vars so nothing secret lives in git.

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://web_writer:web_writer_pw@localhost:5432/myb"
)

# The hidden dashboard's URL path. Change this per deployment; don't link to it
# from anywhere on the public site.
DASHBOARD_PATH = os.getenv("DASHBOARD_PATH", "/ops/pulse-9f21")

# Shared secret required (as `X-Dashboard-Key` header) to read dashboard data.
# An obscure path alone is not access control — see README "About the secret
# dashboard". Set a real value via env var in production.
DASHBOARD_KEY = os.getenv("DASHBOARD_KEY", "change-me-before-deploying")

# Cookie used to recognize a returning browser. Not tied to employee identity.
VISITOR_COOKIE_NAME = "myb_vid"
VISITOR_COOKIE_MAX_AGE_DAYS = 365

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
