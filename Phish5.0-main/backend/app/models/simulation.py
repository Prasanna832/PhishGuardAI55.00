from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)

    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)

    phishing_link = Column(String, default="https://phishguard-sim.test/click")

    department = Column(String, nullable=False)
    simulation_type = Column(String, nullable=False)
    company_name = Column(String, nullable=False)

    created_by = Column(Integer, ForeignKey("users.id"))

    created_at = Column(DateTime, default=datetime.utcnow)

    is_active = Column(Boolean, default=True)

    total_sent = Column(Integer, default=0)
    total_clicked = Column(Integer, default=0)
    total_reported = Column(Integer, default=0)

    interactions = relationship("Interaction", back_populates="simulation")

    creator = relationship("User", foreign_keys=[created_by])