from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from models.schemas import UploadResponse
from middleware.rate_limiter import rate_limit_dependency
from middleware.validator import InputValidator
from middleware.security import validate_file_size, validate_file_type, validate_file_magic_bytes
import shutil
import os
import uuid
from pathlib import Path
import fitz  # PyMuPDF
import re

router = APIRouter()

# Create uploads directory
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Configuration
MAX_FILE_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", 10 * 1024 * 1024))  # Default 10MB
ALLOWED_EXTENSIONS = {'.pdf'}

def validate_research_paper(pdf_path: str) -> tuple[bool, str]:
    """
    Validate if the PDF is a research paper
    Returns: (is_valid, error_message)
    
    Security: Validates file content to prevent malicious uploads
    """
    try:
        doc = fitz.open(pdf_path)
        text = ""
        
        # Limit pages to prevent DoS (max 500 pages)
        max_pages = min(len(doc), 500)
        
        for page_num in range(max_pages):
            text += doc[page_num].get_text()
            
            # Limit extraction to prevent memory exhaustion
            if len(text) > 1000000:  # 1MB of text
                break
                
        doc.close()
        
        # Check minimum word count (research papers should have at least 1000 words)
        word_count = len(text.split())
        if word_count < 1000:
            return False, "Document is too short to be a research paper (minimum 1000 words required)"
        
        # Check for key research paper sections
        text_lower = text.lower()
        required_sections = ['abstract', 'introduction', 'references']
        found_sections = []
        
        for section in required_sections:
            # Look for section headers
            pattern = r'\b' + section + r'\b'
            if re.search(pattern, text_lower):
                found_sections.append(section)
        
        if len(found_sections) < 2:
            missing = [s for s in required_sections if s not in found_sections]
            return False, f"This doesn't appear to be a research paper. Missing key sections: {', '.join(missing)}"
        
        # Check for academic indicators (citations, figures, tables)
        has_citations = bool(re.search(r'\[\d+\]|\(\d{4}\)|et al\.|doi:', text_lower))
        has_figures = bool(re.search(r'\bfig(ure)?\s*\d+\b', text_lower))
        has_tables = bool(re.search(r'\btable\s*\d+\b', text_lower))
        
        academic_indicators = sum([has_citations, has_figures, has_tables])
        
        if academic_indicators == 0:
            return False, "Document lacks academic indicators (citations, figures, or tables). Please upload a research paper."
        
        return True, ""
        
    except Exception as e:
        return False, f"Failed to validate document: {str(e)}"


@router.post("/upload", response_model=UploadResponse, dependencies=[Depends(rate_limit_dependency)])
async def upload_paper(file: UploadFile = File(...), request: Request = None):
    """
    Upload a research paper PDF
    
    Security features:
    - Rate limiting (prevents upload spam)
    - File size validation (prevents DoS)
    - File type validation (extension + magic bytes)
    - Filename sanitization (prevents path traversal)
    - Content validation (ensures it's a research paper)
    - Secure file storage with UUID naming
    
    Returns:
    - paper_id: Unique identifier for the paper
    - filename: Original filename (sanitized)
    - message: Success message
    """
    
    # Validate filename
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    sanitized_filename = InputValidator.validate_filename(file.filename)
    
    # Validate file extension
    if not validate_file_type(sanitized_filename, ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Read file content for validation
    file_content = await file.read()
    file_size = len(file_content)
    
    # Validate file size
    if not validate_file_size(file_size, MAX_FILE_SIZE):
        raise HTTPException(
            status_code=400, 
            detail=f"File size exceeds {MAX_FILE_SIZE // (1024*1024)}MB limit"
        )
    
    # Validate file magic bytes (ensure it's actually a PDF)
    if not validate_file_magic_bytes(file_content):
        raise HTTPException(
            status_code=400, 
            detail="Invalid PDF file: file type mismatch"
        )
    
    # Generate unique paper ID (UUID4 for security)
    paper_id = str(uuid.uuid4())
    
    # Save file with UUID name (prevents filename conflicts and path traversal)
    file_path = UPLOAD_DIR / f"{paper_id}.pdf"
    
    try:
        # Write file content
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Validate if it's a research paper
    is_valid, error_message = validate_research_paper(str(file_path))
    if not is_valid:
        # Delete the uploaded file if validation fails (cleanup)
        try:
            file_path.unlink()
        except:
            pass
        raise HTTPException(status_code=400, detail=error_message)
    
    return UploadResponse(
        paper_id=paper_id,
        filename=sanitized_filename,
        message="File uploaded successfully"
    )

@router.get("/upload/{paper_id}")
async def get_upload_status(paper_id: str):
    """
    Check if a paper has been uploaded
    
    Security: Validates paper_id format to prevent path traversal
    """
    # Validate paper_id format (UUID)
    validated_paper_id = InputValidator.validate_uuid(paper_id)
    
    file_path = UPLOAD_DIR / f"{validated_paper_id}.pdf"
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Paper not found")
    
    # Get file stats
    file_stats = file_path.stat()
    
    return {
        "paper_id": validated_paper_id,
        "status": "uploaded",
        "file_size": file_stats.st_size
    }

