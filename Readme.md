![CI](https://github.com/patrickamsler/doc-chat/actions/workflows/ci.yml/badge.svg?branch=master)

# Doc Chat


## How to run the project locally

### API backend

```bash
cd api
```

Add a `.env` file in within the api folder with the following content:
```
OPENAI_API_KEY=<your-openai-api-key>
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=<your-langsmith-api-key>
LANGSMITH_PROJECT=doc-chat
GUEST_SIGNING_SECRET=<the-secret-key-for-guest-authentication>
UPLOAD_FOLDER=/tmp/doc-chat/uploads
CHROMA_TMP_DIR=/tmp/doc-chat/chroma
```

Create the virtual environment and install the dependencies:
```bash
python -m venv venv
source venv/bin/activat
pip install -r requirements.txt
pip install -e .
```

Start the server by running the following command:
```bash
 uvicorn doc_chat.main:app --reload
```

- Redoc will be available at `http://127.0.0.1:8000/redoc`
- Swagger UI will be available at `http://127.0.0.1:8000/docs`


Run the tests by running the following command:
```bash
pytest
```

### Frontend

Build and run the frontend by running the following commands:

```bash
cd client
npm install
npm start
```

Run the tests by running the following command:
```bash
npm test
```