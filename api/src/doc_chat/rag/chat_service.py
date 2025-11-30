import logging
from datetime import datetime, timezone
from typing import Optional

from .citation_retrieval_chain import CitationRetrievalChain
from .document_loader import DocumentLoader
from .reranker import Reranker
from .weaviate_vector_store import WeaviateVectorStore, Document, DocumentChunk
from ..api_types import QueryResponse, ChatsResponse, Chat, DocumentsResponse
from ..llm import create_llm

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self, vector_store: WeaviateVectorStore, reranker: Reranker):
        self._vector_store = vector_store
        self._reranker = reranker
        self._retrieval_chain = CitationRetrievalChain(llm=create_llm())

    async def create_document_chat(self, user_id: str, chat_id: str,
          file_path: str, file_name: Optional[str] = None) -> None:
        """
        Create a document chat by loading a PDF and indexing its chunks.

        In Weaviate:
        - A Document represents a single PDF file
        - DocumentChunks represent text splits
        """
        doc_loader = DocumentLoader(file_path)
        documents, splits = doc_loader.load_and_split()

        # Ensure tenant exists for user
        if not await self._vector_store.tenant_exists(user_id):
            logger.info(f"Creating new tenant for user: {user_id}")
            await self._vector_store.create_tenant(user_id)

        # Create Document object (represents the PDF)
        document = Document(
            doc_id=chat_id,
            file_name=file_name or "Unknown",
            created_at=datetime.now(timezone.utc),
            num_pages=len(documents)  # Number of pages in the PDF
        )

        # Create DocumentChunk objects from splits
        chunks = []
        for i, split in enumerate(splits):
            chunk = DocumentChunk(
                chunk_id=f"chunk_{i}",
                doc_id=chat_id,
                page_number=split.metadata.get('page', 0),
                page_content=split.page_content,
                created_at=datetime.now(timezone.utc)
            )
            chunks.append(chunk)

        # Index the document and its chunks
        await self._vector_store.index_document(user_id, document, chunks)

    async def query(self, user_id: str, chat_id: str,
          question: str) -> QueryResponse:
        """
        Query the document using semantic search.

        In Weaviate:
        - We search chunks (text splits) within a specific document (PDF)
        """

        # Retrieve top 20 chunks from the vector store
        retrieved_chunks = await self._vector_store.search_chunks(
            user_id=user_id,
            doc_id=chat_id,
            query=question,
            k=20
        )

        # Rerank the retrieved chunks
        ranked_chunks = self._reranker.rerank(query=question,
                                              documents=retrieved_chunks)

        # Invoke the retrieval chain with the top 5 ranked chunks
        response = self._retrieval_chain.invoke(question, ranked_chunks[:5])
        response_documents = [
            DocumentsResponse(id=chunk.chunk_id,
                              page=chunk.page_number,
                              content=chunk.page_content)
            for chunk in response['source_documents']
        ]
        answer = response['answer']
        return QueryResponse(
            question=question,
            answer=answer,
            documents=response_documents
        )

    async def find_chat(self, user_id: str, chat_id: str) -> Optional[Chat]:
        """
        Find a chat by retrieving the document metadata.

        In Weaviate:
        - A chat corresponds to a Document (PDF)
        """
        document = await self._vector_store.get_document(user_id, chat_id)
        if not document:
            return None

        return Chat(
            chatId=chat_id,
            fileName=document.file_name,
            createdAt=document.created_at.isoformat() if document.created_at else None
        )

    async def find_all_chats(self, user_id: str) -> ChatsResponse:
        """
        Find all chats for a user.

        In Weaviate:
        - Each chat is a Document (PDF)
        - We retrieve all documents for the user
        """
        documents = await self._vector_store.get_documents(user_id)

        chats = []
        for document in documents:
            chat = Chat(
                chatId=document.doc_id,
                fileName=document.file_name,
                createdAt=document.created_at.isoformat() if document.created_at else None
            )
            chats.append(chat)

        return ChatsResponse(
            userId=user_id,
            chats=chats
        )


# Global instances (will be initialized on app startup)
_vector_store: Optional[WeaviateVectorStore] = None
_reranker: Optional[Reranker] = None


async def initialize_services(host: str = "localhost",
      port: int = 8080) -> None:
    """
    Initialize the global vector store and reranker instances.
    This should be called during FastAPI app startup.
    """
    global _vector_store, _reranker
    if _vector_store is None:
        _vector_store = await WeaviateVectorStore.create(host=host, port=port)
    if _reranker is None:
        _reranker = Reranker()


def get_chat_service() -> ChatService:
    """
    Dependency to get ChatService instance.
    """
    if _vector_store is None:
        raise RuntimeError(
            "Vector store not initialized. Call initialize_services() during app startup.")
    if _reranker is None:
        raise RuntimeError(
            "Reranker not initialized. Call initialize_services() during app startup.")
    return ChatService(_vector_store, _reranker)
