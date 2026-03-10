from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AnalyzeRequest(BaseModel):
    email_content: str
    mode: str = "enterprise"  # "enterprise" or "vulnerable_user"


class AnalyzeResponse(BaseModel):
    classification: str  # Safe, Suspicious, Phishing
    trust_score: int  # 0-100 (100 = fully trusted)
    risk_level: str  # Low, Medium, High, Critical
    explanation: str
    detected_social_engineering_techniques: List[str]
    suspicious_phrases: List[str]
    awareness_coach: str
    prevention_advice: List[str]


class TrainingGenerateRequest(BaseModel):
    user_id: int
    simulation_type: str
    mistake_description: str


class TrainingResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    mistake_description: str
    why_dangerous: str
    prevention_tips: str
    completed: bool
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class ThreatReportCreate(BaseModel):
    email_content: str
    category: str = "Uncategorized"
    subject: str = ""
    sender_domain: str = ""
    severity: str = "medium"


class ThreatReportResponse(BaseModel):
    id: int
    category: str
    subject: str
    sender_domain: str
    severity: str
    created_at: datetime

    class Config:
        from_attributes = True
