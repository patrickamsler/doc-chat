from src.rag.document_loader import DocumentLoader
from src.rag.vector_store import VectorStore


class Chat:
    def __init__(self, file_path: str):
        doc_loader = DocumentLoader(file_path)
        _, splits = doc_loader.load_and_split()
        self._vector_store = VectorStore(splits)

    def query(self, question: str):
         answer = self._vector_store.qa_chain(question, k=2)
         return answer['result']

