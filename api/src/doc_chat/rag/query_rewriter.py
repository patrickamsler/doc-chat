from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, \
    HumanMessagePromptTemplate
from langchain_core.language_models import BaseChatModel

from doc_chat.models import ChatHistory

system_prompt_template = """
You are a query rewriting assistant. Your task is to transform user queries into clear, standalone questions optimized for semantic document retrieval.

OBJECTIVES:
- Create a self-contained query that can be understood without conversation history
- Resolve all pronouns ("it", "this", "that", "they" ...) with specific nouns from context
- Expand abbreviations and acronyms you recognize
- Correct spelling and grammatical errors
- Add missing context from conversation history to make the query complete
- Preserve technical terms, domain-specific jargon, and unfamiliar acronyms exactly as written

CONSTRAINTS:
- Output ONLY the rewritten query - no preamble, explanation, or commentary
- Do NOT attempt to answer the question
- Do NOT add citations, references, or additional information
- If an acronym or term is unfamiliar or domain-specific, keep it unchanged

"""

user_prompt_template = """
CONVERSATION HISTORY:
{history}

CURRENT QUERY:
{query}

"""


class QueryRewriter:
    def __init__(self, llm: BaseChatModel):
        self._llm = llm
        prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(system_prompt_template),
            HumanMessagePromptTemplate.from_template(user_prompt_template)
        ])
        self._chain = prompt | llm

    def rewrite(self, query: str, chat_history: ChatHistory) -> str:
        history_text = self._format_history(chat_history)
        result = self._chain.invoke({"history": history_text, "query": query})
        rewritten_query = result.content.strip()
        return rewritten_query

    @staticmethod
    def _format_history(chat_history: ChatHistory) -> str:
        if not chat_history.messages:
            return "No previous conversation."

        history_parts = []
        for msg in chat_history.messages:
            role = msg.role.upper()
            history_parts.append(f"{role}: {msg.content}")

        return "\n".join(history_parts)
