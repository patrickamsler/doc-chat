import pytest
from unittest.mock import AsyncMock, Mock, patch
from datetime import datetime, timezone

from doc_chat.services.query_service import QueryService
from doc_chat.core.models import DocumentChunk, Document, ChatHistory, Message
from doc_chat.api.schemas import QueryResponse


@pytest.fixture
def mock_vector_store() -> AsyncMock:
    """Create a mock vector store for testing."""
    vector_store = AsyncMock()
    vector_store.get_documents_by_chat = AsyncMock()
    vector_store.search_chunks = AsyncMock()
    vector_store.add_message = AsyncMock()
    vector_store.get_chat_history = AsyncMock()
    return vector_store


@pytest.fixture
def mock_reranker() -> Mock:
    """Create a mock reranker for testing."""
    reranker = Mock()
    reranker.rerank = Mock()
    return reranker


@pytest.fixture
def query_service(
    mock_vector_store: AsyncMock,
    mock_reranker: Mock
) -> QueryService:
    """Create a QueryService instance with mocked dependencies."""
    with patch('doc_chat.services.query_service.CitationRetrievalChain'):
        with patch('doc_chat.services.query_service.create_llm'):
            with patch('doc_chat.services.query_service.QueryRewriter') as mock_query_rewriter_class:
                service = QueryService(mock_vector_store, mock_reranker)
                # Mock the rewrite method to return the original query by default
                service._query_rewriter.rewrite = Mock(side_effect=lambda q, h: q)
                return service


@pytest.mark.asyncio
async def test_query_success(
    query_service: QueryService,
    mock_vector_store: AsyncMock,
    mock_reranker: Mock
) -> None:
    """Test successful query processing."""
    # Given
    user_id = "user_123"
    chat_id = "chat_123"
    question = "What is FastAPI?"

    sample_document = Document(
        doc_id="doc_abc123",
        chat_id=chat_id,
        file_name="test.pdf",
        created_at=datetime.now(timezone.utc),
        num_pages=10
    )

    sample_chunks = [
        DocumentChunk(
            chunk_id="chunk_1",
            doc_id="doc_abc123",
            page_number=1,
            page_content="FastAPI is a modern web framework.",
            created_at=datetime.now(timezone.utc)
        )
    ]

    mock_vector_store.get_documents_by_chat.return_value = [sample_document]
    mock_vector_store.get_chat_history.return_value = ChatHistory(
        chat_id=chat_id,
        user_id=user_id,
        messages=[],
        created_at=datetime.now(timezone.utc)
    )
    mock_vector_store.search_chunks.return_value = sample_chunks
    mock_reranker.rerank.return_value = sample_chunks

    query_service._retrieval_chain.invoke.return_value = {
        'answer': 'FastAPI is a modern web framework.',
        'source_documents': sample_chunks
    }

    # When
    result = await query_service.query(user_id, chat_id, question)

    # Then
    assert isinstance(result, QueryResponse)
    assert result.question == question
    assert result.answer == 'FastAPI is a modern web framework.'
    assert len(result.documents) == 1
    assert result.documents[0].page == 1

    # Verify message storage: user query + assistant answer
    assert mock_vector_store.add_message.call_count == 2


@pytest.mark.asyncio
async def test_query_no_documents_found(
    query_service: QueryService,
    mock_vector_store: AsyncMock
) -> None:
    """Test query when no documents exist for the chat."""
    # Given
    user_id = "user_123"
    chat_id = "nonexistent_chat"
    question = "What is FastAPI?"

    mock_vector_store.get_documents_by_chat.return_value = []

    # When/Then
    with pytest.raises(ValueError, match="No documents found"):
        await query_service.query(user_id, chat_id, question)


@pytest.mark.asyncio
async def test_query_with_multiple_chunks(
    query_service: QueryService,
    mock_vector_store: AsyncMock,
    mock_reranker: Mock
) -> None:
    """Test query returns multiple relevant chunks."""
    # Given
    user_id = "user_123"
    chat_id = "chat_123"
    question = "Tell me about Python"

    sample_document = Document(
        doc_id="doc_xyz",
        chat_id=chat_id,
        file_name="python_guide.pdf",
        created_at=datetime.now(timezone.utc),
        num_pages=50
    )

    sample_chunks = [
        DocumentChunk(
            chunk_id=f"chunk_{i}",
            doc_id="doc_xyz",
            page_number=i + 1,
            page_content=f"Python content {i}",
            created_at=datetime.now(timezone.utc)
        )
        for i in range(5)
    ]

    mock_vector_store.get_documents_by_chat.return_value = [sample_document]
    mock_vector_store.get_chat_history.return_value = ChatHistory(
        chat_id=chat_id,
        user_id=user_id,
        messages=[],
        created_at=datetime.now(timezone.utc)
    )
    mock_vector_store.search_chunks.return_value = sample_chunks
    mock_reranker.rerank.return_value = sample_chunks

    query_service._retrieval_chain.invoke.return_value = {
        'answer': 'Python is a programming language.',
        'source_documents': sample_chunks
    }

    # When
    result = await query_service.query(user_id, chat_id, question)

    # Then
    assert len(result.documents) == 5
    assert all(doc.page == i + 1 for i, doc in enumerate(result.documents))


@pytest.mark.asyncio
async def test_rewrite_query_with_history(
    query_service: QueryService,
    mock_vector_store: AsyncMock
) -> None:
    """Test query rewriting with conversation history."""
    # Given
    chat_id = "chat_123"
    query = "What about its performance?"
    user_id = "user_123"

    history_messages = [
        Message(
            role="user",
            content="Tell me about FastAPI",
            timestamp=datetime.now(timezone.utc)
        ),
        Message(
            role="assistant",
            content="FastAPI is a modern web framework",
            timestamp=datetime.now(timezone.utc)
        ),
    ]

    chat_history = ChatHistory(
        chat_id=chat_id,
        user_id=user_id,
        messages=history_messages,
        created_at=datetime.now(timezone.utc)
    )

    mock_vector_store.get_chat_history.return_value = chat_history

    # Mock the query rewriter to return a rewritten query
    query_service._query_rewriter.rewrite = Mock(
        return_value="What about FastAPI's performance?"
    )

    # When
    rewritten = await query_service._rewrite_query(chat_id, query, user_id)

    # Then
    assert rewritten == "What about FastAPI's performance?"
    query_service._query_rewriter.rewrite.assert_called_once()
    call_args = query_service._query_rewriter.rewrite.call_args
    assert call_args[0][0] == query  # Original query
    assert call_args[0][1] == history_messages  # History


@pytest.mark.asyncio
async def test_rewrite_query_without_history(
    query_service: QueryService,
    mock_vector_store: AsyncMock
) -> None:
    """Test query rewriting when there's no conversation history."""
    # Given
    chat_id = "new_chat"
    query = "What is Python?"
    user_id = "user_123"

    chat_history = ChatHistory(
        chat_id=chat_id,
        user_id=user_id,
        messages=[],  # Empty history
        created_at=datetime.now(timezone.utc)
    )

    mock_vector_store.get_chat_history.return_value = chat_history

    # When
    rewritten = await query_service._rewrite_query(chat_id, query, user_id)

    # Then
    # Should return original query when no history
    assert rewritten == query
    query_service._query_rewriter.rewrite.assert_called_once_with(query, [])


@pytest.mark.asyncio
async def test_retrieve_and_rerank_chunks(
    query_service: QueryService,
    mock_vector_store: AsyncMock,
    mock_reranker: Mock
) -> None:
    """Test chunk retrieval and reranking."""
    # Given
    doc_id = "doc_123"
    question = "What is the answer?"
    user_id = "user_123"

    retrieved_chunks = [
        DocumentChunk(
            chunk_id=f"chunk_{i}",
            doc_id=doc_id,
            page_number=i,
            page_content=f"Content {i}",
            created_at=datetime.now(timezone.utc)
        )
        for i in range(20)
    ]

    ranked_chunks = retrieved_chunks[:5]  # Top 5 after reranking

    mock_vector_store.search_chunks.return_value = retrieved_chunks
    mock_reranker.rerank.return_value = ranked_chunks

    expected_response = {
        'answer': 'The answer is 42',
        'source_documents': ranked_chunks
    }
    query_service._retrieval_chain.invoke.return_value = expected_response

    # When
    result = await query_service._retrieve_and_rerank_chunks(
        doc_id,
        question,
        user_id
    )

    # Then
    assert result == expected_response
    mock_vector_store.search_chunks.assert_called_once_with(
        user_id=user_id,
        doc_id=doc_id,
        query=question,
        k=20
    )
    mock_reranker.rerank.assert_called_once_with(
        query=question,
        documents=retrieved_chunks
    )
    query_service._retrieval_chain.invoke.assert_called_once_with(
        question,
        ranked_chunks
    )


@pytest.mark.asyncio
async def test_add_message_user(
    query_service: QueryService,
    mock_vector_store: AsyncMock
) -> None:
    """Test adding a user message."""
    # Given
    user_id = "user_123"
    chat_id = "chat_123"
    doc_id = "doc_123"
    content = "What is Python?"

    # When
    await query_service._add_message(
        user_id,
        chat_id,
        doc_id,
        content,
        is_user=True
    )

    # Then
    mock_vector_store.add_message.assert_called_once()
    call_args = mock_vector_store.add_message.call_args
    assert call_args[0][0] == user_id
    assert call_args[0][1] == chat_id
    assert call_args[0][2] == doc_id

    message = call_args[0][3]
    assert message.role == "user"
    assert message.content == content
    assert call_args[1]['chunk_ids'] is None


@pytest.mark.asyncio
async def test_add_message_assistant_with_chunks(
    query_service: QueryService,
    mock_vector_store: AsyncMock
) -> None:
    """Test adding an assistant message with chunk references."""
    # Given
    user_id = "user_123"
    chat_id = "chat_123"
    doc_id = "doc_123"
    content = "Python is a programming language."
    chunk_ids = ["chunk_1", "chunk_2", "chunk_3"]

    # When
    await query_service._add_message(
        user_id,
        chat_id,
        doc_id,
        content,
        is_user=False,
        chunk_ids=chunk_ids
    )

    # Then
    mock_vector_store.add_message.assert_called_once()
    call_args = mock_vector_store.add_message.call_args

    message = call_args[0][3]
    assert message.role == "assistant"
    assert message.content == content
    assert call_args[1]['chunk_ids'] == chunk_ids


@pytest.mark.asyncio
async def test_query_response_documents_mapping(
    query_service: QueryService,
    mock_vector_store: AsyncMock,
    mock_reranker: Mock
) -> None:
    """Test that DocumentChunks are correctly mapped to DocumentsResponse objects."""
    # Given
    user_id = "user_123"
    chat_id = "chat_123"
    question = "Test question"

    sample_document = Document(
        doc_id="doc_abc123",
        chat_id=chat_id,
        file_name="test.pdf",
        created_at=datetime.now(timezone.utc),
        num_pages=10
    )

    sample_chunks = [
        DocumentChunk(
            chunk_id="chunk_1",
            doc_id="doc_abc123",
            page_number=1,
            page_content="First chunk content",
            created_at=datetime.now(timezone.utc)
        ),
        DocumentChunk(
            chunk_id="chunk_2",
            doc_id="doc_abc123",
            page_number=2,
            page_content="Second chunk content",
            created_at=datetime.now(timezone.utc)
        ),
    ]

    mock_vector_store.get_documents_by_chat.return_value = [sample_document]
    mock_vector_store.get_chat_history.return_value = ChatHistory(
        chat_id=chat_id,
        user_id=user_id,
        messages=[],
        created_at=datetime.now(timezone.utc)
    )
    mock_vector_store.search_chunks.return_value = sample_chunks
    mock_reranker.rerank.return_value = sample_chunks

    source_docs = sample_chunks[:2]
    query_service._retrieval_chain.invoke.return_value = {
        'answer': 'Test answer',
        'source_documents': source_docs
    }

    # When
    result = await query_service.query(user_id, chat_id, question)

    # Then
    assert len(result.documents) == 2

    # Verify first document mapping
    assert result.documents[0].id == source_docs[0].chunk_id
    assert result.documents[0].page == source_docs[0].page_number
    assert result.documents[0].content == source_docs[0].page_content

    # Verify second document mapping
    assert result.documents[1].id == source_docs[1].chunk_id
    assert result.documents[1].page == source_docs[1].page_number
    assert result.documents[1].content == source_docs[1].page_content

    # Verify messages were stored
    assert mock_vector_store.add_message.call_count == 2


@pytest.mark.asyncio
async def test_query_empty_results(
    query_service: QueryService,
    mock_vector_store: AsyncMock,
    mock_reranker: Mock
) -> None:
    """Test query when vector store returns no chunks."""
    # Given
    user_id = "user_123"
    chat_id = "chat_123"
    question = "Non-existent topic"

    sample_document = Document(
        doc_id="doc_abc123",
        chat_id=chat_id,
        file_name="test.pdf",
        created_at=datetime.now(timezone.utc),
        num_pages=10
    )

    mock_vector_store.get_documents_by_chat.return_value = [sample_document]
    mock_vector_store.get_chat_history.return_value = ChatHistory(
        chat_id=chat_id,
        user_id=user_id,
        messages=[],
        created_at=datetime.now(timezone.utc)
    )
    mock_vector_store.search_chunks.return_value = []
    mock_reranker.rerank.return_value = []

    query_service._retrieval_chain.invoke.return_value = {
        'answer': "I don't know",
        'source_documents': []
    }

    # When
    result = await query_service.query(user_id, chat_id, question)

    # Then
    assert result.question == question
    assert result.answer == "I don't know"
    assert result.documents == []

    # Verify reranker was still called with empty list
    mock_reranker.rerank.assert_called_once_with(query=question, documents=[])

    # Verify retrieval chain was called with empty list
    query_service._retrieval_chain.invoke.assert_called_once_with(question, [])

    # Verify messages were stored even with empty results
    assert mock_vector_store.add_message.call_count == 2
