from langchain_openai import ChatOpenAI
from langchain_core.language_models import BaseChatModel

def create_llm() -> BaseChatModel:
    return ChatOpenAI(
        model="gpt-4o-mini-2024-07-18'",
        temperature=0.0,
        top_p=1.0,
        max_tokens=2048
    )
