from typing import List, Dict
import os

class RAGEngine:
    """Retrieval Augmented Generation engine for comparing papers"""
    
    def __init__(self, persist_directory: str = "./vector_store/chroma_data"):
        self.persist_directory = persist_directory
        
        # Lazy import heavy dependencies
        import chromadb
        from chromadb.config import Settings
        from sentence_transformers import SentenceTransformer
        
        # Initialize ChromaDB
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
