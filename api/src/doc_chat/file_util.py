import os
import shutil

from fastapi import UploadFile

ALLOWED_EXTENSIONS = {'pdf'}

def save_file(file: UploadFile, user_id: str, chat_id: str) -> str:
    upload_folder = os.getenv("UPLOAD_FOLDER")

    # create upload folder if it doesn't exist
    os.makedirs(upload_folder, exist_ok=True)

    # create user directory if it doesn't exist
    user_folder = os.path.join(upload_folder, "user_" + user_id)
    os.makedirs(user_folder, exist_ok=True)

    # store file in user-specific folder
    file_path = os.path.join(user_folder, "doc_" + chat_id + ".pdf")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return str(file_path)


def allowed_file(filename) -> bool:
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[
        1].lower() in ALLOWED_EXTENSIONS