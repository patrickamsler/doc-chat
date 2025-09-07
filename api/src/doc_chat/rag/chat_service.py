from .citation_retrieval_chain import CitationRetrievalChain
from .document_loader import DocumentLoader
from .multi_tenant_vector_store import MultiTenantVectorStore
from .reranker import Reranker
from ..api_types import QueryResponse, ChatsResponse, Chat, DocumentsResponse
from ..llm import create_llm


class ChatService:
    def __init__(self):
        self._vector_store = MultiTenantVectorStore()
        self.reranker = Reranker()
        self._retrieval_chain = CitationRetrievalChain(retriever=None,
                                                       # TODO: use vector store as retriever
                                                       llm=create_llm())

    def create_document_chat(self, user_id: str, chat_id: str,
          file_path: str, file_name: str = None):
        doc_loader = DocumentLoader(file_path)
        _, splits = doc_loader.load_and_split()
        self._vector_store.create_document_collection(user_id=user_id,
                                                      collection_id=chat_id,
                                                      document_splits=splits,
                                                      file_name=file_name)

    def query(self, user_id: str, chat_id: str,
          question: str) -> QueryResponse:
        # retrieve top 20 documents from the vector store
        retrieved_docs = self._vector_store.retrieve_documents(user_id=user_id,
                                                               collection_id=chat_id,
                                                               query=question,
                                                               k=20)
        # rank the retrieved documents
        ranked_docs = self.reranker.rerank(query=question,
                                           documents=retrieved_docs)

        # invoke the retrieval chain with the top 5 ranked documents
        response = self._retrieval_chain.invoke(question, ranked_docs[:5])
        response_documents = [
            DocumentsResponse(id=doc.id,
                              page=doc.metadata['page'],
                              content=doc.page_content)
            for doc in response['source_documents']
        ]
        answer = response['answer']
        return QueryResponse(
            question=question,
            answer=answer,
            documents=response_documents
        )

    def find_chat(self, user_id: str, chat_id: str) -> Chat:
        metadata = self._vector_store.get_collection_metadata(user_id, chat_id)
        return Chat(
            chatId=chat_id,
            fileName=metadata['file_name'] if 'file_name' in metadata else None,
            createdAt=metadata['created'] if 'created' in metadata else None
        )

    def find_all_chats(self, user_id: str) -> ChatsResponse:
        collections = self._vector_store.get_collections(user_id)

        chats = []
        for collection_id in collections:
            chat = self.find_chat(user_id, collection_id)
            chats.append(chat)

        return ChatsResponse(
            userId=user_id,
            chats=chats
        )


chat_service_instance = ChatService()


def get_chat_service() -> ChatService:
    return chat_service_instance
