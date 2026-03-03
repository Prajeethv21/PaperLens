"""
Reproducibility Checker, Hallucination Detector, Statistical Validity Analyzer,
Contribution Graph, Ethical Risk, AI Debate, Trend Prediction, Reviewer Bias.

All lightweight, rule-based implementations that run instantly.
"""
import re
from typing import Dict, List
from models.advanced_schemas import (
    ReproducibilityCheck, HallucinationFlag, HallucinationReport,
    StatisticalValidity, KnowledgeNode, KnowledgeEdge, ContributionGraph,
    EthicalRisk, DebateRound, DebateResult, TrendPrediction, ReviewerBiasReport,
    CitationWarning, CitationVerification,
)


# ═══════════════════════════════════════════════════════════════════
#  Reproducibility Checker
# ═══════════════════════════════════════════════════════════════════
class ReproducibilityChecker:
    COMPONENTS = {
        "hyperparameters": [r"learning rate", r"batch size", r"epoch", r"lr\s*=", r"hidden size"],
        "dataset_access": [r"publicly available", r"github\.com", r"dataset.*available", r"benchmark"],
        "experiment_setup": [r"hardware", r"gpu", r"cpu", r"training time", r"environment"],
        "training_details": [r"optimizer", r"adam", r"sgd", r"loss function", r"fine-tun"],
        "evaluation_protocol": [r"cross-validation", r"train.*test split", r"k-fold", r"held-out"],
        "code_availability": [r"code.*available", r"github", r"repository", r"open[- ]source"],
        "random_seeds": [r"random seed", r"seed\s*=", r"reproducib"],
    }

    def check(self, paper_sections: Dict) -> ReproducibilityCheck:
        text = " ".join(paper_sections.get(k, "") for k in ["methodology", "results", "conclusion"]).lower()
        present, missing = [], []
        for comp, patterns in self.COMPONENTS.items():
            found = any(re.search(p, text) for p in patterns)
            (present if found else missing).append(comp.replace("_", " ").title())
        score = round(len(present) / len(self.COMPONENTS) * 10, 1)
        analysis = f"Reproducibility score: {score}/10. Present: {', '.join(present) or 'none'}. Missing: {', '.join(missing) or 'none'}."
        return ReproducibilityCheck(score=score, missing_components=missing, present_components=present, detailed_analysis=analysis)


# ═══════════════════════════════════════════════════════════════════
#  Hallucination Detector
# ═══════════════════════════════════════════════════════════════════
class HallucinationDetector:
    PATTERNS = [
        ("vague_claim", r"(it is well[- ]known|obviously|clearly|undoubtedly)", "Vague or unsupported universal claim"),
        ("exaggerated", r"(vastly superior|dramatically outperforms|revolutionary|groundbreaking)", "Potentially exaggerated improvement claim"),
        ("unsupported_conclusion", r"(this proves that|we have shown conclusively|definitively demonstrates)", "Strong conclusion may lack sufficient evidence"),
        ("non_verifiable", r"(in our experience|anecdotally|we believe|we feel)", "Non-verifiable subjective statement"),
    ]

    def detect(self, paper_sections: Dict) -> HallucinationReport:
        text = " ".join(paper_sections.get(k, "") for k in ["abstract", "results", "conclusion"])
        flags = []
        for flag_type, pattern, desc in self.PATTERNS:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                context = text[max(0, match.start()-30):match.end()+50].strip()
                flags.append(HallucinationFlag(text=context, flag_type=flag_type, explanation=desc, confidence=0.7))
        risk = min(100, len(flags) * 15)
        summary = f"Found {len(flags)} potential hallucination(s). Risk score: {risk}/100."
        return HallucinationReport(flags=flags[:10], risk_score=risk, summary=summary)


# ═══════════════════════════════════════════════════════════════════
#  Statistical Validity Analyzer
# ═══════════════════════════════════════════════════════════════════
class StatisticalValidityAnalyzer:
    def analyze(self, paper_sections: Dict) -> StatisticalValidity:
        text = " ".join(paper_sections.get(k, "") for k in ["methodology", "results"]).lower()
        issues = []
        sig = bool(re.search(r"p\s*[<>=]\s*0\.\d|statistically significant", text))
        baselines = bool(re.search(r"baseline|state-of-the-art|sota|compared to", text))
        sample = re.search(r"n\s*=\s*(\d+)|sample.*?(\d+)", text)
        sample_ok = None
        if sample:
            n = int(sample.group(1) or sample.group(2) or 0)
            sample_ok = n >= 30
            if not sample_ok:
                issues.append(f"Sample size (n={n}) may be too small for reliable conclusions.")
        metrics = bool(re.search(r"accuracy|f1|precision|recall|auc|rmse|bleu|rouge", text))
        overfit = "low" if re.search(r"cross-valid|regulariz|dropout|early stop", text) else "moderate"
        if not sig:
            issues.append("No explicit statistical significance testing reported.")
        if not baselines:
            issues.append("No baseline comparisons found.")
        if overfit == "moderate":
            issues.append("Limited overfitting mitigation strategies detected.")
        score = 50
        if sig: score += 15
        if baselines: score += 15
        if sample_ok: score += 10
        if metrics: score += 10
        if overfit == "low": score += 10
        score = min(100, score)
        return StatisticalValidity(reliability_score=score, sample_size_adequate=sample_ok, baselines_compared=baselines, significance_claimed=sig, metrics_appropriate=metrics, overfitting_risk=overfit, issues=issues, summary=f"Statistical reliability: {score}/100. {len(issues)} issue(s) detected.")


# ═══════════════════════════════════════════════════════════════════
#  Contribution Graph Generator
# ═══════════════════════════════════════════════════════════════════
class ContributionGraphGenerator:
    def generate(self, paper_sections: Dict) -> ContributionGraph:
        nodes, edges = [], []
        abstract = paper_sections.get("abstract", "")
        methodology = paper_sections.get("methodology", "")

        # Problem node
        nodes.append(KnowledgeNode(id="problem", label="Research Problem", type="problem", description=abstract[:150]))
        # Method node
        nodes.append(KnowledgeNode(id="method", label="Proposed Method", type="method", description=methodology[:150]))
        edges.append(KnowledgeEdge(source="method", target="problem", relation="solves"))

        # Datasets
        datasets = re.findall(r"(?:dataset|benchmark|corpus)[\s:]*([A-Z][A-Za-z0-9\-]+)", methodology)
        for i, ds in enumerate(set(datasets[:3])):
            nid = f"dataset_{i}"
            nodes.append(KnowledgeNode(id=nid, label=ds, type="dataset"))
            edges.append(KnowledgeEdge(source="method", target=nid, relation="uses"))

        # Results
        results = paper_sections.get("results", "")
        if results:
            nodes.append(KnowledgeNode(id="results", label="Results", type="result", description=results[:150]))
            edges.append(KnowledgeEdge(source="method", target="results", relation="produces"))

        # Contributions
        contrib_patterns = re.findall(r"(we propose|we present|contribution)(.{5,80})", abstract, re.IGNORECASE)
        for i, (_, desc) in enumerate(contrib_patterns[:3]):
            nid = f"contrib_{i}"
            nodes.append(KnowledgeNode(id=nid, label=f"Contribution {i+1}", type="contribution", description=desc.strip()))
            edges.append(KnowledgeEdge(source=nid, target="problem", relation="contributes_to"))

        return ContributionGraph(nodes=nodes, edges=edges)


# ═══════════════════════════════════════════════════════════════════
#  Ethical & Bias Risk Analysis
# ═══════════════════════════════════════════════════════════════════
class EthicalRiskAnalyzer:
    def analyze(self, paper_sections: Dict) -> EthicalRisk:
        text = " ".join(paper_sections.values()).lower()
        dataset_concerns, demographic, safety, issues = [], [], [], []

        if re.search(r"imbalanc|skewed|underrepresent", text):
            dataset_concerns.append("Potential dataset imbalance detected.")
        if re.search(r"gender|race|ethnic|age group|demographic", text):
            demographic.append("Paper touches on demographic-sensitive variables.")
        if re.search(r"surveillance|weapon|military|face recogn", text):
            safety.append("Research may have dual-use safety implications.")
        if re.search(r"private|personal data|gdpr|consent", text):
            issues.append("Privacy/data protection considerations present.")

        total = len(dataset_concerns) + len(demographic) + len(safety) + len(issues)
        level = "high" if total >= 3 else "medium" if total >= 1 else "low"
        summary = f"Ethical risk level: {level}. {total} concern(s) flagged."
        return EthicalRisk(risk_level=level, issues=issues, dataset_concerns=dataset_concerns, demographic_bias=demographic, safety_concerns=safety, summary=summary)


# ═══════════════════════════════════════════════════════════════════
#  AI Debate Mode
# ═══════════════════════════════════════════════════════════════════
class AIDebateEngine:
    def debate(self, paper_sections: Dict, scores: Dict) -> DebateResult:
        abstract = paper_sections.get("abstract", "")[:300]
        novelty = scores.get("novelty", 50)
        methodology = scores.get("methodology", 50)

        rounds = []
        # Round 1: Novelty
        rounds.append(DebateRound(
            round_number=1,
            defender_argument=f"The paper presents a {'highly ' if novelty >= 75 else ''}novel approach. The abstract indicates original contributions: '{abstract[:100]}...' This addresses a clear gap in the literature.",
            critic_argument=f"With a novelty score of {novelty}/100, the originality {'is questionable' if novelty < 65 else 'could be stronger'}. {'The contribution appears incremental rather than transformative.' if novelty < 70 else 'While novel, the scope of innovation could be broader.'}",
        ))
        # Round 2: Methodology
        rounds.append(DebateRound(
            round_number=2,
            defender_argument=f"The methodology scores {methodology}/100, indicating {'rigorous' if methodology >= 75 else 'adequate'} experimental design. The research follows established protocols and provides sufficient detail for evaluation.",
            critic_argument=f"The methodology {'lacks some key components' if methodology < 70 else 'could be strengthened'}. {'Missing baseline comparisons and insufficient statistical testing weaken the claims.' if methodology < 65 else 'Additional ablation studies would strengthen the conclusions.'}",
        ))
        # Round 3: Overall
        avg = (novelty + methodology) / 2
        rounds.append(DebateRound(
            round_number=3,
            defender_argument=f"Overall, with an average score of {avg:.0f}/100, this paper {'makes a strong contribution' if avg >= 70 else 'has merit'} and {'is suitable for publication' if avg >= 65 else 'could be improved for resubmission'}.",
            critic_argument=f"While the paper has strengths, the overall quality ({avg:.0f}/100) {'needs improvement' if avg < 65 else 'is acceptable but not exceptional'}. Addressing the raised concerns would significantly improve the work.",
        ))

        strengths = [f"Novel approach (score: {novelty})"] if novelty >= 70 else []
        if methodology >= 70: strengths.append(f"Solid methodology (score: {methodology})")
        weaknesses = [f"Limited novelty (score: {novelty})"] if novelty < 65 else []
        if methodology < 65: weaknesses.append(f"Weak methodology (score: {methodology})")

        verdict = "Accept with minor revisions" if avg >= 70 else "Major revisions needed" if avg >= 55 else "Reject - significant improvements required"
        return DebateResult(rounds=rounds, final_verdict=verdict, strengths_confirmed=strengths, weaknesses_confirmed=weaknesses)


# ═══════════════════════════════════════════════════════════════════
#  Research Trend Prediction
# ═══════════════════════════════════════════════════════════════════
class TrendPredictor:
    RISING_KEYWORDS = ["transformer", "llm", "diffusion", "foundation model", "multimodal", "reinforcement learning from human", "graph neural", "federated"]
    STABLE_KEYWORDS = ["cnn", "lstm", "gan", "attention mechanism", "bert", "object detection"]
    DECLINING_KEYWORDS = ["svm", "random forest", "bag of words", "hand-crafted features", "shallow network"]

    def predict(self, paper_sections: Dict, references: List[str] = None) -> TrendPrediction:
        text = " ".join(paper_sections.values()).lower()
        rising = sum(1 for k in self.RISING_KEYWORDS if k in text)
        stable = sum(1 for k in self.STABLE_KEYWORDS if k in text)
        declining = sum(1 for k in self.DECLINING_KEYWORDS if k in text)

        if rising > stable and rising > declining:
            trend, conf = "rising", 0.7 + min(rising * 0.05, 0.25)
        elif declining > rising:
            trend, conf = "declining", 0.6 + min(declining * 0.05, 0.25)
        else:
            trend, conf = "stable", 0.6

        # Extract topic from abstract
        abstract = paper_sections.get("abstract", "")
        topic = " ".join(abstract.split()[:8]) or "Research area"
        related = [k for k in self.RISING_KEYWORDS if k in text][:4]

        reasoning = f"Based on keyword analysis: {rising} rising, {stable} stable, {declining} declining indicators found. The research area appears to be {trend} over the next 3 years."
        return TrendPrediction(topic=topic, trend=trend, confidence=round(conf, 2), reasoning=reasoning, related_trending_topics=related)


# ═══════════════════════════════════════════════════════════════════
#  Reviewer Bias Detection (Meta-AI)
# ═══════════════════════════════════════════════════════════════════
class ReviewerBiasDetector:
    def analyze(self, reviews: List[Dict]) -> ReviewerBiasReport:
        if not reviews:
            return ReviewerBiasReport(harshness_score=0.5, topic_bias=[], citation_favoritism=[], fairness_score=75, summary="No reviews to analyze.")

        scores = [r.get("score", 50) for r in reviews]
        avg = sum(scores) / len(scores)
        harshness = max(0, min(1, (70 - avg) / 70))  # lower avg = harsher

        topic_bias = []
        if max(scores) - min(scores) > 20:
            topic_bias.append(f"Score variance of {max(scores)-min(scores)} points suggests potential topic bias.")

        fairness = int(100 - harshness * 40 - len(topic_bias) * 15)
        fairness = max(0, min(100, fairness))

        summary = f"Harshness: {harshness:.2f} ({'harsh' if harshness > 0.6 else 'balanced' if harshness < 0.4 else 'moderate'}). Fairness: {fairness}/100."
        return ReviewerBiasReport(harshness_score=round(harshness, 2), topic_bias=topic_bias, citation_favoritism=[], fairness_score=fairness, summary=summary)


# ═══════════════════════════════════════════════════════════════════
#  Citation Verification Engine
# ═══════════════════════════════════════════════════════════════════
class CitationVerifier:
    def verify(self, paper_sections: Dict, references: List[str]) -> CitationVerification:
        text = " ".join(paper_sections.get(k, "") for k in ["introduction", "methodology", "results"])
        # Find in-text citations like [1], [Smith et al., 2020]
        cite_patterns = re.findall(r"\[(\d+)\]|\[([A-Z][a-z]+\s+et\s+al\.,?\s*\d{4})\]", text)
        total = len(cite_patterns)
        warnings = []

        # Check for common issues
        for ref in references[:10]:
            if len(ref) < 15:
                warnings.append(CitationWarning(claim_text="", cited_reference=ref, warning_type="irrelevant", explanation="Reference entry appears incomplete or malformed.", severity="low"))

        # Check for unsupported strong claims
        strong_claims = re.finditer(r"(significantly|dramatically|vastly|clearly)\s+\w+.*?(?:\.|$)", text, re.IGNORECASE)
        for match in list(strong_claims)[:3]:
            claim = match.group()[:150]
            nearby_cite = bool(re.search(r"\[\d+\]|\[[A-Z]", text[max(0, match.start()-50):match.end()+50]))
            if not nearby_cite:
                warnings.append(CitationWarning(claim_text=claim, cited_reference="none found", warning_type="unsupported", explanation="Strong claim without nearby citation.", severity="medium"))

        verified = max(0, total - len(warnings))
        score = int(verified / max(total, 1) * 100) if total > 0 else 60
        return CitationVerification(total_claims_checked=total, warnings=warnings[:10], verified_count=verified, verification_score=score)
