import os
import tempfile

from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from chromadb.config import Settings

from doc_chat.llm import create_llm

class VectorStore:
    def __init__(self, documents: list, token: str):
        self._persist_directory = os.path.join(os.getenv("CHROMA_TMP_DIR"), token)
        os.makedirs(self._persist_directory, exist_ok=True)
        self._vectorstore = Chroma.from_documents(
            documents=documents,
            embedding=OpenAIEmbeddings(),
            persist_directory=self._persist_directory
        )
        self._llm = create_llm()

    def qa_chain(self, question: str, chain_type="stuff", k=2) -> dict:
        retriever = self._vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": k}
        )
        qa_chain = RetrievalQA.from_chain_type(
            llm=self._llm,
            retriever=retriever,
            return_source_documents=True,
            chain_type=chain_type
        )
        return qa_chain.invoke(question)

    def __str__(self):
        return (f"Number of collections: {self._vectorstore._collection.count()}, "
                f"persist_directory: {self._persist_directory}")
