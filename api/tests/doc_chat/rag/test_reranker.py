import pytest

from doc_chat.rag.multi_tenant_vector_store import VectorStoreDocument
from doc_chat.rag.reranker import Reranker


@pytest.fixture
def reranker():
    return Reranker(
        model_name='ms-marco-TinyBERT-L-2-v2',
        max_length=128
    )


def test_rerank(reranker):
    # given
    query = "Which animal can fly?"
    docs = [
        VectorStoreDocument(id="doc_1",
                            page_content="Cats cannot fly, but they are great climbers.",
                            metadata={}),
        VectorStoreDocument(id="doc_2",
                            page_content="Birds can fly, such as eagles and sparrows.",
                            metadata={}),
    ]

    # when
    ranked_docs = reranker.rerank(query, docs)

    # then
    assert isinstance(ranked_docs, list)
    assert all(isinstance(doc, VectorStoreDocument) for doc in ranked_docs)

    # Check that the documents are sorted by relevance#
    assert [doc.id for doc in ranked_docs] == ["doc_2", "doc_1"]

    # Input order should not be changed
    assert [doc.id for doc in docs] == ["doc_1", "doc_2"]


def test_rerank_empty_document_list(reranker):
    # given
    query = "What is the capital of France?"
    docs = []

    # when
    ranked_docs = reranker.rerank(query, docs)

    # then
    assert ranked_docs == []


def test_rerank_empty_query(reranker):
    # given
    query = ""
    docs = [
        VectorStoreDocument(id="doc_1",
                            page_content="Cats cannot fly, but they are great climbers.",
                            metadata={}),
        VectorStoreDocument(id="doc_2",
                            page_content="Birds can fly, such as eagles and sparrows.",
                            metadata={}),
    ]

    # when
    ranked_docs = reranker.rerank(query, docs)

    # then
    assert ranked_docs == docs
