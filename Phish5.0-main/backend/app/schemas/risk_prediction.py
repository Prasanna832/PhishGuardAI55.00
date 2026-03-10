from pydantic import BaseModel
from typing import List


class RiskPredictionRequest(BaseModel):
    user_id: int


class RiskPredictionResponse(BaseModel):
    user_id: int
    user_name: str
    department: str
    current_risk_score: float
    risk_probability: float
    risk_level: str
    behavioral_explanation: str
    recommended_training: List[str]
    click_count: int
    simulation_failures: int
    training_completion: float
