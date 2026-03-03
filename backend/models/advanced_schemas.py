"""
Advanced Pydantic schemas for PhD-level AI peer-review features.
Extends the base schemas without modifying them.
"""
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


# ─── Live Research RAG ────────────────────────────────────────────
class ExternalPaper(BaseModel):
    """A paper retrieved from ArXiv or Semantic Scholar"""
    title: str
    authors: List[str] = []
    abstract: str = ""
    year: Optional[int] = None
    source: str = "unknown"          # "arxiv" | "semantic_scholar"
    url: str = ""
    citation_count: Optional[int] = None
    relevance_score: float = 0.0


class LiveRAGResult(BaseModel):
    """Aggregated result from external + local RAG"""
    query_topic: str
    external_papers: List[ExternalPaper] = []
    local_papers: List[Dict[str, Any]] = []
    total_found: int = 0
    cached: bool = False


# ─── Multi-Reviewer Simulation ────────────────────────────────────
class ReviewerPersona(BaseModel):
    """A single AI reviewer's evaluation"""
    reviewer_id: str
    persona_name: str           # e.g. "Methodology Expert"
    score: int
    strengths: List[str]
    weaknesses: List[str]
    detailed_review: str
    confidence: float = 0.8     # 0-1


class MetaReview(BaseModel):
    """Aggregated meta-review from multiple reviewers"""
    individual_reviews: List[ReviewerPersona]
    consensus_score: int
    disagreements: List[str]
    meta_summary: str
    recommendation: str         # "Accept" / "Weak Accept" / "Borderline" / "Reject"


# ─── Acceptance Predictor ─────────────────────────────────────────
class ConferenceProfile(BaseModel):
    """Scoring profile for a specific conference"""
    name: str
    novelty_weight: float = 0.3
    methodology_weight: float = 0.25
    clarity_weight: float = 0.2
    citation_weight: float = 0.15
    reproducibility_weight: float = 0.1


class AcceptancePrediction(BaseModel):
    """Paper acceptance probability prediction"""
    probability: float
    confidence: float
    conference: str
    fit_analysis: str
    score_breakdown: Dict[str, float]


# ─── Literature Gap Detection ─────────────────────────────────────
class LiteratureGap(BaseModel):
    """A detected gap in the literature"""
    gap_description: str
    evidence: str
    severity: str               # "critical" / "moderate" / "minor"
    suggested_direction: str


class GapAnalysis(BaseModel):
    """Full gap analysis result"""
    paper_contributions: List[str]
    gaps_detected: List[LiteratureGap]
    future_directions: List[str]
    coverage_score: int         # 0-100


# ─── Citation Verification ────────────────────────────────────────
class CitationWarning(BaseModel):
    """A warning about a potentially problematic citation"""
    claim_text: str
    cited_reference: str
    warning_type: str           # "irrelevant" / "exaggerated" / "unsupported"
    explanation: str
    severity: str               # "high" / "medium" / "low"


class CitationVerification(BaseModel):
    """Full citation verification result"""
    total_claims_checked: int
    warnings: List[CitationWarning]
    verified_count: int
    verification_score: int     # 0-100


# ─── Reproducibility Checker ─────────────────────────────────────
class ReproducibilityCheck(BaseModel):
    """Reproducibility analysis result"""
    score: float                # 0-10
    missing_components: List[str]
    present_components: List[str]
    detailed_analysis: str


# ─── Hallucination Detector ──────────────────────────────────────
class HallucinationFlag(BaseModel):
    """A detected potential hallucination or unsupported claim"""
    text: str
    flag_type: str              # "vague_claim" / "unsupported_conclusion" / "exaggerated"
    explanation: str
    confidence: float


class HallucinationReport(BaseModel):
    """Full hallucination detection result"""
    flags: List[HallucinationFlag]
    risk_score: int             # 0-100
    summary: str


# ─── Statistical Validity ────────────────────────────────────────
class StatisticalValidity(BaseModel):
    """Statistical validity analysis"""
    reliability_score: int      # 0-100
    sample_size_adequate: Optional[bool] = None
    baselines_compared: bool = False
    significance_claimed: bool = False
    metrics_appropriate: bool = True
    overfitting_risk: str = "unknown"
    issues: List[str]
    summary: str


# ─── Contribution Graph ──────────────────────────────────────────
class KnowledgeNode(BaseModel):
    """A node in the knowledge graph"""
    id: str
    label: str
    type: str                   # "problem" / "method" / "dataset" / "result" / "contribution"
    description: str = ""


class KnowledgeEdge(BaseModel):
    """An edge in the knowledge graph"""
    source: str
    target: str
    relation: str               # "solves" / "uses" / "produces" / "contributes_to"


class ContributionGraph(BaseModel):
    """Structured knowledge graph for a paper"""
    nodes: List[KnowledgeNode]
    edges: List[KnowledgeEdge]


# ─── Ethical / Bias Risk ─────────────────────────────────────────
class EthicalRisk(BaseModel):
    """Ethical risk assessment"""
    risk_level: str             # "high" / "medium" / "low"
    issues: List[str]
    dataset_concerns: List[str]
    demographic_bias: List[str]
    safety_concerns: List[str]
    summary: str


# ─── AI Debate Mode ──────────────────────────────────────────────
class DebateRound(BaseModel):
    """One round of AI debate"""
    round_number: int
    defender_argument: str
    critic_argument: str


class DebateResult(BaseModel):
    """Full debate result"""
    rounds: List[DebateRound]
    final_verdict: str
    strengths_confirmed: List[str]
    weaknesses_confirmed: List[str]


# ─── Research Trend Prediction ───────────────────────────────────
class TrendPrediction(BaseModel):
    """Research area trend prediction"""
    topic: str
    trend: str                  # "rising" / "stable" / "declining"
    confidence: float
    reasoning: str
    related_trending_topics: List[str]


# ─── Reviewer Bias (Meta-AI) ────────────────────────────────────
class ReviewerBiasReport(BaseModel):
    """Analysis of bias in generated reviews"""
    harshness_score: float      # 0-1,  >0.7 = too harsh
    topic_bias: List[str]
    citation_favoritism: List[str]
    fairness_score: int         # 0-100
    summary: str


# ─── Chat ────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    """A single chat message"""
    role: str                   # "user" / "assistant"
    content: str
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    """Chat endpoint request"""
    paper_id: str
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Chat endpoint response"""
    reply: str
    conversation_id: str
    sources: List[str] = []


# ─── Enhanced Review Report ──────────────────────────────────────
class AdvancedReviewReport(BaseModel):
    """Extended review report with all advanced features"""
    paper_id: str
    # Core (same as existing)
    novelty: Any
    methodology: Any
    clarity: Any
    citations: Any
    bias: Any
    # Advanced features
    multi_review: Optional[MetaReview] = None
    acceptance_prediction: Optional[AcceptancePrediction] = None
    gap_analysis: Optional[GapAnalysis] = None
    citation_verification: Optional[CitationVerification] = None
    reproducibility: Optional[ReproducibilityCheck] = None
    hallucination_report: Optional[HallucinationReport] = None
    statistical_validity: Optional[StatisticalValidity] = None
    contribution_graph: Optional[ContributionGraph] = None
    ethical_risk: Optional[EthicalRisk] = None
    debate_result: Optional[DebateResult] = None
    trend_prediction: Optional[TrendPrediction] = None
    reviewer_bias: Optional[ReviewerBiasReport] = None
    live_rag: Optional[LiveRAGResult] = None
