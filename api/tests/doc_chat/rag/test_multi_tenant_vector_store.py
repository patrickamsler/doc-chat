import shutil
import tempfile

import pytest

from doc_chat.rag.multi_tenant_vector_store import MultiTenantVectorStore


class DummySplit:
    def __init__(self, content):
        self.page_content = content


@pytest.fixture
def temp_chroma_dir():
    d = tempfile.mkdtemp()
    print("Temporary directory created:", d)
    yield d
    shutil.rmtree(d)


@pytest.fixture
def store(temp_chroma_dir):
    return MultiTenantVectorStore(chroma_persist_directory=temp_chroma_dir)


def test_get_or_create_db_creates_and_returns_db(store):
    user_id_1 = "user_a"
    user_id_2 = "user_b"
    db_name_1 = store.get_or_create_database(user_id_1)
    db_name_2 = store.get_or_create_database(user_id_2)
    assert db_name_1 == f"db:{user_id_1}"
    assert db_name_2 == f"db:{user_id_2}"
    assert {db_name_1, db_name_2} == set(store.list_all_databases())


def test_get_or_create_db_returns_existing_db(store):
    user_id = "user_a"
    db_name = store.get_or_create_database(user_id)
    assert db_name == f"db:{user_id}"
    # Call again to ensure it returns the same database
    db_name_again = store.get_or_create_database(user_id)
    assert db_name == db_name_again
    assert len(store.list_all_databases()) == 1


def test_get_collections_returns_empty_list_for_new_user(store):
    user_id = "user_a"
    collections = store.get_collections(user_id)
    assert isinstance(collections, list)
    assert len(collections) == 0


def test_get_collections_returns_collections(store):
    user_id = "user_a"
    splits1 = [DummySplit("page one"), DummySplit("page two")]
    splits2 = [DummySplit("page one"), DummySplit("page two")]
    store.create_document_collection(user_id, splits1)
    store.create_document_collection(user_id, splits2)
    collections = store.get_collections(user_id)
    assert isinstance(collections, list)
    assert len(collections) == 2


def test_create_document_collection(store):
    user_id = "user_b"
    splits = [DummySplit("page one"), DummySplit("page two")]
    collection_id = store.create_document_collection(user_id, splits)
    assert isinstance(collection_id, str)
    # Try to create again with different splits, should get a new collection
    splits2 = [DummySplit("page three")]
    collection_id2 = store.create_document_collection(user_id, splits2)
    assert collection_id != collection_id2
    assert len(store.get_collections(user_id)) == 2


def test_create_document_collection_empty_document_split_raises(store):
    user_id = "user_c"
    with pytest.raises(ValueError):
        store.create_document_collection(user_id, [])
