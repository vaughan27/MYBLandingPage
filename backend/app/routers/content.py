from fastapi import APIRouter
from ..database import get_conn

router = APIRouter(prefix="/api/content")

@router.get("/quick-links")
def quick_links():
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            select id, label, href, img_url, icon, sort_order
            from quick_links
            where enabled
            order by sort_order
            """
        )
        return cur.fetchall()


@router.get("/feature-tiles")
def feature_tiles():
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            select id, title, href, img_url, icon, sort_order
            from feature_tiles
            where enabled
            order by sort_order
            """
        )
        return cur.fetchall()


@router.get("/gallery")
def gallery():
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            select id, caption, img_url, sort_order
            from gallery_images
            where enabled
            order by sort_order
            """
        )
        return cur.fetchall()


@router.get("/events")
def events():
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            select id, title, description, starts_at, location
            from events
            where enabled and starts_at >= now() - interval '1 day'
            order by starts_at asc
            """
        )
        return cur.fetchall()


@router.get("/news")
def news():
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            select id, title, summary, url, published_at
            from news_items
            where enabled
            order by published_at desc
            limit 20
            """
        )
        return cur.fetchall()

@router.get("/whats-new")
def whats_new():
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            select id, title, body, published_at
            from whats_new
            where active
            order by published_at desc
            limit 20
            """
        )
        return cur.fetchall()
