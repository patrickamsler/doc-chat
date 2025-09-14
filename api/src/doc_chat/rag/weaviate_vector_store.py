from dataclasses import dataclass
from datetime import datetime

import weaviate
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
    def __init__(self, embedding_model='text-embedding-3-small'):
        self.embedding_model = embedding_model
        self.client = weaviate.connect_to_local(
            host="localhost", port=8080
        )
        self._enforce_schema()

    def _enforce_schema(self):
        multi_tenancy_config = Configure.multi_tenancy(
            enabled=True,
            auto_tenant_creation=True
        )
        self.client.collections.create(
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
        self.client.collections.create(
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

    def create_tenant(self, user_id: str):
        """
        Create a tenant for the user in both Document and DocumentChunk collections.

        Args:
            user_id: The user ID to use as tenant name
        """
        documents_collection = self.client.collections.get("Document")
        chunks_collection = self.client.collections.get("DocumentChunk")

        documents_collection.tenants.create(user_id)
        chunks_collection.tenants.create(user_id)

    def index_document(self, user_id: str, document: Document,
          chunks: list[DocumentChunk]):
        """
        Index a document and its chunks in Weaviate.

        Args:
            user_id: The user ID (used as tenant)
            document: Document metadata to store
            chunks: List of document chunks to index with vectors
        """
        # Get collections with the user as tenant
        documents_collection = self.client.collections.get(
            "Document").with_tenant(user_id)
        chunks_collection = self.client.collections.get(
            "DocumentChunk").with_tenant(user_id)

        # Insert the document
        document_uuid = documents_collection.data.insert({
            "doc_id": document.doc_id,
            "file_name": document.file_name,
            "created_at": document.created_at,
            "num_pages": document.num_pages
        })

        # Use batch insert for chunks for better performance
        with chunks_collection.batch.fixed_size(batch_size=200) as batch:
            for chunk in chunks:
                batch.add_object(
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

        return document_uuid

    def retrieve_documents(self, user_id: str, doc_id: str, query: str,
          k: int = 1) -> list[DocumentChunk]:
        """
        Retrieve document chunks based on similarity

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

        results = chunks_collection.query.near_text(
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
