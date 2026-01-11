from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest

from doc_chat.api.schemas import Chat, ChatsResponse, ChatHistoryResponse
from doc_chat.core.models import Chat as ChatEntity, ChatHistory, Message, \
    DocumentChunk
from doc_chat.services.chat_management_service import ChatManagementService


@pytest.fixture
def mock_vector_store() -> AsyncMock:
    """Create a mock vector store for testing."""
    vector_store = AsyncMock()
    vector_store.tenant_exists = AsyncMock(return_value=True)
    vector_store.get_chat = AsyncMock()
    vector_store.get_chats = AsyncMock()
    vector_store.get_chat_history = AsyncMock()
    vector_store.delete_chat_messages = AsyncMock()
    return vector_store


@pytest.fixture
def chat_management_service(
      mock_vector_store: AsyncMock) -> ChatManagementService:
    """Create a ChatManagementService instance with mocked dependencies."""
    return ChatManagementService(mock_vector_store)


@pytest.mark.asyncio
async def test_find_chat_success(
      chat_management_service: ChatManagementService,
      mock_vector_store: AsyncMock
) -> None:
    """Test finding a chat successfully."""
    # Given
    user_id = "user_123"
    chat_id = "chat_123"

    chat_entity = ChatEntity(
        chat_id=chat_id,
        user_id=user_id,
        name="test_document.pdf",
        created_at=datetime(2024, 1, 15, 12, 0, 0, tzinfo=timezone.utc)
    )

    mock_vector_store.get_chat.return_value = chat_entity

    # When
    result = await chat_management_service.find_chat(user_id, chat_id)

    # Then
    assert isinstance(result, Chat)
    assert result.chatId == chat_id
    assert result.fileName == "test_document.pdf"
    assert result.createdAt == "2024-01-15T12:00:00+00:00"
    mock_vector_store.get_chat.assert_called_once_with(user_id, chat_id)


@pytest.mark.asyncio
async def test_find_chat_not_found(
      chat_management_service: ChatManagementService,
      mock_vector_store: AsyncMock
) -> None:
    """Test finding a chat that doesn't exist."""
    # Given
    user_id = "user_123"
    chat_id = "nonexistent_chat"

    mock_vector_store.get_chat.return_value = None

    # When
    result = await chat_management_service.find_chat(user_id, chat_id)

    # Then
    assert result is None
    mock_vector_store.get_chat.assert_called_once_with(user_id, chat_id)


@pytest.mark.asyncio
async def test_find_all_chats_success(
      chat_management_service: ChatManagementService,
      mock_vector_store: AsyncMock
) -> None:
    """Test finding all chats for a user."""
    # Given
    user_id = "user_123"

    chat_entities = [
        ChatEntity(
            chat_id="chat_1",
            user_id=user_id,
            name="document1.pdf",
            created_at=datetime(2024, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        ),
        ChatEntity(
            chat_id="chat_2",
            user_id=user_id,
            name="document2.pdf",
            created_at=datetime(2024, 1, 2, 12, 0, 0, tzinfo=timezone.utc)
        ),
    ]

    mock_vector_store.get_chats.return_value = chat_entities

    # When
    result = await chat_management_service.find_all_chats(user_id)

    # Then
    assert isinstance(result, ChatsResponse)
    assert result.userId == user_id
    assert len(result.chats) == 2
    assert result.chats[0].chatId == "chat_1"
    assert result.chats[0].fileName == "document1.pdf"
    assert result.chats[1].chatId == "chat_2"
    assert result.chats[1].fileName == "document2.pdf"
    mock_vector_store.get_chats.assert_called_once_with(user_id)


@pytest.mark.asyncio
async def test_find_all_chats_empty(
      chat_management_service: ChatManagementService,
      mock_vector_store: AsyncMock
) -> None:
    """Test finding all chats when user has no chats."""
    # Given
    user_id = "user_123"

    mock_vector_store.get_chats.return_value = []

    # When
    result = await chat_management_service.find_all_chats(user_id)

    # Then
    assert isinstance(result, ChatsResponse)
    assert result.userId == user_id
    assert len(result.chats) == 0


@pytest.mark.asyncio
async def test_find_all_chats_tenant_does_not_exist(
      chat_management_service: ChatManagementService,
      mock_vector_store: AsyncMock
) -> None:
    """Test finding all chats when tenant doesn't exist."""
    # Given
    user_id = "new_user"

    mock_vector_store.tenant_exists.return_value = False

    # When
    result = await chat_management_service.find_all_chats(user_id)

    # Then
    assert isinstance(result, ChatsResponse)
    assert result.userId == user_id
    assert len(result.chats) == 0
    mock_vector_store.tenant_exists.assert_called_once_with(user_id)
    mock_vector_store.get_chats.assert_not_called()


@pytest.mark.asyncio
async def test_get_chat_history_success(
      chat_management_service: ChatManagementService,
      mock_vector_store: AsyncMock
) -> None:
    """Test getting chat history successfully."""
    # Given
    user_id = "user_123"
    chat_id = "chat_123"

    chunk = DocumentChunk(
        chunk_id="chunk_1",
        doc_id="doc_123",
        page_number=5,
        page_content="Sample content from page 5",
        created_at=datetime.now(timezone.utc)
    )

    messages = [
        Message(
            role="user",
            content="What is Python?",
            timestamp=datetime(2024, 1, 1, 10, 0, 0, tzinfo=timezone.utc),
            chunks=[]
        ),
        Message(
            role="assistant",
            content="Python is a programming language.",
            timestamp=datetime(2024, 1, 1, 10, 1, 0, tzinfo=timezone.utc),
            chunks=[chunk]
        ),
    ]

    chat_history = ChatHistory(
        chat_id=chat_id,
        user_id=user_id,
        messages=messages,
        created_at=datetime(2024, 1, 1, 9, 0, 0, tzinfo=timezone.utc)
    )

    mock_vector_store.get_chat_history.return_value = chat_history

    # When
    result = await chat_management_service.get_chat_history(user_id, chat_id)

    # Then
    assert isinstance(result, ChatHistoryResponse)
    assert result.chatId == chat_id
    assert len(result.history) == 2

    # Check user message
    assert result.history[0].role == "user"
    assert result.history[0].content == "What is Python?"
    assert len(result.history[0].documents) == 0

    # Check assistant message with chunks
    assert result.history[1].role == "assistant"
    assert result.history[1].content == "Python is a programming language."
    assert len(result.history[1].documents) == 1
    assert result.history[1].documents[0].page == 5
    assert result.history[1].documents[
               0].content == "Sample content from page 5"

    mock_vector_store.get_chat_history.assert_called_once_with(
        user_id,
        chat_id,
        include_chunks=True
    )


@pytest.mark.asyncio
async def test_get_chat_history_not_found(
      chat_management_service: ChatManagementService,
      mock_vector_store: AsyncMock
) -> None:
    """Test getting chat history when chat doesn't exist."""
    # Given
    user_id = "user_123"
    chat_id = "nonexistent_chat"

    mock_vector_store.get_chat_history.return_value = None

    # When/Then
    with pytest.raises(ValueError,
                       match="Chat with chat_id nonexistent_chat not found"):
        await chat_management_service.get_chat_history(user_id, chat_id)


@pytest.mark.asyncio
async def test_get_chat_history_empty(
      chat_management_service: ChatManagementService,
      mock_vector_store: AsyncMock
) -> None:
    """Test getting chat history when history is empty."""
    # Given
    user_id = "user_123"
    chat_id = "chat_123"

    chat_history = ChatHistory(
        chat_id=chat_id,
        user_id=user_id,
        messages=[],  # Empty messages
        created_at=datetime(2024, 1, 1, 9, 0, 0, tzinfo=timezone.utc)
    )

    mock_vector_store.get_chat_history.return_value = chat_history

    # When
    result = await chat_management_service.get_chat_history(user_id, chat_id)

    # Then
    assert isinstance(result, ChatHistoryResponse)
    assert result.chatId == chat_id
    assert len(result.history) == 0


@pytest.mark.asyncio
async def test_clear_chat_history(
      chat_management_service: ChatManagementService,
      mock_vector_store: AsyncMock
) -> None:
    """Test clearing chat history."""
    # Given
    user_id = "user_123"
    chat_id = "chat_456"

    # When
    await chat_management_service.clear_chat_history(user_id, chat_id)

    # Then
    mock_vector_store.delete_chat_messages.assert_called_once_with(user_id,
                                                                   chat_id)


