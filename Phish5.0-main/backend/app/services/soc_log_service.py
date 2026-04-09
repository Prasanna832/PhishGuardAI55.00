import random
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.soc_entities import SOCAnalysisResult, SOCLog
from app.models.soc_schemas import AnalysisOutput, LogInput
from app.utils.soc_catalog import ACTIONS, COUNTRIES, MALICIOUS_IPS, NORMAL_RESOURCES, SAFE_IPS, SENSITIVE_RESOURCES, USERS


def _random_timestamp() -> datetime:
    now = datetime.now(timezone.utc).replace(second=0, microsecond=0)
    return now - timedelta(minutes=random.randint(0, 720))


def generate_synthetic_logs(count: int) -> list[LogInput]:
    generated: list[LogInput] = []

    while len(generated) < count:
        user = random.choice(USERS)
        action = random.choice(ACTIONS)
        suspicious_mode = random.random() < 0.3
        timestamp = _random_timestamp()

        if suspicious_mode and random.random() < 0.5:
            timestamp = timestamp.replace(hour=random.randint(0, 4), minute=random.randint(0, 59))

        if suspicious_mode and random.random() < 0.35:
            ip_address = random.choice(MALICIOUS_IPS)
        else:
            ip_address = random.choice(SAFE_IPS)

        if action == "file_access" and random.random() < (0.55 if suspicious_mode else 0.2):
            resource = random.choice(SENSITIVE_RESOURCES)
        elif action in {"file_access", "download"}:
            resource = random.choice(NORMAL_RESOURCES)
        else:
            resource = None

        success = not (action == "login" and suspicious_mode and random.random() < 0.55)
        country = random.choice(COUNTRIES)

        generated.append(
            LogInput(
                username=user,
                action=action,
                ip_address=ip_address,
                country=country,
                resource=resource,
                success=success,
                timestamp=timestamp,
            )
        )

        if action == "login" and not success and random.random() < 0.45:
            burst_count = random.randint(1, 2)
            for burst in range(burst_count):
                if len(generated) >= count:
                    break
                generated.append(
                    LogInput(
                        username=user,
                        action="login",
                        ip_address=ip_address,
                        country=random.choice(COUNTRIES if burst == 1 else [country]),
                        resource=None,
                        success=False,
                        timestamp=timestamp + timedelta(minutes=burst + 1),
                    )
                )

    return generated


def persist_log(db: Session, log: LogInput) -> SOCLog:
    record = SOCLog(
        username=log.username,
        action=log.action,
        ip_address=log.ip_address,
        country=log.country,
        resource=log.resource,
        success=log.success,
        timestamp=log.timestamp,
    )
    db.add(record)
    db.flush()
    return record


def persist_analysis(db: Session, log_id: int, analysis: AnalysisOutput) -> SOCAnalysisResult:
    result = SOCAnalysisResult(
        log_id=log_id,
        status=analysis.status,
        risk_score=analysis.risk_score,
        reason=analysis.reason,
    )
    db.add(result)
    db.flush()
    return result


def build_log_input(record: SOCLog) -> LogInput:
    return LogInput(
        username=record.username,
        action=record.action,
        ip_address=record.ip_address,
        country=record.country,
        resource=record.resource,
        success=record.success,
        timestamp=record.timestamp,
    )
