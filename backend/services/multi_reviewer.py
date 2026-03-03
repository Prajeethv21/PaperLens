"""
Multi-Reviewer Simulation Service.

Creates distinct AI reviewer personas that independently evaluate a paper,
then a meta-reviewer aggregates outputs, identifies disagreements, and
produces a consensus score with a recommendation (NeurIPS / IEEE style).
"""
import re
from typing import Dict, List
from models.advanced_schemas import ReviewerPersona, MetaReview


# ── Persona definitions ──────────────────────────────────────────
PERSONAS = [
    {
        "id": "methodology_expert",
        "name": "Methodology Expert",
        "focus": "methodology",
        "rubric": [
            ("research_design", "Clear research design with defined hypotheses"),
            ("sample_validity", "Appropriate sample size and selection"),
            ("statistical_rigor", "Proper statistical analysis"),
            ("controls", "Adequate controls and comparison groups"),
            ("reproducibility", "Sufficient detail for replication"),
        ],
    },
    {
        "id": "industry_reviewer",
        "name": "Industry / Application Reviewer",
        "focus": "application",
        "rubric": [
            ("practical_value", "Clear practical or industrial application"),
            ("scalability", "Scalable solution or approach"),
            ("cost_efficiency", "Resource-efficient implementation"),
            ("real_world_data", "Tested on real-world data or scenarios"),
            ("deployment_ready", "Deployable with existing infrastructure"),
        ],
    },
    {
        "id": "statistical_reviewer",
        "name": "Statistical Rigor Reviewer",
        "focus": "statistics",
        "rubric": [
            ("significance", "Proper significance testing reported"),
            ("effect_size", "Effect sizes and confidence intervals"),
            ("baselines", "Adequate baseline comparisons"),
            ("overfitting", "Overfitting mitigation strategies"),
            ("metrics", "Appropriate evaluation metrics"),
        ],
    },
]


class MultiReviewerSimulator:
    """Simulate multiple independent AI reviewer personas."""

    def __init__(self):
        self.personas = PERSONAS

    # ── Single reviewer evaluation ────────────────────────────────
    def _evaluate_as_persona(
        self, persona: dict, paper_sections: Dict, references: List[str]
    ) -> ReviewerPersona:
        """Evaluate a paper from a specific persona's perspective."""
        methodology = paper_sections.get("methodology", "")
        results = paper_sections.get("results", "")
        abstract = paper_sections.get("abstract", "")
        conclusion = paper_sections.get("conclusion", "")
        full_text = f"{abstract} {methodology} {results} {conclusion}"

        strengths: List[str] = []
        weaknesses: List[str] = []
        total = 0
        earned = 0

        for key, criteria in persona["rubric"]:
            total += 20  # each item worth 20 points
            score = self._check_criteria(key, criteria, full_text, references)
            earned += score
            if score >= 14:
                strengths.append(f"[{criteria}] Well addressed (score {score}/20)")
            elif score >= 8:
                strengths.append(f"[{criteria}] Partially addressed (score {score}/20)")
            else:
                weaknesses.append(f"[{criteria}] Insufficiently addressed (score {score}/20)")

        final_score = min(100, max(0, int(earned)))
        confidence = 0.75 + (len(full_text) / 50000) * 0.2  # more text → more confident
        confidence = min(confidence, 0.95)

        review = self._generate_detailed_review(persona, strengths, weaknesses, final_score)

        return ReviewerPersona(
            reviewer_id=persona["id"],
            persona_name=persona["name"],
            score=final_score,
            strengths=strengths,
            weaknesses=weaknesses,
            detailed_review=review,
            confidence=round(confidence, 2),
        )

    def _check_criteria(
        self, key: str, criteria: str, text: str, references: List[str]
    ) -> int:
        """Heuristic scoring for a rubric criterion (0-20 scale)."""
        text_lower = text.lower()
        score = 6  # base

        keyword_groups = {
            "research_design": ["hypothesis", "research design", "framework", "model", "approach"],
            "sample_validity": ["sample size", "participants", "n =", "population", "dataset"],
            "statistical_rigor": ["p-value", "p <", "significant", "anova", "t-test", "regression", "chi-square"],
            "controls": ["control group", "baseline", "comparison", "ablation"],
            "reproducibility": ["github", "code avail", "reproduce", "hyperparameter", "implementation"],
            "practical_value": ["application", "industry", "real-world", "deploy", "product"],
            "scalability": ["scalab", "large-scale", "distributed", "efficient"],
            "cost_efficiency": ["cost", "resource", "time complex", "memory"],
            "real_world_data": ["real-world", "production", "field study", "case study"],
            "deployment_ready": ["deploy", "api", "service", "pipeline", "docker"],
            "significance": ["p-value", "p <", "statistical significance", "significant"],
            "effect_size": ["effect size", "cohen", "confidence interval", "ci"],
            "baselines": ["baseline", "state-of-the-art", "sota", "compared to", "outperform"],
            "overfitting": ["overfit", "regulariz", "dropout", "cross-validation", "early stop"],
            "metrics": ["accuracy", "f1", "precision", "recall", "auc", "rmse", "bleu"],
        }

        keywords = keyword_groups.get(key, [])
        matches = sum(1 for kw in keywords if kw in text_lower)
        score += min(matches * 3, 14)
        return min(score, 20)

    def _generate_detailed_review(
        self, persona: dict, strengths: List[str], weaknesses: List[str], score: int
    ) -> str:
        """Generate a natural-language review paragraph."""
        s_text = "\n".join(f"  + {s}" for s in strengths) if strengths else "  (none identified)"
        w_text = "\n".join(f"  - {w}" for w in weaknesses) if weaknesses else "  (none identified)"

        quality = "excellent" if score >= 80 else "good" if score >= 65 else "adequate" if score >= 50 else "below expectations"

        return f"""=== Review by {persona['name']} ===
Focus area: {persona['focus']}
Overall assessment: {quality} (Score: {score}/100)

Strengths:
{s_text}

Weaknesses:
{w_text}

Summary:
The paper is {quality} from a {persona['focus']} perspective. \
{'The strengths outweigh the weaknesses and the work is suitable for publication with minor revisions.' if score >= 65 else 'Significant improvements are needed before publication, particularly in addressing the weaknesses identified above.'}
"""

    # ── Run all reviewers ─────────────────────────────────────────
    def run_all_reviews(
        self, paper_sections: Dict, references: List[str]
    ) -> MetaReview:
        """Run all persona reviews and produce a meta-review."""
        reviews = [
            self._evaluate_as_persona(p, paper_sections, references)
            for p in self.personas
        ]
        return self._meta_review(reviews)

    # ── Meta-reviewer ─────────────────────────────────────────────
    def _meta_review(self, reviews: List[ReviewerPersona]) -> MetaReview:
        """Aggregate individual reviews into a meta-review."""
        scores = [r.score for r in reviews]
        avg = sum(scores) / len(scores) if scores else 0
        consensus = int(avg)

        # Detect disagreements (>15-point spread)
        disagreements = []
        for i, r1 in enumerate(reviews):
            for r2 in reviews[i + 1 :]:
                diff = abs(r1.score - r2.score)
                if diff > 15:
                    disagreements.append(
                        f"{r1.persona_name} ({r1.score}) vs "
                        f"{r2.persona_name} ({r2.score}): {diff}-point gap"
                    )

        # Recommendation
        if consensus >= 75:
            rec = "Accept"
        elif consensus >= 65:
            rec = "Weak Accept"
        elif consensus >= 50:
            rec = "Borderline"
        else:
            rec = "Reject"

        all_strengths = []
        all_weaknesses = []
        for r in reviews:
            all_strengths.extend(r.strengths[:2])
            all_weaknesses.extend(r.weaknesses[:2])

        summary = f"""Meta-Review Summary
==================
Number of reviewers: {len(reviews)}
Consensus score: {consensus}/100
Recommendation: {rec}

Score distribution: {', '.join(f'{r.persona_name}: {r.score}' for r in reviews)}

Top strengths across reviewers:
{chr(10).join(f'  + {s}' for s in all_strengths[:5])}

Key weaknesses noted:
{chr(10).join(f'  - {w}' for w in all_weaknesses[:5])}

{'Disagreements detected between reviewers - discussion recommended.' if disagreements else 'Reviewers are largely in agreement.'}
"""

        return MetaReview(
            individual_reviews=reviews,
            consensus_score=consensus,
            disagreements=disagreements,
            meta_summary=summary,
            recommendation=rec,
        )
