from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class SOCLog(Base):
    __tablename__ = "soc_logs"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False, index=True)
    ip_address = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False)
    resource = Column(String, nullable=True)
    success = Column(Boolean, default=True)
    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        index=True,
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )

    analysis = relationship("SOCAnalysisResult", back_populates="log", uselist=False)


class SOCAnalysisResult(Base):
    __tablename__ = "soc_analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer, ForeignKey("soc_logs.id"), nullable=False, index=True)
    status = Column(String, nullable=False, index=True)
    risk_score = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )

    log = relationship("SOCLog", back_populates="analysis")
