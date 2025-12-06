import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from .citation_retrieval_chain import CitationRetrievalChain
from .document_loader import DocumentLoader
from .reranker import Reranker
from .weaviate_vector_store import WeaviateVectorStore, Document, DocumentChunk, \
    Chat as ChatEntity, Message
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
        - A Chat represents a conversation
        - A Document represents a single PDF file
        - DocumentChunks represent text splits
        """
        doc_loader = DocumentLoader(file_path)
        documents, splits = doc_loader.load_and_split()

        # Ensure tenant exists for user
        if not await self._vector_store.tenant_exists(user_id):
            logger.info(f"Creating new tenant for user: {user_id}")
            await self._vector_store.create_tenant(user_id)

        # Create Chat entity
        created_at = datetime.now(timezone.utc)
        chat = ChatEntity(
            chat_id=chat_id,
            user_id=user_id,
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

    async def query(self, user_id: str, chat_id: str,
          question: str) -> QueryResponse:
        """
        Query the document using semantic search.

        In Weaviate:
        - We search chunks (text splits) within a specific document (PDF)
        """

        # Get documents for this chat to find the doc_id
        documents = await self._vector_store.get_documents_by_chat(user_id,
                                                                   chat_id,
                                                                   limit=1)
        if not documents:
            raise ValueError(f"No documents found for chat_id {chat_id}")

        # At the moment we assume one document per chat
        doc_id = documents[0].doc_id

        await self._add_message(user_id, chat_id, question, is_user=True)
        response = await self._retrieve_and_rerank_chunks(chat_id, doc_id,
                                                          question,
                                                          user_id)
        response_documents = [
            DocumentsResponse(id=chunk.chunk_id,
                              page=chunk.page_number,
                              content=chunk.page_content)
            for chunk in response['source_documents']
        ]
        answer = response['answer']
        await self._add_message(user_id, chat_id, answer, is_user=False)

        return QueryResponse(
            question=question,
            answer=answer,
            documents=response_documents
        )

    async def _retrieve_and_rerank_chunks(self, chat_id, doc_id, question,
          user_id):
        # Retrieve the top 20 chunks from the vector store
        retrieved_chunks = await self._vector_store.search_chunks(
            user_id=user_id,
            doc_id=doc_id,
            query=question,
            k=20
        )
        # Rerank the retrieved chunks
        ranked_chunks = self._reranker.rerank(query=question,
                                              documents=retrieved_chunks)

        # Invoke the retrieval chain with the top 5 ranked chunks
        return self._retrieval_chain.invoke(question, ranked_chunks[:5])

    async def _add_message(self, user_id: str, chat_id: str,
          content: str, is_user: bool) -> None:
        message = Message(
            role="user" if is_user else "assistant",
            content=content,
            timestamp=datetime.now(timezone.utc)
        )
        await self._vector_store.add_message(user_id, chat_id, message)

    async def find_chat(self, user_id: str, chat_id: str) -> Optional[Chat]:
        """
        Find a chat by retrieving the chat and its document metadata.

        In Weaviate:
        - A Chat represents a conversation
        - Documents are linked to the chat
        """
        chat_entity = await self._vector_store.get_chat(user_id, chat_id)
        if not chat_entity:
            return None

        # Get the first document for this chat to retrieve the file name
        documents = await self._vector_store.get_documents_by_chat(user_id,
                                                                   chat_id,
                                                                   limit=1)
        file_name = documents[0].file_name if documents else "Unknown"

        return Chat(
            chatId=chat_id,
            fileName=file_name,
            createdAt=chat_entity.created_at.isoformat() if chat_entity.created_at else None
        )

    async def find_all_chats(self, user_id: str) -> ChatsResponse:
        """
        Find all chats for a user.

        In Weaviate:
        - Each Chat represents a conversation
        - Documents are linked to chats
        """
        # Fetch all chats and all documents in parallel
        chat_entities = await self._vector_store.get_chats(user_id)
        all_documents = await self._vector_store.get_documents(user_id)

        # Group documents by chat_id for efficient lookup
        documents_by_chat = {}
        for doc in all_documents:
            if doc.chat_id not in documents_by_chat:
                documents_by_chat[doc.chat_id] = doc

        # Build chat responses
        chats = []
        for chat_entity in chat_entities:
            doc = documents_by_chat.get(chat_entity.chat_id)
            file_name = doc.file_name if doc else "Unknown"

            chat = Chat(
                chatId=chat_entity.chat_id,
                fileName=file_name,
                createdAt=chat_entity.created_at.isoformat() if chat_entity.created_at else None
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
