import logging
import os
import shutil

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi import File, UploadFile, HTTPException
from fastapi import status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from werkzeug.utils import secure_filename

from doc_chat.rag.chat import QueryResponse
from doc_chat.rag.chat_service import ChatService
from doc_chat.token_util import create_token

# Load environment variables before anything else
load_dotenv()

app = FastAPI()
# very permissive CORS, adjust origins/methods for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # which domains can call
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # any headers (e.g. Authorization)
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

ALLOWED_EXTENSIONS = {'pdf'}
DEFAULT_USER_ID = 'default_user'

logger = logging.getLogger("main")
chat_service = ChatService()


class ChatQueryRequest(BaseModel):
    token: str
    question: str

class UploadFileResponse(BaseModel):
    token: str
    message: str

@app.post("/chat", response_model=UploadFileResponse)
async def upload_file(file: UploadFile = File(...)):
    if file.filename == '':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="No file selected")

    if not allowed_file(file.filename):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid file")

    token = create_token()
    logger.info(f"Created token: {token}")

    file_path = save_file(file, token)
    logger.info(f"Saved file: {file_path}")

    chat_service.create_document_chat(DEFAULT_USER_ID, token, file_path)

    return JSONResponse(
        content=UploadFileResponse(token=token,
                                   message="File uploaded successfully"),
        status_code=status.HTTP_201_CREATED
    )


@app.post('/chat/query', response_model=QueryResponse)
def query(request: ChatQueryRequest):
    token = request.token
    question = request.question
    logger.debug(f"read_item called with token={token}, question={question}")

    response = chat_service.query(DEFAULT_USER_ID, token, question)
    return JSONResponse(content=response, status_code=status.HTTP_200_OK)


def save_file(file, token) -> str:
    filename = secure_filename(file.filename)
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER")
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    file_path = os.path.join(UPLOAD_FOLDER, token + '_' + filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return str(file_path)


def allowed_file(filename) -> bool:
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[
        1].lower() in ALLOWED_EXTENSIONS

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )