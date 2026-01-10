import pytest
from unittest.mock import AsyncMock, Mock, patch
from datetime import datetime, timezone

from doc_chat.rag.document_service import DocumentService
from doc_chat.models import Chat as ChatEntity


@pytest.fixture
def mock_vector_store() -> AsyncMock:
    """Create a mock vector store for testing."""
    vector_store = AsyncMock()
    vector_store.tenant_exists = AsyncMock(return_value=True)
    vector_store.create_tenant = AsyncMock()
    vector_store.create_chat = AsyncMock()
    vector_store.index_document = AsyncMock()
    vector_store.delete_chat_and_all_data = AsyncMock()
    return vector_store


@pytest.fixture
def document_service(mock_vector_store: AsyncMock) -> DocumentService:
    """Create a DocumentService instance with mocked dependencies."""
    return DocumentService(mock_vector_store)


@pytest.mark.asyncio
async def test_create_document_chat_new_tenant(
    document_service: DocumentService,
    mock_vector_store: AsyncMock
) -> None:
    """Test creating a document chat for a new tenant."""
    # Given
    user_id = "new_user"
    chat_id = "chat_456"
    file_path = "/tmp/test.pdf"
    file_name = "test.pdf"

    mock_vector_store.tenant_exists.return_value = False

    with patch('doc_chat.rag.document_service.DocumentLoader') as mock_loader_class:
        mock_loader = Mock()
        mock_loader_class.return_value = mock_loader

        mock_documents = [Mock(), Mock()]
        mock_splits = [
            Mock(page_content="Split 1", metadata={'page': 1}),
            Mock(page_content="Split 2", metadata={'page': 2}),
        ]
        mock_loader.load_and_split.return_value = (mock_documents, mock_splits)

        # When
        await document_service.create_document_chat(
            user_id,
            chat_id,
            file_path,
            file_name
        )

    # Then
    mock_vector_store.tenant_exists.assert_called_once_with(user_id)
    mock_vector_store.create_tenant.assert_called_once_with(user_id)
    mock_vector_store.create_chat.assert_called_once()
    mock_vector_store.index_document.assert_called_once()

    # Verify chat was created with correct data
    chat_call_args = mock_vector_store.create_chat.call_args
    assert chat_call_args[0][0] == user_id
    created_chat = chat_call_args[0][1]
    assert created_chat.chat_id == chat_id
    assert created_chat.user_id == user_id
    assert created_chat.name == file_name


@pytest.mark.asyncio
async def test_create_document_chat_existing_tenant(
    document_service: DocumentService,
    mock_vector_store: AsyncMock
) -> None:
    """Test creating a document chat for an existing tenant."""
    # Given
    user_id = "existing_user"
    chat_id = "chat_789"
    file_path = "/tmp/document.pdf"
    file_name = "document.pdf"

    mock_vector_store.tenant_exists.return_value = True

    with patch('doc_chat.rag.document_service.DocumentLoader') as mock_loader_class:
        mock_loader = Mock()
        mock_loader_class.return_value = mock_loader

        mock_documents = [Mock()]
        mock_splits = [
            Mock(page_content="Content", metadata={'page': 1}),
        ]
        mock_loader.load_and_split.return_value = (mock_documents, mock_splits)

        # When
        await document_service.create_document_chat(
            user_id,
            chat_id,
            file_path,
            file_name
        )

    # Then
    mock_vector_store.tenant_exists.assert_called_once_with(user_id)
    mock_vector_store.create_tenant.assert_not_called()  # Should not create tenant
    mock_vector_store.create_chat.assert_called_once()
    mock_vector_store.index_document.assert_called_once()


@pytest.mark.asyncio
async def test_create_document_chat_with_multiple_chunks(
    document_service: DocumentService,
    mock_vector_store: AsyncMock
) -> None:
    """Test that document chunks are correctly created and indexed."""
    # Given
    user_id = "user_123"
    chat_id = "chat_123"
    file_path = "/tmp/multi_page.pdf"
    file_name = "multi_page.pdf"

    with patch('doc_chat.rag.document_service.DocumentLoader') as mock_loader_class:
        mock_loader = Mock()
        mock_loader_class.return_value = mock_loader

        mock_documents = [Mock(), Mock(), Mock()]  # 3 pages
        mock_splits = [
            Mock(page_content="Page 1 content", metadata={'page': 1}),
            Mock(page_content="Page 2 content", metadata={'page': 2}),
            Mock(page_content="Page 3 content", metadata={'page': 3}),
        ]
        mock_loader.load_and_split.return_value = (mock_documents, mock_splits)

        # When
        await document_service.create_document_chat(
            user_id,
            chat_id,
            file_path,
            file_name
        )

    # Then
    index_call_args = mock_vector_store.index_document.call_args
    indexed_document = index_call_args[0][1]
    indexed_chunks = index_call_args[0][2]

    assert indexed_document.num_pages == 3
    assert len(indexed_chunks) == 3
    assert indexed_chunks[0].page_content == "Page 1 content"
    assert indexed_chunks[1].page_content == "Page 2 content"
    assert indexed_chunks[2].page_content == "Page 3 content"


@pytest.mark.asyncio
async def test_create_document_chat_without_file_name(
    document_service: DocumentService,
    mock_vector_store: AsyncMock
) -> None:
    """Test creating a document chat without providing a file name."""
    # Given
    user_id = "user_123"
    chat_id = "chat_123"
    file_path = "/tmp/test.pdf"

    with patch('doc_chat.rag.document_service.DocumentLoader') as mock_loader_class:
        mock_loader = Mock()
        mock_loader_class.return_value = mock_loader

        mock_documents = [Mock()]
        mock_splits = [Mock(page_content="Content", metadata={'page': 1})]
        mock_loader.load_and_split.return_value = (mock_documents, mock_splits)

        # When
        await document_service.create_document_chat(
            user_id,
            chat_id,
            file_path
        )

    # Then
    chat_call_args = mock_vector_store.create_chat.call_args
    created_chat = chat_call_args[0][1]
    assert created_chat.name == "Unknown"  # Default name


@pytest.mark.asyncio
async def test_delete_chat(
    document_service: DocumentService,
    mock_vector_store: AsyncMock
) -> None:
    """Test deleting a chat and all associated data."""
    # Given
    user_id = "user_123"
    chat_id = "chat_456"

    with patch('doc_chat.rag.document_service.delete_file') as mock_delete_file:
        # When
        await document_service.delete_chat(user_id, chat_id)

        # Then
        mock_vector_store.delete_chat_and_all_data.assert_called_once_with(
            user_id,
            chat_id
        )
        mock_delete_file.assert_called_once_with(user_id, chat_id)


@pytest.mark.asyncio
async def test_delete_chat_handles_missing_file(
    document_service: DocumentService,
    mock_vector_store: AsyncMock
) -> None:
    """Test that delete_chat doesn't fail if the file doesn't exist."""
    # Given
    user_id = "user_123"
    chat_id = "chat_999"

    with patch('doc_chat.rag.document_service.delete_file') as mock_delete_file:
        # File deletion doesn't raise an error (handled by delete_file util)
        mock_delete_file.return_value = None

        # When
        await document_service.delete_chat(user_id, chat_id)

        # Then
        mock_vector_store.delete_chat_and_all_data.assert_called_once()
        mock_delete_file.assert_called_once()
