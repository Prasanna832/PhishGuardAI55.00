from collections import defaultdict
from datetime import timedelta

from app.models.soc_schemas import AnalysisOutput, LogInput
from app.utils.soc_catalog import MALICIOUS_IPS, SENSITIVE_RESOURCES


UNUSUAL_HOUR_WEIGHT = 20
SENSITIVE_RESOURCE_WEIGHT = 25
FAILED_LOGIN_WEIGHT = 15
REPEATED_FAILED_LOGIN_WEIGHT = 25
IMPOSSIBLE_TRAVEL_WEIGHT = 35
MALICIOUS_IP_WEIGHT = 40


def _status_from_score(score: int) -> str:
    if score <= 30:
        return "Safe"
    if score <= 70:
        return "Suspicious"
    return "Attack"


def _analyze(log: LogInput, history: list[LogInput]) -> AnalysisOutput:
    risk_score = 0
    reasons: list[str] = []

    if log.ip_address in MALICIOUS_IPS:
        risk_score += MALICIOUS_IP_WEIGHT
        reasons.append(f"IP {log.ip_address} is flagged as malicious")

    if 0 <= log.timestamp.hour <= 4:
        risk_score += UNUSUAL_HOUR_WEIGHT
        reasons.append("Activity occurred during unusual hours (00:00-05:00)")

    if log.resource and log.resource in SENSITIVE_RESOURCES:
        risk_score += SENSITIVE_RESOURCE_WEIGHT
        reasons.append(f"Sensitive resource access detected: {log.resource}")

    if log.action == "login" and not log.success:
        risk_score += FAILED_LOGIN_WEIGHT
        reasons.append("Login attempt failed")

    for previous in history:
        delta = abs(log.timestamp - previous.timestamp)
        if (
            previous.country != log.country
            and delta <= timedelta(hours=2)
            and previous.action == "login"
            and log.action == "login"
        ):
            risk_score += IMPOSSIBLE_TRAVEL_WEIGHT
            reasons.append(
                f"Impossible travel pattern detected: {previous.country} to {log.country} in under 2 hours"
            )
            break

    if log.action == "login":
        failed_recent = [
            h
            for h in history
            if h.action == "login"
            and not h.success
            and abs(log.timestamp - h.timestamp) <= timedelta(minutes=30)
        ]
        current_failed = 1 if not log.success else 0
        if len(failed_recent) + current_failed >= 3:
            risk_score += REPEATED_FAILED_LOGIN_WEIGHT
            reasons.append("Multiple failed login attempts detected in a short window")

    final_score = min(100, risk_score)
    reason_text = "; ".join(reasons) if reasons else "No suspicious signals detected"

    return AnalysisOutput(
        status=_status_from_score(final_score),
        risk_score=final_score,
        reason=reason_text,
    )


def analyze_single_log(log: LogInput, history: list[LogInput] | None = None) -> AnalysisOutput:
    return _analyze(log, history or [])


def analyze_batch_logs(logs: list[LogInput]) -> list[AnalysisOutput]:
    histories: dict[str, list[LogInput]] = defaultdict(list)
    ordered_pairs: list[tuple[int, AnalysisOutput]] = []

    for original_index, log in sorted(enumerate(logs), key=lambda item: item[1].timestamp):
        user_history = histories[log.username]
        analysis = _analyze(log, user_history)
        ordered_pairs.append((original_index, analysis))
        user_history.append(log)

    ordered_pairs.sort(key=lambda item: item[0])
    return [analysis for _, analysis in ordered_pairs]
