from pydantic import BaseModel
from typing import List, Optional

class PaperSection(BaseModel):
    abstract: str
    introduction: str
    methodology: str
    results: str
    conclusion: str
    references: List[str]

class ScoreExplanation(BaseModel):
    score: int
    explanation: str

class BiasReport(BaseModel):
    score: int
    flags: List[str]

class ReviewReport(BaseModel):
    paper_id: str
    novelty: ScoreExplanation
    methodology: ScoreExplanation
    clarity: ScoreExplanation
    citations: ScoreExplanation
    bias: BiasReport

class UploadResponse(BaseModel):
    paper_id: str
    filename: str
    message: str
