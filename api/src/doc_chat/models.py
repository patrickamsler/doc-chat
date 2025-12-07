from dataclasses import dataclass
from datetime import datetime
from typing import Literal, Optional


@dataclass
class DocumentChunk:
    chunk_id: str
    doc_id: str
    page_number: int
    page_content: str
    created_at: datetime


@dataclass
class Document:
    doc_id: str
    chat_id: str
    file_name: str
    created_at: datetime
    num_pages: int


@dataclass
class Message:
    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime
    chunks: Optional[list[DocumentChunk]] = None


@dataclass
class Chat:
    chat_id: str
    user_id: str
    name: Optional[str]
    created_at: datetime


@dataclass
class ChatHistory:
    chat_id: str
    user_id: str
    messages: list[Message]
    created_at: datetime