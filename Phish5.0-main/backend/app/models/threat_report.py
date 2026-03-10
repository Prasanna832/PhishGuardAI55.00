from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class ThreatReport(Base):
    __tablename__ = "threat_reports"

    id = Column(Integer, primary_key=True, index=True)
    email_content = Column(Text, nullable=False)
    reported_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    category = Column(String, default="Uncategorized")
    subject = Column(String, default="")
    sender_domain = Column(String, default="")
    severity = Column(String, default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)

    reporter = relationship("User", back_populates="threat_reports")
