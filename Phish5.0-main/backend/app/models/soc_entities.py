from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class SOCLog(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False, index=True)
    ip_address = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False)
    resource = Column(String, nullable=True)
    success = Column(Boolean, default=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    analysis = relationship("SOCAnalysisResult", back_populates="log", uselist=False)


class SOCAnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer, ForeignKey("logs.id"), nullable=False, index=True)
    status = Column(String, nullable=False, index=True)
    risk_score = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    log = relationship("SOCLog", back_populates="analysis")
