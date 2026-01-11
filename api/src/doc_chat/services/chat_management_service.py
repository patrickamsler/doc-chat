import logging
from typing import Optional

from doc_chat.rag.weaviate_vector_store import WeaviateVectorStore
from doc_chat.api.schemas import (
    Chat,
    ChatsResponse,
    ChatHistoryResponse,
    Message as MessageResponse,
    DocumentsResponse
)

logger = logging.getLogger(__name__)


class ChatManagementService:
    """Service for managing chat metadata and history operations."""

    def __init__(self, vector_store: WeaviateVectorStore):
        self._vector_store = vector_store

    async def find_chat(self, user_id: str, chat_id: str) -> Optional[Chat]:
        """
        Find a chat by its chat_id.

        In Weaviate:
        - A Chat represents a conversation
        - The file name is stored in the Chat.name field

        Args:
            user_id: The user ID
            chat_id: The chat ID to find

        Returns:
            Chat object if found, None otherwise
        """
        chat_entity = await self._vector_store.get_chat(user_id, chat_id)
        if not chat_entity:
            return None

        return Chat(
            chatId=chat_id,
            fileName=chat_entity.name,
            createdAt=chat_entity.created_at.isoformat()
        )

    async def find_all_chats(self, user_id: str) -> ChatsResponse:
        """
        Find all chats for a user.

        In Weaviate:
        - Each Chat represents a conversation
        - The file name is stored in the Chat.name field

        Args:
            user_id: The user ID

        Returns:
            ChatsResponse with list of all user chats
        """
        if not await self._vector_store.tenant_exists(user_id):
            return ChatsResponse(userId=user_id, chats=[])

        # Fetch all chats
        chat_entities = await self._vector_store.get_chats(user_id)

        # Build chat responses
        chats = []
        for chat_entity in chat_entities:
            chat = Chat(
                chatId=chat_entity.chat_id,
                fileName=chat_entity.name or "Untitled",
                createdAt=chat_entity.created_at.isoformat()
            )
            chats.append(chat)

        return ChatsResponse(
            userId=user_id,
            chats=chats
        )

    async def get_chat_history(
          self,
          user_id: str,
          chat_id: str
    ) -> ChatHistoryResponse:
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
                timestamp=msg.timestamp.isoformat(),
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

    async def clear_chat_history(self, user_id: str, chat_id: str) -> None:
        """
        Clear all messages from a chat.

        The chat entity and documents remain intact, allowing users
        to start fresh with the same document.

        Args:
            user_id: The user ID
            chat_id: The chat ID to clear
        """
        await self._vector_store.delete_chat_messages(user_id, chat_id)
        logger.info(f"Cleared history for chat {chat_id} for user {user_id}")
