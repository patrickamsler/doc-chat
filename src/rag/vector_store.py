from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.chains import RetrievalQA

from src.llm import create_llm

class VectorStore:
    def __init__(self, documents: list):
        embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma.from_documents(documents, embeddings)
        self.llm = create_llm()

    def qa_chain(self, question: str, chain_type="stuff", k=2) -> dict:
        retriever = self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": k}
        )
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            retriever=retriever,
            return_source_documents=True,
            chain_type=chain_type
        )
        return qa_chain.invoke(question)

    def __str__(self):
        return f"Number of collections: {self.vectorstore._collection.count()}"