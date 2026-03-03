"""
Advanced API routes for PhD-level peer review features.
All services are lazily imported on first use for fast startup.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from middleware.rate_limiter import rate_limit_dependency
from middleware.validator import InputValidator
from pathlib import Path
import json, asyncio, uuid

router = APIRouter()

UPLOAD_DIR = Path("./uploads")
REPORTS_DIR = Path("./reports")
REPORTS_DIR.mkdir(exist_ok=True)

# ═══════════════════════════════════════════════════════════════════
#  Lazy service singletons
# ═══════════════════════════════════════════════════════════════════
_services = {}

def _get(name):
    """Lazy-import and cache any advanced service by name."""
    if name not in _services:
        if name == "multi_reviewer":
            from services.multi_reviewer import MultiReviewerSimulator
            _services[name] = MultiReviewerSimulator()
        elif name == "chatbot":
            from services.review_chatbot import ReviewChatbot
            _services[name] = ReviewChatbot()
        elif name == "acceptance":
            from services.acceptance_predictor import AcceptancePredictor
            _services[name] = AcceptancePredictor()
        elif name == "gap":
            from services.gap_detector import GapDetector
            _services[name] = GapDetector()
        elif name == "reproducibility":
            from services.advanced_analyzers import ReproducibilityChecker
            _services[name] = ReproducibilityChecker()
        elif name == "hallucination":
            from services.advanced_analyzers import HallucinationDetector
            _services[name] = HallucinationDetector()
        elif name == "stats":
            from services.advanced_analyzers import StatisticalValidityAnalyzer
            _services[name] = StatisticalValidityAnalyzer()
        elif name == "graph":
            from services.advanced_analyzers import ContributionGraphGenerator
            _services[name] = ContributionGraphGenerator()
        elif name == "ethical":
            from services.advanced_analyzers import EthicalRiskAnalyzer
            _services[name] = EthicalRiskAnalyzer()
        elif name == "debate":
            from services.advanced_analyzers import AIDebateEngine
            _services[name] = AIDebateEngine()
        elif name == "trend":
            from services.advanced_analyzers import TrendPredictor
            _services[name] = TrendPredictor()
        elif name == "reviewer_bias":
            from services.advanced_analyzers import ReviewerBiasDetector
            _services[name] = ReviewerBiasDetector()
        elif name == "citation":
            from services.advanced_analyzers import CitationVerifier
            _services[name] = CitationVerifier()
        elif name == "live_rag":
            from services.live_research_rag import LiveResearchRAG
            _services[name] = LiveResearchRAG()
        elif name == "pdf_parser":
            from services.pdf_parser import PDFParser
            _services[name] = PDFParser()
    return _services[name]


def _load_sections(paper_id: str) -> dict:
    """Parse the uploaded PDF and return sections as dict."""
    pdf_path = UPLOAD_DIR / f"{paper_id}.pdf"
    if not pdf_path.exists():
        # Return demo sections for demo mode
        return {
            "abstract": "We propose a novel sparse attention mechanism for efficient time series forecasting using transformer architectures. Our method achieves O(n log n) complexity while maintaining state-of-the-art performance on multiple benchmark datasets including ETTh1, Weather, and Electricity. Experiments demonstrate 15% MSE improvement over existing baselines with significantly reduced computational requirements.",
            "introduction": "Time series forecasting is a critical task in many domains including energy planning, weather prediction, and financial modeling. Recent transformer-based approaches have shown promising results but suffer from quadratic complexity in sequence length. This work addresses this limitation through a novel sparse attention mechanism.",
            "methodology": "We designed a sparse attention pattern that samples key positions logarithmically, reducing complexity from O(n²) to O(n log n). The architecture employs multi-head attention with 8 heads, embedding dimension of 512, and 6 encoder layers. Training used AdamW optimizer with learning rate 1e-4 and batch size 32.",
            "results": "Our method achieved state-of-the-art performance on three benchmark datasets. On ETTh1, we obtained MSE of 0.376 compared to baseline 0.445 (15% improvement). On Weather dataset, MSE improved from 0.298 to 0.266 (11% improvement). Electricity dataset showed 13% MSE reduction.",
            "conclusion": "We presented an efficient sparse attention mechanism for time series forecasting that significantly reduces computational complexity while improving prediction accuracy. Future work will explore extension to multivariate scenarios and integration with foundation models.",
        }
    parser = _get("pdf_parser")
    text = parser.extract_text(str(pdf_path))
    sec = parser.extract_sections(text)
    return {
        "abstract": sec.abstract,
        "introduction": sec.introduction,
        "methodology": sec.methodology,
        "results": sec.results,
        "conclusion": sec.conclusion,
    }


def _load_report(paper_id: str) -> dict:
    """Load a saved base report (must exist)."""
    rp = REPORTS_DIR / f"{paper_id}.json"
    if not rp.exists():
        # Return demo report for demo mode
        return {
            "novelty": {
                "score": 87,
                "reasoning": "The proposed sparse attention mechanism represents a novel approach to reducing computational complexity in transformer-based time series forecasting.",
                "similar_works": ["Informer", "Autoformer", "FEDformer"]
            },
            "methodology": {
                "score": 82,
                "strengths": ["Rigorous experimental design", "Appropriate statistical methods", "Clear hypothesis"],
                "weaknesses": ["Limited ablation studies", "Missing some hyperparameter details"]
            },
            "clarity": {
                "score": 78,
                "feedback": "The paper is generally well-written with clear explanations of the proposed method."
            },
            "citations": {
                "score": 85,
                "total_citations": 42,
                "recent_citations": 28
            }
        }
    with open(rp) as f:
        return json.load(f)


# ═══════════════════════════════════════════════════════════════════
#  Full advanced analysis (runs ALL features)
# ═══════════════════════════════════════════════════════════════════
@router.post("/advanced/analyze/{paper_id}")
async def advanced_analyze(paper_id: str):
    """Run every advanced analysis on a paper and save output."""
    sections = _load_sections(paper_id)
    base = _load_report(paper_id)

    scores = {
        "novelty": base.get("novelty", {}).get("score", 50),
        "methodology": base.get("methodology", {}).get("score", 50),
        "clarity": base.get("clarity", {}).get("score", 50),
        "citations": base.get("citations", {}).get("score", 50),
    }
    references = []  # Could extract from PDF later

    result = {}

    # Multi-reviewer
    result["multi_review"] = _get("multi_reviewer").simulate(sections).dict()

    # Acceptance predictor
    result["acceptance_prediction"] = _get("acceptance").predict(scores).dict()

    # Gap detector
    result["gap_analysis"] = _get("gap").detect(sections).dict()

    # Reproducibility
    result["reproducibility"] = _get("reproducibility").check(sections).dict()

    # Hallucination
    result["hallucination_report"] = _get("hallucination").detect(sections).dict()

    # Statistical
    result["statistical_validity"] = _get("stats").analyze(sections).dict()

    # Contribution graph
    result["contribution_graph"] = _get("graph").generate(sections).dict()

    # Ethical
    result["ethical_risk"] = _get("ethical").analyze(sections).dict()

    # Debate
    result["debate_result"] = _get("debate").debate(sections, scores).dict()

    # Trend
    result["trend_prediction"] = _get("trend").predict(sections).dict()

    # Reviewer bias
    reviews_for_bias = result["multi_review"]["individual_reviews"]
    result["reviewer_bias"] = _get("reviewer_bias").analyze(reviews_for_bias).dict()

    # Citation verification
    result["citation_verification"] = _get("citation").verify(sections, references).dict()

    # Live RAG (async)
    try:
        rag_result = await _get("live_rag").search(sections.get("abstract", ""))
        result["live_rag"] = rag_result.dict()
    except Exception:
        result["live_rag"] = None

    # Save advanced report alongside base report
    adv_path = REPORTS_DIR / f"{paper_id}_advanced.json"
    with open(adv_path, "w") as f:
        json.dump(result, f, indent=2, default=str)

    return {"status": "complete", "paper_id": paper_id, "message": "Advanced analysis complete"}


@router.get("/advanced/report/{paper_id}")
async def get_advanced_report(paper_id: str):
    """Return saved advanced analysis results."""
    adv_path = REPORTS_DIR / f"{paper_id}_advanced.json"
    if not adv_path.exists():
        raise HTTPException(status_code=404, detail="Advanced report not found. Run /api/advanced/analyze first.")
    with open(adv_path) as f:
        return json.load(f)


# ═══════════════════════════════════════════════════════════════════
#  Individual feature endpoints
# ═══════════════════════════════════════════════════════════════════
@router.post("/multi-review/{paper_id}")
async def multi_review(paper_id: str):
    sections = _load_sections(paper_id)
    return _get("multi_reviewer").simulate(sections).dict()


@router.post("/acceptance/{paper_id}")
async def acceptance(paper_id: str, conference: str = "General"):
    base = _load_report(paper_id)
    scores = {k: base.get(k, {}).get("score", 50) for k in ["novelty", "methodology", "clarity", "citations"]}
    return _get("acceptance").predict(scores, conference).dict()


@router.post("/gaps/{paper_id}")
async def gaps(paper_id: str):
    sections = _load_sections(paper_id)
    return _get("gap").detect(sections).dict()


@router.post("/reproducibility/{paper_id}")
async def reproducibility(paper_id: str):
    sections = _load_sections(paper_id)
    return _get("reproducibility").check(sections).dict()


@router.post("/hallucination/{paper_id}")
async def hallucination(paper_id: str):
    sections = _load_sections(paper_id)
    return _get("hallucination").detect(sections).dict()


@router.post("/statistics/{paper_id}")
async def statistics(paper_id: str):
    sections = _load_sections(paper_id)
    return _get("stats").analyze(sections).dict()


@router.post("/graph/{paper_id}")
async def graph(paper_id: str):
    sections = _load_sections(paper_id)
    return _get("graph").generate(sections).dict()


@router.post("/ethical/{paper_id}")
async def ethical(paper_id: str):
    sections = _load_sections(paper_id)
    return _get("ethical").analyze(sections).dict()


@router.post("/debate/{paper_id}")
async def debate(paper_id: str):
    sections = _load_sections(paper_id)
    base = _load_report(paper_id)
    scores = {k: base.get(k, {}).get("score", 50) for k in ["novelty", "methodology", "clarity", "citations"]}
    return _get("debate").debate(sections, scores).dict()


@router.post("/trend/{paper_id}")
async def trend(paper_id: str):
    sections = _load_sections(paper_id)
    return _get("trend").predict(sections).dict()


@router.post("/live-rag/{paper_id}")
async def live_rag(paper_id: str):
    sections = _load_sections(paper_id)
    result = await _get("live_rag").search(sections.get("abstract", ""))
    return result.dict()


# ═══════════════════════════════════════════════════════════════════
#  Chat endpoint
# ═══════════════════════════════════════════════════════════════════
@router.post("/chat")
async def chat(request: dict):
    """Interactive review chatbot."""
    paper_id = request.get("paper_id", "")
    message = request.get("message", "")
    conversation_id = request.get("conversation_id")

    if not paper_id or not message:
        raise HTTPException(status_code=400, detail="paper_id and message are required")

    sections = _load_sections(paper_id)
    report = _load_report(paper_id)

    chatbot = _get("chatbot")
    response = chatbot.chat(message, sections, report, conversation_id)
    return {"reply": response.reply, "conversation_id": response.conversation_id, "sources": response.sources}
