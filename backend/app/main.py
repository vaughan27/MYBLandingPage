from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import CORS_ORIGINS, STAFF_UPLOAD_DIR
from .routers import analytics, newsletter, content, search, staff

app = FastAPI(title="MYB Intranet API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,  # required so the visitor cookie is sent/kept
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics.router)
app.include_router(newsletter.router)
app.include_router(content.router)
app.include_router(search.router)
app.include_router(staff.router)

STAFF_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=STAFF_UPLOAD_DIR), name="uploads")


@app.get("/api/health")
def health():
    return {"status": "ok"}
