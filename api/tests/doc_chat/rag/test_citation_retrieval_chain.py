from datetime import datetime, timezone
from unittest.mock import MagicMock

from doc_chat.rag.citation_retrieval_chain import CitationRetrievalChain
from doc_chat.core.models import DocumentChunk


def create_doc(chunk_id: str, page_content: str,
      page: int) -> DocumentChunk:
    return DocumentChunk(
        chunk_id=chunk_id,
        doc_id="test_doc",
        page_content=page_content,
        page_number=page,
        created_at=datetime.now(timezone.utc)
    )


def make_chain_with_mocked_llm(content: str) -> CitationRetrievalChain:
    chain = CitationRetrievalChain(MagicMock())
    class Response:
        def __init__(self, content):
            self.content = content
            self.usage_metadata = "usage_metadata mock"
    chain._chain = MagicMock()
    chain._chain.invoke.return_value = Response(content)
    return chain


def test_invoke_calls_chain_and_formats_answer():
    # given
    docs = [
        create_doc("chunk_5", "content 1", 10),
        create_doc("chunk_7", "content 2", 20),
        create_doc("chunk_12", "content 2", 34),
    ]
    chain = make_chain_with_mocked_llm("The answer is here. [TXT1][TXT2]  ")

    # when
    result = chain.invoke("What is the answer?", documents=docs)

    # then
    assert result['answer'] == "The answer is here. <<chunk_5>><<chunk_7>>"
    assert result['source_documents'] == docs
    assert result['referenced_documents'] == ["chunk_5", "chunk_7"]

    chain._chain.invoke.assert_called_once()
    args = chain._chain.invoke.call_args[0][0]
    assert "context" in args
    assert "question" in args
    assert args["question"] == "What is the answer?"


def test_create_context():
    # given
    docs = [
        create_doc("chunk_2", "First doc content.", 1),
        create_doc("chunk_5", "Second doc content.", 2)
    ]

    # when
    context = CitationRetrievalChain.create_context(docs)

    # then
    assert context == (
        "[TXT1]\nFirst doc content.\n\n"
        "[TXT2]\nSecond doc content.\n\n"
    )


def test_replace_txt_with_page_numbers():
    # given
    docs = [
        create_doc("chunk_2", "irrelevant", 5),
        create_doc("chunk_3", "irrelevant", 7)
    ]
    answer = "Some answer. [TXT1][TXT2]"

    # when
    replaced_answer, referenced_docs = CitationRetrievalChain.replace_txt_with_page_numbers(
        answer,
        docs, True)
    # then
    assert replaced_answer == "Some answer. <<chunk_2>><<chunk_3>>"
    assert referenced_docs == ["chunk_2", "chunk_3"]


def test_replace_txt_with_page_numbers_multiple_documents():
    # given
    docs = [
        create_doc("chunk_42", "irrelevant", 30),
        create_doc("chunk_16", "irrelevant", 7),
        create_doc("chunk_87", "irrelevant", 80),
        create_doc("chunk_56", "irrelevant", 40)
    ]
    answer = "Some answer. [TXT4][TXT2]"

    # when
    replaced_answer, _ = CitationRetrievalChain.replace_txt_with_page_numbers(
        answer,
        docs, True)

    # then
    assert replaced_answer == "Some answer. <<chunk_56>><<chunk_16>>"


def test_replace_txt_with_page_numbers_exclude_references():
    # given
    docs = [
        create_doc("chunk_2", "irrelevant", 5),
        create_doc("chunk_3", "irrelevant", 7)
    ]
    answer = "Some answer. [TXT1][TXT2]"

    # when
    replaced_answer, referenced_docs = CitationRetrievalChain.replace_txt_with_page_numbers(
        answer,
        docs, False)
    # then
    assert replaced_answer == "Some answer."
    assert referenced_docs == ["chunk_2", "chunk_3"]

