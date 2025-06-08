import base64
import hashlib
import hmac
import os
import time
import uuid
from typing import Optional

from fastapi import (
    Request, HTTPException,
    status
)
from pydantic import BaseModel

OIDC_ISSUER = "https://example.auth0.com/"
OIDC_AUDIENCE = "your-api-aud"
OIDC_JWKS_URL = f"{OIDC_ISSUER}.well-known/jwks.json"
GUEST_COOKIE = "gSess"
GUEST_TTL = 60 * 60 * 24 * 365  # 365 days


class User(BaseModel):
    id: str
    is_guest: bool


def _get_guest_secret_encoded() -> bytes:
    """Get the secret used to sign guest cookies."""
    guest_signing_secret = os.environ.get("GUEST_SIGNING_SECRET")
    if not guest_signing_secret:
        raise EnvironmentError(
            "Missing required environment variable: GUEST_SIGNING_SECRET")
    return guest_signing_secret.encode()


def create_guest_cookie(guest_uid: uuid) -> str:
    """Create a new user cookie for a guest user."""
    issued_at = str(int(time.time()))
    payload_b64 = base64.urlsafe_b64encode(
        f"{guest_uid}:{issued_at}".encode()).rstrip(b"=").decode()
    guest_secret_encoded = _get_guest_secret_encoded()
    sig = hmac.new(guest_secret_encoded, payload_b64.encode(),
                   hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).rstrip(b"=").decode()
    cookie_val = f"{payload_b64}.{sig_b64}"
    return cookie_val


def _verify_guest_cookie_and_return_user(raw_cookie: str) -> Optional[User]:
    """Return User if signature/TTL ok, else None."""
    payload_b64, sig_b64 = raw_cookie.split(".")
    sig = base64.urlsafe_b64decode(sig_b64 + "==")
    guest_secret_encoded = _get_guest_secret_encoded()
    expected = hmac.new(guest_secret_encoded, payload_b64.encode(),
                        hashlib.sha256).digest()
    if not hmac.compare_digest(sig, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid guest cookie signature")

    uid, iat_s = (base64.urlsafe_b64decode(payload_b64 + "==")
                  .decode().split(":"))
    iat = int(iat_s)
    if time.time() > iat + GUEST_TTL:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Guest cookie expired")

    return User(id=uid, is_guest=True)


def get_current_user(
      request: Request
) -> User:
    # TODO At the moment, we only support guest users via cookies.
    raw_cookie = request.cookies.get(GUEST_COOKIE)
    if raw_cookie:
        return _verify_guest_cookie_and_return_user(raw_cookie)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated")


def is_user_authenticated(
      request: Request
) -> bool:
    """
    Check if the user is authenticated.
    Returns True if the user is authenticated, False otherwise.
    """
    try:
        get_current_user(request)
        return True
    except HTTPException as e:
        if e.status_code == status.HTTP_401_UNAUTHORIZED:
            return False
        raise e