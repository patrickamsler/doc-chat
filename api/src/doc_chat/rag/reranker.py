import os
from pathlib import Path
from typing import Dict, Any

from flashrank import Ranker, RerankRequest

from doc_chat.rag.weaviate_vector_store import DocumentChunk

# Disable tokenizer parallelism to avoid warnings when forking processes
os.environ["TOKENIZERS_PARALLELISM"] = "false"


class Reranker:
    def __init__(self,
          model_name: str = "ms-marco-MiniLM-L-12-v2",
          max_length: int = 256,
          cache_dir: str = "/tmp/doc-chat/models"
    ):
        # Ensure cache directory exists
        Path(cache_dir).mkdir(parents=True, exist_ok=True)

        self.ranker = Ranker(max_length=max_length,
                             model_name=model_name,
                             cache_dir=cache_dir)

    def rerank(self, query: str, documents: list[DocumentChunk]) \
          -> list[DocumentChunk]:
        """
        Rerank the given documents based on the query using the FlashRank model.
        """
        if not documents:
            return []
        if not query:
            return documents

        passages = [self._to_passage(doc) for doc in documents]
        rerank_request = RerankRequest(query=query, passages=passages)

        # Rank the documents
        results = self.ranker.rerank(rerank_request)

        # sort the documents based on the rerank results
        id_to_doc = {doc.chunk_id: doc for doc in documents}
        sorted_docs = [id_to_doc[r['id']] for r in results]

        return sorted_docs

    @staticmethod
    def _to_passage(doc: DocumentChunk) -> Dict[str, Any]:
        return {
            "id": doc.chunk_id,
            "text": doc.page_content,
            "meta": {"page": doc.page_number}
        }
