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
def track(payload: TrackPayload, request: Request, response: Response):
    """
    Called once by the frontend on every route change. Ensures the visitor
    has a cookie, upserts their visitor row, and logs a page view.
    Cookie identifies a *browser*, not an employee — there is no login here.
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
            insert into api.visitors (visitor_id)
            values (%s)
            on conflict (visitor_id)
            do update set last_seen = now(), visit_count = api.visitors.visit_count + 1
            """,
            (visitor_id,),
        )
        cur.execute(
            """
            insert into api.page_views (visitor_id, path, referrer, user_agent)
            values (%s, %s, %s, %s)
            """,
            (
                visitor_id,
                payload.path,
                payload.referrer,
                request.headers.get("user-agent"),
            ),
        )

    return {"ok": True}


def _require_dashboard_key(x_dashboard_key: str | None):
    if x_dashboard_key != DASHBOARD_KEY:
        # 404, not 401/403 — don't reveal that this path is meaningful to
        # someone who found it but doesn't have the key.
        raise HTTPException(status_code=404)


@router.get("/api/dashboard/summary")
def dashboard_summary(x_dashboard_key: str | None = Header(default=None)):
    _require_dashboard_key(x_dashboard_key)

    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("select count(*) as total from api.visitors")
        total_visitors = cur.fetchone()["total"]

        cur.execute("select count(*) as total from api.page_views")
        total_views = cur.fetchone()["total"]

        cur.execute(
            """
            select count(*) as total from api.page_views
            where viewed_at >= now() - interval '1 day'
            """
        )
        views_today = cur.fetchone()["total"]

        cur.execute(
            """
            select date_trunc('day', viewed_at)::date as day, count(*) as views
            from api.page_views
            where viewed_at >= now() - interval '14 days'
            group by 1 order by 1
            """
        )
        daily = cur.fetchall()

        cur.execute(
            """
            select path, count(*) as views
            from api.page_views
            group by path order by views desc limit 10
            """
        )
        top_paths = cur.fetchall()

        cur.execute(
            """
            select referrer, count(*) as views
            from api.page_views
            where referrer is not null and referrer <> ''
            group by referrer order by views desc limit 10
            """
        )
        top_referrers = cur.fetchall()

    return {
        "total_visitors": total_visitors,
        "total_views": total_views,
        "views_today": views_today,
        "daily_views": daily,
        "top_paths": top_paths,
        "top_referrers": top_referrers,
    }
