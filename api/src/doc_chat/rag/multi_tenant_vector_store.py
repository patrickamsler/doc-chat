import os
import secrets
import chromadb
from chromadb import DEFAULT_TENANT
from chromadb import Settings
from chromadb.utils import embedding_functions
from datetime import datetime

CHROMA_PERSIST_DIRECTORY_ENV = os.getenv("CHROMA_TMP_DIR")


class MultiTenantVectorStore:

    def __init__(self, chroma_persist_directory=CHROMA_PERSIST_DIRECTORY_ENV):
        self._chroma_persist_directory = chroma_persist_directory
        self._adminClient = chromadb.AdminClient(Settings(
            is_persistent=True,
            persist_directory=chroma_persist_directory,
        ))
        self.embedding_function = embedding_functions.DefaultEmbeddingFunction()

    def get_or_create_db_for_user(self, user_id):
        database = f"db:{user_id}"
        try:
            self._adminClient.get_database(database)
        except Exception as e:
            self._adminClient.create_database(database, DEFAULT_TENANT)
        return database

    def create_document_collection(self, user_id: str, document_splits: list):
        if not document_splits:
            raise ValueError("document_splits cannot be empty")
        # each user has their own chroma database
        database = self.get_or_create_db_for_user(user_id)
        client = chromadb.PersistentClient(path=self._chroma_persist_directory,
                                           tenant=DEFAULT_TENANT,
                                           database=database)
        # we create a new collection for each PDF upload
        # the splits of the PDF will be added as chroma documents
        collection_id = self._create_collection_id()
        collection = client.get_or_create_collection(
            name=collection_id,
            metadata={
                "created": str(datetime.now())
            },
            embedding_function=self.embedding_function,
        )
        collection.add(
            documents=[split.page_content for split in document_splits],
            ids=[f"doc_{i}" for i, _ in enumerate(document_splits)],
        )
        return collection_id

    @staticmethod
    def _create_collection_id():
        return secrets.token_urlsafe(16)
