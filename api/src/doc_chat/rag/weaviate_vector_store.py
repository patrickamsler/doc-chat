import weaviate
import weaviate.classes as wvc
from weaviate import WeaviateAsyncClient
from weaviate.classes.config import Property, DataType, Configure, \
    ReferenceProperty
from weaviate.classes.query import Filter, QueryReference

from doc_chat.models import DocumentChunk, Document, Message, Chat, ChatHistory


class WeaviateVectorStore:
    def __init__(self, client: WeaviateAsyncClient,
          embedding_model: str = 'text-embedding-3-small'):
        """
        Initialize WeaviateVectorStore with an existing async client.

        Args:
            client: An already connected WeaviateAsyncClient instance
            embedding_model: The OpenAI embedding model to use
        """
        self.client = client
        self.embedding_model = embedding_model
        self._client_managed = False

    @classmethod
    async def create(cls, host: str = "localhost", port: int = 8080,
          embedding_model: str = 'text-embedding-3-small') -> 'WeaviateVectorStore':
        """
        Create and initialize a WeaviateVectorStore with a new async client.

        Args:
            host: Weaviate host address
            port: Weaviate port number
            embedding_model: The OpenAI embedding model to use

        Returns:
            Initialized WeaviateVectorStore instance
        """
        client = weaviate.use_async_with_local(host=host, port=port)
        await client.connect()
        instance = cls(client, embedding_model)
        instance._client_managed = True
        await instance._enforce_schema()
        return instance

    async def __aenter__(self) -> 'WeaviateVectorStore':
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        """Async context manager exit."""
        if self._client_managed:
            await self.client.close()

    async def close(self) -> None:
        """Close the client connection if managed by this instance."""
        if self._client_managed:
            await self.client.close()

    async def _enforce_schema(self) -> None:
        """
        Create required collections in Weaviate if they don't exist.
        """
        multi_tenancy_config = Configure.multi_tenancy(
            enabled=True,
            auto_tenant_creation=True
        )

        if not await self.client.collections.exists("Chat"):
            await self.client.collections.create(
                name="Chat",
                properties=[
                    Property(name="chat_id", data_type=DataType.TEXT),
                    Property(name="user_id", data_type=DataType.TEXT),
                    Property(name="name", data_type=DataType.TEXT),
                    Property(name="created_at", data_type=DataType.DATE)
                ],
                multi_tenancy_config=multi_tenancy_config,
                vectorizer_config=Configure.Vectorizer.none()
            )

        if not await self.client.collections.exists("Document"):
            await self.client.collections.create(
                name="Document",
                properties=[
                    Property(name="doc_id", data_type=DataType.TEXT),
                    Property(name="chat_id", data_type=DataType.TEXT),
                    Property(name="file_name", data_type=DataType.TEXT),
                    Property(name="created_at", data_type=DataType.DATE),
                    Property(name="num_pages", data_type=DataType.INT)
                ],
                references=[
                    ReferenceProperty(name="of_chat",
                                      target_collection="Chat")
                ],
                multi_tenancy_config=multi_tenancy_config,
                vectorizer_config=Configure.Vectorizer.none()
            )

        if not await self.client.collections.exists("DocumentChunk"):
            await self.client.collections.create(
                name="DocumentChunk",
                properties=[
                    Property(name="doc_id", data_type=DataType.TEXT),
                    Property(name="chunk_id", data_type=DataType.TEXT),
                    Property(name="page_number", data_type=DataType.INT),
                    Property(name="page_content", data_type=DataType.TEXT),
                    Property(name="created_at", data_type=DataType.DATE)
                ],
                references=[
                    ReferenceProperty(name="of_document",
                                      target_collection="Document")
                ],
                multi_tenancy_config=multi_tenancy_config,
                vector_config=[
                    Configure.Vectors.text2vec_openai(
                        name="document_chunk_vector",
                        # Which properties of the source object to use for vectorization
                        source_properties=["page_content"],
                        model=self.embedding_model,
                        # Let Weaviate infer the dimensions from the model
                        dimensions=None
                    )
                ]
            )

        if not await self.client.collections.exists("ChatMessage"):
            await self.client.collections.create(
                name="ChatMessage",
                properties=[
                    Property(name="chat_id", data_type=DataType.TEXT),
                    Property(name="role", data_type=DataType.TEXT),
                    Property(name="content", data_type=DataType.TEXT),
                    Property(name="timestamp", data_type=DataType.DATE)
                ],
                references=[
                    ReferenceProperty(name="of_chat",
                                      target_collection="Chat"),
                    ReferenceProperty(name="cited_chunks",
                                      target_collection="DocumentChunk")
                ],
                multi_tenancy_config=multi_tenancy_config,
                vectorizer_config=Configure.Vectorizer.none()
            )

    async def tenant_exists(self, user_id: str) -> bool:
        """
        Check if a tenant exists for the user.

        Args:
            user_id: The user ID to check

        Returns:
            True if tenant exists, False otherwise
        """
        documents_collection = self.client.collections.get("Document")
        existing_tenants = await documents_collection.tenants.get()
        # tenants.get() returns a list/set of tenant names (strings)
        return user_id in existing_tenants

    async def create_tenant(self, user_id: str) -> None:
        """
        Create a tenant for the user in all collections.

        Args:
            user_id: The user ID to use as tenant name
        """
        chat_collection = self.client.collections.get("Chat")
        documents_collection = self.client.collections.get("Document")
        chunks_collection = self.client.collections.get("DocumentChunk")
        message_collection = self.client.collections.get("ChatMessage")

        await chat_collection.tenants.create(user_id)
        await documents_collection.tenants.create(user_id)
        await chunks_collection.tenants.create(user_id)
        await message_collection.tenants.create(user_id)

    async def index_document(self, user_id: str, document: Document,
          chunks: list[DocumentChunk]) -> str:
        """
        Index a document and its chunks in Weaviate.

        Args:
            user_id: The user ID (used as tenant)
            document: Document metadata to store
            chunks: List of document chunks to index with vectors

        Returns:
            The UUID of the inserted document
        """
        # Get collections with the user as tenant
        chat_collection = self.client.collections.get(
            "Chat").with_tenant(user_id)
        documents_collection = self.client.collections.get(
            "Document").with_tenant(user_id)
        chunks_collection = self.client.collections.get(
            "DocumentChunk").with_tenant(user_id)

        # Get the chat UUID for the reference
        chat_results = await chat_collection.query.fetch_objects(
            filters=Filter.by_property("chat_id").equal(document.chat_id),
            limit=1
        )

        if not chat_results.objects:
            raise ValueError(f"Chat with chat_id {document.chat_id} not found")

        chat_uuid = chat_results.objects[0].uuid

        # Insert the document
        document_uuid = await documents_collection.data.insert({
            "doc_id": document.doc_id,
            "chat_id": document.chat_id,
            "file_name": document.file_name,
            "created_at": document.created_at,
            "num_pages": document.num_pages
        }, references={"of_chat": chat_uuid})

        # Prepare chunk data objects for bulk insert
        chunk_data_objects = []
        for chunk in chunks:
            data_object = wvc.data.DataObject(
                properties={
                    "doc_id": chunk.doc_id,
                    "chunk_id": chunk.chunk_id,
                    "page_number": chunk.page_number,
                    "page_content": chunk.page_content,
                    "created_at": chunk.created_at
                },
                references={
                    "of_document": document_uuid
                }
            )
            chunk_data_objects.append(data_object)

        # Use insert_many for async bulk insertion
        await chunks_collection.data.insert_many(chunk_data_objects)

        return document_uuid

    async def search_chunks(self, user_id: str, doc_id: str, query: str,
          k: int = 1) -> list[DocumentChunk]:
        """
        Search for document chunks based on semantic similarity

        Args:
            user_id: The user ID (used as tenant)
            doc_id: The document ID to search within
            query: The search query text
            k: Number of results to return

        Returns:
            List of similar document chunks with metadata
        """
        chunks_collection = self.client.collections.get(
            "DocumentChunk").with_tenant(user_id)

        results = await chunks_collection.query.near_text(
            query=query,
            limit=k,
            filters=Filter.by_property("doc_id").equal(doc_id)
        )

        chunks = []
        for obj in results.objects:
            chunks.append(DocumentChunk(
                chunk_id=obj.properties.get('chunk_id'),
                doc_id=obj.properties.get('doc_id'),
                page_number=obj.properties.get('page_number'),
                page_content=obj.properties.get('page_content'),
                created_at=obj.properties.get('created_at')
            ))

        return chunks

    async def get_documents(self, user_id: str, limit: int = 1000) -> list[
        Document]:
        """
        Get all documents for a user, ordered by creation date (newest first).

        Args:
            user_id: The user ID (used as tenant)
            limit: Maximum number of documents to return

        Returns:
            List of documents ordered by created_at descending
        """
        documents_collection = self.client.collections.get(
            "Document").with_tenant(user_id)

        results = await documents_collection.query.fetch_objects(
            limit=limit,
            sort=wvc.query.Sort.by_property("created_at", ascending=False)
        )

        documents = []
        for obj in results.objects:
            documents.append(Document(
                doc_id=obj.properties.get('doc_id'),
                chat_id=obj.properties.get('chat_id'),
                file_name=obj.properties.get('file_name'),
                created_at=obj.properties.get('created_at'),
                num_pages=obj.properties.get('num_pages')
            ))

        return documents

    async def get_document(self, user_id: str, doc_id: str) -> Document | None:
        """
        Get a specific document by its doc_id.

        Args:
            user_id: The user ID (used as tenant)
            doc_id: The document ID to retrieve

        Returns:
            Document if found, None otherwise
        """
        documents_collection = self.client.collections.get(
            "Document").with_tenant(user_id)

        results = await documents_collection.query.fetch_objects(
            filters=Filter.by_property("doc_id").equal(doc_id),
            limit=1
        )

        if not results.objects:
            return None

        obj = results.objects[0]
        return Document(
            doc_id=obj.properties.get('doc_id'),
            chat_id=obj.properties.get('chat_id'),
            file_name=obj.properties.get('file_name'),
            created_at=obj.properties.get('created_at'),
            num_pages=obj.properties.get('num_pages')
        )

    async def create_chat(self, user_id: str, chat: Chat) -> str:
        """
        Create a new chat.

        Args:
            user_id: The user ID (used as tenant)
            chat: Chat metadata to store

        Returns:
            The UUID of the inserted chat
        """
        chat_collection = self.client.collections.get("Chat").with_tenant(
            user_id)

        chat_uuid = await chat_collection.data.insert({
            "chat_id": chat.chat_id,
            "user_id": chat.user_id,
            "name": chat.name,
            "created_at": chat.created_at
        })

        return chat_uuid

    async def get_chat(self, user_id: str, chat_id: str) -> Chat | None:
        """
        Get a specific chat by its chat_id.

        Args:
            user_id: The user ID (used as tenant)
            chat_id: The chat ID to retrieve

        Returns:
            Chat if found, None otherwise
        """
        chat_collection = self.client.collections.get("Chat").with_tenant(
            user_id)

        results = await chat_collection.query.fetch_objects(
            filters=Filter.by_property("chat_id").equal(chat_id),
            limit=1
        )

        if not results.objects:
            return None

        obj = results.objects[0]
        return Chat(
            chat_id=obj.properties.get('chat_id'),
            user_id=obj.properties.get('user_id'),
            name=obj.properties.get('name'),
            created_at=obj.properties.get('created_at')
        )

    async def get_chats(self, user_id: str, limit: int = 1000) -> list[Chat]:
        """
        Get all chats for a user, ordered by creation date (newest first).

        Args:
            user_id: The user ID (used as tenant)
            limit: Maximum number of chats to return

        Returns:
            List of chats ordered by created_at descending
        """
        chat_collection = self.client.collections.get("Chat").with_tenant(
            user_id)

        results = await chat_collection.query.fetch_objects(
            limit=limit,
            sort=wvc.query.Sort.by_property("created_at", ascending=False)
        )

        chats = []
        for obj in results.objects:
            chats.append(Chat(
                chat_id=obj.properties.get('chat_id'),
                user_id=obj.properties.get('user_id'),
                name=obj.properties.get('name'),
                created_at=obj.properties.get('created_at')
            ))

        return chats

    async def add_message(self, user_id: str, chat_id: str, doc_id: str,
          message: Message, chunk_ids: list[str] = None) -> str:
        """
        Add a message to chat history.

        Args:
            user_id: The user ID (used as tenant)
            chat_id: The chat ID this message belongs to
            doc_id: The document ID for referenced chunks
            message: Message to add
            chunk_ids: Optional list of chunk IDs to reference

        Returns:
            The UUID of the inserted message
        """
        chat_collection = self.client.collections.get("Chat").with_tenant(
            user_id)
        message_collection = self.client.collections.get(
            "ChatMessage").with_tenant(user_id)
        chunk_collection = self.client.collections.get(
            "DocumentChunk").with_tenant(user_id)

        # Get the chat UUID for the reference
        chat_results = await chat_collection.query.fetch_objects(
            filters=Filter.by_property("chat_id").equal(chat_id),
            limit=1
        )

        if not chat_results.objects:
            raise ValueError(f"Chat with chat_id {chat_id} not found")

        chat_uuid = chat_results.objects[0].uuid

        # Build references dict
        references = {"of_chat": chat_uuid}

        # If chunk_ids provided, fetch their UUIDs and add to references
        if chunk_ids:
            # Fetch chunks by their chunk_ids AND doc_id to ensure correct document
            chunk_filter = (
                  Filter.by_property("chunk_id").contains_any(chunk_ids) &
                  Filter.by_property("doc_id").equal(doc_id)
            )
            chunk_results = await chunk_collection.query.fetch_objects(
                filters=chunk_filter,
                limit=len(chunk_ids)
            )
            chunk_uuids = [obj.uuid for obj in chunk_results.objects]
            if chunk_uuids:
                references["cited_chunks"] = chunk_uuids

        # Insert the message
        message_uuid = await message_collection.data.insert({
            "chat_id": chat_id,
            "role": message.role,
            "content": message.content,
            "timestamp": message.timestamp
        }, references=references)

        return message_uuid

    async def _fetch_chat_messages(self, user_id: str, chat_id: str,
          limit: int, include_chunks: bool):
        message_collection = self.client.collections.get(
            "ChatMessage").with_tenant(user_id)

        if include_chunks:
            return await message_collection.query.fetch_objects(
                filters=Filter.by_property("chat_id").equal(chat_id),
                limit=limit,
                sort=wvc.query.Sort.by_property("timestamp", ascending=False),
                return_references=QueryReference(
                    link_on="cited_chunks",
                    return_properties=["chunk_id", "page_number",
                                       "page_content", "created_at"]
                )
            )
        else:
            return await message_collection.query.fetch_objects(
                filters=Filter.by_property("chat_id").equal(chat_id),
                limit=limit,
                sort=wvc.query.Sort.by_property("timestamp", ascending=False)
            )

    @staticmethod
    def _parse_message_object(msg_obj, include_chunks: bool) -> Message:
        chunks = None
        if include_chunks and msg_obj.references and "cited_chunks" in msg_obj.references:
            chunks = [
                DocumentChunk(
                    chunk_id=ref.properties.get('chunk_id'),
                    doc_id="",  # Not needed for response
                    page_number=ref.properties.get('page_number'),
                    page_content=ref.properties.get('page_content'),
                    created_at=ref.properties.get('created_at')
                )
                for ref in msg_obj.references["cited_chunks"].objects
            ]

        return Message(
            role=msg_obj.properties.get('role'),
            content=msg_obj.properties.get('content'),
            timestamp=msg_obj.properties.get('timestamp'),
            chunks=chunks
        )

    async def get_chat_history(self, user_id: str,
          chat_id: str, limit: int = 200,
          include_chunks: bool = False) -> ChatHistory | None:
        """
        Get chat history with most recent messages.

        Args:
            user_id: The user ID (used as tenant)
            chat_id: The chat ID to retrieve history for
            limit: Maximum number of most recent messages to retrieve (default: 200)
            include_chunks: Whether to include referenced chunks (default: False)

        Returns:
            ChatHistory if chat found, None otherwise
        """
        chat_collection = self.client.collections.get("Chat").with_tenant(
            user_id)

        # Get the chat
        chat_results = await chat_collection.query.fetch_objects(
            filters=Filter.by_property("chat_id").equal(chat_id),
            limit=1
        )

        if not chat_results.objects:
            return None
        chat_obj = chat_results.objects[0]

        message_results = await self._fetch_chat_messages(
            user_id, chat_id, limit, include_chunks
        )

        messages = [
            self._parse_message_object(msg_obj, include_chunks)
            for msg_obj in message_results.objects
        ]

        # Reverse to get chronological order (oldest first)
        messages.reverse()

        return ChatHistory(
            chat_id=chat_obj.properties.get('chat_id'),
            user_id=chat_obj.properties.get('user_id'),
            messages=messages,
            created_at=chat_obj.properties.get('created_at')
        )

    async def get_documents_by_chat(self, user_id: str, chat_id: str,
          limit: int = 1) -> list[Document]:
        """
        Get all documents for a specific chat.

        Args:
            user_id: The user ID (used as tenant)
            chat_id: The chat ID to filter by
            limit: Maximum number of documents to return

        Returns:
            List of documents for the chat ordered by created_at descending
        """
        documents_collection = self.client.collections.get(
            "Document").with_tenant(user_id)

        results = await documents_collection.query.fetch_objects(
            filters=Filter.by_property("chat_id").equal(chat_id),
            limit=limit,
            sort=wvc.query.Sort.by_property("created_at", ascending=False)
        )

        documents = []
        for obj in results.objects:
            documents.append(Document(
                doc_id=obj.properties.get('doc_id'),
                chat_id=obj.properties.get('chat_id'),
                file_name=obj.properties.get('file_name'),
                created_at=obj.properties.get('created_at'),
                num_pages=obj.properties.get('num_pages')
            ))

        return documents
