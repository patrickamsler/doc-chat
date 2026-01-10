import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from doc_chat.file_util import delete_file
from .document_loader import DocumentLoader
from .weaviate_vector_store import WeaviateVectorStore
from ..models import Document, DocumentChunk, Chat

logger = logging.getLogger(__name__)


class DocumentService:
    """Service for managing document and chat lifecycle operations."""

    def __init__(self, vector_store: WeaviateVectorStore):
        self._vector_store = vector_store

    async def create_document_chat(
          self,
          user_id: str,
          chat_id: str,
          file_path: str,
          file_name: Optional[str] = None
    ) -> None:
        """
        Create a document chat by loading a PDF and indexing its chunks.

        In Weaviate:
        - A Chat represents a conversation
        - A Document represents a single PDF file
        - DocumentChunks represent text splits

        Args:
            user_id: The user ID
            chat_id: The chat ID to create
            file_path: Path to the PDF file
            file_name: Optional display name for the file
        """
        doc_loader = DocumentLoader(file_path)
        documents, splits = doc_loader.load_and_split()

        # Ensure tenant exists for user
        if not await self._vector_store.tenant_exists(user_id):
            logger.info(f"Creating new tenant for user: {user_id}")
            await self._vector_store.create_tenant(user_id)

        # Create Chat entity
        created_at = datetime.now(timezone.utc)
        chat = Chat(
            chat_id=chat_id,
            user_id=user_id,
            name=file_name or "Unknown",
            created_at=created_at
        )
        await self._vector_store.create_chat(user_id, chat)

        # Create Document object (represents the PDF)
        doc_id = str(uuid.uuid4().hex)
        document = Document(
            doc_id=doc_id,
            chat_id=chat_id,
            file_name=file_name or "Unknown",
            created_at=created_at,
            num_pages=len(documents)  # Number of pages in the PDF
        )

        # Create DocumentChunk objects from splits
        chunks = []
        for i, split in enumerate(splits):
            chunk = DocumentChunk(
                chunk_id=f"chunk_{i}",
                doc_id=doc_id,
                page_number=split.metadata.get('page', 0),
                page_content=split.page_content,
                created_at=created_at
            )
            chunks.append(chunk)

        # Index the document and its chunks
        await self._vector_store.index_document(user_id, document, chunks)

    async def delete_chat(self, user_id: str, chat_id: str) -> None:
        """
        Delete a chat and all associated data including the PDF file.

        This includes:
        - Chat metadata
        - All documents
        - All document chunks
        - All messages
        - PDF file from disk

        Args:
            user_id: The user ID
            chat_id: The chat ID to delete
        """
        await self._vector_store.delete_chat_and_all_data(user_id, chat_id)
        delete_file(user_id, chat_id)
        logger.info(f"Deleted chat {chat_id} for user {user_id}")


# Global instance (will be initialized on app startup by service_initialization)
_vector_store: Optional[WeaviateVectorStore] = None


def get_document_service() -> DocumentService:
    """
    Dependency to get DocumentService instance.
    """
    from .service_initialization import get_vector_store
    return DocumentService(get_vector_store())
