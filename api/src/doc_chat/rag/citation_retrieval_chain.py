import logging

from langchain.chains import StuffDocumentsChain, LLMChain
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, \
    HumanMessagePromptTemplate
from langchain_core.language_models import BaseChatModel
from langchain_core.vectorstores.base import BaseRetriever

from doc_chat.rag.multi_tenant_vector_store import VectorStoreDocument

logger = logging.getLogger("citation_retrieval_chain")

system_prompt_template = """
You are an assistant who answers questions **only** from the texts provided below.

Citation rules
1. After the answer, append the ID of each text you used, wrapped in square brackets.
   • Example (single source):  The river is the Seine. [TXT2]
   • Example (multiple sources):  Coffee was first cultivated in Yemen. [TXT3][TXT4]
2. If the answer cannot be found in the texts, reply exactly:  I don’t know

Output format (very important)
• Begin your reply **immediately** with the answer itself.  
• **Do not** add “Answer:”, “Here is the answer:”, or any other preamble.  
• End with the required citations only.
• Bad: `Answer: The river is the Seine. [TXT2]`  
• Good: `The river is the Seine. [TXT2]`

"""

user_prompt_template = """
{context}

"Question:```{question}```"
"""


class CitationRetrievalChain:
    def __init__(self, retriever: BaseRetriever, llm: BaseChatModel):
        self._retriever = retriever
        self._llm = llm
        prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(system_prompt_template),
            HumanMessagePromptTemplate.from_template(user_prompt_template)
        ])
        self._chain = prompt | llm

    def invoke(
          self, query,
          documents: list[VectorStoreDocument] = None,
          include_references_in_answer: bool = True
    ):
        if documents is None:
            # TODO remove this line and dependency on retriever
            documents = self._retriever.get_relevant_documents(query)
        context = self.create_context(documents)
        result = self._chain.invoke({"context": context, "question": query})
        content = result.content
        usage_metadata = result.usage_metadata
        print(result)
        answer, referenced_docs = self.replace_txt_with_page_numbers(content,
                                                                     documents,
                                                                     include_references_in_answer)
        logger.debug("query=%s, answer=%s, referenced_docs=%s usage_metadata=%s",
                    query, answer, referenced_docs, usage_metadata)
        return {
            'answer': answer,
            'referenced_documents': referenced_docs,
            'source_documents': documents
        }

    @staticmethod
    def create_context(documents):
        context_parts = []
        for i, doc in enumerate(documents):
            context_parts.append(f"[TXT{i + 1}]\n")
            context_parts.append(f"{doc.page_content}\n\n")
        return ''.join(context_parts)

    @staticmethod
    def replace_txt_with_page_numbers(answer, documents, include_references):
        page_ids = []
        referenced_docs = []

        for doc in documents:
            page_ids.append(doc.id)

        for i in range(len(page_ids)):
            text_ref = f"[TXT{i + 1}]"
            if text_ref in answer:
                referenced_docs.append(page_ids[i])
                if include_references:
                    answer = answer.replace(text_ref, f"<<{str(page_ids[i])}>>")
                else:
                    answer = answer.replace(text_ref, "")

        return answer.strip(), referenced_docs
