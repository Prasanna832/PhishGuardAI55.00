from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    role = Column(String, default="employee")
    department = Column(String, default="General")

    risk_score = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)

    interactions = relationship("Interaction", back_populates="user")

    trainings = relationship("Training", back_populates="user")

    threat_reports = relationship("ThreatReport", back_populates="reporter")