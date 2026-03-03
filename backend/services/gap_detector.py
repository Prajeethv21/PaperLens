"""
Literature Gap Detection Service.
Extracts contributions, compares with related works,
identifies unexplored areas, and suggests future directions.
"""
import re
from typing import Dict, List
from models.advanced_schemas import LiteratureGap, GapAnalysis


class LiteratureGapDetector:
    """Detect gaps in the research literature relative to the uploaded paper."""

    CONTRIBUTION_MARKERS = [
        r"we propose", r"we present", r"we introduce", r"our contribution",
        r"this paper presents", r"we develop", r"novel approach", r"first to",
        r"we demonstrate", r"our method", r"we design", r"key contribution",
    ]

    GAP_INDICATORS = [
        ("limited_data", r"limited (data|dataset|sample)", "Limited dataset scope may restrict generalisability."),
        ("no_comparison", r"(not compared|no comparison|lacks comparison)", "Missing comparisons with recent methods."),
        ("future_work", r"future (work|research|direction|study)", "Authors acknowledge open questions."),
        ("assumption", r"(we assume|assuming that|under the assumption)", "Assumptions may not hold in all settings."),
        ("scalability", r"(scalab|large-scale|does not scale)", "Scalability to larger problems not verified."),
        ("domain_specific", r"(domain[- ]specific|specific domain)", "Results may not transfer across domains."),
    ]

    def analyze(self, paper_sections: Dict, external_papers: List[Dict] = None) -> GapAnalysis:
        full_text = " ".join(paper_sections.get(k, "") for k in ["abstract", "introduction", "methodology", "results", "conclusion"])

        contributions = self._extract_contributions(full_text)
        gaps = self._detect_gaps(full_text, external_papers or [])
        directions = self._suggest_directions(gaps, contributions)
        coverage = max(0, min(100, 50 + len(contributions) * 10 - len(gaps) * 8))

        return GapAnalysis(
            paper_contributions=contributions,
            gaps_detected=gaps,
            future_directions=directions,
            coverage_score=coverage,
        )

    def _extract_contributions(self, text: str) -> List[str]:
        contributions = []
        sentences = re.split(r"(?<=[.!?])\s+", text)
        for sent in sentences:
            for pattern in self.CONTRIBUTION_MARKERS:
                if re.search(pattern, sent, re.IGNORECASE):
                    clean = sent.strip()[:200]
                    if clean and clean not in contributions:
                        contributions.append(clean)
                    break
        return contributions[:8]

    def _detect_gaps(self, text: str, external: List[Dict]) -> List[LiteratureGap]:
        gaps = []
        for gap_id, pattern, desc in self.GAP_INDICATORS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                gaps.append(LiteratureGap(
                    gap_description=desc,
                    evidence=f"Found {len(matches)} occurrence(s) of related language in the paper.",
                    severity="moderate",
                    suggested_direction=f"Address the '{gap_id.replace('_', ' ')}' gap in future work.",
                ))

        if not external:
            gaps.append(LiteratureGap(
                gap_description="No external papers were retrieved for comparison.",
                evidence="Live Research RAG did not return related papers.",
                severity="minor",
                suggested_direction="Consider searching for related work on ArXiv or Semantic Scholar.",
            ))
        return gaps

    def _suggest_directions(self, gaps: List[LiteratureGap], contributions: List[str]) -> List[str]:
        directions = [g.suggested_direction for g in gaps]
        if contributions:
            directions.append("Extend the proposed contributions to additional domains or datasets.")
        if len(contributions) < 2:
            directions.append("Clarify and enumerate the specific novel contributions of this work.")
        return directions[:6]
