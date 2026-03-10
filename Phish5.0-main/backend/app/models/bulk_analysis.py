from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from datetime import datetime
from app.database import Base


class BulkAnalysisResult(Base):
    __tablename__ = "bulk_analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    email_content = Column(Text, nullable=False)
    classification = Column(String, nullable=False)
    trust_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    suspicious_phrases = Column(Text, default="")
    analysis_explanation = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
