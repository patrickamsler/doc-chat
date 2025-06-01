import pytest
from unittest.mock import MagicMock

from doc_chat.rag.citation_retrieval_chain import CitationRetrievalChain

class DummyDoc:
    def __init__(self, content, page):
        self.page_content = content
        self.metadata = {'page': page}

def make_chain_with_mocked_llm():
    retriever = MagicMock()
    llm = MagicMock()
    chain = CitationRetrievalChain(retriever, llm)
    chain._chain = MagicMock()
    return chain

def test_create_context():
    # given
    docs = [
        DummyDoc("First doc content.", 1),
        DummyDoc("Second doc content.", 2)
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
        DummyDoc("irrelevant", 5),
        DummyDoc("irrelevant", 7)
    ]
    answer = "Some answer. [TXT1][TXT2]"

    # when
    replaced = CitationRetrievalChain.replace_txt_with_page_numbers(answer, docs)

    # then
    assert "<<5>>" in replaced
    assert "<<7>>" in replaced
    assert "[TXT1]" not in replaced

def test_invoke_calls_chain_and_formats_answer():
    # given
    docs = [
        DummyDoc("Doc1", 10),
        DummyDoc("Doc2", 20)
    ]
    chain = make_chain_with_mocked_llm()
    chain._chain.invoke.return_value = "The answer is here. [TXT1][TXT2]  "

    # when
    result = chain.invoke("What is the answer?", documents=docs)

    # then
    assert result['answer'] == "The answer is here. <<10>><<20>>"
    assert result['source_documents'] == docs

    chain._chain.invoke.assert_called_once()
    args = chain._chain.invoke.call_args[0][0]
    assert "context" in args
    assert "question" in args
    assert args["question"] == "What is the answer?"
