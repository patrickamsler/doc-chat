import logging
import uuid

from fastapi import APIRouter, Request, Response

from doc_chat.security.security_helper import is_user_authenticated, \
    create_guest_cookie, GUEST_COOKIE, GUEST_TTL

auth_router = APIRouter()
logger = logging.getLogger("auth_routes")


@auth_router.post("/init")
async def init(request: Request):
    """
    Check if the user is authenticated (has a guest cookie). If not, it sets a guest cookie
    """
    if is_user_authenticated(request):
        return Response(status_code=200)

    logger.info("Creating guest cookie for new user session")
    guest_uid = uuid.uuid4().hex
    cookie_val = create_guest_cookie(guest_uid)
    response = Response(status_code=200)
    response.set_cookie(
        key=GUEST_COOKIE,
        value=cookie_val,
        httponly=True,
        secure=False,  # TODO set to true in production
        samesite="lax",
        max_age=GUEST_TTL,
        domain="127.0.0.1",
        path="/"
    )
    return response
