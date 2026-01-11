from fastapi import Request

from doc_chat.security.security_helper import User, \
    get_current_user as _get_current_user, \
    is_user_authenticated as _is_user_authenticated
from doc_chat.services.chat_management_service import ChatManagementService
from doc_chat.services.document_service import DocumentService
from doc_chat.services.query_service import QueryService


# Service Dependencies
def get_document_service() -> DocumentService:
    """
    Dependency to get DocumentService instance.
    """
    from doc_chat.rag.service_initialization import get_vector_store
    return DocumentService(get_vector_store())


def get_query_service() -> QueryService:
    """
    Dependency to get QueryService instance.
    """
    from doc_chat.rag.service_initialization import get_vector_store, \
        get_reranker
    return QueryService(get_vector_store(), get_reranker())


def get_chat_management_service() -> ChatManagementService:
    """
    Dependency to get ChatManagementService instance.
    """
    from doc_chat.rag.service_initialization import get_vector_store
    return ChatManagementService(get_vector_store())


# Authentication Dependencies
def get_current_user(request: Request) -> User:
    """
    Dependency to get the current authenticated user.
    """
    return _get_current_user(request)


def is_user_authenticated(request: Request) -> bool:
    """
    Check if the user is authenticated.
    Returns True if the user is authenticated, False otherwise.
    """
    return _is_user_authenticated(request)


# Export User model for convenience
__all__ = [
    'get_document_service',
    'get_query_service',
    'get_chat_management_service',
    'get_current_user',
    'is_user_authenticated',
    'User'
]
