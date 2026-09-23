import psycopg
from psycopg.rows import dict_row
from contextlib import contextmanager

from .config import DATABASE_URL


@contextmanager
def get_conn():
    """Short-lived connection per request. Fine at intranet scale; swap for a
    pool (psycopg_pool) if traffic grows."""
    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
