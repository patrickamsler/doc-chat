import os

from langchain.chains import ConversationalRetrievalChain
from langchain.chains import RetrievalQA
from langchain.memory import ConversationBufferMemory
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

from doc_chat.llm import create_llm


class VectorStore:
    def __init__(self, documents: list, token: str):
        self._persist_directory = os.path.join(
            os.getenv("CHROMA_TMP_DIR"),
            token
        )
        os.makedirs(self._persist_directory, exist_ok=True)
        self._vectorstore = Chroma.from_documents(
            documents=documents,
            embedding=OpenAIEmbeddings(),
            persist_directory=self._persist_directory
        )
        self._llm = create_llm()

    def create_qa_chain(self, chain_type="stuff", k=2) -> dict:
        """
        Create a retrieval QA chain without memory.
        """
        retriever = self._vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": k}
        )
        return RetrievalQA.from_chain_type(
            llm=self._llm,
            retriever=retriever,
            return_source_documents=True,
            chain_type=chain_type,
        )

    def create_conversational_retrieval_chain(
          self,
          chain_type="stuff",
          k=2
    ) -> ConversationalRetrievalChain:
        """
        Create a conversational retrieval chain with memory.
        """
        retriever = self._vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": k}
        )
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key="answer"
        )
        return ConversationalRetrievalChain.from_llm(
            llm=self._llm,
            retriever=retriever,
            memory=memory,
            return_source_documents=True,
            chain_type=chain_type
        )

    def retrieve_documents(self, query: str, k: int = 2) -> list:
        """
        Retrieve documents based on similarity without calling the LLM.
        """
        retriever = self._vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": k}
        )
        return retriever.get_relevant_documents(query)

    def __str__(self):
        return (
            f"Number of collections: {self._vectorstore._collection.count()}, "
            f"persist_directory: {self._persist_directory}")
