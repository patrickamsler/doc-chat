import tiktoken
from langchain_core.language_models import BaseChatModel
from langchain_openai import ChatOpenAI

chat_model = "gpt-4o-mini-2024-07-18"


def create_llm() -> BaseChatModel:
    return ChatOpenAI(
        model=chat_model,
        temperature=0.0,
        top_p=1.0,
        max_tokens=2048
    )


def get_num_tokens(message: str, model=chat_model) -> int:
    enc = tiktoken.encoding_for_model(model)
    return len(enc.encode(message))
