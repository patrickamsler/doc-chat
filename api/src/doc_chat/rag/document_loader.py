from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter


class DocumentLoader:
    def __init__(self, file_path: str):
        self._file_path = file_path

    def load_and_split(self,
          chuck_size: int = 1000,
          check_overlap=150) -> tuple[list, list]:
        loader = PyPDFLoader(self._file_path)
        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=chuck_size,
                                                       chunk_overlap=check_overlap)
        splits = text_splitter.split_documents(documents)
        return documents, splits
