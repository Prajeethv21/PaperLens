import fitz  # PyMuPDF
import re
from typing import Dict
from models.schemas import PaperSection

class PDFParser:
    """Parse research papers and extract structured sections"""
    
    def __init__(self):
        self.section_patterns = {
            'abstract': r'(?i)abstract',
            'introduction': r'(?i)introduction',
            'methodology': r'(?i)(methodology|methods|materials\s+and\s+methods)',
            'results': r'(?i)results',
            'conclusion': r'(?i)(conclusion|discussion)',
            'references': r'(?i)(references|bibliography)',
        }
    
    def extract_text(self, pdf_path: str) -> str:
        """Extract all text from PDF"""
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    
    def find_section_boundaries(self, text: str) -> Dict[str, tuple]:
        """Find start and end positions of each section"""
        boundaries = {}
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            for section_name, pattern in self.section_patterns.items():
                if re.search(pattern, line.strip()) and len(line.strip()) < 50:
                    if section_name not in boundaries:
                        boundaries[section_name] = i
        
        return boundaries
    
    def extract_sections(self, text: str) -> PaperSection:
        """Extract structured sections from paper"""
        lines = text.split('\n')
        boundaries = self.find_section_boundaries(text)
        
        # Sort boundaries by position
        sorted_sections = sorted(boundaries.items(), key=lambda x: x[1])
        
        sections_text = {}
        for i, (section_name, start_idx) in enumerate(sorted_sections):
            # Get end index (start of next section or end of document)
            end_idx = sorted_sections[i + 1][1] if i + 1 < len(sorted_sections) else len(lines)
            sections_text[section_name] = '\n'.join(lines[start_idx:end_idx])
        
        # Extract references as a list
        references = []
        if 'references' in sections_text:
            ref_text = sections_text['references']
            # Simple reference extraction (can be improved)
            references = [ref.strip() for ref in ref_text.split('\n') if ref.strip() and len(ref.strip()) > 20]
        
        return PaperSection(
            abstract=sections_text.get('abstract', ''),
            introduction=sections_text.get('introduction', ''),
            methodology=sections_text.get('methodology', ''),
            results=sections_text.get('results', ''),
            conclusion=sections_text.get('conclusion', ''),
            references=references[:50]  # Limit to 50 references
        )
    
    def get_word_count(self, text: str) -> int:
        """Get word count of text"""
        return len(text.split())
    
    def get_metadata(self, pdf_path: str) -> Dict:
        """Extract PDF metadata"""
        doc = fitz.open(pdf_path)
        metadata = doc.metadata
        doc.close()
        return metadata
