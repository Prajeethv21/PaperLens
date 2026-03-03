"""
Acceptance Probability Predictor.
Calculates acceptance likelihood using novelty, clarity, citation quality,
and reproducibility. Supports conference-specific profiles (ICML, NeurIPS, IEEE).
"""
from typing import Dict
from models.advanced_schemas import AcceptancePrediction, ConferenceProfile

CONFERENCE_PROFILES = {
    "NeurIPS": ConferenceProfile(name="NeurIPS", novelty_weight=0.35, methodology_weight=0.25, clarity_weight=0.15, citation_weight=0.10, reproducibility_weight=0.15),
    "ICML": ConferenceProfile(name="ICML", novelty_weight=0.30, methodology_weight=0.30, clarity_weight=0.15, citation_weight=0.10, reproducibility_weight=0.15),
    "IEEE": ConferenceProfile(name="IEEE", novelty_weight=0.20, methodology_weight=0.30, clarity_weight=0.20, citation_weight=0.20, reproducibility_weight=0.10),
    "ACL": ConferenceProfile(name="ACL", novelty_weight=0.30, methodology_weight=0.20, clarity_weight=0.25, citation_weight=0.15, reproducibility_weight=0.10),
    "General": ConferenceProfile(name="General", novelty_weight=0.25, methodology_weight=0.25, clarity_weight=0.20, citation_weight=0.15, reproducibility_weight=0.15),
}


class AcceptancePredictor:
    """Predict paper acceptance probability for top conferences."""

    def predict(self, scores: Dict[str, int], conference: str = "General") -> AcceptancePrediction:
        profile = CONFERENCE_PROFILES.get(conference, CONFERENCE_PROFILES["General"])
        novelty = scores.get("novelty", 50)
        methodology = scores.get("methodology", 50)
        clarity = scores.get("clarity", 50)
        citations = scores.get("citations", 50)
        reproducibility = scores.get("reproducibility", 50)

        weighted = (
            novelty * profile.novelty_weight
            + methodology * profile.methodology_weight
            + clarity * profile.clarity_weight
            + citations * profile.citation_weight
            + reproducibility * profile.reproducibility_weight
        )

        # Convert to probability (sigmoid-like mapping)
        if weighted >= 80:
            prob = 75 + (weighted - 80) * 1.25
        elif weighted >= 60:
            prob = 35 + (weighted - 60) * 2.0
        else:
            prob = max(5, weighted * 0.58)
        prob = min(prob, 98)

        confidence = 0.6 + min((sum(scores.values()) / 500) * 0.3, 0.35)

        fit = self._fit_analysis(scores, profile)

        return AcceptancePrediction(
            probability=round(prob, 1),
            confidence=round(confidence, 2),
            conference=profile.name,
            fit_analysis=fit,
            score_breakdown={
                "novelty_contrib": round(novelty * profile.novelty_weight, 1),
                "methodology_contrib": round(methodology * profile.methodology_weight, 1),
                "clarity_contrib": round(clarity * profile.clarity_weight, 1),
                "citation_contrib": round(citations * profile.citation_weight, 1),
                "reproducibility_contrib": round(reproducibility * profile.reproducibility_weight, 1),
            },
        )

    def _fit_analysis(self, scores: Dict, profile: ConferenceProfile) -> str:
        parts = []
        if scores.get("novelty", 0) >= 75:
            parts.append(f"Strong novelty aligns well with {profile.name}'s emphasis on original contributions.")
        else:
            parts.append(f"Novelty score may be below {profile.name}'s typical acceptance threshold.")
        if scores.get("methodology", 0) >= 75:
            parts.append("Methodology is rigorous enough for top-tier venues.")
        else:
            parts.append("Methodology improvements would strengthen the submission.")
        return " ".join(parts)
