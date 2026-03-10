from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SimulationCreate(BaseModel):
    company_name: str
    department: str
    simulation_type: str


class SimulationResponse(BaseModel):
    id: int
    subject: str
    body: str
    phishing_link: str
    department: str
    simulation_type: str
    company_name: str
    created_by: Optional[int]
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class SimulationSend(BaseModel):
    simulation_id: int
    target_user_ids: list[int]


class InteractionCreate(BaseModel):
    simulation_id: int
    action: str  # "clicked", "reported", "ignored"


class InteractionResponse(BaseModel):
    id: int
    user_id: int
    simulation_id: int
    clicked: bool
    reported: bool
    ignored: bool
    action: str
    timestamp: datetime

    class Config:
        from_attributes = True


class SimulationResults(BaseModel):
    simulation_id: int
    total_sent: int
    clicked: int
    reported: int
    ignored: int
    click_rate: float
    report_rate: float
