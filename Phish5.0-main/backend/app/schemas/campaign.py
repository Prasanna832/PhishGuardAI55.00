from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CampaignGenerateRequest(BaseModel):
    company_name: str
    target_department: str
    attack_style: str


class CampaignResponse(BaseModel):
    id: int
    campaign_name: str
    target_department: str
    attack_type: str
    email_subject: str
    email_body: str
    phishing_link: str
    risk_level: str
    created_at: datetime

    class Config:
        from_attributes = True
