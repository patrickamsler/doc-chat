import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from .citation_retrieval_chain import CitationRetrievalChain
from .document_loader import DocumentLoader
from .query_rewriter import QueryRewriter
from .reranker import Reranker
from .weaviate_vector_store import WeaviateVectorStore
from ..api_types import QueryResponse, ChatsResponse, Chat, DocumentsResponse, \
    ChatHistoryResponse, Message as MessageResponse
from ..llm import create_llm
from ..models import Document, DocumentChunk, Chat as ChatEntity, Message

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self, vector_store: WeaviateVectorStore, reranker: Reranker):
        self._vector_store = vector_store
        self._reranker = reranker
        llm = create_llm()
        self._retrieval_chain = CitationRetrievalChain(llm=llm)
        self._query_rewriter = QueryRewriter(llm=llm)

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

    async def query(self, user_id: str, chat_id: str,
          query: str) -> QueryResponse:
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

        rewritten_query = await self._rewrite_query(chat_id, query, user_id)
        logger.info(
            "original_query=%s, rewritten_query=%s",
            query, rewritten_query
        )

        # Store the original query in history
        await self._add_message(user_id, chat_id, query, is_user=True)

        # Use rewritten query for retrieval
        response = await self._retrieve_and_rerank_chunks(chat_id, doc_id,
                                                          rewritten_query,
                                                          user_id)
        response_documents = [
            DocumentsResponse(id=chunk.chunk_id,
                              page=chunk.page_number,
                              content=chunk.page_content)
            for chunk in response['source_documents']
        ]
        answer = response['answer']
        # Extract chunk IDs for referencing
        chunk_ids = [chunk.chunk_id for chunk in response['source_documents']]
        await self._add_message(user_id, chat_id, answer, is_user=False,
                                chunk_ids=chunk_ids)

        return QueryResponse(
            question=query,
            answer=answer,
            documents=response_documents
        )

    async def _rewrite_query(self, chat_id: str, query: str, user_id: str,
          history_turns=4) -> str:
        max_messages = history_turns * 2
        history = await self._vector_store.get_chat_history(
            user_id,
            chat_id,
            limit=max_messages
        )

        messages = []
        if history and history.messages:
            messages = history.messages

        # Rewrite query using conversation history
        return self._query_rewriter.rewrite(query, messages)

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
          content: str, is_user: bool, chunk_ids: list[str] = None) -> None:
        message = Message(
            role="user" if is_user else "assistant",
            content=content,
            timestamp=datetime.now(timezone.utc)
        )
        await self._vector_store.add_message(user_id, chat_id, message,
                                             chunk_ids=chunk_ids)

    async def find_chat(self, user_id: str, chat_id: str) -> Optional[Chat]:
        """
        Find a chat by its chat_id.

        In Weaviate:
        - A Chat represents a conversation
        - The file name is stored in the Chat.name field
        """
        chat_entity = await self._vector_store.get_chat(user_id, chat_id)
        if not chat_entity:
            return None

        return Chat(
            chatId=chat_id,
            fileName=chat_entity.name,
            createdAt=chat_entity.created_at.isoformat() if chat_entity.created_at else None
        )

    async def find_all_chats(self, user_id: str) -> ChatsResponse:
        """
        Find all chats for a user.

        In Weaviate:
        - Each Chat represents a conversation
        - The file name is stored in the Chat.name field
        """
        # Fetch all chats
        chat_entities = await self._vector_store.get_chats(user_id)

        # Build chat responses
        chats = []
        for chat_entity in chat_entities:
            chat = Chat(
                chatId=chat_entity.chat_id,
                fileName=chat_entity.name or "Untitled",
                createdAt=chat_entity.created_at.isoformat() if chat_entity.created_at else None
            )
            chats.append(chat)

        return ChatsResponse(
            userId=user_id,
            chats=chats
        )

    async def get_chat_history(self, user_id: str,
          chat_id: str) -> ChatHistoryResponse:
        """
        Get chat history for a specific chat.

        Args:
            user_id: The user ID
            chat_id: The chat ID to retrieve history for

        Returns:
            ChatHistoryResponse with all messages in the chat

        Raises:
            ValueError: If chat not found
        """
        chat_history = await self._vector_store.get_chat_history(
            user_id,
            chat_id,
            include_chunks=True
        )
        if not chat_history:
            raise ValueError(f"Chat with chat_id {chat_id} not found")

        # Convert Message entities to MessageResponse (API types)
        messages = [
            MessageResponse(
                role=msg.role,
                content=msg.content,
                timestamp=msg.timestamp.isoformat() if msg.timestamp else "",
                documents=[
                    DocumentsResponse(
                        id=chunk.chunk_id,
                        page=chunk.page_number,
                        content=chunk.page_content
                    )
                    for chunk in msg.chunks
                ] if msg.chunks else []
            )
            for msg in chat_history.messages
        ]

        return ChatHistoryResponse(
            chatId=chat_id,
            history=messages
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
