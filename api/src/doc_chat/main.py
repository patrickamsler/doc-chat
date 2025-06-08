import logging
import uuid

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi import (
    Request, Response
)
from fastapi.middleware.cors import CORSMiddleware

from doc_chat.routes.chat_routes import chat_router
from doc_chat.security.security_helper import GUEST_COOKIE, GUEST_TTL, \
    create_guest_cookie

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("main")

app = FastAPI()
# very permissive CORS, adjust origins/methods for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(chat_router, prefix="/chats", tags=["chat"])


@app.middleware("http")
async def ensure_guest_cookie(request: Request, call_next):
    """
    First visit? — create guest-ID row + set cookie so front-end has something
    to send on every call.  We *only* run this if the request lacks BOTH
    Auth header and guest cookie (i.e. brand-new tab).
    """
    if (
          GUEST_COOKIE in request.cookies or request.method == "OPTIONS"
    ):
        return await call_next(request)
    else:
        guest_uid = uuid.uuid4()
        logger.info("Creating guest cookie for new user session")
        cookie_val = create_guest_cookie(guest_uid)
        response: Response = await call_next(request)
        response.set_cookie(
            key=GUEST_COOKIE,
            value=cookie_val,
            httponly=True,
            secure=False, # TODO set to true in production
            samesite="lax",
            max_age=GUEST_TTL,
            domain="127.0.0.1",
            path="/"
        )
        return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )