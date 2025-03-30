import os
import secrets

from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

from doc_chat.rag.chat import Chat

app = Flask(__name__)

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "/tmp/doc-chat/uploads")
ALLOWED_EXTENSIONS = {'pdf'}

chats_session = {}

@app.route('/chat', methods=['POST'])
def upload_file():
    # Check if the request contains a file part
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not file or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file"}), 400

    token = create_token()
    print("created token: ", token)

    file_path = save_file(file, token)
    print("saved file: ", file_path)

    chat = Chat(file_path=file_path, token=token)
    print("created chat", chat)

    chats_session[token] = chat
    return jsonify({
        "token": token,
        "message": "File uploaded successfully"
    }), 201

@app.route('/chat/query', methods=['POST'])
def query():
    token = request.json.get('token')
    question = request.json.get('question')
    if token not in chats_session:
        return jsonify({"error": "Invalid token"}), 400

    chat = chats_session[token]
    print("For token: ", token)
    print("Load chat: ", chat)
    response = chat.query(question)
    return jsonify(response), 200

def create_token() -> str:
    return secrets.token_urlsafe(16)

def save_file(file, token) -> str:
    filename = secure_filename(file.filename)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    file_path = os.path.join(UPLOAD_FOLDER, token + '_' + filename)
    file.save(file_path)
    return str(file_path)

def allowed_file(filename) -> bool:
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if __name__ == '__main__':
    # Set memory limit to 1GB
    # import resource
    # resource.setrlimit(resource.RLIMIT_AS, (1024 * 1024, -1))
    app.run(debug=True)