from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.simulation import (
    SimulationCreate, SimulationResponse, SimulationSend,
    InteractionCreate, SimulationResults,
)
from app.models.simulation import Simulation
from app.models.interaction import Interaction
from app.models.user import User
from app.models.training import Training
from app.services import ai_service
from app.services.risk_service import update_user_risk_score
from app.core.deps import get_current_user

router = APIRouter(prefix="/simulations", tags=["Simulations"])


@router.post("/generate", response_model=SimulationResponse)
def generate_simulation(
    data: SimulationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ai_result = ai_service.generate_simulation(
        data.company_name,
        data.department,
        data.simulation_type
    )

    simulation = Simulation(
        subject=ai_result["subject"],
        body=ai_result["body"],
        phishing_link=ai_result.get(
            "phishing_link",
            "https://phishguard-sim.test/click"
        ),
        department=data.department,
        simulation_type=data.simulation_type,
        company_name=data.company_name,
        created_by=current_user.id,
        total_sent=0,
        total_clicked=0,
        total_reported=0,
    )

    db.add(simulation)
    db.commit()
    db.refresh(simulation)

    return simulation


@router.get("", response_model=List[SimulationResponse])
def list_simulations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Simulation).order_by(Simulation.created_at.desc()).all()


@router.post("/send")
def send_simulation(
    data: SimulationSend,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    simulation = db.query(Simulation).filter(
        Simulation.id == data.simulation_id
    ).first()

    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")

    sent_count = 0

    for user_id in data.target_user_ids:

        existing = db.query(Interaction).filter(
            Interaction.user_id == user_id,
            Interaction.simulation_id == data.simulation_id,
        ).first()

        if not existing:
            interaction = Interaction(
                user_id=user_id,
                simulation_id=data.simulation_id,
                action="ignored",
                ignored=True,
            )

            db.add(interaction)
            sent_count += 1

    simulation.total_sent += sent_count

    db.commit()

    return {
        "message": f"Simulation sent to {sent_count} users",
        "sent_count": sent_count,
    }


@router.post("/interact")
def record_interaction(
    data: InteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    interaction = db.query(Interaction).filter(
        Interaction.user_id == current_user.id,
        Interaction.simulation_id == data.simulation_id,
    ).first()

    if not interaction:
        interaction = Interaction(
            user_id=current_user.id,
            simulation_id=data.simulation_id,
        )
        db.add(interaction)

    interaction.action = data.action
    interaction.clicked = data.action == "clicked"
    interaction.reported = data.action == "reported"
    interaction.ignored = data.action == "ignored"

    simulation = db.query(Simulation).filter(
        Simulation.id == data.simulation_id
    ).first()

    if data.action == "clicked":
        simulation.total_clicked += 1

        ai_result = ai_service.generate_training(
            simulation.simulation_type,
            "You clicked on a simulated phishing link."
        )

        training = Training(
            user_id=current_user.id,
            title=ai_result.get("title", "Security Awareness Training"),
            content=ai_result.get("full_content", ""),
            mistake_description=ai_result.get("mistake_description", ""),
            why_dangerous=ai_result.get("why_dangerous", ""),
            prevention_tips="\n".join(
                ai_result.get("prevention_tips", [])
            ),
        )

        db.add(training)

    if data.action == "reported":
        simulation.total_reported += 1

    db.commit()
    db.refresh(interaction)

    update_user_risk_score(current_user.id, db)

    return {
        "message": "Interaction recorded",
        "action": data.action,
    }


@router.get("/results/{simulation_id}", response_model=SimulationResults)
def get_simulation_results(
    simulation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id
    ).first()

    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")

    total = simulation.total_sent
    clicked = simulation.total_clicked
    reported = simulation.total_reported
    ignored = total - clicked - reported

    return SimulationResults(
        simulation_id=simulation_id,
        total_sent=total,
        clicked=clicked,
        reported=reported,
        ignored=ignored,
        click_rate=round((clicked / max(total, 1)) * 100, 1),
        report_rate=round((reported / max(total, 1)) * 100, 1),
    )