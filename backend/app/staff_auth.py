"""Cookie sessions and role checks for the staff content manager."""
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request, Response

from .config import (
    STAFF_COOKIE_NAME,
    STAFF_COOKIE_SECURE,
    STAFF_SESSION_HOURS,
)
from .database import get_conn


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"{salt.hex()}:{digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, digest_hex = stored.split(":", 1)
        salt = bytes.fromhex(salt_hex)
        actual = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
        return hmac.compare_digest(actual.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def public_user(row: dict) -> dict:
    return {"id": row["id"], "username": row["username"], "role": row["role"], "active": row["active"]}


def current_staff(request: Request) -> dict:
    token = request.cookies.get(STAFF_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Staff login required")
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """SELECT u.id, u.username, u.role, u.active
               FROM staff_sessions s JOIN staff_users u ON u.id = s.user_id
               WHERE s.token_hash = %s AND s.expires_at > now() AND u.active""",
            (token_hash,),
        )
        user = cur.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Staff session expired")
    return user


def require_admin(request: Request) -> dict:
    user = current_staff(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")
    return user


def start_session(user_id: int, response: Response) -> None:
    token = secrets.token_urlsafe(48)
    expires = datetime.now(timezone.utc) + timedelta(hours=STAFF_SESSION_HOURS)
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "INSERT INTO staff_sessions (user_id, token_hash, expires_at) VALUES (%s, %s, %s)",
            (user_id, hashlib.sha256(token.encode()).hexdigest(), expires),
        )
    response.set_cookie(
        STAFF_COOKIE_NAME,
        token,
        max_age=STAFF_SESSION_HOURS * 3600,
        httponly=True,
        secure=STAFF_COOKIE_SECURE,
        samesite="lax",
        path="/",
    )


def end_session(request: Request, response: Response) -> None:
    token = request.cookies.get(STAFF_COOKIE_NAME)
    if token:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute("DELETE FROM staff_sessions WHERE token_hash = %s", (token_hash,))
    response.delete_cookie(STAFF_COOKIE_NAME, path="/", httponly=True, secure=STAFF_COOKIE_SECURE, samesite="lax")


def bootstrap_admin(username: str, password: str) -> None:
    if not username and not password:
        return
    if not username or len(password) < 8:
        raise RuntimeError("Set both BOOTSTRAP_ADMIN_USERNAME and a BOOTSTRAP_ADMIN_PASSWORD of at least 8 characters")
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM staff_users WHERE role = 'admin' LIMIT 1")
        if cur.fetchone():
            return
        cur.execute("SELECT role FROM staff_users WHERE username = %s", (username,))
        existing = cur.fetchone()
        if existing:
            if existing["role"] != "admin":
                raise RuntimeError("Bootstrap username already belongs to a non-admin staff account")
            return
        cur.execute(
            "INSERT INTO staff_users (username, password_hash, role) VALUES (%s, %s, 'admin')",
            (username, hash_password(password)),
        )
