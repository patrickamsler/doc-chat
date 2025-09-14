from dataclasses import dataclass
from datetime import datetime

import weaviate
from weaviate.classes.config import Property, DataType, Configure, \
    ReferenceProperty


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
