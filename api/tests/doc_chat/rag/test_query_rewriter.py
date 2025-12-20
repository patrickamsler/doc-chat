from datetime import datetime, timezone
from unittest.mock import MagicMock

from doc_chat.models import Message
from doc_chat.rag.query_rewriter import QueryRewriter


def create_message(role: str, content: str) -> Message:
    return Message(
        role=role,
        content=content,
        timestamp=datetime.now(timezone.utc)
    )


def make_rewriter_with_mocked_llm(rewritten_content: str) -> QueryRewriter:
    rewriter = QueryRewriter(MagicMock())

    class Response:
        def __init__(self, content):
            self.content = content

    rewriter._chain = MagicMock()
    rewriter._chain.invoke.return_value = Response(rewritten_content)
    return rewriter


def test_rewrite_with_empty_history():
    # given
    messages = []
    rewriter = make_rewriter_with_mocked_llm(
        "What is the main topic of the document?")

    # when
    result = rewriter.rewrite("What is the main topic?", messages)

    # then
    assert result == "What is the main topic of the document?"
    rewriter._chain.invoke.assert_called_once()
    args = rewriter._chain.invoke.call_args[0][0]
    assert args["history"] == "No previous conversation."


def test_rewrite_strips_whitespace():
    # given
    messages = []
    rewriter = make_rewriter_with_mocked_llm("  What is quantum computing?  \n")

    # when
    result = rewriter.rewrite("What is QC?", messages)

    # then
    assert result == "What is quantum computing?"


def test_rewrite_with_multiple_messages():
    # given
    messages = [
        create_message("user", "Tell me about machine learning."),
        create_message("assistant", "Machine learning is a subset of AI."),
        create_message("user", "How does it work?"),
        create_message("assistant", "It uses algorithms to learn from data."),
    ]
    rewriter = make_rewriter_with_mocked_llm("How does machine learning work?")

    # when
    result = rewriter.rewrite("How does it work?", messages)

    # then
    assert result == "How does machine learning work?"
    args = rewriter._chain.invoke.call_args[0][0]
    assert "USER: Tell me about machine learning." in args["history"]
    assert "ASSISTANT: Machine learning is a subset of AI." in args["history"]


def test_format_history_empty():
    # given
    messages = []

    # when
    history_text = QueryRewriter._format_history(messages)

    # then
    assert history_text == "No previous conversation."


def test_format_history_single_message():
    # given
    messages = [create_message("user", "What is Python?")]

    # when
    history_text = QueryRewriter._format_history(messages)

    # then
    assert history_text == "USER: What is Python?"


def test_format_history_multiple_messages():
    # given
    messages = [
        create_message("user", "What is Python?"),
        create_message("assistant", "Python is a programming language."),
        create_message("user", "Who created it?"),
    ]

    # when
    history_text = QueryRewriter._format_history(messages)

    # then
    expected = (
        "USER: What is Python?\n"
        "ASSISTANT: Python is a programming language.\n"
        "USER: Who created it?"
    )
    assert history_text == expected
