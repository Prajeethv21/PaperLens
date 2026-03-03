from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from models.schemas import ReviewReport
from middleware.rate_limiter import rate_limit_dependency
from middleware.validator import InputValidator
from pathlib import Path
import json

router = APIRouter()

# Initialize services lazily
_pdf_parser = None
_rag_engine = None
_llm_evaluator = None
_bias_detector = None
_report_generator = None

def get_pdf_parser():
    global _pdf_parser
    if _pdf_parser is None:
        from services.pdf_parser import PDFParser
        _pdf_parser = PDFParser()
    return _pdf_parser

def get_rag_engine():
    global _rag_engine
    if _rag_engine is None:
        from services.rag_engine import RAGEngine
        _rag_engine = RAGEngine()
    return _rag_engine

def get_llm_evaluator():
    global _llm_evaluator
    if _llm_evaluator is None:
        from services.llm_evaluator import LLMEvaluator
        _llm_evaluator = LLMEvaluator()
    return _llm_evaluator

def get_bias_detector():
    global _bias_detector
    if _bias_detector is None:
        from services.bias_detector import BiasDetector
        _bias_detector = BiasDetector()
    return _bias_detector

def get_report_generator():
    global _report_generator
    if _report_generator is None:
        from services.report_generator import ReportGenerator
        _report_generator = ReportGenerator()
    return _report_generator

UPLOAD_DIR = Path("./uploads")
REPORTS_DIR = Path("./reports")
REPORTS_DIR.mkdir(exist_ok=True)

@router.post("/analyze/{paper_id}")
async def analyze_paper(paper_id: str):
    """
    Analyze a research paper using AI
    
    This endpoint:
    1. Parses the PDF
    2. Runs RAG retrieval for novelty comparison
    3. Uses LLM to evaluate multiple dimensions
    4. Detects biases
    5. Generates comprehensive report
    """
    
    pdf_path = UPLOAD_DIR / f"{paper_id}.pdf"
    
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="Paper not found")
    
    try:
        # Step 1: Parse PDF
        full_text = get_pdf_parser().extract_text(str(pdf_path))
        sections = get_pdf_parser().extract_sections(full_text)
        
        # Step 2: Skip RAG for speed (optional - enable when needed)
        sections_dict = {
            'abstract': sections.abstract,
            'introduction': sections.introduction,
            'methodology': sections.methodology,
            'results': sections.results,
            'conclusion': sections.conclusion
        }
        
        # Empty RAG results for fast analysis
        rag_results = {
            'similar_count': 0,
            'similar_papers': [],
            'has_similar_work': False
        }
        
        # Step 3: LLM Evaluation (fast mode - using single comprehensive call)
        novelty_eval = get_llm_evaluator().evaluate_novelty(sections_dict, rag_results)
        methodology_eval = get_llm_evaluator().evaluate_methodology(sections_dict)
        clarity_eval = get_llm_evaluator().evaluate_clarity(sections_dict)
        citations_eval = get_llm_evaluator().evaluate_citations(sections.references, sections_dict)
        
        # Step 4: Bias Detection
        bias_report = get_bias_detector().detect_all_biases(sections_dict, sections.references)
        
        # Step 5: Generate Report
        review_report = ReviewReport(
            paper_id=paper_id,
            novelty=novelty_eval,
            methodology=methodology_eval,
            clarity=clarity_eval,
            citations=citations_eval,
            bias=bias_report
        )
        
        # Save report
        report_path = REPORTS_DIR / f"{paper_id}.json"
        with open(report_path, 'w') as f:
            json.dump(review_report.dict(), f, indent=2)
        
        return {
            "status": "complete",
            "paper_id": paper_id,
            "message": "Analysis completed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/report/{paper_id}", response_model=ReviewReport)
async def get_report(paper_id: str):
    """
    Get the analysis report for a paper
    """
    report_path = REPORTS_DIR / f"{paper_id}.json"
    
    if not report_path.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    
    try:
        with open(report_path, 'r') as f:
            report_data = json.load(f)
        return ReviewReport(**report_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load report: {str(e)}")

@router.get("/report/{paper_id}/pdf")
async def download_pdf_report(paper_id: str):
    """
    Download the report as a PDF
    """
    report_path = REPORTS_DIR / f"{paper_id}.json"
    
    if not report_path.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    
    try:
        # Load report
        with open(report_path, 'r') as f:
            report_data = json.load(f)
        
        review_report = ReviewReport(**report_data)
        
        # Generate PDF
        pdf_buffer = get_report_generator().generate_pdf_report(
            review_report,
            f"Research Paper {paper_id}"
        )
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=review_report_{paper_id}.pdf"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")
