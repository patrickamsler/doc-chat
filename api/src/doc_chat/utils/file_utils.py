import os
import shutil

from fastapi import UploadFile

ALLOWED_EXTENSIONS = {'pdf'}


def build_file_path(user_id: str, chat_id: str) -> str:
    upload_folder = os.getenv("UPLOAD_FOLDER")
    user_folder = os.path.join(upload_folder, "user_" + user_id)
    return os.path.join(user_folder, "doc_" + chat_id + ".pdf")


def save_file(file: UploadFile, user_id: str, chat_id: str) -> str:
    file_path = build_file_path(user_id, chat_id)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return str(file_path)


def allowed_file(filename) -> bool:
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[
        1].lower() in ALLOWED_EXTENSIONS


def delete_file(user_id: str, chat_id: str) -> bool:
    file_path = build_file_path(user_id, chat_id)
    if os.path.exists(file_path):
        os.remove(file_path)
        return True
    else:
        return False
