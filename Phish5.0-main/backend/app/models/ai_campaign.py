from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base


class AICampaign(Base):
    __tablename__ = "ai_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    campaign_name = Column(String, nullable=False)
    target_department = Column(String, nullable=False)
    attack_type = Column(String, nullable=False)
    email_subject = Column(String, nullable=False)
    email_body = Column(Text, nullable=False)
    phishing_link = Column(String, default="https://phishguard-sim.test/campaign")
    risk_level = Column(String, default="High")
    created_at = Column(DateTime, default=datetime.utcnow)
