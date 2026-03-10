import json
import re
from typing import Optional
from openai import OpenAI
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User
from app.models.interaction import Interaction
from app.models.training import Training
from app.services.risk_service import calculate_risk_score, get_risk_level


def _get_client() -> Optional[OpenAI]:
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your_openai_api_key_here":
        return OpenAI(api_key=settings.OPENAI_API_KEY)
    return None


def predict_risk(user_id: int, db: Session) -> dict:
    """Predict behavioral risk for a user using AI analysis."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"User with id {user_id} not found")

    # Gather behavioral data
    interactions = db.query(Interaction).filter(Interaction.user_id == user_id).all()
    trainings = db.query(Training).filter(Training.user_id == user_id).all()

    click_count = sum(1 for i in interactions if i.clicked)
    simulation_failures = sum(1 for i in interactions if i.clicked and not i.reported)
    total_trainings = len(trainings)
    completed_trainings = sum(1 for t in trainings if t.completed)
    training_completion = (completed_trainings / total_trainings * 100) if total_trainings > 0 else 0
    current_risk = calculate_risk_score(user_id, db)
    risk_level = get_risk_level(current_risk)

    client = _get_client()

    prompt = f"""You are a cybersecurity behavioral analyst predicting employee phishing risk.

Employee Data:
- Department: {user.department}
- Current Risk Score: {current_risk}/100
- Phishing Links Clicked: {click_count}
- Simulation Failures (clicked without reporting): {simulation_failures}
- Training Modules Completed: {completed_trainings}/{total_trainings}
- Training Completion Rate: {training_completion:.0f}%

Based on this behavioral data, predict the employee's likelihood of falling for a phishing attack.
Respond ONLY with valid JSON (no markdown):

{{
  "risk_probability": <integer 0-100>,
  "risk_level": "Low|Medium|High|Critical",
  "behavioral_explanation": "<detailed explanation of behavioral risk factors>",
  "recommended_training": ["training1", "training2", "training3"]
}}"""

    result = None
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
                max_tokens=600,
            )
            raw = response.choices[0].message.content.strip()
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            result = json.loads(raw)
        except Exception as e:
            print(f"OpenAI error in risk prediction: {e}")

    if not result:
        result = _fallback_prediction(
            click_count, simulation_failures, training_completion, current_risk, user.department
        )

    return {
        "user_id": user.id,
        "user_name": user.name,
        "department": user.department,
        "current_risk_score": current_risk,
        "risk_probability": result.get("risk_probability", 50),
        "risk_level": result.get("risk_level", risk_level),
        "behavioral_explanation": result.get("behavioral_explanation", ""),
        "recommended_training": result.get("recommended_training", []),
        "click_count": click_count,
        "simulation_failures": simulation_failures,
        "training_completion": round(training_completion, 1),
    }


def _fallback_prediction(
    click_count: int,
    simulation_failures: int,
    training_completion: float,
    current_risk: float,
    department: str,
) -> dict:
    """Heuristic-based risk prediction fallback."""
    # Calculate probability based on behavioral factors
    base_prob = 30
    base_prob += click_count * 12
    base_prob += simulation_failures * 8
    if training_completion < 50:
        base_prob += 15
    elif training_completion < 80:
        base_prob += 5
    else:
        base_prob -= 10

    base_prob += current_risk * 0.2
    risk_probability = max(5, min(98, int(base_prob)))

    if risk_probability >= 75:
        risk_level = "Critical"
    elif risk_probability >= 50:
        risk_level = "High"
    elif risk_probability >= 25:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Build explanation
    factors = []
    if click_count > 0:
        factors.append(f"Employee has clicked {click_count} phishing simulation link(s)")
    if simulation_failures > 0:
        factors.append(f"{simulation_failures} simulation(s) were failed (clicked without reporting)")
    if training_completion < 50:
        factors.append(f"Training completion is low at {training_completion:.0f}%")
    elif training_completion >= 80:
        factors.append(f"Training completion rate is good at {training_completion:.0f}%")
    if current_risk > 60:
        factors.append(f"Current risk score is elevated at {current_risk:.0f}/100")

    if not factors:
        factors.append("Employee has limited interaction history. More data needed for accurate prediction.")

    explanation = ". ".join(factors) + "."

    # Generate training recommendations
    recommendations = []
    if click_count > 0:
        recommendations.append("Advanced Phishing Link Detection Training")
    if simulation_failures > 0:
        recommendations.append("Incident Reporting Procedures Workshop")
    if training_completion < 80:
        recommendations.append("Complete all pending security awareness modules")
    recommendations.append("Social Engineering Defense Fundamentals")
    if risk_probability >= 50:
        recommendations.append("One-on-one security coaching session")

    return {
        "risk_probability": risk_probability,
        "risk_level": risk_level,
        "behavioral_explanation": explanation,
        "recommended_training": recommendations[:4],
    }
