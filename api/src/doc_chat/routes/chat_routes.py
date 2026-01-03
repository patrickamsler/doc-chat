import logging
import os
import uuid

from dotenv import load_dotenv
from fastapi import APIRouter
from fastapi import File, UploadFile, HTTPException, Depends
from fastapi import status
from fastapi.responses import JSONResponse, FileResponse, Response
from werkzeug.utils import secure_filename

from doc_chat.api_types import UploadFileResponse, QueryResponse, \
    ChatQueryRequest, ChatsResponse, ChatHistoryResponse
from doc_chat.file_util import save_file, allowed_file, build_file_path
from doc_chat.rag.chat_service import ChatService, get_chat_service
from doc_chat.security.security_helper import get_current_user, User

chat_router = APIRouter()
load_dotenv()

logger = logging.getLogger("chat_routes")


@chat_router.post("", response_model=UploadFileResponse)
async def upload_file(
      file: UploadFile = File(...),
      user: User = Depends(get_current_user),
      chat_service: ChatService = Depends(get_chat_service)
):
    if file.filename == '':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="No file selected")

    if not allowed_file(file.filename):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid file")

    chat_id = str(uuid.uuid4().hex)
    logger.info(f"User {user.id} uploading file with chat_id={chat_id}")

    file_path = save_file(file, user.id, chat_id)
    filename = secure_filename(file.filename)
    logger.info(f"File saved at: {file_path}")

    await chat_service.create_document_chat(user.id, chat_id, file_path,
                                            filename)

    response_model = UploadFileResponse(chatId=chat_id,
                                        message="File uploaded successfully")
    return JSONResponse(content=response_model.model_dump(),
                        status_code=status.HTTP_201_CREATED)


@chat_router.get("/{chat_id}/file")
async def download_file(
      chat_id: str,
      user: User = Depends(get_current_user),
      chat_service: ChatService = Depends(get_chat_service)
):
    file_path = build_file_path(user_id=user.id, chat_id=chat_id)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    chat = await chat_service.find_chat(user.id, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=chat.fileName
    )


@chat_router.post('/query', response_model=QueryResponse)
async def query(
      request: ChatQueryRequest,
      user: User = Depends(get_current_user),
      chat_service: ChatService = Depends(get_chat_service)
):
    chat_id = request.chatId
    question = request.question
    logger.info(
        f"User {user.id} querying with chat_id={chat_id} and question='{question}'")

    response = await chat_service.query(user.id, chat_id, question)
    return JSONResponse(content=response.model_dump(),
                        status_code=status.HTTP_200_OK)


@chat_router.get('', response_model=ChatsResponse)
async def find_all_chats(
      user: User = Depends(get_current_user),
      chat_service: ChatService = Depends(get_chat_service)
):
    logger.info(f"User {user.id} requesting all chats")
    chats = await chat_service.find_all_chats(user.id)
    return JSONResponse(
        content=chats.model_dump(),
        status_code=status.HTTP_200_OK)


@chat_router.get('/{chat_id}/history', response_model=ChatHistoryResponse)
async def get_chat_history(
      chat_id: str,
      user: User = Depends(get_current_user),
      chat_service: ChatService = Depends(get_chat_service)
):
    logger.info(f"User {user.id} requesting chat history for chat_id={chat_id}")
    try:
        history = await chat_service.get_chat_history(user.id, chat_id)
        return JSONResponse(
            content=history.model_dump(),
            status_code=status.HTTP_200_OK)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@chat_router.delete('/{chat_id}/history')
async def delete_chat_history(
      chat_id: str,
      user: User = Depends(get_current_user),
      chat_service: ChatService = Depends(get_chat_service)
):
    logger.info(f"User {user.id} deleting history for chat_id={chat_id}")
    try:
        await chat_service.clear_chat_history(user.id, chat_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@chat_router.delete('/{chat_id}')
async def delete_chat(
      chat_id: str,
      user: User = Depends(get_current_user),
      chat_service: ChatService = Depends(get_chat_service)
):
    logger.info(f"User {user.id} deleting chat {chat_id}")
    try:
        await chat_service.delete_chat(user.id, chat_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
