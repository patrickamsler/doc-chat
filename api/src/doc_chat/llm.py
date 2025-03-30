from langchain_openai import OpenAI
from langchain_core.language_models import BaseLLM

def create_llm() -> BaseLLM:
    return OpenAI(
        model='gpt-3.5-turbo-instruct',
        temperature=0,
        max_retries=2,
    )
