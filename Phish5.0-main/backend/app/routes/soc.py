from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.soc_entities import SOCLog
from app.models.soc_schemas import (
    BatchAnalysisItem,
    BatchAnalysisResponse,
    BatchAnalyzeRequest,
    GenerateLogsRequest,
    LogAnalysisResponse,
    LogInput,
    LogOutput,
)
from app.services.soc_detection_service import analyze_batch_logs, analyze_single_log
from app.services.soc_log_service import build_log_input, generate_synthetic_logs, persist_analysis, persist_log

router = APIRouter(tags=["Agentic SOC"])


@router.post("/generate-logs", response_model=list[LogOutput])
def generate_logs(payload: GenerateLogsRequest, db: Session = Depends(get_db)):
    generated = generate_synthetic_logs(payload.count)
    records = [persist_log(db, log) for log in generated]
    db.commit()
    for record in records:
        db.refresh(record)
    return records


@router.post("/analyze-log", response_model=LogAnalysisResponse)
def analyze_log(log: LogInput, db: Session = Depends(get_db)):
    recent_records = (
        db.query(SOCLog)
        .filter(SOCLog.username == log.username)
        .order_by(SOCLog.timestamp.desc())
        .limit(50)
        .all()
    )
    history = [build_log_input(record) for record in recent_records]
    analysis = analyze_single_log(log, history)

    record = persist_log(db, log)
    persist_analysis(db, record.id, analysis)
    db.commit()

    return LogAnalysisResponse(log_id=record.id, **analysis.model_dump())


@router.post("/analyze-batch", response_model=BatchAnalysisResponse)
def analyze_batch(payload: BatchAnalyzeRequest, db: Session = Depends(get_db)):
    analyses = analyze_batch_logs(payload.logs)

    items: list[BatchAnalysisItem] = []
    safe = suspicious = attack = 0

    for log, analysis in zip(payload.logs, analyses):
        record = persist_log(db, log)
        persist_analysis(db, record.id, analysis)
        db.flush()
        db.refresh(record)

        if analysis.status == "Safe":
            safe += 1
        elif analysis.status == "Suspicious":
            suspicious += 1
        else:
            attack += 1

        items.append(
            BatchAnalysisItem(
                log=LogOutput.model_validate(record),
                analysis=analysis,
            )
        )

    db.commit()

    return BatchAnalysisResponse(
        results=items,
        total_logs=len(items),
        safe=safe,
        suspicious=suspicious,
        attack=attack,
    )
