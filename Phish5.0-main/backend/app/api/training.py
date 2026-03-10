from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.analysis import TrainingGenerateRequest, TrainingResponse
from app.models.training import Training
from app.models.user import User
from app.services import ai_service
from app.services.risk_service import update_user_risk_score
from app.core.deps import get_current_user

router = APIRouter(prefix="/training", tags=["Training"])


@router.post("/generate", response_model=TrainingResponse)
def generate_training(
    data: TrainingGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ai_result = ai_service.generate_training(data.simulation_type, data.mistake_description)
    training = Training(
        user_id=data.user_id,
        title=ai_result.get("title", "Security Awareness Training"),
        content=ai_result.get("full_content", ""),
        mistake_description=ai_result.get("mistake_description", ""),
        why_dangerous=ai_result.get("why_dangerous", ""),
        prevention_tips="\n".join(ai_result.get("prevention_tips", [])),
    )
    db.add(training)
    db.commit()
    db.refresh(training)
    return training


@router.get("", response_model=List[TrainingResponse])
def list_trainings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Training).filter(Training.user_id == current_user.id).order_by(Training.created_at.desc()).all()


@router.get("/all", response_model=List[TrainingResponse])
def list_all_trainings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Training).order_by(Training.created_at.desc()).all()


@router.post("/{training_id}/complete")
def complete_training(
    training_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime
    training = db.query(Training).filter(
        Training.id == training_id,
        Training.user_id == current_user.id,
    ).first()
    if not training:
        raise HTTPException(status_code=404, detail="Training not found")

    training.completed = True
    training.completed_at = datetime.utcnow()
    db.commit()
    update_user_risk_score(current_user.id, db)
    return {"message": "Training completed", "risk_score_updated": True}


@router.get("/stats")
def get_training_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trainings = db.query(Training).filter(Training.user_id == current_user.id).all()
    total = len(trainings)
    completed = sum(1 for t in trainings if t.completed)
    return {
        "total": total,
        "completed": completed,
        "pending": total - completed,
        "completion_rate": round((completed / max(total, 1)) * 100, 1),
    }
