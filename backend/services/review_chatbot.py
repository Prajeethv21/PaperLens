"""
Interactive Review Chatbot Service.

Connected to the reviewed paper - users can ask questions like:
  "Why did you give low novelty score?"
  "Explain weaknesses simply"
  "Show missing citations"
  "Suggest improvements"

Uses RAG over paper content + generated reviews + detected issues.
Maintains conversation memory per session.
"""
import re
import uuid
import json
from typing import Dict, List, Optional
from pathlib import Path
from models.advanced_schemas import ChatMessage, ChatResponse


class ReviewChatbot:
    """Conversational chatbot grounded in paper content and reviews."""

    CONVERSATIONS_DIR = Path("./cache/conversations")

    def __init__(self):
        self.CONVERSATIONS_DIR.mkdir(parents=True, exist_ok=True)

    # ── conversation memory ───────────────────────────────────────
    def _load_conversation(self, conv_id: str) -> List[ChatMessage]:
        path = self.CONVERSATIONS_DIR / f"{conv_id}.json"
        if path.exists():
            data = json.loads(path.read_text(encoding="utf-8"))
            return [ChatMessage(**m) for m in data]
        return []

    def _save_conversation(self, conv_id: str, messages: List[ChatMessage]):
        path = self.CONVERSATIONS_DIR / f"{conv_id}.json"
        path.write_text(
            json.dumps([m.dict() for m in messages], ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    # ── intent detection ──────────────────────────────────────────
    def _detect_intent(self, message: str) -> str:
        """Classify user question into an intent category."""
        msg = message.lower()
        if any(w in msg for w in ["novelty", "originality", "novel", "new"]):
            return "novelty"
        if any(w in msg for w in ["method", "approach", "design", "experiment"]):
            return "methodology"
        if any(w in msg for w in ["clarity", "writing", "structure", "readab"]):
            return "clarity"
        if any(w in msg for w in ["citat", "reference", "source", "missing cit"]):
            return "citations"
        if any(w in msg for w in ["bias", "fair", "balanced"]):
            return "bias"
        if any(w in msg for w in ["weak", "problem", "issue", "concern"]):
            return "weaknesses"
        if any(w in msg for w in ["strength", "good", "strong", "positive"]):
            return "strengths"
        if any(w in msg for w in ["improv", "suggest", "recommend", "fix"]):
            return "improvements"
        if any(w in msg for w in ["score", "rating", "why"]):
            return "explain_score"
        if any(w in msg for w in ["accept", "publish", "conference"]):
            return "acceptance"
        if any(w in msg for w in ["simple", "easy", "explain", "eli5", "summary"]):
            return "simplify"
        return "general"

    # ── response generation ───────────────────────────────────────
    def chat(
        self,
        message: str,
        paper_sections: Dict,
        report_data: Dict,
        conversation_id: Optional[str] = None,
    ) -> ChatResponse:
        """Process a chat message and return a grounded response."""
        conv_id = conversation_id or str(uuid.uuid4())
        history = self._load_conversation(conv_id)

        intent = self._detect_intent(message)
        sources: List[str] = []
        reply = self._generate_reply(intent, message, paper_sections, report_data, sources)

        # Save conversation
        history.append(ChatMessage(role="user", content=message))
        history.append(ChatMessage(role="assistant", content=reply))
        # Keep last 20 messages
        if len(history) > 20:
            history = history[-20:]
        self._save_conversation(conv_id, history)

        return ChatResponse(reply=reply, conversation_id=conv_id, sources=sources)

    def _generate_reply(
        self,
        intent: str,
        message: str,
        sections: Dict,
        report: Dict,
        sources: List[str],
    ) -> str:
        """Generate a contextual reply based on intent and paper data."""

        novelty = report.get("novelty", {})
        methodology = report.get("methodology", {})
        clarity = report.get("clarity", {})
        citations = report.get("citations", {})
        bias = report.get("bias", {})
        multi = report.get("multi_review", {})

        if intent == "novelty":
            sources.append("novelty_evaluation")
            score = novelty.get("score", "N/A")
            expl = novelty.get("explanation", "No explanation available.")
            return (
                f"**Novelty Score: {score}/100**\n\n"
                f"{expl}\n\n"
                f"The score reflects how original the research contribution is "
                f"compared to existing work in the field."
            )

        if intent == "methodology":
            sources.append("methodology_evaluation")
            score = methodology.get("score", "N/A")
            expl = methodology.get("explanation", "No explanation available.")
            return (
                f"**Methodology Score: {score}/100**\n\n"
                f"{expl}\n\n"
                f"This score evaluates the rigor of the research design, "
                f"statistical analysis, and experimental controls."
            )

        if intent == "clarity":
            sources.append("clarity_evaluation")
            score = clarity.get("score", "N/A")
            return (
                f"**Clarity Score: {score}/100**\n\n"
                f"{clarity.get('explanation', 'No details available.')}"
            )

        if intent == "citations":
            sources.append("citation_evaluation")
            score = citations.get("score", "N/A")
            ref_text = ", ".join(sections.get("references", [])[:5])
            return (
                f"**Citation Quality Score: {score}/100**\n\n"
                f"{citations.get('explanation', '')}\n\n"
                f"Sample references found: {ref_text or 'none extracted'}"
            )

        if intent == "bias":
            sources.append("bias_detection")
            flags = bias.get("flags", [])
            flag_text = "\n".join(f"- {f}" for f in flags) if flags else "No significant biases detected."
            return (
                f"**Bias Detection Results:**\n\n"
                f"{flag_text}\n\n"
                f"Bias score: {bias.get('score', 'N/A')}/100 (lower is better)"
            )

        if intent == "weaknesses":
            sources.append("multi_review")
            weaknesses = []
            if multi and "individual_reviews" in multi:
                for r in multi["individual_reviews"]:
                    weaknesses.extend(r.get("weaknesses", []))
            if not weaknesses:
                weaknesses = ["No specific weaknesses identified in the current analysis."]
            w_text = "\n".join(f"- {w}" for w in weaknesses[:8])
            return f"**Key Weaknesses Identified:**\n\n{w_text}"

        if intent == "strengths":
            sources.append("multi_review")
            strengths = []
            if multi and "individual_reviews" in multi:
                for r in multi["individual_reviews"]:
                    strengths.extend(r.get("strengths", []))
            if not strengths:
                strengths = ["No specific strengths extracted yet."]
            s_text = "\n".join(f"- {s}" for s in strengths[:8])
            return f"**Key Strengths Identified:**\n\n{s_text}"

        if intent == "improvements":
            sources.extend(["methodology_evaluation", "clarity_evaluation", "citation_evaluation"])
            suggestions = []
            if methodology.get("score", 100) < 80:
                suggestions.append("Strengthen the methodology section with more detailed experimental design and statistical analysis.")
            if clarity.get("score", 100) < 75:
                suggestions.append("Improve writing clarity - consider shorter sentences and clearer transitions between sections.")
            if citations.get("score", 100) < 80:
                suggestions.append("Expand the reference list with more recent publications and ensure all claims are properly cited.")
            if not suggestions:
                suggestions.append("The paper scores well across all dimensions. Consider minor polishing for publication readiness.")
            return "**Improvement Suggestions:**\n\n" + "\n".join(f"{i+1}. {s}" for i, s in enumerate(suggestions))

        if intent == "explain_score":
            sources.extend(["novelty_evaluation", "methodology_evaluation", "clarity_evaluation", "citation_evaluation"])
            scores = {
                "Novelty": novelty.get("score", "N/A"),
                "Methodology": methodology.get("score", "N/A"),
                "Clarity": clarity.get("score", "N/A"),
                "Citations": citations.get("score", "N/A"),
            }
            avg = sum(v for v in scores.values() if isinstance(v, (int, float))) / max(
                sum(1 for v in scores.values() if isinstance(v, (int, float))), 1
            )
            breakdown = "\n".join(f"- **{k}**: {v}/100" for k, v in scores.items())
            return (
                f"**Score Breakdown:**\n\n{breakdown}\n\n"
                f"**Average: {avg:.0f}/100**\n\n"
                f"Each score is determined by analyzing the paper's content "
                f"against established research quality criteria. Ask about a "
                f"specific dimension for a detailed explanation."
            )

        if intent == "acceptance":
            sources.append("acceptance_prediction")
            pred = report.get("acceptance_prediction", {})
            if pred:
                return (
                    f"**Acceptance Prediction:**\n\n"
                    f"- Probability: {pred.get('probability', 'N/A')}%\n"
                    f"- Conference: {pred.get('conference', 'General')}\n"
                    f"- Fit Analysis: {pred.get('fit_analysis', 'N/A')}"
                )
            return "Acceptance prediction has not been generated yet. Run advanced analysis first."

        if intent == "simplify":
            sources.append("paper_abstract")
            abstract = sections.get("abstract", "No abstract available.")
            # Simplify: first 2 sentences
            sents = re.split(r"(?<=[.!?])\s+", abstract)
            simple = " ".join(sents[:2])
            return (
                f"**In simple terms:**\n\n{simple}\n\n"
                f"The paper was scored across Novelty ({novelty.get('score', '?')}), "
                f"Methodology ({methodology.get('score', '?')}), "
                f"Clarity ({clarity.get('score', '?')}), and "
                f"Citations ({citations.get('score', '?')})."
            )

        # ── general fallback ──────────────────────────────────────
        sources.append("paper_content")
        abstract = sections.get("abstract", "")[:200]
        return (
            f"I'm your AI review assistant for this paper. "
            f"Here's what I can help with:\n\n"
            f"- **Scores**: Ask about novelty, methodology, clarity, or citation scores\n"
            f"- **Weaknesses**: \"What are the weaknesses?\"\n"
            f"- **Strengths**: \"What are the strengths?\"\n"
            f"- **Improvements**: \"Suggest improvements\"\n"
            f"- **Bias**: \"Is there any bias?\"\n"
            f"- **Acceptance**: \"Will this paper be accepted?\"\n"
            f"- **Simplify**: \"Explain the paper simply\"\n\n"
            f"Paper abstract preview: {abstract}..."
        )
