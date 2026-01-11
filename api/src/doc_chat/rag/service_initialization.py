"""
Service initialization module for RAG services.

This module manages the global instances of shared resources (vector store and reranker)
and provides the initialization function called during application startup.
"""
import logging
from typing import Optional

from .reranker import Reranker
from .weaviate_vector_store import WeaviateVectorStore

logger = logging.getLogger(__name__)

# Global instances (will be initialized on app startup)
_vector_store: Optional[WeaviateVectorStore] = None
_reranker: Optional[Reranker] = None


async def initialize_services(host: str = "localhost",
      port: int = 8080) -> None:
    """
    Initialize the global RAG services (vector store and reranker).

    This should be called once during application startup.
    """
    global _vector_store, _reranker

    if _vector_store is None:
        logger.info(f"Initializing WeaviateVectorStore at {host}:{port}")
        _vector_store = await WeaviateVectorStore.create(host=host, port=port)
        logger.info("WeaviateVectorStore initialized successfully")

    if _reranker is None:
        logger.info("Initializing Reranker")
        _reranker = Reranker()
        logger.info("Reranker initialized successfully")


def get_vector_store() -> WeaviateVectorStore:
    """
    Get the global vector store instance.
    """
    if _vector_store is None:
        raise RuntimeError(
            "Vector store not initialized. Call initialize_services() during app startup."
        )
    return _vector_store


def get_reranker() -> Reranker:
    """
    Get the global reranker instance.
    """
    if _reranker is None:
        raise RuntimeError(
            "Reranker not initialized. Call initialize_services() during app startup."
        )
    return _reranker
