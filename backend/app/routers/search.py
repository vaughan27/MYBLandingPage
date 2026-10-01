from fastapi import APIRouter, Query
from ..database import get_conn

router = APIRouter(prefix="/api")


@router.get("/search")
def search(q: str = Query(default="", min_length=0, max_length=100)):
    """
    Site-wide search over the generic `search_items` table. Matches against
    `name` and `keywords` (case-insensitive, substring). Returns [] for a
    blank/too-short query rather than the whole table, so the frontend can
    safely call this on every keystroke without dumping everything.

    This intentionally only searches `search_items`, not every content
    table individually — if you want quick_links/events/etc. to show up in
    search too, add matching rows to search_items (see db/schema.sql seed
    data for the pattern) rather than adding more queries here.
    """
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
