from datetime import datetime, timezone
from unittest.mock import AsyncMock, Mock, patch

import pytest

from doc_chat.api_types import QueryResponse, ChatsResponse, Chat
from doc_chat.rag.chat_service import ChatService
from doc_chat.rag.weaviate_vector_store import DocumentChunk, Document, \
    Chat as ChatEntity


@pytest.fixture
def mock_vector_store() -> AsyncMock:
    """Create a mock WeaviateVectorStore."""
    vector_store = AsyncMock()
    vector_store.tenant_exists = AsyncMock(return_value=True)
    vector_store.create_tenant = AsyncMock()
    vector_store.create_chat = AsyncMock()
    vector_store.index_document = AsyncMock()
    vector_store.search_chunks = AsyncMock()
    vector_store.get_chat = AsyncMock()
    vector_store.get_chats = AsyncMock()
    vector_store.get_document = AsyncMock()
    vector_store.get_documents = AsyncMock()
    vector_store.get_documents_by_chat = AsyncMock()
    return vector_store


@pytest.fixture
def mock_reranker() -> Mock:
    """Create a mock Reranker."""
    reranker = Mock()
    reranker.rerank = Mock()
    return reranker


@pytest.fixture
def mock_citation_chain() -> Mock:
    """Create a mock CitationRetrievalChain."""
    chain = Mock()
    chain.invoke = Mock()
    return chain


@pytest.fixture
def chat_service(mock_vector_store: AsyncMock,
      mock_reranker: Mock) -> ChatService:
    """Create a ChatService instance with mocked dependencies."""
    with patch(
          'doc_chat.rag.chat_service.CitationRetrievalChain') as mock_chain_class:
        with patch('doc_chat.rag.chat_service.create_llm'):
            service = ChatService(mock_vector_store, mock_reranker)
            return service


@pytest.fixture
def sample_chunks() -> list[DocumentChunk]:
    """Create sample DocumentChunk objects for testing."""
    return [
        DocumentChunk(
            chunk_id="chunk_1",
            doc_id="doc_abc123",
            page_number=1,
            page_content="This is the first chunk about Python programming.",
            created_at=datetime.now(timezone.utc)
        ),
        DocumentChunk(
            chunk_id="chunk_2",
            doc_id="doc_abc123",
            page_number=2,
            page_content="This is the second chunk about FastAPI development.",
            created_at=datetime.now(timezone.utc)
        ),
        DocumentChunk(
            chunk_id="chunk_3",
            doc_id="doc_abc123",
            page_number=3,
            page_content="This is the third chunk about testing with pytest.",
            created_at=datetime.now(timezone.utc)
        ),
    ]


@pytest.fixture
def sample_document() -> Document:
    """Create a sample Document object for testing."""
    return Document(
        doc_id="doc_abc123",
        chat_id="chat_123",
        file_name="test_document.pdf",
        created_at=datetime.now(timezone.utc),
        num_pages=10
    )


@pytest.mark.asyncio
async def test_query_success(
      chat_service: ChatService,
      mock_vector_store: AsyncMock,
      mock_reranker: Mock,
      sample_chunks: list[DocumentChunk],
      sample_document: Document
) -> None:
    # Given
    user_id = "user_123"
    chat_id = "chat_123"
    question = "What is FastAPI?"

    # Mock get_documents_by_chat to return the document
    mock_vector_store.get_documents_by_chat.return_value = [sample_document]

    # Mock vector store search returning 20 chunks (we'll use 3 for simplicity)
    retrieved_chunks = sample_chunks * 7  # Simulate 21 chunks
    mock_vector_store.search_chunks.return_value = retrieved_chunks[:20]

    # Mock reranker returning top 5 reranked chunks
    reranked_chunks = sample_chunks[:3] + [sample_chunks[0], sample_chunks[1]]
    mock_reranker.rerank.return_value = reranked_chunks

    # Mock citation retrieval chain response
    chat_service._retrieval_chain.invoke.return_value = {
        'answer': 'FastAPI is a modern web framework. [TXT1][TXT2]',
        'source_documents': sample_chunks[:2]
    }

    # When
    result = await chat_service.query(user_id, chat_id, question)

    # Then
    assert isinstance(result, QueryResponse)
    assert result.question == question
    assert result.answer == 'FastAPI is a modern web framework. [TXT1][TXT2]'
    assert len(result.documents) == 2

    # Verify get_documents_by_chat was called
    mock_vector_store.get_documents_by_chat.assert_called_once_with(
        user_id, chat_id, limit=1
    )

    # Verify vector store was called with correct parameters (using doc_id)
    mock_vector_store.search_chunks.assert_called_once_with(
        user_id=user_id,
        doc_id=sample_document.doc_id,
        query=question,
        k=20
    )

    # Verify reranker was called with retrieved chunks
    mock_reranker.rerank.assert_called_once_with(
        query=question,
        documents=retrieved_chunks[:20]
    )

    # Verify retrieval chain was called with top 5 reranked chunks
    chat_service._retrieval_chain.invoke.assert_called_once_with(
        question,
        reranked_chunks[:5]
    )


@pytest.mark.asyncio
async def test_query_response_documents_mapping(
      chat_service: ChatService,
      mock_vector_store: AsyncMock,
      mock_reranker: Mock,
      sample_chunks: list[DocumentChunk],
      sample_document: Document
) -> None:
    """Test that DocumentChunks are correctly mapped to DocumentsResponse objects."""
    # Given
    user_id = "user_123"
    chat_id = "chat_123"
    question = "Test question"

    mock_vector_store.get_documents_by_chat.return_value = [sample_document]
    mock_vector_store.search_chunks.return_value = sample_chunks
    mock_reranker.rerank.return_value = sample_chunks

    source_docs = sample_chunks[:2]
    chat_service._retrieval_chain.invoke.return_value = {
        'answer': 'Test answer',
        'source_documents': source_docs
    }

    # When
    result = await chat_service.query(user_id, chat_id, question)

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


@pytest.mark.asyncio
async def test_query_empty_results(
      chat_service: ChatService,
      mock_vector_store: AsyncMock,
      mock_reranker: Mock,
      sample_document: Document
) -> None:
    """Test query when vector store returns no chunks."""
    # Given
    user_id = "user_123"
    chat_id = "chat_123"
    question = "Non-existent topic"

    mock_vector_store.get_documents_by_chat.return_value = [sample_document]
    mock_vector_store.search_chunks.return_value = []
    mock_reranker.rerank.return_value = []

    chat_service._retrieval_chain.invoke.return_value = {
        'answer': "I don't know",
        'source_documents': []
    }

    # When
    result = await chat_service.query(user_id, chat_id, question)

    # Then
    assert result.question == question
    assert result.answer == "I don't know"
    assert result.documents == []

    # Verify reranker was still called with empty list
    mock_reranker.rerank.assert_called_once_with(query=question, documents=[])

    # Verify retrieval chain was called with empty list
    chat_service._retrieval_chain.invoke.assert_called_once_with(question, [])


@pytest.mark.asyncio
async def test_query_no_documents_found(
      chat_service: ChatService,
      mock_vector_store: AsyncMock
) -> None:
    """Test query when no documents exist for the chat."""
    # Given
    user_id = "user_123"
    chat_id = "nonexistent_chat"
    question = "Test question"

    mock_vector_store.get_documents_by_chat.return_value = []

    # When/Then
    with pytest.raises(ValueError, match="No documents found for chat_id"):
        await chat_service.query(user_id, chat_id, question)


@pytest.mark.asyncio
async def test_find_chat_success(
      chat_service: ChatService,
      mock_vector_store: AsyncMock,
      sample_document: Document
) -> None:
    """Test finding a chat that exists."""
    # Given
    user_id = "user_123"
    chat_id = "chat_123"

    # Create a ChatEntity
    chat_entity = ChatEntity(
        chat_id=chat_id,
        user_id=user_id,
        created_at=datetime.now(timezone.utc)
    )

    mock_vector_store.get_chat.return_value = chat_entity
    mock_vector_store.get_documents_by_chat.return_value = [sample_document]

    # When
    result = await chat_service.find_chat(user_id, chat_id)

    # Then
    assert isinstance(result, Chat)
    assert result.chatId == chat_id
    assert result.fileName == sample_document.file_name
    assert result.createdAt == chat_entity.created_at.isoformat()

    # Verify vector store was called
    mock_vector_store.get_chat.assert_called_once_with(user_id, chat_id)
    mock_vector_store.get_documents_by_chat.assert_called_once_with(
        user_id, chat_id, limit=1
    )


@pytest.mark.asyncio
async def test_find_chat_not_found(
      chat_service: ChatService,
      mock_vector_store: AsyncMock
) -> None:
    """Test finding a chat that doesn't exist."""
    # Given
    user_id = "user_123"
    chat_id = "nonexistent_chat"
    mock_vector_store.get_chat.return_value = None

    # When
    result = await chat_service.find_chat(user_id, chat_id)

    # Then
    assert result is None
    mock_vector_store.get_chat.assert_called_once_with(user_id, chat_id)


@pytest.mark.asyncio
async def test_find_all_chats_success(
      chat_service: ChatService,
      mock_vector_store: AsyncMock
) -> None:
    """Test finding all chats for a user."""
    # Given
    user_id = "user_123"

    # Create chat entities
    chat_entities = [
        ChatEntity(
            chat_id="chat_1",
            user_id=user_id,
            created_at=datetime(2024, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        ),
        ChatEntity(
            chat_id="chat_2",
            user_id=user_id,
            created_at=datetime(2024, 1, 2, 12, 0, 0, tzinfo=timezone.utc)
        ),
        ChatEntity(
            chat_id="chat_3",
            user_id=user_id,
            created_at=datetime(2024, 1, 3, 12, 0, 0, tzinfo=timezone.utc)
        ),
    ]

    # Create documents
    documents = [
        Document(
            doc_id="doc_1",
            chat_id="chat_1",
            file_name="document1.pdf",
            created_at=datetime(2024, 1, 1, 12, 0, 0, tzinfo=timezone.utc),
            num_pages=5
        ),
        Document(
            doc_id="doc_2",
            chat_id="chat_2",
            file_name="document2.pdf",
            created_at=datetime(2024, 1, 2, 12, 0, 0, tzinfo=timezone.utc),
            num_pages=10
        ),
        Document(
            doc_id="doc_3",
            chat_id="chat_3",
            file_name="document3.pdf",
            created_at=datetime(2024, 1, 3, 12, 0, 0, tzinfo=timezone.utc),
            num_pages=15
        ),
    ]

    mock_vector_store.get_chats.return_value = chat_entities
    mock_vector_store.get_documents.return_value = documents

    # When
    result = await chat_service.find_all_chats(user_id)

    # Then
    assert isinstance(result, ChatsResponse)
    assert result.userId == user_id
    assert len(result.chats) == 3

    # Verify each chat is properly mapped
    for i, chat in enumerate(result.chats):
        assert chat.chatId == chat_entities[i].chat_id
        assert chat.fileName == documents[i].file_name
        assert chat.createdAt == chat_entities[i].created_at.isoformat()

    # Verify vector store was called
    mock_vector_store.get_chats.assert_called_once_with(user_id)
    mock_vector_store.get_documents.assert_called_once_with(user_id)


@pytest.mark.asyncio
async def test_find_all_chats_empty(
      chat_service: ChatService,
      mock_vector_store: AsyncMock
) -> None:
    """Test finding all chats when user has no chats."""
    # Given
    user_id = "user_123"
    mock_vector_store.get_chats.return_value = []
    mock_vector_store.get_documents.return_value = []

    # When
    result = await chat_service.find_all_chats(user_id)

    # Then
    assert isinstance(result, ChatsResponse)
    assert result.userId == user_id
    assert result.chats == []
    mock_vector_store.get_chats.assert_called_once_with(user_id)
    mock_vector_store.get_documents.assert_called_once_with(user_id)


@pytest.mark.asyncio
async def test_create_document_chat_new_tenant(
      chat_service: ChatService,
      mock_vector_store: AsyncMock
) -> None:
    """Test creating a document chat for a new tenant."""
    # Given
    user_id = "new_user"
    chat_id = "chat_456"
    file_path = "/tmp/test.pdf"
    file_name = "test.pdf"

    # Mock tenant doesn't exist
    mock_vector_store.tenant_exists.return_value = False

    # Mock document loader
    with patch('doc_chat.rag.chat_service.DocumentLoader') as mock_loader_class:
        mock_loader = Mock()
        mock_loader_class.return_value = mock_loader

        # Mock load_and_split returning documents and splits
        mock_documents = [Mock(), Mock()]  # 2 pages
        mock_splits = [
            Mock(page_content="Split 1", metadata={'page': 1}),
            Mock(page_content="Split 2", metadata={'page': 2}),
            Mock(page_content="Split 3", metadata={'page': 2}),
        ]
        mock_loader.load_and_split.return_value = (mock_documents, mock_splits)

        # When
        await chat_service.create_document_chat(user_id, chat_id, file_path,
                                                file_name)

    # Then
    # Verify tenant was checked and created
    mock_vector_store.tenant_exists.assert_called_once_with(user_id)
    mock_vector_store.create_tenant.assert_called_once_with(user_id)

    # Verify chat was created
    mock_vector_store.create_chat.assert_called_once()
    chat_arg = mock_vector_store.create_chat.call_args[0][1]
    assert chat_arg.chat_id == chat_id
    assert chat_arg.user_id == user_id

    # Verify document was indexed
    mock_vector_store.index_document.assert_called_once()
    call_args = mock_vector_store.index_document.call_args

    # Check the user_id argument
    assert call_args[0][0] == user_id

    # Check the document argument
    document_arg = call_args[0][1]
    # doc_id should be a UUID hex string, not chat_id
    assert document_arg.doc_id != chat_id
    assert len(document_arg.doc_id) == 32  # UUID hex is 32 chars
    assert document_arg.chat_id == chat_id
    assert document_arg.file_name == file_name
    assert document_arg.num_pages == 2

    # Check the chunks argument
    chunks_arg = call_args[0][2]
    assert len(chunks_arg) == 3
    # All chunks should have the same doc_id (the UUID)
    assert all(chunk.doc_id == document_arg.doc_id for chunk in chunks_arg)
    assert chunks_arg[0].chunk_id == "chunk_0"
    assert chunks_arg[1].chunk_id == "chunk_1"
    assert chunks_arg[2].chunk_id == "chunk_2"


@pytest.mark.asyncio
async def test_create_document_chat_existing_tenant(
      chat_service: ChatService,
      mock_vector_store: AsyncMock
) -> None:
    """Test creating a document chat for an existing tenant."""
    # Given
    user_id = "existing_user"
    chat_id = "chat_789"
    file_path = "/tmp/test2.pdf"

    # Mock tenant already exists
    mock_vector_store.tenant_exists.return_value = True

    # Mock document loader
    with patch('doc_chat.rag.chat_service.DocumentLoader') as mock_loader_class:
        mock_loader = Mock()
        mock_loader_class.return_value = mock_loader

        mock_documents = [Mock()]  # 1 page
        mock_splits = [Mock(page_content="Split 1", metadata={'page': 1})]
        mock_loader.load_and_split.return_value = (mock_documents, mock_splits)

        # When
        await chat_service.create_document_chat(user_id, chat_id, file_path)

    # Then
    # Verify tenant was checked but not created
    mock_vector_store.tenant_exists.assert_called_once_with(user_id)
    mock_vector_store.create_tenant.assert_not_called()

    # Verify chat was created
    mock_vector_store.create_chat.assert_called_once()

    # Verify document was still indexed
    mock_vector_store.index_document.assert_called_once()


@pytest.mark.asyncio
async def test_create_document_chat_no_file_name(
      chat_service: ChatService,
      mock_vector_store: AsyncMock
) -> None:
    """Test creating a document chat without providing a file name."""
    # Given
    user_id = "user_123"
    chat_id = "chat_999"
    file_path = "/tmp/test.pdf"

    mock_vector_store.tenant_exists.return_value = True

    # Mock document loader
    with patch('doc_chat.rag.chat_service.DocumentLoader') as mock_loader_class:
        mock_loader = Mock()
        mock_loader_class.return_value = mock_loader

        mock_documents = [Mock()]
        mock_splits = [Mock(page_content="Split 1", metadata={'page': 1})]
        mock_loader.load_and_split.return_value = (mock_documents, mock_splits)

        # When - not providing file_name
        await chat_service.create_document_chat(user_id, chat_id, file_path)

    # Then
    # Verify chat was created
    mock_vector_store.create_chat.assert_called_once()

    # Verify document was indexed with "Unknown" as file_name
    call_args = mock_vector_store.index_document.call_args
    document_arg = call_args[0][1]
    assert document_arg.file_name == "Unknown"
