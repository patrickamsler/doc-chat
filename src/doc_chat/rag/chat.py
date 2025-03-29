from .vector_store import VectorStore
from .document_loader import DocumentLoader

class Chat:
    def __init__(self, file_path: str):
        self.file_path = file_path
        doc_loader = DocumentLoader(file_path)
        _, splits = doc_loader.load_and_split()
        self.splits = splits
        self._vector_store = VectorStore(splits)

    def query(self, question: str):
         answer = self._vector_store.qa_chain(question, k=2)
         return answer['result']

    def __str__(self):
        return f"File Path: {self.file_path}, Number of splits: {len(self.splits)}, {self._vector_store}"
