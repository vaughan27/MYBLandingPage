import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, Response, UploadFile
from pydantic import BaseModel, Field

from ..config import BOOTSTRAP_ADMIN_PASSWORD, BOOTSTRAP_ADMIN_USERNAME, MAX_UPLOAD_BYTES, STAFF_UPLOAD_DIR
from ..database import get_conn
from ..staff_auth import (
    bootstrap_admin,
    current_staff,
    end_session,
    hash_password,
    public_user,
    require_admin,
    start_session,
    verify_password,
)

router = APIRouter(prefix="/api/staff")


class LoginPayload(BaseModel):
    username: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=1, max_length=256)


class UserPayload(BaseModel):
    username: str = Field(min_length=3, max_length=80, pattern=r"^[a-zA-Z0-9._-]+$")
    password: str = Field(min_length=8, max_length=256)
    role: str = Field(pattern=r"^(manager|admin)$")


class UserUpdate(BaseModel):
    role: str = Field(pattern=r"^(manager|admin)$")
    active: bool


class WhatsNewPayload(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=10000)
    url: str | None = Field(default=None, max_length=2000)
    active: bool = True


class QuickLinkPayload(BaseModel):
    label: str = Field(min_length=1, max_length=200)
    href: str = Field(min_length=1, max_length=2000)
    icon: str = Field(default="link", max_length=40)
    sort_order: int = 0
    enabled: bool = True


class FeatureTilePayload(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    icon: str = Field(default="link", max_length=40)
    sort_order: int = 0
    enabled: bool = True


@router.on_event("startup")
def ensure_bootstrap_admin():
    bootstrap_admin(BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_PASSWORD)


@router.post("/login")
def login(payload: LoginPayload, response: Response):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT id, username, role, active, password_hash FROM staff_users WHERE username = %s", (payload.username.strip().lower(),))
        user = cur.fetchone()
    if not user or not user["active"] or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    start_session(user["id"], response)
    return public_user(user)


@router.post("/logout")
def logout(request: Request, response: Response):
    end_session(request, response)
    return {"ok": True}


@router.get("/me")
def me(user: dict = Depends(current_staff)):
    return public_user(user)


@router.get("/users")
def list_users(_: dict = Depends(require_admin)):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT id, username, role, active FROM staff_users ORDER BY username")
        return [public_user(row) for row in cur.fetchall()]


@router.post("/users", status_code=201)
def create_user(payload: UserPayload, _: dict = Depends(require_admin)):
    try:
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(
                "INSERT INTO staff_users (username, password_hash, role) VALUES (%s, %s, %s) RETURNING id, username, role, active",
                (payload.username.lower(), hash_password(payload.password), payload.role),
            )
            return public_user(cur.fetchone())
    except Exception as error:
        if getattr(error, "sqlstate", None) == "23505":
            raise HTTPException(status_code=409, detail="Username already exists")
        raise


@router.patch("/users/{user_id}")
def update_user(user_id: int, payload: UserUpdate, request: Request, _: dict = Depends(require_admin)):
    me_user = current_staff(request)
    if me_user["id"] == user_id and not payload.active:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account")
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT role, active FROM staff_users WHERE id = %s", (user_id,))
        old = cur.fetchone()
        if not old:
            raise HTTPException(status_code=404, detail="User not found")
        if old["role"] == "admin" and old["active"] and (payload.role != "admin" or not payload.active):
            cur.execute("SELECT COUNT(*) AS count FROM staff_users WHERE role = 'admin' AND active")
            if cur.fetchone()["count"] <= 1:
                raise HTTPException(status_code=400, detail="The last active admin cannot be demoted or deactivated")
        cur.execute("UPDATE staff_users SET role = %s, active = %s WHERE id = %s RETURNING id, username, role, active", (payload.role, payload.active, user_id))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        if not payload.active:
            cur.execute("DELETE FROM staff_sessions WHERE user_id = %s", (user_id,))
        return public_user(row)


def _list(table: str):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(f"SELECT * FROM {table} ORDER BY sort_order, id" if table != "whats_new" else "SELECT * FROM whats_new ORDER BY published_at DESC, id DESC")
        return cur.fetchall()


def _save(table: str, item_id: int | None, values: dict):
    cols = list(values)
    with get_conn() as conn, conn.cursor() as cur:
        if item_id is None:
            cur.execute(f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join(['%s'] * len(cols))}) RETURNING *", tuple(values[c] for c in cols))
        else:
            assignments = ", ".join(f"{col} = %s" for col in cols)
            cur.execute(f"UPDATE {table} SET {assignments} WHERE id = %s RETURNING *", (*[values[c] for c in cols], item_id))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Content item not found")
        return row


def _delete(table: str, item_id: int):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(f"DELETE FROM {table} WHERE id = %s RETURNING id", (item_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Content item not found")
    return {"ok": True}


@router.get("/whats-new")
def staff_whats_new(_: dict = Depends(current_staff)):
    return _list("whats_new")


@router.post("/whats-new", status_code=201)
def add_whats_new(payload: WhatsNewPayload, _: dict = Depends(current_staff)):
    values = payload.model_dump()
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "INSERT INTO whats_new (title, body, url, active, published_at) VALUES (%s, %s, %s, %s, now()) RETURNING *",
            (values["title"], values["body"], values["url"], values["active"]),
        )
        return cur.fetchone()


@router.put("/whats-new/{item_id}")
def edit_whats_new(item_id: int, payload: WhatsNewPayload, _: dict = Depends(current_staff)):
    values = payload.model_dump()
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("UPDATE whats_new SET title=%s, body=%s, url=%s, active=%s WHERE id=%s RETURNING *", (*values.values(), item_id))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Content item not found")
        return row


@router.delete("/whats-new/{item_id}")
def delete_whats_new(item_id: int, _: dict = Depends(require_admin)):
    return _delete("whats_new", item_id)


@router.get("/quick-links")
def staff_quick_links(_: dict = Depends(current_staff)):
    return _list("quick_links")


@router.post("/quick-links", status_code=201)
def add_quick_link(payload: QuickLinkPayload, _: dict = Depends(current_staff)):
    return _save("quick_links", None, payload.model_dump())


@router.put("/quick-links/{item_id}")
def edit_quick_link(item_id: int, payload: QuickLinkPayload, _: dict = Depends(current_staff)):
    return _save("quick_links", item_id, payload.model_dump())


@router.delete("/quick-links/{item_id}")
def delete_quick_link(item_id: int, _: dict = Depends(require_admin)):
    return _delete("quick_links", item_id)


@router.get("/feature-tiles")
def staff_feature_tiles(_: dict = Depends(current_staff)):
    return _list("feature_tiles")


async def _persist_pdf(file: UploadFile) -> tuple[str, Path]:
    filename = Path(file.filename or "resource.pdf").name
    if Path(filename).suffix.lower() != ".pdf" or file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=415, detail="Upload a PDF file")
    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if not content or len(content) > MAX_UPLOAD_BYTES or not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=413 if len(content) > MAX_UPLOAD_BYTES else 415, detail="Invalid PDF or file exceeds 25 MB")
    STAFF_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}.pdf"
    path = STAFF_UPLOAD_DIR / stored_name
    path.write_bytes(content)
    return f"/uploads/{stored_name}", path


@router.post("/feature-tiles", status_code=201)
async def add_feature_tile(
    title: str = Form(..., min_length=1, max_length=200),
    icon: str = Form("link", max_length=40),
    sort_order: int = Form(0),
    enabled: bool = Form(True),
    file: UploadFile = File(...),
    _: dict = Depends(current_staff),
):
    href, stored_path = await _persist_pdf(file)
    try:
        return _save("feature_tiles", None, {"title": title, "href": href, "icon": icon or "link", "sort_order": sort_order, "enabled": enabled})
    except Exception:
        stored_path.unlink(missing_ok=True)
        raise


@router.put("/feature-tiles/{item_id}")
async def edit_feature_tile(
    item_id: int,
    title: str = Form(..., min_length=1, max_length=200),
    icon: str = Form("link", max_length=40),
    sort_order: int = Form(0),
    enabled: bool = Form(True),
    file: UploadFile | None = File(None),
    _: dict = Depends(current_staff),
):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT href FROM feature_tiles WHERE id = %s", (item_id,))
        old = cur.fetchone()
    if not old:
        raise HTTPException(status_code=404, detail="Content item not found")
    href, stored_path = (old["href"], None)
    if file and file.filename:
        href, stored_path = await _persist_pdf(file)
    try:
        row = _save("feature_tiles", item_id, {"title": title, "href": href, "icon": icon or "link", "sort_order": sort_order, "enabled": enabled})
    except Exception:
        if stored_path:
            stored_path.unlink(missing_ok=True)
        raise
    if stored_path and re.fullmatch(r"/uploads/[a-f0-9]{32}\.pdf", old["href"]):
        (STAFF_UPLOAD_DIR / Path(old["href"]).name).unlink(missing_ok=True)
    return row


@router.delete("/feature-tiles/{item_id}")
def delete_feature_tile(item_id: int, _: dict = Depends(require_admin)):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT href FROM feature_tiles WHERE id=%s", (item_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Content item not found")
        cur.execute("DELETE FROM feature_tiles WHERE id=%s", (item_id,))
    href = row["href"]
    if href and re.fullmatch(r"/uploads/[a-f0-9]{32}\.pdf", href):
        (STAFF_UPLOAD_DIR / Path(href).name).unlink(missing_ok=True)
    return {"ok": True}
