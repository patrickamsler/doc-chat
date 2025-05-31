import os
import secrets
from datetime import datetime

import chromadb
from chromadb import DEFAULT_TENANT, DEFAULT_DATABASE
from chromadb import Settings
from chromadb.utils import embedding_functions

CHROMA_PERSIST_DIRECTORY_ENV = os.getenv("CHROMA_TMP_DIR")


class MultiTenantVectorStore:

    def __init__(self, chroma_persist_directory=CHROMA_PERSIST_DIRECTORY_ENV):
        self._chroma_persist_directory = chroma_persist_directory
        self._adminClient = chromadb.AdminClient(Settings(
            is_persistent=True,
            persist_directory=chroma_persist_directory,
        ))
        self.embedding_function = embedding_functions.DefaultEmbeddingFunction()

    def _get_chroma_client(self, user_id: str) -> chromadb.PersistentClient:
        """
        Get a Chroma client for the user's database
        """
        database = self.get_or_create_database(user_id)
        return chromadb.PersistentClient(
            path=self._chroma_persist_directory,
            tenant=DEFAULT_TENANT,
            database=database
        )

    def get_or_create_database(self, user_id) -> str:
        """
        Get or create a database for the user
        """
        database = f"db:{user_id}"
        try:
            self._adminClient.get_database(database)
        except Exception as e:
            self._adminClient.create_database(database, DEFAULT_TENANT)
        return database

    def list_all_databases(self) -> list[str]:
        """
        List all user databases
        """
        return [db["name"] for db in self._adminClient.list_databases()
                if db.get("tenant") == DEFAULT_TENANT
                and db["name"] != DEFAULT_DATABASE]

    def get_collections(self, user_id: str) -> list[str]:
        """
        List all collections for a user
        """
        client = self._get_chroma_client(user_id)
        return [c.__str__() for c in client.list_collections()]

    def create_document_collection(self, user_id: str, document_splits: list) -> str:
        if not document_splits:
            raise ValueError("document_splits cannot be empty")
        # each user has their own chroma database
        client = self._get_chroma_client(user_id)
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
    def _create_collection_id() -> str:
        return secrets.token_urlsafe(16)
