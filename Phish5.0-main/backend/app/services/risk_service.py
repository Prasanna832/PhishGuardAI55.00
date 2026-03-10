from sqlalchemy.orm import Session
from app.models.user import User
from app.models.interaction import Interaction
from app.models.training import Training


def calculate_risk_score(user_id: int, db: Session) -> float:
    interactions = db.query(Interaction).filter(Interaction.user_id == user_id).all()
    trainings = db.query(Training).filter(Training.user_id == user_id).all()

    clicks = sum(1 for i in interactions if i.clicked)
    failed_sims = sum(1 for i in interactions if i.clicked and not i.reported)
    suspicious = sum(1 for i in interactions if i.clicked)
    completed_trainings = sum(1 for t in trainings if t.completed)

    score = (clicks * 20) + (failed_sims * 15) + (suspicious * 10) - (completed_trainings * 10)
    score = max(0.0, min(100.0, float(score)))
    return score


def get_risk_level(score: float) -> str:
    if score <= 30:
        return "Low"
    elif score <= 60:
        return "Medium"
    else:
        return "High"


def update_user_risk_score(user_id: int, db: Session) -> float:
    score = calculate_risk_score(user_id, db)
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.risk_score = score
        db.commit()
        db.refresh(user)
    return score
