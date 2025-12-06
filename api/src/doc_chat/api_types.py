from pydantic import BaseModel


class ChatQueryRequest(BaseModel):
    chatId: str
    question: str


class UploadFileResponse(BaseModel):
    chatId: str
    message: str


class DocumentsResponse(BaseModel):
    id: str
    page: int
    content: str


class Message(BaseModel):
    role: str
    content: str
    timestamp: str
    documents: list[DocumentsResponse] = []


class ChatHistoryResponse(BaseModel):
    chatId: str
    history: list[Message]


class Chat(BaseModel):
    chatId: str
    fileName: str
    createdAt: str


class ChatsResponse(BaseModel):
    userId: str
    chats: list[Chat]


class QueryResponse(BaseModel):
    question: str
    answer: str
    documents: list[DocumentsResponse]
