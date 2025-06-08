import os
import shutil
import tempfile
import uuid

import pytest
from fastapi import UploadFile
from io import BytesIO

from doc_chat.file_util import save_file, allowed_file


@pytest.mark.usefixtures("monkeypatch")
def test_save_file(monkeypatch):
    # Setup a temporary upload folder
    temp_dir = tempfile.mkdtemp()
    monkeypatch.setenv("UPLOAD_FOLDER", temp_dir)

    try:
        # given
        file_content = b"Test file content"
        file = UploadFile(filename="test_file.pdf", file=BytesIO(file_content))

        user_id = str(uuid.uuid4())
        chat_id = str(uuid.uuid4())

        # when
        file_path = save_file(file, user_id, chat_id)

        # Check if the file was saved correctly
        assert os.path.exists(file_path)
        assert os.path.basename(file_path) == f"doc_{chat_id}.pdf"
        assert os.path.dirname(file_path) == os.path.join(temp_dir, "user_" + user_id)
    finally:
        # Clean up the created folder and all its contents
        shutil.rmtree(temp_dir)


def test_allowed_file():
    assert allowed_file("document.pdf") is True
    assert allowed_file("image.png") is False
    assert allowed_file("archive.zip") is False
    assert allowed_file("no_extension") is False
    assert allowed_file("UPPER.PDF") is True
    assert allowed_file("mixed.PdF") is True
    assert allowed_file(".hiddenfile") is False