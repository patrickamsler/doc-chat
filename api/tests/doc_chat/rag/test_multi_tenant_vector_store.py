import shutil
import tempfile

import pytest

from doc_chat.rag.multi_tenant_vector_store import MultiTenantVectorStore
from doc_chat.token_util import create_token


class DummySplit:
    def __init__(self, content, page=0):
        self.page_content = content
        self.metadata = {"page": page}


@pytest.fixture
def store():
    temp_dir = tempfile.mkdtemp()
    print("Temporary directory created:", temp_dir)

    store = MultiTenantVectorStore(chroma_persist_directory=temp_dir,
                                   embedding_model=None)
    yield store
    shutil.rmtree(temp_dir)


def create_splits(content_list: list[str]) -> list[DummySplit]:
    return [DummySplit(content, i) for i, content in enumerate(content_list)]


def test_get_or_create_db_creates_and_returns_db(store):
    # given
    user_id_1 = "user_a"
    user_id_2 = "user_b"

    # when
    db_name_1 = store.get_or_create_database(user_id_1)
    db_name_2 = store.get_or_create_database(user_id_2)

    # then
    assert db_name_1 == f"db:{user_id_1}"
    assert db_name_2 == f"db:{user_id_2}"
    assert {db_name_1, db_name_2} == set(store.list_all_databases())


def test_get_or_create_db_returns_existing_db(store):
    # given
    user_id = "user_a"

    # when
    db_name = store.get_or_create_database(user_id)

    # then
    assert db_name == f"db:{user_id}"

    # when called again
    db_name_again = store.get_or_create_database(user_id)

    # then it should return the same db name
    assert db_name == db_name_again
    assert len(store.list_all_databases()) == 1


def test_get_collections_returns_empty_list_for_new_user(store):
    # given
    user_id = "user_a"

    # when
    collections = store.get_collections(user_id)

    # then
    assert isinstance(collections, list)
    assert len(collections) == 0


def test_get_collections_returns_collections(store):
    # given
    user_id = "user_a"
    splits1 = create_splits(["page one", "page two"])
    splits2 = create_splits(["page three", "page four"])
    store.create_document_collection(user_id, create_token(), splits1)
    store.create_document_collection(user_id, create_token(), splits2)

    # when
    collections = store.get_collections(user_id)

    # then
    assert isinstance(collections, list)
    assert len(collections) == 2


def test_create_document_collection(store):
    # given
    user_id = "user_b"
    splits = create_splits(["page one", "page two"])
    collection_id1 = create_token()

    # when
    store.create_document_collection(user_id, collection_id1, splits)

    # Try to create again with different splits, should get a new collection
    splits2 = create_splits(["page three"])
    collection_id2 = create_token()

    # when
    store.create_document_collection(user_id, collection_id2, splits2)

    # then
    assert len(store.get_collections(user_id)) == 2


def test_create_document_collection_empty_document_split_raises(store):
    user_id = "user_c"
    with pytest.raises(ValueError):
        store.create_document_collection(user_id, "1233", [])


def test_retrieve_documents(store):
    # given
    user_id = "user_a"
    splits = create_splits(["This is a document about oranges",
                            "This is a document about pineapple",
                            "This is a document about cherries"])
    collection_id = create_token()
    store.create_document_collection(user_id, collection_id, splits)

    # when
    query = "This is a document about Hawaii"
    retrieved_docs = store.retrieve_documents(user_id, collection_id,
                                              query, k=1)
    # then
    assert len(retrieved_docs) == 1

    doc = retrieved_docs[0]
    assert doc.page_content == "This is a document about pineapple"
    assert doc.id == "doc_1"
    assert doc.metadata['page'] == 1
    assert doc.metadata['createdAt'] is not None


def test_retrieve_documents_retrieve_multiple_docs(store):
    # given
    user_id = "user_a"
    splits = create_splits(["This is a document about oranges",
                            "This is a document about pineapple",
                            "This is a document about cherries"])
    collection_id = create_token()
    store.create_document_collection(user_id, collection_id, splits)

    # when
    query = "This is a document about Hawaii"
    retrieved_docs = store.retrieve_documents(user_id, collection_id,
                                              query, k=5)

    # then
    assert len(retrieved_docs) == 3

    expected_ids = {"doc_0", "doc_2", "doc_1"}
    assert {doc.id for doc in retrieved_docs} == expected_ids
