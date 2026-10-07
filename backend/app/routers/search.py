from fastapi import APIRouter, Query
from ..database import get_conn

router = APIRouter(prefix="/api")


@router.get("/search")
def search(q: str = Query(default="", min_length=0, max_length=100)):
    q = q.strip()
    if len(q) < 2:
        return []

    pattern = f"%{q}%"
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            select id, name, href, category
            from search_items
            where active
              and (name ilike %s or coalesce(keywords, '') ilike %s)
            order by name
            limit 20
            """,
            (pattern, pattern),
        )
        return cur.fetchall()
