from .chat import QueryResponse
from .citation_retrieval_chain import CitationRetrievalChain
from .document_loader import DocumentLoader
from .multi_tenant_vector_store import MultiTenantVectorStore
from ..llm import create_llm


class ChatService:
    def __init__(self):
        self._vector_store = MultiTenantVectorStore()
        self._retrieval_chain = CitationRetrievalChain(retriever=None, # TODO: use vector store as retriever
                                                       llm=create_llm())

    def create_document_chat(self, user_id: str, token: str, file_path: str):
        doc_loader = DocumentLoader(file_path)
        _, splits = doc_loader.load_and_split()
        self._vector_store.create_document_collection(user_id, token, splits)

    def query(self, user_id: str, collection_id: str,
          question: str) -> QueryResponse:
        docs = self._vector_store.retrieve_documents(user_id=user_id,
                                                     collection_id=collection_id,
                                                     query=question, k=5)
        response = self._retrieval_chain.invoke(question, docs)
        response_documents = [
            {'page': doc.metadata['page'], 'content': doc.page_content}
            for doc in response['source_documents']
        ]
        answer = response['answer']
        return QueryResponse(
            question=question,
            answer=answer,
            documents=response_documents
        )
