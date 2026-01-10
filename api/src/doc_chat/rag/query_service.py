import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from .citation_retrieval_chain import CitationRetrievalChain
from .query_rewriter import QueryRewriter
from .reranker import Reranker
from .weaviate_vector_store import WeaviateVectorStore
from ..api_types import QueryResponse, DocumentsResponse
from ..llm import create_llm
from ..models import Message

logger = logging.getLogger(__name__)


class QueryService:
    """Service for handling query operations and RAG pipeline."""

    def __init__(self, vector_store: WeaviateVectorStore, reranker: Reranker):
        self._vector_store = vector_store
        self._reranker = reranker
        llm = create_llm()
        self._retrieval_chain = CitationRetrievalChain(llm=llm)
        self._query_rewriter = QueryRewriter(llm=llm)

    async def query(
          self,
          user_id: str,
          chat_id: str,
          query: str
    ) -> QueryResponse:
        """
        Query the document using semantic search.

        In Weaviate:
        - We search chunks (text splits) within a specific document (PDF)

        Args:
            user_id: The user ID
            chat_id: The chat ID to query
            query: The user's question

        Returns:
            QueryResponse with answer and source documents

        Raises:
            ValueError: If no documents found for chat_id
        """
        # Get documents for this chat to find the doc_id
        documents = await self._vector_store.get_documents_by_chat(
            user_id,
            chat_id,
            limit=1
        )
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
        await self._add_message(user_id, chat_id, doc_id, query, is_user=True)

        # Use rewritten query for retrieval
        response = await self._retrieve_and_rerank_chunks(
            doc_id,
            rewritten_query,
            user_id
        )
        response_documents = [
            DocumentsResponse(
                id=chunk.chunk_id,
                page=chunk.page_number,
                content=chunk.page_content
            )
            for chunk in response['source_documents']
        ]
        answer = response['answer']

        # Extract chunk IDs for referencing
        chunk_ids = [chunk.chunk_id for chunk in response['source_documents']]
        await self._add_message(
            user_id,
            chat_id,
            doc_id,
            answer,
            is_user=False,
            chunk_ids=chunk_ids
        )

        return QueryResponse(
            question=query,
            answer=answer,
            documents=response_documents
        )

    async def _rewrite_query(
          self,
          chat_id: str,
          query: str,
          user_id: str,
          history_turns: int = 4
    ) -> str:
        """
        Rewrite query using conversation history for context.

        Args:
            chat_id: The chat ID
            query: The original query
            user_id: The user ID
            history_turns: Number of conversation turns to include

        Returns:
            Rewritten query with context
        """
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

    async def _retrieve_and_rerank_chunks(
          self,
          doc_id: str,
          question: str,
          user_id: str
    ) -> Dict[str, Any]:
        # Retrieve the top 20 chunks from the vector store
        retrieved_chunks = await self._vector_store.search_chunks(
            user_id=user_id,
            doc_id=doc_id,
            query=question,
            k=20
        )

        # Rerank the retrieved chunks
        ranked_chunks = self._reranker.rerank(
            query=question,
            documents=retrieved_chunks
        )

        # Invoke the retrieval chain with the top 5 ranked chunks
        return self._retrieval_chain.invoke(question, ranked_chunks[:5])

    async def _add_message(
          self,
          user_id: str,
          chat_id: str,
          doc_id: str,
          content: str,
          is_user: bool,
          chunk_ids: list[str] = None
    ) -> None:
        message = Message(
            role="user" if is_user else "assistant",
            content=content,
            timestamp=datetime.now(timezone.utc)
        )
        await self._vector_store.add_message(
            user_id,
            chat_id,
            doc_id,
            message,
            chunk_ids=chunk_ids
        )


# Global instances (will be initialized on app startup by service_initialization)
_vector_store: Optional[WeaviateVectorStore] = None
_reranker: Optional[Reranker] = None


def get_query_service() -> QueryService:
    """
    Dependency to get QueryService instance.
    """
    from .service_initialization import get_vector_store, get_reranker
    return QueryService(get_vector_store(), get_reranker())
