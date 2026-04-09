from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.user import UserResponse
from app.models.user import User
from app.models.interaction import Interaction
from app.models.training import Training
from app.core.deps import get_current_user
from app.services.risk_service import get_risk_level, update_user_risk_score
from app.services import ai_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(User).all()

@router.get("/risk-overview")
def get_all_users_risk_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = db.query(User).all()
    interactions = db.query(Interaction).all()
    trainings = db.query(Training).all()

    result = []
    for user in users:
        user_interactions = [i for i in interactions if i.user_id == user.id]
        user_trainings = [t for t in trainings if t.user_id == user.id]
        
        clicks = sum(1 for i in user_interactions if i.clicked)
        reports = sum(1 for i in user_interactions if i.reported)
        completed_trainings = sum(1 for t in user_trainings if t.completed)
        
        result.append({
            "user_id": user.id,
            "name": user.name,
            "department": user.department,
            "risk_score": user.risk_score,
            "risk_level": get_risk_level(user.risk_score),
            "clicks": clicks,
            "reports": reports,
            "completed_trainings": completed_trainings,
            "total_interactions": len(user_interactions),
        })
    return result


@router.get("/{user_id}/risk")
def get_user_risk(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")

    interactions = db.query(Interaction).filter(Interaction.user_id == user_id).all()
    trainings = db.query(Training).filter(Training.user_id == user_id).all()

    clicks = sum(1 for i in interactions if i.clicked)
    reports = sum(1 for i in interactions if i.reported)
    completed_trainings = sum(1 for t in trainings if t.completed)

    return {
        "user_id": user_id,
        "name": user.name,
        "risk_score": user.risk_score,
        "risk_level": get_risk_level(user.risk_score),
        "clicks": clicks,
        "reports": reports,
        "completed_trainings": completed_trainings,
        "total_interactions": len(interactions),
    }


@router.post("/{user_id}/recalculate-risk")
def recalculate_risk(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    score = update_user_risk_score(user_id, db)
    return {"user_id": user_id, "new_risk_score": score, "risk_level": get_risk_level(score)}

@router.get("/{user_id}/evaluate")
def evaluate_user_behavior(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")

    interactions = db.query(Interaction).filter(Interaction.user_id == user_id).all()
    trainings = db.query(Training).filter(Training.user_id == user_id).all()

    clicks = sum(1 for i in interactions if i.clicked)
    reports = sum(1 for i in interactions if i.reported)
    completed_trainings = sum(1 for t in trainings if t.completed)

    eval_result = ai_service.evaluate_employee(
        name=user.name,
        department=user.department,
        clicks=clicks,
        reports=reports,
        completed_trainings=completed_trainings,
        risk_score=user.risk_score
    )

    return eval_result
