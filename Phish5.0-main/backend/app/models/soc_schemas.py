from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class LogInput(BaseModel):
    username: str = Field(min_length=2, max_length=64)
    action: str = Field(min_length=2, max_length=64)
    ip_address: str = Field(min_length=7, max_length=64)
    country: str = Field(min_length=2, max_length=32)
    resource: str | None = None
    success: bool = True
    timestamp: datetime


class LogOutput(LogInput):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GenerateLogsRequest(BaseModel):
    count: int = Field(default=25, ge=1, le=200)


class AnalysisOutput(BaseModel):
    status: Literal["Safe", "Suspicious", "Attack"]
    risk_score: int = Field(ge=0, le=100)
    reason: str


class LogAnalysisResponse(AnalysisOutput):
    log_id: int


class BatchAnalyzeRequest(BaseModel):
    logs: list[LogInput] = Field(min_length=1, max_length=500)


class BatchAnalysisItem(BaseModel):
    log: LogOutput
    analysis: AnalysisOutput


class BatchAnalysisResponse(BaseModel):
    results: list[BatchAnalysisItem]
    total_logs: int
    safe: int
    suspicious: int
    attack: int
