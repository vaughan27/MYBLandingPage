import uuid

from fastapi import APIRouter, Request, Response, Header, HTTPException
from pydantic import BaseModel

from ..config import (
    VISITOR_COOKIE_NAME,
    VISITOR_COOKIE_MAX_AGE_DAYS,
    DASHBOARD_KEY,
)
from ..database import get_conn


router = APIRouter()


class TrackPayload(BaseModel):
    path: str
    referrer: str | None = None


@router.post("/api/track")
def track(
    payload: TrackPayload,
    request: Request,
    response: Response,
):
    """
    Called by the frontend on every route change.

    A browser is identified using a visitor cookie.
    Visitor information is stored in the visitors table.

    page_views has been removed, so this endpoint only updates
    the visitor's last_seen timestamp and visit_count.
    """

    visitor_id = request.cookies.get(VISITOR_COOKIE_NAME)

    if not visitor_id:
        visitor_id = str(uuid.uuid4())

        response.set_cookie(
            key=VISITOR_COOKIE_NAME,
            value=visitor_id,
            max_age=VISITOR_COOKIE_MAX_AGE_DAYS * 24 * 3600,
            httponly=True,
            samesite="lax",
        )

    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO visitors (visitor_id)
            VALUES (%s)
            ON CONFLICT (visitor_id)
            DO UPDATE SET
                last_seen = NOW(),
                visit_count = visitors.visit_count + 1
            """,
            (visitor_id,),
        )

    return {"ok": True}


def _require_dashboard_key(x_dashboard_key: str | None):
    if x_dashboard_key != DASHBOARD_KEY:
        # Return 404 instead of 401/403 so the dashboard endpoint
        # does not reveal that the route exists.
        raise HTTPException(status_code=404)


@router.get("/api/dashboard/summary")
def dashboard_summary(
    x_dashboard_key: str | None = Header(default=None),
):
    """
    Returns visitor statistics.

    page_views has been removed, therefore this dashboard only
    reports statistics available from the visitors table.
    """

    _require_dashboard_key(x_dashboard_key)

    with get_conn() as conn, conn.cursor() as cur:

        # Total unique browsers/visitors
        cur.execute(
            """
            SELECT COUNT(*) AS total
            FROM visitors
            """
        )

        total_visitors = cur.fetchone()["total"]

        # Visitors seen during the last 24 hours
        cur.execute(
            """
            SELECT COUNT(*) AS total
            FROM visitors
            WHERE last_seen >= NOW() - INTERVAL '1 day'
            """
        )

        visitors_today = cur.fetchone()["total"]

        # Total recorded visits based on visit_count
        cur.execute(
            """
            SELECT COALESCE(SUM(visit_count), 0) AS total
            FROM visitors
            """
        )

        total_visits = cur.fetchone()["total"]

        # Visitors currently/ recently active
        cur.execute(
            """
            SELECT COUNT(*) AS total
            FROM visitors
            WHERE last_seen >= NOW() - INTERVAL '30 minutes'
            """
        )

        active_visitors = cur.fetchone()["total"]

    return {
        "total_visitors": total_visitors,
        "total_visits": total_visits,
        "visitors_today": visitors_today,
        "active_visitors": active_visitors,

        # Keep these fields so an existing frontend dashboard
        # doesn't crash if it expects them.
        "total_views": 0,
        "views_today": 0,
        "daily_views": [],
        "top_paths": [],
        "top_referrers": [],
    }