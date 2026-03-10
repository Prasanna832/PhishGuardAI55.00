from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class BulkEmailItem(BaseModel):
    email_id: str = ""
    email_content: str


class BulkAnalyzeRequest(BaseModel):
    emails: List[BulkEmailItem]


class BulkAnalysisResultResponse(BaseModel):
    id: int
    email_content: str
    classification: str
    trust_score: float
    risk_level: str
    suspicious_phrases: str
    analysis_explanation: str
    created_at: datetime

    class Config:
        from_attributes = True


class BulkAnalyzeResponse(BaseModel):
    total: int
    results: List[BulkAnalysisResultResponse]
    summary: dict
