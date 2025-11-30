from dataclasses import dataclass
from datetime import datetime

import weaviate
import weaviate.classes as wvc
from weaviate import WeaviateAsyncClient
from weaviate.classes.config import Property, DataType, Configure, \
    ReferenceProperty
from weaviate.classes.query import Filter


@dataclass
class DocumentChunk:
    chunk_id: str
    doc_id: str
    page_number: int
    page_content: str
    created_at: datetime


@dataclass
class Document:
    doc_id: str
    file_name: str
    created_at: datetime
    num_pages: int


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

        if not await self.client.collections.exists("Document"):
            await self.client.collections.create(
                name="Document",
                properties=[
                    Property(name="doc_id", data_type=DataType.TEXT),
                    Property(name="file_name", data_type=DataType.TEXT),
                    Property(name="created_at", data_type=DataType.DATE),
                    Property(name="num_pages", data_type=DataType.INT)
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
        Create a tenant for the user in both Document and DocumentChunk collections.

        Args:
            user_id: The user ID to use as tenant name
        """
        documents_collection = self.client.collections.get("Document")
        chunks_collection = self.client.collections.get("DocumentChunk")

        await documents_collection.tenants.create(user_id)
        await chunks_collection.tenants.create(user_id)

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
        documents_collection = self.client.collections.get(
            "Document").with_tenant(user_id)
        chunks_collection = self.client.collections.get(
            "DocumentChunk").with_tenant(user_id)

        # Insert the document
        document_uuid = await documents_collection.data.insert({
            "doc_id": document.doc_id,
            "file_name": document.file_name,
            "created_at": document.created_at,
            "num_pages": document.num_pages
        })

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
            file_name=obj.properties.get('file_name'),
            created_at=obj.properties.get('created_at'),
            num_pages=obj.properties.get('num_pages')
        )
