from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    simulation_id = Column(Integer, ForeignKey("simulations.id"), nullable=False)
    clicked = Column(Boolean, default=False)
    reported = Column(Boolean, default=False)
    ignored = Column(Boolean, default=False)
    action = Column(String, default="ignored")
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="interactions")
    simulation = relationship("Simulation", back_populates="interactions")
