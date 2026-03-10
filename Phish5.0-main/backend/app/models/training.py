from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Training(Base):
    __tablename__ = "trainings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, default="Security Awareness Training")
    content = Column(Text, nullable=False)
    mistake_description = Column(Text, default="")
    why_dangerous = Column(Text, default="")
    prevention_tips = Column(Text, default="")
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="trainings")
