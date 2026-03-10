from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.risk_prediction import RiskPredictionRequest, RiskPredictionResponse
from app.services.risk_prediction_service import predict_risk

router = APIRouter(tags=["AI Risk Prediction"])


@router.post("/ai/predict-risk", response_model=RiskPredictionResponse)
def predict_user_risk(
    request: RiskPredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = predict_risk(request.user_id, db)
        return RiskPredictionResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
