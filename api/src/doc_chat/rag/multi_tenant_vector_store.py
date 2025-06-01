import os
from datetime import datetime

import chromadb
from chromadb import DEFAULT_TENANT, DEFAULT_DATABASE
from chromadb import Settings
from chromadb.utils import embedding_functions

from doc_chat.token_util import create_token

CHROMA_PERSIST_DIRECTORY_ENV = os.getenv("CHROMA_TMP_DIR")


class MultiTenantVectorStore:

    def __init__(
          self,
          chroma_persist_directory=CHROMA_PERSIST_DIRECTORY_ENV,
          embedding_model='text-embedding-3-small'
    ):
        self._chroma_persist_directory = chroma_persist_directory
        self._adminClient = chromadb.AdminClient(Settings(
            is_persistent=True,
            persist_directory=chroma_persist_directory,
        ))
        if not embedding_model:
            # By default, Chroma uses the Sentence Transformers all-MiniLM-L6-v2
            self.embedding_function = embedding_functions.DefaultEmbeddingFunction()
        else:
            self.embedding_function = embedding_functions.OpenAIEmbeddingFunction(
                api_key=os.environ["OPENAI_API_KEY"],
                model_name=embedding_model
            )

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

    def create_document_collection(self, user_id: str,
          document_splits: list) -> str:
        """
        Create a new document collection for a user and add document splits to it.
        # each user has their own chroma database
        # we create a new collection for each PDF upload
        # the splits of the PDF will be added as chroma documents
        """
        if not document_splits:
            raise ValueError("document_splits cannot be empty")
        client = self._get_chroma_client(user_id)
        collection_id = create_token()
        collection = client.get_or_create_collection(
            name=collection_id,
            metadata={
                "createdAt": str(datetime.now())
            },
            embedding_function=self.embedding_function,
        )
        collection.add(
            documents=[split.page_content for split in document_splits],
            ids=[f"doc_{i}" for i, _ in enumerate(document_splits)],
            metadatas=[{
                "createdAt": str(datetime.now()),
                "page": split.metadata.get("page")
            } for split in document_splits]
        )
        return collection_id

    def retrieve_documents(self, user_id: str, collection_id: str,
          query: str, k: int = 1) -> list:
        """
        Retrieve documents based on similarity for a user.
        """
        client = self._get_chroma_client(user_id)
        collection = client.get_collection(collection_id)
        results = collection.query(
            query_texts=[query],
            n_results=k
        )
        docs = []
        for i, doc in enumerate(results['documents'][0]):
            docs.append({
                "id": results['ids'][0][i],
                "page_content": doc,
                "metadata": results['metadatas'][0][i],
            })
        return docs