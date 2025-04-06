from typing import TypedDict, List

from .vector_store import VectorStore
from .document_loader import DocumentLoader


class DocumentsResponse(TypedDict):
    page: int
    content: str


class QueryResponse(TypedDict):
    question: str
    answer: str
    documents: List[DocumentsResponse]


class Chat:
    def __init__(self, file_path: str, token: str):
        self.file_path = file_path
        self.token = token
        doc_loader = DocumentLoader(file_path)
        _, splits = doc_loader.load_and_split()
        self.splits = splits
        self._vector_store = VectorStore(documents=splits, token=token)

    def query(self, question: str) -> QueryResponse:
        answer = self._vector_store.qa_chain(question, k=2)
        documents = [
            {'page': doc.metadata.get('page', 0), 'content': doc.page_content}
            for doc in answer['source_documents']
        ]
        return {
            'question': question,
            'answer': answer['result'],
            'documents': documents
        }

    def __str__(self):
        return f"File Path: {self.file_path}, Number of splits: {len(self.splits)}, {self._vector_store}"
