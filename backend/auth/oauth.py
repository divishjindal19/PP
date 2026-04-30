"""
Google OAuth 2.0 + Demo Authentication
Sessions are stored in SQLite so they survive server restarts.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
import httpx, os, sqlite3, json
from pathlib import Path

router = APIRouter()

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI  = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/callback")
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:5173")

GOOGLE_AUTH_URL    = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URL   = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL= "https://www.googleapis.com/oauth2/v3/userinfo"

# ── SQLite-backed session store ──────────────────────────────────────────────
_DB = Path(__file__).parent.parent / "university_recommender.db"

def _get_conn():
    conn = sqlite3.connect(str(_DB))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            data  TEXT NOT NULL
        )
    """)
    conn.commit()
    return conn

def _save_session(token: str, data: dict):
    conn = _get_conn()
    conn.execute("INSERT OR REPLACE INTO sessions (token, data) VALUES (?,?)",
                 (token, json.dumps(data)))
    conn.commit()
    conn.close()

def _load_session(token: str) -> dict | None:
    conn = _get_conn()
    row = conn.execute("SELECT data FROM sessions WHERE token=?", (token,)).fetchone()
    conn.close()
    return json.loads(row[0]) if row else None

def _delete_session(token: str):
    conn = _get_conn()
    conn.execute("DELETE FROM sessions WHERE token=?", (token,))
    conn.commit()
    conn.close()

# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("/login")
async def google_login():
    if not GOOGLE_CLIENT_ID:
        return {
            "auth_url": f"{FRONTEND_URL}/demo-login",
            "demo_mode": True,
            "message": "Set GOOGLE_CLIENT_ID in .env for real OAuth",
        }
    params = "&".join([
        f"client_id={GOOGLE_CLIENT_ID}",
        f"redirect_uri={GOOGLE_REDIRECT_URI}",
        "response_type=code",
        "scope=openid email profile",
        "access_type=offline",
    ])
    return {"auth_url": f"{GOOGLE_AUTH_URL}?{params}"}


@router.get("/callback")
async def google_callback(code: str):
    async with httpx.AsyncClient() as client:
        tok = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code, "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI, "grant_type": "authorization_code",
        })
        access_token = tok.json().get("access_token")
        user_info = (await client.get(GOOGLE_USERINFO_URL,
                     headers={"Authorization": f"Bearer {access_token}"})).json()

    token = f"session_{user_info['sub']}"
    data = {"email": user_info.get("email"), "name": user_info.get("name"),
            "picture": user_info.get("picture"), "sub": user_info.get("sub")}
    _save_session(token, data)
    return RedirectResponse(f"{FRONTEND_URL}?token={token}")


@router.post("/demo-login")
async def demo_login(user_data: dict):
    """Demo login — works without Google credentials. Sessions persist across restarts."""
    email = user_data.get("email", "demo@university.edu")
    name  = user_data.get("name",  "Demo Student")
    token = f"demo_{email.replace('@','_').replace('.','_')}"
    data  = {
        "email": email, "name": name,
        "picture": f"https://api.dicebear.com/7.x/avataaars/svg?seed={email}",
        "sub": token,
    }
    _save_session(token, data)
    return {"token": token, "user": data}


@router.get("/me")
async def get_current_user(token: str):
    data = _load_session(token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return data


@router.post("/logout")
async def logout(token: str):
    _delete_session(token)
    return {"message": "Logged out"}
