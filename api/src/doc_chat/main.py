import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from doc_chat.routes.chat_routes import chat_router

app = FastAPI()
# very permissive CORS, adjust origins/methods for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # which domains can call
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # any headers (e.g. Authorization)
)
app.include_router(chat_router, prefix="/chats", tags=["chat"])

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )