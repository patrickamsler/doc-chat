import logging
import uuid

from dotenv import load_dotenv
from fastapi import APIRouter
from fastapi import File, UploadFile, HTTPException, Depends
from fastapi import status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from doc_chat.file_util import save_file, allowed_file
from doc_chat.rag.chat import QueryResponse
from doc_chat.rag.chat_service import ChatService
from doc_chat.security.security_helper import get_current_user, User

chat_router = APIRouter()
load_dotenv()

logger = logging.getLogger("chat_routes")
chat_service = ChatService()


class ChatQueryRequest(BaseModel):
    chatId: str
    question: str


class UploadFileResponse(BaseModel):
    chatId: str
    message: str


@chat_router.post("", response_model=UploadFileResponse)
async def upload_file(
      file: UploadFile = File(...),
      user: User = Depends(get_current_user)
):
    if file.filename == '':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="No file selected")

    if not allowed_file(file.filename):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid file")

    chat_id = str(uuid.uuid4())
    logger.info(f"User {user.id} uploading file with chat_id={chat_id}")

    file_path = save_file(file, user.id, chat_id)
    logger.info(f"File saved at: {file_path}")

    chat_service.create_document_chat(user.id, chat_id, file_path)

    response_model = UploadFileResponse(chatId=chat_id,
                                        message="File uploaded successfully")
    return JSONResponse(content=response_model.model_dump(),
                        status_code=status.HTTP_201_CREATED)


@chat_router.post('/query', response_model=QueryResponse)
def query(
      request: ChatQueryRequest,
      user: User = Depends(get_current_user)
):
    chat_id = request.chatId
    question = request.question
    logger.info(f"User {user.id} querying with chat_id={chat_id} and question='{question}'")

    response = chat_service.query(user.id, chat_id, question)
    return JSONResponse(content=response, status_code=status.HTTP_200_OK)
