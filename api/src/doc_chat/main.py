import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from doc_chat.routes.auth_routes import auth_router
from doc_chat.routes.chat_routes import chat_router
from doc_chat.rag.chat_service import initialize_vector_store

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("main")

app = FastAPI()


@app.on_event("startup")
async def startup_event() -> None:
    """Initialize services on application startup."""
    logger.info("Initializing Weaviate vector store...")
    weaviate_host = os.getenv("WEAVIATE_HOST", "localhost")
    weaviate_port = int(os.getenv("WEAVIATE_PORT", "8080"))
    await initialize_vector_store(host=weaviate_host, port=weaviate_port)
    logger.info("Weaviate vector store initialized successfully")


# very permissive CORS, adjust origins/methods for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)
app.include_router(chat_router, prefix="/chats", tags=["chat"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
