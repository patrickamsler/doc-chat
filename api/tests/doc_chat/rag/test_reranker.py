from datetime import datetime, timezone

import pytest

from doc_chat.rag.reranker import Reranker
from doc_chat.core.models import DocumentChunk


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
        DocumentChunk(chunk_id="chunk_1",
                      doc_id="doc_1",
                      page_content="Cats cannot fly, but they are great climbers.",
                      page_number=1,
                      created_at=datetime.now(timezone.utc)),
        DocumentChunk(chunk_id="chunk_2",
                      doc_id="doc_1",
                      page_content="Birds can fly, such as eagles and sparrows.",
                      page_number=2,
                      created_at=datetime.now(timezone.utc)),
    ]

    # when
    ranked_docs = reranker.rerank(query, docs)

    # then
    assert isinstance(ranked_docs, list)
    assert all(isinstance(doc, DocumentChunk) for doc in ranked_docs)

    # Check that the documents are sorted by relevance#
    assert [doc.chunk_id for doc in ranked_docs] == ["chunk_2", "chunk_1"]

    # Input order should not be changed
    assert [doc.chunk_id for doc in docs] == ["chunk_1", "chunk_2"]


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
        DocumentChunk(chunk_id="chunk_1",
                      doc_id="doc_1",
                      page_content="Cats cannot fly, but they are great climbers.",
                      page_number=1,
                      created_at=datetime.now(timezone.utc)),
        DocumentChunk(chunk_id="chunk_2",
                      doc_id="doc_1",
                      page_content="Birds can fly, such as eagles and sparrows.",
                      page_number=2,
                      created_at=datetime.now(timezone.utc)),
    ]

    # when
    ranked_docs = reranker.rerank(query, docs)

    # then
    assert ranked_docs == docs
