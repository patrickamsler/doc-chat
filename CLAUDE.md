# CLAUDE.md

## Project Overview

Doc Chat is an AI-powered application that allows users to interact with PDF documents through a conversational
interface. Users can upload PDFs, ask questions about their content, and receive accurate answers with clickable
references to specific pages.

## Architecture

- **Backend**: FastAPI Python application with OpenAI integration
- **Frontend**: React TypeScript application
- **Vector Store**: Weaviate for semantic search (migrating from ChromaDB)
- **Document Processing**: LangChain for text splitting and embedding

## Development Setup

### Backend (API)

```bash
cd api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -e .
uvicorn doc_chat.main:app --reload
```

### Frontend

```bash
cd client
npm install
npm start
```

## Testing

- **Backend**: `pytest` (from api directory)
- **Frontend**: `npm test` (from client directory)

## Key Commands

- **Start API**: `uvicorn doc_chat.main:app --reload` (from api/)
- **Start Frontend**: `npm start` (from client/)
- **Run API Tests**: `pytest` (from api/)
- **Run Frontend Tests**: `npm test` (from client/)

## Environment Variables

Required `.env` file in api/ directory:

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

## Project Structure

- `api/` - FastAPI backend application
- `client/` - React frontend application
- `docker-compose.yaml` - Container orchestration
- `Readme.md` - Main project documentation

## API Endpoints

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Tech Stack

- **Backend**: Python, FastAPI, LangChain, Weaviate, OpenAI API
- **Frontend**: React, TypeScript, Styled Components, Axios
- **Testing**: pytest (backend), Jest/React Testing Library (frontend)

## Design Rules

### Python Code Standards

- **Imports**: All imports must be at the top of the file, organized in the following order:
    1. Standard library imports
    2. Third-party library imports
    3. Local application imports
- **Type Safety**: All Python methods must include type hints for parameters and return values
- **Example**:

```python
from typing import List, Optional
import asyncio

from fastapi import FastAPI
from pydantic import BaseModel

from doc_chat.models import Document


async def process_documents(docs: List[Document]) -> Optional[str]:
    # Implementation here
    pass
```

### General Code Guidelines

- Use descriptive variable and function names
- Follow existing code patterns and conventions in the project
- Ensure all new code includes appropriate error handling
- Write unit tests for new functionality

## Commit Message Template

This project uses a commit template (`.gitmessage`) with the following format:

```
# Short summary (50 chars or less)

# Detailed explanation (wrap at 72 chars)
# - What was changed and why
# - Any breaking changes
# - References to issues/tickets if applicable

```

The template is automatically configured for this repository. Use `git commit` (without `-m`) to use the template.