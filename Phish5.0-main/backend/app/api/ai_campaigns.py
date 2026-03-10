from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.ai_campaign import AICampaign
from app.schemas.campaign import CampaignGenerateRequest, CampaignResponse
from app.services.campaign_ai_service import generate_campaign

router = APIRouter(tags=["AI Campaign Generator"])


@router.post("/ai/generate-campaign", response_model=CampaignResponse)
def create_campaign(
    request: CampaignGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not request.company_name or not request.target_department or not request.attack_style:
        raise HTTPException(status_code=400, detail="All fields are required")

    campaign = generate_campaign(
        company_name=request.company_name,
        target_department=request.target_department,
        attack_style=request.attack_style,
        db=db,
    )
    return CampaignResponse.model_validate(campaign)


@router.get("/ai/campaigns")
def list_campaigns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    campaigns = db.query(AICampaign).order_by(AICampaign.created_at.desc()).limit(50).all()
    return [CampaignResponse.model_validate(c) for c in campaigns]
