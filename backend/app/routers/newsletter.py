from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import psycopg

from ..database import get_conn

router = APIRouter()


class SubscribePayload(BaseModel):
    email: EmailStr


@router.post("/api/newsletter/subscribe")
def subscribe(payload: SubscribePayload):
    """
    Stores the subscriber. Wire an actual mail provider (SES, Postmark, etc.)
    here later — e.g. send a confirmation email after the insert succeeds.
    Kept in FastAPI rather than exposed via PostgREST so the public site never
    holds direct write credentials to Postgres.
    """
    try:
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(
                "insert into api.newsletter_subscribers (email) values (%s)",
                (payload.email,),
            )
    except psycopg.errors.UniqueViolation:
        # Already subscribed — treat as success, don't leak whether the
        # email existed before.
        pass

    return {"ok": True}
