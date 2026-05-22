from typing import List, Dict
import os
from typing import Optional


class RAGEngine:
    """Retrieval Augmented Generation engine for comparing papers.

    This class prefers ChromaDB when available, but falls back to a
    lightweight in-memory vector store (using SentenceTransformer +
    sklearn/numpy) when Chroma/compiled deps aren't present. That makes
    local development easier on Windows machines without build tools.
    """

    def __init__(self, persist_directory: str = "./vector_store/chroma_data"):
        self.persist_directory = persist_directory

        # Try to import ChromaDB; if unavailable, use an in-memory store.
        try:
            import chromadb  # type: ignore
            from chromadb.config import Settings  # type: ignore
            from sentence_transformers import SentenceTransformer

            # Initialize ChromaDB (lazy, only when available)
            self.client = chromadb.Client(Settings(
                persist_directory=persist_directory,
                anonymized_telemetry=False
            ))

            # Initialize embeddings model
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name="research_papers",
                metadata={"description": "Research paper embeddings for RAG"}
            )

            self._backend = 'chroma'

        except Exception:
            # Fallback implementation using SentenceTransformer + numpy/sklearn
            from sentence_transformers import SentenceTransformer
            import numpy as np
            try:
                from sklearn.neighbors import NearestNeighbors
            except Exception:
                NearestNeighbors = None  # type: ignore

            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

            class InMemoryCollection:
                def __init__(self, embedding_model):
                    self.embedding_model = embedding_model
                    self.documents: List[str] = []
                    self.metadatas: List[Dict] = []
                    self.ids: List[str] = []
                    self.embeddings = None
                    self._nn = None

                def add(self, documents: List[str], metadatas: List[Dict], ids: List[str]):
                    self.documents.extend(documents)
                    self.metadatas.extend(metadatas)
                    self.ids.extend(ids)
                    # compute embeddings for newly added documents
                    embs = self.embedding_model.encode(documents, show_progress_bar=False)
                    if self.embeddings is None:
                        self.embeddings = embs
                    else:
                        import numpy as _np

                        self.embeddings = _np.vstack([self.embeddings, embs])
                    # reset neighbor index
                    self._nn = None

                def query(self, query_texts: List[str], n_results: int = 5):
                    import numpy as _np

                    q_embs = self.embedding_model.encode(query_texts, show_progress_bar=False)
                    if self.embeddings is None or len(self.documents) == 0:
                        return {'documents': [[] for _ in query_texts], 'metadatas': [[] for _ in query_texts], 'distances': [[] for _ in query_texts]}

                    # local helpers (avoid name clash)
                    _np = __import__('numpy')
                    q = _np.array(q_embs)
                    E = _np.array(self.embeddings)
                    # cosine similarities
                    q_norm = q / (_np.linalg.norm(q, axis=1, keepdims=True) + 1e-12)
                    E_norm = E / (_np.linalg.norm(E, axis=1, keepdims=True) + 1e-12)
                    sims = q_norm @ E_norm.T

                    results_docs = []
                    results_metas = []
                    results_dists = []
                    for row in sims:
                        # get top-k indices by similarity
                        idx = _np.argsort(-row)[:n_results]
                        docs = [self.documents[i] for i in idx]
                        metas = [self.metadatas[i] for i in idx]
                        # convert similarity to distance-like (1 - sim)
                        dists = [float(1.0 - float(row[i])) for i in idx]
                        results_docs.append(docs)
                        results_metas.append(metas)
                        results_dists.append(dists)

                    return {'documents': results_docs, 'metadatas': results_metas, 'distances': results_dists}

            # attach a simple in-memory collection instance
            self.collection = InMemoryCollection(self.embedding_model)
            self._backend = 'inmemory'
    
    def add_paper_to_store(self, paper_id: str, sections: Dict[str, str]):
        """Add a paper's sections to the vector store"""
        documents = []
        metadatas = []
        ids = []
        
        for section_name, content in sections.items():
            if content and len(content) > 50:
                # Split long sections into chunks
                chunks = self._chunk_text(content, max_length=500)
                
                for i, chunk in enumerate(chunks):
                    documents.append(chunk)
                    metadatas.append({
                        'paper_id': paper_id,
                        'section': section_name,
                        'chunk_id': i
                    })
                    ids.append(f"{paper_id}_{section_name}_{i}")
        
        if documents:
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
    
    def retrieve_similar_content(
        self, 
        query_text: str, 
        n_results: int = 5,
        exclude_paper_id: str = None
    ) -> List[Dict]:
        """Retrieve similar content from the vector store"""
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results * 2  # Get more to filter
        )
        
        similar_content = []
        for i, doc in enumerate(results['documents'][0]):
            metadata = results['metadatas'][0][i]
            
            # Skip results from the same paper
            if exclude_paper_id and metadata['paper_id'] == exclude_paper_id:
                continue
            
            similar_content.append({
                'content': doc,
                'paper_id': metadata['paper_id'],
                'section': metadata['section'],
                'distance': results['distances'][0][i] if 'distances' in results else None
            })
            
            if len(similar_content) >= n_results:
                break
        
        return similar_content
    
    def compare_novelty(self, paper_sections: Dict[str, str], paper_id: str) -> Dict:
        """Compare paper with existing literature for novelty assessment"""
        # Combine key sections for novelty check
        novelty_text = f"{paper_sections.get('abstract', '')} {paper_sections.get('methodology', '')}"
        
        similar_papers = self.retrieve_similar_content(
            query_text=novelty_text,
            n_results=5,
            exclude_paper_id=paper_id
        )
        
        return {
            'similar_count': len(similar_papers),
            'similar_papers': similar_papers,
            'has_similar_work': len(similar_papers) > 0
        }
    
    def _chunk_text(self, text: str, max_length: int = 500) -> List[str]:
        """Split text into chunks of maximum length"""
        words = text.split()
        chunks = []
        current_chunk = []
        current_length = 0
        
        for word in words:
            current_chunk.append(word)
            current_length += len(word) + 1
            
            if current_length >= max_length:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
                current_length = 0
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
