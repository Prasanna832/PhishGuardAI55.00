from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.simulation import Simulation
from app.models.interaction import Interaction
from app.models.training import Training
from app.core.deps import get_current_user
from app.services.risk_service import get_risk_level

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_employees = db.query(User).filter(User.role == "employee").count()
    active_simulations = db.query(Simulation).filter(Simulation.is_active == True).count()

    all_users = db.query(User).all()
    avg_risk = sum(u.risk_score for u in all_users) / max(len(all_users), 1)

    total_interactions = db.query(Interaction).count()
    clicked = db.query(Interaction).filter(Interaction.clicked == True).count()
    click_rate = (clicked / max(total_interactions, 1)) * 100

    return {
        "total_employees": total_employees,
        "active_simulations": active_simulations,
        "company_risk_index": round(avg_risk, 1),
        "phishing_click_rate": round(click_rate, 1),
    }


@router.get("/risk-trend")
def get_risk_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trend = []
    for i in range(6, -1, -1):
        date = datetime.utcnow() - timedelta(days=i)
        day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        day_clicks = db.query(Interaction).filter(
            Interaction.timestamp >= day_start,
            Interaction.timestamp < day_end,
            Interaction.clicked == True,
        ).count()

        day_total = db.query(Interaction).filter(
            Interaction.timestamp >= day_start,
            Interaction.timestamp < day_end,
        ).count()

        risk = (day_clicks / max(day_total, 1)) * 100 if day_total > 0 else 0
        trend.append({
            "date": date.strftime("%b %d"),
            "risk_score": round(risk, 1),
            "interactions": day_total,
        })
    return trend


@router.get("/risk-distribution")
def get_risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = db.query(User).all()
    low = sum(1 for u in users if u.risk_score <= 30)
    medium = sum(1 for u in users if 30 < u.risk_score <= 60)
    high = sum(1 for u in users if u.risk_score > 60)
    return [
        {"name": "Low Risk", "value": low, "color": "#10b981"},
        {"name": "Medium Risk", "value": medium, "color": "#f59e0b"},
        {"name": "High Risk", "value": high, "color": "#ef4444"},
    ]


@router.get("/high-risk-employees")
def get_high_risk_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = db.query(User).order_by(User.risk_score.desc()).limit(10).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "department": u.department,
            "risk_score": u.risk_score,
            "risk_level": get_risk_level(u.risk_score),
        }
        for u in users
    ]
