import os
import shutil
import tempfile
import uuid
from io import BytesIO

import pytest
from fastapi import UploadFile

from doc_chat.file_util import save_file, allowed_file, build_file_path, \
    delete_file


@pytest.mark.usefixtures("monkeypatch")
def test_build_file_path(monkeypatch):
    # given
    monkeypatch.setenv("UPLOAD_FOLDER", "/tmp/uploads")
    user_id = uuid.uuid4().hex
    chat_id = uuid.uuid4().hex

    # when
    file_path = build_file_path(user_id, chat_id)

    # then
    assert file_path == "/tmp/uploads/user_" + user_id + "/doc_" + chat_id + ".pdf"


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
        assert os.path.dirname(file_path) == os.path.join(temp_dir,
                                                          "user_" + user_id)
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


@pytest.mark.usefixtures("monkeypatch")
def test_delete_file_success(monkeypatch):
    # Setup a temporary upload folder
    temp_dir = tempfile.mkdtemp()
    monkeypatch.setenv("UPLOAD_FOLDER", temp_dir)

    try:
        # given - create a test file
        user_id = str(uuid.uuid4())
        chat_id = str(uuid.uuid4())
        user_folder = os.path.join(temp_dir, f"user_{user_id}")
        os.makedirs(user_folder, exist_ok=True)
        test_file_path = os.path.join(user_folder, f"doc_{chat_id}.pdf")

        with open(test_file_path, "w") as f:
            f.write("test content")

        # Verify file exists before deletion
        assert os.path.exists(test_file_path)

        # when
        result = delete_file(user_id, chat_id)

        # then
        assert result is True
        assert not os.path.exists(test_file_path)
    finally:
        # Clean up
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)


@pytest.mark.usefixtures("monkeypatch")
def test_delete_file_not_exists(monkeypatch):
    # Setup a temporary upload folder
    temp_dir = tempfile.mkdtemp()
    monkeypatch.setenv("UPLOAD_FOLDER", temp_dir)

    try:
        # given - no file created
        user_id = str(uuid.uuid4())
        chat_id = str(uuid.uuid4())

        # when
        result = delete_file(user_id, chat_id)

        # then
        assert result is False
    finally:
        # Clean up
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
