import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from doc_chat.rag.service_initialization import initialize_services
from doc_chat.api.auth_routes import auth_router
from doc_chat.api.chat_routes import chat_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan event handler for startup and shutdown."""
    # Startup
    logger.info("Initializing services (vector store and reranker)...")
    weaviate_host = os.getenv("WEAVIATE_HOST", "localhost")
    weaviate_port = int(os.getenv("WEAVIATE_PORT", "8080"))
    await initialize_services(host=weaviate_host, port=weaviate_port)
    logger.info("Services initialized successfully")

    yield

    # Shutdown (if needed in the future)
    logger.info("Shutting down services...")


app = FastAPI(lifespan=lifespan)

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
