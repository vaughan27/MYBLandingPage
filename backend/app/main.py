from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS
from .routers import analytics, newsletter

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


@app.get("/api/health")
def health():
    return {"status": "ok"}
